#!/usr/bin/env node
// 开发和发版用的脚本（不装到用户机器上）
//   node build.mjs --manifest       按 skill 目录现状生成 skills/li-talk-skills/manifest.json，版本号取 version.txt
//   node build.mjs --check          干净度检查：本机绝对路径、内部词、版本号和 CHANGELOG、清单和文件、换行、是否都进了 git
//   node build.mjs --release        发版前一条龙：--check、--manifest、全量测试，最后打印下一步
//   node build.mjs --install-local  把 skill 装到本机 ~/.claude/skills/li-talk-skills 供作者试用，并写一份本机安装记录
// 发版：改 version.txt、写 CHANGELOG → node build.mjs --release → 提交、推 dev → 作者把 dev 合进 master（合进去就是发版）。
// 只用 Node 18 自带的模块。
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, renameSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { listFiles, buildManifest, manifestText, readManifest, hashFiles, MANIFEST } from './skills/li-talk-skills/scripts/lib/manifest.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SKILL_REL = 'skills/li-talk-skills';
const skillDirOf = root => join(root, ...SKILL_REL.split('/'));
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// ---------- 清单 ----------

// 生成 manifest.json，返回 { path, manifest }
export function writeManifest(root = ROOT) {
  const dir = skillDirOf(root);
  const m = buildManifest(dir, readFileSync(join(dir, 'version.txt'), 'utf8').trim());
  const p = join(dir, MANIFEST);
  writeFileSync(p, manifestText(m));
  return { path: p, manifest: m };
}

// ---------- 干净度检查 ----------

// 本机绝对路径：Windows 盘符加反斜杠、C:/Users 这类、/Users/某人、/home/某人
const PATH_RULES = [
  [/(^|[^A-Za-z0-9])[A-Za-z]:\\/, '像是 Windows 本机绝对路径'],
  [/(^|[^A-Za-z0-9])[A-Za-z]:\/(Users|Documents and Settings|home)\b/i, '像是 Windows 本机绝对路径'],
  [/\/Users\/[A-Za-z0-9_.\-\u4e00-\u9fff]+/, '像是 macOS 本机绝对路径'],
  [/\/home\/[A-Za-z0-9_.\-]+\//, '像是 Linux 本机绝对路径'],
];
// 内部词。作者指定的署名和「小黎的愿景」（guide 问要不要加「关于我」页时转告用户的那句）是仅有的允许出现「小黎」的写法（template/engine/build.js 里那句，设计文档里引用的也是这一句）
const INTERNAL_WORDS = [/TAPD/i, /小克/, /小黎/];
const ALLOWED_PHRASES = ['由 小黎 · li-talk-skills 提供支持', '小黎的愿景'];

// 要扫的文件：skill 目录、docs/、根目录的 README*.md 和 CHANGELOG.md、.claude-plugin/（有的话）
function scanTargets(root) {
  const out = [];
  const addDir = rel => {
    const abs = join(root, ...rel.split('/'));
    if (!existsSync(abs)) return;
    for (const f of listFiles(abs)) out.push(rel + '/' + f);
    if (existsSync(join(abs, MANIFEST))) out.push(rel + '/' + MANIFEST);
  };
  addDir(SKILL_REL);
  addDir('docs');
  addDir('.claude-plugin');
  for (const name of readdirSync(root)) {
    if (/^README.*\.md$/i.test(name) || name === 'CHANGELOG.md') out.push(name);
  }
  return out;
}

const isBinary = buf => buf.subarray(0, 8000).includes(0);

// CHANGELOG 最上面一版的版本号
export function topChangelogVersion(text) {
  const m = /^##[ \t]+v?(\d+\.\d+\.\d+)/m.exec(String(text || ''));
  return m ? m[1] : null;
}

// 跑一遍检查，返回 { errors: [...], warnings: [...] }。
// opts.manifest=false 时不查清单（--release 先查别的，生成清单后再查清单）；opts.git=false 时不查 git
export function checkRepo(root = ROOT, opts = {}) {
  const errors = [], warnings = [];
  const skillDir = skillDirOf(root);

  // 1. 本机绝对路径、内部词；skill 目录里的文本文件不能是 CRLF 换行
  for (const rel of scanTargets(root)) {
    const buf = readFileSync(join(root, ...rel.split('/')));
    if (isBinary(buf)) continue;
    const text = buf.toString('utf8');
    if (rel.startsWith(SKILL_REL + '/') && text.includes('\r\n')) {
      errors.push(`${rel}：换行是 CRLF。仓库统一用 LF，清单的校验值会和 GitHub 上的文件对不上，请改成 LF`);
    }
    text.split('\n').forEach((line, i) => {
      for (const [re, what] of PATH_RULES) {
        const m = re.exec(line);
        if (m) errors.push(`${rel}:${i + 1}：${what}「${m[0].trim()}」`);
      }
      let clean = line;
      for (const p of ALLOWED_PHRASES) clean = clean.split(p).join('');
      for (const re of INTERNAL_WORDS) {
        const m = re.exec(clean);
        if (m) errors.push(`${rel}:${i + 1}：有内部词「${m[0]}」`);
      }
    });
  }

  // 2. 版本号：version.txt 是正式版本号，和 CHANGELOG 最上面一版一致
  let version = null;
  try { version = readFileSync(join(skillDir, 'version.txt'), 'utf8').trim(); } catch { errors.push(`${SKILL_REL}/version.txt 不存在`); }
  if (version !== null && !/^\d+\.\d+\.\d+$/.test(version)) errors.push(`version.txt 写的是「${version}」，不是 x.y.z 这样的正式版本号`);
  let changelog = null;
  try { changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8'); } catch { errors.push('CHANGELOG.md 不存在'); }
  if (changelog !== null) {
    const top = topChangelogVersion(changelog);
    if (!top) errors.push('CHANGELOG.md 里没找到「## x.y.z」这样的版本标题');
    else if (version && top !== version) errors.push(`version.txt 是 ${version}，CHANGELOG.md 最上面一版是 ${top}，两个要对上`);
  }

  // 3. 清单和文件对得上
  if (opts.manifest !== false) {
    const m = readManifest(skillDir);
    if (!m) errors.push(`${SKILL_REL}/manifest.json 不存在或读不出来，先运行 node build.mjs --manifest`);
    else {
      if (version && m.version !== version) errors.push(`manifest.json 的版本号是 ${m.version}，version.txt 是 ${version}，重新运行 node build.mjs --manifest`);
      const files = listFiles(skillDir);
      const diff = [];
      for (const [rel, h] of hashFiles(skillDir, files)) {
        if (!has(m.files, rel)) diff.push(`清单里少了 ${rel}`);
        else if (m.files[rel] !== h) diff.push(`${rel} 改过了`);
      }
      const set = new Set(files);
      for (const rel of Object.keys(m.files)) if (!set.has(rel)) diff.push(`清单里有 ${rel}，文件已经没有了`);
      if (diff.length) {
        errors.push(`manifest.json 和文件对不上（${diff.length} 处），重新运行 node build.mjs --manifest：\n    ` +
          diff.slice(0, 10).join('\n    ') + (diff.length > 10 ? `\n    ……另有 ${diff.length - 10} 处` : ''));
      }
    }
  }

  // 4. skill 目录里的文件都进了 git：清单里有、仓库里没有的文件，用户更新时会下载失败
  if (opts.git !== false) {
    const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' });
    const sameRoot = top.status === 0 && resolve(top.stdout.trim()).toLowerCase() === resolve(root).toLowerCase();
    if (!sameRoot) warnings.push('这里不是 git 仓库的根目录（或没装 git），没查文件有没有都加进 git');
    else {
      const r = spawnSync('git', ['ls-files', '-z', '--', SKILL_REL], { cwd: root, encoding: 'utf8' });
      const tracked = new Set(String(r.stdout || '').split('\0').filter(Boolean));
      const missing = listFiles(skillDir).map(f => SKILL_REL + '/' + f).filter(f => !tracked.has(f));
      if (missing.length) {
        errors.push(`这些文件还没加进 git，发版后用户更新时会下载不到，先 git add 或删掉：\n    ${missing.slice(0, 10).join('\n    ')}` +
          (missing.length > 10 ? `\n    ……另有 ${missing.length - 10} 个` : ''));
      }
    }
  }
  return { errors, warnings };
}

function printCheck({ errors, warnings }, title) {
  for (const w of warnings) console.log(`提醒：${w}`);
  if (!errors.length) { console.log(`${title}：通过`); return true; }
  console.log(`${title}：${errors.length} 个问题`);
  for (const e of errors) console.log(`  - ${e}`);
  return false;
}

// ---------- 发版 ----------

function release() {
  console.log('1/4 干净度检查');
  if (!printCheck(checkRepo(ROOT, { manifest: false }), '  干净度检查')) return 1;
  console.log('2/4 生成文件清单');
  const { path, manifest } = writeManifest(ROOT);
  console.log(`  已写 ${relative(ROOT, path).split(sep).join('/')}：${manifest.version}，${Object.keys(manifest.files).length} 个文件`);
  console.log('3/4 核对清单');
  if (!printCheck(checkRepo(ROOT, { git: false }), '  清单核对')) return 1;
  console.log('4/4 全量测试');
  const t = spawnSync(process.execPath, [join(ROOT, 'test', 'run.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (t.status !== 0) { console.log('\n测试没全过，先修好再发版。'); return 1; }
  console.log(`
${manifest.version} 的发版检查都过了。下一步：
  1. 确认 CHANGELOG.md 最上面一版写好了要点（自动更新时会转述给用户），把改动连同 ${SKILL_REL}/manifest.json 一起提交。
  2. 推开发分支：git push origin dev:dev
  3. 作者在 GitHub 上把 dev 合进 master。合进去就是发版：自动更新只读 master，用户每天第一次运行命令时会更新到 ${manifest.version}。
  4. 合并几分钟后，在临时目录装一份旧版，运行任意命令，确认能自动更新到 ${manifest.version}。`);
  return 0;
}

// ---------- 装到本机 ----------

function stamp() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function installLocal() {
  const src = skillDirOf(ROOT);
  const base = join(homedir(), '.claude', 'skills');
  const dest = join(base, 'li-talk-skills');
  mkdirSync(base, { recursive: true });
  if (existsSync(dest)) {
    // 备份不能放在 ~/.claude/skills 里，否则 Claude Code 会把备份也当成一个同名的 skill 加载
    const bakDir = join(homedir(), '.li-talk-skills', 'backups');
    mkdirSync(bakDir, { recursive: true });
    const bak = join(bakDir, 'skill-' + stamp());
    renameSync(dest, bak);
    console.log(`原来装的那份已移到：${bak}`);
  }
  for (const rel of listFiles(src)) {
    const to = join(dest, ...rel.split('/'));
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(join(src, ...rel.split('/')), to);
  }
  // 本机安装记录：按装进去的文件现算一份清单（仓库里的 manifest.json 只在发版时更新，开发中可能是旧的）。
  // 自动更新按它比对；version 命令据此显示「从本机仓库复制安装」。
  const m = buildManifest(dest);
  writeFileSync(join(dest, MANIFEST), manifestText({ ...m, installedFrom: 'local', installedAt: new Date().toISOString() }));
  console.log(`已装到：${dest}（${m.version}，${Object.keys(m.files).length} 个文件）\n`);

  console.log('检查完整字体（第一次会下载约 8.8 MB）…');
  const r = spawnSync(process.execPath, [join(dest, 'scripts', 'li-talk.mjs'), 'fonts'], { stdio: 'inherit' });
  if (r.status !== 0) console.log('字体没下载完整也能用，课件会先用自带的常用字小字库；网络好了再运行 fonts。');

  console.log(`
怎么试用：
  1. 新开一个 Claude Code 对话（新对话才会加载新装的 skill）。
  2. 在任意目录对 AI 说：「用 li-talk-skills 帮我做一个关于……的课件」。
  3. AI 会先运行 guide，一步步问你，每一步都等你确认。

用 Codex、Cursor 的话：把上面这个目录整个复制到它们的全局 skills 目录。`);
}

// ---------- 命令行 ----------

const USAGE = `用法：
  node build.mjs --manifest       生成 skills/li-talk-skills/manifest.json
  node build.mjs --check          干净度检查（本机路径、内部词、版本号、清单、换行、git）
  node build.mjs --release        发版前一条龙：检查、生成清单、全量测试，打印下一步
  node build.mjs --install-local  把 skill 装到本机 ~/.claude/skills/li-talk-skills`;

function main(args) {
  if (args.includes('--install-local')) { installLocal(); return 0; }
  if (args.includes('--release')) return release();
  if (args.includes('--manifest')) {
    const { path, manifest } = writeManifest(ROOT);
    console.log(`已写 ${relative(ROOT, path).split(sep).join('/')}：${manifest.version}，${Object.keys(manifest.files).length} 个文件`);
    return 0;
  }
  if (args.includes('--check')) return printCheck(checkRepo(ROOT), '干净度检查') ? 0 : 1;
  console.log(USAGE);
  return args.length ? 1 : 0;
}

// 被测试 import 时不执行命令行
const same = (a, b) => {
  try { a = realpathSync(a); b = realpathSync(b); } catch { /* 用原样比 */ }
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
};
if (process.argv[1] && same(resolve(process.argv[1]), fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
