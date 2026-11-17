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
   - 自己加的出场名：mist、float、sheen，只在这个风格里认（别的风格会提醒并换成它的默认出场）
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
  const GLASS = '.card, .cell, .term, .shot, .steps > li';
  const HOVER = GLASS + ', .copy';
  const TILT = '.card, .cell, .shot, .steps > li';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .fr-bub, script, style';
  /* 默认出场按组件类名分：磨砂组件和一排卡片的外层「浮出」，命令「凝出」，其余文字「凝出」 */
  const BY = { card: 'float', cell: 'float', term: 'float', shot: 'float', steps: 'float', cells: 'float', grid: 'float', row: 'float', col: 'float', vs: 'float', copy: 'mist' };
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
  };
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
    recede: .58,
    rough: { strokeWidth: 2.6, roughness: .35, bowing: .3, markWidth: 3, markRoughness: .4, markBowing: .3 },   // 线稿和圈注都几乎是直的
    fx: FX,
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
