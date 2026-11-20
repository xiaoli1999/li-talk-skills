/* =====================================================================
   风格 · 新粗野主义 brutal（现代风，浅色底）
   - 样子：奶黄底上一层很淡的墨点阵；字、描边、阴影都是同一种墨黑；3–4px 粗黑描边、无模糊的硬阴影（偏移 8px）；
     强调色只有黄、粉、蓝三种高饱和色块，每张卡片只带一种（卡片顶上一条色带）。字用系统黑体（粗），命令用等宽字。
     卡片像按钮一样能被「按下去」：悬停时离阴影远一点、朝鼠标那侧轻轻一歪，按下时压进阴影
   - 适合讲：上手教程、流程步骤、产品工具介绍、内部分享。不适合：严肃汇报、对外正式场合、大段文字
   - 默认形象：砰砰 pengpeng（长了手脚的黄色爆炸贴纸小怪物，粗黑描边；硬投影由这里的 CSS 加）
   - 投影上的注意：没有只在部分浏览器生效的效果；墨黑对奶黄，投到幕布上可读性好
   - 从定稿样页（新粗野主义）搬来的效果，以及改成对任意页面都成立的写法：
     1. 背景：奶黄底 + 墨点阵写进 --scene-bg（舞台单位 40px 一格，背景层铺满窗口、阅读模式每页也用它）。
        样页的点阵跟着鼠标视差，这一版不做视差，所以不用 backdrop
     2. 硬阴影：样页每张卡片是「槽位 > 卡片 > 阴影块 + 面板」四层标记，这里改成组件自己的 box-shadow，
        偏移按几个 CSS 变量算（brutal.css）：--bz-h 悬停 / 按下（CSS 过渡）、--bz-k 落地 / 复制时压进阴影（本文件推动）、
        --bz-a 在空中时阴影离得更远、--bz-j 被旁边落地的卡片震一下。页面不用多写任何标记
     3. 出场「砸下来」slam（卡片、小格、步骤每一项、终端、截图位、命令，以及一排卡片的容器）：从上方直直砸下、
        离地越高阴影越远 → 落地一瞬压进阴影再回弹、两侧甩出冲击线、已经落定的卡片被震得跳一下 →
        里面的字依次落位（卡片的小标签色带从左往右贴上）。一排卡片的容器整拍出场时，里面的卡片依次砸下
     4. 「逐字砸下」smash（大标题、金句的出场）：样页标题的做法，字一出现就是实心的、带一点歪、加速落地，最后整行一震。
        直接写着的字临时拆成单字，播完拆回原样；里面的元素（如重点词）当一个字
     5. 「啪地拍上」slap（标签）：像贴纸从镜头前拍下，压一下再弹平
     6. 「弹起」snap（默认出场，正文、解释句这类文字）：一下子出现、从下面弹到位；
        一个普通的块里直接放着卡片、命令或标签时，块一下子亮出来，里面的组件一个个砸下、标签一个个拍上
     7. 重点词：贴纸式色块（带描边和硬阴影），跟着引擎的 --k 从镜头前拍下、略微歪着（brutal.css）。
        色块的颜色取所在卡片的颜色（--tint），没有就是黄
     8. 复制（copied）：命令按钮被按到底（压进阴影、闪成黄色）→「已复制」黄贴纸啪地拍上 → 贴纸角上甩出冲击线 → 按钮弹回
     9. 节拍指示：一枚带硬阴影的小按钮，每拍一个方格依次填上黄、粉、蓝；新点亮的格子「盖章」，拍号从上面掉进来（brutal.css）
     10. 悬停：卡片、步骤、小格、截图位、终端离阴影远一点、朝鼠标那侧轻轻一歪；按下时压进阴影（mount 时挂 pointermove 写 --bz-rz）
     11. 退一拍（onBack）：重点词贴纸被撕掉（引擎把 --k 收回，CSS 让它飞回镜头前）→ 卡片被捏起来（阴影拉远）→ 整张往上抛走
     12. 开场（intro）：主题行的章节块砸下、主题滑入 → 标题一个字一个字砸下来、整行一震 → 第 0 拍跟上 →
         节拍指示从上面盖下、按进阴影弹回 → 重点词拍上；之后引擎让形象落下
     13. 点击处一圈很淡的冲击线（ripple）；翻页（pageTurn）：旧页被一把推开，新页从另一边冲进来、到位时顿一下
   - 没搬的：背景点阵的鼠标视差（这一版不做视差）；样页 60 秒没人动就打盹（引擎统一 5 分钟）；
     形象的走位、反应、空闲动作和「从天而降」（引擎的形象部分统一做）；节拍指示整枚按下去的换拍动效（只在开场做一次，
     换拍时用格子盖章、拍号掉落代替——引擎每次换拍只重写拍号，整枚按钮没有重播动画的时机）
   - 样页卡片上的「STEP 01」英文小标签：横排步骤每一项顶上的色带里保留（写在伪元素里，不算正文字号）
   - 自己加的出场名：slam、smash、slap、snap，以及下面版式组件用的 bzblock、bztag、bzbang、bzcut、bzprint、bzclick，
     只在这个风格里认（别的风格会提醒并换成它的默认出场）；版式组件按类名自动选，页面里不用写
   - 新粗野主义自己的版式组件（.bz-*，只在这个风格里有样子；样板页 samples/brutal.js 把每个都用了一遍，整段抄过去改字就行）。
     每拍「发生了什么」：块砸下来、落地时颜色错开半截再硬切到位（色块压印）、编号和叉号像图章一样盖下、
     色带和台阶一格一格硬切出来、海报大字带着位移砰地撞进来、大光标飞过来按下按钮。动作都在组件里，页面只写结构和 data-beat。
     · .bz-tag：价签（封面）。左头是尖角、打了一个孔，一根粗绳从孔里穿出去伸到舞台外；整块带硬投影，颜色类换底色（默认黄）。
       里面放 .bz-string（绳子）、.bz-rule（一道粗墨线）、.bz-bars（条形码，纯装饰）和自己的字（页面 CSS 定位）。
       页面写死 width、height（尖角按高度画，高度 500–700 最好看）。出场：顺着绳子从上面掉下来、落地压进阴影、晃一下停住，条形码一格格印出来
     · .bz-sticker：标签贴（讲者、署名这种一句话），描边加硬阴影，颜色类换底色（默认粉）；啪地拍上
     · .bz-tile：色块格（便当盒式的格子，一页拼几块大小不一的）。里面 <b class="bz-no">01</b> 是左上角的编号图章，
       <i class="bz-art" data-bz-art="名字"></i> 是简笔插画（内置 gaiwan 盖碗、scale 一小撮茶叶放在秤上、kettle 水壶），再放 h3、p。
       页面写死 width、height（格子之间对齐）。出场：白框砸下来 → 落地时颜色错开半截印上去、下一格硬切到位 → 编号盖下 → 插画蹦出、字弹起。
       加 .bz-dots 是一块不进拍的墨色点阵格（给形象待着，里面不放字）
     · .bz-riser > .bz-num：台阶（墨色实心块，顶上一道颜色类的踏面）和台阶上的大号数字（就是步骤的序号，带 data-beat）。
       台阶第 0 拍从地面一格格升起，数字到拍时错位着印上去
     · .bz-step：放在台阶上的步骤块（实色、描边、硬阴影，h3 + p）。用 bottom 定位，底边正好落在台阶顶上；出场和 .bz-tile 一样
     · .bz-slab：海报色块（实色，没有描边；一道粗黑框错开 --bz-o（默认 22px）压在上面，像套印没对准）。里面只放 8 个字以内的大字或大数字。
       出场「带位移的砰」：从旁边两格硬切撞进来，黑框被撞得错开一大截再弹回 22px，整块抖两下、旁边的块被震一下
     · .bz-band：横贯整页的墨色色带（奶黄大字，项目之间用 <i></i> 隔开，画成黄色小方块），底下一道粉色硬投影；从左往右一格格硬切出来
     · .bz-sign：警示牌（顶上 .bz-haz 黄黑警示条，.bz-bad 粉色面板里一个 .bz-x 叉号图章和错的做法，.bz-down 一个粗箭头，
       .bz-fix 里一个 .bz-ok 对勾图章和对的做法）。出场：整块砸下来 → 警示条硬切出来 → 面板弹起、叉号盖下 → 箭头切出 → 对的做法弹起、对勾盖下。
       .bz-slot 是第 0 拍就在的虚线槽位（和牌子一样大），牌子砸进槽里
     · .bz-btn + .bz-cursor：一颗超大的按钮（颜色类换底色，默认黄；末尾 <i></i> 画成粗箭头）和一只大光标（这里画好，建页时填进去）。
       同一拍里：按钮砸下来、颜色印上去，光标随后飞过来按一下，按钮被按进阴影再弹回（光标找同一页的 .bz-btn）
     · .bz-ask：问号气泡贴纸（一块带尾巴的实色气泡，里面一个超大的问号，颜色类换底色，默认蓝），纯装饰，啪地拍上；结尾页「欢迎提问」旁边用
     · .copy.bz-lit：放在墨色块上的命令，硬投影换成黄色
     可读性约定见下面「新粗野主义自己的版式组件」一节开头
   - 冲击线放在每页一层 .bz-fx 里（第一次用时加到页面最后，在内容上面、不接收指针），播完即删
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍按钮（.meta 在这里改到 top 20，按钮高 60、硬阴影再往右下 5px；按每页最多 4 拍量，
       留出余量后是 x 1320–1870、y 12–90）
   - 样子在 brutal.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* 有硬阴影的组件；SKIP 是出场时不跟着动的子元素（形象、圈注层、涟漪层、冲击线层、提示框） */
  const BLOCK = '.bz-tile, .bz-step, .bz-sign, .bz-btn';               // 版式组件里有硬阴影的块
  const RING = '.card, .cell, .term, .shot, .copy, .steps > li, ' + BLOCK;
  const TILT = '.card, .cell, .shot, .steps > li, ' + BLOCK;         // 悬停时朝鼠标那侧歪一点的组件
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .bz-fx, .copied-tip, script, style';
  /* 默认出场按组件类名分：有硬阴影的组件和一排卡片的容器「砸下来」，标签「拍上」，金句「逐字砸下」，其余文字「弹起」；
     版式组件（.bz-*）各有各的出场，见「新粗野主义自己的版式组件」一节 */
  const BY = { card: 'slam', cell: 'slam', term: 'slam', shot: 'slam', copy: 'slam', steps: 'slam', cells: 'slam', grid: 'slam', row: 'slam', col: 'slam', vs: 'slam', tag: 'slap', quote: 'smash',
    'bz-tile': 'bzblock', 'bz-step': 'bzblock', 'bz-sign': 'bzblock', 'bz-btn': 'bzblock', 'bz-tag': 'bztag', 'bz-sticker': 'slap', 'bz-ask': 'slap',
    'bz-slab': 'bzbang', 'bz-band': 'bzcut', 'bz-riser': 'bzcut', 'bz-num': 'bzprint', 'bz-cursor': 'bzclick' };
  const PROPS = ['opacity', 'visibility', 'transform', 'transform-origin', 'translate', 'rotate', 'scale', 'clip-path', '--bz-k', '--bz-a', '--bz-j', '--bz-p'];

  const isRing = e => !!(e && e.matches && e.matches(RING));
  const isTag = e => !!(e && e.matches && e.matches('.tag'));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子 */
  const clean = e => PROPS.forEach(k => e.style.removeProperty(k));
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
  /* 元素在页面里的框（舞台坐标；页面可能正在横移，但不缩放） */
  function boxIn(e, slide) {
    const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1, r = e.getBoundingClientRect();
    return { l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
  }

  /* =================================================================
     一次性的冲击线：从一点向外放射几道短粗线，弹开后淡掉、删除（样页的 spark）
     ================================================================= */
  function fxLayer(slide) {
    let l = slide.querySelector(':scope > .bz-fx');
    if (!l) { l = document.createElement('div'); l.className = 'bz-fx'; l.setAttribute('aria-hidden', 'true'); slide.appendChild(l); }
    return l;
  }
  function spark(layer, x, y, angles, o) {
    if (!layer || still()) return;
    const { r0 = 12, r1 = 34, w = 4, alpha = 1, dur = .32 } = o || {};
    const size = Math.ceil((r1 + w) * 2 + 8), c = size / 2;
    const ls = angles.map(a => {
      const t = a * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
      return `<line x1="${(c + cs * r0).toFixed(1)}" y1="${(c + sn * r0).toFixed(1)}" x2="${(c + cs * r1).toFixed(1)}" y2="${(c + sn * r1).toFixed(1)}"/>`;
    }).join('');
    const el = document.createElement('i');
    el.className = 'bz-spark';
    el.style.cssText = `left:${(x - c).toFixed(1)}px;top:${(y - c).toFixed(1)}px;width:${size}px;height:${size}px`;
    el.innerHTML = `<svg viewBox="0 0 ${size} ${size}"><g stroke="currentColor" stroke-width="${w}" stroke-linecap="round">${ls}</g></svg>`;
    layer.appendChild(el);
    G.fromTo(el, { scale: .5, opacity: alpha }, { scale: 1.15, duration: dur, ease: 'power2.out' });
    G.to(el, { opacity: 0, duration: dur * .55, delay: dur * .45, ease: 'none', onComplete: () => el.remove() });
  }
  /* 落地：组件底边两侧各甩出一撮冲击线（小组件小一点） */
  function thud(e) {
    const slide = e.closest && e.closest('.slide');
    if (!slide || still()) return;
    const b = boxIn(e, slide), big = b.b - b.t > 150, layer = fxLayer(slide);
    const o = big ? { r0: 14, r1: 40, w: 4, alpha: .9 } : { r0: 10, r1: 28, w: 3.5, alpha: .9 };
    spark(layer, b.l - 6, b.b - 4, [150, 180, 210], o);
    spark(layer, b.r + 14, b.b + 2, [-30, 0, 30], o);
  }
  /* 已经落定的组件被这一下震得跳一下，像桌子被砸了（推 --bz-j，不碰 transform；正在动的、还没出现的不震）；
     翻拍、跳页时引擎会掐掉这段补间（killTweensOf），掐断时也要把 --bz-j 清掉，不然块会一直往上偏几像素 */
  function jolt(e) {
    const slide = e.closest && e.closest('.slide');
    if (!slide || still()) return;
    const seen = o => { const cs = getComputedStyle(o); return cs.visibility === 'visible' && parseFloat(cs.opacity) > .3 && o.offsetWidth > 0; };
    [...slide.querySelectorAll(RING)]
      .filter(o => o !== e && !o.contains(e) && !e.contains(o) && !G.isTweening(o) && seen(o))
      .slice(0, 8)
      .forEach((o, i) => { const off = () => o.style.removeProperty('--bz-j'); G.fromTo(o, { '--bz-j': '0px' }, { '--bz-j': '-7px', duration: .07, ease: 'power1.out', yoyo: true, repeat: 1, delay: i * .03, onComplete: off, onInterrupt: off }); });
  }

  /* =================================================================
     出场
     ================================================================= */
  /* 线稿元素点名用了这里的出场：淡入 */
  function fadeIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    return .3;
  }
  /* 一下子出现（不慢慢淡入）：vis 为 true 时连 visibility 一起管（只给节拍单元本身用） */
  function appear(tl, e, t, vis) {
    tl.fromTo(e, vis ? { autoAlpha: 0 } : { opacity: 0 }, Object.assign(vis ? { autoAlpha: 1 } : { opacity: 1 }, { duration: .06, ease: 'none', immediateRender: true }), t);
  }

  /* 弹起（默认出场）：一下子出现，从下面弹到位；里面直接放着有硬阴影的组件或标签的块，改成一个个砸下、拍上 */
  function snapIn(tl, e, t, vis, tilt) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    if (e.matches(BLOCK)) return blockIn(tl, e, t, vis, tilt);
    if (isRing(e)) return slamOne(tl, e, t, vis, tilt);
    if (vis && kidsOf(e).some(c => isRing(c) || isTag(c))) return group(tl, e, t);
    appear(tl, e, t, vis);
    const from = { y: 26 }, to = { y: 0, duration: .3, ease: 'back.out(2)', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    return .3;
  }

  /* 一个组件砸下来：直直砸下（阴影离得远）→ 落地压进阴影再回弹、甩冲击线、震一下旁边的 → 里面的字依次落位 */
  let kick = 0;
  function slamOne(tl, e, t, vis, tilt) {
    const tl0 = tilt || 0, k0 = tl0 + (kick++ % 2 ? 3 : -3);
    const P = Math.max(3, (parseFloat(getComputedStyle(e).getPropertyValue('--bz-s')) || 8) - 1);   // 压进阴影多深
    const off = () => clean(e);
    appear(tl, e, t, vis);
    tl.fromTo(e, { y: -190, rotation: k0 }, { y: 0, rotation: tl0, duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.fromTo(e, { '--bz-a': '20px' }, { '--bz-a': '0px', duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.call(() => { thud(e); jolt(e); }, null, t + .3);
    tl.fromTo(e, { x: 0, y: 0, '--bz-k': '0px' }, { x: P, y: P, '--bz-k': P + 'px', duration: .05, ease: 'power1.out', immediateRender: false }, t + .3);
    tl.to(e, { x: 0, y: 0, '--bz-k': '0px', duration: .34, ease: 'back.out(2.6)', onComplete: off, onInterrupt: off }, t + .35);
    let end = .69;
    // 里面的字依次落位：卡片的小标签色带从左往右贴上，其余从下面弹起（命令、截图位里面不动）
    if (e.matches('.card, .steps > li, .cell, .term')) {
      const kids = kidsOf(e).filter(c => !c.matches('.term-bar'));
      const gap = kids.length ? Math.min(.07, .3 / kids.length) : 0;
      kids.forEach((c, i) => {
        const s = .34 + i * gap, back = keep(c);
        if (c.matches('.lab')) tl.fromTo(c, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .2, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back }, t + s);
        else tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .3, ease: 'back.out(2)', immediateRender: true, onComplete: back, onInterrupt: back }, t + s);
        end = Math.max(end, s + .3);
      });
    }
    return Math.min(end, 1);
  }

  /* 一组：容器一下子亮出来，里面有硬阴影的组件依次砸下、标签依次拍上，别的子元素弹起 */
  function group(tl, e, t) {
    const kids = kidsOf(e);
    appear(tl, e, t, true);
    tl.call(() => { e.style.removeProperty('opacity'); e.style.removeProperty('visibility'); }, null, t + .07);
    const gap = Math.min(.12, .5 / kids.length);
    let end = .1;
    kids.forEach((c, i) => {
      const s = .02 + i * gap;
      end = Math.max(end, s + (c.matches(BLOCK) ? blockIn(tl, c, t + s, false, tiltOf(c)) : isRing(c) ? slamOne(tl, c, t + s, false, tiltOf(c)) : isTag(c) ? slapOne(tl, c, t + s, false, tiltOf(c)) : snapIn(tl, c, t + s, false, 0)));
    });
    return Math.min(end, 1.15);
  }

  /* 砸下来：有硬阴影的组件自己砸下；一排卡片的容器先亮出来，里面的卡片依次砸下；别的块当文字弹起 */
  function slam(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    if (!isRing(e) && kidsOf(e).some(isRing)) return group(tl, e, t);
    if (!isRing(e)) return snapIn(tl, e, t, true, tilt);
    if (e.matches(BLOCK)) return blockIn(tl, e, t, true, tilt);
    return slamOne(tl, e, t, true, tilt);
  }

  /* 啪地拍上（标签）：从镜头前拍下来，压一下再弹平 */
  function slapOne(tl, e, t, vis, tilt) {
    appear(tl, e, t, vis);
    tl.fromTo(e, { scale: 2.1, rotation: tilt - 22 }, { scale: 1, rotation: tilt, duration: .2, ease: 'power3.in', immediateRender: true }, t);
    tl.to(e, { scale: .93, duration: .05, ease: 'power1.out' }, t + .2);
    tl.to(e, { scale: 1, duration: .18, ease: 'back.out(3)', onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .25);
    return .43;
  }
  function slap(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    return slapOne(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e));
  }

  /* 逐字砸下（大标题、金句）：直接写着的字临时拆成单字，一个个带着一点歪砸下来，播完拆回原样；最后整行一震 */
  function split(e) {
    unsplit(e);
    const items = [], id = (e._bzSplit = (e._bzSplitN = (e._bzSplitN || 0) + 1));
    [...e.childNodes].forEach(n => {
      if (n.nodeType === 1) { if (!n.matches('br')) items.push(n); return; }
      if (n.nodeType !== 3 || !n.nodeValue) return;
      const frag = document.createDocumentFragment();
      // 连在一起的字母数字算一个「字」，免得英文单词被拆开换行
      (n.nodeValue.match(/[A-Za-z0-9_.'’-]+|\s+|[\s\S]/gu) || []).forEach(s => {
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        const sp = document.createElement('span'); sp.className = 'bz-ch'; sp.textContent = s;
        frag.appendChild(sp); items.push(sp);
      });
      n.replaceWith(frag);
    });
    return { items, id };
  }
  function unsplit(e, id) {
    if (!e._bzSplit || (id != null && e._bzSplit !== id)) return;
    e.querySelectorAll(':scope > span.bz-ch').forEach(sp => sp.replaceWith(document.createTextNode(sp.textContent)));
    e.normalize();
    e._bzSplit = 0;
  }
  function smash(tl, e, t, ctx) {
    if (e instanceof SVGElement || !e.textContent.trim()) return snapIn(tl, e, t, true, 0);
    const { items, id } = split(e);
    if (!items.length) { unsplit(e, id); return snapIn(tl, e, t, true, 0); }
    const n = items.length, gap = Math.min(.035, .55 / n);
    const back = items.filter(x => !x.classList.contains('bz-ch')).map(keep);
    const done = () => { back.forEach(f => f()); unsplit(e, id); };
    tl.fromTo(items, { opacity: 0 }, { opacity: 1, duration: .03, stagger: gap, ease: 'none', immediateRender: true }, t);
    tl.fromTo(items, { y: -80, rotation: i => (i % 2 ? 10 : -10) }, { y: 0, rotation: 0, duration: .2, stagger: gap, ease: 'power3.in', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    const land = .2 + gap * (n - 1);
    tl.fromTo(e, { y: 0 }, { y: 5, duration: .05, ease: 'power1.out', yoyo: true, repeat: 1, immediateRender: false, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + land);
    return land + .1;
  }

  /* =================================================================
     新粗野主义自己的版式组件（.bz-*）：粗黑边、硬投影、撞色、超大字。样子在 brutal.css 末尾同名的一节，
     样板页 samples/brutal.js 把每个都用了一遍。用法见文件开头的组件清单。
     可读性约定（组件就是按这几条做的）：
     · 字只压在实色上：色块、台阶、色带都是实色，墨字压黄、粉、蓝，奶黄字压墨色；点阵、斜纹只铺在没有字的地方（警示条、形象待的格子）
     · 错位只错「框」不错「字」：海报色块的黑框错开 22px，字留在色块里面，离色块左边、上边至少 40px，不碰到框线
     · 讲过的不藏：警示牌、台阶上的步骤、色块格讲完都留着，引擎退到 .8；叉号、对勾、编号是块的一部分，跟着块一起退，不另调淡
     · 倾斜只给块，有字的块不超过 2°（--r 在 ±2deg 以内）；超大字只给 8 个字以内的海报词和数字，说明一律 34px 以上的实色字
     · 一页的重点词贴纸不超过 3 个；警示牌的叉号、对勾和台阶上的大号数字是图形和序号，不算强调
     ================================================================= */
  /* 简笔插画 [data-bz-art="名字"]：墨线描边、实色平涂（奶白、黄、粉、蓝），CSS 再给整张加一道硬投影；里面不放字 */
  const ART = {
    // 盖碗：碗盖 + 碗身（腰上一道粉）+ 托碟，顶上三缕热气
    gaiwan: { vb: '0 0 400 320', svg: '<path class="n" d="M168 70q-14-15 0-30t0-30M200 62q-14-15 0-30t0-30M232 70q-14-15 0-30t0-30"/>'
      + '<path class="w" d="M40 276H360L334 304H66Z"/><rect class="w" x="156" y="250" width="88" height="28" rx="4"/>'
      + '<path class="w" d="M74 150H326C326 222 272 258 200 258S74 222 74 150Z"/><path class="p" d="M82 184H318C313 200 305 213 295 224H105C95 213 87 200 82 184Z"/>'
      + '<path class="w" d="M92 152C100 106 148 86 200 86S300 106 308 152Z"/><rect class="b" x="176" y="60" width="48" height="30" rx="6"/>' },
    // 一小撮茶叶放在厨房秤上（三克）：秤身奶白、墨色显示窗里两格黄
    scale: { vb: '0 0 340 260', svg: '<path class="w" d="M44 146H296L318 244H22Z"/><rect class="k" x="112" y="176" width="116" height="40" rx="6"/>'
      + '<rect class="y" x="128" y="186" width="34" height="20" rx="2" style="stroke-width:0"/><rect class="y" x="172" y="186" width="34" height="20" rx="2" style="stroke-width:0"/>'
      + '<rect class="w" x="146" y="120" width="48" height="28"/><path class="w" d="M38 104H302Q296 126 272 126H68Q44 126 38 104Z"/>'
      + '<g class="lf"><path class="w" transform="translate(112 92) rotate(-14)" d="M-40 0C-20-18 20-18 40 0C20 16-20 16-40 0ZM-32 0H32"/>'
      + '<path class="w" transform="translate(226 92) rotate(12)" d="M-40 0C-20-18 20-18 40 0C20 16-20 16-40 0ZM-32 0H32"/>'
      + '<path class="w" transform="translate(170 84) rotate(4)" d="M-40 0C-20-18 20-18 40 0C20 16-20 16-40 0ZM-32 0H32"/>'
      + '<path class="w" transform="translate(140 64) rotate(22)" d="M-40 0C-20-18 20-18 40 0C20 16-20 16-40 0ZM-32 0H32"/>'
      + '<path class="w" transform="translate(200 60) rotate(-20)" d="M-40 0C-20-18 20-18 40 0C20 16-20 16-40 0ZM-32 0H32"/></g>' },
    // 电水壶：墨色粗提手、朝左的壶嘴、腰上一道黄，底座；壶嘴冒两缕热气
    kettle: { vb: '0 0 340 300', svg: '<path class="n" d="M34 118q-12-14 0-28t0-28M62 106q-12-14 0-28t0-28"/>'
      + '<path class="k" d="M110 102C110 22 238 22 238 102H216C216 50 132 50 132 102Z"/>'
      + '<path class="w" d="M104 206L40 154L56 136L118 176Z"/><path class="w" d="M104 96H244L276 264H72Z"/>'
      + '<path class="y" d="M89 200H259L265 232H83Z"/><rect class="w" x="134" y="80" width="80" height="22" rx="6"/>'
      + '<rect class="k" x="158" y="62" width="32" height="20" rx="4"/><rect class="w" x="56" y="262" width="236" height="20" rx="5"/>' },
  };
  /* 大光标：墨色箭头、奶白描边（硬投影在 CSS） */
  const CURSOR = '<svg viewBox="0 0 120 170" focusable="false"><path d="M12 10V136L42 108L64 158L90 146L68 98H110Z"/></svg>';
  function fillArt(el) {
    const a = ART[el.dataset.bzArt];
    if (!a) { console.warn(`[Deck] 新粗野主义插画 data-bz-art="${el.dataset.bzArt}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="${a.vb}" focusable="false">${a.svg}</svg>`;
  }

  const STAMP = '.bz-no, .bz-x, .bz-ok';
  /* 色块压印：块的颜色层（::before，跟着 --bz-p）先错开半截印上去，下一格硬切到位 */
  function imprint(tl, e, t) {
    const off = () => e.style.removeProperty('--bz-p');
    tl.fromTo(e, { '--bz-p': 0 }, { '--bz-p': .45, duration: .01, ease: 'none', immediateRender: true }, t);
    tl.to(e, { '--bz-p': 1, duration: .01, ease: 'none', onComplete: off, onInterrupt: off }, t + .08);
    return .1;
  }
  /* 图章（编号、叉号、对勾）：从镜头前放大、歪着盖下来，压一下再弹平；叉号盖下时甩出冲击线 */
  function stampIn(tl, c, t, burst) {
    const tilt = tiltOf(c), back = keep(c);
    tl.fromTo(c, { opacity: 0, scale: 2.2, rotation: tilt - 18 }, { opacity: 1, scale: 1, rotation: tilt, duration: .16, ease: 'power3.in', immediateRender: true }, t);
    tl.to(c, { scale: .9, duration: .04, ease: 'power1.out' }, t + .16);
    tl.to(c, { scale: 1, duration: .16, ease: 'back.out(3)', onComplete: back, onInterrupt: back }, t + .2);
    if (burst) tl.call(() => {
      const s = c.closest('.slide');
      if (!s || still()) return;
      const b = boxIn(c, s);
      spark(fxLayer(s), b.l - 4, b.t - 4, [190, 225, 260], { r0: 10, r1: 30, w: 4 });
    }, null, t + .16);
    return .36;
  }
  /* 插画蹦出：从底边三格硬切长到原大 */
  function popIn(tl, c, t) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, scale: .5, transformOrigin: '50% 100%' }, { opacity: 1, scale: 1, duration: .15, ease: 'steps(3)', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return .15;
  }
  /* 硬切露出：clip-path 分几格从一边露到整块（警示条、箭头、粗墨线、条形码） */
  const CLIP0 = { left: 'inset(-10% 100% -10% -10%)', top: 'inset(-10% -10% 100% -10%)', bottom: 'inset(100% -10% -10% -10%)' };
  function wipeIn(tl, c, t, from, n, dur) {
    const back = keep(c);
    tl.fromTo(c, { clipPath: CLIP0[from] }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: dur, ease: `steps(${n})`, immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return dur;
  }
  /* 块里的字、面板：从下面弹起来 */
  function riseKid(tl, c, t) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .26, ease: 'back.out(2)', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return .26;
  }

  /* 一块砸下来（.bz-tile .bz-step .bz-sign .bz-btn）：白框直直砸下 → 落地压进阴影、甩冲击线、震一下旁边的 →
     颜色错开半截印上去再硬切到位（警示牌本身是白的，不印）→ 里面依次：图章盖下、插画蹦出、警示条和箭头硬切、字和面板弹起 */
  function blockIn(tl, e, t, vis, tilt) {
    tilt = tilt || 0;
    const sign = e.matches('.bz-sign');
    const k0 = tilt + (kick++ % 2 ? 5 : -5);
    const P = Math.max(3, (parseFloat(getComputedStyle(e).getPropertyValue('--bz-s')) || 12) - 2);
    const off = () => clean(e);
    appear(tl, e, t, vis);
    tl.fromTo(e, { y: sign ? -280 : -200, rotation: k0 }, { y: 0, rotation: tilt, duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.fromTo(e, { '--bz-a': '24px' }, { '--bz-a': '0px', duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.call(() => { thud(e); jolt(e); }, null, t + .3);
    tl.fromTo(e, { x: 0, y: 0, '--bz-k': '0px' }, { x: P, y: P, '--bz-k': P + 'px', duration: .05, ease: 'power1.out', immediateRender: false }, t + .3);
    tl.to(e, { x: 0, y: 0, '--bz-k': '0px', duration: .32, ease: 'back.out(2.6)', onComplete: off, onInterrupt: off }, t + .35);
    let end = .67;
    if (!sign) end = Math.max(end, .3 + imprint(tl, e, t + .3));
    let s = .36;
    kidsOf(e).forEach(c => {
      let d;
      if (c.matches(STAMP)) d = stampIn(tl, c, t + s, c.matches('.bz-x'));
      else if (c.matches('.bz-art')) d = popIn(tl, c, t + s);
      else if (c.matches('.bz-haz')) d = wipeIn(tl, c, t + s, 'left', 6, .24);
      else if (c.matches('.bz-down')) d = wipeIn(tl, c, t + s, 'top', 3, .15);
      else {
        d = riseKid(tl, c, t + s);
        // 面板里的图章（叉号、对勾）跟在面板后面盖下
        [...c.children].filter(x => x.matches(STAMP) && !x.hasAttribute('data-beat'))
          .forEach(x => { d = Math.max(d, .1 + stampIn(tl, x, t + s + .1, x.matches('.bz-x'))); });
      }
      end = Math.max(end, s + d);
      s += .07;
    });
    return Math.min(end, 1.15);
  }

  /* 价签（.bz-tag）：顺着绳子从上面掉下来 → 落地压进阴影、甩冲击线 → 绕着孔晃一下停住 → 粗墨线、条形码一格格印出来，字弹起 */
  function tagIn(tl, e, t, vis, tilt) {
    tilt = tilt || 0;
    const off = () => clean(e);
    appear(tl, e, t, vis);
    tl.fromTo(e, { y: -300, rotation: tilt - 6 }, { y: 0, rotation: tilt + 2, duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.fromTo(e, { '--bz-a': '28px' }, { '--bz-a': '0px', duration: .3, ease: 'power3.in', immediateRender: true }, t);
    tl.call(() => thud(e), null, t + .3);
    tl.fromTo(e, { x: 0, y: 0, '--bz-k': '0px' }, { x: 12, y: 12, '--bz-k': '12px', duration: .05, ease: 'power1.out', immediateRender: false }, t + .3);
    tl.to(e, { x: 0, y: 0, '--bz-k': '0px', duration: .3, ease: 'back.out(2.6)' }, t + .35);
    tl.to(e, { rotation: tilt - 1.2, duration: .14, ease: 'power2.inOut' }, t + .3);
    tl.to(e, { rotation: tilt, duration: .24, ease: 'back.out(3)', onComplete: off, onInterrupt: off }, t + .44);
    let end = .68, s = .34;
    kidsOf(e).forEach(c => {
      if (c.matches('.bz-string')) return;
      const d = c.matches('.bz-bars') ? wipeIn(tl, c, t + s, 'left', 8, .24) : c.matches('.bz-rule') ? wipeIn(tl, c, t + s, 'left', 4, .12) : riseKid(tl, c, t + s);
      end = Math.max(end, s + d);
      s += .06;
    });
    return Math.min(end, 1.1);
  }

  /* 带位移的砰（.bz-slab）：从旁边带着歪两格硬切撞到位 → 黑框被撞得错开一大截、再两格弹回原来的错位 →
     整块左右抖两下、甩冲击线、旁边的块被震一下 */
  function bangIn(tl, e, t, vis, tilt) {
    tilt = tilt || 0;
    const dir = kick++ % 2 ? 1 : -1;
    const o0 = e.style.getPropertyValue('--bz-o');
    const oEnd = getComputedStyle(e).getPropertyValue('--bz-o').trim() || '22px';
    const off = () => { clean(e); if (o0) e.style.setProperty('--bz-o', o0); else e.style.removeProperty('--bz-o'); };
    appear(tl, e, t, vis);
    tl.fromTo(e, { x: 170 * dir, y: -36, rotation: tilt + 5 * dir }, { x: 0, y: 0, rotation: tilt, duration: .12, ease: 'steps(2)', immediateRender: true }, t);
    tl.fromTo(e, { '--bz-o': '0px' }, { '--bz-o': '60px', duration: .01, ease: 'none', immediateRender: true }, t + .12);
    tl.to(e, { '--bz-o': oEnd, duration: .14, ease: 'steps(2)', onComplete: off, onInterrupt: off }, t + .18);
    tl.call(() => { thud(e); jolt(e); }, null, t + .12);
    tl.to(e, { x: -12 * dir, duration: .04, ease: 'steps(1)' }, t + .14);
    tl.to(e, { x: 8 * dir, duration: .04, ease: 'steps(1)' }, t + .18);
    tl.to(e, { x: 0, duration: .04, ease: 'steps(1)' }, t + .22);
    return .34;
  }

  /* 硬切出现（.bz-band 从左往右、.bz-riser 从地面往上）：一格一格露出来，没有缓动 */
  function cutIn(tl, e, t, vis) {
    const riser = e.matches('.bz-riser');
    const off = () => clean(e);
    const from = { clipPath: riser ? 'inset(100% -6% -6% -6%)' : 'inset(-40% 100% -40% -4%)' };
    const to = { clipPath: riser ? 'inset(-6% -6% -6% -6%)' : 'inset(-40% -4% -40% -4%)', duration: riser ? .2 : .3, ease: `steps(${riser ? 4 : 6})`, immediateRender: true, onComplete: off, onInterrupt: off };
    if (vis) { from.autoAlpha = 1; to.autoAlpha = 1; }
    tl.fromTo(e, from, to, t);
    return to.duration;
  }

  /* 色块压印（.bz-num 台阶上的大号数字）：先错开 26px 印上去，两格硬切到位，再压一下 */
  function printIn(tl, e, t, vis, tilt) {
    tilt = tilt || 0;
    const off = () => clean(e);
    appear(tl, e, t, vis);
    tl.fromTo(e, { x: 26, y: 26, rotation: tilt }, { x: 0, y: 0, rotation: tilt, duration: .1, ease: 'steps(2)', immediateRender: true }, t);
    tl.fromTo(e, { scale: 1.1 }, { scale: 1, duration: .2, ease: 'back.out(3)', immediateRender: true, onComplete: off, onInterrupt: off }, t + .1);
    tl.call(() => {
      const s = e.closest('.slide');
      if (!s || still()) return;
      const b = boxIn(e, s);
      spark(fxLayer(s), b.r + 8, b.t + 16, [-60, -25, 10], { r0: 12, r1: 36, w: 4 });
    }, null, t + .1);
    return .3;
  }

  /* 大光标（.bz-cursor）：等按钮落地，从右下飞过来 → 按一下（光标缩一下）→ 同一页的 .bz-btn 被按进阴影再弹回，光标尖上甩出冲击线 */
  function clickIn(tl, e, t, vis) {
    const slide = e.closest('.slide'), btn = slide && slide.querySelector('.bz-btn');
    const w = .3, c = t + w + .32;
    const off = () => clean(e);
    appear(tl, e, t + w, vis);
    tl.fromTo(e, { x: 260, y: 200, rotation: 14 }, { x: 0, y: 0, rotation: 0, duration: .3, ease: 'power3.out', immediateRender: true }, t + w);
    tl.to(e, { scale: .84, duration: .05, ease: 'power1.out' }, c);
    tl.to(e, { scale: 1, duration: .16, ease: 'back.out(3)', onComplete: off, onInterrupt: off }, c + .05);
    if (btn) {
      const P = Math.max(3, (parseFloat(getComputedStyle(btn).getPropertyValue('--bz-s')) || 16) - 2);
      const offB = () => btn.style.removeProperty('--bz-k');
      tl.fromTo(btn, { '--bz-k': '0px' }, { '--bz-k': P + 'px', duration: .05, ease: 'power1.out', immediateRender: false }, c);
      tl.to(btn, { '--bz-k': '0px', duration: .3, ease: 'back.out(2.6)', onComplete: offB, onInterrupt: offB }, c + .12);
      tl.call(() => {
        if (!slide || still()) return;
        const b = boxIn(e, slide);
        spark(fxLayer(slide), b.l + 10, b.t + 8, [160, 200, 240, 280], { r0: 12, r1: 36, w: 4 });
      }, null, c);
    }
    return w + .53;
  }

  const FX = {
    // 弹起：默认出场（文字）；有硬阴影的组件转去砸下来
    snap(tl, e, t, ctx) { return snapIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : 0); },
    // 砸下来：卡片、小格、步骤、终端、截图位、命令和一排卡片的容器
    slam,
    // 逐字砸下：大标题、金句
    smash,
    // 啪地拍上：标签
    slap,
    // 新粗野主义自己的版式组件（页面里不用写，按类名自动选；见「新粗野主义自己的版式组件」一节）
    bzblock(tl, e, t, ctx) { return e instanceof SVGElement ? fadeIn(tl, e, t) : blockIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e)); },
    bztag(tl, e, t, ctx) { return e instanceof SVGElement ? fadeIn(tl, e, t) : tagIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e)); },
    bzbang(tl, e, t, ctx) { return e instanceof SVGElement ? fadeIn(tl, e, t) : bangIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e)); },
    bzcut(tl, e, t) { return e instanceof SVGElement ? fadeIn(tl, e, t) : cutIn(tl, e, t, true); },
    bzprint(tl, e, t, ctx) { return e instanceof SVGElement ? fadeIn(tl, e, t) : printIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e)); },
    bzclick(tl, e, t) { return e instanceof SVGElement ? fadeIn(tl, e, t) : clickIn(tl, e, t, true); },
  };
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 是这里的出场名就用它，再按类名，最后是 snap） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const cls = Object.keys(BY).find(c => e.classList.contains(c));
    const f = (name && FX[name]) || FX[cls ? BY[cls] : 'snap'];
    return f(tl, e, t, { tilt: () => tiltOf(e) });
  }

  /* =================================================================
     悬停：卡片、步骤、小格、截图位朝鼠标那侧轻轻一歪（离阴影远一点在 CSS 的 :hover 里）
     ================================================================= */
  let hovered = null;
  function release() { if (hovered) { hovered.style.removeProperty('--bz-rz'); hovered = null; } }
  function onMove(e) {
    if ((e.pointerType && e.pointerType !== 'mouse') || still()) return;
    const t = e.target && e.target.closest ? e.target.closest(TILT) : null;
    if (!t || !t.closest('.slide.active[data-scene="brutal"]')) { release(); return; }
    if (t !== hovered) { release(); hovered = t; }
    const r = t.getBoundingClientRect(), k = clamp(((e.clientX - r.left) / (r.width || 1) - .5) * 2, -1, 1);
    t.style.setProperty('--bz-rz', (k * 1.2).toFixed(2) + 'deg');
  }

  Deck.scene('brutal', {
    label: '新粗野主义',
    family: 'modern',
    dark: false,
    mascot: 'pengpeng',
    enter: 'snap',
    enterBy: BY,
    titleIn: 'smash',
    recede: .8,
    // 线稿是几乎笔直的粗墨线；带填充色的图元，填充线加粗、间距小于线宽，叠成一整块色；圈注是粗粉线（CSS 再给它加一道硬投影）
    rough: { strokeWidth: 4.5, roughness: .3, bowing: .25, hachureGap: 5, hachureAngle: -41, fillWeight: 6, markWidth: 5, markRoughness: .55, markBowing: .5 },
    fx: FX,

    // 建页：版式组件的插画、大光标填进去（只看这一页里的）
    decorate(s) {
      s.querySelectorAll('.bz-art[data-bz-art]').forEach(fillArt);
      s.querySelectorAll('.bz-cursor').forEach(el => { el.setAttribute('aria-hidden', 'true'); if (!el.querySelector('svg')) el.innerHTML = CURSOR; });
    },

    // 变成当前风格时挂上悬停的监听，离开（或进阅读模式）时摘掉
    mount(stage) { stage.addEventListener('pointermove', onMove, { passive: true }); stage.addEventListener('pointerleave', release); },
    unmount(stage) { stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerleave', release); release(); },

    // 退一拍：卡片被捏起来（阴影拉远、歪一下），再整张往上抛走（往上抛由引擎按返回的 y 做，同时淡出）
    onBack({ tl, units }) {
      const air = [];
      units.forEach((u, i) => {
        const e = u.el;
        if (e instanceof SVGElement || e.matches(SKIP)) return;
        const dir = i % 2 ? -1 : 1, tilt = tiltOf(e);
        tl.to(e, { y: -26, rotation: tilt + 4 * dir, duration: .12, ease: 'power2.out' }, 0);
        tl.to(e, { rotation: tilt + 9 * dir, duration: .24, ease: 'power2.in' }, .14);
        if (isRing(e)) { tl.fromTo(e, { '--bz-a': '0px' }, { '--bz-a': '16px', duration: .12, ease: 'power2.out', immediateRender: false }, 0); air.push(e); }
      });
      if (air.length) tl.call(() => air.forEach(e => e.style.removeProperty('--bz-a')), null, .42);
      return { at: .14, gap: .03, y: -220, dur: .24, childAt: .4 };
    },

    // 翻页：旧页被一把推开，新页从另一边冲进来、到位时顿一下（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      tl.to(from.el, { x: -160 * dir, autoAlpha: 0, duration: .22, ease: 'power3.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .06, ease: 'none', immediateRender: true }, .12);
      tl.fromTo(to.el, { x: 200 * dir }, { x: 0, duration: .32, ease: 'back.out(1.7)', immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .12);
      return .24;
    },

    // 「已复制」：命令按钮被按到底（压进阴影、闪成黄色）→ 黄贴纸啪地拍上 → 贴纸角上甩出冲击线 → 按钮弹回
    copied({ tl, tip, node, ok }) {
      if (node && node.matches && node.matches('.copy')) {
        node.classList.add('bz-hit');
        const off = () => node.style.removeProperty('--bz-k');
        tl.fromTo(node, { '--bz-k': '0px' }, { '--bz-k': '6px', duration: .06, ease: 'power1.out', immediateRender: true }, 0);
        tl.call(() => node.classList.remove('bz-hit'), null, .26);
        tl.to(node, { '--bz-k': '0px', duration: .34, ease: 'back.out(2.6)', onComplete: off, onInterrupt: off }, .26);
      }
      tl.fromTo(tip, { autoAlpha: 0, scale: 2.1, rotation: -26 }, { autoAlpha: 1, scale: 1, rotation: -5, duration: .2, ease: 'power3.in', immediateRender: true }, .06);
      tl.to(tip, { scale: .92, duration: .05, ease: 'power1.out' }, .26);
      tl.to(tip, { scale: 1, duration: .2, ease: 'back.out(3)' }, .31);
      if (ok) tl.call(() => {
        const slide = tip.closest('.slide');
        if (!slide) return;
        const b = boxIn(tip, slide);
        spark(fxLayer(slide), b.r + 2, b.t - 2, [-80, -45, -10], { r0: 10, r1: 32, w: 4 });
      }, null, .26);
    },

    // 开场（约 1.1 秒）：主题行的章节块砸下、主题滑入 → 标题逐字砸下、整行一震 → 第 0 拍跟上 → 节拍指示盖下、按进阴影 → 重点词拍上
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const topic = root.querySelector(':scope > .s-topic');
      if (topic) {
        const tc = topic.querySelector('.tc'), rest = [...topic.querySelectorAll('.ts, .tt')];
        if (tc) tl.fromTo(tc, { autoAlpha: 0, y: -30, rotation: -8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .2, ease: 'power3.in', immediateRender: true, onComplete: () => clean(tc) }, 0);
        if (rest.length) tl.fromTo(rest, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: .24, stagger: .05, ease: 'power2.out', immediateRender: true, onComplete: () => rest.forEach(clean) }, .14);
      }
      let end = .3;
      const title = root.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .08 + smash(tl, title, .08, null));
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      zero.forEach((e, i) => { const s = (title ? .46 : .14) + i * .1; end = Math.max(end, s + runFx(tl, e, s)); });
      // 节拍指示：从上面盖下来，再按进阴影弹回
      const stage = root.closest('#stage'), meter = stage && stage.querySelector(':scope > .chrome .meter');
      if (meter) {
        const off = () => clean(meter);
        tl.fromTo(meter, { autoAlpha: 0, y: -40, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .22, ease: 'power3.in', immediateRender: true }, .5)
          .fromTo(meter, { x: 0, y: 0, '--bz-k': '0px' }, { x: 4, y: 4, '--bz-k': '4px', duration: .05, ease: 'power1.out', immediateRender: false }, .72)
          .to(meter, { x: 0, y: 0, '--bz-k': '0px', duration: .28, ease: 'back.out(3)', onComplete: off, onInterrupt: off }, .77);
      }
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .3, ease: 'power2.out', stagger: .06, immediateRender: true }, Math.min(Math.max(end - .1, .7), 1));
      return Math.max(end, 1.05);
    },

    // 点击处甩出一圈很淡的冲击线（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      if (still() || !layer) return;
      spark(layer, x, y, [0, 45, 90, 135, 180, 225, 270, 315], { r0: 9, r1: 24, w: 3, alpha: .3, dur: .4 });
    },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1320, y: 12, w: 550, h: 78, name: '页码和节拍按钮' },
    ],
  });
})();
