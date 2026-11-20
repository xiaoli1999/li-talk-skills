/* =====================================================================
   风格 · 方格纸 paper（手绘风）
   - 样子：浅色方格纸，左侧一列活页孔；墨色线框，黄色荧光笔划重点；
     带颜色的卡片是贴上去的便签，可复制的命令是一张翘起纸角的黄便签，「已复制」是绿笔打勾
   - 适合讲：开场、总览、愿景、收尾、学习笔记式的讲解（推演、订正、归纳）。不适合大段代码、密集数据
   - 出场：内容轻轻上浮（比默认的 rise 幅度小）；大标题和方格纸自有组件由一支铅笔写出来（见下面的 pencil）
   - 翻页：整张活页绕左侧的孔翻过去
   - 方格 48px 一格，格线对准舞台左上角（paper.css 的 --scene-bg）：框的边、大字的格子放在 48 的倍数上就和方格对齐
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左边一列活页孔：孔在 x 36–58，外圈淡影到 65，整列 x < 66 不要放内容
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 方格纸自有的版式组件（类名带 pp- 前缀，样子在 paper.css 末尾，样板页见 samples/paper.js；别的风格不认识，只是普通容器）。
     「每一拍发生了什么」按学习笔记的习惯来：一支铅笔把字写出来、尺子压在纸上拉一条线、红笔订正打勾、便签翘着角贴上去。
     它们各有这一风格的出场（enterBy 按类名配好，页面不用写 data-in）：
     · .pp-hand 手写字：铅笔从左往右写出来（出场 pencil：字跟着笔尖露出来，笔尖是临时放进页面的一支铅笔，写完拿走）
     · .pp-red 红笔字：同上，换成一支红笔（老师订正的字）
     · .pp-no 圈码（1、2、3）：先顺时针圈一圈，再写数字
     · .pp-row 一行笔记（容器）：里面的东西按书写顺序一样样写出来、画出来（字、圈码、速写都行），上一样快写完下一样就接上
     · .pp-fig 铅笔速写：里面的 svg 一笔笔描出来，笔尖沿着线走；不描边的色块（荧光笔、茶色）最后淡入；svg 后面的图注接着写
     · .pp-rule 尺子线：一把透明尺子先落在纸上，铅笔贴着尺边从起点拉到终点，尺子再拿走（出场 ruler）；
       .dash 虚线是随手描的引线，不用尺子；.arrow 画到头落下箭头；.dim 尺寸线；data-tick 坐标轴的刻度跟着线一起长出来
     · .pp-frame 尺子框：上 → 右 → 下 → 左 四条边一笔接一笔画出来，笔尖沿着框走一圈（出场 ruler）
     · .pp-dot 描点：点一下；.ring 再顺时针打一个圈
     · .pp-note 便签：从上面落下来、翘着角，按平、角落回去，影子收小（出场 stick）；可复制的命令 .copy 也这样贴上
     · .pp-fix 红笔订正（容器）：箭头 .pp-arw → 对的写法 .pp-red → 打勾 .pp-tick，红笔一样样写出来
     · .pp-tick 红勾、.pp-arw 红箭头（内联 svg）：红笔一笔画出来
     · .pp-margin 作业本的淡红页边线：只是装饰，不进拍
   - 可读性约定（形态好看，但翻到最后一拍整页要读得清）：
     · 写出来的字一律留在页上；错的做法用红笔划一道（data-mark="strike"），划掉的字还要读得清，旁边写对的、打勾
     · 红笔只给订正（划线、对的写法、勾），一页的强调（荧光笔、圈、红字）不超过 3 处；别的强调用荧光笔 .key
     · 句子横排，一块字的倾斜不超过 2°（便签 --r 在 ±1.5deg 以内）；尺子线、坐标线不是字，角度随意
     · 讲过的只退到 .8（recede），组件里不另加透明度；铅笔、红笔的字都是实色，对比度够 3:1
     · 笔尖、尺子只在动画里出现，写完就拿走，静止时页面上只有字和线
   - 引擎的描线 draw 换成方格纸的：手绘线 svg.sketch、圈注（划线、圈、框）也是笔尖跟着一笔笔描出来；
     圈注写 data-mark-color="var(--pp-red)" 时换成红笔（红笔订正里划掉错的做法就这样写）
   - 自己加的出场名：pencil、ruler、stick，只在这个风格里认（别的风格会提醒并换成它的默认出场）；页面里不写，由类名自动选
   - 样子在 paper.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = window.gsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const HOLES = '<div class="pp-holes" aria-hidden="true">' + '<i></i>'.repeat(8) + '</div>';
  const shade = () => { const d = document.createElement('div'); d.className = 'pp-shade'; return d; };

  /* 写字时跟着走的笔尖：一支墨蓝铅笔，红笔订正时换成红笔；笔尖在 svg 的左下角（paper.css 的 .pp-tip 用 margin 把左下角对到落笔点） */
  const PEN = (body, hi, cone, lead, ferrule, end) => '<svg viewBox="0 0 120 120" aria-hidden="true"><g transform="translate(2 118) rotate(-52)">'
    + `<path d="M22 -7 L120 -7 L120 7 L22 7 Z" fill="${body}"/><path d="M22 -7 L120 -7 L120 -2.3 L22 -2.3 Z" fill="${hi}"/>`
    + `<path d="M0 0 L22 -7 L22 7 Z" fill="${cone}"/><path d="M0 0 L7.5 -2.4 L7.5 2.4 Z" fill="${lead}"/>`
    + `<rect x="120" y="-7.5" width="11" height="15" fill="${ferrule}"/><rect x="131" y="-7" width="12" height="14" rx="3" fill="${end}"/>`
    + '<path d="M0 0 L22 -7 L143 -7 L143 7 L22 7 Z M120 -7.5 V7.5 M131 -7 V7" fill="none" stroke="#1E2B48" stroke-width="1.6" stroke-linejoin="round"/></g></svg>';
  const TIP = { pencil: PEN('#46629A', '#6E8BC0', '#F3D9B1', '#2B3550', '#C9CED6', '#F6AFA6'),
    red: PEN('#D0312D', '#E8675F', '#D5D8DE', '#1E2B48', '#8E1F1B', '#8E1F1B') };

  /* 出场留下的内联样式：清掉以后回到 CSS 决定的「画完」的样子 */
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path',
    '--pp-d', '--pp-ru', '--pp-curl', '--pp-lift', '--pp-f1', '--pp-f2', '--pp-f3', '--pp-f4'];
  const clean = e => { if (e && e.style) PROPS.forEach(k => e.style.removeProperty(k)); };
  const cleanStroke = s => ['stroke-dasharray', 'stroke-dashoffset', 'opacity'].forEach(k => s.style.removeProperty(k));
  /* 跟着一起出场时跳过的子元素：自己另有 data-beat 的（它在自己那一拍出场）、形象、圈注层、笔尖 */
  const SKIP = '.mascot, .kid, svg.marks, .ripple-layer, .copied-tip, .pp-tip, .pp-ah, .pp-end, .pp-tk, br, script, style';
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
  const isRed = e => !!(e.closest && e.closest('.pp-red, .pp-fix, .pp-tick, .pp-arw, .red'));
  /* 元素自己的倾斜角（--r 写进 CSS 的 rotate）：gsap 动画时会把 rotate 写成 none，倾斜要并进 gsap 的 rotation */
  const tiltOf = e => {
    if (!e || e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? parseFloat(v) || 0 : 0;
  };
  /* 元素在页面里的框（舞台坐标，沿 offsetParent 累加：不受缩放、翻页动画影响） */
  function boxIn(node, slide) {
    let l = 0, t = 0, n = node;
    while (n && n !== slide) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    return { l, t, w: node.offsetWidth || 0, h: node.offsetHeight || 0 };
  }
  /* 一张 svg 的左上角在页面里的位置（svg 没有 offsetLeft：用它和外层 HTML 元素的屏幕位置差，按外层的缩放换回舞台坐标） */
  function svgOrigin(svg, slide) {
    const host = svg.parentElement, hb = boxIn(host, slide);
    const hr = host.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    const k = hr.width / (host.offsetWidth || 1) || 1;
    return { x: hb.l + (sr.left - hr.left) / k, y: hb.t + (sr.top - hr.top) / k };
  }
  /* 折线上走到 p（0–1）的位置 */
  function along(pts, p) {
    const segs = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(L); total += L; }
    let d = clamp(p, 0, 1) * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) { const f = segs[i] ? clamp(d / segs[i], 0, 1) : 1; return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f }; }
      d -= segs[i];
    }
    return { x: pts[0][0], y: pts[0][1] };
  }

  /* 笔尖：在 t 秒放进页面，dur 秒里按 at(p) 走（p 从 0 到 1），走完拿走。时间线被快进、打断时也拿走。
     一页只有一支笔：新的一笔开始时把页上别的笔尖拿走（同一拍里几样东西前后脚接着写，笔就从上一样跳到下一样） */
  const sweep = root => (root || document).querySelectorAll('.pp-tip').forEach(x => x.remove());
  function follow(tl, slide, t, dur, at, red, ease) {
    if (!slide || !G) return;
    const st = { p: 0 };
    let tip = null;
    const put = () => { if (!tip || !tip.isConnected) return; const q = at(st.p); tip.style.transform = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px)`; };
    const off = () => { if (tip) { tip.remove(); tip = null; } };
    tl.fromTo(st, { p: 0 }, { p: 1, duration: dur, ease: ease || 'none',
      onStart: () => { off(); sweep(slide); tip = document.createElement('i'); tip.className = 'pp-tip'; tip.setAttribute('aria-hidden', 'true'); tip.innerHTML = red ? TIP.red : TIP.pencil; slide.appendChild(tip); put(); },
      onUpdate: put, onComplete: off, onInterrupt: off }, t);
  }

  /* ---------- 写一块字：字从左往右露出来，笔尖贴着字的底边走（多行时一起露出，笔尖走最后一行） ---------- */
  function writeText(tl, x, t, slide) {
    const b = boxIn(x, slide), d = clamp(b.w / 1500 + .16, .22, .6);
    const off = () => clean(x);
    tl.fromTo(x, { clipPath: 'inset(-30% 100% -30% -6%)' }, { clipPath: 'inset(-30% -6% -30% -6%)', duration: d, ease: 'power1.inOut', immediateRender: true, onComplete: off, onInterrupt: off }, t);
    const y = b.t + b.h - Math.min(b.h, parseFloat(getComputedStyle(x).fontSize) || 40) * .3;
    follow(tl, slide, t, d, p => ({ x: b.l + b.w * p, y }), isRed(x), 'power1.inOut');
    return d;
  }
  /* ---------- 圈码、描点：先顺时针圈一圈（--pp-d），再露出数字或点 ---------- */
  function ringIn(tl, x, t, slide) {
    const b = boxIn(x, slide), cx = b.l + b.w / 2, cy = b.t + b.h / 2;
    const dot = x.matches('.pp-dot'), ring = !dot || x.matches('.ring');
    const off = () => clean(x);
    let end = 0;
    if (dot) {   // 点先落下
      tl.fromTo(x, { scale: 0, '--pp-d': ring ? 0 : 1 }, { scale: 1, duration: .16, ease: 'back.out(3)', immediateRender: true }, t);
      end = .16;
    }
    if (ring) {
      const r = dot ? 28 : b.w / 2, s = t + (dot ? .14 : 0), d = .36;
      tl.fromTo(x, { '--pp-d': 0 }, { '--pp-d': 1, duration: d, ease: 'power1.inOut', immediateRender: true }, s);
      follow(tl, slide, s, d, p => ({ x: cx + r * Math.sin(p * Math.PI * 2), y: cy - r * Math.cos(p * Math.PI * 2) }), isRed(x), 'power1.inOut');
      end = s - t + d;
      if (!dot) {   // 圈码：圈完写数字（数字用 color 透明度藏住，圈不受影响）
        tl.fromTo(x, { color: 'transparent' }, { color: getComputedStyle(x).color, duration: .14, ease: 'none', immediateRender: true }, t + end - .06);
        end += .1;
      }
    }
    tl.call(() => { off(); x.style.removeProperty('color'); }, null, t + end + .01);
    return end;
  }
  /* ---------- 速写：svg 里的线一笔笔描出来（按长度分时间），笔尖沿着线走；不描边的色块最后淡入 ---------- */
  const GEO = 'path, line, polyline, polygon, circle, ellipse, rect';
  /* el 可以是一整张 svg，也可以是 svg 里的一组、一条线（手绘线 svg.sketch、圈注的那一组）：坐标都按它所在的那张 svg 换算 */
  function drawSvg(tl, el, t, slide) {
    const svg = el instanceof SVGSVGElement ? el : el.ownerSVGElement;
    if (!svg) return 0;
    const shapes = (el.matches(GEO) ? [el] : [...el.querySelectorAll(GEO)]).filter(s => !s.closest('defs'));
    const lines = [], fills = [];
    shapes.forEach(s => { const cs = getComputedStyle(s); (cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 ? lines : fills).push(s); });
    const lens = lines.map(s => { try { return Math.ceil(s.getTotalLength()) + 2; } catch (e) { return 0; } });
    const total = lens.reduce((a, v) => a + v, 0);
    // 线的总长按 viewBox 量，换成页面上的像素再定时长（同样多的线，画得大就写得久一点）
    const vb = svg.viewBox && svg.viewBox.baseVal, sc = vb && vb.width ? (svg.clientWidth || svg.getBoundingClientRect().width) / vb.width : 1;
    const D = total ? clamp(total * sc / 2400 + .15, .3, .85) : 0;
    let c = t;
    const pieces = [];
    lines.forEach((s, i) => {
      const L = lens[i];
      if (!L) return;
      const d = D * L / total, done = () => cleanStroke(s);
      const da = s.getAttribute('stroke-dasharray');
      if (da && da !== 'none') tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: Math.max(.12, d), ease: 'power1.out', immediateRender: true, onComplete: done, onInterrupt: done }, c);
      else tl.fromTo(s, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'none', immediateRender: true, onComplete: done, onInterrupt: done }, c);
      pieces.push({ s, L, from: c - t, d });
      c += d;
    });
    if (pieces.length && slide) {
      // 笔尖：按时间找到正在画的那一笔，取那一笔上对应的点，用它的 CTM 换到 svg 的像素，再加上 svg 在页面里的位置
      const org = svgOrigin(svg, slide);
      const at = p => {
        const now = p * D;
        let q = pieces[pieces.length - 1];
        for (const x of pieces) { if (now <= x.from + x.d) { q = x; break; } }
        const f = q.d ? clamp((now - q.from) / q.d, 0, 1) : 1;
        let pt;
        try { pt = q.s.getPointAtLength((q.L - 2) * f); } catch (e) { return org; }
        const m = q.s.getCTM();
        return m ? { x: org.x + m.a * pt.x + m.c * pt.y + m.e, y: org.y + m.b * pt.x + m.d * pt.y + m.f } : org;
      };
      follow(tl, slide, t, D, at, isRed(el) || /pp-red/.test(el.getAttribute('style') || ''), 'none');
    }
    if (fills.length) fills.forEach(f => { const done = () => cleanStroke(f); tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'power1.out', immediateRender: true, onComplete: done, onInterrupt: done }, Math.max(t, c - .1)); });
    return (c - t) + (fills.length ? .2 : 0);
  }
  /* ---------- 尺子线：尺子落下 → 铅笔贴着尺边从起点拉到终点 → 尺子拿走；虚线不用尺子，直接描 ---------- */
  function ruleIn(tl, e, t, slide) {
    if (e.matches('.pp-frame')) return frameIn(tl, e, t, slide);
    const b = boxIn(e, slide), ang = tiltOf(e) * Math.PI / 180, L = e.offsetWidth;
    const x0 = b.l, y0 = b.t + b.h / 2, dash = e.matches('.dash');
    const lead = dash ? 0 : .16, d = clamp(L / 1600 + .2, .26, .55);
    const off = () => clean(e);
    tl.fromTo(e, { '--pp-d': 0, '--pp-ru': 0 }, { '--pp-ru': dash ? 0 : 1, duration: lead || .01, ease: 'power2.out', immediateRender: true }, t);
    tl.fromTo(e, { '--pp-d': 0 }, { '--pp-d': 1, duration: d, ease: 'power1.inOut', immediateRender: true }, t + lead);
    follow(tl, slide, t + lead, d, p => ({ x: x0 + Math.cos(ang) * L * p, y: y0 + Math.sin(ang) * L * p }), isRed(e), 'power1.inOut');
    if (dash) { tl.call(off, null, t + d + .01); return d; }
    tl.to(e, { '--pp-ru': 0, duration: .18, ease: 'power1.in' }, t + lead + d + .02);
    tl.call(off, null, t + lead + d + .21);
    return lead + d + .12;   // 尺子拿走的那一下可以和下一块重叠
  }
  /* ---------- 尺子框：四条边一笔接一笔画出来，笔尖沿着框走一圈 ---------- */
  function frameIn(tl, e, t, slide) {
    const b = boxIn(e, slide), per = 2 * (b.w + b.h) || 1, D = clamp(per / 3600 + .3, .45, .85);
    const sides = ['--pp-f1', '--pp-f2', '--pp-f3', '--pp-f4'], lens = [b.w, b.h, b.w, b.h];
    tl.fromTo(e, { '--pp-f1': 0, '--pp-f2': 0, '--pp-f3': 0, '--pp-f4': 0 }, { '--pp-f1': 0, duration: .01, immediateRender: true }, t);
    let c = t;
    sides.forEach((k, i) => { const d = D * lens[i] / per; tl.fromTo(e, { [k]: 0 }, { [k]: 1, duration: d, ease: 'none', immediateRender: true }, c); c += d; });
    const P = [[b.l, b.t], [b.l + b.w, b.t], [b.l + b.w, b.t + b.h], [b.l, b.t + b.h], [b.l, b.t]];
    follow(tl, slide, t, D, p => along(P, p), false, 'none');
    tl.call(() => clean(e), null, c + .01);
    return D;
  }
  /* ---------- 便签贴上：从上面落下来、翘着角、影子大 → 按平、角落回去 → 轻轻一压 ---------- */
  function stickIn(tl, e, t, vis, tilt) {
    const from = { y: -34, rotation: tilt - 3.5, scale: 1.05, '--pp-curl': 1, '--pp-lift': 1 };
    const to = { y: 0, rotation: tilt, scale: 1, '--pp-curl': 0, '--pp-lift': 0, duration: .46, ease: 'power3.out', immediateRender: true };
    if (vis) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; }
    tl.fromTo(e, from, to, t);
    tl.to(e, { keyframes: [{ y: 2, duration: .05 }, { y: 0, duration: .12, ease: 'power2.out' }] }, t + .44);
    tl.call(() => { clean(e); G.set(e, { clearProps: 'transform' }); }, null, t + .62);
    return .62;
  }

  /* 一样东西怎么「写」到纸上：svg 描线、尺子线和框用尺子、便签贴上、圈码和点打圈、有字的写字、容器里的东西一样样来 */
  function inkIn(tl, x, t, slide) {
    if (x instanceof SVGSVGElement) return drawSvg(tl, x, t, slide);
    if (x instanceof SVGElement) return 0;
    if (x.matches('.pp-rule, .pp-frame')) return ruleIn(tl, x, t, slide);
    if (x.matches('.pp-note, .copy')) return stickIn(tl, x, t, false, tiltOf(x));
    if (x.matches('.pp-no, .pp-dot')) return ringIn(tl, x, t, slide);
    const kids = kidsOf(x);
    if (ownText(x) || !kids.length) return (x.textContent || '').trim() ? writeText(tl, x, t, slide) : 0;
    let c = t, end = 0;
    kids.forEach(k => { const d = inkIn(tl, k, c, slide); end = Math.max(end, c - t + d); c += Math.max(0, d - .06); });
    return end;
  }

  /* 出场 pencil：铅笔写字、描线（容器里的东西按顺序来）；红笔组件自动换红笔 */
  function pencil(tl, e, t, ctx) {
    if (!G) return 0;
    const slide = e.closest('.slide');
    if (e instanceof SVGElement) return drawSvg(tl, e, t, slide);   // svg 里单独带拍的图形：一笔笔描出来
    if (e.matches('.pp-note, .copy')) return stickIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e));
    return Math.min(inkIn(tl, e, t, slide), 1.6);
  }
  /* 出场 ruler：尺子线、尺子框；用在别的元素上时按 pencil */
  function ruler(tl, e, t, ctx) {
    if (!G) return 0;
    if (e.matches && e.matches('.pp-rule, .pp-frame')) return ruleIn(tl, e, t, e.closest('.slide'));
    return pencil(tl, e, t, ctx);
  }
  /* 出场 draw（换掉引擎的描线）：手绘线 svg.sketch、圈注（划线、圈、框）一笔笔描出来，笔尖跟着走；
     圈注写了 data-mark-color="var(--pp-red)" 的换成红笔（红笔订正划掉错的那一道就是这样）；用在文字上时按 pencil */
  function draw(tl, e, t, ctx) {
    if (!G) return 0;
    if (!(e instanceof SVGElement)) return pencil(tl, e, t, ctx);
    return drawSvg(tl, e, t, e.closest('.slide'));
  }
  /* 出场 stick：便签贴上；用在别的元素上时按 pencil */
  function stick(tl, e, t, ctx) {
    if (!G) return 0;
    if (e instanceof SVGElement) return pencil(tl, e, t, ctx);
    return stickIn(tl, e, t, true, ctx && ctx.tilt ? ctx.tilt() : tiltOf(e));
  }

  Deck.scene('paper', {
    label: '方格纸',
    family: 'hand',
    mascot: 'jianjian',       // 默认形象：尖尖（一截铅笔头）
    enter: 'rise',
    // 方格纸自有组件按类名配好出场；可复制的命令也是一张便签，贴上去
    enterBy: { 'pp-hand': 'pencil', 'pp-red': 'pencil', 'pp-no': 'pencil', 'pp-row': 'pencil', 'pp-fig': 'pencil', 'pp-fix': 'pencil',
      'pp-tick': 'pencil', 'pp-arw': 'pencil', 'pp-dot': 'pencil', 'pp-rule': 'ruler', 'pp-frame': 'ruler', 'pp-note': 'stick', copy: 'stick' },
    titleIn: 'pencil',        // 大标题由铅笔写出来
    recede: .8,
    rough: { strokeWidth: 2.6, roughness: 1.1, bowing: 1, markWidth: 3 },   // 墨线
    fx: {
      rise: { from: { autoAlpha: 0, y: 16 }, to: { autoAlpha: 1, y: 0 }, dur: .45, ease: 'power3.out' },   // 上浮得更轻
      pencil, ruler, stick, draw,
    },
    // 铅笔速写的手抖：很轻的一点位移（.pp-fig 里的 svg 用 filter:url(#pp-wobble)）
    defs: '<filter id="pp-wobble" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>',
    // 每张方格纸左边放一列活页孔（放在最前面，压在内容下面）；尺子线补上箭头、尺寸线两头的短竖、坐标轴的刻度
    decorate(slide) {
      slide.insertAdjacentHTML('afterbegin', HOLES);
      slide.querySelectorAll('.pp-rule').forEach(r => {
        if (r.querySelector(':scope > .pp-ah, :scope > .pp-end, :scope > .pp-tk')) return;
        if (r.hasAttribute('data-tick')) r.insertAdjacentHTML('beforeend', '<i class="pp-tk" aria-hidden="true"></i>');
        if (r.classList.contains('dim')) r.insertAdjacentHTML('beforeend', '<i class="pp-end" aria-hidden="true"></i><i class="pp-end" aria-hidden="true"></i>');
        if (r.classList.contains('arrow')) r.insertAdjacentHTML('beforeend', '<i class="pp-ah" aria-hidden="true"></i>');
      });
    },
    // 退一拍：像拿橡皮擦掉——左右蹭两下、淡掉；还在半路的笔尖一起拿走
    onBack({ tl, page, units }) {
      sweep(page && page.el);
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const off = () => G.set(e, { clearProps: 'transform' });
        tl.to(e, { keyframes: [{ x: -6, duration: .05 }, { x: 5, duration: .06 }, { x: -3, duration: .05 }, { x: 0, duration: .05 }], onComplete: off, onInterrupt: off }, 0);
      });
      return { at: .08, gap: .03, y: 0, dur: .2 };
    },
    // 翻页：前进时旧页绕左边翻走，后退时新页从左边翻回来；翻的那张越翻越暗
    pageTurn({ tl, from, to, dir, retire, clear }) {
      sweep(from.el);
      const turner = dir > 0 ? from : to, under = dir > 0 ? to : from;
      const s1 = shade(), s2 = shade();
      turner.el.appendChild(s1); under.el.appendChild(s2);
      turner.el.classList.add('pp-turning'); turner.el.style.zIndex = 3; under.el.style.zIndex = 1;
      const done = () => { s1.remove(); s2.remove(); turner.el.classList.remove('pp-turning'); to.el.style.zIndex = ''; clear(to.el); };
      if (dir > 0) {
        tl.fromTo(from.el, { rotationY: 0, transformPerspective: 4200 }, { rotationY: -92, duration: .75, ease: 'power2.in', onComplete: () => { done(); retire(); } }, 0)
          .fromTo(s1, { opacity: 0 }, { opacity: 1, duration: .75, ease: 'power1.in' }, 0)
          .fromTo(s2, { opacity: .5 }, { opacity: 0, duration: .6, ease: 'power1.out' }, .35);
        return .3;
      }
      tl.fromTo(to.el, { rotationY: -92, transformPerspective: 4200 }, { rotationY: 0, duration: .75, ease: 'power2.out', immediateRender: true, onComplete: () => { done(); retire(); } }, 0)
        .fromTo(s1, { opacity: 1 }, { opacity: 0, duration: .75, ease: 'power1.out' }, 0)
        .fromTo(s2, { opacity: 0 }, { opacity: .5, duration: .5, ease: 'power1.in' }, .2);
      return .2;
    },
    // 离开这个风格（含进阅读模式）时：还在半路的笔尖拿走
    unmount() { sweep(); },
    zones: [
      { x: 0, y: 0, w: 66, h: 1080, name: '活页孔' },
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
