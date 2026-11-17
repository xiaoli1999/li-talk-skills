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
   - 没搬的：速度线、集中线做的背景（太满，只在大字落地、命令冲进来时闪一下）；不规则斜格（任意页面套不进去，
     格子一律是矩形，要破格就用 .cm-panel 让里面的东西伸出去）；形象的走位、反应、空闲动作（引擎的形象部分统一做）
   - 漫画自己的可选组件（别的风格不认）：.cm-panel 分镜格、.cm-say 对白气泡（.tail-r 尾巴在右下）、.cm-sfx 拟声大字（.cool 钴蓝），
     样子在 comic.css 末尾；普通页面不用它们也完全成立
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
  const HOVER = '.card, .cell, .steps > li, .term, .shot, .copy, .cm-panel';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .cm-fx, .cm-hv, script, style';
  /* 默认出场按组件类名分：格子和一排格子的容器「格框先描出」，命令「横切入」，金句和拟声字「大字砸下」，气泡「啵」，标签「弹入」 */
  const BY = { card: 'frame', cell: 'frame', term: 'frame', shot: 'frame', 'cm-panel': 'frame', steps: 'frame', cells: 'frame', grid: 'frame', row: 'frame', col: 'frame', vs: 'frame',
    copy: 'dash', quote: 'bam', 'cm-sfx': 'bam', 'cm-say': 'bubble', tag: 'boing' };
  const DRAW = ['--cm-d1', '--cm-d2', '--cm-d3', '--cm-d4'];
  const VARS = DRAW.concat(['--cm-k', '--cm-p']);
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path', 'transform-origin'].concat(VARS);

  const isPanel = e => !!(e && e.matches && e.matches(PANEL));
  const isCopy = e => !!(e && e.matches && e.matches('.copy'));
  const isTag = e => !!(e && e.matches && e.matches('.tag'));
  const isBig = e => !!(e && e.matches && e.matches('.quote, .cm-sfx'));
  const isSay = e => !!(e && e.matches && e.matches('.cm-say'));
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
    let end = .56;
    const kids = kidsOf(e), soft = e.matches('.term, .shot');
    const gap = kids.length ? Math.min(.07, .3 / kids.length) : 0;
    kids.forEach((c, i) => {
      const s = .26 + i * gap;
      const d = isPanel(c) ? frameOne(tl, c, t + s, false) : isCopy(c) ? dashOne(tl, c, t + s, false, tiltOf(c)) : soft ? riseKid(tl, c, t + s) : popKid(tl, c, t + s);
      end = Math.max(end, s + d);
    });
    end = Math.min(end, 1.1);
    tl.call(() => clean(e), null, t + end);
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

  /* 大字砸下：从很大砸下来、压一下回弹，落地一瞬四周闪一圈集中线 */
  function bamOne(tl, e, t, vis, tilt) {
    appear(tl, e, t, vis, .04);
    tl.fromTo(e, { scale: 2.3, rotation: tilt - 9 }, { scale: .94, rotation: tilt, duration: .2, ease: 'power3.in', immediateRender: true }, t);
    tl.to(e, { scale: 1, duration: .22, ease: 'back.out(3)' }, t + .2);
    tl.call(() => focusLines(e), null, t + .2);
    tl.call(() => clean(e), null, t + .42);
    return .42;
  }

  /* 啵：气泡从尾巴那头弹性冒出来 */
  function bubbleOne(tl, e, t, vis, tilt) {
    const o = !isSay(e) ? '50% 100%' : e.classList.contains('tail-r') ? '78% 115%' : '22% 115%';
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
    if (isPanel(e)) return frameOne(tl, e, t, true);
    if (isCopy(e)) return dashOne(tl, e, t, true, tilt);
    if (fallback === boingOne && hasParts(e)) return group(tl, e, t);
    return fallback(tl, e, t, true, tilt);
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
    recede: .5,
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

    // 退一拍：网点阴影先沉回去，四条墨线倒着收掉，同时整格淡出（淡出由引擎做）
    onBack({ tl, units }) {
      const touched = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement || e.matches(SKIP)) return;
        const list = isPanel(e) || isCopy(e) ? [e] : kidsOf(e).filter(c => isPanel(c) || isCopy(c));
        list.forEach(p => {
          touched.push(p);
          tl.fromTo(p, { '--cm-k': 1 }, { '--cm-k': 0, duration: .14, ease: 'power2.in', immediateRender: false }, 0);
          if (isPanel(p)) DRAW.slice().reverse().forEach((v, j) => tl.fromTo(p, { [v]: 1 }, { [v]: 0, duration: .08, ease: 'none', immediateRender: false }, .06 + j * .05));
        });
      });
      if (touched.length) tl.call(() => touched.forEach(cleanVars), null, .44);
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
