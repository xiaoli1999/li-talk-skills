/* =====================================================================
   风格 · 液态玻璃 glass（现代家，浅色底）
   - 样子：柔和静止的彩色光斑底（薄荷水色、长春花蓝、杏色、一抹淡紫，加两颗光亮的小球，折射靠它们看得出来）；
     卡片、步骤、小格、终端、截图位都是透明而厚的玻璃：边缘折光、顶边一线亮、下沿内侧的暗部显出厚度、大圆角，
     竖排的步骤是一块块胶囊；出场时玻璃从一颗液滴流开、果冻似地回弹。字用系统黑体，命令用等宽字；
     强调色只有一个海蓝 #2B5CFF，只给重点词和可点的东西
   - 和毛玻璃 frost 拉开：毛玻璃是薄的磨砂白卡片、重模糊；液态玻璃几乎不模糊，靠边缘折射和厚度
   - 适合讲：产品、界面、设计、科技类，每页信息不多。不适合：长文字、大表格、元素很密的页
   - 默认形象：透透 toutou（一颗透亮的玻璃小液滴，和页面上的玻璃是同一种材料）
   - 从定稿样页（05 液态玻璃）搬来的效果，以及改成对任意页面都成立的写法：
     1. 背景：静止的柔边光斑和两颗小球。样页写死在舞台上；这里由 backdrop 放进铺满窗口的背景层，
        按舞台坐标放、伸出舞台照样显示；阅读模式里每页用 glass.css 的 --scene-bg 画同样的光斑
     2. 厚玻璃：样页每块玻璃手写了一层 .glass；这里由 decorate 给每页的卡片、小格、步骤每一项、终端、截图位、
        主题行插一层 <gl-glass>（垫在字下面），节拍胶囊的那层在 mount 时插进去。页面不用多写任何标记
     3. 折射：样页的做法原样搬来——按每块玻璃的尺寸画一张位移图（边缘一圈朝里偏、中间平），
        feDisplacementMap 把玻璃背后的光斑和小球折弯，写成 backdrop-filter:url(#…)。只有 Chromium 支持，
        别的浏览器、地址带 ?flat、自检模式都走降级样子（轻模糊 + 加宽的边缘光，见 glass.css）；
        滤镜在 mount 时按尺寸生成（同样大小的共用一个），unmount（含进阅读模式）时摘掉
     4. 帧率保护：样页「前两次出场量帧率」照搬到这里——前两次玻璃出场时量 0.9 秒的帧间隔，
        中位数超过 36ms（掉到 28 帧以下）就摘掉折射，退回降级样子（引擎没有统一的帧率保护）
     5. 出场「液滴流开」（fx.pour）：玻璃层先在左端冒出一颗液滴（圆角从椭圆收成组件的圆角），
        向右流开、压扁、果冻似地回弹；里面的字顺着流向从左滑进来，步骤序号像水珠一样弹出来。
        一排卡片的容器（.grid、.cells、.steps、.vs……）整拍出场时，里面的玻璃依次流开。
        只动玻璃层、不动组件本身的透明度：祖先的 opacity 会截断 backdrop-filter，玻璃就没了折射
     6. 文字「浮上来」（fx.float，默认出场和大标题的出场）：从下面浮上来（样页标题、解释句的做法）；
        元素里有玻璃时自动改走「液滴流开」
     7. 「果冻弹出」（fx.jelly）：命令按钮、标签从左端被拉出来、弹两下站稳（样页命令按钮的做法）
     8. 重点词：被一枚小玻璃胶囊包住，字像在透镜下放大一点、变蓝，胶囊果冻般弹开、一道反光扫过。
        样页用脚本推动；这里全写在 glass.css 里，跟着引擎本来就会推的 --k 走
     9. 退一拍（onBack）：字往左退淡，玻璃压一下、向左收回成液滴，再缩小消失（样页的 leave）
     10. 悬停：玻璃轻轻浮起，一团柔光跟着鼠标在玻璃里走，边缘那一圈也在鼠标附近亮起来
         （mount 时在舞台上挂 pointermove，写组件的 --mx --my）；命令按钮的柔光同样跟着鼠标
     11. 节拍指示：玻璃胶囊里一排小圆点，当前那颗点上停着一颗放大镜似的小液滴，换拍时拉长滑过去、到位回弹
         （mount 时放进节拍胶囊，盯着节拍格的变化摆位置）；降级时当前那颗点放大一点代替
     12. 「已复制」（copied）：命令按钮像果冻一样被按一下，一颗小液滴从靠命令的那一端被拉出来、长成小胶囊，打勾
     13. 开场（intro）：光斑淡入 → 主题行、节拍胶囊像水珠一样弹开 → 大标题、第 0 拍浮上来 → 重点词的胶囊弹开
     14. 点击处一圈很淡的水纹（ripple）；翻页（pageTurn）：旧页上收淡出，新页从下面浮上来
   - 没搬的：背景随鼠标视差（这一版不做）；透透的走位、反应、空闲动作和打盹（引擎的形象部分统一做）
   - 自己加的出场名：pour、float、jelly，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题胶囊（x 120 起，宽到 1260，y 20–76，按 y 18–78 算）
     · 右上角页码和节拍胶囊（.meta 在这里改到 top 20，胶囊高 56：y 20–76；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 14–82）
   - 样子在 glass.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const NS = 'http://www.w3.org/2000/svg';
  const QS = new URLSearchParams(location.search);
  const motion = () => !!(G && window.Deck && Deck.motion);

  /* 有玻璃层的组件；SKIP 是出场时不跟着动的子元素 */
  const GLASS = '.card, .cell, .term, .shot, .steps > li';
  const HOVER = GLASS + ', .copy';
  const SKIP = 'gl-glass, svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
  const JELLY = '.copy, .tag';

  const layerOf = e => (e && e.querySelector ? e.querySelector(':scope > gl-glass') : null);
  const isGlass = e => !!layerOf(e);
  const glassIn = e => !!(e && e.querySelector && e.querySelector('gl-glass'));
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
  const transparentOf = c => { const m = String(c).match(/[\d.]+/g); return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},0)` : 'rgba(0,0,0,0)'; };
  const unclear = (e, keys) => keys.forEach(k => e.style.removeProperty(k));
  /* 节拍单元本身：清掉出场留下的内联样式（连同 gsap 记着的变换），回到 CSS 决定的样子 */
  const clean = e => { if (G) G.set(e, { clearProps: 'transform,opacity,visibility' }); unclear(e, ['transform-origin', 'color', '--gl-in']); };
  /* 子元素不归引擎管：动画前记下原来的行内样式，播完原样还原 */
  const keep = e => { const s = e.getAttribute('style'); return () => { if (G) G.set(e, { clearProps: 'transform' }); if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  const resetLayer = g => { if (G) G.set(g, { clearProps: 'transform,opacity' }); unclear(g, ['transform-origin', '--gl-rx', '--gl-ry']); };
  /* 玻璃的圆角：组件的 --gl-r，不超过短边的一半（胶囊写成 999px） */
  function radiusOf(g, W, H) {
    const r = parseFloat(getComputedStyle(g).borderTopLeftRadius) || 0;
    return Math.max(0, Math.min(r, W / 2, H / 2));
  }

  /* =================================================================
     折射滤镜（样页的做法）：给每块玻璃画一张同尺寸的「位移图」（R 通道管横向、G 通道管纵向，128 为不动），
     边缘一圈朝里偏、中间平；feDisplacementMap 按它把玻璃背后的画面挪一挪，边缘就像厚玻璃一样把背景折弯。
     背后只有柔和的光斑和两颗边缘清楚的小球，没有细碎纹理，折出来是干净的弯弧
     ================================================================= */
  const UA = navigator.userAgent;
  const CHROMIUM = /\b(Chrome|Chromium)\/\d+/.test(UA) && !/\b(CriOS|FxiOS)\b/.test(UA);
  const LENS_OK = !QS.has('flat') && !QS.has('selftest') && CHROMIUM && !!(window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#a)'));
  const svgURI = s => 'data:image/svg+xml,' + encodeURIComponent(s.replace(/\s*\n\s*/g, ' '));
  const f4 = n => n.toFixed(4);
  // 边缘折射图：r 圆角、rim 折射带宽度、soft 折射带向内过渡的柔度
  function rimMap(W, H, r, rim, soft) {
    const fx = Math.min(r / W, .5), fy = Math.min(r / H, .5);
    return svgURI(`<svg xmlns="${NS}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="x" x2="1" y2="0"><stop offset="0" stop-color="#f00"/><stop offset="${f4(fx)}" stop-color="#800000"/><stop offset="${f4(1 - fx)}" stop-color="#800000"/><stop offset="1" stop-color="#000"/></linearGradient>
        <linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="${f4(fy)}" stop-color="#008000"/><stop offset="${f4(1 - fy)}" stop-color="#008000"/><stop offset="1" stop-color="#000"/></linearGradient>
        <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${soft}"/></filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#x)"/>
      <rect width="${W}" height="${H}" fill="url(#y)" style="mix-blend-mode:screen"/>
      <rect x="${rim}" y="${rim}" width="${Math.max(0, W - 2 * rim)}" height="${Math.max(0, H - 2 * rim)}" rx="${Math.max(0, r - rim)}" fill="#808080" filter="url(#b)"/>
    </svg>`);
  }
  // 放大镜图：整块线性展开，背后的东西被放大（节拍胶囊上那颗小液滴用）
  function magnifyMap(W, H) {
    return svgURI(`<svg xmlns="${NS}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="x" x2="1" y2="0"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient>
        <linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="1" stop-color="#000"/></linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#x)"/>
      <rect width="${W}" height="${H}" fill="url(#y)" style="mix-blend-mode:screen"/>
    </svg>`);
  }
  /* 按尺寸定参数：矮的（胶囊、主题行、节拍胶囊）折射带窄、折得轻；高的（卡片、步骤）折射带宽、折得重。
     样页的两组参数：140px 高的胶囊 rim 26 / soft 16 / scale 42，56px 高的胶囊 rim 12 / soft 6 / scale 26 */
  function lensParams(W, H, r) {
    const m = Math.min(W, H);
    if (m <= 80) { const rim = Math.max(8, Math.round(m * .21)); return { map: rimMap(W, H, r, rim, Math.round(rim / 2)), scale: Math.max(14, Math.min(30, Math.round(m * .46))), blur: 1.2, sat: 1.45 }; }
    const rim = Math.max(18, Math.min(30, Math.round(m * .19)));
    return { map: rimMap(W, H, r, rim, Math.round(rim * .62)), scale: Math.max(30, Math.min(46, Math.round(m * .3))), blur: 1.2, sat: 1.45 };
  }

  let lensDefs = null, lensStyle = null, lensRO = null, lensSeq = 0, lensOn = false, lensDropped = false;
  const lensIds = new Map();     // 尺寸 → 滤镜 id（同样大小的玻璃共用一个）
  const lensRules = [];
  function makeFilter(W, H, k) {
    if (!lensDefs) {
      lensDefs = document.createElementNS(NS, 'svg');
      lensDefs.setAttribute('class', 'gl-lens-defs'); lensDefs.setAttribute('aria-hidden', 'true');
      lensDefs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      lensDefs.appendChild(document.createElementNS(NS, 'defs'));
      document.body.appendChild(lensDefs);
    }
    const id = 'gl-lens-' + (++lensSeq);
    const f = document.createElementNS(NS, 'filter');
    [['id', id], ['x', 0], ['y', 0], ['width', '100%'], ['height', '100%'], ['color-interpolation-filters', 'sRGB']].forEach(([a, v]) => f.setAttribute(a, v));
    const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([a, v]) => n.setAttribute(a, v)); f.appendChild(n); return n; };
    const img = add('feImage', { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none', result: 'map' });
    img.setAttribute('href', k.map); img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', k.map);
    add('feGaussianBlur', { in: 'map', stdDeviation: 2, result: 'mapS' });   // 抹掉渐变抖动带来的毛边
    add('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: k.blur, result: 'soft' });
    add('feDisplacementMap', { in: 'soft', in2: 'mapS', scale: k.scale, xChannelSelector: 'R', yChannelSelector: 'G', result: 'bent' });
    add('feColorMatrix', { in: 'bent', type: 'saturate', values: k.sat });
    lensDefs.firstChild.appendChild(f);
    return id;
  }
  function addRule(sel, id) {
    lensRules.push(`${sel}{-webkit-backdrop-filter:url(#${id});backdrop-filter:url(#${id});box-shadow:var(--gl-shadow)}`);
    if (lensStyle) lensStyle.textContent = lensRules.join('\n');
  }
  /* 给一块玻璃层配上合尺寸的折射滤镜（量不到尺寸的先不管，下次再配） */
  function lensFor(g) {
    if (!lensOn || !g) return;
    const W = Math.round(g.offsetWidth), H = Math.round(g.offsetHeight);
    if (W < 8 || H < 8) return;
    const r = Math.round(radiusOf(g, W, H)), key = `${W}x${H}r${r}`;
    let id = lensIds.get(key);
    if (!id) {
      id = makeFilter(W, H, lensParams(W, H, r));
      lensIds.set(key, id);
      addRule(`[data-scene="glass"] gl-glass[data-gl="${id}"]`, id);
    }
    if (g.dataset.gl !== id) g.dataset.gl = id;
  }
  function lensStart(stage) {
    if (!LENS_OK || lensDropped) return;
    lensOn = true;
    if (!lensIds.has('drop')) {
      lensIds.set('drop', makeFilter(52, 40, { map: magnifyMap(52, 40), scale: 13, blur: 0, sat: 1.25 }));
      addRule('#stage[data-scene="glass"] .gl-drop', lensIds.get('drop'));
      // 有放大镜液滴时，当前那颗点不用再放大
      lensRules.push('#stage[data-scene="glass"] .dots i.now{scale:1}');
    }
    lensStyle = document.createElement('style');
    lensStyle.className = 'gl-lens-css';
    lensStyle.textContent = lensRules.join('\n');
    document.head.appendChild(lensStyle);
    // 尺寸变了（比如散落的小格归位后变宽）就换一个合尺寸的滤镜：位移图和玻璃不一样大，多出来的那块会被挪歪
    const glasses = stage.querySelectorAll('.slide[data-scene="glass"] gl-glass');
    if (window.ResizeObserver) { lensRO = new ResizeObserver(list => list.forEach(en => lensFor(en.target))); glasses.forEach(g => lensRO.observe(g)); }
    else glasses.forEach(lensFor);
  }
  function lensStop() {
    lensOn = false;
    if (lensRO) { lensRO.disconnect(); lensRO = null; }
    if (lensStyle) { lensStyle.remove(); lensStyle = null; }
  }
  /* 帧率保护：前两次玻璃出场时量 0.9 秒的帧间隔，中位数超过 36ms（掉到 28 帧以下）就摘掉折射，这份课件之后都用降级样子。
     0.9 秒里连 6 帧都没画出来（慢到样页的判断量不出来）也算太慢；量的途中页面被切到后台的不算数 */
  let frameChecks = 0, measuring = false;
  function guard() {
    if (!lensOn || lensDropped || measuring || frameChecks >= 2 || !motion() || document.hidden) return;
    frameChecks++; measuring = true;
    const d = [], t0 = performance.now();
    let last = 0, away = false;
    const onHide = () => { away = true; };
    document.addEventListener('visibilitychange', onHide);
    const loop = t => {
      if (last) d.push(t - last);
      last = t;
      if (t - t0 < 900) { requestAnimationFrame(loop); return; }
      measuring = false;
      document.removeEventListener('visibilitychange', onHide);
      if (away || document.hidden) { frameChecks--; return; }
      d.sort((a, b) => a - b);
      if (d.length < 6 || d[d.length >> 1] > 36) { lensDropped = true; lensStop(); console.info('[液态玻璃] 这台电脑上折射太吃力，已改用轻模糊'); }
    };
    requestAnimationFrame(loop);
  }

  /* =================================================================
     出场
     ================================================================= */
  /* 液滴流开（一块玻璃）：玻璃层在左端冒出一颗液滴 → 向右流开（圆角从椭圆收成组件的圆角）→ 压扁、果冻回弹；
     字顺着流向从左滑进来，伪元素装饰（序号、小圆点）像水珠一样弹出来。返回内容落位的时刻（重点词接在它后面） */
  function pourOne(tl, e, t) {
    const g = layerOf(e);
    const W = g.offsetWidth || e.offsetWidth || 1, H = g.offsetHeight || e.offsetHeight || 1;
    const m = Math.min(W, H), d = m * .62, sx = d / W, sy = d / H, R = radiusOf(g, W, H);
    const squash = Math.max(.84, 1 - 22 / H), stretch = 1 + Math.min(.025, 14 / W);
    const off = () => resetLayer(g);
    tl.fromTo(g, { opacity: 0, scaleX: sx * .4, scaleY: sy * .4, y: -26, transformOrigin: `${m / 2}px 50%`, '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px' },
      { opacity: 1, scaleX: sx, scaleY: sy, y: 0, duration: .22, ease: 'back.out(2.2)', immediateRender: true }, t)
      .to(g, { scaleX: stretch, duration: .44, ease: 'power3.out' }, t + .18)
      .to(g, { '--gl-rx': R + 'px', '--gl-ry': R + 'px', duration: .4, ease: 'power2.out' }, t + .18)
      .to(g, { scaleY: squash, duration: .2, ease: 'power2.out' }, t + .18)
      .to(g, { scaleY: 1, duration: .66, ease: 'elastic.out(1.1,.32)' }, t + .38)
      .to(g, { scaleX: 1, duration: .5, ease: 'elastic.out(1,.36)', onComplete: off, onInterrupt: off }, t + .62);
    const offIn = () => e.style.removeProperty('--gl-in');
    tl.fromTo(e, { '--gl-in': 0 }, { '--gl-in': 1, duration: .5, ease: 'back.out(2.4)', immediateRender: true, onComplete: offIn, onInterrupt: offIn }, t + .22);
    let end = .72;
    kidsOf(e).forEach((c, i) => {
      const back = keep(c), s = .3 + i * .07;
      tl.fromTo(c, { opacity: 0, x: -26 }, { opacity: 1, x: 0, duration: .42, ease: 'power3.out', immediateRender: true, onComplete: back, onInterrupt: back }, t + s);
      end = Math.max(end, s + .3);
    });
    if (hasText(e)) {   // 直接写在组件里的字：字色从透明到原色
      const own = e.style.color, c = getComputedStyle(e).color, put = () => { e.style.color = own; };
      tl.fromTo(e, { color: transparentOf(c) }, { color: c, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: put, onInterrupt: put }, t + .3);
    }
    return Math.min(end, .95);
  }
  /* 文字浮上来。vis 为真时连 visibility 一起管（节拍单元本身），否则只动 opacity（子元素） */
  function floatIn(tl, e, t, vis) {
    if (e instanceof SVGElement) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e) }, t);
      return .4;
    }
    const big = e.matches('.s-title, .quote') || parseFloat(getComputedStyle(e).fontSize) >= 60;
    const dur = big ? .6 : .55, back = vis ? () => clean(e) : keep(e);
    const from = { y: big ? 28 : 20 }, to = { y: 0, duration: dur, ease: 'power3.out', immediateRender: true, onComplete: back, onInterrupt: back };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    return dur;
  }
  /* 果冻弹出：从左端被拉出来、弹两下站稳（命令按钮、标签） */
  function jellyIn(tl, e, t, vis) {
    const back = vis ? () => clean(e) : keep(e);
    const from = { scaleX: .4, scaleY: .7, transformOrigin: '0% 50%' }, to = { scaleX: 1, scaleY: 1, duration: .6, ease: 'elastic.out(1,.48)', immediateRender: true, onComplete: back, onInterrupt: back };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    return .45;
  }
  /* 装着玻璃的容器：容器本身不变透明（会截断折射），伪元素装饰弹出来，里面的东西依次出场 */
  function pourBox(tl, e, t) {
    const offIn = () => e.style.removeProperty('--gl-in');
    tl.fromTo(e, { '--gl-in': 0 }, { '--gl-in': 1, duration: .5, ease: 'back.out(2.4)', immediateRender: true, onComplete: offIn, onInterrupt: offIn }, t + .2);
    let end = .3;
    kidsOf(e).forEach((c, i) => { const s = .04 + i * .12; end = Math.max(end, s + enterKid(tl, c, t + s)); });
    if (hasText(e)) {
      const own = e.style.color, c = getComputedStyle(e).color, put = () => { e.style.color = own; };
      tl.fromTo(e, { color: transparentOf(c) }, { color: c, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: put, onInterrupt: put }, t);
    }
    return Math.min(end, 1.1);
  }
  function enterKid(tl, c, t) {
    if (isGlass(c)) return pourOne(tl, c, t);
    if (glassIn(c)) return pourBox(tl, c, t);
    if (c.matches(JELLY)) return jellyIn(tl, c, t, false);
    return floatIn(tl, c, t, false);
  }
  /* 液滴流开（节拍单元）：有玻璃的走玻璃，命令和标签果冻弹出，其余文字浮上来 */
  function pour(tl, e, t) {
    guard();
    if (e instanceof SVGElement) return floatIn(tl, e, t, true);
    if (isGlass(e)) return pourOne(tl, e, t);
    if (glassIn(e)) return pourBox(tl, e, t);
    if (e.matches(JELLY)) return jellyIn(tl, e, t, true);
    return floatIn(tl, e, t, true);
  }

  const FX = {
    // 浮上来（默认出场、大标题的出场）：元素里有玻璃时自动改走液滴流开
    float(tl, e, t) { return glassIn(e) ? pour(tl, e, t) : floatIn(tl, e, t, true); },
    // 液滴流开
    pour(tl, e, t) { return pour(tl, e, t); },
    // 果冻弹出
    jelly(tl, e, t) { return glassIn(e) ? pour(tl, e, t) : jellyIn(tl, e, t, true); },
  };
  const BY = { card: 'pour', cell: 'pour', term: 'pour', shot: 'pour', steps: 'pour', cells: 'pour', grid: 'pour', vs: 'pour', copy: 'jelly', tag: 'jelly' };
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 float） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const pick = name && FX[name] ? name : Object.keys(BY).find(c => e.classList.contains(c));
    return (FX[pick ? (BY[pick] || pick) : 'float'] || FX.float)(tl, e, t);
  }

  /* 退一拍里一块玻璃：字往左退淡，玻璃压一下、向左收回成液滴，再缩小消失（样页的 leave） */
  function drain(tl, c, t0, after) {
    const g = layerOf(c);
    const W = g.offsetWidth || 1, H = g.offsetHeight || 1;
    const m = Math.min(W, H), d = m * .62, sx = d / W, sy = d / H, R = radiusOf(g, W, H);
    const kids = kidsOf(c), backs = kids.map(keep);
    tl.set(g, { transformOrigin: `${m / 2}px 50%`, '--gl-rx': R + 'px', '--gl-ry': R + 'px' }, t0)
      .to(g, { scaleX: 1.015, scaleY: Math.max(.86, 1 - 19 / H), duration: .12, ease: 'power2.out' }, t0 + .06)
      .to(g, { scaleX: sx, scaleY: sy, '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px', duration: .28, ease: 'power3.in' }, t0 + .18)
      .to(g, { opacity: 0, scaleX: sx * .4, scaleY: sy * .4, y: -18, duration: .12, ease: 'power2.in' }, t0 + .44)
      .to(c, { '--gl-in': 0, duration: .18, ease: 'power2.in' }, t0);
    if (kids.length) tl.to(kids, { opacity: 0, x: -20, duration: .2, ease: 'power2.in', stagger: .035 }, t0);
    tl.call(() => { resetLayer(g); backs.forEach(f => f()); c.style.removeProperty('--gl-in'); }, null, after);
  }

  /* =================================================================
     悬停：柔光跟着鼠标走——写进鼠标下面那个组件（和它外面的组件）的 --mx --my，每帧最多写一次
     ================================================================= */
  let onMove = null, raf = 0, last = null;
  function track() {
    raf = 0;
    const ev = last; last = null;
    if (!ev || !ev.target || !ev.target.closest) return;
    for (let n = ev.target.closest(HOVER); n; n = n.parentElement && n.parentElement.closest(HOVER)) {
      if (!n.closest('.slide[data-scene="glass"]')) return;
      const r = n.getBoundingClientRect(), k = (r.width / (n.offsetWidth || r.width)) || 1;
      n.style.setProperty('--mx', ((ev.clientX - r.left) / k).toFixed(1) + 'px');
      n.style.setProperty('--my', ((ev.clientY - r.top) / k).toFixed(1) + 'px');
    }
  }

  /* =================================================================
     节拍胶囊：插一层玻璃和一颗放大镜小液滴；节拍格一变（引擎改 .on / .now、重画点、改拍号），液滴滑到当前那颗点上
     ================================================================= */
  let meterEls = null, meterObs = null, dropOn = false;
  function meterMount(stage) {
    const meter = stage.querySelector('.chrome .meter');
    if (!meter) return;
    const g = document.createElement('gl-glass'); g.setAttribute('aria-hidden', 'true');
    const drop = document.createElement('i'); drop.className = 'gl-drop'; drop.setAttribute('aria-hidden', 'true');
    meter.prepend(g); meter.appendChild(drop);
    if (lensRO) lensRO.observe(g);   // 拍数、拍号一变胶囊就变宽变窄，折射滤镜跟着换
    meterEls = { stage, meter, g, drop };
    dropOn = false;
    meterObs = new MutationObserver(() => placeDrop(false));
    const dots = meter.querySelector('.dots'), mnum = meter.querySelector('.mnum');
    if (dots) meterObs.observe(dots, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    if (mnum) meterObs.observe(mnum, { childList: true });
    meterObs.observe(meter, { attributes: true, attributeFilter: ['hidden'] });
    meterObs.observe(stage, { attributes: true, attributeFilter: ['data-scene'] });   // 舞台换成这个风格后样子才生效，再量一次
    requestAnimationFrame(() => placeDrop(true));
  }
  function meterUnmount() {
    if (meterObs) meterObs.disconnect();
    meterObs = null;
    if (meterEls) { if (G) G.killTweensOf(meterEls.drop); meterEls.g.remove(); meterEls.drop.remove(); }
    meterEls = null;
  }
  function placeDrop(instant) {
    if (!meterEls) return;
    const { stage, meter, g, drop } = meterEls;
    if (stage.dataset.scene !== 'glass') return;
    lensFor(g);
    const now = meter.querySelector('.dots i.now');
    const quick = instant || !motion();
    if (!now || meter.hidden) {
      if (G) { G.killTweensOf(drop); if (quick || !dropOn) G.set(drop, { opacity: 0, scale: 0 }); else G.to(drop, { opacity: 0, scale: 0, duration: .28, ease: 'back.in(2)' }); }
      dropOn = false;
      return;
    }
    // 用屏幕上的位置换算（不依赖 offsetParent）：点的中心减去胶囊左上角，再除以缩放
    const mr = meter.getBoundingClientRect(), nr = now.getBoundingClientRect(), k = (mr.width / (meter.offsetWidth || mr.width)) || 1;
    if (!mr.width || !nr.width) return;
    const x = (nr.left + nr.width / 2 - mr.left) / k - drop.offsetWidth / 2;
    const y = (nr.top + nr.height / 2 - mr.top) / k - drop.offsetHeight / 2;
    if (!G) { drop.style.opacity = 1; drop.style.transform = `translate(${x}px,${y}px)`; dropOn = true; return; }
    G.killTweensOf(drop);
    if (quick) G.set(drop, { x, y, opacity: 1, scale: 1 });
    else if (!dropOn) {                              // 第一次出现：像水珠一样弹出来
      G.set(drop, { x, y });
      G.fromTo(drop, { opacity: 0, scale: .2 }, { opacity: 1, scale: 1, duration: .6, ease: 'elastic.out(1,.45)' });
    } else {                                         // 滑到下一颗点：拉长、到位回弹
      G.set(drop, { opacity: 1, y });
      G.to(drop, { x, duration: .5, ease: 'power3.inOut' });
      G.timeline().to(drop, { scaleX: 1.45, scaleY: .84, duration: .22, ease: 'power2.out' })
        .to(drop, { scaleX: 1, scaleY: 1, duration: .6, ease: 'elastic.out(1,.38)' });
    }
    dropOn = true;
  }

  Deck.scene('glass', {
    label: '液态玻璃',
    family: 'modern',
    dark: false,
    mascot: 'toutou',
    enter: 'float',
    enterBy: BY,
    titleIn: 'float',
    recede: .56,
    rough: { strokeWidth: 3, roughness: .4, bowing: .3, markWidth: 3.5, markRoughness: .4, markBowing: .3 },   // 线稿和圈注都几乎是直的
    fx: FX,

    // 背景层：一块和舞台对齐的画布，六团柔边光斑、两颗光亮的小球（静止）
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<div class="gl-sky" aria-hidden="true">'
        + ['b0', 'b5', 'b2', 'b4', 'b3', 'b1'].map(b => `<i class="gl-blob gl-${b}"></i>`).join('')
        + '<i class="gl-o1"></i><i class="gl-o2"></i></div>');
    },
    // 每页建好后：给有玻璃的组件和主题行插一层玻璃（垫在字下面）
    decorate(slide) {
      slide.querySelectorAll(GLASS + ', :scope > .s-topic').forEach(c => {
        if (layerOf(c)) return;
        const g = document.createElement('gl-glass');
        g.setAttribute('aria-hidden', 'true');
        c.insertBefore(g, c.firstChild);
      });
    },
    // 变成当前风格时：挂上悬停柔光的监听、配上折射、在节拍胶囊里放玻璃和放大镜液滴；离开时（含进阅读模式）全部拿掉
    mount(stage) {
      if (onMove) return;
      onMove = e => {
        if (e.pointerType === 'touch') return;
        last = e;
        if (!raf) raf = requestAnimationFrame(track);
      };
      stage.addEventListener('pointermove', onMove, { passive: true });
      lensStart(stage);
      meterMount(stage);
    },
    unmount(stage) {
      if (onMove) stage.removeEventListener('pointermove', onMove);
      onMove = null; last = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lensStop();
      meterUnmount();
    },
    // 退一拍：玻璃收回成液滴消失、字往左退淡；文字块往左退淡。引擎的收回往后挪到玻璃收完（只在最后把这一拍藏起来）
    onBack({ tl, units }) {
      const END = .6;
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const glasses = isGlass(e) ? [e] : [...e.querySelectorAll('gl-glass')].map(g => g.parentElement).filter(c => c.matches(GLASS));
        if (glasses.length) {
          glasses.forEach((c, i) => drain(tl, c, Math.min(i * .04, .12), END));
          kidsOf(e).filter(c => !glassIn(c)).forEach(c => { const back = keep(c); tl.to(c, { opacity: 0, x: -20, duration: .2, ease: 'power2.in' }, 0); tl.call(back, null, END); });
        } else {
          tl.to(e, { opacity: 0, x: -20, duration: .2, ease: 'power2.in' }, 0);
          tl.call(() => { if (G) G.set(e, { clearProps: 'transform' }); }, null, END);
        }
      });
      return { at: .46, gap: 0, y: 0, dur: .08, childAt: .5 };
    },
    // 翻页：旧页上收淡出，新页从下面浮上来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      tl.to(from.el, { autoAlpha: 0, y: -12 * dir, duration: .3, ease: 'power2.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out', immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .18);
      return .22;
    },
    // 「已复制」：命令按钮被按一下再弹回；一颗小液滴从靠命令的那一端被拉出来（先拉长、再挣脱），长成小胶囊，打勾
    copied({ tl, tip, node, ok }) {
      const nr = node.getBoundingClientRect(), tr = tip.getBoundingClientRect();
      let f = { x: -58, y: 0, o: '0% 50%' };                                    // 提示在命令右边：从左端拉出来
      if (tr.right <= nr.left + 4) f = { x: 58, y: 0, o: '100% 50%' };          // 在左边
      else if (tr.left < nr.right - 4) f = tr.top >= nr.bottom - 4 ? { x: 0, y: -30, o: '50% 0%' } : { x: 0, y: 30, o: '50% 100%' };   // 在下面 / 上面
      tl.fromTo(tip, { autoAlpha: 1, x: f.x, y: f.y, scaleX: .2, scaleY: .5, transformOrigin: f.o }, { x: f.x * .58, y: f.y * .58, scaleX: .36, scaleY: .42, duration: .14, ease: 'power2.out' }, 0)
        .to(tip, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .64, ease: 'elastic.out(1,.5)' }, .14);
      const path = tip.querySelector('path');
      if (path) { const L = path.getTotalLength() + 2; tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power2.out' }, .26); }
      if (ok && node.matches && node.matches('.copy')) G.fromTo(node, { scaleX: .95, scaleY: 1.06 }, { scaleX: 1, scaleY: 1, duration: .62, ease: 'elastic.out(1.2,.35)', clearProps: 'transform' });
    },
    // 开场（约 1.2 秒）：光斑淡入 → 主题行、节拍胶囊像水珠一样弹开 → 大标题、第 0 拍浮上来 → 重点词的胶囊弹开
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      guard();
      const sky = document.querySelector('.bg[data-scene="glass"] .gl-sky');
      if (sky) tl.fromTo(sky, { opacity: 0 }, { opacity: 1, duration: .8, ease: 'power1.out', immediateRender: true, onComplete: () => sky.style.removeProperty('opacity') }, 0);
      // 两枚胶囊：先很快显出来，再从靠边的一端像水珠一样弹开
      const pop = (e, origin, at) => {
        const off = () => clean(e);
        tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none', immediateRender: true }, at)
          .fromTo(e, { scaleX: .3, scaleY: .6, transformOrigin: origin }, { scaleX: 1, scaleY: 1, duration: .7, ease: 'elastic.out(1,.5)', immediateRender: true, onComplete: off, onInterrupt: off }, at);
      };
      const topic = root.querySelector(':scope > .s-topic'), stage = root.closest('#stage');
      const meter = stage && stage.querySelector('.chrome .meter:not([hidden])'), pageno = stage && stage.querySelector('.chrome .pageno');
      if (topic) pop(topic, '28px 50%', .05);
      if (meter) pop(meter, `${Math.max(0, meter.offsetWidth - 28)}px 50%`, .15);
      if (pageno) tl.fromTo(pageno, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: () => clean(pageno) }, .2);
      const title = root.querySelector(':scope > .s-title');
      let end = .7;
      if (title) end = Math.max(end, .12 + floatIn(tl, title, .12, true));
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      zero.forEach((e, i) => { const s = (title ? .3 : .2) + i * .1 + (parseFloat(e.dataset.delay) || 0); end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.min(end, 1));
      return Math.max(end, 1.2);
    },
    // 点击处漾开一圈很淡的水纹（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      if (!G || !layer || !motion()) return;
      const r = document.createElement('i');
      r.className = 'gl-ripple';
      r.style.left = x + 'px'; r.style.top = y + 'px';
      layer.appendChild(r);
      G.fromTo(r, { scale: .2, opacity: .9 }, { scale: 2.6, opacity: 0, duration: .7, ease: 'power2.out', onComplete: () => r.remove() });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 14, w: 516, h: 68, name: '页码和节拍胶囊' },
    ],
  });
})();
