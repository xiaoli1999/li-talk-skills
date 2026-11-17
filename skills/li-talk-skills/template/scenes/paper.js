/* =====================================================================
   风格 · 方格纸 paper（手绘家）
   - 样子：浅色方格纸，左侧一列活页孔；墨色线框，黄色荧光笔划重点；
     带颜色的卡片是贴上去的便签，可复制的命令是一张翘起纸角的黄便签，「已复制」是绿笔打勾
   - 适合讲：开场、总览、愿景、收尾。不适合大段代码、密集数据
   - 出场：内容轻轻上浮（比默认的 rise 幅度小），大标题一笔写出来
   - 翻页：整张活页绕左侧的孔翻过去
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左边一列活页孔：孔在 x 36–58，外圈淡影到 65，整列 x < 66 不要放内容
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 样子在 paper.css 里
   ===================================================================== */
(function () {
  'use strict';
  const HOLES = '<div class="pp-holes" aria-hidden="true">' + '<i></i>'.repeat(8) + '</div>';
  const shade = () => { const d = document.createElement('div'); d.className = 'pp-shade'; return d; };

  Deck.scene('paper', {
    label: '方格纸',
    family: 'hand',
    enter: 'rise',
    titleIn: 'write',
    recede: .55,
    rough: { strokeWidth: 2.6, roughness: 1.1, bowing: 1, markWidth: 3 },   // 墨线
    fx: {
      rise: { from: { autoAlpha: 0, y: 16 }, to: { autoAlpha: 1, y: 0 }, dur: .45, ease: 'power3.out' },   // 上浮得更轻
    },
    // 每张方格纸左边放一列活页孔（放在最前面，压在内容下面）
    decorate(slide) { slide.insertAdjacentHTML('afterbegin', HOLES); },
    // 翻页：前进时旧页绕左边翻走，后退时新页从左边翻回来；翻的那张越翻越暗
    pageTurn({ tl, from, to, dir, retire, clear }) {
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
    zones: [
      { x: 0, y: 0, w: 66, h: 1080, name: '活页孔' },
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
