/* =====================================================================
   演示稿引擎 · 交互（ui.js）
   - 复制：copyText（先用同步老办法，再试剪贴板接口）、onCopy、「已复制」提示 copiedTip（找不挡字的位置 textRects）
   - 看大图：openShot、closeShot
   - 输入：键盘 onKey、触屏滑动、点击翻拍、地址 #页/拍（parseHash、hashchange）
   - 屏幕适配：fit（横屏等比缩放铺满、窄的竖屏切阅读模式）、setMode、scrollToPage、pageInView
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、reading、booted、curScene）、I.dom（lb、world、stage）、I.toast；
     build.js 的 I.boxIn；beats.js 的 I.clearEl、I.setInstant、I.callOnBeat、I.finishRunning；
     mascot.js 的 I.kidCheer；pages.js 的 I.next、I.prev、I.go、I.finishPageTl；
     presenter.js 的 I.openPresenter、I.toggleTimer、I.resetTimer
   - 挂到总线：copyText、onCopy、textRects、copiedTip、openShot、closeShot、onKey、bindInput、parseHash、
     fit、setMode、scrollToPage、pageInView
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, G, NEXT_KEYS, PREV_KEYS, RMQ, FORCE, $, $$, clamp, esc, el, motion, toast, PAGES } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     复制
     ================================================================= */
  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy'); ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  /* 先用同步的老办法（点击当下就能复制，file:// 下也可用），不行再试剪贴板接口（最多等 1.2 秒） */
  function copyText(text) {
    if (legacyCopy(text)) return Promise.resolve(true);
    if (!navigator.clipboard || !window.isSecureContext) return Promise.resolve(false);
    return Promise.race([
      navigator.clipboard.writeText(text).then(() => true, () => false),
      new Promise(r => setTimeout(() => r(false), 1200)),
    ]);
  }
  function onCopy(node) {
    const text = node.dataset.copy;
    node.blur();
    copyText(text).then(ok => {
      const slide = node.closest('.slide');
      if (slide) copiedTip(node, slide, ok);
      if (!ok) toast(`没能自动复制，请手动选中下面这行：<code>${esc(text)}</code>`, 8000);
    });
  }
  /* 页面上看得见的文字的位置（给「已复制」找不挡字的地方用） */
  function textRects(slide, skip) {
    const out = [], walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const pe = n.parentElement;
      if (!n.nodeValue.trim() || !pe || skip.contains(pe) || pe.closest('.copied-tip,.kid')) continue;
      if (getComputedStyle(pe).visibility === 'hidden') continue;
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width && r.height) out.push(r);
    }
    return out;
  }
  function copiedTip(node, slide, ok) {
    $$('.copied-tip', slide).forEach(t => t.remove());
    // 手账：命令框变绿，小克蹦一下喊「已复制！」（样页 v3-3 的做法）；页上没有小克才放提示框
    const pg0 = PAGES.find(x => x.el === slide);
    if (ok && slide.dataset.scene === 'journal' && pg0 && pg0.kid && !S.reading) {
      node.classList.add('is-copied');
      clearTimeout(node._cpT); node._cpT = setTimeout(() => node.classList.remove('is-copied'), 1800);
      I.kidCheer(pg0.kid, '已复制！');
      return;
    }
    const b = I.boxIn(node, slide);
    const tip = el('span', 'copied-tip' + (ok ? '' : ' fail'), `<svg viewBox="0 0 46 38" aria-hidden="true"><path d="M4 20 C9 24 13 29 17 33 C24 22 32 12 42 4"/></svg><span>${ok ? '已复制' : '复制失败'}</span>`);
    tip.setAttribute('role', 'status');
    slide.appendChild(tip);
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    // 依次试：右边、下方、上方、左边，取第一个不压住页面上文字、也不出画面的位置；都不行就放右边
    const cands = [
      [b.l + b.w + 22, b.t + b.h / 2 - th / 2],
      [b.l + b.w - tw, b.t + b.h + 10],
      [b.l + b.w - tw, b.t - th - 10],
      [b.l - tw - 22, b.t + b.h / 2 - th / 2],
    ];
    const sr = slide.getBoundingClientRect(), k = sr.width / W || 1;
    const texts = textRects(slide, node);
    const fits = ([x, y]) => x >= 10 && y >= 10 && x + tw <= W - 10 && y + th <= H - 10 &&
      !texts.some(r => { const l = (r.left - sr.left) / k, t = (r.top - sr.top) / k, rr = l + r.width / k, bb = t + r.height / k; return x < rr && x + tw > l && y < bb && y + th > t; });
    let [x, y] = cands.find(fits) || cands[0];
    if (x + tw > W - 10) { x = clamp(b.l + b.w - tw, 10, W - tw - 10); y = b.t + b.h + 10; }
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    node.classList.add('is-copied');
    const scene = slide.dataset.scene;
    if (motion()) {
      const tl = G.timeline({ onComplete: () => { tip.remove(); node.classList.remove('is-copied'); } });
      const path = $('path', tip), txt = $('span', tip);
      if (scene === 'desk') tl.fromTo(tip, { autoAlpha: 0, scale: 2.2, rotation: -26 }, { autoAlpha: .92, scale: 1, rotation: -10, duration: .2, ease: 'power3.in' });   // 盖章
      else if (scene === 'journal') tl.fromTo(tip, { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, duration: .22, ease: 'steps(3)' });                     // 像素框一格格弹出
      else {                                                                                                                                                     // 方格纸绿笔、黑板黄粉笔：先打勾，再写「已复制」
        const L = path.getTotalLength() + 2;
        tl.set(tip, { autoAlpha: 1 })
          .fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .26, ease: 'power2.out' })
          .fromTo(txt, { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -5% -20% 0)', duration: .32, ease: scene === 'board' ? 'none' : 'steps(3)' }, '-=.04');
      }
      tl.to(tip, { autoAlpha: 0, duration: .35 }, '+=1.4');
    } else setTimeout(() => { tip.remove(); node.classList.remove('is-copied'); }, 1800);
    // 小克替你高兴一下（手账里还会喊一声）
    const pg = PAGES.find(x => x.el === slide);
    if (ok && pg && pg.kid && !S.reading) I.kidCheer(pg.kid, scene === 'journal' ? '已复制！' : '');
  }

  /* =================================================================
     截图放大
     ================================================================= */
  function openShot(f) {
    const img = $('img', f);
    if (!img || f.classList.contains('missing')) return;
    dom.lb.classList.remove('full');
    $('img', dom.lb).src = img.src;
    $('.lb-cap', dom.lb).textContent = (f.dataset.caption || '') + '　点图片看原尺寸，Esc 关闭';
    dom.lb.hidden = false;
  }
  function closeShot() { dom.lb.hidden = true; dom.lb.classList.remove('full'); }

  /* =================================================================
     输入
     ================================================================= */
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (!dom.lb.hidden) { if (k === 'Escape' || NEXT_KEYS.has(k) || PREV_KEYS.has(k)) { e.preventDefault(); closeShot(); } return; }
    if (S.reading) return;
    const ae = document.activeElement;
    if (ae && ae !== document.body && ae.matches && ae.matches('button,[data-copy],.shot')) ae.blur();
    if (NEXT_KEYS.has(k)) { e.preventDefault(); I.next(); }
    else if (PREV_KEYS.has(k)) { e.preventDefault(); I.prev(); }
    else if (k === 'Home') { e.preventDefault(); I.go(0, 0, { anim: false }); }
    else if (k === 'End') { e.preventDefault(); I.go(PAGES.length - 1, 0, { anim: false }); }
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); }
    else if (k === 's' || k === 'S') I.openPresenter();
    else if (k === 't' || k === 'T') I.toggleTimer();
    else if (k === 'r' || k === 'R') I.resetTimer();
  }
  function bindInput() {
    document.addEventListener('keydown', onKey);
    let tx = null, ty = 0, swiped = false;
    document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; swiped = false; }, { passive: true });
    document.addEventListener('touchend', e => {
      if (tx == null || S.reading) return;
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = true; dx < 0 ? I.next() : I.prev(); }
    });
    document.addEventListener('click', e => {
      const t = e.target;
      if (!dom.lb.hidden) { if (t.tagName === 'IMG') dom.lb.classList.toggle('full'); else closeShot(); return; }
      const cp = t.closest && t.closest('[data-copy]');
      if (cp) { e.preventDefault(); onCopy(cp); return; }
      const sh = t.closest && t.closest('.shot');
      if (sh) { openShot(sh); return; }
      const kd = t.closest && t.closest('.kid-body');   // 点小克：蹦一下，不进拍
      if (kd) {
        const pg = PAGES.find(x => x.kid && x.kid.body === kd);
        if (pg) I.kidCheer(pg.kid, '');
        else if (motion()) G.fromTo(kd, { y: 0 }, { y: -26, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' });
        return;
      }
      if (S.reading) return;
      if (swiped) { swiped = false; return; }
      if (t.closest && t.closest('a,input,textarea,select,summary,.no-advance,#toast')) return;
      if (t.closest && t.closest('button') && !t.closest('#stage')) return;
      I.next();
    });
    window.addEventListener('hashchange', () => { const r = parseHash(); if (r && (r.p !== S.cur.p || r.b !== S.cur.b)) I.go(r.p, r.b, { anim: false }); });
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', () => setTimeout(fit, 200));
    RMQ.addEventListener && RMQ.addEventListener('change', () => { if (!S.reading) { const p = PAGES[S.cur.p]; I.setInstant(p, p.beat); } });
  }
  function parseHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return null;
    let m = h.match(/^(\d+)(?:[/.](\d+))?$/);
    if (m) return { p: +m[1] - 1, b: +(m[2] || 0) };
    m = h.match(/^([^/]+)(?:\/(\d+))?$/);
    if (m) { const i = PAGES.findIndex(p => p.id === m[1]); if (i >= 0) return { p: i, b: +(m[2] || 0) }; }
    return null;
  }

  /* =================================================================
     屏幕适配：横屏等比缩放铺满；窄的竖屏切阅读模式
     ================================================================= */
  function fit() {
    const want = FORCE === 'read' ? true : FORCE === 'show' ? false : innerWidth < innerHeight;
    if (want !== S.reading) setMode(want);
    const vw = document.documentElement.clientWidth || innerWidth, vh = innerHeight;   // 切完模式再量（阅读模式的滚动条会占宽度）
    if (S.reading) {
      const rw = Math.min(vw - 20, 1200);
      document.documentElement.style.setProperty('--rw', rw + 'px');
      document.documentElement.style.setProperty('--rs', rw / W);
      return;
    }
    const s = Math.min(vw / W, vh / H);
    dom.world.style.width = vw / s + 'px'; dom.world.style.height = vh / s + 'px';
    dom.world.style.transform = `scale(${s})`;
    dom.stage.style.left = (vw / s - W) / 2 + 'px';
    dom.stage.style.top = (vh / s - H) / 2 + 'px';
  }
  function setMode(r) {
    I.finishRunning(); I.finishPageTl();
    if (!r && S.reading) S.cur.p = pageInView();
    S.reading = r;
    document.body.classList.toggle('reading', r);
    document.documentElement.classList.toggle('reading', r);
    if (r) {
      PAGES.forEach(p => { p.el.classList.remove('active'); I.clearEl(p.el); I.setInstant(p, p.total); I.callOnBeat(p, p.total, 0); });
      requestAnimationFrame(() => scrollToPage(S.cur.p));
    } else if (S.booted && PAGES.length) {
      PAGES.forEach(p => p.el.classList.remove('active'));
      S.curScene = null;
      I.go(S.cur.p, 0, { anim: false });
    }
  }
  function scrollToPage(i) { const p = PAGES[i]; if (p && i > 0) p.item.scrollIntoView({ block: 'start' }); }
  function pageInView() {
    let best = 0, bd = Infinity;
    PAGES.forEach((p, i) => { const d = Math.abs(p.item.getBoundingClientRect().top); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  Object.assign(I, {
    copyText, onCopy, textRects, copiedTip, openShot, closeShot,
    onKey, bindInput, parseHash, fit, setMode, scrollToPage, pageInView,
  });
})();
