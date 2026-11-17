/* =====================================================================
   风格 · 工位桌面 desk（手绘家）
   - 样子：很淡的米色木纹桌面，内容是落在桌上的白纸、便签；纸胶带贴章节，珊瑚红马克笔划重点；
     可复制的命令是标签机打出来的黑条，「已复制」是一个红色印章；线稿带铅笔的毛边（SVG 滤镜 pencil）
   - 适合讲：讲者自己的故事、多方协作
   - 出场：纸从上面落到桌上，落地前略微抬起、带一点投影；命令条按标签机的样子一格格打出来；
     大标题淡入
   - 翻页：旧纸被推到一边，新的一张滑进来
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和图钉节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 样子在 desk.css 里
   ===================================================================== */
(function () {
  'use strict';

  Deck.scene('desk', {
    label: '工位桌面',
    family: 'hand',
    enter: 'drop',
    enterBy: { copy: 'print' },   // 命令条：标签机打字
    titleIn: 'fade',
    recede: .6,
    rough: { strokeWidth: 2.2, roughness: 1.3, bowing: 1.2, markWidth: 2.8 },   // 铅笔
    fx: {
      // 纸落得更像样页：起点低一点、回弹多一点
      drop: { from: { autoAlpha: 0, y: -50, scale: 1.08, rotation: 4, '--lift': 1 }, to: { autoAlpha: 1, y: 0, scale: 1, rotation: 0, '--lift': 0 }, dur: .55, ease: 'back.out(1.7)' },
    },
    defs: `<filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
      <filter id="stamp-ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.45" result="holes"/><feComposite in="SourceGraphic" in2="holes" operator="in" result="ink"/><feDisplacementMap in="ink" in2="t" scale="2.5"/></filter>`,
    // 翻页：旧纸往一边推走，新的一张从另一边滑进来
    pageTurn({ tl, from, to, dir, retire, clear }) {
      tl.to(from.el, { x: -160 * dir, rotation: -1.2 * dir, autoAlpha: 0, duration: .45, ease: 'power2.in', onComplete: retire }, 0);
      tl.fromTo(to.el, { x: 200 * dir, rotation: 1.5 * dir, autoAlpha: 0 }, { x: 0, rotation: 0, autoAlpha: 1, duration: .6, ease: 'power3.out', immediateRender: true, onComplete: () => clear(to.el) }, .2);
      return .25;
    },
    // 「已复制」：盖一个印章
    copied({ tl, tip }) {
      tl.fromTo(tip, { autoAlpha: 0, scale: 2.2, rotation: -26 }, { autoAlpha: .92, scale: 1, rotation: -10, duration: .2, ease: 'power3.in' });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
