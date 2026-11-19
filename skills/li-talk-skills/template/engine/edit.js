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
    on: false, loaded: false, items: [],
    sel: null, inner: [], hover: null, text: null, drag: null, lastDown: null,
    saveT: 0, dirty: false, notifying: false, reloading: false, inflight: null, again: false, saving: false, failed: false, notified: false,
    bar: null, tools: null, selBox: null, beats: null, style: null, es: null,
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
    i.base = boxOf(n, i.slide);
    i.ot = ownTranslate(n);
    const pos = getComputedStyle(n).position;
    i.position = pos === 'absolute' || pos === 'fixed' ? 'absolute' : 'flow';
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
  function isLeafText(n) {
    if (!(n instanceof HTMLElement) || !norm(n.textContent)) return false;
    return [...n.querySelectorAll('*')].every(c => INLINE.test(c.tagName));
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
    if (it) { it.after = after; it.at = Date.now(); return; }
    E.items.push(Object.assign({ id: uid(), at: Date.now(), page: i.page, no: i.no, path: i.path, hint: i.hint, kind, before, after }, extra || {}));
  }
  function recordBox(n) {
    const i = n._lt;
    const extra = { position: i.position };
    if (i.origin) extra.origin = i.origin;
    upsert(i, 'box', Object.assign({}, i.base), Object.assign({}, i.box || i.base), extra);
  }
  function recordScale(n) {
    const i = n._lt;
    upsert(i, 'scale', Object.assign({}, i.sc0), i.sc.scale === 1 ? Object.assign({}, i.sc0) : Object.assign({}, i.sc));
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
    if (it.kind === 'scale') return where + '：整块缩放 ' + Math.round(b.scale * 100) + '%→' + Math.round(a.scale * 100) + '%（原点 ' + (a.origin === 'top left' ? '左上角 top left' : '中心 center') + '）';
    if (it.kind === 'style') return where + '：样式 ' + (STYLE.filter(k => b[k] !== a[k]).map(k => STYLE_NAMES[k] + ' ' + b[k] + '→' + a[k]).join('、') || '没有变化');
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
    return s;
  }
  const RULES = [
    '合并规则：',
    '- 找元素：路径从页面根往下写，:nth-of-type(n) 按 Deck.add 的 html 里的兄弟数，用来在源码里找到它，「」里是它开头的字。写 CSS 时不要照抄 nth-of-type（页面上引擎会多加元素，数出来对不上），给元素加一个类名（比如 p05-tip）再用它定位。',
    '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。' +
      '写了「改后的 HTML」的照那段换：<em class="key">…</em> 是用户设的重点词（标题里的重点词写进 titleHtml，title 照样写纯文字）。',
    '- 位置、大小：数值是舞台坐标（1920×1080，px，含内边距）。元素本来有行内 style="left:…;top:…;width:…" 的，直接改这几个值；' +
      '没有的，在对应章节的 chN.css 里加一条 [data-id="页号"] <能定位到它的选择器>{left:…;top:…;width:…}（必要时加 position:absolute）。' +
      '在排版流里的元素，用 position:relative 加 left/top 偏移，或改所在容器的排法。文字块一般只改 width，height 只在本来就写了固定高度、或者是图片和截图时才写。不要在 JS 里加一堆行内 transform。',
    '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
    '- 整块缩放：文字、图片、间距一起等比放大缩小。在源码里给这一块加个类名（比如 p05-shot），在章节 chN.css 里写 [data-id="页号"] .p05-shot{scale:1.2;transform-origin:center}' +
      '（原点是左上角的写 top left），不改原来的宽高和字号，也不要写 transform（会和出场动画打架）。',
    '- 样式：优先换成已有的类名——字号 var(--fs-xl) 用 t-xl、var(--fs-lg) 用 t-lg、var(--fs-md) 用 t-md、var(--fs-min) 用 t-sm，粗细 700 用 b，' +
      '居中用 center，颜色 var(--ink-2) 用 muted；没有对应类名的，在章节 chN.css 里加 [data-id="页号"] 选择器{font-size:…;color:var(--…)}，颜色写变量不写死。' +
      '字号是 px 数字（64px）的：能对上风格档位变量的写变量（engine.css 默认 --fs-xl 84、--fs-title 68、--fs-lg 50、--fs-md 42、--fs-body 36、--fs-min 34，风格改过的以风格 css 为准），对不上的照写 px。不要堆行内 style。',
    '- 拍号：改这个元素的 data-beat（本来没写的就加上）；同一个元素上的 data-mascot 拍号一起改；notes 里对应拍的讲词跟着挪。改完拍数超出范围的话，check 会提醒，照提醒调。',
    '- 讲词：页面 notes 里对应拍的 say 和 讲稿.md 里这一页对应拍的讲词一起改成新的。',
    '- 自检报了溢出、被挡住：先自己调，调不了就告诉用户。',
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
    out.push(...RULES);
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
    if (!i.style0) { i.style0 = styleOf(n); i.styleCur = Object.assign({}, i.style0); }
    return i;
  }
  function applyStyle(n, st) {
    const i = n._lt;
    i.styleCur = st;
    STYLE.forEach(k => setVar(n, STYLE_VARS[k][0], STYLE_VARS[k][1], st[k] !== i.style0[k] ? st[k] : null));
  }
  function setStyle(n, key, v) {
    const i = ensureStyle(n);
    const st = Object.assign({}, i.styleCur);
    st[key] = v == null ? i.style0[key] : v;
    applyStyle(n, st);
    upsert(i, 'style', Object.assign({}, i.style0), Object.assign({}, st));
    changed();
    updateTools();
  }
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
      if (i.base) { ['data-lt-w', 'data-lt-h', 'data-lt-moved'].forEach(a => n.removeAttribute(a)); ['--lt-w', '--lt-h', '--lt-tx', '--lt-ty'].forEach(v => n.style.removeProperty(v)); i.box = null; }
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
    flush().then(ok => { if (!ok) throw new Error('save'); return post('notify', '{}'); })
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
  function deselect() { E.sel = null; E.inner = []; drawSel(); }
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
  function drawSel() {
    const b = E.selBox;
    if (b) {
      if (!E.on || !E.sel) b.hidden = true;
      else {
        const i = E.sel._lt;
        if (!i.box && !E.drag) i.base = boxOf(E.sel, i.slide);   // 没挪过、没改过框的：改了字号、文字以后大小会变，重新量
        const bx = i.box || i.base;
        // 整块缩放过的：框跟着缩放后的样子画（原点在中心或左上角）
        const sc = i.sc ? i.sc.scale : 1, ox = i.sc && i.sc.origin === 'top left' ? 0 : .5;
        const vw = bx.width * sc, vh = bx.height * sc;
        b.hidden = false;
        b.style.left = (bx.left + i.ot.x + (bx.width - vw) * ox) + 'px'; b.style.top = (bx.top + i.ot.y + (bx.height - vh) * ox) + 'px';
        b.style.width = vw + 'px'; b.style.height = vh + 'px';
        const pct = Math.round(sc * 100) + '%', size = bx.width + '×' + bx.height;
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
    const i = mode === 'scale' ? ensureScale(E.sel) : ensureBase(E.sel), b0 = Object.assign({}, i.box || i.base);
    const sr = dom.stage.getBoundingClientRect();
    E.drag = { mode, corner, x: e.clientX, y: e.clientY, k: scale(), b0, moved: false, sr, s0: i.sc ? i.sc.scale : 1 };
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
      // 整块等比缩放：按指针离原点（中心；按住 Shift 是左上角）的距离算倍数
      const i = E.sel._lt, origin = e.shiftKey ? 'top left' : 'center', ox = origin === 'top left' ? 0 : .5;
      const cx = b0.left + i.ot.x + b0.width * ox, cy = b0.top + i.ot.y + b0.height * ox;
      const px0 = (d.x - d.sr.left) / d.k, py0 = (d.y - d.sr.top) / d.k, px = (e.clientX - d.sr.left) / d.k, py = (e.clientY - d.sr.top) / d.k;
      const d0 = Math.hypot(px0 - cx, py0 - cy) || 1;
      const sc = clamp(Math.round(d.s0 * Math.hypot(px - cx, py - cy) / d0 * 100) / 100, .2, 5);
      applyScale(E.sel, { scale: sc, origin });
      drawSel();
      return;
    }
    if (d.mode === 'move') b = { left: b0.left + dx, top: b0.top + dy, width: b0.width, height: b0.height };
    else {
      const west = /w/.test(d.corner), north = /n/.test(d.corner);
      let w = Math.max(20, b0.width + (west ? -dx : dx)), h = Math.max(20, b0.height + (north ? -dy : dy));
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
    const i = ensureBase(E.sel), b = Object.assign({}, i.box || i.base);
    b.left += dx; b.top += dy;
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
  function updateTools() {
    const t = E.tools;
    if (!t) return;
    const n = toolTarget();
    if (!E.on || !n || E.drag) { t.hidden = true; return; }
    t.hidden = false;
    const i = ensureStyle(n), st = i.styleCur;
    // 调色板用这一页风格算出来的颜色
    $$('.lt-edit-sw', t).forEach(b => {
      const v = b.dataset.v;
      b.style.background = probe(n, 'color', 'var(' + v + ')');
      b.classList.toggle('lt-edit-on', st.color === 'var(' + v + ')');
    });
    $$('[data-act=fs]', t).forEach(b => b.classList.toggle('lt-edit-on', b.dataset.v === st.fontSize));
    $('.lt-edit-fsnow', t).textContent = st.fontSize === i.style0.fontSize ? '' : '原来 ' + label(i.style0.fontSize);
    $('[data-act=bold]', t).classList.toggle('lt-edit-on', +st.fontWeight >= 600);
    $$('[data-act=align]', t).forEach(b => b.classList.toggle('lt-edit-on', st.textAlign === b.dataset.v));
    $('[data-act=key]', t).hidden = !E.text;
    const bg = $('.lt-edit-beat', t);
    bg.hidden = !!E.text || !E.sel;
    if (E.sel && !E.text) { const bi = ensureBeat(E.sel); $('b', bg).textContent = bi.beatCur; }
    $('[data-act=outer]', t).hidden = !!E.text || !E.sel;
    $('[data-act=inner]', t).hidden = !!E.text || !E.inner.length;
    const bi = info(n);
    $('[data-act=reset]', t).disabled = !E.items.some(x => x.page === bi.page && (x.path === bi.path || x.path.indexOf(bi.path + '>') === 0));
    // 位置：放在目标上面，上面放不下（挨着编辑条）就放下面
    const r = n.getBoundingClientRect(), tw = t.offsetWidth, th = t.offsetHeight;
    let top = r.top - th - 10;
    if (top < 62) top = Math.min(innerHeight - th - 6, r.bottom + 10);
    const left = clamp(r.left, 6, Math.max(6, innerWidth - tw - 6));
    t.style.left = Math.round(left) + 'px'; t.style.top = Math.round(Math.max(62, top)) + 'px';
  }
  function onTool(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const n = toolTarget();
    if (!n) return;
    const act = b.dataset.act, st = ensureStyle(n).styleCur;
    if (act === 'fs') setStyle(n, 'fontSize', b.dataset.v === 'reset' ? null : b.dataset.v);
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
  function inUi(t) { return !!(t && t.closest && t.closest('.lt-edit-bar, .lt-edit-tools, .lt-edit-copy, #toast, #lightbox')); }
  function onDown(e) {
    if (!E.on || e.button !== 0) return;
    const t = e.target;
    if (inUi(t)) return;
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
  function updateBar() {
    if (!E.bar) return;
    const n = E.items.length;
    const st = $('.lt-edit-status', E.bar), btn = $('.lt-edit-go', E.bar);
    let s = n ? '已改 ' + n + ' 处 · ' : '还没改动';
    if (n || E.failed) s += E.failed ? '保存失败，点这里重试' : E.saving || E.saveT ? '保存中…' : '已自动保存';
    if (!n && E.failed) s = '保存失败，点这里重试';
    st.textContent = s;
    st.classList.toggle('lt-edit-fail', E.failed);
    if (SERVER) btn.textContent = E.notifying ? '正在通知…' : E.notified ? '已通知，AI 正在改…' : '通知 AI 修改';
    else btn.textContent = '复制修改给 AI';
    btn.disabled = !n || E.notifying || E.notified;
    $('.lt-edit-undo', E.bar).disabled = !E.undo.length;
    $('.lt-edit-redo', E.bar).disabled = !E.redo.length;
    $('.lt-edit-all', E.bar).disabled = !n;
  }
  function buildUi() {
    if (E.bar) return;
    E.bar = el('div', 'lt-edit-bar',
      '<span class="lt-edit-state">编辑中</span><button type="button" class="lt-edit-status"></button>' +
      '<button type="button" class="lt-edit-undo" title="撤销（Ctrl+Z）">↶</button><button type="button" class="lt-edit-redo" title="重做（Ctrl+Shift+Z 或 Ctrl+Y）">↷</button>' +
      '<button type="button" class="lt-edit-all" title="清掉所有还没合并的改动">全部还原</button>' +
      '<button type="button" class="lt-edit-go"></button><button type="button" class="lt-edit-exit">退出编辑</button>');
    E.bar.setAttribute('role', 'toolbar');
    E.bar.setAttribute('data-noclick', '');
    E.bar.addEventListener('mousedown', e => e.preventDefault());   // 点按钮不抢焦点：免得之后按空格又点一次按钮
    $('.lt-edit-state', E.bar).title = '单击选中，拖动挪位置；拖四个角整块缩放（Shift 以左上角为原点），按住 Alt 拖角改框的大小；Ctrl+Z 撤销、Ctrl+Y 重做；双击改文字（回车结束，Esc 取消）；方向键微调（Shift 一次 10px），Delete 隐藏；Alt+↑ 选外层、Alt+↓ 回内层；← → 翻页，E 退出；演讲者视图（S）里点讲词可以改';
    $('.lt-edit-status', E.bar).addEventListener('click', () => { if (E.failed) save(); });
    $('.lt-edit-go', E.bar).addEventListener('click', notify);
    $('.lt-edit-undo', E.bar).addEventListener('click', undo);
    $('.lt-edit-redo', E.bar).addEventListener('click', redo);
    $('.lt-edit-all', E.bar).addEventListener('click', resetAll);
    $('.lt-edit-exit', E.bar).addEventListener('click', exit);
    document.body.appendChild(E.bar);

    E.tools = el('div', 'lt-edit-tools',
      '<div class="lt-edit-row"><span class="lt-edit-lab">字号</span>' + PX.map(v => '<button type="button" data-act="fs" data-v="' + v + 'px">' + v + '</button>').join('') +
        '<span class="lt-edit-fsnow"></span></div>' +
      '<div class="lt-edit-row"><span class="lt-edit-lab">档位</span>' + SIZES.map(([v, l]) => '<button type="button" data-act="fs" data-v="var(' + v + ')" title="风格的字号档位 ' + v + '">' + l + '</button>').join('') +
        '<button type="button" data-act="fs" data-v="reset" title="回到原来的字号">原来</button></div>' +
      '<div class="lt-edit-row"><span class="lt-edit-grp" title="颜色（风格的调色板）">' + COLORS.map(([v, l]) => '<button type="button" class="lt-edit-sw" data-act="color" data-v="' + v + '" title="' + l + '"></button>').join('') +
        '<button type="button" data-act="color" data-v="reset" title="原来的颜色">原色</button></span>' +
      '<button type="button" data-act="bold" title="加粗"><b>B</b></button>' +
      '<span class="lt-edit-grp"><button type="button" data-act="align" data-v="left" title="左对齐">左</button><button type="button" data-act="align" data-v="center" title="居中">中</button><button type="button" data-act="align" data-v="right" title="右对齐">右</button></span>' +
      '<button type="button" data-act="key" title="把选中的字设成重点词（再点一次取消）">重点</button>' +
      '<span class="lt-edit-beat lt-edit-grp">第 <b>0</b> 拍出现<button type="button" data-act="beat" data-v="-1" title="早一拍">−</button><button type="button" data-act="beat" data-v="1" title="晚一拍">＋</button></span>' +
      '<button type="button" data-act="outer" title="选外层（Alt+↑）">选外层</button><button type="button" data-act="inner" title="回到刚才那层（Alt+↓）">回内层</button>' +
      '<button type="button" data-act="reset" title="这一块的所有改动回到原样">还原这一块</button></div>');
    E.tools.hidden = true;
    E.tools.setAttribute('data-noclick', '');
    E.tools.addEventListener('mousedown', e => e.preventDefault());   // 不抢改字框的焦点和选区
    E.tools.addEventListener('click', onTool);
    document.body.appendChild(E.tools);

    E.selBox = el('div', 'lt-edit-sel', '<span class="lt-edit-size"></span>' + ['nw', 'ne', 'sw', 'se'].map(c => '<i class="lt-edit-h" data-c="' + c + '"></i>').join(''));
    E.selBox.hidden = true;
    E.beats = el('div', 'lt-edit-beats');
    dom.stage.append(E.beats, E.selBox);
  }
  const CSS_TEXT = [
    'body.lt-editing #toast{top:66px}',
    '.lt-edit-bar,.lt-edit-tools{position:fixed;z-index:960;display:flex;align-items:center;gap:6px;border-radius:12px;background:#1d2433;color:#f3f5f9;font:500 14px/1.2 system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35);user-select:none;-webkit-user-select:none;white-space:nowrap;letter-spacing:0}',
    '.lt-edit-bar{left:50%;top:10px;transform:translateX(-50%);padding:6px 6px 6px 14px}',
    '.lt-edit-tools{z-index:955;padding:5px 6px;gap:3px;flex-direction:column;align-items:stretch}',
    '.lt-edit-row{display:flex;align-items:center;gap:4px}',
    '.lt-edit-lab{color:#94a3b8;font-size:12px;width:2.6em}',
    '.lt-edit-fsnow{color:#94a3b8;font-size:12px;padding-left:4px}',
    '.lt-edit-bar[hidden],.lt-edit-tools[hidden],.lt-edit-tools [hidden]{display:none!important}',
    '.lt-edit-bar button,.lt-edit-tools button,.lt-edit-tools select{font:inherit;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;background:#33405c;color:inherit;margin:0}',
    '.lt-edit-tools button{padding:5px 8px}',
    '.lt-edit-tools button:disabled{opacity:.45;cursor:default;filter:none}',
    '.lt-edit-bar button:hover,.lt-edit-tools button:hover{filter:brightness(1.18)}',
    '.lt-edit-tools .lt-edit-on{background:#2563eb;color:#fff}',
    '.lt-edit-grp{display:inline-flex;align-items:center;gap:3px;padding:0 3px}',
    '.lt-edit-tools .lt-edit-sw{width:22px;height:22px;padding:0;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.75)}',
    '.lt-edit-tools .lt-edit-sw.lt-edit-on{box-shadow:inset 0 0 0 2px #fff,0 0 0 2px #60a5fa}',
    '.lt-edit-beat b{min-width:1em;text-align:center;color:#fde68a}',
    '.lt-edit-bar .lt-edit-go{background:#2563eb;color:#fff}',
    '.lt-edit-bar button:disabled{opacity:.55;cursor:default;filter:none}',
    '.lt-edit-state{font-weight:700;cursor:help}',
    '.lt-edit-bar .lt-edit-status{background:transparent;padding:7px 6px;cursor:default;color:#b9c2d3}',
    '.lt-edit-bar .lt-edit-status.lt-edit-fail{color:#ffb4b4;text-decoration:underline;cursor:pointer}',
    'body.lt-editing .slide.active *{pointer-events:auto}',
    'body.lt-editing .slide .mascot,body.lt-editing .slide .mascot *{visibility:hidden!important}',
    'body.lt-editing .slide .past,body.lt-editing svg.marks g.past{opacity:1!important}',
    'body.lt-editing #stage *,body.lt-editing #stage *::before,body.lt-editing #stage *::after,body.lt-editing .bg *{animation-play-state:paused!important}',
    'body.lt-editing [data-lt-hover]{outline:calc(2px * var(--lt-ik,1)) dashed rgba(37,99,235,.8)!important;outline-offset:calc(2px * var(--lt-ik,1));cursor:move}',
    'body.lt-editing [data-lt-moved],body.lt-editing [data-lt-w],body.lt-editing [data-lt-h]{transition:none!important}',
    '[data-lt-moved]{translate:var(--lt-tx,0px) var(--lt-ty,0px)!important}',
    '[data-lt-w]{width:var(--lt-w)!important;max-width:none!important}',
    '[data-lt-h]{height:var(--lt-h)!important;max-height:none!important}',
    '[data-lt-fs]{font-size:var(--lt-fs)!important}',
    '[data-lt-color]{color:var(--lt-color)!important}',
    '[data-lt-fw]{font-weight:var(--lt-fw)!important}',
    '[data-lt-ta]{text-align:var(--lt-ta)!important}',
    // 缩放的预览不加 !important：出场动画时 gsap 会在行内写 scale:none、把倍数并进 transform（beats.js 的 scaleOf），要让它盖得住
    'html body [data-lt-scale][data-lt-scale]{scale:var(--lt-scale);transform-origin:var(--lt-origin)}',
    'body:not(.lt-editing) [data-lt-hide]{visibility:hidden!important}',
    'body.lt-editing [data-lt-hide]{opacity:.3!important;outline:calc(2px * var(--lt-ik,1)) dashed #e5484d!important}',
    '.lt-edit-text{user-select:text!important;-webkit-user-select:text!important;cursor:text!important;outline:calc(2px * var(--lt-ik,1)) solid #2563eb!important;outline-offset:calc(4px * var(--lt-ik,1));background:rgba(37,99,235,.07)}',
    '.lt-edit-sel{position:absolute;z-index:70;pointer-events:none;border:calc(2px * var(--lt-ik,1)) solid #2563eb;box-shadow:0 0 0 calc(1px * var(--lt-ik,1)) rgba(255,255,255,.85)}',
    '.lt-edit-sel[hidden]{display:none}',
    '.lt-edit-h{position:absolute;width:calc(14px * var(--lt-ik,1));height:calc(14px * var(--lt-ik,1));background:#fff;border:calc(2px * var(--lt-ik,1)) solid #2563eb;border-radius:calc(3px * var(--lt-ik,1));pointer-events:auto;box-sizing:border-box}',
    '.lt-edit-h[data-c=nw]{left:0;top:0;transform:translate(-50%,-50%);cursor:nwse-resize}',
    '.lt-edit-h[data-c=ne]{right:0;top:0;transform:translate(50%,-50%);cursor:nesw-resize}',
    '.lt-edit-h[data-c=sw]{left:0;bottom:0;transform:translate(-50%,50%);cursor:nesw-resize}',
    '.lt-edit-h[data-c=se]{right:0;bottom:0;transform:translate(50%,50%);cursor:nwse-resize}',
    '.lt-edit-size{position:absolute;left:0;bottom:100%;margin-bottom:calc(6px * var(--lt-ik,1));padding:calc(2px * var(--lt-ik,1)) calc(6px * var(--lt-ik,1));border-radius:calc(4px * var(--lt-ik,1));background:#2563eb;color:#fff;font:500 calc(12px * var(--lt-ik,1))/1.3 system-ui,sans-serif;white-space:nowrap}',
    '.lt-edit-beats{position:absolute;inset:0;z-index:69;pointer-events:none}',
    '.lt-edit-badge{position:absolute;transform:translate(-30%,-60%);padding:calc(1px * var(--lt-ik,1)) calc(5px * var(--lt-ik,1));border-radius:calc(8px * var(--lt-ik,1));background:rgba(29,36,51,.78);color:#fff;font:600 calc(11px * var(--lt-ik,1))/1.3 system-ui,sans-serif;white-space:nowrap}',
    '.lt-edit-badge.lt-edit-moved{background:#ea580c}',
    '.lt-edit-badge.lt-edit-cur{box-shadow:0 0 0 calc(2px * var(--lt-ik,1)) #60a5fa}',
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
