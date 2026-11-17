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
   - 自己加的出场名：spring、unfold、chars、slap，只在这个风格里认（别的风格会提醒并换成它的默认出场）
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
  /* 默认出场按组件类名分：色面组件和装着它们的容器「色面展开」，命令和标签「贴纸弹出」，金句「逐字弹起」，其余「弹起」 */
  const BY = { card: 'unfold', cell: 'unfold', term: 'unfold', shot: 'unfold', cells: 'unfold', steps: 'unfold', grid: 'unfold', row: 'unfold', col: 'unfold', vs: 'unfold', copy: 'slap', tag: 'slap', quote: 'chars' };
  const PROPS = ['opacity', 'visibility', 'transform', 'transform-origin', 'translate', 'rotate', 'scale', 'clip-path', '--fl-bs'];
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

  const FX = {
    spring(tl, e, t, ctx) {
      const tilt = ctx && ctx.tilt ? ctx.tilt() : 0;
      if (isStep(e)) return stepIn(tl, e, t, { vis: true, tilt });
      if (e instanceof SVGElement) return springIn(tl, e, t, { vis: true, y: 0, dur: .4 });
      return springIn(tl, e, t, { vis: true, tilt });
    },
    unfold,
    chars,
    slap(tl, e, t, ctx) { return slapIn(tl, e, t, { vis: true, tilt: ctx && ctx.tilt ? ctx.tilt() : 0 }); },
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

    // 退一拍：色面缩一下、步骤的序号徽标收回去（引擎同时把这一拍淡出、下沉一点）
    onBack({ tl, units }) {
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        if (isFace(e)) tl.to(e, { scale: .94, duration: .2, ease: 'power2.in' }, 0);   // 引擎收完会清掉 transform
        if (isStep(e)) {
          const off = () => e.style.removeProperty('--fl-bs');
          tl.fromTo(e, { '--fl-bs': 1 }, { '--fl-bs': 0, duration: .2, ease: 'back.in(2)', immediateRender: false, onInterrupt: off }, 0);   // 不写起点读不到（CSS 里没设这个变量）
          tl.call(off, null, .3);
        }
      });
      return { at: 0, gap: .04, y: 16, dur: .24 };
    },

    // 翻页：旧页往一边滑走淡出，新页从另一边带一点回弹滑进来（后退时方向反过来）
    pageTurn({ tl, from, to, dir, retire, clear }) {
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
