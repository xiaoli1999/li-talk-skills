/* =====================================================================
   演示稿引擎 · 翻页（pages.js）
   - 换风格 switchScene（新背景擦入、外框淡出淡入；离开的风格 unmount、新风格 mount，见 mountScene）
   - 跳转 go：同页相邻拍播进退动画，跨页走 enterPage（同风格翻页用风格的 pageTurn，没写就用默认平移）
   - 进入一页的出场 playEnter（大标题用风格的 titleIn）；第一次进入第一页时风格写了 intro 就改播开场 playIntro；
     下一拍 next、上一拍 prev
   - 每次变化后 afterChange：更新章节、节拍格、页码、地址，并同步演讲者视图
   - 依赖总线：core 的常量和工具、风格注册表（I.sc、I.hook）、I.PAGES、
     I.state（cur、reading、running、pageTl、curScene、mountedScene、sceneTl）、
     I.dom（bg、stage、chap、meter、dotsBox、mnum、pageno）；
     beats.js 的 I.clearEl、I.setInstant、I.callOnBeat、I.stepForward、I.stepBack、I.finishRunning、
     I.addFx、I.plan、I.queueKeysAndMarks、I.play；
     mascot.js 的 I.mascotXY、I.moveMascot、I.spotFor、I.mascotActivity；ui.js 的 I.scrollToPage；presenter.js 的 I.syncPresenter
   - 挂到总线：switchScene、mountScene、finishPageTl、go、enterPage、turnPage、playEnter、playIntro、next、prev、afterChange
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { G, $, $$, clamp, esc, toInt, motion, PAGES, INTRO_MAX } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     翻页与换风格
     ================================================================= */
  /* 当前风格换了：旧风格 unmount(stage)、新风格 mount(stage)（风格在这里挂悬停等监听、放自己的元素）；
     key 为 null 表示全部卸下（进阅读模式时） */
  function mountScene(key) {
    if (S.mountedScene === key) return;
    if (S.mountedScene) I.hook(I.sc(S.mountedScene), 'unmount', dom.stage);
    S.mountedScene = key || null;
    if (key) I.hook(I.sc(key), 'mount', dom.stage);
  }
  function switchScene(to, dir, anim) {
    if (to === S.curScene) return false;
    const from = S.curScene; S.curScene = to;
    mountScene(to);
    const nb = dom.bg[to], ob = from ? dom.bg[from] : null;
    if (!anim || !ob) {
      Object.keys(dom.bg).forEach(s => { dom.bg[s].classList.toggle('on', s === to); I.clearEl(dom.bg[s]); dom.bg[s].style.zIndex = ''; });
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
    } else enterPage(pi, b, anim, opts.dir || (pi > S.cur.p ? 1 : -1), !!opts.intro);
    S.cur = { p: pi, b: p.beat };
    afterChange();
  }
  /* intro 为 true：启动时第一次进入第一页（core.js 的 boot 传入；带 #页/拍 打开、自检模式时不传） */
  function enterPage(pi, b, anim, dir, intro) {
    finishPageTl();
    const old = PAGES[S.cur.p], p = PAGES[pi];
    const oldOn = old && old !== p && old.el.classList.contains('active');
    // 形象从上一页的位置过来：换算成新页形象的相对位移
    const fromM = oldOn && old.mascot && p.mascot ? (() => { const o = I.mascotXY(old.mascot); return { x: old.mascot.el.offsetLeft + o.x - p.mascot.el.offsetLeft, y: old.mascot.el.offsetTop + o.y - p.mascot.el.offsetTop }; })() : null;
    I.setInstant(p, b);
    p.el.classList.add('active');
    const sceneChanged = switchScene(p.scene, dir, anim && oldOn);
    if (!anim || !oldOn) {
      PAGES.forEach(x => { if (x !== p) { x.el.classList.remove('active'); I.clearEl(x.el); } });
      I.clearEl(p.el);
      I.callOnBeat(p, b, 0);
      if (anim && b === 0 && !(intro && playIntro(p))) playEnter(p, 0, null);
      return;
    }
    const tl = G.timeline();
    const retire = () => { old.el.classList.remove('active'); I.clearEl(old.el); old.el.style.zIndex = ''; I.setInstant(old, old.beat); };
    let inAt;
    if (sceneChanged) {                       // 换风格：新背景擦入，内容淡出淡入
      tl.to(old.el, { autoAlpha: 0, duration: .28, ease: 'power2.in', onComplete: retire }, 0);
      inAt = .38;
      tl.fromTo(p.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power2.out', immediateRender: true, onComplete: () => I.clearEl(p.el) }, inAt);
    } else inAt = turnPage(tl, old, p, dir, retire);
    S.pageTl = tl;
    tl.eventCallback('onComplete', () => { if (S.pageTl === tl) S.pageTl = null; });
    if (old.mascot && fromM) G.set(old.mascot.el, { opacity: 0 });
    if (dir > 0 && b === 0) playEnter(p, inAt + .05, fromM);
    else {
      I.callOnBeat(p, b, 0);
      if (fromM && p.mascot) { const t2 = G.timeline({ delay: inAt }); I.moveMascot(t2, p, fromM, I.spotFor(p, b), 0); S.running = t2; }
    }
  }
  /* 同风格翻页：风格写了 pageTurn 就用它，没写用默认的整页平移。返回新页内容开始出场的时刻。
     pageTurn(ctx)：ctx = { tl, from, to, dir, retire, clear }，from / to 是旧页、新页（el 是页面元素），
     dir 是 1 前进、-1 后退；旧页退场完要调用 retire()；clear(el) 清掉动画留下的内联样式；
     返回新页内容开始出场的时刻（秒），不返回按 .1 算 */
  function turnPage(tl, old, p, dir, retire) {
    const sc = I.sc(p.scene);
    if (typeof sc.pageTurn === 'function') {
      try {
        const r = sc.pageTurn({ tl, from: old, to: p, dir, retire, clear: I.clearEl });
        // 保险：风格忘了调用 retire 时，翻页结束后由引擎收掉旧页
        tl.call(() => { if (old.el.classList.contains('active') && S.cur.p !== old.i) retire(); }, null, Math.max(tl.duration(), .1));
        return typeof r === 'number' && r >= 0 ? r : .1;
      } catch (e) {
        console.error(`[Deck] 风格 ${sc.key} 的 pageTurn 出错，改用默认的平移：`, e);
        tl.clear();
      }
    }
    // 默认：整页横移
    tl.to(old.el, { x: -80 * dir, autoAlpha: 0, duration: .4, ease: 'power2.in', onComplete: retire }, 0);
    tl.fromTo(p.el, { x: 80 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .5, ease: 'power3.out', immediateRender: true, onComplete: () => I.clearEl(p.el) }, .05);
    return .1;
  }
  /* 进入一页（第 0 拍）：标题和第 0 拍的元素依次出场，形象从上一页的位置走过来（没有上一页时从上面落下来） */
  function playEnter(p, delay, fromM) {
    const tl = G.timeline({ delay });
    const title = $(':scope > .s-title', p.el);
    let t = 0;
    const ends = new Map();
    if (title) { const d = I.addFx(tl, title, I.sc(p.scene).titleIn || 'fade', 0, p.scene); ends.set(title, d); t = .18; }
    const list = p.units.filter(u => u.beat === 0), at = I.plan(p, list, t);
    list.forEach(u => { const s0 = at.get(u), d = I.addFx(tl, u.el, u.fx, s0, p.scene); ends.set(u.el, s0 + d); });
    I.queueKeysAndMarks(tl, p, 0, ends);
    mascotIn(tl, p, fromM, .25);
    I.callOnBeat(p, 0, 1, tl);
    I.play(tl);
  }
  /* 形象进场：从上一页的位置走过来（fromM），没有上一页时在 at 秒从上面落下来；形象自己晚于第 0 拍出现的不管 */
  function mascotIn(tl, p, fromM, at) {
    const m = p.mascot, kb = m ? m.el.closest('[data-beat]') : null;
    if (!m || (kb && toInt(kb.dataset.beat) > 0)) return;
    const sp = I.spotFor(p, 0);
    if (fromM) { G.set(m.el, { x: fromM.x, y: fromM.y }); I.moveMascot(tl, p, fromM, sp, 0); }
    else tl.fromTo(m.el, { opacity: 0, y: sp.y - 46 }, { opacity: 1, y: sp.y, duration: .55, ease: 'bounce.out', immediateRender: true, onComplete: () => m.el.style.removeProperty('opacity') }, at);
  }
  /* 开场（接口约定 B 的 intro）：启动时第一次进入第一页、不带 #页/拍、不在自检模式、没开「减少动态」时播。
     风格的 intro({ tl, page }) 负责整个第一页第 0 拍的出场（背景、大标题、主题行、第 0 拍的块、重点词），
     往 tl 里加动画，返回开场的总时长（秒；不返回就按 tl 的时长）。引擎接着做三件事：
     第 0 拍的圈注接在开场后面画；形象在开场结束时（intro 返回的时长处）从上面落下；页面的 onBeat(0) 并进同一条时间线。
     开场加形象总长超过 INTRO_MAX 秒就整体加速；开场途中按键或点击，直接跳到开场结尾再进下一拍。
     风格没写 intro 返回 false，由调用方走原来的 playEnter；intro 出错也返回 false（报一条错） */
  function playIntro(p) {
    const sc = I.sc(p.scene);
    if (typeof sc.intro !== 'function' || !G) return false;
    const tl = G.timeline();
    let end;
    try { end = sc.intro({ tl, page: p }); }
    catch (e) {
      console.error(`[Deck] 风格 ${sc.key} 的 intro 出错，改用普通的第一页出场：`, e);
      tl.progress(1); tl.kill(); I.setInstant(p, 0);
      return false;
    }
    if (!(typeof end === 'number' && end >= 0)) end = tl.duration();
    p.marks.filter(m => m.beat === 0).forEach((m, i) => I.drawMark(tl, m, p, end + i * .08));
    mascotIn(tl, p, null, end);
    I.callOnBeat(p, 0, 1, tl);
    if (tl.duration() > INTRO_MAX) tl.timeScale(tl.duration() / INTRO_MAX);
    S.running = tl;
    tl.eventCallback('onComplete', () => { if (S.running === tl) S.running = null; });
    return true;
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
    // 节拍格按五个一组（b.zg 里放 5 个 i；有的风格把每组拼成一个「正」字，其余就是一排）
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
    I.mascotActivity();   // 翻拍也算有人操作：形象 5 秒内不做空闲动作，打着盹的醒过来
    I.syncPresenter();
  }

  Object.assign(I, { switchScene, mountScene, finishPageTl, go, enterPage, turnPage, playEnter, playIntro, next, prev, afterChange });
})();
