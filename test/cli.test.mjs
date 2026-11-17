import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { parseArgs, loadCommand } from '../skills/li-talk-skills/scripts/lib/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'skills', 'li-talk-skills');
const ENTRY = join(SKILL, 'scripts', 'li-talk.mjs');
const FIX = join(ROOT, 'test', 'fixtures', 'decks');

// 跑一次入口，返回 { code, out, err }
const cli = (...args) => {
  const r = spawnSync(process.execPath, [ENTRY, ...args], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const noStack = s => assert.doesNotMatch(s, /\n\s+at /, '不该打印堆栈：\n' + s);

test('位置参数、带值参数、开关', () => {
  const a = parseArgs(['check', './deck', '--browser', '--pages', '3-5', '--title=我的分享'], ['browser']);
  assert.deepEqual(a._, ['check', './deck']);
  assert.equal(a.browser, true);
  assert.equal(a.pages, '3-5');
  assert.equal(a.title, '我的分享');
});

test('开关后面跟位置参数时不吞掉它', () => {
  const a = parseArgs(['--browser', './deck'], ['browser']);
  assert.equal(a.browser, true);
  assert.deepEqual(a._, ['./deck']);
});

test('命令模块还不存在时给一句中文，不抛 Node 的错误', async () => {
  const url = pathToFileURL(join(SKILL, 'scripts', 'lib', 'li-talk-not-exist.mjs'));
  await assert.rejects(() => loadCommand(url), e => /还没做好/.test(e.userMessage) && e.exitCode === 1);
});

test('version 打印版本号（和 version.txt 一致）、安装位置；在仓库里运行时说明不自动更新', () => {
  const v = readFileSync(join(SKILL, 'version.txt'), 'utf8').trim();
  assert.equal(v, '0.1.0');
  const r = cli('version');
  assert.equal(r.code, 0, r.err);
  const lines = r.out.trim().split(/\r?\n/);
  assert.equal(lines[0], 'li-talk-skills ' + v);
  assert.equal(lines[1], '安装位置：' + SKILL);
  assert.match(lines[2], /^安装方式：开发中的仓库.*不自动更新/);
});

test('update 在仓库里运行：不联网，说明原因，退出码 0', () => {
  const r = cli('update');
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /开发中的仓库/);
});

test('不带命令时打印用法，退出码 0', () => {
  const r = cli();
  assert.equal(r.code, 0);
  assert.match(r.out, /^用法：node li-talk\.mjs <命令>/);
  assert.match(r.out, /check <课件目录> \[--browser\]/);
});

test('不认识的命令：退出码 1，列出用法', () => {
  const r = cli('nope');
  assert.equal(r.code, 1);
  assert.match(r.err, /不认识的命令「nope」/);
  assert.match(r.err, /用法：/);
});

test('check 不写目录或目录不存在：中文说明，退出码 1，没有堆栈', () => {
  let r = cli('check');
  assert.equal(r.code, 1);
  assert.match(r.err, /check 后面要写课件目录/);
  noStack(r.err);
  r = cli('check', join(FIX, 'li-talk-not-exist'));
  assert.equal(r.code, 1);
  assert.match(r.err, /找不到课件目录/);
  noStack(r.err);
});

test('check 不带 --browser：只做静态检查，有错误时退出码 1', () => {
  let r = cli('check', join(FIX, 'static-good'));
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /^检查：3 页，0 个错误/);
  assert.doesNotMatch(r.out, /自检报告/);
  r = cli('check', join(FIX, 'static-bad'));
  assert.equal(r.code, 1);
  assert.match(r.out, /id「p1」和第 \d 页重复/);
});
