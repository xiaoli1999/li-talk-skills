// new、open、confirm：按选中的风格搭骨架、记下确认过的环节、打开课件
// 字体一律用假的清单和假的下载函数，不联网，也不碰本机的字体缓存
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { createDeck, resolveScenes, run as runNew } from '../skills/li-talk-skills/scripts/lib/new.mjs';
import { confirmStep, readMeta, writeMeta, run as runConfirm } from '../skills/li-talk-skills/scripts/lib/meta.mjs';
import { openCommand, run as runOpen } from '../skills/li-talk-skills/scripts/lib/open.mjs';
import { readDeck, collectPages, htmlTags, localRef, blankHtmlComments } from '../skills/li-talk-skills/scripts/lib/deck.mjs';
import { checkStatic } from '../skills/li-talk-skills/scripts/lib/check-static.mjs';
import { sha256 } from '../skills/li-talk-skills/scripts/lib/fonts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-new-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });
const quiet = () => {};

// 一块假字体；缓存目录是空的、下载一律失败 → 用自带的小字库
const BLOCK = Buffer.from('假字体块');
const fakeManifest = {
  package: 'fake-font', version: '0.0.1', family: 'WK',
  mirrors: ['https://m1.test/', 'https://m2.test/', 'https://m3.test/'],
  files: [{ path: 'files/x-400.woff2', weight: 400, range: 'U+4e00-4e2f', sha256: sha256(BLOCK), size: BLOCK.length }],
};
const offline = () => ({
  log: quiet,
  fonts: { manifest: fakeManifest, dir: join(tmp(), 'cache'), fetch: async () => { throw new Error('测试里不联网'); } },
});

// index.html 里引入的本地文件（注释里的不算）
const indexRefs = html => htmlTags(blankHtmlComments(html))
  .map(t => (t.name === 'script' ? t.attrs.src : t.name === 'link' ? t.attrs.href : null))
  .map(localRef).filter(Boolean);

// 用 paper：它在任务 3 就有了；watercolor、dark 由任务 12、13 并行在做
test('只带选中的风格和它的形象', async () => {
  const dir = join(tmp(), '我的分享');
  const r = await createDeck(dir, { title: '我的分享', scenes: ['paper'] }, offline());
  assert.equal(r.font, 'lite');
  assert.deepEqual(r.scenes, ['paper']);
  assert.equal(r.mascot, 'duoduo');
  for (const f of ['index.html', 'engine/core.js', 'engine/engine.css', 'scenes/paper.js', 'scenes/paper.css',
    'mascots/duoduo.js', 'slides/ch1.js', 'slides/ch1.css', 'vendor/gsap.min.js', 'vendor/rough.min.js',
    'vendor/LICENSE-gsap.txt', 'vendor/LICENSE-roughjs.txt',
    'vendor/fonts/wenkai-lite.css', 'vendor/fonts/wenkai-lite-regular.woff2', 'vendor/fonts/OFL-LXGW-WenKai.txt',
    '.li-talk.json', '素材']) {
    assert.ok(existsSync(join(dir, f)), '缺少 ' + f);
  }
  assert.ok(!existsSync(join(dir, 'scenes', 'board.js')), '不该带没选的风格');
  assert.ok(!existsSync(join(dir, 'mascots', 'weiguang.js')), '不该带没用到的形象');
  assert.ok(!existsSync(join(dir, 'slides', '.gitkeep')), '不该带占位文件');
  // 引擎目录整个复制（自检模块 selftest.js 做好以后也会跟着过来）
  const engineFiles = readdirSync(join(TPL, 'engine')).filter(f => f !== '.gitkeep').sort();
  assert.deepEqual(readdirSync(join(dir, 'engine')).sort(), engineFiles);

  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.match(html, /<title>我的分享<\/title>/);
  assert.match(html, /scenes\/paper\.js/);
  assert.match(html, /scenes\/paper\.css/);
  assert.match(html, /mascots\/duoduo\.js/);
  assert.match(html, /name="li-talk-mascot" content="duoduo"/);
  assert.match(html, /name="li-talk-engine" content="0\.1\.0"/);
  assert.match(html, /href="vendor\/fonts\/wenkai-lite\.css"/);
  assert.doesNotMatch(html, /\{\{/);
  // 章节区的两对注释原样保留，读课件靠它们
  assert.match(html, /<!-- 章节样式（开始） -->\s*<link rel="stylesheet" href="slides\/ch1\.css">\s*<!-- 章节样式（结束） -->/);
  assert.match(html, /<!-- 章节（开始）[^>]*-->\s*<script src="slides\/ch1\.js"><\/script>\s*<!-- 章节（结束） -->/);
  // 引入的每个文件都在
  for (const f of indexRefs(html)) assert.ok(existsSync(join(dir, f)), 'index.html 引入了不存在的 ' + f);

  const meta = readMeta(dir);
  assert.equal(meta.tool, 'li-talk-skills');
  assert.equal(meta.title, '我的分享');
  assert.deepEqual(meta.scenes, ['paper']);
  assert.equal(meta.mascot, 'duoduo');
  assert.equal(meta.version, '0.1.0');
  assert.deepEqual(meta.confirmed, { outline: false, script: false, style: false, trial: false, review: false });
  assert.ok(!Number.isNaN(Date.parse(meta.created)));
});

test('起步章节：一页封面，标题和风格换好，静态检查没有错误', async () => {
  const dir = join(tmp(), 'deck');
  await createDeck(dir, { title: '试一下', scenes: ['paper'] }, offline());
  const js = readFileSync(join(dir, 'slides', 'ch1.js'), 'utf8');
  assert.doesNotMatch(js, /\{\{/);
  assert.match(js, /references\/templates\.md/);
  const deck = readDeck(dir);
  assert.deepEqual(deck.chapterJs, ['slides/ch1.js']);
  assert.deepEqual(deck.chapterCss, ['slides/ch1.css']);
  const { pages, failures } = collectPages(deck);
  assert.deepEqual(failures, []);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].def.id, 'p01');
  assert.equal(pages[0].def.scene, 'paper');
  assert.equal(pages[0].def.title, '试一下');
  assert.match(pages[0].def.html, /试一下/);
  const st = await checkStatic(dir);
  assert.equal(st.errors, 0, st.text);
  assert.equal(st.warnings, 0, st.text);
});

test('标题里有引号、尖括号、反斜杠等字符也不会弄坏页面和入口', async () => {
  const dir = join(tmp(), 'deck');
  const title = `Q&A：'引号' "双引号" <b> \`反引号\` \${x} 反斜杠\\`;
  await createDeck(dir, { title, scenes: ['paper'] }, offline());
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.ok(html.includes('<title>Q&amp;A：&#39;引号&#39; &quot;双引号&quot; &lt;b&gt;'), html.slice(0, 600));
  const { pages, failures } = collectPages(readDeck(dir));
  assert.deepEqual(failures, []);
  assert.equal(pages[0].def.title, title);
  assert.ok(pages[0].def.html.includes('Q&amp;A：&#39;引号&#39; &quot;双引号&quot; &lt;b&gt; `反引号` ${x} 反斜杠\\'));
  assert.equal(readMeta(dir).title, title);
});

test('目录里已经有讲稿和素材时可以搭，已经有引擎时拒绝', async () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), '# 讲稿');
  mkdirSync(join(dir, '素材'));
  writeFileSync(join(dir, '素材', 'a.png'), 'x');
  await createDeck(dir, { title: 't', scenes: ['paper'] }, offline());
  assert.equal(readFileSync(join(dir, '讲稿.md'), 'utf8'), '# 讲稿');
  assert.ok(existsSync(join(dir, '素材', 'a.png')));
  await assert.rejects(() => createDeck(dir, { title: 't', scenes: ['paper'] }, offline()), /已经搭过骨架/);
});

test('目录里有别的文件时拒绝，并且什么都不留下', async () => {
  const dir = tmp();
  writeFileSync(join(dir, '提纲.docx'), 'x');
  await assert.rejects(() => createDeck(dir, { title: 't', scenes: ['paper'] }, offline()), /提纲\.docx/);
  assert.deepEqual(readdirSync(dir), ['提纲.docx']);
});

test('不认识的风格报错并列出可选的', async () => {
  await assert.rejects(() => createDeck(join(tmp(), 'x'), { title: 't', scenes: ['nope'] }, offline()), /不认识的风格「nope」.*paper/s);
});

test('风格在说明里有、文件还没做好时报「还没做好」', () => {
  const tpl = tmp();
  mkdirSync(join(tpl, 'scenes'));
  writeFileSync(join(tpl, 'scenes', 'index.json'), JSON.stringify([
    { key: 'paper', label: '方格纸', family: 'hand', mascot: 'duoduo' },
    { key: 'later', label: '以后做', family: 'hand', mascot: 'duoduo' },
  ]));
  writeFileSync(join(tpl, 'scenes', 'paper.js'), '');
  assert.throws(() => resolveScenes(['later'], tpl), /以后做.*还没做好/s);
  assert.deepEqual(resolveScenes(['paper'], tpl).map(s => s.key), ['paper']);
});

test('风格可以写名字、用逗号隔开多种；形象默认取第一种风格的，也可以另选', async () => {
  const tpl = TPL;
  assert.deepEqual(resolveScenes('方格纸，board', tpl).map(s => s.key), ['paper', 'board']);
  const dir = join(tmp(), 'deck');
  const r = await createDeck(dir, { title: 't', scenes: 'board,paper', mascot: 'weiguang' }, offline());
  assert.deepEqual(r.scenes, ['board', 'paper']);
  assert.equal(r.mascot, 'weiguang');
  for (const f of ['scenes/board.js', 'scenes/board.css', 'scenes/paper.js', 'mascots/weiguang.js']) {
    assert.ok(existsSync(join(dir, f)), '缺少 ' + f);
  }
  assert.ok(!existsSync(join(dir, 'mascots', 'duoduo.js')));
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.ok(html.indexOf('scenes/board.js') < html.indexOf('scenes/paper.js'), '风格按选的顺序引入');
  assert.match(readFileSync(join(dir, 'slides', 'ch1.js'), 'utf8'), /scene: 'board'/);
  await assert.rejects(() => createDeck(join(tmp(), 'y'), { title: 't', scenes: ['paper'], mascot: 'nope' }, offline()), /不认识的形象「nope」.*duoduo/s);
});

test('dark 默认用微光', async () => {
  const dir = join(tmp(), 'deck');
  const r = await createDeck(dir, { title: 't', scenes: ['dark'] }, offline());
  assert.equal(r.mascot, 'weiguang');
  assert.ok(existsSync(join(dir, 'mascots', 'weiguang.js')));
});

test('没写风格和标题时，用 .li-talk.json 里确认过的风格、形象和标题', async () => {
  const dir = join(tmp(), '分享稿');
  mkdirSync(dir);
  writeMeta(dir, { title: '记下的标题' });
  confirmStep(dir, 'style', { scenes: ['paper'], mascot: 'weiguang' });
  const r = await createDeck(dir, {}, offline());
  assert.equal(r.title, '记下的标题');
  assert.deepEqual(r.scenes, ['paper']);
  assert.equal(r.mascot, 'weiguang');
  const meta = readMeta(dir);
  assert.equal(meta.confirmed.style, true, '搭骨架不清掉已确认的环节');
  // 什么都没记、也没写风格
  await assert.rejects(() => createDeck(join(tmp(), 'z'), { title: 't' }, offline()), /--scenes/);
});

test('本机有完整字体缓存时装完整字体，入口改用 wenkai.css', async () => {
  const cache = join(tmp(), 'cache');
  mkdirSync(cache);
  writeFileSync(join(cache, 'x-400.woff2'), BLOCK);
  const fetch = async () => { throw new Error('缓存完整时不该联网'); };
  const dir = join(tmp(), 'deck');
  const r = await createDeck(dir, { title: 't', scenes: ['paper'] }, { log: quiet, fonts: { manifest: fakeManifest, dir: cache, fetch } });
  assert.equal(r.font, 'full');
  assert.ok(existsSync(join(dir, 'vendor', 'fonts', 'wenkai', 'x-400.woff2')));
  assert.ok(!existsSync(join(dir, 'vendor', 'fonts', 'wenkai-lite.css')), '完整字体时不带小字库');
  assert.match(readFileSync(join(dir, 'index.html'), 'utf8'), /href="vendor\/fonts\/wenkai\.css"/);
});

test('new 命令：打印下一步；字体没下好时说明怎么补', async () => {
  const out = [];
  const dir = join(tmp(), 'deck');
  const code = await runNew({ _: [dir], title: '试一下', scenes: 'paper' }, { ...offline(), log: s => out.push(s) });
  assert.equal(code, 0);
  const text = out.join('\n');
  assert.match(text, /骨架搭好了/);
  assert.match(text, /references\/templates\.md/);
  assert.match(text, /check .* --browser/);
  assert.match(text, /小字库/);
  await assert.rejects(() => runNew({ _: [] }, offline()), /new 后面要写课件目录/);
});

test('confirm 记下已确认的环节', async () => {
  const dir = tmp();
  confirmStep(dir, 'outline');
  assert.equal(readMeta(dir).confirmed.outline, true);
  assert.equal(readMeta(dir).confirmed.script, false);
  assert.throws(() => confirmStep(dir, 'xyz'), /只能是 outline、script、style、trial、review/);
});

test('没有 .li-talk.json 时读到默认结构；写坏了时说明怎么办', () => {
  const dir = tmp();
  const m = readMeta(dir);
  assert.equal(m.tool, 'li-talk-skills');
  assert.deepEqual(m.scenes, []);
  assert.equal(m.mascot, null);
  assert.deepEqual(m.confirmed, { outline: false, script: false, style: false, trial: false, review: false });
  assert.ok(!existsSync(join(dir, '.li-talk.json')), '只读不写');
  writeFileSync(join(dir, '.li-talk.json'), '{ 坏了');
  assert.throws(() => readMeta(dir), /\.li-talk\.json/);
});

test('confirm 命令：确认风格时顺带记下风格和形象；提纲要先有讲稿', async () => {
  const dir = tmp();
  const out = [];
  const log = s => out.push(s);
  assert.equal(await runConfirm({ _: [dir, 'style'], scenes: 'paper' }, { log }), 0);
  let m = readMeta(dir);
  assert.equal(m.confirmed.style, true);
  assert.deepEqual(m.scenes, ['paper']);
  assert.equal(m.mascot, 'duoduo');
  assert.match(out.join('\n'), /方格纸/);

  await assert.rejects(() => runConfirm({ _: [dir, 'style'], scenes: 'nope' }, { log }), /不认识的风格「nope」/);
  await assert.rejects(() => runConfirm({ _: [dir, 'outline'] }, { log }), /讲稿\.md/);
  writeFileSync(join(dir, '讲稿.md'), '# 提纲');
  assert.equal(await runConfirm({ _: [dir, 'outline'] }, { log }), 0);
  assert.equal(readMeta(dir).confirmed.outline, true);
  await assert.rejects(() => runConfirm({ _: [dir, 'trial'] }, { log }), /还没搭骨架/);
  await assert.rejects(() => runConfirm({ _: [dir, 'outline'], scenes: 'paper' }, { log }), /只在确认 style 时/);
  await assert.rejects(() => runConfirm({ _: [dir] }, { log }), /confirm <课件目录>/);
  await assert.rejects(() => runConfirm({ _: [join(dir, '不存在'), 'outline'] }, { log }), /找不到目录/);
  m = readMeta(dir);
  assert.equal(m.confirmed.style, true, '之前确认的不受影响');
});

test('open：按系统选打开方式；没有 index.html 时说明', async () => {
  const f = 'D:\\我的 分享\\A&B\\index.html';
  const w = openCommand(f, 'win32');
  assert.equal(w.cmd, 'cmd');
  assert.equal(w.args.join(' '), `/d /s /c "start "" "${f}""`);
  assert.equal(w.options.windowsVerbatimArguments, true);
  assert.deepEqual(openCommand('/a/index.html', 'darwin'), { cmd: 'open', args: ['/a/index.html'], options: {} });
  assert.deepEqual(openCommand('/a/index.html', 'linux'), { cmd: 'xdg-open', args: ['/a/index.html'], options: {} });

  await assert.rejects(() => runOpen({ _: [tmp()] }, { log: quiet }), /没找到课件/);
  const dir = tmp();
  writeFileSync(join(dir, 'index.html'), '');
  const opened = [];
  const out = [];
  assert.equal(await runOpen({ _: [dir] }, { log: s => out.push(s), opener: async p => { opened.push(p); return true; } }), 0);
  assert.deepEqual(opened, [join(dir, 'index.html')]);
  assert.match(out.join('\n'), /已用浏览器打开/);
  assert.equal(await runOpen({ _: [dir] }, { log: s => out.push(s), opener: async () => false }), 2);
  assert.match(out.join('\n'), /手动/);
});

test('风格说明 index.json：13 种按家排好，字段齐全，和风格文件一致', () => {
  const list = JSON.parse(readFileSync(join(TPL, 'scenes', 'index.json'), 'utf8'));
  // 顺序按家：手绘家、现代家、像素家，同一家的排在一起
  assert.deepEqual(list.map(s => s.key), ['paper', 'board', 'journal', 'desk', 'watercolor', 'ink',
    'dark', 'frost', 'glass', 'flat', 'magazine', 'brutal', 'pixel']);
  assert.deepEqual(list.map(s => s.family), [...Array(6).fill('hand'), ...Array(6).fill('modern'), 'pixel']);
  for (const s of list) {
    for (const k of ['key', 'label', 'family', 'mascot', 'look', 'fit', 'notFit', 'risk']) {
      assert.ok(typeof s[k] === 'string' && s[k].trim(), `${s.key} 缺少 ${k}`);
    }
    const src = readFileSync(join(TPL, 'scenes', s.key + '.js'), 'utf8');
    const field = k => (new RegExp(`\\b${k}\\s*:\\s*'([^']*)'`).exec(src) || [])[1];
    assert.equal(s.label, field('label'), s.key + ' 的 label');
    assert.equal(s.family, field('family'), s.key + ' 的 family');
    assert.equal(s.mascot, field('mascot'), s.key + ' 的 mascot');
    assert.ok(existsSync(join(TPL, 'mascots', s.mascot + '.js')), s.key + ' 的形象文件');
  }
});

/* ------------------------------------------------------------------
   风格自带的字体：像素游戏的缝合像素字体放在 template/vendor/fonts/pixel/，
   只有选了 pixel 时 new 才把它复制进课件
   ------------------------------------------------------------------ */

test('模板里的像素字体：woff2 和许可证都在', () => {
  const dir = join(TPL, 'vendor', 'fonts', 'pixel');
  const woff = readFileSync(join(dir, 'fusion-pixel-12px-proportional-zh_hans.woff2'));
  assert.equal(woff.subarray(0, 4).toString('latin1'), 'wOF2', '不是 woff2 文件');
  assert.ok(woff.length > 500 * 1024, '完整简体字库应该有几百 KB');
  for (const f of ['OFL-Fusion-Pixel-Font.txt', 'OFL-Fusion-Pixel-Font-upstream-ark-pixel.txt',
    'OFL-Fusion-Pixel-Font-upstream-cubic-11.txt', 'OFL-Fusion-Pixel-Font-upstream-galmuri.txt']) {
    assert.ok(existsSync(join(dir, f)), '缺少许可证 ' + f);
  }
  // 风格 CSS 引用的就是这个文件（相对 scenes/ 的位置）
  const css = readFileSync(join(TPL, 'scenes', 'pixel.css'), 'utf8');
  const m = /url\("(\.\.\/vendor\/fonts\/pixel\/[^"]+\.woff2)"\)/.exec(css);
  assert.ok(m, 'pixel.css 里没找到像素字体的 @font-face');
  assert.ok(existsSync(join(TPL, 'scenes', m[1])), 'pixel.css 引用的字体文件不存在：' + m[1]);
});

test('选了像素游戏：带上像素字体和许可证，形象默认小旗；字体和模板里的一字不差', async () => {
  const tpl = TPL;
  const dir = join(tmp(), '像素课件');
  const out = [];
  const r = await createDeck(dir, { title: '闯关', scenes: ['pixel'] }, { ...offline(), log: s => out.push(s), tplDir: tpl });
  assert.deepEqual(r.scenes, ['pixel']);
  assert.equal(r.mascot, 'xiaoqi');
  assert.deepEqual(r.sceneFonts, ['pixel']);
  const src = join(tpl, 'vendor', 'fonts', 'pixel');
  const got = join(dir, 'vendor', 'fonts', 'pixel');
  assert.deepEqual(readdirSync(got).sort(), readdirSync(src).sort());
  for (const f of readdirSync(src)) assert.equal(sha256(readFileSync(join(got, f))), sha256(readFileSync(join(src, f))), f);
  // 霞鹜文楷照常装（引擎的提示条、阅读模式还用它）
  assert.ok(existsSync(join(dir, 'vendor', 'fonts', 'wenkai-lite.css')));
  // 风格 CSS 按相对位置找得到字体；index.html 引入的文件都在
  const css = readFileSync(join(dir, 'scenes', 'pixel.css'), 'utf8');
  const m = /url\("(\.\.\/vendor\/fonts\/pixel\/[^"]+\.woff2)"\)/.exec(css);
  assert.ok(m && existsSync(join(dir, 'scenes', m[1])), '课件里 pixel.css 引用的字体文件不存在');
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.match(html, /scenes\/pixel\.css/);
  assert.match(html, /mascots\/xiaoqi\.js/);
  for (const f of indexRefs(html)) assert.ok(existsSync(join(dir, f)), 'index.html 引入了不存在的 ' + f);
});

test('没选像素游戏：不带像素字体', async () => {
  const dir = join(tmp(), 'deck');
  const r = await createDeck(dir, { title: 't', scenes: ['paper'] }, offline());
  assert.deepEqual(r.sceneFonts, []);
  assert.ok(!existsSync(join(dir, 'vendor', 'fonts', 'pixel')), '没选 pixel 不该带像素字体');
});

test('new 命令：选了像素游戏时说一声带了它的字体', async () => {
  const tpl = TPL;
  const out = [];
  const code = await runNew({ _: [join(tmp(), 'px')], title: '闯关', scenes: 'pixel' }, { ...offline(), log: s => out.push(s), tplDir: tpl });
  assert.equal(code, 0);
  assert.match(out.join('\n'), /风格自带的字体：像素游戏（vendor\/fonts\/pixel\/）/);
});
