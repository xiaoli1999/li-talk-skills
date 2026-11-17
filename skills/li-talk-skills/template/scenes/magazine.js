/* =====================================================================
   风格 · 杂志复古 magazine（现代家，宋体）
   - 样子：撞色拼贴的老杂志。米白纸底（极淡纸纹、四角旧纸暗边），墨绿、橘红两个撞色，另加墨黑字和纸白；
     全页只用这几种和它们的深浅。宋体大标题（Windows 只有细宋体时自动描边加粗），小字黑体，命令等宽
   - 适合讲：观点、方法论、读书分享、复盘总结。不适合：大量代码、密集图表、热闹的场合
   - 默认形象：小铅 xiaoqian（一枚会走路的橘红铅字块，头顶翘着一个反写的 ¶；自带米白剪纸边，不加描边）
   - 来源：定稿样页 07-杂志复古.html。从样页搬来的效果，以及改成对任意页面都成立的写法：
     1. 页眉：主题行下面一粗一细两道栏线。样页是两个写死的元素；这里画在每页的 ::before 上，
        开场时推 --mag-rule 从左往右拉开（magazine.css）
     2. 纸条 + 胶带：样页三张纸条各自写了 .paper、.tape-w 等五层标记；这里卡片、步骤的每一项、截图位本身就是纸条，
        胶带画在伪元素上（卡片、截图位的 ::before，步骤的 ::after，因为步骤的 ::before 是序号），页面不用多写标记；
        歪多少、左右怎么错开交给页面（--r 和位置），风格只给样子
     3. 出场「贴上」paste（新增的出场名）：纸条从上方带着悬空的影子落下贴住（--mag-lf 从 1 到 0）→ 胶带横向按上（--mag-tp）
        → 轻轻一压 → 里面的字一行行从下面「排」上来；步骤的大序号背后那层橘红从偏位处对过来（--mag-gx/gy）；
        一排纸条的容器（.steps、.cells、.grid……）整拍出场时，里面的纸条依次贴上。
        命令券落位时剪刀从左边滑到虚线上；标签「啪」地拍上去；封面色块落下、网点圆转着滚进来
     4. 文字「排字」typeset（新增的出场名，也是默认出场和大标题的出场）：样页每行包一层遮罩、字从行底升上来；
        这里不改页面结构，用 clip-path 跟着位移一起收（位移和裁切按同样的百分比走），效果就是字从自己的底边升上来
     5. 重点词：剪下来的橘红纸条从左往右贴到字底下、字反白。样页每个重点词里写了一个 <i>；
        这里画在 .key::before 上，跟着引擎本来就会推的 --k 走，字色用 color-mix 按 --k 换（magazine.css）
     6. 套印错位：步骤的大序号（01、02…）用 text-shadow 叠一层偏出去的橘红（magazine.css）
     7. 命令是剪角券：墨黑虚线框，剪刀骑在上沿；悬停时虚线和剪刀变橘红、刀口张开（CSS）；
        「已复制」（copied）：剪刀一开一合沿虚线剪过去、碎纸屑弹起，券被剪下来翘起一点，一张橘红小标签用胶带贴上去
     8. 节拍指示：几小片纸，讲过的墨黑、当前的橘红；当前那片「啪」地贴上，拍号从下面滚上来（magazine.css）
     9. 悬停：纸条被揭起一点（往上抬、歪得少一点、影子变大），按下时压一下（纯 CSS）
     10. 退一拍（onBack）：重点词的纸条先撕掉（引擎收 --k），整张纸条往上揭起、转一点拿走
     11. 点击处一圈很淡的橘红网点散开（ripple，样页原样）；翻页（pageTurn）：旧页往一边退开，新页像翻过来的一页从一边揭开
     12. 开场（intro）：栏线拉开 → 主题行和页码落下 → 封面色块贴上、网点圆滚进来 → 大标题排上来 → 第 0 拍依次跟上 → 重点词贴纸条
     13. 封面色块（可选组件 .mag-cover）：样页「左边一大块撕边墨绿纸压着网点圆」是那一页专用的版式；
        这里做成一个组件，写进页面就有撕边墨绿纸和网点圆，放在里面的字自动反成米白（magazine.css 末尾有写法）
   - 没搬的：网点圆随鼠标的视差（这一版不做视差）；小铅的走位、反应、空闲动作（引擎的形象部分统一做）；
     样页的「第 01 期」刊号（会和长主题行抢位置；要刊号的页面用下面的刊头 .mag-mast 自己放）
   - 杂志自有的版式组件（类名带 mag- 前缀，样子和写法见 magazine.css 末尾「杂志自有版式组件」；别的风格不认识，只是普通容器）：
     .mag-clip 剪报（纸条 + 胶带，可带套印大页码 data-no）、.mag-no 套印大字、.mag-lead 虚线引导、.mag-col 竖排栏目注释、
     .mag-mast 刊头、.mag-fig 套印插图、.mag-disc 网点圆、.mag-pull 引语、.mag-gutter 跨页中缝、.mag-folio 页脚、.mag-end 文末方块。
     它们各有这一风格的出场（enterBy 按类名配好，页面不用写 data-in）：
     · 剪报「贴上」paste：和卡片一样落下、按胶带、字排上来；带 data-no 的，胶带按上后大页码的橘红一版从偏位处对过来
     · 套印大字、网点圆「套印」register：绿色那版先印上，橘红那版从偏出去的地方滑回来对准；网点圆转着滚进来
     · 插图「印上」print：像印刷滚筒从上往下滚过，墨线和底色一起印出来，随后橘红网点那一版对过来
     · 虚线引导「描线」trace：从起点的墨点沿着虚线一路描到尽头，箭头（或圆点）啪地落下
     · 竖排栏目注释、刊头、引语「排字」typeset：竖排的字从上往下一列列排出来（横排的照旧从下往上升）
   - 同一拍里先后（plan）：有虚线引导的拍，线先描、纸条等线描到一大半再贴（「顺着线贴到线的尽头」）
   - 自己加的出场名：paste、typeset、register、print、trace，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍纸片（.meta 在这里改到 right 120、top 28、高 40：右边和栏线对齐；按每页最多 4 拍、两位数页码量，留出余量后是 x 1390–1810、y 22–74）
     · 页眉栏线（x 120–1800、y 79–92）：大标题在 y 96 以下，不碰
   - 样子在 magazine.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;

  /* 宋体检测（样页的做法）：同一串字母分别用「带粗体的宋体候选 + 等宽兜底」和「纯等宽」量宽度，
     一样宽说明候选都没装，实际用的是笔画很细的 SimSun：在 <html> 上写 --mag-thin: 1，CSS 按字号描边加粗 */
  (function detectSong() {
    try {
      const probe = document.createElement('span');
      probe.textContent = 'mmmwwwiiilll 0123456789 Typography';
      probe.style.cssText = 'position:absolute;left:-9999px;top:0;font-size:40px;white-space:nowrap;visibility:hidden';
      (document.body || document.documentElement).appendChild(probe);
      probe.style.fontFamily = 'monospace';
      const base = probe.offsetWidth;
      probe.style.fontFamily = '"Songti SC","Noto Serif SC","Source Han Serif SC","Source Han Serif CN","思源宋体","Noto Serif CJK SC",monospace';
      const real = probe.offsetWidth;
      probe.remove();
      if (real === base) document.documentElement.style.setProperty('--mag-thin', '1');
    } catch (e) { /* 量不了就不描边 */ }
  })();

  /* 纸条类组件（出场是「贴上」）；带胶带的；出场时不跟着动的子元素 */
  const PAPER = '.card, .cell, .term, .shot, .steps > li, .copy, .tag, .mag-cover, .mag-clip';
  const TAPED = '.card, .shot, .steps > li, .mag-clip';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .mag-bit, script, style';
  /* 默认出场按组件类名分：纸条和一排纸条的容器「贴上」，金句和其余文字「排字」；
     杂志自有组件：大字和网点圆「套印」、插图「印上」、虚线「描线」 */
  const BY = { card: 'paste', cell: 'paste', term: 'paste', shot: 'paste', copy: 'paste', tag: 'paste', 'mag-cover': 'paste',
    steps: 'paste', cells: 'paste', grid: 'paste', row: 'paste', col: 'paste', vs: 'paste', quote: 'typeset',
    'mag-clip': 'paste', 'mag-no': 'register', 'mag-disc': 'register', 'mag-fig': 'print', 'mag-lead': 'trace',
    'mag-col': 'typeset', 'mag-mast': 'typeset', 'mag-pull': 'typeset' };
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path', 'box-shadow',
    '--mag-tp', '--mag-lf', '--mag-gx', '--mag-gy', '--mag-sc', '--mag-ds', '--mag-dr', '--mag-do', '--mag-ox', '--mag-oy', '--mag-dt'];

  const isPaper = e => !!(e && e.matches && e.matches(PAPER));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子 */
  const clean = e => { if (e && e.style) PROPS.forEach(k => e.style.removeProperty(k)); };
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  /* 元素自己的倾斜角（CSS rotate，来自页面写的 --r）：gsap 动画时会把 rotate 写成 none，倾斜要并进 gsap 的 rotation */
  const tiltOf = e => {
    if (!e || e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? parseFloat(v) || 0 : 0;
  };
  /* 纸条落下时多歪的方向：跟着它本来的倾斜，没倾斜就左右轮流 */
  let flip = 1;
  const sideOf = tilt => tilt ? Math.sign(tilt) : (flip = -flip);

  /* 排字：字从自己的底边升上来。位移（yPercent）和底边的裁切（clip-path 的 bottom）按同样的百分比、同样的缓动走，
     看起来就是一个不动的窗口里字往上排。o = { vis（true 时连 visibility 一起管，只给节拍单元本身用）, tilt, dur }
     竖排的字（writing-mode: vertical-*，比如竖排栏目注释）不挪位置，裁切从顶边往下放开：每一列的字按顺序从上往下出现，像一列列写出来 */
  const isVert = e => !(e instanceof SVGElement) && /^vertical/.test(getComputedStyle(e).writingMode || '');
  function typesetIn(tl, e, t, o) {
    const dur = o.dur || .5, off = () => clean(e), vert = isVert(e);
    const from = vert ? { yPercent: 0, clipPath: 'inset(-8% -25% 100% -25%)' } : { yPercent: 100, clipPath: 'inset(-25% -8% 100% -8%)' };
    const to = { yPercent: 0, clipPath: vert ? 'inset(-8% -25% -8% -25%)' : 'inset(-25% -8% 0% -8%)', duration: vert ? dur + .2 : dur, ease: vert ? 'power1.inOut' : 'power3.out', immediateRender: true, onComplete: off, onInterrupt: off };
    if (o.vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (o.tilt) { from.rotation = o.tilt; to.rotation = o.tilt; }
    tl.fromTo(e, from, to, t);
    return to.duration;
  }
  /* 插图「印上」：像印刷滚筒从上往下滚过（裁切从上往下放开），随后橘红网点那一版从偏位处对过来（--mag-gx/gy，见 .mag-fig .plate） */
  function printFig(tl, e, t, vis) {
    const from = { clipPath: 'inset(-8% -8% 100% -8%)' }, to = { clipPath: 'inset(-8% -8% -8% -8%)', duration: .55, ease: 'power2.inOut', immediateRender: true };
    if (vis) { from.autoAlpha = 1; to.autoAlpha = 1; } else { from.opacity = 1; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    tl.fromTo(e, { '--mag-gx': '30px', '--mag-gy': '-20px' }, { '--mag-gx': '6px', '--mag-gy': '4px', duration: .55, ease: 'power3.out', immediateRender: true }, t + .3);
    tl.call(() => clean(e), null, t + .86);
    return .86;
  }
  /* 套印大字：绿色那版先印上（淡入、略大一点压下去），橘红那版从偏出去的地方滑回来对准（--mag-ox/oy，单位 em）；
     网点圆：转着滚进来（和封面色块后面那枚一样） */
  function registerIn(tl, e, t, vis, tilt) {
    const off = () => clean(e);
    if (e.matches('.mag-disc')) {
      const from = { scale: .55, rotation: tilt - 50 }, to = { scale: 1, rotation: tilt, duration: .55, ease: 'back.out(1.5)', immediateRender: true, onComplete: off, onInterrupt: off };
      if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
      tl.fromTo(e, from, to, t);
      return .55;
    }
    const from = { scale: 1.04, rotation: tilt }, to = { scale: 1, rotation: tilt, duration: .32, ease: 'power2.out', immediateRender: true };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    tl.fromTo(e, { '--mag-ox': '0.16em', '--mag-oy': '-0.1em' }, { '--mag-ox': '0.03em', '--mag-oy': '0.02em', duration: .62, ease: 'power3.out', immediateRender: true, onComplete: off, onInterrupt: off }, t + .08);
    return .7;
  }
  /* 虚线引导「描线」：起点的墨点先在，虚线沿着自己的方向一路描过去（裁切从左往右放开；线用 --r 转了角，裁切跟着转），
     描到头箭头或圆点啪地落下（--mag-dt 从 0 到 1） */
  function traceIn(tl, e, t, vis) {
    const off = () => clean(e);
    const from = { clipPath: 'inset(-30px 100% -30px -30px)', '--mag-dt': 0 }, to = { clipPath: 'inset(-30px -30px -30px -30px)', duration: .42, ease: 'power1.inOut', immediateRender: true };
    if (vis) { from.autoAlpha = 1; to.autoAlpha = 1; }
    tl.fromTo(e, from, to, t);
    tl.fromTo(e, { '--mag-dt': 0 }, { '--mag-dt': 1, duration: .24, ease: 'back.out(2.6)', immediateRender: true, onComplete: off, onInterrupt: off }, t + .38);
    return .62;
  }
  /* SVG 和别的只淡入 */
  function fadeIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e) }, t);
    return .4;
  }
  /* 命令券：落位时带一点回弹，剪刀随后从左边滑到虚线上 */
  function coupon(tl, e, t, vis, tilt) {
    const from = { y: 18, rotation: tilt - 1.2 }, to = { y: 0, rotation: tilt, duration: .34, ease: 'back.out(1.6)', immediateRender: true };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    tl.fromTo(e, { '--mag-sc': 0 }, { '--mag-sc': 1, duration: .26, ease: 'power2.out', immediateRender: true }, t + .14);
    tl.call(() => clean(e), null, t + .42);
    return .42;
  }
  /* 标签：从大一点、歪一点的地方「啪」地拍上去 */
  function slap(tl, e, t, vis, tilt) {
    const off = () => clean(e);
    const from = { scale: 1.3, rotation: tilt - 8 }, to = { scale: 1, rotation: tilt, duration: .3, ease: 'back.out(2.2)', immediateRender: true, onComplete: off, onInterrupt: off };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    return .3;
  }
  /* 一张纸条贴上：带着悬空的影子从上方落下、贴住 → 胶带按上 → 轻轻一压 → 里面的字一行行排上来 */
  function pasteOne(tl, e, t, vis, tilt, side) {
    if (e.matches('.copy')) return coupon(tl, e, t, vis, tilt);
    if (e.matches('.tag')) return slap(tl, e, t, vis, tilt);
    const cover = e.matches('.mag-cover'), d = cover ? .5 : .42;
    const from = { y: cover ? -26 : -36, rotation: tilt + side * (cover ? 1.4 : 2.4), scale: cover ? 1.02 : 1.035, '--mag-lf': 1 };
    const to = { y: 0, rotation: tilt, scale: 1, '--mag-lf': 0, duration: d, ease: 'power3.out', immediateRender: true };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    let end = d;
    if (!cover) { tl.to(e, { keyframes: [{ y: 2, duration: .05 }, { y: 0, duration: .14, ease: 'power2.out' }] }, t + .44); end = .63; }
    if (e.matches(TAPED)) tl.fromTo(e, { '--mag-tp': 0 }, { '--mag-tp': 1, duration: .2, ease: 'power2.out', immediateRender: true }, t + .3);
    if (e.matches('.steps > li')) tl.fromTo(e, { '--mag-gx': '18px', '--mag-gy': '-12px' }, { '--mag-gx': '4px', '--mag-gy': '3px', duration: .5, ease: 'power3.out', immediateRender: true }, t + .3);
    // 剪报的大页码（data-no）：胶带按上以后，橘红那一版从偏位处对过来
    if (e.matches('.mag-clip[data-no]')) { tl.fromTo(e, { '--mag-gx': '24px', '--mag-gy': '-16px' }, { '--mag-gx': '5px', '--mag-gy': '4px', duration: .5, ease: 'power3.out', immediateRender: true }, t + .32); end = Math.max(end, .82); }
    if (cover) { tl.fromTo(e, { '--mag-ds': .55, '--mag-dr': '-50deg', '--mag-do': 0 }, { '--mag-ds': 1, '--mag-dr': '0deg', '--mag-do': 1, duration: .55, ease: 'back.out(1.5)', immediateRender: true }, t + .28); end = Math.max(end, .83); }
    kidsOf(e).forEach((c, i) => {
      const s = (cover ? .36 : .32) + i * .09;
      const k = isPaper(c) ? pasteOne(tl, c, t + s, false, tiltOf(c), -side)
        : c.matches('.mag-fig') ? printFig(tl, c, t + s, false)
          : c.matches('.mag-no, .mag-disc') ? registerIn(tl, c, t + s, false, tiltOf(c))
            : typesetIn(tl, c, t + s, { dur: .44 });
      end = Math.max(end, s + k);
    });
    end = Math.min(end, 1.1);
    tl.call(() => clean(e), null, t + end);
    return end;
  }
  /* 「贴上」：纸条自己贴上；一排纸条的容器先亮出来，里面的纸条依次贴上；不是纸条的按「排字」 */
  function paste(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    if (isPaper(e)) return pasteOne(tl, e, t, true, tilt, sideOf(tilt));
    const kids = kidsOf(e);
    if (kids.some(isPaper)) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .15, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      let end = .15;
      kids.forEach((c, i) => {
        const s = .04 + i * .12;
        const k = isPaper(c) ? pasteOne(tl, c, t + s, false, tiltOf(c), i % 2 ? -1 : 1) : typesetIn(tl, c, t + s, { dur: .44 });
        end = Math.max(end, s + k);
      });
      return Math.min(end, 1.1);
    }
    return typesetIn(tl, e, t, { vis: true, tilt });
  }
  /* 「排字」：默认出场、大标题的出场；步骤的一项、纸条、装着纸条的容器转给「贴上」 */
  function typeset(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    if (isPaper(e) || kidsOf(e).some(isPaper)) return paste(tl, e, t, ctx);
    const big = e.classList.contains('s-title');
    return typesetIn(tl, e, t, { vis: true, tilt: ctx && ctx.tilt ? ctx.tilt() : tiltOf(e), dur: big ? .55 : .5 });
  }
  /* 「套印」「印上」「描线」：只认各自的组件，用在别的元素上时按「排字」 */
  function register(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    if (!e.matches('.mag-no, .mag-disc')) return typeset(tl, e, t, ctx);
    return registerIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e));
  }
  function print(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    return e.matches('.mag-fig') ? printFig(tl, e, t, true) : typeset(tl, e, t, ctx);
  }
  function trace(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    return e.matches('.mag-lead') ? traceIn(tl, e, t, true) : typeset(tl, e, t, ctx);
  }
  const FX = { paste, typeset, register, print, trace };
  const isLead = u => !!(u.el && u.el.classList && u.el.classList.contains('mag-lead'));
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是排字） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const pick = name && FX[name] ? name : Object.keys(BY).find(c => e.classList.contains(c));
    const f = FX[pick ? (BY[pick] || pick) : 'typeset'] || typeset;
    return f(tl, e, t, { tilt: () => tiltOf(e) });
  }

  /* =================================================================
     复制：剪刀一开一合沿虚线剪过去，碎纸屑弹起，券被剪下来翘起一点，过一会儿放回去
     （另起一条时间线，不放进引擎给的 tl：tl 播完引擎就开始让「已复制」淡出）
     ================================================================= */
  let cutTl = null, cutNode = null;
  function endCut() {
    if (cutTl) { const t = cutTl; cutTl = null; t.kill(); }
    if (cutNode) {
      cutNode.classList.remove('mag-cutting', 'mag-open', 'mag-cut', 'mag-back');
      cutNode.querySelectorAll('.mag-bit').forEach(b => b.remove());
      ['--mag-cut', '--mag-so'].forEach(k => cutNode.style.removeProperty(k));
      cutNode = null;
    }
  }
  // 剪刀走过的地方弹起几片碎纸屑（只在券上沿的空隙里，不盖住字）
  function snips(node, run) {
    for (let k = 0; k < 6; k++) {
      const b = document.createElement('i');
      b.className = 'mag-bit' + (k === 3 ? ' o' : '');
      b.setAttribute('aria-hidden', 'true');
      b.style.left = (40 + run * (k + .5) / 6).toFixed(1) + 'px';
      node.appendChild(b);
      G.timeline({ delay: .06 + k * .07, onComplete: () => b.remove() })
        .fromTo(b, { autoAlpha: 1, x: 0, y: 0, rotation: k * 37 },
          { x: (k % 2 ? 1 : -1) * (8 + k * 3), y: -(12 + (k * 7) % 14), rotation: '+=' + (k % 2 ? 160 : -140), duration: .26, ease: 'power2.out' })
        .to(b, { y: '+=8', autoAlpha: 0, duration: .24, ease: 'power1.in' });
    }
  }
  function cut(node) {
    endCut();
    cutNode = node;
    const run = Math.max(40, node.offsetWidth - 74);
    node.classList.add('mag-cutting');
    const tl = G.timeline({ onComplete: () => { if (cutTl === tl) { cutTl = null; endCut(); } } });
    tl.fromTo(node, { '--mag-cut': '0px' }, { '--mag-cut': run + 'px', duration: .5, ease: 'power1.inOut', immediateRender: true }, 0);
    for (let i = 0; i < 6; i++) tl.call(() => node.classList.toggle('mag-open', i % 2 === 0), null, i * .08);
    tl.call(() => snips(node, run), null, 0);
    tl.call(() => { node.classList.remove('mag-cutting', 'mag-open'); node.classList.add('mag-cut'); }, null, .42);
    // 和「已复制」一起收：放回去、剪刀淡出，回到起点再淡入
    tl.call(() => { node.classList.add('mag-back'); node.classList.remove('mag-cut'); }, null, 2.1);
    tl.to(node, { '--mag-so': 0, duration: .15, ease: 'none' }, 2.1);
    tl.set(node, { '--mag-cut': '0px' }, 2.3);
    tl.to(node, { '--mag-so': 1, duration: .25, ease: 'none' }, 2.3);
    cutTl = tl;
  }

  Deck.scene('magazine', {
    label: '杂志复古',
    family: 'modern',
    dark: false,
    mascot: 'xiaoqian',
    enter: 'typeset',
    enterBy: BY,
    titleIn: 'typeset',
    recede: .8,
    // 线稿是编辑随手画的墨线，圈注是一支橘红笔圈的，比线稿潦草一点
    rough: { strokeWidth: 2.6, roughness: .9, bowing: .8, markWidth: 4, markRoughness: 1.2, markBowing: 1 },
    fx: FX,
    // 半调网点（插图 .mag-fig 里用 fill="url(#mag-dot-o)" 这类引用）：45° 网屏，橘红、墨绿、墨黑三种
    defs: '<pattern id="mag-dot-o" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="2.5" fill="#E0532B"/></pattern>'
      + '<pattern id="mag-dot-g" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="2.3" fill="#1F4B3B"/></pattern>'
      + '<pattern id="mag-dot-k" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4" cy="4" r="1.4" fill="#1C1A17"/></pattern>',

    // 同一拍里有虚线引导时：线先描（几条线错开一点），别的块整体往后挪 0.3 秒，等线描到一大半再贴上去
    plan(units, { base }) {
      if (!units.some(isLead) || units.every(isLead)) return undefined;
      let k = 0;
      return units.map(u => isLead(u) ? base + (k++) * .08 : base + u.start + .3);
    },

    // 退一拍：重点词的纸条先撕掉（引擎同时把 --k 收回 0），整张纸条往上揭起、转一点拿走
    onBack({ tl, units }) {
      units.forEach((u, i) => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const side = i % 2 ? -1 : 1, at = .1 + i * .04;
        const peel = (x, isUnit) => {
          // 揭完由自己清掉 gsap 记着的转角：只清内联的话，下次出场会从这个角度开始
          const off = () => { G.set(x, { clearProps: 'transform' }); if (!isUnit) clean(x); };
          tl.to(x, { rotation: '+=' + (2.6 * side), duration: .34, ease: 'power2.in', onComplete: off, onInterrupt: off }, at);
        };
        if (isPaper(e)) peel(e, true);
        else kidsOf(e).filter(isPaper).forEach(c => peel(c, false));
      });
      return { at: .1, gap: .04, y: -26, dur: .36, childAt: .47 };
    },

    // 翻页：旧页往一边退开淡出，新页从另一边像翻过来的一页揭开（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      const o = from.el, n = to.el;
      tl.to(o, { x: -60 * dir, autoAlpha: 0, duration: .4, ease: 'power2.in', onComplete: () => { retire(); G.set(o, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(n, { clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', x: 24 * dir },
        { clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: .55, ease: 'power3.inOut', immediateRender: true, onComplete: () => { clear(n); G.set(n, { clearProps: 'transform' }); } }, .06);
      return .3;
    },

    // 「已复制」：剪刀先沿虚线剪过去（命令券才有），一张橘红小标签随后贴上、胶带按上
    copied({ tl, tip, node, ok }) {
      const isCopy = ok && node && node.matches && node.matches('.copy');
      const at = isCopy ? .44 : .04;
      tl.fromTo(tip, { autoAlpha: 0, scale: 1.3, rotation: -10 }, { autoAlpha: 1, scale: 1, rotation: -3, duration: .3, ease: 'back.out(2.2)' }, at);
      tl.fromTo(tip, { '--mag-tp': 0 }, { '--mag-tp': 1, duration: .16, ease: 'power2.out' }, at + .18);
      if (isCopy) cut(node);
    },

    // 开场（约 1.3 秒）：栏线拉开 → 主题行和页码落下 → 封面色块贴上、网点圆滚进来 → 大标题排上来 → 第 0 拍依次跟上 → 重点词贴纸条
    intro({ tl, page } = {}) {
      if (still() || !tl) return 0;
      const root = page && (page.el || page);
      if (!root || !root.querySelector) return 0;
      tl.fromTo(root, { '--mag-rule': 0 }, { '--mag-rule': 1, duration: .6, ease: 'power3.inOut', immediateRender: true, onComplete: () => root.style.removeProperty('--mag-rule') }, 0);
      const stage = root.closest('#stage');
      [stage && stage.querySelector(':scope > .chrome'), root.querySelector(':scope > .s-topic')].filter(Boolean).forEach((e, i) => {
        tl.fromTo(e, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: .36, ease: 'power2.out', immediateRender: true, onComplete: () => clean(e) }, .15 + i * .05);
      });
      let end = .6;
      // 第 0 拍的封面色块（没写 data-beat 的也算：它是第 0 拍就在的一块底）
      const covers = [...root.querySelectorAll('.mag-cover')].filter(c => { const b = c.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      covers.forEach((c, i) => { end = Math.max(end, .1 + i * .08 + pasteOne(tl, c, .1 + i * .08, true, tiltOf(c), -1)); });
      const title = root.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .34 + typesetIn(tl, title, .34, { vis: true, dur: .55 }));
      // 第 0 拍：只取最外层的（封面色块已经贴过了），形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !e.matches('.mag-cover')
        && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      const t0 = covers.length ? .5 : title ? .46 : .3;
      zero.forEach((e, i) => { const s = t0 + i * .1 + (parseFloat(e.dataset.delay) || 0); end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      if (keys.length) { const s = Math.max(.7, end - .1); tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .4, ease: 'power2.out', immediateRender: true }, s); end = Math.max(end, s + .4); }
      return Math.max(end, 1.2);
    },

    // 点击处一圈很淡的橘红网点向外散开就消失（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      if (still() || !layer) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'mag-ripple');
      svg.setAttribute('viewBox', '-60 -60 120 120');
      svg.setAttribute('aria-hidden', 'true');
      let dots = '';
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * Math.PI * 2, rr = k % 2 ? 40 : 30;
        dots += `<circle cx="${(Math.cos(a) * rr).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="${k % 2 ? 1.8 : 2.8}"/>`;
      }
      svg.innerHTML = dots;
      svg.style.left = x + 'px'; svg.style.top = y + 'px';
      layer.appendChild(svg);
      G.fromTo(svg, { scale: .35, autoAlpha: .45 }, { scale: 1.2, autoAlpha: 0, duration: .6, ease: 'power2.out', onComplete: () => svg.remove() });
    },

    // 离开这个风格（含进阅读模式）时：正在剪的券直接收好
    unmount() { endCut(); },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1390, y: 22, w: 420, h: 52, name: '页码和节拍纸片' },
      { x: 120, y: 79, w: 1680, h: 13, name: '页眉栏线' },
    ],
  });
})();
