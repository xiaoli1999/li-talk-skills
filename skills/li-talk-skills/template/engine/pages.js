/* =====================================================================
   演示稿引擎 · 翻页（pages.js）
   - 换场景 switchScene（新背景擦入、外框淡出淡入）
   - 跳转 go：同页相邻拍播进退动画，跨页走 enterPage（各场景的翻页方式）
   - 进入一页的出场 playEnter；下一拍 next、上一拍 prev
   - 每次变化后 afterChange：更新章节、节拍格、页码、地址，并同步演讲者视图
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、reading、running、pageTl、curScene、sceneTl）、
     I.dom（bg、stage、chap、meter、dotsBox、mnum、pageno）；
     beats.js 的 I.clearEl、I.setInstant、I.callOnBeat、I.stepForward、I.stepBack、I.finishRunning、
     I.addFx、I.plan、I.queueKeysAndMarks、I.play、I.eraserSweep；
     mascot.js 的 I.kidXY、I.hopKid、I.spotFor；ui.js 的 I.scrollToPage；presenter.js 的 I.syncPresenter
   - 挂到总线：switchScene、finishPageTl、go、enterPage、playEnter、next、prev、afterChange
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { SCENES, TITLE_IN, G, $, $$, clamp, esc, toInt, el, motion, PAGES } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     翻页与换场景
     ================================================================= */
  function switchScene(to, dir, anim) {
    if (to === S.curScene) return false;
    const from = S.curScene; S.curScene = to;
    const nb = dom.bg[to], ob = from ? dom.bg[from] : null;
    if (!anim || !ob) {
      SCENES.forEach(s => { dom.bg[s].classList.toggle('on', s === to); I.clearEl(dom.bg[s]); dom.bg[s].style.zIndex = ''; });
      if (S.sceneTl) { S.sceneTl.kill(); S.sceneTl = null; I.clearEl($('.chrome', dom.stage)); }
      dom.stage.dataset.scene = to;
      return true;
    }
    nb.classList.add('on'); nb.style.zIndex = 2; ob.style.zIndex = 1;
    G.fromTo(nb, { clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power3.inOut',
      onComplete: () => { if (S.curScene === to) { ob.classList.remove('on'); } nb.style.zIndex = ''; ob.style.zIndex = ''; nb.style.removeProperty('clip-path'); },
    });
    const ch = $('.chrome', dom.stage);
    if (S.sceneTl) S.sceneTl.kill();
    S.sceneTl = G.timeline({ onComplete: () => I.clearEl(ch) }).to(ch, { autoAlpha: 0, duration: .2 }).call(() => { dom.stage.dataset.scene = S.curScene; }).to(ch, { autoAlpha: 1, duration: .3 }, '+=.25');
    return true;
  }
  function finishPageTl() { if (S.pageTl) { const t = S.pageTl; S.pageTl = null; t.progress(1); t.kill(); } }

  function go(pi, b, opts = {}) {
    if (!PAGES.length) return;
    pi = clamp(pi, 0, PAGES.length - 1);
    const p = PAGES[pi];
    b = clamp(b, 0, p.total);
    if (S.reading) { S.cur = { p: pi, b }; I.scrollToPage(pi); return; }
    I.finishRunning();
    const anim = opts.anim !== false && motion();
    if (pi === S.cur.p && p.el.classList.contains('active')) {
      if (b === p.beat) return;
      if (anim && b === p.beat + 1) I.stepForward(p, b);
      else if (anim && b === p.beat - 1) I.stepBack(p, b);
      else { I.setInstant(p, b); I.callOnBeat(p, b, 0); }
    } else enterPage(pi, b, anim, opts.dir || (pi > S.cur.p ? 1 : -1));
    S.cur = { p: pi, b: p.beat };
    afterChange();
  }
  function enterPage(pi, b, anim, dir) {
    finishPageTl();
    const old = PAGES[S.cur.p], p = PAGES[pi];
    const oldOn = old && old !== p && old.el.classList.contains('active');
    const fromKid = oldOn && old.kid && p.kid ? (() => { const o = I.kidXY(old.kid); return { x: old.kid.el.offsetLeft + o.x - p.kid.el.offsetLeft, y: old.kid.el.offsetTop + o.y - p.kid.el.offsetTop }; })() : null;
    I.setInstant(p, b);
    p.el.classList.add('active');
    const sceneChanged = switchScene(p.scene, dir, anim && oldOn);
    if (!anim || !oldOn) {
      PAGES.forEach(x => { if (x !== p) { x.el.classList.remove('active'); I.clearEl(x.el); } });
      I.clearEl(p.el);
      I.callOnBeat(p, b, 0);
      if (anim && b === 0) playEnter(p, 0, null);
      return;
    }
    const tl = G.timeline();
    const retire = () => { old.el.classList.remove('active', 'turning'); I.clearEl(old.el); old.el.style.zIndex = ''; I.setInstant(old, old.beat); };
    let inAt;
    if (sceneChanged) {                       // 换场景：新背景擦入，内容淡出淡入
      tl.to(old.el, { autoAlpha: 0, duration: .28, ease: 'power2.in', onComplete: retire }, 0);
      inAt = .38;
      tl.fromTo(p.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power2.out', immediateRender: true, onComplete: () => I.clearEl(p.el) }, inAt);
    } else if (p.scene === 'paper') {         // 方格纸：整张活页绕左侧的孔翻过去
      const turner = dir > 0 ? old : p, under = dir > 0 ? p : old;
      const shade = el('div', 'slide-shade'), shade2 = el('div', 'slide-shade');
      turner.el.appendChild(shade); under.el.appendChild(shade2);
      turner.el.classList.add('turning'); turner.el.style.zIndex = 3; under.el.style.zIndex = 1;
      const done = () => { shade.remove(); shade2.remove(); turner.el.classList.remove('turning'); p.el.style.zIndex = ''; I.clearEl(p.el); };
      if (dir > 0) {
        tl.fromTo(old.el, { rotationY: 0, transformPerspective: 4200 }, { rotationY: -92, duration: .75, ease: 'power2.in', onComplete: () => { done(); retire(); } }, 0)
          .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: .75, ease: 'power1.in' }, 0)
          .fromTo(shade2, { opacity: .5 }, { opacity: 0, duration: .6, ease: 'power1.out' }, .35);
        inAt = .3;
      } else {
        tl.fromTo(p.el, { rotationY: -92, transformPerspective: 4200 }, { rotationY: 0, duration: .75, ease: 'power2.out', immediateRender: true, onComplete: () => { done(); retire(); } }, 0)
          .fromTo(shade, { opacity: 1 }, { opacity: 0, duration: .75, ease: 'power1.out' }, 0)
          .fromTo(shade2, { opacity: 0 }, { opacity: .5, duration: .5, ease: 'power1.in' }, .2);
        inAt = .2;
      }
    } else if (p.scene === 'board') {         // 黑板：板擦把整块板擦一遍，再写下一页
      I.eraserSweep(tl, { l: 160, t: 160, w: 1600, h: 760 }, 0);
      tl.to(old.el, { autoAlpha: 0, duration: .4, ease: 'power1.in', onComplete: retire }, .1);
      tl.fromTo(p.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, immediateRender: true, onComplete: () => I.clearEl(p.el) }, .5);
      inAt = .52;
    } else if (p.scene === 'desk') {          // 桌面：旧纸被推到一边，新的一张滑进来
      tl.to(old.el, { x: -160 * dir, rotation: -1.2 * dir, autoAlpha: 0, duration: .45, ease: 'power2.in', onComplete: retire }, 0);
      tl.fromTo(p.el, { x: 200 * dir, rotation: 1.5 * dir, autoAlpha: 0 }, { x: 0, rotation: 0, autoAlpha: 1, duration: .6, ease: 'power3.out', immediateRender: true, onComplete: () => I.clearEl(p.el) }, .2);
      inAt = .25;
    } else {                                  // 手账：整页横移，像翻手账
      tl.to(old.el, { x: -80 * dir, autoAlpha: 0, duration: .4, ease: 'power2.in', onComplete: retire }, 0);
      tl.fromTo(p.el, { x: 80 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .5, ease: 'power3.out', immediateRender: true, onComplete: () => I.clearEl(p.el) }, .05);
      inAt = .1;
    }
    S.pageTl = tl;
    tl.eventCallback('onComplete', () => { if (S.pageTl === tl) S.pageTl = null; });
    if (old.kid && fromKid) G.set(old.kid.el, { opacity: 0 });
    if (dir > 0 && b === 0) playEnter(p, inAt + .05, fromKid);
    else {
      I.callOnBeat(p, b, 0);
      if (fromKid && p.kid) { const t2 = G.timeline({ delay: inAt }); I.hopKid(t2, p, fromKid, I.spotFor(p, b), 0); S.running = t2; }
    }
  }
  /* 进入一页（第 0 拍）：标题和第 0 拍的元素依次出场，小克从上一页的位置走过来 */
  function playEnter(p, delay, fromKid) {
    const tl = G.timeline({ delay });
    const title = $(':scope > .s-title', p.el);
    let t = 0;
    const ends = new Map();
    if (title) { const d = I.addFx(tl, title, TITLE_IN[p.scene], 0, p.scene); ends.set(title, d); t = .18; }
    const list = p.units.filter(u => u.beat === 0), at = I.plan(p, list, t);
    list.forEach(u => { const s0 = at.get(u), d = I.addFx(tl, u.el, u.fx, s0, p.scene); ends.set(u.el, s0 + d); });
    I.queueKeysAndMarks(tl, p, 0, ends);
    const kb = p.kid ? p.kid.el.closest('[data-beat]') : null;
    if (p.kid && !(kb && toInt(kb.dataset.beat) > 0)) {
      const sp = I.spotFor(p, 0);
      if (fromKid) { G.set(p.kid.el, { x: fromKid.x, y: fromKid.y }); I.hopKid(tl, p, fromKid, sp, 0); }
      else tl.fromTo(p.kid.el, { opacity: 0, y: sp.y - 46 }, { opacity: 1, y: sp.y, duration: .55, ease: 'bounce.out', immediateRender: true, onComplete: () => p.kid.el.style.removeProperty('opacity') }, .25);
    }
    I.callOnBeat(p, 0, 1, tl);
    I.play(tl);
  }

  function next() {
    if (S.reading || !PAGES.length) return;
    finishPageTl();
    const p = PAGES[S.cur.p];
    if (S.cur.b < p.total) go(S.cur.p, S.cur.b + 1);
    else if (S.cur.p < PAGES.length - 1) go(S.cur.p + 1, 0, { dir: 1 });
  }
  function prev() {
    if (S.reading || !PAGES.length) return;
    finishPageTl();
    if (S.cur.b > 0) go(S.cur.p, S.cur.b - 1);
    else if (S.cur.p > 0) go(S.cur.p - 1, PAGES[S.cur.p - 1].total, { dir: -1 });
  }

  function afterChange() {
    const p = PAGES[S.cur.p];
    dom.chap.innerHTML = p.def.chapter && !p.def.topic ? `<span>${esc(p.def.chapter)}</span>` : '';   // 有主题行的页，章节已经写在主题行里
    // 节拍格按五个一组（黑板上每组拼成一个「正」字，别的场景就是一排）
    if (dom.dotsBox.querySelectorAll('i').length !== p.total) {
      let h = '';
      for (let g = 0; g < p.total; g += 5) h += `<b class="zg">${'<i></i>'.repeat(Math.min(5, p.total - g))}</b>`;
      dom.dotsBox.innerHTML = h;
    }
    $$('i', dom.dotsBox).forEach((d, i) => { d.classList.toggle('on', i < p.beat); d.classList.toggle('now', i === p.beat - 1); });
    dom.meter.hidden = p.total === 0;
    dom.mnum.innerHTML = `<span class="ml">第 <b>${p.beat}</b> 拍 / 共 ${p.total} 拍</span><span class="ms"><b>${p.beat}</b>/${p.total} 拍</span>`;
    dom.pageno.innerHTML = `<b>${p.i + 1}</b> / ${PAGES.length} 页`;
    const h = '#' + (p.i + 1) + (p.beat ? '/' + p.beat : '');
    if (location.hash !== h) { try { history.replaceState(null, '', h); } catch (e) { /* 个别环境不允许改地址 */ } }
    I.syncPresenter();
  }

  Object.assign(I, { switchScene, finishPageTl, go, enterPage, playEnter, next, prev, afterChange });
})();
