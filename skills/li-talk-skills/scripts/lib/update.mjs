// 自动更新：每天第一次运行命令时，读 GitHub 和 jsDelivr 上主分支的 manifest.json，有新版就整包更新
//
// 怎么保证不会留下新旧混在一起的一套：
//   1. 按新清单比对本地文件的实际校验值，只下载变了的和新增的，逐个校验 sha256 后写进临时目录；
//      没变的从旧目录复制过去，在临时目录里拼出完整的新版，整体再校验一遍，新的 .mjs 过 node --check；
//   2. 全部通过才替换：旧目录整体改名成备份 → 新目录改名到原位置 → 删备份；
//      第二步失败就把备份改回原名。改名是同一块磁盘里的瞬间操作，不会停在一半。
//   3. 新目录是按新清单拼出来的，新清单里没有的旧文件自然就没有了。
// 不自己替换的情况：在仓库里直接运行（skill 目录上两级有 .git）时跳过；插件方式安装的只提示运行 claude plugin update。
// 网络不通或任何失败都不影响这次的命令：结果记进 ~/.li-talk-skills/update.json，第二天再试。不提供关闭开关。
//
// 换来源：环境变量 LI_TALK_UPDATE_BASE 指向仓库根目录（本地路径或 http 地址，多个用英文逗号分开），替换默认的两个来源。
// 测试：各函数的 opts 可以注入 skillDir、dataDir、sources、fetch、now、log、rename、timeouts。
// 只用 Node 18 自带的模块。
import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, copyFileSync,
  readdirSync, statSync, openSync, writeSync, closeSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILL_DIR, DATA_DIR } from './paths.mjs';
import { MANIFEST, hashFiles, listFiles, readManifest, sha256, skipName } from './manifest.mjs';

export const REPO = 'xiaoli1999/li-talk-skills';
export const BRANCH = 'main';
export const SKILL_PATH = 'skills/li-talk-skills/';
export const PLUGIN_UPDATE = 'claude plugin update li-talk-skills@li-talk-skills';
// 来源的 base 是仓库根目录：清单在 base + skills/li-talk-skills/manifest.json，更新说明在 base + CHANGELOG.md
export const DEFAULT_SOURCES = [
  { name: 'GitHub', base: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/` },
  { name: 'jsDelivr', base: `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/` },
];

// 超时（毫秒）。check：读清单的总时间；grace：一个来源先回来后再等另一个多久；
// file：单个文件；total：下载阶段的总时间；changelog：读更新说明
const AUTO = { check: 6000, grace: 1500, file: 15000, total: 30000, changelog: 3000 };
const MANUAL = { check: 15000, grace: 3000, file: 30000, total: 600000, changelog: 10000 };
const CONCURRENCY = 6;
const LOCK_STALE = 10 * 60 * 1000;   // 更新锁超过 10 分钟还在，当作上次中途退出留下的
const RECORD = 'update.json';

class UpdateError extends Error {
  constructor(message, exitCode = 1) { super(message); this.userMessage = message; this.exitCode = exitCode; }
}

// ---------- 版本号 ----------

const FORMAL = /^(\d+)\.(\d+)\.(\d+)$/;
// 只认 x.y.z 这种正式版本号
export const isFormalVersion = v => typeof v === 'string' && FORMAL.test(v);

// 比较两个版本号：a 新返回正数，一样返回 0；只看开头的 x.y.z，认不出的当作 0.0.0
export function cmpVersion(a, b) {
  const p = v => { const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(v || '')); return m ? m.slice(1).map(Number) : [0, 0, 0]; };
  const x = p(a), y = p(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// 读 skill 目录里的 version.txt；没有时给 null
export function localVersion(skillDir = SKILL_DIR) {
  try { return readFileSync(join(skillDir, 'version.txt'), 'utf8').trim() || null; } catch { return null; }
}

// ---------- 安装方式 ----------

// 在仓库里直接运行：skill 目录的上两级有 .git（工作树里 .git 也可能是个文件）
export const isDevRepo = (skillDir = SKILL_DIR) => existsSync(join(skillDir, '..', '..', '.git'));
// Claude Code 插件方式安装：skill 目录在 .claude/plugins 下面
export const isPluginInstall = (skillDir = SKILL_DIR) =>
  /[\\/]\.claude[\\/]plugins[\\/]/i.test(skillDir) || /[\\/]plugins[\\/](cache|marketplaces)[\\/]/i.test(skillDir);
export const installKind = (skillDir = SKILL_DIR) => (isDevRepo(skillDir) ? 'repo' : isPluginInstall(skillDir) ? 'plugin' : 'copy');

// ---------- 更新说明 ----------

// 从 CHANGELOG 里取 (from, to] 之间各版本的要点：[{ version, items }]，新版在前。
// 只取「## 版本号」下面顶格的「- 」条目，每条只留第一句。
export function changesBetween(text, from, to) {
  const out = [];
  for (const sec of String(text || '').split(/^##[ \t]+/m).slice(1)) {
    const v = (/^v?(\d+\.\d+\.\d+)/.exec(sec) || [])[1];
    if (!v || cmpVersion(v, from) <= 0 || cmpVersion(v, to) > 0) continue;
    const items = [];
    for (const line of sec.split(/\r?\n/)) {
      const m = /^[-*][ \t]+(.+)/.exec(line);
      if (!m) continue;
      let s = m[1].trim();
      const end = s.indexOf('。');
      if (end > 0) s = s.slice(0, end);
      items.push(s);
    }
    out.push({ version: v, items });
  }
  return out;
}

// 要点排成几行；多个版本时按版本分组，最多列 max 条
export function formatNotes(groups, max = 12) {
  const lines = [];
  let shown = 0, total = 0;
  for (const g of groups) total += g.items.length;
  for (const g of groups) {
    if (!g.items.length || shown >= max) continue;
    if (groups.length > 1) lines.push(`  ${g.version}`);
    for (const it of g.items) {
      if (shown >= max) break;
      lines.push(`  · ${it}`);
      shown++;
    }
  }
  if (total > shown) lines.push(`  ……另有 ${total - shown} 条，见仓库里的 CHANGELOG.md`);
  return lines;
}

// ---------- 来源 ----------

// 环境变量 LI_TALK_UPDATE_BASE：仓库根目录的本地路径、file: 地址或 http 地址，多个用英文逗号分开
export function sourcesFromEnv(env = process.env) {
  const raw = String((env && env.LI_TALK_UPDATE_BASE) || '').trim();
  if (!raw) return null;
  const list = raw.split(',').map(s => s.trim()).filter(Boolean).map(s => {
    if (/^https?:\/\//i.test(s)) return { name: s, base: s.endsWith('/') ? s : s + '/' };
    const dir = /^file:/i.test(s) ? fileURLToPath(s) : resolve(s);
    return { name: dir, dir };
  });
  return list.length ? list : null;
}

const timeoutError = () => Object.assign(new Error('超时'), { code: 'TIMEOUT' });

// 把错误说成一句中文
function why(e) {
  if (!e) return '未知原因';
  if (e.userMessage) return e.userMessage;
  if (e.code === 'TIMEOUT' || e.name === 'AbortError') return '超时';
  if (e.code === 'ENOENT') return '没有这个文件';
  if (e instanceof SyntaxError) return '内容不是合法的 JSON';
  const c = e.cause && (e.cause.code || e.cause.message);
  if (c) return `连不上（${c}）`;
  return e.message || String(e);
}

// 从一个来源读仓库里的一个文件（rel 是相对仓库根目录、用 / 分隔的路径），返回 Buffer
async function readFrom(ctx, src, rel, { timeout = 10000, signal } = {}) {
  if (signal && signal.aborted) throw timeoutError();
  if (src.dir) return readFile(join(src.dir, ...rel.split('/')));
  if (typeof ctx.fetch !== 'function') throw new Error('当前 Node 没有自带 fetch');
  const ac = new AbortController();
  const stop = () => ac.abort();
  const timer = setTimeout(stop, timeout);
  if (signal) signal.addEventListener('abort', stop, { once: true });
  // 不管 fetch 认不认 signal，到点都放弃；先挂上 catch，免得没人等它时报未处理的拒绝
  const aborted = new Promise((_, rej) => ac.signal.addEventListener('abort', () => rej(timeoutError()), { once: true }));
  aborted.catch(() => {});
  try {
    const url = src.base + rel.split('/').map(encodeURIComponent).join('/');
    const r = await Promise.race([ctx.fetch(url, { signal: ac.signal, redirect: 'follow' }), aborted]);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return Buffer.from(await Promise.race([r.arrayBuffer(), aborted]));
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', stop);
  }
}

// 清单里的路径必须是 skill 目录里面的普通相对路径
function safeRel(rel) {
  if (typeof rel !== 'string' || !rel || rel.length > 300) return false;
  if (rel.startsWith('/') || rel.includes('\\') || /[:*?"<>|\x00-\x1f]/.test(rel)) return false;
  return rel.split('/').every(s => s && s !== '.' && s !== '..' && !skipName(s)) && rel !== MANIFEST;
}

// 检查下载到的清单：正式版本号、文件表、每个路径和校验值都合规、必需的文件都在
export function checkManifest(m) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) throw new Error('清单格式不对');
  if (!isFormalVersion(m.version)) throw new Error(`清单的版本号「${m.version}」不是正式版本号`);
  if (!m.files || typeof m.files !== 'object' || Array.isArray(m.files)) throw new Error('清单里没有文件表');
  const keys = Object.keys(m.files);
  for (const rel of keys) {
    if (!safeRel(rel)) throw new Error(`清单里有不合规的路径「${rel}」`);
    if (!/^[0-9a-f]{64}$/.test(String(m.files[rel]))) throw new Error(`清单里 ${rel} 的校验值不对`);
  }
  for (const must of ['SKILL.md', 'version.txt', 'scripts/li-talk.mjs']) {
    if (!keys.includes(must)) throw new Error(`清单里缺 ${must}`);
  }
  return m;
}

// 同时读各来源的清单，取版本号最高的。一个来源先回来后，最多再等 grace 毫秒；总共不超过 check 毫秒。
// 返回 { best: { source, version, manifest, raw } | null, tried: [{ source, ok, version?, error? }] }
async function latest(ctx, t) {
  const tried = ctx.sources.map(source => ({ source, ok: false, error: '超时' }));
  const outer = new AbortController();
  await new Promise(done => {
    let left = ctx.sources.length, over = false, grace = null;
    const end = () => { if (over) return; over = true; clearTimeout(timer); clearTimeout(grace); done(); };
    const timer = setTimeout(end, t.check);
    if (!left) end();
    ctx.sources.forEach((source, i) => {
      readFrom(ctx, source, SKILL_PATH + MANIFEST, { timeout: t.check, signal: outer.signal })
        .then(raw => {
          const m = checkManifest(JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, '')));
          if (!over) tried[i] = { source, ok: true, version: m.version, manifest: m, raw };
        })
        .catch(e => { if (!over) tried[i] = { source, ok: false, error: why(e) }; })
        .finally(() => {
          if (over) return;
          if (--left === 0) end();
          else if (tried[i].ok && grace === null) grace = setTimeout(end, t.grace);
        });
    });
  });
  outer.abort();
  let best = null;
  for (const r of tried) if (r.ok && (!best || cmpVersion(r.version, best.version) > 0)) best = r;
  return { best, tried };
}

const triedText = tried => tried.map(r => `${r.source.name}（${r.ok ? r.version : r.error}）`).join('、');

// ---------- 本机记录 ~/.li-talk-skills/update.json ----------

const pad = n => String(n).padStart(2, '0');
const toDate = x => (x instanceof Date ? x : new Date(x));
// 本地日期，按这个判断「今天检查过没有」
export const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = iso => { const d = new Date(iso); return isNaN(d) ? String(iso) : `${dayKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

export function readRecord(dataDir = DATA_DIR) {
  try { return JSON.parse(readFileSync(join(dataDir, RECORD), 'utf8')); } catch { return null; }
}

// 写记录：先写临时文件再改名；写不了也不影响命令
function writeRecord(ctx, rec) {
  try {
    mkdirSync(ctx.dataDir, { recursive: true });
    const p = join(ctx.dataDir, RECORD);
    writeFileSync(`${p}.${process.pid}.tmp`, JSON.stringify(rec, null, 2) + '\n');
    renameSync(`${p}.${process.pid}.tmp`, p);
  } catch { /* 记录写不了不要紧 */ }
}

// 上次检查更新的时间和结果，一句话
export function describeLastCheck(dataDir = DATA_DIR) {
  const r = readRecord(dataDir);
  if (!r || !r.lastCheck) return '还没检查过';
  return `${fmtTime(r.lastCheck)}，${r.result || (r.ok ? '正常' : '没成功')}`;
}

// version 命令用：安装位置、安装方式、上次检查更新
export function statusLines(opts = {}) {
  const skillDir = opts.skillDir || SKILL_DIR;
  const dataDir = opts.dataDir || DATA_DIR;
  const kind = installKind(skillDir);
  let how;
  if (kind === 'repo') how = '开发中的仓库（上两级有 .git），不自动更新';
  else if (kind === 'plugin') how = `Claude Code 插件，更新请在终端运行 ${PLUGIN_UPDATE}`;
  else {
    how = '每天第一次运行命令时自动检查更新';
    const m = readManifest(skillDir);
    if (m && m.installedFrom === 'local') how += `（从本机仓库复制安装${m.installedAt ? '于 ' + fmtTime(m.installedAt) : ''}）`;
  }
  const lines = [`安装位置：${skillDir}`, `安装方式：${how}`];
  if (kind !== 'repo') lines.push(`上次检查更新：${describeLastCheck(dataDir)}`);
  return lines;
}

// ---------- 整包替换 ----------

const sleepSync = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// 改名，Windows 上文件刚写完可能被杀毒软件短暂占着，稍等重试几次
function moveDir(ctx, from, to) {
  for (let i = 0; ; i++) {
    try { return ctx.rename(from, to); } catch (e) {
      if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
      sleepSync(100 * (i + 1));
    }
  }
}

// 更新锁：同一时间只有一个进程在换文件
function lock(ctx) {
  mkdirSync(ctx.dataDir, { recursive: true });
  const p = join(ctx.dataDir, 'update.lock');
  for (let i = 0; i < 3; i++) {
    try {
      const fd = openSync(p, 'wx');
      writeSync(fd, String(process.pid));
      closeSync(fd);
      return () => { try { rmSync(p, { force: true }); } catch { /* 下次按过期处理 */ } };
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let age;
      try { age = Date.now() - statSync(p).mtimeMs; } catch { continue; }
      if (age < LOCK_STALE) throw new UpdateError('另一个 li-talk 命令正在更新，等它结束后再试', 2);
      rmSync(p, { force: true });
    }
  }
  throw new UpdateError('没拿到更新锁，稍后再试', 2);
}

// 临时目录要和 skill 目录在同一块磁盘上，改名才是瞬间完成的。
// 优先放 ~/.li-talk-skills/update-work；不在同一块盘时放到 skill 目录旁边的隐藏目录
// （里面再套两层，Claude Code 不会把它当成另一个 skill 加载）。
function workBase(ctx) {
  const inData = join(ctx.dataDir, 'update-work');
  mkdirSync(inData, { recursive: true });
  try { if (statSync(inData).dev === statSync(dirname(ctx.skillDir)).dev) return inData; } catch { /* 下面换地方 */ }
  const side = join(dirname(ctx.skillDir), '.li-talk-skills-update');
  mkdirSync(side, { recursive: true });
  return side;
}

// 清掉上次中途退出留下的临时目录（拿到锁以后才清）
function cleanStale(base) {
  for (const name of readdirSync(base)) {
    try { rmSync(join(base, name), { recursive: true, force: true }); } catch { /* 下次再清 */ }
  }
}

// 下载要更新的文件，逐个校验，写进 staged；先用给出清单的来源，不行再换别的来源
async function download(ctx, best, list, staged, t) {
  if (!list.length) return;
  const order = [best.source, ...ctx.sources.filter(s => s !== best.source)];
  const outer = new AbortController();
  const timer = setTimeout(() => outer.abort(), t.total);
  let next = 0, failed = null;
  const one = async rel => {
    const errs = [];
    let bad = false;
    for (const s of order) {
      if (outer.signal.aborted) break;
      try {
        const buf = await readFrom(ctx, s, SKILL_PATH + rel, { timeout: t.file, signal: outer.signal });
        if (sha256(buf) !== best.manifest.files[rel]) { bad = true; throw new Error('校验值对不上'); }
        const p = join(staged, ...rel.split('/'));
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, buf);
        return;
      } catch (e) { errs.push(`${s.name}：${why(e)}`); }
    }
    const reason = outer.signal.aborted && !errs.length ? `下载总时间超过 ${Math.round(t.total / 1000)} 秒` : errs.join('；');
    throw new UpdateError(`下载 ${rel} 没成功（${reason}）`, bad ? 1 : 2);
  };
  const worker = async () => {
    while (!failed && next < list.length) {
      const rel = list[next++];
      try { await one(rel); } catch (e) { failed = failed || e; outer.abort(); }
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker));
  } finally {
    clearTimeout(timer);
  }
  if (failed) throw failed;
}

// 拼好的新版整体再查一遍：文件一个不多一个不少，校验值全对
function verifyTree(dir, want) {
  const have = listFiles(dir);
  if (have.length !== want.size || have.some(rel => !want.has(rel))) throw new UpdateError('拼出来的新版文件和清单对不上，已放弃更新');
  for (const [rel, h] of hashFiles(dir, have)) {
    if (h !== want.get(rel)) throw new UpdateError(`新版的 ${rel} 校验值对不上，已放弃更新`);
  }
}

// 旧目录整体改名备份 → 新目录就位 → 删备份；就位失败就把备份改回来
function swap(ctx, staged, backup) {
  try { moveDir(ctx, ctx.skillDir, backup); } catch (e) {
    throw new UpdateError(`安装目录改不了名（${e.code || e.message}），可能有程序正开着里面的文件；没动任何文件`, 2);
  }
  try { moveDir(ctx, staged, ctx.skillDir); } catch (e) {
    try { moveDir(ctx, backup, ctx.skillDir); } catch {
      const err = new UpdateError(`更新中途失败，旧版没能自动改回原处。旧版完整保存在 ${backup}，请把它改名回 ${ctx.skillDir}`, 1);
      err.keepBackup = true;
      throw err;
    }
    throw new UpdateError(`新版放不进安装目录（${e.code || e.message}），已还原成旧版`, 2);
  }
  try { rmSync(backup, { recursive: true, force: true }); } catch { /* 删不掉的备份下次更新时清 */ }
}

// 下载、校验、拼出新版、替换。返回 { downloaded, removed }
async function installUpdate(ctx, best, t) {
  const { skillDir } = ctx;
  if (!existsSync(join(skillDir, 'scripts', 'li-talk.mjs'))) throw new UpdateError(`${skillDir} 不像是 li-talk-skills 的安装目录，没有更新`);
  const want = new Map(Object.entries(best.manifest.files));
  const local = hashFiles(skillDir);
  // 新清单里校验值和本地文件对不上的（变了的、新增的、本地被改坏的）才下载
  const need = [...want.keys()].filter(rel => local.get(rel) !== want.get(rel));
  const removed = [...local.keys()].filter(rel => !want.has(rel));

  const release = lock(ctx);
  let job = null, keep = false;
  try {
    const base = workBase(ctx);
    cleanStale(base);
    job = join(base, `${Date.now()}-${process.pid}`);
    const staged = join(job, 'skill');
    mkdirSync(staged, { recursive: true });

    await download(ctx, best, need, staged, t);
    const fresh = new Set(need);
    for (const rel of want.keys()) {
      if (fresh.has(rel)) continue;
      const to = join(staged, ...rel.split('/'));
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(skillDir, ...rel.split('/')), to);
    }
    writeFileSync(join(staged, MANIFEST), best.raw);
    verifyTree(staged, want);
    const v = readFileSync(join(staged, 'version.txt'), 'utf8').trim();
    if (v !== best.manifest.version) throw new UpdateError(`新版的 version.txt 写的是 ${v}，和清单的 ${best.manifest.version} 对不上，已放弃更新`);
    for (const rel of need) {
      if (!rel.endsWith('.mjs')) continue;
      const r = spawnSync(process.execPath, ['--check', join(staged, ...rel.split('/'))], { encoding: 'utf8' });
      if (r.status !== 0) throw new UpdateError(`新版的 ${rel} 没通过语法检查（当前 Node ${process.versions.node}），已放弃更新`);
    }
    swap(ctx, staged, join(job, 'old'));
  } catch (e) {
    keep = !!e.keepBackup;
    throw e;
  } finally {
    if (job && !keep) { try { rmSync(job, { recursive: true, force: true }); } catch { /* 下次清 */ } }
    release();
  }
  return { downloaded: need.length, removed: removed.length };
}

// 读更新说明：先用给出清单的来源，那边的 CHANGELOG 还没写到新版本就换别的来源；都不行就只说版本号
async function fetchNotes(ctx, best, from, to, t) {
  for (const s of [best.source, ...ctx.sources.filter(x => x !== best.source)]) {
    try {
      const text = (await readFrom(ctx, s, 'CHANGELOG.md', { timeout: t.changelog })).toString('utf8');
      const groups = changesBetween(text, from, to);
      if (groups.some(g => g.version === to)) return groups;
    } catch { /* 换下一个来源 */ }
  }
  return [];
}

function printUpdated(ctx, r, auto) {
  const lines = [`${auto ? '已自动' : '已'}从 ${r.from || '未知版本'} 更新到 ${r.to}${auto ? '（每天第一次运行命令时检查）' : ''}。`];
  const notes = formatNotes(r.notes);
  if (notes.length) lines.push('这次的要点：', ...notes);
  lines.push(`（下载 ${r.downloaded} 个文件${r.removed ? `，删除 ${r.removed} 个旧文件` : ''}）`);
  lines.push('新开一个对话，新的使用说明才生效。');
  if (auto) lines.push('');
  ctx.log(lines.join('\n'));
}

// ---------- 检查并更新 ----------

function context(opts = {}) {
  return {
    skillDir: opts.skillDir || SKILL_DIR,
    dataDir: opts.dataDir || DATA_DIR,
    sources: opts.sources || sourcesFromEnv(process.env) || DEFAULT_SOURCES,
    fetch: opts.fetch || globalThis.fetch,
    now: () => toDate(typeof opts.now === 'function' ? opts.now() : opts.now ?? Date.now()),
    log: opts.log || (s => console.log(s)),
    rename: opts.rename || renameSync,
    timeouts: opts.timeouts || {},
  };
}

// 自动和手动共用：查最新版本，比本地新就更新。返回 { ok, updated?, plugin?, exitCode?, message? }
async function checkAndApply(ctx, auto) {
  const t = { ...(auto ? AUTO : MANUAL), ...ctx.timeouts };
  const now = ctx.now();
  const base = { day: dayKey(now), lastCheck: now.toISOString() };
  const cur = localVersion(ctx.skillDir);
  const curText = cur || '未知版本';

  const { best, tried } = await latest(ctx, t);
  if (!best) {
    const msg = `没读到新版清单：${triedText(tried)}`;
    writeRecord(ctx, { ...base, ok: false, result: msg });
    if (!auto) ctx.log(`${msg}。连不上或超时多半是网络问题，等网络好了再运行 update；HTTP 404 说明主分支上还没有发布的版本。`);
    return { ok: false, exitCode: 2, message: msg };
  }
  const src = best.source.name;
  const info = { latest: best.version, source: src };
  if (cmpVersion(best.version, cur) <= 0) {
    const msg = `已是最新版本 ${curText}（${src} 上是 ${best.version}）`;
    writeRecord(ctx, { ...base, ok: true, result: msg, ...info });
    if (!auto) ctx.log(msg + '。');
    return { ok: true, latest: best.version };
  }
  if (isPluginInstall(ctx.skillDir)) {
    writeRecord(ctx, { ...base, ok: true, result: `有新版本 ${best.version}，插件方式安装的要运行 ${PLUGIN_UPDATE}`, ...info });
    ctx.log(auto
      ? `提示：li-talk-skills 有新版本 ${best.version}（当前 ${curText}）。这是 Claude Code 插件方式安装的，请在终端运行 ${PLUGIN_UPDATE}，然后新开一个对话。\n`
      : `有新版本 ${best.version}（当前 ${curText}）。这是 Claude Code 插件方式安装的，不能自己替换文件，请在终端运行：\n  ${PLUGIN_UPDATE}\n更新后新开一个对话，新的使用说明才生效。`);
    return { ok: true, plugin: true, latest: best.version };
  }
  try {
    const r = await installUpdate(ctx, best, t);
    const notes = await fetchNotes(ctx, best, cur, best.version, t);
    writeRecord(ctx, { ...base, ok: true, result: `已从 ${curText} 更新到 ${best.version}（来源 ${src}）`, ...info });
    printUpdated(ctx, { from: cur, to: best.version, notes, ...r }, auto);
    return { ok: true, updated: true, from: cur, to: best.version };
  } catch (e) {
    const reason = why(e);
    writeRecord(ctx, { ...base, ok: false, result: `发现新版本 ${best.version}，没更新成功：${reason}`, ...info });
    ctx.log(auto
      ? `提示：发现 li-talk-skills 新版本 ${best.version}（当前 ${curText}），这次没更新成功：${reason}。不影响这次的命令，明天会再试，也可以运行 update 立即重试。\n`
      : `发现新版本 ${best.version}（当前 ${curText}），没更新成功：${reason}。`);
    return { ok: false, exitCode: e.exitCode || 1, message: reason };
  }
}

// 每天第一次运行命令时调用（入口在命令开始前调）。任何失败都不抛出，不影响这次的命令。
// 返回 { updated: true } 时说明文件已经换成新版，入口要用新代码把命令重新跑一遍。
export async function autoUpdate(opts = {}) {
  const ctx = context(opts);
  try {
    if (isDevRepo(ctx.skillDir)) return { skipped: 'repo' };
    const now = ctx.now();
    const rec = readRecord(ctx.dataDir);
    if (rec && rec.day === dayKey(now)) return { skipped: 'today' };
    // 先记下今天查过：同时运行的别的命令就不再查；这次中途被关掉，也等明天再试
    writeRecord(ctx, { day: dayKey(now), lastCheck: now.toISOString(), ok: false, result: '检查没做完（中途退出了）' });
    return await checkAndApply(ctx, true);
  } catch (e) {
    return { ok: false, error: e };
  }
}

// update 命令：立即检查并更新
export async function run(args = {}, opts = {}) {
  const ctx = context(opts);
  if (isDevRepo(ctx.skillDir)) {
    ctx.log(`这是开发中的仓库（${ctx.skillDir} 的上两级有 .git），不自动更新，update 也不会覆盖它。要拿新代码，请在仓库里用 git 拉取。`);
    return 0;
  }
  ctx.log(`正在检查新版本（当前 ${localVersion(ctx.skillDir) || '未知版本'}）…`);
  const r = await checkAndApply(ctx, false);
  return r.ok ? 0 : r.exitCode || 1;
}
