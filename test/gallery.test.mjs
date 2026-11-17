// 模板目录的样册和样板页：check 读模板目录时改用 gallery.html（静态检查、浏览器自检、截图都一样），
// 样板页在 15 种风格下自检没有错误
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { deckEntry, readDeck } from '../skills/li-talk-skills/scripts/lib/deck.mjs';
import { checkStatic } from '../skills/li-talk-skills/scripts/lib/check-static.mjs';
import { deckUrl, openBrowser } from '../skills/li-talk-skills/scripts/lib/selftest-run.mjs';
import { findBrowser } from '../skills/li-talk-skills/scripts/lib/browser.mjs';
import { run as check } from '../skills/li-talk-skills/scripts/lib/check.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');
// 样册引入的全部风格，按家排：手绘家、现代家、像素家（和 scenes/index.json 一致）
const SCENES = ['paper', 'board', 'journal', 'desk', 'watercolor', 'ink', 'blueprint', 'comic',
  'dark', 'frost', 'glass', 'flat', 'magazine', 'brutal', 'pixel'];

const TMP = [];
const tmp = prefix => { const d = mkdtempSync(join(tmpdir(), prefix)); TMP.push(d); return d; };
process.on('exit', () => { for (const d of TMP) { try { rmSync(d, { recursive: true, force: true }); } catch { /* 删不掉不要紧 */ } } });

// 一个像模板目录的小目录：index.html 带占位符，gallery.html 引入一个章节
function fakeTemplate({ placeholder = true, gallery = true } = {}) {
  const dir = tmp('li-talk-tpl-');
  writeFileSync(join(dir, 'index.html'), placeholder
    ? '<!doctype html><title>{{TITLE}}</title><!-- 章节（开始） --><script src="slides/ch1.js"></script><!-- 章节（结束） -->'
    : '<!doctype html><title>课件</title><!-- 章节（开始） --><script src="slides/ch1.js"></script><!-- 章节（结束） -->');
  if (gallery) {
    writeFileSync(join(dir, 'gallery.html'),
      '<!doctype html><title>样册</title><!-- 章节（开始） --><script src="samples/s.js"></script><!-- 章节（结束） -->');
    mkdirSync(join(dir, 'samples'));
    writeFileSync(join(dir, 'samples', 's.js'),
      "Deck.add({ id: 't-a', title: '封面', scene: 'plain', html: '<p data-beat=\"1\">a</p>', notes: [{ beat: 0, say: '开场' }, { beat: 1, say: '一' }] });\n");
  }
  mkdirSync(join(dir, 'slides'));
  writeFileSync(join(dir, 'slides', 'ch1.js'), "Deck.add({ id: 'p01', title: '{{TITLE}}', scene: 'plain', html: '' });\n");
  return dir;
}

test('入口文件：index.html 带 {{ 占位符且有 gallery.html 时用样册，否则用 index.html', () => {
  assert.equal(deckEntry(fakeTemplate()), 'gallery.html');
  assert.equal(deckEntry(fakeTemplate({ gallery: false })), 'index.html');
  assert.equal(deckEntry(fakeTemplate({ placeholder: false })), 'index.html');
  assert.equal(deckEntry(join(tmpdir(), 'li-talk-no-such-dir')), 'index.html');
});

test('readDeck 读模板目录：读样册里两对「章节」注释之间引入的样板页', () => {
  const d = readDeck(fakeTemplate());
  assert.equal(d.entry, 'gallery.html');
  assert.deepEqual(d.chapterJs, ['samples/s.js']);
  const real = readDeck(TPL);
  assert.equal(real.entry, 'gallery.html');
  assert.deepEqual(real.chapterJs, ['samples/samples.js']);
  assert.deepEqual(real.chapterCss, ['samples/samples.css']);
  assert.deepEqual(Object.keys(real.scenes).sort(), [...SCENES].sort());
});

test('课件地址可以换入口文件，默认还是 index.html', () => {
  const dir = join(tmpdir(), '模板 目录');
  assert.match(deckUrl(dir, '?selftest=1&scene=dark', '', 'gallery.html'), /\/gallery\.html\?selftest=1&scene=dark$/);
  assert.match(deckUrl(dir, '', '#2/3', 'gallery.html'), /\/gallery\.html#2\/3$/);
  assert.match(deckUrl(dir, '?selftest=1'), /\/index\.html\?selftest=1$/);
});

test('不开浏览器的检查：模板目录查的是样板页，4 页，没有错误和提醒', async () => {
  const st = await checkStatic(TPL);
  assert.equal(st.pages, 4, st.text);
  assert.equal(st.errors, 0, st.text);
  assert.equal(st.warnings, 0, st.text);
});

test('check --browser 对模板目录：自检和截图都打开 gallery.html，不在模板里写自检记录', async () => {
  const dir = fakeTemplate();
  const calls = { selftest: [], shots: [] };
  const logs = [];
  const result = (w, h) => ({ engine: '0.1.0', viewport: { w, h, reading: w < h }, pages: 1, beats: 1,
    list: [{ no: 1, id: 't-a', title: '封面', total: 1, scene: 'plain' }], issues: [] });
  const code = await check({ _: [dir], browser: true, shots: true }, {
    log: s => logs.push(s),
    findBrowser: () => 'fake-browser',
    openBrowser: async () => ({
      selftest: async (d, o) => { calls.selftest.push(o); return result(o.w, o.h); },
      screenshot: async (d, file, o) => { calls.shots.push(o); },
      close: async () => {},
    }),
  });
  assert.equal(code, 0, logs.join('\n'));
  assert.equal(calls.selftest.length, 5);
  assert.ok(calls.selftest.every(o => o.entry === 'gallery.html'), JSON.stringify(calls.selftest));
  assert.deepEqual(calls.shots.map(o => o.entry), ['gallery.html']);
  const out = logs.join('\n');
  assert.match(out, /模板目录.*gallery\.html/);
  assert.match(out, /检查：1 页，0 个错误/);   // 静态检查也查的是样册里的页，不是 index.html 里的
  assert.ok(!existsSync(join(dir, '.li-talk', 'selftest.json')), '模板目录不写自检记录');
});

test('check --browser 对普通课件：入口还是 index.html', async () => {
  const dir = fakeTemplate({ placeholder: false });
  const seen = [];
  await check({ _: [dir], browser: true }, {
    log: () => {},
    findBrowser: () => 'fake-browser',
    openBrowser: async () => ({
      selftest: async (d, o) => { seen.push(o.entry); return { engine: '0.1.0', viewport: { w: o.w, h: o.h }, pages: 1, beats: 0, list: [], issues: [] }; },
      screenshot: async () => {},
      close: async () => {},
    }),
  });
  assert.deepEqual(seen, Array(5).fill('index.html'));
  assert.ok(existsSync(join(dir, '.li-talk', 'selftest.json')));
});

test('templates.md 里贴的代码和 samples.js、samples.css 一字不差', () => {
  const doc = readFileSync(join(ROOT, 'skills', 'li-talk-skills', 'references', 'templates.md'), 'utf8').replace(/\r\n/g, '\n');
  const js = readFileSync(join(TPL, 'samples', 'samples.js'), 'utf8').replace(/\r\n/g, '\n');
  const css = readFileSync(join(TPL, 'samples', 'samples.css'), 'utf8').replace(/\r\n/g, '\n');
  const blocks = js.match(/^Deck\.add\(\{[\s\S]*?^\}\);$/gm) || [];
  assert.equal(blocks.length, 4);
  for (const b of blocks) {
    const id = /id: '([^']+)'/.exec(b)[1];
    assert.ok(doc.includes('```js\n' + b + '\n```'), `templates.md 里 ${id} 的代码和 samples.js 不一样，从 samples.js 重新复制`);
  }
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(s => s.trim()).filter(Boolean);
  assert.ok(rules.length >= 1);
  for (const r of rules) assert.ok(doc.includes(r), `templates.md 里少了 samples.css 的这条规则：${r}`);
});

// 样册里风格总览用的风格说明（gallery.html 里内联的 window.LI_TALK_STYLES）：样册双击打开时不能 fetch，
// 所以抄了一份；和 scenes/index.json 的 key、label、family、mascot、look、fit 必须一字不差、顺序一致
test('样册内联的风格说明和 scenes/index.json 一致', () => {
  const html = readFileSync(join(TPL, 'gallery.html'), 'utf8');
  const m = /window\.LI_TALK_STYLES = (\[[\s\S]*?\]);/.exec(html);
  assert.ok(m, 'gallery.html 里没找到 window.LI_TALK_STYLES = [...];');
  const inline = JSON.parse(m[1]);
  const want = JSON.parse(readFileSync(join(TPL, 'scenes', 'index.json'), 'utf8'))
    .map(s => ({ key: s.key, label: s.label, family: s.family, mascot: s.mascot, look: s.look, fit: s.fit }));
  assert.deepEqual(inline, want, '和 index.json 对不上，把 gallery.html 里的数组换成：\n' + want.map(s => '  ' + JSON.stringify(s)).join(',\n'));
});

test('样册：风格总览只在不带 ?scene=、?selftest、#页/拍 时显示；卡片链接不带 #，切换条换风格也不带 #', () => {
  const html = readFileSync(join(TPL, 'gallery.html'), 'utf8');
  assert.match(html, /if \(qs\.has\('selftest'\)[^\n]*return;/);
  assert.match(html, /if \(!qs\.has\('scene'\) && !location\.hash\) \{ showHome\(\); return; \}/);
  assert.match(html, /a\.href = '\?scene=' \+ encodeURIComponent\(s\.key\);/);
  assert.match(html, /location\.href = '\?scene=' \+ encodeURIComponent\(k\);/);
  assert.doesNotMatch(html, /encodeURIComponent\(k\) \+ location\.hash/, '换风格要回到第一页，不能带上 #页/拍');
  assert.match(html, /全部风格/);
});

// 真实浏览器：样板页在 15 种风格下（1920×1080）都没有错误、没有提醒。完整的 5 个尺寸用
// node skills/li-talk-skills/scripts/li-talk.mjs check skills/li-talk-skills/template --browser --scene <键名>
const browser = findBrowser();
test('真实浏览器：样板页在 15 种风格下自检清零', { skip: !browser && '本机没找到 Edge / Chrome' }, async () => {
  const b = await openBrowser(browser);
  try {
    for (const scene of SCENES) {
      const r = await b.selftest(TPL, { w: 1920, h: 1080, scene, entry: 'gallery.html' });
      assert.equal(r.pages, 4, scene);
      assert.ok(r.list.every(p => p.scene === scene), `${scene}：${JSON.stringify(r.list)}`);
      assert.deepEqual(r.issues, [], `${scene}：${JSON.stringify(r.issues, null, 2)}`);
    }
  } finally { await b.close(); }
});

// 真实浏览器：直接打开是风格总览（15 张卡片按三家分组、每张有形象，地址不被写上 #）；
// 带 ?scene=、#页/拍、?selftest 时都不显示总览（check 截图走 #页/拍，自检走 ?selftest&scene=）
test('真实浏览器：样册的风格总览和换风格的小条', { skip: !browser && '本机没找到 Edge / Chrome' }, async () => {
  const b = await openBrowser(browser);
  const probe = `(function () {
    var home = document.querySelector('.sv-home');
    return {
      home: !!home && getComputedStyle(home).display !== 'none',
      fams: [].map.call(document.querySelectorAll('.sv-fam'), function (f) {
        return [f.querySelector('h2').firstChild.textContent, [].map.call(f.querySelectorAll('.sv-card'), function (c) { return c.dataset.scene; })];
      }),
      art: document.querySelectorAll('.sv-card .sv-mini-art svg').length,
      hrefs: [].map.call(document.querySelectorAll('.sv-card'), function (c) { return c.getAttribute('href'); }),
      hash: location.hash,
      bar: !!document.querySelector('.gl-bar'),
      all: !!document.querySelector('.gl-bar .gl-all'),
      errors: window.__deckErrors || []
    };
  })()`;
  try {
    const home = await b.peek(TPL, { entry: 'gallery.html', expression: probe });
    assert.equal(home.home, true, '直接打开样册要显示风格总览');
    assert.deepEqual(home.fams, [['手绘家', SCENES.slice(0, 8)], ['现代家', SCENES.slice(8, 14)], ['像素家', ['pixel']]]);
    assert.equal(home.art, 15, '每张卡片都画出形象');
    assert.deepEqual(home.hrefs, SCENES.map(k => '?scene=' + k));
    assert.equal(home.hash, '', '总览开着时引擎不往地址里写 #页/拍');
    assert.equal(home.bar, false, '总览上不放换风格的小条');
    assert.deepEqual(home.errors, []);

    const scene = await b.peek(TPL, { entry: 'gallery.html', query: '?scene=paper', expression: probe });
    assert.equal(scene.home, false, '带 ?scene= 时不显示总览');
    assert.equal(scene.bar, true);
    assert.equal(scene.all, true, '小条上有「全部风格」');

    const shot = await b.peek(TPL, { entry: 'gallery.html', hash: '#2/1', expression: probe });
    assert.equal(shot.home, false, '带 #页/拍 时不显示总览（check 截图就是这样打开的）');

    const st = await b.peek(TPL, { entry: 'gallery.html', query: '?selftest=1&scene=dark', expression: probe });
    assert.equal(st.home, false, '自检模式不显示总览');
    assert.equal(st.bar, false, '自检模式不放小条');
  } finally { await b.close(); }
});
