// 在线编辑：serve（本地服务）、wait（等通知）、edits（修改清单）、guide 的「先合并修改」，
// 以及真实浏览器里的编辑模式（engine/edit.js）
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { injectEdit, run as runServe, serveJsText, startServer, webRoot } from '../skills/li-talk-skills/scripts/lib/serve.mjs';
import { run as runWait } from '../skills/li-talk-skills/scripts/lib/wait.mjs';
import { applyDone, formatEdits, itemLine, mergeItems, readEdits, run as runEdits, writeEdits } from '../skills/li-talk-skills/scripts/lib/edits.mjs';
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
// 连上服务的 SSE，收到的事件名记进返回的数组；close() 断开
function sse(port, client, token = 'tok') {
  const got = [];
  const req = request({ host: '127.0.0.1', port, path: `/__li-talk/events?token=${token}&client=${client}`, headers: { Host: `127.0.0.1:${port}` } }, res => {
    res.setEncoding('utf8');
    res.on('data', c => { for (const m of c.matchAll(/event: (\w+)/g)) got.push(m[1]); });
  });
  req.on('error', () => { /* 服务关了 */ });
  req.end();
  got.close = () => req.destroy();
  return got;
}
const FORM = 'application/x-www-form-urlencoded';

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
    assert.deepEqual(logs, ['用户点了「通知 AI 修改」：3 处，合并方式 exact']);
    assert.equal(after1.mode, 'exact', '没选合并方式按「照我改的」');
    // 带上合并方式：写进 edits.json，清单开头写明；认不得的按 exact
    await http(s.port, 'POST', '/__li-talk/notify?token=tok', { body: '{"mode":"polish"}', type: 'application/json' });
    assert.equal(readEdits(dir).mode, 'polish');
    assert.match(formatEdits(readEdits(dir)), /合并方式（用户选的，照它来）：② 照我改的，AI 帮着润色/);
    await http(s.port, 'POST', '/__li-talk/notify?token=tok', { body: '{"mode":"乱写"}', type: 'application/json' });
    assert.equal(readEdits(dir).mode, 'exact');
    assert.match(formatEdits(readEdits(dir)), /合并方式（用户选的，照它来）：① 照我改的（原样）/);
    assert.doesNotMatch(formatEdits(readEdits(dir)), /先自己调/, '照我改的不让 AI 擅自调');
    // 浏览器再存一次：notified、合并方式保留
    const last = readEdits(dir);
    await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body, type: 'application/json' });
    assert.equal(readEdits(dir).notified, last.notified);
    assert.equal(readEdits(dir).mode, last.mode);
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

test('skill 里的课件都带在线编辑：入口模板（新做的课件都从它来）、新手教程、样册都引入了 edit.js，放在 selftest.js 后面', () => {
  for (const [file, pre] of [['index.html', ''], ['gallery.html', ''], [join('tour', 'index.html'), '../']]) {
    const html = readFileSync(join(TPL, file), 'utf8');
    const esc = pre.replace(/\./g, '\\.').replace(/\//g, '\\/');
    assert.match(html, new RegExp(`<script src="${esc}engine/selftest\\.js"></script>\\r?\\n<script src="${esc}engine/edit\\.js"></script>`), `${file} 要引入 ${pre}engine/edit.js`);
  }
});

test('edit.js 不挂 beforeunload（挂着时，页面加载完一秒内跳走，自动化里的跳转会隔一次卡一次）；离开页面前用 pagehide 保存', () => {
  const js = readFileSync(join(TPL, 'engine', 'edit.js'), 'utf8');
  assert.doesNotMatch(js, /addEventListener\(\s*['"]beforeunload/);
  assert.match(js, /addEventListener\('pagehide', \(\) => \{ if \(E\.on \|\| E\.saveT\) flush\(\); \}\)/);
});

test('webRoot：skill 自带的教程（引用 ../engine）从模板目录给，样册（模板目录本身）和普通课件从课件目录给', () => {
  assert.equal(webRoot(join(TPL, 'tour'), TPL), TPL);
  assert.equal(webRoot(TPL, TPL), TPL);
  assert.equal(webRoot(GOOD, TPL), GOOD);
  assert.equal(webRoot(deck(), TPL).endsWith('课件'), true);
});

test('serve 教程：页面地址是 /tour/index.html，引擎从模板目录给，不重复插入编辑脚本，.li-talk 照样不给', async () => {
  const tour = join(TPL, 'tour');
  const s = await startServer(tour, { token: 'tok', web: webRoot(tour, TPL) });
  try {
    assert.match(s.url, new RegExp(`^http://127\\.0\\.0\\.1:${s.port}/tour/index\\.html\\?edit=tok$`));
    const page = await http(s.port, 'GET', '/tour/index.html');
    assert.equal(page.status, 200);
    assert.match(page.body, /<script src="\.\.\/engine\/edit\.js"><\/script>/);
    assert.doesNotMatch(page.body, /__li-talk\/edit\.js/, '教程自己引入了 edit.js，不再插一份');
    assert.equal((await http(s.port, 'GET', '/')).body, page.body, '/ 指向教程');
    for (const p of ['/engine/core.js', '/engine/edit.js', '/scenes/watercolor.js', '/mascots/duoduo.js', '/tour/slides/ch1.js']) assert.equal((await http(s.port, 'GET', p)).status, 200, p);
    assert.equal((await http(s.port, 'GET', '/tour/.li-talk/serve.json')).status, 403);
    assert.equal((await http(s.port, 'GET', '/.li-talk/edits.json')).status, 403);
    // 双击打开的教程切过来：跳到 /tour/index.html，停在同一页
    const r = await http(s.port, 'POST', '/__li-talk/carry?token=tok', { body: 'items=%5B%5D&to=index.html%233', type: FORM });
    assert.equal(r.headers.location, '/tour/index.html?edit=tok&carried=0#3');
  } finally { await s.close(); }
});

test('mergeItems：同一处的修改只留最后改的（at 大的），讲词按拍分开', () => {
  const n = (beat, at, text) => ({ page: 'g1', no: 1, path: 'notes', kind: 'notes', beat, at, before: { text: '' }, after: { text } });
  const out = mergeItems([n(1, 10, '甲'), n(2, 10, '乙')], [n(1, 20, '甲新'), n(2, 5, '乙旧'), n(3, 1, '丙')]);
  assert.deepEqual(out.map(i => i.after.text), ['甲新', '乙', '丙']);
});

test('serve：carry（双击打开的页面切过来）要口令、只收表单；离线修改并进修改记录，303 跳到在线编辑的同一页；推 edits', async () => {
  const dir = deck();
  const logs = [];
  const s = await startServer(dir, { token: 'tok', log: l => logs.push(l) });
  const got = sse(s.port, 'other');
  try {
    await sleep(300);
    writeEdits(dir, { version: 1, items: [{ ...ITEMS[0], id: 'a', at: 100 }, { ...ITEMS[1], id: 'b', at: 300 }] });
    const offline = [
      { ...ITEMS[0], id: 'x', at: 200, after: { text: '离线改的' } },                     // 同一处、离线的更新：换成离线的
      { ...ITEMS[1], id: 'y', at: 50, after: { left: 1, top: 1, width: 900, height: 60 } }, // 同一处、离线的更旧：留服务上的
      { ...ITEMS[2], id: 'z', at: 400 },                                                    // 新的一处
      { kind: 'bad' },
    ];
    const body = new URLSearchParams({ items: JSON.stringify(offline), to: 'index.html?foo=1&edit=old#3', mode: 'polish' }).toString();
    assert.equal((await http(s.port, 'POST', '/__li-talk/carry', { body, type: FORM })).status, 403);
    assert.equal((await http(s.port, 'POST', '/__li-talk/carry?token=tok', { body, type: 'application/json' })).status, 415);
    assert.equal(readEdits(dir).items.length, 2, '口令不对、不是表单的不动修改记录');
    const r = await http(s.port, 'POST', '/__li-talk/carry?token=tok', { body, type: FORM });
    assert.equal(r.status, 303);
    assert.equal(r.headers.location, '/index.html?foo=1&edit=tok&carried=3&mode=polish#3');
    const items = readEdits(dir).items;
    assert.deepEqual(items.map(i => i.id).sort(), ['b', 'x', 'z']);
    assert.equal(items.find(i => i.id === 'x').after.text, '离线改的');
    for (let i = 0; i < 30 && !got.includes('edits'); i++) await sleep(100);
    assert.ok(got.includes('edits'), '在线编辑的页面收到 edits，刷新读回最新的');
    assert.match(logs.join('\n'), /切到了在线编辑，带来离线时的 3 处修改/);
    // 跳去哪：别的网站、不存在的页面一律换成 index.html；带回 #页号
    const to = async t => (await http(s.port, 'POST', '/__li-talk/carry?token=tok', { body: new URLSearchParams({ to: t }).toString(), type: FORM })).headers.location;
    assert.equal(await to('//evil.example/x.html#2'), '/index.html?edit=tok&carried=0');
    assert.equal(await to('http://evil.example/index.html#2'), '/index.html?edit=tok&carried=0');
    assert.equal(await to('nope.html#2'), '/index.html?edit=tok&carried=0');
    assert.equal(await to('../index.html#p05/2'), '/index.html?edit=tok&carried=0#p05/2');
    assert.equal(await to(''), '/index.html?edit=tok&carried=0');
  } finally { got.close(); await s.close(); }
});

test('serve：一页保存了修改，给别的页面推 edits，不推给它自己', async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const a = sse(s.port, 'pageA'), b = sse(s.port, 'pageB');
  try {
    await sleep(300);
    const r = await http(s.port, 'POST', '/__li-talk/edits?token=tok', { body: JSON.stringify({ client: 'pageA', items: ITEMS }), type: 'application/json' });
    assert.equal(r.status, 200);
    for (let i = 0; i < 30 && !b.includes('edits'); i++) await sleep(100);
    assert.ok(b.includes('edits'), '别的页面收到 edits');
    await sleep(200);
    assert.ok(!a.includes('edits'), '保存的那一页自己不收');
  } finally { a.close(); b.close(); await s.close(); }
});

test('serve 命令：心跳写 .li-talk/serve.js，结束时删掉；开浏览器前等一会儿，有双击打开的页面切过来就不另开', async () => {
  const read = file => { const m = /^window\.__liTalkServe = (\{.*\});\n$/.exec(readFileSync(file, 'utf8')); return m && JSON.parse(m[1]); };
  // 没有页面切过来：等完再打开浏览器
  let dir = deck(), opened = null;
  const logs = [];
  const ac = new AbortController();
  let p = runServe({ _: [dir] }, { env: {}, log: l => logs.push(l), signal: ac.signal, heartbeat: 100, openWait: 400, opener: async u => { opened = u; return true; } });
  const js = join(dir, '.li-talk', 'serve.js');
  for (let i = 0; i < 50 && !existsSync(js); i++) await sleep(50);
  const r1 = read(js);
  assert.ok(r1 && r1.port > 0 && r1.token.length >= 16 && Math.abs(Date.now() - r1.at) < 2000, readFileSync(js, 'utf8'));
  assert.equal(opened, null, '还在等');
  await sleep(300);
  assert.ok(read(js).at > r1.at, '心跳：时刻一直在更新');
  for (let i = 0; i < 40 && !opened; i++) await sleep(50);
  assert.match(String(opened), new RegExp(`\\?edit=${r1.token}$`));
  ac.abort();
  assert.equal(await p, 0);
  assert.ok(!existsSync(js), '结束时删掉 serve.js');

  // 等的时候有页面切过来（carry）：不另开浏览器
  dir = deck(); opened = null; logs.length = 0;
  const ac2 = new AbortController();
  p = runServe({ _: [dir] }, { env: {}, log: l => logs.push(l), signal: ac2.signal, openWait: 5000, opener: async u => { opened = u; return true; } });
  const info = join(dir, '.li-talk', 'serve.json');
  for (let i = 0; i < 50 && !existsSync(info); i++) await sleep(50);
  const rec = JSON.parse(readFileSync(info, 'utf8'));
  const r = await http(rec.port, 'POST', `/__li-talk/carry?token=${rec.token}`, { body: 'items=%5B%5D&to=index.html%232', type: FORM });
  assert.equal(r.status, 303);
  for (let i = 0; i < 40 && !logs.some(l => /没有另开浏览器/.test(l)); i++) await sleep(50);
  assert.ok(logs.some(l => /没有另开浏览器/.test(l)), logs.join('\n'));
  assert.equal(opened, null);
  ac2.abort();
  assert.equal(await p, 0);
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
    assert.match(st0.bar, /未改动.*通知 AI 修改/);
    assert.equal(await b.evaluate(`!!document.querySelector('.lt-edit-bar .lt-edit-exit[data-tip^="退出编辑"]') && !!document.querySelector('.lt-edit-bar .lt-edit-undo[data-tip="撤销 Ctrl+Z"]')`), true, '编辑条上是带悬停提示的图标按钮');
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
    assert.match(await ev(`Deck._.editState().bar.includes('AI 正在改') && Deck._.editState().bar`), /AI 正在改/);

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
    // 按 E 时去读 .li-talk/serve.js（没开服务，读不到）：课件的报错记录里不能留下这条
    assert.equal(await b.evaluate(`(window.__deckErrors || []).filter(e => /serve\\.js/.test(e)).length`), 0, '读不到 serve.js 不算课件报错');
    // 离线编辑：底部一条提示，引导用户对 AI 说「我要在线改这份课件」
    assert.equal(await b.evaluate(`(() => { const h = document.querySelector('.lt-edit-hint'); return !!h && !h.hidden && h.textContent.includes('我要在线改这份课件'); })()`), true, '离线编辑要出引导提示');
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

// 轮询页面上的一个表达式，页面跳转、刷新时读不到就接着试
const poller = b => async (expr, ms = 15000) => {
  const start = Date.now();
  for (;;) {
    const v = await b.evaluate(expr, 3000).catch(() => null);
    if (v || Date.now() - start > ms) return v;
    await sleep(100);
  }
};
const pressE = b => b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
const ONLINE = `location.protocol === 'http:' && window.Deck && Deck._.editState && Deck._.editState().on && Deck._.editState().server`;

test('真实浏览器：双击打开的页面，服务开着时按 E 切到在线编辑（同一页、离线的修改带过去）；心跳停了的 serve.js 不算；别的页面存了修改，这页刷新读回来', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 120000 }, async () => {
  const dir = deck();
  const b = await openBrowser(browser);
  const ev = poller(b);
  const ac = new AbortController();
  let p = null;
  try {
    // serve 被强行结束时留下的 serve.js：时刻停在一分钟前，按 E 还是离线编辑
    mkdirSync(join(dir, '.li-talk'), { recursive: true });
    writeFileSync(join(dir, '.li-talk', 'serve.js'), serveJsText(1, 'old', Date.now() - 60000));
    await b.goto(pathToFileURL(join(dir, 'index.html')).href + '#3', { w: 1280, h: 720 });
    assert.ok(await ev(`window.Deck && Deck.page && Deck.page.no === 3 && !document.body.classList.contains('loading')`));
    await pressE(b);
    assert.ok(await ev('Deck._.editState().on'));
    assert.equal(await b.evaluate(`location.protocol + Deck._.editState().server`), 'file:false', '心跳停了：离线编辑');
    // 离线改一处：选中第 3 页的引语，Delete 隐藏；再按 E 退出
    const q = await b.evaluate(`(() => { const r = document.querySelector('#slide-g3 .g3-quote').getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 }; })()`);
    await b.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: q.x, y: q.y, button: 'left', buttons: 1, clickCount: 1 });
    await b.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: q.x, y: q.y, button: 'left', buttons: 0, clickCount: 1 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
    await sleep(600);
    await pressE(b);
    assert.ok(await ev('!Deck._.editState().on'));
    assert.equal(await b.evaluate(`JSON.parse(localStorage.getItem('li-talk-edits:' + document.title)).items.length`), 1);

    // AI 开了服务（不打开浏览器）；用户在这页翻到第 2 页再按 E：直接切到在线编辑
    p = runServe({ _: [dir], 'no-open': true }, { log: () => {}, signal: ac.signal });
    const info = join(dir, '.li-talk', 'serve.json');
    for (let i = 0; i < 50 && !existsSync(info); i++) await sleep(50);
    const rec = JSON.parse(readFileSync(info, 'utf8'));
    await b.evaluate('Deck.go(2)');
    assert.equal(await b.evaluate('Deck.page.no'), 2);
    await pressE(b);
    assert.ok(await ev(ONLINE), '切到了在线编辑');
    assert.equal(await b.evaluate('Deck.page.no'), 2, '停在切过来时那一页');
    assert.equal(await b.evaluate('location.search'), `?edit=${rec.token}`, '地址里的 carried、mode 读完就去掉');
    assert.match(await b.evaluate(`document.querySelector('.toast, #toast, [class*="toast"]') ? document.querySelector('.toast, #toast, [class*="toast"]').textContent : document.body.textContent`), /离线时的 1 处改动也带过来了/);
    const items = readEdits(dir).items;
    assert.deepEqual(items.map(i => [i.page, i.kind]), [['g3', 'hide']], '离线的修改进了修改记录');
    assert.equal(await b.evaluate(`document.querySelector('#slide-g3 .g3-quote').hasAttribute('data-lt-hide')`), true, '带过来的修改摆在页面上');
    assert.match(await b.evaluate('Deck._.editState().bar'), /1 处改动.*通知 AI 修改/);

    // 另一个标签页存了修改（服务推 edits）：这页刷新读回最新的，不拿手里的旧记录盖回去
    await b.evaluate('window.__before = 1');
    const both = items.concat([{ ...ITEMS[0], id: 'other', at: Date.now() }]);
    await http(rec.port, 'POST', `/__li-talk/edits?token=${rec.token}`, { body: JSON.stringify({ client: 'other', items: both }), type: 'application/json' });
    assert.ok(await ev(`!window.__before && ${ONLINE} && Deck._.editState().items.length === 2`), '刷新读回了另一页存的');
    assert.equal(await b.evaluate('Deck.page.no'), 2, '刷新后停在原来那页');
    await sleep(800);
    assert.equal(readEdits(dir).items.length, 2, '没有被这页盖回去');
  } finally {
    await b.close();
    ac.abort();
    if (p) await p;
  }
});

// 普通的静态网站：把 dir 原样放在 host 上（127.0.0.2 这类主机名不是 localhost / 127.0.0.1，当成别人的网站）
const staticSite = (dir, host) => new Promise(ok => {
  const srv = createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    try { const body = readFileSync(join(dir, rel)); res.writeHead(200, { 'Content-Type': /\.html$/.test(rel) ? 'text/html; charset=utf-8' : /\.js$/.test(rel) ? 'text/javascript' : /\.css$/.test(rel) ? 'text/css' : 'application/octet-stream' }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  srv.listen(0, host, () => ok(srv));
});

test('真实浏览器：从网站上打开的课件（不是本机、不带口令）按 E 不进编辑；本机预览（127.0.0.1）照样能离线编辑', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const site = host => staticSite(dir, host);
  const web = await site('127.0.0.2'), local = await site('127.0.0.1');
  const b = await openBrowser(browser);
  const ev = poller(b);
  try {
    for (const [srv, host, want] of [[web, '127.0.0.2', false], [local, '127.0.0.1', true]]) {
      await b.goto(`http://${host}:${srv.address().port}/index.html#2`, { w: 1280, h: 720 });
      assert.ok(await ev(`window.Deck && Deck.page && !document.body.classList.contains('loading')`));
      await pressE(b);
      await sleep(600);
      assert.equal(await b.evaluate('Deck._.editState().on'), want, `${host}：按 E ${want ? '要' : '不要'}进编辑`);
      assert.equal(await b.evaluate(`!!document.querySelector('.lt-edit-bar')`), want);
      // 网站上按 E 不是没反应：底部提示一句「只能看，在本机打开才能改」，免得看的人以为坏了
      if (!want) assert.match(await b.evaluate(`(document.getElementById('toast') || {}).textContent || ''`), /只能看.*本机/);
    }
  } finally {
    await b.close();
    web.close(); local.close();
  }
});

test('真实浏览器：介绍网站上的教程和样册（页面带 <meta name="li-talk-edit" content="demo">）按 E 进「体验编辑」：能改，不出交给 AI 的按钮，改动不存，刷新就没了', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const f = join(dir, 'index.html');
  writeFileSync(f, readFileSync(f, 'utf8').replace('<head>', '<head>\n<meta name="li-talk-edit" content="demo">'));
  const web = await staticSite(dir, '127.0.0.2');
  const b = await openBrowser(browser);
  const ev = poller(b);
  const url = `http://127.0.0.2:${web.address().port}/index.html#2`;
  try {
    await b.goto(url, { w: 1280, h: 720 });
    assert.ok(await ev(`window.Deck && Deck.page && !document.body.classList.contains('loading')`));
    await pressE(b);
    assert.ok(await ev('Deck._.editState().on'), '按 E 进了编辑');
    assert.equal(await b.evaluate(`!!document.querySelector('.lt-edit-go') || !!document.querySelector('.lt-edit-mode')`), false, '没有「复制修改给 AI」和合并方式');
    assert.equal(await b.evaluate(`(document.querySelector('.lt-edit-demo-tag') || {}).textContent`), '体验编辑');
    const hint = await b.evaluate(`(() => { const h = document.querySelector('.lt-edit-hint'); return h && !h.hidden ? h.textContent : ''; })()`);
    assert.match(hint, /体验编辑/);
    assert.match(hint, /刷新就没了/);
    // 改一处：单击一张卡片选中，按 → 挪 1px
    const pt = JSON.parse(await b.evaluate(`JSON.stringify((() => { const r = document.querySelector('#slide-g2 .card:nth-of-type(3)').getBoundingClientRect(); return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; })())`));
    await b.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt[0], y: pt[1], button: 'left', buttons: 1, clickCount: 1 });
    await b.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt[0], y: pt[1], button: 'left', buttons: 0, clickCount: 1 });
    await sleep(200);
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    assert.ok(await ev('Deck._.editState().items.length === 1'), '改动记下来了');
    assert.match(await ev(`Deck._.editState().bar.includes('1 处改动') && Deck._.editState().bar`), /1 处改动/);
    await sleep(1500);   // 过了自动保存的时间
    assert.equal(await b.evaluate(`Object.keys(localStorage).filter(k => k.startsWith('li-talk-edits:')).length`), 0, '体验编辑不往 localStorage 存');
    // 刷新：改动没了，再按 E 也是从头开始
    await b.call('Page.reload', {});
    assert.ok(await ev(`window.Deck && Deck.page && !document.body.classList.contains('loading')`));
    await pressE(b);
    assert.ok(await ev('Deck._.editState().on'));
    assert.equal(await b.evaluate('Deck._.editState().items.length'), 0, '刷新后改动没了');
  } finally {
    await b.close();
    web.close();
  }
});

test('真实浏览器：离线改完马上离开页面（还没到自动保存的时候），改动照样存进 localStorage', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const b = await openBrowser(browser);
  try {
    const url = pathToFileURL(join(dir, 'index.html')).href;
    await b.goto(url + '#3', { w: 1280, h: 720 });
    const ev = poller(b);
    assert.ok(await ev(`window.Deck && Deck.page && Deck.page.no === 3 && !document.body.classList.contains('loading')`));
    await pressE(b);
    assert.ok(await ev('Deck._.editState().on'));
    const p = await b.evaluate(`(() => { const r = document.querySelector('#slide-g3 .g3-quote').getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 }; })()`);
    await b.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', buttons: 1, clickCount: 1 });
    await b.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: 1 });
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Delete', code: 'Delete', windowsVirtualKeyCode: 46 });
    // 改完立刻跳走（自动保存要等 400 毫秒）
    await b.call('Page.navigate', { url: 'about:blank' });
    await b.goto(url + '#3', { w: 1280, h: 720 });
    const saved = await b.evaluate(`JSON.parse(localStorage.getItem('li-talk-edits:' + document.title) || '{"items":[]}').items.map(i => i.kind)`);
    assert.deepEqual(saved, ['hide'], '离开页面时（pagehide）把还没存的存掉了');
  } finally { await b.close(); }
});

test('真实浏览器：风格写了 :hover 上浮、:active 按下缩小时，悬停不影响量位置；缩小后再拖动，拖的过程中倍数不变', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 90000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const ev = poller(b);
  const mouse = (type, x, y, buttons = type === 'mouseReleased' ? 0 : 1) => b.call('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' && !buttons ? 'none' : 'left', buttons, clickCount: 1 });
  const rect = sel => b.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height }; })()`);
  const CARD = '#slide-g2 .card:nth-of-type(3)';
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    assert.ok(await ev(ONLINE));
    // 照水彩风格的写法：悬停上浮、转一下，按下去缩一点（优先级比编辑器的预览高）
    await b.evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>[data-scene] .card:hover{translate:0 -6px;rotate:3deg} [data-scene] :is(.card,.cell,.steps>li):active{scale:.985}</style>')`);
    const r0 = await rect(CARD);
    await mouse('mouseMoved', r0.x, r0.y, 0);
    await sleep(300);
    const r1 = await rect(CARD);
    assert.deepEqual([r1.l, r1.t, r1.w, r1.h].map(Math.round), [r0.l, r0.t, r0.w, r0.h].map(Math.round), '悬停时卡片不上浮、不转');
    // 选中，拖右下角把手往里收：整块缩小
    await mouse('mousePressed', r0.x, r0.y); await mouse('mouseReleased', r0.x, r0.y);
    const h = await rect('.lt-edit-sel .lt-edit-h[data-c="se"]');
    await mouse('mousePressed', h.x, h.y);
    for (let i = 1; i <= 5; i++) await mouse('mouseMoved', h.x - (h.x - r0.x) * 0.1 * i, h.y - (h.y - r0.y) * 0.1 * i);
    await mouse('mouseReleased', h.x - (h.x - r0.x) * 0.5, h.y - (h.y - r0.y) * 0.5);
    const want = await b.evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(CARD)})).getPropertyValue('--lt-scale').trim()`);
    assert.ok(+want > 0.3 && +want < 0.8, '缩小了：' + want);
    const scaleNow = () => b.evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(CARD)})).scale`);
    assert.equal(await scaleNow(), want);
    // 按住卡片拖动：拖的过程中（:active 生效时）倍数不变，松手后也不变
    const c = await rect(CARD);
    await mouse('mousePressed', c.x, c.y);
    for (let i = 1; i <= 4; i++) await mouse('mouseMoved', c.x + 10 * i, c.y + 5 * i);
    assert.equal(await scaleNow(), want, '拖动中倍数不变（不被 :active 盖掉）');
    await mouse('mouseReleased', c.x + 40, c.y + 20);
    assert.equal(await scaleNow(), want, '松手后倍数不变');
    const st = await b.evaluate('Deck._.editState()');
    assert.deepEqual(st.items.map(i => i.kind).sort(), ['box', 'scale']);
    // 改字照常：双击卡片里的标题，挡板让开，能放光标打字
    const t = await rect(CARD + ' h3');
    for (let k = 1; k <= 2; k++) { await mouse('mousePressed', t.x, t.y); await mouse('mouseReleased', t.x, t.y); }
    assert.ok(await ev(`!!document.querySelector('.lt-edit-text') && document.querySelector('.lt-edit-shield').hidden`), '双击改字，挡板让开');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.ok(await ev(`!document.querySelector('.lt-edit-text') && !document.querySelector('.lt-edit-shield').hidden`), '改完字挡板回来');
  } finally {
    await b.close();
    await s.close();
  }
});

test('真实浏览器：行内元素（带类名的 <b>）能挪动，照写里带 display:inline-block、撤销后换回行内；很小的块选中后按在中间是拖动不是缩放', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 90000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const ev = poller(b);
  const mouse = (type, x, y, buttons = type === 'mouseReleased' ? 0 : 1) => b.call('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' && !buttons ? 'none' : 'left', buttons, clickCount: 1 });
  const rect = sel => b.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height }; })()`);
  const drag = async (x, y, dx, dy) => { await mouse('mousePressed', x, y); for (let i = 1; i <= 6; i++) await mouse('mouseMoved', x + dx * i / 6, y + dy * i / 6); await mouse('mouseReleased', x + dx, y + dy); };
  const HL = '#slide-g2 .g2-hl', DOT = '#slide-g2 .g2-dot';
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    assert.ok(await ev(ONLINE));
    // 刚进编辑模式，提示条还盖在顶部：点它下面的大标题照样能选中（提示条不接鼠标）
    const tt = await rect('#slide-g2 .s-title');
    const toast = await b.evaluate(`(() => { const t = document.getElementById('toast'), r = t.getBoundingClientRect(); return { show: t.classList.contains('show'), l: r.left, t: r.top, r: r.right, b: r.bottom }; })()`);
    assert.ok(toast.show && tt.y > toast.t && tt.y < toast.b, `提示条正盖在大标题上（这一步才测得到）：${JSON.stringify([toast, tt])}`);
    const tx = Math.max(tt.l + 10, Math.min(tt.l + tt.w - 10, (toast.l + toast.r) / 2));
    await mouse('mousePressed', tx, tt.y); await mouse('mouseReleased', tx, tt.y);
    assert.ok(await ev(`Deck._.editSel() === document.querySelector('#slide-g2 .s-title')`), '提示条下面的大标题点得中');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(550);
    await b.evaluate(`(() => {
      document.querySelector('#slide-g2 .card:nth-of-type(1) p').innerHTML = '按页写下<b class="g2-hl">要讲的话</b>';
      document.querySelector('#slide-g2').insertAdjacentHTML('beforeend', '<i class="abs g2-dot" style="left:300px;top:900px;width:10px;height:10px;background:#c00"></i>');
    })()`);
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(HL)})).display`), 'inline');

    // 行内的 <b>：按住拖，跟着鼠标走（以前 translate 对行内元素不起作用，选中框动了字不动）
    const h0 = await rect(HL);
    await drag(h0.x, h0.y, 30, 18);
    const h1 = await rect(HL);
    assert.ok(Math.abs(h1.l - h0.l - 30) <= 1.5 && Math.abs(h1.t - h0.t - 18) <= 2.5, `行内元素跟着鼠标挪了：${JSON.stringify([h0, h1])}`);
    const box = (await b.evaluate('Deck._.editState()')).items.find(i => i.kind === 'box');
    assert.ok(box, '记下了挪位置');
    assert.match(box.css, /^display:inline-block;/, '照写里带 display:inline-block：' + box.css);
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'z', code: 'KeyZ', windowsVirtualKeyCode: 90, modifiers: 2 });
    assert.ok(await ev(`!Deck._.editState().items.length && getComputedStyle(document.querySelector(${JSON.stringify(HL)})).display === 'inline'`), '撤销后换回行内');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

    // 10px 的小块：选中后四个把手在框外面，按在它中间是拖动
    const d0 = await rect(DOT);
    await mouse('mousePressed', d0.x, d0.y); await mouse('mouseReleased', d0.x, d0.y);
    assert.ok(await ev(`!!document.querySelector('.lt-edit-sel.lt-edit-small:not([hidden])')`), '小块的选中框把手放在外面');
    assert.equal(await b.evaluate(`!!document.elementFromPoint(${d0.x}, ${d0.y}).closest('.lt-edit-h')`), false, '小块中间没被把手盖住');
    await sleep(550);   // 和刚才的单击隔开，免得算成双击
    await drag(d0.x, d0.y, 30, 18);
    const d1 = await rect(DOT), items = (await b.evaluate('Deck._.editState()')).items;
    assert.ok(Math.abs(d1.l - d0.l - 30) <= 1.5 && Math.abs(d1.t - d0.t - 18) <= 1.5, `小块跟着鼠标挪了：${JSON.stringify([d0, d1])}`);
    assert.deepEqual(items.map(i => i.kind), ['box'], '是挪位置，不是缩放');
  } finally {
    await b.close();
    await s.close();
  }
});

test('真实浏览器：离线编辑时 AI 开了服务，这一页自己切到在线编辑，serve 不另开浏览器', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 90000 }, async () => {
  const dir = deck();
  const b = await openBrowser(browser);
  const ev = poller(b);
  const ac = new AbortController();
  const logs = [];
  let opened = null, p = null;
  try {
    await b.goto(pathToFileURL(join(dir, 'index.html')).href + '#2', { w: 1280, h: 720 });
    assert.ok(await ev(`window.Deck && Deck.page && Deck.page.no === 2 && !document.body.classList.contains('loading')`));
    await pressE(b);
    assert.ok(await ev('Deck._.editState().on'));
    assert.equal(await b.evaluate('Deck._.editState().server'), false);
    p = runServe({ _: [dir] }, { env: {}, log: l => logs.push(l), signal: ac.signal, openWait: 8000, opener: async u => { opened = u; return true; } });
    assert.ok(await ev(`${ONLINE} && Deck.page.no === 2`, 15000), '自己切到了在线编辑，停在同一页');
    for (let i = 0; i < 50 && !logs.some(l => /没有另开浏览器/.test(l)); i++) await sleep(100);
    assert.ok(logs.some(l => /没有另开浏览器/.test(l)), logs.join('\n'));
    assert.equal(opened, null, '不另开浏览器');
  } finally {
    await b.close();
    ac.abort();
    if (p) await p;
  }
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
    assert.equal(await b.evaluate(`!document.querySelector('.lt-edit-hint')`), true, '连着编辑服务时不出离线提示');
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
    assert.match(await b.evaluate(`document.querySelector('.lt-edit-beat').textContent`), /拍 2/);
    await tool('[data-act=beat][data-v="1"]');
    assert.match(await b.evaluate(`document.querySelector('.lt-edit-beat').textContent`), /拍 3/);
    // 选中的块角标不画（拍号在工具栏上）；选外层以后，卡片的角标显示「拍 2→3」
    await key('ArrowUp', 'ArrowUp', 38, 1);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('.lt-edit-badge')].some(x => x.textContent === '拍 2→3')`));
    await key('ArrowDown', 'ArrowDown', 40, 1);
    // 选中的卡片里有标题和正文两段字：字号、颜色那几组不出现
    assert.equal(await b.evaluate(`document.querySelector('.lt-edit-tools .lt-edit-g-text').hidden`), true, '选中的块里有好几段字时不放字号、颜色');
    // 样式：双击第二张卡片的标题进入改字，字号「标题」、颜色主色、加粗
    const t2 = await center('#slide-g2 .card:nth-of-type(2) h3');
    await sleep(500);
    await click(t2.x, t2.y, 2);
    assert.ok(await ev(`!!document.querySelector('.lt-edit-text')`));
    assert.equal(await b.evaluate(`document.querySelector('.lt-edit-tools .lt-edit-g-text').hidden`), false, '改字时放字号、颜色');
    await b.evaluate(`document.querySelector('.lt-edit-pop [data-act=fs][data-v="var(--fs-lg)"]').click()`);
    await tool('[data-act=color][data-v="--accent"]');
    await tool('[data-act=bold]');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('#slide-g2 .card:nth-of-type(2) h3')).fontSize`), '50px');
    await key('Enter', 'Enter', 13);
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
    // 标题本来就是粗体，点「加粗」是取消加粗
    assert.deepEqual(kinds.style.after, { fontSize: 'var(--fs-lg)', color: 'var(--accent)', fontWeight: +kinds.style.before.fontWeight >= 600 ? '400' : '700', textAlign: kinds.style.before.textAlign });
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
    assert.equal(await b.evaluate(`!document.querySelector('.lt-edit-hint')`), true, '连着编辑服务时不出离线提示');
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
    // 字号选数字：卡片里有两段字，先双击标题进入改字
    const H = C2 + ' h3', fs0 = await b.evaluate(`getComputedStyle(document.querySelector('${H}')).fontSize`);
    const t2 = await b.evaluate(`(() => { const r = document.querySelector('${H}').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    await sleep(500);
    for (let k = 1; k <= 2; k++) { await mouse('mousePressed', t2.x, t2.y, { clickCount: k }); await mouse('mouseReleased', t2.x, t2.y, { clickCount: k }); }
    assert.ok(await ev(`!!document.querySelector('.lt-edit-text')`));
    await b.evaluate(`document.querySelector('.lt-edit-pop [data-act=fs][data-v="64px"]').click()`);
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${H}')).fontSize`), '64px');
    assert.equal((await st()).items.find(i => i.kind === 'style').after.fontSize, '64px');
    await key('Enter', 'Enter', 13);
    // 撤销三步、重做一步
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), 'box,scale');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${H}')).fontSize`), fs0);
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), 'scale');
    await key('z', 'KeyZ', 90, 2);
    assert.equal(await kinds(), '');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('${C2}')).scale`), 'none', '撤销到底，页面也回到原样');
    await key('y', 'KeyY', 89, 2);
    assert.equal(await kinds(), 'scale');
    await key('z', 'KeyZ', 90, 2 | 8);   // Ctrl+Shift+Z 也是重做
    assert.equal(await kinds(), 'box,scale');
    // 还原这一块（改字结束后没有选中，先重新选中卡片）
    await sleep(500);
    const c2b = await b.evaluate(`(() => { const r = document.querySelector('${C2}').getBoundingClientRect(); return { x: r.left + 8, y: r.bottom - 8 }; })()`);
    await mouse('mousePressed', c2b.x, c2b.y); await mouse('mouseReleased', c2b.x, c2b.y);
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

test('真实浏览器：旋转过的块，选中框跟着转、和元素重合，拖动按旋转后的坐标算；深色风格用深色玻璃面板，照样能选中', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 90000 }, async () => {
  const dir = deck();
  // 第 1 页的便签转 -6°；第 2 页换成黑板（深色风格）
  writeFileSync(join(dir, 'slides', 'ch1.css'), readFileSync(join(dir, 'slides', 'ch1.css'), 'utf8') + '\n[data-id="g1"] .g1-card{rotate:-6deg}\n');
  for (const f of ['board.js', 'board.css']) cpSync(join(TPL, 'scenes', f), join(dir, 'scenes', f));
  const html = join(dir, 'index.html');
  writeFileSync(html, readFileSync(html, 'utf8').replace('<script src="scenes/paper.js"></script>', '<script src="scenes/paper.js"></script>\n<script src="scenes/board.js"></script>')
    .replace('<link rel="stylesheet" href="scenes/paper.css">', '<link rel="stylesheet" href="scenes/paper.css">\n<link rel="stylesheet" href="scenes/board.css">'));
  const js = join(dir, 'slides', 'ch1.js');
  writeFileSync(js, readFileSync(js, 'utf8').replace("topic: '一页正常的内容',\n    scene: 'paper',", "topic: '一页正常的内容',\n    scene: 'board',"));
  const b = await openBrowser(browser);
  const mouse = (type, x, y, extra = {}) => b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  const rect = sel => b.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
  try {
    const url = new URL('file:///' + join(dir, 'index.html').replace(/\\/g, '/'));
    await b.goto(url.href + '#1', { w: 1280, h: 720 });
    for (let i = 0; i < 60 && !(await b.evaluate(`window.Deck && Deck.page && !document.body.classList.contains('loading')`)); i++) await sleep(100);
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'e', code: 'KeyE', windowsVirtualKeyCode: 69 });
    await sleep(300);
    const c = await rect('#slide-g1 .g1-card');
    await mouse('mousePressed', c.cx, c.cy); await mouse('mouseReleased', c.cx, c.cy);
    await sleep(200);
    assert.equal((await b.evaluate('Deck._.editState()')).sel, 'div.card');
    assert.match(await b.evaluate(`document.querySelector('.lt-edit-sel').style.transform`), /rotate\(-6deg\)/, '选中框跟着转');
    let s = await rect('.lt-edit-sel'), e = await rect('#slide-g1 .g1-card');
    assert.ok(Math.abs(s.x - e.x) < 2 && Math.abs(s.y - e.y) < 2 && Math.abs(s.w - e.w) < 2 && Math.abs(s.h - e.h) < 2, `框和元素重合：${JSON.stringify([s, e])}`);
    // 拖动：在舞台上往右拖 60 屏幕像素，元素也往右走 60（不会因为旋转走歪）
    await mouse('mousePressed', c.cx, c.cy);
    for (let i = 1; i <= 4; i++) await mouse('mouseMoved', c.cx + 15 * i, c.cy);
    await mouse('mouseReleased', c.cx + 60, c.cy);
    const e2 = await rect('#slide-g1 .g1-card');
    assert.ok(Math.abs(e2.cx - e.cx - 60) < 1.5 && Math.abs(e2.cy - e.cy) < 1.5, `拖动后中心挪了 ${e2.cx - e.cx}, ${e2.cy - e.cy}`);
    // 整块缩放：框和元素仍然重合
    const h = await rect('.lt-edit-h[data-c=se]');
    await mouse('mousePressed', h.cx, h.cy);
    for (let i = 1; i <= 4; i++) await mouse('mouseMoved', h.cx + 10 * i, h.cy + 6 * i);
    await mouse('mouseReleased', h.cx + 40, h.cy + 24);
    s = await rect('.lt-edit-sel'); e = await rect('#slide-g1 .g1-card');
    assert.ok(Math.abs(s.x - e.x) < 2 && Math.abs(s.y - e.y) < 2 && Math.abs(s.w - e.w) < 2 && Math.abs(s.h - e.h) < 2, `缩放后框和元素重合：${JSON.stringify([s, e])}`);
    assert.equal(await b.evaluate(`document.body.classList.contains('lt-darkui')`), false, '浅色风格用浅色玻璃');
    // 翻到黑板页：深色玻璃，强调色取风格的 --accent，点卡片照样能选中
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });   // 先取消选中，方向键才是翻页
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await sleep(300);
    assert.equal(await b.evaluate('Deck.page.no'), 2);
    assert.equal(await b.evaluate(`document.body.classList.contains('lt-darkui')`), true, '深色风格用深色玻璃');
    assert.equal(await b.evaluate(`document.body.style.getPropertyValue('--lt-accent').trim() === getComputedStyle(document.querySelector('#slide-g2')).getPropertyValue('--accent').trim()`), true);
    const c2 = await rect('#slide-g2 .card:nth-of-type(2)');
    await mouse('mousePressed', c2.cx, c2.cy); await mouse('mouseReleased', c2.cx, c2.cy);
    await sleep(200);
    assert.equal((await b.evaluate('Deck._.editState()')).sel, 'div.grid>div.card:nth-of-type(2)');
    assert.equal((await b.evaluate('Deck._.editState()')).tools, true);
  } finally { await b.close(); }
});

test('合并核对的报告：照我改的对不上算错误，润色算提醒，AI 重新优化不核对，找不到的单列', async () => {
  const { formatVerify } = await import('../skills/li-talk-skills/scripts/lib/check.mjs');
  const bad = { no: 2, page: 'g2', path: 'div.card', hint: '第二张', kind: 'box', what: 'left 应是 800，现在 920' };
  const lost = { no: 3, page: 'g3', path: 'p.x', hint: '一句话', kind: 'text', missing: true };
  const ex = formatVerify({ mode: 'exact', list: [bad, lost], count: 2 });
  assert.equal(ex.errors, 1); assert.equal(ex.warnings, 0);
  assert.match(ex.text, /必须改到对上/); assert.match(ex.text, /left 应是 800，现在 920/); assert.match(ex.text, /找不到/);
  const po = formatVerify({ mode: 'polish', list: [bad], count: 1 });
  assert.equal(po.errors, 0); assert.equal(po.warnings, 1); assert.match(po.text, /告诉用户/);
  assert.equal(formatVerify({ mode: 'ai', skipped: true }).errors, 0);
  assert.match(formatVerify({ mode: 'exact', list: [], count: 3 }).text, /3 处都和用户改的一致/);
  assert.match(formatVerify({ mode: 'exact', list: null, count: 3 }).text, /没法核对/);
  assert.equal(formatVerify(null).text, '');
});

test('真实浏览器：选中的块里再点一段字就单独选中它、单独拖；改完字回车保持选中；Alt+↑ 回到外面的块', { skip: !browser && '本机没找到 Edge / Chrome', timeout: 60000 }, async () => {
  const dir = deck();
  const s = await startServer(dir, { token: 'tok' });
  const b = await openBrowser(browser);
  const mouse = (type, x, y, extra = {}) => b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  const click = async (x, y, n = 1) => { for (let k = 1; k <= n; k++) { await mouse('mousePressed', x, y, { clickCount: k }); await mouse('mouseReleased', x, y, { clickCount: k }); } };
  const drag = async (x, y, dx, dy) => { await mouse('mousePressed', x, y); for (let i = 1; i <= 4; i++) await mouse('mouseMoved', x + dx * i / 4, y + dy * i / 4); await mouse('mouseReleased', x + dx, y + dy); };
  const center = sel => b.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const st = () => b.evaluate('Deck._.editState()');
  const C2 = '#slide-g2 .card:nth-of-type(2)';
  try {
    await b.goto(`http://127.0.0.1:${s.port}/index.html?edit=tok#2`, { w: 1280, h: 720 });
    for (let i = 0; i < 50 && !(await b.evaluate('!!(window.Deck && Deck._.editState && Deck._.editState().on)')); i++) await sleep(100);
    await sleep(300);
    const c = await b.evaluate(`(() => { const r = document.querySelector('${C2}').getBoundingClientRect(); return { x: r.left + 8, y: r.bottom - 8 }; })()`);
    await click(c.x, c.y); await sleep(200);
    assert.equal((await st()).sel, 'div.grid>div.card:nth-of-type(2)', '第一次单击选中卡片');
    const h3 = await center(C2 + ' h3');
    await sleep(500); await click(h3.x, h3.y); await sleep(200);
    assert.equal((await st()).sel, 'div.grid>div.card:nth-of-type(2)>h3', '再点标题就单独选中标题');
    await sleep(500); await drag(h3.x, h3.y, 40, 24); await sleep(200);
    const it = (await st()).items.find(x => x.kind === 'box');
    assert.equal(it.path, 'div.grid>div.card:nth-of-type(2)>h3', '拖的是标题');
    assert.match(it.css, /^position:relative;left:\d+px;top:\d+px$/);
    assert.equal(await b.evaluate(`document.querySelector('${C2}').hasAttribute('data-lt-moved')`), false, '卡片本身不动');
    // 双击第三张卡片的标题改字，回车后保持选中
    const t3 = await center('#slide-g2 .card:nth-of-type(3) h3');
    await sleep(500); await click(t3.x, t3.y, 2); await sleep(200);
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await sleep(200);
    assert.equal((await st()).sel, 'div.grid>div.card:nth-of-type(3)>h3', '改完字回车后这段字保持选中');
    await b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38, modifiers: 1 }); await sleep(200);
    assert.equal((await st()).sel, 'div.grid>div.card:nth-of-type(3)', 'Alt+↑ 回到卡片');
  } finally { await b.close(); await s.close(); }
});
