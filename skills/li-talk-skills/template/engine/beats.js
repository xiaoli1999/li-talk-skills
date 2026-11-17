/* =====================================================================
   演示稿引擎 · 节拍（beats.js）
   - 出场动效：FX、FX_SCENE（场景微调）、addFx，以及配套的 tiltOf、clearEl、描线（setDrawn 等）
   - 重点词强调 emphasize、圈注（buildMark、showMark、drawMark）
   - 节拍推进：setInstant（直接摆到某一拍）、stepForward / stepBack（播一拍的进退动画）、
     plan（同一拍里各块的先后，黑板先画线再写字）、eraserSweep（黑板板擦）、play（限制单拍时长）
   - 依赖总线：core 的常量和工具、I.state（running）、I.dom（bg、eraserEl）；
     build.js 的 I.boxIn；mascot.js 的 I.placeKid、I.hopKid、I.kidXY、I.spotFor
   - 挂到总线：tiltOf、clearEl、setDrawn、addFx、emphasize、showMark、drawMark、
     finishRunning、setClasses、applyRecede、setInstant、plan、eraserSweep、unionBox、
     callOnBeat、stepForward、stepBack、queueKeysAndMarks、play
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, NS, SCENE_IN, MAX_BEAT, G, R, $, $$, clamp, warn, motion } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     出场动效
     ================================================================= */
  const FX = {
    rise:  { from: () => ({ autoAlpha: 0, y: 28 }), to: { autoAlpha: 1, y: 0 }, dur: .55, ease: 'power3.out' },
    fade:  { from: () => ({ autoAlpha: 0 }), to: { autoAlpha: 1 }, dur: .45, ease: 'power1.out' },
    pop:   { from: () => ({ autoAlpha: 0, scale: .5, rotation: -8 }), to: { autoAlpha: 1, scale: 1, rotation: 0 }, dur: .5, ease: 'back.out(2.4)' },
    drop:  { from: () => ({ autoAlpha: 0, y: -64, scale: 1.07, rotation: 4, '--lift': 1 }), to: { autoAlpha: 1, y: 0, scale: 1, rotation: 0, '--lift': 0 }, dur: .62, ease: 'back.out(1.5)' },
    slide: { from: e => { const f = e.dataset.from || 'left'; return { autoAlpha: 0, x: f === 'left' ? -90 : f === 'right' ? 90 : 0, y: f === 'top' ? -70 : f === 'bottom' ? 70 : 0 }; }, to: { autoAlpha: 1, x: 0, y: 0 }, dur: .55, ease: 'power3.out' },
    stamp: { from: () => ({ autoAlpha: 0, scale: 2.1, rotation: -12 }), to: { autoAlpha: 1, scale: 1, rotation: 0 }, dur: .3, ease: 'power4.in' },
  };
  /* 场景微调：方格纸的上浮更轻（v3-1），桌面的纸落得更像样页（v3-2） */
  const FX_SCENE = {
    paper: { rise: { from: () => ({ autoAlpha: 0, y: 16 }), to: { autoAlpha: 1, y: 0 }, dur: .45, ease: 'power3.out' } },
    desk: { drop: { from: () => ({ autoAlpha: 0, y: -50, scale: 1.08, rotation: 4, '--lift': 1 }), to: { autoAlpha: 1, y: 0, scale: 1, rotation: 0, '--lift': 0 }, dur: .55, ease: 'back.out(1.7)' } },
  };
  const FX_NAMES = ['rise', 'fade', 'pop', 'drop', 'slide', 'stamp', 'write', 'type', 'print', 'draw', 'none'];
  /* 元素自己的倾斜角（CSS rotate，来自 --r）。gsap 动画时会把 rotate 清成 none，所以把倾斜并进 gsap 的 rotation 里 */
  function tiltOf(e) {
    if (e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? (parseFloat(v) || 0) : 0;
  }
  function clearEl(e) {
    if (G) G.killTweensOf(e);
    ['opacity', 'visibility', 'transform', 'clip-path', 'translate', 'rotate', 'scale', '--lift'].forEach(k => e.style.removeProperty(k));
    if (e instanceof SVGElement) { e.removeAttribute('transform'); e.style.removeProperty('transform-origin'); }
  }
  function strokes(e) { return e instanceof SVGElement ? (e.matches('path,line,rect,circle,ellipse,polyline') ? [e] : $$('path', e)) : []; }
  function prepStroke(pth) { if (pth._len == null) { try { pth._len = Math.ceil(pth.getTotalLength()) + 2; } catch (e) { pth._len = 0; } } return pth._len; }
  /* 虚线（自己带 stroke-dasharray 的线）不能用改 dasharray 的办法「描」出来，改成淡入，画完保持原来的虚线 */
  function isDashed(pth) { const d = pth.getAttribute('stroke-dasharray'); return !!(d && d !== 'none' && parseFloat(d) > 0); }
  function setDrawn(e, on) {
    strokes(e).forEach(pth => {
      if (on) { pth.style.strokeDasharray = ''; pth.style.strokeDashoffset = ''; pth.style.opacity = ''; return; }   // 画完：回到线本来的样子
      if (isDashed(pth)) { pth.style.opacity = 0; return; }
      const L = prepStroke(pth); pth.style.strokeDasharray = L ? L + ' ' + L : ''; pth.style.strokeDashoffset = L;
    });
  }
  /* 把一个元素的出场加进时间线，返回时长 */
  function addFx(tl, e, fx, t, scene) {
    if (!FX_NAMES.includes(fx)) { warn(`data-in="${fx}" 不认识，可选：${FX_NAMES.join('、')}`); fx = SCENE_IN[scene]; }
    if (fx === 'none') return 0;
    if (fx === 'draw' && e instanceof SVGElement) {
      const ps = strokes(e); if (!ps.length) return 0;
      const total = ps.reduce((a, q) => a + prepStroke(q), 0) || 1;
      const d = clamp(total / 2600, .3, .8);
      let c = t;
      const restore = q => () => { q.style.strokeDasharray = ''; q.style.strokeDashoffset = ''; q.style.opacity = ''; };
      ps.forEach(q => {
        const pd = d * q._len / total;
        if (isDashed(q)) tl.fromTo(q, { opacity: 0 }, { opacity: 1, duration: Math.max(.2, pd), ease: 'power1.out', immediateRender: true, onComplete: restore(q) }, c);
        else tl.fromTo(q, { strokeDasharray: q._len + ' ' + q._len, strokeDashoffset: q._len }, { strokeDashoffset: 0, duration: pd, ease: 'power1.inOut', immediateRender: true, onComplete: restore(q) }, c);
        c += pd;
      });
      return d;
    }
    if (fx === 'draw' || fx === 'write' || fx === 'type' || fx === 'print') {
      const txt = (e.textContent || '').trim();
      const d = fx === 'type' ? clamp(txt.length * .035, .25, .8) : fx === 'print' ? .5 : clamp((e.offsetWidth || 600) / 1900 + .2, .3, .65);
      const ease = fx === 'type' ? `steps(${clamp(txt.length, 4, 40)})` : fx === 'print' ? 'steps(14)' : scene === 'board' ? 'none' : scene === 'journal' ? 'power2.out' : 'power1.inOut';
      const from = { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% -6%)' }, to = { clipPath: 'inset(-30% -6% -30% -6%)', duration: d, ease, immediateRender: true, onComplete: () => clearEl(e) };
      if (scene === 'journal' && fx === 'write' && !(e instanceof SVGElement)) { const tilt = tiltOf(e); from.y = 8; to.y = 0; if (tilt) { from.rotation = tilt; to.rotation = tilt; } }
      tl.fromTo(e, from, to, t);
      return d;
    }
    const f = (FX_SCENE[scene] && FX_SCENE[scene][fx]) || FX[fx];
    const tilt = tiltOf(e);
    const from = f.from(e);
    const to = Object.assign({}, f.to, { duration: f.dur, ease: f.ease, immediateRender: true, onComplete: () => clearEl(e) });
    if (tilt) { from.rotation = (from.rotation || 0) + tilt; to.rotation = (to.rotation || 0) + tilt; }
    if (e instanceof SVGElement) to.transformOrigin = '50% 50%';
    tl.fromTo(e, from, to, t);
    return f.dur;
  }

  /* =================================================================
     重点词与圈注
     ================================================================= */
  function emphasize(tl, k, t) {
    tl.fromTo(k.el, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, t);
    tl.fromTo(k.el, { scale: 1 }, { scale: 1.1, duration: .16, yoyo: true, repeat: 1, ease: 'power1.out', onComplete: () => k.el.style.removeProperty('transform') }, t + .12);
  }
  function markLayer(p) {
    let svg = $(':scope > svg.marks', p.el);
    if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'marks'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); p.el.appendChild(svg); }
    return svg;
  }
  function buildMark(m, p) {
    if (m.g) return m.g;
    const svg = markLayer(p), b = I.boxIn(m.el, p.el);
    const g = document.createElementNS(NS, 'g');
    if (m.el.dataset.markColor) g.style.color = m.el.dataset.markColor;
    const sw = { paper: 3, board: 4.6, journal: 3, desk: 2.8 }[p.scene] || 3.5;
    const o = (x) => Object.assign({ stroke: 'currentColor', strokeWidth: sw, roughness: 1.4, bowing: 1.2, seed: 7 + p.i * 13 + p.marks.indexOf(m) * 3 }, x);
    const add = n => { if (n) [...(n.childNodes.length ? n.childNodes : [n])].forEach(c => g.appendChild(c)); };
    const rc = R ? R.svg(svg) : null;
    m.kinds.forEach(kind => {
      if (!rc) {   // 没有 rough.js：画一个普通的框
        const r = document.createElementNS(NS, 'rect');
        Object.entries({ x: b.l - 10, y: b.t - 6, width: b.w + 20, height: b.h + 12, rx: 12, fill: 'none', stroke: 'currentColor', 'stroke-width': 4 }).forEach(([a, v]) => r.setAttribute(a, v));
        g.appendChild(r); return;
      }
      if (kind === 'circle') add(rc.ellipse(b.l + b.w / 2, b.t + b.h / 2, b.w + 44, b.h + 30, o()));
      else if (kind === 'box') add(rc.rectangle(b.l - 14, b.t - 8, b.w + 28, b.h + 16, o({ roughness: 1.2 })));
      else if (kind === 'underline') { const pts = []; for (let x = b.l - 4, i = 0; x <= b.l + b.w + 8; x += 16, i++) pts.push([x, b.t + b.h + 6 + (i % 2 ? -4 : 4)]); add(rc.curve(pts, o({ roughness: .6, disableMultiStroke: true }))); }
      else if (kind === 'strike') add(rc.line(b.l - 6, b.t + b.h * .55, b.l + b.w + 6, b.t + b.h * .45, o({ roughness: .8 })));
      else if (kind === 'cross') { add(rc.line(b.l, b.t, b.l + b.w, b.t + b.h, o())); add(rc.line(b.l + b.w, b.t, b.l, b.t + b.h, o())); }
      else warn(`data-mark="${kind}" 不认识，可选 circle、box、underline、strike、cross`);
    });
    svg.appendChild(g);
    m.g = g;
    return g;
  }
  function showMark(m, p, on) {
    if (!on && !m.g) return;
    const g = buildMark(m, p);
    if (G) G.killTweensOf(g);
    g.style.opacity = on ? 1 : 0;
    g.style.visibility = on ? '' : 'hidden';   // 不能写 visible，会盖过页面本身的隐藏
    setDrawn(g, on);
  }
  function drawMark(tl, m, p, t) {
    const g = buildMark(m, p);
    g.style.opacity = 1; g.style.visibility = '';
    return addFx(tl, g, 'draw', t, p.scene);
  }

  /* =================================================================
     节拍状态
     ================================================================= */
  function finishRunning() {
    if (S.running) { const r = S.running; S.running = null; r.progress(1); r.kill(); }
  }
  function setClasses(p, n) {
    p.el.dataset.now = n;
    for (let k = 1; k <= Math.max(p.total, 1); k++) p.el.classList.toggle('b' + k, k <= n);
  }
  /* 讲过的拍退后一点（当前拍是唯一重心） */
  function applyRecede(p, n) {
    p.receders.forEach(u => u.el.classList.toggle('past', u.beat < n));
    p.marks.forEach(m => { if (m.g) m.g.classList.toggle('past', m.beat < n && p.receders.some(u => u.beat < n && u.el.contains(m.el))); });
  }
  /* 散落再归位：.scatter[data-arrange="n"] 的子元素，第 n 拍前在 --sx --sy --sr 写的位置，第 n 拍飞回容器的正常排版 */
  function setArranged(a, on) {
    [...a.el.children].forEach(c => clearEl(c));
    a.el.classList.toggle('scattered', !on);
  }
  function flipArrange(tl, a, on, t) {
    const kids = [...a.el.children];
    const first = kids.map(c => { clearEl(c); return { l: c.offsetLeft, t: c.offsetTop, r: tiltOf(c) }; });
    a.el.classList.toggle('scattered', !on);
    const last = kids.map(c => ({ l: c.offsetLeft, t: c.offsetTop, r: tiltOf(c) }));
    const each = kids.length > 1 ? Math.min(.05, .3 / kids.length) : 0;
    kids.forEach((c, i) => {
      tl.fromTo(c, { x: first[i].l - last[i].l, y: first[i].t - last[i].t, rotation: first[i].r },
        { x: 0, y: 0, rotation: last[i].r, duration: .8, ease: 'power3.inOut', immediateRender: true, onComplete: () => clearEl(c) }, t + i * each);
      tl.fromTo(c, { scale: 1 }, { scale: 1.06, duration: .2, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, t + i * each);
    });
    return .8 + each * kids.length;
  }
  /* 直接把页面摆到第 n 拍（不播动画） */
  function setInstant(p, n) {
    p.units.forEach(u => { clearEl(u.el); if (!u.child) u.el.classList.toggle('on', u.beat <= n); if (u.el instanceof SVGElement) setDrawn(u.el, u.beat <= n); });
    p.keys.forEach(k => { if (G) G.killTweensOf(k.el); k.el.style.removeProperty('transform'); k.el.style.setProperty('--k', k.beat <= n ? 1 : 0); });
    p.arranges.forEach(a => setArranged(a, a.beat <= n));   // 先摆好位置，圈注和小克才量得准
    p.marks.forEach(m => showMark(m, p, m.beat <= n));
    I.placeKid(p, n);
    setClasses(p, n);
    applyRecede(p, n);
    p.beat = n;
  }
  /* 黑板先画线、再写字（v3-4）：算出每个单元的开始时间 */
  function drawDur(e) { const ps = strokes(e); const total = ps.reduce((a, q) => a + prepStroke(q), 0) || 1; return clamp(total / 2600, .3, .8); }
  function plan(p, list, base = 0) {
    const m = new Map();
    if (p.scene !== 'board') { list.forEach(u => m.set(u, base + u.start)); return m; }
    let t = 0;
    list.filter(u => u.el instanceof SVGElement && !u.child && u.fx === 'draw').forEach(u => { m.set(u, base + t); t += drawDur(u.el) * .85; });
    list.forEach(u => { if (!m.has(u)) m.set(u, base + t * .9 + u.start); });
    return m;
  }
  /* 黑板的板擦：在一块区域上来回擦 */
  function eraserSweep(tl, box, t) {
    const rows = clamp(Math.round(box.h / 170), 1, 4), pts = [];
    for (let i = 0; i < rows; i++) { const y = box.t + box.h * (i + .5) / rows; pts.push([i % 2 ? box.l + box.w : box.l, y], [i % 2 ? box.l : box.l + box.w, y]); }
    const seg = .46 / pts.length, onLedge = $('.bd-ledge b', dom.bg.board);   // 槽里那块板擦被拿起来
    tl.set(dom.eraserEl, { x: pts[0][0], y: pts[0][1], rotation: -6, opacity: 1 }, t);
    if (onLedge) tl.set(onLedge, { opacity: 0 }, t);
    pts.slice(1).forEach((q, i) => tl.to(dom.eraserEl, { x: q[0], y: q[1], rotation: i % 2 ? 7 : -8, duration: seg, ease: 'sine.inOut' }, t + i * seg));
    tl.to(dom.eraserEl, { opacity: 0, duration: .12 }, t + .46);
    if (onLedge) tl.set(onLedge, { opacity: 1 }, t + .58);
    return .58;
  }
  function unionBox(p, list) {
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    list.forEach(u => { const x = I.boxIn(u.el, p.el); if (!x.w && !x.h) return; l = Math.min(l, x.l); t = Math.min(t, x.t); r = Math.max(r, x.l + x.w); b = Math.max(b, x.t + x.h); });
    return l === Infinity ? null : { l, t, w: r - l, h: b - t };
  }
  function callOnBeat(p, n, dir, tl) {
    if (typeof p.def.onBeat !== 'function') return;
    try {
      const r = p.def.onBeat(n, p.el, dir);
      if (r && tl && typeof r.duration === 'function') tl.add(r, 0);
    } catch (e) { console.error(`[Deck] 页面 ${p.id} 的 onBeat 出错：`, e); }
  }
  /* 往前一拍：这一拍的元素按顺序出场，重点词随后强调，小克走过去 */
  function stepForward(p, n) {
    if (!motion()) { setInstant(p, n); callOnBeat(p, n, 1); return; }
    const tl = G.timeline();
    const ends = new Map();
    const list = p.units.filter(u => u.beat === n), at = plan(p, list);
    list.forEach(u => {
      if (!u.child) u.el.classList.add('on');
      const s0 = at.get(u), d = addFx(tl, u.el, u.fx, s0, p.scene);
      ends.set(u.el, s0 + d);
    });
    p.arranges.filter(a => a.beat === n).forEach(a => { const d = flipArrange(tl, a, true, .05); ends.set(a.el, .05 + d); });
    queueKeysAndMarks(tl, p, n, ends);
    if (p.kid) I.hopKid(tl, p, I.kidXY(p.kid), I.spotFor(p, n), .05);
    setClasses(p, n);
    applyRecede(p, n);
    p.beat = n;
    callOnBeat(p, n, 1, tl);
    play(tl);
  }
  function queueKeysAndMarks(tl, p, n, ends) {
    const endOf = node => { let best = 0; ends.forEach((v, e) => { if (e.contains(node)) best = Math.max(best, v); }); return best; };
    p.keys.filter(k => k.beat === n).forEach(k => emphasize(tl, k, Math.max(0, endOf(k.el) - .12)));
    p.marks.filter(m => m.beat === n).forEach((m, i) => drawMark(tl, m, p, endOf(m.el) + i * .08));
  }
  /* 往回一拍：这一拍的元素收回，小克回到上一拍的位置 */
  function stepBack(p, n) {   // 从 n+1 退到 n
    const gone = n + 1;
    if (!motion()) { setInstant(p, n); callOnBeat(p, n, -1); return; }
    const tl = G.timeline();
    const goneUnits = p.units.filter(u => u.beat === gone && !u.child);
    // 黑板：板擦在这一拍的内容上来回擦一遍
    const eb = p.scene === 'board' ? unionBox(p, goneUnits) : null;
    if (eb) eraserSweep(tl, { l: eb.l - 20, t: eb.t - 10, w: eb.w + 40, h: eb.h + 20 }, 0);
    goneUnits.forEach((u, i) => {
      const svgEl = u.el instanceof SVGElement;
      if (!svgEl) G.set(u.el, { rotation: tiltOf(u.el) });
      tl.to(u.el, { autoAlpha: 0, y: svgEl || eb ? 0 : 10, duration: eb ? .16 : .2, ease: 'power1.in', onComplete: () => { u.el.classList.remove('on'); clearEl(u.el); if (u.el instanceof SVGElement) setDrawn(u.el, false); } }, eb ? .12 + i * .05 : 0);
    });
    p.units.filter(u => u.beat === gone && u.child).forEach(u => tl.call(() => clearEl(u.el), null, eb ? .5 : .21));
    p.keys.filter(k => k.beat === gone).forEach(k => tl.to(k.el, { '--k': 0, duration: .15 }, 0));
    p.marks.filter(m => m.beat === gone && m.g).forEach(m => tl.to(m.g, { opacity: 0, duration: .15, onComplete: () => showMark(m, p, false) }, 0));
    p.arranges.filter(a => a.beat === gone).forEach(a => flipArrange(tl, a, false, 0));
    if (p.kid) I.hopKid(tl, p, I.kidXY(p.kid), I.spotFor(p, n), 0);
    setClasses(p, n);
    applyRecede(p, n);
    p.beat = n;
    callOnBeat(p, n, -1, tl);
    play(tl);
  }
  function play(tl) {
    if (tl.duration() > MAX_BEAT) tl.timeScale(tl.duration() / MAX_BEAT);
    S.running = tl;
    tl.eventCallback('onComplete', () => { if (S.running === tl) S.running = null; });
  }

  Object.assign(I, {
    tiltOf, clearEl, setDrawn, addFx, emphasize, showMark, drawMark,
    finishRunning, setClasses, applyRecede, setInstant, plan, eraserSweep, unionBox,
    callOnBeat, stepForward, stepBack, queueKeysAndMarks, play,
  });
})();
