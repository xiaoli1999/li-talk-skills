// serve 命令：在线编辑用的本地服务
//   serve <课件目录> [--port N] [--no-open]
// - 只听 127.0.0.1；端口默认让系统给一个空闲的。启动时生成随机口令，写进 .li-talk/serve.json：{ port, token, pid, startedAt }，
//   再用浏览器打开 http://127.0.0.1:端口/index.html?edit=口令（--no-open 或环境变量 LI_TALK_NO_OPEN=1 时不打开）。
// - 心跳：每 2 秒把 { port, token, at } 写进 .li-talk/serve.js（一行 window.__liTalkServe = …）。双击打开（file://）的页面
//   访问不了本机服务，只能用 <script> 读这个文件：读得到、at 是最近几秒的，就知道服务开着，按 E 直接切到在线编辑；
//   正在离线编辑的页面也会自己切过去（engine/edit.js 的 serveInfo、handoff）。
// - 打开浏览器前先等 3 秒：这期间有双击打开的页面切过来了（POST carry），就不另开一个标签页。
// - 一直运行，直到被结束（Ctrl+C、结束后台任务）；结束时删掉 serve.json 和 serve.js。
// - 静态文件：只给课件目录里的文件，. 开头的目录和文件（.li-talk/ 等）不给，挡住 .. 越界；不缓存。
//   例外是 skill 自带的新手教程 template/tour/：它引用上一级的 ../engine/…，从模板目录给，页面地址是 /tour/index.html（webRoot）。
// - 返回 index.html 时，页面没引入 engine/edit.js 就在 </body> 前插一行 <script src="/__li-talk/edit.js">（取 skill 自带的），老课件也能编辑。
// - /__li-talk/ 下的接口（edit.js 以外都要带 ?token=口令，不对就 403）：
//     GET  events   SSE（带 &client=页面编号）：slides/ 或 index.html 变了推 reload；edits.json 被 edits --done 清掉时推 merged；
//                   修改记录被别的页面改了（另一个标签页保存了、双击打开的页面带来了离线修改）推 edits，页面刷新读回最新的
//     GET  edits    当前的修改记录（浏览器进编辑模式时先读回来，接着改）
//     POST edits    请求体是 { items: [...], client }，整理后写进 .li-talk/edits.json（先写临时文件再改名）；
//                   已经被 edits --done 合并掉的条目按 done 去掉（applyDone），免得浏览器把旧修改存回来；
//                   写完给别的页面（client 不同的）推 edits
//     POST carry    双击打开的页面切到在线编辑：表单（application/x-www-form-urlencoded）提交 items（离线时的修改，JSON）、
//                   to（那一页的文件名、查询串和 #页号）、mode（合并方式）。离线修改并进 edits.json（mergeItems），
//                   再 303 跳到在线编辑的页面（?edit=口令&carried=带来的条数&mode=…#页号）。file:// 页面只能这样把东西交过来
//     POST notify   把 edits.json 的 notified 设成现在，终端打印一行
//   POST 只收 JSON（Content-Type: application/json；carry 只收表单），请求体最多 1MB。Host 头只认 127.0.0.1 / localhost，挡 DNS 重绑定。
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, watch, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { UserError } from './cli.mjs';
import { TPL_DIR } from './paths.mjs';
import { applyDone, cleanItem, deckDir, mergeItems, MODE_KEYS, readEdits, writeEdits } from './edits.mjs';
import { openPath } from './open.mjs';

export const MAX_BODY = 1024 * 1024;
export const HEARTBEAT = 2000;    // serve.js 多久写一次（页面那边超过 6 秒没更新就当服务关了）
export const OPEN_WAIT = 3000;    // 打开浏览器前等多久：等正在离线编辑的页面自己切过来
const DEBOUNCE = 300;
const WATCH_DIRS = ['slides', 'samples'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.bmp': 'image/bmp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
};
export const EDIT_JS = join(TPL_DIR, 'engine', 'edit.js');
const INJECT = '<script src="/__li-talk/edit.js"></script>';

/** index.html 没引入 engine/edit.js 时，在最后一个 </body> 前插入在线编辑的脚本 */
export function injectEdit(html) {
  if (/<script[^>]+src\s*=\s*["'][^"']*engine\/edit\.js["']/i.test(html)) return html;
  const i = html.toLowerCase().lastIndexOf('</body>');
  return i < 0 ? html + '\n' + INJECT + '\n' : html.slice(0, i) + INJECT + '\n' + html.slice(i);
}

const sameToken = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * 静态文件从哪个目录给：一般就是课件目录。skill 自带的新手教程（template/tour/）引用的是上一级的 ../engine/…、../scenes/…，
 * 只给课件目录的话这些都是 404，所以课件在模板目录里、index.html 又引用了 ../ 时，从模板目录给，页面地址变成 /tour/index.html。
 * 只放宽 skill 自己的模板目录：用户的课件不会这样引用（技术边界），也不把课件目录外面的文件给出去。
 */
export function webRoot(dir, tplDir = TPL_DIR) {
  const root = resolve(dir), tpl = resolve(tplDir);
  if (!root.startsWith(tpl + sep)) return root;
  let html = '';
  try { html = readFileSync(join(root, 'index.html'), 'utf8'); } catch { return root; }
  return /(?:href|src)\s*=\s*["']\.\.\//i.test(html) ? tpl : root;
}

/**
 * 起服务，返回 { server, port, token, url, close }。run 和测试都用它。
 * opts：port（默认 0：系统给空闲端口）、log、token（测试用）、web（静态文件从哪个目录给，默认课件目录，见 webRoot）
 */
export async function startServer(dir, opts = {}) {
  const log = opts.log || (() => {});
  const token = opts.token || randomBytes(18).toString('base64url');
  const clients = new Map();   // SSE 连接 → 页面编号（client），推 edits 时跳过刚保存的那一页
  const root = resolve(dir);
  // 修改记录、监听的目录都在课件目录（root）；静态文件从 web 给。web 是上级目录时，课件页面的地址前面多一段 base（比如 tour/）
  const web = opts.web ? resolve(opts.web) : root;
  if (root !== web && !root.startsWith(web + sep)) throw new Error('web 要是课件目录或它的上级目录');
  const base = root === web ? '' : relative(web, root).split(sep).map(encodeURIComponent).join('/') + '/';

  const send = (res, code, body, type = 'text/plain; charset=utf-8', extra = {}) => {
    res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
    res.end(body);
  };
  const json = (res, code, obj) => send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8');
  const push = (ev, except) => {
    for (const [c, cid] of clients) {
      if (except && cid === except) continue;
      try { c.write(`event: ${ev}\ndata: {}\n\n`); } catch { /* 断开的由 close 清掉 */ }
    }
  };
  // 有双击打开的页面切过来了（POST carry）：run 等到它就不另开浏览器
  let onClaim;
  const claimed = new Promise(ok => { onClaim = ok; });

  function readBody(req) {
    return new Promise((ok, fail) => {
      let size = 0;
      const parts = [];
      // 超过上限：后面的照样读完但不留（直接断开连接，对方收不到 413）
      req.on('data', c => { size += c.length; if (size <= MAX_BODY) parts.push(c); });
      req.on('end', () => (size > MAX_BODY ? fail(Object.assign(new Error('too large'), { code: 413 })) : ok(Buffer.concat(parts).toString('utf8'))));
      req.on('error', fail);
    });
  }

  async function api(req, res, name, url) {
    if (name === 'edit.js' && req.method === 'GET') {
      let js;
      try { js = readFileSync(EDIT_JS); } catch { return send(res, 404, 'edit.js 不见了'); }
      return send(res, 200, js, TYPES['.js']);
    }
    if (!sameToken(url.searchParams.get('token'), token)) return send(res, 403, '口令不对');
    if (name === 'events' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      clients.set(res, String(url.searchParams.get('client') || '').slice(0, 40));
      req.on('close', () => clients.delete(res));
      return;
    }
    if (name === 'edits' && req.method === 'GET') return json(res, 200, readEdits(root));
    if (name === 'carry' && req.method === 'POST') return carry(req, res);
    if (req.method !== 'POST' || (name !== 'edits' && name !== 'notify')) return send(res, 404, '没有这个接口');
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return send(res, 415, '只收 JSON');
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, e.code === 413 ? 413 : 400, e.code === 413 ? '请求体超过 1MB' : '读请求体出错'); }
    let data = {};
    if (body.trim()) { try { data = JSON.parse(body); } catch { return send(res, 400, '不是合法的 JSON'); } }
    if (!data || typeof data !== 'object') return send(res, 400, '要传一个 JSON 对象');
    const cur = readEdits(root);
    const now = new Date().toISOString();
    if (name === 'edits') {
      if (!Array.isArray(data.items)) return send(res, 400, 'items 要是数组');
      // 已经合并的条目（edits --done 清掉的）浏览器可能还没刷新、又存了回来：按 done 去掉，合并后又改过的换成新的 before
      const items = applyDone(data.items.map(cleanItem).filter(Boolean), cur.done);
      writeEdits(root, { ...cur, updated: now, items });
      push('edits', typeof data.client === 'string' ? data.client.slice(0, 40) : '');
      return json(res, 200, { ok: true, count: items.length, updated: now });
    }
    // 合并方式：用户在页面上选的（exact 照我改的、polish 润色、ai 重新优化），不认得的按 exact
    const mode = MODE_KEYS.includes(data.mode) ? data.mode : 'exact';
    writeEdits(root, { ...cur, notified: now, mode });
    log(`用户点了「通知 AI 修改」：${cur.items.length} 处，合并方式 ${mode}`);
    return json(res, 200, { ok: true, count: cur.items.length, notified: now });
  }

  // 双击打开的页面切到在线编辑：离线修改并进 edits.json，再跳到在线编辑的页面
  async function carry(req, res) {
    if (!/^application\/x-www-form-urlencoded\b/i.test(req.headers['content-type'] || '')) return send(res, 415, '只收表单');
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, e.code === 413 ? 413 : 400, e.code === 413 ? '请求体超过 1MB' : '读请求体出错'); }
    const form = new URLSearchParams(body);
    let list = [];
    try { const v = JSON.parse(form.get('items') || '[]'); if (Array.isArray(v)) list = v; } catch { /* 坏的当成没带 */ }
    const cur = readEdits(root);
    const incoming = applyDone(list.map(cleanItem).filter(Boolean), cur.done);
    if (incoming.length) {
      writeEdits(root, { ...cur, updated: new Date().toISOString(), items: mergeItems(cur.items, incoming) });
      push('edits');
    }
    const mode = MODE_KEYS.includes(form.get('mode')) ? form.get('mode') : '';
    log(`双击打开的课件页切到了在线编辑${incoming.length ? `，带来离线时的 ${incoming.length} 处修改` : ''}`);
    onClaim();
    res.writeHead(303, { Location: carryTarget(form.get('to'), incoming.length, mode), 'Cache-Control': 'no-store' });
    res.end();
  }
  // 跳去哪：to 里课件目录下的 .html（不认得、不存在的换成 index.html），留下它的查询串和 #页号，加上口令
  function carryTarget(to, carried, mode) {
    let u;
    try { u = new URL(String(to || ''), 'http://deck/'); } catch { u = null; }
    let file = u && u.host === 'deck' ? u.pathname.split('/').pop() : '';
    try { file = decodeURIComponent(file); } catch { file = ''; }
    if (!u || !/^[\w.-]+\.html?$/i.test(file) || !existsSync(join(root, file))) { u = new URL('http://deck/'); file = 'index.html'; }
    const q = new URLSearchParams(u.search);
    for (const k of ['edit', 'carried', 'mode', 'selftest']) q.delete(k);
    q.set('edit', token);
    q.set('carried', String(carried));
    if (mode) q.set('mode', mode);
    const hash = /^#[\w./%-]{1,80}$/.test(u.hash) ? u.hash : '';
    return `/${base}${encodeURIComponent(file)}?${q}${hash}`;
  }

  function serveFile(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, '只能 GET');
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, '地址不对'); }
    if (rel.includes('\0')) return send(res, 400, '地址不对');
    if (rel === '/' || rel === '') rel = '/' + decodeURIComponent(base) + 'index.html';
    const segs = rel.split(/[\\/]+/).filter(Boolean);
    // .. 越界、. 开头的目录和文件（.li-talk/ 里有口令和修改记录）一律不给
    if (segs.some(s => s === '..' || s.startsWith('.'))) return send(res, 403, '不能访问');
    const file = resolve(web, ...segs);
    if (file !== web && !file.startsWith(web + sep)) return send(res, 403, '不能访问');
    let st;
    try { st = statSync(file); } catch { return send(res, 404, '没有这个文件'); }
    if (!st.isFile()) return send(res, 404, '没有这个文件');
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    // 课件目录里的 .html（课件的 index.html、样册 gallery.html）都插入在线编辑脚本（已经引入了的不重复插）
    if (dirname(file) === root && /\.html?$/i.test(file)) {
      return send(res, 200, req.method === 'HEAD' ? '' : injectEdit(readFileSync(file, 'utf8')), type);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    res.end(readFileSync(file));
  }

  let port = 0;
  const server = createServer((req, res) => {
    // 只认本机地址的 Host：别的网站借 DNS 重绑定把域名指到 127.0.0.1 时，Host 是它的域名，挡掉
    const host = String(req.headers.host || '').toLowerCase();
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 403, 'Host 不对');
    let url;
    try { url = new URL(req.url, `http://127.0.0.1:${port}`); } catch { return send(res, 400, '地址不对'); }
    const m = /^\/__li-talk\/([\w.-]+)$/.exec(url.pathname);
    if (m) { api(req, res, m[1], url).catch(e => { try { send(res, 500, '服务出错：' + (e && e.message)); } catch { /* 已经发过了 */ } }); return; }
    serveFile(req, res, url);
  });

  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(opts.port || 0, '127.0.0.1', () => { server.off('error', fail); ok(); });
  }).catch(e => {
    if (e && e.code === 'EADDRINUSE') throw new UserError(`端口 ${opts.port} 已经被占用了，换一个，或者不写 --port 让系统挑一个空闲的。`, 2);
    throw e;
  });
  port = server.address().port;

  // 监听 slides/、samples/（样册的样板页）和根目录的 .html：变了（去抖 300ms）推 reload。fs.watch 不可用时退回每秒看一次修改时间
  const watchers = [];
  let timer = null;
  const changed = () => { clearTimeout(timer); timer = setTimeout(() => push('reload'), DEBOUNCE); };
  const stamp = () => {
    const list = [join(root, 'index.html'), join(root, 'gallery.html')];
    for (const d of WATCH_DIRS) { try { for (const f of readdirSync(join(root, d))) list.push(join(root, d, f)); } catch { /* 没有这个目录 */ } }
    return list.map(f => { try { return f + ':' + statSync(f).mtimeMs; } catch { return f + ':-'; } }).join('|');
  };
  try {
    watchers.push(watch(root, (ev, f) => { if (!f || /\.html?$/i.test(String(f))) changed(); }));
    for (const d of WATCH_DIRS) if (existsSync(join(root, d))) watchers.push(watch(join(root, d), () => changed()));
  } catch {
    for (const w of watchers) { try { w.close(); } catch { /* 已关 */ } }
    watchers.length = 0;
    let last = stamp();
    const t = setInterval(() => { const s = stamp(); if (s !== last) { last = s; changed(); } }, 1000);
    watchers.push({ close: () => clearInterval(t) });
  }
  // edits.json 被 edits --done 清掉（merged 变了）时推 merged，浏览器刷新，免得把已经合并的修改再存回去
  let lastMerged = readEdits(root).merged;
  const mt = setInterval(() => {
    const m = readEdits(root).merged;
    if (m && m !== lastMerged) { lastMerged = m; push('merged'); }
  }, 500);
  // SSE 心跳：有的环境连接空闲太久会被断开
  const beat = setInterval(() => { for (const c of clients.keys()) { try { c.write(': ping\n\n'); } catch { /* 忽略 */ } } }, 20000);

  // opts.page：打开哪一页（默认 index.html；改样册时是 gallery.html?scene=键名），口令接在它的查询串后面
  const page = String(opts.page || 'index.html').replace(/^\/+/, '');
  const url = `http://127.0.0.1:${port}/${base}${page}${page.includes('?') ? '&' : '?'}edit=${token}`;
  async function close() {
    clearTimeout(timer); clearInterval(mt); clearInterval(beat);
    for (const w of watchers) { try { w.close(); } catch { /* 已关 */ } }
    for (const c of clients.keys()) { try { c.end(); } catch { /* 已断 */ } }
    clients.clear();
    // 浏览器的 EventSource 断了会马上重连、空闲连接也还挂着：不强行断开的话 server.close 会一直等下去
    const done = new Promise(ok => server.close(() => ok()));
    if (server.closeAllConnections) server.closeAllConnections();
    await done;
  }
  return { server, port, token, url, close, push, claimed };
}

export const servePath = dir => join(dir, '.li-talk', 'serve.json');
export const serveJsPath = dir => join(dir, '.li-talk', 'serve.js');
/** serve.js 的内容：双击打开的页面用 <script> 读它，知道服务开着、端口和口令 */
export const serveJsText = (port, token, at = Date.now()) => `window.__liTalkServe = ${JSON.stringify({ port, token, at })};\n`;

// serve 命令；opts.opener 换打开函数（测试用），opts.signal 是 AbortSignal（测试里用它结束服务）
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const env = opts.env || process.env;
  const dir = deckDir(args._ && args._[0], 'serve');
  if (!existsSync(join(dir, 'index.html'))) throw new UserError(`${dir} 里没有 index.html，还不是课件。先运行 new 搭骨架。`);
  let port = 0;
  if (args.port !== undefined) {
    port = Number(args.port);
    if (args.port === true || !Number.isInteger(port) || port < 1 || port > 65535) throw new UserError('--port 后面写 1 到 65535 之间的端口号，比如：--port 5180');
  }
  let page;
  if (args.page !== undefined) {
    page = String(args.page);
    const file = page.split(/[?#]/)[0];
    if (args.page === true || !/^[\w.-]+\.html?$/i.test(file)) throw new UserError('--page 后面写课件目录里的一个 .html，比如：--page "gallery.html?scene=fangguo"');
    if (!existsSync(join(dir, file))) throw new UserError(`${dir} 里没有 ${file}。`);
  }
  const s = await startServer(dir, { port, page, web: webRoot(dir), log: line => log(line) });
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  const info = servePath(dir);
  writeFileSync(info, JSON.stringify({ port: s.port, token: s.token, pid: process.pid, startedAt: new Date().toISOString() }, null, 2) + '\n');
  // 心跳：浏览器正在读这个文件时写可能失败（Windows），下一次再写
  const jsFile = serveJsPath(dir);
  const heartbeat = () => { try { writeFileSync(jsFile, serveJsText(s.port, s.token)); } catch { /* 下次再写 */ } };
  heartbeat();
  const hb = setInterval(heartbeat, opts.heartbeat || HEARTBEAT);
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    clearInterval(hb);
    try {
      const cur = JSON.parse(readFileSync(info, 'utf8'));
      if (cur.token === s.token) unlinkSync(info);   // 只删自己写的（又开了一个 serve 时不删别人的）
    } catch { /* 已经没了 */ }
    try { if (readFileSync(jsFile, 'utf8').includes(JSON.stringify(s.token))) unlinkSync(jsFile); } catch { /* 已经没了 */ }
  };

  log(`在线编辑已开启：${s.url}`);
  const noOpen = args['no-open'] || env.LI_TALK_NO_OPEN === '1';
  if (!noOpen) {
    // 用户可能正开着这份课件在离线编辑：那一页读到 serve.js 会自己切过来，就不再另开一个标签页
    let timer;
    const came = await Promise.race([s.claimed.then(() => true), new Promise(ok => { timer = setTimeout(() => ok(false), opts.openWait ?? OPEN_WAIT); })]);
    clearTimeout(timer);
    if (came) log('用户开着的课件页已经自己切到在线编辑，没有另开浏览器。');
    else {
      const opened = await (opts.opener || openPath)(s.url);
      log(opened ? '已用浏览器打开，进去就是编辑模式。' : `打不开浏览器，请手动打开上面的地址。`);
    }
  }
  log('用户在页面里改文字、拖位置、拖角改大小，会自动保存到 .li-talk/edits.json；改完点「通知 AI 修改」。');
  log(`配合 wait 用：后台运行 wait ${JSON.stringify(dir.replace(/\\/g, '/'))}，用户一点通知它就结束并打印修改清单。`);
  log('这个命令会一直运行；用户说「改好了」「不改了」时再结束它（Ctrl+C 或结束后台任务）。');

  const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  let stop;
  await new Promise(done => {
    stop = () => done();
    for (const sg of SIGNALS) process.on(sg, stop);
    process.on('exit', cleanup);   // 被强行结束时（比如关掉终端）也尽量删掉 serve.json
    if (opts.signal) { if (opts.signal.aborted) stop(); else opts.signal.addEventListener('abort', stop, { once: true }); }
  });
  for (const sg of SIGNALS) process.off(sg, stop);
  process.off('exit', cleanup);
  cleanup();
  await s.close();
  log('在线编辑已结束。');
  return 0;
}

