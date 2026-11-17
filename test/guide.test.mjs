// guide：从课件目录的实际状态推断做到哪一步，告诉 AI 下一步做什么、问用户什么；以及 styles 命令
// 搭骨架时字体一律用假的清单和假的下载函数，不联网，也不碰本机的字体缓存
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { guideText, run as runGuide } from '../skills/li-talk-skills/scripts/lib/guide.mjs';
import { run as runStyles } from '../skills/li-talk-skills/scripts/lib/styles.mjs';
import { confirmStep } from '../skills/li-talk-skills/scripts/lib/meta.mjs';
import { createDeck } from '../skills/li-talk-skills/scripts/lib/new.mjs';
import { readDeck } from '../skills/li-talk-skills/scripts/lib/deck.mjs';
import { sha256 } from '../skills/li-talk-skills/scripts/lib/fonts.mjs';
import { SKILL_DIR } from '../skills/li-talk-skills/scripts/lib/paths.mjs';

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-guide-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

const fwd = p => p.replace(/\\/g, '/');
const CLI = `node "${fwd(SKILL_DIR)}/scripts/li-talk.mjs"`;
const cmd = (...parts) => `${CLI} ${parts.join(' ')}`;
const q = d => `"${fwd(d)}"`;

// 假字体：缓存目录是空的、下载一律失败 → 用自带的小字库
const BLOCK = Buffer.from('假字体块');
const offline = () => ({
  log() {},
  fonts: {
    manifest: {
      package: 'fake-font', version: '0.0.1', family: 'WK', mirrors: ['https://m1.test/'],
      files: [{ path: 'files/x-400.woff2', weight: 400, range: 'U+4e00-4e2f', sha256: sha256(BLOCK), size: BLOCK.length }],
    },
    dir: join(tmp(), 'cache'),
    fetch: async () => { throw new Error('测试里不联网'); },
  },
});

// 讲稿：标题、提纲，加 n 页「## 第 N 页」
function script(n, { title = '怎么泡好一杯茶', extra = '' } = {}) {
  let s = `# ${title}\n\n## 给组织方\n- 一句话简介：讲怎么泡茶\n- 大纲：\n  1. 选茶（2 页）\n\n${extra}\n`;
  for (let i = 1; i <= n; i++) {
    s += `\n## 第 ${i} 页 第${i}页的标题\n\n**屏幕**\n- 标题：第 ${i} 页\n\n**讲词**\n【第 0 拍】先烧水，水开了再等一会儿。\n【第 1 拍】**温杯**很重要。\n`;
  }
  return s;
}

// 章节文件：按给的 id 写几页
const chapter = ids => ids.map((id, i) =>
  `Deck.add({ id: '${id}', scene: 'paper', title: '页面${i + 1}', html: '<p data-beat="0">x</p><p data-beat="1">y</p>', ` +
  `notes: [{ beat: 0, say: '甲' }, { beat: 1, say: '乙' }] });`).join('\n') + '\n';

// 搭好骨架、确认到风格为止的课件
async function builtDeck({ scriptPages = 5, confirm = [] } = {}) {
  const dir = join(tmp(), '我的分享');
  mkdirSync(dir);
  writeFileSync(join(dir, '讲稿.md'), script(scriptPages));
  for (const s of ['outline', 'script']) confirmStep(dir, s);
  confirmStep(dir, 'style', { scenes: ['paper'] });
  await createDeck(dir, { title: '怎么泡好一杯茶' }, offline());
  for (const s of confirm) confirmStep(dir, s);
  return dir;
}

// 写自检记录（默认：刚跑过、和当前页面一致、0 个错误）
function selftest(dir, rec = {}) {
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  writeFileSync(join(dir, '.li-talk', 'selftest.json'), JSON.stringify({
    at: new Date().toISOString(), slidesMtime: readDeck(dir).slidesMtime,
    sizes: ['1920x1080'], errors: 0, warnings: 0, ...rec,
  }));
}

// 四块按顺序都在；【问用户】里每个问题最多 4 个选项（Claude Code 的提问卡片最多 4 个），并标了推荐项
function checkShape(t) {
  const heads = ['【现在在哪一步】', '【下一步做什么】', '【问用户】', '【可以这样对 AI 说】'];
  let at = -1;
  for (const h of heads) {
    const i = t.indexOf(h);
    assert.ok(i > at, `缺少或顺序不对：${h}\n${t}`);
    at = i;
  }
  assert.match(t, /【可以这样对 AI 说】「[^」]+」/);
  const ask = t.slice(t.indexOf('【问用户】'), t.indexOf('【可以这样对 AI 说】'));
  const qs = ask.split(/\n\s*问题 \d+：/).slice(1);
  for (const one of qs) {
    const opts = one.split('\n').filter(l => /^\s+\d+\. /.test(l));
    assert.ok(opts.length >= 2 && opts.length <= 4, `每个问题 2 到 4 个选项：\n${one}`);
    assert.ok(opts.some(l => /（推荐/.test(l)), `每个问题都要标推荐项：\n${one}`);
  }
  return qs.length;
}

test('空目录从起点开始，问手上有什么', () => {
  const t = guideText(join(tmpdir(), 'li-talk-not-exist-' + Date.now()));
  assert.match(t, /【现在在哪一步】① 起点/);
  assert.match(t, /你手上现在有什么/);
  assert.match(t, /1\. 只有一个主题/);
  assert.match(t, /【可以这样对 AI 说】/);
  checkShape(t);
});

test('提纲和讲稿确认后进入选风格', () => {
  const dir = mkdtempSync(join(tmpdir(), 'li-talk-guide-'));
  made.push(dir);
  writeFileSync(join(dir, '讲稿.md'), '## 第 1 页 封面\n');
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】④ 风格/);
  assert.match(t, /styles --open/);
});

test('起点：命令写成 skill 的绝对路径，课件目录也写绝对路径', () => {
  const dir = join(tmp(), '新课件');
  const t = guideText(dir);
  assert.ok(t.includes(cmd('guide', q(dir))), t);
  assert.ok(t.includes(cmd('materials', q(join(dir, '素材')))), t);
  assert.ok(t.includes(fwd(dir) + '/讲稿.md'), '告诉 AI 讲稿.md 写在哪');
  assert.match(t, /共 9 步/);
});

test('起点：素材已经放进来了，提示先跑 materials', () => {
  const dir = tmp();
  mkdirSync(join(dir, '素材'));
  writeFileSync(join(dir, '素材', 'a.md'), '笔记');
  writeFileSync(join(dir, '素材', 'b.png'), 'x');
  const t = guideText(dir);
  assert.match(t, /① 起点/);
  assert.match(t, /素材\/ 里已经有 2 个文件/);
  checkShape(t);
});

test('起点：目录里有别的文件时，建议在里面另建一个课件目录；子目录里已有课件时列出来', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'package.json'), '{}');
  mkdirSync(join(dir, '旧分享'));
  writeFileSync(join(dir, '旧分享', '.li-talk.json'), '{}');
  const t = guideText(dir);
  assert.match(t, /① 起点/);
  assert.ok(t.includes(fwd(join(dir, '我的分享'))), t);
  assert.match(t, /package\.json/);
  assert.ok(t.includes(cmd('guide', q(join(dir, '旧分享')))), '已有的课件给出接着做的命令');
});

test('提纲：讲稿.md 只有标题时问场合，确认后运行 confirm outline', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), '# 怎么泡好一杯茶\n');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】② 提纲/);
  assert.match(t, /讲给谁/);
  assert.match(t, /讲多久/);
  assert.match(t, /带走什么/);
  assert.ok(t.includes(cmd('confirm', q(dir), 'outline')), t);
  assert.match(t, /给组织方/);
  assert.match(t, /等用户/);
  assert.ok(checkShape(t) >= 4);
});

test('提纲：讲稿.md 里已经有讲稿时，从讲稿里整理提纲', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(3));
  const t = guideText(dir);
  assert.match(t, /② 提纲/);
  assert.match(t, /已经有 3 页/);
});

test('讲稿：给出讲稿格式说明的绝对路径、现有页数和字数，确认后运行 confirm script', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2));
  confirmStep(dir, 'outline');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】③ 讲稿/);
  assert.ok(t.includes(fwd(SKILL_DIR) + '/references/script-format.md'), t);
  assert.ok(t.includes(cmd('confirm', q(dir), 'script')), t);
  assert.match(t, /现在有 2 页/);
  assert.match(t, /讲词约 \d+ 字/);
  assert.match(t, /## 第 N 页/);
  checkShape(t);
});

test('风格：按讲稿内容给推荐，推荐项排第一；选定后运行 confirm style --scenes', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { extra: '讲代码怎么部署，接口和架构，命令行里敲命令。代码、部署。' }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /问题 1：.*风格/);
  assert.match(t, /\n\s+1\. 科技暗黑（dark）[^\n]*（推荐/);
  assert.ok(t.includes(cmd('confirm', q(dir), 'style', '--scenes')), t);
  assert.ok(t.includes(cmd('styles')), t);
  checkShape(t);

  const plain = tmp();
  writeFileSync(join(plain, '讲稿.md'), script(2));
  confirmStep(plain, 'outline');
  confirmStep(plain, 'script');
  assert.match(guideText(plain), /\n\s+1\. 方格纸（paper）[^\n]*（推荐/);
});

test('搭骨架：风格确认后给出 new 命令，标题取讲稿的一级标题', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { title: '新同事入门' }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  confirmStep(dir, 'style', { scenes: ['paper'] });
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑤ 搭骨架/);
  assert.ok(t.includes(cmd('new', q(dir), '--title', '"新同事入门"', '--scenes', 'paper')), t);
  checkShape(t);
});

test('搭骨架：目录里有别的文件时先说清楚，不然 new 会拒绝', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2));
  writeFileSync(join(dir, '旧稿.docx'), 'x');
  for (const s of ['outline', 'script']) confirmStep(dir, s);
  confirmStep(dir, 'style', { scenes: ['paper'] });
  const t = guideText(dir);
  assert.match(t, /⑤ 搭骨架/);
  assert.match(t, /旧稿\.docx/);
});

test('先做 3 页：刚搭好只有封面，写到 3 页再自检', async () => {
  const dir = await builtDeck();
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑥ 先做 3 页/);
  assert.match(t, /现在 1 页/);
  assert.ok(t.includes(fwd(SKILL_DIR) + '/references/templates.md'), t);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')), t);
  checkShape(t);
});

test('先做 3 页：写够了但没跑自检、自检过期、自检有错误，都要先跑 check --browser', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  let t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.match(t, /还没跑过后台自检/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));
  assert.doesNotMatch(t, /confirm .* trial/);

  selftest(dir, { errors: 2, warnings: 1 });
  t = guideText(dir);
  assert.match(t, /还有 2 个错误/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));

  selftest(dir, { slidesMtime: readDeck(dir).slidesMtime - 60000 });
  t = guideText(dir);
  assert.match(t, /改过/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));

  // 自检之后又改了 index.html（比如加了一章）也算过期
  selftest(dir, { at: new Date(Date.now() - 60000).toISOString() });
  t = guideText(dir);
  assert.match(t, /改过/);
});

test('先做 3 页：自检清零后打开给用户看，认可后运行 confirm trial', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir, { warnings: 1 });
  const t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.ok(t.includes(cmd('open', q(dir))), t);
  assert.ok(t.includes(cmd('confirm', q(dir), 'trial')), t);
  assert.match(t, /这 3 页/);
  checkShape(t);
});

test('章节运行出错时先让 AI 运行 check 看是哪里错了', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), 'Deck.add({ id: "p01", title: "x", html: "" });\nthis is not js\n');
  const t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.match(t, /slides\/ch1\.js/);
  assert.ok(t.includes(cmd('check', q(dir))), t);
});

test('写全稿：页数少于讲稿，列出还没写的页', async () => {
  const dir = await builtDeck({ scriptPages: 5, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p05']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑦ 写全稿/);
  assert.match(t, /讲稿 5 页，课件现在 3 页/);
  assert.match(t, /第 3 页「第3页的标题」/);
  assert.match(t, /第 4 页「第4页的标题」/);
  assert.doesNotMatch(t, /第 5 页「/);
  assert.match(t, /ch2\.js/);
  checkShape(t);
});

test('写全稿：页数够了但自检过期，也停在这一步先自检清零', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir, { slidesMtime: 1 });
  const t = guideText(dir);
  assert.match(t, /⑦ 写全稿/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));
});

test('过稿：写完、自检清零后给用户过稿，认可后运行 confirm review', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑧ 过稿/);
  assert.ok(t.includes(cmd('open', q(dir))));
  assert.ok(t.includes(cmd('confirm', q(dir), 'review')));
  checkShape(t);
});

test('完成：告诉用户怎么讲', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial', 'review'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑨ 完成/);
  for (const k of [/S/, /T/, /F/, /空格/]) assert.match(t, k);
  checkShape(t);
});

test('跳过确认直接 new 的课件，按顺序回到没确认的那一步', async () => {
  const dir = join(tmp(), 'deck');
  await createDeck(dir, { title: 't', scenes: ['paper'] }, offline());
  assert.match(guideText(dir), /② 提纲/);
  writeFileSync(join(dir, '讲稿.md'), script(2));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /④ 风格/);
  assert.match(t, /已经搭好骨架/);
  assert.match(t, /\n\s+1\. 方格纸（paper）[^\n]*（推荐/);
});

test('目录是个文件时报中文错误；run 打印说明并返回 0', async () => {
  const f = join(tmp(), 'x.txt');
  writeFileSync(f, 'x');
  assert.throws(() => guideText(f), /是一个文件/);
  const lines = [];
  const code = await runGuide({ _: [join(tmp(), '新的')] }, { log: s => lines.push(s) });
  assert.equal(code, 0);
  assert.match(lines.join('\n'), /① 起点/);
});

/* ------------------------------------------------------------------
   styles
   ------------------------------------------------------------------ */

test('styles：按家分组列出所有风格，末尾写推荐规则', async () => {
  const lines = [];
  const code = await runStyles({ _: [] }, { log: s => lines.push(s) });
  const t = lines.join('\n');
  assert.equal(code, 0);
  assert.match(t, /手绘家/);
  assert.match(t, /现代家/);
  for (const k of ['paper', 'board', 'journal', 'desk', 'watercolor', 'dark']) assert.match(t, new RegExp(`\\b${k}\\b`));
  assert.ok(t.indexOf('手绘家') < t.indexOf('paper') && t.indexOf('现代家') < t.indexOf('dark'));
  assert.match(t, /方格纸/);
  assert.match(t, /适合/);
  assert.match(t, /不适合/);
  assert.match(t, /最多 3 种/);
  assert.match(t, /同一家/);
  assert.match(t, /微光/, '写出各风格默认的形象');
});

test('styles --open：样册还没做好时说明并返回 0；做好了就用浏览器打开', async () => {
  const tpl = tmp();
  mkdirSync(join(tpl, 'scenes'));
  writeFileSync(join(tpl, 'scenes', 'index.json'), JSON.stringify([{ key: 'paper', label: '方格纸', family: 'hand', mascot: 'duoduo', look: 'a', fit: 'b', notFit: 'c', risk: 'd' }]));
  writeFileSync(join(tpl, 'scenes', 'paper.js'), '');
  const opened = [];
  const opener = async f => { opened.push(f); return true; };
  let lines = [];
  let code = await runStyles({ _: [], open: true }, { log: s => lines.push(s), tplDir: tpl, opener });
  assert.equal(code, 0);
  assert.match(lines.join('\n'), /样册还没做好/);
  assert.equal(opened.length, 0);

  writeFileSync(join(tpl, 'gallery.html'), '<!doctype html>');
  lines = [];
  code = await runStyles({ _: [], open: true }, { log: s => lines.push(s), tplDir: tpl, opener });
  assert.equal(code, 0);
  assert.deepEqual(opened, [join(tpl, 'gallery.html')]);
  assert.match(lines.join('\n'), /已用浏览器打开样册/);
});

test('styles：说明里有、文件还没做好的风格标出来，别让 AI 选', async () => {
  const tpl = tmp();
  mkdirSync(join(tpl, 'scenes'));
  writeFileSync(join(tpl, 'scenes', 'index.json'), JSON.stringify([
    { key: 'paper', label: '方格纸', family: 'hand', mascot: 'duoduo', look: 'a', fit: 'b', notFit: 'c', risk: 'd' },
    { key: 'ink', label: '水墨国风', family: 'hand', mascot: 'x', look: 'a', fit: 'b', notFit: 'c', risk: 'd' },
  ]));
  writeFileSync(join(tpl, 'scenes', 'paper.js'), '');
  const lines = [];
  await runStyles({ _: [] }, { log: s => lines.push(s), tplDir: tpl });
  assert.match(lines.join('\n'), /ink.*还没做好/);
});
