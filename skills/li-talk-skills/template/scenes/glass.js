/* =====================================================================
   风格 · 液态玻璃 glass（现代风，浅色底）
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
   - 自己加的出场名：pour、float、jelly，以及下面版式组件用的 glorb、glpill、glbubble、gltube、glseg、glfix、glbeaker、gllevel、glmerge，
     只在这个风格里认（别的风格会提醒并换成它的默认出场）。版式组件的出场页面里不用写，按类名自动选
   - 液态玻璃自己的版式组件（.gl-*，只在这个风格里有样子；样板页 samples/glass.js 把每个都用了一遍，整段抄过去改字就行）。
     整体是「会融合、会变形的胶囊和液体」：一节节长出来的液态胶囊、从暖色流成冷色的一团液体、一杯一拍升一段的水、
     两颗撞在一起合成胶囊的水滴、从下面浮上来的玻璃气泡。和毛玻璃 frost 拉开：毛玻璃是层叠的磨砂卡片和控件，这里不叠卡片、不做滑块旋钮。
     液体靠 SVG 滤镜融合（gl-melt：模糊后把不透明度拉陡，挨得近的几块就连成一体、交界处长出圆润的细颈，再打上镜面高光和下沿暗部）；
     Chromium 和 Firefox 里开着，别的浏览器每块液体退成一枚自己的玻璃胶囊（字照样清楚）
     可读性约定（组件已经按这个做好，抄的时候别改坏）：
       · 字一律写在液体、玻璃上面的那层，实色深墨字；液体只是浅浅的半透明底色（浅蓝、薄荷、浅杏），不垫图案、不压字
       · 讲过的只由引擎退到 .8；「当前」靠液体长出来、高光扫过交代，不另外调暗别的
       · 每拍出的要点讲完一直留着：胶囊长出的每一节、水杯旁的每条刻度说明、每一行坑和改法，翻到最后一拍都在
       · 句子横排；大号字效只给大数字和封面大字
     · .gl-orb：一颗大的液态透镜（正圆，写 left、top、width），里面放一个 .gl-ico。出场是一滴水从上面落下来、摊开成透镜、果冻回弹，
       一道高光扫过。封面主视觉用
     · .gl-ico[data-gl-ico="名字"]：线稿图标（这里画好，建页时填进去）：cup 盖碗、leaf 茶叶、kettle 热水壶
     · .gl-pill：一枚玻璃胶囊，放讲者这类一句话（字直接写在里面）。出场是一滴水落下来、从中间向两边摊开成胶囊
     · .gl-bubbles > .gl-bubble[data-beat]：一排玻璃气泡托着东西。每个 .gl-bubble 里放一颗气泡 .gl-ball（里面一个 .gl-ico）、
       一枚名字胶囊 .gl-chip（<small data-small>01</small>名字）和一行说明 <span>。到拍时气泡从下面浮上来、晃两下站稳，
       图标在玻璃里由大到清楚，名字胶囊弹出来、说明滑进来。三个讲完都留着
     · .gl-tube > .gl-seg[data-beat]（招牌页「液态胶囊」）：一根厚玻璃管，第 0 拍落进一颗种子液滴；每拍从上一节的右端鼓出一团液体、
       拉长成新的一节（颜色依次是浅蓝、薄荷、浅杏，交界处融成圆润的细颈），一道高光扫过。每节里写
       <b class="gl-no">01</b><h3>步骤名</h3><p>一句话</p>。节数 2 到 5 节，按节数自动等分
     · .gl-fix[data-beat]：一行坑和改法。<p class="gl-bad"><i>✕</i>错的做法</p><i class="gl-to">→</i><p class="gl-good"><i>✓</i>对的做法</p>。
       到拍时一团暖色液体从左端流开（错的做法），再从它的右端淌出一股细流（从暖杏渐变成薄荷），流的前头顶着一颗水珠停在中间、箭头弹出来，
       流到右边鼓成一枚冷色的胶囊（对的做法）。三列宽改 --gl-a（错的做法那列）、--gl-m（中间那列），右边那列占满剩下的
     · .gl-beaker（招牌页「注水液面」）：一只大玻璃杯 .gl-vessel 加几条刻度说明 .gl-level[data-beat]，每条 style 写 --lv（这条刻度在杯子的几成高，0–1）。
       刻度说明里放 <b class="gl-num">数字<small>单位</small></b><div class="gl-say"><b class="gl-chip">名字</b><span>一句说明</span></div>。
       建页时补上杯里的水、刻度、高亮的刻度线；到拍时一滴水落进杯里、水面晃着升到这条刻度（液面跟着已经讲到的最高一条走），
       一根引线从杯边伸到说明，说明弹出来。按拍号从下往上排（--lv 一拍比一拍大）
     · .gl-merge：两颗水滴从两边滚进来、撞在一起合成一枚胶囊，放「谢谢大家」这类一句话（字直接写在里面）
     · 高光扫过（.gl-shine）、落下的水滴（.gl-fall）、水面的涟漪（.gl-ring）都是出场时临时加的，不用写
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

  /* 有玻璃层的组件（后半是液态玻璃自己的版式组件）；SKIP 是出场时不跟着动的子元素 */
  const GLASS = '.card, .cell, .term, .shot, .steps > li, .gl-orb, .gl-pill, .gl-ball, .gl-tube, .gl-vessel';
  const HOVER = GLASS + ', .copy';
  const SKIP = 'gl-glass, .gl-melt, svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
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
    // 版式组件（.gl-*）的出场：页面里不用写，按类名自动选（见文件开头的说明和 BY）
    glorb(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : orbIn(tl, e, t); },
    glpill(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : dripIn(tl, e, t); },
    glbubble(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : bubbleIn(tl, e, t); },
    gltube(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : tubeIn(tl, e, t); },
    glseg(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : segIn(tl, e, t); },
    glfix(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : fixIn(tl, e, t); },
    glbeaker(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : beakerIn(tl, e, t); },
    gllevel(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : levelIn(tl, e, t); },
    glmerge(tl, e, t) { return e instanceof SVGElement ? floatIn(tl, e, t, true) : mergeIn(tl, e, t); },
  };
  const BY = { card: 'pour', cell: 'pour', term: 'pour', shot: 'pour', steps: 'pour', cells: 'pour', grid: 'pour', vs: 'pour', copy: 'jelly', tag: 'jelly',
    'gl-orb': 'glorb', 'gl-pill': 'glpill', 'gl-bubble': 'glbubble', 'gl-tube': 'gltube', 'gl-seg': 'glseg', 'gl-fix': 'glfix',
    'gl-beaker': 'glbeaker', 'gl-level': 'gllevel', 'gl-merge': 'glmerge' };
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
     液态玻璃自己的版式组件（.gl-*）：融合变形的胶囊和液体。
     结束时的样子都写在 glass.css 里（跟着 .on 和 :has() 走），总览、阅读模式、自检直接摆到最后一拍也对；
     这里只管「从哪儿变过去」，播完把临时写的行内样式、类、临时元素收回去
     ================================================================= */
  /* 融合滤镜：Chromium、Firefox 里开着（Safari 对 HTML 元素上的 SVG 滤镜不稳），别的浏览器每块液体是一枚自己的玻璃胶囊 */
  // 后台自检、截图用的无头浏览器写的是 HeadlessChrome/…，也要认出来（CHROMIUM 那个判断按单词边界认不到它）
  const MELT_OK = (/(Chrome|Chromium)\/\d+/.test(UA) && !/\b(CriOS|FxiOS)\b/.test(UA)) || /\bFirefox\/\d+/.test(UA);
  /* gl-melt：模糊后把不透明度拉陡（挨得近的几块连成一体，交界处长出圆润的细颈，边缘重新变清楚）；
     颜色取模糊后的颜色、不透明度拉满再裁进形状（交界处两种颜色自然混开），整体留七成半透明；
     再加：形状外一团偏蓝的柔影、下沿内侧一圈暗部（厚度）、按形状起伏打一束左上来的光（镜面高光，平的地方几乎不亮）、顶边一线亮 */
  const MELT_DEFS = `<filter id="gl-melt" x="-15%" y="-45%" width="130%" height="190%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="soft"/>
    <feColorMatrix in="soft" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 24 -11" result="shape"/>
    <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="tint"/>
    <feComposite in="tint" in2="shape" operator="in" result="fill"/>
    <feComponentTransfer in="fill" result="body"><feFuncA type="linear" slope=".76"/></feComponentTransfer>
    <feGaussianBlur in="shape" stdDeviation="12" result="sh0"/>
    <feOffset in="sh0" dy="16" result="sh1"/>
    <feFlood flood-color="#18306E" flood-opacity=".22"/>
    <feComposite in2="sh1" operator="in" result="sh2"/>
    <feComposite in="sh2" in2="shape" operator="out" result="drop"/>
    <feGaussianBlur in="shape" stdDeviation="5" result="sb"/>
    <feOffset in="sb" dy="-9" result="sbu"/>
    <feComposite in="shape" in2="sbu" operator="out" result="low"/>
    <feFlood flood-color="#1C3482" flood-opacity=".24"/>
    <feComposite in2="low" operator="in" result="deep"/>
    <feSpecularLighting in="sb" surfaceScale="6" specularConstant="1.05" specularExponent="30" lighting-color="#fff" result="spec"><feDistantLight azimuth="225" elevation="38"/></feSpecularLighting>
    <feComposite in="spec" in2="shape" operator="in" result="gloss"/>
    <feOffset in="shape" dy="2.5" result="sd"/>
    <feComposite in="shape" in2="sd" operator="out" result="edge"/>
    <feFlood flood-color="#fff" flood-opacity=".95"/>
    <feComposite in2="edge" operator="in" result="top"/>
    <feMerge><feMergeNode in="drop"/><feMergeNode in="body"/><feMergeNode in="deep"/><feMergeNode in="gloss"/><feMergeNode in="top"/></feMerge>
  </filter>`;
  /* 水面：400×40 里四个波（一个波 100），宽是杯子的两倍；往左挪四分之一宽正好一个波，挪完换回原位看不出跳 */
  const WAVE = 'M0 20 Q25 6 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 V40 H0 Z';

  /* 线稿图标：描边用 glass.css 里 .gl-ico 的墨色，.f 是乳白的面、.t 是一层浅蓝的面、.a 是海蓝的点缀 */
  const ICON = {
    cup: '<ellipse class="f" cx="120" cy="176" rx="92" ry="12"/>'
      + '<path class="t" d="M50 106 C54 148 86 166 120 166 C154 166 186 148 190 106 Z"/>'
      + '<path class="a" d="M66 132 Q120 146 174 132"/>'
      + '<path class="f" d="M60 104 C64 78 90 64 120 64 C150 64 176 78 180 104 Q120 116 60 104 Z"/>'
      + '<path class="f" d="M106 64 C106 54 111 47 120 47 C129 47 134 54 134 64"/>'
      + '<path class="a" d="M92 34 q-8 -10 0 -20 M120 28 q-8 -10 0 -20 M148 34 q-8 -10 0 -20"/>',
    leaf: '<path class="t" d="M36 164 C34 100 90 46 196 40 C200 120 144 170 36 164 Z"/>'
      + '<path class="a" d="M36 164 C86 130 136 88 184 52"/>'
      + '<path d="M76 142 C72 122 76 106 84 92 M104 120 C102 100 106 84 116 70 M132 96 C132 80 138 68 148 58"/>'
      + '<path class="f" d="M150 172 C156 140 180 122 214 120 C212 150 190 172 150 172 Z"/>'
      + '<path d="M28 184 L214 184"/>',
    kettle: '<path d="M88 76 C88 32 152 32 152 76"/>'
      + '<path class="t" d="M74 78 L166 78 C182 110 186 150 174 172 L66 172 C54 150 58 110 74 78 Z"/>'
      + '<path class="f" d="M68 102 L30 74 L22 82 L62 128"/>'
      + '<path class="f" d="M96 78 Q120 64 144 78 Z"/><circle class="f" cx="120" cy="64" r="6"/>'
      + '<path class="a" d="M78 138 Q120 150 162 138"/><path class="a" d="M20 58 q-6 -9 0 -18 M34 50 q-6 -9 0 -18"/>'
      + '<path d="M58 184 L182 184"/>',
  };
  const svgOf = name => `<svg viewBox="0 0 240 200" aria-hidden="true">${ICON[name]}</svg>`;

  /* 出场途中临时加的类、临时元素、写在行内的变量：正常由时间线播到时收尾；时间线万一被掐断，退拍、翻页时也收一遍 */
  const pending = new Set();
  function later(tl, at, fn) {
    let done = false;
    const run = () => { if (done) return; done = true; pending.delete(run); fn(); };
    pending.add(run);
    tl.call(run, null, at);
  }
  function settle() { [...pending].forEach(run => { try { run(); } catch (e) { /* 元素已经不在了 */ } }); pending.clear(); }
  /* 补间一个 CSS 变量（一律 fromTo：变量不在行内时 gsap 读不到起点），播完从行内去掉，回到 CSS 给的终点 */
  function tweenVar(tl, e, name, a, b, t, dur, ease) {
    const off = () => e.style.removeProperty(name);
    tl.fromTo(e, { [name]: a }, { [name]: b, duration: dur, ease: ease || 'power2.out', immediateRender: true }, t);
    later(tl, t + dur, off);
  }
  /* 清掉动画留下的行内样式（直接 removeProperty：跳拍时时间线被一下推到结尾，补间 onComplete 里的 clearProps 会被随后的终值盖回去） */
  const BIT_PROPS = ['transform', 'translate', 'rotate', 'scale', 'opacity', 'visibility', 'transform-origin', '--gl-rx', '--gl-ry'];
  const clearBit = e => { if (!e) return; if (G) G.killTweensOf(e); BIT_PROPS.forEach(k => e.style.removeProperty(k)); };
  const meltOf = host => (host && host.querySelector ? host.querySelector(':scope > .gl-melt') : null);
  const bitOf = (host, sel) => { const m = meltOf(host); return m ? m.querySelector(':scope > ' + sel) : null; };

  /* 一块液体从一颗小液滴长成自己的样子：cx 是液滴中心离这块液体左边多远，d 是液滴的直径。
     先在 cx 冒出一团（从透明到实，融合滤镜下看着是一点点鼓出来），再向右拉长、果冻似地回弹；圆角跟着从椭圆收成胶囊 */
  function grow(tl, bit, t, cx, d) {
    const W = bit.offsetWidth || 1, H = bit.offsetHeight || 1, R = Math.min(W, H) / 2;
    const b = Math.min(W, H * 1.15);
    tl.fromTo(bit, { opacity: 0, x: cx - d / 2, scaleX: d / W, scaleY: d / H, transformOrigin: '0% 50%', '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px' },
      { opacity: 1, x: cx - b * .35, scaleX: b / W, scaleY: 1.05, duration: .26, ease: 'back.out(1.8)', immediateRender: true }, t)
      .to(bit, { x: 0, scaleX: 1, duration: .66, ease: 'back.out(1.25)' }, t + .22)
      .to(bit, { '--gl-rx': R + 'px', '--gl-ry': R + 'px', duration: .5, ease: 'power2.out' }, t + .22)
      .to(bit, { scaleY: 1, duration: .66, ease: 'elastic.out(1.1,.36)' }, t + .3);
    later(tl, t + .98, () => clearBit(bit));
    return .95;
  }
  /* 这块液体退回成一颗小液滴、消失（grow 倒过来） */
  function shrink(tl, bit, t, cx, d) {
    const W = bit.offsetWidth || 1, H = bit.offsetHeight || 1, R = Math.min(W, H) / 2;
    tl.fromTo(bit, { x: 0, scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: '0% 50%', '--gl-rx': R + 'px', '--gl-ry': R + 'px' },
      { x: cx - d / 2, scaleX: d / W, scaleY: d / H, '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px', duration: .34, ease: 'power3.in', immediateRender: true }, t)
      .to(bit, { opacity: 0, duration: .08, ease: 'none' }, t + .34);
  }
  /* 字跟着液体滑进来（只动透明度和位移，播完原样还原）；名字胶囊、标签果冻弹出 */
  function kidsIn(tl, kids, t, step) {
    let end = 0;
    kids.forEach((c, i) => {
      const s = t + i * step;
      end = Math.max(end, s + (c.matches('.gl-chip, .gl-no, .gl-to') ? jellyIn(tl, c, s, false) : slideIn(tl, c, s)));
    });
    return end;
  }
  function slideIn(tl, c, t) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: .42, ease: 'power3.out', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    later(tl, t + .44, back);
    return .42;
  }
  /* 直接写在组件里的字：字色从透明到原色 */
  function textIn(tl, e, t) {
    if (!hasText(e)) return;
    const own = e.style.color, c = getComputedStyle(e).color, put = () => { e.style.color = own; };
    tl.fromTo(e, { color: transparentOf(c) }, { color: c, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: put, onInterrupt: put }, t);
    later(tl, t + .42, put);
  }
  /* 一道高光扫过（加 .gl-shine，推 --gl-sw；glass.css 按它画一条斜的白光，垫在字下面） */
  function shine(tl, e, t) {
    tl.call(() => e.classList.add('gl-shine'), null, t);
    tweenVar(tl, e, '--gl-sw', -30, 130, t, .6, 'power1.inOut');
    later(tl, t + .62, () => e.classList.remove('gl-shine'));
  }
  /* 一滴水从上面落下来（临时的 .gl-fall，放进 host，落到 host 里的 (x, y) 中心），落地压扁消失；返回落地的时刻 */
  function fall(tl, host, x, y, t, h) {
    const drop = document.createElement('i');
    drop.className = 'gl-fall';
    drop.setAttribute('aria-hidden', 'true');
    host.appendChild(drop);
    const w = drop.offsetWidth || 34, dh = drop.offsetHeight || 46;
    tl.fromTo(drop, { opacity: 0, x: x - w / 2, y: y - dh / 2 - (h || 160), scaleX: .7, scaleY: 1.3 },
      { opacity: 1, y: y - dh / 2, duration: .34, ease: 'power2.in', immediateRender: true }, t)
      .to(drop, { scaleX: 1.7, scaleY: .3, opacity: 0, duration: .14, ease: 'power2.out' }, t + .34);
    later(tl, t + .5, () => drop.remove());
    return t + .34;
  }
  /* 落点漾开一圈水纹（临时的 .gl-ring） */
  function ring(tl, host, x, y, t, w) {
    const r = document.createElement('i');
    r.className = 'gl-ring';
    r.setAttribute('aria-hidden', 'true');
    host.appendChild(r);
    const rw = w || 120;
    r.style.cssText = `left:${x - rw / 2}px;top:${y - rw * .15}px;width:${rw}px;height:${rw * .3}px`;
    tl.fromTo(r, { opacity: .9, scale: .25 }, { opacity: 0, scale: 1.4, duration: .42, ease: 'power2.out', immediateRender: true }, t);
    later(tl, t + .44, () => r.remove());
  }

  /* 液态透镜（.gl-orb）：一滴水落下来，压扁、摊开成透镜，果冻回弹；图标在玻璃里由大到清楚，一道高光扫过 */
  function orbIn(tl, e, t) {
    guard();
    tl.fromTo(e, { y: -300, scale: .14, transformOrigin: '50% 50%' }, { y: 0, duration: .34, ease: 'power2.in', immediateRender: true }, t)
      .to(e, { scaleX: .24, scaleY: .1, duration: .09, ease: 'power2.out' }, t + .34)
      .to(e, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1,.45)' }, t + .43);
    later(tl, t + 1.45, () => clearBit(e));
    const ico = e.querySelector(':scope > .gl-ico');
    if (ico) {
      tl.fromTo(ico, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out', immediateRender: true }, t + .55);
      later(tl, t + 1.17, () => clearBit(ico));
    }
    shine(tl, e, t + .85);
    return 1.3;
  }
  /* 玻璃胶囊（.gl-pill）：一滴水落下来，落地压扁，从中间向两边摊开成胶囊（圆角从正圆收成胶囊），字随后显出来 */
  function dripIn(tl, e, t) {
    const g = layerOf(e);
    if (!g) return floatIn(tl, e, t, true);
    guard();
    const W = g.offsetWidth || 1, H = g.offsetHeight || 1, R = radiusOf(g, W, H), d = H * .6;
    tl.fromTo(g, { opacity: 0, y: -(H / 2 + 80), scaleX: d / W, scaleY: d * 1.25 / H, transformOrigin: '50% 50%', '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px' },
      { opacity: 1, y: 0, scaleY: d / H, duration: .3, ease: 'power2.in', immediateRender: true }, t)
      .to(g, { scaleX: d * 1.6 / W, scaleY: d * .62 / H, duration: .08, ease: 'power2.out' }, t + .3)
      .to(g, { scaleX: 1, duration: .8, ease: 'elastic.out(1,.55)' }, t + .38)
      .to(g, { scaleY: 1, duration: .7, ease: 'elastic.out(1.1,.36)' }, t + .38)
      .to(g, { '--gl-rx': R + 'px', '--gl-ry': R + 'px', duration: .45, ease: 'power2.out' }, t + .38);
    later(tl, t + 1.2, () => clearBit(g));
    textIn(tl, e, t + .5);
    const end = kidsIn(tl, kidsOf(e), t + .5, .07);
    return Math.max(1, end - t);
  }
  /* 玻璃气泡（.gl-bubble）：气泡从下面浮上来、晃两下站稳，图标在玻璃里由大到清楚，名字胶囊弹出来、说明滑进来 */
  function bubbleIn(tl, e, t) {
    const ball = e.querySelector(':scope > .gl-ball'), g = layerOf(ball);
    let end = t + .4;
    if (ball) {
      guard();
      tl.fromTo(ball, { y: 280, scaleX: .42, scaleY: .5, transformOrigin: '50% 50%' }, { y: 0, duration: .62, ease: 'power3.out', immediateRender: true }, t)
        .to(ball, { scaleX: 1, scaleY: 1, duration: .95, ease: 'elastic.out(1,.4)' }, t + .1);
      later(tl, t + 1.06, () => clearBit(ball));
      if (g) {
        tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'power1.out', immediateRender: true }, t);
        later(tl, t + .22, () => g.style.removeProperty('opacity'));
      }
      const ico = ball.querySelector(':scope > .gl-ico');
      if (ico) {
        tl.fromTo(ico, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .55, ease: 'power3.out', immediateRender: true }, t + .3);
        later(tl, t + .87, () => clearBit(ico));
      }
      end = t + .9;
    }
    end = Math.max(end, kidsIn(tl, kidsOf(e).filter(c => c !== ball), t + .46, .12));
    return Math.min(end - t, 1.15);
  }
  /* 玻璃管（.gl-tube，第 0 拍）：管子像液体一样从左流开，随后一颗种子液滴落进管子左头、压扁回弹 */
  function tubeIn(tl, e, t) {
    guard();
    const d = isGlass(e) ? pourOne(tl, e, t) : 0;
    const seed = bitOf(e, '.gl-seed');
    if (seed) {
      tl.fromTo(seed, { opacity: 0, y: -120, scaleX: .7, scaleY: 1.3, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, duration: .3, ease: 'power2.in', immediateRender: true }, t + .5)
        .to(seed, { scaleX: 1.35, scaleY: .7, duration: .08, ease: 'power2.out' }, t + .8)
        .to(seed, { scaleX: 1, scaleY: 1, duration: .6, ease: 'elastic.out(1,.4)' }, t + .88);
      later(tl, t + 1.5, () => clearBit(seed));
    }
    return Math.max(d, 1.2);
  }
  /* 液态胶囊的一节（.gl-seg）：从上一节的右端（第一节从种子液滴）鼓出一团液体，拉长成这一节，交界处融成细颈；字滑进来，一道高光扫过 */
  function segStart(e) {
    const tube = e.parentElement, n = +e.dataset.glN || 1;
    const bit = bitOf(tube, `[data-gl-n="${n}"]`);
    if (!bit) return null;
    const prev = bitOf(tube, `[data-gl-n="${n - 1}"]`), seed = bitOf(tube, '.gl-seed'), H = bit.offsetHeight || 1;
    if (prev) return { bit, cx: prev.offsetLeft + prev.offsetWidth - H * .2 - bit.offsetLeft, d: H * .5 };
    if (seed) return { bit, cx: seed.offsetLeft + seed.offsetWidth / 2 - bit.offsetLeft, d: seed.offsetWidth || H * .3 };
    return { bit, cx: H / 2, d: H * .3 };
  }
  function segIn(tl, e, t) {
    const s = segStart(e);
    if (s) grow(tl, s.bit, t, s.cx, s.d);
    shine(tl, e, t + .6);
    const end = kidsIn(tl, kidsOf(e), t + .3, .08);
    return Math.min(Math.max(1.1, end - t), 1.2);
  }
  /* 一行坑和改法（.gl-fix）：一团暖色液体从左端流开（错的做法）；再从它的右端淌出一股细流，流的前头鼓着一颗水珠，
     细流一边往右淌一边从暖杏变成薄荷，水珠停在中间、箭头弹出来，流到右边鼓成一枚冷色的胶囊（对的做法） */
  function fixIn(tl, e, t) {
    const a = bitOf(e, '.gl-a'), st = bitOf(e, '.gl-st'), dot = bitOf(e, '.gl-dot'), b = bitOf(e, '.gl-b');
    const bad = e.querySelector(':scope > .gl-bad'), to = e.querySelector(':scope > .gl-to'), good = e.querySelector(':scope > .gl-good');
    if (a) { const H = a.offsetHeight || 1; grow(tl, a, t, H / 2, H * .5); }
    if (bad) slideIn(tl, bad, t + .24);
    if (st) {
      tl.fromTo(st, { opacity: 1, scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: .5, ease: 'power2.inOut', immediateRender: true }, t + .46);
      later(tl, t + .98, () => clearBit(st));
    }
    if (dot && st) {
      const dx = st.offsetLeft - dot.offsetLeft;   // 水珠先在细流的起点，跟着流的前头往右走
      tl.fromTo(dot, { opacity: 0, x: dx, scale: .45 }, { opacity: 1, x: 0, scale: 1, duration: .5, ease: 'power2.inOut', immediateRender: true }, t + .46);
      later(tl, t + .98, () => clearBit(dot));
    }
    if (b) { const H = b.offsetHeight || 1; grow(tl, b, t + .72, H * .3, H * .6); }
    if (to) jellyIn(tl, to, t + .9, false);
    if (good) slideIn(tl, good, t + .9);
    return 1.2;
  }
  /* 大玻璃杯（.gl-beaker，第 0 拍）：杯子从底下往上长出来、果冻回弹，刻度随后显出来；杯里还是空的 */
  function beakerIn(tl, e, t) {
    const v = e.querySelector(':scope > .gl-vessel'), g = layerOf(v);
    if (g) {
      guard();
      tl.fromTo(g, { opacity: 0, scaleX: .72, scaleY: .14, transformOrigin: '50% 100%' }, { opacity: 1, scaleX: 1, scaleY: 1.03, duration: .42, ease: 'power3.out', immediateRender: true }, t)
        .to(g, { scaleY: 1, duration: .6, ease: 'elastic.out(1,.4)' }, t + .42);
      later(tl, t + 1.04, () => clearBit(g));
    }
    const parts = v ? [...v.querySelectorAll(':scope > .gl-ticks, :scope > .gl-mark, :scope > .gl-rim')] : [];
    parts.forEach(p => {
      tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: .4, ease: 'power1.out', immediateRender: true }, t + .34);
      later(tl, t + .76, () => p.style.removeProperty('opacity'));
    });
    return 1;
  }
  /* 杯子旁的一条刻度说明（.gl-level）：一滴水落进杯里、水面漾开一圈，水面晃着升到这条刻度；引线从杯边伸出来，数字弹出来、说明滑进来 */
  function levelStep(e) {
    const b = e.closest('.gl-beaker'), v = b && b.querySelector(':scope > .gl-vessel');
    if (!b || !v) return null;
    const n = +e.dataset.glN || 1, lv = k => parseFloat(b.style.getPropertyValue('--gl-l' + k)) || 0;
    return { b, v, to: lv(n), from: n > 1 ? lv(n - 1) : 0 };
  }
  function levelIn(tl, e, t) {
    const s = levelStep(e);
    if (s) {
      const { b, v, to, from } = s;
      const vp = parseFloat(getComputedStyle(v).getPropertyValue('--gl-vp')) || 18;
      const ih = v.offsetHeight - vp * 2, surf = v.offsetHeight - vp - from * ih, cx = v.offsetWidth / 2;
      const hit = fall(tl, v, cx, surf - 8, t, Math.max(140, surf + 60));
      ring(tl, v, cx, surf, hit, v.offsetWidth * .5);
      tweenVar(tl, b, '--gl-lv', from, to, hit, .8, 'power2.out');
      tweenVar(tl, b, '--gl-wa', 1.5, .5, hit, 1.1, 'elastic.out(1,.3)');
      tweenVar(tl, b, '--gl-wx', 0, -25, hit, 1.1, 'power2.out');
    }
    tweenVar(tl, e, '--gl-ld', 0, 1, t + .58, .4, 'power2.out');
    const end = kidsIn(tl, kidsOf(e), t + .66, .12);
    return Math.min(Math.max(1.1, end - t), 1.2);
  }
  /* 合成的胶囊（.gl-merge）：两颗水滴从两边滚进来，在正中撞在一起，合成一枚胶囊向两边摊开，字随后显出来 */
  function mergeIn(tl, e, t) {
    const l = bitOf(e, '.gl-l'), body = bitOf(e, '.gl-body'), r = bitOf(e, '.gl-r');
    if (l && r && body) {
      const W = body.offsetWidth || 1, H = body.offsetHeight || 1, R = Math.min(W, H) / 2, run = W / 2 + 200;
      tl.fromTo(l, { opacity: 1, x: -run, scale: .8 }, { x: 0, scale: 1, duration: .4, ease: 'power2.in', immediateRender: true }, t)
        .fromTo(r, { opacity: 1, x: run, scale: .8 }, { x: 0, scale: 1, duration: .4, ease: 'power2.in', immediateRender: true }, t)
        .to([l, r], { opacity: 0, duration: .2, ease: 'none' }, t + .48);
      tl.fromTo(body, { opacity: 0, scaleX: H * 1.3 / W, scaleY: 1.1, transformOrigin: '50% 50%', '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px' },
        { opacity: 1, duration: .08, ease: 'none', immediateRender: true }, t + .38)
        .to(body, { scaleX: 1, duration: .8, ease: 'elastic.out(1,.55)' }, t + .42)
        .to(body, { scaleY: 1, duration: .66, ease: 'elastic.out(1.1,.36)' }, t + .42)
        .to(body, { '--gl-rx': R + 'px', '--gl-ry': R + 'px', duration: .45, ease: 'power2.out' }, t + .42);
      later(tl, t + 1.24, () => [l, body, r].forEach(clearBit));
    }
    textIn(tl, e, t + .6);
    kidsIn(tl, kidsOf(e), t + .6, .07);
    return 1.15;
  }

  /* 版式组件退一拍：各自收回去（液体缩回上一节、气泡沉下去、水面降回去……），end 时把行内样式收干净。
     处理了返回 true；引擎随后（约 .46 秒）把这一拍整块藏起来 */
  function fadeKids(tl, kids, end) {
    kids.forEach((c, i) => { const back = keep(c); tl.to(c, { opacity: 0, x: -20, duration: .2, ease: 'power2.in' }, i * .03); tl.call(back, null, end); });
  }
  function backPart(tl, e, end) {
    if (e.matches('.gl-seg')) {
      const s = segStart(e);
      if (s) { shrink(tl, s.bit, .04, s.cx, s.d); tl.call(() => clearBit(s.bit), null, end); }
      fadeKids(tl, kidsOf(e), end);
      return true;
    }
    if (e.matches('.gl-fix')) {
      const a = bitOf(e, '.gl-a'), st = bitOf(e, '.gl-st'), dot = bitOf(e, '.gl-dot'), b = bitOf(e, '.gl-b');
      if (b) { const H = b.offsetHeight || 1; shrink(tl, b, 0, H * .3, H * .6); }
      if (st) tl.fromTo(st, { scaleX: 1, transformOrigin: '0% 50%' }, { scaleX: 0, duration: .26, ease: 'power2.in', immediateRender: true }, .06);
      if (dot) tl.to(dot, { opacity: 0, scale: .3, duration: .22, ease: 'power2.in' }, 0);
      if (a) { const H = a.offsetHeight || 1; shrink(tl, a, .1, H / 2, H * .5); }
      tl.call(() => [a, st, dot, b].forEach(clearBit), null, end);
      fadeKids(tl, kidsOf(e), end);
      return true;
    }
    if (e.matches('.gl-bubble')) {
      const ball = e.querySelector(':scope > .gl-ball'), g = layerOf(ball);
      if (ball) {
        tl.to(ball, { y: 240, scaleX: .45, scaleY: .55, duration: .42, ease: 'power2.in' }, 0);
        if (g) tl.to(g, { opacity: 0, duration: .2, ease: 'none' }, .24);
        tl.call(() => { clearBit(ball); if (g) g.style.removeProperty('opacity'); }, null, end);
      }
      fadeKids(tl, kidsOf(e).filter(c => c !== ball), end);
      return true;
    }
    if (e.matches('.gl-level')) {
      const s = levelStep(e);
      if (s) {
        // 水面降回上一条刻度：先留在行内，等引擎把这一拍的 .on 摘掉（CSS 换成上一条的液面）再去掉，免得中间闪回
        tl.fromTo(s.b, { '--gl-lv': s.to }, { '--gl-lv': s.from, duration: .42, ease: 'power2.inOut', immediateRender: true }, 0);
        tl.call(() => s.b.style.removeProperty('--gl-lv'), null, end);
      }
      fadeKids(tl, kidsOf(e), end);
      return true;
    }
    if (e.matches('.gl-pill')) {
      const g = layerOf(e);
      if (g) {
        const W = g.offsetWidth || 1, H = g.offsetHeight || 1, R = radiusOf(g, W, H), d = H * .6;
        tl.fromTo(g, { scaleX: 1, scaleY: 1, transformOrigin: '50% 50%', '--gl-rx': R + 'px', '--gl-ry': R + 'px' },
          { scaleX: d / W, scaleY: d / H, '--gl-rx': W / 2 + 'px', '--gl-ry': H / 2 + 'px', duration: .32, ease: 'power3.in', immediateRender: true }, .04)
          .to(g, { opacity: 0, y: -30, duration: .1, ease: 'power2.in' }, .36);
        tl.call(() => clearBit(g), null, end);
      }
      if (hasText(e)) tl.to(e, { color: transparentOf(getComputedStyle(e).color), duration: .16, ease: 'power1.in' }, 0);
      tl.call(() => e.style.removeProperty('color'), null, end);
      fadeKids(tl, kidsOf(e), end);
      return true;
    }
    if (e.matches('.gl-merge')) {
      const body = bitOf(e, '.gl-body');
      if (body) {
        const W = body.offsetWidth || 1, H = body.offsetHeight || 1;
        tl.fromTo(body, { scaleX: 1, transformOrigin: '50% 50%' }, { scaleX: H * 1.2 / W, duration: .3, ease: 'power3.in', immediateRender: true }, 0)
          .to(body, { opacity: 0, scale: .4, duration: .12, ease: 'power2.in' }, .3);
        tl.call(() => clearBit(body), null, end);
      }
      if (hasText(e)) tl.to(e, { color: transparentOf(getComputedStyle(e).color), duration: .16, ease: 'power1.in' }, 0);
      tl.call(() => e.style.removeProperty('color'), null, end);
      fadeKids(tl, kidsOf(e), end);
      return true;
    }
    return false;
  }

  /* 建页时补全版式组件：图标、液体层（融合滤镜）、玻璃杯里的水和刻度；节拍块按顺序编号（data-gl-n），glass.css 靠它让液体跟着 .on 走 */
  function decorateParts(s) {
    s.querySelectorAll('.gl-ico[data-gl-ico]').forEach(el => {
      const name = el.dataset.glIco;
      if (!ICON[name]) { console.warn(`[Deck] 液态玻璃的图标 data-gl-ico="${name}" 不认识，可选：${Object.keys(ICON).join('、')}`); return; }
      if (!el.firstElementChild) el.innerHTML = svgOf(name);
      el.setAttribute('aria-hidden', 'true');
    });
    // 液体层放在玻璃层后面、字前面（都在组件自己的层叠里）
    const melt = (host, html) => {
      if (meltOf(host)) return;
      const m = document.createElement('i');
      m.className = 'gl-melt' + (MELT_OK ? ' gl-live' : '');
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = html;
      const g = layerOf(host);
      host.insertBefore(m, g ? g.nextSibling : host.firstChild);
    };
    s.querySelectorAll('.gl-tube').forEach(t => {
      const segs = [...t.querySelectorAll(':scope > .gl-seg')];
      segs.forEach((g, i) => { g.dataset.glN = i + 1; });
      t.style.setProperty('--gl-n', String(Math.max(1, segs.length)));
      melt(t, '<i class="gl-bit gl-seed"></i>' + segs.map((g, i) => `<i class="gl-bit" data-gl-n="${i + 1}"></i>`).join(''));
    });
    s.querySelectorAll('.gl-fix').forEach(r => melt(r, '<i class="gl-bit gl-a"></i><i class="gl-bit gl-st"></i><i class="gl-bit gl-dot"></i><i class="gl-bit gl-b"></i>'));
    s.querySelectorAll('.gl-merge').forEach(r => melt(r, '<i class="gl-bit gl-l"></i><i class="gl-bit gl-body"></i><i class="gl-bit gl-r"></i>'));
    s.querySelectorAll('.gl-beaker').forEach(b => {
      const levels = [...b.querySelectorAll(':scope > .gl-level')];
      const lv = levels.map((l, i) => {
        l.dataset.glN = i + 1;
        const v = parseFloat(l.style.getPropertyValue('--lv'));
        const x = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : (i + 1) / (levels.length + 1);
        b.style.setProperty('--gl-l' + (i + 1), String(x));
        return x;
      });
      const v = b.querySelector(':scope > .gl-vessel');
      if (v && !v.querySelector(':scope > .gl-pool')) {
        v.insertAdjacentHTML('beforeend', `<i class="gl-pool" aria-hidden="true"><i class="gl-water"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path d="${WAVE}"/></svg><i class="gl-bub"></i><i class="gl-bub"></i></i></i>`
          + '<i class="gl-ticks" aria-hidden="true"></i>'
          + lv.map((x, i) => `<i class="gl-mark" data-gl-n="${i + 1}" style="--lv:${x}" aria-hidden="true"></i>`).join('')
          + '<i class="gl-rim" aria-hidden="true"></i>');
      }
    });
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
    recede: .8,
    rough: { strokeWidth: 3, roughness: .4, bowing: .3, markWidth: 3.5, markRoughness: .4, markBowing: .3 },   // 线稿和圈注都几乎是直的
    fx: FX,
    // 版式组件的液体融合滤镜（引擎放进页面里统一的隐藏 svg）
    defs: MELT_DEFS,

    // 背景层：一块和舞台对齐的画布，六团柔边光斑、两颗光亮的小球（静止）
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<div class="gl-sky" aria-hidden="true">'
        + ['b0', 'b5', 'b2', 'b4', 'b3', 'b1'].map(b => `<i class="gl-blob gl-${b}"></i>`).join('')
        + '<i class="gl-o1"></i><i class="gl-o2"></i></div>');
    },
    // 每页建好后：给有玻璃的组件和主题行插一层玻璃（垫在字下面），再补全版式组件（图标、液体层、杯里的水和刻度）
    decorate(slide) {
      slide.querySelectorAll(GLASS + ', :scope > .s-topic').forEach(c => {
        if (layerOf(c)) return;
        const g = document.createElement('gl-glass');
        g.setAttribute('aria-hidden', 'true');
        c.insertBefore(g, c.firstChild);
      });
      decorateParts(slide);
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
      settle();
      const END = .6;
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        if (backPart(tl, e, END)) return;   // 版式组件各自收回
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
      settle();
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
