/* =====================================================================
   演示稿引擎 · 在线编辑（edit.js）
   - 用户在浏览器里直接改课件：
     · 双击改文字（回车结束、Esc 取消）；改字时选中几个字点工具栏的「重点」设成重点词 <em class="key">，再点一次取消
     · 单击选中后拖动挪位置、拖四个角改大小（按住 Shift 保持比例）、方向键微调（Shift 一次 10px）、Delete 隐藏（再按一次取消）
     · 选中或改字时旁边浮出样式工具栏：字号（按风格的字号档位）、颜色（只给风格的调色板变量）、加粗、对齐、
       改拍号（第 N 拍出现，加一减一，范围 0 到这一页最大拍号加 1）、选外层（Alt+↑）/ 回内层（Alt+↓）
     · 演讲者视图里点一拍的讲词就能改（presenter.js 通过 window.opener.Deck._ 的 notesEditable、noteText、editNote 交给这里保存）
     改完自动保存，点「通知 AI 修改」让 AI 把修改合进源码
   - 两种用法：
     · 有服务：AI 运行 serve 打开 http://127.0.0.1:端口/index.html?edit=口令，自动进入编辑模式；
       自动保存 POST 到 /__li-talk/edits，「通知 AI 修改」POST /__li-talk/notify；
       /__li-talk/events（SSE）推 reload（AI 改了源码）、merged（AI 合并完清掉了一批修改），收到就刷新，停在原来那页、仍在编辑模式；
       刷新后从服务读回还没合并的修改（服务按 done 去掉已经合并的那批，见 scripts/lib/edits.mjs 的 applyDone）
     · 没服务（双击 file:// 打开）：按 E 进入 / 退出，修改存在 localStorage（键名带课件标题），
       按钮换成「复制修改给 AI」，复制一段以「【课件修改】」开头的文字贴进对话
   - 进入编辑模式：当前页摆到最后一拍、不播动画、暂停 CSS 动画和 gsap、形象藏起来、讲过的拍不变淡，每个节拍块的角上标出拍号；
     ← → 只翻整页（每页都摆到最后一拍），点击不进拍；自检模式（?selftest）完全不启用，阅读模式下不能进
   - 修改记录（和 scripts/lib/edits.mjs 的格式一致）：{ id, at, page, no, path, hint, kind, before, after }，
     kind 是 text / box / hide / style / beat / notes；id 是这条修改的编号，at 是最后一次改动的时刻；
     path 从 .slide 往下每级「标签.第一个类名:nth-of-type(n)」（n 只在同级有同样的标签和类名时写）；
     坐标是舞台坐标（1920×1080，px，取整）。同一个元素同一种修改只留一条：before 是最早的值，after 是最新的值，改回原样就删掉
   - 预览：改位置用 translate（--lt-tx/--lt-ty 加 data-lt-moved），改大小用 --lt-w/--lt-h（data-lt-w/data-lt-h），
     隐藏用 data-lt-hide，样式用 --lt-fs/--lt-color/--lt-fw/--lt-ta（data-lt-fs…），改拍号只在角标上显示（data-lt-beat，
     不改真正的 data-beat，放映的拍不变）；规则写在本文件注入的 <style> 里。退出编辑模式后预览照样留着
   - 界面的类名都以 lt-edit- 开头，样式自己注入，不受风格影响
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、reading、booted、editing）、I.dom（stage、lb）、I.toast；
     build.js 的 I.boxIn；beats.js 的 I.finishRunning；pages.js 的 I.go、I.finishPageTl；ui.js 的 I.copyText、I.closeShot；
     presenter.js 的 I.syncPresenter；tools.js 的 I.closeTools（没引入时跳过）
   - 挂到总线：toggleEdit、editKey（ui.js 的键盘处理先问它）、editState、editsText、notesEditable、noteText、editNote
   ===================================================================== */
(function () {
  'use strict';
  if (!window.Deck || !Deck._) return;
  const I = Deck._;
  if (I.SELFTEST) return;   // 自检模式：完全不启用，量出来的结果和放映时一样
  const { W, G, QS, $, $$, clamp, el, toInt, PAGES } = I;
  const S = I.state, dom = I.dom;

  const TOKEN = QS.get('edit') || '';
  const SERVER = !!TOKEN && /^https?:$/.test(location.protocol);
  const API = name => '/__li-talk/' + name + '?token=' + encodeURIComponent(TOKEN);
  const LS_KEY = 'li-talk-edits:' + document.title;
  const SS_KEY = 'li-talk-edit-resume:' + document.title;
  // 离线编辑提示：引导用户对 AI 说这句，AI 照 SKILL.md 开编辑服务；点「知道了」后这次打开不再出
  const OFFLINE_SAY = '我要在线改这份课件';
  // 合并方式：上次选的（没选过是「照我改的」）
  let mode0 = 'exact';
  try { mode0 = localStorage.getItem('li-talk-merge-mode') || 'exact'; } catch (e) { mode0 = 'exact'; }
  const HINT_KEY = 'li-talk-edit-offline-hint';
  const BOX = ['left', 'top', 'width', 'height'];
  const STYLE = ['fontSize', 'color', 'fontWeight', 'textAlign'];
  const SAVE_DELAY = 400;
  /* 字号档位（engine.css 的字号变量）和调色板（风格的颜色变量）：工具栏只给这些，记录里写变量名 */
  const SIZES = [['--fs-xl', '特大'], ['--fs-title', '大标题'], ['--fs-lg', '标题'], ['--fs-md', '小标题'], ['--fs-body', '正文'], ['--fs-min', '注释']];
  const COLORS = [['--ink', '正文色'], ['--ink-2', '次要色'], ['--mark', '强调色'], ['--accent', '主色']];

  /* 不能编辑的：引擎加的东西（主题行、署名、形象、涟漪层、圈注、手绘线）、风格的装饰（aria-hidden）、编辑界面自己 */
  const EXCLUDE = '.s-topic, .li-sign, .mascot, .ripple-layer, svg.marks, svg.sketch, .copied-tip, [aria-hidden="true"], [class*="lt-edit-"]';
  /* 内容块：有 data-beat 的、.abs、.card、截图、大标题、形象的目标，以及带组件前缀类名（fl-card、p05-grid 这类）或 data-fg-* 的块 */
  const BLOCK = '[data-beat], .abs, .card, .shot, .s-title, [data-mascot], [data-kid]';
  const PREFIX = /^[a-z][a-z0-9]{0,5}-[a-z0-9]/;
  const ENGINE_CLS = /^(s-topic|shot-|term-bar|mascot|lt-|ripple|r-|li-|is-|ov-|deck-|lb-|copied)/;
  /* 引擎加上的状态类：算路径时跳过，取源码里写的第一个类名 */
  const STATE_CLS = /^(on|past|active|missing|is-copied|scattered|walk|napping|outline|self-flip|abs|lt-.*|b\d+)$/;
  /* 改文字只在「叶子文字元素」上：里面只有文字和这些行内标签 */
  const INLINE = /^(B|STRONG|EM|I|SMALL|SPAN|CODE|U|MARK|SUB|SUP|BR|S|DEL|INS|KBD|ABBR|Q|CITE|TIME|WBR|A)$/;

  const E = {
    on: false, loaded: false, items: [], mode: ['exact', 'polish', 'ai'].indexOf(mode0) >= 0 ? mode0 : 'exact',
    sel: null, inner: [], hover: null, text: null, drag: null, lastDown: null,
    saveT: 0, dirty: false, notifying: false, reloading: false, inflight: null, again: false, saving: false, failed: false, notified: false,
    bar: null, tools: null, pop: null, acc: '', selBox: null, beats: null, style: null, es: null,
    undo: [], redo: [], snap: '[]', touched: new Set(),   // 撤销、重做：每一步之前的修改记录（JSON），碰过的元素
  };
  /* 字号直接选数字：常用的几档（px），不给小于 32 的 */
  const PX = [32, 40, 48, 64, 80, 96, 120];
  const HISTORY = 200;
  /* 字号给人看的名字：风格档位写档位名，px 照写 */
  const label = v => { const f = SIZES.find(([k]) => v === 'var(' + k + ')'); return f ? f[1] : String(v); };

  /* =================================================================
     小工具
     ================================================================= */
  const norm = t => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const cut = (t, n) => Array.from(norm(t)).slice(0, n).join('');
  const tagsOf = html => (String(html || '').match(/<\s*([a-zA-Z][\w-]*)/g) || []).map(t => t.replace(/[<\s]/g, '').toLowerCase()).join(',');
  const curPage = () => PAGES[S.cur.p];
  const scale = () => (dom.stage.getBoundingClientRect().width / W) || 1;
  const uid = () => 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const firstCls = n => {
    const c = typeof n.className === 'string' ? n.className : (n.getAttribute('class') || '');
    return c.trim().split(/\s+/).filter(x => x && !STATE_CLS.test(x))[0] || '';
  };
  /* 从 .slide 往下的路径；n 用 nth-of-type（同级同标签里的第几个），只在同级有同样标签和类名的元素时才写 */
  function pathOf(node, slide) {
    const parts = [];
    for (let n = node; n && n !== slide; n = n.parentElement) {
      const tag = n.tagName.toLowerCase(), cls = firstCls(n);
      let sel = tag + (cls ? '.' + (window.CSS && CSS.escape ? CSS.escape(cls) : cls) : '');
      const par = n.parentElement;
      if (par) {
        const sib = [...par.children].filter(c => c.tagName === n.tagName);
        if (sib.filter(c => c.matches(sel)).length > 1) sel += ':nth-of-type(' + (sib.indexOf(n) + 1) + ')';
      }
      parts.unshift(sel);
    }
    return parts.join('>');
  }
  /* 按源码算的路径：引擎和风格会往页面里加东西（涟漪层、主题行、大标题、装饰），按页面上的元素数 nth-of-type 会和源码对不上。
     这里把页面上的元素和 Deck.add 的 html 一层层对齐（同标签、同第一个类名，按顺序配对，配不上的当成后加的），
     序号按源码里的兄弟算，AI 拿去在源码里找也对得上。对不齐（元素是引擎生成的，比如大标题、截图里面）时退回按页面算的路径 */
  function srcRoot(p) {
    if (!p._ltSrc) { const t = document.createElement('template'); t.innerHTML = p.def.html || ''; p._ltSrc = t.content; }
    return p._ltSrc;
  }
  const sig = n => n.tagName + '.' + firstCls(n);
  function align(d, src) {
    const m = new Map(), S = [...src.children];
    let j = 0;
    for (const c of d.children) if (j < S.length && sig(c) === sig(S[j])) { m.set(c, S[j]); j++; }
    return m;
  }
  function segOf(sn) {
    const tag = sn.tagName.toLowerCase(), cls = firstCls(sn);
    let sel = tag + (cls ? '.' + (window.CSS && CSS.escape ? CSS.escape(cls) : cls) : '');
    const sib = [...sn.parentNode.children].filter(c => c.tagName === sn.tagName);
    if (sib.filter(c => c.matches(sel)).length > 1) sel += ':nth-of-type(' + (sib.indexOf(sn) + 1) + ')';
    return sel;
  }
  function srcPath(node, p) {
    const chain = [];
    for (let n = node; n && n !== p.el; n = n.parentElement) chain.unshift(n);
    let d = p.el, src = srcRoot(p);
    const parts = [];
    for (const a of chain) {
      const sn = align(d, src).get(a);
      if (!sn) return null;
      parts.push(segOf(sn));
      d = a; src = sn;
    }
    return parts.join('>');
  }
  /* 按路径找回页面上的元素：先按源码对齐找，找不到再按页面上的选择器找 */
  function resolve(p, path) {
    try {
      let d = p.el, src = srcRoot(p);
      for (const seg of path.split('>')) {
        const sn = [...src.children].find(c => c.matches(seg));
        if (!sn) { d = null; break; }
        let hit = null;
        align(d, src).forEach((v, k) => { if (v === sn) hit = k; });
        if (!hit) { d = null; break; }
        d = hit; src = sn;
      }
      if (d && d !== p.el) return d;
    } catch (e) { /* 路径写坏了，退回下面 */ }
    try { return p.el.querySelector(':scope>' + path); } catch (e) { return null; }
  }
  function hintOf(n) {
    if (n.classList.contains('shot')) return cut('截图：' + (n.dataset.caption || n.dataset.src || ''), 20);
    if (n.tagName === 'IMG') return cut('图片：' + (n.alt || n.getAttribute('src') || ''), 20);
    const t = cut(n.innerText || n.textContent, 20);   // innerText 在块与块之间留空格：「第三张 每页两到四拍」
    if (t) return t;
    // 没有字的块（线稿、图标）：写上行内 style，源码里多半能按它找到
    const st = (n.getAttribute('style') || '').replace(/--lt-[\w-]+:[^;]*;?\s*/g, '').trim();
    return cut('无文字' + (st ? '，style=' + st : ''), 40);
  }
  /* 元素在舞台里的盒子（版面位置，不含 translate），取整 */
  function boxOf(n, slide) {
    const b = I.boxIn(n, slide);
    return { left: Math.round(b.l), top: Math.round(b.t), width: Math.round(b.w), height: Math.round(b.h) };
  }
  /* 元素自己 CSS 里写的 translate（换成 px）：挪位置时在它上面加位移，不把原来的冲掉 */
  function ownTranslate(n) {
    const v = getComputedStyle(n).translate;
    if (!v || v === 'none') return { x: 0, y: 0 };
    const t = v.split(/\s+/);
    const px = (s, size) => (/%$/.test(s) ? parseFloat(s) * size / 100 : parseFloat(s)) || 0;
    return { x: px(t[0], n.offsetWidth), y: px(t[1] || '0', n.offsetHeight) };
  }
  /* 元素的编辑信息（第一次碰到时算好，挂在元素上） */
  function info(n) {
    if (n._lt) return n._lt;
    const slide = n.closest('.slide');
    const p = PAGES.find(x => x.el === slide);
    n._lt = { slide, p, page: p ? p.id : '', no: p ? p.i + 1 : 0, path: (p && srcPath(n, p)) || pathOf(n, slide), hint: hintOf(n) };
    E.touched.add(n);
    return n._lt;
  }
  /* 整块等比缩放：第一次缩放之前记下元素自己 CSS 里的 scale（预览时乘上去） */
  function ensureScale(n) {
    const i = ensureBase(n);
    if (!i.sc0) {
      const v = getComputedStyle(n).scale;
      i.os = v && v !== 'none' ? (parseFloat(v) || 1) : 1;
      i.sc0 = { scale: 1, origin: 'center' };
      i.sc = Object.assign({}, i.sc0);
    }
    return i;
  }
  /* 第一次挪、改大小之前记下原来的盒子 */
  function ensureBase(n) {
    const i = info(n);
    if (i.base) return i;
    flowBase(n);
    i.base = boxOf(n, i.slide);
    i.ot = ownTranslate(n);
    const pos = getComputedStyle(n).position;
    i.position = pos === 'absolute' || pos === 'fixed' ? 'absolute' : 'flow';
    if (pos === 'relative') { const cs = getComputedStyle(n); i.rel0 = { l: parseFloat(cs.left) || 0, t: parseFloat(cs.top) || 0 }; }
    const op = n.offsetParent;
    if (i.position === 'absolute' && op && op !== i.slide && i.slide.contains(op)) {
      const ob = boxOf(op, i.slide);
      i.origin = { left: ob.left + (op.clientLeft || 0), top: ob.top + (op.clientTop || 0) };
    }
    return i;
  }
  /* 元素现在的样式，字号、颜色对上风格变量的写变量名（var(--fs-lg)），对不上的写算出来的值 */
  function probe(n, prop, v) {
    const host = /^(IMG|INPUT|BR|HR|VIDEO|svg)$/i.test(n.tagName) ? n.parentElement : n;
    const s = document.createElement('span');
    s.style.cssText = 'position:absolute;visibility:hidden';
    s.style[prop] = v;
    host.appendChild(s);
    const r = getComputedStyle(s)[prop];
    s.remove();
    return r;
  }
  function styleOf(n) {
    const cs = getComputedStyle(n);
    const fs = cs.fontSize, co = cs.color;
    const f = SIZES.find(([v]) => probe(n, 'fontSize', 'var(' + v + ')') === fs);
    const c = COLORS.find(([v]) => probe(n, 'color', 'var(' + v + ')') === co);
    const ta = cs.textAlign === 'start' ? 'left' : cs.textAlign === 'end' ? 'right' : cs.textAlign;
    return { fontSize: f ? 'var(' + f[0] + ')' : fs, color: c ? 'var(' + c[0] + ')' : co, fontWeight: String(parseInt(cs.fontWeight, 10) || 400), textAlign: ta };
  }
  /* 元素现在第几拍出现：自己的 data-beat，没写就跟着外层 */
  function beatOf(n, slide) {
    const b = n.closest('[data-beat]');
    return b && slide.contains(b) ? (toInt(b.dataset.beat) || 0) : 0;
  }

  /* =================================================================
     找元素：内容块（选中、拖动）和叶子文字（改字）
     ================================================================= */
  function isBlock(n) {
    if (!(n instanceof HTMLElement)) return false;
    if (n.matches(BLOCK)) return true;
    if ([...n.classList].some(c => PREFIX.test(c) && !ENGINE_CLS.test(c))) return true;
    return [...n.attributes].some(a => a.name.indexOf('data-fg-') === 0);
  }
  function blockOf(n, slide) {
    if (n instanceof SVGElement) n = n.ownerSVGElement || n;
    if (n instanceof SVGElement) n = n.parentElement;   // svg 里面的东西不单独选，选它外面的块
    if (!n || !slide.contains(n) || n === slide) return null;
    if (n.closest(EXCLUDE)) return null;
    for (let c = n; c && c !== slide; c = c.parentElement) if (isBlock(c)) return c;
    return null;
  }
  /* 鼠标下面的内容块：按层叠顺序从上往下找第一个能选的（盖在上面的装饰跳过） */
  function blockAt(x, y) {
    const p = curPage();
    if (!p) return null;
    for (const n of document.elementsFromPoint(x, y)) {
      if (!p.el.contains(n) || n === p.el) continue;
      const b = blockOf(n, p.el);
      if (b) return b;
    }
    return null;
  }
  /* 叶子文字：有字，里面只有行内标签，而且这些标签真的跟着字排在行里（display 是 inline；
     写成 block、inline-block、flex 或绝对定位的 <b>、<span>，是自己排成一块的，不算）。
     不管课件是谁写的、怎么写的，都按「画出来的样子」判断，不按标签名猜 */
  function inlineChild(c) {
    if (!INLINE.test(c.tagName)) return false;
    if (c.tagName === 'BR' || c.tagName === 'WBR') return true;
    const cs = getComputedStyle(c);
    return (cs.display === 'inline' || cs.display === 'contents') && cs.position !== 'absolute' && cs.position !== 'fixed' && cs.float === 'none';
  }
  function isLeafText(n) {
    if (!(n instanceof HTMLElement) || n instanceof SVGElement || !norm(n.textContent) || n.closest(EXCLUDE)) return false;
    const all = [...n.querySelectorAll('*')];
    if (all.every(inlineChild)) return true;
    // 自己直接带着字（比如 <b><i class="wc-no">2</i>投茶</b>）：里面的行内标签排成小块（编号圆牌、图标）也算这段字的一部分，
    // 只要标签都是行内标签；自己没有直接的字、只是装着几块的（讲者 <b> 和日期 <span> 各占一行）不算
    const direct = [...n.childNodes].some(c => c.nodeType === 3 && norm(c.textContent));
    return direct && all.every(c => INLINE.test(c.tagName));
  }
  /* n 里面最外层的那几段叶子文字（n 自己是叶子文字就只有它） */
  function textsIn(n) {
    if (isLeafText(n)) return [n];
    const out = [];
    const walk = x => { for (const c of x.children) { if (c.closest(EXCLUDE) || c instanceof SVGElement) continue; if (isLeafText(c)) out.push(c); else walk(c); } };
    walk(n);
    return out;
  }
  function textAt(x, y) {
    const p = curPage();
    if (!p) return null;
    for (const t of document.elementsFromPoint(x, y)) {
      if (!p.el.contains(t) || t === p.el || t instanceof SVGElement || t.closest(EXCLUDE)) continue;
      let best = null;
      for (let c = t; c && c !== p.el; c = c.parentElement) { if (isLeafText(c)) best = c; else if (best) break; }
      if (best) {
        if (best.classList.contains('copy') && $('.ct', best)) best = $('.ct', best);   // 可复制的命令：只改命令本身，不带前面的 $
        return best;
      }
    }
    return null;
  }

  /* =================================================================
     修改记录
     ================================================================= */
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function findItem(i, kind, beat) {
    return E.items.find(x => x.page === i.page && x.path === i.path && x.kind === kind && (kind !== 'notes' || x.beat === beat));
  }
  function upsert(i, kind, before, after, extra) {
    const beat = extra && extra.beat;
    const it = findItem(i, kind, beat);
    if (same(before, after)) { if (it) E.items.splice(E.items.indexOf(it), 1); return; }
    if (it) { Object.assign(it, extra || {}, { after, at: Date.now() }); return; }
    E.items.push(Object.assign({ id: uid(), at: Date.now(), page: i.page, no: i.no, path: i.path, hint: i.hint, kind, before, after }, extra || {}));
  }
  function recordBox(n) {
    const i = n._lt;
    const after = Object.assign({}, i.box || i.base);
    const extra = Object.assign({ position: i.position, css: cssFor(n, i, after) }, keepOf(i));
    if (i.origin) extra.origin = i.origin;
    upsert(i, 'box', Object.assign({}, i.base), after, extra);
  }
  /* 「照写」的 CSS：把舞台坐标换算成元素自己的坐标，AI 照抄就能落到用户拖的位置。
     absolute 的减掉定位容器和外边距；排版流里的写 position:relative 加相对原位的偏移（原来就有的 left/top 加上去）；
     宽高按盒模型换算（content-box 要减掉内边距和边框） */
  function cssFor(n, i, a) {
    const b = i.base, cs = getComputedStyle(n), px = v => parseFloat(v) || 0, r = Math.round, out = [];
    if (a.left !== b.left || a.top !== b.top) {
      if (i.position === 'absolute') {
        const o = i.origin || { left: 0, top: 0 };
        out.push('left:' + r(a.left - o.left - px(cs.marginLeft)) + 'px', 'top:' + r(a.top - o.top - px(cs.marginTop)) + 'px');
      } else {
        const r0 = i.rel0 || { l: 0, t: 0 };
        out.push('position:relative', 'left:' + r(r0.l + a.left - b.left) + 'px', 'top:' + r(r0.t + a.top - b.top) + 'px');
      }
    }
    const content = cs.boxSizing !== 'border-box';
    if (a.width !== b.width) out.push('width:' + r(a.width - (content ? px(cs.paddingLeft) + px(cs.paddingRight) + px(cs.borderLeftWidth) + px(cs.borderRightWidth) : 0)) + 'px');
    if (a.height !== b.height) out.push('height:' + r(a.height - (content ? px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth) : 0)) + 'px');
    return out.join(';');
  }
  function recordScale(n) {
    const i = n._lt;
    const on = i.sc.scale !== 1;
    const extra = on ? { css: 'scale:' + +(i.os * i.sc.scale).toFixed(3) + ';transform-origin:' + i.sc.origin } : {};
    upsert(i, 'scale', Object.assign({}, i.sc0), on ? Object.assign({}, i.sc) : Object.assign({}, i.sc0), extra);
  }

  /* 一条修改写成一行（和 scripts/lib/edits.mjs 的 itemLine 一致） */
  const short = (t, n) => { const s = norm(t); return s.length > n ? s.slice(0, n) + '…' : s; };
  const STYLE_NAMES = { fontSize: '字号', color: '颜色', fontWeight: '粗细', textAlign: '对齐' };
  function itemLine(it) {
    if (it.kind === 'notes') return '第 ' + (it.no || '?') + ' 页（' + it.page + '）第 ' + it.beat + ' 拍的讲词：「' + short(it.before.text, 40) + '」→「' + norm(it.after.text) + '」';
    const where = '第 ' + (it.no || '?') + ' 页（' + it.page + '）' + it.path + (it.hint ? '「' + short(it.hint, 40) + '」' : '');
    if (it.kind === 'text') {
      let s = where + '：文字「' + short(it.before.text, 60) + '」→「' + norm(it.after.text) + '」';
      if (it.after.html != null && tagsOf(it.before.html) !== tagsOf(it.after.html)) s += '；行内标签变了，改后的 HTML：' + it.after.html;
      return s;
    }
    if (it.kind === 'hide') return where + '：隐藏（删掉这个元素）';
    const b = it.before, a = it.after;
    if (it.kind === 'scale') return where + '：整块缩放 ' + Math.round(b.scale * 100) + '%→' + Math.round(a.scale * 100) + '%（原点 ' + (a.origin === 'top left' ? '左上角 top left' : '中心 center') + '）' + cssNote(it);
    if (it.kind === 'style') return where + '：样式 ' + (STYLE.filter(k => b[k] !== a[k]).map(k => STYLE_NAMES[k] + ' ' + b[k] + '→' + a[k]).join('、') || '没有变化') + keepNote(it);
    if (it.kind === 'beat') {
      const notes = [];
      if (!it.own) notes.push('它本来没写 data-beat，跟着外层第 ' + b.beat + ' 拍出现');
      if (it.mascot) notes.push('元素上还有 data-mascot，拍号一起改');
      return where + '：拍号 第 ' + b.beat + ' 拍→第 ' + a.beat + ' 拍出现' + (notes.length ? '（' + notes.join('；') + '）' : '');
    }
    const diff = keys => keys.filter(k => b[k] !== a[k]).map(k => k + ' ' + b[k] + '→' + a[k]).join('、');
    const parts = [], pos = diff(['left', 'top']), size = diff(['width', 'height']);
    if (pos) parts.push('位置 ' + pos);
    if (size) parts.push('大小 ' + size);
    let s = where + '：' + (parts.join('，') || '没有变化');
    if (it.position === 'flow') {
      const dx = a.left - b.left, dy = a.top - b.top;
      const mv = [dx ? (dx > 0 ? '右移 ' + dx : '左移 ' + -dx) : '', dy ? (dy > 0 ? '下移 ' + dy : '上移 ' + -dy) : ''].filter(Boolean).join('、');
      s += '（元素在排版流里，不是 absolute' + (mv ? '；相对原位' + mv : '') + '）';
    } else if (it.origin) {
      s += '（定位容器在舞台 (' + it.origin.left + ', ' + it.origin.top + ')，CSS 里的 left/top 要减去它）';
    }
    return s + keepNote(it) + cssNote(it);
  }
  /* 浏览器换算好的 CSS，合并时照抄（和 edits.mjs 的 cssNote 一字不差） */
  const cssNote = it => (it.css ? '；照写：' + it.css : '');
  /* 排版流里的块变高变矮时，预览是用 margin-bottom 抵掉的（后面的内容没动），合并时照写；和 edits.mjs 的 keepNote 一字不差 */
  const keepNote = it => (Number.isInteger(it.keep) ? '（后面的内容保持原位：给它写 margin-bottom:' + it.keep + 'px）' : '');
  /* 合并方式和按方式不同的两条规则：和 scripts/lib/edits.mjs 的 MODES、rulesFor 一字不差 */
  const MODES = {"exact":"① 照我改的（原样）：位置、大小、文字、样式一律照清单原样落进源码，不对齐、不取整、不重排、不顺手美化；自检报了重叠、越界、溢出，只告诉用户是哪处、为什么，不擅自挪（写错代码报的错照常修）；用户说要调再调。合并后 check --browser 会核对位置，对不上的照提示改到对上为止。","polish":"② 照我改的，AI 帮着润色：先照清单原样落位（同①），再做小幅调整：对齐、留边、修重叠、统一间距；每一处调整都写给用户：哪一块、用户改的是多少、改成了多少、为什么。用户改过的文字照原样（文案只给建议），不整页重排。","ai":"③ 交给 AI 重新优化：用户的改动当作方向参考（想放大哪块、挪到哪边、强调什么），可以按风格的版式规则重新排这一页；改完告诉用户做了哪些调整、和他改的哪里不一样。用户改过的文字照样原样合并，再给建议。"};
  const MODE_LABEL = { exact: '照我改的', polish: '我改的 + AI 润色', ai: 'AI 重新优化' };
  const MODE_DESC = { exact: '原样落进源码，不对齐、不美化；有冲突只提醒你', polish: '以你改的为准，AI 小幅收尾（对齐、留边、修重叠），每处调整都告诉你', ai: '你的改动只当方向，AI 按版式重新排这一页' };
  const MODE_KEY = 'li-talk-merge-mode';
  const POS_RULE = "- 位置、大小：每条都写了「照写：…」，是浏览器换算好的 CSS（已经是元素自己的坐标：减掉了定位容器、排版流里的元素是相对原位的偏移、宽高按盒模型算好），照抄进对应章节 chN.css 里这个元素的那条规则（[data-id=\"页号\"] <能定位到它的类名>{…}）；元素本来有行内 style=\"left:…;top:…;width:…\" 的，直接改成照写的值。原来用 right / bottom 定位的，改成照写的 left / top 并去掉 right / bottom。用户改过的宽和高都照写，不要只写宽度、丢掉高度，也不要为了合并去改容器的排法。不要在 JS 里加一堆行内 transform。";
  const CHECK_RULE = {"exact":"- 自检报了重叠、越界、溢出：用户亲手摆的位置不擅自挪，只告诉用户哪处、为什么，问他要不要调；报「合并后位置和用户拖的不一样」的，照提示改到对上为止。","polish":"- 自检报了重叠、越界、溢出：可以小幅调整，调了的每一处都告诉用户（原来、改成、为什么）。","ai":"- 自检报了重叠、越界、溢出：照版式规则调好，告诉用户调了哪些。"};
  const rulesFor = mode => BASE_RULES.map(r => (r === '@POS' ? POS_RULE : r === '@CHECK' ? CHECK_RULE[mode] || CHECK_RULE.exact : r));
  const BASE_RULES = [
    '合并规则：',
    '- 找元素：路径从页面根往下写，:nth-of-type(n) 按 Deck.add 的 html 里的兄弟数，用来在源码里找到它，「」里是它开头的字。写 CSS 时不要照抄 nth-of-type（页面上引擎会多加元素，数出来对不上），给元素加一个类名（比如 p05-tip）再用它定位。',
    '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。' +
      '写了「改后的 HTML」的照那段换：<em class="key">…</em> 是用户设的重点词（标题里的重点词写进 titleHtml，title 照样写纯文字）。',
    '@POS',
    '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
    '- 整块缩放：文字、图片、间距一起等比放大缩小。在源码里给这一块加个类名（比如 p05-shot），在章节 chN.css 里写 [data-id="页号"] .p05-shot{scale:1.2;transform-origin:center}' +
      '（原点是左上角的写 top left），不改原来的宽高和字号，也不要写 transform（会和出场动画打架）。',
    '- 样式：优先换成已有的类名——字号 var(--fs-xl) 用 t-xl、var(--fs-lg) 用 t-lg、var(--fs-md) 用 t-md、var(--fs-min) 用 t-sm，粗细 700 用 b，' +
      '居中用 center，颜色 var(--ink-2) 用 muted；没有对应类名的，在章节 chN.css 里加 [data-id="页号"] 选择器{font-size:…;color:var(--…)}，颜色写变量不写死。' +
      '字号是 px 数字（64px）的：能对上风格档位变量的写变量（engine.css 默认 --fs-xl 84、--fs-title 68、--fs-lg 50、--fs-md 42、--fs-body 36、--fs-min 34，风格改过的以风格 css 为准），对不上的照写 px。不要堆行内 style。' +
      '这段字里面自己写了字号的行内小字（<small>、带类名的 <span>），按同样的比例改，或者改成 em 跟着外面走。' +
      '写了「后面的内容保持原位：给它写 margin-bottom:Npx」的，把这个 margin-bottom 一起写进同一条 CSS（浏览器里就是这样预览的，不写的话后面的行会被推开）。',
    '- 拍号：改这个元素的 data-beat（本来没写的就加上）；同一个元素上的 data-mascot 拍号一起改；notes 里对应拍的讲词跟着挪。改完拍数超出范围的话，check 会提醒，照提醒调。',
    '- 讲词：页面 notes 里对应拍的 say 和 讲稿.md 里这一页对应拍的讲词一起改成新的。',
    '@CHECK',
  ];
  /* 清单末尾的提醒：文案先原样合并，再给建议（edits.mjs 的 COPY_TIP 同一句） */
  const COPY_TIP = '这一批里有文字或讲词改动的：先照用户改的原样合并；跑完自检、清掉批次以后，再逐条看这些文案，给用户优化建议（原文、用户改的、建议改成什么、为什么：更口语、更短、后排看得清、像误输入、和讲词对不上……），问用户采纳哪几条，用户没说就不动。';
  /* 整份清单；copy 为 true 时开头加「【课件修改】」，末尾说改完怎么办（没有服务时用） */
  function editsText(items, copy) {
    items = items || E.items;
    if (!items.length) return '没有待合并的修改。';
    const m = new Map();
    items.forEach(it => { const k = it.no || it.page; m.set(k, (m.get(k) || 0) + 1); });
    const per = [...m].map(([k, n]) => (typeof k === 'number' ? '第 ' + k + ' 页 ' + n + ' 处' : k + ' ' + n + ' 处')).join('、');
    const out = copy ? ['【课件修改】' + document.title] : [];
    out.push('用户在浏览器里改了 ' + items.length + ' 处（' + per + '）：');
    items.forEach((it, i) => out.push('  ' + (i + 1) + '. ' + itemLine(it)));
    out.push('合并方式（用户选的，照它来）：' + MODES[E.mode]);
    out.push(...rulesFor(E.mode));
    if (items.some(it => it.kind === 'text' || it.kind === 'notes')) out.push(COPY_TIP);
    if (copy) out.push('改完跑 check --browser 清零，再请用户刷新页面看效果（刷新后浏览器会自己清掉已经合进源码的修改）。');
    return out.join('\n');
  }

  /* =================================================================
     预览：挪位置、改大小、隐藏、样式、拍号
     ================================================================= */
  function setVar(n, attr, prop, v) {
    if (v == null) { n.removeAttribute(attr); n.style.removeProperty(prop); }
    else { n.setAttribute(attr, ''); n.style.setProperty(prop, v); }
  }
  function applyBox(n, box) {
    const i = n._lt;
    i.box = box;
    setVar(n, 'data-lt-w', '--lt-w', box.width !== i.base.width ? box.width + 'px' : null);
    setVar(n, 'data-lt-h', '--lt-h', box.height !== i.base.height ? box.height + 'px' : null);
    keepFlow(n);
    box.width = n.offsetWidth || box.width; box.height = n.offsetHeight || box.height;   // 记实际画出来的大小（高度不会比内容还矮）
    // 改了大小以后版面位置可能跟着变（比如靠右对齐的元素），重新量一次，位移按量到的算
    const lay = I.boxIn(n, i.slide);
    const dx = box.left - lay.l, dy = box.top - lay.t;
    if (Math.abs(dx) < .5 && Math.abs(dy) < .5) { n.removeAttribute('data-lt-moved'); n.style.removeProperty('--lt-tx'); n.style.removeProperty('--lt-ty'); }
    else { n.setAttribute('data-lt-moved', ''); n.style.setProperty('--lt-tx', (i.ot.x + dx) + 'px'); n.style.setProperty('--lt-ty', (i.ot.y + dy) + 'px'); }
  }
  /* 整块缩放的预览：CSS 的 scale 属性加 transform-origin（变量写法，不碰 transform，和出场动画的 gsap 不打架） */
  function applyScale(n, sc) {
    const i = ensureScale(n);
    i.sc = sc;
    if (sc.scale === 1) { n.removeAttribute('data-lt-scale'); n.style.removeProperty('--lt-scale'); n.style.removeProperty('--lt-origin'); return; }
    n.setAttribute('data-lt-scale', '');
    n.style.setProperty('--lt-scale', String(+(i.os * sc.scale).toFixed(4)));
    n.style.setProperty('--lt-origin', sc.origin);
  }
  const STYLE_VARS = { fontSize: ['data-lt-fs', '--lt-fs'], color: ['data-lt-color', '--lt-color'], fontWeight: ['data-lt-fw', '--lt-fw'], textAlign: ['data-lt-ta', '--lt-ta'] };
  function ensureStyle(n) {
    const i = info(n);
    if (!i.style0) {
      flowBase(n);
      i.style0 = styleOf(n); i.styleCur = Object.assign({}, i.style0);
      // 里面自己写了字号的行内小字（比如 80<small>℃</small>、讲者：<span class="name">…</span>）：记下和外面的比例，改字号时按比例跟着变
      const fs = parseFloat(getComputedStyle(n).fontSize) || 0;
      i.fsk = fs ? [...n.querySelectorAll('*')].filter(c => c.tagName !== 'BR').map(c => [c, (parseFloat(getComputedStyle(c).fontSize) || fs) / fs]).filter(([, k]) => Math.abs(k - 1) > .01) : [];
    }
    return i;
  }
  function applyStyle(n, st) {
    const i = n._lt;
    i.styleCur = st;
    STYLE.forEach(k => setVar(n, STYLE_VARS[k][0], STYLE_VARS[k][1], st[k] !== i.style0[k] ? st[k] : null));
    const on = st.fontSize !== i.style0.fontSize;
    (i.fsk || []).forEach(([c, k]) => setVar(c, 'data-lt-fsk', '--lt-fsk', on ? String(+k.toFixed(4)) : null));
    keepFlow(n);
  }
  function setStyle(n, key, v) {
    const i = ensureStyle(n);
    const st = Object.assign({}, i.styleCur);
    st[key] = v == null ? i.style0[key] : v;
    applyStyle(n, st);
    upsert(i, 'style', Object.assign({}, i.style0), Object.assign({}, st), keepOf(i));
    changed();
    updateTools();
  }
  /* 排版流里的块（不是 absolute）改了字号、宽高以后自己变高变矮：用 margin-bottom 抵掉高度的变化，
     后面的内容（同一张卡片里的下一行、下一段）留在原地，只改这一块。合并时这个 margin-bottom 一起写进 CSS */
  function flowBase(n) {
    const i = n._lt;
    if (i.flow0 !== undefined) return i.flow0;
    const cs = getComputedStyle(n), pcs = n.parentElement ? getComputedStyle(n.parentElement) : null;
    const blockish = /^(block|flex|grid|table|list-item|flow-root)$/.test(cs.display);
    const inFlow = cs.position === 'static' || cs.position === 'relative';
    const stack = !pcs || !/flex|grid/.test(pcs.display) || (/flex/.test(pcs.display) && /column/.test(pcs.flexDirection));
    i.flow0 = blockish && inFlow && cs.float === 'none' && stack ? { h: n.offsetHeight, mb: parseFloat(cs.marginBottom) || 0 } : null;
    return i.flow0;
  }
  function keepFlow(n) {
    const i = n._lt, f = flowBase(n);
    if (!f) return;
    n.removeAttribute('data-lt-mb'); n.style.removeProperty('--lt-mb');
    const d = n.offsetHeight - f.h;
    i.keep = Math.abs(d) >= 1 ? Math.round(f.mb - d) : null;
    if (i.keep != null) setVar(n, 'data-lt-mb', '--lt-mb', i.keep + 'px');
  }
  const keepOf = i => (i.keep != null ? { keep: i.keep } : { keep: undefined });
  function ensureBeat(n) {
    const i = info(n);
    if (!i.beat0) {
      i.beat0 = { beat: beatOf(n, i.slide), own: n.hasAttribute('data-beat'), mascot: n.hasAttribute('data-mascot') || n.hasAttribute('data-kid') };
      i.beatCur = i.beat0.beat;
    }
    return i;
  }
  function setBeat(n, b) {
    const i = ensureBeat(n);
    i.beatCur = b;
    if (b !== i.beat0.beat) n.setAttribute('data-lt-beat', String(b)); else n.removeAttribute('data-lt-beat');
  }
  function stepBeat(d) {
    const n = E.sel;
    if (!n) return;
    const i = ensureBeat(n), p = i.p;
    const b = clamp(i.beatCur + d, 0, p.total + 1);
    if (b === i.beatCur) { I.toast(d < 0 ? '已经是第 0 拍（翻到这页就出现）' : '最多到第 ' + (p.total + 1) + ' 拍（这一页最后一拍的下一拍）', 2500); return; }
    setBeat(n, b);
    const extra = { own: i.beat0.own };
    if (i.beat0.mascot) extra.mascot = true;
    upsert(i, 'beat', { beat: i.beat0.beat }, { beat: b }, extra);
    changed();
    drawBeats();
    updateTools();
  }
  function fixKeys(n) {
    $$('.key', n).forEach(k => { k.dataset.k = k.textContent; k.style.setProperty('--k', 1); });
    if (n.classList.contains('key')) n.dataset.k = n.textContent;
  }
  /* 记录里存的 HTML：去掉引擎加的属性（重点词的 data-k、--k） */
  function cleanHtml(n) {
    const c = n.cloneNode(true);
    $$('*', c).forEach(x => {
      x.removeAttribute('data-k');
      if (x.classList.contains('key')) x.removeAttribute('style');
      x.removeAttribute('contenteditable');
    });
    return c.innerHTML;
  }

  /* 讲词（演讲者视图里改）：这一拍各条 notes 的 say 连起来 */
  function noteText(p, b) { return p.notes.filter(x => x.beat === b).map(x => x.say).filter(Boolean).join(' '); }
  function setNote(p, b, text) {
    const ns = p.notes.filter(x => x.beat === b);
    if (ns.length) { ns[0].say = text; ns.slice(1).forEach(x => { x.say = ''; }); }
    else { p.notes.push({ beat: b, keys: [], show: '', say: text }); p.notes.sort((x, y) => x.beat - y.beat); }
  }
  function editNote(pi, b, text) {
    const p = PAGES[pi];
    if (!p || !E.on) return false;
    text = norm(text);
    p._ltN = p._ltN || {};
    if (!(b in p._ltN)) p._ltN[b] = noteText(p, b);
    if (text === noteText(p, b)) return true;
    setNote(p, b, text);
    upsert({ page: p.id, no: p.i + 1, path: 'notes', hint: '第 ' + b + ' 拍讲词' }, 'notes', { text: p._ltN[b] }, { text }, { beat: b });
    changed();
    if (I.syncPresenter) I.syncPresenter();
    return true;
  }

  /* 进编辑模式时把还没合并的修改摆回页面上。返回 applied（摆上了）/ merged（源码里已经是改后的样子）/
     stale（源码变了，和记录对不上）/ missing（找不到元素） */
  function applyItem(it) {
    const p = PAGES.find(x => x.id === it.page);
    if (it.kind === 'notes') {
      if (!p) return 'missing';
      const cur = noteText(p, it.beat);
      if (cur === norm(it.after.text) && cur !== norm(it.before.text)) return 'merged';
      if (cur !== norm(it.before.text)) return 'stale';
      p._ltN = p._ltN || {};
      p._ltN[it.beat] = it.before.text;
      setNote(p, it.beat, it.after.text);
      return 'applied';
    }
    let n = null;
    n = p ? resolve(p, it.path) : null;
    if (!n) return it.kind === 'hide' ? 'merged' : 'missing';
    const i = info(n);
    i.path = it.path;
    if (it.kind === 'text') {
      const cur = norm(n.textContent), b = norm(it.before.text), a = norm(it.after.text);
      const curTags = tagsOf(cleanHtml(n));
      const hasTags = it.after.html != null;
      if (cur === a && (!hasTags || curTags === tagsOf(it.after.html)) && (cur !== b || (hasTags && curTags !== tagsOf(it.before.html)))) return 'merged';
      if (cur !== b) return 'stale';
      i.text0 = it.before.text; i.html0 = it.before.html != null ? it.before.html : cleanHtml(n);
      if (hasTags) { n.innerHTML = it.after.html; fixKeys(n); } else n.textContent = it.after.text;
      return 'applied';
    }
    if (it.kind === 'hide') { n.setAttribute('data-lt-hide', ''); i.hidden = true; return 'applied'; }
    if (it.kind === 'style') {
      const cur = styleOf(n), keys = STYLE.filter(k => it.before[k] !== it.after[k]);
      if (keys.every(k => cur[k] === it.after[k]) && !keys.every(k => cur[k] === it.before[k])) return 'merged';
      if (!keys.every(k => cur[k] === it.before[k])) return 'stale';
      i.style0 = Object.assign({}, it.before);
      applyStyle(n, Object.assign({}, it.after));
      return 'applied';
    }
    if (it.kind === 'beat') {
      const cur = beatOf(n, i.slide);
      if (cur === it.after.beat && cur !== it.before.beat) return 'merged';
      if (cur !== it.before.beat) return 'stale';
      ensureBeat(n);
      setBeat(n, it.after.beat);
      return 'applied';
    }
    if (it.kind === 'scale') {
      const v = getComputedStyle(n).scale, cur = v && v !== 'none' ? (parseFloat(v) || 1) : 1;
      if (Math.abs(cur - it.after.scale) < .01 && Math.abs(cur - it.before.scale) >= .01) return 'merged';
      if (Math.abs(cur - it.before.scale) >= .01) return 'stale';
      applyScale(n, Object.assign({}, it.after));
      return 'applied';
    }
    ensureBase(n);
    const keys = BOX.filter(k => it.before[k] !== it.after[k]);
    const near = (x, y) => Math.abs(x - y) <= 2;
    const atB = keys.every(k => near(i.base[k], it.before[k])), atA = keys.every(k => near(i.base[k], it.after[k]));
    if (atA && !atB) return 'merged';
    if (!atB) return 'stale';
    i.base = Object.assign({}, it.before);
    applyBox(n, Object.assign({}, it.after));
    return 'applied';
  }
  function restore() {
    let gone = 0;
    E.items = E.items.filter(it => {
      if (!it.id) it.id = uid();
      const r = applyItem(it);
      if (r === 'applied' || r === 'missing') return true;
      gone++;
      return false;
    });
    // 没有服务时，已经合进源码的修改顺手从 localStorage 里清掉；有服务时以服务上的记录为准，等用户再改时一起存
    if (gone && !SERVER) save();
    E.undo = []; E.redo = []; E.snap = JSON.stringify(E.items);
    return gone;
  }

  /* =================================================================
     撤销、重做、还原：历史记的是每一步之前的修改记录；撤销时把碰过的元素都放回原样，再按记录摆一遍
     ================================================================= */
  function revertAll() {
    E.touched.forEach(n => {
      const i = n._lt;
      if (!i) return;
      if (i.html0 != null && cleanHtml(n) !== i.html0) { n.innerHTML = i.html0; fixKeys(n); }
      if (i.base) { ['data-lt-w', 'data-lt-h', 'data-lt-moved', 'data-lt-mb'].forEach(a => n.removeAttribute(a)); ['--lt-w', '--lt-h', '--lt-tx', '--lt-ty', '--lt-mb'].forEach(v => n.style.removeProperty(v)); i.box = null; i.keep = null; }
      if (i.style0) applyStyle(n, Object.assign({}, i.style0));
      if (i.beat0) setBeat(n, i.beat0.beat);
      if (i.sc0) applyScale(n, Object.assign({}, i.sc0));
      n.removeAttribute('data-lt-hide'); i.hidden = false;
    });
    PAGES.forEach(p => { if (p._ltN) Object.keys(p._ltN).forEach(b => setNote(p, +b, p._ltN[b])); });
  }
  /* 按记录摆上（不判断合并没合并，撤销、重做用） */
  function applyForce(it) {
    const p = PAGES.find(x => x.id === it.page);
    if (!p) return;
    if (it.kind === 'notes') { setNote(p, it.beat, it.after.text); return; }
    const n = resolve(p, it.path);
    if (!n) return;
    const i = info(n);
    if (it.kind === 'text') { if (it.after.html != null) { n.innerHTML = it.after.html; fixKeys(n); } else n.textContent = it.after.text; }
    else if (it.kind === 'hide') { n.setAttribute('data-lt-hide', ''); i.hidden = true; }
    else if (it.kind === 'style') { ensureStyle(n); applyStyle(n, Object.assign({}, it.after)); }
    else if (it.kind === 'beat') setBeat(n, it.after.beat);
    else if (it.kind === 'scale') applyScale(n, Object.assign({}, it.after));
    else { ensureBase(n); applyBox(n, Object.assign({}, it.after)); }
  }
  function rerender() {
    revertAll();
    E.items.forEach(applyForce);
    drawSel();
    if (I.syncPresenter) I.syncPresenter();
  }
  function travel(from, to, name) {
    if (E.text) commitText();
    if (!from.length) { I.toast(name === '撤销' ? '没有可以撤销的了' : '没有可以重做的了', 1800); return; }
    to.push(E.snap);
    E.snap = from.pop();
    E.items = JSON.parse(E.snap);
    rerender();
    changed(true);
    I.toast(name + '了一步', 1200);
  }
  const undo = () => travel(E.undo, E.redo, '撤销');
  const redo = () => travel(E.redo, E.undo, '重做');
  /* 还原这一块：这一块的所有改动回到原样（删掉它的记录） */
  function resetBlock() {
    const n = toolTarget();
    if (!n) return;
    if (E.text) commitText();
    const i = info(n), before = E.items.length;
    E.items = E.items.filter(x => !(x.page === i.page && (x.path === i.path || x.path.indexOf(i.path + '>') === 0)));
    if (E.items.length === before) { I.toast('这一块没改过', 1800); return; }
    rerender();
    changed();
    I.toast('这一块已经还原', 1800);
  }
  /* 全部还原：先确认，再清掉所有还没合并的改动 */
  function resetAll() {
    if (E.text) commitText();
    if (!E.items.length) { I.toast('还没有改动', 1800); return; }
    if (!window.confirm('把还没合并的 ' + E.items.length + ' 处改动全部还原？（还原以后可以按 Ctrl+Z 找回来）')) return;
    E.items = [];
    rerender();
    changed();
    I.toast('全部还原了', 1800);
  }

  /* =================================================================
     保存、通知
     ================================================================= */
  function post(name, body) {
    return fetch(API(name), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store', keepalive: body.length < 60000 })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  /* 每一步改完调一次：记进撤销历史（fromHistory 为真时是撤销、重做本身，不再记），去抖后自动保存 */
  function changed(fromHistory) {
    E.items.sort((x, y) => (x.no || 0) - (y.no || 0));   // 先排好序再比较，免得保存时排序被当成一步
    const now = JSON.stringify(E.items);
    if (!fromHistory && now !== E.snap) {
      E.undo.push(E.snap);
      if (E.undo.length > HISTORY) E.undo.shift();
      E.redo = [];
    }
    E.snap = now;
    E.notified = false;
    clearTimeout(E.saveT);
    E.saveT = setTimeout(save, SAVE_DELAY);
    E.dirty = true;
    updateBar();
  }
  function save() {
    clearTimeout(E.saveT); E.saveT = 0;
    E.items.sort((a, b) => (a.no || 0) - (b.no || 0));
    if (!SERVER) {
      try { localStorage.setItem(LS_KEY, JSON.stringify({ version: 1, updated: new Date().toISOString(), items: E.items })); E.failed = false; E.dirty = false; }
      catch (e) { E.failed = true; }
      updateBar();
      return Promise.resolve(!E.failed);
    }
    if (E.inflight) { E.again = true; return E.inflight; }
    const body = JSON.stringify({ version: 1, items: E.items });
    E.dirty = false; E.saving = true; updateBar();
    E.inflight = post('edits', body).then(() => { E.failed = false; }, () => { E.failed = true; E.dirty = true; })
      .then(() => {
        E.inflight = null; E.saving = false;
        if (E.again) { E.again = false; return save(); }
        updateBar();
        return !E.failed;
      });
    return E.inflight;
  }
  /* 把还没存的立刻存掉 */
  function flush() {
    if (E.saveT || E.dirty) return save();
    return E.inflight || Promise.resolve(!E.failed);
  }
  function notify() {
    if (E.text) commitText();
    if (!E.items.length) { I.toast('还没有改动'); return; }
    if (!SERVER) { copyForAi(); return; }
    E.notifying = true; updateBar();
    flush().then(ok => { if (!ok) throw new Error('save'); return post('notify', JSON.stringify({ mode: E.mode })); })
      .then(() => { E.notifying = false; E.notified = true; updateBar(); I.toast('已通知 AI。AI 改好源码后页面会自动刷新，你可以接着改', 5000); })
      .catch(() => { E.notifying = false; E.failed = true; updateBar(); I.toast('通知没发出去：在线编辑的服务可能已经关了。请回到对话里说一声「改好了」', 8000); });
  }
  function copyForAi() {
    const text = editsText(E.items, true);
    I.copyText(text).then(ok => {
      if (ok) { I.toast('已复制 ' + E.items.length + ' 处修改，贴给 AI 就行', 5000); return; }
      // 复制不了：弹一个文本框，让用户自己复制
      let m = $('.lt-edit-copy');
      if (!m) {
        m = el('div', 'lt-edit-copy', '<div class="lt-edit-copy-box"><p>没能自动复制，请全选下面的文字，复制后贴给 AI：</p><textarea readonly></textarea><button type="button">关闭</button></div>');
        document.body.appendChild(m);
        $('button', m).addEventListener('click', () => m.remove());
      }
      const ta = $('textarea', m);
      ta.value = text; ta.focus(); ta.select();
    });
  }

  /* =================================================================
     改文字、重点词
     ================================================================= */
  function startText(n, x, y) {
    deselect();
    const i = info(n);
    if (i.text0 == null) { i.text0 = norm(n.textContent); i.html0 = cleanHtml(n); }
    E.text = { el: n, html: n.innerHTML };
    n.setAttribute('contenteditable', 'true');
    n.setAttribute('spellcheck', 'false');
    n.classList.add('lt-edit-text');
    n.focus({ preventScroll: true });
    // 光标放在双击的位置
    let r = null;
    try { r = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null; } catch (e) { r = null; }
    if (r && n.contains(r.startContainer)) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    updateTools();
  }
  function endText() {
    const n = E.text.el;
    E.text = null;
    n.removeAttribute('contenteditable');
    n.removeAttribute('spellcheck');
    n.classList.remove('lt-edit-text');
    if (n.getAttribute('class') === '') n.removeAttribute('class');
    try { getSelection().removeAllRanges(); } catch (e) { /* 没有选区 */ }
    updateTools();
    return n;
  }
  function commitText() {
    if (!E.text) return;
    const n = endText();
    // 浏览器在删空时会塞一个 <br>，去掉
    if (n.innerHTML === '<br>') n.innerHTML = '';
    fixKeys(n);
    const i = n._lt, txt = norm(n.textContent), html = cleanHtml(n);
    const rich = /<[a-z]/i.test(i.html0) || /<[a-z]/i.test(html);
    const before = rich ? { text: i.text0, html: i.html0 } : { text: i.text0 };
    const after = rich ? { text: txt, html } : { text: txt };
    if (txt === i.text0 && tagsOf(html) === tagsOf(i.html0)) upsert(i, 'text', before, before);
    else upsert(i, 'text', before, after);
    changed();
  }
  function cancelText() {
    if (!E.text) return;
    const html = E.text.html;
    const n = endText();
    n.innerHTML = html;
  }
  /* 改字时把选中的字设成重点词 <em class="key">；光标在重点词里就取消 */
  function toggleKey() {
    if (!E.text) { I.toast('先双击进入改字，再选中几个字点「重点」', 3000); return; }
    const box = E.text.el, s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    if (!box.contains(r.commonAncestorContainer)) { I.toast('先在正在改的字里选中几个字', 2500); return; }
    const at = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement;
    const k = at && at.closest('.key');
    if (k && box.contains(k) && k !== box) {
      const par = k.parentNode;
      while (k.firstChild) par.insertBefore(k.firstChild, k);
      k.remove();
      par.normalize();
      return;
    }
    if (r.collapsed) { I.toast('先选中要设成重点的几个字', 2500); return; }
    const em = document.createElement('em');
    em.className = 'key';
    try { r.surroundContents(em); } catch (e) { em.appendChild(r.extractContents()); r.insertNode(em); }
    $$('.key', em).forEach(x => { while (x.firstChild) x.parentNode.insertBefore(x.firstChild, x); x.remove(); });   // 不套两层
    em.dataset.k = em.textContent;
    em.style.setProperty('--k', 1);
    s.removeAllRanges();
    const after = document.createRange();
    after.setStartAfter(em); after.collapse(true);
    s.addRange(after);
  }

  /* =================================================================
     选中、拖动、改大小、选外层
     ================================================================= */
  function select(n, keepInner) {
    if (!keepInner) E.inner = [];
    if (E.sel === n) return;
    E.sel = n;
    ensureBase(n);
    setHover(null);
    drawSel();
  }
  function deselect() { E.sel = null; E.inner = []; closePop(); drawSel(); }
  function outer() {
    if (!E.sel) return;
    const i = info(E.sel), up = E.sel.parentElement ? blockOf(E.sel.parentElement, i.slide) : null;
    if (!up) { I.toast('外面没有更大的内容块了', 2000); return; }
    const cur = E.sel;
    select(up, true);
    E.inner.push(cur);
  }
  function inner() {
    if (!E.inner.length) { I.toast('没有刚才那一层可以回去了', 2000); return; }
    select(E.inner.pop(), true);
  }
  /* 元素实际画出来的样子（舞台坐标）：从它往上到页面累计的缩放和旋转（CSS 的 scale、rotate、transform 都算） */
  function accum(n, stop) {
    let s = 1, a = 0;
    for (let x = n; x && x !== stop && x.nodeType === 1; x = x.parentElement) {
      const cs = getComputedStyle(x);
      if (cs.scale && cs.scale !== 'none') s *= parseFloat(cs.scale) || 1;
      if (cs.rotate && cs.rotate !== 'none') {
        const m = /(-?[\d.]+)(deg|rad|turn)\s*$/.exec(cs.rotate);
        if (m) a += m[2] === 'deg' ? +m[1] : m[2] === 'rad' ? +m[1] * 180 / Math.PI : +m[1] * 360;
      }
      if (cs.transform && cs.transform !== 'none' && window.DOMMatrix) {
        try { const M = new DOMMatrix(cs.transform); s *= Math.hypot(M.a, M.b) || 1; a += Math.atan2(M.b, M.a) * 180 / Math.PI; } catch (e) { /* 读不出来就当没有 */ }
      }
    }
    return { s, a };
  }
  /* 中心取 getBoundingClientRect 的中心：矩形不管怎么旋转、缩放，外接框的中心都是它自己的中心；
     宽高取没旋转时的尺寸乘上累计的缩放。返回 { cx, cy, w, h, a }（舞台坐标、角度） */
  function geom(n) {
    const i = info(n), sr = dom.stage.getBoundingClientRect(), k = scale(), r = n.getBoundingClientRect(), t = accum(n, i.slide);
    return { cx: (r.left + r.width / 2 - sr.left) / k, cy: (r.top + r.height / 2 - sr.top) / k, w: n.offsetWidth * t.s, h: n.offsetHeight * t.s, a: t.a };
  }
  /* 舞台上的位移换成某个坐标系里的位移（先转回去，再除以缩放） */
  function toLocal(dx, dy, t) {
    const r = -t.a * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    return { x: (dx * c - dy * sn) / t.s, y: (dx * sn + dy * c) / t.s };
  }
  function drawSel() {
    const b = E.selBox;
    if (b) {
      if (!E.on || !E.sel) b.hidden = true;
      else {
        const i = E.sel._lt;
        if (!i.box && !E.drag) i.base = boxOf(E.sel, i.slide);   // 没挪过、没改过框的：改了字号、文字以后大小会变，重新量
        const bx = i.box || i.base, g = geom(E.sel);
        // 框按元素旋转前的尺寸画，再套上同样的旋转；把手跟着一起转
        b.hidden = false;
        b.style.left = (g.cx - g.w / 2) + 'px'; b.style.top = (g.cy - g.h / 2) + 'px';
        b.style.width = g.w + 'px'; b.style.height = g.h + 'px';
        b.style.transform = Math.abs(g.a) > .01 ? 'rotate(' + g.a + 'deg)' : '';
        const sc = i.sc ? i.sc.scale : 1, pct = Math.round(sc * 100) + '%', size = bx.width + '×' + bx.height;
        const mode = E.drag && E.drag.moved ? E.drag.mode : '';
        $('.lt-edit-size', b).textContent = (i.hidden ? '已隐藏 · ' : '') + (mode === 'scale' ? pct : mode === 'resize' ? size : size + (sc !== 1 ? ' · ' + pct : ''));
      }
    }
    drawBeats();
    updateTools();
  }
  function setHover(n) {
    if (E.hover === n) return;
    if (E.hover) E.hover.removeAttribute('data-lt-hover');
    E.hover = n;
    if (n) n.setAttribute('data-lt-hover', '');
  }
  function startDrag(e, mode, corner) {
    const n = E.sel, i = mode === 'scale' ? ensureScale(n) : ensureBase(n), b0 = Object.assign({}, i.box || i.base);
    const sr = dom.stage.getBoundingClientRect(), g = geom(n);
    // 拖动的位移在父元素的坐标系里算（父元素转过、缩放过也对），改框大小在元素自己的坐标系里算
    E.drag = { mode, corner, x: e.clientX, y: e.clientY, k: scale(), b0, moved: false, sr, g, s0: i.sc ? i.sc.scale : 1,
      pa: accum(n.parentElement, i.slide), ta: accum(n, i.slide) };
    window.addEventListener('pointermove', onDragMove, true);
    window.addEventListener('pointerup', onDragEnd, true);
    window.addEventListener('pointercancel', onDragEnd, true);
  }
  function onDragMove(e) {
    const d = E.drag;
    if (!d) return;
    const sx = e.clientX - d.x, sy = e.clientY - d.y;
    if (!d.moved && Math.abs(sx) < 3 && Math.abs(sy) < 3) return;
    d.moved = true;
    e.preventDefault();
    const dx = sx / d.k, dy = sy / d.k, b0 = d.b0;
    let b;
    if (d.mode === 'scale') {
      // 整块等比缩放：按指针离原点（中心；按住 Shift 是左上角）的距离算倍数。原点用拖动开始时元素实际画出来的位置（转过的也对）
      const origin = e.shiftKey ? 'top left' : 'center', g = d.g;
      let ox = g.cx, oy = g.cy;
      if (origin === 'top left') {
        const r = g.a * Math.PI / 180, hx = -g.w / 2, hy = -g.h / 2;
        ox = g.cx + hx * Math.cos(r) - hy * Math.sin(r); oy = g.cy + hx * Math.sin(r) + hy * Math.cos(r);
      }
      const px0 = (d.x - d.sr.left) / d.k, py0 = (d.y - d.sr.top) / d.k, px = (e.clientX - d.sr.left) / d.k, py = (e.clientY - d.sr.top) / d.k;
      const d0 = Math.hypot(px0 - ox, py0 - oy) || 1;
      const sc = clamp(Math.round(d.s0 * Math.hypot(px - ox, py - oy) / d0 * 100) / 100, .2, 5);
      applyScale(E.sel, { scale: sc, origin });
      drawSel();
      return;
    }
    if (d.mode === 'move') { const l = toLocal(dx, dy, d.pa); b = { left: b0.left + l.x, top: b0.top + l.y, width: b0.width, height: b0.height }; }
    else {
      const l = toLocal(dx, dy, d.ta), west = /w/.test(d.corner), north = /n/.test(d.corner);
      let w = Math.max(20, b0.width + (west ? -l.x : l.x)), h = Math.max(20, b0.height + (north ? -l.y : l.y));
      if (e.shiftKey && b0.height) {   // 保持比例：以变化大的那一边为准
        const r = b0.width / b0.height;
        if (Math.abs(w / b0.width - 1) >= Math.abs(h / b0.height - 1)) h = w / r; else w = h * r;
      }
      b = { left: west ? b0.left + b0.width - w : b0.left, top: north ? b0.top + b0.height - h : b0.top, width: w, height: h };
    }
    BOX.forEach(k => { b[k] = Math.round(b[k]); });
    applyBox(E.sel, b);
    drawSel();
  }
  function onDragEnd() {
    window.removeEventListener('pointermove', onDragMove, true);
    window.removeEventListener('pointerup', onDragEnd, true);
    window.removeEventListener('pointercancel', onDragEnd, true);
    const d = E.drag;
    E.drag = null;
    if (d && d.moved && E.sel) { if (d.mode === 'scale') recordScale(E.sel); else recordBox(E.sel); changed(); }
    drawSel();
    updateTools();
  }
  function nudge(dx, dy) {
    const i = ensureBase(E.sel), b = Object.assign({}, i.box || i.base), l = toLocal(dx, dy, accum(E.sel.parentElement, i.slide));
    b.left += Math.round(l.x); b.top += Math.round(l.y);
    applyBox(E.sel, b);
    recordBox(E.sel);
    drawSel();
    changed();
  }
  function toggleHide() {
    const n = E.sel, i = info(n);
    i.hidden = !i.hidden;
    if (i.hidden) n.setAttribute('data-lt-hide', ''); else n.removeAttribute('data-lt-hide');
    upsert(i, 'hide', { hidden: false }, { hidden: !!i.hidden });
    drawSel();
    changed();
  }

  /* =================================================================
     拍号角标：编辑模式里每个节拍块的左上角标「拍 n」，改过的标「拍 a→b」
     ================================================================= */
  function drawBeats() {
    const layer = E.beats;
    if (!layer) return;
    layer.innerHTML = '';
    const p = curPage();
    if (!E.on || !p || E.drag) return;
    const set = new Set();
    p.units.forEach(u => { if (!u.child && u.el instanceof HTMLElement && !u.el.closest('.mascot') && !u.el.closest(EXCLUDE)) set.add(u.el); });
    $$('[data-lt-beat]', p.el).forEach(n => set.add(n));
    const sr = dom.stage.getBoundingClientRect(), k = scale();
    let h = '';
    set.forEach(n => {
      if (n === E.sel) return;   // 选中的块：拍号在工具栏上，角标会压住把手，不画
      const r = n.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const i = n._lt, b0 = i && i.beat0 ? i.beat0.beat : beatOf(n, p.el), b = i && i.beat0 ? i.beatCur : b0;
      const x = (r.left - sr.left) / k, y = (r.top - sr.top) / k;
      h += '<span class="lt-edit-badge' + (b !== b0 ? ' lt-edit-moved' : '') + (n === E.sel ? ' lt-edit-cur' : '') + '" style="left:' + Math.round(x) + 'px;top:' + Math.round(y) + 'px">拍 ' + (b !== b0 ? b0 + '→' + b : b) + '</span>';
    });
    layer.innerHTML = h;
  }

  /* =================================================================
     样式工具栏：选中块或改字时浮在它旁边
     ================================================================= */
  function toolTarget() { return E.text ? E.text.el : E.sel; }
  /* 改字号、颜色、粗细、对齐的对象：正在改字的那段；选中的块本身是一段文字、或者里面只有一段文字时就是那段文字；
     里面有好几段文字（比如名字和日期各排一行）时没有对象，工具栏不放这几组，双击其中一段再改 */
  function styleTarget() {
    if (E.text) return E.text.el;
    if (!E.sel) return null;
    // 撤销、改字会换掉里面的节点，换了就重找
    if (!E.stMemo || E.stMemo.sel !== E.sel || (E.stMemo.t && !E.sel.contains(E.stMemo.t))) { const ts = textsIn(E.sel); E.stMemo = { sel: E.sel, t: ts.length === 1 ? ts[0] : null }; }
    return E.stMemo.t;
  }
  /* 两块面板跟着当前页的风格：深色风格（风格注册时写了 dark: true）用深色玻璃；强调色取这一页的 --accent */
  function themeUi() {
    const p = curPage();
    if (!p) return;
    const dark = !!I.sc(p.scene).dark;
    document.body.classList.toggle('lt-darkui', dark);
    const acc = (getComputedStyle(p.el).getPropertyValue('--accent') || '').trim() || '#2563eb';
    if (acc === E.acc) return;
    E.acc = acc;
    document.body.style.setProperty('--lt-accent', acc);
    // 强调色很浅（比如黄色）时，主按钮上的字用深色
    const rgb = probe(p.el, 'color', acc).match(/[\d.]+/g) || [37, 99, 235];
    const lum = (.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]) / 255;
    document.body.style.setProperty('--lt-on-accent', lum > .62 ? '#1b1f27' : '#fff');
  }
  /* 当前字号（px 数字）：工具栏上显示它，−/+ 在常用档位里走 */
  const pxOf = n => Math.round(parseFloat(getComputedStyle(n).fontSize) || 0);
  function stepFont(dir) {
    const n = styleTarget();
    if (!n) return;
    const cur = pxOf(n);
    const next = dir > 0 ? PX.find(v => v > cur) : PX.slice().reverse().find(v => v < cur);
    if (!next) { I.toast(dir > 0 ? '已经是最大的 120' : '最小 32，再小后排就看不清了', 2000); return; }
    setStyle(n, 'fontSize', next + 'px');
  }
  function closePop() { if (E.pop) E.pop.hidden = true; }
  function openPop(anchor) {
    const n = styleTarget();
    if (!n || !E.pop) return;
    if (!E.pop.hidden) { closePop(); return; }
    const st = ensureStyle(n).styleCur, cur = pxOf(n);
    $$('[data-act=fs]', E.pop).forEach(b => {
      const v = b.dataset.v;
      b.classList.toggle('lt-edit-on', v === st.fontSize || (v === cur + 'px' && /px$/.test(st.fontSize)));
      const px = b.querySelector('small');
      if (px && /^var/.test(v)) px.textContent = Math.round(parseFloat(probe(n, 'fontSize', v)) || 0);
    });
    E.pop.hidden = false;
    const r = anchor.getBoundingClientRect(), pw = E.pop.offsetWidth, ph = E.pop.offsetHeight;
    let top = r.bottom + 6;
    if (top + ph > innerHeight - 6) top = Math.max(6, r.top - ph - 6);
    E.pop.style.left = Math.round(clamp(r.left, 6, innerWidth - pw - 6)) + 'px';
    E.pop.style.top = Math.round(top) + 'px';
  }
  function updateTools() {
    const t = E.tools;
    if (!t) return;
    const n = toolTarget();
    if (!E.on || !n || E.drag) { t.hidden = true; closePop(); return; }
    themeUi();
    t.hidden = false;
    const sn = styleTarget();
    $('.lt-edit-g-text', t).hidden = !sn;
    if (sn) paintStyle(t, sn);
    $('.lt-edit-g-key', t).hidden = !E.text;
    const bg = $('.lt-edit-g-beat', t);
    bg.hidden = !!E.text || !E.sel;
    if (E.sel && !E.text) $('.lt-edit-beatv', bg).textContent = ensureBeat(E.sel).beatCur;
    $('[data-act=outer]', t).disabled = !!E.text || !E.sel;
    $('[data-act=inner]', t).disabled = !!E.text || !E.inner.length;
    const bi = info(n);
    $('[data-act=reset]', t).disabled = !E.items.some(x => x.page === bi.page && (x.path === bi.path || x.path.indexOf(bi.path + '>') === 0));
    placeTools(t, n);
  }
  /* 字号、颜色、粗细、对齐几组按钮的当前状态（n 是 styleTarget） */
  function paintStyle(t, n) {
    const i = ensureStyle(n), st = i.styleCur;
    $('.lt-edit-fsv', t).textContent = pxOf(n);
    // 调色板：这一页风格算出来的颜色，当前色打勾
    const seen = new Set(), inPal = v => COLORS.some(([c]) => v === 'var(' + c + ')');
    $$('.lt-edit-sw', t).forEach(b => {
      const v = b.dataset.v;
      if (v !== 'reset') {
        const c = probe(n, 'color', 'var(' + v + ')');
        b.style.setProperty('--sw', c);
        b.hidden = seen.has(c);   // 风格里两个变量是同一个颜色（比如强调色和主色）：只留一个
        seen.add(c);
      }
      b.classList.toggle('lt-edit-on', v === 'reset' ? st.color === i.style0.color && !inPal(st.color) : st.color === 'var(' + v + ')');
    });
    $('[data-act=bold]', t).classList.toggle('lt-edit-on', +st.fontWeight >= 600);
    $$('[data-act=align]', t).forEach(b => b.classList.toggle('lt-edit-on', st.textAlign === b.dataset.v));
  }
  function placeTools(t, n) {
    // 位置：贴着选中框（转过的按转后的外接框）的上方；上面放不下（挨着编辑条）就放下方；都放不下放在右边；不遮住元素
    const box = E.sel && !E.text && E.selBox && !E.selBox.hidden ? E.selBox : n;
    const r = box.getBoundingClientRect(), tw = t.offsetWidth, th = t.offsetHeight, gap = 12;
    const barB = E.bar && !E.bar.hidden ? E.bar.getBoundingClientRect().bottom + 8 : 8;
    let top = r.top - th - gap, left = r.left + r.width / 2 - tw / 2;
    if (top < barB) {
      top = r.bottom + gap + (box === E.selBox ? 22 : 0);   // 下方要让开框下面的尺寸标签
      if (top + th > innerHeight - 6) {
        top = clamp(r.top + r.height / 2 - th / 2, barB, innerHeight - th - 6);
        left = r.right + gap + tw < innerWidth ? r.right + gap : r.left - gap - tw;
      }
    }
    t.classList.toggle('lt-edit-up', top < r.top);   // 工具栏在上方时，悬停提示往上弹，不盖住元素
    t.style.left = Math.round(clamp(left, 6, Math.max(6, innerWidth - tw - 6))) + 'px';
    t.style.top = Math.round(top) + 'px';
  }
  function onTool(e) {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    if (!toolTarget()) return;
    const act = b.dataset.act, n = styleTarget(), st = n ? ensureStyle(n).styleCur : null;
    if (act !== 'fsmenu') closePop();
    if (/^(fs|fsmenu|fsstep|color|bold|align)$/.test(act) && !n) return;   // 选中的不是文字：这几组本来就藏着
    if (act === 'fsmenu') { openPop(b); return; }
    if (act === 'fs') setStyle(n, 'fontSize', b.dataset.v === 'reset' ? null : b.dataset.v);
    else if (act === 'fsstep') stepFont(+b.dataset.v);
    else if (act === 'reset') resetBlock();
    else if (act === 'color') setStyle(n, 'color', b.dataset.v === 'reset' ? null : 'var(' + b.dataset.v + ')');
    else if (act === 'bold') setStyle(n, 'fontWeight', +st.fontWeight >= 600 ? '400' : '700');
    else if (act === 'align') setStyle(n, 'textAlign', b.dataset.v);
    else if (act === 'key') toggleKey();
    else if (act === 'beat') stepBeat(+b.dataset.v);
    else if (act === 'outer') outer();
    else if (act === 'inner') inner();
    if (E.sel || E.text) drawSel();
  }

  /* =================================================================
     指针
     ================================================================= */
  function inUi(t) { return !!(t && t.closest && t.closest('.lt-edit-bar, .lt-edit-hint, .lt-edit-mpop, .lt-edit-tools, .lt-edit-pop, .lt-edit-copy, #toast, #lightbox')); }
  function onDown(e) {
    if (!E.on || e.button !== 0) return;
    const t = e.target;
    if (inUi(t)) return;
    closePop();
    if (E.text) {
      if (E.text.el.contains(t)) return;   // 在正在改的字里点：放光标、选字，交给浏览器
      commitText();
    }
    const h = t.closest && t.closest('.lt-edit-h');
    if (h && E.sel) { e.preventDefault(); startDrag(e, e.altKey ? 'resize' : 'scale', h.dataset.c); return; }
    // 双击（两次按下离得近、间隔短）：改字
    const now = Date.now(), last = E.lastDown;
    E.lastDown = { t: now, x: e.clientX, y: e.clientY };
    if (last && now - last.t < 450 && Math.abs(e.clientX - last.x) < 6 && Math.abs(e.clientY - last.y) < 6) {
      const tn = textAt(e.clientX, e.clientY);
      if (tn) { e.preventDefault(); E.lastDown = null; startText(tn, e.clientX, e.clientY); return; }
    }
    const b = blockAt(e.clientX, e.clientY);
    if (!b) { deselect(); return; }
    e.preventDefault();
    // 点在已选中的块里（包括选了外层以后点它里面的小块）：保持选中，拖的是选中的这一块
    if (!(E.sel && E.sel.contains(b))) select(b);
    startDrag(e, 'move');
  }
  function onMove(e) {
    if (!E.on || E.drag || E.text || inUi(e.target)) { if (E.on && !E.drag) setHover(null); return; }
    const b = blockAt(e.clientX, e.clientY);
    setHover(b && b !== E.sel && !(E.sel && E.sel.contains(b)) ? b : null);
  }
  /* 链接、表单这类元素的默认动作（跳转、提交）在编辑模式下拦掉 */
  function onClick(e) {
    if (!E.on || inUi(e.target)) return;
    if (E.text && E.text.el.contains(e.target)) return;
    if (dom.stage.contains(e.target)) e.preventDefault();
  }
  function onPaste(e) {
    if (!E.text || !E.text.el.contains(e.target)) return;
    e.preventDefault();   // 只贴纯文字，不把别处的格式带进来
    const t = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
    document.execCommand('insertText', false, t.replace(/\s*\n\s*/g, ' '));
  }

  /* =================================================================
     键盘（ui.js 的 onKey 最先问这里；返回 true 表示这个键编辑模式用掉了）
     ================================================================= */
  function editKey(e) {
    if (!E.on) return false;
    const k = e.key;
    if (E.text) {
      if (k === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); commitText(); }
      else if (k === 'Escape') { e.preventDefault(); cancelText(); }
      return true;   // 其余的键都是在打字（Ctrl+Z 这类交给浏览器）
    }
    const ae = document.activeElement;
    if (ae && ae.closest && ae.closest('.lt-edit-copy, .lt-edit-tools')) return true;
    const lk = k.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (lk === 'z' || lk === 'y')) {
      e.preventDefault();
      if (lk === 'y' || e.shiftKey) redo(); else undo();
      return true;
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey && E.sel && (k === 'ArrowUp' || k === 'ArrowDown')) {
      e.preventDefault();
      if (k === 'ArrowUp') outer(); else inner();
      return true;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (k === 'e' || k === 'E') { exit(); return true; }
    if (E.sel) {
      const st = e.shiftKey ? 10 : 1;
      const mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[k];
      if (mv) { e.preventDefault(); nudge(mv[0], mv[1]); return true; }
      if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); toggleHide(); return true; }
      if (k === 'Escape') { deselect(); return true; }
    }
    if (I.NEXT_KEYS.has(k)) { e.preventDefault(); showPage(S.cur.p + 1); return true; }
    if (I.PREV_KEYS.has(k)) { e.preventDefault(); showPage(S.cur.p - 1); return true; }
    if (k === 'Home') { e.preventDefault(); showPage(0); return true; }
    if (k === 'End') { e.preventDefault(); showPage(PAGES.length - 1); return true; }
    if (/^[oblOBL.]$/.test(k)) return true;   // 总览、黑屏、激光笔：编辑时不用
    return false;   // F 全屏、S 演讲者视图、T / R 计时照常
  }

  /* =================================================================
     进入、退出
     ================================================================= */
  function showPage(pi) {
    pi = clamp(pi, 0, PAGES.length - 1);
    deselect(); setHover(null);
    I.go(pi, PAGES[pi].total, { anim: false });
    themeUi();
    drawBeats();
  }
  function enter() {
    if (E.on || !PAGES.length) return;
    if (S.reading) { I.toast('阅读模式下不能编辑：把窗口拉宽（横屏）再按 E'); return; }
    I.finishRunning(); I.finishPageTl();
    if (I.closeTools) I.closeTools();
    if (dom.lb && !dom.lb.hidden) I.closeShot();
    E.on = true; S.editing = true;
    injectStyle();
    document.body.classList.add('lt-editing');
    if (G) G.globalTimeline.pause();
    buildUi();
    E.bar.hidden = false;
    if (E.hint) {
      let seen = false;
      try { seen = sessionStorage.getItem(HINT_KEY) === '1'; } catch (e) { seen = false; }
      E.hint.hidden = seen;
    }
    setScale();
    showPage(S.cur.p);
    const first = !E.loaded;
    E.loaded = true;
    (first ? load() : Promise.resolve()).then(() => {
      const gone = first ? restore() : 0;
      updateBar(); drawBeats();
      if (I.syncPresenter) I.syncPresenter();
      if (gone && first) I.toast('有 ' + gone + ' 处修改已经在源码里了，已清掉', 4000);
    });
    if (first) I.toast('编辑模式：单击选中，拖动挪位置，拖四个角整块缩放（按住 Alt 改框的大小）；Ctrl+Z 撤销；双击改文字；旁边的工具栏改字号、颜色、拍号；Alt+↑ 选外层；← → 翻页，E 退出', 7000);
    updateBar();
    if (I.syncPresenter) I.syncPresenter();
  }
  function exit() {
    if (!E.on) return;
    if (E.text) commitText();
    deselect(); setHover(null);
    flush();
    E.on = false; S.editing = false;
    document.body.classList.remove('lt-editing');
    if (G) G.globalTimeline.resume();
    if (E.bar) E.bar.hidden = true;
    if (E.hint) E.hint.hidden = true;
    if (E.mpop) E.mpop.hidden = true;
    updateTools(); drawBeats();
    if (!S.reading) I.go(S.cur.p, PAGES[S.cur.p].total, { anim: false });
    if (I.syncPresenter) I.syncPresenter();
  }
  function load() {
    if (SERVER) {
      try { localStorage.removeItem(LS_KEY); } catch (e) { /* 存不了不要紧 */ }
      return fetch(API('edits'), { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null)
        .then(d => { E.items = d && Array.isArray(d.items) ? d.items : []; });
    }
    let d = null;
    try { d = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { d = null; }
    E.items = d && Array.isArray(d.items) ? d.items : [];
    return Promise.resolve();
  }
  function setScale() { if (dom.stage) dom.stage.style.setProperty('--lt-ik', String(1 / scale())); }

  /* 有服务时：源码改了（reload）或一批修改合并完（merged）就刷新，停在原来那页，编辑模式照旧 */
  function connect() {
    if (!window.EventSource) return;
    const es = new EventSource(API('events'));
    E.es = es;
    const go = why => () => {
      if (E.reloading) return;
      E.reloading = true;
      if (E.text) commitText();
      flush().then(() => {
        try { sessionStorage.setItem(SS_KEY, JSON.stringify({ p: S.cur.p, edit: E.on, why })); } catch (e) { /* 存不了就回到地址里的页 */ }
        location.reload();
      });
    };
    es.addEventListener('reload', go('reload'));
    es.addEventListener('merged', go('merged'));
  }

  /* =================================================================
     界面
     ================================================================= */
  /* 线条图标（24×24，描边 currentColor） */
  const ICONS = {
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    resetAll: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    exit: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
    left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    center: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
    right: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
    key: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    outer: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    inner: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    erase: '<path d="M7 21h10"/><path d="m5.5 13.5 7-7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12 19H8z"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
  };
  const icon = k => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>';
  /* 图标按钮：data-tip 是悬停提示（名字和快捷键） */
  const ibtn = (cls, ic, tip, attrs) => '<button type="button" class="lt-edit-ib ' + cls + '" data-tip="' + tip + '" aria-label="' + tip + '"' + (attrs || '') + '>' + icon(ic) + '</button>';
  function updateBar() {
    if (!E.bar) return;
    const n = E.items.length;
    const dot = $('.lt-edit-dot', E.bar), st = $('.lt-edit-status', E.bar), btn = $('.lt-edit-go', E.bar);
    const state = E.failed ? 'fail' : E.saving || E.saveT ? 'saving' : n ? 'saved' : 'idle';
    dot.dataset.s = state;
    $('.lt-edit-stxt', st).textContent = E.failed ? '保存失败' : n ? n + ' 处改动' : '未改动';
    st.dataset.tip = { fail: '保存失败，点一下重试', saving: '正在保存…', saved: '已自动保存', idle: '还没改动' }[state];
    st.classList.toggle('lt-edit-fail', E.failed);
    const mv = $('.lt-edit-modev', E.bar);
    if (mv) mv.textContent = MODE_LABEL[E.mode];
    $('.lt-edit-gotxt', btn).textContent = SERVER ? (E.notifying ? '正在通知…' : E.notified ? 'AI 正在改…' : '通知 AI 修改') : '复制修改给 AI';
    btn.disabled = !n || E.notifying || E.notified;
    $('.lt-edit-undo', E.bar).disabled = !E.undo.length;
    $('.lt-edit-redo', E.bar).disabled = !E.redo.length;
    $('.lt-edit-all', E.bar).disabled = !n;
    themeUi();
  }
  function buildUi() {
    if (E.bar) return;
    const sep = '<i class="lt-edit-sep"></i>';
    E.bar = el('div', 'lt-edit-bar lt-edit-glass',
      '<button type="button" class="lt-edit-status" data-tip="还没改动"><i class="lt-edit-dot"></i><span class="lt-edit-stxt">未改动</span></button>' + sep +
      ibtn('lt-edit-undo', 'undo', '撤销 Ctrl+Z') + ibtn('lt-edit-redo', 'redo', '重做 Ctrl+Shift+Z / Ctrl+Y') + ibtn('lt-edit-all', 'resetAll', '全部还原（清掉还没合并的改动）') + sep +
      '<button type="button" class="lt-edit-mode" data-tip="改完怎么合进源码"><span class="lt-edit-modev"></span>' + icon('down') + '</button>' +
      '<button type="button" class="lt-edit-go" data-tip="' + (SERVER ? '把改动交给 AI 合进源码' : '复制改动清单，贴给 AI') + '">' + icon(SERVER ? 'send' : 'copy') + '<span class="lt-edit-gotxt"></span></button>' +
      ibtn('lt-edit-exit', 'exit', '退出编辑 E'));
    E.bar.setAttribute('role', 'toolbar');
    E.bar.setAttribute('data-noclick', '');
    // 离线编辑（没连上 AI 开的编辑服务）：屏幕底部一条提示，说明改完怎么交给 AI，并引导用户让 AI 开在线编辑（改完一键通知）
    if (!SERVER) {
      E.hint = el('div', 'lt-edit-hint lt-edit-glass',
        '<span class="lt-edit-hint-tag">离线编辑</span>' +
        '<span class="lt-edit-hint-txt">改完点「复制修改给 AI」贴进对话。想改完<b>一键交给 AI</b>？把这句话发给 AI，它会开在线编辑：</span>' +
        '<button type="button" class="lt-edit-hint-say" data-tip="复制这句话">' + icon('copy') + '<span>' + OFFLINE_SAY + '</span></button>' +
        '<button type="button" class="lt-edit-hint-x" data-tip="知道了" aria-label="知道了">' + icon('exit') + '</button>');
      E.hint.hidden = true;
      E.hint.setAttribute('data-noclick', '');
      E.hint.setAttribute('role', 'note');
      E.hint.addEventListener('mousedown', e => e.preventDefault());
      $('.lt-edit-hint-say', E.hint).addEventListener('click', () => {
        I.copyText(OFFLINE_SAY).then(ok => I.toast(ok ? '已复制，发给 AI 就行' : '没能自动复制，请手动对 AI 说：' + OFFLINE_SAY, 3500));
      });
      $('.lt-edit-hint-x', E.hint).addEventListener('click', () => {
        E.hint.hidden = true;
        try { sessionStorage.setItem(HINT_KEY, '1'); } catch (e) { /* 存不了就只关这一次 */ }
        updateTools();
      });
      document.body.appendChild(E.hint);
    }
    E.bar.addEventListener('mousedown', e => e.preventDefault());   // 点按钮不抢焦点：免得之后按空格又点一次按钮
    $('.lt-edit-status', E.bar).addEventListener('click', () => { if (E.failed) save(); });
    $('.lt-edit-go', E.bar).addEventListener('click', notify);
    // 合并方式菜单
    E.mpop = el('div', 'lt-edit-pop lt-edit-mpop lt-edit-glass', '<div class="lt-edit-poph">改完怎么合进源码</div>' +
      Object.keys(MODES).map(k => '<button type="button" data-mode="' + k + '"><b>' + MODE_LABEL[k] + '</b><small>' + MODE_DESC[k] + '</small></button>').join(''));
    E.mpop.hidden = true;
    E.mpop.setAttribute('data-noclick', '');
    E.mpop.addEventListener('mousedown', e => e.preventDefault());
    E.mpop.addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (!b) return;
      E.mode = b.dataset.mode;
      try { localStorage.setItem(MODE_KEY, E.mode); } catch (err) { /* 存不了就只管这次 */ }
      E.mpop.hidden = true; updateBar();
      I.toast('合并方式：' + MODE_LABEL[E.mode], 1800);
    });
    document.body.appendChild(E.mpop);
    $('.lt-edit-mode', E.bar).addEventListener('click', () => {
      if (!E.mpop.hidden) { E.mpop.hidden = true; return; }
      E.mpop.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('lt-edit-on', x.dataset.mode === E.mode));
      E.mpop.hidden = false;
      const r = $('.lt-edit-mode', E.bar).getBoundingClientRect(), pw = E.mpop.offsetWidth;
      E.mpop.style.left = Math.round(clamp(r.left + r.width / 2 - pw / 2, 6, innerWidth - pw - 6)) + 'px';
      E.mpop.style.top = Math.round(r.bottom + 8) + 'px';
    });
    $('.lt-edit-undo', E.bar).addEventListener('click', undo);
    $('.lt-edit-redo', E.bar).addEventListener('click', redo);
    $('.lt-edit-all', E.bar).addEventListener('click', resetAll);
    $('.lt-edit-exit', E.bar).addEventListener('click', exit);
    document.body.appendChild(E.bar);

    // 每组后面自带分隔线，哪组藏起来都不会多出或少一道线；字号、颜色、粗细对齐这几组只在选中的是文字时出现（lt-edit-g-text）
    E.tools = el('div', 'lt-edit-tools lt-edit-glass',
      '<span class="lt-edit-g-text"><span class="lt-edit-grp" data-tip="字号">' + ibtn('', 'minus', '字号小一档', ' data-act="fsstep" data-v="-1"') +
        '<button type="button" class="lt-edit-fsbtn" data-act="fsmenu" data-tip="选字号"><b class="lt-edit-fsv">36</b>' + icon('down') + '</button>' +
        ibtn('', 'plus', '字号大一档', ' data-act="fsstep" data-v="1"') + '</span>' + sep +
      '<span class="lt-edit-grp">' + COLORS.map(([v, l]) => '<button type="button" class="lt-edit-sw" data-act="color" data-v="' + v + '" data-tip="' + l + '" aria-label="' + l + '">' + icon('check') + '</button>').join('') +
        '<button type="button" class="lt-edit-sw lt-edit-sw0" data-act="color" data-v="reset" data-tip="原来的颜色" aria-label="原来的颜色">' + icon('check') + '</button></span>' + sep +
      '<span class="lt-edit-grp">' + ibtn('', 'bold', '加粗', ' data-act="bold"') +
        ibtn('', 'left', '左对齐', ' data-act="align" data-v="left"') + ibtn('', 'center', '居中', ' data-act="align" data-v="center"') + ibtn('', 'right', '右对齐', ' data-act="align" data-v="right"') + '</span>' + sep + '</span>' +
      '<span class="lt-edit-grp lt-edit-g-key">' + ibtn('', 'key', '设成重点词（再点一次取消）', ' data-act="key"') + sep + '</span>' +
      '<span class="lt-edit-grp lt-edit-g-beat"><span class="lt-edit-beat" data-tip="第几拍出现">拍 <b class="lt-edit-beatv">0</b></span>' +
        ibtn('', 'minus', '早一拍出现', ' data-act="beat" data-v="-1"') + ibtn('', 'plus', '晚一拍出现', ' data-act="beat" data-v="1"') + sep + '</span>' +
      '<span class="lt-edit-grp">' + ibtn('', 'outer', '选外层 Alt+↑', ' data-act="outer"') + ibtn('', 'inner', '回内层 Alt+↓', ' data-act="inner"') +
        ibtn('', 'erase', '还原这一块', ' data-act="reset"') + '</span>');
    E.tools.hidden = true;
    E.tools.setAttribute('data-noclick', '');
    E.tools.addEventListener('mousedown', e => e.preventDefault());   // 不抢改字框的焦点和选区
    E.tools.addEventListener('click', onTool);
    document.body.appendChild(E.tools);
    // 字号下拉：常用的 px 和风格档位
    E.pop = el('div', 'lt-edit-pop lt-edit-glass',
      '<div class="lt-edit-poph">常用</div><div class="lt-edit-popg">' + PX.map(v => '<button type="button" data-act="fs" data-v="' + v + 'px">' + v + '</button>').join('') + '</div>' +
      '<div class="lt-edit-poph">风格档位</div><div class="lt-edit-popl">' + SIZES.map(([v, l]) => '<button type="button" data-act="fs" data-v="var(' + v + ')">' + l + '<small></small></button>').join('') +
      '<button type="button" data-act="fs" data-v="reset">原来的字号<small></small></button></div>');
    E.pop.hidden = true;
    E.pop.setAttribute('data-noclick', '');
    E.pop.addEventListener('mousedown', e => e.preventDefault());
    E.pop.addEventListener('click', onTool);
    document.body.appendChild(E.pop);

    E.selBox = el('div', 'lt-edit-sel', '<span class="lt-edit-size"></span>' + ['nw', 'ne', 'sw', 'se'].map(c => '<i class="lt-edit-h" data-c="' + c + '"></i>').join(''));
    E.selBox.hidden = true;
    E.beats = el('div', 'lt-edit-beats');
    dom.stage.append(E.beats, E.selBox);
  }
  const CSS_TEXT = [
    'body.lt-editing #toast{top:70px}',
    /* 液态玻璃面板：浅色风格是半透明白，深色风格（body.lt-darkui）是半透明深色；强调色取风格的 --accent */
    '.lt-edit-glass{--lt-bg:rgba(255,255,255,.32);--lt-fg:#1d2330;--lt-sub:#5b6474;--lt-line:rgba(255,255,255,.8);--lt-sep:rgba(20,30,50,.12);--lt-hov:rgba(20,30,50,.07);--lt-on:rgba(20,30,50,.1);--lt-acc:var(--lt-accent,#2563eb);' +
      'position:fixed;z-index:960;display:flex;align-items:center;gap:2px;padding:5px;border-radius:16px;background:var(--lt-bg);color:var(--lt-fg);' +
      '-webkit-backdrop-filter:blur(14px) saturate(1.8);backdrop-filter:blur(14px) saturate(1.8);border:1px solid var(--lt-line);' +
      'box-shadow:0 12px 32px rgba(15,23,42,.12),0 2px 6px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.55);' +
      'font:500 13px/1 system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;letter-spacing:0;user-select:none;-webkit-user-select:none;white-space:nowrap}',
    'body.lt-darkui .lt-edit-glass{--lt-bg:rgba(30,34,44,.34);--lt-fg:#eef1f6;--lt-sub:#a3acbb;--lt-line:rgba(255,255,255,.16);--lt-sep:rgba(255,255,255,.14);--lt-hov:rgba(255,255,255,.09);--lt-on:rgba(255,255,255,.16);' +
      'box-shadow:0 12px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08)}',
    '.lt-edit-glass[hidden],.lt-edit-glass [hidden]{display:none!important}',
    '.lt-edit-bar{left:50%;top:12px;transform:translateX(-50%)}',
    '.lt-edit-mode{gap:4px!important;padding:0 8px!important;font-size:12.5px;color:var(--lt-sub)!important}',
    '.lt-edit-mode svg{width:13px;height:13px}',
    '.lt-edit-glass.lt-edit-mpop{display:flex;flex-direction:column;align-items:stretch;gap:2px;width:300px;padding:6px}',
    '.lt-edit-mpop button{display:flex!important;flex-direction:column;align-items:flex-start!important;gap:1px!important;height:auto!important;padding:8px 10px!important;text-align:left;border-radius:10px!important}',
    '.lt-edit-mpop button b{font-weight:600;font-size:13px}',
    '.lt-edit-mpop button small{color:var(--lt-sub);font-size:12px;line-height:1.45;white-space:normal}',
    '.lt-edit-mpop button.lt-edit-on{background:var(--lt-on)!important;box-shadow:inset 3px 0 0 var(--lt-acc)}',
    '.lt-edit-glass.lt-edit-hint{left:50%;bottom:24px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;width:max-content;max-width:calc(100vw - 24px);padding:6px 6px 6px 8px;font-size:13px;line-height:1.5}',
    '.lt-edit-hint-tag{flex:none;padding:2px 8px;border-radius:8px;background:var(--lt-acc);color:var(--lt-on-accent,#fff);font-weight:600;font-size:12px}',
    '.lt-edit-hint-txt{color:var(--lt-fg)}',
    '.lt-edit-hint-txt b{font-weight:700}',
    '.lt-edit-hint-say{height:30px!important;padding:0 10px!important;border-radius:9px!important;background:var(--lt-on)!important;font-weight:600}',
    '.lt-edit-hint-say:hover{background:var(--lt-hov)!important}',
    '.lt-edit-hint-x{flex:none;height:28px!important;min-width:28px!important;padding:0!important}',
    '.lt-edit-hint svg{width:15px;height:15px}',
    '@media (max-width:900px){.lt-edit-hint-txt{display:none}}',
    '.lt-edit-tools{z-index:955}',
    '.lt-edit-pop{z-index:965;flex-direction:column;align-items:stretch;gap:4px;padding:8px;width:236px}',
    '.lt-edit-glass button{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;min-width:32px;padding:0 8px;margin:0;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;cursor:pointer;position:relative}',
    '.lt-edit-glass button:hover:not(:disabled){background:var(--lt-hov)}',
    '.lt-edit-glass button:disabled{opacity:.35;cursor:default}',
    '.lt-edit-glass button.lt-edit-on{background:var(--lt-on);color:var(--lt-acc)}',
    '.lt-edit-glass svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '.lt-edit-ib{padding:0!important;width:32px}',
    '.lt-edit-sep{flex:none;width:1px;height:20px;margin:0 4px;background:var(--lt-sep)}',
    '.lt-edit-grp{display:inline-flex;align-items:center;gap:2px}',
    '.lt-edit-g-text{display:contents}',
    /* 悬停提示：名字和快捷键 */
    '.lt-edit-glass [data-tip]:hover::after{content:attr(data-tip);position:absolute;left:50%;top:calc(100% + 8px);transform:translateX(-50%);padding:5px 8px;border-radius:7px;background:rgba(20,24,32,.88);color:#fff;font:500 12px/1.2 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;white-space:nowrap;pointer-events:none;z-index:2}',
    '.lt-edit-tools.lt-edit-up [data-tip]:hover::after{top:auto;bottom:calc(100% + 8px)}',
    /* 顶部编辑条：圆点加短字的保存状态；「通知 AI 修改」是唯一的主按钮 */
    '.lt-edit-status{padding:0 10px!important;color:var(--lt-sub)!important;cursor:default!important}',
    '.lt-edit-status.lt-edit-fail{color:#e5484d!important;cursor:pointer!important}',
    '.lt-edit-dot{width:8px;height:8px;border-radius:50%;background:#9aa3b2;flex:none}',
    '.lt-edit-dot[data-s=saved]{background:#30a46c;box-shadow:0 0 0 3px rgba(48,164,108,.18)}',
    '.lt-edit-dot[data-s=saving]{background:#f5a524;animation:lt-edit-blink 1s ease-in-out infinite}',
    '.lt-edit-dot[data-s=fail]{background:#e5484d}',
    '@keyframes lt-edit-blink{50%{opacity:.35}}',
    '.lt-edit-glass .lt-edit-go{height:32px;padding:0 14px;margin:0 2px;background:var(--lt-acc);color:var(--lt-on-accent,#fff);font-weight:600;box-shadow:0 4px 12px -4px var(--lt-acc)}',
    '.lt-edit-glass .lt-edit-go:hover:not(:disabled){background:var(--lt-acc);filter:brightness(1.08)}',
    '.lt-edit-glass .lt-edit-go:disabled{opacity:.5}',
    /* 工具栏：字号步进、色块、拍号步进 */
    '.lt-edit-fsbtn{min-width:54px!important;padding:0 6px 0 10px!important;background:var(--lt-hov)!important}',
    '.lt-edit-fsbtn b{font-weight:700;font-variant-numeric:tabular-nums}',
    '.lt-edit-fsbtn svg{width:14px;height:14px}',
    '.lt-edit-glass .lt-edit-sw{width:24px;min-width:24px;height:24px;padding:0;margin:0 2px;border-radius:50%;background:var(--sw,#888);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.85),0 0 0 1px rgba(0,0,0,.12)}',
    '.lt-edit-glass .lt-edit-sw:hover:not(:disabled){background:var(--sw,#888);transform:scale(1.08)}',
    '.lt-edit-glass .lt-edit-sw svg{width:14px;height:14px;stroke:#fff;stroke-width:3;opacity:0;filter:drop-shadow(0 0 1px rgba(0,0,0,.6))}',
    '.lt-edit-glass .lt-edit-sw.lt-edit-on{background:var(--sw,#888);color:inherit}',
    '.lt-edit-glass .lt-edit-sw.lt-edit-on svg{opacity:1}',
    '.lt-edit-glass .lt-edit-sw0{--sw:transparent;box-shadow:inset 0 0 0 1.5px var(--lt-sub)}',
    '.lt-edit-glass .lt-edit-sw0::before{content:"";position:absolute;left:4px;right:4px;top:50%;height:1.5px;background:var(--lt-sub);transform:rotate(-45deg)}',
    '.lt-edit-glass .lt-edit-sw0 svg{stroke:var(--lt-fg);filter:none}',
    '.lt-edit-beat{padding:0 4px 0 6px;color:var(--lt-sub)}',
    '.lt-edit-beat b{color:var(--lt-fg);font-variant-numeric:tabular-nums}',
    /* 字号下拉 */
    '.lt-edit-poph{padding:4px 4px 2px;color:var(--lt-sub);font-size:12px}',
    '.lt-edit-popg{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}',
    '.lt-edit-popg button{background:var(--lt-hov)!important;font-variant-numeric:tabular-nums}',
    '.lt-edit-popl{display:grid;grid-template-columns:1fr 1fr;gap:4px}',
    '.lt-edit-popl button{justify-content:space-between!important;background:var(--lt-hov)!important}',
    '.lt-edit-popl small{color:var(--lt-sub);font-size:11px}',
    '.lt-edit-pop button.lt-edit-on{background:var(--lt-acc)!important;color:var(--lt-on-accent,#fff)!important}',
    '.lt-edit-pop button.lt-edit-on small{color:inherit}',
    /* 页面上的编辑状态 */
    'body.lt-editing .slide.active *{pointer-events:auto}',
    'body.lt-editing .slide .mascot,body.lt-editing .slide .mascot *{visibility:hidden!important}',
    'body.lt-editing .slide .past,body.lt-editing svg.marks g.past{opacity:1!important}',
    'body.lt-editing #stage *,body.lt-editing #stage *::before,body.lt-editing #stage *::after,body.lt-editing .bg *{animation-play-state:paused!important}',
    'body.lt-editing #stage .chrome *{animation-play-state:running!important}',   // 页码、拍号不是课件内容：翻页时新生成的数字照常播出场动画，不然停在第一帧（透明）
    'body.lt-editing [data-lt-hover]{outline:calc(2px * var(--lt-ik,1)) dashed var(--lt-accent,#2563eb)!important;outline-offset:calc(2px * var(--lt-ik,1));cursor:move}',
    'body.lt-editing [data-lt-moved],body.lt-editing [data-lt-w],body.lt-editing [data-lt-h],body.lt-editing [data-lt-scale],body.lt-editing [data-lt-fs],body.lt-editing [data-lt-color],body.lt-editing [data-lt-fw],body.lt-editing [data-lt-ta],body.lt-editing [data-lt-fsk],body.lt-editing [data-lt-mb]{transition:none!important}',   // 风格给 scale、字号写了过渡的：编辑时直接到位，选中框才量得准
    '[data-lt-moved]{translate:var(--lt-tx,0px) var(--lt-ty,0px)!important}',
    '[data-lt-w]{width:var(--lt-w)!important;max-width:none!important}',
    // 改高度用 min-height：框不能比内容还矮（不然内容跑出框，整块缩放的原点也会偏）
    '[data-lt-h]{height:auto!important;min-height:var(--lt-h)!important;max-height:none!important}',
    'img[data-lt-w],img[data-lt-h]{object-fit:contain}',
    '[data-lt-fsk]{font-size:calc(var(--lt-fs) * var(--lt-fsk))!important}',   // 里面自己写了字号的行内小字，按比例跟着外面的字号
    '[data-lt-fs]{font-size:var(--lt-fs)!important}',
    '[data-lt-mb]{margin-bottom:var(--lt-mb)!important}',   // 排版流里的块变高变矮时抵掉，后面的内容不动
    '[data-lt-color]{color:var(--lt-color)!important}',
    '[data-lt-fw]{font-weight:var(--lt-fw)!important}',
    '[data-lt-ta]{text-align:var(--lt-ta)!important}',
    // 缩放的预览不加 !important：出场动画时 gsap 会在行内写 scale:none、把倍数并进 transform（beats.js 的 scaleOf），要让它盖得住
    'html body [data-lt-scale][data-lt-scale]{scale:var(--lt-scale);transform-origin:var(--lt-origin)}',
    'body:not(.lt-editing) [data-lt-hide]{visibility:hidden!important}',
    'body.lt-editing [data-lt-hide]{opacity:.3!important;outline:calc(2px * var(--lt-ik,1)) dashed #e5484d!important}',
    '.lt-edit-text{user-select:text!important;-webkit-user-select:text!important;cursor:text!important;outline:calc(2px * var(--lt-ik,1)) solid var(--lt-accent,#2563eb)!important;outline-offset:calc(4px * var(--lt-ik,1));background:rgba(127,127,127,.08)}',
    /* 选中框：跟着元素旋转；颜色取风格的强调色 */
    '.lt-edit-sel{position:absolute;z-index:70;pointer-events:none;transform-origin:50% 50%;border:calc(2px * var(--lt-ik,1)) solid var(--lt-accent,#2563eb);box-shadow:0 0 0 calc(1px * var(--lt-ik,1)) rgba(255,255,255,.85)}',
    '.lt-edit-sel[hidden]{display:none}',
    '.lt-edit-h{position:absolute;width:calc(14px * var(--lt-ik,1));height:calc(14px * var(--lt-ik,1));background:#fff;border:calc(2px * var(--lt-ik,1)) solid var(--lt-accent,#2563eb);border-radius:50%;pointer-events:auto;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,.25)}',
    '.lt-edit-h[data-c=nw]{left:0;top:0;transform:translate(-50%,-50%);cursor:nwse-resize}',
    '.lt-edit-h[data-c=ne]{right:0;top:0;transform:translate(50%,-50%);cursor:nesw-resize}',
    '.lt-edit-h[data-c=sw]{left:0;bottom:0;transform:translate(-50%,50%);cursor:nesw-resize}',
    '.lt-edit-h[data-c=se]{right:0;bottom:0;transform:translate(50%,50%);cursor:nwse-resize}',
    '.lt-edit-size{position:absolute;right:0;top:100%;margin-top:calc(8px * var(--lt-ik,1));padding:calc(3px * var(--lt-ik,1)) calc(7px * var(--lt-ik,1));border-radius:calc(6px * var(--lt-ik,1));background:var(--lt-accent,#2563eb);color:var(--lt-on-accent,#fff);font:600 calc(12px * var(--lt-ik,1))/1.2 system-ui,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.lt-edit-beats{position:absolute;inset:0;z-index:69;pointer-events:none}',
    '.lt-edit-badge{position:absolute;transform:translate(-30%,-60%);padding:calc(1px * var(--lt-ik,1)) calc(5px * var(--lt-ik,1));border-radius:calc(8px * var(--lt-ik,1));background:rgba(29,36,51,.72);color:#fff;font:600 calc(11px * var(--lt-ik,1))/1.3 system-ui,sans-serif;white-space:nowrap}',
    '.lt-edit-badge.lt-edit-moved{background:#ea580c}',
    '.lt-edit-badge.lt-edit-cur{box-shadow:0 0 0 calc(2px * var(--lt-ik,1)) var(--lt-accent,#60a5fa)}',
    '.lt-edit-copy{position:fixed;inset:0;z-index:970;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);font:14px/1.5 system-ui,sans-serif}',
    '.lt-edit-copy-box{width:min(720px,92vw);padding:16px;border-radius:12px;background:#fff;color:#222;display:flex;flex-direction:column;gap:10px}',
    '.lt-edit-copy-box p{margin:0}',
    '.lt-edit-copy-box textarea{height:50vh;font:13px/1.5 ui-monospace,Consolas,monospace;user-select:text}',
    '.lt-edit-copy-box button{align-self:flex-end;padding:6px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer}',
  ].join('\n');
  function injectStyle() {
    if (E.style) return;
    E.style = el('style', 'lt-edit-style', CSS_TEXT);
    document.head.appendChild(E.style);
  }

  /* =================================================================
     启动：等引擎摆好第一页再动手
     ================================================================= */
  function whenReady(cb) {
    const t = setInterval(() => {
      if (S.booted && !document.body.classList.contains('loading')) { clearInterval(t); cb(); }
    }, 50);
  }
  I.toggleEdit = () => (E.on ? exit() : enter());
  I.editKey = editKey;
  I.editsText = editsText;
  /* 核对：items 是一批修改记录；逐页翻到最后一拍，找到每个元素，量现在的位置、大小、缩放、样式、文字，和用户改的比。
     返回对不上的：{ no, page, path, hint, kind, what }；找不到元素的 missing: true（合并时加了类名、改了结构，路径变了，没法核对） */
  I.editVerify = function (items) {
    const out = [], near = (x, y, t) => Math.abs(x - y) <= t;
    const byPage = new Map();
    (items || []).forEach(it => { if (/^(box|scale|style|text)$/.test(it.kind)) { if (!byPage.has(it.page)) byPage.set(it.page, []); byPage.get(it.page).push(it); } });
    byPage.forEach((list, pid) => {
      const p = PAGES.find(x => x.id === pid);
      if (!p) return;
      try { I.go(p.i, p.total, { anim: false }); } catch (e) { /* 翻不过去就按现在的样子量 */ }
      list.forEach(it => {
        const n = resolve(p, it.path), base = { no: it.no, page: it.page, path: it.path, hint: it.hint, kind: it.kind };
        if (!n) { out.push(Object.assign(base, { missing: true })); return; }
        const a = it.after, b = it.before;
        if (it.kind === 'box') {
          const now = boxOf(n, p.el), bad = BOX.filter(k => a[k] !== b[k] && !near(now[k], a[k], 3));
          if (bad.length) out.push(Object.assign(base, { what: bad.map(k => k + ' 应是 ' + a[k] + '，现在 ' + now[k]).join('、') }));
        } else if (it.kind === 'scale') {
          const m = /scale:([\d.]+)/.exec(it.css || ''), want = m ? +m[1] : a.scale, cur = parseFloat(getComputedStyle(n).scale) || 1;
          if (!near(cur, want, .02)) out.push(Object.assign(base, { what: 'scale 应是 ' + want + '，现在 ' + cur }));
        } else if (it.kind === 'style') {
          const cs = getComputedStyle(n), bad = [];
          if (a.fontSize !== b.fontSize && probe(n, 'fontSize', a.fontSize) !== cs.fontSize) bad.push('字号应是 ' + a.fontSize + '，现在 ' + cs.fontSize);
          if (a.color !== b.color && probe(n, 'color', a.color) !== cs.color) bad.push('颜色应是 ' + a.color + '，现在 ' + cs.color);
          if (a.fontWeight !== b.fontWeight && String(parseInt(cs.fontWeight, 10)) !== a.fontWeight) bad.push('粗细应是 ' + a.fontWeight + '，现在 ' + parseInt(cs.fontWeight, 10));
          if (bad.length) out.push(Object.assign(base, { what: bad.join('、') }));
        } else if (it.kind === 'text' && norm(n.textContent) !== norm(a.text)) {
          out.push(Object.assign(base, { what: '文字应是「' + short(a.text, 40) + '」，现在「' + short(n.textContent, 40) + '」' }));
        }
      });
    });
    return out;
  };
  I.notesEditable = () => E.on;
  I.noteText = (pi, b) => (PAGES[pi] ? noteText(PAGES[pi], b) : '');
  I.editNote = editNote;
  I.editState = () => ({ on: E.on, server: SERVER, items: JSON.parse(JSON.stringify(E.items)), saving: E.saving || !!E.saveT, failed: E.failed, notified: E.notified,
    bar: E.bar && !E.bar.hidden ? E.bar.textContent : '', sel: E.sel ? E.sel._lt.path : null, tools: !!(E.tools && !E.tools.hidden) });
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('paste', onPaste, true);
  window.addEventListener('resize', () => {
    if (!E.on) return;
    if (S.reading) { exit(); I.toast('窗口变成竖屏阅读模式，已退出编辑'); return; }
    setScale(); drawSel();
  });
  window.addEventListener('beforeunload', () => { if (E.on || E.saveT) flush(); });

  whenReady(() => {
    if (!PAGES.length) return;
    let resume = null;
    try { resume = JSON.parse(sessionStorage.getItem(SS_KEY) || 'null'); sessionStorage.removeItem(SS_KEY); } catch (e) { resume = null; }
    if (SERVER) connect();
    if (S.reading) return;
    if (resume && typeof resume.p === 'number') I.go(clamp(resume.p, 0, PAGES.length - 1), 0, { anim: false });
    if (resume ? resume.edit : SERVER) enter();
    if (resume && resume.why === 'merged') I.toast('AI 已经把修改合进源码，页面已刷新', 5000);
    else if (resume && resume.why === 'reload') I.toast('源码改过了，页面已刷新', 3000);
  });
})();
