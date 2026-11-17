/* =====================================================================
   风格 · 漫画 comic（手绘家，浅色底）
   - 样子：米白漫画原稿纸、淡蓝裁切线与四个角标；黑白墨线加两个专色（朱红、钴蓝）。卡片、小格、步骤、终端、截图位、命令
     都是一个个分镜格：毛笔墨线格框（中间粗两头收、四角出头交叉）、右下错开一块半调网点当阴影；金句像拟声大字
     （粗墨字、一圈留白、朱红错位影子）；重点词转朱红、下半截垫一条淡网点；一句话解释是旁白框
   - 适合讲：讲故事、前后对比、有情绪的转折、吐槽和反转。不适合：大段代码、密集数据、很正式的汇报
   - 默认形象：叨叨 daodao（一个毛笔墨线的对话框，朱红斜线腮红）
   - 投影上的注意：没有只在部分浏览器生效的效果（color-mix 不支持时重点词直接是朱红）；网点都很淡、只在格子外面，不压字
   - 来源：第一轮样页「漫画分镜」（只取风格：配色、线条、组件样子、动效），按第二轮的标准收了一遍——
     去掉速度线背景、蓝铅笔草稿格、整格网点底、满页旁白框，网点只留在格子的阴影和重点词下面，一页一个重心。
     搬来的效果和改成对任意页面都成立的写法：
     1. 毛笔墨线格框：样页按 data-poly 给每格生成 SVG 墨线。这里任意大小的组件都能用：四条边各是一张
        「中间粗两头收」的墨线图（comic.css 的 --cm-ft/fr/fb/fl），当背景沿边拉长、不拉粗，和留白、网点阴影叠在
        组件的一个伪元素里（comic.css 开头有图解）。页面不用多写任何标记
     2. 「格框先描出」frame（新增的出场名；卡片、小格、步骤、终端、截图位、.cm-panel 默认用它）：
        四条墨线依次描出（--cm-d1…d4 从 0 到 1）→ 网点阴影浮出来（--cm-k，像整格离开纸面）→ 里面的字依次弹入
        （终端、截图位里面是轻轻升上来）。一排格子的容器（.steps、.cells、.grid……）整拍出场时，里面的格子依次描出
     3. 「内容弹入」boing（新增，默认出场，正文、标签用它）：从小、歪一点弹到位
     4. 「大字砸下」bam（新增，金句和 .cm-sfx 用它）：从很大砸下来、压一下回弹，落地一瞬四周闪一圈集中线
     5. 「啵」bubble（新增，.cm-say 用它）：气泡从尾巴那头弹性冒出。同一拍里 plan 把它排在最后、大字排在格子后面：
        格框先描出 → 内容弹入 → 大字砸下 → 气泡最后冒出
     6. 「横切入」dash（新增，大标题和命令用它）：带着一点斜从左边冲进来；命令冲进来时身后拖几道速度线
     7. 复制（copied）：命令被按进网点阴影里 → 朱红锯齿形的「已复制！」爆炸气泡从小炸开（样页的 burst）
     8. 节拍指示：一排分镜小缩略格（样页页脚的缩略分镜，位置照引擎放在右上角，和别的风格一致，按章混用时不跳位置）：
        没讲到的是蓝铅笔虚线草稿框，讲过的上了墨，当前这一格描粗、铺网点；换拍时当前格「啪」地落定、拍号掉下来（comic.css）
     9. 悬停：格子整个抬起一点、网点阴影留在原地变宽（comic.css），右上角冒出三道钴蓝效果线（和叨叨开心时头顶的线一家；
        mount 时挂 pointerover）；按下时压进阴影
     10. 退一拍（onBack）：网点阴影先沉回去，四条墨线倒着收掉，同时整格淡出
     11. 点击处一圈很淡的冲击星（ripple）；翻页（pageTurn）：新页像漫画里切一刀那样斜着横切进来，刀口是一道墨线
     12. 开场（intro）：裁切线和角标浮出 → 主题行的格号标签弹出、主题滑入 → 右上角的页码落下、缩略格一格格弹出 → 大标题横切入 →
         第 0 拍按「格框 → 内容 → 大字 → 气泡」的顺序出场 → 重点词贴网点；之后引擎让形象落下
   - 没搬的：速度线、集中线做的整页背景（太满，只在大字落地、命令冲进来时闪一下；集中线只在 .cm-cut 格子里、插画四周铺一圈）；
     通用组件不做斜格（任意页面套不进去，格子一律是矩形，要斜格就用下面的 .cm-cut）；形象的走位、反应、空闲动作（引擎的形象部分统一做）
   - 漫画自己的可选组件（别的风格不认）：.cm-panel 分镜格、.cm-say 对白气泡（.tail-r 尾巴在右下，.tail-e 尾巴从右边横着伸出去）、.cm-sfx 拟声大字（.cool 钴蓝），
     样子在 comic.css 末尾；普通页面不用它们也完全成立
   - 漫画自己的版式组件（样板页 samples/comic.js 把每个都用了一遍，整段抄过去改字就行；写法见文件后半「漫画自己的版式组件」一节）：
     · .cm-cut[data-cm-cut="x,y x,y …"]：斜格（任意凸多边形的分镜格，点是格子自己的坐标，顺时针从左上角写起）。四边是「中间粗两头收」的
       毛笔墨线，右下错开网点阴影；写 data-cm-burst="cx,cy,r" 时格里铺一圈集中线（data-cm-burst-box="x0,y0,x1,y1" 限定铺在哪块，
       别铺到字底下）。到拍时墨线一条条甩出来 → 网点阴影浮出来 → 集中线往里收 → 里面的东西依次出场
     · .cm-slot > .cm-panel：分镜草稿位。第 0 拍是一个蓝铅笔虚线框（先把这页有几格交代清楚），到拍时格子上墨盖住它
     · .cm-art[data-cm-art="名字"]：墨线插画（这里画好，建页时填进去，可选的见 ART）；到拍时墨线一笔笔描出来 → 网点上色 → 漫符弹出来
     · .cm-cap：格子角上的旁白框（白底方框、墨影，<b class="cm-no">1</b> 是墨黑的格号；加 .ink 是墨黑底留白字）；从左边横切入
     · .cm-nar：大旁白框（结尾金句这类整句话，字大、横排）；.cm-logo：封面标题字（粗墨字、留白、朱红错位影子，只给 8 个字以内的标题）；
       .cm-fin：「完」字圆章；.cm-sfx.ink：墨黑拟声字（白边细墨线，漫画里最常见的那种）、.cm-sfx.sm 小一号
     · 格子里的子元素按「旁白框、插画 → 拟声字 → 气泡」排先后，页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 版式组件的可读性约定：
     · 气泡、旁白框一直留着，不轮换；气泡里写真话（做法、后果），不放只为热闹的口水话
     · 拟声字、漫符、集中线是装饰：拟声字一格最多一个、8 个字以内，墨黑或钴蓝（朱红留给重点词）；集中线只铺在插画四周，
       用 data-cm-burst-box 挡在字的外面
     · 斜格只斜格框，里面的字一律横排、不歪，字离斜边至少留 30px；格号就是阅读顺序（1、2、3……）
   - 自己加的出场名：frame、boing、bam、bubble、dash，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 集中线、速度线放在每页一层 .cm-fx 里（第一次用时加到页面最后，在内容上面、不接收指针），播完即删
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和缩略格（engine.css 的 .meta：右边距 64、top 40；按每页最多 4 拍、两位数页码量，留出余量后是 x 1340–1856、y 30–90）
     · 四边的裁切线以外（离舞台边 24px 以内）
   - 样子在 comic.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;
  const NS = 'http://www.w3.org/2000/svg';
  const f1 = n => Math.round(n * 10) / 10;
  /* 分镜格（整格画在伪元素里的组件）；出场时不跟着动的子元素 */
  const PANEL = '.card, .cell, .steps > li, .term, .shot, .cm-panel';
  const HOVER = '.card, .cell, .steps > li, .term, .shot, .copy, .cm-panel, .cm-cut';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .cm-fx, .cm-hv, svg.cm-cut-f, script, style';
  /* 默认出场按组件类名分：格子和一排格子的容器「格框先描出」，命令「横切入」，金句和拟声字「大字砸下」，气泡「啵」，标签「弹入」；
     漫画自己的版式组件：斜格「格框先描出」、插画「描线」（走 frame 的分派）、旁白框「横切入」、封面标题字和「完」字章「大字砸下」 */
  const BY = { card: 'frame', cell: 'frame', term: 'frame', shot: 'frame', 'cm-panel': 'frame', steps: 'frame', cells: 'frame', grid: 'frame', row: 'frame', col: 'frame', vs: 'frame',
    copy: 'dash', quote: 'bam', 'cm-sfx': 'bam', 'cm-say': 'bubble', tag: 'boing',
    'cm-cut': 'frame', 'cm-art': 'frame', 'cm-cap': 'dash', 'cm-nar': 'dash', 'cm-logo': 'bam', 'cm-fin': 'bam' };
  const DRAW = ['--cm-d1', '--cm-d2', '--cm-d3', '--cm-d4'];
  const VARS = DRAW.concat(['--cm-k', '--cm-p']);
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path', 'transform-origin'].concat(VARS);

  const isPanel = e => !!(e && e.matches && e.matches(PANEL));
  const isCopy = e => !!(e && e.matches && e.matches('.copy'));
  const isTag = e => !!(e && e.matches && e.matches('.tag'));
  const isBig = e => !!(e && e.matches && e.matches('.quote, .cm-sfx, .cm-logo, .cm-fin'));
  const isSay = e => !!(e && e.matches && e.matches('.cm-say'));
  const isCut = e => !!(e && e.matches && e.matches('.cm-cut'));
  const isArt = e => !!(e && e.matches && e.matches('.cm-art'));
  const isCap = e => !!(e && e.matches && e.matches('.cm-cap, .cm-nar'));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子 */
  const clean = e => { if (e && e.style) PROPS.forEach(k => e.style.removeProperty(k)); };
  const cleanVars = e => { if (e && e.style) VARS.forEach(k => e.style.removeProperty(k)); };
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  /* 子元素不归引擎管：记下原来的行内样式，动画播完原样还原 */
  const keep = e => { const s = e.getAttribute('style'); return () => { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  /* 元素自己的倾斜角（CSS rotate，来自页面写的 --r）：gsap 动画时会把 rotate 并进 transform，所以出场的角度要带上它 */
  function tiltOf(e) {
    if (!e || e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? (parseFloat(v) || 0) : 0;
  }
  /* 元素在页面里的框（舞台坐标，按排版位置算，不受动画里的位移、缩放影响） */
  function boxIn(e, slide) {
    let l = 0, t = 0, n = e;
    while (n && n !== slide) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    const w = e.offsetWidth || 0, h = e.offsetHeight || 0;
    return { l, t, w, h, r: l + w, b: t + h };
  }
  const live = slide => !!(slide && slide.classList.contains('active'));
  function fxLayer(slide) {
    let l = slide.querySelector(':scope > .cm-fx');
    if (!l) { l = document.createElement('div'); l.className = 'cm-fx'; l.setAttribute('aria-hidden', 'true'); slide.appendChild(l); }
    return l;
  }
  function svgEl(w, h, vb, inner) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', vb);
    s.setAttribute('width', w); s.setAttribute('height', h);
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = inner;
    return s;
  }

  /* =================================================================
     一次性的线：集中线（大字落地）、速度线（命令冲进来），播完即删
     ================================================================= */
  /* 集中线：沿元素外面一圈椭圆，一根根尖头朝里的楔形，闪一下就淡掉 */
  function focusLines(e) {
    const slide = e.closest && e.closest('.slide');
    if (still() || !live(slide)) return;
    const b = boxIn(e, slide), cx = b.l + b.w / 2, cy = b.t + b.h / 2;
    const rx = b.w / 2 + 34, ry = b.h / 2 + 28, n = 26;
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = (i + Math.random() * .6) / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const ix = cx + c * rx, iy = cy + s * ry, len = 46 + Math.random() * 46, w = 2 + Math.random() * 3;
      const ox = ix + c * len, oy = iy + s * len;
      d += `M${f1(ix)} ${f1(iy)}L${f1(ox - s * w)} ${f1(oy + c * w)}L${f1(ox + s * w)} ${f1(oy - c * w)}Z`;
    }
    const svg = svgEl(1920, 1080, '0 0 1920 1080', `<path d="${d}" fill="#16130F"/>`);
    svg.style.cssText = 'left:0;top:0';
    fxLayer(slide).appendChild(svg);
    G.fromTo(svg, { opacity: .5 }, { opacity: 0, duration: .42, ease: 'power1.in', onComplete: () => svg.remove() });
  }
  /* 速度线：元素左边几道横向的细楔形，从左往右一扫就散 */
  function speedLines(e) {
    const slide = e.closest && e.closest('.slide');
    if (still() || !live(slide)) return;
    const b = boxIn(e, slide);
    let d = '';
    for (let i = 0; i < 4; i++) {
      const y = b.t + b.h * (.2 + i * .2) + (Math.random() - .5) * 6, x1 = b.l - 18 - Math.random() * 14, x0 = x1 - 90 - Math.random() * 80, w = 1.6 + Math.random() * 1.4;
      d += `M${f1(x0)} ${f1(y)}L${f1(x1)} ${f1(y - w)}L${f1(x1)} ${f1(y + w)}Z`;
    }
    const svg = svgEl(1920, 1080, '0 0 1920 1080', `<path d="${d}" fill="#16130F"/>`);
    svg.style.cssText = 'left:0;top:0';
    fxLayer(slide).appendChild(svg);
    G.fromTo(svg, { opacity: .45, x: -24 }, { opacity: 0, x: 12, duration: .4, ease: 'power2.out', onComplete: () => svg.remove() });
  }

  /* =================================================================
     出场
     ================================================================= */
  function fadeIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    return .3;
  }
  /* 一下子出现：vis 为 true 时连 visibility 一起管（只给节拍单元本身用） */
  function appear(tl, e, t, vis, dur) {
    tl.fromTo(e, vis ? { autoAlpha: 0 } : { opacity: 0 }, Object.assign(vis ? { autoAlpha: 1 } : { opacity: 1 }, { duration: dur || .1, ease: 'none', immediateRender: true }), t);
  }

  /* 一个子元素弹入（字、小标签）；子元素不归引擎管，播完还原它原来的行内样式 */
  function popKid(tl, c, t) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, scale: .62, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: .32, ease: 'back.out(2.6)', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return .32;
  }
  /* 一个子元素轻轻升上来（终端里的一行、截图） */
  function riseKid(tl, c, t) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .26, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return .26;
  }

  /* 一格「格框先描出」：四条墨线依次描出 → 网点阴影浮出来 → 里面的东西依次弹入 */
  function frameOne(tl, e, t, vis) {
    appear(tl, e, t, vis, .12);
    DRAW.forEach((v, i) => tl.fromTo(e, { [v]: 0 }, { [v]: 1, duration: .1, ease: 'power1.in', immediateRender: true }, t + i * .08));
    tl.fromTo(e, { '--cm-k': 0 }, { '--cm-k': 1, duration: .26, ease: 'back.out(2.4)', immediateRender: true }, t + .3);
    const end = Math.min(Math.max(.56, kidsIn(tl, e, t, .26)), 1.1);
    tl.call(() => clean(e), null, t + end);
    return end;
  }
  /* 格子里的子元素依次出场，返回最后一个播完的时刻（相对 t）。漫画的版式组件按「旁白框、插画 → 拟声字 → 气泡」排：
     旁白框横切入、插画描线、拟声字砸下（晚 .3 秒）、气泡最后冒出（晚 .44 秒）；别的照旧：格子描出、命令冲进来、终端里升上来、其余弹入 */
  function kidsIn(tl, e, t, base) {
    const kids = kidsOf(e), soft = e.matches('.term, .shot');
    const plain = kids.filter(c => !c.matches('.cm-sfx, .cm-say'));
    const gap = plain.length ? Math.min(.07, .3 / plain.length) : 0;
    let end = 0;
    kids.forEach(c => {
      const s = c.matches('.cm-sfx') ? base + .3 : c.matches('.cm-say') ? base + .44 : base + plain.indexOf(c) * gap;
      const tilt = tiltOf(c);
      const d = isCut(c) ? cutOne(tl, c, t + s, false) : isPanel(c) ? frameOne(tl, c, t + s, false) : isCopy(c) ? dashOne(tl, c, t + s, false, tilt)
        : isArt(c) ? artIn(tl, c, t + s, false) : isCap(c) ? dashOne(tl, c, t + s, false, tilt) : isBig(c) ? bamOne(tl, c, t + s, false, tilt)
        : isSay(c) ? bubbleOne(tl, c, t + s, false, tilt) : soft ? riseKid(tl, c, t + s) : popKid(tl, c, t + s);
      end = Math.max(end, s + d);
    });
    return end;
  }

  /* 横切入：带着一点斜从左边冲进来（命令冲进来时身后拖几道速度线、网点阴影随后浮出） */
  function dashOne(tl, e, t, vis, tilt) {
    appear(tl, e, t, vis, .08);
    tl.fromTo(e, { x: -110, skewX: -14, rotation: tilt }, { x: 0, skewX: 0, rotation: tilt, duration: .36, ease: 'power3.out', immediateRender: true }, t);
    let end = .36;
    if (isCopy(e)) {
      tl.fromTo(e, { '--cm-k': 0 }, { '--cm-k': 1, duration: .24, ease: 'back.out(2.4)', immediateRender: true }, t + .22);
      tl.call(() => speedLines(e), null, t + .04);
      end = .46;
    }
    tl.call(() => clean(e), null, t + end);
    return end;
  }

  /* 弹入：从小、歪一点弹到位 */
  function boingOne(tl, e, t, vis, tilt) {
    appear(tl, e, t, vis, .1);
    tl.fromTo(e, { scale: .55, rotation: tilt - 5 }, { scale: 1, rotation: tilt, duration: .38, ease: 'back.out(2.4)', immediateRender: true }, t);
    tl.call(() => clean(e), null, t + .38);
    return .38;
  }

  /* 大字砸下：从很大砸下来、压一下回弹，落地一瞬四周闪一圈集中线（封面标题字本来就大，从 1.5 倍砸下） */
  function bamOne(tl, e, t, vis, tilt) {
    appear(tl, e, t, vis, .04);
    tl.fromTo(e, { scale: e.matches('.cm-logo') ? 1.5 : 2.3, rotation: tilt - 9 }, { scale: .94, rotation: tilt, duration: .2, ease: 'power3.in', immediateRender: true }, t);
    tl.to(e, { scale: 1, duration: .22, ease: 'back.out(3)' }, t + .2);
    tl.call(() => focusLines(e), null, t + .2);
    tl.call(() => clean(e), null, t + .42);
    return .42;
  }

  /* 啵：气泡从尾巴那头弹性冒出来 */
  function bubbleOne(tl, e, t, vis, tilt) {
    const o = !isSay(e) ? '50% 100%' : e.classList.contains('tail-e') ? '108% 60%' : e.classList.contains('tail-r') ? '78% 115%' : '22% 115%';
    appear(tl, e, t, vis, .06);
    tl.fromTo(e, { scale: 0, rotation: tilt, transformOrigin: o }, { scale: 1, rotation: tilt, transformOrigin: o, duration: .5, ease: 'elastic.out(1.1,.5)', immediateRender: true }, t);
    tl.call(() => clean(e), null, t + .5);
    return .5;
  }

  /* 一组：容器一下子亮出来，里面的格子依次描出、命令冲进来、标签和字弹入 */
  function group(tl, e, t) {
    const kids = kidsOf(e);
    appear(tl, e, t, true, .08);
    tl.call(() => { e.style.removeProperty('opacity'); e.style.removeProperty('visibility'); }, null, t + .09);
    const gap = Math.min(.14, .55 / kids.length);
    let end = .1;
    kids.forEach((c, i) => {
      const s = .02 + i * gap, tilt = tiltOf(c);
      const d = isPanel(c) ? frameOne(tl, c, t + s, false) : isCopy(c) ? dashOne(tl, c, t + s, false, tilt)
        : isBig(c) ? bamOne(tl, c, t + s, false, tilt) : isSay(c) ? bubbleOne(tl, c, t + s, false, tilt) : boingOne(tl, c, t + s, false, tilt);
      end = Math.max(end, s + d);
    });
    return Math.min(end, 1.15);
  }
  const hasParts = e => kidsOf(e).some(c => isPanel(c) || isCopy(c) || isTag(c));
  /* 按元素分派：格子描出、命令冲进来、装着这些的容器依次出场，其余按 fallback（弹入 / 大字 / 气泡） */
  function route(tl, e, t, ctx, fallback) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    if (isCut(e)) return cutOne(tl, e, t, true);
    if (isPanel(e)) return frameOne(tl, e, t, true);
    if (isArt(e)) return artIn(tl, e, t, true);
    if (isCopy(e)) return dashOne(tl, e, t, true, tilt);
    if (fallback === boingOne && hasParts(e)) return group(tl, e, t);
    return fallback(tl, e, t, true, tilt);
  }

  /* =================================================================
     漫画自己的版式组件（.cm-*）：斜格、草稿位、墨线插画、旁白框、标题字、「完」字章。
     样子在 comic.css 末尾同名的一节；样板页 samples/comic.js 把每个都用了一遍
     ================================================================= */
  const K = '#16130F', WH = '#FFFDF8', BL = '#1D6CB4', RD = '#E2452A', K2 = '#4A443B';
  /* 网点（插画上色、斜格的阴影用）：放进引擎公用的 .deck-defs，id 都以 cm- 开头 */
  const tone = (id, gap, r, c) => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="${gap / 2}" cy="${gap / 2}" r="${r}" fill="${c}"/></pattern>`;
  const DEFS = tone('cm-tone', 6, 1.45, K) + tone('cm-tone-d', 5, 1.85, K) + tone('cm-tone-c', 6, 1.6, BL);

  /* ---------- 墨线插画 .cm-art[data-cm-art="名字"] ----------
     画法约定：.ln 是墨线（出场时一笔笔描出来），.tn 是网点、白线这类上色（描完再浮上来），.mp 是漫符、闪光（最后弹出来；.mp 自己不写 transform）。
     插画里不放字 */
  const SH = `fill="${WH}" stroke="${K}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const LN = (w, c) => `fill="none" stroke="${c || K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const TONE = id => `fill="url(#${id || 'cm-tone'})"`;
  const at = (tf, s) => `<g transform="${tf}">${s}</g>`;
  const steam = (x, y) => `<path class="ln" d="M${x} ${y}c-11-12 9-26 0-38c-9-12 11-26 2-40" ${LN(4.5, K2)}/>`;
  const spark = (x, y, r) => `<path class="mp" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${WH}" stroke="${K}" stroke-width="3.2" stroke-linejoin="round"/>`;
  const leaf = (x, y, r, s, cls) => at(`translate(${x} ${y}) rotate(${r}) scale(${s})`,
    `<path class="${cls || 'ln'}" d="M-24 0C-12-13 12-13 24 0C12 13-12 13-24 0Z" ${SH}/><path class="${cls || 'ln'}" d="M-19 0H18" ${LN(2.6)}/>`);
  /* 水流：墨线描边、中间一道留白 */
  const stream = d => `<path class="ln" d="${d}" ${LN(10)}/><path class="tn" d="${d}" ${LN(4, WH)}/>`;
  /* 盖碗（碗口中心在 0,0）：o.lid 盖着盖子；不盖时 o.tea 是茶汤的网点（不写是空碗）、o.leaves 碗里有茶叶 */
  function gaiwan(o) {
    o = o || {};
    let s = `<ellipse class="tn" cx="8" cy="124" rx="130" ry="15" ${TONE()} fill-opacity=".7"/>`
      + `<ellipse class="ln" cx="0" cy="116" rx="136" ry="20" ${SH}/>`
      + `<path class="ln" d="M-36 90L-32 107Q0 113 32 107L36 90" ${SH}/>`
      + `<path class="ln" d="M-118 2C-112 60-62 96 0 96C62 96 112 60 118 2Z" ${SH}/>`
      + `<path class="tn" d="M102 14C98 52 70 80 26 92C76 88 108 58 113 14Z" ${TONE()}/>`
      + `<path class="ln" d="M-110 32Q0 76 110 32" ${LN(6, BL)}/><path class="ln" d="M-100 50Q0 90 100 50" ${LN(3, BL)}/>`;
    if (o.lid) {
      // 碗口 → 盖子（坐在碗口里，圆顶、青花一道、顶上一个圈足盖钮）→ 碗口前沿压在盖子前面
      s += `<ellipse class="ln" cx="0" cy="0" rx="123" ry="22" ${SH}/>`
        + `<path class="ln" d="M-104 2C-98-46-58-78 0-78C58-78 98-46 104 2A104 17 0 0 1-104 2Z" ${SH}/>`
        + `<path class="tn" d="M60-64C86-48 98-26 101-4L82 3C80-22 72-44 60-64Z" ${TONE()}/>`
        + `<path class="ln" d="M-93-24Q0-6 93-24" ${LN(4, BL)}/>`
        + `<path class="ln" d="M-15-76L-19-88H19L15-76" ${SH}/><ellipse class="ln" cx="0" cy="-89" rx="23" ry="7" ${SH}/>`
        + `<path class="ln" d="M-123 0A123 22 0 0 0 123 0" ${LN(5)}/>`;
    } else {
      s += `<ellipse class="ln" cx="0" cy="0" rx="123" ry="23" ${SH}/>`
        + `<ellipse class="ln" cx="0" cy="2" rx="107" ry="16" fill="${o.tea ? `url(#${o.tea})` : WH}" stroke="${K}" stroke-width="3"/>`
        + (o.tea ? '' : `<path class="tn" d="M-104 0A104 15 0 0 1 104 0A104 9 0 0 0-104 0Z" ${TONE()}/>`)
        + (o.leaves ? leaf(-40, 6, 12, .62) + leaf(8, 8, -16, .58) + leaf(46, 4, 30, .5) : '');
    }
    return s;
  }
  /* 水壶（壶底中心在 0,0，壶嘴朝左；壶嘴尖大约在 -134,-130） */
  function kettle() {
    return `<path class="ln" d="M-56-116C-52-186 52-186 56-116" ${LN(12)}/><path class="tn" d="M-56-116C-52-186 52-186 56-116" ${LN(4, WH)}/>`
      + `<path class="ln" d="M-80-58C-108-62-128-92-142-126L-126-134C-114-106-100-88-76-82Z" ${SH}/>`
      + `<path class="ln" d="M-82-6C-96-66-66-124 0-124C66-124 96-66 82-6Q0 8-82-6Z" ${SH}/>`
      + `<path class="tn" d="M48-114C78-94 92-58 84-12L66-10C72-50 66-88 48-114Z" ${TONE()}/>`
      + `<path class="ln" d="M-90-28Q0-12 90-28" ${LN(4)}/>`
      + `<ellipse class="ln" cx="0" cy="-124" rx="46" ry="10" ${SH}/><path class="ln" d="M-12-132Q0-152 12-132Z" ${SH}/>`;
  }
  /* 一芽两叶，插在一小碟干茶上（碟子中心在 0,0） */
  function sprig() {
    return `<ellipse class="tn" cx="8" cy="12" rx="92" ry="11" ${TONE()} fill-opacity=".7"/>`
      + `<ellipse class="ln" cx="0" cy="4" rx="96" ry="16" ${SH}/>`
      + `<path class="ln" d="M-64 2Q-36-26 0-26Q36-26 64 2Q0 12-64 2Z" fill="url(#cm-tone)" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`
      + `<path class="ln" d="M-42-6q8-9 15 0M-16-14q8-9 15 0M14-12q8-9 15 0M34-4q8-9 15 0" ${LN(3)}/>`
      + `<path class="ln" d="M0-24C4-52-4-84 0-112" ${LN(5)}/>`
      + `<path class="ln" d="M-2-56C-26-50-64-64-88-102C-52-112-16-92-2-56Z" ${SH}/><path class="tn" d="M-8-60C-32-56-60-70-80-96C-58-82-32-68-8-60Z" ${TONE()}/><path class="ln" d="M-5-59Q-42-74-82-100" ${LN(3)}/>`
      + `<path class="ln" d="M2-80C28-76 66-92 88-130C52-138 14-118 2-80Z" ${SH}/><path class="tn" d="M8-84C36-82 62-98 80-124C62-100 36-88 8-84Z" ${TONE()}/><path class="ln" d="M5-83Q42-100 82-128" ${LN(3)}/>`
      + `<path class="ln" d="M0-110C-14-130-10-160 0-178C10-160 14-130 0-110Z" ${SH}/><path class="ln" d="M0-118V-166" ${LN(2.6)}/>`;
  }
  /* 茶匙：长柄朝左、匙头在右（匙头中心大约在 10,0） */
  const spoon = `<path class="ln" d="M-118-6L-28-2" ${LN(10)}/><path class="tn" d="M-116-6L-30-2" ${LN(3.5, WH)}/>`
    + `<path class="ln" d="M-30 0C-30-16-6-22 18-20C42-18 52-6 50 4C48 16 26 22 2 20C-20 18-30 12-30 0Z" ${SH}/>`
    + `<path class="tn" d="M-22 5C-18 14 4 18 24 16C40 14 46 8 47 2C40 10 22 14 2 12C-12 11-20 9-22 5Z" ${TONE()}/>`;
  /* 会做表情的茶杯（杯口中心在 0,0）：tea 是茶汤的网点（cm-tone-d 浓、cm-tone 淡），face 见下面 */
  const blush = (x, y) => `<path class="ln" d="M${x - 10} ${y + 5}l5-9M${x - 2} ${y + 5}l5-9M${x + 6} ${y + 5}l5-9" ${LN(2.6, RD)}/>`;
  const FACE = {
    // 苦：眼睛 > <、嘴是锯齿；额头几道钴蓝阴沉线，杯口冒烫气
    bitter: `<path class="ln" d="M-46 42L-24 53L-46 64M46 42L24 53L46 64" ${LN(5)}/><path class="ln" d="M-26 88L-17 80L-8 88L1 80L10 88L19 80L26 86" ${LN(4.5)}/>`
      + `<g class="mp"><path d="M-30 15V32M-15 16V35M0 16V36M15 16V35M30 15V32" ${LN(3.2, BL)}/></g>`
      + `<g class="mp"><path d="M-44-24l9-11-9-11 9-11M-4-30l9-11-9-11 9-11M36-24l9-11-9-11 9-11" ${LN(4)}/></g>`,
    // 涩：眼睛挤成两道、嘴是波浪线；脸边一颗汗滴、两道发抖线
    sour: `<path class="ln" d="M-48 52Q-34 42-20 54M20 54Q34 42 48 52" ${LN(5)}/><path class="ln" d="M-22 86Q-11 76 0 86Q11 96 22 86" ${LN(4.5)}/>`
      + `<g class="mp"><path d="M72 24C62 40 62 52 72 54C82 52 82 40 72 24Z" fill="${WH}" stroke="${BL}" stroke-width="3.5" stroke-linejoin="round"/></g>`
      + `<g class="mp"><path d="M-112 34l-15-5M-114 54h-17M-112 74l-15 5" ${LN(3.6)}/></g>`,
    // 浓：蚊香眼、嘴张成 O；杯口冒出一堆茶叶
    strong: `<path class="ln" d="M-46 54a12 12 0 1 0 24 0a9 9 0 1 0-18 0a6 6 0 1 0 12 0M22 54a12 12 0 1 0 24 0a9 9 0 1 0-18 0a6 6 0 1 0 12 0" ${LN(3.6)}/>`
      + `<ellipse class="ln" cx="0" cy="88" rx="9" ry="11" fill="${K}" stroke="${K}" stroke-width="3"/>`
      + `<g class="mp">${leaf(-44, -10, -28, .95, 'x')}${leaf(-12, -22, -72, 1, 'x')}${leaf(22, -16, -108, .95, 'x')}${leaf(52, -6, -150, .85, 'x')}</g>`,
    // 笑：眼睛 ^ ^、张嘴笑（朱红舌头）、朱红腮红；四周几颗闪光
    happy: `<path class="ln" d="M-46 56Q-33 40-20 56M20 56Q33 40 46 56" ${LN(5)}/>`
      + `<path class="ln" d="M-24 72Q0 106 24 72Z" fill="${K}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M-11 90Q0 82 11 90Q0 98-11 90Z" fill="${RD}"/>`
      + blush(-60, 70) + blush(60, 70) + spark(-120, -22, 15) + spark(118, -36, 19) + spark(128, 8, 10),
    // 眨眼笑：一只眼 ^、一只眨着，嘴角上扬
    wink: `<path class="ln" d="M-46 56Q-33 40-20 56M20 52Q33 48 46 54" ${LN(5)}/><path class="ln" d="M-22 74Q0 96 22 74" ${LN(5)}/>`
      + blush(-60, 70) + blush(60, 70) + spark(-122, -10, 17) + spark(116, -30, 14) + spark(126, 14, 11),
    // 满足：眯着眼、抿嘴笑；杯口一缕热气，旁边一颗闪光
    calm: `<path class="ln" d="M-46 50Q-33 64-20 50M20 50Q33 64 46 50" ${LN(5)}/><path class="ln" d="M-16 78Q0 92 16 78" ${LN(5)}/>`
      + blush(-60, 70) + blush(60, 70) + steam(-8, -22) + steam(14, -26) + spark(-118, -18, 16) + spark(120, -6, 13),
  };
  function cup(face, tea) {
    return `<ellipse class="tn" cx="8" cy="132" rx="76" ry="10" ${TONE()} fill-opacity=".7"/>`
      + `<path class="ln" d="M-30 108L-26 124Q0 129 26 124L30 108" ${SH}/>`
      + `<path class="ln" d="M-92 2C-90 70-48 112 0 112C48 112 90 70 92 2Z" ${SH}/>`
      + `<path class="tn" d="M78 16C76 54 56 86 22 104C62 96 86 62 88 16Z" ${TONE()}/>`
      + `<ellipse class="ln" cx="0" cy="0" rx="94" ry="18" ${SH}/>`
      + `<ellipse class="ln" cx="0" cy="2" rx="80" ry="12" fill="url(#${tea})" stroke="${K}" stroke-width="3"/>`
      + (FACE[face] || '');
  }
  const CUP = '-150 -82 300 222';
  const ART = {
    // 封面、结尾：盖着盖子的盖碗，冒三缕热气，几颗闪光
    cover: { vb: '-180 -204 360 354', svg: () => gaiwan({ lid: 1 }) + steam(-26, -104) + steam(0, -110) + steam(26, -104) + spark(-150, -70, 20) + spark(148, -116, 26) + spark(162, -32, 14) },
    // 三样东西：盖碗、一芽两叶的干茶、水壶（壶嘴冒热气）
    gaiwan: { vb: '-150 -102 300 244', svg: () => gaiwan({ lid: 1 }) },
    sprig: { vb: '-115 -192 230 216', svg: sprig },
    kettle: { vb: '-172 -222 286 236', svg: () => kettle() + steam(-150, -142) + steam(-126, -150) },
    // 四格：温杯（壶往空碗里冲热水）、投茶（茶匙里的茶叶落进碗里）、注水（水沿碗边倒进去）、好茶（盖上盖子，热气、闪光）
    'koma-warm': { vb: '0 0 360 260', svg: () => at('translate(140 170) scale(.74)', gaiwan()) + at('translate(300 126) rotate(-32) scale(.6)', kettle())
      + stream('M190 102C188 120 178 140 168 164') + steam(84, 150) + steam(108, 142) },
    'koma-drop': { vb: '0 0 360 260', svg: () => at('translate(200 172) scale(.76)', gaiwan({ leaves: 1 })) + at('translate(96 70) rotate(32) scale(.85)', spoon + leaf(4, -4, 10, .5) + leaf(24, 2, -14, .46))
      + leaf(154, 114, 40, .62) + leaf(180, 130, -24, .58) + leaf(166, 150, 66, .52) + `<path class="ln" d="M146 84v18M160 96v16M186 110v16" ${LN(3)}/>` },
    'koma-pour': { vb: '0 0 360 260', svg: () => at('translate(236 174) scale(.74)', gaiwan({ tea: 'cm-tone', leaves: 1 })) + at('translate(76 130) rotate(32) scale(-.56 .56)', kettle())
      + stream('M178 110C176 132 168 152 162 170') + `<g class="mp"><path d="M204 180q34 9 68-2M218 170q22-7 44 1" ${LN(3.2)}/></g>` },
    'koma-done': { vb: '0 0 360 260', svg: () => at('translate(180 184) scale(.76)', gaiwan({ lid: 1 })) + steam(158, 106) + steam(180, 100) + steam(202, 106)
      + spark(56, 92, 18) + spark(300, 76, 22) + spark(318, 150, 12) + spark(44, 168, 10) },
    // 错误示范、正确示范：会做表情的茶杯
    'cup-bitter': { vb: CUP, svg: () => cup('bitter', 'cm-tone-d') },
    'cup-sour': { vb: CUP, svg: () => cup('sour', 'cm-tone-d') },
    'cup-strong': { vb: CUP, svg: () => cup('strong', 'cm-tone-d') },
    'cup-happy': { vb: CUP, svg: () => cup('happy', 'cm-tone') },
    'cup-wink': { vb: CUP, svg: () => cup('wink', 'cm-tone') },
    'cup-calm': { vb: CUP, svg: () => cup('calm', 'cm-tone') },
  };
  function fillArt(el) {
    const a = ART[el.dataset.cmArt];
    if (!a) { console.warn(`[Deck] 漫画插画 data-cm-art="${el.dataset.cmArt}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="${a.vb}" focusable="false">${a.svg()}</svg>`;
  }

  /* ---------- 斜格 .cm-cut[data-cm-cut]：建页时画上格框（一层 svg.cm-cut-f 垫在格子内容下面） ----------
     一层里从下往上：右下错开的网点阴影 .cm-sh → 格子的留白 → 集中线 .cm-bl（裁在格子里，可以再用 data-cm-burst-box 限定）→ 每条边一道毛笔墨线 .cm-ed */
  const nums = s => String(s || '').split(/[\s,]+/).filter(Boolean).map(Number);
  function pointsOf(s) {
    const v = nums(s), P = [];
    for (let i = 0; i + 1 < v.length; i += 2) if (Number.isFinite(v[i]) && Number.isFinite(v[i + 1])) P.push([v[i], v[i + 1]]);
    return P;
  }
  const ptsAttr = P => P.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  /* 凸多边形裁进一个矩形（一条边一条边地裁） */
  function clipBox(P, x0, y0, x1, y1) {
    const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const sides = [[p => p[0] >= x0, (a, b) => lerp(a, b, (x0 - a[0]) / (b[0] - a[0]))], [p => p[0] <= x1, (a, b) => lerp(a, b, (x1 - a[0]) / (b[0] - a[0]))],
      [p => p[1] >= y0, (a, b) => lerp(a, b, (y0 - a[1]) / (b[1] - a[1]))], [p => p[1] <= y1, (a, b) => lerp(a, b, (y1 - a[1]) / (b[1] - a[1]))]];
    let out = P;
    sides.forEach(([inside, cut]) => {
      const src = out; out = [];
      src.forEach((cur, i) => {
        const prev = src[(i + src.length - 1) % src.length];
        if (inside(cur)) { if (!inside(prev)) out.push(cut(prev, cur)); out.push(cur); } else if (inside(prev)) out.push(cut(prev, cur));
      });
    });
    return out;
  }
  /* 集中线：从格子边上一根根尖头朝里的楔形，收到中心 (cx, cy) 外面半径 r 的椭圆上（每次建页画得一样） */
  function rays(cx, cy, r, seed) {
    let s = (seed * 7919) % 233280 || 1;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let d = '';
    for (let i = 0, n = 48; i < n; i++) {
      const a = (i + rnd() * .8) / n * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), rr = r * (1 + rnd() * .3);
      const ix = cx + c * rr, iy = cy + sn * rr * .84, D = 1100, w = 12 + rnd() * 22, ox = cx + c * D, oy = cy + sn * D;
      d += `M${f1(ix)} ${f1(iy)}L${f1(ox - sn * w)} ${f1(oy + c * w)}L${f1(ox + sn * w)} ${f1(oy - c * w)}Z`;
    }
    return d;
  }
  let cutSeq = 0;
  function buildCut(el) {
    if (el.querySelector(':scope > svg.cm-cut-f')) return;
    const P = pointsOf(el.dataset.cmCut);
    if (P.length < 3) { console.warn('[Deck] 斜格 data-cm-cut 至少要三个点，写成 "x,y x,y x,y"（格子自己的坐标）'); return; }
    const M = 32, W0 = Math.max(...P.map(p => p[0])) + M * 2, H0 = Math.max(...P.map(p => p[1])) + M * 2;
    const EX = 7, BW = 6, pt = v => f1(v[0]) + ' ' + f1(v[1]);
    let edges = '';
    P.forEach((p, i) => {
      const q = P[(i + 1) % P.length], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const a = [p[0] - ux * EX, p[1] - uy * EX], b = [q[0] + ux * EX, q[1] + uy * EX], c = (k, w) => [p[0] + dx * k - uy * w, p[1] + dy * k + ux * w];
      edges += `<path class="cm-ed" data-o="${pt(a)}" d="M${pt(a)}C${pt(c(.3, BW * 1.1))} ${pt(c(.7, BW * .9))} ${pt(b)}C${pt(c(.7, -BW * .8))} ${pt(c(.3, -BW))} ${pt(a)}Z" fill="${K}"/>`;
    });
    let burst = '';
    const bs = nums(el.dataset.cmBurst);
    if (bs.length >= 3 && bs.every(Number.isFinite)) {
      const bx = nums(el.dataset.cmBurstBox), box = bx.length === 4 && bx.every(Number.isFinite) ? bx : [-1e4, -1e4, 1e4, 1e4];
      const id = 'cm-clip-' + (++cutSeq);
      // 限定的那条边落在格子里面时，集中线到那条边前 120px 渐渐淡掉（不是一刀切齐）
      const xs = P.map(p => p[0]), ys = P.map(p => p[1]), F = 120;
      const fade = box[3] < Math.max(...ys) - 1 ? [0, box[3] - F, 0, box[3]] : box[0] > Math.min(...xs) + 1 ? [box[0] + F, 0, box[0], 0]
        : box[2] < Math.max(...xs) - 1 ? [box[2] - F, 0, box[2], 0] : box[1] > Math.min(...ys) + 1 ? [0, box[1] + F, 0, box[1]] : null;
      const fill = fade ? `url(#${id}g)` : K;
      burst = `<clipPath id="${id}"><polygon points="${ptsAttr(clipBox(P, box[0], box[1], box[2], box[3]))}"/></clipPath>`
        + (fade ? `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${fade[0]}" y1="${fade[1]}" x2="${fade[2]}" y2="${fade[3]}"><stop offset="0" stop-color="${K}" stop-opacity=".6"/><stop offset="1" stop-color="${K}" stop-opacity="0"/></linearGradient>` : '')
        + `<g clip-path="url(#${id})"><g class="cm-bl" data-o="${bs[0]} ${bs[1]}"><path d="${rays(bs[0], bs[1], bs[2], cutSeq)}" fill="${fill}"${fade ? '' : ' fill-opacity=".6"'}/></g></g>`;
    }
    el.insertAdjacentHTML('afterbegin', `<svg class="cm-cut-f" viewBox="${-M} ${-M} ${W0} ${H0}" width="${W0}" height="${H0}" style="left:${-M}px;top:${-M}px" aria-hidden="true" focusable="false">`
      + `<g class="cm-sh"><polygon points="${ptsAttr(P)}" transform="translate(14 14)" fill="url(#cm-tone)" fill-opacity=".55"/></g>`
      + `<polygon points="${ptsAttr(P)}" fill="${WH}"/>${burst}${edges}</svg>`);
  }
  /* 斜格出场、退场时 gsap 留在 svg 里的变形和透明度，收尾时直接清掉（gsap 还会写上 translate/rotate/scale: none） */
  const SVGP = ['opacity', 'transform', 'transform-origin', 'translate', 'rotate', 'scale'];
  function cleanCut(f) {
    f.querySelectorAll('.cm-ed, .cm-sh, .cm-bl').forEach(n => {
      n.removeAttribute('transform'); n.removeAttribute('data-svg-origin');
      SVGP.forEach(k => n.style.removeProperty(k));
    });
  }
  /* 一格斜格：墨线一条条从起点甩出来 → 网点阴影从格子底下滑出来 → 集中线往里收 → 里面的东西依次出场 */
  function cutOne(tl, e, t, vis) {
    appear(tl, e, t, vis, .1);
    const f = e.querySelector(':scope > svg.cm-cut-f');
    let lines = .3;
    if (f) {
      const eds = [...f.querySelectorAll('.cm-ed')], sh = f.querySelector('.cm-sh'), bl = f.querySelector('.cm-bl');
      const gap = Math.min(.08, .3 / Math.max(1, eds.length));
      eds.forEach((p, i) => { const o = p.getAttribute('data-o'); tl.fromTo(p, { scale: 0, svgOrigin: o }, { scale: 1, svgOrigin: o, duration: .11, ease: 'power1.in', immediateRender: true }, t + i * gap); });
      lines = eds.length * gap + .04;
      if (sh) tl.fromTo(sh, { opacity: 0, x: -14, y: -14 }, { opacity: 1, x: 0, y: 0, duration: .26, ease: 'back.out(2.4)', immediateRender: true }, t + lines);
      if (bl) { const o = bl.getAttribute('data-o'); tl.fromTo(bl, { opacity: 0, scale: 1.45, svgOrigin: o }, { opacity: 1, scale: 1, svgOrigin: o, duration: .32, ease: 'power3.out', immediateRender: true }, t + lines - .06); }
      tl.call(() => cleanCut(f), null, t + lines + .34);
    }
    const end = Math.min(Math.max(lines + .34, kidsIn(tl, e, t, Math.min(lines, .3))), 1.15);
    tl.call(() => clean(e), null, t + end);
    return end;
  }
  /* 插画描线：墨线一笔笔描出来 → 网点、留白浮上来 → 漫符、闪光一个个弹出来 */
  function artIn(tl, e, t, vis) {
    appear(tl, e, t, vis, .06);
    const svg = e.querySelector('svg');
    if (!svg) return .1;
    const lines = [...svg.querySelectorAll('.ln')], tones = [...svg.querySelectorAll('.tn')], mps = [...svg.querySelectorAll('.mp')];
    const gap = lines.length ? Math.min(.022, .24 / lines.length) : 0;
    lines.forEach((p, i) => {
      let L = 0;
      try { L = Math.ceil(p.getTotalLength()) + 2; } catch (err) { L = 0; }
      if (L > 2) tl.fromTo(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power1.inOut', immediateRender: true }, t + i * gap);
    });
    const drawn = lines.length * gap + .3;
    if (tones.length) tl.fromTo(tones, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'none', immediateRender: true }, t + drawn * .6);
    mps.forEach((m, i) => tl.fromTo(m, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .3, ease: 'back.out(2.6)', immediateRender: true }, t + drawn - .04 + i * .05));
    const end = Math.max(drawn, mps.length ? drawn - .04 + .3 + (mps.length - 1) * .05 : 0);
    tl.call(() => { cleanArt(svg); clean(e); }, null, t + end + .01);
    return end;
  }
  function cleanArt(svg) {
    svg.querySelectorAll('.ln').forEach(p => { p.style.removeProperty('stroke-dasharray'); p.style.removeProperty('stroke-dashoffset'); });
    svg.querySelectorAll('.tn').forEach(p => p.style.removeProperty('opacity'));
    svg.querySelectorAll('.mp').forEach(m => { m.removeAttribute('transform'); m.removeAttribute('data-svg-origin'); SVGP.forEach(k => m.style.removeProperty(k)); });
  }

  const FX = {
    // 格框先描出：格子、一排格子的容器
    frame(tl, e, t, ctx) { return route(tl, e, t, ctx, boingOne); },
    // 内容弹入：默认出场（正文、标签）；格子、命令、装着它们的容器转去各自的出场
    boing(tl, e, t, ctx) { return route(tl, e, t, ctx, boingOne); },
    // 大字砸下：金句、拟声大字
    bam(tl, e, t, ctx) { return route(tl, e, t, ctx, bamOne); },
    // 啵：对白气泡
    bubble(tl, e, t, ctx) { return route(tl, e, t, ctx, bubbleOne); },
    // 横切入：大标题、命令
    dash(tl, e, t, ctx) {
      if (e instanceof SVGElement) return fadeIn(tl, e, t);
      return dashOne(tl, e, t, !e.classList.contains('s-title'), ctx && ctx.tilt ? ctx.tilt() : tiltOf(e));
    },
  };
  /* 这一块用哪种出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 boing） */
  function fxName(e) {
    const n = e.dataset && e.dataset.in;
    if (n) return n;
    const c = Object.keys(BY).find(k => e.classList && e.classList.contains(k));
    return c ? BY[c] : 'boing';
  }
  /* 同一拍里的先后：格子和字照常 → 大字排在它们后面 → 气泡最后 */
  const rankOf = e => { const n = fxName(e); return n === 'bubble' ? 2 : n === 'bam' ? 1 : 0; };
  function order(items) {   // items：[{ el, at（默认开始时刻）, fixed（写了 data-delay，不挪）}]
    const out = items.map(x => x.at);
    let last = -Infinity;
    [0, 1, 2].forEach(r => {
      let k = 0, top = last;
      items.forEach((x, i) => {
        if (rankOf(x.el) !== r) return;
        if (r > 0 && !x.fixed && last > -Infinity) out[i] = last + (r === 1 ? .32 : .26) + k++ * .1;
        top = Math.max(top, out[i]);
      });
      last = top;
    });
    return out;
  }

  /* =================================================================
     悬停：格子抬起在 comic.css 的 :hover 里；这里在格子右上角冒出三道钴蓝效果线
     ================================================================= */
  const HV_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#1D6CB4" stroke-width="3.2" stroke-linecap="round">'
    + '<path d="M9.4 36.6 L24.4 31.1"/><path d="M6.4 32.3 L16.7 20"/><path d="M1.7 30.2 L4.5 14.4"/></g></svg>';
  let hovered = null;
  function hvOf(slide) {
    let h = slide.querySelector(':scope > .cm-hv');
    if (!h) { h = document.createElement('i'); h.className = 'cm-hv'; h.setAttribute('aria-hidden', 'true'); h.innerHTML = HV_SVG; slide.appendChild(h); }
    return h;
  }
  function unhover() {
    hovered = null;
    document.querySelectorAll('.cm-hv.on').forEach(h => h.classList.remove('on'));
  }
  function onOver(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const t = e.target && e.target.closest ? e.target.closest(HOVER) : null;
    if (t === hovered) return;
    unhover();
    if (!t || still() || t.matches('.cell.idle') || !t.closest('.slide.active[data-scene="comic"]')) return;
    hovered = t;
    const slide = t.closest('.slide'), h = hvOf(slide), b = boxIn(t, slide);
    h.style.left = f1(b.r + 2) + 'px';
    h.style.top = f1(b.t - 42) + 'px';
    void h.offsetWidth;   // 先按「没冒出来」排一次，加上 .on 才有弹出来的过渡
    h.classList.add('on');
  }

  Deck.scene('comic', {
    label: '漫画',
    family: 'hand',
    dark: false,
    mascot: 'daodao',
    enter: 'boing',
    enterBy: BY,
    titleIn: 'dash',
    recede: .8,
    // 线稿是毛笔墨线：比铅笔粗、没那么潦草；圈注是朱红笔（颜色在 comic.css 的 --mark）
    rough: { strokeWidth: 3.2, roughness: .75, bowing: .7, hachureGap: 7, fillWeight: 2.4, markWidth: 4.2, markRoughness: 1.1, markBowing: .9 },
    fx: FX,

    // 背景层：淡蓝裁切线和四个角标（按舞台坐标放，宽屏时原稿纸照样铺满窗口）
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<div class="cm-trim" aria-hidden="true"><i></i><i></i><i></i><i></i></div>');
    },

    // 同一拍里：格框先描出、内容弹入 → 大字砸下 → 气泡最后冒出（写了 data-delay 的块照写的来）
    plan(units, ctx) {
      const base = (ctx && ctx.base) || 0;
      return order(units.map(u => ({ el: u.el, at: base + u.start, fixed: !!(u.el.dataset && u.el.dataset.delay) })));
    },

    // 变成当前风格时挂上悬停的监听，离开（或进阅读模式）时摘掉
    mount(stage) { stage.addEventListener('pointerover', onOver, { passive: true }); stage.addEventListener('pointerleave', unhover); },
    unmount(stage) { stage.removeEventListener('pointerover', onOver); stage.removeEventListener('pointerleave', unhover); unhover(); },

    // 建页：墨线插画填进去、斜格画上格框（只看这一页里的）
    defs: DEFS,
    decorate(s) {
      s.querySelectorAll('.cm-art[data-cm-art]').forEach(fillArt);
      s.querySelectorAll('.cm-cut[data-cm-cut]').forEach(buildCut);
    },

    // 退一拍：网点阴影先沉回去，四条墨线倒着收掉，同时整格淡出（淡出由引擎做）；斜格也一样，墨线倒着一条条收回起点
    onBack({ tl, units }) {
      const touched = [], cuts = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement || e.matches(SKIP)) return;
        if (isCut(e)) {
          const f = e.querySelector(':scope > svg.cm-cut-f');
          if (!f) return;
          cuts.push(f);
          const sh = f.querySelector('.cm-sh');
          if (sh) tl.fromTo(sh, { opacity: 1 }, { opacity: 0, duration: .14, ease: 'power2.in', immediateRender: false }, 0);
          [...f.querySelectorAll('.cm-ed')].reverse().forEach((p, j) => {
            const o = p.getAttribute('data-o');
            tl.fromTo(p, { scale: 1, svgOrigin: o }, { scale: 0, svgOrigin: o, duration: .08, ease: 'none', immediateRender: false }, .06 + j * .05);
          });
          return;
        }
        const list = isPanel(e) || isCopy(e) ? [e] : kidsOf(e).filter(c => isPanel(c) || isCopy(c));
        list.forEach(p => {
          touched.push(p);
          tl.fromTo(p, { '--cm-k': 1 }, { '--cm-k': 0, duration: .14, ease: 'power2.in', immediateRender: false }, 0);
          if (isPanel(p)) DRAW.slice().reverse().forEach((v, j) => tl.fromTo(p, { [v]: 1 }, { [v]: 0, duration: .08, ease: 'none', immediateRender: false }, .06 + j * .05));
        });
      });
      if (touched.length) tl.call(() => touched.forEach(cleanVars), null, .44);
      if (cuts.length) tl.call(() => cuts.forEach(cleanCut), null, .46);
      return { at: .12, gap: .03, y: 0, dur: .2 };
    },

    // 翻页：新页像漫画里切一刀那样斜着横切进来（前进从右往左、后退从左往右），刀口一道墨线；旧页往一边退开淡出
    pageTurn({ tl, from, to, dir, retire, clear }) {
      const o = from.el, n = to.el, fwd = dir > 0;
      const clip = fwd ? ['polygon(114% 0%, 114% 0%, 114% 100%, 100% 100%)', 'polygon(0% 0%, 114% 0%, 114% 100%, -14% 100%)']
        : ['polygon(-14% 0%, -14% 0%, 0% 100%, -14% 100%)', 'polygon(-14% 0%, 100% 0%, 114% 100%, -14% 100%)'];
      const end = () => { n.classList.remove('cm-turn'); ['--cm-cx', '--cm-ca', 'z-index'].forEach(k => n.style.removeProperty(k)); };
      tl.to(o, { x: -50 * dir, autoAlpha: 0, duration: .36, ease: 'power2.in', onComplete: () => { retire(); G.set(o, { clearProps: 'transform' }); } }, 0);
      // 新页压在旧页上面切进来（后退时新页在页面顺序里靠前，不抬上来会被还没退完的旧页盖住）
      tl.call(() => { n.classList.add('cm-turn'); n.style.setProperty('--cm-ca', (fwd ? 14 : -14) + 'deg'); n.style.zIndex = '2'; }, null, 0);
      tl.fromTo(n, { autoAlpha: 1, clipPath: clip[0], '--cm-cx': fwd ? '107%' : '-7%' },
        { clipPath: clip[1], '--cm-cx': fwd ? '-7%' : '107%', duration: .55, ease: 'power3.inOut', immediateRender: true,
          onComplete: () => { end(); clear(n); }, onInterrupt: end }, .04);
      return .26;
    },

    // 「已复制！」：命令被按进网点阴影里，朱红锯齿气泡从小炸开（复制失败时是引擎的红条，只淡入）
    copied({ tl, tip, node, ok }) {
      if (!ok) { tl.fromTo(tip, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, ease: 'power1.out' }, 0); return; }
      if (node && node.matches && node.matches('.copy')) {
        const off = () => node.style.removeProperty('--cm-p');
        tl.fromTo(node, { '--cm-p': '0px' }, { '--cm-p': '5px', duration: .06, ease: 'power1.out', immediateRender: true }, 0);
        tl.to(node, { '--cm-p': '0px', duration: .34, ease: 'back.out(3)', onComplete: off, onInterrupt: off }, .1);
      }
      tl.fromTo(tip, { autoAlpha: 0, scale: .2, rotation: -16 }, { autoAlpha: 1, scale: 1, rotation: -3, duration: .38, ease: 'back.out(3.2)' }, .05);
    },

    // 开场（约 1.2 秒）：裁切线浮出 → 主题行格号弹出、主题滑入 → 右上角页码落下、缩略格一格格弹出 → 大标题横切入 →
    // 第 0 拍按「格框 → 内容 → 大字 → 气泡」出场 → 重点词贴网点；之后引擎让形象落下
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (still() || !tl || !root || !root.querySelector) return 0;
      const trim = document.querySelector('.bg[data-scene="comic"] .cm-trim');
      if (trim) tl.fromTo(trim, { opacity: 0, scale: 1.012 }, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out', immediateRender: true, onComplete: () => clean(trim) }, 0);
      const topic = root.querySelector(':scope > .s-topic');
      if (topic) {
        const tc = topic.querySelector('.tc'), rest = [...topic.querySelectorAll('.ts, .tt')];
        if (tc) boingOne(tl, tc, .04, true, 0);
        if (rest.length) tl.fromTo(rest, { autoAlpha: 0, x: -22 }, { autoAlpha: 1, x: 0, duration: .26, stagger: .05, ease: 'power2.out', immediateRender: true, onComplete: () => rest.forEach(clean) }, .14);
      }
      const stage = root.closest('#stage'), meta = stage && stage.querySelector(':scope > .chrome .meta');
      if (meta) tl.fromTo(meta, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: .3, ease: 'back.out(2)', immediateRender: true, onComplete: () => clean(meta) }, .1);
      // 左上角的章节标签（没有主题行的页，比如封面）和右上角的缩略格：引擎在开场排好以后才写进外框，所以到时候再找、单独播
      if (stage) {
        const pop = (els, o) => { if (els.length && !still()) G.fromTo(els, o.from, Object.assign({ immediateRender: true, onComplete: () => els.forEach(clean) }, o.to)); };
        if (!topic) tl.call(() => pop([...stage.querySelectorAll(':scope > .chrome .chap span')],
          { from: { autoAlpha: 0, scale: .55, rotation: -5 }, to: { autoAlpha: 1, scale: 1, rotation: 0, duration: .38, delay: .04, ease: 'back.out(2.4)' } }), null, 0);
        tl.call(() => pop([...stage.querySelectorAll(':scope > .chrome .dots i')],
          { from: { scale: 0 }, to: { scale: 1, duration: .26, delay: .2, stagger: .06, ease: 'back.out(2.6)' } }), null, 0);
      }
      let end = .5;
      const title = root.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .12 + dashOne(tl, title, .12, false, 0));
      // 分镜草稿位：蓝铅笔虚线框一格格浮出来（先交代这页有几格）
      const slots = [...root.querySelectorAll('.cm-slot')];
      if (slots.length) {
        const off = () => slots.forEach(s => ['opacity', 'transform', 'translate'].forEach(k => s.style.removeProperty(k)));
        tl.fromTo(slots, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .26, stagger: .05, ease: 'power2.out', immediateRender: true, onComplete: off, onInterrupt: off }, .24);
        end = Math.max(end, .5 + slots.length * .05);
      }
      // 第 0 拍：只取最外层的，形象由引擎管；按「格框 → 内容 → 大字 → 气泡」排先后
      const zero = [...root.querySelectorAll('[data-beat]')].filter(e => (parseInt(e.dataset.beat, 10) || 0) === 0
        && !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      const t0 = title ? .36 : .2;
      const at = order(zero.map((e, i) => ({ el: e, at: t0 + i * .12 + (parseFloat(e.dataset.delay) || 0), fixed: !!e.dataset.delay })));
      zero.forEach((e, i) => {
        const name = fxName(e);
        if (name === 'none') return;
        const f = FX[name] || FX.boing;
        end = Math.max(end, at[i] + f(tl, e, at[i], { tilt: () => tiltOf(e) }));
      });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      if (keys.length) {
        const s = Math.min(Math.max(end - .1, .7), 1.5);
        tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .36, ease: 'power2.out', stagger: .06, immediateRender: true }, s);
        end = Math.max(end, s + .36 + (keys.length - 1) * .06);
      }
      return Math.max(end, 1.1);
    },

    // 点击处一圈很淡的冲击星（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      if (still() || !layer) return;
      const n = 12, pts = [];
      for (let i = 0; i < n * 2; i++) {
        const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 24 : 44 + (i % 4 ? 0 : 6);
        pts.push(f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r));
      }
      const svg = svgEl(120, 120, '-60 -60 120 120', `<polygon points="${pts.join(' ')}" fill="none" stroke="#16130F" stroke-width="3" stroke-linejoin="round"/>`);
      svg.setAttribute('class', 'cm-star');
      svg.style.cssText = `left:${x - 60}px;top:${y - 60}px`;
      layer.appendChild(svg);
      G.fromTo(svg, { scale: .3, opacity: .32, rotation: Math.random() * 30 }, { scale: 1.1, opacity: 0, duration: .5, ease: 'power2.out', onComplete: () => svg.remove() });
    },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和缩略格' },
      { x: 0, y: 0, w: 1920, h: 24, name: '裁切线外（上）' },
      { x: 0, y: 1056, w: 1920, h: 24, name: '裁切线外（下）' },
      { x: 0, y: 24, w: 24, h: 1032, name: '裁切线外（左）' },
      { x: 1896, y: 24, w: 24, h: 1032, name: '裁切线外（右）' },
    ],
  });
})();
