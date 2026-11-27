/* =====================================================================
   风格 · 科技暗黑 dark（现代风，深色底）
   - 样子：像高端产品发布会的暗色质感。近黑底（略带冷）加唯一的冷色冰蓝 #8CC0FF，
     背景是极淡的噪点、顶上一层冷灰渐变、四周压暗，再加两团冷色光晕和标题后面一团柔光；
     卡片是深色缎面配 1px 渐变描边，银色渐变大标题，正文提亮到 #BAC2CD 以上；字用系统黑体，命令用等宽字。
     不用发光线、HUD 角标、乱码这类显廉价的元素
   - 适合讲：技术分享、命令行教学、发布会、产品介绍。不适合：温情人文、大段阅读、需要很多插图的内容
   - 默认形象：微光 weiguang（悬浮的钛灰小方块机器人，一条冰蓝眼灯，自带亮边，不加描边）
   - 投影上的注意：深色底投到幕布上容易发灰，线和字要亮、要粗一点；正文不要用比 --ink-2 更暗的颜色
   - 从定稿样页（科技暗黑）搬来的效果，以及改成对任意页面都成立的写法：
     1. 背景：噪点、冷灰渐变、压暗写进 --scene-bg（阅读模式每页也用它）；光晕放进背景层（backdrop），
        背景层铺满整个窗口，舞台外也延伸；样页里跟着居中标题的光晕，改成跟着引擎固定在左上的大标题
     2. 缎面卡片 + 1px 渐变描边：样页每张卡片手写了五层 <i>，这里改成每种组件一个伪元素描边，
        描边和卡面的各种高光都按 CSS 变量混出来，页面不用多写任何标记；卡片、小格、步骤每行、终端、截图位、命令都有
     3. 出场「浮起 + 描边扫光」（fx.lift）：组件从下面浮起，一道光沿描边从左扫到右，里面的字随后依次由虚到实；
        一排卡片的容器（.steps、.cells、.grid……）整拍出场时，里面的卡片依次浮起
     4. 文字「由虚到实」（fx.focus，也是默认出场和大标题的出场）：从模糊、略低的位置浮上来；
        太大的块不做模糊，省性能
     5. 命令「柔边擦出」（fx.wipe）；另有只扫一道描边光的 fx.sweep，给页面用 data-in="sweep" 点名
     6. 重点词：一道白光扫过、扫过处染成冰蓝、柔光亮一下再收。样页用脚本推 --g，
        这里全写在 CSS 里，跟着引擎本来就会推的 --k 走（dark.css）
     7. 当前拍：这一拍的组件描边染冰蓝、左上角一团柔光、底下一圈冷色投影。样页靠脚本加 .now，
        这里用引擎写在页面上的 data-now 对上 data-beat（dark.css）
     8. 悬停：描边和卡面各有一团高光跟着鼠标走（mount 时在舞台上挂 pointermove，写组件的 --mx --my）
     9. 退一拍（onBack）：字先虚化上收，组件再沉下去淡出
     10. 节拍指示：玻璃胶囊，当前拍的点拉长成冰蓝短条，数字从下面滚上来（dark.css）
     11. 「已复制」（copied）：一段亮光沿命令边框跑一圈，复制图标换成对勾，小玻璃胶囊由虚到实浮出
     12. 开场（intro）：光晕亮起 → 外框与主题行落下 → 大标题由虚到实 → 第 0 拍跟上 → 重点词扫光
     13. 点击处一圈很淡的光环（ripple）；翻页（pageTurn）：旧页上收淡出，新页从下面浮上来
   - 没搬的：大标题逐字拆开浮起（拆字会打断标题里的重点词）；背景随鼠标视差（留给下一份计划）；
     形象的走位和小动作（引擎的形象部分统一做）
   - 自己加的出场名：focus、lift、wipe、sweep，以及下面版式组件用的 dkorb、dkhero、dkbeam、dkcap、dkboot、dkring、dkscan、
     dkrun、dkarc、dkdiff、dkgauge，只在这个风格里认（别的风格会提醒并换成它的默认出场）。页面里不用写，组件按类名、所在位置自动选
   - 科技暗黑自己的版式组件（.dk-*，只在这个风格里有样子；样板页 samples/dark.js 把每个都用了一遍，整段抄过去改字就行）。
     整体是「高级感的控制台和 HUD」：深色缎面面板、冰蓝细线、一道光扫过；每拍「发生了什么」是控制台和仪表上的事——
     焦点框移到当前块、扫描线扫过、进度条跑完打勾、指针转到读数、数字滚上来，不是卡片淡入。
     可读性约定（组件已经按这个做好，抄的时候别改坏）：
       · 讲过的块只由引擎退到 .8，组件不另外调暗；「当前」用冰蓝描边、焦点框交代，不靠把别的弄淡
       · 要点一律写在版面上一直留着：.dk-swap 只显示最新一块，只放进度百分比这类过场数字（加 data-transient）
       · 说明句一律横排实色；银色渐变、扫光字效只给 8 个字以内的大字（.dk-hero、大数字）
       · HUD 的刻度、网格、光晕只做底纹，很淡，不压字；仪表上不写讲稿外的刻度数字
     · .dk-hero：封面、结尾的大字（128px 银色渐变）；出场由虚到实，随后一道白光从左扫到右。8 个字以内
     · .dk-sub：大字下面的一行副标题（44px 次要色）
     · .dk-cap：一枚玻璃胶囊（左边一颗冰蓝指示灯），放讲者、致谢这类一句话；出场柔边擦出
     · .dk-beam：一道冰蓝细光线（装饰，写 width），出场从中间向两边拉开
     · .dk-orb：HUD 光圈（封面主视觉）：外圈刻度、细环、三段冰蓝弧、中间一团柔光；里面可以放一个 .dk-ico。
       建页时补全圈层；出场各圈由虚到实转正，一道光沿外圈扫一周。只写 left、top、width（正方形）
     · .dk-ico[data-dk-ico="名字"]：线稿图标（这里画好，建页时填进去）：cup 盖碗、leaf 茶叶、kettle 热水壶
     · .dk-scan > .dk-obj：物件识别。每个 .dk-obj 里放一个取景框 .dk-view（里面一个 .dk-ico）和一块带拍的标签 .dk-tag
       （<b><small data-small>01</small>名字</b><span>一句说明</span>）。没到拍时取景框里是灰色线稿、四角的锁定框张在框边；
       到拍时焦点框从上一块飞过来、一道扫描线从上扫到下、锁定框收紧到物件上变冰蓝、标签由虚到实，标签上方一根引线接着取景框。
       三个标签讲完都留着；锁定框也都留着，只有当前这块是冰蓝
     · .term.dk-pipe：流水线控制台。终端第一行放一个 .copy（要执行的命令，点一下复制），下面每一步一行 .dk-job[data-beat]：
       <div class="dk-job" data-beat="1"><span class="dk-no">1/3</span><b>步骤名</b><span class="dk-say">做什么</span><span class="dk-arg">参数</span></div>
       （状态灯 .dk-st 建页时补在最前面）。到拍时焦点框从上一行移下来、这一行滑进来、底下一条进度线跑完（状态灯转圈），
       转完换成 ✓、参数亮出来。跑过的行留着，不刷屏
     · .dk-ring：进度环（data-recede="off"，属于一张图）。里面每一段一个 <i class="dk-arc" data-beat="n">，建页时按段数分好角度；
       中间放一个 .dk-swap 写百分比。到拍时这一段沿着环亮起来
     · .dk-swap：几块叠在同一个位置，只显示最新到拍的一块（过场数字，加 data-transient；没写 data-beat 的那块是起始值）。
       块上写 data-to（可加 data-from）时，数字从 from 滚到 to；不写就从下面滚上来
     · .dk-panel：深色缎面面板（和卡片同一种描边、高光、当前拍染冰蓝），给仪表、改法对照这类大块用
     · .dk-panel.dk-diff：改法对照（代码评审的左右对照）。顶上一行 .dk-diff-bar（文件名、「原来」「改成」），
       每个坑一行 .dk-hunk[data-beat]：<span class="dk-at">维度</span><p class="dk-del">错的做法</p><p class="dk-add">对的做法</p>。
       到拍时焦点框移到这一行，左边「−」一行琥珀色擦出，接着右边「+」一行冰蓝擦出、一道光扫过。左右都是实色横排字，讲完都留着
     · .dk-hud > .dk-panel.dk-gauge[data-dk-gauge="dial|bar|timer"]：HUD 仪表，style 写 --dk-to（读数占满量程的比例：80℃ 是 .8、
       五格里的 3 克是 .6、一分钟是 1）。里面放 <span class="dk-lab">名字</span> 和一块带拍的读数 .dk-read
       （<b class="dk-num" data-to="80">80<small>℃</small></b><span>一句说明</span>；时间写 data-fmt="time"，data-to 是秒数）。
       建页时补上表盘（dial 指针表、bar 五格计量条、timer 一圈计时环）和读数没到时的「--」。
       到拍时焦点框移过来、描边扫一道光、指针转到读数（略过冲再回）、计量条一格格亮到读数、数字从 0 滚到读数
     · 焦点框（.dk-glide）不用写：.dk-obj、.dk-job、.dk-hunk、.dk-gauge 到拍时组件自己放一个冰蓝细框从上一块飞过来，
       落定后交给「当前拍」的冰蓝描边（dark.css 按 data-now 写好了）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍胶囊（.meta 在这里改到 top 22，胶囊高 52：y 22–74，和主题行同一条中线；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 14–82）
   - 样子在 dark.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  /* 有缎面描边的组件；SKIP 是出场时不跟着动的子元素（形象、圈注层、涟漪层） */
  const RING = '.card, .cell, .term, .shot, .steps > li, .dk-panel';
  const HOVER = RING + ', .copy';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .dk-glide, script, style';
  /* 默认出场按组件类名分：一排卡片的容器和缎面组件「浮起 + 扫光」，命令「柔边擦出」，其余文字「由虚到实」；
     后半是版式组件（.dk-*）各自的出场 */
  const BY = { copy: 'wipe', card: 'lift', cell: 'lift', term: 'lift', shot: 'lift', steps: 'lift', cells: 'lift', grid: 'lift', row: 'lift', col: 'lift', vs: 'lift',
    'dk-orb': 'dkorb', 'dk-hero': 'dkhero', 'dk-beam': 'dkbeam', 'dk-cap': 'dkcap', 'dk-scan': 'dkboot', 'dk-ring': 'dkring', 'dk-hud': 'lift', 'dk-panel': 'lift',
    'dk-tag': 'dkscan', 'dk-job': 'dkrun', 'dk-arc': 'dkarc', 'dk-hunk': 'dkdiff', 'dk-read': 'dkgauge' };
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'filter', '--dk-sw', '--dk-wp'];

  const isRing = e => !!(e && e.matches && e.matches(RING));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子。直接 removeProperty，不用 gsap.set 的 clearProps：
     引擎把时间线一下跳到结尾（progress(1)）时，补间自己 onComplete 里的 clearProps 会被随后的终值盖回去，留下行内的 opacity:1 */
  const clean = e => PROPS.forEach(k => e.style.removeProperty(k));
  /* 面积太大的块不做模糊（大面积模糊在一般的投影电脑上会卡） */
  const blurOk = e => (e.offsetWidth || 0) * (e.offsetHeight || 0) < 360000;
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));

  /* 由虚到实：从略低、模糊的位置浮上来。o = { y, blur, dur, vis（true 时连 visibility 一起管，只给节拍单元本身用）, tilt } */
  function focusIn(tl, e, t, o) {
    const from = { y: o.y }, to = { y: 0, duration: o.dur, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (o.vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (o.blur && blurOk(e)) { from.filter = `blur(${o.blur}px)`; to.filter = 'blur(0px)'; }
    if (o.tilt) { from.rotation = o.tilt; to.rotation = o.tilt; }
    tl.fromTo(e, from, to, t);
    return o.dur;
  }
  /* 一道光沿描边从左扫到右（推动 --dk-sw，dark.css 的描边按它画出那道光） */
  function sweepRing(tl, e, t) {
    const off = () => e.style.removeProperty('--dk-sw');
    tl.fromTo(e, { '--dk-sw': '-30%' }, { '--dk-sw': '130%', duration: .8, ease: 'power2.inOut', immediateRender: false, onComplete: off, onInterrupt: off }, t);
  }
  /* 柔边擦出：从左往右，边缘是一段渐隐（推动 --dk-wp，写着的时候 dark.css 才加遮罩） */
  function wipeIn(tl, e, t, vis) {
    const from = { y: 12 }, to = { y: 0, duration: .42, ease: 'power3.out', immediateRender: true };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    tl.fromTo(e, { '--dk-wp': '-20%' }, { '--dk-wp': '110%', duration: .55, ease: 'power1.inOut', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    return .55;
  }
  /* 一个组件浮起：整体从下面浮起，描边扫一道光，里面的字随后依次由虚到实（只用 opacity，不碰子元素的 visibility） */
  function liftOne(tl, e, t, vis, tilt) {
    const from = { y: 30, scale: .985 }, to = { y: 0, scale: 1, duration: .55, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    if (isRing(e)) sweepRing(tl, e, t + .04);
    let end = .55;
    kidsOf(e).forEach((c, i) => {
      const s = .14 + i * .1;
      const d = c.matches('.copy') ? wipeIn(tl, c, t + s, false) : isRing(c) ? liftOne(tl, c, t + s, false, 0) : focusIn(tl, c, t + s, { y: 14, blur: 6, dur: .45 });
      end = Math.max(end, s + d);
    });
    return Math.min(end, .9);
  }
  /* 「浮起 + 描边扫光」：缎面组件自己浮起；一排卡片的容器先亮出来，里面的卡片依次浮起 */
  function lift(tl, e, t, ctx) {
    if (e instanceof SVGElement) return focusIn(tl, e, t, { y: 0, dur: .45, vis: true });
    const kids = kidsOf(e);
    if (!isRing(e) && kids.some(isRing)) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      let end = .2;
      kids.forEach((c, i) => {
        const s = .04 + i * .12;
        const d = isRing(c) ? liftOne(tl, c, t + s, false, 0) : c.matches('.copy') ? wipeIn(tl, c, t + s, false) : focusIn(tl, c, t + s, { y: 14, blur: 6, dur: .45 });
        end = Math.max(end, s + d);
      });
      return Math.min(end, 1.1);
    }
    return liftOne(tl, e, t, true, ctx ? ctx.tilt() : 0);
  }
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 focus） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const pick = name && FX[name] ? name : Object.keys(BY).find(c => e.classList.contains(c));
    const f = FX[pick ? (BY[pick] || pick) : 'focus'] || FX.focus;
    return f(tl, e, t, { tilt: () => 0 });
  }

  const FX = {
    // 由虚到实：默认出场、大标题的出场（大标题模糊得更多、浮得更高）；放在 .dk-swap 里的数字改成滚上来
    focus(tl, e, t, ctx) {
      if (!(e instanceof SVGElement) && e.parentElement && e.parentElement.classList.contains('dk-swap')) return swapIn(tl, e, t);
      const big = e.classList && e.classList.contains('s-title');
      return focusIn(tl, e, t, { y: big ? 24 : 16, blur: big ? 10 : 8, dur: big ? .6 : .5, vis: true, tilt: ctx && ctx.tilt ? ctx.tilt() : 0 });
    },
    // 浮起 + 描边扫光
    lift,
    // 柔边擦出（命令）
    wipe(tl, e, t) { return wipeIn(tl, e, t, true); },
    // 只扫一道描边光：淡入，同时光从左扫到右
    sweep(tl, e, t) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      if (isRing(e)) sweepRing(tl, e, t);
      return .5;
    },
    // 版式组件（.dk-*）的出场：页面里不用写，按类名自动选（见文件开头的说明和 BY）
    dkorb(tl, e, t) { return e instanceof SVGElement ? focusIn(tl, e, t, { y: 0, dur: .45, vis: true }) : orbIn(tl, e, t); },
    dkhero(tl, e, t) { return heroIn(tl, e, t); },
    dkbeam(tl, e, t) { return beamIn(tl, e, t); },
    dkcap(tl, e, t) { return capIn(tl, e, t); },
    dkboot(tl, e, t) { return bootIn(tl, e, t); },
    dkring(tl, e, t) { return ringIn(tl, e, t); },
    dkscan(tl, e, t) { return scanIn(tl, e, t); },
    dkrun(tl, e, t) { return runIn(tl, e, t); },
    dkarc(tl, e, t) { return arcIn(tl, e, t); },
    dkdiff(tl, e, t) { return diffIn(tl, e, t); },
    dkgauge(tl, e, t) { return gaugeIn(tl, e, t); },
  };

  /* =================================================================
     科技暗黑自己的版式组件（.dk-*）的出场：高级感的控制台和 HUD。
     每拍发生的是控制台和仪表上的事——焦点框移过来、扫描线扫过、锁定框收紧、进度线跑完打勾、指针转到读数、数字滚上来。
     结束时的样子都写在 dark.css 里（跟着 .on、data-now 走），所以总览、阅读模式、自检直接摆到最后一拍也是对的；
     这里只管「从哪儿变过去」，播完把临时写的内联样式、类、字都收回去
     ================================================================= */
  /* 出场途中临时加的类、改的字（数字滚动）、飞的焦点框：正常由时间线播到时收尾；时间线万一被掐断，退拍、翻页时也收一遍 */
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
    tl.fromTo(e, { [name]: a }, { [name]: b, duration: dur, ease: ease || 'power2.out', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    later(tl, t + dur, off);
  }
  /* 元素在 host 里的位置（舞台坐标，不受窗口缩放影响） */
  function rectIn(el, host) {
    const a = el.getBoundingClientRect(), b = host.getBoundingClientRect(), k = (b.width / (host.offsetWidth || b.width)) || 1;
    return { left: (a.left - b.left) / k, top: (a.top - b.top) / k, width: a.width / k, height: a.height / k };
  }
  /* 焦点框移到当前块：一个冰蓝细框从上一块飞到这一块，落定后淡出，交给 dark.css 里「当前拍」的冰蓝描边接着亮。
     sel 是同一排兄弟块的选择器（在 item 的父元素里找）；第一块没有上一块时，框在原地由大收小 */
  function glide(tl, item, t, sel) {
    const host = item.parentElement;
    if (!host || !Deck.motion) return;
    const list = [...host.children].filter(c => c.matches(sel));
    const i = list.indexOf(item), prev = i > 0 ? list[i - 1] : null;
    const to = rectIn(item, host), r0 = prev ? rectIn(prev, host) : null;
    const from = r0 || { left: to.left - 16, top: to.top - 16, width: to.width + 32, height: to.height + 32 };
    const g = document.createElement('i');
    g.className = 'dk-glide';
    g.setAttribute('aria-hidden', 'true');
    g.style.borderRadius = getComputedStyle(item).borderRadius;
    host.appendChild(g);
    tl.fromTo(g, Object.assign({ autoAlpha: r0 ? 1 : 0 }, from), Object.assign({ autoAlpha: 1, duration: .42, ease: 'power3.inOut', immediateRender: true }, to), t)
      .to(g, { autoAlpha: 0, duration: .3, ease: 'power1.out' }, t + .5);
    later(tl, t + .82, () => g.remove());
  }
  /* 数字滚动：el 里第一段字从 data-from（默认 0）滚到 data-to；data-fmt="time" 时按「分:秒」写（data-to 是秒数）。
     只临时改那一段字，播完换回页面里写的原字 */
  function countUp(tl, el, t, dur) {
    const to = parseFloat(el.dataset.to), from = parseFloat(el.dataset.from) || 0;
    if (!Number.isFinite(to)) return 0;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n = w.nextNode();
    while (n && !n.nodeValue.trim()) n = w.nextNode();
    if (!n) return 0;
    const orig = n.nodeValue, time = el.dataset.fmt === 'time';
    const fmt = v => time ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}` : String(v);
    const o = { v: from };
    const restore = () => { n.nodeValue = orig; };
    n.nodeValue = fmt(Math.round(from));
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', immediateRender: true, onUpdate: () => { n.nodeValue = fmt(Math.round(o.v)); }, onComplete: restore, onInterrupt: restore }, t);
    later(tl, t + dur, restore);
    return dur;
  }
  /* .dk-swap 里的一块：写了 data-to 就数字滚动（同时由虚到实），没写就从下面滚上来 */
  function swapIn(tl, e, t) {
    if (e.dataset.to != null) {
      focusIn(tl, e, t, { y: 10, blur: 4, dur: .3, vis: true });
      return countUp(tl, e, t, .7);
    }
    tl.fromTo(e, { autoAlpha: 0, yPercent: 60, filter: 'blur(6px)' }, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: .42, ease: 'power3.out', immediateRender: true,
      onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    return .42;
  }
  /* HUD 光圈：各圈由虚到实、一顺一逆转正，一道光沿外圈扫一周后淡掉 */
  function orbIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    const parts = [...e.querySelectorAll(':scope > .dk-orb-r, :scope > .dk-orb-core, :scope > .dk-ico')];
    parts.forEach((r, i) => {
      const off = () => clean(r), turn = r.matches('.dk-ico') ? 0 : i % 2 ? 28 : -28;   // 图标不转，只有圈层转正
      tl.fromTo(r, { opacity: 0, scale: .84 + i * .03, rotation: turn }, { opacity: 1, scale: 1, rotation: 0, duration: .85, ease: 'power3.out', immediateRender: true, onComplete: off, onInterrupt: off }, t + .05 + i * .07);
    });
    const sw = e.querySelector(':scope > .dk-orb-sweep');
    if (sw) {
      const off = () => clean(sw);
      tl.fromTo(sw, { opacity: 0, rotation: -60 }, { opacity: 1, rotation: 200, duration: .7, ease: 'power2.in', immediateRender: true }, t + .1)
        .to(sw, { rotation: 300, opacity: 0, duration: .35, ease: 'power1.out', onComplete: off, onInterrupt: off }, t + .8);
      later(tl, t + 1.16, off);
    }
    return 1.15;
  }
  /* 大字：由虚到实浮上来，随后一道白光从左扫到右（推 --dk-hl，dark.css 的字面渐变按它画出那道光） */
  function heroIn(tl, e, t) {
    const d = focusIn(tl, e, t, { y: 26, blur: 12, dur: .6, vis: true });
    tweenVar(tl, e, '--dk-hl', '-30%', '130%', t + .3, .8, 'power2.inOut');
    return Math.max(d, 1.1);
  }
  /* 细光线：从中间向两边拉开 */
  function beamIn(tl, e, t) {
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: .7, ease: 'power3.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return .7;
  }
  /* 玻璃胶囊：柔边擦出，指示灯亮一下 */
  function capIn(tl, e, t) {
    const d = wipeIn(tl, e, t, true);
    e.classList.add('dk-ping');
    later(tl, t + .9, () => e.classList.remove('dk-ping'));
    return Math.max(d, .9);
  }
  /* 识别区开机（第 0 拍）：取景框一个接一个由虚到实，锁定框从中间张开到框边 */
  function bootIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    let end = .2;
    [...e.querySelectorAll('.dk-view')].forEach((v, i) => {
      const s = .05 + i * .12;
      focusIn(tl, v, t + s, { y: 14, blur: 0, dur: .5 });
      const obj = v.closest('.dk-obj');
      if (obj) tweenVar(tl, obj, '--dk-op', .4, 0, t + s, .55, 'power3.out');
      end = Math.max(end, s + .55);
    });
    return Math.min(end, 1);
  }
  /* 进度环（第 0 拍）：轨道由虚到实、略放大落定，中间的数字跟着 */
  function ringIn(tl, e, t) {
    const off = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scale: .92, filter: 'blur(8px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .6, ease: 'power3.out', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return .6;
  }
  /* 物件识别（.dk-obj 里的 .dk-tag）：焦点框飞过来 → 扫描线从上扫到下 → 锁定框收紧到物件上 → 标签由虚到实 */
  function scanIn(tl, e, t) {
    const obj = e.closest('.dk-obj'), view = obj && obj.querySelector('.dk-view');
    if (obj) glide(tl, obj, t, '.dk-obj');
    if (view) {
      view.classList.add('dk-scanning');
      tweenVar(tl, view, '--dk-sc', 0, 1, t + .04, .5, 'power1.inOut');
      later(tl, t + .56, () => view.classList.remove('dk-scanning'));
      tweenVar(tl, obj, '--dk-lk', 0, 1, t + .3, .4, 'back.out(1.7)');
    }
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .42);
    let end = .62;
    kidsOf(e).forEach((c, i) => { const s = .44 + i * .1; end = Math.max(end, s + focusIn(tl, c, t + s, { y: 12, blur: 6, dur: .4 })); });
    return Math.min(end, 1.1);
  }
  /* 流水线的一步（.dk-job）：焦点框从上一行移下来，这一行滑进来，底下的进度线跑完（状态灯转圈），换成 ✓，参数亮出来 */
  function runIn(tl, e, t) {
    glide(tl, e, t, '.dk-job, .dk-cmd');
    tl.fromTo(e, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: .32, ease: 'power3.out', immediateRender: true,
      onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    e.classList.add('dk-running');
    tweenVar(tl, e, '--dk-pg', 0, 1, t + .06, .62, 'power1.inOut');
    later(tl, t + .7, () => e.classList.remove('dk-running'));
    const arg = e.querySelector('.dk-arg');
    let end = .9;
    kidsOf(e).filter(c => !c.matches('.dk-st')).forEach((c, i) => {
      const s = c === arg ? .7 : .06 + i * .06;
      end = Math.max(end, s + focusIn(tl, c, t + s, { y: 8, blur: 5, dur: c === arg ? .3 : .36 }));
    });
    return Math.min(end, 1.1);
  }
  /* 进度环的一段（.dk-arc）：沿着环亮起来，和流水线那一行的进度线一起跑 */
  function arcIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true, onComplete: () => clean(e) }, t);
    tweenVar(tl, e, '--dk-p', 0, 1, t + .06, .64, 'power1.inOut');
    return .7;
  }
  /* 改法对照的一行（.dk-hunk）：焦点框移过来，左边「−」一行擦出，接着右边「+」一行擦出、一道光扫过 */
  function diffIn(tl, e, t) {
    glide(tl, e, t, '.dk-hunk');
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    const at = e.querySelector('.dk-at'), del = e.querySelector('.dk-del'), add = e.querySelector('.dk-add');
    let end = .4;
    if (at) end = Math.max(end, .02 + focusIn(tl, at, t + .02, { y: 8, blur: 4, dur: .32 }));
    if (del) end = Math.max(end, .1 + wipeIn(tl, del, t + .1, false));
    if (add) {
      end = Math.max(end, .44 + wipeIn(tl, add, t + .44, false));
      tweenVar(tl, add, '--dk-hl', '-30%', '130%', t + .56, .5, 'power2.inOut');
      end = Math.max(end, 1.06);
    }
    return Math.min(end, 1.1);
  }
  /* HUD 读数（.dk-gauge 里的 .dk-read）：焦点框移过来、描边扫一道光、指针转到读数（略过冲再回）、数字从 0 滚到读数 */
  function gaugeIn(tl, e, t) {
    const g = e.closest('.dk-gauge');
    if (g) {
      glide(tl, g, t, '.dk-gauge');
      sweepRing(tl, g, t + .04);
      tweenVar(tl, g, '--dk-v', 0, 1, t + .1, .85, 'back.out(1.25)');
    }
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .15, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .1);
    let end = .95;
    kidsOf(e).forEach((c, i) => {
      const s = .1 + i * .18;
      end = Math.max(end, s + focusIn(tl, c, t + s, { y: 10, blur: 6, dur: .36 }));
      if (c.matches('.dk-num')) end = Math.max(end, s + countUp(tl, c, t + s, .8));
    });
    return Math.min(end, 1.1);
  }

  /* =================================================================
     建页时补全版式组件（decorate）：线稿图标、光圈的圈层、取景框的锁定框、流水线的状态灯、进度环的分段角度、仪表的表盘
     ================================================================= */
  /* 线稿图标：一行一个路径，描边用 dark.css 的 --dk-ink（主线）和 --dk-acc（冰蓝点缀），没识别时都是暗的 */
  const ICON = {
    cup: '<path d="M106 54 C106 45 111 40 120 40 C129 40 134 45 134 54"/>'
      + '<path d="M58 90 C62 68 88 54 120 54 C152 54 178 68 182 90"/><ellipse cx="120" cy="92" rx="66" ry="8"/>'
      + '<path d="M50 100 C54 142 84 162 120 162 C156 162 186 142 190 100"/><path d="M50 100 Q120 110 190 100"/>'
      + '<path d="M98 162 L102 172 L138 172 L142 162"/><ellipse cx="120" cy="178" rx="94" ry="11"/>'
      + '<path class="a" d="M60 124 Q120 140 180 124"/><path class="a" d="M100 30 q-8 -10 0 -20 M120 24 q-8 -10 0 -20 M140 30 q-8 -10 0 -20"/>',
    leaf: '<path d="M40 166 C38 100 94 44 202 36 C204 118 146 172 40 166 Z"/>'
      + '<path class="a" d="M40 166 C88 130 140 86 190 48"/>'
      + '<path d="M74 146 C70 126 72 108 80 92 M102 124 C100 104 104 86 114 72 M130 100 C130 84 136 70 146 60 M88 136 C108 140 126 140 146 132 M114 112 C136 116 154 114 170 104"/>'
      + '<path d="M28 184 L212 184"/>',
    kettle: '<path d="M86 76 C86 30 154 30 154 76"/><path d="M100 74 Q120 62 140 74"/><circle cx="120" cy="60" r="5"/>'
      + '<path d="M74 78 L166 78 C182 110 186 150 174 172 L66 172 C54 150 58 110 74 78 Z"/>'
      + '<path d="M68 100 L30 72 L22 80 L62 126"/><path d="M56 184 L184 184 M64 172 L62 184 M176 172 L178 184"/>'
      + '<circle class="a" cx="144" cy="136" r="12"/><path class="a" d="M144 136 L152 129"/><path class="a" d="M18 58 q-6 -9 0 -18 M30 52 q-6 -9 0 -18"/>',
  };
  const svgOf = name => `<svg viewBox="0 0 240 200" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
  /* 仪表的表盘：dial 指针表（270° 刻度盘）、bar 计量条（五格，一格一克）、timer 计时环（一圈六十格） */
  const GAUGE = {
    dial: '<i class="dk-track"></i><i class="dk-ticks"></i><i class="dk-fill"></i><i class="dk-needle"></i><i class="dk-hub"></i>',
    bar: [0, 1, 2, 3, 4].map(i => `<i class="dk-bar" style="--i:${i}"><b></b></i>`).join(''),
    timer: '<i class="dk-track"></i><i class="dk-ticks"></i><i class="dk-fill"></i><i class="dk-needle"></i><i class="dk-hub"></i>',
  };
  function decorate(s) {
    s.querySelectorAll('.dk-ico[data-dk-ico]').forEach(el => {
      const name = el.dataset.dkIco;
      if (!ICON[name]) { console.warn(`[Deck] 科技暗黑的图标 data-dk-ico="${name}" 不认识，可选：${Object.keys(ICON).join('、')}`); return; }
      el.innerHTML = svgOf(name);
      el.setAttribute('aria-hidden', 'true');
    });
    s.querySelectorAll('.dk-orb').forEach(o => {
      if (o.querySelector(':scope > .dk-orb-r')) return;
      o.insertAdjacentHTML('afterbegin', '<i class="dk-orb-r r1"></i><i class="dk-orb-r r2"></i><i class="dk-orb-r r3"></i><i class="dk-orb-r r4"></i><i class="dk-orb-core"></i>');
      o.insertAdjacentHTML('beforeend', '<i class="dk-orb-sweep"></i>');
      o.setAttribute('aria-hidden', 'true');
    });
    s.querySelectorAll('.dk-view').forEach(v => { if (!v.querySelector(':scope > .dk-lock')) v.insertAdjacentHTML('beforeend', '<i class="dk-lock"></i><i class="dk-led"></i>'); });
    s.querySelectorAll('.dk-job').forEach(j => { if (!j.querySelector(':scope > .dk-st')) j.insertAdjacentHTML('afterbegin', '<i class="dk-st" aria-hidden="true"></i>'); });
    s.querySelectorAll('.dk-ring').forEach(r => {
      if (!r.querySelector(':scope > .dk-ring-t')) r.insertAdjacentHTML('afterbegin', '<i class="dk-ring-t"></i>');
      const arcs = [...r.querySelectorAll(':scope > .dk-arc')], n = arcs.length, gap = n > 1 ? 6 : 0;
      arcs.forEach((a, i) => { a.style.setProperty('--dk-a0', String(i * 360 / n + gap / 2)); a.style.setProperty('--dk-span', String(360 / n - gap)); });
    });
    s.querySelectorAll('.dk-gauge[data-dk-gauge]').forEach(g => {
      const kind = g.dataset.dkGauge;
      if (!GAUGE[kind]) { console.warn(`[Deck] 科技暗黑的仪表 data-dk-gauge="${kind}" 不认识，可选：${Object.keys(GAUGE).join('、')}`); return; }
      if (g.querySelector(':scope > .dk-g')) return;
      const read = g.querySelector(':scope > .dk-read');
      const html = `<i class="dk-g" data-kind="${kind}" aria-hidden="true">${GAUGE[kind]}</i><b class="dk-ph" aria-hidden="true">--</b>`;
      if (read) read.insertAdjacentHTML('beforebegin', html); else g.insertAdjacentHTML('beforeend', html);
    });
  }

  /* 悬停高光跟着鼠标走：写进鼠标下面那个组件（和它外面的组件）的 --mx --my，每帧最多写一次 */
  let onMove = null, raf = 0, last = null;
  function track() {
    raf = 0;
    const ev = last; last = null;
    if (!ev || !ev.target || !ev.target.closest) return;
    for (let n = ev.target.closest(HOVER); n; n = n.parentElement && n.parentElement.closest(HOVER)) {
      if (!n.closest('.slide[data-scene="dark"]')) return;
      const r = n.getBoundingClientRect(), k = (r.width / (n.offsetWidth || r.width)) || 1;
      n.style.setProperty('--mx', ((ev.clientX - r.left) / k).toFixed(1) + 'px');
      n.style.setProperty('--my', ((ev.clientY - r.top) / k).toFixed(1) + 'px');
    }
  }

  Deck.scene('dark', {
    label: '科技暗黑',
    family: 'modern',
    dark: true,
    mascot: 'weiguang',
    enter: 'focus',
    enterBy: BY,
    titleIn: 'focus',
    recede: .8,
    rough: { strokeWidth: 2.6, roughness: .35, bowing: .3, markWidth: 3, markRoughness: .35, markBowing: .3 },   // 线稿和圈注都几乎是直的，投影上要够粗
    fx: FX,
    // 背景层：顶上一大团、右下一小团冷色光晕，标题后面一团柔光
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<i class="dk-glow dk-g1"></i><i class="dk-glow dk-g2"></i><i class="dk-glow dk-halo"></i>');
    },
    // 变成当前风格时挂上悬停高光的监听，离开时（含进阅读模式）拿掉
    mount(stage) {
      if (onMove) return;
      onMove = e => {
        if (e.pointerType === 'touch') return;
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
    // 建页：补全版式组件（.dk-*）的图标、圈层、锁定框、状态灯、进度环分段、表盘
    decorate,
    // 退一拍：字先虚化上收，组件随后沉下去淡出；版式组件的读数一起收回（指针回零、锁定框张开、进度环这一段退掉）
    onBack({ tl, units }) {
      settle();
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const back = e.matches('.dk-read') ? [e.closest('.dk-gauge'), '--dk-v'] : e.matches('.dk-tag') ? [e.closest('.dk-obj'), '--dk-lk'] : e.matches('.dk-arc') ? [e, '--dk-p'] : null;
        if (!back || !back[0]) return;
        // 收到 0 以后先留在行内，等引擎把这一拍的 .on 摘掉（约 .38 秒）再去掉，免得中间闪回终点
        const [h, name] = back;
        tl.fromTo(h, { [name]: 1 }, { [name]: 0, duration: .32, ease: 'power2.in', immediateRender: true }, 0);
        later(tl, .56, () => h.style.removeProperty(name));
      });
      const blurred = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        if (isRing(e) || kidsOf(e).some(isRing)) {
          kidsOf(e).filter(c => !isRing(c) && blurOk(c)).forEach((c, i) => {
            tl.to(c, { opacity: 0, y: -8, filter: 'blur(5px)', duration: .2, ease: 'power2.in' }, i * .03);
            blurred.push(c);
          });
        } else if (blurOk(e)) {
          tl.to(e, { filter: 'blur(5px)', duration: .24, ease: 'power2.in' }, 0);   // 位置和透明度由引擎收，这里只加模糊
          blurred.push(e);
        }
      });
      if (blurred.length) tl.call(() => blurred.forEach(clean), null, .52);
      return { at: .08, gap: .04, y: 18, dur: .3, childAt: .4 };
    },
    // 翻页：旧页上收淡出，新页从下面浮上来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      settle();
      const G = gs();
      tl.to(from.el, { autoAlpha: 0, y: -12 * dir, duration: .32, ease: 'power2.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { autoAlpha: 0, y: 18 * dir }, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out', immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .2);
      return .26;
    },
    // 「已复制」：一段亮光沿命令边框跑一圈，小玻璃胶囊由虚到实浮出，对勾描出来
    copied({ tl, tip, node, ok }) {
      tl.fromTo(tip, { autoAlpha: 0, y: 10, scale: .96, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .34, ease: 'power3.out' }, .04);
      const path = tip.querySelector('path');
      if (path && ok) {
        const L = path.getTotalLength() + 2;
        tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power2.out' }, .16);
      }
      if (ok && node && node.matches && node.matches('.copy')) {
        const off = () => { node.style.removeProperty('--dk-a'); node.style.removeProperty('--dk-run'); };
        tl.fromTo(node, { '--dk-a': '0deg', '--dk-run': 1 }, { '--dk-a': '360deg', duration: .85, ease: 'power2.inOut', immediateRender: true }, 0)
          .to(node, { '--dk-run': 0, duration: .25, ease: 'none', onComplete: off, onInterrupt: off }, .72);
      }
    },
    // 开场（约 1.2 秒）：光晕亮起 → 外框与主题行落下 → 大标题由虚到实 → 第 0 拍依次跟上 → 重点词扫光
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const glows = [...document.querySelectorAll('.bg[data-scene="dark"] .dk-glow')];
      if (glows.length) tl.fromTo(glows, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out', immediateRender: true, onComplete: () => glows.forEach(clean) }, 0);
      const stage = root.closest('#stage');
      [stage && stage.querySelector(':scope > .chrome'), root.querySelector(':scope > .s-topic')].filter(Boolean).forEach((e, i) => {
        tl.fromTo(e, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out', immediateRender: true, onComplete: () => clean(e) }, .1 + i * .06);
      });
      const title = root.querySelector(':scope > .s-title');
      if (title) focusIn(tl, title, .12, { y: 30, blur: 12, dur: .6, vis: true });
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      let end = .72;
      zero.forEach((e, i) => { const s = (title ? .42 : .2) + i * .1; end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.min(end, .9));
      return Math.max(end, 1.2);
    },
    // 点击处一圈很淡的光环（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      const G = gs();
      if (!G || !layer || !Deck.motion) return;
      const r = document.createElement('i');
      r.className = 'dk-ripple';
      r.style.left = x + 'px'; r.style.top = y + 'px';
      layer.appendChild(r);
      G.fromTo(r, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: .75, ease: 'power2.out', onComplete: () => r.remove() });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 14, w: 516, h: 68, name: '页码和节拍胶囊' },
    ],
  });
})();
