/* =====================================================================
   风格 · 蓝图 blueprint（手绘家，深色底）
   - 样子：深蓝晒图纸、很淡的细白网格（主网格每 120px、细网格每 24px），四周一圈双线图框和分区刻度；
     线只有白和浅青两种，橙色 #FFB12B 只用在三处：重点词、当前步骤（节拍指示和带序号的步骤）、「已复制」审图章
     （圈注 data-mark 是标重点的，也用橙色）。卡片、小格、终端、截图位、命令都画成「零件」：直线方角、实心深蓝底、白描边；
     卡片右上角一个零件编号、右下露出一道斜线阴影；截图位顶上一道尺寸标注线；命令是一块双框铭牌
   - 适合讲：搭建、组成、架构、拆成几块的系统。不适合：温情故事、大量照片、要很多颜色区分的内容
   - 默认形象：圈圈 quanquan（一只会画圈的制图圆规，白线自己就亮，不加描边）
   - 投影上的注意：深色底投到幕布上容易发灰，和黑板一样把线和字做粗、做亮：正文是白和很浅的青白（--ink-2 #D3EAF8），
     描边 2.5px 起，网格压到很淡（主网格 11%、细网格 5% 的白）不影响读字；讲过的拍只退到 .7
   - 来源：第一轮样页「蓝图草稿」（只看风格，没搬它的任何文字），按第二轮的标准收了一遍：去掉斑驳纹理、
     网格减淡、标题区和左边的装配步骤栏拿掉（节拍指示用引擎右上角的位置），补上第二轮那套交互。搬过来的效果和通用写法：
     1. 背景：网格和晒图纸的明暗写进 --scene-bg（阅读模式每页也用它），位置对齐到居中的舞台，宽屏时网格在舞台外接着铺；
        双线图框和分区刻度放进背景层（backdrop），按舞台坐标放：外细线在 6px、内粗线在 16px，刻度在两线之间，
        离主题行的字还有十来像素
     2. 零件出场 fit（默认出场里卡片、终端、截图位、命令、小格用它）：样页「线先描出、部件滑入、回弹对位」——
        先在零件的位置上描一圈浅青细线（安装位，临时加进页面、播完删掉），零件从它所在的那一侧滑进来、回弹一下对位，
        安装位淡掉，零件编号弹出来，里面的字再一行行写出来（样页「引出线拉过去再写标注」）
     3. 写字 scribe（默认出场里文字用它）：从左往右写出来；大标题写完底下的基线跟着画出来；一句话解释先弹出引出点再写字
     4. 默认出场 build：按元素分给上面几种；一排零件的容器（.grid、.row、.cells、.vs、.steps……）整拍出场时，零件一个个滑进来；
        带序号的步骤一步出场时，上一步往下画一道点划中心线（竖排），序号圈弹出来，字再写出来；
        同一拍里先画线稿、再出零件和字（plan）
     5. 重点词：转成橙色、底下画两道橙色细线（双下划线），跟着引擎的 --k 走（blueprint.css）。手绘圈留给页面用 data-mark="circle"
     6. 悬停：卡片、小格、终端、截图位描边转浅青，鼠标处一道十字准线和一个小圈，四角亮出小方块（像制图软件里选中零件）；
        命令铭牌内外框转浅青、四角亮出小方块、抬起一点；步骤的序号圈泛浅青。mount 时在舞台上挂 pointermove，写 --bp-mx --bp-my
     7. 点击处画一个圆规圈（ripple）：浅青细圈从 12 点钟方向描一圈，圆心一个十字、一条半径，再淡掉
     8. 「已复制」（copied）：审图章——橙色双线框，盖下时先抬高、斜着砸下、回弹，印泥往外洇一圈，铭牌被压得一沉；
        页面放了图签栏时，章盖在图签栏的「审核」格里，没放时盖在命令旁边（引擎找的不挡字的位置）
     9. 节拍指示：右上「装配」两个字加一排装配步骤编号（白圈数字），当前这一步的圈像圆规一样描一圈橙色、编号弹出来（blueprint.css）
     10. 开场 intro：图框一笔描出来、刻度亮起 → 外框和主题行落下 → 大标题写出、基线画出 → 第 0 拍依次出场 → 重点词画上双下划线
     11. 退一拍 onBack：零件往来的方向滑回去、淡掉；字和别的块由引擎收
     12. 同风格翻页 pageTurn：图纸横移——新的一张图纸（临时带上底色和图框）从一侧整张推进来，旧的一张往另一侧让开
     13. 图签栏（可选组件）：页面写 <div class="bp-titleblock" data-speaker="讲者"></div>，decorate 把它填成贴在图框右下角的一条：
         图名（这一页的主题或标题）、讲者（data-speaker，不写是一道横线）、审核（审图章盖这里）、装配进度（第几拍 / 共几拍，CSS 按 data-now 显示）；
         不写就没有，不占正文的地方；换到别的风格时是一个空的 div
   - 没搬的：样页左边竖排的「装配步骤」栏（节拍指示统一在右上角，全稿位置一致）；背景斑驳纹理（做减法）；
     随鼠标的视差（这一版不做）；形象的走位和小动作（引擎的形象部分统一做）
   - 自己加的出场名：build、fit、scribe，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 蓝图自有的版式组件（.bp-*，只在蓝图里有样子；样板页 samples/blueprint.js 把每个都用了一遍，整段抄过去改字就行）。
     「每一拍发生了什么」按画图纸的习惯来：线一笔描出来、尺寸线从中间往两头伸、编号圈像圆规一样画一圈、明细表一格格填上，
     不是卡片弹出来。出场都由类名自动选上（默认出场 build 里分派），页面只写结构和 data-beat，不写 data-in、不写 onBeat：
     · svg.bp-fig 线稿图（零件图、剖视图、小图标）：写成 1:1 的 viewBox（宽高和 style 里一样，线宽才不缩放）。
       图形默认白色粗线；class="t" 细线、"c" 浅青细线、"cl" 点划中心线、"hid" 虚线（看不见的轮廓）、
       "h" 剖面线填充（45° 浅青斜线，画在剖开的截面上）、"s" 实心面（深蓝底挡住网格和后面的线）、"dot" 白色实心点。
       出场：图形按书写顺序一笔笔描出来（像绘图仪），虚线和点划线淡入，剖面线最后铺上。图不进「讲过的退后」，一直清楚
     · .bp-tblock > .bp-c 标题栏（图纸右下角那张表）：.bp-tblock 用 --tb-cols、--tb-rows 写网格（和 grid-template 一样），
       每格 <div class="bp-c"><i>格名</i><b>内容</b></div>，跨格用 style="grid-column:1/-1"。格名是左上角的浅青小字（自动当小字），
       内容横排一行。出场：外框描一圈 → 格线从左上角伸出来 → 格名、内容写出来。某一格的内容晚一拍填，就给那个 <b> 写 data-beat
     · .bp-ball[data-to="x,y"] 零件编号圈 + 引出线：<b class="bp-ball abs" data-beat="1" data-to="516,360" style="left:890px;top:462px">1</b>，
       left、top 必须用 px 写（圈 64×64），data-to 是引出线落在零件上的那一点（舞台坐标）。建页时自动画好引出线和落点的小圆点。
       出场：落点的小圆点先出 → 引出线从零件往编号圈拉过去 → 圈像圆规一样画一圈 → 编号弹出来。当前这一拍的编号圈转橙
     · .bp-table 明细表（零件表）：--cols 写列宽（同 grid-template-columns），--rows 写有几行，--rh 行高（默认 120px）、--hh 表头高（默认 64px）。
       表头 <div class="bp-th"><i>序号</i><i>名称</i>…</div>（浅青小字，自动当小字），每行 <div class="bp-tr" data-beat="n">，
       第一格 <i class="bp-no">1</i> 是序号圈，名称用 <b>，其余用 <span>。空表（表框、表头、格线）第 0 拍就在，
       每拍填一行：一道浅青扫线顺着这一行划过去，序号圈弹出来，各格从左往右一格格写上。当前这一行的序号圈转橙
     · .bp-box 流程框（工序框）、.bp-box.end 起止框（圆头）：<div class="bp-box abs" data-beat="1"><i class="bp-no">01</i><b>工序名</b><span>一句说明</span></div>，
       左上角的 .bp-no 是工序号小牌（自动当小字），当前这一拍转橙。出场：框线一笔描一圈 → 工序号弹出 → 名字、说明写出来
     · .bp-arrow 流程箭头（横向）：写 left、top、width（高 24）。出场：线从左往右伸出去，箭头跟着走到头
     · .bp-dim 尺寸标注：<i class="bp-dim abs" data-beat="2" style="left:…;top:…;width:…;height:110px"><b>3 g</b></i>，
       左右两条尺寸界线从 top 往下伸 height 那么长，底下一道两头带箭头的尺寸线，数值写在尺寸线上方（等宽字、深蓝底）。
       宽度就是被标的那一段（一个框的宽、一段箭头的长）。出场：尺寸界线往下伸 → 尺寸线从中间往两头伸 → 数值写出来
     · .bp-fix 修订条（一行「问题 → 改法」）：里面依次放 .bp-rev 修订三角（<b class="bp-rev">1</b>，当前这一拍转橙）、
       可选的 svg.bp-fig 小图标、.bp-cloud 修订云线（圈住问题，里面直接写字，建页时自动包一层）、.bp-arrow、.bp-ok 改后的铭牌（双线框）。
       整条一个 data-beat。出场：三角弹出 → 图标描出 → 云线像圆规一样绕一圈圈住问题、字写出 → 箭头伸出 → 铭牌描框、改法写出
     · .bp-ring 圆规圈：一个正方形的块，里面放一两行大字（居中）。出场：圆规的一条腿绕着转一圈、圆从 12 点钟方向画出来，
       四周的点划中心线淡入，里面的字再写出来
   - 自有组件的可读性约定（翻到最后一拍整页要一眼读清）：
     · 真话直接写在表格、铭牌、框里：编号圈、修订三角、云线、尺寸线是包装，「水太烫 → 晾到八十度」这种句子横排写全
     · 讲过的只由引擎退到 .8，组件不另加透明度；当前这一拍用「编号圈 / 工序号 / 修订三角转橙」交代，只有当前这一拍的编号是橙的
       （装配图上的编号圈和明细表同一行的序号圈是同一个编号，一起转）
     · 线稿和尺寸线不压字：尺寸数值自带深蓝底，云线、框线都画在字外面；明细表、标题栏、流程框都是实心深蓝底
     · 编号就是顺序（1、2、3 / 01、02、03），图上的编号圈和表里的序号一一对上；一页的重点词（橙色双下划线）不超过 2 处
     · 格名、表头、工序号这类注释小字自动标 data-small（24px 起）；表里、框里的正文不小于 34px
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和装配步骤（.meta 在这里改到 top 28，圈高 38：y 28–66；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 20–80）
     · 四周的图框只占最外面 16px，内容按左右各留 120px 写就碰不到，不另算禁区；图签栏是页面自己的字，自检照常量它压没压别的字
   - 样子在 blueprint.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1920;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => !G || RMQ.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => Math.round(n * 10) / 10;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* 出场时不跟着动的子元素：自己另有 data-beat 的（等它自己那一拍），以及形象、圈注层、提示框、临时的安装位、图签栏 */
  const SKIP = '.mascot, .kid, svg.marks, .copied-tip, .ripple-layer, .bp-slot, .bp-titleblock, .bp-trace, .bp-lead, script, style';
  /* 画成「零件」的组件：出场滑进来对位、悬停出十字准线 */
  const PART = '.card, .cell, .term, .shot, .copy';
  const HOVER = '.card, .cell, .term, .shot';
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path', '--bp-b', '--bp-u', '--bp-ln',
    '--bp-cl', '--bp-ex', '--bp-dl', '--bp-ar', '--bp-sw', '--bp-so', '--bp-arm'];
  const isPart = e => !!(e && e.matches && e.matches(PART));
  const isStep = e => !!(e && e.matches && e.matches('.steps > li'));
  const vertical = li => !!(li.parentElement && !li.parentElement.classList.contains('h'));
  const shown = e => !e.hasAttribute('data-beat') || e.classList.contains('on');
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  const clear = (e, keys) => keys.forEach(k => e.style.removeProperty(k));
  /* 节拍单元本身：动画完清掉留下的内联样式，回到 CSS 决定的样子 */
  const clean = e => clear(e, PROPS);
  /* 子元素不归引擎管：记下原来的行内样式，动画完原样还原 */
  const keep = e => { const s = e.getAttribute('style'); return () => { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  /* 元素在 1920×1080 页面坐标里的框（不受缩放、动画影响），和引擎的 boxIn 一样按 offset 算 */
  function boxIn(node, slide) {
    let l = 0, t = 0, n = node;
    while (n && n !== slide) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    return { l, t, w: node.offsetWidth || 0, h: node.offsetHeight || 0 };
  }

  /* =================================================================
     出场
     ================================================================= */
  /* 写字：从左往右写出来（clip-path）。o = { vis（节拍单元本身，连 visibility 一起管）, dur } */
  function scribeIn(tl, e, t, o) {
    const dur = o.dur || clamp((e.offsetWidth || 600) / 1900 + .24, .3, .62);
    const back = o.vis ? () => clean(e) : keep(e);
    const from = { clipPath: 'inset(-25% 100% -30% -4%)' };
    const to = { clipPath: 'inset(-25% -4% -30% -4%)', duration: dur, ease: 'power2.out', immediateRender: true, onComplete: back, onInterrupt: back };
    if (o.vis) from.autoAlpha = 1;
    tl.fromTo(e, from, to, t);
    return dur;
  }
  /* 大标题：写出来，写到一半时底下的基线从左往右画出来 */
  function titleIn(tl, e, t) {
    const d = scribeIn(tl, e, t, { vis: true, dur: clamp((e.offsetWidth || 900) / 2200 + .3, .4, .7) });
    const off = () => clear(e, ['--bp-u']);
    tl.fromTo(e, { '--bp-u': 0 }, { '--bp-u': 1, duration: .42, ease: 'power2.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, t + d * .45);
    return Math.max(d, d * .45 + .42);
  }
  /* 一句话解释：引出点先弹出来，字再写出来 */
  function explainIn(tl, e, t) {
    const d = clamp((e.offsetWidth || 900) / 1900 + .2, .35, .65);
    tl.fromTo(e, { autoAlpha: 1, '--bp-b': 0 }, { '--bp-b': 1, duration: .28, ease: 'back.out(2.4)', immediateRender: true }, t);
    tl.fromTo(e, { clipPath: 'inset(-25% 100% -30% 0px)' }, { clipPath: 'inset(-25% -4% -30% 0px)', duration: d, ease: 'power2.out', immediateRender: true }, t + .1);
    tl.call(() => clean(e), null, t + .1 + d);
    return .1 + d;
  }
  /* 安装位：在零件的位置上描一圈浅青细线（临时加进页面，压在所有内容下面），零件对位后淡掉、删掉 */
  function slot(tl, e, t) {
    const slide = e.closest('.slide');
    if (!slide) return;
    const b = boxIn(e, slide);
    if (!b.w || !b.h) return;
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'bp-slot');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `left:${b.l - 7}px;top:${b.t - 7}px;width:${b.w + 14}px;height:${b.h + 14}px`;
    s.innerHTML = `<rect x="1" y="1" width="${b.w + 12}" height="${b.h + 12}"/>`;
    const rl = slide.querySelector(':scope > .ripple-layer');
    slide.insertBefore(s, rl ? rl.nextSibling : slide.firstChild);
    const r = s.firstChild, L = 2 * (b.w + b.h + 24) + 2;
    tl.fromTo(r, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power1.inOut', immediateRender: true }, t);
    tl.to(s, { opacity: 0, duration: .24, ease: 'power1.out' }, t + .56);
    tl.call(() => s.remove(), null, t + .82);
  }
  /* 零件滑进来对位：（大零件先描安装位）→ 从它所在的那一侧滑进来、回弹一下 → 零件编号弹出来 → 里面的字一行行写出来 */
  function fitIn(tl, e, t, o) {
    const slide = e.closest('.slide');
    const b = slide ? boxIn(e, slide) : { l: 0, w: 0 };
    const dir = b.l + b.w / 2 > W / 2 + 40 ? 1 : -1;            // 在右半边的从右边进来，其余从左边
    const back = o.vis ? () => clean(e) : keep(e);
    let at = t;
    if (o.slot) { slot(tl, e, t); at = t + .14; }
    tl.fromTo(e, o.vis ? { autoAlpha: 0 } : { opacity: 0 }, Object.assign(o.vis ? { autoAlpha: 1 } : { opacity: 1 }, { duration: .22, ease: 'power1.out', immediateRender: true }), at);
    tl.fromTo(e, { x: dir * 110 }, { x: 0, duration: .52, ease: 'back.out(1.5)', immediateRender: true }, at);
    let end = at + .52;
    if (e.matches('.card')) {
      tl.fromTo(e, { '--bp-b': 0 }, { '--bp-b': 1, duration: .3, ease: 'back.out(2.2)', immediateRender: true }, at + .4);
      end = Math.max(end, at + .7);
    }
    if (e.matches('.card, .term, .cell')) {
      const kids = kidsOf(e), gap = kids.length ? Math.min(.08, .3 / kids.length) : 0;
      kids.forEach((c, i) => { const s = at + .3 + i * gap; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .32 })); });
    }
    tl.call(back, null, end);
    return end - t;
  }
  /* 带序号的步骤的一项：上一步往下画一道点划中心线（竖排）→ 序号圈弹出来 → 步骤名、说明一行行写出来 */
  function stepIn(tl, li, t, vis) {
    let at = t;
    const prev = li.previousElementSibling;
    if (vertical(li) && prev && prev.tagName === 'LI' && shown(prev)) {
      const off = () => clear(prev, ['--bp-ln']);
      tl.fromTo(prev, { '--bp-ln': 0 }, { '--bp-ln': 1, duration: .28, ease: 'power1.in', immediateRender: true, onComplete: off, onInterrupt: off }, t);
      at = t + .2;
    }
    const back = vis ? () => clean(li) : keep(li);
    tl.fromTo(li, vis ? { autoAlpha: 0 } : { opacity: 0 }, Object.assign(vis ? { autoAlpha: 1 } : { opacity: 1 }, { duration: .1, ease: 'none', immediateRender: true }), t);
    tl.fromTo(li, { '--bp-b': 0 }, { '--bp-b': 1, duration: .34, ease: 'back.out(2.2)', immediateRender: true }, at);
    let end = at + .34;
    kidsOf(li).forEach((c, i) => { const s = at + .14 + i * .12; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .36 })); });
    tl.call(back, null, end);
    return end - t;
  }
  /* 一排零件的容器（.grid、.row、.cells、.vs、.steps……）整拍出场：容器先亮出来，里面的零件、步骤一个个进来 */
  function groupIn(tl, e, t, kids) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .15, ease: 'power1.out', immediateRender: true }, t);
    let end = .15;
    const gap = Math.min(.14, .5 / Math.max(1, kids.length - 1));
    kids.forEach((c, i) => {
      const s = .04 + i * gap;
      const d = isStep(c) ? stepIn(tl, c, t + s, false) : isPart(c) ? fitIn(tl, c, t + s, { vis: false, slot: false }) : scribeIn(tl, c, t + s, { dur: .4 });
      end = Math.max(end, s + d);
    });
    tl.call(() => clean(e), null, t + end);
    return end;
  }
  function fadeIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e) }, t);
    return .4;
  }
  /* 默认出场：按元素分给上面几种 */
  function build(tl, e, t) {
    const own = compIn(tl, e, t, true);   // 蓝图自有的版式组件（.bp-*）按类名走自己的出场
    if (own >= 0) return own;
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    if (e.classList.contains('s-title')) return titleIn(tl, e, t);
    if (e.classList.contains('explain')) return explainIn(tl, e, t);
    if (isStep(e)) return stepIn(tl, e, t, true);
    if (isPart(e)) return fitIn(tl, e, t, { vis: true, slot: !e.matches('.cell') });
    const kids = kidsOf(e);
    if (kids.some(c => isPart(c) || isStep(c))) return groupIn(tl, e, t, kids);
    return scribeIn(tl, e, t, { vis: true });
  }
  const FX = {
    build,
    // 零件滑进来对位（先描安装位）
    fit(tl, e, t) { return e instanceof SVGElement ? fadeIn(tl, e, t) : fitIn(tl, e, t, { vis: true, slot: true }); },
    // 从左往右写出来
    scribe(tl, e, t) { return e instanceof SVGElement ? fadeIn(tl, e, t) : scribeIn(tl, e, t, { vis: true }); },
  };
  /* 开场里给第 0 拍的块选出场（和引擎选默认出场的规则一致：data-in 优先，认识的就用，否则用 build） */
  function runFx(tl, e, t) {
    const n = e.dataset && e.dataset.in;
    if (n === 'none') return 0;
    if (!n) { const own = compIn(tl, e, t, true); if (own >= 0) return own; }
    if (e instanceof SVGElement) return drawLines(tl, e, t);
    return (n && FX[n] ? FX[n] : build)(tl, e, t);
  }
  /* 开场里第 0 拍的线稿：一笔描出来（引擎的 draw 在开场里调不到，这里自己描） */
  function drawLines(tl, e, t) {
    const ps = e.matches('path, line, rect, circle, ellipse, polyline') ? [e] : [...e.querySelectorAll('path')];
    if (!ps.length) return fadeIn(tl, e, t);
    let c = t;
    ps.forEach(p => {
      let L = 0;
      try { L = Math.ceil(p.getTotalLength()) + 2; } catch (err) { L = 0; }
      if (!L) return;
      const d = clamp(L / 2600, .08, .5), off = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; };
      tl.fromTo(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, c);
      c += d * .6;
    });
    return Math.min(c - t + .2, .8);
  }

  /* =================================================================
     蓝图自有的版式组件（.bp-*）：出场。用法见文件开头「蓝图自有的版式组件」
     vis 为真时元素本身是节拍单元（连 visibility 一起管，结束时清掉行内样式）；为假时是别的块里的子元素（结束时还原原来的行内样式）
     ================================================================= */
  const COMP = '.bp-fig, .bp-tblock, .bp-ball, .bp-box, .bp-ok, .bp-dim, .bp-arrow, .bp-cloud, .bp-rev, .bp-ring, .bp-tr, .bp-fix';
  const isA = (e, sel) => !!(e && e.matches && e.matches(sel));
  /* 到点亮出来（一帧），返回结束时的收尾函数 */
  function showAt(tl, e, t, vis) {
    const back = vis ? () => clean(e) : keep(e);
    tl.fromTo(e, vis ? { autoAlpha: 0 } : { opacity: 0 }, Object.assign(vis ? { autoAlpha: 1 } : { opacity: 1 }, { duration: .01, ease: 'none', immediateRender: true }), t);
    return back;
  }
  /* 弹出来（编号、工序号、修订三角） */
  function popIn(tl, e, t, d = .3) {
    const back = keep(e);
    tl.fromTo(e, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: d, ease: 'back.out(2.4)', immediateRender: true, onComplete: back, onInterrupt: back }, t);
    return d;
  }
  const strokeLen = s => { try { return Math.ceil(s.getTotalLength()) + 2; } catch (err) { return 0; } };
  const dashed = s => { const d = getComputedStyle(s).strokeDasharray; return !!d && d !== 'none'; };
  /* 线稿图 svg.bp-fig：图形按书写顺序一笔笔描出来，虚线、点划线淡入，剖面线和实心面跟着轮廓铺上 */
  function figIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    const all = [...e.querySelectorAll('path, line, rect, circle, ellipse, polyline, polygon')].filter(s => !s.closest('defs'));
    const fills = all.filter(s => isA(s, '.h, .dot')), lines = all.filter(s => !fills.includes(s));
    const lens = lines.map(strokeLen), sum = lens.reduce((a, b) => a + b, 0) || 1;
    const D = clamp(sum / 3400, .3, .75);
    let c = t;
    lines.forEach((s, i) => {
      const L = lens[i];
      if (!L) return;
      const d = D * L / sum;
      const off = () => { s.style.strokeDasharray = ''; s.style.strokeDashoffset = ''; s.style.opacity = ''; s.style.fillOpacity = ''; };
      if (dashed(s)) tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: Math.max(.16, d), ease: 'power1.out', immediateRender: true, onComplete: off, onInterrupt: off }, c);
      else {
        tl.fromTo(s, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'none', immediateRender: true, onComplete: off, onInterrupt: off }, c);
        // 实心面（.s）描线的同时把底慢慢铺上
        if (isA(s, '.s')) tl.fromTo(s, { fillOpacity: 0 }, { fillOpacity: 1, duration: Math.max(.12, d), ease: 'power1.out', immediateRender: true }, c);
      }
      c += d * .85;
    });
    let end = c;
    if (fills.length) {
      const off = () => fills.forEach(f => { f.style.opacity = ''; });
      tl.fromTo(fills, { opacity: 0 }, { opacity: 1, duration: .24, ease: 'power1.out', immediateRender: true, onComplete: off, onInterrupt: off }, Math.max(t, c - .12));
      end = Math.max(end, c + .12);
    }
    end = Math.max(end, t + .1);
    tl.call(back, null, end);
    return end - t;
  }
  /* 描框：在元素自己的边框上一笔描一圈。描的时候真边框藏起来（.bp-tracing），描完换回真边框。
     描框用的 svg.bp-trace 第一次出场时放进元素里，以后每次出场按当时的大小重画；颜色跟着 --bp-bc */
  function traceBox(tl, e, t, d) {
    const w = e.offsetWidth, h = e.offsetHeight;
    if (!w || !h) return 0;
    const cs = getComputedStyle(e), bw = parseFloat(cs.borderTopWidth) || 3, r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, h / 2);
    let s = e.querySelector(':scope > svg.bp-trace');
    if (!s) {
      s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', 'bp-trace');
      s.setAttribute('aria-hidden', 'true');
      s.appendChild(document.createElementNS(NS, 'rect'));
      e.appendChild(s);
    }
    s.style.cssText = `left:${-bw}px;top:${-bw}px;width:${w}px;height:${h}px`;
    const rc = s.firstChild;
    rc.setAttribute('x', f1(bw / 2)); rc.setAttribute('y', f1(bw / 2));
    rc.setAttribute('width', f1(w - bw)); rc.setAttribute('height', f1(h - bw));
    rc.setAttribute('rx', f1(Math.max(0, r - bw / 2))); rc.setAttribute('stroke-width', f1(bw));
    const L = strokeLen(rc) || 2 * (w + h);
    const end = () => e.classList.remove('bp-tracing');
    tl.call(() => e.classList.add('bp-tracing'), null, t);
    tl.fromTo(rc, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', immediateRender: true, onComplete: end, onInterrupt: end }, t);
    return d;
  }
  /* 流程框、起止框、改后的铭牌：框线描一圈 → 工序号弹出 → 名字、说明写出来 */
  function frameIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    e.classList.remove('bp-tracing');
    let end = t + traceBox(tl, e, t, .34);
    const no = e.querySelector(':scope > .bp-no');
    if (no) end = Math.max(end, t + .2 + popIn(tl, no, t + .2));
    kidsOf(e).filter(c => c !== no).forEach((c, i) => { const s = t + .24 + i * .1; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .3 })); });
    tl.call(back, null, end);
    return end - t;
  }
  /* 标题栏：外框描一圈 → 格线从每格左上角伸出来 → 格名、内容写出来（自己另有 data-beat 的内容等它那一拍） */
  function tblockIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    e.classList.remove('bp-tracing');
    let end = t + traceBox(tl, e, t, .42);
    const cells = [...e.children].filter(c => isA(c, '.bp-c'));
    cells.forEach((c, i) => {
      const s = t + .2 + i * .06, off = keep(c);
      tl.fromTo(c, { '--bp-gl': 0 }, { '--bp-gl': 1, duration: .26, ease: 'power2.out', immediateRender: true, onComplete: off, onInterrupt: off }, s);
      kidsOf(c).forEach((k, j) => { const s2 = s + .14 + j * .1; end = Math.max(end, s2 + scribeIn(tl, k, s2, { dur: .3 })); });
    });
    tl.call(back, null, end);
    return end - t;
  }
  /* 零件编号圈：落点小圆点 → 引出线从零件拉到圈上 → 圈像圆规一样画一圈 → 编号弹出来 */
  function ballIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    let at = t;
    const lead = e.querySelector(':scope > .bp-lead');
    if (lead) {
      const ln = lead.querySelector('path'), dot = lead.querySelector('circle');
      if (dot) tl.fromTo(dot, { attr: { r: 0 } }, { attr: { r: 5 }, duration: .16, ease: 'back.out(3)', immediateRender: true }, t);
      if (ln) {
        const L = strokeLen(ln), off = () => { ln.style.strokeDasharray = ''; ln.style.strokeDashoffset = ''; };
        if (L) tl.fromTo(ln, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: clamp(L / 1400, .14, .34), ease: 'power1.out', immediateRender: true, onComplete: off, onInterrupt: off }, t + .08);
        at = t + .08 + clamp(L / 1400, .14, .34) * .8;
      }
    }
    tl.fromTo(e, { '--bp-cl': '0deg' }, { '--bp-cl': '360deg', duration: .36, ease: 'power2.out', immediateRender: true }, at);
    const n = e.querySelector(':scope > .bp-ball-n');
    let end = at + .36;
    if (n) end = Math.max(end, at + .18 + popIn(tl, n, at + .18, .26));
    tl.call(back, null, end);
    return end - t;
  }
  /* 尺寸标注：尺寸界线往下伸 → 尺寸线从中间往两头伸 → 数值写出来 */
  function dimIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    tl.fromTo(e, { '--bp-ex': 0 }, { '--bp-ex': 1, duration: .22, ease: 'power2.out', immediateRender: true }, t);
    tl.fromTo(e, { '--bp-dl': 0 }, { '--bp-dl': 1, duration: .28, ease: 'power2.out', immediateRender: true }, t + .16);
    let end = t + .44;
    const lab = e.querySelector(':scope > b');
    if (lab) end = Math.max(end, t + .36 + scribeIn(tl, lab, t + .36, { dur: .24 }));
    tl.call(back, null, end);
    return end - t;
  }
  /* 流程箭头：线从左往右伸出去，箭头跟着走到头 */
  function arrowIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    const d = clamp((e.offsetWidth || 120) / 600, .16, .32);
    tl.fromTo(e, { '--bp-ar': 0 }, { '--bp-ar': 1, duration: d, ease: 'power1.inOut', immediateRender: true }, t);
    tl.call(back, null, t + d);
    return d;
  }
  /* 修订云线：云线从 12 点钟方向绕一圈圈住问题，里面的字随后写出来 */
  function cloudIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    tl.fromTo(e, { '--bp-cl': '0deg' }, { '--bp-cl': '360deg', duration: .46, ease: 'power1.inOut', immediateRender: true }, t);
    let end = t + .46;
    kidsOf(e).forEach((c, i) => { const s = t + .12 + i * .1; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .3 })); });
    tl.call(back, null, end);
    return end - t;
  }
  /* 修订三角：弹出来 */
  function revIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    const d = popIn(tl, e, t, .32);
    tl.call(back, null, t + d + .01);
    return d;
  }
  /* 圆规圈：圆规的一条腿绕着转一圈、圆从 12 点钟方向画出来，里面的字再写出来 */
  function ringIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    tl.fromTo(e, { '--bp-cl': '0deg', '--bp-arm': 1 }, { '--bp-cl': '360deg', duration: .7, ease: 'power1.inOut', immediateRender: true }, t);
    tl.to(e, { '--bp-arm': 0, duration: .2, ease: 'power1.out' }, t + .7);
    let end = t + .9;
    kidsOf(e).forEach((c, i) => { const s = t + .42 + i * .12; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .42 })); });
    tl.call(back, null, end);
    return end - t;
  }
  /* 明细表的一行：一道浅青扫线顺着这一行划过去，序号圈弹出来，各格从左往右一格格写上 */
  function rowIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    tl.fromTo(e, { '--bp-sw': 0, '--bp-so': 1 }, { '--bp-sw': 1, duration: .42, ease: 'power1.inOut', immediateRender: true }, t);
    tl.to(e, { '--bp-so': 0, duration: .24, ease: 'power1.out' }, t + .42);
    let end = t + .66;
    const no = e.querySelector(':scope > .bp-no');
    if (no) end = Math.max(end, t + popIn(tl, no, t, .28));
    kidsOf(e).filter(c => c !== no).forEach((c, i) => { const s = t + .1 + i * .1; end = Math.max(end, s + scribeIn(tl, c, s, { dur: .26 })); });
    tl.call(back, null, end);
    return end - t;
  }
  /* 一个容器里放了几样蓝图组件（修订条 .bp-fix）：按书写顺序一样接一样出来，前一样做到一半下一样就开始 */
  function chainIn(tl, e, t, vis) {
    const back = showAt(tl, e, t, vis);
    let c = t, end = t;
    kidsOf(e).forEach(k => {
      const d = compIn(tl, k, c, false);
      const dd = d >= 0 ? d : scribeIn(tl, k, c, { dur: .3 });
      end = Math.max(end, c + dd);
      c += Math.max(.1, dd * .55);
    });
    tl.call(back, null, end);
    return end - t;
  }
  /* 按类名分派；不是蓝图组件时返回 -1 */
  function compIn(tl, e, t, vis) {
    if (!isA(e, COMP)) return -1;
    if (isA(e, '.bp-fig')) return figIn(tl, e, t, vis);
    if (isA(e, '.bp-tblock')) return tblockIn(tl, e, t, vis);
    if (isA(e, '.bp-box, .bp-ok')) return frameIn(tl, e, t, vis);
    if (isA(e, '.bp-ball')) return ballIn(tl, e, t, vis);
    if (isA(e, '.bp-dim')) return dimIn(tl, e, t, vis);
    if (isA(e, '.bp-arrow')) return arrowIn(tl, e, t, vis);
    if (isA(e, '.bp-cloud')) return cloudIn(tl, e, t, vis);
    if (isA(e, '.bp-rev')) return revIn(tl, e, t, vis);
    if (isA(e, '.bp-ring')) return ringIn(tl, e, t, vis);
    if (isA(e, '.bp-tr')) return rowIn(tl, e, t, vis);
    return chainIn(tl, e, t, vis);
  }

  /* 建页时补全组件（decorate）：编号圈的引出线、云线里的字包一层、注释小字标上 data-small */
  function buildLead(b) {
    if (b.querySelector(':scope > .bp-lead')) return;
    if (!b.querySelector(':scope > .bp-ball-n')) {
      const n = document.createElement('span');
      n.className = 'bp-ball-n';
      while (b.firstChild) n.appendChild(b.firstChild);
      b.appendChild(n);
    }
    if (b.dataset.to == null) return;
    const to = String(b.dataset.to).split(',').map(Number), L = parseFloat(b.style.left), T = parseFloat(b.style.top);
    if (to.length !== 2 || !to.every(Number.isFinite) || !Number.isFinite(L) || !Number.isFinite(T)) {
      console.warn(`[Deck] 编号圈的引出线画不出来：data-to 要写成 "x,y"（舞台坐标），圈的 left、top 要用 px 写在 style 里`, b);
      return;
    }
    const R = 32, tx = f1(to[0] - L), ty = f1(to[1] - T), dx = tx - R, dy = ty - R, len = Math.hypot(dx, dy) || 1;
    const sx = f1(R + dx / len * R), sy = f1(R + dy / len * R);
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'bp-lead');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<path d="M${tx} ${ty}L${sx} ${sy}"/><circle cx="${tx}" cy="${ty}" r="5"/>`;
    b.appendChild(s);
  }
  function wrapCloud(c) {
    if (c.querySelector(':scope > .bp-cloud-t')) return;
    const b = document.createElement('b');
    b.className = 'bp-cloud-t';
    while (c.firstChild) b.appendChild(c.firstChild);
    c.appendChild(b);
  }
  function decorateComps(slide) {
    slide.querySelectorAll('.bp-ball').forEach(buildLead);
    slide.querySelectorAll('.bp-cloud').forEach(wrapCloud);
    slide.querySelectorAll('.bp-c > i, .bp-th > *, .bp-box > .bp-no').forEach(x => x.setAttribute('data-small', ''));
  }

  /* =================================================================
     图签栏（可选）：页面里的 <div class="bp-titleblock" data-speaker="…"></div> 填成贴着图框右下角的一条
     ================================================================= */
  const cut = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  function fillTitleBlock(tb, p) {
    if (tb.classList.contains('bp-on')) return;
    const name = cut(p && p.def ? (p.def.topic || p.def.title) : '', 9) || '—';
    const who = cut(tb.dataset.speaker, 5) || '—';
    const total = p && p.total ? p.total : 0;
    tb.classList.add('bp-on');
    tb.setAttribute('data-small', '');
    tb.innerHTML = `<span class="bp-tb-c"><i>图名</i><b>${esc(name)}</b></span>`
      + `<span class="bp-tb-c"><i>讲者</i><b>${esc(who)}</b></span>`
      + `<span class="bp-tb-c bp-tb-chk"><i>审核</i><b></b></span>`
      + `<span class="bp-tb-c"><i>装配</i><b>${total ? `<i class="bp-tb-now"></i> / ${total}` : '—'}</b></span>`;
  }

  /* =================================================================
     悬停：十字准线跟着鼠标走，写进鼠标下面那个零件（和它外面的零件）的 --bp-mx --bp-my，每帧最多写一次
     ================================================================= */
  let onMove = null, raf = 0, last = null;
  function track() {
    raf = 0;
    const ev = last; last = null;
    if (!ev || !ev.target || !ev.target.closest) return;
    for (let n = ev.target.closest(HOVER); n; n = n.parentElement && n.parentElement.closest(HOVER)) {
      if (!n.closest('.slide.active[data-scene="blueprint"]')) return;
      const r = n.getBoundingClientRect(), k = (r.width / (n.offsetWidth || r.width)) || 1;
      n.style.setProperty('--bp-mx', Math.round((ev.clientX - r.left) / k) + 'px');
      n.style.setProperty('--bp-my', Math.round((ev.clientY - r.top) / k) + 'px');
    }
  }

  /* 双线图框和分区刻度（背景层里的内联 SVG；几何和 blueprint.css 的 --bp-frame 一致） */
  const TICKS = [240, 480, 720, 1200, 1440, 1680].map(x => `M${x} 6V16M${x} 1064V1074`).join('') + [270, 810].map(y => `M6 ${y}H16M1904 ${y}H1914`).join('');
  const FRAME = `<svg class="bp-frame" viewBox="0 0 1920 1080" fill="none" aria-hidden="true">`
    + `<rect x="6" y="6" width="1908" height="1068" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`
    + `<rect x="16" y="16" width="1888" height="1048" stroke="#fff" stroke-opacity=".88" stroke-width="3"/>`
    + `<path class="bp-ft" stroke="#A6F4FF" stroke-opacity=".8" stroke-width="2" d="${TICKS}"/>`
    + `<path class="bp-ft" stroke="#fff" stroke-opacity=".9" stroke-width="3" d="M960 6V16M960 1064V1074M6 540H16M1904 540H1914"/></svg>`;

  Deck.scene('blueprint', {
    label: '蓝图',
    family: 'hand',
    dark: true,
    mascot: 'quanquan',
    enter: 'build',
    titleIn: 'build',
    recede: .8,
    // 线稿是白线、几乎是直的（制图），投影上要粗；斜线涂色的线宽 2.2（blueprint.css 按它认出填充线、改成浅青）；圈注是橙色粗线
    rough: { strokeWidth: 3.2, roughness: .75, bowing: .6, hachureGap: 9, hachureAngle: -45, fillWeight: 2.2, markWidth: 4.4, markRoughness: 1.1, markBowing: .9 },
    fx: FX,

    /* 背景层：双线图框和分区刻度，按舞台坐标放（网格和底色在 blueprint.css 的 --scene-bg） */
    backdrop(layer) { layer.insertAdjacentHTML('beforeend', FRAME); },

    // 每页建好后：页面放了图签栏就填上内容；自有组件补上引出线、包好云线里的字、注释小字标 data-small
    decorate(slide, p) {
      slide.querySelectorAll('.bp-titleblock').forEach(tb => fillTitleBlock(tb, p));
      decorateComps(slide);
    },

    // 剖面线（.bp-fig 的 class="h"）：45° 浅青斜线
    defs: '<pattern id="bp-hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">'
      + '<path d="M0 5.5H11" stroke="#A6F4FF" stroke-opacity=".75" stroke-width="2"/></pattern>',

    // 同一拍里先把线稿描完，再出零件和字；
    // 蓝图组件按画图的先后：先伸流程箭头，再描框、拉编号圈，最后伸尺寸线、填明细表的一行
    plan(units, { base, drawDur }) {
      const at = new Map();
      let t = 0;
      units.forEach(u => { if (u.el instanceof SVGElement && !u.child && u.fx === 'draw') { at.set(u, base + t); t += drawDur(u.el) * .7; } });
      const shift = Math.min(t, .45);
      const rank = u => u.child || u.el.dataset.in ? -1 : isA(u.el, '.bp-arrow') ? 0 : isA(u.el, '.bp-dim, .bp-tr') ? 2 : isA(u.el, COMP) ? 1 : -1;
      const ranks = units.map(rank), has = r => ranks.includes(r);
      const off = [0, has(0) ? .24 : 0, (has(0) ? .24 : 0) + (has(1) ? .4 : 0)];
      const seen = [0, 0, 0];
      return units.map((u, i) => {
        if (at.has(u)) return at.get(u);
        const r = ranks[i];
        if (r < 0) return base + shift + u.start;
        return base + shift + off[r] + (seen[r]++) * .12 + (parseFloat(u.el.dataset.delay) || 0);
      });
    },

    /* 退一拍：零件往来的方向滑回去（引擎同时把这一拍的块淡出） */
    onBack({ tl, units }) {
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement || !isPart(e)) return;
        const slide = e.closest('.slide'), b = slide ? boxIn(e, slide) : { l: 0, w: 0 };
        tl.to(e, { x: (b.l + b.w / 2 > W / 2 + 40 ? 1 : -1) * 70, duration: .26, ease: 'power2.in' }, 0);
      });
      return { at: 0, gap: .04, y: 0, dur: .26 };
    },

    /* 同风格翻页：图纸横移。两张图纸临时带上晒图纸底和图框（.bp-sheet），新的一张从一侧整张推进来盖住旧的，
       旧的一张往另一侧让开一点；推完去掉底色，和背景层的网格、图框严丝合缝 */
    pageTurn({ tl, from, to, dir, retire, clear: wipe }) {
      const o = from.el, n = to.el;
      o.classList.add('bp-sheet'); n.classList.add('bp-sheet');
      n.style.setProperty('--bp-sd', dir > 0 ? '-22px' : '22px');
      n.style.zIndex = 2;
      const endNew = () => { n.classList.remove('bp-sheet'); n.style.removeProperty('--bp-sd'); n.style.zIndex = ''; };
      const endOld = () => { o.classList.remove('bp-sheet'); retire(); if (G) G.set(o, { clearProps: 'transform' }); };
      tl.to(o, { x: -260 * dir, duration: .62, ease: 'power3.inOut', onComplete: endOld, onInterrupt: endOld }, 0);
      tl.fromTo(n, { x: W * dir, autoAlpha: 1 }, { x: 0, duration: .62, ease: 'power3.inOut', immediateRender: true, onComplete: () => { endNew(); wipe(n); }, onInterrupt: endNew }, 0);
      return .42;
    },

    /* 「已复制」：审图章盖下来——抬高、斜着砸下、回弹，印泥往外洇一圈，铭牌被压得一沉。
       页面放了图签栏（而且看得见）时，章盖在「审核」格里；不然留在引擎找好的命令旁边。复制失败是引擎的红条，只淡入 */
    copied({ tl, tip, node, ok }) {
      if (!ok) { tl.fromTo(tip, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, ease: 'power1.out' }, 0); return; }
      const slide = tip.closest('.slide'), cell = slide && slide.querySelector('.bp-titleblock.bp-on .bp-tb-chk');
      if (cell && cell.offsetWidth) {
        tip.classList.add('bp-in-tb');
        // 盖在「审核」两个字右边的空格里（不压住格名）
        const b = boxIn(cell, slide), lab = cell.querySelector('i'), lb = lab ? boxIn(lab, slide) : null;
        const tw = tip.offsetWidth, th = tip.offsetHeight;
        tip.style.left = f1(clamp(lb ? lb.l + lb.w + 8 : b.l + b.w / 2 - tw / 2, 10, W - tw - 14)) + 'px';
        tip.style.top = f1(b.t + b.h / 2 - th / 2) + 'px';
      }
      tl.fromTo(tip, { autoAlpha: 0, scale: 1.9, rotation: -18, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: .94, rotation: -8, duration: .2, ease: 'power3.in' }, 0)
        .to(tip, { scale: 1, duration: .24, ease: 'back.out(3)' }, .2)
        .fromTo(tip, { '--bp-ink': 1 }, { '--bp-ink': 0, duration: .5, ease: 'power2.out', immediateRender: false }, .2);
      if (node && node.matches && node.matches('.copy')) {
        const off = () => clear(node, ['--bp-press']);
        tl.to(node, { keyframes: [{ '--bp-press': 1, duration: .05, ease: 'power2.out' }, { '--bp-press': 0, duration: .26, ease: 'back.out(3)' }], onComplete: off, onInterrupt: off }, .19);
      }
    },

    /* 开场（不带拍号打开时第一页用，约 1.3 秒）：图框一笔描出来、刻度亮起 → 外框和主题行落下 → 大标题写出、基线画出 →
       第 0 拍依次出场 → 重点词画上双下划线。返回总时长，引擎随后让形象从上面落下 */
    intro({ tl, page } = {}) {
      if (still() || !tl) return 0;
      let end = 0;
      const fr = document.querySelector('.bg[data-scene="blueprint"] .bp-frame');
      if (fr) {
        [...fr.querySelectorAll('rect')].forEach((r, i) => {
          let L = 0;
          try { L = Math.ceil(r.getTotalLength()) + 4; } catch (err) { L = 0; }
          if (!L) return;
          const off = () => { r.style.strokeDasharray = ''; r.style.strokeDashoffset = ''; };
          tl.fromTo(r, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .75, ease: 'power2.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, i * .08);
        });
        const ticks = [...fr.querySelectorAll('.bp-ft')];
        tl.fromTo(ticks, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: () => ticks.forEach(x => clear(x, ['opacity'])) }, .55);
        end = .85;
      }
      const el = page && (page.el || (page.nodeType === 1 ? page : null));
      if (!el) return end;
      const stage = el.closest('#stage');
      [stage && stage.querySelector(':scope > .chrome'), el.querySelector(':scope > .s-topic'), el.querySelector('.bp-titleblock.bp-on')].filter(Boolean).forEach((x, i) => {
        tl.fromTo(x, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out', immediateRender: true, onComplete: () => clean(x) }, .18 + i * .06);
      });
      const title = el.querySelector(':scope > .s-title');
      if (title) end = Math.max(end, .26 + titleIn(tl, title, .26));
      // 第 0 拍：只取最外层的，形象由引擎管
      const blocks = [...el.querySelectorAll('[data-beat]')].filter(b => (parseInt(b.dataset.beat, 10) || 0) === 0
        && !b.matches(SKIP) && !(b.parentElement && b.parentElement.closest('[data-beat]')));
      blocks.forEach((b, i) => {
        const t = (title ? .5 : .3) + i * .12 + (parseFloat(b.dataset.delay) || 0);
        end = Math.max(end, t + runFx(tl, b, t));
      });
      const keys = [...el.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      if (keys.length) {
        const at = Math.max(.7, end - .15);
        tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, at);
        end = Math.max(end, at + .45);
      }
      return end;
    },

    /* 点击处画一个圆规圈（坐标是舞台坐标，layer 在内容下面）：圆心十字先出，细圈从 12 点钟方向描一圈，再淡掉 */
    ripple(x, y, layer) {
      if (still() || !layer) return;
      [...layer.querySelectorAll(':scope > .bp-rip')].slice(0, -4).forEach(n => n.remove());
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', 'bp-rip');
      s.setAttribute('viewBox', '0 0 150 150');
      s.style.left = (x - 75) + 'px'; s.style.top = (y - 75) + 'px';
      s.innerHTML = '<path d="M66 75H84M75 66V84"/><path d="M75 75L113 53" stroke-dasharray="5 4"/><circle cx="75" cy="75" r="44" transform="rotate(-90 75 75)"/>';
      layer.appendChild(s);
      const c = s.querySelector('circle'), L = Math.ceil(2 * Math.PI * 44) + 2;
      G.timeline({ onComplete: () => s.remove() })
        .fromTo(s, { opacity: 0 }, { opacity: 1, duration: .08, ease: 'none' }, 0)
        .fromTo(c, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .45, ease: 'power2.out' }, 0)
        .to(s, { opacity: 0, duration: .4, ease: 'power1.in' }, .42);
    },

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
      { x: 1340, y: 20, w: 516, h: 60, name: '页码和装配步骤' },
    ],
  });
})();
