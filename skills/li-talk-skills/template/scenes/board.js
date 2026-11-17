/* =====================================================================
   风格 · 黑板 board（手绘家，深色底）
   - 样子：干净的深绿板面，只有白粉笔和一支黄粉笔（--t-* 几种颜色在这里都是白或黄），
     字和线都带粉笔的毛边（SVG 滤镜 chalk-text）；重点词先白粉笔写、再用黄粉笔描一遍；
     板子底下一条木头粉笔槽，槽里放一白一黄两支粉笔和一块板擦
   - 适合讲：基础教学、命令清单、安装步骤
   - 出场：一笔一笔写出来，同一拍里先画线、再写字；退一拍时板擦把这一拍的内容擦掉；
     翻页时板擦把整块板擦一遍再写下一页；节拍格是板角的「正」字，五拍一个字
   - 讲过的拍只退到 .74：投影上不发虚
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

  Deck.scene('board', {
    label: '黑板',
    family: 'hand',
    dark: true,               // 深色底：引擎给形象加浅色描边
    mascot: 'shasha',         // 默认形象：沙沙（一截白粉笔头，自带亮色，不用引擎描边）
    enter: 'write',
    titleIn: 'write',
    recede: .74,
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
    // 同一拍里先把线稿一条条画完，再写字
    plan(units, { base, drawDur }) {
      const at = new Map();
      let t = 0;
      units.forEach(u => { if (u.el instanceof SVGElement && !u.child && u.fx === 'draw') { at.set(u, base + t); t += drawDur(u.el) * .85; } });
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
