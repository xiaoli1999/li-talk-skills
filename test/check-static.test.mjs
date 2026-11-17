// 不开浏览器的检查：读课件结构、在假环境里跑章节、逐条报问题
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { checkStatic } from '../skills/li-talk-skills/scripts/lib/check-static.mjs';
import { readDeck, collectPages } from '../skills/li-talk-skills/scripts/lib/deck.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'decks');

test('干净的课件没有错误', async () => {
  const r = await checkStatic(join(FIX, 'static-good'));
  assert.equal(r.errors, 0, r.text);
  assert.match(r.text, /^检查：3 页，0 个错误/);
});

test('有问题的课件逐条报出来', async () => {
  const r = await checkStatic(join(FIX, 'static-bad'));
  const t = r.text;
  assert.match(t, /id「p1」和第 \d 页重复/);
  assert.match(t, /没写 title/);
  assert.match(t, /风格「nope」没有引入/);
  assert.match(t, /找不到文件 img\/none\.png/);
  assert.match(t, /带拍的元素上写了 transform/);
  assert.match(t, /讲词写到第 3 拍，页面有 2 拍/);
  assert.match(t, /用了 fetch\(，课件里不能用/);
  assert.match(t, /选择器「\.card」没以 \[data-id="…"\] 开头/);
  assert.match(t, /slides\/orphan\.js 没有在 index\.html 里引入/);
  assert.ok(r.errors >= 7);
});

test('干净的课件也没有提醒，「看着像」的写法不误报', async () => {
  const r = await checkStatic(join(FIX, 'static-good'));
  assert.equal(r.warnings, 0, r.text);
  assert.equal(r.pages, 3);
  assert.match(r.text, /^检查：3 页，0 个错误、0 个提醒\n\n信息\n  讲词共 \d+ 字，按每分钟 220–250 字估/);
});

test('表格里其余的规则、页码、行号和「怎么改」', async () => {
  const r = await checkStatic(join(FIX, 'static-bad'));
  const t = r.text;
  assert.equal(r.pages, 6, t);
  assert.match(t, /^检查：6 页，\d+ 个错误、\d+ 个提醒\n\n错误\n {2}\S/);
  assert.match(t, /\n提醒\n {2}\S/);
  assert.match(t, /\n信息\n {2}讲词共 \d+ 字/);
  // 每条后面跟一行「怎么改」
  assert.match(t, / {2}第 2 页：id「p1」和第 1 页重复\n {4}→ 改成全稿唯一的 id/);
  assert.match(t, /第 3 页 p3：没写 title\n {4}→ 加上标题，演讲者视图和阅读模式要用/);
  assert.match(t, /第 3 页 p3：风格「nope」没有引入\n {4}→ 换成已引入的风格：paper（方格纸）、dark（科技暗黑）/);
  assert.match(t, /第 4 页 p4：找不到文件 img\/none\.png\n {4}→ 检查文件名，文件要放在课件目录里/);
  assert.match(t, /第 2 页 p1：带拍的元素上写了 transform\n {4}→ 位置用 left \/ top，倾斜用 --r/);
  assert.match(t, /第 2 页 p1：讲词写到第 3 拍，页面有 2 拍\n {4}→ 让讲词和节拍一一对应/);
  assert.match(t, /第 5 页 p5：没写主题行 topic\n {4}→ 加上「本页主题」/);
  assert.match(t, /第 5 页 p5：有 5 拍，建议 2 到 4 拍\n {4}→ 拆页或合并节拍/);
  // 提醒只写实际套用的那条规则，不把两种范围混在一句里
  assert.doesNotMatch(t, /封面结尾/);
  assert.match(t, /风格混用了不同的家：方格纸（手绘家）和 科技暗黑（现代家）\n {4}→ 同一份课件里只用同一家的风格/);
  // 第一页、最后一页不要求主题行
  assert.doesNotMatch(t, /第 1 页 p1：没写主题行/);
  assert.doesNotMatch(t, /第 6 页 p6：没写主题行/);
  // 章节运行出错、文件不存在、没引入
  assert.match(t, /slides\/broken\.js 运行出错，这一章没查到：ReferenceError: makeParts is not defined（第 2 行）\n {4}→ 按错误信息改/);
  assert.match(t, /index\.html 引入了 slides\/gone\.js，但文件不存在\n {4}→ 建这个文件，或删掉这行引入/);
  assert.match(t, /index\.html 引入了 slides\/gone\.css，但文件不存在/);
  assert.match(t, /slides\/orphan\.js 没有在 index\.html 里引入，里面的页面不会显示\n {4}→ 在 index\.html 的章节区加一行引入/);
  assert.doesNotMatch(t, /commented/);
  // CSS：行号、逗号分开的每一段、@media 里面的；@keyframes 跳过
  assert.match(t, /slides\/a\.css 第 2 行：选择器「\.card」没以 \[data-id="…"\] 开头\n {4}→ 在选择器前面加上 \[data-id="页面id"\]/);
  assert.match(t, /slides\/a\.css 第 4 行：选择器「\.loose」/);
  assert.match(t, /slides\/a\.css 第 6 行：选择器「\.in-media」/);
  assert.doesNotMatch(t, /选择器「(from|to|spin)/);
  assert.doesNotMatch(t, /选择器「\[data-id="p4"\]/);
  // [data-id] 只在 :not() 里、:is() 里有一项没限定、不在第一个复合选择器里：都不算限定
  assert.match(t, /slides\/a\.css 第 10 行：选择器「\.x:not\(\[data-id="p1"\]\)」/);
  assert.match(t, /slides\/a\.css 第 11 行：选择器「:is\(\[data-id="p1"\], \.other\) \.y」/);
  assert.match(t, /slides\/a\.css 第 12 行：选择器「\.z \[data-id="p1"\]」/);
  // 技术边界：行号；注释掉的不算
  assert.match(t, /slides\/a\.js 第 \d+ 行：用了 fetch\(，课件里不能用\n {4}→ 见 references\/authoring\.md 的「技术边界」一节：只用普通 script 标签和本地文件/);
  assert.match(t, /index\.html 第 8 行：用了 外部地址 https:\/\/fonts\.example\.com\/wenkai\.css，课件里不能用/);
  assert.match(t, /slides\/a\.css 第 9 行：用了 外部地址 https:\/\/example\.com\/bg\.png，课件里不能用/);
  assert.doesNotMatch(t, /cdn\.example\.com/);
  // 开头的计数和「错误」下面的条数一致（每条都带一行「怎么改」）
  assert.equal(r.errors, t.match(/\n错误\n([\s\S]*?)\n(提醒|信息)\n/)[1].match(/\n {4}→ /g).length);
});

test('readDeck 读出引入了什么、slides 里有什么', () => {
  const d = readDeck(join(FIX, 'static-bad'));
  assert.equal(d.dir, join(FIX, 'static-bad'));
  assert.match(d.indexHtml, /<title>有问题的课件<\/title>/);
  assert.deepEqual(d.chapterJs, ['slides/a.js', 'slides/broken.js', 'slides/gone.js']);
  assert.deepEqual(d.chapterCss, ['slides/a.css', 'slides/gone.css']);
  assert.deepEqual(d.sceneFiles, ['scenes/paper.js', 'scenes/dark.js']);
  assert.deepEqual(d.scenes, { paper: { label: '方格纸', family: 'hand' }, dark: { label: '科技暗黑', family: 'modern' } });
  assert.deepEqual(d.slidesOnDisk, ['slides/a.js', 'slides/broken.js', 'slides/orphan.js']);
  assert.equal(typeof d.slidesMtime, 'number');
  assert.ok(d.slidesMtime > 0);
});

test('collectPages 只收集 Deck.add 的参数，出错的章单独列出', () => {
  const { pages, failures } = collectPages(readDeck(join(FIX, 'static-bad')));
  assert.deepEqual(pages.map(p => p.def.id), ['p1', 'p1', 'p3', 'p4', 'p5', 'p6']);
  assert.deepEqual(pages.map(p => p.no), [1, 2, 3, 4, 5, 6]);
  assert.equal(pages[0].file, 'slides/a.js');
  assert.deepEqual(failures.map(f => f.file), ['slides/broken.js']);
  assert.equal(failures[0].line, 2);
});

// 临时课件：一个 index.html 加若干章
function tempDeck(chapters) {
  const dir = mkdtempSync(join(tmpdir(), 'li-talk-static-'));
  mkdirSync(join(dir, 'slides'));
  const names = Object.keys(chapters);
  for (const n of names) writeFileSync(join(dir, 'slides', n), chapters[n]);
  writeFileSync(join(dir, 'index.html'), '<!doctype html><html><body>\n<!-- 章节（开始） -->\n'
    + names.map(n => `<script src="slides/${n}"></script>`).join('\n') + '\n<!-- 章节（结束） -->\n</body></html>\n');
  return dir;
}

// 一页：第 0 拍到第 beats 拍各一段字；topic=false 时不写主题行
const beatsPage = (id, beats, { topic = true } = {}) => {
  const html = Array.from({ length: beats + 1 }, (_, i) => `<p data-beat="${i}">x</p>`).join('');
  return `Deck.add({ id: '${id}', scene: 'plain', title: '${id}', ${topic ? "topic: '主题', " : ''}html: '${html}' });\n`;
};
// 讲稿：n 页「## 第 N 页」
const scriptOf = n => '# 标题\n\n## 给组织方\n- 时间与时长：5 分钟\n'
  + Array.from({ length: n }, (_, i) => `\n## 第 ${i + 1} 页 第${i + 1}页\n`).join('');

test('拍数提醒：封面、结尾 1 到 2 拍，普通页 2 到 4 拍，提醒文字只写套用的那条', async () => {
  const dir = tempDeck({ 'a.js': beatsPage('p01', 3) + beatsPage('p02', 5) + beatsPage('p03', 3) });
  const t = (await checkStatic(dir)).text;
  assert.match(t, /第 1 页 p01：这是封面页，有 3 拍，建议 1 到 2 拍\n {4}→ 拆页或合并节拍/);
  assert.match(t, /第 2 页 p02：有 5 拍，建议 2 到 4 拍\n {4}→ 拆页或合并节拍/);
  assert.match(t, /第 3 页 p03：这是结尾页，有 3 拍，建议 1 到 2 拍\n {4}→ 拆页或合并节拍/);
  assert.doesNotMatch(t, /封面结尾/);
});

test('讲稿 5 页、课件 3 页（先做 3 页）时，最后一页按普通页算，不按结尾算', async () => {
  // 替身实测的样子：p01 封面 1 拍，p03 步骤 3 拍，p04 清单 3 拍
  const pages = beatsPage('p01', 1) + beatsPage('p03', 3) + beatsPage('p04', 3, { topic: false });
  const dir = tempDeck({ 'a.js': pages });
  writeFileSync(join(dir, '讲稿.md'), scriptOf(5));
  const r = await checkStatic(dir);
  assert.doesNotMatch(r.text, /拍，建议/, r.text);
  assert.match(r.text, /\n {2}讲稿\.md 有 5 页，课件现在 3 页：最后一页还不是结尾，按普通页查/);
  // 按普通页算，主题行也要写
  assert.match(r.text, /第 3 页 p04：没写主题行 topic/);

  // 讲稿页数够了，最后一页就是结尾：3 拍要提醒
  writeFileSync(join(dir, '讲稿.md'), scriptOf(3));
  const done = (await checkStatic(dir)).text;
  assert.match(done, /第 3 页 p04：这是结尾页，有 3 拍，建议 1 到 2 拍/);
  assert.doesNotMatch(done, /没写主题行/);
  assert.doesNotMatch(done, /还不是结尾/);

  // 没有讲稿：保持原来的判断，最后一页按结尾算
  const bare = tempDeck({ 'a.js': pages });
  assert.match((await checkStatic(bare)).text, /第 3 页 p04：这是结尾页，有 3 拍，建议 1 到 2 拍/);
});

test('假环境碰不到 Node：process、require 都没有；死循环会超时', async () => {
  const dir = tempDeck({
    'a.js': 'Deck.add({ id: "p1", title: "一", html: "" });\nprocess.exit(3);\n',
    'b.js': 'require("node:fs").writeFileSync("x", "y");\n',
    'c.js': 'while (true) {}\n',
    'd.js': 'Deck.add({ id: "p2", title: "二", html: "" });\n',
  });
  const r = await checkStatic(dir);
  assert.match(r.text, /slides\/a\.js 运行出错，这一章没查到：ReferenceError: process is not defined/);
  assert.match(r.text, /slides\/b\.js 运行出错，这一章没查到：ReferenceError: require is not defined/);
  assert.match(r.text, /slides\/c\.js 运行出错，这一章没查到：运行超过 \d+ 秒还没结束，可能有死循环/);
  // 出错之前加上的页照样算（浏览器里也是这样），后面的章照样跑
  assert.equal(r.pages, 2);
});

test('假环境里拿不到 Node 主环境的 Function（Deck、假对象都在假环境里建）', async () => {
  const probe = [
    'const F = [Deck.add, Deck, document, window, gsap, Object.getPrototypeOf(document), globalThis, this]',
    '  .map(x => { try { return x && x.constructor && x.constructor.constructor; } catch (e) { return null; } })',
    '  .filter(f => typeof f === "function");',
    'const leaked = F.some(f => { try { return typeof f("return typeof process")() === "string" && f("return typeof process")() !== "undefined"; } catch (e) { return false; } });',
    'Deck.add({ id: "p1", title: leaked ? "漏了" : "没漏", html: "" });',
  ].join('\n');
  const dir = tempDeck({ 'a.js': probe });
  const { pages } = collectPages(readDeck(dir));
  assert.equal(pages[0].def.title, '没漏');
});

test('页面在加载时用到浏览器对象也能跑：什么都能点、什么都不做', async () => {
  const dir = tempDeck({
    'a.js': [
      'const w = window.innerWidth * 2 + document.body.getBoundingClientRect().width;',
      'document.querySelectorAll(".x").forEach(e => e.remove());',
      'for (const e of document.querySelectorAll("p")) e.hidden = true;',
      'gsap.registerPlugin(window.Foo); gsap.set(".a", { x: 1 }).kill();',
      'window.shared = 5; Deck.kid(); Deck._.whatever.deep(1);',
      'localStorage.getItem("k"); setTimeout(() => { throw new Error("不该执行"); }, 0);',
      'Deck.add({ id: "p1", title: "宽 " + w, html: `<p data-beat="${shared - 4}">x</p>` });',
    ].join('\n'),
  });
  const r = await checkStatic(dir);
  assert.doesNotMatch(r.text, /运行出错/, r.text);
  assert.equal(r.pages, 1);
});

test('用相对路径引用别处的风格文件也认得（测试课件、样册直接引用模板）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'li-talk-static-'));
  mkdirSync(join(dir, 'lib', 'scenes'), { recursive: true });
  mkdirSync(join(dir, 'deck'));
  writeFileSync(join(dir, 'lib', 'scenes', 'dark.js'), "Deck.scene('dark', { label: '科技暗黑', family: 'modern' });");
  writeFileSync(join(dir, 'deck', 'index.html'), '<script src="../lib/scenes/dark.js"></script>');
  const d = readDeck(join(dir, 'deck'));
  assert.deepEqual(d.sceneFiles, ['../lib/scenes/dark.js']);
  assert.equal(d.scenes.dark.family, 'modern');
});

test('目录不存在或没有 index.html 时给中文说明', async () => {
  await assert.rejects(() => checkStatic(join(FIX, 'no-such-deck')), e => /找不到课件目录/.test(e.userMessage));
  const empty = mkdtempSync(join(tmpdir(), 'li-talk-static-'));
  await assert.rejects(() => checkStatic(empty), e => /没有 index\.html/.test(e.userMessage));
});
