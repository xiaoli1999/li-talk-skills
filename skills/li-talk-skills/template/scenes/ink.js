/* =====================================================================
   风格 · 水墨国风 ink（手绘家）
   - 样子：宣纸底，左下两层淡墨远山；全页只有墨色浓淡（浓、中、淡三层）加一点朱砂，朱砂只给重点词、印章和形象；
     带序号的步骤是一个个墨点，竖排时一笔有飞白的竖画把墨点串起来；可复制的命令是线装书封面上的题签，复制后盖一枚朱印
   - 适合讲：人文、方法论、流程，开场收尾的仪式感。不适合：信息很密的页、要科技感或热闹的场合
   - 默认形象：墨丸 mowan（一滴落在宣纸上的墨，眉心一粒朱砂）
   - 投影上的注意：淡墨小字在暗的幕布上会偏淡，所以正文墨色比样页略深（中墨 #423D37、淡墨 #6F685D），
     页面里正文不要用比 --ink-2 更淡的颜色
   - 来源：定稿样页 09-水墨国风.html。从样页搬过来的效果，以及改成对任意页面都成立的写法：
     1. 背景：宣纸纹（细纸毛 + 帘纹）和四周一圈极淡的旧纸色写进 --scene-bg；远山两层放进背景层（backdrop）。
        样页的远山向左伸出舞台 600px；这里两层山都按舞台坐标放、再往左接一段到 -2400px，超宽屏也不在舞台外断开。
        宣纸、远山、墨点这些图都是写在 ink.css 里的 data URI（只栅格化一次，翻拍时不重算滤镜）
     2. 墨晕洇出 yun（默认出场，也是大标题的出场；data-in="yun" 可用）：一圈软边遮罩从元素左边洇开（样页 .rv 的做法），
        样页只给固定的几行字用；这里半径按元素的宽高算，任意元素都能盖满；动画时元素上写 --ir，ink.css 只在写着它时加遮罩
     3. 卷轴展开 zhan（data-in="zhan" 可用）：样页的题签像卷轴一样向右展开（clip-path）。这里卡片、小格、命令、终端、截图、
        标签和一排小格默认用它（enterBy）；卡片、终端展开后，里面的字再一行行墨晕洇出
     4. 竖笔墨点串起步骤：样页三步是写死的三个 SVG。这里 .steps 的序号画成墨点（::before，浓墨芯 + 一圈中墨 + 一圈淡墨晕，
        序号是留白的纸色），竖排时上一步的 ::after 是一笔飞白竖画，接到下一步的墨点（CSS 用 :has 判断下一步出来没有）。
        一步出场时：上一步的竖画往下写（--ink-seg）→ 落笔一顿，墨点洇开（--ink-dp）、溅出几粒细墨 → 步骤名、说明依次墨晕洇出。
        横排 .steps.h 不画竖画（页面一般自己画了手绘箭头），只有墨点。
        讲过的步骤不整项变淡，只让字和墨点变淡：通到当前这一步的那笔竖画保持浓墨，两头都讲过了才淡（ink.css）
     5. 朱砂点重点词：样页的重点词到拍时转朱砂，每个字下面朱笔圈一个小圈。这里 decorate 把重点词直接写着的字拆成单字
        （连在一起的字母数字算一个），每个字一个 .ink-kc；颜色和小圈都跟着引擎本来就会推的 --k 走（ink.css），
        小圈按字的先后一个个画出来
     6. 墨晕悬停：卡片、小格、步骤、命令移上去时，一团淡墨从鼠标处洇开（墨点图按 --ink-h 由小变大），卡片、命令抬起一点，
        步骤的墨点吸饱了墨微微一胀、说明转浓墨。mount 时在舞台上挂一个 pointermove，写悬停组件的 --ink-mx --ink-my
     7. 点击处洇开一点淡墨（ripple，样页的 inkDrop）
     8. 复制时盖朱印「已复制」（copied）：引擎的提示框在 ink.css 里画成一枚竖长的白文朱印；盖下时先提起再压下、
        印泥往外洇一下、溅出几粒朱砂，题签被压得一沉；复制图标换成朱笔对勾
     9. 节拍指示：一排墨点，讲过的中墨、当前拍浓墨放大；换拍时当前那粒荡开一圈，拍号从上面落下（ink.css）
     10. 开场 intro：远山浮出 → 主题行、外框淡入 → 大标题墨晕洇出 → 第 0 拍依次洇出 → 重点词转朱砂；
         引擎随后让形象从上面落下，落地时脚下洇开一圈淡墨（样页墨丸「一滴墨落下」的那一圈）
     11. 退一拍 onBack：墨晕往左收回；步骤的墨点缩回、上一步的竖画往回收
     12. 同风格翻页 pageTurn：新页像墨一样从一边洇开（前进从左、后退从右），旧页淡去
   - 没搬的：远山随鼠标视差（这一版不做）；墨丸的走位、反应、空闲动作归形象和引擎；
     样页点到步骤上时墨点按一下（ripple 只拿到坐标，这一版不做）
   - 自己加的出场名：yun、zhan，只在这个风格里认（别的风格会提醒并换成它的默认出场）；
     下面的自有组件另有 shu、juan、kai、yin、ran，都由组件类名自动选上（enterBy），页面不用写 data-in
   - 自有版式组件（水墨国风专用，类名都带 ink- 前缀；样子在 ink.css，样板页见 samples/ink.js）：
     「每一拍发生了什么」按水墨的习惯来——一列字从上往下写出来、一笔墨洇开、一枚印盖下，而不是卡片弹出来
     · .ink-v 竖排（writing-mode: vertical-rl）：多行时一列列从右往左排；带拍出现时一个字一个字写出来（出场 shu：
       按文档顺序，也就是从上到下、从右往左，每个字由淡转浓、从上往下洇出，大字写得慢、小字写得快）；
       竖排里重点词的朱砂圈点画在字的右边（古书竖排的圈点位置）。竖排里别用逗号句号，用空格（　）或分列
     · .ink-note 双行小注（和 .ink-v 一起用）：古书的夹注，小一号的中墨字，用 <br> 分成两行并排在一列里
     · .ink-box 框字：一个字套在细墨方框里，放在列首当小标记（「器」「茶」「水」）
     · .ink-seal 朱印：默认白文（朱底、字留出纸色），.zhu 朱文（朱字朱框），.round 椭圆印；.sm 小印（34px）、.lg 大印（64px）。
       字竖排，多列用 <br>；倾斜写 --r。带拍出现时盖下来（出场 yin：提起、压下、印泥往外洇一圈、溅出几粒朱砂）；
       放在别的带拍块里面（比如落款末尾）时，等那一块的字写完再盖
     · .ink-tiqian 题签：线装书封面上那条竖长的签条（浅纸、外粗内细的双线框），里面的字竖排。
       出场 juan：签条从上往下展开，里面的字再一个个写出来、里面的印再盖下
     · .ink-scroll 手卷 + .ink-col 一列：手卷是上下两道（外粗内细）边线框起来的一段纸，里面的 .ink-col 从右往左排，
       每列左边一道乌丝栏（细墨竖线）；.ink-col.ink-head 是引首（放标题，几行竖排并排，和正文之间是双线）。
       手卷第 0 拍出现时从右往左展开（出场 kai），引首的字跟着写出来；之后每拍一列：乌丝栏从上往下画、这一列的字写出来（出场 shu）。
       列宽、字号在页面 CSS 里定；手卷写死 width，列靠右排，左边空着的一截是拖尾，可以放闲章
     · .ink-frame 版框：外粗内细的双线框（印谱的格子、册页的框），不带底色
     · .ink-wash 一幅墨染的画（.ink-peaks 是一座带雾的主峰，图在 ink.css 的 --ink-peaks）：
       出场 ran，墨从画的底边往上洇开。只是画，不放字；写死宽高，四周都淡出，放到舞台边上也不会齐刷刷断开
     · .steps.ink-cn 序号换成汉字（一、二、三）；.steps.ink-needle 竖排步骤的最后一步，墨点下面接一笔收尖的悬针，
       最后一步出来时往下写
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和墨点节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
     · 左下的远山不算禁区：墨色很淡，字压在上面也看得清
   - 样子在 ink.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => Math.round(n * 10) / 10;
  const clear = (e, keys) => keys.forEach(k => e.style.removeProperty(k));
  // 记下元素原来的行内样式，动画播完原样还原（子元素不归引擎管，不能用引擎的清理）
  const keep = e => { const s = e.getAttribute('style'); return () => { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  /* 出场时不跟着动的子元素：自己另有 data-beat 的（等它自己那一拍），以及形象、圈注层、提示框这些 */
  const SKIP = '.mascot, .kid, svg.marks, .copied-tip, .ripple-layer, script, style';
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  /* 墨晕要推到的半径：从左边中间（0, 55%）到最远的角，再加上软边 */
  const reach = e => Math.ceil(Math.hypot(e.offsetWidth || 0, (e.offsetHeight || 0) * .55)) + 70;
  const shown = e => !e.hasAttribute('data-beat') || e.classList.contains('on');
  const isStep = e => !!(e.matches && e.matches('.steps > li'));
  const vertical = li => !!(li.parentElement && !li.parentElement.classList.contains('h'));
  /* 舞台坐标：元素相对页面左上角的位置（页面可能被缩放） */
  function stageXY(slide, r) {
    const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1;
    return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
  }
  const layerOf = el => { const s = el && el.closest('.slide'); return s ? s.querySelector(':scope > .ripple-layer') : null; };

  /* =================================================================
     出场
     ================================================================= */
  function fade(tl, e, t, ctx) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: ctx.done }, t);
    return .4;
  }
  /* 一个子元素墨晕洇出（只动 opacity 和 --ir，播完还原它原来的行内样式） */
  function yunKid(tl, c, t, dur) {
    const back = keep(c);
    tl.fromTo(c, { opacity: 0, '--ir': '0px' }, { opacity: 1, '--ir': reach(c) + 'px', duration: dur, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back }, t);
  }

  /* 墨晕洇出（默认出场、大标题）：软边遮罩从左边洇开，同时由淡转浓 */
  function yun(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    if (isStep(e)) return step(tl, e, t, ctx);
    const R = reach(e), dur = clamp(.38 + R / 4000, .45, .75), tilt = ctx.tilt();
    const off = () => clear(e, ['--ir']);
    const from = { autoAlpha: 0, '--ir': '0px' };
    const to = { autoAlpha: 1, '--ir': R + 'px', duration: dur, ease: 'power2.out', immediateRender: true, onComplete: () => { ctx.done(); off(); }, onInterrupt: off };
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    return dur;
  }

  /* 卷轴展开：clip-path 从左往右打开（上下、左边多留出一截，压在上沿的小标签、胶带和投影不被裁掉）；
     卡片、终端展开后，里面的字一行行墨晕洇出 */
  function zhan(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    if (isStep(e)) return step(tl, e, t, ctx);
    const w = e.offsetWidth || 400, dur = clamp(.36 + w / 4000, .42, .62), tilt = ctx.tilt();
    const from = { autoAlpha: 0, clipPath: 'inset(-40% 100% -60% -10%)' };
    const to = { autoAlpha: 1, clipPath: 'inset(-40% -10% -60% -10%)', duration: dur, ease: 'power3.inOut', immediateRender: true, onComplete: ctx.done };
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    let end = dur;
    if (e.matches('.card, .term')) {
      const kids = kidsOf(e), gap = kids.length ? Math.min(.08, .36 / kids.length) : 0;
      kids.forEach((c, i) => { const s = .16 + i * gap; yunKid(tl, c, t + s, .42); end = Math.max(end, s + .42); });
    }
    return end;
  }

  /* 步骤的一项：上一步的墨点往下写一笔竖画 → 落笔一顿，墨点洇开、溅出几粒细墨 → 步骤名、说明依次洇出；
     .steps.ink-needle 的最后一步，墨点洇开后再往下写一笔悬针 */
  function step(tl, e, t, ctx) {
    let at = t;
    const prev = e.previousElementSibling;
    if (vertical(e) && prev && prev.tagName === 'LI' && shown(prev)) {
      const off = () => clear(prev, ['--ink-seg']);
      tl.fromTo(prev, { '--ink-seg': 0 }, { '--ink-seg': 1, duration: .3, ease: 'power1.in', immediateRender: true, onComplete: off, onInterrupt: off }, t);
      at = t + .22;
    }
    const offDot = () => clear(e, ['--ink-dp']);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .1, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { '--ink-dp': 0 }, { '--ink-dp': 1, duration: .32, ease: 'power3.out', immediateRender: true, onInterrupt: offDot }, at);
    tl.call(() => spray(e), null, at + .03);
    let end = at + .32;
    kidsOf(e).forEach((c, i) => { const s = at + .08 + i * .14; yunKid(tl, c, s, .42); end = Math.max(end, s + .42); });
    if (needle(e)) {
      const offN = () => clear(e, ['--ink-ndl']);
      tl.fromTo(e, { '--ink-ndl': 0 }, { '--ink-ndl': 1, duration: .5, ease: 'power2.in', immediateRender: true, onComplete: offN, onInterrupt: offN }, at + .2);
      end = Math.max(end, at + .7);
    }
    tl.call(() => { offDot(); ctx.done(); }, null, end);
    return end - t;
  }
  /* 这一项是不是带悬针的最后一步（.steps.ink-needle 竖排时） */
  const needle = li => vertical(li) && li.parentElement.classList.contains('ink-needle') && !li.nextElementSibling;

  /* =================================================================
     自有版式组件的出场：一列字写出来（shu）、题签展开（juan）、手卷展开（kai）、盖印（yin）、墨染的画洇开（ran）
     ================================================================= */
  /* 归 e 管的子元素：不在 e 里面另一个带拍块里的（那些等自己那一拍）；e 自己不带拍（逐个出场的子元素）时外层的拍也算 */
  function mine(e, sel) {
    return [...e.querySelectorAll(sel)].filter(c => { const b = c.closest('[data-beat]'); return !b || b === e || !e.contains(b); });
  }
  /* 一个个字写出来：按文档顺序（竖排就是从上到下、从右往左）。每个字由淡转浓、从上往下洇出（--ink-xie 推遮罩，ink.css），
     起笔时略虚；大字写得慢、小字写得快，一列字总共不超过约 .65 秒。印里的字不在这里写（跟着印一起盖下）。返回用时 */
  function write(tl, e, t) {
    const cs = mine(e, '.ink-ch, .ink-kc').filter(c => !c.closest('.ink-seal'));
    if (!cs.length) return 0;
    const w = cs.map(c => clamp((parseFloat(getComputedStyle(c).fontSize) || 40) / 72, .45, 1.4));
    const sum = w.reduce((a, b) => a + b, 0) - w[w.length - 1];
    const base = sum > 0 ? Math.min(.085, .62 / sum) : 0;
    let at = t, end = 0;
    cs.forEach((c, i) => {
      const back = keep(c), dur = .24 + .1 * w[i];
      tl.fromTo(c, { opacity: 0, '--ink-xie': 0, filter: 'blur(2.5px)' },
        { opacity: 1, '--ink-xie': 1, filter: 'blur(0px)', duration: dur, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back }, at);
      end = Math.max(end, at - t + dur);
      at += w[i] * base;
    });
    return end;
  }
  /* 盖印：提起（放大、歪一点、看不见）→ 压下（略小一点）→ 回弹；印泥往外洇一圈（--ink-glow），溅出几粒朱砂 */
  function stamp(tl, e, t, tilt, done) {
    tl.fromTo(e, { autoAlpha: 0, scale: 1.65, rotation: tilt - 11 }, { autoAlpha: 1, scale: .93, rotation: tilt, duration: .22, ease: 'power3.in', immediateRender: true }, t)
      .to(e, { scale: 1, duration: .24, ease: 'back.out(2.5)' }, t + .22)
      .fromTo(e, { '--ink-glow': 1 }, { '--ink-glow': 0, duration: .56, ease: 'power2.out', immediateRender: false }, t + .2)
      .call(() => sealSparks(e), null, t + .22)
      .call(() => { done(); clear(e, ['--ink-glow']); }, null, t + .78);
    return .78;
  }
  const ownDone = e => () => clear(e, ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale']);
  /* e 里面不另外带拍的印：等字写完依次盖下 */
  function stampAll(tl, e, t) {
    let end = 0;
    mine(e, '.ink-seal').forEach((s, i) => { if (s === e) return; const at = i * .14; end = Math.max(end, at + stamp(tl, s, t + at, tiltOf(s), ownDone(s))); });
    return end;
  }
  const tiltOf = e => { const v = getComputedStyle(e).rotate; return v && v !== 'none' ? parseFloat(v) || 0 : 0; };
  /* 写完的收尾：清掉块自己的行内样式（ctx.done 会掐掉这个块上的补间，所以放在最后） */
  function finish(tl, e, t, end, ctx, vars) {
    tl.call(() => { ctx.done(); if (vars) clear(e, vars); }, null, t + end);
    return end;
  }

  /* 竖排的一列（.ink-v）、手卷的一列（.ink-col）：手卷的一列先从上往下画出左边的乌丝栏；再一个字一个字写出来；里面的印最后盖下 */
  function shu(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    if (isStep(e)) return step(tl, e, t, ctx);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .08, ease: 'none', immediateRender: true }, t);
    let at = 0;
    if (e.classList.contains('ink-col')) {
      tl.fromTo(e, { '--ink-rule': 0 }, { '--ink-rule': 1, duration: .34, ease: 'power1.inOut', immediateRender: true }, t);
      at = .16;
    }
    let end = Math.max(at + .2, at + write(tl, e, t + at));
    end += stampAll(tl, e, t + end);
    return finish(tl, e, t, end, ctx, ['--ink-rule']);
  }
  /* 题签：签条从上往下展开（clip-path，四周多留一截，投影不被裁掉），展开一半时里面的字开始写 */
  function juan(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    const dur = clamp(.34 + (e.offsetHeight || 600) / 3200, .42, .62), tilt = ctx.tilt();
    const from = { autoAlpha: 0, clipPath: 'inset(-12% -20% 100% -20%)' };
    const to = { autoAlpha: 1, clipPath: 'inset(-12% -20% -12% -20%)', duration: dur, ease: 'power3.inOut', immediateRender: true };
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    let end = Math.max(dur, dur * .45 + write(tl, e, t + dur * .45));
    end += stampAll(tl, e, t + end);
    return finish(tl, e, t, end, ctx);
  }
  /* 手卷：从右往左展开（引首在右边，先露出来），引首的字跟着写出来 */
  function kai(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    const dur = clamp(.4 + (e.offsetWidth || 1200) / 4000, .5, .8);
    tl.fromTo(e, { autoAlpha: 0, clipPath: 'inset(-8% -1% -8% 100%)' }, { autoAlpha: 1, clipPath: 'inset(-8% -1% -8% -1%)', duration: dur, ease: 'power2.inOut', immediateRender: true }, t);
    let end = Math.max(dur, .18 + write(tl, e, t + .18));
    end += stampAll(tl, e, t + end);
    return finish(tl, e, t, end, ctx);
  }
  /* 印：自己带拍时整枚盖下 */
  function yin(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    return stamp(tl, e, t, ctx.tilt(), ctx.done);
  }
  /* 墨染的画：墨从底边中间往上、往两边洇开（--ink-ran 推遮罩，ink.css），同时由淡转浓 */
  function ran(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fade(tl, e, t, ctx);
    const off = () => clear(e, ['--ink-ran']);
    tl.fromTo(e, { autoAlpha: 0, '--ink-ran': 0 }, { autoAlpha: 1, '--ink-ran': 1, duration: .95, ease: 'power2.out', immediateRender: true, onComplete: () => { ctx.done(); off(); }, onInterrupt: off }, t);
    return .95;
  }
  /* 竖排、题签、手卷：退一拍时字从下往上收回去（--ink-shou） */
  const VERT = '.ink-v, .ink-col, .ink-tiqian, .ink-scroll';

  /* 溅出的细墨：从墨点飞出去，转眼被纸吸干（都往左、上、下，不往右边的字上溅；单双步上下翻一下，溅得不一样） */
  const SPLASH = [[-64, -26, 8.4], [-44, 38, 6], [-18, -60, 7.2], [-74, 10, 4.8], [8, 58, 6.4]];
  function spray(li) {
    const layer = layerOf(li), slide = li.closest('.slide');
    if (still() || !layer || !slide.classList.contains('active')) return;
    const p = stageXY(slide, li.getBoundingClientRect()), x = p.x + 31, y = p.y + 31;
    const k = [...li.parentElement.children].indexOf(li) % 2 ? -1 : 1;
    SPLASH.forEach(([ox, oy, s]) => {
      const d = document.createElement('i');
      d.className = 'ink-spl';
      d.style.cssText = `left:${f1(x - s / 2)}px;top:${f1(y - s / 2)}px;width:${s}px;height:${s}px`;
      layer.appendChild(d);
      G.timeline({ onComplete: () => d.remove() })
        .fromTo(d, { x: 0, y: 0, scale: .5 }, { x: ox, y: oy * k, scale: 1, duration: .42, ease: 'power3.out' }, 0)
        .fromTo(d, { opacity: 0 }, { opacity: .85, duration: .05, ease: 'none' }, 0)
        .to(d, { opacity: 0, duration: .38, ease: 'power1.in' }, .13);
    });
  }

  /* 一团淡墨：从小洇开、慢慢被纸吸干（点击处、形象落地处） */
  function drop(layer, x, y, size, alpha) {
    if (still() || !layer) return;
    [...layer.querySelectorAll(':scope > .ink-drop')].slice(0, -5).forEach(n => n.remove());
    const d = document.createElement('i');
    d.className = 'ink-drop';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = `left:${f1(x - size / 2)}px;top:${f1(y - size / 2)}px;width:${size}px;height:${size}px`;
    layer.appendChild(d);
    G.fromTo(d, { scale: .22, opacity: alpha, rotation: Math.random() * 360 }, { scale: 1, opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => d.remove() });
  }

  /* 盖印时溅出的几粒朱砂（从印下面往四周飞） */
  function sparks(tip) { sparksAt(layerOf(tip), tip.offsetLeft + tip.offsetWidth / 2, tip.offsetTop + tip.offsetHeight / 2); }
  /* 页面里的印（.ink-seal）盖下时：按它在舞台上的位置溅（它可能在别的定位容器里） */
  function sealSparks(e) {
    const slide = e.closest('.slide');
    if (!slide || !slide.classList.contains('active')) return;
    const p = stageXY(slide, e.getBoundingClientRect());
    sparksAt(layerOf(e), p.x + p.w / 2, p.y + p.h / 2);
  }
  function sparksAt(layer, x, y) {
    if (still() || !layer) return;
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('i');
      d.className = 'ink-spk';
      d.style.cssText = `left:${f1(x - 4)}px;top:${f1(y - 4)}px`;
      layer.appendChild(d);
      const a = (i / 6) * Math.PI * 2 + Math.random() * .6, r = 64 + Math.random() * 40;
      G.fromTo(d, { x: 0, y: 0, scale: .9, opacity: .9 }, { x: Math.cos(a) * r * .8, y: Math.sin(a) * r * 1.2, scale: .35, opacity: 0, duration: .55, ease: 'power3.out', onComplete: () => d.remove() });
    }
  }

  /* 开场时第 0 拍的块用哪种出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 yun） */
  const FX = { yun, zhan, shu, juan, kai, yin, ran };
  /* 自有组件排在前面（引擎按这里的顺序取第一个对上的类名） */
  const BY = {
    'ink-scroll': 'kai', 'ink-tiqian': 'juan', 'ink-seal': 'yin', 'ink-wash': 'ran', 'ink-col': 'shu', 'ink-v': 'shu',
    card: 'zhan', cell: 'zhan', cells: 'zhan', copy: 'zhan', term: 'zhan', shot: 'zhan', tag: 'zhan',
  };
  function pick(e) {
    const n = e.dataset && e.dataset.in;
    if (n === 'none') return null;
    if (n && FX[n]) return FX[n];
    const c = Object.keys(BY).find(k => e.classList && e.classList.contains(k));
    return c ? FX[BY[c]] : yun;
  }
  // 自己调出场函数时（开场）给的 ctx，和引擎给的一样用
  function own(e, name) {
    return {
      name, scene: 'ink', dur: .5, ease: 'power2.out',
      tilt: () => { if (e instanceof SVGElement) return 0; const v = getComputedStyle(e).rotate; return v && v !== 'none' ? parseFloat(v) || 0 : 0; },
      done: () => clear(e, ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path']),
    };
  }

  /* =================================================================
     重点词拆成单字（decorate）：每个字一个 .ink-kc，记下它是第几个（--i）、一共几个（--n），
     朱笔小圈按 --k 一个个画出来（ink.css）；连在一起的字母数字算一个字，免得英文单词底下一串小圈
     ================================================================= */
  function splitKey(k) {
    if (k.dataset.inkSplit) return;
    k.dataset.inkSplit = '1';
    let n = 0;
    [...k.childNodes].forEach(node => {
      if (node.nodeType !== 3 || !node.nodeValue) return;
      const frag = document.createDocumentFragment();
      (node.nodeValue.match(/[A-Za-z0-9_.'’-]+|\s+|[\s\S]/gu) || []).forEach(s => {
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        const sp = document.createElement('span');
        sp.className = 'ink-kc';
        sp.style.setProperty('--i', n++);
        sp.textContent = s;
        frag.appendChild(sp);
      });
      node.replaceWith(frag);
    });
    k.style.setProperty('--n', Math.max(n, 1));
  }

  /* 竖排的块（和印、题签、手卷）里的字也拆成单字（.ink-ch，连在一起的字母数字算一个），好一个个写出来；
     重点词已经拆成 .ink-kc 的不再拆。顺带让自检能逐字量到竖排的字（它按行量，竖排时只量得到一列中间的一截） */
  const CHARS = '.ink-v, .ink-tiqian, .ink-col, .ink-scroll, .ink-seal';
  function splitChars(root) {
    if (root.dataset.inkChars) return;
    root.dataset.inkChars = '1';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    nodes.forEach(node => {
      const pe = node.parentElement;
      if (!node.nodeValue.trim() || !pe || pe.closest('.ink-ch, .ink-kc, .mascot, script, style, svg')) return;
      const frag = document.createDocumentFragment();
      (node.nodeValue.match(/[A-Za-z0-9_.'’-]+|\s+|[\s\S]/gu) || []).forEach(s => {
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        const sp = document.createElement('span');
        sp.className = 'ink-ch';
        sp.textContent = s;
        frag.appendChild(sp);
      });
      node.replaceWith(frag);
    });
  }

  /* =================================================================
     悬停：一团淡墨从鼠标处洇开（大小、浓淡在 ink.css 的 :hover 里），这里只写鼠标在组件里的位置，每帧最多写一次
     ================================================================= */
  const HOVER = '.card, .cell, .steps > li, .copy';
  let onMove = null, raf = 0, last = null;
  function track() {
    raf = 0;
    const ev = last; last = null;
    if (!ev || !ev.target || !ev.target.closest) return;
    // 鼠标下面的组件和它外面的组件（比如步骤里的命令和那一步）都写上，各自的淡墨晕都从鼠标处洇开
    for (let t = ev.target.closest(HOVER); t; t = t.parentElement && t.parentElement.closest(HOVER)) {
      if (!t.closest('.slide.active[data-scene="ink"]')) return;
      const r = t.getBoundingClientRect(), k = (r.width / (t.offsetWidth || r.width)) || 1;
      t.style.setProperty('--ink-mx', Math.round((ev.clientX - r.left) / k) + 'px');
      t.style.setProperty('--ink-my', Math.round((ev.clientY - r.top) / k) + 'px');
    }
  }

  Deck.scene('ink', {
    label: '水墨国风',
    family: 'hand',
    dark: false,
    mascot: 'mowan',
    enter: 'yun',
    enterBy: BY,
    titleIn: 'yun',
    recede: .8,
    // 墨线：比铅笔粗一点、没那么潦草；圈注是朱笔（颜色在 ink.css 的 --mark）；
    // 填充线加粗（CSS 按线宽 4.5 认出填充线，改成淡墨）
    rough: { strokeWidth: 2.8, roughness: .9, bowing: .8, hachureGap: 7, hachureAngle: -60, fillWeight: 4.5, markWidth: 3.4, markRoughness: 1.2, markBowing: 1 },
    fx: FX,
    // ink-line 墨线落在宣纸上微微洇开（线稿、圈注用；按舞台坐标给滤镜范围，横平竖直的线也不会被裁掉）；
    // ink-seal 印泥：边缘微微不齐、印面有细小的斑驳（「已复制」的朱印、「需要人」小格角上的小印）
    defs: `<filter id="ink-line" filterUnits="userSpaceOnUse" x="-200" y="-200" width="2320" height="1480" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation=".45"/></filter>
      <filter id="ink-seal" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="1" seed="9" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -9 0 0 0 6.6" result="h"/>
        <feComposite in="d" in2="h" operator="in"/></filter>`,

    /* 背景层：两层远山（图在 ink.css 的 --ink-far / --ink-near），按舞台坐标放、向左延伸到舞台外很远 */
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<i class="ink-mtn ink-far" aria-hidden="true"></i><i class="ink-mtn ink-near" aria-hidden="true"></i>');
    },

    // 每页建好后：重点词拆成单字，好逐字圈点；竖排的块拆成单字，好一个个写出来
    decorate(slide) {
      slide.querySelectorAll('.key').forEach(splitKey);
      slide.querySelectorAll(CHARS).forEach(splitChars);
    },

    /* 退一拍：墨晕往左收回；步骤的墨点缩回、上一步的竖画往回收（引擎同时把这一拍的块淡出、下沉一点）。
       收回的动画比引擎的淡出晚一点结束再清掉行内变量，免得清早了整块闪一下 */
    onBack({ tl, units }) {
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        if (isStep(e)) {
          const prev = e.previousElementSibling;
          const seg = vertical(e) && prev && prev.tagName === 'LI';
          if (seg) tl.fromTo(prev, { '--ink-seg': 1 }, { '--ink-seg': 0, duration: .26, ease: 'power1.out', immediateRender: false }, .04);
          if (needle(e)) tl.fromTo(e, { '--ink-ndl': 1 }, { '--ink-ndl': 0, duration: .2, ease: 'power1.in', immediateRender: false }, 0);
          tl.fromTo(e, { '--ink-dp': 1 }, { '--ink-dp': 0, duration: .24, ease: 'power2.in', immediateRender: false }, 0);
          tl.call(() => { clear(e, ['--ink-dp', '--ink-ndl']); if (seg) clear(prev, ['--ink-seg']); }, null, .4);
          return;
        }
        // 印：从纸上提起来（放大一点再淡去）
        if (e.matches('.ink-seal')) { tl.fromTo(e, { scale: 1 }, { scale: 1.14, duration: .26, ease: 'power1.in', immediateRender: false }, 0); return; }
        // 墨染的画：墨往底边收回去
        if (e.matches('.ink-wash')) {
          const offW = () => clear(e, ['--ink-ran']);
          tl.fromTo(e, { '--ink-ran': 1 }, { '--ink-ran': 0, duration: .3, ease: 'power2.in', immediateRender: false, onInterrupt: offW }, 0);
          tl.call(offW, null, .42);
          return;
        }
        // 竖排的列、题签、手卷：字从下往上收回去（和写的方向相反）
        if (e.matches(VERT)) {
          const offV = () => clear(e, ['--ink-shou']);
          tl.fromTo(e, { '--ink-shou': 1 }, { '--ink-shou': 0, duration: .3, ease: 'power2.in', immediateRender: false, onInterrupt: offV }, 0);
          tl.call(offV, null, .42);
          return;
        }
        const off = () => clear(e, ['--ir']);
        tl.fromTo(e, { '--ir': reach(e) + 'px' }, { '--ir': '0px', duration: .3, ease: 'power2.in', immediateRender: false, onComplete: off, onInterrupt: off }, .04);
      });
      return { at: .06, gap: .03, y: 6, dur: .26 };
    },

    /* 同风格翻页：新页像墨一样从一边洇开（前进从左、后退从右），旧页淡去 */
    pageTurn({ tl, from, to, dir, retire, clear: clean }) {
      const o = from.el, n = to.el;
      n.classList.add('ink-turn-in');
      n.style.setProperty('--ink-ox', dir > 0 ? '0%' : '100%');
      const end = () => { n.classList.remove('ink-turn-in'); clear(n, ['--ink-tr', '--ink-ox']); };
      tl.to(o, { autoAlpha: 0, duration: .42, ease: 'power1.in', onComplete: retire }, 0);
      tl.fromTo(n, { '--ink-tr': '0px' }, { '--ink-tr': '2400px', duration: .8, ease: 'power2.out', immediateRender: true, onComplete: () => { end(); clean(n); }, onInterrupt: end }, 0);
      return .12;
    },

    /* 「已复制」：提示框在 ink.css 里画成一枚竖长的白文朱印。盖下：提起、压下（题签被压得一沉）、印泥往外洇一下、
       溅出几粒朱砂（样页的 stamp）。复制失败时是引擎的红条，只淡入 */
    copied({ tl, tip, node, ok }) {
      if (!ok) { tl.fromTo(tip, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, ease: 'power1.out' }, 0); return; }
      tl.fromTo(tip, { autoAlpha: 0, scale: 1.7, rotation: -15, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: .93, rotation: -4, duration: .22, ease: 'power3.in' }, 0)
        .to(tip, { scale: 1, duration: .24, ease: 'back.out(2.5)' }, .22)
        .fromTo(tip, { '--ink-glow': 1 }, { '--ink-glow': 0, duration: .6, ease: 'power2.out', immediateRender: false }, .2)
        .call(() => sparks(tip), null, .22);
      if (node && node.matches && node.matches('.copy')) {
        const off = () => clear(node, ['--ink-press']);
        tl.to(node, { keyframes: [{ '--ink-press': 1, duration: .05, ease: 'power2.out' }, { '--ink-press': 0, duration: .26, ease: 'back.out(3)' }], onComplete: off, onInterrupt: off }, .21);
      }
    },

    /* 开场（不带拍号打开时第一页用）：远山浮出 → 主题行、外框淡入 → 大标题墨晕洇出 → 第 0 拍依次洇出 → 重点词转朱砂。
       负责整个第一页的出场，返回总时长（秒）；引擎随后让形象从上面落下，这里在它落地时脚下洇开一圈淡墨 */
    intro({ tl, page } = {}) {
      if (still() || !tl) return 0;
      let end = 0;
      const mtn = [...document.querySelectorAll('.bg[data-scene="ink"] .ink-mtn')];
      if (mtn.length) {
        tl.fromTo(mtn, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', immediateRender: true, onComplete: () => mtn.forEach(m => clear(m, ['opacity', 'visibility', 'transform', 'translate'])) }, 0);
        end = .9;
      }
      const el = page && (page.el || (page.nodeType === 1 ? page : null));
      if (!el) return end;
      const stage = el.closest('#stage');
      [el.querySelector(':scope > .s-topic'), stage && stage.querySelector(':scope > .chrome')].filter(Boolean).forEach((x, i) => {
        tl.fromTo(x, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, ease: 'power1.out', immediateRender: true, onComplete: () => clear(x, ['opacity', 'visibility']) }, i * .1);
      });
      const title = el.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .05 + yun(tl, title, .05, own(title, 'yun')));
      // 第 0 拍：只取最外层的，形象由引擎管
      const blocks = [...el.querySelectorAll('[data-beat]')].filter(b => (parseInt(b.dataset.beat, 10) || 0) === 0
        && !b.matches(SKIP) && !(b.parentElement && b.parentElement.closest('[data-beat]')));
      blocks.forEach((b, i) => {
        const t = (title ? .4 : .2) + i * .12 + (parseFloat(b.dataset.delay) || 0), f = pick(b);
        if (!f) return;
        end = Math.max(end, t + f(tl, b, t, own(b, f.name)));
      });
      const keys = [...el.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      if (keys.length) {
        const at = Math.max(.6, end - .2);
        tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .5, ease: 'power1.out', immediateRender: true }, at);
        end = Math.max(end, at + .5);
      }
      const m = el.querySelector('.mascot.guide');
      if (m) {
        tl.call(() => {
          const art = m.querySelector('.mascot-art') || m, p = stageXY(el, art.getBoundingClientRect());
          if (p.w > 0) drop(layerOf(m), p.x + p.w / 2, p.y + p.h - 6, 180, .14);
        }, null, end + .3);
      }
      return end;
    },

    /* 点击处洇开一点淡墨（坐标是舞台坐标，layer 在内容下面） */
    ripple(x, y, layer) { drop(layer, x, y, 190, .11); },

    // 变成当前风格时挂上悬停的监听，离开时（含进阅读模式）拿掉
    mount(stage) {
      if (onMove) return;
      onMove = e => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        last = e;
        if (!raf) raf = requestAnimationFrame(track);
      };
      stage.addEventListener('pointermove', onMove, { passive: true });
    },
    unmount(stage) {
      if (onMove) stage.removeEventListener('pointermove', onMove);
      onMove = null; last = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
