// 开发用：在线编辑巡检。把各风格的样板页（样册 gallery.html?scene=键名）逐页打开进编辑模式，
// 对每页能选中的块照真人的方式点一遍，每一步都核对「屏幕上画出来的」和「编辑器记下的」对不对得上，
// 对不上的记下来、截图。手动点不过来的交互组合，交给它批量查。
//
// 用法：node dev/edit-sweep.mjs [风格键名…] [--blocks N] [--jobs N] [--out 目录]
//   不写风格就是 samples/ 里有样板的全部风格；--blocks 每页最多点几块（默认 6，0 是全部）；
//   --jobs 同时开几个浏览器（默认 3）；--out 报告和截图放哪（默认系统临时目录下新建一个）。
//   每个浏览器各用一份模板的临时副本、各开一个在线编辑服务，互不干扰，不往仓库里写东西。
//
// 每一块做这几步，每步都查（任何一步之后页面上有新的报错也记下）：
//   hover   鼠标移上去：块的位置、大小、倍数不能变（风格的 :hover 效果漏进编辑模式，会量错位置）
//   select  单击：选中的是这一块，选中框和块画出来的范围重合
//   move    拖动：拖到一半、松手后，块跟着鼠标走了同样的距离，大小和倍数不变，选中框跟着
//   scale   拖右下角把手缩小：画出来的大小 = 原来 × 记下的倍数，CSS 的 scale 就是预览的倍数，选中框跟着
//   move2   缩小后再拖：拖动中、松手后倍数不变（:active 这类效果盖掉预览就会变）
//   verify  用合并核对（Deck._.editVerify）比预览和记录：预览本身就该和记录对上
//   undo    撤销三次：回到原样，记录清空
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../skills/li-talk-skills/scripts/lib/serve.mjs';
import { findBrowser } from '../skills/li-talk-skills/scripts/lib/browser.mjs';
import { openBrowser } from '../skills/li-talk-skills/scripts/lib/selftest-run.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');
const W = 1280, H = 720;            // 视口：舞台缩放 2/3，和测试一样
const HOVER_MS = 180;               // 悬停后等多久再量（风格的过渡一般 .25～.45 秒，开始动了就量得出来）
const DX = 36, DY = 24;             // 每次拖动的屏幕距离
const TOL = 1.5;                    // 位置、大小的容差（屏幕 px；编辑器按舞台整数记，换算回来最多差 .7px）
const DBL = 500;                    // 两次按下至少隔这么久（编辑器 450 毫秒内两次按下算双击）

// ---------- 参数 ----------
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const DEBUG = argv.includes('--debug') && (argv.splice(argv.indexOf('--debug'), 1), true);   // 打印慢的浏览器调用（卡住时看卡在哪一步）
const MAX_BLOCKS = +opt('--blocks', 6);
const JOBS = Math.max(1, +opt('--jobs', 3));
const OUT = opt('--out', '') || mkdtempSync(join(tmpdir(), 'li-talk-sweep-'));
// tour 是 skill 自带的新手教程（template/tour/，引用 ../engine，服务从模板目录给，页面地址 /tour/index.html）
const ALL = readdirSync(join(TPL, 'samples')).filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, '')).concat('tour');
const SCENES = argv.length ? argv : ALL;
for (const s of SCENES) if (!ALL.includes(s)) { console.error(`没有这个风格的样板：${s}（有：${ALL.join('、')}）`); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const browser = findBrowser();
if (!browser) { console.error('本机没找到 Edge / Chrome；可以用环境变量 LI_TALK_BROWSER 指定'); process.exit(2); }

const sleep = ms => new Promise(ok => setTimeout(ok, ms));

// ---------- 页面里的小工具（每次打开样册后注入） ----------
const HELPER = `window.__sw = (() => {
  let els = [];
  const R = n => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
  const desc = n => {
    const cls = [...n.classList].filter(c => !/^(on|past|active|lt-|b\\d)/.test(c)).slice(0, 2);
    const t = (n.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 14);
    return n.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '') + (t ? '「' + t + '」' : '');
  };
  // 鼠标点在 (x, y) 真的落在舞台上：舞台外面、被舞台以外的东西（样册底部的风格切换条、编辑条）盖住的不算，
  // 不然点下去点到的是那些按钮（样册的风格条一点就换页面）
  const onStage = (x, y) => {
    const st = document.getElementById('stage'), s = st.getBoundingClientRect(), top = document.elementFromPoint(x, y);
    return x > s.left + 4 && y > s.top + 4 && x < Math.min(s.right, innerWidth) - 4 && y < Math.min(s.bottom, innerHeight) - 4 && !!top && st.contains(top);
  };
  // 块里一个点：鼠标点在这儿，编辑器选中的就是它（盖在上面的小块不算）
  function point(n) {
    const r = n.getBoundingClientRect();
    for (const fy of [.5, .3, .7, .15, .85]) for (const fx of [.5, .3, .7, .15, .85]) {
      const x = Math.round(r.left + r.width * fx), y = Math.round(r.top + r.height * fy);
      if (onStage(x, y) && Deck._.editBlockAt(x, y) === n) return { x, y };
    }
    return null;
  }
  return {
    blocks() {
      els = Deck._.editBlocks();
      return els.map((n, i) => {
        const p = point(n), r = R(n);
        return { i, desc: desc(n), x: p ? p.x : null, y: p ? p.y : null, w: r.w, h: r.h, inline: getComputedStyle(n).display === 'inline' };
      });
    },
    state(i) {
      const n = els[i], cs = getComputedStyle(n);
      return Object.assign(R(n), { scale: cs.scale, lt: cs.getPropertyValue('--lt-scale').trim(), sel: Deck._.editSel() === n });
    },
    sel() { const b = document.querySelector('.lt-edit-sel'); return b && !b.hidden ? R(b) : null; },
    // 这个点被选中框的把手盖住了（按下去是缩放，不是拖动）
    covered(x, y) { const t = document.elementFromPoint(x, y); return !!(t && t.closest('.lt-edit-h')); },
    // 选中的块上一个按得到的点：按下去拖的是它（点在它里面的小块上也算）
    grab() {
      const s = Deck._.editSel();
      if (!s) return null;
      const r = s.getBoundingClientRect();
      for (const fy of [.5, .3, .7, .15, .85]) for (const fx of [.5, .3, .7, .15, .85]) {
        const x = Math.round(r.left + r.width * fx), y = Math.round(r.top + r.height * fy), b = Deck._.editBlockAt(x, y);
        if (b && s.contains(b) && onStage(x, y) && !this.covered(x, y)) return { x, y };
      }
      return null;
    },
    // 一个按得到的角把手（右下角优先；占满整宽的块右边的把手在屏幕边上，换别的角）
    handle() {
      for (const c of ['se', 'sw', 'ne', 'nw']) {
        const h = document.querySelector('.lt-edit-sel:not([hidden]) .lt-edit-h[data-c="' + c + '"]');
        if (!h) continue;
        const r = h.getBoundingClientRect(), x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
        if (onStage(x, y) && document.elementFromPoint(x, y) === h) return { c, x, y };
      }
      return null;
    },
    items() { return Deck._.editState().items; },
    verify() { try { return Deck._.editVerify(Deck._.editState().items); } catch (e) { return [{ what: '核对出错：' + e.message }]; } },
    errors() { return (window.__deckErrors || []).slice(); },
  };
})(); true`;

// ---------- 一个浏览器跑一种风格 ----------
// --debug：包一层，超过 3 秒的调用、出错的调用打印出来
function traced(b, tag) {
  if (!DEBUG) return b;
  const wrap = (name, fn) => async (...a) => {
    const t = Date.now(), what = (name + ' ' + String(a[0]) + (a[1] && typeof a[1] === 'object' ? ' ' + JSON.stringify(a[1]) : '')).slice(0, 160);
    try { const v = await fn(...a); if (Date.now() - t > 3000) console.log(`[${tag}] 慢 ${Date.now() - t}ms：${what}`); return v; }
    catch (e) {
      console.log(`[${tag}] 出错 ${Date.now() - t}ms：${what} → ${e.message}`);
      // 卡住时是不是有对话框（alert / confirm / 离开页面确认）挡着：能关掉就说明有
      try { await b.call('Page.handleJavaScriptDialog', { accept: false }, 3000); console.log(`[${tag}] 当时有一个对话框挡着，已关掉`); } catch (e2) { console.log(`[${tag}] 当时没有对话框：${e2.message}`); }
      // 打不开页面时：从 Node 直接请求同一个地址，分清是服务卡住了还是浏览器那边卡住了
      if (a[1] && /^http/.test(a[1].url || '')) {
        const t2 = Date.now();
        try { const r = await fetch(a[1].url, { signal: AbortSignal.timeout(5000) }); console.log(`[${tag}] Node 直接请求：HTTP ${r.status}，${Date.now() - t2}ms`); }
        catch (e3) { console.log(`[${tag}] Node 直接请求也没回应：${e3.message}`); }
      }
      throw e;
    }
  };
  return { ...b, call: wrap('call', b.call), evaluate: wrap('evaluate', b.evaluate), goto: wrap('goto', b.goto) };
}

async function sweepScene(b0, port, dir, scene, report) {
  const b = traced(b0, scene);
  // 每种风格从空的修改记录开始：上一种风格最后一块的撤销可能还没存（编辑器改完等 400 毫秒才存，关浏览器时来不及），
  // 留在服务里会被这一页读回来，摆成一开始就有的修改
  rmSync(join(dir, scene === 'tour' ? 'tour' : '', '.li-talk', 'edits.json'), { force: true });
  const ev = async (expr, ms = 15000) => {
    const start = Date.now();
    for (;;) {
      const v = await b.evaluate(expr, 5000).catch(() => null);
      if (v || Date.now() - start > ms) return v;
      await sleep(100);
    }
  };
  const call = (expr) => b.evaluate(expr);
  const mouse = (type, x, y, buttons = type === 'mouseReleased' ? 0 : 1) =>
    b.call('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' && !buttons ? 'none' : 'left', buttons, clickCount: 1 });
  const key = (k, code, vk, modifiers = 0) => b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers })
    .then(() => b.call('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers }));
  const shot = async name => {
    try { const r = await b.call('Page.captureScreenshot', { format: 'jpeg', quality: 70 }); writeFileSync(join(OUT, name), Buffer.from(r.data, 'base64')); return name; } catch { return null; }
  };

  // 打开样册（不用 b.goto：拆成几步，--debug 时看得出卡在哪一步）
  await b.call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await b.call('Page.navigate', { url: 'about:blank' });
  await b.call('Page.navigate', { url: scene === 'tour' ? `http://127.0.0.1:${port}/tour/index.html?edit=tok#1` : `http://127.0.0.1:${port}/gallery.html?scene=${scene}&edit=tok#1` });
  if (!(await ev(`window.Deck && Deck._.editState && Deck._.editState().on && !document.body.classList.contains('loading')`))) {
    report.push({ scene, page: 0, block: '', step: 'load', what: '样册没进编辑模式' });
    return { pages: 0, blocks: 0 };
  }
  await call(HELPER);
  const left0 = (await call('__sw.items()')).length;
  if (left0) report.push({ scene, page: 0, block: '', step: 'load', what: `打开时就有 ${left0} 条修改记录（上一轮没清干净），这一轮的撤销结果不可信` });
  const pages = await call('Deck._.PAGES.length');
  let tested = 0;
  for (let p = 0; p < pages; p++) {
    if (p > 0) { await key('ArrowRight', 'ArrowRight', 39); await sleep(250); }
    const pid = await call('Deck._.PAGES[Deck._.state.cur.p].id');
    let blocks = (await call('__sw.blocks()')) || [];
    const unreachable = blocks.filter(x => x.x == null).length;
    blocks = blocks.filter(x => x.x != null);
    if (MAX_BLOCKS && blocks.length > MAX_BLOCKS) {   // 按文档顺序均匀挑，大块小块都有
      const pick = new Set();
      for (let k = 0; k < MAX_BLOCKS; k++) pick.add(Math.round(k * (blocks.length - 1) / (MAX_BLOCKS - 1)));
      blocks = [...pick].map(k => blocks[k]);
    }
    if (unreachable) report.push({ scene, page: p + 1, pid, block: '', step: 'reach', level: 'info', what: `${unreachable} 块鼠标点不到（被别的块整个盖住，或在舞台外面）` });
    for (const blk of blocks) {
      tested++;
      const fails = [];
      const fail = (step, what) => fails.push({ step, what });
      const note = (step, what) => fails.push({ step, what, level: 'info' });   // 版式造成的、编辑器有意为之的：记成提示，不算问题
      const errs0 = (await call('__sw.errors()')).length;
      const st = () => call(`__sw.state(${blk.i})`);
      const near = (a, b, t = TOL) => Math.abs(a - b) <= t;
      const fmt = s => `(${s.l.toFixed(1)},${s.t.toFixed(1)} ${s.w.toFixed(1)}×${s.h.toFixed(1)} scale ${s.scale})`;
      const s0 = await st();

      // hover：鼠标移上去，块不能动
      await mouse('mouseMoved', blk.x, blk.y, 0);
      await sleep(HOVER_MS);
      const s1 = await st();
      if (!(near(s0.l, s1.l, .75) && near(s0.t, s1.t, .75) && near(s0.w, s1.w, .75) && near(s0.h, s1.h, .75) && s0.scale === s1.scale)) fail('hover', `鼠标移上去块变了：${fmt(s0)} → ${fmt(s1)}`);

      // select：单击选中这一块，选中框和它重合（框有描边，先记下差多少，后面几步比这个差值）
      await mouse('mousePressed', blk.x, blk.y); await mouse('mouseReleased', blk.x, blk.y);
      const s2 = await st(), sel0 = await call('__sw.sel()');
      if (!s2.sel) fail('select', '单击后选中的不是这一块');
      if (!sel0) { fail('select', '单击后没有选中框'); }
      const off = sel0 ? { l: sel0.l - s2.l, t: sel0.t - s2.t, w: sel0.w - s2.w, h: sel0.h - s2.h } : null;
      if (off && Math.max(Math.abs(off.l), Math.abs(off.t)) > 4) fail('select', `选中框和块没对齐：框 (${sel0.l.toFixed(1)},${sel0.t.toFixed(1)} ${sel0.w.toFixed(1)}×${sel0.h.toFixed(1)})，块 ${fmt(s2)}`);
      const selOk = async step => {
        const s = await st(), b2 = await call('__sw.sel()');
        if (!off || !b2) return;
        if (!(near(b2.l - s.l, off.l, 2) && near(b2.t - s.t, off.t, 2) && near(b2.w - s.w, off.w, 2.5) && near(b2.h - s.h, off.h, 2.5))) {
          fail(step, `选中框没跟上：框 (${b2.l.toFixed(1)},${b2.t.toFixed(1)} ${b2.w.toFixed(1)}×${b2.h.toFixed(1)})，块 ${fmt(s)}`);
        }
      };

      // move：拖到一半、松手后都跟着鼠标走
      const drag = async (step, from, base) => {
        if (await call(`__sw.covered(${from.x}, ${from.y})`)) {
          fail(step, '选中后，按在块上的位置被选中框的把手盖住（块太小），按下去会变成缩放');
          from = await call('__sw.grab()');
          if (!from) return base;
        }
        await mouse('mousePressed', from.x, from.y);
        for (let k = 1; k <= 6; k++) {
          await mouse('mouseMoved', from.x + DX * k / 6, from.y + DY * k / 6);
          if (k === 1 && blk.inline && step === 'move') {
            // 行内元素：编辑器挪它时换成 inline-block（行内元素挪不动、缩放不了），高度可能变一点；以换过以后的大小为准
            const m = await st();
            if (!(near(m.w, base.w) && near(m.h, base.h))) note(step, `行内元素，挪动时换成 inline-block，大小 ${base.w.toFixed(1)}×${base.h.toFixed(1)} → ${m.w.toFixed(1)}×${m.h.toFixed(1)}`);
            base = Object.assign({}, base, { w: m.w, h: m.h, l: base.l + (m.l - base.l) - DX / 6, t: base.t + (m.t - base.t) - DY / 6 });
          }
          if (k === 3) {
            const m = await st();
            if (!(near(m.l - base.l, DX / 2) && near(m.t - base.t, DY / 2))) fail(step, `拖到一半位置不对：应该挪了 ${DX / 2},${DY / 2}，实际 ${(m.l - base.l).toFixed(1)},${(m.t - base.t).toFixed(1)}`);
            if (!(near(m.w, base.w) && near(m.h, base.h) && m.scale === base.scale)) fail(step, `拖动中大小或倍数变了：${fmt(base)} → ${fmt(m)}`);
          }
        }
        await mouse('mouseReleased', from.x + DX, from.y + DY);
        const a = await st();
        if (!(near(a.l - base.l, DX) && near(a.t - base.t, DY))) fail(step, `松手后位置不对：应该挪了 ${DX},${DY}，实际 ${(a.l - base.l).toFixed(1)},${(a.t - base.t).toFixed(1)}`);
        if (!(near(a.w, base.w) && near(a.h, base.h) && a.scale === base.scale)) fail(step, `松手后大小或倍数变了：${fmt(base)} → ${fmt(a)}`);
        await selOk(step);
        return a;
      };
      await sleep(DBL);   // 和刚才的单击隔开：两次按下离得近、隔得短，编辑器当成双击去改字
      const s3 = await drag('move', { x: blk.x, y: blk.y }, s2);

      // scale：一个角的把手往中心收 35%
      const h = await call(`__sw.handle()`);
      let s4 = s3;
      if (!h) note('scale', '选中后四个角的把手都按不到（块贴着页边、占满舞台，或者被别的东西盖住）');
      else {
        const cx = s3.l + s3.w / 2, cy = s3.t + s3.h / 2, to = { x: h.x + (cx - h.x) * .35, y: h.y + (cy - h.y) * .35 };
        await mouse('mousePressed', h.x, h.y);
        for (let k = 1; k <= 5; k++) await mouse('mouseMoved', h.x + (to.x - h.x) * k / 5, h.y + (to.y - h.y) * k / 5);
        await mouse('mouseReleased', to.x, to.y);
        s4 = await st();
        const rec = (await call('__sw.items()')).find(it => it.kind === 'scale');
        if (!rec) fail('scale', '拖了把手，没有记下整块缩放');
        else {
          const k = rec.after.scale, rw = s4.w / s3.w, rh = s4.h / s3.h;
          if (!(Math.abs(rw - k) < .03 && Math.abs(rh - k) < .03)) fail('scale', `画出来的大小和记下的倍数对不上：记 ${k}，宽变 ${rw.toFixed(3)} 倍、高变 ${rh.toFixed(3)} 倍`);
          if (s4.lt && Math.abs(parseFloat(s4.scale) - parseFloat(s4.lt)) > .002) fail('scale', `CSS 的 scale 不是预览的倍数：scale ${s4.scale}，预览 ${s4.lt}`);
        }
        await selOk('scale');
      }

      // move2：缩小后再拖
      await sleep(DBL);
      const at = await call('__sw.grab()');
      if (at) await drag('move2', at, s4);
      else note('move2', '缩小后整块都被别的块盖住，点不到它，没法再拖');

      // verify：预览本身和记录对得上（位置不比：合并核对量的是排版位置，不含预览用的位移；位置上面已经直接量过）
      const bad = ((await call('__sw.verify()')) || []).filter(v => v.kind !== 'box');
      for (const v of bad) fail('verify', `${v.kind || ''} ${v.missing ? '找不到元素（路径对不上）' : v.what}`);

      // undo：撤销三次回到原样
      for (let k = 0; k < 3; k++) await key('z', 'KeyZ', 90, 2);
      await sleep(50);
      const s5 = await st(), left = (await call('__sw.items()')).length;
      if (left) fail('undo', `撤销三次后还有 ${left} 条记录`);
      if (!(near(s5.l, s0.l) && near(s5.t, s0.t) && near(s5.w, s0.w) && near(s5.h, s0.h) && s5.scale === s0.scale)) fail('undo', `撤销后没回到原样：${fmt(s0)} → ${fmt(s5)}`);

      const errs = (await call('__sw.errors()')).slice(errs0);
      for (const e of errs) fail('error', '页面报错：' + e);

      await key('Escape', 'Escape', 27);
      await mouse('mouseMoved', 2, 2, 0);
      if (fails.length) {
        const file = fails.some(f => f.level !== 'info') ? await shot(`${scene}-p${String(p + 1).padStart(2, '0')}-b${blk.i}.jpg`) : null;
        for (const f of fails) report.push({ scene, page: p + 1, pid, block: blk.desc, ...f, shot: file });
      }
    }
  }
  return { pages, blocks: tested };
}

// ---------- 调度：jobs 个浏览器分着跑 ----------
const report = [];
const stats = {};
const queue = SCENES.slice();
const t0 = Date.now();
const dirs = [];
async function worker(n) {
  const dir = mkdtempSync(join(tmpdir(), 'li-talk-sweep-tpl-'));
  dirs.push(dir);
  // 不带 .li-talk/（模板目录里可能留着以前改样册时的修改记录，带过来会摆到页面上，搅乱巡检）
  cpSync(TPL, dir, { recursive: true, filter: src => !/[\\/]\.li-talk([\\/]|$)/.test(src) });
  const s = await startServer(dir, { token: 'tok' });
  let st = null;   // 教程用的服务（课件目录是 tour/，静态文件从模板目录给），用到才开
  const tourServer = async () => st || (st = await startServer(join(dir, 'tour'), { token: 'tok', web: dir }));
  try {
    while (queue.length) {
      const scene = queue.shift();
      const t = Date.now();
      // 每种风格开一个新浏览器，互不留状态；万一卡住（浏览器 30 秒没响应）重试一次。
      // （以前隔一次卡一次的原因是 edit.js 挂着 beforeunload，页面加载完一秒内跳走时 CDP 的跳转会卡住，已经改成 pagehide）
      for (let attempt = 1; attempt <= 2; attempt++) {
        const mark = report.length;
        const b = await openBrowser(browser);
        try { stats[scene] = await sweepScene(b, scene === 'tour' ? (await tourServer()).port : s.port, dir, scene, report); break; }
        catch (e) {
          if (attempt === 1 && /没有响应/.test(e.message)) { report.splice(mark); console.log(`[${n}] ${scene}：浏览器卡住了，重试一次`); continue; }
          report.push({ scene, page: 0, block: '', step: 'crash', what: '巡检出错：' + e.message }); stats[scene] = { pages: 0, blocks: 0 };
        } finally { await b.close(); }
      }
      const nf = report.filter(r => r.scene === scene && r.level !== 'info').length;
      console.log(`[${n}] ${scene}：${stats[scene].pages} 页 ${stats[scene].blocks} 块，${nf ? nf + ' 处问题' : '没问题'}（${((Date.now() - t) / 1000).toFixed(0)} 秒）`);
    }
  } finally {
    await s.close();
    if (st) await st.close();
  }
}
await Promise.all(Array.from({ length: Math.min(JOBS, SCENES.length) }, (_, i) => worker(i + 1)));
for (const d of dirs) { try { rmSync(d, { recursive: true, force: true }); } catch { /* 删不掉不要紧 */ } }

// ---------- 报告 ----------
const problems = report.filter(r => r.level !== 'info');
const bySteps = {};
for (const r of problems) bySteps[r.step] = (bySteps[r.step] || 0) + 1;
const lines = [
  `# 在线编辑巡检报告`,
  ``,
  `${SCENES.length} 种风格，${Object.values(stats).reduce((a, s) => a + s.pages, 0)} 页，${Object.values(stats).reduce((a, s) => a + s.blocks, 0)} 块；` +
    `${problems.length} 处问题（${Object.entries(bySteps).map(([k, v]) => `${k} ${v}`).join('、') || '无'}）；用时 ${((Date.now() - t0) / 1000).toFixed(0)} 秒。`,
  ``,
];
for (const scene of SCENES) {
  const rs = problems.filter(r => r.scene === scene);
  lines.push(`## ${scene}（${stats[scene] ? stats[scene].pages : 0} 页 ${stats[scene] ? stats[scene].blocks : 0} 块，${rs.length} 处问题）`, '');
  for (const r of rs) lines.push(`- 第 ${r.page} 页 ${r.pid || ''} ${r.block}　**${r.step}**：${r.what}${r.shot ? `（截图 ${r.shot}）` : ''}`);
  const info = report.filter(r => r.scene === scene && r.level === 'info');
  for (const r of info) lines.push(`- （提示）第 ${r.page} 页 ${r.pid || ''} ${r.block || ''}${r.step && r.step !== 'reach' ? ' ' + r.step : ''}：${r.what}`);
  lines.push('');
}
writeFileSync(join(OUT, 'report.md'), lines.join('\n'));
writeFileSync(join(OUT, 'report.json'), JSON.stringify({ scenes: SCENES, stats, report }, null, 2));
console.log(`\n${lines[2]}\n报告：${join(OUT, 'report.md')}`);
process.exit(problems.length ? 1 : 0);
