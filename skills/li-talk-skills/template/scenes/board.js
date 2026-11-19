/* =====================================================================
   风格 · 黑板 board（手绘风，深色底）
   - 样子：干净的深绿板面，只有白粉笔和一支黄粉笔（--t-* 几种颜色在这里都是白或黄），
     字和线都带粉笔的毛边（SVG 滤镜 chalk-text）；重点词先白粉笔写、再用黄粉笔描一遍；
     板子底下一条木头粉笔槽，槽里放一白一黄两支粉笔和一块板擦
   - 适合讲：基础教学、命令清单、安装步骤
   - 出场：一笔一笔写出来，同一拍里先画线、再写字；退一拍时板擦把这一拍的内容擦掉；
     翻页时板擦把整块板擦一遍再写下一页；节拍格是板角的「正」字，五拍一个字
   - 讲过的拍只退到 .8（recede）：投影上不发虚；讲过的板书不擦、不另调灰
   - 同一拍里的先后（plan）：线稿先一条条画完，再写字；线稿写了 data-delay 的（比如标题底下的双横线），
     不抢在前头画，和字一起按 data-delay 排在后面
   - 黑板自有的版式组件（类名带 bd- 前缀，样子和写法见 board.css 末尾「黑板自有版式组件」；别的风格不认识，只是普通容器）。
     每拍「发生了什么」是上课写板书：粉笔一行行写出来、画框、画下划线、在行首点一下，不是卡片淡入。
     出场都是「粉笔写」bdchalk（enterBy 按类名配好，页面不用写 data-in）：
     · .bd-note 板书块：里面每个子元素（p、div）是一行，一行写完再写下一行
     · .bd-box 粉笔框：先用粉笔沿四边画一个框，再一行行写里面的字；加 after 是先写字、最后把框圈上去（圈结论用），
       加 round 是椭圆框（框图中间的主题），加 y 是黄粉笔框（算一处强调）
     · .bd-line 板书一行：一整行从左往右写出来，写完在行首点一个粉笔点；正在讲的那一行点是黄的，讲过的点变回白粉笔
       （这就是「讲到哪了」：不靠把别的行弄淡）
     · 写在行里的小件：.bd-no 圈号（一个数字外面画一个圈，跟着这一行写出来）、.bd-ul 白粉笔下划线（这一行写完再划）
     · 简笔画、分支、分隔线不另做组件，用通用的 svg.sketch（引擎换成粉笔线、一笔笔画出来）
   - 自己加的出场名：bdchalk，只在这个风格里认（别的风格会提醒并换成它的默认出场）；页面里不用写，按类名自动选
   - 可读性：组件不藏字、不另加透明度；黄粉笔只给重点（重点词、正在讲的那一行的点、y 框），一页加起来不超过 3 处；
     字一律横排、不歪；说明用 --ink-2（浅灰绿粉笔），名字、数字用 --ink（白粉笔）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 底部粉笔槽：木边顶在 y 1018，粉笔顶到 y 1007，y ≥ 1000 不要放内容
     · 槽里的板擦立在右边，x 1470–1620、y 978 起
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和「正」字节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 样子在 board.css 里
   ===================================================================== */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let eraser = null;        // 飞起来擦板的板擦（在舞台里，mount 时放上去）
  let ledgeEraser = null;   // 粉笔槽里那块板擦（在背景层里）

  /* 板擦在一块区域（舞台坐标 { l, t, w, h }）上来回擦，从第 t 秒开始，返回用时 */
  function sweep(tl, box, t) {
    if (!eraser) return 0;
    const rows = clamp(Math.round(box.h / 170), 1, 4), pts = [];
    for (let i = 0; i < rows; i++) { const y = box.t + box.h * (i + .5) / rows; pts.push([i % 2 ? box.l + box.w : box.l, y], [i % 2 ? box.l : box.l + box.w, y]); }
    const seg = .46 / pts.length;
    tl.set(eraser, { x: pts[0][0], y: pts[0][1], rotation: -6, opacity: 1 }, t);
    if (ledgeEraser) tl.set(ledgeEraser, { opacity: 0 }, t);   // 槽里那块板擦被拿起来
    pts.slice(1).forEach((q, i) => tl.to(eraser, { x: q[0], y: q[1], rotation: i % 2 ? 7 : -8, duration: seg, ease: 'sine.inOut' }, t + i * seg));
    tl.to(eraser, { opacity: 0, duration: .12 }, t + .46);
    if (ledgeEraser) tl.set(ledgeEraser, { opacity: 1 }, t + .58);
    return .58;
  }

  /* =================================================================
     黑板自有版式组件的出场「粉笔写」bdchalk（.bd-note、.bd-box、.bd-line）
     - 写字：clip-path 从左往右放开，匀速（粉笔写字不加速），一行用时按宽度算（和引擎的 write 一样，.3–.65 秒）
     - 画框：.bd-box::before 上的框用 conic-gradient 遮罩，--bd-f 从 0 推到 1，像粉笔从左上角起笔绕一圈
     - 圈号 --bd-r、下划线 --bd-u、行首的点 --bd-d 也都是 0 到 1，CSS 里默认是 1（阅读模式、总览、直接跳拍都是画好的样子）
     - 引擎不清函数出场留下的行内样式，这里在时间线末尾自己清（只清自己动过的几项，页面写的 left、top 不动）
     ================================================================= */
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, script, style';
  const LINE = ['opacity', 'visibility', 'clip-path', '--bd-r', '--bd-u', '--bd-d'], ALL = LINE.concat('--bd-f');
  const clean = (e, keys = ALL) => { if (e && e.style) keys.forEach(k => e.style.removeProperty(k)); };
  /* 跟着一起写的子元素：自己另有 data-beat 的不算（它在自己那一拍写） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  /* 容器里直接写了字（没包进 p）：只能整块一起写 */
  const looseText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const lineDur = e => clamp((e.offsetWidth || 600) / 1900 + .2, .3, .65);
  const mine = (e, sel) => (e.matches(sel) ? [e] : []).concat([...e.querySelectorAll(sel)].filter(c => { const b = c.closest('[data-beat]'); return !b || b === e || !e.contains(b); }));

  /* 写一行：字从左往右写出来；行里的圈号跟着画圈；写完划下划线；.bd-line 最后在行首点一下。返回用时 */
  function writeLine(tl, e, t, unit) {
    const d = lineDur(e);
    const from = { clipPath: 'inset(-30% 100% -30% -6%)' }, to = { clipPath: 'inset(-30% -6% -30% -6%)', duration: d, ease: 'none', immediateRender: true };
    if (unit) { from.autoAlpha = 1; to.autoAlpha = 1; }
    tl.fromTo(e, from, to, t);
    const rings = mine(e, '.bd-no'), uls = mine(e, '.bd-ul');
    rings.forEach(r => tl.fromTo(r, { '--bd-r': 0 }, { '--bd-r': 1, duration: .3, ease: 'power1.inOut', immediateRender: true }, t));
    let end = d;
    uls.forEach((u, i) => {
      const s = d - .04 + i * .06;
      tl.fromTo(u, { '--bd-u': 0 }, { '--bd-u': 1, duration: .2, ease: 'power1.out', immediateRender: true }, t + s);
      end = Math.max(end, s + .2);
    });
    if (e.matches('.bd-line')) {
      tl.fromTo(e, { '--bd-d': 0 }, { '--bd-d': 1, duration: .24, ease: 'back.out(3)', immediateRender: true }, t + end - .02);
      end += .22;
    }
    const all = [e].concat(rings, uls);
    tl.call(() => all.forEach(x => clean(x, LINE)), null, t + end);   // 框（--bd-f）由 bdchalk 自己清
    return end;
  }
  /* 画框：粉笔从左上角起笔绕一圈 */
  function frameIn(tl, e, t) {
    tl.fromTo(e, { '--bd-f': 0 }, { '--bd-f': 1, duration: .42, ease: 'power1.inOut', immediateRender: true }, t);
    return .42;
  }
  function bdchalk(tl, e, t, ctx) {
    if (e instanceof SVGElement || !e.matches('.bd-note, .bd-box, .bd-line')) {
      // 用在别的元素上：整块写出来（和内置的 write 一样）
      if (e instanceof SVGElement) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, immediateRender: true, onComplete: ctx.done }, t); return .3; }
      return writeLine(tl, e, t, true);
    }
    const box = e.matches('.bd-box'), after = box && e.matches('.after');
    const kids = e.matches('.bd-line') || looseText(e) ? [] : kidsOf(e);
    if (!kids.length) {
      // 一整块一起写（.bd-line，或字没包进 p 的容器）；框里的字没分行时，框和字同时出来
      const d = box ? Math.max(writeLine(tl, e, t, true), frameIn(tl, e, t)) : writeLine(tl, e, t, true);
      if (box) tl.call(() => clean(e), null, t + d);
      return d;
    }
    tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true }, t);
    let c = t;
    if (box && !after) c += frameIn(tl, e, c) - .08;
    kids.forEach(k => { c += writeLine(tl, k, c, false) - .04; });
    if (after) c += .06 + frameIn(tl, e, c + .06);
    tl.call(() => clean(e), null, c);
    return c - t;
  }

  Deck.scene('board', {
    label: '黑板',
    family: 'hand',
    dark: true,               // 深色底：引擎给形象加浅色描边
    mascot: 'shasha',         // 默认形象：沙沙（一截白粉笔头，自带亮色，不用引擎描边）
    enter: 'write',
    // 黑板自有组件：粉笔写（板书块一行行写、粉笔框先画框再写、板书一行写完在行首点一下）
    enterBy: { 'bd-note': 'bdchalk', 'bd-box': 'bdchalk', 'bd-line': 'bdchalk' },
    fx: { bdchalk },
    titleIn: 'write',
    recede: .8,
    ease: { write: 'none' },   // 粉笔匀速写
    rough: { strokeWidth: 4, roughness: 1, bowing: .9, markWidth: 4.6 },   // 粗粉笔
    defs: `<filter id="chalk-text" x="-4%" y="-12%" width="108%" height="124%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="11" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -4 0 0 0 3.5" result="ga"/>
        <feComposite in="d" in2="ga" operator="in"/></filter>`,
    // 背景层里放粉笔槽：一条木边、一白一黄两支粉笔、一块板擦
    backdrop(layer) {
      layer.innerHTML = `<div class="bd-ledge"><i style="left:300px;width:118px;--c:#F1EEE6;rotate:-2deg"></i><i style="left:450px;width:74px;--c:#FFDC6A;rotate:3deg"></i><b style="right:300px"></b></div>`;
      ledgeEraser = layer.querySelector('.bd-ledge b');
    },
    // 变成当前风格时把飞的板擦放上舞台，离开时拿走
    mount(stage) {
      if (!eraser) { eraser = document.createElement('div'); eraser.className = 'bd-eraser'; eraser.dataset.scene = 'board'; eraser.setAttribute('aria-hidden', 'true'); }
      stage.appendChild(eraser);
    },
    unmount() { if (eraser) eraser.remove(); },
    // 同一拍里先把线稿一条条画完，再写字；写了 data-delay 的线稿（标题底下的双横线这类）和字一起排，按 data-delay 往后放
    plan(units, { base, drawDur }) {
      const at = new Map();
      let t = 0;
      units.forEach(u => { if (u.el instanceof SVGElement && !u.child && u.fx === 'draw' && !u.el.hasAttribute('data-delay')) { at.set(u, base + t); t += drawDur(u.el) * .85; } });
      return units.map(u => at.has(u) ? at.get(u) : base + t * .9 + u.start);
    },
    // 退一拍：板擦在这一拍的内容上来回擦一遍，内容在擦过时消失
    onBack({ tl, box }) {
      if (!box) return;
      sweep(tl, { l: box.l - 20, t: box.t - 10, w: box.w + 40, h: box.h + 20 }, 0);
      return { at: .12, gap: .05, y: 0, dur: .16, childAt: .5 };
    },
    // 翻页：板擦把整块板擦一遍，再写下一页
    pageTurn({ tl, from, to, retire, clear }) {
      sweep(tl, { l: 160, t: 160, w: 1600, h: 760 }, 0);
      tl.to(from.el, { autoAlpha: 0, duration: .4, ease: 'power1.in', onComplete: retire }, .1);
      tl.fromTo(to.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, immediateRender: true, onComplete: () => clear(to.el) }, .5);
      return .52;
    },
    // 「已复制」：黄粉笔先打勾，再匀速写出字
    copied({ tl, tip }) {
      const path = tip.querySelector('path'), txt = tip.querySelector('span');
      const L = path.getTotalLength() + 2;
      tl.set(tip, { autoAlpha: 1 })
        .fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .26, ease: 'power2.out' })
        .fromTo(txt, { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -5% -20% 0)', duration: .32, ease: 'none' }, '-=.04');
    },
    zones: [
      { x: 0, y: 1000, w: 1920, h: 80, name: '粉笔槽' },
      { x: 1470, y: 978, w: 150, h: 46, name: '槽里的板擦' },
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
