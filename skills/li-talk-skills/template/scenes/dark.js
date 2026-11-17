/* =====================================================================
   风格 · 科技暗黑 dark（现代家，深色底）
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
   - 自己加的出场名：focus、lift、wipe、sweep，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍胶囊（.meta 在这里改到 top 22，胶囊高 52：y 22–74，和主题行同一条中线；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 14–82）
   - 样子在 dark.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  /* 有缎面描边的组件；SKIP 是出场时不跟着动的子元素（形象、圈注层、涟漪层） */
  const RING = '.card, .cell, .term, .shot, .steps > li';
  const HOVER = RING + ', .copy';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
  /* 默认出场按组件类名分：一排卡片的容器和缎面组件「浮起 + 扫光」，命令「柔边擦出」，其余文字「由虚到实」 */
  const BY = { copy: 'wipe', card: 'lift', cell: 'lift', term: 'lift', shot: 'lift', steps: 'lift', cells: 'lift', grid: 'lift', row: 'lift', col: 'lift', vs: 'lift' };
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'filter', '--dk-sw', '--dk-wp'];

  const isRing = e => !!(e && e.matches && e.matches(RING));
  /* 清掉出场留下的内联样式，回到 CSS 决定的样子 */
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
    // 由虚到实：默认出场、大标题的出场（大标题模糊得更多、浮得更高）
    focus(tl, e, t, ctx) {
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
  };

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
    // 退一拍：字先虚化上收，组件随后沉下去淡出
    onBack({ tl, units }) {
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
