/* =====================================================================
   风格 · 水彩田园 watercolor（手绘家）
   - 来源：定稿样页 01-水彩田园.html。从样页搬过来的效果，以及改成对任意页面都成立的写法：
     1. 背景：水彩纸纹、淡蓝天、左上角暖阳、一朵从天空里「留白」出来的积云、两层草坡和一条铅笔地平线。
        样页里写死在舞台上；这里由 backdrop 放进铺满窗口的背景层，按 1920×1080 的舞台坐标画、
        向四周延伸到舞台外很远（宽屏、窄屏都不露边）；草坡的起伏用样页同一个算法按种子生成。
     2. 开场 intro：天空从阳光处晕开、草坡从左往右一笔刷过去、标题逐字像墨一样显出、主题行和第 0 拍随后显出。
        样页只认那一页的元素；这里对任意第一页成立：标题按字临时拆开（播完拆回原样），第 0 拍的块按组件选做法。
     3. 洇开 bloom（新增的出场名，data-in="bloom" 可用）：样页里每站的色块从一点用遮罩圆洇开，随后铅笔线、字依次出来。
        这里卡片、小格、命令、金句、步骤序号的水彩底都画在伪元素上，带一层径向遮罩，
        出场时把 --bp 从 -25% 动到 100%，颜色就从 --bx --by 那一点洇开；随后里面的字像墨一样显出。
        不写 data-in 时，卡片、小格、命令、金句（enterBy）和步骤的一项（ink 里转过来）默认用它。
     4. 墨色显出 ink（默认出场）：从模糊到清楚、轻轻落位（样页标题、正文的做法）。大块（终端、截图）不模糊，只淡入落位。
     5. 逐字显出 letters（大标题的出场，data-in="letters" 也可用）：样页标题的做法，一个字一个字像墨一样显出。
     6. 铅笔描线：样页的小画是铅笔线描出来的。这里 svg.sketch 的图元由 rough.js 画成细铅笔线（见 rough 参数），
        引擎按笔画描出；带填充色的图元，填充线加粗到叠成一片、再套水彩滤镜（CSS），描的时候像一笔笔刷上颜色。
        同一拍里先描线稿、颜色随后（plan）。
     7. 重点词：底下晕开一抹暖阳黄，前沿从左往右洇开（CSS 跟着引擎的 --k 走，任意重点词都成立）。
     8. 颜料复制反馈 copied：一滴天空蓝洇开、铅笔打勾、手写「已复制」；同时从命令处溅出几点颜料，
        命令底下的黄像刚刷上去一样湿亮再慢慢干掉。样页的提示框位置写死；这里用引擎找好的位置，颜料点按命令实际位置溅开。
     9. 节拍指示：一排小颜料点，讲过的天空蓝、当前拍暖阳黄；换拍时当前那滴落下弹一下、漾开一圈，拍号从上面落下（CSS）。
     10. 悬停：卡片、步骤、小格、命令抬起，朝鼠标那侧轻轻一斜，水彩颜色加深；按下时压一下。
         样页按站点绑监听；这里在 mount 里给舞台挂一个监听，按 closest 找当前悬停的组件，unmount 时摘掉。
     11. 点击涟漪 ripple：点击处洇开一滴很淡的水彩（天空蓝、暖阳黄轮流），放进引擎给的内容下面那一层。
     12. 退一拍 onBack：水彩底往回缩、字像墨被吸走一样化开淡去（样页的 leave）。
     13. 同风格翻页 pageTurn：一道湿润的水痕从一边扫到另一边，旧页随水痕褪去、新页随之显出。
   - 自有版式组件（水彩田园专用，类名都带 wc- 前缀；样子在 watercolor.css 末尾「自有版式组件」，样板页见 samples/watercolor.js）：
     「每一拍发生了什么」按绘本和写生的习惯来——铅笔先描线稿、颜色从一点洇开、刚画好的画晾上绳子、
     路牌从草地里立起来、颜料落进调色盘、叶子飘下来，而不是卡片弹出来。出场都由类名自动选好（enterBy），
     页面里只写结构和 data-beat，不写 data-in、不写 onBeat。别的风格不认识这些类，只当普通容器
     · .wc-art 一幅水彩小画（写死宽高；加 abs 绝对定位，不加就跟着文字排）。里面叠两种 svg，视图框都写成和小画一样大（1:1）：
       svg.wc-paint 颜色层：形状加颜色类 sky、sky-d、sun、grass、leaf、mint、peach、pink、tea、wood、shade、white，
       每块颜色自带水彩的不规则湿边和颜料斑驳（滤镜 #wc-wet）；style="--o:.3" 改浓淡（默认 .45）；
       加 st 是一笔颜料（不填色，线宽 --w，默认 6）。可以有几层，各写各的 data-beat，到拍那一层的颜色从一点洇开（出场 wash）；
       svg.sketch 铅笔线稿：普通形状，引擎用 rough.js 画成铅笔线，带 data-beat 的到拍一笔笔描出来。
       形状上别写 transform（rough.js 不认），要旋转、缩放就包一层 <g transform>；很短的小线加 data-roughness=".5" 免得太抖。
       整幅小画写 data-beat 时（出场 paint）：线稿先描、颜色随后洇开。.wc-art.wc-book 是绘本插画：四边柔柔地淡出纸面
     · .wc-wash 一道水彩笔触（装饰，不放字）：写死宽高，颜色 t-yellow、t-mint、t-blue…（默认天空蓝），从左往右洇开（出场 wash）
     · .wc-title 手写大字（封面书名、明信片上的金句）：一个字一个字像墨一样显出（出场 letters）；一行 8 个字以内
     · .wc-tale 绘本旁白：一行居中的大字（68px）。里面的 span 各写 data-beat 时，一拍出半句，一个字一个字显出；
       也可以整行写 data-beat。旁白只放讲稿里的话，句子横排
     · .wc-paper 一张水彩纸（毛边、软投影，纸色实底，字压在上面最清楚）：.wc-plate 藏书票（里面一道铅笔框、角上一枝小画）、
       .wc-post 明信片；.wc-stamp 一枚齿孔邮票（装饰，不放字）。出场 lay：纸从上面轻轻落下，里面的画、字随后出来
     · .wc-hang 晾在绳子上的一张画（写成 .wc-paper.wc-hang）：上半截一幅 .wc-art，下面 h3 名字、p 一句说明；
       木夹子由风格自动加在上沿正中（decorate）。出场 hang：画从夹子那里荡上来、晃两下停住，颜色洇开，字再显出。
       绳子用页面里的 svg.sketch 画；画纸的上沿压在绳子下面一点，夹子正好夹住绳子
     · .wc-sign 箭头形的木路牌：<b><i class="wc-no">1</i>名字</b><span>一句短说明</span>，--post 是柱子从牌子底边到地面的长度
       （默认 260px）。出场 plant：路牌像立体绘本一样从地上翻起来立住、木头颜色洇开、字显出、两片叶子飘下来。
       牌子的箭头朝右，几块路牌从左往右排，编号就是顺序
     · .wc-no 编号：一滴天空蓝颜料里写一个数字（34px），放在路牌名字前面，也能单独用
     · svg.wc-brush 宽笔刷画的路、河（铺满舞台的 svg，舞台坐标）：path 的 stroke-width 就是笔刷宽，颜色类 earth、grass、sky；
       每段写 data-beat，到拍那一段像一笔颜料刷过去（引擎的描线）；前后两段首尾相接，宽度可以一段比一段窄（往远处去）
     · .wc-well 调色盘里的一格颜料：<b>80<small>℃</small></b><span>水温</span>，颜色 t-peach、t-mint、t-blue…；
       写死宽高（圆的）。出场 fill：一滴颜料落进格子、往外洇开、溅出几点，大数字一个个写出来，再显出名字。
       空格子（盘子、格子的铅笔圈）画在第 0 拍的 .wc-art 里，.wc-well 正好盖在上面
   - 自有组件的可读性约定（也守 references/authoring.md 第 0 节第 9 条）：
     · 画里不放字：字都写在画外面（画纸下半截、路牌、颜料格、绘本旁白、明信片），一律横排、实色深褐墨
     · 字后面只有纸色或很淡的一层水彩（不超过 .55），颜色块、草坡、路不压在字上
     · 讲过的块只退到 recede（.8），组件里不另调淡；当前这一拍靠刚洇开的颜色、刚立起的路牌、朵朵站在旁边来强调
     · 讲过的不收走：路牌立起来就不倒，晾上的画不取下，颜料格填上就不擦，旁白一句句留在页上
     · 文字块倾斜不超过 2°（--r 写在 ±1.5deg 以内，晾着的画、明信片、路牌都一样）；路牌、晾画、颜料格从左往右排成一条路
   - 没搬的：鼠标视差（以后再做）；朵朵的走位、反应、空闲动作和开场时「从云里钻出来」归形象和引擎，不在风格里。
     背景里那朵云在舞台坐标约 (1500, 230)，形象的开场可以从这里出来。
   - 形象的投影用 CSS 变量 --mascot-shadow，说的话 .mascot-say 是水彩纸气泡（都在 watercolor.css）
   - 适合讲：入门教程、上手流程、温和的分享、非技术听众。不适合：大段代码、表格图表、严肃话题
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和颜料点节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
     · 底部草坡不算禁区：颜色很淡，字压在上面也看得清
   - 性能：洇开要逐帧重算遮罩，水彩底是带滤镜的 data URI 图（只栅格化一次）；大块不做模糊
   - 样子在 watercolor.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => Math.round(n * 10) / 10;

  /* =================================================================
     样页里的小工具：可复现的随机数、穿过各点的平滑曲线、草坡的起伏
     ================================================================= */
  function rng(seed) { let s = seed % 2147483647 || 1; return () => (s = s * 16807 % 2147483647) / 2147483647; }
  function curve(pts, closed) {
    const n = pts.length, P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  }
  // 稀疏控制点之间余弦插值，再加细碎起伏
  function ridge(ctrl, seed, amp) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const [x0, y0] = ctrl[i], [x1, y1] = ctrl[i + 1], n = Math.max(2, Math.round((x1 - x0) / 48));
      for (let j = 0; j < n; j++) {
        const t = j / n, e = (1 - Math.cos(t * Math.PI)) / 2;
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * e + (r() - .5) * amp]);
      }
    }
    pts.push(ctrl[ctrl.length - 1]);
    return pts;
  }
  // 元素上一个稳定的小整数（同一个元素每次一样），给洇开的起点一点变化
  function seedOf(e) {
    const s = (e.textContent || '').slice(0, 24) + (e.className && e.className.baseVal == null ? e.className : '');
    let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
    return h;
  }

  /* =================================================================
     背景（backdrop）：天空一层、草坡一层。两个 svg 铺满背景层，视图框是舞台的 1920×1080，
     meet 缩放时比例正好是 1、和舞台对齐（背景层在舞台单位下不小于舞台）；画到视图框外的部分照样显示
     ================================================================= */
  let sky = null, hills = null;
  function backdrop(layer) {
    const back = ridge([[-2400, 900], [-600, 884], [0, 896], [380, 872], [820, 904], [1240, 884], [1640, 870], [1920, 892], [2600, 900], [4320, 884]], 5, 5);
    const front = ridge([[-2400, 980], [-500, 966], [0, 958], [300, 944], [700, 968], [1100, 950], [1500, 938], [1920, 962], [2600, 972], [4320, 960]], 8, 6);
    const fill = pts => curve(pts, false) + ' L4320 4200 L-2400 4200 Z';
    const near = (pts, dx, dy, a, b) => pts.filter(p => p[0] > a && p[0] < b).map(p => [p[0] + dx, p[1] + dy]);
    const svg = (cls, body) => `<svg class="${cls}" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
    layer.innerHTML =
      svg('wc-sky', `<defs>
        <linearGradient id="wc-g-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="620">
          <stop offset="0" stop-color="#7DB8E2" stop-opacity=".46"/><stop offset=".5" stop-color="#9CCAEB" stop-opacity=".2"/><stop offset="1" stop-color="#B9DBF2" stop-opacity="0"/></linearGradient>
        <radialGradient id="wc-g-sun" gradientUnits="userSpaceOnUse" cx="140" cy="10" r="860">
          <stop offset="0" stop-color="#FFF3D2" stop-opacity=".95"/><stop offset=".45" stop-color="#FFE9B4" stop-opacity=".42"/><stop offset="1" stop-color="#FFE9B4" stop-opacity="0"/></radialGradient>
        <filter id="wc-f-cloud" x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="5" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feGaussianBlur in="d" stdDeviation="4"/></filter>
        <mask id="wc-m-sky" maskUnits="userSpaceOnUse" x="-2400" y="-2400" width="6720" height="3200">
          <rect x="-2400" y="-2400" width="6720" height="3200" fill="#fff"/>
          <g fill="#000" fill-opacity=".9" filter="url(#wc-f-cloud)">
            <circle cx="1356" cy="240" r="44"/><circle cx="1420" cy="206" r="66"/><circle cx="1504" cy="180" r="82"/>
            <circle cx="1592" cy="208" r="60"/><circle cx="1652" cy="240" r="40"/><rect x="1316" y="226" width="376" height="50" rx="25"/></g></mask></defs>
        <rect x="-2400" y="-2400" width="6720" height="3100" fill="url(#wc-g-sky)" mask="url(#wc-m-sky)"/>
        <ellipse cx="1500" cy="258" rx="160" ry="12" fill="#7DB8E2" fill-opacity=".11" filter="url(#wc-wash)"/>
        <rect x="-2400" y="-2400" width="4200" height="3600" fill="url(#wc-g-sun)"/>`) +
      svg('wc-hills', `<defs>
        <linearGradient id="wc-g-hill-b" gradientUnits="userSpaceOnUse" x1="0" y1="860" x2="0" y2="1040">
          <stop offset="0" stop-color="#A8D08A" stop-opacity=".34"/><stop offset="1" stop-color="#B9D9A0" stop-opacity=".16"/></linearGradient>
        <linearGradient id="wc-g-hill-f" gradientUnits="userSpaceOnUse" x1="0" y1="936" x2="0" y2="1080">
          <stop offset="0" stop-color="#8EC46E" stop-opacity=".42"/><stop offset="1" stop-color="#A6D088" stop-opacity=".24"/></linearGradient>
        <linearGradient id="wc-g-pen" gradientUnits="userSpaceOnUse" x1="-80" y1="0" x2="2000" y2="0">
          <stop offset="0" stop-color="#5E564D" stop-opacity="0"/><stop offset=".14" stop-color="#5E564D" stop-opacity=".26"/>
          <stop offset=".86" stop-color="#5E564D" stop-opacity=".26"/><stop offset="1" stop-color="#5E564D" stop-opacity="0"/></linearGradient>
        <filter id="wc-f-edge" x="-2%" y="-60%" width="104%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="9" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
        <path d="${fill(back)}" fill="url(#wc-g-hill-b)"/>
        <path d="${curve(near(back, 0, 0, -1100, 3020), false)}" fill="none" stroke="#8DBA6E" stroke-opacity=".3" stroke-width="3" filter="url(#wc-f-edge)"/>
        <path d="${fill(front)}" fill="url(#wc-g-hill-f)"/>
        <path d="${curve(near(front, 10, -7, -120, 2040), false)}" fill="none" stroke="url(#wc-g-pen)" stroke-width="2" stroke-linecap="round"/>`);
    sky = layer.querySelector('.wc-sky');
    hills = layer.querySelector('.wc-hills');
  }

  /* =================================================================
     出场
     ================================================================= */
  const BIG = 360000;   // 面积超过这么大（约 600×600）的块不做模糊：省性能
  const blurOk = e => (e.offsetWidth || 0) * (e.offsetHeight || 0) <= BIG;
  // 记下元素原来的行内样式，动画播完原样还原（子元素不归引擎管，不能用引擎的清理）
  const keep = e => { const s = e.getAttribute('style'); return () => { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
  const clear = (e, keys) => keys.forEach(k => e.style.removeProperty(k));
  const transparentOf = c => { const m = String(c).match(/[\d.]+/g); return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},0)` : 'rgba(0,0,0,0)'; };

  /* 墨色显出（默认出场）：从模糊到清楚、轻轻落位。plain 为真时不转给别的出场（letters 退回来时用，免得转圈） */
  function ink(tl, e, t, ctx, plain) {
    if (e.matches && e.matches('.steps > li')) return bloom(tl, e, t, ctx);   // 步骤的一项：序号的水彩先洇开
    // 绘本旁白里的半句：一个字一个字显出
    if (!plain && e.parentElement && e.parentElement.classList.contains('wc-tale') && e.textContent.trim()) return letters(tl, e, t, ctx);
    if (e instanceof SVGElement) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: ctx.done }, t);
      return .4;
    }
    const dur = .5, tilt = ctx.tilt(), blur = blurOk(e);
    clear(e, ['filter', '--bp']);   // 保险：上一次退场万一留下了模糊、收了一半的水彩底
    const from = { autoAlpha: 0, y: 14 };
    const to = { autoAlpha: 1, y: 0, duration: dur, ease: ctx.ease || 'power2.out', immediateRender: true };
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    if (blur) { from.filter = 'blur(6px)'; to.filter = 'blur(0px)'; }
    to.onComplete = () => { ctx.done(); clear(e, ['filter']); };
    to.onInterrupt = () => clear(e, ['filter']);
    tl.fromTo(e, from, to, t);
    return dur;
  }

  /* 洇开：水彩底（伪元素）从一点洇开，随后里面的字像墨一样显出 */
  function bloom(tl, e, t, ctx) {
    if (e instanceof SVGElement) {
      tl.fromTo(e, { autoAlpha: 0, scale: .9, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'power2.out', immediateRender: true, onComplete: ctx.done }, t);
      return .5;
    }
    const h = seedOf(e), vars = ['--bp', '--bx', '--by'];
    clear(e, ['filter']);   // 保险：上一次退场万一留下了模糊
    e.style.setProperty('--bx', (28 + h % 18) + '%');
    e.style.setProperty('--by', (36 + (h >> 3) % 20) + '%');
    const off = () => clear(e, vars);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .16, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { '--bp': '-25%' }, { '--bp': '100%', duration: .62, ease: 'power2.out', immediateRender: true, onInterrupt: off }, t + .06);
    const at = t + .26;
    let end = t + .68;
    // 字：子元素依次像墨一样显出（自己带拍的子元素不动，等它自己那一拍）
    const kids = [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches('.kid,.mascot'));
    if (kids.length) {
      const back = kids.map(keep), step = Math.min(.07, .28 / kids.length), blur = blurOk(e);
      const from = { opacity: 0, y: 10 }, to = { opacity: 1, y: 0, duration: .34, ease: 'power2.out', stagger: step, immediateRender: true, onComplete: () => back.forEach(f => f()) };
      if (blur) { from.filter = 'blur(4px)'; to.filter = 'blur(0px)'; }
      tl.fromTo(kids, from, to, at);
      end = Math.max(end, at + .34 + step * (kids.length - 1));
    }
    // 直接写在元素里的字（比如金句）：字色从透明到原色
    if (hasText(e)) {
      const own = e.style.color, c = getComputedStyle(e).color, put = () => { e.style.color = own; };
      tl.fromTo(e, { color: transparentOf(c) }, { color: c, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: put, onInterrupt: put }, at);
      end = Math.max(end, at + .4);
    }
    tl.call(() => { off(); ctx.done(); }, null, end);
    return end - t;
  }

  /* 逐字显出（大标题）：直接写着的字临时拆成单字，一个个像墨一样显出，播完拆回原样；里面的元素（如重点词）当一个字 */
  function split(e) {
    unsplit(e);
    const items = [], id = (e._wcSplit = (e._wcSplitN = (e._wcSplitN || 0) + 1));
    [...e.childNodes].forEach(n => {
      if (n.nodeType === 1) { items.push(n); return; }
      if (n.nodeType !== 3 || !n.nodeValue) return;
      const frag = document.createDocumentFragment();
      // 连在一起的字母数字算一个「字」，免得英文单词被拆开换行
      (n.nodeValue.match(/[A-Za-z0-9_.'’-]+|\s+|[\s\S]/gu) || []).forEach(s => {
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        const sp = document.createElement('span'); sp.className = 'wc-ch'; sp.textContent = s;
        frag.appendChild(sp); items.push(sp);
      });
      n.replaceWith(frag);
    });
    return { items, id };
  }
  function unsplit(e, id) {
    if (!e._wcSplit || (id != null && e._wcSplit !== id)) return;
    e.querySelectorAll(':scope > span.wc-ch').forEach(sp => sp.replaceWith(document.createTextNode(sp.textContent)));
    e.normalize();
    e._wcSplit = 0;
  }
  function letters(tl, e, t, ctx) {
    if (e instanceof SVGElement || !e.textContent.trim()) return ink(tl, e, t, ctx, true);
    const { items, id } = split(e);
    if (!items.length) { unsplit(e, id); return ink(tl, e, t, ctx, true); }
    const n = items.length, gap = Math.min(.045, .5 / n), d = .42;
    const back = items.filter(x => !x.classList.contains('wc-ch')).map(keep);
    const done = () => { back.forEach(f => f()); unsplit(e, id); };
    tl.fromTo(items, { opacity: 0, y: 10, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: d, ease: 'power2.out', stagger: gap, immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return d + gap * (n - 1);
  }

  /* =================================================================
     自有版式组件的出场（wc- 前缀，用法见文件开头）：颜色洇开 wash、一幅画先描后上色 paint、晾上一张画 hang、
     立起一块路牌 plant、颜料落进格子 fill、一张纸轻轻落下 lay；绘本旁白、手写大字用上面的 letters
     ================================================================= */
  /* 出场时不跟着动的子元素：自己另有 data-beat 的（等它自己那一拍），以及形象、圈注层、提示框、木夹子 */
  const OWN_SKIP = '.mascot, .kid, svg.marks, .copied-tip, .ripple-layer, .wc-peg, script, style';
  const ownKids = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(OWN_SKIP));
  /* 归 e 管的后代：不在 e 里面另一个带拍块里的（那些等自己那一拍） */
  const mine = (e, sel) => [...e.querySelectorAll(sel)].filter(c => { const b = c.closest('[data-beat]'); return !b || b === e || !e.contains(b); });
  /* 子元素用的 ctx（子元素不归引擎管，播完由各自的出场还原行内样式） */
  const kidCtx = { name: 'letters', scene: 'watercolor', dur: .4, ease: 'power2.out', tilt: () => 0, done: () => {} };
  /* 一个子元素墨色显出：从模糊到清楚、轻轻落位，播完还原它原来的行内样式 */
  function inkKid(tl, c, t, dur) {
    const back = keep(c);
    const from = { opacity: 0, y: 8 }, to = { opacity: 1, y: 0, duration: dur, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back };
    if (blurOk(c)) { from.filter = 'blur(4px)'; to.filter = 'blur(0px)'; }
    tl.fromTo(c, from, to, t);
    return dur;
  }
  /* 收尾：清掉块自己的行内样式（ctx.done 会掐掉这个块上的补间，所以放在时间线最后） */
  function finish(tl, e, t, end, ctx, vars) {
    tl.call(() => { ctx.done(); if (vars) clear(e, vars); }, null, t + end);
    return end;
  }
  /* 颜色层里的形状不该带描线留下的虚线（退一拍时引擎会给 svg 里的线设虚线藏起来，颜色层不需要） */
  function resetStrokes(svg) { svg.querySelectorAll('path,ellipse,circle,rect,polygon').forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.opacity = ''; }); }
  /* 一层颜色从一点洇开：--bp 推颜色层上的径向遮罩（watercolor.css）；起点 --bx --by 页面写了就用页面的 */
  function spread(tl, e, t, dur) {
    const own = !!e.style.getPropertyValue('--bx');
    if (!own) { const h = seedOf(e); e.style.setProperty('--bx', (26 + h % 30) + '%'); e.style.setProperty('--by', (34 + (h >> 3) % 24) + '%'); }
    const off = () => clear(e, own ? ['--bp'] : ['--bp', '--bx', '--by']);
    tl.fromTo(e, { '--bp': '-25%' }, { '--bp': '100%', duration: dur, ease: 'power2.out', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return dur;
  }
  /* 一幅画先描后上色：铅笔线稿（rough.js 画出来的线）一笔笔描出，描到一半颜色层从一点洇开。返回用时 */
  function paintArt(tl, art, t) {
    const lines = mine(art, 'svg.sketch path'), lens = lines.map(p => { try { return Math.ceil(p.getTotalLength()) + 2; } catch (err) { return 0; } });
    const total = lens.reduce((a, b) => a + b, 0) || 1, D = clamp(total / 3200, .3, .62);
    let at = t;
    lines.forEach((p, i) => {
      const L = lens[i], d = Math.max(.02, D * L / total);
      const back = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.opacity = ''; };
      const dash = p.getAttribute('stroke-dasharray');
      if (!L || (dash && dash !== 'none' && parseFloat(dash) > 0)) tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'none', immediateRender: true, onComplete: back, onInterrupt: back }, at);
      else tl.fromTo(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', immediateRender: true, onComplete: back, onInterrupt: back }, at);
      at += d;
    });
    const paints = mine(art, 'svg.wc-paint').filter(s => !s.hasAttribute('data-beat'));
    const p0 = lines.length ? Math.min(.24, D * .5) : 0;
    let end = lines.length ? D : 0;
    paints.forEach((s, i) => { resetStrokes(s); end = Math.max(end, p0 + i * .1 + spread(tl, s, t + p0 + i * .1, .66)); });
    return end;
  }

  /* 颜色洇开（颜色层 svg.wc-paint、一道笔触 .wc-wash） */
  function wash(tl, e, t, ctx) {
    if (e instanceof SVGElement && !(e instanceof SVGSVGElement)) return ink(tl, e, t, ctx, true);
    if (e instanceof SVGSVGElement) resetStrokes(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .16, ease: 'none', immediateRender: true }, t);
    const d = spread(tl, e, t, .7);
    return finish(tl, e, t, d, ctx);
  }
  /* 一幅画（整幅带拍的 .wc-art）：先描线稿，颜色随后洇开 */
  function paint(tl, e, t, ctx) {
    if (e instanceof SVGElement) return wash(tl, e, t, ctx);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none', immediateRender: true }, t);
    return finish(tl, e, t, Math.max(.3, paintArt(tl, e, t)), ctx);
  }
  /* 晾上一张画：从上沿正中的木夹子那里荡上来（转轴在夹子，CSS 的 transform-origin），晃两下停住；
     夹子夹紧一下；画里的颜色洇开，名字、说明再显出 */
  function hang(tl, e, t, ctx) {
    if (e instanceof SVGElement) return ink(tl, e, t, ctx, true);
    const tilt = ctx.tilt();
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .16, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { y: -36 }, { y: 0, duration: .42, ease: 'power3.out', immediateRender: true }, t);
    tl.fromTo(e, { rotation: tilt - 9 }, { rotation: tilt, duration: .9, ease: 'elastic.out(1,.42)', immediateRender: true }, t);
    const peg = e.querySelector(':scope > .wc-peg');
    if (peg) { const back = keep(peg); tl.fromTo(peg, { scaleY: 1.16, y: -8 }, { scaleY: 1, y: 0, duration: .26, ease: 'back.out(3)', immediateRender: true, onComplete: back, onInterrupt: back }, t + .14); }
    let end = .9, k = 0;
    ownKids(e).forEach(c => {
      if (c.matches('.wc-art')) { end = Math.max(end, .18 + paintArt(tl, c, t + .18)); return; }
      const s = .42 + (k++) * .1;
      end = Math.max(end, s + inkKid(tl, c, t + s, .38));
    });
    return finish(tl, e, t, end, ctx);
  }
  /* 立起一块路牌：像立体绘本翻开时那样，从地上翻起来立住（转轴在柱子落地处，CSS 的 transform-origin）；
     木头颜色洇开（--bp），字显出，两片叶子从牌子上飘下来 */
  function plant(tl, e, t, ctx) {
    if (e instanceof SVGElement) return ink(tl, e, t, ctx, true);
    const tilt = ctx.tilt();
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { rotation: tilt - 56 }, { rotation: tilt, duration: .64, ease: 'back.out(1.7)', immediateRender: true }, t);
    tl.fromTo(e, { '--bp': '-25%' }, { '--bp': '100%', duration: .55, ease: 'power2.out', immediateRender: true }, t + .3);
    let end = .85;
    ownKids(e).forEach((c, i) => { const s = .38 + i * .1; end = Math.max(end, s + inkKid(tl, c, t + s, .36)); });
    tl.call(() => leaves(e), null, t + .5);
    return finish(tl, e, t, end, ctx, ['--bp']);
  }
  /* 颜料落进格子：一滴颜料从左上落下、往外洇开（--bp），溅出几点；大数字一个个写出来，名字随后显出 */
  function fill(tl, e, t, ctx) {
    if (e instanceof SVGElement) return ink(tl, e, t, ctx, true);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .14, ease: 'none', immediateRender: true }, t);
    e.style.setProperty('--bx', '40%'); e.style.setProperty('--by', '36%');
    tl.fromTo(e, { '--bp': '-25%' }, { '--bp': '100%', duration: .62, ease: 'power2.out', immediateRender: true }, t);
    tl.call(() => splash(e), null, t + .06);
    let end = .62, k = 0;
    ownKids(e).forEach(c => {
      const s = .22 + (k++) * .18;
      end = Math.max(end, s + (c.tagName === 'B' ? letters(tl, c, t + s, kidCtx) : inkKid(tl, c, t + s, .36)));
    });
    return finish(tl, e, t, end, ctx, ['--bp', '--bx', '--by']);
  }
  /* 一张纸轻轻落下（藏书票、明信片）：从上面飘下来、摆正；里面的画先描后上色，手写大字一个个显出，别的字墨色显出 */
  function lay(tl, e, t, ctx) {
    if (e instanceof SVGElement) return ink(tl, e, t, ctx, true);
    const tilt = ctx.tilt();
    tl.fromTo(e, { autoAlpha: 0, y: -30, rotation: tilt + 2.4, scale: 1.02 }, { autoAlpha: 1, y: 0, rotation: tilt, scale: 1, duration: .6, ease: 'power3.out', immediateRender: true }, t);
    let end = .6, k = 0;
    ownKids(e).forEach(c => {
      let s, d;
      if (c.matches('.wc-art')) { s = .2; d = paintArt(tl, c, t + s); }
      else if (c.matches('.wc-title, .wc-tale')) { s = .3 + (k++) * .1; d = letters(tl, c, t + s, kidCtx); }
      else { s = .3 + (k++) * .08; d = inkKid(tl, c, t + s, .38); }
      end = Math.max(end, s + d);
    });
    return finish(tl, e, t, end, ctx);
  }

  /* 开场时第 0 拍的块用哪种出场（和引擎选默认出场的规则一致：data-in 优先，再按类名 BY，最后是 ink） */
  const FX = { ink, bloom, letters, wash, paint, hang, plant, fill, lay };
  /* 自有组件排在前面（引擎按这里的顺序取第一个对上的类名：.wc-paper.wc-hang 用 hang） */
  const BY = {
    'wc-hang': 'hang', 'wc-sign': 'plant', 'wc-well': 'fill', 'wc-paper': 'lay', 'wc-art': 'paint', 'wc-paint': 'wash', 'wc-wash': 'wash',
    'wc-title': 'letters', 'wc-tale': 'letters',
    card: 'bloom', cell: 'bloom', copy: 'bloom', quote: 'bloom',
  };
  function pick(e) {
    if (FX[e.dataset.in]) return FX[e.dataset.in];
    if (e instanceof SVGElement && !(e instanceof SVGSVGElement)) return ink;
    const c = Object.keys(BY).find(k => e.classList && e.classList.contains(k));
    return c ? FX[BY[c]] : ink;
  }
  // 自己调出场函数时（开场）给的 ctx，和引擎给的一样用
  function ownCtx(e, name) {
    return {
      name, scene: 'watercolor', dur: .5, ease: 'power2.out',
      tilt: () => { if (e instanceof SVGElement) return 0; const v = getComputedStyle(e).rotate; return v && v !== 'none' ? parseFloat(v) || 0 : 0; },
      done: () => clear(e, ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale']),
    };
  }

  /* =================================================================
     复制反馈的颜料点、点击处的水彩
     ================================================================= */
  // 每页一层放颜料点（在内容下面）；第一次用时放进页面最前面
  function fxLayer(slide) {
    let l = slide.querySelector(':scope > .wc-fx');
    if (!l) { l = document.createElement('div'); l.className = 'wc-fx'; l.setAttribute('aria-hidden', 'true'); slide.prepend(l); }
    return l;
  }
  // 从命令中间溅出几点颜料，落下后洇开淡去
  function splash(node) {
    const slide = node.closest('.slide');
    if (!slide || still()) return;
    const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1, r = node.getBoundingClientRect();
    const x = (r.left + r.width / 2 - sr.left) / k, y = (r.top + r.height / 2 - sr.top) / k, layer = fxLayer(slide);
    ['sky', 'sun', 'grass', 'sky', 'sun', 'grass'].forEach((c, i) => {
      const d = document.createElement('i'), sz = 14 + Math.random() * 10;
      d.className = 'wc-drip ' + c;
      d.style.cssText = `width:${f1(sz)}px;height:${f1(sz)}px;left:${f1(x - sz / 2)}px;top:${f1(y - sz / 2)}px`;
      layer.appendChild(d);
      const a = -Math.PI / 2 + (i - 2.5) * .55 + (Math.random() - .5) * .3, rr = 60 + Math.random() * 40;
      const dx = Math.cos(a) * rr, dy = Math.sin(a) * rr * .8;
      G.timeline({ onComplete: () => d.remove() })
        .fromTo(d, { x: 0, y: 0, scale: .4, opacity: .95 }, { x: dx * 1.25, duration: .6, ease: 'power2.out' }, 0)
        .to(d, { y: dy, scale: 1, duration: .24, ease: 'power2.out' }, 0)
        .to(d, { y: dy + 30, duration: .32, ease: 'power2.in' }, .24)
        .to(d, { scaleX: 1.9, scaleY: 1.3, opacity: 0, duration: .36, ease: 'sine.out' }, .5);
    });
  }
  // 每页一层放飘落的叶子（在内容上面，只是一闪而过的装饰，不压住任何一直在的字）；第一次用时放进页面最后面
  function topLayer(slide) {
    let l = slide.querySelector(':scope > .wc-fx.wc-top');
    if (!l) { l = document.createElement('div'); l.className = 'wc-fx wc-top'; l.setAttribute('aria-hidden', 'true'); slide.appendChild(l); }
    return l;
  }
  // 路牌立起来时，两片叶子从牌子右上角飘下来：左右摇着往下落、转着圈，一秒多一点就淡去
  function leaves(node) {
    const slide = node.closest('.slide');
    if (!slide || still() || !slide.classList.contains('active')) return;
    const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1, r = node.getBoundingClientRect();
    const x0 = (r.right - sr.left) / k - 70, y0 = (r.top - sr.top) / k - 6, layer = topLayer(slide);
    [0, 1].forEach(i => {
      const d = document.createElement('i'), dx = -46 - i * 34, r0 = -30 + i * 60;
      d.className = 'wc-leaf' + (i ? ' sun' : '');
      d.style.cssText = `left:${f1(x0 - i * 90)}px;top:${f1(y0 + i * 18)}px`;
      layer.appendChild(d);
      G.timeline({ onComplete: () => d.remove() })
        .fromTo(d, { opacity: 0 }, { opacity: .92, duration: .15, ease: 'none' }, 0)
        .fromTo(d, { y: 0 }, { y: 150 + i * 46, duration: 1.15, ease: 'sine.in' }, 0)
        .fromTo(d, { x: 0 }, { x: dx * .55, duration: .4, ease: 'sine.inOut' }, 0)
        .to(d, { x: dx, duration: .4, ease: 'sine.inOut' }, .4)
        .to(d, { x: dx * .5, duration: .35, ease: 'sine.inOut' }, .8)
        .fromTo(d, { rotation: r0 }, { rotation: r0 + 170, duration: 1.15, ease: 'sine.inOut' }, 0)
        .to(d, { opacity: 0, duration: .3, ease: 'power1.in' }, .85);
    });
  }
  // 点击处的一滴水彩图：天空蓝、暖阳黄两张，只生成一次
  const bloomImg = (col, seed) => 'url("data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'>` +
    `<filter id='w' x='-25%' y='-25%' width='150%' height='150%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='.03' numOctaves='2' seed='${seed}' result='n'/>` +
    `<feDisplacementMap in='SourceGraphic' in2='n' scale='34' xChannelSelector='R' yChannelSelector='G' result='d'/>` +
    `<feMorphology in='d' operator='erode' radius='5' result='e'/><feGaussianBlur in='e' stdDeviation='6' result='eb'/>` +
    `<feComposite in='d' in2='eb' operator='out' result='edge'/><feMerge><feMergeNode in='d'/><feMergeNode in='edge'/></feMerge></filter>` +
    `<circle cx='120' cy='120' r='70' fill='${col}' fill-opacity='.4' filter='url(#w)'/></svg>`) + '")';
  const BLOOMS = [bloomImg('#8EC3E6', 8), bloomImg('#F4C35A', 15)];
  let bloomI = 0;

  /* =================================================================
     悬停：卡片、步骤、小格、命令朝鼠标那侧轻轻一斜（抬起和颜色加深在 CSS 的 :hover 里）；
     晾着的画、路牌也一样（它们的转轴分别在木夹子、柱子落地处，所以是轻轻晃一下）
     ================================================================= */
  const HOVER = '.card, .cell, .steps > li, .copy, .wc-hang, .wc-sign';
  let hovered = null;
  function release() { if (hovered) { hovered.style.removeProperty('--wc-lr'); hovered = null; } }
  function onMove(e) {
    if ((e.pointerType && e.pointerType !== 'mouse') || still()) return;
    const t = e.target && e.target.closest ? e.target.closest(HOVER) : null;
    if (!t || !t.closest('.slide.active[data-scene="watercolor"]')) { release(); return; }
    if (t !== hovered) { release(); hovered = t; }
    const r = t.getBoundingClientRect(), rx = clamp(((e.clientX - r.left) / (r.width || 1) - .5) * 2, -1, 1);
    t.style.setProperty('--wc-lr', f1(rx * 1.4) + 'deg');
  }

  Deck.scene('watercolor', {
    label: '水彩田园',
    family: 'hand',
    dark: false,
    mascot: 'duoduo',
    enter: 'ink',
    enterBy: BY,
    titleIn: 'letters',
    recede: .8,
    // 细铅笔线；填充线加粗、间距小于线宽，叠成一片水彩（CSS 按线宽 7.5 认出填充线、套水彩滤镜）
    rough: { strokeWidth: 2.2, roughness: 1, bowing: .9, hachureGap: 7, hachureAngle: -32, fillWeight: 7.5, markWidth: 3 },
    fx: FX,
    // wc-wash 小块水彩：边缘不规则、边缘颜料积深（复制时那滴蓝、云底的阴影用）；
    // wc-fill 线稿里的填充色：再加颜料斑驳（样页大色块的配方）；
    // wc-wet 小画颜色层（svg.wc-paint）里的每块颜色：同一个配方，抖得轻一点、滤镜范围放宽（细长的一笔也不被裁掉）；
    // wc-brushf 宽笔刷（svg.wc-brush）：两边颜料积深、边缘不齐，范围按舞台坐标给（线宽不算进外框，按外框给会被裁掉）
    defs: `<filter id="wc-wash" x="-25%" y="-45%" width="150%" height="190%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="21" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feMorphology in="d" operator="erode" radius="1.5" result="e"/>
        <feGaussianBlur in="e" stdDeviation="2" result="eb"/>
        <feComposite in="d" in2="eb" operator="out" result="edge"/>
        <feMerge><feMergeNode in="d"/><feMergeNode in="edge"/></feMerge></filter>
      <filter id="wc-fill" x="-18%" y="-24%" width="136%" height="148%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="3" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feMorphology in="d" operator="erode" radius="3" result="e"/>
        <feGaussianBlur in="e" stdDeviation="4" result="eb"/>
        <feComposite in="d" in2="eb" operator="out" result="edge"/>
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="43" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 .1" result="ga"/>
        <feComposite in="d" in2="ga" operator="in" result="body"/>
        <feMerge><feMergeNode in="body"/><feMergeNode in="edge"/></feMerge></filter>
      <filter id="wc-wet" x="-30%" y="-45%" width="160%" height="190%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="11" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feMorphology in="d" operator="erode" radius="2" result="e"/>
        <feGaussianBlur in="e" stdDeviation="3" result="eb"/>
        <feComposite in="d" in2="eb" operator="out" result="edge"/>
        <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="31" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 .18" result="ga"/>
        <feComposite in="d" in2="ga" operator="in" result="body"/>
        <feMerge><feMergeNode in="body"/><feMergeNode in="edge"/></feMerge></filter>
      <filter id="wc-brushf" filterUnits="userSpaceOnUse" x="-300" y="-300" width="2520" height="1680" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="17" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feMorphology in="d" operator="erode" radius="3" result="e"/>
        <feGaussianBlur in="e" stdDeviation="4" result="eb"/>
        <feComposite in="d" in2="eb" operator="out" result="edge"/>
        <feMerge><feMergeNode in="d"/><feMergeNode in="edge"/></feMerge></filter>`,
    backdrop,

    // 每页建好后：晾着的画（.wc-hang）上沿正中加一只木夹子（只是画，不进拍，跟着画一起出现）
    decorate(slide) {
      slide.querySelectorAll('.wc-hang').forEach(h => {
        if (h.querySelector(':scope > .wc-peg')) return;
        const p = document.createElement('i'); p.className = 'wc-peg'; p.setAttribute('aria-hidden', 'true');
        h.prepend(p);
      });
    },

    /* 同一拍里：铅笔线稿先描（彼此错开一点），颜色和字随后（样页：箭头先描、颜色紧跟着洇开）。
       其余块按原来的先后，只是去掉线稿占的位次 */
    plan(units, { base }) {
      const isSketch = u => u.el instanceof SVGElement && !u.child && u.fx === 'draw';
      // 宽笔刷（svg.wc-brush 的路）刷得慢：路牌等路刷过去一大半再立起来
      const brush = units.some(u => isSketch(u) && u.el.closest('svg.wc-brush'));
      const lead = brush ? .3 : units.some(isSketch) ? .14 : 0;
      const shift = new Map();
      let k = 0, j = 0;
      return units.map(u => {
        const delay = parseFloat(u.el.dataset.delay) || 0;
        if (isSketch(u)) return base + (k++) * .08 + delay;
        if (u.child) {
          const box = units.find(o => o.container && o.el === u.el.parentElement);
          return base + lead + u.start + (box && shift.has(box) ? shift.get(box) : 0);
        }
        const s = (j++) * .12 + delay;
        shift.set(u, s - u.start);
        return base + lead + s;
      });
    },

    /* 退一拍：水彩底往回缩，字像墨被吸走一样化开（引擎同时把这一拍的块淡出、下沉一点） */
    onBack({ tl, units }) {
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        // 收缩和化开放在同一个动画里、播完由它自己清掉：分成两个的话，连按时引擎把时间线直接拨到结尾，
        // 后一个会在清理之后又把模糊写回去，下次出现时还是糊的
        const off = () => clear(e, ['--bp', 'filter']);
        const from = { '--bp': '100%' }, to = { '--bp': '-25%', duration: .3, ease: 'power2.in', immediateRender: false, onComplete: off, onInterrupt: off };
        if (blurOk(e)) { from.filter = 'blur(0px)'; to.filter = 'blur(5px)'; }
        tl.fromTo(e, from, to, 0);
        // 路牌：像立体绘本合上那样往回倒下去（转轴在柱子落地处）
        if (e.matches('.wc-sign')) { const r = parseFloat(getComputedStyle(e).rotate) || 0; tl.fromTo(e, { rotation: r }, { rotation: r - 40, duration: .26, ease: 'power2.in', immediateRender: false }, 0); }
      });
      return { at: .06, gap: .03, y: 8, dur: .24 };
    },

    /* 同风格翻页：一道湿润的水痕扫过去（前进从左往右，后退从右往左），旧页随水痕褪去、新页随之显出 */
    pageTurn({ tl, from, to, dir, retire, clear: clean }) {
      const o = from.el, n = to.el, ang = dir > 0 ? '90deg' : '270deg';
      o.classList.add('wc-turn-out'); n.classList.add('wc-turn-in');
      [o, n].forEach(e => e.style.setProperty('--wc-ang', ang));
      const end = () => [o, n].forEach(e => { e.classList.remove('wc-turn-out', 'wc-turn-in'); clear(e, ['--tp', '--wc-ang']); });
      tl.fromTo([o, n], { '--tp': 0 }, { '--tp': 1, duration: .75, ease: 'power1.inOut', immediateRender: true, onComplete: () => { end(); retire(); clean(n); }, onInterrupt: end }, 0);
      return .12;
    },

    /* 「已复制」：一滴天空蓝洇开、铅笔打勾、手写字一格格出来；同时颜料溅开、命令底下的黄湿亮一下再干掉
       （颜料点和湿亮另起动画，不放进 tl：tl 播完引擎就开始让提示淡出） */
    copied({ tl, tip, node, ok }) {
      const svg = tip.querySelector('svg'), path = tip.querySelector('path'), txt = tip.querySelector('span');
      if (svg && !svg.querySelector('.wc-drop')) svg.insertAdjacentHTML('afterbegin', '<circle class="wc-drop" cx="22" cy="20" r="19"/>');
      const drop = svg && svg.querySelector('.wc-drop');
      tl.set(tip, { autoAlpha: 1 });
      if (drop) tl.fromTo(drop, { opacity: 0, scale: .2, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .45, ease: 'power2.out' }, 0);
      if (path) { const L = path.getTotalLength() + 2; tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .26, ease: 'power1.inOut' }, .16); }
      if (txt) tl.fromTo(txt, { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -2% -20% 0)', duration: .36, ease: 'steps(3)' }, .28);
      if (!ok) return;
      splash(node);
      if (node.classList.contains('copy')) G.fromTo(node, { '--wet': 1 }, { '--wet': 0, duration: 1.3, ease: 'sine.out', onComplete: () => clear(node, ['--wet']) });
    },

    /* 开场（不带拍号打开时第一页用）：天空从阳光处晕开 → 草坡一笔刷过去 → 标题逐字显出 → 主题行、第 0 拍的块依次显出 →
       第 0 拍的重点词晕开。负责整个第一页的出场，返回总时长（秒） */
    intro({ tl, page } = {}) {
      if (still() || !tl) return 0;
      let end = 0;
      if (sky) {
        sky.classList.add('wc-wipe-sky');
        const off = () => { sky.classList.remove('wc-wipe-sky'); clear(sky, ['--sp']); };
        tl.fromTo(sky, { '--sp': '0px' }, { '--sp': '2600px', duration: 1.1, ease: 'sine.out', immediateRender: true, onComplete: off, onInterrupt: off }, 0);
        end = 1.1;
      }
      if (hills) {
        hills.classList.add('wc-wipe-hills');
        const off = () => { hills.classList.remove('wc-wipe-hills'); clear(hills, ['--hp']); };
        tl.fromTo(hills, { '--hp': '-8%' }, { '--hp': '110%', duration: .9, ease: 'power1.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, .1);
      }
      const el = page && (page.el || (page.nodeType === 1 ? page : null));
      if (!el) return end;
      const title = el.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .12 + letters(tl, title, .12, ownCtx(title, 'letters')));
      const topic = el.querySelector(':scope > .s-topic');
      if (topic) tl.fromTo(topic, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, ease: 'power1.out', immediateRender: true, onComplete: () => clear(topic, ['opacity', 'visibility']) }, .3);
      const blocks = [...el.querySelectorAll('[data-beat]')].filter(b => (parseInt(b.dataset.beat, 10) || 0) === 0
        && !b.matches('.kid, .mascot') && !(b.parentElement && b.parentElement.closest('[data-beat]')));
      blocks.forEach((b, i) => {
        const t = .5 + i * .12 + (parseFloat(b.dataset.delay) || 0), f = pick(b);
        end = Math.max(end, t + f(tl, b, t, ownCtx(b, f.name)));
      });
      el.querySelectorAll('.key').forEach(kw => {
        const b = kw.closest('[data-beat]');
        if (b && (parseInt(b.dataset.beat, 10) || 0) > 0) return;
        tl.fromTo(kw, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.max(.6, end - .25));
      });
      return end;
    },

    /* 点击处洇开一滴很淡的水彩（坐标是舞台坐标，layer 在内容下面） */
    ripple(x, y, layer) {
      if (still() || !layer) return;
      const el = document.createElement('i');
      el.className = 'wc-bloom';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = `position:absolute;left:${f1(x)}px;top:${f1(y)}px;width:240px;height:240px;margin:-120px 0 0 -120px;pointer-events:none;opacity:0;background:${BLOOMS[bloomI++ % 2]} center/100% 100% no-repeat`;
      layer.appendChild(el);
      G.timeline({ onComplete: () => el.remove() })
        .fromTo(el, { scale: .18, rotation: Math.random() * 360 }, { scale: 1, duration: 1, ease: 'power2.out' }, 0)
        .fromTo(el, { opacity: 0 }, { opacity: .5, duration: .12, ease: 'none' }, 0)
        .to(el, { opacity: 0, duration: .8, ease: 'sine.inOut' }, .15);
    },

    // 变成当前风格时挂上悬停的监听，离开（或进阅读模式）时摘掉
    mount(stage) { stage.addEventListener('pointermove', onMove); stage.addEventListener('pointerleave', release); },
    unmount(stage) { stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerleave', release); release(); },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
