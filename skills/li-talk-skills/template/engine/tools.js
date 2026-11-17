/* =====================================================================
   演示稿引擎 · 现场工具（tools.js）
   - 总览跳页（O）：铺满窗口的总览层，所有页按顺序排成缩略图（每页显示最后一拍的样子，标页号和标题，当前页橙框）；
     点一页跳过去并关闭；直接敲页码再回车跳转；←→↑↓（空格、PageDown、PageUp 也行）移动选中、回车跳转、Home / End 到首尾；
     Esc 或再按 O 关闭，点缩略图以外的地方也关闭
     缩略图是页面 DOM 的克隆按比例缩小（不起 iframe）：克隆里把所有拍摆到最后一拍、去掉 id、去掉讲过变淡、
     形象摆到最后一拍的落脚点、不说话，整块 inert（点不到、聚焦不到）；只在第一次打开时建一次，以后复用；
     每格用 content-visibility:auto，页多时只画看得见的那几格
   - 黑屏（B，也认翻页笔黑屏键发的「.」）：一键全黑；再按 B、Esc、任意翻页键、点一下都只恢复，不翻页
   - 激光笔（L）：开着时鼠标变成一个红点，带一小段很短的拖尾（约 0.1 秒，鼠标停下就没有了，不是循环动画）；
     点击照常进拍（画布不接收指针）；Esc 也能关；总览、黑屏开着时暂时不显示
   - 底部进度条：舞台底边（y 1062–1070，署名之下）一条细进度条，长度 = 当前是全稿第几拍 / 全稿总拍数（每页的第 0 拍也算一拍），
     按章节（chapter 变化处）分段；颜色只用 --ink-3（底）、--ink-2（走过的）、--accent（当前位置的小圆点），
     放在外框 .chrome 里，阅读模式不显示（.chrome 整个藏起来），只有一页时不放
   - 减少动态：总览、黑屏直接出现，激光笔没有拖尾
   - 自检模式（?selftest）下整个文件什么都不做：不放进度条、不接按键，自检量到的和没有这个文件时一样
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（booted、cur、reading）、I.dom（stage、bg）、I.NO_ADVANCE、I.toast；
     beats.js 的 I.clearEl、I.setDrawn、I.showMark；mascot.js 的 I.spotFor；pages.js 的 I.go
   - 被调用：ui.js 的 onKey 先问 I.toolKey(e)（返回 true 表示这个键工具用掉了）、setMode 进阅读模式时调 I.closeTools()；
     pages.js 的 next / prev 先问 I.toolGate(dir)（黑屏时只恢复、总览开着时移动选中，返回 true 就不翻）、
     afterChange 调 I.syncTools()（更新进度条）。演讲者窗口的按键经 Deck._key 进 onKey，所以在那边按 O、B、L 一样管用
   - 挂到总线：toolKey、toolGate、syncTools、closeTools
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  if (I.SELFTEST) return;   // 自检模式：工具全部不启用
  const { W, H, RMQ, NEXT_KEYS, PREV_KEYS, $, $$, clamp, esc, el, PAGES } = I;
  const S = I.state, dom = I.dom;

  // 三个层都标 .deck-tool：点到它们不进拍（各层自己也拦下了点击，这里再保一道）
  I.NO_ADVANCE += ', .deck-tool';

  const reduced = () => RMQ.matches;
  const T = { ov: null, black: null, laser: null, bar: null };   // 各层的元素（用到时才建）
  let ovOpen = false, blackOn = false, laserOn = false;

  /* =================================================================
     总览跳页
     ================================================================= */
  const ov = { cells: [], sel: 0, num: '', cols: 4, built: false };
  /* 克隆里要清掉的动画样式：和 beats.js 的 clearEl 一样（gsap 留下的内联样式） */
  function freeze(e) { if (e) I.clearEl(e); }
  /* 一页的缩略图：克隆页面，摆到最后一拍 */
  function thumbOf(p) {
    // 还没画过的圈注先建出来（建好按这一页现在的拍号藏好），克隆里才有
    p.marks.forEach(m => { if (!m.g) { I.showMark(m, p, true); I.showMark(m, p, m.beat <= p.beat); } });
    const sp = p.mascot ? I.spotFor(p, p.total) : null;
    const src = p.el, c = src.cloneNode(true);
    // 原页和克隆结构一样：按顺序一一对上，用来找节拍块、重点词、圈注在克隆里的那一个
    const a0 = src.getElementsByTagName('*'), a1 = c.getElementsByTagName('*'), twin = new Map();
    for (let i = 0; i < a0.length; i++) twin.set(a0[i], a1[i]);
    const tw = e => (e === src ? c : twin.get(e));
    c.removeAttribute('style');                                   // 翻页动画留在页面上的位移、透明度
    c.classList.remove('active');                                  // 不套 .slide.active 才有的滤镜（板书、发光），也省得每格都算
    c.dataset.now = p.total;
    for (let k = 1; k <= Math.max(p.total, 1); k++) c.classList.toggle('b' + k, k <= p.total);
    p.units.forEach(u => { const e = tw(u.el); if (!e) return; freeze(e); if (!u.child) e.classList.add('on'); if (e instanceof SVGElement) I.setDrawn(e, true); });
    p.keys.forEach(k => { const e = tw(k.el); if (!e) return; e.style.removeProperty('transform'); e.style.setProperty('--k', 1); });
    (p.arranges || []).forEach(a => { const e = tw(a.el); if (!e) return; e.classList.remove('scattered'); [...e.children].forEach(freeze); });
    p.marks.forEach(m => { const g = m.g && tw(m.g); if (!g) return; g.style.opacity = 1; g.style.visibility = ''; I.setDrawn(g, true); });
    $$('.past', c).forEach(e => e.classList.remove('past'));
    // 形象：向导形象摆到最后一拍的落脚点；所有形象都不说话、不走路、不打盹
    if (sp) {
      const m = tw(p.mascot.el);
      if (m) {
        freeze(m);
        m.style.transform = `translate(${sp.x}px,${sp.y}px)`;
        m.dataset.face = sp.face || m.dataset.face || 'right';
      }
    }
    $$('.mascot', c).forEach(m => { m.classList.remove('walk', 'napping'); $$('.mascot-body,.mascot-spin', m).forEach(x => x.removeAttribute('style')); });
    $$('.mascot-say', c).forEach(s => s.classList.remove('on'));
    // 临时的东西和会自己动、会去加载的东西不要
    $$('.copied-tip, iframe, script', c).forEach(e => e.remove());
    $$('.ripple-layer', c).forEach(e => { e.textContent = ''; });
    $$('video, audio', c).forEach(v => { v.removeAttribute('autoplay'); v.preload = 'none'; });
    // id 不能重复：克隆里全部去掉（页面样式按 [data-id] 写，不靠 id；SVG 引用的 #id 仍然指向原页那一份）
    c.removeAttribute('id');
    $$('[id]', c).forEach(e => e.removeAttribute('id'));
    return c;
  }
  /* 这一页的背景：克隆这一页风格的背景层（方格、远山、边框这些都在背景层里） */
  function bgOf(p) {
    const b = dom.bg[p.scene];
    if (!b) return null;
    const c = b.cloneNode(true);
    c.removeAttribute('style');
    c.classList.add('on');
    $$('[id]', c).forEach(e => e.removeAttribute('id'));
    return c;
  }
  function buildOverview() {
    const box = T.ov = el('div', 'deck-ov deck-tool');
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '总览');
    box.innerHTML = `<div class="ov-head"><b class="ov-t">总览</b><span class="ov-n">共 ${PAGES.length} 页</span><span class="ov-num" aria-live="polite"></span>`
      + `<span class="ov-hint">点一页跳过去 · 敲页码回车 · ← → ↑ ↓ 选 · Esc 关闭</span></div><div class="ov-grid"></div>`;
    const grid = $('.ov-grid', box), frag = document.createDocumentFragment();
    // 先把每页要读的位置读完（形象落脚点、圈注），再一起往文档里放，免得读一页写一页反复排版
    const parts = PAGES.map(p => ({ p, slide: thumbOf(p), bg: bgOf(p) }));
    ov.cells = parts.map(({ p, slide, bg }) => {
      const title = p.def.title || p.id;
      const cell = el('div', 'ov-cell');
      cell.dataset.i = p.i;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', `第 ${p.i + 1} 页：${title}`);
      if (p.def.chapter) cell.title = p.def.chapter;
      const frame = el('div', 'ov-frame'), k = el('div', 'ov-k');
      k.inert = true; k.setAttribute('aria-hidden', 'true');
      if (bg) k.appendChild(bg);
      k.appendChild(slide);
      frame.appendChild(k);
      cell.append(frame, el('div', 'ov-cap', `<b>${p.i + 1}</b><span>${esc(title)}</span>`));
      frag.appendChild(cell);
      return cell;
    });
    grid.appendChild(frag);
    box.addEventListener('click', e => {
      e.stopPropagation();
      const cell = e.target.closest && e.target.closest('.ov-cell');
      if (cell) jumpTo(+cell.dataset.i); else closeOverview();
    });
    // 鼠标真的移动了才换选中（键盘选中后网格滚动，鼠标停着不动时不抢回来）
    grid.addEventListener('pointermove', e => {
      const cell = e.target.closest && e.target.closest('.ov-cell');
      if (cell && +cell.dataset.i !== ov.sel) select(+cell.dataset.i, false);
    });
    document.body.appendChild(box);
    ov.built = true;
  }
  /* 排版：页不多时挑能一屏放下的最大缩略图，放不下就按每格至少约 240px 宽排、上下滚动；缩放比例写进 --ov-k */
  function layoutOverview() {
    const box = T.ov, grid = $('.ov-grid', box);
    const cs = getComputedStyle(grid);
    const gap = parseFloat(cs.columnGap) || 24;
    const aw = grid.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const ah = grid.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    const capH = 40, n = PAGES.length;
    let cols = 0;
    for (let c = 2; c <= 8; c++) {
      const w = (aw - gap * (c - 1)) / c, rows = Math.ceil(n / c);
      if (rows * (w * 9 / 16 + capH) + (rows - 1) * gap <= ah) { cols = c; break; }
    }
    if (!cols) cols = clamp(Math.floor((aw + gap) / (240 + gap)), 2, 8);
    if (n < cols) cols = Math.max(n, 1);
    ov.cols = cols;
    grid.style.setProperty('--ov-cols', cols);
    const w = (aw - gap * (cols - 1)) / cols;
    grid.style.setProperty('--ov-k', (w / W).toFixed(5));
  }
  function select(i, scroll = true) {
    i = clamp(i, 0, PAGES.length - 1);
    if (ov.cells[ov.sel]) ov.cells[ov.sel].classList.remove('sel');
    ov.sel = i;
    const c = ov.cells[i];
    c.classList.add('sel');
    if (scroll) c.scrollIntoView({ block: 'nearest' });
  }
  function showNum() {
    const box = $('.ov-num', T.ov), n = ov.num;
    if (!n) { box.innerHTML = ''; return; }
    const v = +n;
    box.innerHTML = v >= 1 && v <= PAGES.length ? `跳到第 <b>${v}</b> 页，回车确认` : `<span class="bad">没有第 ${esc(n)} 页（共 ${PAGES.length} 页）</span>`;
  }
  function openOverview() {
    if (ovOpen || !PAGES.length || document.body.classList.contains('loading')) return;
    if (!ov.built) buildOverview();
    ovOpen = true;
    ov.num = ''; showNum();
    ov.cells.forEach((c, i) => c.classList.toggle('cur', i === S.cur.p));
    T.ov.classList.toggle('instant', reduced());
    T.ov.classList.add('on');
    layoutOverview();
    select(S.cur.p);
    refreshLaser();
  }
  function closeOverview() {
    if (!ovOpen) return;
    ovOpen = false;
    T.ov.classList.remove('on');
    refreshLaser();
  }
  function jumpTo(i) {
    closeOverview();
    if (i !== S.cur.p) I.go(i, 0, { anim: false });
  }
  /* 总览开着时的按键：返回 true 表示用掉了 */
  function ovKey(e, k, lk) {
    const eat = () => { e.preventDefault(); return true; };
    if (k === 'Escape' || lk === 'o') { closeOverview(); return eat(); }
    if (/^[0-9]$/.test(k)) {
      if (ov.num.length < 4) ov.num = (ov.num + k).replace(/^0+/, '');
      showNum();
      const v = +ov.num;
      if (v >= 1 && v <= PAGES.length) select(v - 1);
      return eat();
    }
    if (k === 'Backspace') { ov.num = ov.num.slice(0, -1); showNum(); return eat(); }
    if (k === 'Enter') {
      if (ov.num) { const v = +ov.num; if (v >= 1 && v <= PAGES.length) jumpTo(v - 1); else { ov.num = ''; showNum(); } }
      else jumpTo(ov.sel);
      return eat();
    }
    let to = null;
    if (k === 'ArrowDown') to = ov.sel + ov.cols;
    else if (k === 'ArrowUp') to = ov.sel - ov.cols;
    else if (NEXT_KEYS.has(k)) to = ov.sel + 1;          // → 空格 PageDown
    else if (PREV_KEYS.has(k)) to = ov.sel - 1;          // ← PageUp
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = PAGES.length - 1;
    if (to != null) {
      // 上下走到头不绕回去；最后一行没排满时往下走到最后一页
      if (k === 'ArrowDown' && to > PAGES.length - 1) to = Math.floor(ov.sel / ov.cols) < Math.floor((PAGES.length - 1) / ov.cols) ? PAGES.length - 1 : ov.sel;
      if (k === 'ArrowUp' && to < 0) to = ov.sel;
      ov.num = ''; showNum();
      select(to);
      return eat();
    }
    if (lk === 'b' || k === '.') { setBlack(true); return eat(); }
    if (lk === 'l') { setLaser(!laserOn); return eat(); }
    if (/^[fstr]$/.test(lk)) return false;               // 全屏、演讲者视图、计时照常
    return eat();                                         // 别的键在总览里不起作用，也不翻主页面
  }

  /* =================================================================
     黑屏
     ================================================================= */
  function setBlack(on) {
    if (on === blackOn) return;
    if (!T.black) {
      T.black = el('div', 'deck-black deck-tool');
      T.black.setAttribute('aria-hidden', 'true');
      T.black.addEventListener('click', e => { e.stopPropagation(); setBlack(false); });
      document.body.appendChild(T.black);
      void T.black.offsetWidth;   // 先排一次版，第一次打开也有淡入
    }
    blackOn = on;
    T.black.classList.toggle('instant', reduced());
    T.black.classList.toggle('on', on);
    refreshLaser();
  }
  /* 黑屏时的按键：B、「.」、Esc、翻页键、Home / End 只恢复；O 恢复并打开总览；L 照常开关激光笔；F、S、T、R 照常；别的键不管 */
  function blackKey(e, k, lk) {
    if (/^[fstr]$/.test(lk)) return false;
    e.preventDefault();
    if (lk === 'l') { setLaser(!laserOn); return true; }
    if (lk === 'b' || k === '.' || k === 'Escape' || NEXT_KEYS.has(k) || PREV_KEYS.has(k) || k === 'Home' || k === 'End') setBlack(false);
    else if (lk === 'o') { setBlack(false); openOverview(); }
    return true;
  }

  /* =================================================================
     激光笔：一张铺满窗口的画布（不接收指针），只在鼠标移动后的约 0.1 秒里逐帧画拖尾，停下就不再画
     ================================================================= */
  const LZ = { x: 0, y: 0, has: false, trail: [], raf: 0, ctx: null, w: 0, h: 0, dpr: 1 };
  const TRAIL_MS = 110;
  const laserShown = () => laserOn && !ovOpen && !blackOn && !S.reading;
  function sizeLaser() {
    const c = T.laser; if (!c) return;
    LZ.dpr = window.devicePixelRatio || 1; LZ.w = innerWidth; LZ.h = innerHeight;
    c.width = Math.round(LZ.w * LZ.dpr); c.height = Math.round(LZ.h * LZ.dpr);
    LZ.ctx.setTransform(LZ.dpr, 0, 0, LZ.dpr, 0, 0);
  }
  function setLaser(on) {
    if (on === laserOn) return;
    if (on && !T.laser) {
      T.laser = el('canvas', 'deck-laser deck-tool');
      T.laser.setAttribute('aria-hidden', 'true');
      LZ.ctx = T.laser.getContext('2d');
      document.body.appendChild(T.laser);
    }
    laserOn = on;
    LZ.trail = [];
    if (on) sizeLaser();
    refreshLaser();
    I.toast(on ? '激光笔已打开（再按 L 关闭）' : '激光笔已关闭', 1400);
  }
  function refreshLaser() {
    const on = laserShown();
    document.documentElement.classList.toggle('deck-laser-on', on);
    if (!T.laser) return;
    T.laser.classList.toggle('on', on);
    LZ.trail = [];
    paintLaser(performance.now());
  }
  function queueLaser() { if (!LZ.raf) LZ.raf = requestAnimationFrame(t => { LZ.raf = 0; paintLaser(t); }); }
  function paintLaser(now) {
    const g = LZ.ctx; if (!g) return;
    g.clearRect(0, 0, LZ.w, LZ.h);
    if (!laserShown() || !LZ.has) return;
    const r = clamp(11 * Math.min(LZ.w / W, LZ.h / H), 7, 16);   // 红点半径跟着舞台缩放，投影仪上也够大
    LZ.trail = LZ.trail.filter(q => now - q.t < TRAIL_MS);
    if (LZ.trail.length) {
      // 拖尾：从最旧的点连到现在的位置，越旧越细越淡
      const pts = LZ.trail.concat([{ x: LZ.x, y: LZ.y, t: now }]);
      g.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const a = clamp(1 - (now - pts[i - 1].t) / TRAIL_MS, 0, 1);
        g.strokeStyle = `rgba(255,36,36,${(.5 * a).toFixed(3)})`;
        g.lineWidth = Math.max(1, r * 1.5 * a);
        g.beginPath(); g.moveTo(pts[i - 1].x, pts[i - 1].y); g.lineTo(pts[i].x, pts[i].y); g.stroke();
      }
    }
    // 红点：外圈光晕 + 实心红点 + 中间一点亮
    const glow = g.createRadialGradient(LZ.x, LZ.y, r * .6, LZ.x, LZ.y, r * 2.8);
    glow.addColorStop(0, 'rgba(255,40,40,.45)'); glow.addColorStop(1, 'rgba(255,40,40,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(LZ.x, LZ.y, r * 2.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FF1F1F'; g.beginPath(); g.arc(LZ.x, LZ.y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,225,225,.95)'; g.beginPath(); g.arc(LZ.x - r * .18, LZ.y - r * .18, r * .38, 0, Math.PI * 2); g.fill();
    if (LZ.trail.length) queueLaser();   // 拖尾还没散完就再画一帧；散完了停下（不是循环动画）
  }
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    if (laserShown() && LZ.has && !reduced()) {
      LZ.trail.push({ x: LZ.x, y: LZ.y, t: performance.now() });
      if (LZ.trail.length > 24) LZ.trail.shift();
    }
    LZ.x = e.clientX; LZ.y = e.clientY; LZ.has = true;
    if (laserShown()) queueLaser();
  }, { passive: true });
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) { LZ.has = false; LZ.trail = []; if (laserOn) queueLaser(); } });
  window.addEventListener('resize', () => { if (T.laser) { sizeLaser(); paintLaser(performance.now()); } if (ovOpen) layoutOverview(); });

  /* =================================================================
     底部进度条
     ================================================================= */
  const PG = { segs: [], start: [], total: 0 };
  function buildBar() {
    const ch = dom.stage && $('.chrome', dom.stage);
    if (!ch || PAGES.length < 2) return false;
    // 每页的拍数含第 0 拍；章节（chapter）变了就另起一段
    let at = 0, seg = null;
    PAGES.forEach((p, i) => {
      PG.start[i] = at;
      const n = p.total + 1, chap = String(p.def.chapter || '');
      if (!seg || chap !== seg.chap) { seg = { chap, from: at, n: 0 }; PG.segs.push(seg); }
      seg.n += n; at += n;
    });
    PG.total = at;
    T.bar = el('div', 'deck-progress', PG.segs.map(s => `<span class="pg-seg" style="flex:${s.n} 1 0"><span class="pg-fill"></span></span>`).join(''));
    T.bar.setAttribute('aria-hidden', 'true');
    ch.appendChild(T.bar);
    PG.segs.forEach((s, i) => { s.el = T.bar.children[i]; s.fill = s.el.firstChild; });
    return true;
  }
  function syncTools() {
    if (!T.bar && !buildBar()) return;
    const p = PAGES[S.cur.p]; if (!p) return;
    const done = PG.start[p.i] + clamp(p.beat, 0, p.total) + 1;   // 走过的拍数（含当前这一拍）
    PG.segs.forEach(s => {
      const f = clamp((done - s.from) / s.n, 0, 1);
      s.fill.style.width = (f * 100).toFixed(3) + '%';
      const cur = done > s.from && done <= s.from + s.n;
      s.el.classList.toggle('cur', cur);
      if (cur) s.el.style.setProperty('--pg', (f * 100).toFixed(3) + '%');
    });
  }

  /* =================================================================
     按键与翻页的入口（ui.js、pages.js 调用）
     ================================================================= */
  function toolKey(e) {
    if (!S.booted || !PAGES.length || S.reading || e.isComposing) return false;
    const k = e.key || '', lk = k.length === 1 ? k.toLowerCase() : k;
    if (blackOn) return blackKey(e, k, lk);
    if (ovOpen) return ovKey(e, k, lk);
    if (lk === 'o') { e.preventDefault(); openOverview(); return true; }
    if (lk === 'b' || k === '.') { e.preventDefault(); setBlack(true); return true; }
    if (lk === 'l') { e.preventDefault(); setLaser(!laserOn); return true; }
    if (k === 'Escape' && laserOn) { setLaser(false); return true; }
    return false;
  }
  /* 翻页之前问一声（演讲者窗口的按钮、Deck.next、触屏滑动也走这里）：黑屏时只恢复，总览开着时移动选中 */
  function toolGate(dir) {
    if (blackOn) { setBlack(false); return true; }
    if (ovOpen) { ov.num = ''; showNum(); select(ov.sel + (dir < 0 ? -1 : 1)); return true; }
    return false;
  }
  /* 全部收起（进阅读模式时） */
  function closeTools() {
    closeOverview();
    setBlack(false);
    if (laserOn) { laserOn = false; LZ.trail = []; refreshLaser(); }
  }

  Object.assign(I, { toolKey, toolGate, syncTools, closeTools });
})();
