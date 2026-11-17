#!/usr/bin/env node
// 开发用脚本
//   node build.mjs --install-local   把 skills/li-talk-skills 装到本机 ~/.claude/skills/li-talk-skills，供作者试用
// 发版用的文件清单、干净度检查留给下一份计划。
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'skills', 'li-talk-skills');
const SKIP = new Set(['.gitkeep', '.li-talk', '.DS_Store', 'Thumbs.db']);

// 递归复制目录（不用 fs.cpSync，保证 Node 18 也能跑）
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (SKIP.has(name)) continue;
    const a = join(from, name), b = join(to, name);
    if (statSync(a).isDirectory()) copyDir(a, b); else copyFileSync(a, b);
  }
}

function stamp() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function installLocal() {
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
  copyDir(SRC, dest);
  console.log(`已装到：${dest}\n`);

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

const args = process.argv.slice(2);
if (args.includes('--install-local')) installLocal();
else {
  console.log('用法：node build.mjs --install-local   把 skill 装到本机 ~/.claude/skills/li-talk-skills');
  process.exit(args.length ? 1 : 0);
}
