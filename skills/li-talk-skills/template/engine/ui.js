/* =====================================================================
   演示稿引擎 · 交互（ui.js）
   - 复制：copyText（先用同步老办法，再试剪贴板接口）、onCopy、「已复制」提示 copiedTip（找不挡字、不压形象的位置：
     textRects、mascotBoxes；出场用风格的 copied，形象喊话用风格的 mascotSay.copied）
   - 署名：placeSign（最后一页依次试右下、左下、正下，取第一个不压字、不压形象、不进风格禁区的位置；阅读模式里挪到最后一页下面）
   - 看大图：openShot、closeShot
   - 输入：键盘 onKey、触屏滑动、点击翻拍（点到 I.NO_ADVANCE 里的元素不进拍）、点击涟漪 ripple、地址 #页/拍（parseHash、hashchange）
   - 屏幕适配：fit（横屏等比缩放铺满、窄的竖屏切阅读模式）、setMode、scrollToPage、pageInView
   - 依赖总线：core 的常量和工具、I.sc（风格注册表）、I.PAGES、I.state（cur、reading、booted、curScene）、
     I.dom（lb、world、stage）、I.toast；
     build.js 的 I.boxIn；beats.js 的 I.clearEl、I.setInstant、I.callOnBeat、I.finishRunning；
     mascot.js 的 I.mascotCheer、I.mascotClick、I.spotFor；pages.js 的 I.next、I.prev、I.go、I.finishPageTl、I.mountScene；
     presenter.js 的 I.openPresenter、I.toggleTimer、I.resetTimer
   - 挂到总线：copyText、onCopy、textRects、mascotBoxes、copiedTip、placeSign、openShot、closeShot、onKey、bindInput、
     ripple、parseHash、fit、setMode、scrollToPage、pageInView
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
      else if (ok) {   // 不在页面里的可复制元素（阅读模式里挪到最后一页下面的署名）：用提示条说一声
        node.classList.add('is-copied');
        clearTimeout(node._cpT); node._cpT = setTimeout(() => node.classList.remove('is-copied'), 1800);
        toast(`已复制：${esc(text)}`, 2500);
      }
      if (!ok) toast(`没能自动复制，请手动选中下面这行：<code>${esc(text)}</code>`, 8000);
    });
  }
  /* 页面上文字的位置（屏幕坐标的框），给「已复制」、署名找不挡字的地方用。
     skip 里面的文字、形象和复制提示里的字不算；all 为假时只算现在看得见的，
     为真时暂时藏着的也算（没到拍的块、不是当前页）：署名要避开这一页所有拍的文字 */
  function textRects(slide, skip, all) {
    const out = [], walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const pe = n.parentElement;
      if (!n.nodeValue.trim() || !pe || (skip && skip.contains(pe)) || pe.closest('.copied-tip,.mascot')) continue;
      if (!all && getComputedStyle(pe).visibility === 'hidden') continue;
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width && r.height) out.push(r);
    }
    return out;
  }
  /* 屏幕坐标的框换算成页面（舞台 1920×1080）坐标 { l, t, r, b }：sr 是页面的屏幕框，k 是缩放比例 */
  const toStage = (r, sr, k) => ({ l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k });
  /* 页面上形象现在占的地方（页面坐标 { l, t, r, b }）：画像 svg 的外框（含走位、蹦跳的位移），正在说话时加上气泡；
     看不见的形象（没到拍、没有可用的形象）不算 */
  function mascotBoxes(slide, sr, k) {
    const out = [];
    $$('.mascot', slide).forEach(m => {
      const st = m._mascot;
      if (!st || m.hidden || getComputedStyle(m).visibility === 'hidden') return;
      out.push(toStage((st.svg || m).getBoundingClientRect(), sr, k));
      if (st.say && st.say.classList.contains('on')) {
        // 气泡出现时有缩放过渡，直接读外框会读到中间态：按它在形象里的排版位置算（offset 不受缩放影响）
        const er = m.getBoundingClientRect(), s = st.say;
        out.push(toStage({ left: er.left + s.offsetLeft * k, top: er.top + s.offsetTop * k, right: er.left + (s.offsetLeft + s.offsetWidth) * k, bottom: er.top + (s.offsetTop + s.offsetHeight) * k }, sr, k));
      }
    });
    return out;
  }
  /* 形象在这一页每一拍会站的地方（页面坐标）：向导形象按每拍的落脚点算，页面上别的形象按摆放的位置算 */
  function mascotSpots(p) {
    const out = [];
    $$('.mascot', p.el).forEach(m => {
      if (m.hidden) return;
      const b = I.boxIn(m, p.el);
      if (p.mascot && p.mascot.el === m) {
        for (let n = 0; n <= p.total; n++) { const sp = I.spotFor(p, n); out.push({ l: b.l + sp.x, t: b.t + sp.y, r: b.l + sp.x + b.w, b: b.t + sp.y + b.h }); }
      } else out.push({ l: b.l, t: b.t, r: b.l + b.w, b: b.t + b.h });
    });
    return out;
  }
  /* 「已复制」的默认出场：先打勾，再一格格写出「已复制」 */
  function defaultCopied(tl, tip) {
    const path = $('path', tip), txt = $('span', tip);
    const L = path.getTotalLength() + 2;
    tl.set(tip, { autoAlpha: 1 })
      .fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .26, ease: 'power2.out' })
      .fromTo(txt, { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -5% -20% 0)', duration: .32, ease: 'steps(3)' }, '-=.04');
  }
  /* 复制后的反馈。风格可以定制两处：
     - copied(ctx)：「已复制」提示框怎么出场，ctx = { tl, tip, node, ok }，往 tl 里加动画；没写用默认的打勾
     - mascotSay.copied：形象的口头禅；写了的话，复制成功且页上有形象时由形象喊这句，不再放提示框 */
  function copiedTip(node, slide, ok) {
    $$('.copied-tip', slide).forEach(t => t.remove());
    const pg = PAGES.find(x => x.el === slide);
    const sc = I.sc(pg ? pg.scene : slide.dataset.scene);
    const cheer = ok && pg && pg.mascot && !S.reading;
    const say = sc.mascotSay && sc.mascotSay.copied ? String(sc.mascotSay.copied) : '';
    if (cheer && say) {
      node.classList.add('is-copied');
      clearTimeout(node._cpT); node._cpT = setTimeout(() => node.classList.remove('is-copied'), 1800);
      I.mascotCheer(pg.mascot, say);
      return;
    }
    const b = I.boxIn(node, slide);
    const tip = el('span', 'copied-tip' + (ok ? '' : ' fail'), `<svg viewBox="0 0 46 38" aria-hidden="true"><path d="M4 20 C9 24 13 29 17 33 C24 22 32 12 42 4"/></svg><span>${ok ? '已复制' : '复制失败'}</span>`);
    tip.setAttribute('role', 'status');
    slide.appendChild(tip);
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    // 依次试：右边、下方、上方、左边，取第一个不压住页面上的文字和形象（含气泡）、也不出画面的位置；都不行就放右边
    const cands = [
      [b.l + b.w + 22, b.t + b.h / 2 - th / 2],
      [b.l + b.w - tw, b.t + b.h + 10],
      [b.l + b.w - tw, b.t - th - 10],
      [b.l - tw - 22, b.t + b.h / 2 - th / 2],
    ];
    const sr = slide.getBoundingClientRect(), k = sr.width / W || 1;
    const avoid = textRects(slide, node).map(r => toStage(r, sr, k)).concat(mascotBoxes(slide, sr, k));
    const fits = ([x, y]) => x >= 10 && y >= 10 && x + tw <= W - 10 && y + th <= H - 10 &&
      !avoid.some(r => x < r.r && x + tw > r.l && y < r.b && y + th > r.t);
    let [x, y] = cands.find(fits) || cands[0];
    if (x + tw > W - 10) { x = clamp(b.l + b.w - tw, 10, W - tw - 10); y = b.t + b.h + 10; }
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    node.classList.add('is-copied');
    if (motion()) {
      const tl = G.timeline({ onComplete: () => { tip.remove(); node.classList.remove('is-copied'); } });
      let custom = false;
      if (typeof sc.copied === 'function') {
        try { sc.copied({ tl, tip, node, ok }); custom = true; }
        catch (e) { console.error(`[Deck] 风格 ${sc.key} 的 copied 出错，改用默认的打勾：`, e); tl.clear(); }
      }
      if (!custom) defaultCopied(tl, tip);
      tl.to(tip, { autoAlpha: 0, duration: .35 }, '+=1.4');
    } else setTimeout(() => { tip.remove(); node.classList.remove('is-copied'); }, 1800);
    // 形象替你高兴一下
    if (cheer) I.mascotCheer(pg.mascot, '');
  }

  /* =================================================================
     署名（设计文档 5.4）：最后一页由引擎自动加上（build.js 的 addSign），这里找位置
     - 依次试右下（离右边 64、底边 44）、左下（离左边 64）、正下，取第一个不压住这一页文字（所有拍的）、
       不压形象（向导形象每一拍的落脚点）、不进当前风格禁区（zones）的位置；
       都不行就放右下，并给一条 [Deck] 提醒（自检会把它记成提醒）
     - 启动时字体加载完、缩放定下来后量一次，结果记在 I.state.signAt；
       阅读模式里页面缩得太小，署名挪到最后一页的下面（.r-item 里、页面框后面），回到演示模式再放回页里
     ================================================================= */
  const SIGN = { side: 64, bottom: 44, pad: 8 };   // pad：和文字、形象之间至少留的空（页面坐标 px）
  function placeSign() {
    const sg = dom.sign, p = PAGES[PAGES.length - 1];
    if (!sg || !p) return;
    if (!S.signAt) {
      if (sg.parentNode !== p.el) p.el.appendChild(sg);
      const tw = sg.offsetWidth, th = sg.offsetHeight, y = H - SIGN.bottom - th;
      const cands = [['right', W - SIGN.side - tw], ['left', SIGN.side], ['center', Math.round((W - tw) / 2)]];
      const sr = p.el.getBoundingClientRect(), k = sr.width / W || 1;
      const zones = (I.sc(p.scene).zones || []).filter(z => z && typeof z === 'object').map(z => ({ l: +z.x || 0, t: +z.y || 0, r: (+z.x || 0) + (+z.w || 0), b: (+z.y || 0) + (+z.h || 0) }));
      const avoid = textRects(p.el, sg, true).map(r => toStage(r, sr, k)).concat(mascotSpots(p), zones);
      const d = SIGN.pad;
      const hit = (x, yy) => avoid.some(r => x - d < r.r && x + tw + d > r.l && yy - d < r.b && yy + th + d > r.t);
      // 底部被风格的禁区占满时（比如黑板的粉笔槽），再试紧贴禁区上沿的那一行
      const ys = [y];
      zones.forEach(z => { if (z.t > H * .6 && z.t < y + th + d) ys.push(Math.round(z.t - d - th - 8)); });
      let c = null;
      for (const yy of ys) {
        const f = cands.find(([, x]) => !hit(x, yy));
        if (f) { c = [f[0], f[1], yy]; break; }
      }
      if (!c) {
        c = [cands[0][0], cands[0][1], y];
        I.warn(`页面 ${p.id}（最后一页）：署名放在右下、左下、正下都会压住页面上的文字或形象，先放在右下角。请把这一页底部的内容往上挪，给署名留出约 ${Math.ceil(th + SIGN.bottom + d)}px 高的一条`);
      }
      S.signAt = { x: c[1], y: c[2], at: c[0] };
      sg.style.left = c[1] + 'px'; sg.style.top = c[2] + 'px';
      sg.dataset.at = c[0];
    }
    if (S.reading) { const fr = p.el.parentNode; if (sg.parentNode !== p.item) p.item.insertBefore(sg, fr.nextSibling); }
    else if (sg.parentNode !== p.el) p.el.appendChild(sg);
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
      if (!t || !t.closest) return;
      // 先处理有自己反应的元素（都不进拍）：复制、看大图、点形象
      const cp = t.closest('[data-copy]');
      if (cp) {
        // 署名带着真链接：按住 Ctrl / ⌘ / Shift 点照常在新窗口打开；平常点一下是复制（拦下跳转）
        if (cp.classList.contains('li-sign') && (e.ctrlKey || e.metaKey || e.shiftKey)) return;
        e.preventDefault(); onCopy(cp); return;
      }
      const sh = t.closest('.shot');
      if (sh) { openShot(sh); return; }
      const mb = t.closest('.mascot-body');   // 点形象：轮换「蹦一下 / 转一圈 / 压扁回弹」，不进拍
      if (mb) { I.mascotClick(mb); return; }
      if (S.reading) return;
      if (swiped) { swiped = false; return; }
      if (t.closest(I.NO_ADVANCE)) return;      // 链接、视频、表单、按钮、展开详情、data-noclick……点了不进拍
      // 点空白和普通内容进一拍；真的进了拍，就在被点的那一页上出一个涟漪
      const p0 = PAGES[S.cur.p], was = S.cur.p + '/' + S.cur.b;
      I.next();
      if (S.cur.p + '/' + S.cur.b !== was) ripple(e, p0);
    });
    window.addEventListener('hashchange', () => { const r = parseHash(); if (r && (r.p !== S.cur.p || r.b !== S.cur.b)) I.go(r.p, r.b, { anim: false }); });
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', () => setTimeout(fit, 200));
    RMQ.addEventListener && RMQ.addEventListener('change', () => { if (!S.reading) { const p = PAGES[S.cur.p]; I.setInstant(p, p.beat); } });
  }
  /* 点击涟漪（接口约定 B 的 ripple）：点击引起进拍时调用被点那一页风格的 ripple(x, y, layer)。
     x、y 是舞台坐标（1920×1080，已除掉缩放），layer 是那一页的 .ripple-layer（铺满页面、压在所有内容下面、不接收指针）；
     风格往 layer 里放元素、播完自己删掉。减少动态时、键盘触发的点击（e.detail 为 0）、点在舞台外面的留白里时不调用 */
  function ripple(e, p) {
    if (!p || !motion() || !e.detail) return;
    const sc = I.sc(p.scene);
    if (typeof sc.ripple !== 'function') return;
    const layer = $(':scope > .ripple-layer', p.el);
    if (!layer) return;
    const r = dom.stage.getBoundingClientRect(), k = r.width / W || 1;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    if (x < 0 || y < 0 || x > W || y > H) return;
    I.hook(sc, 'ripple', Math.round(x), Math.round(y), layer);
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
    if (S.signAt) placeSign();   // 署名跟着换地方（阅读模式在最后一页下面，演示模式在页里）；启动时第一次量由 boot 调
    if (r) {
      // 阅读模式下没有「当前风格」：卸下风格挂的监听和元素；舞台也去掉 data-scene，
      // 免得 [data-scene="…"] .card 这类规则经由舞台套到别的风格的页上（每页只认自己的风格）
      I.mountScene(null);
      if (S.sceneTl) { const t = S.sceneTl; S.sceneTl = null; t.progress(1); t.kill(); }
      S.curScene = null; delete dom.stage.dataset.scene;
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
    copyText, onCopy, textRects, mascotBoxes, copiedTip, placeSign, openShot, closeShot,
    onKey, bindInput, ripple, parseHash, fit, setMode, scrollToPage, pageInView,
  });
})();
