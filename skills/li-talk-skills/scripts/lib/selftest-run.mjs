// 用无头浏览器跑课件的自检模式，读回结果；也给页面截图
//
// 做法：起一个无头的 Edge / Chrome，用 --remote-debugging-pipe 和它说话（Chrome 开发者协议：
// 以 \0 结尾的 JSON 消息，走第 3、4 号文件描述符），只用 Node 自带模块，不开端口。
// 视口用 Emulation.setDeviceMetricsOverride 精确设定，不用 --window-size：实测 Windows 上
// 无头模式会从窗口里扣掉一圈边框（Edge 157 宽少 24、高少 92；Chrome 157 宽少 16、高少 95），
// 窗口最窄约 516，手机竖屏 390×844 根本开不出来。
// 也不用 --dump-dom 加虚拟时间预算：课件里有一直在跑的动画和计时器时，要等预算整个耗完才输出；
// 现在是轮询页面上的完成标记，跑完就读。
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RUN_TIMEOUT = 120000;   // 一个尺寸的自检最多等多久（毫秒）
const CALL_TIMEOUT = 30000;   // 一次协议调用最多等多久
const NO_DECK_AFTER = 5000;   // 页面加载完这么久还没有 Deck，就认定不是课件
const POLL = 150;             // 轮询间隔
const SETTLE = 600;           // 截图前等页面稳定的时间

// 固定浅色：无头浏览器可能跟着系统用深色，结果会因机器而异
const LIGHT = { name: 'prefers-color-scheme', value: 'light' };

const FLAGS = ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync',
  '--hide-scrollbars', '--mute-audio', '--remote-debugging-pipe'];

// 给用户看的错误：入口只打印 userMessage
function userError(message, exitCode = 1) {
  return Object.assign(new Error(message), { userMessage: message, exitCode });
}
const sleep = ms => new Promise(ok => setTimeout(ok, ms));

// 课件 index.html 的 file: 地址；中文和空格会被转义
export function deckUrl(deckDir, query = '', hash = '') {
  const u = pathToFileURL(join(resolve(deckDir), 'index.html'));
  if (query) u.search = query;
  if (hash) u.hash = hash;
  return u.href;
}

// 从 HTML 里取出 <pre id="deck-selftest"> 里的 JSON（会反转义）；取不到返回 null
export function extractResult(dom) {
  const m = /<pre id="deck-selftest"[^>]*>([\s\S]*?)<\/pre>/.exec(dom || '');
  if (!m) return null;
  const txt = m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  try { return JSON.parse(txt); } catch { return null; }
}

// 在页面里看自检跑到哪了
const PROBE = `(function () {
  if (location.protocol !== 'file:') return { state: 'loading' };
  var d = document.documentElement;
  if (d && d.dataset.selftest === 'done') {
    var p = document.getElementById('deck-selftest');
    return { state: 'done', html: p ? p.outerHTML : '' };
  }
  if (document.readyState !== 'complete') return { state: 'loading' };
  return { state: 'running', deck: typeof window.Deck !== 'undefined',
    selftest: !!document.querySelector('script[src*="selftest"]') };
})()`;

/**
 * 起一个无头浏览器，返回 { selftest, screenshot, close }。几个尺寸和截图共用这一个浏览器，用完必须 close。
 * 每次用一个新的临时用户目录，不碰用户自己的浏览器。
 */
export async function openBrowser(browser, { callTimeout = CALL_TIMEOUT } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'li-talk-'));
  const child = spawn(browser, [...FLAGS, `--user-data-dir=${profile}`, 'about:blank'],
    { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], windowsHide: true });
  const writer = child.stdio[3];
  const reader = child.stdio[4];
  const pending = new Map();
  let seq = 0;
  let dead = null;
  let buf = '';

  const die = why => {
    if (dead) return;
    dead = why;
    for (const p of pending.values()) p.fail(why);
    pending.clear();
  };
  child.on('error', e => die(userError(`无头浏览器没能启动：${e.message}。可以用环境变量 LI_TALK_BROWSER 换一个浏览器。`, 2)));
  child.on('exit', () => die(userError('无头浏览器意外退出了，再试一次；总是这样的话用环境变量 LI_TALK_BROWSER 换一个浏览器。', 2)));
  writer.on('error', () => { /* 浏览器退出后写管道会报错，交给 exit 处理 */ });
  reader.on('error', () => { /* 同上 */ });
  reader.setEncoding('utf8');
  reader.on('data', chunk => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\0')) >= 0) {
      const raw = buf.slice(0, i);
      buf = buf.slice(i + 1);
      let m;
      try { m = JSON.parse(raw); } catch { continue; }
      const p = m.id && pending.get(m.id);
      if (!p) continue;   // 事件通知用不上
      pending.delete(m.id);
      if (m.error) p.fail(new Error(m.error.message)); else p.ok(m.result || {});
    }
  });

  const send = (method, params = {}, sessionId, ms = callTimeout) => new Promise((ok, fail) => {
    if (dead) { fail(dead); return; }
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      fail(userError(`浏览器 ${Math.round(ms / 1000)} 秒没有响应，课件可能卡住了（比如死循环）。`));
    }, ms);
    pending.set(id, {
      ok: v => { clearTimeout(timer); ok(v); },
      fail: e => { clearTimeout(timer); fail(e); },
    });
    writer.write(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }) + '\0');
  });

  async function close() {
    if (!dead) { try { await send('Browser.close', {}, undefined, 5000); } catch { /* 关不掉就强杀 */ } }
    // pid 是 undefined 说明根本没启动起来（路径不对、没权限），不用等它退出
    if (child.pid !== undefined && child.exitCode === null && child.signalCode === null) {
      await Promise.race([new Promise(ok => child.once('exit', ok)), sleep(5000)]);
      if (child.exitCode === null && child.signalCode === null) { try { child.kill(); } catch { /* 已经退了 */ } }
    }
    // 浏览器的子进程可能还占着目录，多试几次；实在删不掉也不要紧，在系统临时目录里
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* 留给系统清理 */ }
  }

  let session;
  try {
    await send('Browser.getVersion');
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    ({ sessionId: session } = await send('Target.attachToTarget', { targetId, flatten: true }));
  } catch (e) {
    await close();
    throw e.userMessage ? e : userError(`无头浏览器没能启动：${e.message}。可以用环境变量 LI_TALK_BROWSER 换一个浏览器。`, 2);
  }
  const call = (method, params, ms) => send(method, params, session, ms);
  const evaluate = async (expression, ms) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true }, ms);
    return r.result ? r.result.value : undefined;
  };
  let shown = null;   // 截图用的页面地址（不带 #），同一个地址只改 # 翻页

  // 设好视口再打开地址；先回到空白页，免得读到上一次的结果
  async function load(url, w, h) {
    await call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: 'about:blank' });
    const r = await call('Page.navigate', { url });
    if (r.errorText) throw userError(`打不开课件（${r.errorText}），检查目录里有没有 index.html。`);
  }

  // 在 w×h 的视口里跑一次自检，返回引擎写的结果（接口约定 D）
  async function selftest(deckDir, { w, h, pages, scene, timeout = RUN_TIMEOUT } = {}) {
    const q = new URLSearchParams({ selftest: '1' });
    if (pages) q.set('pages', pages);
    if (scene) q.set('scene', scene);
    shown = null;
    await call('Emulation.setEmulatedMedia', { features: [LIGHT] });
    await load(deckUrl(deckDir, '?' + q.toString()), w, h);
    const fail = why => userError(`${w}×${h} 没读到自检结果：${why}`);
    const start = Date.now();
    let completeAt = 0;
    while (Date.now() - start < timeout) {
      const left = timeout - (Date.now() - start);
      const r = (await evaluate(PROBE, Math.max(left, 1000))) || { state: 'loading' };
      if (r.state === 'done') {
        const res = extractResult(r.html);
        if (!res) throw fail('自检跑完了，但页面上的结果读不出来（#deck-selftest 不是合法的 JSON）。');
        return res;
      }
      if (r.state === 'running') {
        if (!completeAt) completeAt = Date.now();
        if (!r.selftest) throw fail('index.html 没有引入 engine/selftest.js，这份课件的引擎还没有自检模式。用 new 搭的课件才有。');
        if (!r.deck && Date.now() - completeAt > NO_DECK_AFTER) throw fail('页面里没有课件引擎（没找到 Deck），index.html 可能不是用 new 生成的。');
      }
      await sleep(POLL);
    }
    throw fail(`${Math.round(timeout / 1000)} 秒内自检没跑完，课件可能卡住了。先运行 check 看有没有运行出错。`);
  }

  // 截一张 w×h 的图：打开 #页/拍。开着「减少动态」，引擎直接跳到最终状态，不用等动画
  async function screenshot(deckDir, file, { w, h, page, beat, scene, settle = SETTLE }) {
    const base = deckUrl(deckDir, scene ? '?scene=' + encodeURIComponent(scene) : '');
    const hash = `#${page}/${beat}`;
    await call('Emulation.setEmulatedMedia', { features: [LIGHT, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    if (shown !== base) {
      await load(base + hash, w, h);
      const start = Date.now();
      while (Date.now() - start < CALL_TIMEOUT && !(await evaluate("document.readyState === 'complete'"))) await sleep(POLL);
      shown = base;
      await sleep(settle * 2);   // 第一次打开多等一会儿：字体、开场
    } else {
      await call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
      await evaluate(`location.hash = ${JSON.stringify(hash)}`);
      await sleep(settle);
    }
    const { data } = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(file, Buffer.from(data, 'base64'));
  }

  return { selftest, screenshot, close };
}

// 单独跑一次自检：起浏览器、跑、关掉
export async function selftest(browser, deckDir, opts = {}) {
  const b = await openBrowser(browser);
  try { return await b.selftest(deckDir, opts); } finally { await b.close(); }
}

// 单独截一张图
export async function screenshot(browser, deckDir, file, opts) {
  const b = await openBrowser(browser);
  try { await b.screenshot(deckDir, file, opts); } finally { await b.close(); }
}
