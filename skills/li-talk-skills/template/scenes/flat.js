/* =====================================================================
   风格 · 扁平插画 flat（现代家）
   - 样子：统一左上受光的几何扁平插画。暖白底、墨蓝字，强调色只有珊瑚、明黄，加上墨蓝一共三组，每组浅 / 本 / 深三级；
     每个组件右下露出一条深一级的暗部、左上一道浅一级的亮边、投影落向右下（同色相半透明深色，不模糊）。
     字用系统黑体（粗），命令用等宽字。没有滤镜和模糊，最省性能
   - 适合讲：上手教程、产品介绍、流程步骤、新人或非技术听众。不适合：大段代码、数据图表、严肃汇报
   - 默认形象：小页 xiaoye（围黄围巾的几何小狐狸；朝左时自己画镜像，仍然左上受光）
   - 来源：定稿样页 06-扁平插画.html。从样页搬过来的效果，以及改成对任意页面都成立的写法：
     1. 受光规矩：样页只在插画、徽标、命令胶囊、节拍胶囊上画了暗部、亮边、投影。样页每拍的插画
        （本子、色卡扇、网页窗口）是那一页专用的，不搬；这里把同一套光影画到通用组件上（flat.css）：
        卡片、小格、终端、截图位是受光的色面（截图位做成一扇网页窗口），步骤的序号是受光的圆片徽标
        （珊瑚、明黄、墨蓝轮换，横排时每步垫一块浅色色面，就是样页每一步的大色面），
        命令是样页的墨蓝胶囊，标签和「已复制」是明黄贴纸，左右对比中间是一枚明黄圆片
     2. 背景（backdrop）：样页右上角两圈受光的明黄大圆、左下角珊瑚大圆和一小片点阵，外加左右页边各一件
        漂浮的小几何（明黄四角星、珊瑚十字，取自样页色面里的装饰）。样页写死在舞台上；这里放进铺满窗口的背景层，
        贴着窗口的角和边放，宽屏、窄屏都在边上
     3. 色面展开（unfold，新增的出场名）：样页每一步的大色面从中间一颗胶囊展开成圆角大块、带一点回弹，
        里面的零件随后依次弹出。这里卡片、小格、终端、截图位、横排步骤用它：组件从一颗胶囊展开，
        里面的字依次弹起，步骤的序号徽标转着弹出（推 --fl-bs）；一排卡片的容器（.cells、.grid……）整拍出场时，
        里面的组件依次展开
     4. 弹起（spring，默认出场）：样页标题、说明的做法——从下面弹上来，带一点回弹
     5. 逐字弹起（chars，大标题和金句的出场）：样页开场时标题一个字一个字转着弹起来；
        这里对任意标题成立：字临时拆开，播完拆回原样，里面的重点词当一个字
     6. 贴纸弹出（slap，命令和标签的出场）：样页命令胶囊从左边弹出来的做法
     7. 重点词：底下弹出一块明黄圆角色块（下沿深一级），右上角迸出三道珊瑚短线。样页用脚本推每个零件；
        这里全写在 CSS 里，跟着引擎本来就会推的 --k 走（flat.css），回弹按 --k 算出来
     8. 「已复制」（copied）：明黄贴纸胶囊歪着拍上来再摆正、对勾描出来、一道斜的亮条扫过命令、
        后面迸出几何纸屑（圆、方、三角、短条）。样页的提示位置写死；这里用引擎找好的位置，纸屑从提示后面迸出
     9. 节拍指示：白色受光胶囊里一排进度条，讲过的浅珊瑚、当前的珊瑚拉长；换拍时当前那段竖着弹一下、
        拍号从下面顶上来（flat.css，只播一次）
     10. 悬停：受光的组件朝光源（左上）抬起一点、投影变长；命令胶囊变亮、图标歪一下；按下时压下去、投影变短。
         全用 CSS 的 :hover / :active 做，不用挂监听，所以没有 mount / unmount
     11. 点击涟漪（ripple）：一圈很淡的珊瑚圆环加三颗小圆点迸开（样页原样）
     12. 开场（intro）：背景大圆弹开、点阵一颗颗冒出、漂浮小几何转着弹出 → 主题行滑入、节拍胶囊落下 →
         大标题逐字弹起 → 第 0 拍依次跟上 → 重点词色块弹出（样页的开场顺序）
     13. 退一拍（onBack）：色面缩一下、序号徽标收回去，引擎同时把这一拍淡出（样页是整段倒放）
     14. 同风格翻页（pageTurn）：旧页往一边滑走淡出，新页从另一边带一点回弹滑进来
   - 没搬的：插画四层随鼠标错开的视差、背景视差（这一版不做视差）；每拍专用的插画；
     形象的走位、反应、空闲动作和打盹（引擎的形象部分统一做）
   - 自己加的出场名：spring、unfold、chars、slap，以及下面版式组件用的 flpop、fltag、flnum、flflip、flbubble，
     只在这个风格里认（别的风格会提醒并换成它的默认出场）。页面里不用写，组件按类名、所在位置自动选
   - 扁平插画自己的版式组件（.fl-*，只在这个风格里有样子；样板页 samples/flat.js 把每个都用了一遍，整段抄过去改字就行）。
     每拍「发生了什么」是信息图里的事：东西从台面上弹起来、标签牌挂上去晃两下、色块铺开、图标翻面、大数字滚上去：
     · .fl-art[data-fl-art="名字"]：插画零件（这里画好，建页时填进去）。内置 gaiwan 盖碗、tin 茶叶罐、kettle 水壶、steam 热气、
       spark / plus / ring 小装饰，以及「泡茶三步」那一套 brew-bowl、brew-steam、brew-leaves、brew-tea、brew-kettle（叠在同一个位置，每拍加一层）。
       宽度写在 style 的 width 里，高度按画布比例自己算；出场按零件：弹跳出现、掉进来、冒上来、铺开、摆进来。零件里不放字
     · .fl-wall + .fl-shelf：场景墙面（圆角大色面，右上一个受光圆，从胶囊展开）和台面（明黄木板，从左往右铺开）
     · .fl-tag：标签牌（挂在钉子上的一块浅色牌，里面 <b class="fl-no">1</b><h3>名字</h3><p>说明</p>）。
       style 写 --fl-str（绳子长，默认 64px），钉子在牌子正上方那么远；到拍时钉子弹出、绳子垂下、牌子荡进来晃两下
     · .fl-badge[data-fl-icon]：圆片徽标（受光的圆片里一个单色图标，颜色类换组，--s 是直径）；转着弹出来
     · .fl-blob：一块圆色块（颜色类换组），从中心铺开
     · ol.fl-check > li：竖排清单（<li><b>标题</b><span>说明</span></li>），序号是受光的圆片（珊瑚、明黄、墨蓝轮换），
       相邻两行的序号之间一根连线；到拍时整行滑进来、序号转着弹出、连线垂下来
     · .fl-row > .fl-flip + .fl-bad + .fl-track + .fl-pill：一条胶囊横条（坑 → 办法）。.fl-flip 里放两个 .fl-face[data-fl-icon]：
       不带拍的是正面（珊瑚圆片、角上一个叉），带拍的是背面（明黄圆片、角上一个勾）；到拍时图标翻面，箭头轨道 .fl-track 伸出来，
       办法 .fl-pill 贴上去。坑那一行字 .fl-bad 第 0 拍就在、一直留着
     · .fl-num：数字大卡（颜色类换组）。里面 <i data-fl-icon> 角上的图标、<p class="fl-big"><b class="fl-n">80</b><small>℃</small></p>、
       <h3>标签</h3>、<p>一行说明</p>。到拍时弹起来、厚度长出来、大数字从 0 滚上去；讲过的大卡落回一点（厚度变小），不变淡
     · .fl-bubble > p：大气泡（白色，右下角一个尾巴，--fl-tx 是尾巴离右边多远）；从胶囊铺开，句子逐字弹起
     · .fl-hero：封面大字（逐字弹起）；.fl-pill：受光的胶囊（讲者、致谢、办法，颜色类换组；贴纸弹出）
     可读性约定见下面「扁平插画自己的版式组件」一节开头
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍胶囊（.meta 在这里改到 top 20，胶囊高 56：y 20–76，和主题行同一条中线；
       按每页最多 4 拍量，留出余量后是 x 1340–1856、y 12–84）
   - 样子在 flat.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const rand = (a, b) => a + Math.random() * (b - a);
  /* 受光的色面组件；横排步骤的每一步也是一块色面 */
  const FACE = '.card, .cell, .term, .shot, .steps.h > li';
  const STEP = '.steps > li';
  /* 出场时不跟着动的子元素（形象、圈注层、涟漪层、提示） */
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
  /* 默认出场按组件类名分：色面组件和装着它们的容器「色面展开」，命令和标签「贴纸弹出」，金句「逐字弹起」，其余「弹起」；
     后半截是扁平插画自己的版式组件（.fl-*，见文件末尾「扁平插画自己的版式组件」一节）：插画零件、圆片徽标、色块、台面、箭头轨道「弹跳出现」，
     标签牌「挂上」、数字大卡「弹起」、翻面图标「翻面」、大气泡「铺开」、场景墙面「色面展开」、封面大字「逐字弹起」、胶囊「贴纸弹出」 */
  const BY = { card: 'unfold', cell: 'unfold', term: 'unfold', shot: 'unfold', cells: 'unfold', steps: 'unfold', grid: 'unfold', row: 'unfold', col: 'unfold', vs: 'unfold', copy: 'slap', tag: 'slap', quote: 'chars',
    'fl-art': 'flpop', 'fl-badge': 'flpop', 'fl-blob': 'flpop', 'fl-shelf': 'flpop', 'fl-track': 'flpop', 'fl-tag': 'fltag', 'fl-num': 'flnum',
    'fl-face': 'flflip', 'fl-bubble': 'flbubble', 'fl-wall': 'flpop', 'fl-hero': 'chars', 'fl-pill': 'slap' };
  const PROPS = ['opacity', 'visibility', 'transform', 'transform-origin', 'translate', 'rotate', 'scale', 'clip-path', '--fl-bs', '--fl-cn', '--fl-lift', '--fl-pn', '--fl-sl', '--fl-ck'];
  /* 色面展开：从中间一颗胶囊，到比组件四周再大一圈（连右下的投影一起露出来，播完清掉时不会跳一下） */
  const CLIP0 = 'inset(42% 38% 42% 38% round 999px)', CLIP1 = 'inset(-12% -6% -18% -6% round 40px)';

  const isFace = e => !!(e && e.matches && e.matches(FACE));
  const isStep = e => !!(e && e.matches && e.matches(STEP));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子（只给节拍单元本身用） */
  const clean = e => PROPS.forEach(k => e.style.removeProperty(k));
  /* 子元素不归引擎管：记下原来的行内样式，播完原样还原 */
  const keep = e => { const s = e.getAttribute('style'); return () => { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }; };
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));

  /* 弹起：从下面弹上来，带一点回弹。o = { vis（节拍单元本身：连 visibility 一起管）, tilt, y, dur, restore（子元素：播完还原） } */
  function springIn(tl, e, t, o) {
    const dur = o.dur || .45, done = o.restore || (() => clean(e));
    const from = { y: o.y == null ? 30 : o.y }, to = { y: 0, duration: dur, ease: 'back.out(1.6)', immediateRender: true, onComplete: done, onInterrupt: done };
    if (o.vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    if (o.tilt) { from.rotation = o.tilt; to.rotation = o.tilt; }
    tl.fromTo(e, from, to, t);
    return dur;
  }
  /* 步骤的序号徽标转着弹出（推 --fl-bs：flat.css 按它算徽标的大小和转角） */
  function badgeIn(tl, li, t) {
    const off = () => li.style.removeProperty('--fl-bs');
    tl.fromTo(li, { '--fl-bs': 0 }, { '--fl-bs': 1, duration: .45, ease: 'back.out(2.4)', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    return .45;
  }
  /* 一块色面展开：从胶囊展开成圆角色面、带一点回弹，里面的字随后依次弹起；是步骤的话序号徽标转着弹出。
     o = { vis（节拍单元本身）, tilt } */
  function faceIn(tl, e, t, o) {
    const back = o.vis ? null : keep(e);
    const done = () => { if (back) back(); else clean(e); };
    const tilt = o.tilt || 0;
    if (o.vis) tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none', immediateRender: true }, t);
    else tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: .12, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { clipPath: CLIP0 }, { clipPath: CLIP1, duration: .46, ease: 'power3.out', immediateRender: true }, t);
    tl.fromTo(e, { scale: .92, rotation: tilt }, { scale: 1, rotation: tilt, duration: .55, ease: 'back.out(1.8)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    let end = .55;
    if (isStep(e)) end = Math.max(end, .16 + badgeIn(tl, e, t + .16));
    kidsOf(e).forEach((c, i) => {
      const s = .2 + i * .06;
      end = Math.max(end, s + springIn(tl, c, t + s, { y: 24, dur: .42, restore: keep(c) }));
    });
    return Math.min(end, 1);
  }
  /* 一个步骤：横排的是一块色面，竖排的整行弹起、序号徽标转着弹出 */
  function stepIn(tl, li, t, o) {
    if (isFace(li)) return faceIn(tl, li, t, o);
    const d = springIn(tl, li, t, { vis: o.vis, y: 24, tilt: o.tilt, restore: o.vis ? null : keep(li) });
    return Math.max(d, .06 + badgeIn(tl, li, t + .06));
  }
  /* 贴纸弹出：从左边一点弹出来，略歪着摆正（样页的命令胶囊） */
  function slapIn(tl, e, t, o) {
    const done = o.restore || (() => clean(e)), tilt = o.tilt || 0;
    const from = { y: 22, scale: .72, rotation: tilt - 6, transformOrigin: '0% 50%' }, to = { y: 0, scale: 1, rotation: tilt, duration: .5, ease: 'back.out(2.2)', immediateRender: true, onComplete: done, onInterrupt: done };
    if (o.vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    return .5;
  }

  /* 色面展开（出场 unfold）：色面组件自己展开；装着色面、步骤的容器先亮出来，里面的依次展开；别的元素弹起 */
  function unfold(tl, e, t, ctx) {
    const tilt = ctx && ctx.tilt ? ctx.tilt() : 0;
    if (e instanceof SVGElement) return springIn(tl, e, t, { vis: true, y: 0, dur: .4 });
    if (isStep(e)) return stepIn(tl, e, t, { vis: true, tilt });
    if (isFace(e)) return faceIn(tl, e, t, { vis: true, tilt });
    const kids = kidsOf(e);
    if (kids.some(c => isFace(c) || isStep(c))) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, ease: 'power1.out', immediateRender: true, onComplete: () => clean(e), onInterrupt: () => clean(e) }, t);
      let end = .2;
      kids.forEach((c, i) => {
        const s = .04 + i * .12;
        const d = isStep(c) ? stepIn(tl, c, t + s, {}) : isFace(c) ? faceIn(tl, c, t + s, {})
          : c.matches('.copy, .tag') ? slapIn(tl, c, t + s, { restore: keep(c) }) : springIn(tl, c, t + s, { restore: keep(c) });
        end = Math.max(end, s + d);
      });
      return Math.min(end, 1.15);
    }
    return springIn(tl, e, t, { vis: true, tilt });
  }

  /* 逐字弹起（大标题、金句）：直接写着的字临时拆成单字，一个个转着弹起来，播完拆回原样；里面的元素（如重点词）当一个字 */
  function split(e) {
    unsplit(e);
    const items = [], id = (e._flSplit = (e._flSplitN = (e._flSplitN || 0) + 1));
    [...e.childNodes].forEach(n => {
      if (n.nodeType === 1) { if (!n.matches(SKIP) && n.tagName !== 'BR') items.push(n); return; }
      if (n.nodeType !== 3 || !n.nodeValue) return;
      const frag = document.createDocumentFragment();
      // 连在一起的字母数字算一个「字」，免得英文单词被拆开换行
      (n.nodeValue.match(/[A-Za-z0-9_.'’-]+|\s+|[\s\S]/gu) || []).forEach(s => {
        if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(s)); return; }
        const sp = document.createElement('span'); sp.className = 'fl-ch'; sp.textContent = s;
        frag.appendChild(sp); items.push(sp);
      });
      n.replaceWith(frag);
    });
    return { items, id };
  }
  function unsplit(e, id) {
    if (!e._flSplit || (id != null && e._flSplit !== id)) return;
    e.querySelectorAll(':scope > span.fl-ch').forEach(sp => sp.replaceWith(document.createTextNode(sp.textContent)));
    e.normalize();
    e._flSplit = 0;
  }
  function chars(tl, e, t, ctx) {
    const tilt = ctx && ctx.tilt ? ctx.tilt() : 0;
    if (e instanceof SVGElement || !e.textContent.trim()) return springIn(tl, e, t, { vis: true, tilt });
    const { items, id } = split(e);
    if (!items.length) { unsplit(e, id); return springIn(tl, e, t, { vis: true, tilt }); }
    const n = items.length, gap = Math.min(.03, .45 / n), d = .5;
    const backs = items.filter(x => !x.classList.contains('fl-ch')).map(keep);
    const done = () => { backs.forEach(f => f()); unsplit(e, id); clean(e); };
    tl.fromTo(items, { opacity: 0, y: 50, rotation: 8 }, { opacity: 1, y: 0, rotation: 0, duration: d, ease: 'back.out(2.2)', stagger: gap, immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return d + gap * (n - 1);
  }

  /* =================================================================
     扁平插画自己的版式组件（.fl-*）：明亮的信息图。样子在 flat.css 末尾同名的一节，样板页 samples/flat.js 把每个都用了一遍。
     每拍「发生了什么」是信息图里的事：东西从台面上弹起来、标签牌挂上去晃两下、色块铺开、图标翻个面、大数字从 0 滚上去。
     这些动作都在组件里做好，页面只写结构和 data-beat，不写 onBeat、不写这里的出场名。
     可读性约定（组件就是按这几条做的）：
     · 插画、色块、徽标只是包装，真话写在旁边的标签牌、清单、胶囊里；插画零件里不放字
     · 讲过的不藏：标签牌、清单、胶囊、大卡讲完都留着；翻面图标只翻图标，坑和办法两行字一直在
     · 讲过的只退一点：引擎退到 .8；插画零件、翻面图标、数字大卡不退（它们是一张图的一部分），
       当前这张大卡靠「抬起来、厚度最大」强调，讲过的大卡落回一点，不变淡
     · 白字只压在深一档的颜色上（珊瑚大卡用 #E5503C，对比度 3.8:1）；大卡里不放重点词（明黄色块压在深色卡上看不清）
     ================================================================= */
  const SH = 'rgba(31,42,68,.12)';
  /* 水壶（扁平插画桌面、封面、泡茶三步共用）：墨蓝壶身朝左出水，明黄提手，珊瑚腰线；右边一条暗部、左边一道亮边 */
  const KETTLE = '<path d="M126 74C126 24 222 24 222 74" fill="none" stroke="var(--fl-sun-d)" stroke-width="16" stroke-linecap="round"/>'
    + '<path d="M124 74C124 28 216 28 216 74" fill="none" stroke="var(--fl-sun)" stroke-width="12" stroke-linecap="round"/>'
    + '<path d="M102 196L38 134Q30 126 38 118L48 112L114 160Z" fill="var(--fl-ink-d)"/>'
    + '<path d="M102 188L40 131Q33 124 40 118L48 113L112 158Z" fill="var(--fl-ink)"/>'
    + '<path d="M110 76Q112 64 126 64H222Q236 64 238 76L262 258Q264 272 250 272H98Q84 272 86 258Z" fill="var(--fl-ink)"/>'
    + '<path d="M202 64H222Q236 64 238 76L262 258Q264 272 250 272H228L216 70Q212 64 202 64Z" fill="var(--fl-ink-d)"/>'
    + '<path d="M104 246L119 92" fill="none" stroke="var(--fl-ink-l)" stroke-width="7" stroke-linecap="round"/>'
    + '<path d="M94.2 196H253.8L256.7 218H91.3Z" fill="var(--fl-coral)"/><path d="M221.5 196H253.8L256.7 218H222.8Z" fill="var(--fl-coral-d)"/>'
    + '<rect x="150" y="50" width="48" height="18" rx="8" fill="var(--fl-sun)"/><path d="M186 50H190Q198 50 198 58V60Q198 68 190 68H186Z" fill="var(--fl-sun-d)"/>';
  /* 盖碗的盖子（盖碗、泡茶三步里搁在一边的盖子共用；坐标以盖子底边中点为原点） */
  const LID = '<path d="M-76 0C-72-30-42-42 0-42C42-42 72-30 76 0Q0 12-76 0Z" fill="#fff"/>'
    + '<path d="M42-38C61-30 72-16 76 0Q64 4 50 5C50-13 47-27 42-38Z" fill="var(--fl-paper-d)"/>'
    + '<path d="M-71-12Q0 1 71-12L74-5Q0 9-74-5Z" fill="var(--fl-coral)"/><path d="M48-8Q61-10 71-12L74-5Q64-3 50-1Z" fill="var(--fl-coral-d)"/>'
    + '<path d="M-12-44H12L15-41H-15Z" fill="var(--fl-paper-d)"/><rect x="-15" y="-62" width="30" height="20" rx="8" fill="#fff"/><path d="M5-62H7Q15-62 15-54V-50Q15-42 7-42H5Z" fill="var(--fl-paper-d)"/>';
  const leaf = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-36 4C-24-12 8-17 36-5C16 12-14 15-36 4Z" fill="var(--fl-ink-l)"/><path d="M-36 4C-14 15 16 12 36-5C10 5-14 8-36 4Z" fill="var(--fl-ink)"/><path d="M-29 3Q0 0 29-4" fill="none" stroke="var(--fl-ink-d)" stroke-width="2.6" stroke-linecap="round"/></g>`;
  /* 插画零件 .fl-art[data-fl-art="名字"]：建页时把 SVG 填进去（decorate）。vb 是画布，fx 是出场的样子：
     pop 从台面上弹跳出现（默认）、drop 从上面掉进来弹两下、rise 热气从下往上冒、spread 从中心铺开、swing 从右上方摆进来（水流随后描出来）。
     brew-* 是「泡茶三步」那一套：画布都是 760×640，叠在同一个位置（left、top、width 写成一样），每拍加一层 */
  const ART = {
    // 盖碗：白瓷、珊瑚腰线，盖着盖子站在茶托上（底边贴着画布底）
    gaiwan: { vb: '0 50 300 220', svg:
      `<ellipse cx="166" cy="256" rx="126" ry="12" fill="${SH}"/>`
      + '<ellipse cx="150" cy="248" rx="128" ry="18" fill="var(--fl-paper-d)"/><ellipse cx="150" cy="242" rx="128" ry="17" fill="#fff"/>'
      + '<ellipse cx="158" cy="242" rx="70" ry="8" fill="var(--fl-ink-tl)"/>'
      + '<path d="M114 238L120 214H180L186 238Z" fill="var(--fl-paper-d)"/>'
      + '<path d="M46 122C50 186 96 220 150 220C204 220 250 186 254 122Z" fill="#fff"/>'
      + '<path d="M150 220C204 220 250 186 254 122H222C218 176 192 210 150 220Z" fill="var(--fl-paper-d)"/>'
      + '<path d="M50 150Q150 174 250 150L246 168Q150 192 54 168Z" fill="var(--fl-coral)"/><path d="M218 162Q238 157 250 150L246 168Q234 173 216 177Z" fill="var(--fl-coral-d)"/>'
      + '<path d="M40 122Q150 146 260 122V130Q150 156 40 130Z" fill="var(--fl-paper-d)"/>'
      + `<g transform="translate(150 124)">${LID}</g>` },
    // 茶叶罐：明黄罐身、墨蓝盖子，正面一枚白色圆标签印着一片茶叶
    tin: { vb: '0 0 220 270', svg:
      '<rect x="58" y="84" width="146" height="184" rx="20" fill="rgba(138,90,0,.16)"/>'
      + '<rect x="40" y="72" width="146" height="186" rx="20" fill="var(--fl-sun-d)"/><rect x="40" y="72" width="136" height="177" rx="20" fill="var(--fl-sun)"/>'
      + '<path d="M52 136V98Q52 86 64 86H112" fill="none" stroke="var(--fl-sun-l)" stroke-width="6" stroke-linecap="round"/>'
      + '<rect x="32" y="40" width="162" height="46" rx="14" fill="var(--fl-ink-d)"/><rect x="32" y="40" width="154" height="40" rx="14" fill="var(--fl-ink)"/>'
      + '<path d="M44 68V60Q44 52 52 52H92" fill="none" stroke="var(--fl-ink-l)" stroke-width="5" stroke-linecap="round"/>'
      + '<circle cx="109" cy="171" r="47" fill="var(--fl-sun-d)"/><circle cx="106" cy="168" r="46" fill="#fff"/>'
      + '<path d="M124 138C96 144 84 174 96 196C126 192 140 162 124 138Z" fill="var(--fl-ink)"/>'
      + '<path d="M99 190Q109 166 121 146" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' },
    // 水壶：壶嘴朝左，壶嘴上冒两缕白气
    kettle: { vb: '0 0 330 290', svg:
      `<ellipse cx="190" cy="280" rx="104" ry="9" fill="${SH}"/>${KETTLE}`
      + '<path d="M30 98q-12-14 0-28q12-14 0-28M56 92q-10-12 0-24q10-12 0-24" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>' },
    // 泡茶三步：揭了盖的盖碗站在茶托上，盖子搁在右边（第 0 拍就在）
    'brew-bowl': { vb: '0 0 760 640', svg:
      `<ellipse cx="356" cy="600" rx="234" ry="18" fill="${SH}"/><ellipse cx="688" cy="562" rx="80" ry="8" fill="${SH}"/>`
      + '<ellipse cx="330" cy="584" rx="236" ry="30" fill="var(--fl-paper-d)"/><ellipse cx="330" cy="574" rx="236" ry="28" fill="#fff"/>'
      + '<ellipse cx="344" cy="572" rx="130" ry="13" fill="var(--fl-ink-tl)"/>'
      + '<path d="M270 566L280 528H380L390 566Z" fill="var(--fl-paper-d)"/>'
      + '<path d="M126 330C132 452 218 532 330 532C442 532 528 452 534 330Z" fill="#fff"/>'
      + '<path d="M330 532C442 532 528 452 534 330H470C464 444 414 514 330 532Z" fill="var(--fl-paper-d)"/>'
      + '<path d="M135 384Q330 426 525 384L515 414Q330 458 145 414Z" fill="var(--fl-coral)"/><path d="M462 401Q498 394 525 384L515 414Q490 422 457 431Z" fill="var(--fl-coral-d)"/>'
      + '<ellipse cx="330" cy="330" rx="204" ry="42" fill="#fff"/><ellipse cx="330" cy="334" rx="184" ry="32" fill="var(--fl-ink-t)"/>'
      + '<path d="M146 334A184 32 0 0 1 514 334A184 20 0 0 0 146 334Z" fill="var(--fl-paper-d)"/>'
      + `<g transform="translate(676 556) rotate(-6)">${LID}</g>` },
    // 第 1 拍「温杯」：碗口冒出三缕热气（珊瑚浅色，暖的）
    'brew-steam': { vb: '0 0 760 640', fx: 'rise', svg:
      '<path d="M228 298q-20-26 0-52q20-26 0-52q-20-26 0-46M282 290q-20-26 0-52q20-26 0-52q-20-26 0-52q20-26 0-36M336 298q-20-26 0-52q20-26 0-52" fill="none" stroke="var(--fl-coral-l)" stroke-width="13" stroke-linecap="round"/>' },
    // 第 2 拍「投茶」：五片茶叶掉进碗里
    'brew-leaves': { vb: '0 0 760 640', fx: 'drop', svg:
      leaf(244, 336, -12, 1) + leaf(314, 324, 16, 1.05) + leaf(382, 340, -6, 1) + leaf(436, 328, 26, .9) + leaf(292, 349, -28, .85) },
    // 第 3 拍「注水」：碗里的茶汤从中心铺开（远的一边深一级、左边一道亮光）
    'brew-tea': { vb: '0 0 760 640', fx: 'spread', svg:
      '<ellipse cx="330" cy="336" rx="178" ry="29" fill="var(--fl-sun-l)"/>'
      + '<path d="M152 336A178 29 0 0 1 508 336A178 18 0 0 0 152 336Z" fill="var(--fl-sun)"/>'
      + '<ellipse cx="262" cy="343" rx="58" ry="8" fill="var(--fl-sun-tl)"/>' },
    // 第 3 拍「注水」：水壶从右上方摆进来，斜着往碗里倒水（.fl-stream 是水流，摆好后描出来）
    'brew-kettle': { vb: '0 0 760 640', fx: 'swing', pivot: '76% 26%', svg:
      '<path class="fl-stream" d="M420 200C406 236 386 272 368 326" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round"/>'
      + '<path class="fl-stream" d="M420 200C406 236 386 272 368 326" fill="none" stroke="var(--fl-ink-t)" stroke-width="6" stroke-linecap="round"/>'
      + `<g transform="translate(389 -2) rotate(-30 190 170)">${KETTLE}</g>` },
    // 热气（单独用：结尾那只盖碗上面）
    steam: { vb: '0 0 140 150', fx: 'rise', svg:
      '<path d="M34 144q-16-20 0-40q16-20 0-40q-16-20 0-36M74 136q-16-20 0-40q16-20 0-40q-16-20 0-40M114 144q-16-20 0-40q16-20 0-40" fill="none" stroke="var(--fl-coral-l)" stroke-width="11" stroke-linecap="round"/>' },
    // 小装饰：明黄四角星、珊瑚十字、墨蓝小圆环（封面、结尾点缀用，一页两三个就够）
    spark: { vb: '0 0 40 40', svg: '<path d="M20 2L25.5 14.5L38 20L25.5 25.5L20 38L14.5 25.5L2 20L14.5 14.5Z" fill="var(--fl-sun)" stroke="var(--fl-sun)" stroke-width="4" stroke-linejoin="round"/><path d="M20 2L25.5 14.5L38 20L25.5 25.5L20 38Z" fill="var(--fl-sun-d)" fill-opacity=".55"/>' },
    plus: { vb: '0 0 28 28', svg: '<path d="M10 4a4 4 0 0 1 8 0v6h6a4 4 0 0 1 0 8h-6v6a4 4 0 0 1-8 0v-6H4a4 4 0 0 1 0-8h6Z" fill="var(--fl-coral-l)"/>' },
    ring: { vb: '0 0 28 28', svg: '<circle cx="14" cy="14" r="9.5" fill="none" stroke="var(--fl-ink-l)" stroke-width="5"/>' },
  };
  /* 单色图标 [data-fl-icon="名字"]：画在 48×48 里，颜色跟着 currentColor 走（圆片徽标、翻面图标、数字大卡角上用） */
  const ICON = {
    thermo: '<path d="M19 9.5a5 5 0 0 1 10 0v18.6a9 9 0 1 1-10 0Z" fill="none" stroke="currentColor" stroke-width="3.6"/><circle cx="24" cy="35" r="5.4" fill="currentColor"/><rect x="22.1" y="15" width="3.8" height="20" rx="1.9" fill="currentColor"/><path d="M34 12h5M34 18.5h3.5M34 25h5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
    leaf: '<path d="M39 8C21 8 9 17 9 31c0 3 .8 5.6 2 7.8C14 30 20 23 28.5 18 21 24 16 31 14 40c2 .7 4.2 1 6.4 1C33.6 41 41 29 39 8Z" fill="currentColor"/>',
    timer: '<circle cx="24" cy="27.5" r="15" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M24 27.5V19M19 5.5h10M24 5.5v7M36 13l3-3" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/>',
    check: '<path d="M11 25.5l8.5 8.5L37.5 15" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>',
    cross: '<path d="M14 14l20 20M34 14L14 34" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>',
    arrow: '<path d="M9 24h28M27 13l11 11-11 11" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  function fillArt(el) {
    const a = ART[el.dataset.flArt];
    if (!a) { console.warn(`[Deck] 扁平插画零件 data-fl-art="${el.dataset.flArt}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="${a.vb}" focusable="false">${a.svg}</svg>`;
  }
  function fillIcon(el) {
    const s = ICON[el.dataset.flIcon];
    if (!s) { console.warn(`[Deck] 扁平插画图标 data-fl-icon="${el.dataset.flIcon}" 不认识，可选：${Object.keys(ICON).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 48 48" focusable="false">${s}</svg>`;
  }

  /* 出场途中临时改了样子的收尾（数字滚动、翻面时压扁的正面）：正常由时间线播到时执行；时间线万一被掐断，退拍、翻页时也执行一遍 */
  const pending = new Set();
  function later(tl, at, fn) {
    let done = false;
    const run = () => { if (done) return; done = true; pending.delete(run); fn(); };
    pending.add(run);
    tl.call(run, null, at);
    return run;
  }
  function settle() { [...pending].forEach(run => { try { run(); } catch (e) { /* 元素已经不在了 */ } }); pending.clear(); }

  /* 弹跳出现（插画零件默认）：从台面上弹起来——压扁 → 拉长冲过头 → 落地压一下 → 回弹，底边始终贴着台面 */
  function bounceIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scaleX: .5, scaleY: .14, y: 0, transformOrigin: '50% 100%' },
      { autoAlpha: 1, scaleX: .86, scaleY: 1.16, y: -34, duration: .2, ease: 'power2.out', immediateRender: true }, t);
    tl.to(e, { scaleX: 1.1, scaleY: .88, y: 0, duration: .14, ease: 'power2.in' }, t + .2);
    tl.to(e, { scaleX: 1, scaleY: 1, duration: .32, ease: 'back.out(3)', onComplete: done, onInterrupt: done }, t + .34);
    return .66;
  }
  /* 掉进来：从上面落下，落地弹两下（茶叶掉进碗里） */
  function fallIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .1, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { y: -170 }, { y: 0, duration: .7, ease: 'bounce.out', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return .7;
  }
  /* 冒上来：热气从下往上露出来，同时往上飘一点 */
  function riseIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 1, clipPath: 'inset(100% -10% -10% -10%)', y: 26 },
      { clipPath: 'inset(-10% -10% -10% -10%)', y: 0, duration: .6, ease: 'power2.out', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return .6;
  }
  /* 铺开：从中心一下铺成整块，略冲过头再回来（色块、茶汤） */
  function spreadIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: 1, duration: .55, ease: 'back.out(1.7)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return .55;
  }
  /* 摆进来：从右上方带着转角摆进来、落定；里面的水流（.fl-stream）随后从壶嘴描到碗里 */
  function swingIn(tl, e, t, pivot) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, x: 90, y: -70, rotation: 14, transformOrigin: pivot || '50% 50%' },
      { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: .5, ease: 'back.out(1.8)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    const st = [...e.querySelectorAll('.fl-stream')];
    st.forEach(p => {
      let L = 0;
      try { L = Math.ceil(p.getTotalLength()) + 2; } catch (err) { L = 0; }
      if (!L) return;
      const off = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; };
      tl.fromTo(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power1.in', immediateRender: true, onComplete: off, onInterrupt: off }, t + .4);
    });
    return st.length ? .72 : .5;
  }
  /* 圆片徽标：转着弹出来（从小到大、转回正，过冲一点） */
  function badgeOut(tl, e, t, restore) {
    const done = restore || (() => clean(e));
    const from = { scale: 0, rotation: -120, transformOrigin: '50% 50%' }, to = { scale: 1, rotation: 0, duration: .5, ease: 'back.out(2.6)', immediateRender: true, onComplete: done, onInterrupt: done };
    if (restore) { from.opacity = 0; to.opacity = 1; } else { from.autoAlpha = 0; to.autoAlpha = 1; }
    tl.fromTo(e, from, to, t);
    return .5;
  }
  /* 台面、箭头轨道：从左往右铺开 */
  function stretchIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' },
      { autoAlpha: 1, scaleX: 1, duration: .45, ease: 'back.out(1.4)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    return .45;
  }
  /* 标签牌挂上：钉子先弹出来、绳子垂下来，牌子绕着钉子从左边荡进来、晃两下停住；字随后依次弹起。
     等台面上的东西先弹出来（同一拍里晚 .22 秒） */
  function tagIn(tl, e, t) {
    const str = parseFloat(getComputedStyle(e).getPropertyValue('--fl-str')) || 64;
    const a = t + .22, done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .1, ease: 'none', immediateRender: true }, a);
    tl.fromTo(e, { '--fl-pn': 0 }, { '--fl-pn': 1, duration: .3, ease: 'back.out(3)', immediateRender: true }, a);
    tl.fromTo(e, { '--fl-sl': 0 }, { '--fl-sl': 1, duration: .2, ease: 'power2.out', immediateRender: true }, a + .04);
    tl.fromTo(e, { rotation: -16, y: -14, transformOrigin: `50% ${-str}px` },
      { rotation: 0, y: 0, duration: .8, ease: 'elastic.out(1, .45)', immediateRender: true, onComplete: done, onInterrupt: done }, a + .04);
    let end = .22 + .84;
    kidsOf(e).forEach((c, i) => {
      const s = .36 + i * .07;
      end = Math.max(end, s + (c.matches('.fl-no') ? badgeOut(tl, c, t + s, keep(c)) : springIn(tl, c, t + s, { y: 18, dur: .4, restore: keep(c) })));
    });
    return Math.min(end, 1.15);
  }
  /* 数字大卡里的大数字：从 0 滚到目标（只滚 2 以上的整数；滚的时候按最终宽度占位，单位不跟着晃） */
  function countUp(tl, n, t) {
    const txt = n.textContent, to = parseInt(txt, 10);
    if (!(to >= 2) || String(to) !== txt.trim()) return 0;
    const o = { v: 0 };
    let fin = false;
    n.style.minWidth = n.offsetWidth + 'px';
    const done = () => { fin = true; n.textContent = txt; n.style.removeProperty('min-width'); };
    tl.fromTo(o, { v: 0 }, { v: to, duration: .6, ease: 'power2.out', immediateRender: true, onUpdate: () => { if (!fin) n.textContent = String(Math.round(o.v)); } }, t);
    later(tl, t + .62, done);
    return .62;
  }
  /* 数字大卡弹起：从下面压扁着弹上来、冲过头再落定，厚度（--fl-lift）跟着长出来；
     角上的图标转着弹出，大数字从 0 滚上去，标签和说明随后弹起 */
  function numIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, y: 80, scaleX: 1.04, scaleY: .86, transformOrigin: '50% 100%' },
      { autoAlpha: 1, y: -16, scaleX: .98, scaleY: 1.04, duration: .3, ease: 'power3.out', immediateRender: true }, t);
    tl.to(e, { y: 0, scaleX: 1, scaleY: 1, duration: .42, ease: 'back.out(3)', onComplete: done, onInterrupt: done }, t + .3);
    tl.fromTo(e, { '--fl-lift': 0 }, { '--fl-lift': 1, duration: .5, ease: 'back.out(2.2)', immediateRender: true }, t + .14);
    let end = .72;
    kidsOf(e).forEach((c, i) => {
      const s = .16 + i * .07;
      end = Math.max(end, s + (c.matches('[data-fl-icon]') ? badgeOut(tl, c, t + s, keep(c)) : springIn(tl, c, t + s, { y: 22, dur: .4, restore: keep(c) })));
    });
    const n = e.querySelector('.fl-n');
    if (n) end = Math.max(end, .2 + countUp(tl, n, t + .2));
    return Math.min(end, 1.1);
  }
  /* 翻面（.fl-flip 里带拍的背面）：正面横着压成一条（翻过去），背面从一条线展开（翻过来，略过冲），角上的对勾随后弹出。
     背面不透明、和正面一样大，翻完盖住正面；正面播完复原（藏在背面底下） */
  function flipIn(tl, e, t) {
    const front = e.parentElement && e.parentElement.querySelector(':scope > .fl-face:not([data-beat])');
    if (front) {
      const back = keep(front);
      tl.fromTo(front, { scaleX: 1 }, { scaleX: 0, duration: .18, ease: 'power2.in', immediateRender: false }, t);
      later(tl, t + .64, () => { const G = gs(); if (G) G.set(front, { clearProps: 'transform' }); back(); });
    }
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .01, ease: 'none', immediateRender: true }, t + .17);
    tl.fromTo(e, { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: .44, ease: 'back.out(2.6)', immediateRender: true }, t + .18);
    tl.fromTo(e, { '--fl-ck': 0 }, { '--fl-ck': 1, duration: .36, ease: 'back.out(3)', immediateRender: true, onComplete: done, onInterrupt: done }, t + .44);
    return .8;
  }
  /* 清单的一行（.fl-check > li）：整行从左边滑进来，序号圆片转着弹出，和上一行之间的连线垂下来，字随后依次弹起 */
  function rowIn(tl, li, t) {
    const done = () => clean(li);
    tl.fromTo(li, { autoAlpha: 0, x: -36 }, { autoAlpha: 1, x: 0, duration: .45, ease: 'back.out(1.8)', immediateRender: true }, t);
    tl.fromTo(li, { '--fl-cn': 0 }, { '--fl-cn': 1, duration: .32, ease: 'power2.out', immediateRender: true }, t);
    tl.fromTo(li, { '--fl-bs': 0 }, { '--fl-bs': 1, duration: .5, ease: 'back.out(2.4)', immediateRender: true, onComplete: done, onInterrupt: done }, t + .08);
    let end = .58;
    kidsOf(li).forEach((c, i) => { const s = .16 + i * .08; end = Math.max(end, s + springIn(tl, c, t + s, { y: 22, dur: .42, restore: keep(c) })); });
    return end;
  }
  /* 大气泡：从一颗胶囊铺开成整个气泡（带一点回弹），里面的句子逐字弹起 */
  function bubbleIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none', immediateRender: true }, t);
    tl.fromTo(e, { clipPath: CLIP0 }, { clipPath: 'inset(-20% -6% -40% -6% round 64px)', duration: .48, ease: 'power3.out', immediateRender: true }, t);
    tl.fromTo(e, { scale: .9 }, { scale: 1, duration: .6, ease: 'back.out(1.8)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    let end = .6;
    kidsOf(e).forEach((c, i) => { const s = .24 + i * .1; end = Math.max(end, s + chars(tl, c, t + s, { tilt: () => 0 })); });
    return Math.min(end, 1.15);
  }
  /* 弹跳出现（出场 flpop）：按组件分——圆片徽标转着弹出、色块铺开、台面和箭头轨道从左往右铺开、插画零件按自己的 fx */
  function flpop(tl, e, t) {
    if (e instanceof SVGElement) return springIn(tl, e, t, { vis: true, y: 0, dur: .4 });
    if (e.matches('.fl-badge')) return badgeOut(tl, e, t);
    if (e.matches('.fl-blob')) return spreadIn(tl, e, t);
    if (e.matches('.fl-shelf, .fl-track')) return stretchIn(tl, e, t);
    if (e.matches('.fl-wall')) return faceIn(tl, e, t, { vis: true });
    const a = ART[e.dataset.flArt] || {};
    if (a.fx === 'drop') return fallIn(tl, e, t);
    if (a.fx === 'rise') return riseIn(tl, e, t);
    if (a.fx === 'spread') return spreadIn(tl, e, t);
    if (a.fx === 'swing') return swingIn(tl, e, t, a.pivot);
    return bounceIn(tl, e, t);
  }

  const FX = {
    spring(tl, e, t, ctx) {
      const tilt = ctx && ctx.tilt ? ctx.tilt() : 0;
      if (e.parentElement && e.parentElement.classList.contains('fl-check')) return rowIn(tl, e, t);
      if (isStep(e)) return stepIn(tl, e, t, { vis: true, tilt });
      if (e instanceof SVGElement) return springIn(tl, e, t, { vis: true, y: 0, dur: .4 });
      return springIn(tl, e, t, { vis: true, tilt });
    },
    unfold,
    chars,
    slap(tl, e, t, ctx) { return slapIn(tl, e, t, { vis: true, tilt: ctx && ctx.tilt ? ctx.tilt() : 0 }); },
    // 扁平插画自己的版式组件（页面里不用写，按类名自动选；上面「扁平插画自己的版式组件」一节）
    flpop,
    fltag(tl, e, t) { return e instanceof SVGElement ? springIn(tl, e, t, { vis: true, y: 0, dur: .4 }) : tagIn(tl, e, t); },
    flnum(tl, e, t) { return e instanceof SVGElement ? springIn(tl, e, t, { vis: true, y: 0, dur: .4 }) : numIn(tl, e, t); },
    flflip(tl, e, t) { return e instanceof SVGElement ? springIn(tl, e, t, { vis: true, y: 0, dur: .4 }) : flipIn(tl, e, t); },
    flbubble(tl, e, t) { return e instanceof SVGElement ? springIn(tl, e, t, { vis: true, y: 0, dur: .4 }) : bubbleIn(tl, e, t); },
  };
  /* 开场里给第 0 拍的元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后是 spring） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    let f = name && FX[name];
    if (!f) { const c = Object.keys(BY).find(k => e.classList.contains(k)); f = FX[c ? BY[c] : 'spring']; }
    return f(tl, e, t, { tilt: () => 0 });
  }

  /* 复制成功时从「已复制」后面迸出的几何纸屑：圆、方、三角、短条，往上迸、带点重力落下、转着淡出，只播一次。
     放进这一页内容下面的涟漪层（不压字），坐标是舞台坐标 */
  function burst(slide, x, y) {
    const G = gs(), layer = slide && slide.querySelector(':scope > .ripple-layer');
    if (!G || !layer) return;
    const kinds = ['c-coral', 'c-sq', 'c-ink', 'c-bar', 'c-sun', 'c-tri', 'c-coral', 'c-sq', 'c-bar', 'c-sun'];
    kinds.forEach((cls, i) => {
      const p = document.createElement('i');
      p.className = 'fl-cf ' + cls;
      p.style.left = (x - 7) + 'px'; p.style.top = (y - 7) + 'px';
      layer.appendChild(p);
      const a = -Math.PI / 2 + (i / (kinds.length - 1) - .5) * Math.PI * 1.15 + rand(-.12, .12);
      const v = rand(70, 115), dx = Math.cos(a) * v * 1.7, dy = Math.sin(a) * v;
      G.timeline({ onComplete: () => p.remove() })
        .fromTo(p, { x: 0, scale: .4, rotation: 0 }, { x: dx, scale: 1, rotation: rand(-260, 260), duration: .95, ease: 'power1.out' }, 0)
        .fromTo(p, { y: 0 }, { y: dy, duration: .36, ease: 'power2.out' }, 0)
        .to(p, { y: dy + 80, duration: .55, ease: 'power2.in' }, .36)
        .fromTo(p, { opacity: 1 }, { opacity: 0, duration: .25, ease: 'none' }, .7);
    });
  }

  Deck.scene('flat', {
    label: '扁平插画',
    family: 'modern',
    dark: false,
    mascot: 'xiaoye',
    enter: 'spring',
    enterBy: BY,
    titleIn: 'chars',
    recede: .8,
    // 线稿几乎是直的粗线；圈注稍微带一点手感。带填充色的形状：填充线加粗、间距小于线宽，叠成一整块色面
    rough: { strokeWidth: 4, roughness: .3, bowing: .3, hachureGap: 6, hachureAngle: -41, fillWeight: 8, markWidth: 4.5, markRoughness: .5, markBowing: .5 },
    fx: FX,

    // 背景层：右上角两圈受光的明黄大圆，左下角一圈珊瑚大圆和一小片点阵，左右页边各一件漂浮的小几何
    backdrop(layer) {
      let dots = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) dots += `<circle cx="${5 + c * 28}" cy="${5 + r * 34}" r="5"/>`;
      layer.insertAdjacentHTML('beforeend',
        '<i class="fl-sun"></i><i class="fl-sun2"></i><i class="fl-coral"></i>' +
        `<svg class="fl-dots" viewBox="0 0 150 78" aria-hidden="true" focusable="false">${dots}</svg>` +
        '<svg class="fl-float fl-spark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 2L25.5 14.5L38 20L25.5 25.5L20 38L14.5 25.5L2 20L14.5 14.5Z" fill="#FFC53D" stroke="#FFC53D" stroke-width="4" stroke-linejoin="round"/><path d="M20 2L25.5 14.5L38 20L25.5 25.5L20 38Z" fill="#EBA31D" fill-opacity=".55"/></svg>' +
        '<svg class="fl-float fl-plus" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M10 4a4 4 0 0 1 8 0v6h6a4 4 0 0 1 0 8h-6v6a4 4 0 0 1-8 0v-6H4a4 4 0 0 1 0-8h6Z" fill="#FF977F"/></svg>');
    },

    // 建页：扁平插画零件、图标的 SVG 填进去（只看这一页里的）
    decorate(s) {
      s.querySelectorAll('.fl-art[data-fl-art]').forEach(fillArt);
      s.querySelectorAll('[data-fl-icon]').forEach(fillIcon);
    },

    // 退一拍：色面缩一下、步骤的序号徽标收回去（引擎同时把这一拍淡出、下沉一点）；
    // 扁平插画的组件：插画零件压扁回台面、大卡和标签牌缩一下、翻面图标的正面重新展开（背面由引擎淡出）
    onBack({ tl, units }) {
      settle();   // 数字滚动、翻面这些出场途中改过的样子，先收拾干净
      const G = gs(), reset = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        if (e.matches('.fl-art, .fl-badge')) { tl.to(e, { scaleX: 1.12, scaleY: .2, transformOrigin: '50% 100%', duration: .2, ease: 'power2.in' }, 0); reset.push(e); }
        if (e.matches('.fl-num, .fl-tag, .fl-bubble, .fl-pill')) { tl.to(e, { scale: .94, duration: .2, ease: 'power2.in' }, 0); reset.push(e); }
        if (e.matches('.fl-face[data-beat]')) {
          const front = e.parentElement && e.parentElement.querySelector(':scope > .fl-face:not([data-beat])');
          if (front) { tl.fromTo(front, { scaleX: 0 }, { scaleX: 1, duration: .24, ease: 'back.out(2.4)', immediateRender: false }, .12); reset.push(front); }
        }
        if (isFace(e)) tl.to(e, { scale: .94, duration: .2, ease: 'power2.in' }, 0);   // 引擎收完会清掉 transform
        if (isStep(e)) {
          const off = () => e.style.removeProperty('--fl-bs');
          tl.fromTo(e, { '--fl-bs': 1 }, { '--fl-bs': 0, duration: .2, ease: 'back.in(2)', immediateRender: false, onInterrupt: off }, 0);   // 不写起点读不到（CSS 里没设这个变量）
          tl.call(off, null, .3);
        }
      });
      // gsap 记着压扁、缩小过的变形：收完清掉，下次出场不会接着旧的样子
      if (reset.length && G) tl.call(() => reset.forEach(e => G.set(e, { clearProps: 'transform,transformOrigin' })), null, .24 + units.length * .04 + .06);
      return { at: 0, gap: .04, y: 16, dur: .24 };
    },

    // 翻页：旧页往一边滑走淡出，新页从另一边带一点回弹滑进来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      settle();
      const G = gs();
      tl.to(from.el, { x: -70 * dir, autoAlpha: 0, duration: .32, ease: 'power2.in', onComplete: () => { retire(); G.set(from.el, { clearProps: 'transform' }); } }, 0);
      tl.fromTo(to.el, { x: 110 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .55, ease: 'back.out(1.3)', immediateRender: true, onComplete: () => { clear(to.el); G.set(to.el, { clearProps: 'transform' }); } }, .14);
      return .24;
    },

    // 「已复制」：明黄贴纸歪着拍上来再摆正、对勾描出来；成功时一道亮条扫过命令，纸屑从提示后面迸出
    // （纸屑另起动画，不放进 tl：tl 播完引擎就开始让提示淡出）
    copied({ tl, tip, node, ok }) {
      tl.fromTo(tip, { autoAlpha: 0, scale: .3, rotation: -9, y: -12, transformOrigin: '28px 50%' }, { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: .55, ease: 'back.out(2.4)' }, 0);
      const path = tip.querySelector('path');
      if (path && ok) {
        const L = path.getTotalLength() + 2;
        tl.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .3, ease: 'power2.out' }, .14);
      }
      if (!ok) return;
      if (node && node.matches && node.matches('.copy')) {
        const off = () => { node.style.removeProperty('--fl-sw'); node.style.removeProperty('--fl-swo'); };
        tl.fromTo(node, { '--fl-sw': '-100px', '--fl-swo': 1 }, { '--fl-sw': (node.offsetWidth + 30) + 'px', duration: .55, ease: 'power2.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, 0);
      }
      if (!RMQ.matches) burst(tip.closest('.slide'), (parseFloat(tip.style.left) || 0) + 30, (parseFloat(tip.style.top) || 0) + tip.offsetHeight / 2);
    },

    // 开场（约 1.2 秒）：背景大圆弹开、点阵冒出、漂浮小几何转着弹出 → 主题行滑入、节拍胶囊落下 →
    // 大标题逐字弹起 → 第 0 拍依次跟上 → 重点词色块弹出
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const bg = document.querySelector('.bg[data-scene="flat"]');
      if (bg) {
        [['.fl-sun', 0, .8, 1.4], ['.fl-coral', .06, .7, 1.4], ['.fl-sun2', .12, .7, 1.7]].forEach(([s, at, d, k]) => {
          const e = bg.querySelector(s);
          if (e) tl.fromTo(e, { scale: 0 }, { scale: 1, duration: d, ease: `back.out(${k})`, immediateRender: true, onComplete: () => clean(e) }, at);
        });
        const dots = [...bg.querySelectorAll('.fl-dots circle')];
        if (dots.length) tl.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .3, ease: 'back.out(3)', stagger: .015, immediateRender: true }, .3);
        const fl = [...bg.querySelectorAll('.fl-float')];
        fl.forEach((e, i) => tl.fromTo(e, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.5)', immediateRender: true, onComplete: () => clean(e) }, .45 + i * .06));
      }
      const stage = root.closest('#stage');
      const topic = root.querySelector(':scope > .s-topic'), chap = stage && stage.querySelector('.chrome .chap'), meta = stage && stage.querySelector('.chrome .meta');
      [topic, chap].filter(Boolean).forEach(e => tl.fromTo(e, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: .4, ease: 'power2.out', immediateRender: true, onComplete: () => clean(e) }, .1));
      if (meta) tl.fromTo(meta, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)', immediateRender: true, onComplete: () => clean(meta) }, .22);
      const title = root.querySelector(':scope > .s-title');
      let end = .7;
      if (title) end = Math.max(end, .12 + chars(tl, title, .12, { tilt: () => 0 }));
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      zero.forEach((e, i) => { const s = (title ? .4 : .2) + i * .1 + (parseFloat(e.dataset.delay) || 0); end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || (parseInt(b.dataset.beat, 10) || 0) === 0; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.max(.6, Math.min(end - .15, 1.1)));
      return Math.max(end, 1);
    },

    // 点击处：一圈很淡的珊瑚圆环、三颗小圆点迸开（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      const G = gs();
      if (!G || !layer || RMQ.matches) return;
      const r = document.createElement('div');
      r.className = 'fl-ripple';
      r.setAttribute('aria-hidden', 'true');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      r.innerHTML = '<b></b><i class="c1"></i><i class="c2"></i><i class="c3"></i>';
      layer.appendChild(r);
      G.fromTo(r.querySelector('b'), { scale: .2, opacity: .38 }, { scale: 1, opacity: 0, duration: .55, ease: 'power2.out', onComplete: () => r.remove() });
      [...r.querySelectorAll('i')].forEach((d, i) => {
        const a = -Math.PI / 2 + (i - 1) * 1.9 + rand(-.25, .25);
        G.fromTo(d, { x: 0, y: 0, scale: 1, opacity: .5 }, { x: Math.cos(a) * 46, y: Math.sin(a) * 46, scale: .3, opacity: 0, duration: .5, ease: 'power2.out' });
      });
    },

    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 12, w: 516, h: 72, name: '页码和节拍胶囊' },
    ],
  });
})();
