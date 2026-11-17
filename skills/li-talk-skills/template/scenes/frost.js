/* =====================================================================
   风格 · 毛玻璃 frost（现代家，浅色底）
   - 样子：淡薰衣草底上四团静止的彩色柔光斑（紫、粉、蓝、杏）和两颗边缘清楚的小球，
     上面是薄的乳白磨砂卡片：半透明白底、细亮白边、极淡颗粒、柔和的靛紫投影、背后重模糊（backdrop-filter）；
     重点词是一枚玻璃胶囊，字从墨色刷成紫 → 品红的渐变；字用系统黑体，命令用等宽字。
     和液态玻璃 glass 拉开：这里的玻璃是「薄、乳白、带颗粒的磨砂片」，不做厚度、不做折射、不做果冻弹性形变
   - 适合讲：产品介绍、工具上手、新功能发布。不适合：大段文字、表格和代码、严肃学术
   - 默认形象：小雾 xiaowu（一块磨砂玻璃小果冻，里面透出彩色反光；自带白色亮边）
   - 来源：定稿样页 04-毛玻璃.html。从样页搬过来的效果，以及改成对任意页面都成立的写法：
     1. 背景：底色、四团光斑、两颗小球、一层极淡颗粒。样页写死在舞台上；这里由 backdrop 放进铺满窗口的背景层，
        按舞台坐标放（舞台在背景层里居中），宽屏时向舞台外延伸。两颗小球挪到左右两边（避开正文、右下角的署名和左下角的计时）。
        阅读模式没有背景层，frost.css 让每页自己画同样的光斑
     2. 磨砂卡片：样页只有三张写死的卡片；这里卡片、小格、步骤的每一行、截图位都是磨砂玻璃，
        终端和命令是同一种深靛玻璃胶囊（frost.css）。颗粒、跟着鼠标的柔光、出场掠过的那道光合在一个伪元素上，页面不用多写标记
     3. 出场「浮出」float（新增的出场名）：样页「玻璃从雾里浮上来、一道光从玻璃上掠过 → 标题、说明依次由虚变实」。
        这里对任意磨砂组件成立：组件从下面、模糊里浮上来，--fr-sh 推着那道光掠过，里面的孩子随后依次由虚到实；
        一排卡片的外层（.grid、.cells、.steps、.vs……）整拍出场时，外层只极短地淡入，里面的卡片一张张浮上来
        （外层半透明时里面的磨砂会失效，所以不让外层慢慢淡入）
     4. 文字「凝出」mist（默认出场，也是大标题的出场）：从模糊、略低的位置浮上来（样页标题、解释句的做法）；
        太大的块不做模糊，省性能；碰到磨砂组件自动改用 float
     5. 只掠过一道光 sheen（新增的出场名，给页面点名用）
     6. 重点词：玻璃胶囊凝出 → 字从墨色刷成渐变 → 一道反光掠过。样页用脚本分三段播；
        这里全写在 CSS 里，跟着引擎本来就会推的 --k 走（frost.css）
     7. 悬停：磨砂组件轻轻浮起、白边更亮、柔光跟着鼠标走、朝鼠标那侧极轻地一斜；命令浮起、外面一圈淡紫光。
        样页按卡片绑监听；这里在 mount 里给舞台挂一个监听，写鼠标下面那个组件的 --mx --my --fr-rx --fr-ry，
        浮起和倾斜写在 CSS 的 :hover 里（移开自动复原）；按下时压一下（:active）
     8. 退一拍 onBack：里面的字先化回雾里，玻璃再沉下去、模糊、淡出（重点词由引擎先收）
     9. 节拍指示：右上角磨砂胶囊，圆点像系统的分页点，当前拍拉长成渐变短条；换拍时数字从雾里换上来、一道光掠过胶囊（CSS）
     10. 「已复制」copied：白玻璃小提示从雾里凝出、渐变圆里描出对勾；命令上扫过一道反光，
         一串带点颜色的磨砂小泡泡从命令上沿冒起来、飘一小段就破。样页的提示框位置写死；这里用引擎找好的位置，泡泡按命令实际位置冒
     11. 开场 intro：光斑慢慢亮起、两颗小球弹出来 → 主题行、大标题、第 0 拍依次由虚变实 → 节拍胶囊落位 → 重点词。
         形象由引擎在开场结束时落下（样页里「一颗小泡泡飘下来变成小雾」归形象和引擎，不在风格里）
     12. 点击涟漪 ripple：点击处漾开一圈白色淡光，放进内容下面那一层（点在卡片上时隔着磨砂只看到一团柔光）
     13. 同风格翻页 pageTurn：旧页上收淡出，新页从下面浮上来
   - 没搬的：背景随鼠标视差（这一版不做；样页也说过视差会让磨砂反复重算）；卡片底部的小示意（讲稿纸、色块）是那一页的内容，不是风格；
     小雾的走位、反应、空闲动作（吹泡泡、伸懒腰）归形象和引擎
   - 自己加的出场名：mist、float、sheen，以及下面版式组件用的 frball、frcap、frstack、frface、frnote、frfix、frset，
     只在这个风格里认（别的风格会提醒并换成它的默认出场）。页面里不用写，组件按类名自动选
   - 毛玻璃自己的版式组件（.fr-*，只在这个风格里有样子；样板页 samples/frost.js 把每个都用了一遍，整段抄过去改字就行）。
     整体是「彩色光斑上层层叠叠的磨砂卡片和控件」：每拍发生的是磨砂玻璃上的事——一张卡片从一摞里滑出来、
     一条通知从上一条底下滑出来、字从磨砂后面聚焦变清楚、背后的光斑挪到当前这一块后面、开关拨过去、滑块推上去、旋钮转过去。
     可读性约定（组件已经按这个做好，抄的时候别改坏）：
       · 讲过的块只由引擎退到 .8，组件不另外调淡；「当前」靠背后挪过来的那团光斑（.fr-spot）和掠过的一道光交代
       · 要点一律写在玻璃卡片上一直留着：叠成一摞的卡片翻到最后都摊开并排；通知一条条往下排、不顶掉旧的
       · 字一律实色横排，写在乳白磨砂上（底下的光斑隔着磨砂只剩一团柔色）；渐变字只给重点词和大数字
       · 小球（.fr-ball）、光斑只垫在玻璃后面，不和字直接叠在一起；没摊开的卡片里的图标、占位条是磨砂模糊的，不放字
     · .fr-pane：一大块磨砂玻璃板（封面、结尾的大字放在里面）。加 .fr-back 是后面垫的一块空玻璃（不放字），只为叠出层次
     · .fr-ball：一颗边缘清楚的渐变小球，放在玻璃板后面、一半露在外面：露出来的一半清楚，藏在玻璃后面的一半是磨砂的。
       写 left、top、width（正方形）；data-fr-tone 换颜色：pink（默认）、violet、blue、peach
     · .fr-cap：一枚白色磨砂胶囊（左边一颗渐变圆点），放讲者、致谢这类一句话；出场时从上面那块玻璃板底下滑出来
     · .fr-ico[data-fr-ico="名字"]：渐变圆角小方块里一个白色线稿图标（这里画好，建页时填进去）：
       cup 盖碗、leaf 茶叶、kettle 热水壶、thermo 温度计、clock 钟
     · .fr-fan > .fr-leaf：卡片展开。第 0 拍几张磨砂卡片叠成一摞（默认叠在中间那一栏，--fr-stack 写第几栏，从 0 数），
       每张卡片里放一个 .fr-ico 和一块带拍的字 .fr-face（<small data-small>01</small><h3>名字</h3><p>一句说明</p>）。
       到拍时最上面那张滑到自己那一栏、图标由模糊变清楚、字从磨砂后面聚焦出来、一道光掠过，背后的光斑跟过去；
       最后全部摊开并排。卡片的位置、叠放都由 frost.css 按「几张 .fr-face 到拍了」算好，页面只写 --cols、--gap。
       形象的目标写在 .fr-leaf 上（它的版面位置就是摊开后的那一栏）
     · .fr-notes > .fr-note[data-beat]：通知横幅。一条一个 .fr-ico 加 .fr-nt（<span class="fr-src" data-small>第 1 步</span><p><b>标题</b>一句说明</p>）；
       到拍时这一条从上一条底下滑出来（第一条从上面落下来），由模糊变清楚、一道光掠过。旧的不顶掉，从上往下读
     · .fr-set > .fr-row：设置面板（一大块磨砂玻璃，一行一项，行尾一个开关，建页时补上）。一行写 .fr-ico、
       <span class="fr-bad">错的做法</span>、<p class="fr-fix" data-beat="n">对的做法</p>；到拍时开关拨到「开」、对的做法从模糊里浮出来，
       错的做法一直留着（粉色小胶囊，不划掉）。当前这一行底下亮一道淡紫
     · .fr-cc > .fr-tile[data-fr-ctl="slider|knob|timer"]：控制中心。一排磨砂方块，每块一个控件（建页时补上）：
       slider 竖着的温度滑块、knob 计量旋钮（周围几颗刻度点，data-fr-steps 写几颗，默认 5）、timer 沙漏计时器；
       style 写 --fr-to（读数占满量程的比例：80℃ 是 .8、五颗点里的 3 克是 .6；沙漏不用写）。
       里面放 <span class="fr-lab">名字</span> 和一块带拍的读数 .fr-read（<b>80<small>℃</small></b><span>一句说明</span>）。
       到拍时滑块推上去、旋钮转过去点亮刻度、沙漏翻过来（frost.css 的 --fr-v 过渡，略过冲再回），读数随后由虚变实，
       背后的光斑挪到这一块后面。没调的控件是灰一点的磨砂样子
     · .fr-spot：光斑，不用写：.fr-fan、.fr-cc 建页时自己放一团，跟着「几块到拍了」挪到当前这一块后面
   - 注意：外层元素半透明（opacity < 1）时，里面卡片的磨砂只能模糊外层自己。所以讲过的拍变淡时外层不整体变淡（frost.css），
     出场时外层只极短地淡入；翻页那 0.3 秒整页在淡入淡出，磨砂会短暂变薄，背景本来就是柔光斑，看不太出来
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍胶囊（.meta 在这里改到 top 22，胶囊高 52：y 22–74，和主题行同一条中线；
       按每页最多 4 拍量，留出余量后是 x 1340–1856、y 14–82）
   - 样子在 frost.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  /* 磨砂组件（有玻璃底的）；HOVER 是有悬停柔光的；SKIP 是出场时不跟着动的子元素（形象、圈注层、涟漪层、泡泡） */
  const GLASS = '.card, .cell, .term, .shot, .steps > li, .fr-pane, .fr-cap, .fr-leaf, .fr-note, .fr-set, .fr-tile';
  const HOVER = GLASS + ', .copy';
  const TILT = '.card, .cell, .shot, .steps > li';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .fr-bub, .fr-spot, script, style';
  /* 默认出场按组件类名分：磨砂组件和一排卡片的外层「浮出」，命令「凝出」，其余文字「凝出」；
     后半是版式组件（.fr-*）各自的出场 */
  const BY = { card: 'float', cell: 'float', term: 'float', shot: 'float', steps: 'float', cells: 'float', grid: 'float', row: 'float', col: 'float', vs: 'float', copy: 'mist',
    'fr-pane': 'float', 'fr-set': 'float', 'fr-cc': 'float', 'fr-ball': 'frball', 'fr-cap': 'frcap', 'fr-fan': 'frstack', 'fr-face': 'frface',
    'fr-note': 'frnote', 'fr-fix': 'frfix', 'fr-read': 'frset' };
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'filter', '--fr-sh'];

  const isGlass = e => !!(e && e.matches && e.matches(GLASS));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子 */
  const clean = e => PROPS.forEach(k => e.style.removeProperty(k));
  /* 面积太大的块不做模糊（大面积模糊在一般的投影电脑上会卡） */
  const blurOk = e => (e.offsetWidth || 0) * (e.offsetHeight || 0) < 360000;
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));

  /* 凝出：从略低、模糊的位置浮上来。o = { y, blur, dur, vis（true 时连 visibility 一起管，只给节拍单元本身用）, tilt } */
  function mistIn(tl, e, t, o) {
    const from = { y: o.y }, to = { y: 0, duration: o.dur, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (o.vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (o.blur && blurOk(e)) { from.filter = `blur(${o.blur}px)`; to.filter = 'blur(0px)'; }
    if (o.tilt) { from.rotation = o.tilt; to.rotation = o.tilt; }
    tl.fromTo(e, from, to, t);
    return o.dur;
  }
  /* 一道光从玻璃上掠过（推动 --fr-sh，frost.css 的装饰层按它画那道光；不用 transform，免得磨砂边缘发硬） */
  function sheenOn(tl, e, t) {
    const off = () => e.style.removeProperty('--fr-sh');
    tl.fromTo(e, { '--fr-sh': '110%' }, { '--fr-sh': '-10%', duration: .8, ease: 'power1.inOut', immediateRender: false, onComplete: off, onInterrupt: off }, t);
  }
  /* 一块玻璃浮出：从下面、模糊里浮上来，一道光掠过，里面的字随后依次由虚到实（只用 opacity，不碰子元素的 visibility） */
  function floatOne(tl, e, t, vis, tilt) {
    const from = { y: 44, scale: .965 }, to = { y: 0, scale: 1, duration: .6, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (blurOk(e)) { from.filter = 'blur(10px)'; to.filter = 'blur(0px)'; }
    if (tilt) { from.rotation = tilt; to.rotation = tilt; }
    tl.fromTo(e, from, to, t);
    if (isGlass(e)) sheenOn(tl, e, t + .1);
    let end = .6;
    kidsOf(e).forEach((c, i) => {
      const s = .16 + i * .09;
      const d = isGlass(c) ? floatOne(tl, c, t + s, false, 0) : mistIn(tl, c, t + s, { y: 18, blur: 12, dur: .46 });
      end = Math.max(end, s + d);
    });
    return Math.min(end, .95);
  }
  /* 浮出：磨砂组件自己浮出；一排卡片的外层只极短地淡入（外层半透明会让里面的磨砂失效），里面的卡片一张张浮上来；
     不是玻璃、里面也没有玻璃的，按文字凝出 */
  function float(tl, e, t, ctx) {
    if (e instanceof SVGElement) return mistIn(tl, e, t, { y: 0, dur: .45, vis: true });
    const kids = kidsOf(e);
    if (!isGlass(e) && kids.some(isGlass)) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      let end = .2;
      kids.forEach((c, i) => {
        const s = .04 + i * .12;
        const d = isGlass(c) ? floatOne(tl, c, t + s, false, 0) : mistIn(tl, c, t + s, { y: 18, blur: 10, dur: .46 });
        end = Math.max(end, s + d);
      });
      return Math.min(end, 1.1);
    }
    if (!isGlass(e)) return mist(tl, e, t, ctx);
    return floatOne(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : 0);
  }
  /* 凝出（默认出场、大标题的出场）：文字从模糊、略低的位置浮上来；碰到磨砂组件改用浮出 */
  function mist(tl, e, t, ctx) {
    if (e instanceof SVGElement) return mistIn(tl, e, t, { y: 0, dur: .45, vis: true });
    if (isGlass(e) || kidsOf(e).some(isGlass)) return float(tl, e, t, ctx);
    const big = e.classList.contains('s-title');
    return mistIn(tl, e, t, { y: big ? 24 : 20, blur: big ? 12 : 10, dur: big ? .65 : .55, vis: true, tilt: ctx && ctx.tilt ? ctx.tilt() : 0 });
  }
  const FX = {
    mist,
    float,
    // 只掠过一道光：淡入，同时光从右往左掠过玻璃
    sheen(tl, e, t) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      if (isGlass(e)) sheenOn(tl, e, t);
      return .5;
    },
    // 版式组件（.fr-*）的出场：页面里不用写，按类名自动选（见文件开头的说明和 BY）
    frball(tl, e, t) { return ballIn(tl, e, t); },
    frcap(tl, e, t) { return capIn(tl, e, t); },
    frstack(tl, e, t) { return stackIn(tl, e, t); },
    frface(tl, e, t) { return faceIn(tl, e, t); },
    frnote(tl, e, t) { return noteIn(tl, e, t); },
    frfix(tl, e, t) { return fixIn(tl, e, t); },
    frset(tl, e, t) { return setIn(tl, e, t); },
  };

  /* =================================================================
     毛玻璃自己的版式组件（.fr-*）的出场：层层叠叠的磨砂卡片和控件。
     卡片摊开、开关拨动、滑块推上去、旋钮转过去、沙漏翻过来、光斑挪过去，都是 frost.css 里跟着 .on 写好的过渡
     （位置和控件读数用 translate、scale 和注册过的 --fr-v，版面位置不变，形象照样量得准）；
     这里只管「字从磨砂后面聚焦出来」「一道光掠过」「从上一块底下滑出来」，播完把临时写的内联样式收回去。
     结束时的样子都在 CSS 里，所以总览、阅读模式、自检直接摆到最后一拍也是对的
     ================================================================= */
  /* 一组字依次从模糊、略低的位置聚焦出来（只用 opacity，不碰 visibility），返回最晚结束的时刻（相对 t） */
  function kidsMist(tl, e, t, at, gap, o) {
    let end = 0;
    kidsOf(e).forEach((c, i) => { const s = at + i * gap; end = Math.max(end, s + mistIn(tl, c, t + s, o)); });
    return end;
  }
  /* 只动 x 或 scale 的补间也要把 y 写成 0：引擎退拍时用 y 收回、清行内样式时不清 gsap 记着的位移，
     下次只补间 x 会把记着的 y 一起写回去（字会低一截） */
  /* 小球：从模糊里鼓出来，略过冲再回 */
  function ballIn(tl, e, t) {
    const off = () => clean(e);
    const from = { autoAlpha: 0, y: 0, scale: .6 }, to = { autoAlpha: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.6)', immediateRender: true, onComplete: off, onInterrupt: off };
    if (blurOk(e)) { from.filter = 'blur(16px)'; to.filter = 'blur(0px)'; }
    tl.fromTo(e, from, to, t);
    return .8;
  }
  /* 胶囊：从上面那块玻璃板底下滑出来（胶囊的 z-index 比玻璃板低，起点藏在玻璃后面，隔着磨砂只看得到一团影子），
     滑出来时由模糊变清楚，一道光掠过 */
  function capIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18, ease: 'power1.out', immediateRender: true }, t);
    const from = { y: -76, scale: .94 }, to = { y: 0, scale: 1, duration: .72, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (blurOk(e)) { from.filter = 'blur(10px)'; to.filter = 'blur(0px)'; }
    tl.fromTo(e, from, to, t);
    sheenOn(tl, e, t + .34);
    return 1.05;
  }
  /* 一摞卡片（第 0 拍）：从最底下一张往上，一张张由模糊变清楚地显出来（不动位置：叠放的错位是 CSS 的 translate、scale） */
  function stackIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
    const leaves = [...e.children].filter(c => c.matches('.fr-leaf')).reverse();
    leaves.forEach((c, i) => {
      const off = () => clean(c), from = { opacity: 0 }, to = { opacity: 1, duration: .55, ease: 'power2.out', immediateRender: true, onComplete: off, onInterrupt: off };
      if (blurOk(c)) { from.filter = 'blur(14px)'; to.filter = 'blur(0px)'; }
      tl.fromTo(c, from, to, t + .05 + i * .12);
    });
    const top = leaves[leaves.length - 1];
    if (top) sheenOn(tl, top, t + .1 + leaves.length * .12);
    return Math.min(1.1, .05 + leaves.length * .12 + .55);
  }
  /* 摊开一张（.fr-leaf 里的 .fr-face）：卡片滑到自己那一栏是 CSS 过渡（约 .75 秒）；这里让字随后从磨砂后面聚焦出来，一道光掠过卡片 */
  function faceIn(tl, e, t) {
    const leaf = e.closest('.fr-leaf');
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .2);
    if (leaf) sheenOn(tl, leaf, t + .3);
    const end = kidsMist(tl, e, t, .24, .1, { y: 16, blur: 12, dur: .5 });
    return Math.min(1.1, Math.max(end, 1));
  }
  /* 一条通知：从上一条底下滑出来（第一条从上面落下来）。起点藏在上一条后面（越早的 z-index 越高），隔着磨砂先看到一团影子，
     滑到自己的位置时由模糊变清楚，一道光掠过，里面的字随后聚焦 */
  function noteIn(tl, e, t) {
    const prev = e.previousElementSibling;
    const dy = prev && prev.matches('.fr-note') && prev.classList.contains('on') ? prev.offsetTop - e.offsetTop : -64;
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .16, ease: 'power1.out', immediateRender: true }, t);
    const from = { y: dy, scale: .965 }, to = { y: 0, scale: 1, duration: .72, ease: 'power3.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) };
    if (blurOk(e)) { from.filter = 'blur(12px)'; to.filter = 'blur(0px)'; }
    tl.fromTo(e, from, to, t);
    sheenOn(tl, e, t + .38);
    const end = kidsMist(tl, e, t, .3, .1, { y: 14, blur: 10, dur: .45 });
    return Math.min(1.1, Math.max(end, .9));
  }
  /* 设置面板的一行（.fr-fix）：开关拨到「开」是 CSS 过渡；对的做法从左边、模糊里浮出来 */
  function fixIn(tl, e, t) {
    const off = () => clean(e);
    const from = { autoAlpha: 0, x: -26, y: 0 }, to = { autoAlpha: 1, x: 0, y: 0, duration: .55, ease: 'power3.out', immediateRender: true, onComplete: off, onInterrupt: off };
    if (blurOk(e)) { from.filter = 'blur(12px)'; to.filter = 'blur(0px)'; }
    tl.fromTo(e, from, to, t + .16);
    return .75;
  }
  /* 控制中心的读数（.fr-tile 里的 .fr-read）：控件调到读数是 CSS 的 --fr-v 过渡（约 .95 秒）；一道光掠过这一块，读数随后聚焦 */
  function setIn(tl, e, t) {
    const tile = e.closest('.fr-tile');
    if (tile) sheenOn(tl, tile, t);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t + .3);
    const end = kidsMist(tl, e, t, .32, .14, { y: 16, blur: 12, dur: .5 });
    return Math.min(1.1, Math.max(end, 1));
  }
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 mist） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    const pick = name && FX[name] ? name : Object.keys(BY).find(c => e.classList.contains(c));
    const f = FX[pick ? (BY[pick] || pick) : 'mist'] || FX.mist;
    return f(tl, e, t, { tilt: () => 0 });
  }

  /* 复制成功：一串带点颜色的磨砂小泡泡从命令上沿冒起来，飘一小段就破（另起动画，不放进 tl：tl 播完引擎就开始让提示淡出） */
  const TINTS = ['rgba(167,139,250,.75)', 'rgba(249,168,212,.75)', 'rgba(147,197,253,.75)', 'rgba(253,186,140,.75)'];
  function fizz(node) {
    const G = gs(), slide = node.closest('.slide');
    if (!G || !slide || !Deck.motion) return;
    const sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1, r = node.getBoundingClientRect();
    const x0 = (r.left - sr.left) / k, y0 = (r.top - sr.top) / k, w = r.width / k;
    for (let i = 0; i < 8; i++) {
      const b = document.createElement('i'), size = 14 + Math.random() * 14;
      b.className = 'fr-bub';
      b.setAttribute('aria-hidden', 'true');
      b.style.cssText = `left:${(x0 + w * (.1 + .8 * i / 7) + Math.random() * 14 - 7).toFixed(1)}px;top:${(y0 + 8).toFixed(1)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;margin:${(-size / 2).toFixed(1)}px 0 0 ${(-size / 2).toFixed(1)}px;--t:${TINTS[i % 4]}`;
      slide.appendChild(b);
      G.timeline({ delay: i * .035, onComplete: () => b.remove() })
        .fromTo(b, { scale: .2, opacity: 0, x: 0, y: 0 }, { scale: 1, opacity: 1, y: -(20 + Math.random() * 22), x: Math.random() * 20 - 10, duration: .45, ease: 'power2.out' })
        .to(b, { scale: 1.35, opacity: 0, duration: .16, ease: 'power1.out' }, '+=' + (.12 + Math.random() * .25).toFixed(2));
    }
  }

  /* =================================================================
     建页时补全版式组件（decorate）：线稿图标、光斑、控制中心的控件、设置面板的开关
     ================================================================= */
  /* 白色线稿图标（viewBox 0 0 120 120，描边粗细在 frost.css） */
  const ICON = {
    cup: '<path d="M48 19c-4-4 4-7 0-12M72 19c-4-4 4-7 0-12"/><path d="M54 31a6 6 0 0 1 12 0"/><path d="M31 47c3-13 55-13 58 0z"/>'
      + '<path d="M25 53c2 25 18 34 35 34s33-9 35-34z"/><path d="M21 99c23 6 55 6 78 0"/>',
    leaf: '<path d="M25 95C23 56 50 27 97 23c2 43-25 72-72 72z"/><path d="M25 95C46 74 67 51 90 30"/><path d="M47 75c-3-9-2-18 2-26M62 61c9 1 17-1 24-6"/>',
    kettle: '<path d="M44 45c0-23 34-23 34 0"/><path d="M38 47h46c7 16 9 34 4 47H34c-5-13-3-31 4-47z"/><path d="M37 60 18 47l-5 6 21 23"/><path d="M50 72h22"/>',
    thermo: '<path d="M52 72V27a8 8 0 0 1 16 0v45a17 17 0 1 1-16 0z"/><path d="M60 87V46"/><path d="M80 34h10M80 48h10M80 62h10"/>',
    clock: '<circle cx="60" cy="63" r="35"/><path d="M60 43v20l13 9"/><path d="M48 16h24M60 16v12"/>',
  };
  const svgOf = name => `<svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
  /* 控制中心的控件：slider 竖着的温度滑块（里面一个温度计）、knob 计量旋钮（周围一圈刻度点）、timer 沙漏（翻过来就是开始计时） */
  const CTL = {
    slider: () => `<i class="fr-track"><i class="fr-fill"></i>${svgOf('thermo')}</i>`,
    knob: n => `<i class="fr-dial">${Array.from({ length: n }, (_, k) => `<i class="fr-dot" style="--k:${k};--a:${(-135 + k * 270 / Math.max(1, n - 1)).toFixed(1)}deg"></i>`).join('')}<i class="fr-disc"><i class="fr-pin"></i></i></i>`,
    timer: () => '<svg class="fr-hg" viewBox="0 0 160 220" aria-hidden="true">'
      + '<path class="gl" d="M34 26c0 44 36 62 40 84-4 22-40 40-40 84h92c0-44-36-62-40-84 4-22 40-40 40-84z"/>'
      + '<path class="sd" d="M40 190c2-30 26-50 40-60 14 10 38 30 40 60z"/>'
      + '<rect class="cap" x="20" y="10" width="120" height="18" rx="9"/><rect class="cap" x="20" y="192" width="120" height="18" rx="9"/></svg>',
  };
  function decorate(s) {
    s.querySelectorAll('.fr-ico[data-fr-ico]').forEach(el => {
      const name = el.dataset.frIco;
      if (!ICON[name]) { console.warn(`[Deck] 毛玻璃的图标 data-fr-ico="${name}" 不认识，可选：${Object.keys(ICON).join('、')}`); return; }
      el.innerHTML = svgOf(name);
      el.setAttribute('aria-hidden', 'true');
    });
    s.querySelectorAll('.fr-fan, .fr-cc').forEach(c => { if (!c.querySelector(':scope > .fr-spot')) c.insertAdjacentHTML('beforeend', '<i class="fr-spot" aria-hidden="true"></i>'); });
    s.querySelectorAll('.fr-tile[data-fr-ctl]').forEach(t => {
      const kind = t.dataset.frCtl;
      if (!CTL[kind]) { console.warn(`[Deck] 毛玻璃的控件 data-fr-ctl="${kind}" 不认识，可选：${Object.keys(CTL).join('、')}`); return; }
      if (t.querySelector(':scope > .fr-ctl')) return;
      const n = Math.max(2, Math.min(9, parseInt(t.dataset.frSteps, 10) || 5));
      if (kind === 'knob') t.style.setProperty('--fr-steps', String(n));
      const html = `<i class="fr-ctl" data-kind="${kind}" aria-hidden="true">${CTL[kind](n)}</i>`;
      const read = t.querySelector(':scope > .fr-read');
      if (read) read.insertAdjacentHTML('beforebegin', html); else t.insertAdjacentHTML('beforeend', html);
    });
    s.querySelectorAll('.fr-row').forEach(r => { if (!r.querySelector(':scope > .fr-sw')) r.insertAdjacentHTML('beforeend', '<i class="fr-sw" aria-hidden="true"><i></i></i>'); });
  }

  /* 悬停：写进鼠标下面那个组件（和它外面的组件）的 --mx --my（柔光的位置）、--fr-rx --fr-ry（轻微倾斜），每帧最多写一次；
     浮起、倾斜、柔光亮起都在 frost.css 的 :hover 里，移开自动复原 */
  let onMove = null, raf = 0, last = null;
  function track() {
    raf = 0;
    const ev = last; last = null;
    if (!ev || !ev.target || !ev.target.closest) return;
    for (let n = ev.target.closest(HOVER); n; n = n.parentElement && n.parentElement.closest(HOVER)) {
      if (!n.closest('.slide.active[data-scene="frost"]')) return;
      const r = n.getBoundingClientRect(), k = (r.width / (n.offsetWidth || r.width)) || 1;
      n.style.setProperty('--mx', ((ev.clientX - r.left) / k).toFixed(1) + 'px');
      n.style.setProperty('--my', ((ev.clientY - r.top) / k).toFixed(1) + 'px');
      if (!RMQ.matches && n.matches(TILT)) {
        const px = (ev.clientX - r.left) / (r.width || 1), py = (ev.clientY - r.top) / (r.height || 1);
        n.style.setProperty('--fr-ry', ((px - .5) * 5).toFixed(2) + 'deg');
        n.style.setProperty('--fr-rx', ((.5 - py) * 4).toFixed(2) + 'deg');
      }
    }
  }

  Deck.scene('frost', {
    label: '毛玻璃',
    family: 'modern',
    dark: false,
    mascot: 'xiaowu',
    enter: 'mist',
    enterBy: BY,
    titleIn: 'mist',
    recede: .8,
    rough: { strokeWidth: 2.6, roughness: .35, bowing: .3, markWidth: 3, markRoughness: .4, markBowing: .3 },   // 线稿和圈注都几乎是直的
    fx: FX,
    // 沙漏里的沙子用的渐变（放进页面公用的 .deck-defs，id 以 fr- 开头）
    defs: '<linearGradient id="fr-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8307F"/><stop offset="1" stop-color="#6B4CF6"/></linearGradient>',
    // 建页：补全版式组件（.fr-*）的图标、光斑、控件、开关
    decorate,
    // 背景层：四团柔光斑、两颗小球（位置和颜色在 frost.css）
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<i class="fr-blob fr-b1"></i><i class="fr-blob fr-b2"></i><i class="fr-blob fr-b3"></i><i class="fr-blob fr-b4"></i><i class="fr-orb fr-o1"></i><i class="fr-orb fr-o2"></i>');
    },
    // 变成当前风格时挂上悬停的监听，离开时（含进阅读模式）拿掉
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
    // 退一拍：里面的字先化回雾里，玻璃再沉下去、模糊（位置和透明度由引擎收）
    onBack({ tl, units }) {
      const touched = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const kids = kidsOf(e);
        if (isGlass(e)) {
          kids.filter(c => !isGlass(c) && blurOk(c)).reverse().forEach((c, i) => {
            tl.to(c, { opacity: 0, y: 12, filter: 'blur(8px)', duration: .22, ease: 'power2.in' }, i * .03);
            touched.push(c);
          });
          const sink = { scale: .965, duration: .34, ease: 'power2.in' };
          if (blurOk(e)) sink.filter = 'blur(8px)';
          tl.to(e, sink, .1);
          touched.push(e);
        } else if (kids.some(isGlass)) {
          kids.filter(isGlass).forEach((c, i) => {
            const sink = { scale: .965, duration: .3, ease: 'power2.in' };
            if (blurOk(c)) sink.filter = 'blur(8px)';
            tl.to(c, sink, .05 + i * .03);
            touched.push(c);
          });
        } else if (blurOk(e)) {
          tl.to(e, { filter: 'blur(8px)', duration: .26, ease: 'power2.in' }, 0);   // 位置和透明度由引擎收，这里只加模糊
          touched.push(e);
        }
      });
      // 引擎在每块收完时把它藏起来；最后一块藏好后再清掉模糊、缩放，下次出场从干净的样子开始
      const end = .1 + units.length * .03 + .34 + .03;
      if (touched.length) tl.call(() => touched.forEach(clean), null, end);
      return { at: .1, gap: .03, y: 40, dur: .34, childAt: end };
    },
    // 翻页：旧页上收淡出，新页从下面浮上来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      const G = gs();
      tl.to(from.el, { autoAlpha: 0, y: -14 * dir, duration: .32, ease: 'power2.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { autoAlpha: 0, y: 22 * dir }, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out', immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .2);
      return .26;
    },
    // 「已复制」：白玻璃小提示从雾里凝出、对勾描出来；命令上扫过一道反光，磨砂小泡泡从命令上冒起来
    copied({ tl, tip, node, ok }) {
      tl.fromTo(tip, { autoAlpha: 0, y: -14, scale: .9, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .45, ease: 'back.out(1.8)', onComplete: () => tip.style.removeProperty('filter') }, 0);
      const path = tip.querySelector('path');
      if (path && ok) {
        const L = path.getTotalLength() + 2;
        tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .35, ease: 'power2.out' }, .18);
      }
      if (!ok || !node || !node.matches || !node.matches('.copy')) return;
      const off = () => node.style.removeProperty('--fr-gl');
      tl.fromTo(node, { '--fr-gl': '-40%' }, { '--fr-gl': '140%', duration: .55, ease: 'power2.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, 0);
      fizz(node);
    },
    // 开场（约 1.2 秒）：光斑亮起、小球弹出 → 主题行、大标题、第 0 拍依次由虚变实 → 节拍胶囊落位 → 重点词
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const blobs = [...document.querySelectorAll('.bg[data-scene="frost"] .fr-blob')];
      const orbs = [...document.querySelectorAll('.bg[data-scene="frost"] .fr-orb')];
      if (blobs.length) tl.fromTo(blobs, { opacity: 0, scale: .82 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out', stagger: .05, immediateRender: true, onComplete: () => blobs.forEach(clean) }, 0);
      if (orbs.length) tl.fromTo(orbs, { opacity: 0, scale: .55 }, { opacity: 1, scale: 1, duration: .7, ease: 'back.out(1.7)', stagger: .1, immediateRender: true, onComplete: () => orbs.forEach(clean) }, .2);
      const stage = root.closest('#stage');
      const chrome = stage && stage.querySelector(':scope > .chrome');
      if (chrome) tl.fromTo(chrome, { autoAlpha: 0, y: -12, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .5, ease: 'power3.out', immediateRender: true, onComplete: () => clean(chrome) }, .28);
      let t = .06;
      [root.querySelector(':scope > .s-topic'), root.querySelector(':scope > .s-title')].filter(Boolean).forEach(e => {
        mistIn(tl, e, t, { y: 22, blur: 12, dur: .65, vis: true });
        t += .09;
      });
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      let end = t + .5;
      zero.forEach((e, i) => { const s = t + i * .09; end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.min(end, .95));
      return Math.max(end, 1.1);
    },
    // 点击处漾开一圈白色淡光（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      const G = gs();
      if (!G || !layer || !Deck.motion) return;
      const r = document.createElement('i');
      r.className = 'fr-ring';
      r.setAttribute('aria-hidden', 'true');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      layer.appendChild(r);
      G.fromTo(r, { scale: .12, opacity: .9 }, { scale: 1, opacity: 0, duration: .75, ease: 'power2.out', onComplete: () => r.remove() });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 14, w: 516, h: 68, name: '页码和节拍胶囊' },
    ],
  });
})();
