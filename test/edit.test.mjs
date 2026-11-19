// 在线编辑：serve（本地服务）、wait（等通知）、edits（修改清单）、guide 的「先合并修改」，
// 以及真实浏览器里的编辑模式（engine/edit.js）
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectEdit, run as runServe, startServer } from '../skills/li-talk-skills/scripts/lib/serve.mjs';
import { run as runWait } from '../skills/li-talk-skills/scripts/lib/wait.mjs';
import { applyDone, formatEdits, itemLine, readEdits, run as runEdits, writeEdits } from '../skills/li-talk-skills/scripts/lib/edits.mjs';
import { guideText } from '../skills/li-talk-skills/scripts/lib/guide.mjs';
import { confirmStep } from '../skills/li-talk-skills/scripts/lib/meta.mjs';
import { readDeck } from '../skills/li-talk-skills/scripts/lib/deck.mjs';
import { findBrowser } from '../skills/li-talk-skills/scripts/lib/browser.mjs';
import { openBrowser } from '../skills/li-talk-skills/scripts/lib/selftest-run.mjs';

process.env.LI_TALK_NO_OPEN = '1';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');
const GOOD = join(ROOT, 'test', 'fixtures', 'decks', 'good');

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-edit-')); made.push(d); return d; };
after(() => { for (const d of made) { try { rmSync(d, { recursive: true, force: true }); } catch { /* 删不掉不要紧 */ } } });

// 一份能用 http 打开的课件：引擎、风格、形象、vendor 复制进来，页面用 fixtures 里干净的 3 页（方格纸 + 朵朵）
function deck({ editJs = true } = {}) {
  const dir = join(tmp(), '课件');
  mkdirSync(dir);
  for (const d of ['engine', 'vendor']) cpSync(join(TPL, d), join(dir, d), { recursive: true });
  mkdirSync(join(dir, 'scenes')); mkdirSync(join(dir, 'mascots'));
  for (const f of ['paper.js', 'paper.css']) cpSync(join(TPL, 'scenes', f), join(dir, 'scenes', f));
  cpSync(join(TPL, 'mascots', 'duoduo.js'), join(dir, 'mascots', 'duoduo.js'));
  cpSync(join(GOOD, 'slides'), join(dir, 'slides'), { recursive: true });
  const html = readFileSync(join(GOOD, 'index.html'), 'utf8')
    .replace(/\.\.\/\.\.\/\.\.\/\.\.\/skills\/li-talk-skills\/template\//g, '')
    .replace('<script src="engine/selftest.js"></script>', '<script src="engine/selftest.js"></script>' + (editJs ? '\n<script src="engine/edit.js"></script>' : ''));
  writeFileSync(join(dir, 'index.html'), html);
  return dir;
}

// 发一个 HTTP 请求，返回 { status, headers, body }
function http(port, method, path, { body, type, host } = {}) {
  return new Promise((ok, fail) => {
    const headers = { Host: host || `127.0.0.1:${port}` };
    if (type) headers['Content-Type'] = type;
    const req = request({ host: '127.0.0.1', port, method, path, headers }, res => {
      const parts = [];
      res.on('data', b => parts.push(b));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, body: Buffer.concat(parts).toString('utf8') }));
    });
    req.on('error', fail);
    if (body !== undefined) req.write(body);
    req.end();
  });
}
const sleep = ms => new Promise(ok => setTimeout(ok, ms));

const ITEMS = [
  { page: 'g2', no: 2, path: 'div.grid>div.card:nth-of-type(2)>h3', hint: '第二张', kind: 'text', before: { text: '第二张' }, after: { text: '第 2 张' } },
  { page: 'g1', no: 1, path: 'p.lead', hint: '三页干净的内容', kind: 'box', position: 'absolute',
    before: { left: 160, top: 300, width: 900, height: 60 }, after: { left: 200, top: 340, width: 900, height: 60 } },
  { page: 'g3', no: 3, path: 'p.g3-sub', hint: '自检清零，再给别人看', kind: 'hide', before: { hidden: false }, after: { hidden: true } },
];

/* ------------------------------------------------------------------
   serve
   ------------------------------------------------------------------ */
test('serve：给课件文件、挡住越界和 . 开头的目录、给 index.html 注入 edit.js', async () => {
  const dir = deck({ editJs: false });
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  writeFileSync(join(dir, '.li-talk', 'secret.json'), '{}');
  const s = await startServer(dir, { token: 'tok' });
  try {
    const css = await http(s.port, 'GET', '/slides/ch1.css');
    assert.equal(css.status, 200);
    assert.match(css.headers['content-type'], /text\/css/);
    assert.equal(css.headers['cache-control'], 'no-store');
    const idx = await http(s.port, 'GET', '/index.html?edit=tok');
    assert.equal(idx.status, 200);
    assert.match(idx.body, /<script src="\/__li-talk\/edit\.js"><\/script>\n<\/body>/);
    const root = await http(s.port, 'GET', '/');
    assert.match(root.body, /__li-talk\/edit\.js/);
    const js = await http(s.port, 'GET', '/__li-talk/edit.js');
    assert.equal(js.status, 200);
    assert.match(js.headers['content-type'], /javascript/);
    assert.match(js.body, /在线编辑/);
    for (const bad of ['/%2e%2e/%2e%2e/etc/passwd', '/slides/..%2f..%2f..%2fpackage.json', '/slides/..%5c..%5cx', '/.li-talk/secret.json', '/%2Eli-talk/secret.json']) {
      const r = await http(s.port, 'GET', bad);
      assert.ok(r.status === 403 || r.status === 404, `${bad} → ${r.status}`);
    }
    assert.equal((await http(s.port, 'GET', '/nope.js')).status, 404);
    assert.equal((await http(s.port, 'GET', '/index.html', { host: 'evil.test:80' })).status, 403, '别的 Host 挡掉');
  } finally { await s.close(); }
});

test('serve：页面已经引入 engine/edit.js 时不重复注入', () => {
  const html = '<body><script src="engine/edit.js"></script></body>';
  assert.equal(injectEdit(html), html);
  assert.match(injectEdit('<body>x</BODY>'), /<script src="\/__li-talk\/edit\.js"><\/script>\n<\/BODY>/);
  assert.match(injectEdit('没有 body'), /__li-talk\/edit\.js/);
});

test('serve：POST edits 要口令、只收 JSON、限 1MB；带口令写进 edits.json；notify 更新 notified', async () => {
  const dir = deck();
  const logs = [];
  const s = await startServer(dir, { token: 'tok', log: l => logs.push(l) });
  try {
    const body = JSON.stringify({ items: ITEMS.concat([{ kind: 'bad' }]) });
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits', { body, type: 'application/json' })).status, 403);
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits?token=nope', { body, type: 'application/json' })).status, 403);
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body, type: 'text/plain' })).status, 415);
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body: '{坏', type: 'application/json' })).status, 400);
    const big = JSON.stringify({ items: [], pad: 'x'.repeat(1024 * 1024) });
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body: big, type: 'application/json' })).status, 413);
    assert.ok(!existsSync(join(dir, '.li-talk', 'edits.json')));

    const r = await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body, type: 'application/json' });
    assert.equal(r.status, 200, r.body);
    const saved = JSON.parse(readFileSync(join(dir, '.li-talk', 'edits.json'), 'utf8'));
    assert.equal(saved.version, 1);
    assert.equal(saved.items.length, 3, '认不得的修改丢掉');
    assert.deepEqual(saved.items[0], ITEMS[0]);
    assert.equal(saved.notified, null);
    const got = await http(s.port, 'GET', '/__li-talk/edits?token=tok');
    assert.equal(JSON.parse(got.body).items.length, 3);
    assert.equal((await http(s.port, 'GET', '/__li-talk/edits')).status, 403);

    const n = await http(s.port, 'POST', '/__li-talk/notify?token=tok', { body: '{}', type: 'application/json' });
    assert.equal(n.status, 200);
    const after1 = readEdits(dir);
    assert.ok(after1.notified && Date.now() - Date.parse(after1.notified) < 5000);
    assert.deepEqual(logs, ['用户点了「通知 AI 修改」：3 处']);
    // 浏览器再存一次：notified 保留
    await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body, type: 'application/json' });
    assert.equal(readEdits(dir).notified, after1.notified);
  } finally { await s.close(); }
});

test('serve：SSE 要口令；slides/ 改了推 reload，edits --done 推 merged', async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  try {
    assert.equal((await http(s.port, 'GET', '/__li-talk/events')).status, 403);
    const got = [];
    const req = request({ host: '127.0.0.1', port: s.port, path: '/__li-talk/events?token=tok', headers: { Host: `127.0.0.1:${s.port}` } }, res => {
      assert.match(res.headers['content-type'], /text\/event-stream/);
      res.setEncoding('utf8');
      res.on('data', c => { for (const m of c.matchAll(/event: (\w+)/g)) got.push(m[1]); });
    });
    req.end();
    await sleep(300);
    writeFileSync(join(dir, 'slides', 'ch1.css'), readFileSync(join(dir, 'slides', 'ch1.css'), 'utf8') + '\n/* 改了 */\n');
    for (let i = 0; i < 40 && !got.includes('reload'); i++) await sleep(100);
    assert.ok(got.includes('reload'), JSON.stringify(got));
    writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: ITEMS });
    await runEdits({ _: [dir], done: true }, { log: () => {} });
    for (let i = 0; i < 40 && !got.includes('merged'); i++) await sleep(100);
    assert.ok(got.includes('merged'), JSON.stringify(got));
    req.destroy();
  } finally { await s.close(); }
});

test('serve 命令：写 serve.json（端口、口令、pid），结束时删掉；不打开浏览器', async () => {
  const dir = deck();
  const logs = [];
  const ac = new AbortController();
  let opened = null;
  const p = runServe({ _: [dir], 'no-open': true }, { log: l => logs.push(l), signal: ac.signal, opener: async u => { opened = u; return true; } });
  const info = join(dir, '.li-talk', 'serve.json');
  for (let i = 0; i < 50 && !existsSync(info); i++) await sleep(50);
  const rec = JSON.parse(readFileSync(info, 'utf8'));
  assert.ok(rec.port > 0 && rec.token.length >= 16 && rec.pid === process.pid && rec.startedAt);
  assert.match(logs[0], new RegExp(`在线编辑已开启：http://127\\.0\\.0\\.1:${rec.port}/index\\.html\\?edit=${rec.token}`));
  assert.equal((await http(rec.port, 'GET', '/index.html')).status, 200);
  ac.abort();
  assert.equal(await p, 0);
  assert.ok(!existsSync(info), '结束时删掉 serve.json');
  assert.equal(opened, null, '--no-open 不打开浏览器');
  await assert.rejects(runServe({ _: [join(dir, '没有')] }, { log: () => {} }), /找不到课件目录/);
  await assert.rejects(runServe({ _: [dir], port: 'abc' }, { log: () => {} }), /--port/);
});

/* ------------------------------------------------------------------
   edits、wait
   ------------------------------------------------------------------ */
test('edits：每条一行写清页号、元素、改了什么；末尾是合并规则；--done 清空并记下 merged', async () => {
  const dir = deck();
  const logs = [];
  await runEdits({ _: [dir] }, { log: l => logs.push(l) });
  assert.deepEqual(logs, ['没有待合并的修改。']);

  writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: ITEMS });
  logs.length = 0;
  await runEdits({ _: [dir] }, { log: l => logs.push(l) });
  const out = logs.join('\n');
  assert.match(out, /用户还没点「通知 AI 修改」/);
  assert.match(out, /用户在浏览器里改了 3 处（第 2 页 1 处、第 1 页 1 处、第 3 页 1 处），批次 b[0-9a-z]+：/);
  assert.match(out, /  1\. 第 2 页（g2）div\.grid>div\.card:nth-of-type\(2\)>h3「第二张」：文字「第二张」→「第 2 张」\n/);
  assert.match(out, /  2\. 第 1 页（g1）p\.lead「三页干净的内容」：位置 left 160→200、top 300→340\n/);
  assert.match(out, /  3\. 第 3 页（g3）p\.g3-sub「自检清零，再给别人看」：隐藏（删掉这个元素）\n/);
  assert.match(out, /合并规则：/);
  assert.match(out, /edits ".*" --done/);

  assert.equal(itemLine({ ...ITEMS[1], position: 'flow' }), '第 1 页（g1）p.lead「三页干净的内容」：位置 left 160→200、top 300→340（元素在排版流里，不是 absolute；相对原位右移 40、下移 40）');
  assert.match(itemLine({ ...ITEMS[1], origin: { left: 100, top: 50 } }), /定位容器在舞台 \(100, 50\)/);
  assert.match(itemLine({ ...ITEMS[0], before: { text: 'a b', html: 'a <b>b</b>' }, after: { text: 'a b', html: 'a b' } }), /行内标签变了，改后的 HTML：a b$/);

  logs.length = 0;
  await runEdits({ _: [dir], done: true }, { log: l => logs.push(l) });
  assert.match(logs.join('\n'), /已清掉这一批的 3 处修改/);
  const d = readEdits(dir);
  assert.deepEqual(d.items, []);
  assert.ok(d.merged);
});

test('edits --done 只清打印过的那一批：合并期间新加的、又改过的留着（又改过的 before 换成已经合并的值）', async () => {
  const dir = deck();
  const a = { ...ITEMS[0], id: 'e1', at: 100 }, b = { ...ITEMS[1], id: 'e2', at: 100 };
  writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: [a, b] });
  const logs = [];
  await runEdits({ _: [dir] }, { log: l => logs.push(l) });
  const batch = /批次 (b[0-9a-z]+)/.exec(logs.join('\n'))[1];
  assert.match(logs.join('\n'), new RegExp('edits ".*" --done ' + batch));
  // AI 合并期间：用户又挪了一次 b，又新改了一处
  const b2 = { ...b, at: 200, after: { ...b.after, left: 260 } };
  const c = { ...ITEMS[2], id: 'e3', at: 150 };
  writeEdits(dir, { ...readEdits(dir), items: [a, b2, c] });
  await assert.rejects(runEdits({ _: [dir, 'bnope'], done: true }, { log: () => {} }), /批次号对不上/);
  logs.length = 0;
  await runEdits({ _: [dir, batch], done: true }, { log: l => logs.push(l) });
  assert.match(logs.join('\n'), /已清掉这一批的 1 处修改.*又改了 2 处，留着/);
  const d = readEdits(dir);
  assert.deepEqual(d.items.map(i => i.id), ['e2', 'e3']);
  assert.deepEqual(d.items[0].before, b.after, '又改过的：before 换成已经合并的值');
  assert.equal(d.items[0].after.left, 260);
  assert.ok(d.merged && !d.batch);
  assert.deepEqual(d.done.map(x => x.id).sort(), ['e1', 'e2']);
  // 浏览器还没刷新、把旧的 a、b 存回来：服务按 done 去掉 a，b 只剩合并后又改的部分
  assert.deepEqual(applyDone([a, b2, c], d.done).map(i => i.id), ['e2', 'e3']);
  assert.deepEqual(applyDone([a, b], d.done), [], '没再改过的都去掉');
});

test('serve：浏览器把已经合并的修改存回来时，按 done 去掉', async () => {
  const dir = deck();
  writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: [], done: [{ id: 'e1', at: 100, after: ITEMS[0].after }] });
  const s = await startServer(dir, { token: 'tok' });
  try {
    const body = JSON.stringify({ items: [{ ...ITEMS[0], id: 'e1', at: 100 }, { ...ITEMS[2], id: 'e9', at: 300 }] });
    assert.equal((await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body, type: 'application/json' })).status, 200);
    assert.deepEqual(readEdits(dir).items.map(i => i.id), ['e9']);
  } finally { await s.close(); }
});

test('edits：样式、拍号、讲词的写法', () => {
  const style = { page: 'p02', no: 2, path: 'p.lead', hint: '一句话', kind: 'style',
    before: { fontSize: 'var(--fs-body)', color: 'var(--ink)', fontWeight: '400', textAlign: 'left' },
    after: { fontSize: 'var(--fs-lg)', color: 'var(--accent)', fontWeight: '700', textAlign: 'left' } };
  assert.equal(itemLine(style), '第 2 页（p02）p.lead「一句话」：样式 字号 var(--fs-body)→var(--fs-lg)、颜色 var(--ink)→var(--accent)、粗细 400→700');
  const beat = { page: 'p02', no: 2, path: 'div.card', hint: '卡片', kind: 'beat', own: true, mascot: true, before: { beat: 1 }, after: { beat: 2 } };
  assert.equal(itemLine(beat), '第 2 页（p02）div.card「卡片」：拍号 第 1 拍→第 2 拍出现（元素上还有 data-mascot，拍号一起改）');
  assert.match(itemLine({ ...beat, own: false, mascot: false }), /本来没写 data-beat，跟着外层第 1 拍出现/);
  const notes = { page: 'p02', no: 2, path: 'notes', hint: '第 1 拍讲词', kind: 'notes', beat: 1, before: { text: '旧的讲词' }, after: { text: '新的讲词，整句都写出来' } };
  assert.equal(itemLine(notes), '第 2 页（p02）第 1 拍的讲词：「旧的讲词」→「新的讲词，整句都写出来」');
  const out = formatEdits({ items: [style, beat, notes] });
  assert.match(out, /- 样式：优先换成已有的类名/);
  assert.match(out, /- 拍号：改这个元素的 data-beat/);
  assert.match(out, /- 讲词：页面 notes 里对应拍的 say 和 讲稿\.md/);
});

test('wait：先启动再通知，打印清单、退出码 0；已经合并的不触发；--timeout 到了退出码 3', async () => {
  const dir = deck();
  writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: ITEMS });
  const logs = [];
  const p = runWait({ _: [dir] }, { log: l => logs.push(l), poll: 50, quiet: true });
  await sleep(150);
  assert.equal(logs.length, 0, '没通知就一直等');
  writeEdits(dir, { ...readEdits(dir), notified: new Date().toISOString() });
  assert.equal(await p, 0);
  const out = logs.join('\n');
  assert.match(out, /点了「通知 AI 修改」/);
  assert.match(out, /用户在浏览器里改了 3 处/);
  assert.match(out, /合并规则：/);

  // 通知了但已经合并过（merged 比 notified 新）：不触发，到时间退出码 3
  const t = Date.now();
  writeEdits(dir, { ...readEdits(dir), notified: new Date(t + 500).toISOString(), merged: new Date(t + 600).toISOString() });
  logs.length = 0;
  assert.equal(await runWait({ _: [dir], timeout: '0.6' }, { log: l => logs.push(l), poll: 50, quiet: true }), 3);
  assert.match(logs.join('\n'), /等了 0\.6 秒/);
  await assert.rejects(runWait({ _: [dir], timeout: true }, { log: () => {} }), /--timeout/);
});

test('wait 开始前就有的通知不算这次的，但会提醒', async () => {
  const dir = deck();
  writeEdits(dir, { version: 1, updated: null, notified: new Date().toISOString(), merged: null, items: ITEMS });
  const logs = [];
  assert.equal(await runWait({ _: [dir], timeout: '0.3' }, { log: l => logs.push(l), poll: 50 }), 3);
  assert.match(logs.join('\n'), /wait 开始前发出、没处理的通知（3 处）/);
});

/* ------------------------------------------------------------------
   guide
   ------------------------------------------------------------------ */
test('guide：有待合并的修改时，⑥ 以后最前面一步是「先合并修改」', async () => {
  const dir = deck();
  writeFileSync(join(dir, '讲稿.md'), '# 测试\n\n## 第 1 页 封面\n\n## 第 2 页 内容\n\n## 第 3 页 结尾\n');
  for (const s of ['outline', 'script', 'style', 'trial']) confirmStep(dir, s);
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  writeFileSync(join(dir, '.li-talk', 'selftest.json'), JSON.stringify({ at: new Date().toISOString(), slidesMtime: readDeck(dir).slidesMtime, errors: 0, warnings: 0 }));
  const before = guideText(dir);
  assert.match(before, /⑧ 过稿/);
  assert.doesNotMatch(before, /先合并修改/);

  writeEdits(dir, { version: 1, updated: null, notified: null, merged: null, items: ITEMS });
  const t = guideText(dir);
  assert.match(t, /浏览器里还有 3 处修改没合并（用户还没点通知/);
  assert.match(t, /【下一步做什么】\n  1\. 先合并修改：/);
  assert.match(t, /li-talk\.mjs" edits ".*课件"\n/);
  assert.match(t, /edits ".*课件" --done/);
  writeEdits(dir, { ...readEdits(dir), notified: new Date().toISOString() });
  assert.match(guideText(dir), /用户已经点了「通知 AI 修改」/);
});

/* ------------------------------------------------------------------
   真实浏览器
   ------------------------------------------------------------------ */
const browser = findBrowser();

test('真实浏览器：?edit=口令 自动进入编辑模式，改字、拖动的记录 POST 到服务；退出后正常翻页；自检模式没有编辑条', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 120000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const ev = async (expr, ms = 15000) => {
    const start = Date.now();
    for (;;) {
      // 页面正在刷新时，这一次的调用可能等不到回应：超时就当没读到，接着试
      const v = await b.evaluate(expr, 3000).catch(() => null);
      if (v || Date.now() - start > ms) return v;
      await sleep(100);
    }
  };
  const mouse = async (type, x, y, extra = {}) => b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    assert.ok(await ev('window.Deck && Deck._.editState && Deck._.editState().on'), '自动进入编辑模式');
    const st0 = await b.evaluate('Deck._.editState()');
    assert.equal(st0.server, true);
    assert.match(st0.bar, /编辑中.*通知 AI 修改.*退出编辑/);
    assert.equal(await b.evaluate('Deck.page.beat === Deck.page.total && Deck.page.no === 2'), true, '当前页摆到最后一拍');

    // 改字：双击第二张卡片的标题，全选后打字，回车
    const h3 = await b.evaluate(`(() => { const r = document.querySelector('#slide-g2 .card:nth-of-type(2) h3').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    for (let k = 0; k < 2; k++) { await mouse('mousePressed', h3.x, h3.y, { clickCount: k + 1 }); await mouse('mouseReleased', h3.x, h3.y, { clickCount: k + 1 }); }
    assert.ok(await ev(`!!document.querySelector('.lt-edit-text')`), '双击进入改字');
    await b.evaluate(`(() => { const n = document.querySelector('.lt-edit-text'); const r = document.createRange(); r.selectNodeContents(n); const s = getSelection(); s.removeAllRanges(); s.addRange(r); })()`);
    await b.call('Input.insertText', { text: '第 2 张' });
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });

    // 拖动第三张卡片：往右下拖 64×36 屏幕像素（1280 宽时舞台缩放 2/3，合舞台 96×54）
    const c3 = await b.evaluate(`(() => { const r = document.querySelector('#slide-g2 .card:nth-of-type(3)').getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height - 20 }; })()`);
    await sleep(500);   // 和刚才的双击分开
    await mouse('mousePressed', c3.x, c3.y);
    for (let i = 1; i <= 4; i++) await mouse('mouseMoved', c3.x + 16 * i, c3.y + 9 * i);
    await mouse('mouseReleased', c3.x + 64, c3.y + 36);

    const saved = await (async () => {
      for (let i = 0; i < 50; i++) { const d = readEdits(dir); if (d.items.length >= 2) return d; await sleep(100); }
      return readEdits(dir);
    })();
    assert.equal(saved.items.length, 2, JSON.stringify(saved.items));
    const text = saved.items.find(it => it.kind === 'text');
    assert.deepEqual({ page: text.page, path: text.path, after: text.after }, { page: 'g2', path: 'div.grid>div.card:nth-of-type(2)>h3', after: { text: '第 2 张' } });
    assert.equal(text.before.text, '第二张');
    const box = saved.items.find(it => it.kind === 'box');
    assert.equal(box.page, 'g2');
    assert.equal(box.path, 'div.grid>div.card:nth-of-type(3)');
    assert.equal(box.after.left - box.before.left, 96);
    assert.equal(box.after.top - box.before.top, 54);
    assert.equal(box.after.width, box.before.width);
    // 浏览器里的清单和 edits 命令的写法一致
    const lines = await b.evaluate(`Deck._.editsText(${JSON.stringify(saved.items)}).split('\\n').filter(l => /^  \\d+\\. /.test(l)).join('\\n')`);
    assert.equal(lines, formatEdits(saved).split('\n').filter(l => /^ {2}\d+\. /.test(l)).join('\n'));

    // 通知：服务记下 notified
    await b.evaluate(`document.querySelector('.lt-edit-go').click()`);
    for (let i = 0; i < 50 && !readEdits(dir).notified; i++) await sleep(100);
    assert.ok(readEdits(dir).notified, '点通知以后 notified 有值');
    assert.match(await ev(`Deck._.editState().bar.includes('已通知') && Deck._.editState().bar`), /已通知，AI 正在改/);

    // 改了源码：页面自动刷新，停在第 2 页、仍在编辑模式；没合并的修改摆回页面上
    await b.evaluate('window.__before = 1');
    const ch1 = join(dir, 'slides', 'ch1.js');
    writeFileSync(ch1, readFileSync(ch1, 'utf8').replace('按页写下要讲的话', '按页写下要讲的每一句话'));
    assert.ok(await ev(`!window.__before && window.Deck && Deck._.editState && Deck._.editState().on && Deck.page && Deck.page.no === 2`), '刷新后回到第 2 页的编辑模式');
    assert.ok(await ev(`document.querySelector('#slide-g2 .card:nth-of-type(2) h3').textContent === '第 2 张'`), '没合并的改字摆回来了');
    assert.ok(await ev(`document.querySelector('#slide-g2 .card:nth-of-type(3)').hasAttribute('data-lt-moved')`), '没合并的挪位置摆回来了');

    // 退出编辑：按 E；之后翻页照常
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
    assert.equal(await ev('!Deck._.editState().on'), true);
    await b.evaluate('Deck.go(1)');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    assert.equal(await ev('Deck.page.no === 1 && Deck.page.beat === 1'), true, '退出编辑后 → 进一拍');

    // 自检模式：没有编辑条，按 E 也不进
    // 自检跑的时候页面会一阵阵地忙，不等加载完，直接轮询完成标记
    await b.call('Page.navigate', { url: `http://127.0.0.1:${s.port}/index.html?selftest=1&edit=tok` });
    assert.ok(await ev(`document.documentElement.dataset.selftest === 'done'`, 90000), '自检跑完了');
    assert.equal(await b.evaluate(`!document.querySelector('.lt-edit-bar') && !Deck._.toggleEdit && !Deck._.editState`), true);
  } finally {
    await b.close();
    await s.close();
  }
});

test('真实浏览器：双击 file:// 打开时按 E 进编辑，修改存进 localStorage，按钮是「复制修改给 AI」', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const b = await openBrowser(browser);
  try {
    const url = new URL('file:///' + join(dir, 'index.html').replace(/\\/g, '/'));
    await b.goto(url.href + '#3', { w: 1280, h: 720 });
    const ready = async expr => { for (let i = 0; i < 100; i++) { if (await b.evaluate(expr)) return true; await sleep(100); } return false; };
    assert.ok(await ready(`window.Deck && Deck.page && Deck.page.no === 3 && !document.body.classList.contains('loading')`));
    assert.equal(await b.evaluate(`!document.querySelector('.lt-edit-bar') && !document.querySelector('style.lt-edit-style')`), true, '没进编辑模式时什么都不加');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
    assert.ok(await ready('Deck._.editState().on'));
    const st = await b.evaluate('Deck._.editState()');
    assert.equal(st.server, false);
    assert.match(st.bar, /复制修改给 AI/);
    // 选中第 3 页的副标题，按 Delete 隐藏、方向键挪 10px
    const p = await b.evaluate(`(() => { const r = document.querySelector('#slide-g3 .g3-quote').getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 }; })()`);
    await b.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', buttons: 1, clickCount: 1 });
    await b.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: 1 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37, modifiers: 8 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
    await sleep(700);
    const saved = await b.evaluate(`JSON.parse(localStorage.getItem('li-talk-edits:' + document.title))`);
    assert.deepEqual(saved.items.map(i => i.kind).sort(), ['box', 'hide']);
    const box = saved.items.find(i => i.kind === 'box');
    assert.equal(box.page, 'g3');
    assert.equal(box.after.left, box.before.left - 10);
    const copy = await b.evaluate('Deck._.editsText(null, true)');
    assert.match(copy, /^【课件修改】/);
    assert.match(copy, /隐藏（删掉这个元素）/);
  } finally { await b.close(); }
});

test('真实浏览器：样式工具栏（字号、颜色、加粗）、重点词、改拍号、选外层、演讲者视图里改讲词', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 120000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const ev = async (expr, ms = 15000) => {
    const start = Date.now();
    for (;;) {
      const v = await b.evaluate(expr, 3000).catch(() => null);
      if (v || Date.now() - start > ms) return v;
      await sleep(100);
    }
  };
  const mouse = async (type, x, y, extra = {}) => b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  const click = async (x, y, n = 1) => { for (let k = 1; k <= n; k++) { await mouse('mousePressed', x, y, { clickCount: k }); await mouse('mouseReleased', x, y, { clickCount: k }); } };
  const key = (k, code, vk, modifiers = 0) => b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers });
  const center = sel => b.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const tool = sel => b.evaluate(`document.querySelector('.lt-edit-tools ${sel}').click()`);
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    assert.ok(await ev('window.Deck && Deck._.editState && Deck._.editState().on'));
    await sleep(300);
    // 选中第二张卡片（点在卡片的内边距上），工具栏浮出来
    const c2 = await b.evaluate(`(() => { const r = document.querySelector('#slide-g2 .card:nth-of-type(2)').getBoundingClientRect(); return { x: r.left + 8, y: r.bottom - 8 }; })()`);
    await click(c2.x, c2.y);
    let st = await b.evaluate('Deck._.editState()');
    assert.equal(st.sel, 'div.grid>div.card:nth-of-type(2)');
    assert.equal(st.tools, true, '选中后浮出工具栏');
    // 选外层、回内层
    await key('ArrowUp', 'ArrowUp', 38, 1);
    assert.equal((await b.evaluate('Deck._.editState()')).sel, 'div.grid');
    await key('ArrowDown', 'ArrowDown', 40, 1);
    assert.equal((await b.evaluate('Deck._.editState()')).sel, 'div.grid>div.card:nth-of-type(2)');
    // 改拍号：第 2 拍 → 第 3 拍；角标跟着变
    assert.match(await b.evaluate(`document.querySelector('.lt-edit-beat').textContent`), /第 2 拍出现/);
    await tool('[data-act=beat][data-v="1"]');
    assert.match(await b.evaluate(`document.querySelector('.lt-edit-beat').textContent`), /第 3 拍出现/);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('.lt-edit-badge')].some(x => x.textContent === '拍 2→3')`));
    // 样式：字号「标题」、颜色主色、加粗
    await tool('[data-act=fs][data-v="var(--fs-lg)"]');
    await tool('[data-act=color][data-v="--accent"]');
    await tool('[data-act=bold]');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('#slide-g2 .card:nth-of-type(2)')).fontSize`), '50px');
    // 重点词：双击第三张卡片的标题，选中前两个字，点「重点」
    const h3 = await center('#slide-g2 .card:nth-of-type(3) h3');
    await sleep(500);
    await click(h3.x, h3.y, 2);
    assert.ok(await ev(`!!document.querySelector('.lt-edit-text')`));
    await b.evaluate(`(() => { const n = document.querySelector('.lt-edit-text').firstChild; const r = document.createRange(); r.setStart(n, 0); r.setEnd(n, 2); getSelection().removeAllRanges(); getSelection().addRange(r); })()`);
    await tool('[data-act=key]');
    assert.equal(await b.evaluate(`document.querySelector('.lt-edit-text .key').textContent`), '第三');
    await key('Enter', 'Enter', 13);
    // 演讲者视图里改讲词：按 S 打开，点第 1 拍的讲词，改完按回车保存
    await key('s', 'KeyS', 83);
    assert.ok(await ev(`!!(Deck._.state.pres && Deck._.state.pres.document.querySelector('.say.editable[data-beat="1"]'))`), '演讲者视图里讲词可以点');
    await b.evaluate(`(() => { const d = Deck._.state.pres.document, el = d.querySelector('.say[data-beat="1"]'); el.click(); el.textContent = '第一张，先写下要讲的话'; el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()`);
    // 等自动保存
    let saved;
    for (let i = 0; i < 50; i++) { saved = readEdits(dir); if (saved.items.length >= 4) break; await sleep(100); }
    const kinds = Object.fromEntries(saved.items.map(it => [it.kind, it]));
    assert.deepEqual(Object.keys(kinds).sort(), ['beat', 'notes', 'style', 'text'], JSON.stringify(saved.items));
    assert.deepEqual([kinds.beat.before, kinds.beat.after, kinds.beat.own, kinds.beat.mascot], [{ beat: 2 }, { beat: 3 }, true, true]);
    assert.deepEqual(kinds.style.after, { fontSize: 'var(--fs-lg)', color: 'var(--accent)', fontWeight: '700', textAlign: kinds.style.before.textAlign });
    assert.notEqual(kinds.style.before.fontSize, 'var(--fs-lg)');
    assert.equal(kinds.text.after.html, '<em class="key">第三</em>张');
    assert.deepEqual([kinds.notes.page, kinds.notes.beat, kinds.notes.before.text, kinds.notes.after.text], ['g2', 1, '第一张。', '第一张，先写下要讲的话']);
    assert.ok(saved.items.every(it => it.id && it.at), '每条都有 id 和 at');
    // 浏览器里的清单和 edits 命令一致
    const lines = await b.evaluate(`Deck._.editsText(${JSON.stringify(saved.items)}).split('\\n').filter(l => /^  \\d+\\. /.test(l)).join('\\n')`);
    assert.equal(lines, formatEdits(saved).split('\n').filter(l => /^ {2}\d+\. /.test(l)).join('\n'));
    // 退出编辑后放映照常：拍号没真的改（第二张卡片还是第 2 拍出现）
    await key('Escape', 'Escape', 27);
    await key('e', 'KeyE', 69);
    assert.equal(await ev('!Deck._.editState().on'), true);
    await b.evaluate('Deck.go(2, 1)');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('#slide-g2 .card:nth-of-type(2)')).visibility`), 'hidden');
  } finally {
    await b.close();
    await s.close();
  }
});

test('真实浏览器：拖角整块缩放、Alt 拖角改框、字号选数字、撤销重做、还原这一块、全部还原', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 120000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const ev = async (expr, ms = 15000) => {
    const start = Date.now();
    for (;;) {
      const v = await b.evaluate(expr, 3000).catch(() => null);
      if (v || Date.now() - start > ms) return v;
      await sleep(100);
    }
  };
  const mouse = (type, x, y, extra = {}) => b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  const key = (k, code, vk, modifiers = 0) => b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers });
  const st = () => b.evaluate('Deck._.editState()');
  const kinds = async () => (await st()).items.map(i => i.kind).sort().join(',');
  const drag = async (x, y, dx, dy, modifiers = 0, peek) => {
    await mouse('mousePressed', x, y, { modifiers });
    for (let i = 1; i <= 4; i++) await mouse('mouseMoved', x + dx * i / 4, y + dy * i / 4, { modifiers });
    const label = peek ? await b.evaluate(`document.querySelector('.lt-edit-size').textContent`) : null;
    await mouse('mouseReleased', x + dx, y + dy, { modifiers });
    return label;
  };
  const corner = () => b.evaluate(`(() => { const r = document.querySelector('.lt-edit-h[data-c=se]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const C2 = '#slide-g2 .card:nth-of-type(2)';
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    assert.ok(await ev('window.Deck && Deck._.editState && Deck._.editState().on'));
    await sleep(300);
    const c2 = await b.evaluate(`(() => { const r = document.querySelector('${C2}').getBoundingClientRect(); return { x: r.left + 8, y: r.bottom - 8, w: r.width }; })()`);
    await mouse('mousePressed', c2.x, c2.y); await mouse('mouseReleased', c2.x, c2.y);
    // 拖右下角（默认）：整块等比缩放，框旁边显示百分比
    let h = await corner();
    const pct = await drag(h.x, h.y, 60, 30, 0, true);
    assert.match(pct, /^\d+%$/, '缩放时显示百分比');
    const sc = (await st()).items.find(i => i.kind === 'scale');
    assert.ok(sc && sc.after.scale > 1 && sc.after.origin === 'center' && sc.before.scale === 1, JSON.stringify(sc));
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${C2}')).scale`), String(sc.after.scale));
    const w0 = await b.evaluate(`document.querySelector('${C2}').offsetWidth`);
    // 按住 Alt 拖角：改框的大小，显示「宽×高」
    h = await corner();
    const size = await drag(h.x, h.y, 40, 0, 1, true);
    assert.match(size, /^\d+×\d+$/, '改框时显示宽×高');
    assert.ok(await b.evaluate(`document.querySelector('${C2}').offsetWidth`) > w0, 'Alt 拖角改了宽度');
    assert.equal(await kinds(), 'box,scale');
    // 字号选数字
    await b.evaluate(`document.querySelector('.lt-edit-tools [data-act=fs][data-v="64px"]').click()`);
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${C2}')).fontSize`), '64px');
    assert.equal((await st()).items.find(i => i.kind === 'style').after.fontSize, '64px');
    // 撤销三步、重做一步
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), 'box,scale');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${C2}')).fontSize`), '36px');
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), 'scale');
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), '');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${C2}')).scale`), 'none', '撤销到底，页面也回到原样');
    await key('y', 'KeyY', 89, 2);
    assert.equal(await kinds(), 'scale');
    await key('z', 'KeyZ', 90, 2 | 8);   // Ctrl+Shift+Z 也是重做
    assert.equal(await kinds(), 'box,scale');
    // 还原这一块
    await b.evaluate(`document.querySelector('.lt-edit-tools [data-act=reset]').click()`);
    assert.equal(await kinds(), '');
    assert.equal(await b.evaluate(`document.querySelector('${C2}').offsetWidth`), w0);
    // 全部还原：先确认
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), 'box,scale');
    await b.evaluate(`window.confirm = () => false; document.querySelector('.lt-edit-all').click()`);
    assert.equal(await kinds(), 'box,scale', '不确认就不动');
    await b.evaluate(`window.confirm = () => true; document.querySelector('.lt-edit-all').click()`);
    assert.equal(await kinds(), '');
    // 自动保存：服务上的记录也空了
    for (let i = 0; i < 30 && readEdits(dir).items.length; i++) await sleep(100);
    assert.equal(readEdits(dir).items.length, 0);
  } finally {
    await b.close();
    await s.close();
  }
});

test('真实浏览器：章节 css 里写了 scale 的块，出场、退拍动画放完以后还是那个倍数', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  writeFileSync(join(dir, 'slides', 'ch1.css'), readFileSync(join(dir, 'slides', 'ch1.css'), 'utf8') + '\n[data-id="g2"] .card:nth-child(2){scale:1.2;transform-origin:center}\n');
  const b = await openBrowser(browser);
  try {
    const url = new URL('file:///' + join(dir, 'index.html').replace(/\\/g, '/'));
    await b.goto(url.href + '#2', { w: 1280, h: 720 });
    const look = `(() => { const c = document.querySelector('#slide-g2 .card:nth-of-type(2)'), cs = getComputedStyle(c); return cs.scale + '|' + (c.style.transform || 'none') + '|' + cs.visibility; })()`;
    for (let i = 0; i < 50 && !(await b.evaluate(`window.Deck && Deck.page && !document.body.classList.contains('loading')`)); i++) await sleep(100);
    for (const [step, want] of [['Deck.next()', 'hidden'], ['Deck.next()', 'visible'], ['Deck.next()', 'visible'], ['Deck.prev()', 'visible'], ['Deck.prev()', 'hidden']]) {
      await b.evaluate(step);
      await sleep(1500);   // 等这一拍的动画放完
      const [scale, tf, vis] = (await b.evaluate(look)).split('|');
      assert.equal(scale, '1.2', `${step} 之后 scale 还是 1.2`);
      assert.ok(tf === 'none' || tf === '' || /translate\(0px, 0px\)|none/.test(tf), `动画留下的 transform：${tf}`);
      assert.equal(vis, want);
    }
  } finally { await b.close(); }
});

test('edits：整块缩放的写法；有文字或讲词改动时，清单末尾提醒先原样合并再给文案建议', () => {
  const sc = { page: 'p02', no: 2, path: 'figure.shot', hint: '截图：设置页', kind: 'scale', before: { scale: 1, origin: 'center' }, after: { scale: 1.2, origin: 'top left' } };
  assert.equal(itemLine(sc), '第 2 页（p02）figure.shot「截图：设置页」：整块缩放 100%→120%（原点 左上角 top left）');
  const onlyScale = formatEdits({ items: [sc] });
  assert.match(onlyScale, /- 整块缩放：.*scale:1\.2;transform-origin:center/);
  assert.doesNotMatch(onlyScale, /文案/);
  const withText = formatEdits({ items: [sc, ITEMS[0]] });
  assert.match(withText, /先照用户改的原样合并；跑完自检、清掉批次以后，再逐条看这些文案，给用户优化建议/);
  assert.match(withText, /- 样式：.*字号是 px 数字（64px）的：能对上风格档位变量的写变量/);
});

test('真实浏览器：章节 css 写了 scale:1.3 的块用 pop 出场，动画后半段和放完都是 1.3 倍，不会回到 1 再跳', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const js = join(dir, 'slides', 'ch1.js');
  writeFileSync(js, readFileSync(js, 'utf8').replace('<div class="card t-mint" data-beat="2"', '<div class="card t-mint" data-in="pop" data-beat="2"'));
  writeFileSync(join(dir, 'slides', 'ch1.css'), readFileSync(join(dir, 'slides', 'ch1.css'), 'utf8') + '\n[data-id="g2"] .card:nth-child(2){scale:1.3;transform-origin:center}\n');
  const b = await openBrowser(browser);
  try {
    const url = new URL('file:///' + join(dir, 'index.html').replace(/\\/g, '/'));
    await b.goto(url.href + '#2/1', { w: 1280, h: 720 });
    for (let i = 0; i < 50 && !(await b.evaluate(`window.Deck && Deck.page && !document.body.classList.contains('loading')`)); i++) await sleep(100);
    await sleep(800);
    // 每一帧记下实际的倍数：CSS scale × transform 里的 scale
    await b.evaluate(`(() => {
      window.__f = [];
      const c = document.querySelector('#slide-g2 .card:nth-of-type(2)'), t0 = performance.now();
      const eff = () => { const cs = getComputedStyle(c), s = cs.scale && cs.scale !== 'none' ? parseFloat(cs.scale) : 1;
        const m = /matrix\\(([^,]+),\\s*([^,]+)/.exec(cs.transform); const k = m ? Math.hypot(+m[1], +m[2]) : 1; return s * k; };
      (function f() { __f.push({ t: performance.now() - t0, s: eff() }); if (performance.now() - t0 < 1500) requestAnimationFrame(f); })();
      Deck.next();
    })()`);
    await sleep(1800);
    const f = await b.evaluate('__f');
    assert.equal(await b.evaluate('Deck.page.beat'), 2);
    const late = f.filter(x => x.t > 300);   // pop 动画 0.5 秒：后半段到放完以后
    assert.ok(late.length > 10, '采到了足够的帧');
    const low = late.filter(x => x.s < 1.25);
    assert.deepEqual(low, [], '后半段和放完以后都不回到 1 倍附近');
    const end = f[f.length - 1].s;
    assert.ok(Math.abs(end - 1.3) < .01, `放完是 1.3 倍，现在 ${end}`);
    assert.ok(Math.max(...f.map(x => x.s)) > 1.3, 'pop 有回弹，峰值超过 1.3 倍');
  } finally { await b.close(); }
});
