// 自动更新：版本比较、只下载变了的文件、校验不过整体不换、中途失败还原、删旧文件、
// 仓库里跳过、插件提示、每天只查一次、一个来源挂掉、CHANGELOG 要点；最后用入口真跑一遍。
// 全部在临时目录里做，不联网，不碰本机装的 skill 和 ~/.li-talk-skills。
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, renameSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as up from '../skills/li-talk-skills/scripts/lib/update.mjs';
import { run as versionRun } from '../skills/li-talk-skills/scripts/lib/version.mjs';
import { buildManifest, manifestText, listFiles } from '../skills/li-talk-skills/scripts/lib/manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'skills', 'li-talk-skills');

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-up-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function writeTree(dir, files) {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(dir, ...rel.split('/'));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
}

const OLD = {
  'SKILL.md': '---\nname: li-talk-skills\n---\n使用说明\n',
  'version.txt': '0.1.0\n',
  'scripts/li-talk.mjs': 'export const entry = 1;\n',
  'scripts/lib/a.mjs': 'export const a = 1;\n',
  'template/engine/core.js': 'var core = 1;\n',
  'template/old.js': 'var old = 1;\n',
};
const { 'template/old.js': _gone, ...KEEP } = OLD;
const NEW = { ...KEEP, 'version.txt': '0.2.0\n', 'scripts/lib/a.mjs': 'export const a = 2;\n', 'template/new.js': 'var fresh = 1;\n' };
const CHANGELOG = '# 更新说明\n\n## 0.2.0\n\n- 新增现场工具。后面这句不该出现\n- 修好了字体下载\n\n说明段落不算要点\n\n## 0.1.0（开发版）\n\n- 最小可用版\n';

// 装一份旧版 skill：<临时目录>/<under…>/li-talk-skills，带清单
function install(files = OLD, under = ['skills']) {
  const root = tmp();
  const skillDir = join(root, ...under, 'li-talk-skills');
  writeTree(skillDir, files);
  writeFileSync(join(skillDir, 'manifest.json'), manifestText(buildManifest(skillDir)));
  return { root, skillDir, dataDir: join(root, 'data') };
}

// 造一个新版来源，样子和仓库根目录一样：skills/li-talk-skills/… + CHANGELOG.md
function publish(files = NEW, changelog = CHANGELOG) {
  const repo = tmp();
  const dir = join(repo, 'skills', 'li-talk-skills');
  writeTree(dir, files);
  writeFileSync(join(dir, 'manifest.json'), manifestText(buildManifest(dir)));
  writeFileSync(join(repo, 'CHANGELOG.md'), changelog);
  return repo;
}

// 假的 fetch：把 https://<主机>/ 下的地址映射到本地的仓库目录，记下请求过的地址。
// 映射成 'down' 时连不上，'hang' 时一直不回；opts.tamper(rel) 为真时把内容换掉
function fakeFetch(map, opts = {}) {
  const calls = [];
  const fn = async url => {
    calls.push(url);
    const host = Object.keys(map).find(h => url.startsWith(h));
    const target = map[host];
    if (target === 'down') throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } });
    if (target === 'hang') return new Promise(() => {});
    const rel = decodeURIComponent(url.slice(host.length));
    const p = join(target, ...rel.split('/'));
    let body = existsSync(p) ? readFileSync(p) : null;
    if (body && opts.tamper && opts.tamper(rel)) body = Buffer.from('被改过的内容');
    if (!body) return { ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) };
    return { ok: true, status: 200, arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) };
  };
  fn.calls = calls;
  return fn;
}

const logger = () => { const out = []; const log = s => out.push(String(s)); log.text = () => out.join('\n'); return log; };
const T = { check: 1500, grace: 200, file: 1500, total: 5000, changelog: 800 };
const A = { name: 'A', base: 'https://a.test/' };
const B = { name: 'B', base: 'https://b.test/' };
const base = (inst, extra = {}) => ({ skillDir: inst.skillDir, dataDir: inst.dataDir, timeouts: T, now: new Date(2026, 10, 17, 9, 0), ...extra });

// 目录里每个文件（含 manifest.json）的内容，用来比对「原样没动」
const snap = dir => {
  const files = listFiles(dir);
  if (existsSync(join(dir, 'manifest.json'))) files.push('manifest.json');
  return Object.fromEntries(files.map(f => [f, readFileSync(join(dir, ...f.split('/')), 'utf8')]));
};
// 更新完不能留下临时目录、备份和锁
const noLeftovers = inst => {
  const work = join(inst.dataDir, 'update-work');
  assert.deepEqual(existsSync(work) ? readdirSync(work) : [], [], '临时目录没清干净');
  assert.ok(!existsSync(join(inst.dataDir, 'update.lock')), '更新锁没删');
};

test('版本比较：只认 x.y.z 正式版本号，按数字比', () => {
  assert.ok(up.cmpVersion('0.2.0', '0.1.9') > 0);
  assert.ok(up.cmpVersion('0.10.0', '0.9.0') > 0);
  assert.ok(up.cmpVersion('1.0.0', '0.99.99') > 0);
  assert.equal(up.cmpVersion('1.2.3', '1.2.3'), 0);
  assert.ok(up.cmpVersion('0.1.0', null) > 0, '本地版本未知时当作 0.0.0');
  assert.ok(up.isFormalVersion('1.2.3'));
  for (const v of ['1.2', '1.2.3-beta', 'v1.2.3', '', null, 1]) assert.ok(!up.isFormalVersion(v), String(v));
});

test('CHANGELOG 要点：只取 (旧, 新] 之间各版本顶格的条目，每条第一句', () => {
  const text = '# 更新说明\n\n## 0.3.0\n\n- 第三版要点一。后面的句子不要\n- 第三版要点二\n  - 缩进的子条目不算\n\n' +
    '## v0.2.0（2026-11-20）\n\n- 第二版要点\n\n还没有的：段落不算\n\n## 0.1.0\n\n- 第一版\n';
  const g = up.changesBetween(text, '0.1.0', '0.3.0');
  assert.deepEqual(g, [
    { version: '0.3.0', items: ['第三版要点一', '第三版要点二'] },
    { version: '0.2.0', items: ['第二版要点'] },
  ]);
  assert.deepEqual(up.changesBetween(text, '0.2.0', '0.2.0'), []);
  assert.deepEqual(up.changesBetween(text, '0.2.0', '0.3.0').map(x => x.version), ['0.3.0']);
  const lines = up.formatNotes(g);
  assert.deepEqual(lines, ['  0.3.0', '  · 第三版要点一', '  · 第三版要点二', '  0.2.0', '  · 第二版要点']);
  assert.match(up.formatNotes(g, 2).at(-1), /另有 1 条/);
  assert.deepEqual(up.formatNotes([{ version: '0.3.0', items: ['只有一版'] }]), ['  · 只有一版'], '只有一版时不列版本号');
});

test('来源：默认读 GitHub 和 jsDelivr 的主分支；LI_TALK_UPDATE_BASE 可以换成本地目录或 http 地址', () => {
  assert.deepEqual(up.DEFAULT_SOURCES.map(s => s.base + up.SKILL_PATH + 'manifest.json'), [
    'https://raw.githubusercontent.com/xiaoli1999/li-talk-skills/main/skills/li-talk-skills/manifest.json',
    'https://cdn.jsdelivr.net/gh/xiaoli1999/li-talk-skills@main/skills/li-talk-skills/manifest.json',
  ]);
  assert.equal(up.sourcesFromEnv({}), null);
  const s = up.sourcesFromEnv({ LI_TALK_UPDATE_BASE: 'https://mirror.test/repo, ./some/dir' });
  assert.deepEqual(s[0], { name: 'https://mirror.test/repo', base: 'https://mirror.test/repo/' });
  assert.equal(s[1].dir, resolve('./some/dir'));
});

test('有新版：只下载变了的和新增的，整包换成新版，删掉新版没有的旧文件，打印要点', async () => {
  const inst = install();
  writeFileSync(join(inst.skillDir, 'template', 'stray.txt'), '本地多出来的文件');
  const repo = publish();
  const fetch = fakeFetch({ 'https://a.test/': repo });
  const log = logger();
  const r = await up.autoUpdate(base(inst, { sources: [A], fetch, log }));
  assert.equal(r.updated, true, log.text());
  assert.deepEqual(fetch.calls.map(u => u.slice('https://a.test/'.length)).sort(), [
    'CHANGELOG.md',
    'skills/li-talk-skills/manifest.json',
    'skills/li-talk-skills/scripts/lib/a.mjs',
    'skills/li-talk-skills/template/new.js',
    'skills/li-talk-skills/version.txt',
  ], '没变的文件不下载');
  assert.deepEqual(snap(inst.skillDir), snap(join(repo, 'skills', 'li-talk-skills')), '装好的和新版一模一样');
  assert.ok(!existsSync(join(inst.skillDir, 'template', 'old.js')), '新版没有的旧文件要删掉');
  assert.ok(!existsSync(join(inst.skillDir, 'template', 'stray.txt')));
  const text = log.text();
  assert.match(text, /^已自动从 0\.1\.0 更新到 0\.2\.0/);
  assert.match(text, /· 新增现场工具\n {2}· 修好了字体下载/);
  assert.doesNotMatch(text, /不该出现|最小可用版|说明段落/);
  assert.match(text, /下载 3 个文件，删除 2 个旧文件/);
  assert.match(text, /新开一个对话，新的使用说明才生效/);
  noLeftovers(inst);
  const rec = up.readRecord(inst.dataDir);
  assert.equal(rec.ok, true);
  assert.match(rec.result, /已从 0\.1\.0 更新到 0\.2\.0/);
});

test('下载到的文件校验不过：一个都不换，旧版原样', async () => {
  const inst = install();
  const before = snap(inst.skillDir);
  const repo = publish();
  const log = logger();
  const fetch = fakeFetch({ 'https://a.test/': repo }, { tamper: rel => rel.endsWith('template/new.js') });
  const r = await up.autoUpdate(base(inst, { sources: [A], fetch, log }));
  assert.ok(!r.updated);
  assert.deepEqual(snap(inst.skillDir), before);
  assert.match(log.text(), /发现 li-talk-skills 新版本 0\.2\.0（当前 0\.1\.0），这次没更新成功：下载 template\/new\.js 没成功（A：校验值对不上）/);
  assert.match(log.text(), /不影响这次的命令/);
  noLeftovers(inst);
  assert.equal(up.readRecord(inst.dataDir).ok, false);
});

test('新的 .mjs 语法不对：不替换', async () => {
  const inst = install();
  const before = snap(inst.skillDir);
  const repo = publish({ ...NEW, 'scripts/lib/a.mjs': 'export const = ;\n' });
  const log = logger();
  const r = await up.autoUpdate(base(inst, { sources: [{ name: '本地', dir: repo }], log }));
  assert.ok(!r.updated);
  assert.deepEqual(snap(inst.skillDir), before);
  assert.match(log.text(), /scripts\/lib\/a\.mjs 没通过语法检查/);
  noLeftovers(inst);
});

test('新目录放不进去：把旧目录改回来，旧版原样', async () => {
  const inst = install();
  const before = snap(inst.skillDir);
  const repo = publish();
  let n = 0;
  const rename = (from, to) => {
    n++;
    if (n === 2) throw Object.assign(new Error('模拟磁盘出错'), { code: 'EIO' });   // 第 2 次改名是新目录就位
    return renameSync(from, to);
  };
  const log = logger();
  const r = await up.run({}, base(inst, { sources: [{ name: '本地', dir: repo }], log, rename }));
  assert.equal(r, 2);
  assert.equal(n, 3, '旧目录改名 → 新目录就位失败 → 旧目录改回来');
  assert.deepEqual(snap(inst.skillDir), before);
  assert.match(log.text(), /没更新成功：新版放不进安装目录（EIO），已还原成旧版/);
  noLeftovers(inst);
});

test('安装目录改不了名：什么都不动', async () => {
  const inst = install();
  const before = snap(inst.skillDir);
  const repo = publish();
  const rename = () => { throw Object.assign(new Error('跨盘'), { code: 'EXDEV' }); };
  const log = logger();
  assert.equal(await up.run({}, base(inst, { sources: [{ name: '本地', dir: repo }], log, rename })), 2);
  assert.deepEqual(snap(inst.skillDir), before);
  assert.match(log.text(), /没动任何文件/);
  noLeftovers(inst);
});

test('在仓库里直接运行：跳过自动更新，update 说明原因', async () => {
  const root = tmp();
  mkdirSync(join(root, '.git'));
  const skillDir = join(root, 'skills', 'li-talk-skills');
  writeTree(skillDir, OLD);
  const dataDir = join(root, 'data');
  const fetch = fakeFetch({ 'https://a.test/': publish() });
  const r = await up.autoUpdate({ skillDir, dataDir, sources: [A], fetch });
  assert.equal(r.skipped, 'repo');
  assert.equal(fetch.calls.length, 0, '仓库里运行不联网');
  assert.ok(!existsSync(join(dataDir, 'update.json')));
  const log = logger();
  assert.equal(await up.run({}, { skillDir, dataDir, sources: [A], fetch, log }), 0);
  assert.match(log.text(), /开发中的仓库.*上两级有 \.git.*不自动更新/);
  assert.equal(fetch.calls.length, 0);
  assert.equal(up.installKind(skillDir), 'repo');
});

test('插件方式安装：不自己换文件，提示运行 claude plugin update', async () => {
  const inst = install(OLD, ['.claude', 'plugins', 'cache', 'li-talk-skills', 'li-talk-skills', '0.1.0', 'skills']);
  const before = snap(inst.skillDir);
  const fetch = fakeFetch({ 'https://a.test/': publish() });
  const log = logger();
  const r = await up.autoUpdate(base(inst, { sources: [A], fetch, log }));
  assert.equal(r.plugin, true);
  assert.deepEqual(snap(inst.skillDir), before);
  assert.match(log.text(), /有新版本 0\.2\.0（当前 0\.1\.0）.*claude plugin update li-talk-skills@li-talk-skills/);
  assert.equal(fetch.calls.length, 1, '只读了清单');
  const log2 = logger();
  assert.equal(await up.run({}, base(inst, { sources: [A], fetch, log: log2 })), 0);
  assert.match(log2.text(), /\n {2}claude plugin update li-talk-skills@li-talk-skills\n/);
  assert.equal(up.installKind(inst.skillDir), 'plugin');
});

test('每天只检查一次：同一天第二次不联网，第二天再查', async () => {
  const inst = install();
  const fetch = fakeFetch({ 'https://a.test/': publish(OLD) });
  let now = new Date(2026, 10, 17, 9, 0);
  const o = base(inst, { sources: [A], fetch, now: () => now, log: logger() });
  const r1 = await up.autoUpdate(o);
  assert.equal(r1.ok, true);
  assert.equal(fetch.calls.length, 1);
  now = new Date(2026, 10, 17, 23, 59);
  assert.equal((await up.autoUpdate(o)).skipped, 'today');
  assert.equal(fetch.calls.length, 1, '同一天不再查');
  now = new Date(2026, 10, 18, 0, 1);
  await up.autoUpdate(o);
  assert.equal(fetch.calls.length, 2, '第二天再查');
  const rec = up.readRecord(inst.dataDir);
  assert.equal(rec.lastCheck, now.toISOString());
  assert.equal(rec.day, '2026-11-18');
  assert.match(rec.result, /已是最新版本 0\.1\.0/);
});

test('两个来源一个连不上：用另一个更新；文件也从能用的来源下', async () => {
  const inst = install();
  const repo = publish();
  const fetch = fakeFetch({ 'https://a.test/': 'down', 'https://b.test/': repo });
  const log = logger();
  const r = await up.autoUpdate(base(inst, { sources: [A, B], fetch, log }));
  assert.equal(r.updated, true, log.text());
  assert.deepEqual(snap(inst.skillDir), snap(join(repo, 'skills', 'li-talk-skills')));
  noLeftovers(inst);
});

test('一个来源一直不回：另一个先回来后只再等一小会儿，不拖满总超时', async () => {
  const inst = install();
  const fetch = fakeFetch({ 'https://a.test/': 'hang', 'https://b.test/': publish(OLD) });
  const t0 = Date.now();
  const r = await up.autoUpdate(base(inst, { sources: [A, B], fetch, log: logger(), timeouts: { ...T, check: 3000, grace: 100 } }));
  assert.equal(r.ok, true);
  assert.ok(Date.now() - t0 < 2000, `用了 ${Date.now() - t0} 毫秒`);
});

test('两个来源取版本号高的；不是正式版本号的不认', async () => {
  const inst = install();
  const v2 = publish();
  const v3 = publish({ ...NEW, 'version.txt': '0.3.0\n' }, CHANGELOG.replace('## 0.2.0', '## 0.3.0\n\n- 第三版\n\n## 0.2.0'));
  const log = logger();
  const r = await up.autoUpdate(base(inst, { sources: [{ name: 'v2', dir: v2 }, { name: 'v3', dir: v3 }], log }));
  assert.equal(r.to, '0.3.0');
  assert.match(log.text(), /已自动从 0\.1\.0 更新到 0\.3\.0[^\n]*\n这次的要点：\n {2}0\.3\.0\n {2}· 第三版\n {2}0\.2\.0/);

  const inst2 = install();
  const beta = publish({ ...NEW, 'version.txt': '0.9.0-beta\n' });
  const r2 = await up.autoUpdate(base(inst2, { sources: [{ name: 'beta', dir: beta }, { name: 'v2', dir: v2 }], log: logger() }));
  assert.equal(r2.to, '0.2.0');
});

test('网络都不通：不抛错、不打印，只记一笔', async () => {
  const inst = install();
  const before = snap(inst.skillDir);
  const log = logger();
  const fetch = fakeFetch({ 'https://a.test/': 'down', 'https://b.test/': 'down' });
  const r = await up.autoUpdate(base(inst, { sources: [A, B], fetch, log }));
  assert.equal(r.ok, false);
  assert.equal(log.text(), '');
  assert.deepEqual(snap(inst.skillDir), before);
  const rec = up.readRecord(inst.dataDir);
  assert.equal(rec.ok, false);
  assert.match(rec.result, /没读到新版清单：A（连不上（ECONNREFUSED））、B（连不上（ECONNREFUSED））/);
  // update 命令：说明原因，退出码 2（环境问题）
  const log2 = logger();
  assert.equal(await up.run({}, base(inst, { sources: [A, B], fetch, log: log2 })), 2);
  assert.match(log2.text(), /没读到新版清单.*等网络好了再运行 update/);
});

test('另一个进程正在更新：不抢，退出码 2', async () => {
  const inst = install();
  mkdirSync(inst.dataDir, { recursive: true });
  writeFileSync(join(inst.dataDir, 'update.lock'), '12345');
  const before = snap(inst.skillDir);
  const log = logger();
  assert.equal(await up.run({}, base(inst, { sources: [{ name: '本地', dir: publish() }], log })), 2);
  assert.match(log.text(), /另一个 li-talk 命令正在更新/);
  assert.deepEqual(snap(inst.skillDir), before);
});

test('version：版本号、安装位置、安装方式、上次检查', async () => {
  const inst = install();
  const log = logger();
  assert.equal(await versionRun({}, { skillDir: inst.skillDir, dataDir: inst.dataDir, log }), 0);
  assert.deepEqual(log.text().split('\n'), [
    'li-talk-skills 0.1.0',
    `安装位置：${inst.skillDir}`,
    '安装方式：每天第一次运行命令时自动检查更新',
    '上次检查更新：还没检查过',
  ]);
  await up.autoUpdate(base(inst, { sources: [{ name: '本地', dir: publish(OLD) }], log: logger() }));
  const m = JSON.parse(readFileSync(join(inst.skillDir, 'manifest.json'), 'utf8'));
  writeFileSync(join(inst.skillDir, 'manifest.json'), JSON.stringify({ ...m, installedFrom: 'local', installedAt: new Date(2026, 10, 16, 8, 30).toISOString() }));
  const log2 = logger();
  await versionRun({}, { skillDir: inst.skillDir, dataDir: inst.dataDir, log: log2 });
  assert.match(log2.text(), /安装方式：每天第一次运行命令时自动检查更新（从本机仓库复制安装于 2026-11-16 08:30）/);
  assert.match(log2.text(), /上次检查更新：2026-11-17 09:00，已是最新版本 0\.1\.0（本地 上是 0\.1\.0）/);
});

test('真的 fetch：从本机临时起的 http 服务更新，另一个地址连不上', async () => {
  const { createServer } = await import('node:http');
  const repo = publish();
  const server = createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    const p = join(repo, ...rel.split('/'));
    if (!existsSync(p)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200);
    res.end(readFileSync(p));
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  try {
    const inst = install();
    const log = logger();
    const sources = [{ name: '连不上', base: 'http://127.0.0.1:1/' }, { name: '本机服务', base: `http://127.0.0.1:${server.address().port}/` }];
    const r = await up.autoUpdate(base(inst, { sources, log }));
    assert.equal(r.updated, true, log.text());
    assert.deepEqual(snap(inst.skillDir), snap(join(repo, 'skills', 'li-talk-skills')));
    assert.match(log.text(), /^已自动从 0\.1\.0 更新到 0\.2\.0/);
    noLeftovers(inst);
  } finally {
    await new Promise(done => server.close(done));
  }
});

// ---- 用入口真跑一遍：临时目录里装一份当前的 skill 当旧版，另造一份 0.1.1 当来源 ----

function copySkill(to) {
  for (const rel of listFiles(SKILL)) {
    const p = join(to, ...rel.split('/'));
    mkdirSync(dirname(p), { recursive: true });
    copyFileSync(join(SKILL, ...rel.split('/')), p);
  }
}

test('入口：每天第一次运行命令前自动更新，更新说明在最前面，命令用新代码照常跑完', () => {
  const home = tmp();
  const skillDir = join(tmp(), 'skills', 'li-talk-skills');
  copySkill(skillDir);
  writeFileSync(join(skillDir, 'version.txt'), '0.1.0\n');
  const repo = tmp();
  const newDir = join(repo, 'skills', 'li-talk-skills');
  copySkill(newDir);
  writeFileSync(join(newDir, 'version.txt'), '0.1.1\n');
  writeFileSync(join(newDir, 'SKILL.md'), readFileSync(join(newDir, 'SKILL.md'), 'utf8') + '\n新版加的一行\n');
  writeFileSync(join(newDir, 'manifest.json'), manifestText(buildManifest(newDir)));
  writeFileSync(join(repo, 'CHANGELOG.md'), '# 更新说明\n\n## 0.1.1\n\n- 修好了一个问题。细节略\n\n## 0.1.0\n\n- 最小可用版\n');

  // HOME / USERPROFILE 指到临时目录：~/.li-talk-skills 也落在临时目录里
  const env = { ...process.env, LI_TALK_UPDATE_BASE: repo, HOME: home, USERPROFILE: home };
  const cli = (...args) => spawnSync(process.execPath, [join(skillDir, 'scripts', 'li-talk.mjs'), ...args], { env, encoding: 'utf8' });

  const r = cli('styles');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^已自动从 0\.1\.0 更新到 0\.1\.1（每天第一次运行命令时检查）。\n这次的要点：\n {2}· 修好了一个问题\n/);
  assert.ok(r.stdout.indexOf('新开一个对话') < r.stdout.indexOf('内置风格：'), '更新说明在命令输出前面');
  assert.match(r.stdout, /内置风格：/);
  assert.equal(readFileSync(join(skillDir, 'version.txt'), 'utf8').trim(), '0.1.1');
  assert.match(readFileSync(join(skillDir, 'SKILL.md'), 'utf8'), /新版加的一行/);
  assert.ok(existsSync(join(home, '.li-talk-skills', 'update.json')));

  const r2 = cli('styles');
  assert.equal(r2.status, 0, r2.stderr);
  assert.doesNotMatch(r2.stdout, /更新/, '同一天不再检查');

  const r3 = cli('version');
  assert.equal(r3.status, 0, r3.stderr);
  assert.match(r3.stdout, /^li-talk-skills 0\.1\.1\n安装位置：.+\n安装方式：每天第一次运行命令时自动检查更新\n上次检查更新：.+已从 0\.1\.0 更新到 0\.1\.1/);

  const r4 = cli('update');
  assert.equal(r4.status, 0, r4.stderr);
  assert.match(r4.stdout, /已是最新版本 0\.1\.1/);
});
