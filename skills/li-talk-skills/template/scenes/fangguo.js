/* =====================================================================
   风格 · 方果 fangguo（现代风，浅色底）
   - 给方果 ERP（POD 按需印制行业的 SaaS ERP，深圳市渔童科技有限公司）的同事用：对外给客户演讲、对内给领导汇报。
     来源：定稿样页 _private/brand/方果样页/方果-第三轮.html（版式、数字、颜色）、方果-背景微动效.html（背景），
     主要学方果官网「工具箱」那组图片的样子：高级、干净、大气、不单调
   - 样子：近白底上一层会慢慢动的背景（见下面「背景」）；卡片是纯白大圆角、极淡的投影；
     主色是品牌蓝 #3B74F0（渐变 #6BA6FF → #3B74F0），品牌红 #ED5E6E 只用来点题（封面标题里的一两个字、Logo）；
     数字用 Bahnschrift（退到 DIN Alternate）字重 600、等宽数字，数字和单位分开排（单位约 0.36 倍、颜色淡），可以带淡蓝渐变。
     字用系统黑体（苹方、微软雅黑），命令用等宽字
   - 品牌标识：方果 Logo 小而固定地放在左上角——有主题行的页放在主题行最前面，后面一道细竖线；
     没有主题行的页（封面、结尾）放在章节标记前面。Logo 文件在 vendor/brand/fangguo/，fangguo.css 用相对路径引用，
     双击离线打开也显示；new 选了这个风格时把 vendor/brand/fangguo/ 一起带进课件
   - 适合讲：给客户演讲、领导汇报、产品介绍、经营数据。不适合：手绘感、童趣的内容，大段代码
   - 默认形象：方方 fangfang（方果 Logo 化来的红色圆角方块小果子，mascots/fangfang.js）。
     除了 idle、point、happy、rest，还有 ask 疑问、think 思考、idea 灵感、wow 惊讶、ok 点赞、thanks 致谢，
     页面上写 data-mascot-pose="ask" 这样用（讲「为什么」用 ask，结尾用 thanks）
   - 背景（backdrop 放进铺满窗口的背景层，两组按页型自动换）：
     · 组合 A「柔光 + 波纹」：三团很浅的柔光（蓝、淡紫、薄荷）各自慢慢游移（30–40 秒），底部四条细波浪向左流淌（46–100 秒一圈）。
       用在封面、章节页、结尾、关于我们
     · 组合 B「晕染 + 网格」：两团淡蓝光晕慢慢漂移、呼吸（24、28 秒），一张 1px 的极淡网格，一团柔光沿网格慢慢游走、
       照到的格线微微泛蓝（22 秒一圈）。用在内容页、数据页
     · 怎么分页型：decorate 给每页写 data-fg-bg="a" 或 "b"。页面里有 .fg-cover、.fg-chapter、.fg-about，或者 noTitle: true 的页用 A，
       其余用 B；要改就在页面 html 里放一个 <i data-fg-bg="a" hidden></i>（或 "b"）。当前页是哪一型，背景层就显示哪一组（fangguo.css 用 :has 选）
     · 动画只动 transform 和 mask，20–100 秒一圈；系统设置了「减少动态效果」、自检（?selftest）、截图时都停住
   - 每拍的动作克制：0.3–0.5 秒、平滑缓动，不弹跳、不砸、不过冲。
     · 默认出场 fgrise：淡入、上浮 18px（0.45 秒）
     · 数字按拍从 0 滚到读数（.fg-num 写 data-to）；柱子、环形图、进度环按拍生长，趋势线从左往右画出来
     · 当前一步用品牌蓝点亮（流程清单的序号、功能卡的描边、柱状图里那根柱子），讲过的照引擎规则只淡到 recede .8
     · 重点词：字从墨色变成品牌蓝，底下铺开一道淡蓝；引擎给重点词的放大一下在这里压掉（不弹跳）
   - 方果自己的版式组件（.fg-*，只在这个风格里有样子；样板页 samples/fangguo.js 把每个都用了一遍，整段抄过去改字就行）。
     可读性约定（组件已经按这个做好，抄的时候别改坏）：
       · 讲过的块只由引擎退到 .8，组件不另外调淡；「当前」靠品牌蓝交代
       · 要点一律写在版面上一直留着；字一律实色横排；渐变字只给大数字
       · 图表里的读数写成真的字（不画进图里），坐在后排也看得清
     · .fg-num：大数字。<b class="fg-num" data-to="52" style="font-size:96px">52<small>万单</small></b>
       数字和单位分开写，单位放 <small>；加 fg-g 是淡蓝渐变。写了 data-to 时，到拍从 0（或 data-from）滚到 data-to，
       小数位数照 data-to 写的位数，页面上写了千分位逗号（2,318）滚动时也带逗号。字号用 style 写（默认 96px）
     · .fg-kpi：指标卡。<div class="fg-kpi"><p class="fg-kpi-l"><span data-small>名字</span><i class="fg-ico fg-ico-s" data-fg-ico="box"></i></p>
       <b class="fg-num">…</b><p class="fg-delta" data-small>▲ 环比 +12%</p></div>；fg-delta 加 down 是红色
     · .fg-ico[data-fg-ico="名字"]：渐变圆角图标，白色线稿（这里画好，建页时填进去）。data-fg-tone 换颜色：
       blue（默认）、teal、coral、purple、amber、red；加 fg-ico-s 是小号（46px）。
       图标：layers 多层、img 图片、box 包裹、truck 货车、check 对勾、chart 柱状、users 人、clock 时钟、link 链接、
       shield 盾牌、bolt 闪电、shirt 衣服、cart 购物车、globe 地球、doc 文档、bulb 灯泡
     · .fg-win：白色界面窗（细描边、浅灰骨架线）。.fg-win-hd 是标题栏（放一个小图标、标题，<span> 是右边的小字）；
       里面可以放 .fg-tiles > .fg-tile（浅蓝小格：<span data-small>名字</span><b class="fg-num fg-g">数字</b>），
       骨架线 <i class="fg-sk" style="width:60%"></i>，图片占位 <i class="fg-ph"></i>（加 on 是选中的蓝框）
     · .fg-win.fg-float：浮窗，叠在大窗前面、轻轻倾斜 2°（--fg-tilt 可改，不超过 2°），投影更深；里面放 .fg-float-b（图标或进度环 + 两行字）。
       只盖住大窗里的骨架线、图片占位，不盖字
     · .fg-fold：折角标签（照工具箱「API」小卡：右下角切掉一块，切口上盖一片折过来的浅色三角，三角下面一道柔和投影，白字）。
       data-fg-tone 换颜色；属于一张图的一部分，建议写 data-recede="off"
     · .fg-bleed：出血底板。页面里写 <i class="fg-bleed" hidden></i>（加 fg-left 换到左边），背景层里一整块浅蓝底板从舞台 x 1000
       （左边是 x 920）铺到窗口边缘、上下出血，窗口不是 16:9 也铺满（画在舞台里的东西会在舞台边上断开，所以放在背景层）
     · .fg-chip：浅蓝小胶囊（封面上的「方果 ERP · 解决方案」这类）
     · .fg-panel：浅蓝大圆角底板（装饰，不放字），封面右边、流程页右边垫在界面窗后面；加 fg-left 圆角换到右边
     · .fg-bars：柱状图。<div class="fg-bars" data-fg-bars="286,318,352,371,402,511" data-fg-labels="4 月,5 月,…"
       data-fg-hi="6"（第几根用渐变蓝突出，从 1 数）data-fg-hi-beat="2"（可选：到第几拍才点亮那根）data-fg-max="560"（可选：纵轴上限）
       style="height:400px"></div>。读数、月份由这里生成成真的字；到拍时柱子从底下长出来
     · .fg-donut：环形图。<div class="fg-donut" data-fg-donut="52,27,21"><b class="fg-num" data-to="1284">1,284</b><span data-small>Q3 合计</span></div>，
       中间放合计；颜色依次是品牌蓝、浅蓝、青、琥珀、紫（data-fg-colors 可以改，逗号隔开）；
       旁边的图例用 <div class="fg-legend"><p><i></i>跨境平台<b>52%</b></p>…</div>，色块按顺序自动对上；到拍时一段段画出来
     · .fg-line：带面积的趋势线。<div class="fg-line" data-fg-line="31,33,36,…" data-fg-labels="4 月,,,6 月,…"（空的不写）
       data-fg-end="52"（可选：终点旁边写的读数，默认最后一个数）style="height:300px"></div>；到拍时从左往右画出来，终点一个圆点
     · .fg-ring：进度环。<div class="fg-ring" data-fg-ring="90" data-fg-tone="teal"><b class="fg-num" data-to="90">90<small>%</small></b></div>；到拍时环长到读数
     · .fg-cover 封面的一组字：.fg-chip、.fg-hero（大标题，<span class="fg-red"> 是品牌红点题，一页最多一处）、.fg-sub、.fg-who（讲者和日期）
     · .fg-chapter 章节页：.fg-bigno（超大编号，淡蓝渐变）、.fg-part（「PART 02」）、h1、p、.fg-toc（一排目录，.on 是本章）
     · .fg-mini：一张横着的小卡，左边大数字、右边两行说明（大数字页右边那三张）
     · .fg-feats > .fg-fc：功能卡（图标、h4、p、底下一条分隔线和一个大数字 .fg-fc-m）。写了 data-beat 的卡到拍时出现，
       当前这一拍的卡描边变蓝、投影带一点蓝
     · .fg-plat：一条「已对接平台」横栏，<span data-small>已对接平台</span><b>TEMU</b><b>SHEIN</b>…
     · .fg-flow > .fg-step：流程清单。一项 <div class="fg-step"><div><h4>名字</h4><p data-beat="1">一句说明</p></div></div>，
       序号自动生成。名字第 0 拍就在（整条路先摆出来），说明到拍出现；讲到的一项序号变浅蓝，当前一项序号是渐变蓝、名字变蓝
     · .fg-about 关于我们：.fg-qr[data-fg-qr="wechat|douyin|business"]（二维码卡：公众号、抖音号、商务合作企业微信，
       图片在 vendor/brand/fangguo/，卡里只写下面那行字），.fg-contact（电话、官网、地址，一行一个 <p><b>电话</b>…</p>）
   - 招牌交互（只有方果有，讲 SaaS 产品和 POD 工厂最贴切；同一页一次只动一处主角，0.3–0.8 秒）：
     · .fg-demo 界面演示：一扇界面窗（.fg-win.fg-demo）按拍「操作」起来。要点的按钮写 data-fg-click="拍号"（.fg-key 是蓝色按钮，加 fg-ghost 是描边按钮），
       到那一拍光标移过去点一下（光标跟着页面的 data-now 走，位置由这里量）；列表一行 .fg-demo-row（.fg-chk 勾、<b> 编号、<span> 内容、<em> 状态，
       <em class="fg-wait"> 是待处理）带 data-beat，出现后行首的勾画出来；.fg-toast 是右上角弹出的提示，留在版面上不消失
     · .fg-lens 聚焦框：在 .fg-win（或 .fg-lensbox）里给要框的元素写 data-fg-focus="拍号"，到那一拍框移过去、四周压暗一点；框由这里补上
     · .fg-print + .fg-prod 套图：印花 <i class="fg-print">（写宽高），商品 <div class="fg-prod" data-fg-prod="tee" data-beat="1"><span>T 恤</span></div>，
       轮廓 tee hoodie case bag mug pillow；到拍时印花复制一份飞到商品的印花位置上落下（出场 fgmock）
     · .fg-pipe > .fg-st 订单流水线：一站一个 .fg-st（.fg-ico、<b>站名</b>、<p data-beat="n">计数和说明</p>），站第 0 拍就摆好（灰），
       讲到的站亮起，订单卡 .fg-token（这里补上）沿轨道走到当前站，轨道一段段填成品牌蓝（最多 6 站）
     · .fg-hub > b.fg-plt 平台汇聚：平台胶囊从正上方顺时针排成一圈（data-fg-rx、data-fg-ry 是横竖半径，占宽高的百分比，默认 40），
       中间是方果；胶囊亮起时一条线画向中间、一颗光点沿线流过去（出场 fghub，只流一趟）
     · .fg-num.fg-odo 按位滚动的数字：每一位先快速翻动，再从左到右依次停在读数上；只改真数字自己的字，不叠第二层
     · .fg-vs 新旧对比：<s class="fg-old">旧</s><i class="fg-arrow"></i><b class="fg-new" data-beat="n">新</b>，新的到拍时旧的划一道红线（仍读得清）
     · 版式工具：.fg-bleed 加 fg-slant 是斜切分区、加 fg-wash 是整屏淡蓝晕染的金句页；.fg-quote 金句（上面一道品牌蓝短线，.fg-hl 点一个词，品牌蓝渐变）；
       .fg-deco 一组淡蓝同心细圆环装饰（不放字）
   - 配图和文字为主的页（版式在 fangguo.css，不用写脚本）：
     · .fg-stack > figure.shot 截图叠放：几张截图错落叠放、可以轻微倾斜（--r 不超过 2°），一拍出一张，当前那张浮到最上面、放大、品牌蓝描边
     · .fg-collage > figure.shot 图文拼贴：第一张是主图，其余叠在边上；同一张横幅照片可以用 --pos 裁出几块
     · .fg-values > .fg-val 价值观网格：<i></i>（自动编号）<b>关键词</b><p data-beat="n">一句说明</p>，中间一栏错开；说明到拍出现、顶上细线铺蓝、当前关键词变蓝
     · 叠放、拼贴里截图的「点开看大图」角标平时藏起来，鼠标移上去才出现
   - 自己加的出场名：fgrise、fgfade、fgmock、fghub，只在这个风格里认（别的风格会提醒并换成它的默认出场）。页面里不用写，组件按类名自动选
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（x 120 起，宽 1260，y 18–78）
     · 右上角页码和节拍点（.meta 改到 right 120、top 18、高 60：按每页最多 4 拍量，留出余量后是 x 1400–1820、y 14–82）
   - 样子在 fangguo.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const QS = new URLSearchParams(location.search);
  // 自检时背景停住（截图时浏览器开了「减少动态效果」，fangguo.css 的 @media 停住）
  if (QS.has('selftest')) document.documentElement.classList.add('fg-still');

  const EASE = 'power2.out';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
  const CHARTS = '.fg-bars, .fg-donut, .fg-line, .fg-ring';
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path'];
  const clean = e => PROPS.forEach(k => e.style.removeProperty(k));
  const later = (tl, t, fn) => tl.call(fn, null, Math.max(0, t));
  /* 子孙里没有自己的 data-beat 的（它们跟着这一块一起出场；自己有拍号的到自己那一拍再动） */
  const ownKids = (e, sel) => [...e.querySelectorAll(sel)].filter(c => {
    for (let n = c.parentElement; n && n !== e; n = n.parentElement) if (n.hasAttribute('data-beat')) return false;
    return !c.hasAttribute('data-beat');
  });

  /* =================================================================
     数字滚动：el 里第一段字从 data-from（默认 0）滚到 data-to；只临时改那一段字，播完换回页面里写的原字。
     小数位数照 data-to 写的位数；原字里有千分位逗号，滚动时也带
     ================================================================= */
  function countUp(tl, el, t, dur) {
    const raw = String(el.dataset.to || '').trim(), to = parseFloat(raw), from = parseFloat(el.dataset.from) || 0;
    if (!Number.isFinite(to)) return 0;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n = w.nextNode();
    while (n && !n.nodeValue.trim()) n = w.nextNode();
    if (!n) return 0;
    const orig = n.nodeValue, dot = raw.indexOf('.'), dp = dot < 0 ? 0 : raw.length - dot - 1, comma = /\d,\d/.test(orig);
    const fmt = v => { let s = v.toFixed(dp); if (comma) { const [a, b] = s.split('.'); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); } return s; };
    const o = { v: from };
    const restore = () => { n.nodeValue = orig; };
    n.nodeValue = fmt(from);
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', immediateRender: true, onUpdate: () => { n.nodeValue = fmt(o.v); }, onComplete: restore, onInterrupt: restore }, t);
    later(tl, t + dur + .01, restore);
    return dur;
  }

  /* =================================================================
     图表按拍生长（结束时的样子都是静态的 CSS / SVG，自检、阅读模式、总览直接摆到最后一拍也是对的）
     ================================================================= */
  function growBars(tl, c, t) {
    const bars = [...c.querySelectorAll('.fg-bar > i')], vals = [...c.querySelectorAll('.fg-bar > b')];
    bars.forEach((b, i) => {
      tl.fromTo(b, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: .45, ease: EASE, immediateRender: true, onComplete: () => clean(b), onInterrupt: () => clean(b) }, t + i * .05);
    });
    vals.forEach((v, i) => {
      tl.fromTo(v, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .3, ease: EASE, immediateRender: true, onComplete: () => clean(v), onInterrupt: () => clean(v) }, t + .2 + i * .05);
    });
    return .2 + vals.length * .05 + .3;
  }
  function growDonut(tl, c, t) {
    const segs = [...c.querySelectorAll('.fg-seg')];
    let at = t;
    const each = Math.min(.25, .5 / Math.max(1, segs.length));
    segs.forEach(s => {
      const len = parseFloat(s.dataset.len) || 0, off = s.style.strokeDashoffset;
      const done = () => { s.style.strokeDasharray = s.dataset.dash; s.style.strokeDashoffset = off; };
      tl.fromTo(s, { strokeDasharray: `0 ${s.dataset.c}` }, { strokeDasharray: `${len} ${s.dataset.c}`, duration: each + .15, ease: 'power1.inOut', immediateRender: true, onComplete: done, onInterrupt: done }, at);
      at += each;
    });
    return at - t + .15;
  }
  function growLine(tl, c, t) {
    const svg = c.querySelector('svg'), dot = c.querySelector('.fg-line-dot'), v = c.querySelector('.fg-line-v');
    if (svg) tl.fromTo(svg, { clipPath: 'inset(-4% 100% -4% 0)' }, { clipPath: 'inset(-4% 0% -4% 0)', duration: .5, ease: 'power1.inOut', immediateRender: true, onComplete: () => clean(svg), onInterrupt: () => clean(svg) }, t);
    [dot, v].filter(Boolean).forEach((e, i) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: .25, ease: EASE, immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .42 + i * .04));
    return .72;
  }
  function growRing(tl, c, t) {
    const p = c.querySelector('.fg-ring-p');
    if (!p) return 0;
    const end = p.style.strokeDashoffset, full = p.dataset.c;
    const done = () => { p.style.strokeDashoffset = end; };
    tl.fromTo(p, { strokeDashoffset: full }, { strokeDashoffset: end, duration: .5, ease: 'power1.inOut', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return .5;
  }
  function grow(tl, c, t) {
    if (c.matches('.fg-bars')) return growBars(tl, c, t);
    if (c.matches('.fg-donut')) return growDonut(tl, c, t);
    if (c.matches('.fg-line')) return growLine(tl, c, t);
    if (c.matches('.fg-ring')) return growRing(tl, c, t);
    return 0;
  }
  /* 一块出场时，它里面跟着一起出场的数字滚动、图表生长；返回最晚结束的时刻（相对 t） */
  function inner(tl, e, t) {
    let end = 0;
    const charts = (e.matches(CHARTS) ? [e] : []).concat(ownKids(e, CHARTS));
    charts.forEach(c => { end = Math.max(end, .08 + grow(tl, c, t + .08)); });
    const nums = (e.matches('.fg-num[data-to], .fg-odo') ? [e] : []).concat(ownKids(e, '.fg-num[data-to], .fg-odo'));
    nums.forEach(n => { end = Math.max(end, .1 + (n.classList.contains('fg-odo') ? odoRoll(tl, n, t + .1) : countUp(tl, n, t + .1, .5))); });
    return end;
  }

  /* 默认出场：淡入、上浮 18px（0.45 秒，平滑，不过冲），里面的数字滚动、图表生长 */
  function rise(tl, e, t, ctx) {
    const svg = e instanceof SVGElement;
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, y: svg ? 0 : 18 }, { autoAlpha: 1, y: 0, duration: .45, ease: EASE, immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return Math.max(.45, svg ? 0 : inner(tl, e, t));
  }
  /* 只淡入（大块底板、背景装饰） */
  function fade(tl, e, t) {
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power1.out', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return Math.max(.45, inner(tl, e, t));
  }
  const FX = { fgrise: rise, fgfade: fade, fgmock: (tl, e, t) => mockIn(tl, e, t), fghub: (tl, e, t) => hubIn(tl, e, t) };
  /* 默认出场按类名分：底板、超大编号只淡入，其余都是 fgrise */
  const BY = { 'fg-panel': 'fgfade', 'fg-bigno': 'fgfade', 'fg-prod': 'fgmock', 'fg-plt': 'fghub' };

  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 fgrise） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const pick = name && FX[name] ? name : Object.keys(BY).find(c => e.classList.contains(c));
    const f = FX[pick ? (BY[pick] || pick) : 'fgrise'] || rise;
    return f(tl, e, t, { tilt: () => 0 });
  }

  /* =================================================================
     建页时补全版式组件（decorate）：图标、图表的 SVG 和读数、页型（用哪组背景）
     ================================================================= */
  /* 白色线稿图标（viewBox 0 0 24 24，描边在 fangguo.css） */
  const ICON = {
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    img: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    box: '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chart: '<path d="M6 19v-7M12 19V6M18 19v-4"/><path d="M3.5 20.5h17"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 13.9c1.7.6 2.7 2.2 3 5.1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.3 3 7.6 7 9.5 4-1.9 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
    shirt: '<path d="M8.5 4 3.5 6.5 5 11l2-1v10h10V10l2 1 1.5-4.5L15.5 4a3.5 3.5 0 0 1-7 0Z"/>',
    cart: '<circle cx="9" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H6.6"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5Z"/>',
    doc: '<path d="M7 3.5h7l4 4V20.5H6V3.5Z"/><path d="M14 3.5V8h4M9 12.5h6M9 16h4"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  };
  const TONES = { blue: '#3B74F0', teal: '#27B79E', coral: '#F2715A', purple: '#7166F0', amber: '#F4A62A', red: '#E9505F' };
  const PALETTE = ['#3B74F0', '#8DBBFF', '#27B79E', '#F4A62A', '#7166F0', '#F2715A'];
  const nums = s => String(s || '').split(',').map(v => parseFloat(v)).filter(Number.isFinite);
  const strs = s => String(s || '').split(',').map(v => v.trim());
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f1 = v => Math.round(v * 10) / 10;
  const warnOnce = (() => { const seen = new Set(); return m => { if (!seen.has(m)) { seen.add(m); console.warn('[Deck] 方果：' + m); } }; })();

  /* 柱状图：读数和月份写成真的字；data-fg-hi 那根用渐变蓝（data-fg-hi-beat 写了就到那一拍才点亮） */
  function buildBars(c) {
    if (c.querySelector(':scope > .fg-bars-plot')) return;
    const v = nums(c.dataset.fgBars), lab = strs(c.dataset.fgLabels);
    if (!v.length) { warnOnce('.fg-bars 要写 data-fg-bars="数字,数字,…"'); return; }
    const max = parseFloat(c.dataset.fgMax) || Math.max(...v) * 1.08, hi = parseInt(c.dataset.fgHi, 10), at = parseInt(c.dataset.fgHiBeat, 10);
    const bars = v.map((x, i) => {
      const isHi = i + 1 === hi;
      const cls = 'fg-bar' + (isHi ? ' fg-hi' : '');
      const atAttr = isHi && at > 0 ? ` data-fg-at="${Math.min(at, 6)}"` : '';
      return `<div class="${cls}"${atAttr} style="--v:${Math.max(0, Math.min(1, x / max)).toFixed(4)}"><b data-small>${esc(String(c.dataset.fgBars).split(',')[i].trim())}</b><i></i></div>`;
    }).join('');
    const xs = lab.length && lab.some(Boolean) ? `<div class="fg-bars-x">${v.map((x, i) => `<span data-small>${esc(lab[i] || '')}</span>`).join('')}</div>` : '';
    c.insertAdjacentHTML('afterbegin', `<div class="fg-bars-plot" style="--n:${v.length}">${bars}</div>${xs}`);
  }
  /* 环形图：一圈 SVG 垫在中间那组字后面，按比例分段，段和段之间留一点空 */
  function buildDonut(c) {
    if (c.querySelector(':scope > svg.fg-donut-svg')) return;
    const v = nums(c.dataset.fgDonut);
    if (!v.length) { warnOnce('.fg-donut 要写 data-fg-donut="数字,数字,…"'); return; }
    const cols = c.dataset.fgColors ? strs(c.dataset.fgColors) : PALETTE;
    const sum = v.reduce((a, b) => a + b, 0) || 1, r = 46, C = 2 * Math.PI * r, gap = v.length > 1 ? 2.2 : 0;
    let acc = 0;
    const segs = v.map((x, i) => {
      const len = Math.max(0, C * x / sum - gap), off = -acc;
      acc += C * x / sum;
      const dash = `${f1(len)} ${f1(C)}`;
      return `<circle class="fg-seg" cx="60" cy="60" r="${r}" stroke="${esc(cols[i % cols.length])}" data-len="${f1(len)}" data-c="${f1(C)}" data-dash="${dash}" style="stroke-dasharray:${dash};stroke-dashoffset:${f1(off)}"/>`;
    }).join('');
    c.insertAdjacentHTML('afterbegin', `<svg class="fg-donut-svg" viewBox="0 0 120 120" aria-hidden="true"><circle class="fg-track" cx="60" cy="60" r="${r}"/>${segs}</svg>`);
    // 旁边的图例：色块按顺序对上
    const host = c.closest('.slide') || document;
    host.querySelectorAll('.fg-legend').forEach(lg => [...lg.children].forEach((p, i) => { const dot = p.querySelector(':scope > i'); if (dot && !dot.style.background) dot.style.background = cols[i % cols.length]; }));
  }
  /* 趋势线：SVG 只画线和面积（横向拉伸），终点的圆点、读数和月份是真的元素、真的字 */
  function buildLine(c) {
    if (c.querySelector(':scope > svg')) return;
    const v = nums(c.dataset.fgLine), lab = strs(c.dataset.fgLabels);
    if (v.length < 2) { warnOnce('.fg-line 要写 data-fg-line="数字,数字,…"（至少两个）'); return; }
    const lo = Math.min(...v), hi = Math.max(...v), span = (hi - lo) || 1;
    const min = c.dataset.fgMin != null ? parseFloat(c.dataset.fgMin) : lo - span * .35, max = c.dataset.fgMax != null ? parseFloat(c.dataset.fgMax) : hi + span * .6;
    const W = 1000, H = 300;
    const P = v.map((x, i) => [i * W / (v.length - 1), H - (x - min) / ((max - min) || 1) * H]);
    // Catmull-Rom 换成三次贝塞尔：平滑地穿过每个点
    let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    const id = 'fg-ar-' + Math.random().toString(36).slice(2, 8);
    const end = P[P.length - 1], endTxt = c.dataset.fgEnd != null ? c.dataset.fgEnd : String(c.dataset.fgLine).split(',').pop().trim();
    const xs = lab.length && lab.some(Boolean)
      ? `<div class="fg-line-x">${lab.map((t, i) => t ? `<span data-small style="left:${f1(i / (v.length - 1) * 100)}%">${esc(t)}</span>` : '').join('')}</div>` : '';
    c.insertAdjacentHTML('afterbegin',
      `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`
      + `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B74F0" stop-opacity=".2"/><stop offset="1" stop-color="#3B74F0" stop-opacity="0"/></linearGradient></defs>`
      + `<g class="fg-line-grid"><line x1="0" y1="${H * .2}" x2="${W}" y2="${H * .2}"/><line x1="0" y1="${H * .5}" x2="${W}" y2="${H * .5}"/><line x1="0" y1="${H * .8}" x2="${W}" y2="${H * .8}"/></g>`
      + `<path class="fg-line-area" d="${d} L${W} ${H} L0 ${H} Z" fill="url(#${id})"/><path class="fg-line-path" d="${d}"/></svg>`
      + `<i class="fg-line-dot" style="left:100%;top:${f1(end[1] / H * 100)}%"></i>`
      + `<b class="fg-line-v" data-small style="top:${f1(end[1] / H * 100)}%">${esc(endTxt)}</b>${xs}`);
  }
  /* 进度环 */
  function buildRing(c) {
    if (c.querySelector(':scope > svg')) return;
    const pct = Math.max(0, Math.min(100, parseFloat(c.dataset.fgRing) || 0)), tone = TONES[c.dataset.fgTone] || TONES.blue;
    const r = 50, C = 2 * Math.PI * r;
    c.style.setProperty('--fg-tone', tone);
    c.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="fg-ring-t" cx="60" cy="60" r="${r}"/>`
      + `<circle class="fg-ring-p" cx="60" cy="60" r="${r}" data-c="${f1(C)}" style="stroke-dasharray:${f1(C)} ${f1(C)};stroke-dashoffset:${f1(C * (1 - pct / 100))}"/></svg>`);
  }

  /* =================================================================
     招牌交互（只有方果有）：界面演示、套图、订单流水线、平台汇聚、按位滚动的数字、新旧对比、聚焦框
     - 结束时的样子都是静态的 CSS / DOM：自检、阅读模式、总览、减少动态直接摆到最后一拍也是对的
     - 光标、聚焦框跟着页面的 data-now 走（MutationObserver 盯着这一页的 data-now，算出目标的位置；位移交给 CSS 过渡，0.6 秒）
     - 套图里印花飞过去、汇聚里光点沿线跑一趟，都是到拍时只播一次，不循环
     ================================================================= */
  /* 元素相对某个祖先的位置（不受舞台缩放影响：offsetLeft / offsetTop 一层层加上去） */
  function posIn(e, host) {
    let x = 0, y = 0, n = e;
    while (n && n !== host) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    if (n !== host) { const a = e.getBoundingClientRect(), b = host.getBoundingClientRect(), k = (b.width / (host.offsetWidth || b.width)) || 1; return { x: (a.left - b.left) / k, y: (a.top - b.top) / k, w: a.width / k, h: a.height / k }; }
    return { x, y, w: e.offsetWidth, h: e.offsetHeight };
  }
  /* 拍号不大于 now 的最后一个目标 */
  function pick(list, attr, now) {
    let best = null, bv = -1;
    list.forEach(e => { const v = parseInt(e.getAttribute(attr), 10); if (v <= now && v >= bv) { best = e; bv = v; } });
    return best;
  }
  /* 界面演示的光标：移到这一拍要「点」的元素（data-fg-click="拍号"）上，点一下；没有目标时停在右下角、淡掉 */
  function syncCursor(s, now) {
    s.querySelectorAll('.fg-demo').forEach(d => {
      const cur = d.querySelector(':scope > .fg-cursor');
      if (!cur) return;
      const ts = [...d.querySelectorAll('[data-fg-click]')];
      ts.forEach(t => t.classList.remove('fg-hit'));
      const t = pick(ts, 'data-fg-click', now);
      if (!t) { cur.classList.remove('on'); cur.style.transform = `translate(${d.offsetWidth - 90}px,${d.offsetHeight - 80}px)`; return; }
      const p = posIn(t, d);
      cur.classList.add('on');
      cur.style.transform = `translate(${Math.round(p.x + p.w * .62)}px,${Math.round(p.y + p.h * .55)}px)`;
      if (parseInt(t.getAttribute('data-fg-click'), 10) === now) t.classList.add('fg-hit');
    });
  }
  /* 聚焦框：框到这一拍的目标（data-fg-focus="拍号"）上，四周压暗一点；没有目标时不显示 */
  function syncLens(s, now) {
    s.querySelectorAll('.fg-lens').forEach(l => {
      const host = l.parentElement, t = pick([...host.querySelectorAll('[data-fg-focus]')], 'data-fg-focus', now);
      if (!t) { l.classList.remove('on'); return; }
      const p = posIn(t, host), pad = 12;
      l.classList.add('on');
      l.style.transform = `translate(${Math.round(p.x - pad)}px,${Math.round(p.y - pad)}px)`;
      l.style.width = Math.round(p.w + pad * 2) + 'px';
      l.style.height = Math.round(p.h + pad * 2) + 'px';
    });
  }
  function watchNow(s) {
    const run = () => { const now = parseInt(s.dataset.now, 10) || 0; syncCursor(s, now); syncLens(s, now); };
    new MutationObserver(run).observe(s, { attributes: true, attributeFilter: ['data-now'] });
    // 字体到位后版面会动一点：再量一次
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(run, 60));
  }

  /* ---------- 套图：印花和商品轮廓（SVG，viewBox 200×220） ---------- */
  const PRINT = '<circle cx="50" cy="50" r="48" fill="#EAF3FC"/>'
    + '<g transform="translate(50 50)">' + [0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="11" ry="22" cy="-21" fill="#F2715A" opacity=".92" transform="rotate(${a})"/>`).join('') + '</g>'
    + '<path d="M50 70c-14 6-20 16-20 26M50 70c12 4 18 12 19 22" stroke="#27B79E" stroke-width="5" fill="none" stroke-linecap="round"/>'
    + '<circle cx="50" cy="50" r="11" fill="#F4A62A"/><circle cx="50" cy="50" r="5" fill="#fff" opacity=".7"/>';
  const printSvg = (x, y, w, cls) => `<svg class="${cls || ''}" x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 100 100">${PRINT}</svg>`;
  const PROD = {
    tee: { d: 'M70 22 48 30 18 58l20 26 16-12v128h92V72l16 12 20-26-30-28-22-8c-4 14-16 22-30 22S74 36 70 22Z', p: [66, 78, 68], name: 'T 恤' },
    hoodie: { d: 'M74 30c4-16 48-16 52 0l26 14 30 34-20 24-14-10v118H52V92L38 102 18 78l30-34 26-14Z M80 34c2 18 38 18 40 0', p: [70, 96, 60], name: '卫衣' },
    case: { d: 'M70 14h60a20 20 0 0 1 20 20v152a20 20 0 0 1-20 20H70a20 20 0 0 1-20-20V34a20 20 0 0 1 20-20Z', p: [64, 78, 72], extra: '<rect x="62" y="26" width="34" height="34" rx="10" fill="#EEF2F7" stroke="#C9D6EC" stroke-width="3"/>', name: '手机壳' },
    bag: { d: 'M40 74h120l-6 130H46L40 74Z', p: [64, 104, 72], extra: '<path d="M72 76c0-40 56-40 56 0" fill="none" stroke="#C9D6EC" stroke-width="7" stroke-linecap="round"/>', name: '帆布包' },
    mug: { d: 'M44 50h100v120a24 24 0 0 1-24 24H68a24 24 0 0 1-24-24V50Z', p: [60, 82, 68], extra: '<path d="M144 82h12a22 22 0 0 1 0 44h-12" fill="none" stroke="#C9D6EC" stroke-width="9"/>', name: '马克杯' },
    pillow: { d: 'M34 40q66-14 132 0 12 70 0 140-66 14-132 0-12-70 0-140Z', p: [62, 72, 76], name: '抱枕' },
  };
  function buildPrint(el) {
    if (el.querySelector('svg')) return;
    el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${PRINT}</svg>`;
    el.setAttribute('aria-hidden', 'true');
  }
  function buildProd(el) {
    if (el.querySelector(':scope > svg')) return;
    const k = el.dataset.fgProd, P = PROD[k];
    if (!P) { warnOnce(`商品 data-fg-prod="${k}" 不认识，可选：${Object.keys(PROD).join('、')}`); return; }
    el.insertAdjacentHTML('afterbegin', `<svg class="fg-prod-svg" viewBox="0 0 200 220" aria-hidden="true"><path class="fg-prod-body" d="${P.d}"/>${P.extra || ''}<g class="fg-pp">${printSvg(P.p[0], P.p[1], P.p[2])}</g></svg>`);
  }
  /* 套图出场：商品轮廓淡入上浮，同一页的 .fg-print 复制一份飞到商品的印花位置上落下，商品上的印花随后显出来 */
  function mockIn(tl, e, t) {
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .45, ease: EASE, immediateRender: true, onComplete: off, onInterrupt: off }, t);
    const pp = e.querySelector('.fg-pp'), slide = e.closest('.slide'), src = slide && slide.querySelector('.fg-print');
    if (!pp || !src || !Deck.motion) return .45;
    const show = () => pp.style.removeProperty('opacity');
    tl.fromTo(pp, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power1.out', immediateRender: true, onComplete: show, onInterrupt: show }, t + .7);
    tl.call(() => {
      const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1, a = src.getBoundingClientRect(), b = pp.getBoundingClientRect();
      const fly = document.createElement('i');
      fly.className = 'fg-fly';
      fly.setAttribute('aria-hidden', 'true');
      fly.innerHTML = `<svg viewBox="0 0 100 100">${PRINT}</svg>`;
      fly.style.cssText = `left:${((a.left - sr.left) / k).toFixed(1)}px;top:${((a.top - sr.top) / k).toFixed(1)}px;width:${(a.width / k).toFixed(1)}px;height:${(a.height / k).toFixed(1)}px`;
      slide.appendChild(fly);
      gs().to(fly, { x: (b.left - a.left) / k, y: (b.top - a.top) / k, scale: b.width / (a.width || 1), transformOrigin: '0 0', duration: .5, ease: 'power2.inOut', onComplete: () => fly.remove() });
    }, null, t + .2);
    return .95;
  }

  /* ---------- 订单流水线：一张订单卡（.fg-token）停在讲到的那个工位下面 ---------- */
  function buildPipe(p) {
    if (!p.querySelector(':scope > .fg-token')) p.insertAdjacentHTML('beforeend', '<i class="fg-token" aria-hidden="true"></i>');
    p.style.setProperty('--n', String(p.querySelectorAll(':scope > .fg-st').length || 1));
  }

  /* ---------- 平台汇聚：平台胶囊排成一圈，各自一条曲线连到中间的方果 ---------- */
  function buildHub(h) {
    if (h.querySelector(':scope > .fg-hub-core')) return;
    const chips = [...h.children].filter(c => c.classList.contains('fg-plt'));
    const W = h.offsetWidth || parseFloat(h.style.width) || 1000, H = h.offsetHeight || parseFloat(h.style.height) || 600;
    const n = chips.length, rx = parseFloat(h.dataset.fgRx) || 40, ry = parseFloat(h.dataset.fgRy) || 40;
    chips.forEach((c, i) => {
      const a = (-90 + 360 * i / n) * Math.PI / 180;
      const x = 50 + rx * Math.cos(a), y = 50 + ry * Math.sin(a);
      const dx = (50 - x) / 100 * W, dy = (50 - y) / 100 * H, cx = dx * .5 - dy * .18, cy = dy * .5 + dx * .18;
      const wrap = document.createElement('span');
      wrap.className = 'fg-hub-pos';
      wrap.style.left = f1(x) + '%'; wrap.style.top = f1(y) + '%';
      c.replaceWith(wrap);
      wrap.appendChild(c);
      c.insertAdjacentHTML('afterbegin', `<svg class="fg-hub-ln" aria-hidden="true"><path d="M0 0Q${f1(cx)} ${f1(cy)} ${f1(dx)} ${f1(dy)}"/></svg>`);
    });
    h.insertAdjacentHTML('beforeend', '<i class="fg-hub-core" aria-hidden="true"></i>');
  }
  /* 汇聚出场：胶囊淡入，连线从胶囊画向中间，一颗光点沿线跑过去（只跑一趟） */
  function hubIn(tl, e, t) {
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .4, ease: EASE, immediateRender: true, onComplete: off, onInterrupt: off }, t);
    const path = e.querySelector('.fg-hub-ln path');
    if (!path || !Deck.motion) return .4;
    let L = 0;
    try { L = path.getTotalLength(); } catch (err) { L = 0; }
    if (!L) return .4;
    const done = () => { path.style.removeProperty('stroke-dasharray'); path.style.removeProperty('stroke-dashoffset'); };
    tl.fromTo(path, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut', immediateRender: true, onComplete: done, onInterrupt: done }, t + .1);
    const svg = path.ownerSVGElement, dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '7'); dot.setAttribute('class', 'fg-hub-dot');
    const o = { v: 0 };
    tl.call(() => svg.appendChild(dot), null, t + .2);
    tl.fromTo(o, { v: 0 }, { v: 1, duration: .6, ease: 'power1.in', onUpdate: () => { const q = path.getPointAtLength(o.v * L); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y); }, onComplete: () => dot.remove(), onInterrupt: () => dot.remove() }, t + .2);
    return .85;
  }

  /* ---------- 按位滚动的数字（.fg-num.fg-odo）：像计数器一样，每一位先快速翻动，再从左到右依次停在读数上 ----------
     只改真数字自己的那段字（第一段文字；单位在 <small> 里不动），不叠第二层：等宽数字（tabular-nums）翻动时宽度不变，
     千分位逗号、小数点、冒号这些非数字字符原样留着；播完、被打断、跳拍时都换回页面里写的原字 */
  function odoRoll(tl, el, t) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n = w.nextNode();
    while (n && !n.nodeValue.trim()) n = w.nextNode();
    if (!n || !/\d/.test(n.nodeValue)) return 0;
    const orig = n.nodeValue, chars = [...orig], idx = chars.map((c, i) => /\d/.test(c) ? i : -1).filter(i => i >= 0);
    const dur = .7, o = { v: 0 };
    // 第 k 位在 lock[k] 时停住（从左到右），停之前每一帧翻到下一个数字
    const lock = idx.map((_, k) => .35 + .65 * (k + 1) / idx.length);
    const restore = () => { n.nodeValue = orig; };
    const draw = () => {
      const out = chars.slice();
      idx.forEach((ci, k) => { if (o.v < lock[k]) out[ci] = String((Math.floor(o.v * 40) + k * 3 + (+chars[ci])) % 10); });
      n.nodeValue = out.join('');
    };
    draw();   // 一出场就是翻动中的样子，不先闪一下真读数
    tl.fromTo(o, { v: 0 }, { v: 1, duration: dur, ease: 'none', immediateRender: false, onStart: draw, onUpdate: draw, onComplete: restore, onInterrupt: restore }, t);
    later(tl, t + dur + .01, restore);
    return dur;
  }


  function decorate(s, p) {
    s.querySelectorAll('.fg-ico[data-fg-ico]').forEach(el => {
      const name = el.dataset.fgIco;
      if (!ICON[name]) { warnOnce(`图标 data-fg-ico="${name}" 不认识，可选：${Object.keys(ICON).join('、')}`); return; }
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
      el.setAttribute('aria-hidden', 'true');
    });
    s.querySelectorAll('.fg-num small').forEach(u => u.setAttribute('data-small', ''));   // 单位是注释类小字（0.36 倍，最小 26px）
    s.querySelectorAll('.fg-bars').forEach(buildBars);
    s.querySelectorAll('.fg-donut').forEach(buildDonut);
    s.querySelectorAll('.fg-line').forEach(buildLine);
    s.querySelectorAll('.fg-ring').forEach(buildRing);
    s.querySelectorAll('.fg-print').forEach(buildPrint);
    s.querySelectorAll('.fg-prod[data-fg-prod]').forEach(buildProd);
    s.querySelectorAll('.fg-pipe').forEach(buildPipe);
    s.querySelectorAll('.fg-hub').forEach(buildHub);
    s.querySelectorAll('.fg-demo').forEach(d => { if (!d.querySelector(':scope > .fg-cursor')) d.insertAdjacentHTML('beforeend', '<i class="fg-cursor" aria-hidden="true"></i>'); });
    const lensHosts = new Set([...s.querySelectorAll('[data-fg-focus]')].map(t => t.closest('.fg-win, .fg-lensbox')).filter(Boolean));
    lensHosts.forEach(hst => { if (!hst.querySelector(':scope > .fg-lens')) hst.insertAdjacentHTML('beforeend', '<i class="fg-lens" aria-hidden="true"></i>'); });
    if (s.querySelector('.fg-demo, .fg-lens')) watchNow(s);
    s.querySelectorAll('.fg-qr[data-fg-qr]').forEach(q => { q.setAttribute('role', 'img'); if (!q.getAttribute('aria-label')) q.setAttribute('aria-label', '二维码：' + q.textContent.trim()); });
    // 页型：封面、章节、结尾、关于我们用 A（柔光 + 波纹），其余用 B（晕染 + 网格）
    const mark = s.querySelector('[data-fg-bg]');
    const want = mark && /^[ab]$/.test(mark.dataset.fgBg) ? mark.dataset.fgBg
      : (p && p.def && p.def.noTitle) || s.querySelector('.fg-cover, .fg-chapter, .fg-about') ? 'a' : 'b';
    s.dataset.fgBg = want;
    // 出血底板：页面里写了 <i class="fg-bleed" hidden></i>（加 fg-left 在左边），背景层显示对应的那块
    const bleed = s.querySelector('.fg-bleed');
    if (bleed) s.dataset.fgPanel = ['wash', 'slant', 'left'].find(k => bleed.classList.contains('fg-' + k)) || 'right';
  }

  /* =================================================================
     背景层：两组，按当前页的页型显示（fangguo.css）
     ================================================================= */
  // 波纹：两屏宽（viewBox 3840）的无缝波浪，周期 960，向左平移半个宽度刚好接上
  function wave(y, amp) {
    let d = `M0 ${y}`;
    for (let i = 0; i < 8; i++) d += ` c160 ${i % 2 ? amp : -amp} 320 ${i % 2 ? amp : -amp} 480 0`;
    return d;
  }
  const WAVES = [[1000, 22, '#D9E6FB', 46], [1022, 18, '#E2ECFC', 62], [1044, 20, '#EAF1FD', 80], [1064, 14, '#EFECFD', 100]];
  function backdrop(layer) {
    const wv = WAVES.map(([y, a, c, s]) => `<path d="${wave(y, a)}" stroke="${c}" style="animation-duration:${s}s"/>`).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="fg-bga"><i class="fg-sf fg-s1"></i><i class="fg-sf fg-s2"></i><i class="fg-sf fg-s3"></i>'
      + `<svg class="fg-wv" viewBox="0 0 3840 1080" preserveAspectRatio="none" aria-hidden="true">${wv}</svg></div>`
      + '<div class="fg-bgb"><i class="fg-gw fg-g1"></i><i class="fg-gw fg-g2"></i><i class="fg-grd"></i><i class="fg-grd fg-lit"></i></div>'
      // 出血底板：页面里有 .fg-bleed 时显示，从舞台里一直铺到窗口边缘
      + '<i class="fg-sheet fg-sheet-r"></i><i class="fg-sheet fg-sheet-l"></i><i class="fg-sheet fg-sheet-s"></i><i class="fg-sheet fg-sheet-w"></i>');
  }

  Deck.scene('fangguo', {
    label: '方果',
    family: 'corp',
    dark: false,
    mascot: 'fangfang',
    enter: 'fgrise',
    enterBy: BY,
    titleIn: 'fgrise',
    recede: .8,
    rough: { strokeWidth: 2.4, roughness: .2, bowing: .2, markWidth: 3, markRoughness: .3, markBowing: .2 },   // 线稿、圈注几乎是直的
    fx: FX,
    decorate,
    backdrop,
    // 退一拍：平滑收回（略下沉、淡出），不加别的动作
    onBack() { return { at: 0, gap: .03, y: 10, dur: .26, childAt: .3 }; },
    // 翻页：旧页上收淡出，新页从下面淡入浮上来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      const G = gs();
      tl.to(from.el, { autoAlpha: 0, y: -12 * dir, duration: .3, ease: 'power2.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: .45, ease: EASE, immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .2);
      return .24;
    },
    // 「已复制」：白色小胶囊从上面淡入落下，对勾描出来
    copied({ tl, tip, ok }) {
      tl.fromTo(tip, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .32, ease: EASE }, 0);
      const path = tip.querySelector('path');
      if (path && ok) {
        const L = path.getTotalLength() + 2;
        tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power1.out' }, .12);
      }
    },
    // 开场（约 1.1 秒）：背景淡入 → 主题行、大标题、第 0 拍依次淡入上浮 → 重点词
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const groups = [...document.querySelectorAll('.bg[data-scene="fangguo"] > div')];
      if (groups.length) tl.fromTo(groups, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8, ease: 'power1.out', immediateRender: true, onComplete: () => groups.forEach(clean) }, 0);
      const stage = root.closest('#stage');
      const chrome = stage && stage.querySelector(':scope > .chrome');
      if (chrome) tl.fromTo(chrome, { autoAlpha: 0 }, { autoAlpha: 1, duration: .45, ease: 'power1.out', immediateRender: true, onComplete: () => clean(chrome) }, .2);
      let t = .1;
      [root.querySelector(':scope > .s-topic'), root.querySelector(':scope > .s-title')].filter(Boolean).forEach(e => { rise(tl, e, t); t += .08; });
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      let end = t + .45;
      zero.forEach((e, i) => { const s = t + i * .07; end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .4, ease: EASE, immediateRender: true }, Math.min(end, .9));
      return Math.min(Math.max(end, 1), 1.3);
    },
    // 点击处漾开一圈很淡的品牌蓝（舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      const G = gs();
      if (!G || !layer || !Deck.motion || RMQ.matches) return;
      const r = document.createElement('i');
      r.className = 'fg-ring-fx';
      r.setAttribute('aria-hidden', 'true');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      layer.appendChild(r);
      G.fromTo(r, { scale: .2, opacity: .8 }, { scale: 1, opacity: 0, duration: .5, ease: EASE, onComplete: () => r.remove() });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1400, y: 14, w: 420, h: 68, name: '页码和节拍点' },
    ],
  });
})();
