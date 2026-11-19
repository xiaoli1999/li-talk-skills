// serve 命令：在线编辑用的本地服务
//   serve <课件目录> [--port N] [--no-open]
// - 只听 127.0.0.1；端口默认让系统给一个空闲的。启动时生成随机口令，写进 .li-talk/serve.json：{ port, token, pid, startedAt }，
//   再用浏览器打开 http://127.0.0.1:端口/index.html?edit=口令（--no-open 或环境变量 LI_TALK_NO_OPEN=1 时不打开）。
// - 一直运行，直到被结束（Ctrl+C、结束后台任务）；结束时删掉 serve.json。
// - 静态文件：只给课件目录里的文件，. 开头的目录和文件（.li-talk/ 等）不给，挡住 .. 越界；不缓存。
// - 返回 index.html 时，页面没引入 engine/edit.js 就在 </body> 前插一行 <script src="/__li-talk/edit.js">（取 skill 自带的），老课件也能编辑。
// - /__li-talk/ 下的接口（edit.js 以外都要带 ?token=口令，不对就 403）：
//     GET  events   SSE：slides/ 或 index.html 变了推 reload；edits.json 被 edits --done 清掉时推 merged
//     GET  edits    当前的修改记录（浏览器进编辑模式时先读回来，接着改）
//     POST edits    请求体是 { items: [...] }，整理后写进 .li-talk/edits.json（先写临时文件再改名）；
//                   已经被 edits --done 合并掉的条目按 done 去掉（applyDone），免得浏览器把旧修改存回来
//     POST notify   把 edits.json 的 notified 设成现在，终端打印一行
//   POST 只收 JSON（Content-Type: application/json），请求体最多 1MB。Host 头只认 127.0.0.1 / localhost，挡 DNS 重绑定。
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, watch, writeFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { UserError } from './cli.mjs';
import { TPL_DIR } from './paths.mjs';
import { applyDone, cleanItem, deckDir, readEdits, writeEdits } from './edits.mjs';
import { openPath } from './open.mjs';

export const MAX_BODY = 1024 * 1024;
const DEBOUNCE = 300;
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
 * 起服务，返回 { server, port, token, url, close }。run 和测试都用它。
 * opts：port（默认 0：系统给空闲端口）、log、token（测试用）
 */
export async function startServer(dir, opts = {}) {
  const log = opts.log || (() => {});
  const token = opts.token || randomBytes(18).toString('base64url');
  const clients = new Set();
  const root = resolve(dir);

  const send = (res, code, body, type = 'text/plain; charset=utf-8', extra = {}) => {
    res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
    res.end(body);
  };
  const json = (res, code, obj) => send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8');
  const push = ev => { for (const c of clients) { try { c.write(`event: ${ev}\ndata: {}\n\n`); } catch { /* 断开的由 close 清掉 */ } } };

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
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    if (name === 'edits' && req.method === 'GET') return json(res, 200, readEdits(root));
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
      return json(res, 200, { ok: true, count: items.length, updated: now });
    }
    writeEdits(root, { ...cur, notified: now });
    log(`用户点了「通知 AI 修改」：${cur.items.length} 处`);
    return json(res, 200, { ok: true, count: cur.items.length, notified: now });
  }

  function serveFile(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, '只能 GET');
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, '地址不对'); }
    if (rel.includes('\0')) return send(res, 400, '地址不对');
    if (rel === '/' || rel === '') rel = '/index.html';
    const segs = rel.split(/[\\/]+/).filter(Boolean);
    // .. 越界、. 开头的目录和文件（.li-talk/ 里有口令和修改记录）一律不给
    if (segs.some(s => s === '..' || s.startsWith('.'))) return send(res, 403, '不能访问');
    const file = resolve(root, ...segs);
    if (file !== root && !file.startsWith(root + sep)) return send(res, 403, '不能访问');
    let st;
    try { st = statSync(file); } catch { return send(res, 404, '没有这个文件'); }
    if (!st.isFile()) return send(res, 404, '没有这个文件');
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    if (segs.length === 1 && segs[0].toLowerCase() === 'index.html') {
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

  // 监听 slides/ 和 index.html：变了（去抖 300ms）推 reload。fs.watch 不可用时退回每秒看一次修改时间
  const watchers = [];
  let timer = null;
  const changed = () => { clearTimeout(timer); timer = setTimeout(() => push('reload'), DEBOUNCE); };
  const stamp = () => {
    const list = [join(root, 'index.html')];
    try { for (const f of readdirSync(join(root, 'slides'))) list.push(join(root, 'slides', f)); } catch { /* 没有 slides/ */ }
    return list.map(f => { try { return f + ':' + statSync(f).mtimeMs; } catch { return f + ':-'; } }).join('|');
  };
  try {
    watchers.push(watch(root, (ev, f) => { if (!f || String(f).toLowerCase() === 'index.html') changed(); }));
    if (existsSync(join(root, 'slides'))) watchers.push(watch(join(root, 'slides'), () => changed()));
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
  const beat = setInterval(() => { for (const c of clients) { try { c.write(': ping\n\n'); } catch { /* 忽略 */ } } }, 20000);

  const url = `http://127.0.0.1:${port}/index.html?edit=${token}`;
  async function close() {
    clearTimeout(timer); clearInterval(mt); clearInterval(beat);
    for (const w of watchers) { try { w.close(); } catch { /* 已关 */ } }
    for (const c of clients) { try { c.end(); } catch { /* 已断 */ } }
    clients.clear();
    await new Promise(ok => server.close(() => ok()));
  }
  return { server, port, token, url, close, push };
}

export const servePath = dir => join(dir, '.li-talk', 'serve.json');

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
  const s = await startServer(dir, { port, log: line => log(line) });
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  const info = servePath(dir);
  writeFileSync(info, JSON.stringify({ port: s.port, token: s.token, pid: process.pid, startedAt: new Date().toISOString() }, null, 2) + '\n');
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try {
      const cur = JSON.parse(readFileSync(info, 'utf8'));
      if (cur.token === s.token) unlinkSync(info);   // 只删自己写的（又开了一个 serve 时不删别人的）
    } catch { /* 已经没了 */ }
  };

  log(`在线编辑已开启：${s.url}`);
  const noOpen = args['no-open'] || env.LI_TALK_NO_OPEN === '1';
  if (!noOpen) {
    const opened = await (opts.opener || openPath)(s.url);
    log(opened ? '已用浏览器打开，进去就是编辑模式。' : `打不开浏览器，请手动打开上面的地址。`);
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

