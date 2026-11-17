import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatReport, mergeIssues } from '../skills/li-talk-skills/scripts/lib/report.mjs';

const issue = { level: 'error', type: 'text-overflow', page: 4, id: 'p04', title: '三种安装方式', beat: 2,
  msg: '第 3 张卡片的文字超出卡片底边 46px（卡片高 300，内容高 346）', fix: '删减这张卡的文字，或去掉容器的固定宽高' };
const run = (w, h, issues) => ({ w, h, result: { pages: 12, beats: 38, issues } });

test('同一个问题在几个尺寸都出现时合成一条', () => {
  const out = formatReport([run(1920, 1080, []), run(1440, 900, [issue]), run(1280, 720, [issue])]);
  assert.match(out, /^自检报告：12 页 38 拍 × 3 个尺寸，1 个错误、0 个提醒/);
  assert.match(out, /第 4 页 p04「三种安装方式」第 2 拍｜1440×900、1280×720/);
  assert.match(out, /→ 删减这张卡的文字/);
});

test('没有问题时明确说一句', () => {
  const out = formatReport([run(1920, 1080, [])]);
  assert.match(out, /没有发现问题/);
});

test('和页无关的问题写成整份课件', () => {
  const out = formatReport([run(390, 844, [{ level: 'error', type: 'console-error', page: null, msg: '加载失败：x.png' }])]);
  assert.match(out, /整份课件｜390×844/);
});

test('没写标题的页不出现「undefined」，错误排在提醒前面', () => {
  const warn = { level: 'warn', type: 'mascot-cover', page: 7, id: 'p07', beat: 1, msg: '形象的气泡压住了标题右端 18px' };
  const out = formatReport([run(1920, 1080, [warn, issue])]);
  assert.match(out, /第 7 页 p07 第 1 拍｜1920×1080/);
  assert.doesNotMatch(out, /undefined/);
  assert.ok(out.indexOf('错误') < out.indexOf('提醒'));
});

test('某个尺寸没读到结果时记成一条整份课件的错误，页数取读到的那次', () => {
  const runs = [run(1920, 1080, []), { w: 1024, h: 768, error: '1024×768 没读到自检结果' }];
  const out = formatReport(runs);
  assert.match(out, /^自检报告：12 页 38 拍 × 2 个尺寸，1 个错误/);
  assert.match(out, /整份课件｜1024×768\n\s+1024×768 没读到自检结果/);
  const m = mergeIssues(runs);
  assert.equal(m.errors.length, 1);
  assert.equal(m.warnings.length, 0);
});
