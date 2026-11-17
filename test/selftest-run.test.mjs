import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extractResult, selftest, deckUrl, openBrowser } from '../skills/li-talk-skills/scripts/lib/selftest-run.mjs';
import { findBrowser } from '../skills/li-talk-skills/scripts/lib/browser.mjs';
import { run as check, SIZES } from '../skills/li-talk-skills/scripts/lib/check.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'decks');

// 测试用的临时目录：统一登记，进程退出时删掉
const TMP = [];
const tmp = prefix => { const d = mkdtempSync(join(tmpdir(), prefix)); TMP.push(d); return d; };
process.on('exit', () => { for (const d of TMP) { try { rmSync(d, { recursive: true, force: true }); } catch { /* 删不掉不要紧 */ } } });

test('从 dump-dom 的输出里取出自检结果（会反转义）', () => {
  const dom = '<html><body><pre id="deck-selftest" hidden="">{"pages":1,"issues":[{"msg":"a &amp; b &lt;c&gt;"}]}</pre></body></html>';
  const r = extractResult(dom);
  assert.equal(r.pages, 1);
  assert.equal(r.issues[0].msg, 'a & b <c>');
});

test('取不到时返回 null', () => assert.equal(extractResult('<html></html>'), null));

test('课件地址：中文路径转成 file: 地址，带上查询和 #页/拍', () => {
  const u = deckUrl(join(tmpdir(), '我的 分享'), '?selftest=1&pages=3-5', '#3/2');
  assert.match(u, /^file:\/\/\//);
  assert.match(u, /\/%E6%88%91%E7%9A%84%20%E5%88%86%E4%BA%AB\/index\.html\?selftest=1&pages=3-5#3\/2$/);
});

test('找浏览器：LI_TALK_BROWSER 指向存在的文件时直接用它，都找不到时返回 null', () => {
  assert.equal(findBrowser({ LI_TALK_BROWSER: process.execPath }, 'win32'), process.execPath);
  assert.equal(findBrowser({ LI_TALK_BROWSER: join(tmpdir(), 'li-talk-no-browser.exe') }, 'win32'), null);
});

const browser = findBrowser();

// 不依赖引擎的最小页面：一加载就按约定 D 写好结果，viewport 填实际的 innerWidth / innerHeight
const MINI = `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body style="margin:0;background:#c00">
<pre id="deck-selftest" hidden>{"engine":"0.1.0","viewport":{"w":0,"h":0,"reading":false},"pages":1,"beats":1,"list":[],"issues":[]}</pre>
<script>(function(){var p=document.getElementById('deck-selftest'),r=JSON.parse(p.textContent);
r.viewport={w:innerWidth,h:innerHeight,reading:innerWidth<innerHeight};r.query=location.search;
r.issues=[{level:'warn',type:'deck-warn',page:null,msg:'a & b <c>'}];
p.textContent=JSON.stringify(r);document.documentElement.dataset.selftest='done'})()</script></body></html>`;
const pngSize = file => { const b = readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test('真实浏览器：视口和要求的尺寸一致（含手机竖屏 390×844），读回结果，截图尺寸对', { skip: !browser && '本机没找到 Edge / Chrome' }, async () => {
  const dir = tmp('li-talk-mini-');
  writeFileSync(join(dir, 'index.html'), MINI);
  const b = await openBrowser(browser);
  try {
    for (const [w, h] of [[1440, 900], [390, 844], [1920, 1080]]) {
      const r = await b.selftest(dir, { w, h, pages: '1-2' });
      assert.deepEqual(r.viewport, { w, h, reading: w < h });
      assert.equal(r.query, '?selftest=1&pages=1-2');
      assert.equal(r.issues[0].msg, 'a & b <c>');
    }
    const file = join(dir, 'shot.png');
    await b.screenshot(dir, file, { w: 1920, h: 1080, page: 1, beat: 0 });
    assert.deepEqual(pngSize(file), [1920, 1080]);
  } finally { await b.close(); }
});

test('真实浏览器：没有自检模式的页面很快报错，不干等', { skip: !browser && '本机没找到 Edge / Chrome' }, async () => {
  const dir = tmp('li-talk-mini-');
  writeFileSync(join(dir, 'index.html'), '<!doctype html><html><body>不是课件</body></html>');
  const t = Date.now();
  await assert.rejects(() => selftest(browser, dir, { w: 1280, h: 720 }), e => /没读到自检结果/.test(e.userMessage) && /selftest\.js/.test(e.userMessage));
  assert.ok(Date.now() - t < 20000, '应在 20 秒内报错');
});

// 真实课件的测试要等任务 6（引擎自检模式和 good、overflow 测试课件）做完才能跑
const ready = existsSync(join(FIX, 'good', 'index.html')) && existsSync(join(FIX, 'overflow', 'index.html'));
const skip = !browser ? '本机没找到 Edge / Chrome'
  : !ready ? '测试课件 test/fixtures/decks/good、overflow 还没有（引擎自检模式做完后才有）' : false;
test('真实浏览器：good 没有错误，overflow 报出文字溢出', { skip }, async () => {
  const good = await selftest(browser, join(FIX, 'good'), { w: 1920, h: 1080 });
  assert.equal(good.issues.filter(i => i.level === 'error').length, 0, JSON.stringify(good.issues, null, 2));
  assert.equal(good.viewport.w, 1920);
  const bad = await selftest(browser, join(FIX, 'overflow'), { w: 1440, h: 900 });
  assert.ok(bad.issues.some(i => i.type === 'text-overflow'), JSON.stringify(bad.issues, null, 2));
});

/* ---------- check --browser 的流程：用假的浏览器和自检结果，不真的开浏览器 ---------- */

// 把测试课件复制到临时目录，免得往仓库里写 .li-talk/
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const a = join(from, name), b = join(to, name);
    if (statSync(a).isDirectory()) copyDir(a, b); else copyFileSync(a, b);
  }
}
const tmpDeck = () => {
  const dir = join(tmp('li-talk-check-'), '课件');
  copyDir(join(FIX, 'static-good'), dir);
  return dir;
};

const LIST = [
  { no: 1, id: 'p01', title: '封面', total: 1, scene: 'paper' },
  { no: 2, id: 'p02', title: '清单', total: 3, scene: 'paper' },
];
const OVER = { level: 'error', type: 'text-overflow', page: 2, id: 'p02', title: '清单', beat: 3,
  msg: '第 1 张卡片的文字超出卡片底边 20px（卡片高 200，内容高 220）', fix: '删减这块的文字，或去掉容器的固定宽高' };
const result = (w, h, issues = []) => ({
  engine: '0.1.0', viewport: { w, h, reading: w < h }, pages: 2, beats: 4, list: LIST, issues,
});
// 假的浏览器：bad(w, h) 为真的尺寸报一条文字溢出，fail(w, h) 为真的尺寸读不到结果；记下每次调用
function fakes({ bad = () => false, fail = () => false } = {}) {
  const calls = { selftest: [], shots: [], opened: 0, closed: 0 };
  const logs = [];
  return {
    calls, logs,
    opts: {
      log: s => logs.push(s),
      findBrowser: () => 'fake-browser',
      openBrowser: async () => {
        calls.opened++;
        return {
          selftest: async (dir, o) => {
            calls.selftest.push(o);
            if (fail(o.w, o.h)) { const e = new Error(`${o.w}×${o.h} 没读到自检结果：课件没跑完`); e.userMessage = e.message; throw e; }
            return result(o.w, o.h, bad(o.w, o.h) ? [OVER] : []);
          },
          screenshot: async (dir, file, o) => { calls.shots.push({ file, ...o }); },
          close: async () => { calls.closed++; },
        };
      },
    },
  };
}

test('check --browser：依次跑 5 个尺寸，打印报告，记下自检结果', async () => {
  const dir = tmpDeck();
  const f = fakes({ bad: (w) => w === 1440 || w === 1280 });
  const code = await check({ _: [dir], browser: true }, f.opts);
  assert.equal(code, 1);
  assert.deepEqual(f.calls.selftest.map(o => `${o.w}x${o.h}`), ['1920x1080', '1440x900', '1280x720', '1024x768', '390x844']);
  assert.deepEqual(SIZES, [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [390, 844]]);
  const out = f.logs.join('\n');
  assert.match(out, /^检查：3 页，0 个错误/);
  assert.match(out, /正在用 1920×1080 自检（1\/5）/);
  assert.match(out, /自检报告：2 页 4 拍 × 5 个尺寸，1 个错误、0 个提醒/);
  assert.match(out, /第 2 页 p02「清单」第 3 拍｜1440×900、1280×720/);
  assert.equal(f.calls.opened, 1, '5 个尺寸共用一个浏览器');
  assert.equal(f.calls.closed, 1);
  const saved = JSON.parse(readFileSync(join(dir, '.li-talk', 'selftest.json'), 'utf8'));
  assert.deepEqual(saved.sizes, ['1920x1080', '1440x900', '1280x720', '1024x768', '390x844']);
  assert.equal(saved.errors, 1);
  assert.equal(saved.warnings, 0);
  assert.equal(typeof saved.slidesMtime, 'number');
  assert.ok(!Number.isNaN(Date.parse(saved.at)));
});

test('check --browser 没问题时退出码 0；--shots 给每页最后一拍截图', async () => {
  const dir = tmpDeck();
  const f = fakes();
  const code = await check({ _: [dir], browser: true, shots: true }, f.opts);
  assert.equal(code, 0, f.logs.join('\n'));
  assert.match(f.logs.join('\n'), /没有发现问题/);
  assert.deepEqual(f.calls.shots.map(s => [s.page, s.beat, s.w, s.h]), [[1, 1, 1920, 1080], [2, 3, 1920, 1080]]);
  assert.deepEqual(f.calls.shots.map(s => s.file), [join(dir, '.li-talk', 'shots', 'p01.png'), join(dir, '.li-talk', 'shots', 'p02.png')]);
  assert.match(f.logs.join('\n'), /截图存在：.*shots/);
});

test('check --browser --pages：把页码范围传给自检，不覆盖整份课件的自检记录', async () => {
  const dir = tmpDeck();
  const f = fakes();
  await check({ _: [dir], browser: true, pages: '2-3' }, f.opts);
  assert.ok(f.calls.selftest.every(o => o.pages === '2-3'));
  assert.ok(!existsSync(join(dir, '.li-talk', 'selftest.json')));
  assert.match(f.logs.join('\n'), /只查了部分页面/);
});

test('check --browser 找不到浏览器：退出码 2，说明怎么办', async () => {
  const f = fakes();
  f.opts.findBrowser = () => null;
  await assert.rejects(() => check({ _: [tmpDeck()], browser: true }, f.opts),
    e => e.exitCode === 2 && /没找到 Edge 或 Chrome/.test(e.userMessage) && /LI_TALK_BROWSER/.test(e.userMessage));
});

test('check --browser 第一个尺寸就读不到结果：直接停下说明原因；后面的尺寸读不到记成错误', async () => {
  let f = fakes({ fail: () => true });
  await assert.rejects(() => check({ _: [tmpDeck()], browser: true }, f.opts), e => /没读到自检结果/.test(e.userMessage));
  assert.equal(f.calls.selftest.length, 1);
  assert.equal(f.calls.closed, 1, '出错时也要关掉浏览器');
  f = fakes({ fail: (w) => w === 1024 });
  const code = await check({ _: [tmpDeck()], browser: true }, f.opts);
  assert.equal(code, 1);
  assert.match(f.logs.join('\n'), /整份课件｜1024×768\n\s+没读到自检结果：课件没跑完/);
});

test('--pages 写错时在开浏览器之前就报出来', async () => {
  const f = fakes();
  await assert.rejects(() => check({ _: [tmpDeck()], browser: true, pages: '三到五' }, f.opts), e => /--pages/.test(e.userMessage));
  assert.equal(f.calls.opened, 0);
});
