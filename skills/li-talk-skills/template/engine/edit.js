/* =====================================================================
   演示稿引擎 · 在线编辑（edit.js）
   - 用户在浏览器里直接改课件：双击改文字、单击选中后拖动挪位置、拖四个角改大小（按住 Shift 保持比例）、
     方向键微调（Shift 一次 10px）、Delete 隐藏（再按一次取消）；改完自动保存，点「通知 AI 修改」让 AI 把修改合进源码
   - 两种用法：
     · 有服务：AI 运行 serve 打开 http://127.0.0.1:端口/index.html?edit=口令，自动进入编辑模式；
       自动保存 POST 到 /__li-talk/edits，「通知 AI 修改」POST /__li-talk/notify；
       /__li-talk/events（SSE）推 reload（AI 改了源码）、merged（AI 合并完清掉了修改记录），收到就刷新，停在原来那页、仍在编辑模式
     · 没服务（双击 file:// 打开）：按 E 进入 / 退出，修改存在 localStorage（键名带课件标题），
       按钮换成「复制修改给 AI」，复制一段以「【课件修改】」开头的文字贴进对话
   - 进入编辑模式：当前页摆到最后一拍、不播动画、暂停 CSS 动画和 gsap、形象藏起来、讲过的拍不变淡；
     ← → 只翻整页（每页都摆到最后一拍），点击不进拍；自检模式（?selftest）完全不启用，阅读模式下不能进
   - 修改记录（和 scripts/lib/edits.mjs 的格式一致）：{ page, no, path, hint, kind, before, after }，
     kind 是 text / box / hide；path 从 .slide 往下每级「标签.第一个类名:nth-of-type(n)」（n 只在同级有同样的标签和类名时写）；
     坐标是舞台坐标（1920×1080，px，取整）。同一个元素同一种修改只留一条：before 是最早的值，after 是最新的值，改回原样就删掉
   - 预览：改位置用 translate（CSS 变量 --lt-tx/--lt-ty 加 data-lt-moved），改大小用 --lt-w/--lt-h 加 data-lt-w/data-lt-h，
     隐藏用 data-lt-hide；规则写在本文件注入的 <style> 里，不改元素原来的布局方式。退出编辑模式后预览照样留着
   - 界面的类名都以 lt-edit- 开头，样式自己注入，不受风格影响
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、reading、booted、editing）、I.dom（stage、lb）、I.toast；
     build.js 的 I.boxIn；beats.js 的 I.finishRunning；pages.js 的 I.go、I.finishPageTl；ui.js 的 I.copyText、I.closeShot；
     tools.js 的 I.closeTools（没引入时跳过）
   - 挂到总线：toggleEdit、editKey（ui.js 的键盘处理先问它）、editState、editsText
   ===================================================================== */
(function () {
  'use strict';
  if (!window.Deck || !Deck._) return;
  const I = Deck._;
  if (I.SELFTEST) return;   // 自检模式：完全不启用，量出来的结果和放映时一样
  const { W, G, QS, $, $$, clamp, el, PAGES } = I;
  const S = I.state, dom = I.dom;

  const TOKEN = QS.get('edit') || '';
  const SERVER = !!TOKEN && /^https?:$/.test(location.protocol);
  const API = name => '/__li-talk/' + name + '?token=' + encodeURIComponent(TOKEN);
  const LS_KEY = 'li-talk-edits:' + document.title;
  const SS_KEY = 'li-talk-edit-resume:' + document.title;
  const BOX = ['left', 'top', 'width', 'height'];
  const SAVE_DELAY = 400;

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
    sel: null, hover: null, text: null, drag: null, lastDown: null,
    saveT: 0, dirty: false, notifying: false, reloading: false, inflight: null, again: false, saving: false, failed: false, notified: false,
    bar: null, selBox: null, style: null, es: null,
  };

  /* =================================================================
     小工具
     ================================================================= */
  const norm = t => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const cut = (t, n) => Array.from(norm(t)).slice(0, n).join('');
  const tagsOf = html => (String(html || '').match(/<\s*([a-zA-Z][\w-]*)/g) || []).map(t => t.replace(/[<\s]/g, '').toLowerCase()).join(',');
  const curPage = () => PAGES[S.cur.p];
  const scale = () => (dom.stage.getBoundingClientRect().width / W) || 1;
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
  function hintOf(n) {
    if (n.classList.contains('shot')) return cut('截图：' + (n.dataset.caption || n.dataset.src || ''), 20);
    if (n.tagName === 'IMG') return cut('图片：' + (n.alt || n.getAttribute('src') || ''), 20);
    const t = cut(n.innerText || n.textContent, 20);   // innerText 在块与块之间留空格：「第三张 每页两到四拍」
    if (t) return t;
    // 没有字的块（线稿、图标）：写上行内 style，源码里多半能按它找到
    const st = n.getAttribute('style');
    return cut('无文字' + (st ? '，style=' + st.replace(/--lt-[w-]+:[^;]*;?/g, '') : ''), 40);
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
    n._lt = { slide, page: p ? p.id : '', no: p ? p.i + 1 : 0, path: pathOf(n, slide), hint: hintOf(n) };
    return n._lt;
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
  function findItem(i, kind) { return E.items.find(x => x.page === i.page && x.path === i.path && x.kind === kind); }
  function upsert(i, kind, before, after, extra) {
    const it = findItem(i, kind);
    if (same(before, after)) { if (it) E.items.splice(E.items.indexOf(it), 1); return; }
    if (it) { it.after = after; return; }
    E.items.push(Object.assign({ page: i.page, no: i.no, path: i.path, hint: i.hint, kind, before, after }, extra || {}));
  }
  function recordBox(n) {
    const i = n._lt;
    const extra = { position: i.position };
    if (i.origin) extra.origin = i.origin;
    upsert(i, 'box', Object.assign({}, i.base), Object.assign({}, i.box || i.base), extra);
  }

  /* 一条修改写成一行（和 scripts/lib/edits.mjs 的 itemLine 一致） */
  const short = (t, n) => { const s = norm(t); return s.length > n ? s.slice(0, n) + '…' : s; };
  function itemLine(it) {
    const where = '第 ' + (it.no || '?') + ' 页（' + it.page + '）' + it.path + (it.hint ? '「' + short(it.hint, 40) + '」' : '');
    if (it.kind === 'text') {
      let s = where + '：文字「' + short(it.before.text, 80) + '」→「' + short(it.after.text, 80) + '」';
      if (it.after.html != null && tagsOf(it.before.html) !== tagsOf(it.after.html)) s += '；行内标签变了，改后的 HTML：' + it.after.html;
      return s;
    }
    if (it.kind === 'hide') return where + '：隐藏（删掉这个元素）';
    const b = it.before, a = it.after;
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
    '- 文字：在 slides/ 的章节文件里按「」里的原文找到这一处，换成新文字（页面大标题在 Deck.add 的 title 里，截图说明在 data-caption 里）；讲稿.md 里同一句也改掉。',
    '- 位置、大小：数值是舞台坐标（1920×1080，px，含内边距）。元素本来有行内 style="left:…;top:…;width:…" 的，直接改这几个值；' +
      '没有的，在对应章节的 chN.css 里加一条 [data-id="页号"] <能定位到它的选择器>{left:…;top:…;width:…}（必要时加 position:absolute）。' +
      '在排版流里的元素，用 position:relative 加 left/top 偏移，或改所在容器的排法。文字块一般只改 width，height 只在本来就写了固定高度、或者是图片和截图时才写。不要在 JS 里加一堆行内 transform。',
    '- 隐藏：删掉这个元素，后面的拍号顺移，notes 里对应的讲词一起调整。',
    '- 自检报了溢出、被挡住：先自己调，调不了就告诉用户。',
  ];
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
    if (copy) out.push('改完跑 check --browser 清零，再请用户刷新页面看效果（刷新后浏览器会自己清掉已经合进源码的修改）。');
    return out.join('\n');
  }

  /* =================================================================
     预览：挪位置、改大小、隐藏
     ================================================================= */
  function setVar(n, attr, prop, v) {
    if (v == null) { n.removeAttribute(attr); n.style.removeProperty(prop); }
    else { n.setAttribute(attr, ''); n.style.setProperty(prop, v + 'px'); }
  }
  function applyBox(n, box) {
    const i = n._lt;
    i.box = box;
    setVar(n, 'data-lt-w', '--lt-w', box.width !== i.base.width ? box.width : null);
    setVar(n, 'data-lt-h', '--lt-h', box.height !== i.base.height ? box.height : null);
    // 改了大小以后版面位置可能跟着变（比如靠右对齐的元素），重新量一次，位移按量到的算
    const lay = I.boxIn(n, i.slide);
    const dx = box.left - lay.l, dy = box.top - lay.t;
    if (Math.abs(dx) < .5 && Math.abs(dy) < .5) { n.removeAttribute('data-lt-moved'); n.style.removeProperty('--lt-tx'); n.style.removeProperty('--lt-ty'); }
    else { n.setAttribute('data-lt-moved', ''); n.style.setProperty('--lt-tx', (i.ot.x + dx) + 'px'); n.style.setProperty('--lt-ty', (i.ot.y + dy) + 'px'); }
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
  /* 进编辑模式时把还没合并的修改摆回页面上。返回 applied（摆上了）/ merged（源码里已经是改后的样子）/
     stale（源码变了，和记录对不上）/ missing（找不到元素） */
  function applyItem(it) {
    const p = PAGES.find(x => x.id === it.page);
    let n = null;
    try { n = p ? p.el.querySelector(':scope>' + it.path) : null; } catch (e) { n = null; }
    if (!n) return it.kind === 'hide' ? 'merged' : 'missing';
    const i = info(n);
    i.path = it.path;
    if (it.kind === 'text') {
      const cur = norm(n.textContent), b = norm(it.before.text), a = norm(it.after.text);
      if (cur === a && cur !== b) return 'merged';
      if (cur !== b) return 'stale';
      i.text0 = it.before.text; i.html0 = it.before.html != null ? it.before.html : cleanHtml(n);
      if (it.after.html != null) { n.innerHTML = it.after.html; fixKeys(n); } else n.textContent = it.after.text;
      return 'applied';
    }
    if (it.kind === 'hide') { n.setAttribute('data-lt-hide', ''); i.hidden = true; return 'applied'; }
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
    E.items = E.items.filter(it => { const r = applyItem(it); if (r === 'applied' || r === 'missing') return true; gone++; return false; });
    // 没有服务时，已经合进源码的修改顺手从 localStorage 里清掉；有服务时以服务上的记录为准，等用户再改时一起存
    if (gone && !SERVER) save();
    return gone;
  }

  /* =================================================================
     保存、通知
     ================================================================= */
  function post(name, body) {
    return fetch(API(name), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store', keepalive: body.length < 60000 })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function changed() {
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
     改文字
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
  }
  function endText() {
    const n = E.text.el;
    E.text = null;
    n.removeAttribute('contenteditable');
    n.removeAttribute('spellcheck');
    n.classList.remove('lt-edit-text');
    if (n.getAttribute('class') === '') n.removeAttribute('class');
    try { getSelection().removeAllRanges(); } catch (e) { /* 没有选区 */ }
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

  /* =================================================================
     选中、拖动、改大小
     ================================================================= */
  function select(n) {
    if (E.sel === n) return;
    E.sel = n;
    ensureBase(n);
    setHover(null);
    drawSel();
  }
  function deselect() { E.sel = null; drawSel(); }
  function drawSel() {
    const b = E.selBox;
    if (!b) return;
    if (!E.on || !E.sel) { b.hidden = true; return; }
    const i = E.sel._lt, bx = i.box || i.base;
    b.hidden = false;
    b.style.left = (bx.left + i.ot.x) + 'px'; b.style.top = (bx.top + i.ot.y) + 'px';
    b.style.width = bx.width + 'px'; b.style.height = bx.height + 'px';
    $('.lt-edit-size', b).textContent = (i.hidden ? '已隐藏 · ' : '') + bx.width + ' × ' + bx.height;
  }
  function setHover(n) {
    if (E.hover === n) return;
    if (E.hover) E.hover.removeAttribute('data-lt-hover');
    E.hover = n;
    if (n) n.setAttribute('data-lt-hover', '');
  }
  function startDrag(e, mode, corner) {
    const i = ensureBase(E.sel), b0 = Object.assign({}, i.box || i.base);
    E.drag = { mode, corner, x: e.clientX, y: e.clientY, k: scale(), b0, moved: false };
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
    if (d && d.moved && E.sel) { recordBox(E.sel); changed(); }
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
     指针
     ================================================================= */
  function inUi(t) { return !!(t && t.closest && t.closest('.lt-edit-bar, .lt-edit-copy, #toast, #lightbox')); }
  function onDown(e) {
    if (!E.on || e.button !== 0) return;
    const t = e.target;
    if (inUi(t)) return;
    if (E.text) {
      if (E.text.el.contains(t)) return;   // 在正在改的字里点：放光标、选字，交给浏览器
      commitText();
    }
    const h = t.closest && t.closest('.lt-edit-h');
    if (h && E.sel) { e.preventDefault(); startDrag(e, 'resize', h.dataset.c); return; }
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
    select(b);
    startDrag(e, 'move');
  }
  function onMove(e) {
    if (!E.on || E.drag || E.text || inUi(e.target)) { if (E.on && !E.drag) setHover(null); return; }
    const b = blockAt(e.clientX, e.clientY);
    setHover(b && b !== E.sel ? b : null);
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
     键盘（ui.js 的 onKey 先问这里；返回 true 表示这个键编辑模式用掉了）
     ================================================================= */
  function editKey(e) {
    if (!E.on) return false;
    const k = e.key;
    if (E.text) {
      if (k === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
      else if (k === 'Escape') { e.preventDefault(); cancelText(); }
      return true;   // 其余的键都是在打字
    }
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.lt-edit-copy')) return true;
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
      updateBar();
      if (gone && first) I.toast('有 ' + gone + ' 处修改已经在源码里了，已清掉', 4000);
    });
    if (first) I.toast('编辑模式：单击选中，拖动挪位置，拖四个角改大小（Shift 保持比例）；双击改文字；方向键微调，Delete 隐藏；← → 翻页，E 退出', 7000);
    updateBar();
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
    if (!S.reading) I.go(S.cur.p, PAGES[S.cur.p].total, { anim: false });
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

  /* 有服务时：源码改了（reload）或修改记录被清掉（merged）就刷新，停在原来那页，编辑模式照旧 */
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
  }
  function buildUi() {
    if (E.bar) return;
    E.bar = el('div', 'lt-edit-bar',
      '<span class="lt-edit-state">编辑中</span><button type="button" class="lt-edit-status"></button>' +
      '<button type="button" class="lt-edit-go"></button><button type="button" class="lt-edit-exit">退出编辑</button>');
    E.bar.setAttribute('role', 'toolbar');
    E.bar.setAttribute('data-noclick', '');
    E.bar.addEventListener('mousedown', e => e.preventDefault());   // 点按钮不抢焦点：免得之后按空格又点一次按钮
    $('.lt-edit-state', E.bar).title = '单击选中，拖动挪位置，拖四个角改大小（Shift 保持比例）；双击改文字（回车结束，Esc 取消）；方向键微调（Shift 一次 10px），Delete 隐藏；← → 翻页，E 退出';
    $('.lt-edit-status', E.bar).addEventListener('click', () => { if (E.failed) save(); });
    $('.lt-edit-go', E.bar).addEventListener('click', notify);
    $('.lt-edit-exit', E.bar).addEventListener('click', exit);
    document.body.appendChild(E.bar);
    E.selBox = el('div', 'lt-edit-sel', '<span class="lt-edit-size"></span>' + ['nw', 'ne', 'sw', 'se'].map(c => '<i class="lt-edit-h" data-c="' + c + '"></i>').join(''));
    E.selBox.hidden = true;
    dom.stage.appendChild(E.selBox);
  }
  const CSS_TEXT = [
    'body.lt-editing #toast{top:66px}',
    '.lt-edit-bar{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:960;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 14px;border-radius:12px;background:#1d2433;color:#f3f5f9;font:500 14px/1.2 system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35);user-select:none;-webkit-user-select:none;white-space:nowrap;letter-spacing:0}',
    '.lt-edit-bar[hidden]{display:none}',
    '.lt-edit-bar button{font:inherit;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;background:#33405c;color:inherit;margin:0}',
    '.lt-edit-bar button:hover{filter:brightness(1.15)}',
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
  I.editState = () => ({ on: E.on, server: SERVER, items: JSON.parse(JSON.stringify(E.items)), saving: E.saving || !!E.saveT, failed: E.failed, notified: E.notified,
    bar: E.bar && !E.bar.hidden ? E.bar.textContent : '' });
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
