/* =====================================================================
   风格 · 新粗野主义 brutal（现代家，浅色底）
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
   - 自己加的出场名：slam、smash、slap、snap，只在这个风格里认（别的风格会提醒并换成它的默认出场）
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
  const RING = '.card, .cell, .term, .shot, .copy, .steps > li';
  const TILT = '.card, .cell, .shot, .steps > li';                  // 悬停时朝鼠标那侧歪一点的组件
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .bz-fx, .copied-tip, script, style';
  /* 默认出场按组件类名分：有硬阴影的组件和一排卡片的容器「砸下来」，标签「拍上」，金句「逐字砸下」，其余文字「弹起」 */
  const BY = { card: 'slam', cell: 'slam', term: 'slam', shot: 'slam', copy: 'slam', steps: 'slam', cells: 'slam', grid: 'slam', row: 'slam', col: 'slam', vs: 'slam', tag: 'slap', quote: 'smash' };
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', '--bz-k', '--bz-a', '--bz-j'];

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
  /* 已经落定的组件被这一下震得跳一下，像桌子被砸了（推 --bz-j，不碰 transform；正在动的、还没出现的不震） */
  function jolt(e) {
    const slide = e.closest && e.closest('.slide');
    if (!slide || still()) return;
    const seen = o => { const cs = getComputedStyle(o); return cs.visibility === 'visible' && parseFloat(cs.opacity) > .3 && o.offsetWidth > 0; };
    [...slide.querySelectorAll(RING)]
      .filter(o => o !== e && !o.contains(e) && !e.contains(o) && !G.isTweening(o) && seen(o))
      .slice(0, 8)
      .forEach((o, i) => G.fromTo(o, { '--bz-j': '0px' }, { '--bz-j': '-7px', duration: .07, ease: 'power1.out', yoyo: true, repeat: 1, delay: i * .03, onComplete: () => o.style.removeProperty('--bz-j') }));
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
      end = Math.max(end, s + (isRing(c) ? slamOne(tl, c, t + s, false, tiltOf(c)) : isTag(c) ? slapOne(tl, c, t + s, false, tiltOf(c)) : snapIn(tl, c, t + s, false, 0)));
    });
    return Math.min(end, 1.15);
  }

  /* 砸下来：有硬阴影的组件自己砸下；一排卡片的容器先亮出来，里面的卡片依次砸下；别的块当文字弹起 */
  function slam(tl, e, t, ctx) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    if (!isRing(e) && kidsOf(e).some(isRing)) return group(tl, e, t);
    if (!isRing(e)) return snapIn(tl, e, t, true, tilt);
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

  const FX = {
    // 弹起：默认出场（文字）；有硬阴影的组件转去砸下来
    snap(tl, e, t, ctx) { return snapIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : 0); },
    // 砸下来：卡片、小格、步骤、终端、截图位、命令和一排卡片的容器
    slam,
    // 逐字砸下：大标题、金句
    smash,
    // 啪地拍上：标签
    slap,
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
    recede: .56,
    // 线稿是几乎笔直的粗墨线；带填充色的图元，填充线加粗、间距小于线宽，叠成一整块色；圈注是粗粉线（CSS 再给它加一道硬投影）
    rough: { strokeWidth: 4.5, roughness: .3, bowing: .25, hachureGap: 5, hachureAngle: -41, fillWeight: 6, markWidth: 5, markRoughness: .55, markBowing: .5 },
    fx: FX,

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
