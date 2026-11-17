/* =====================================================================
   演示稿引擎 · 形象（mascot.js）
   - 小克：像素小方块（16×15 格）的画法 kidSvg、生成标记 kid
   - 走位：spotFor（第 n 拍该站在哪）、applySpot、placeKid（直接摆好）、
     hopKid（蹦过去、落地压一下、点头）、kidCheer（替你高兴一下）、悬停变开心、随机眨眼
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur）、I.motion；build.js 的 I.boxIn
   - 挂到总线：kidSvg、kid、setPose、spotFor、applySpot、kidXY、placeKid、hopKid、bindKid、kidCheer
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, G, $, clamp, esc, motion, PAGES } = I;
  const S = I.state;

  /* =================================================================
     小克：像素小方块（16×15 格），两只小短手、四条小短腿
     ================================================================= */
  const KC = { k: '#2B2420', a: '#F5A33B', L: '#FFD58A', D: '#D9822B', p: '#FF8F86', g: '#5DBB63', d: '#2F7A44', w: '#FFFFFF' };
  const KID_BODY = ['...kkkkkkkkkk...', '..kaLLaaaaaaak..', '..kaLaaaaaaaak..', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..',
    '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kDDDDDDDDDDk..', '...kkkkkkkkkk...'];
  const POSES = ['idle', 'point', 'happy', 'lie'];
  function kidSvg(pose) {
    if (!POSES.includes(pose)) pose = 'idle';
    const cells = {};
    const dy = pose === 'lie' ? 2 : 0;
    const put = (x, y, c, cls) => { cells[(y + dy) + ',' + x] = cls ? c + ':' + cls : c; };
    KID_BODY.forEach((r, i) => [...r].forEach((c, x) => { if (c !== '.') put(x, 3 + i, c); }));
    put(8, 0, 'g'); put(9, 0, 'g'); put(7, 1, 'g'); put(8, 1, 'g'); put(7, 2, 'd');            // 头顶的芽
    if (pose === 'happy') {                                                                  // 眯眼笑
      [[4, 7], [5, 7], [3, 8], [6, 8], [10, 7], [11, 7], [9, 8], [12, 8]].forEach(([x, y]) => put(x, y, 'k'));
      [[6, 9], [7, 9], [8, 9], [9, 9], [6, 10], [9, 10]].forEach(([x, y]) => put(x, y, 'k')); put(7, 10, 'p'); put(8, 10, 'p');
    } else {                                                                                 // 圆眼睛（ke-o）+ 眨眼时的一条线（ke-c）+ 小微笑
      put(4, 7, 'w', 'ke-o'); put(5, 7, 'k', 'ke-o'); put(10, 7, 'w', 'ke-o'); put(11, 7, 'k', 'ke-o');
      [[4, 8], [5, 8], [10, 8], [11, 8]].forEach(([x, y]) => put(x, y, 'k', 'ke-o'));
      [[6, 9], [9, 9], [7, 10], [8, 10]].forEach(([x, y]) => put(x, y, 'k'));
    }
    [[3, 9], [4, 9], [11, 9], [12, 9]].forEach(([x, y]) => put(x, y, 'p'));                    // 腮红
    const arm = pts => pts.forEach(([x, y]) => put(x, y, 'D'));
    if (pose === 'point') { arm([[0, 8], [1, 8], [0, 9], [1, 9]]); arm([[14, 6], [15, 6], [14, 7], [15, 7], [15, 4], [16, 4], [15, 5], [16, 5]]); }
    else if (pose === 'happy') { arm([[0, 4], [1, 4], [0, 5], [1, 5], [1, 6], [1, 7]]); arm([[14, 6], [14, 7], [14, 4], [15, 4], [14, 5], [15, 5]]); }
    else if (pose === 'lie') { arm([[0, 10], [1, 10], [0, 11], [1, 11]]); arm([[14, 10], [15, 10], [14, 11], [15, 11]]); }
    else { arm([[0, 8], [1, 8], [0, 9], [1, 9]]); arm([[14, 8], [15, 8], [14, 9], [15, 9]]); }
    if (pose !== 'lie') [[4, 'kl-a'], [9, 'kl-a'], [6, 'kl-b'], [11, 'kl-b']].forEach(([x, cls]) => { put(x, 13, 'D', cls); put(x, 14, 'k', cls); });
    let out = '';
    for (let y = 0; y < 17; y++) {
      for (let x = 0; x < 17;) {
        const v = cells[y + ',' + x];
        if (!v) { x++; continue; }
        let w = 1; while (cells[y + ',' + (x + w)] === v) w++;
        const [c, cls] = v.split(':');
        out += `<rect x="${x}" y="${y}" width="${w}" height="1.02" fill="${KC[c]}"${cls ? ` class="${cls}"` : ''}/>`;
        x += w;
      }
    }
    if (pose !== 'happy') out += `<rect class="ke-c" x="4" y="${8 + dy}" width="2" height="1" fill="${KC.k}"/><rect class="ke-c" x="10" y="${8 + dy}" width="2" height="1" fill="${KC.k}"/>`;
    return `<svg viewBox="0 0 16 15" aria-hidden="true">${out}</svg>`;
  }
  /** 生成一只小克的标记。opts：{ pose, size, x, y, face, say, guide } */
  function kid(opts = {}) {
    const st = [`--kid:${opts.size || 112}px`];
    if (opts.x != null) st.push(`left:${opts.x}px`);
    if (opts.y != null) st.push(`top:${opts.y}px`);
    return `<div class="kid${opts.guide === false ? '' : ' guide'}" data-pose="${opts.pose || 'idle'}"${opts.face ? ` data-face="${opts.face}"` : ''}${opts.say ? ` data-say="${esc(opts.say)}"` : ''} style="${st.join(';')}"></div>`;
  }

  /* =================================================================
     小克：落脚点与走位
     ================================================================= */
  function setPose(k, pose) {
    pose = POSES.includes(pose) ? pose : 'idle';
    if (k.el._pose === pose) return;
    k.el._pose = pose;
    const svg = $('svg', k.el); svg.outerHTML = kidSvg(pose); k.svg = $('svg', k.el);
  }
  /* 第 n 拍时小克该在哪：取 data-kid ≤ n 的最后一个目标；没有就待在原地 */
  function spotFor(p, n) {
    const k = p.kid, s = p.el;
    let tg = null;
    p.targets.forEach(t => { if (t.beat <= n && (!tg || t.beat >= tg.beat)) tg = t; });   // 拍号最大的那个；同一拍取写在后面的
    const kw = k.el.offsetWidth, kh = k.el.offsetHeight;
    if (!tg) return { x: 0, y: 0, pose: k.home.pose, face: k.home.face, say: k.home.say };
    const b = I.boxIn(tg.el, s), ds = tg.el.dataset;
    const side = ds.kidSide || 'top';
    if (side === 'stay') {   // 原地不动，只换姿势、说话
      const base = tg.beat > 0 ? spotFor(p, tg.beat - 1) : { x: 0, y: 0, face: k.home.face };
      return { x: base.x, y: base.y, pose: ds.kidPose || 'point', face: ds.kidFace || base.face, say: ds.kidSay || '' };
    }
    const fx = ds.kidX != null ? parseFloat(ds.kidX) : .12;
    let x, y, face;
    if (side === 'left') { x = b.l - kw - 14; y = b.t + b.h / 2 - kh / 2; face = 'right'; }
    else if (side === 'right') { x = b.l + b.w + 14; y = b.t + b.h / 2 - kh / 2; face = 'left'; }
    else if (side === 'bottom') { x = b.l + b.w * fx; y = b.t + b.h + 10; face = 'right'; }
    else { x = b.l + (b.w - kw) * fx; y = b.t - kh + kh * .06; face = 'right'; }
    x += parseFloat(ds.kidDx) || 0; y += parseFloat(ds.kidDy) || 0;
    x = clamp(x, 8, W - kw - 8); y = clamp(y, 8, H - kh - 4);
    const hl = k.el.offsetLeft, ht = k.el.offsetTop;
    return { x: x - hl, y: y - ht, pose: ds.kidPose || 'point', face: ds.kidFace || face, say: ds.kidSay || '' };
  }
  function applySpot(k, sp) {
    const same = k.cur && k.cur.pose === sp.pose && k.cur.face === sp.face && k.cur.say === sp.say && k.say.classList.contains('on') === !!sp.say;
    k.cur = sp;
    if (same) return;
    setPose(k, sp.pose);
    k.el.dataset.face = sp.face;
    if (sp.say) {
      k.say.textContent = sp.say;
      k.say.classList.remove('on'); void k.say.offsetWidth; k.say.classList.add('on');
    } else k.say.classList.remove('on');
  }
  function kidXY(k) { return G ? { x: +G.getProperty(k.el, 'x') || 0, y: +G.getProperty(k.el, 'y') || 0 } : { x: 0, y: 0 }; }
  function placeKid(p, n) {
    if (!p.kid) return;
    const sp = spotFor(p, n), e = p.kid.el;
    if (G) { G.killTweensOf(e); G.killTweensOf(p.kid.body); G.set(e, { x: sp.x, y: sp.y }); G.set(p.kid.body, { clearProps: 'transform' }); }
    else e.style.transform = `translate(${sp.x}px,${sp.y}px)`;
    e.style.removeProperty('opacity'); e.style.removeProperty('visibility');
    e.classList.remove('walk', 'blink');
    p.kid.cur = null;
    applySpot(p.kid, sp);
  }
  /* 到位后的小表演：点头（举手指时跟着点一下，开心时连点两下） */
  function nodKid(tl, k, sp, t) {
    if (!G) return;
    const n = sp.pose === 'happy' ? 3 : 1;
    tl.fromTo(k.body, { y: 0 }, { y: 4, duration: .1, yoyo: true, repeat: n, ease: 'sine.inOut', immediateRender: false }, t);
  }
  /* 一蹦一跳走过去（腿交替），落地压一下，然后摆姿势、点头、说重点词 */
  function hopKid(tl, p, from, sp, t) {
    const k = p.kid;
    const dist = Math.hypot(sp.x - from.x, sp.y - from.y);
    if (dist < 3) {
      const changed = !k.cur || k.cur.pose !== sp.pose || k.cur.say !== sp.say;
      tl.call(() => applySpot(k, sp), null, t);
      if (changed) nodKid(tl, k, sp, t + .05);
      return 0;
    }
    const d = clamp(.32 + dist / 2600, .4, .75);
    const peak = Math.min(from.y, sp.y) - Math.min(130, 36 + dist * .14);
    tl.call(() => { setPose(k, 'idle'); k.el.dataset.face = sp.x < from.x ? 'left' : 'right'; k.el.classList.add('walk'); k.el.classList.remove('blink'); k.say.classList.remove('on'); }, null, t);
    tl.fromTo(k.el, { x: from.x }, { x: sp.x, duration: d, ease: 'power1.inOut', immediateRender: false }, t);
    tl.fromTo(k.el, { y: from.y }, { y: peak, duration: d * .45, ease: 'power2.out', immediateRender: false }, t);
    tl.to(k.el, { y: sp.y, duration: d * .55, ease: 'power2.in' }, t + d * .45);
    tl.call(() => { k.el.classList.remove('walk'); k.cur = null; applySpot(k, sp); }, null, t + d);
    tl.fromTo(k.body, { scaleY: .84, scaleX: 1.1, transformOrigin: '50% 100%' }, { scaleY: 1, scaleX: 1, duration: .26, ease: 'back.out(3)', immediateRender: false }, t + d);
    nodKid(tl, k, sp, t + d + .26);
    return d + .5;
  }
  /* 鼠标移上去：开心；点它：蹦一下（不进拍）；偶尔眨眼（随机间隔） */
  function bindKid(p) {
    const k = p.kid;
    k.body.addEventListener('mouseenter', () => { if (k.el.classList.contains('walk')) return; k._hover = true; setPose(k, 'happy'); });
    k.body.addEventListener('mouseleave', () => { k._hover = false; if (k.cur && !k.el.classList.contains('walk')) setPose(k, k.cur.pose); });
  }
  function kidCheer(k, say) {
    if (!k) return;
    setPose(k, 'happy');
    if (say) { k.say.textContent = say; k.say.classList.remove('on'); void k.say.offsetWidth; k.say.classList.add('on'); }
    if (motion()) G.fromTo(k.body, { y: 0 }, { keyframes: [{ y: -30, scaleX: .94, scaleY: 1.07, duration: .18, ease: 'power2.out' }, { y: 0, scaleX: 1.1, scaleY: .9, duration: .16, ease: 'power2.in' }, { scaleX: 1, scaleY: 1, duration: .14 }], transformOrigin: '50% 100%' });
    clearTimeout(k._cheerT);
    k._cheerT = setTimeout(() => { if (!k.cur) return; const c = k.cur; k.cur = null; if (!k._hover) applySpot(k, c); else k.cur = c; }, 1500);
  }
  (function blinkLoop() {
    setTimeout(() => {
      if (motion()) {
        const p = PAGES[S.cur.p];
        const k = p && p.kid;
        if (k && !k.el.classList.contains('walk') && k.el._pose !== 'happy') {
          k.el.classList.add('blink');
          setTimeout(() => k.el.classList.remove('blink'), 140);
        }
      }
      blinkLoop();
    }, 2600 + Math.random() * 3600);
  })();

  Object.assign(I, { kidSvg, kid, setPose, spotFor, applySpot, kidXY, placeKid, hopKid, bindKid, kidCheer });
})();
