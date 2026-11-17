/* =====================================================================
   风格 · 像素手账 journal（手绘家）
   - 样子：很淡的点阵纸、墨绿字、琥珀色强调；正文是手写楷体，
     像素感只留给形象的对话框、「已复制」提示框和节拍格（像素小方格，当前一格蹦一下）
   - 适合讲：以角色为主线的章节、讲原理的示意图
   - 出场：字从左往右写出来，同时轻轻落下 8px（不丢掉元素自己的倾斜）
   - 翻页：用引擎默认的整页横移，像翻手账
   - 复制：页上有形象时形象蹦一下喊「已复制！」，命令框变绿，不再放提示框；没有形象才放像素提示框
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和像素节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 大标题是 72px，比别的风格大一号，第 0 拍的解释句跟着往下让到 y 200
   - 样子在 journal.css 里
   ===================================================================== */
(function () {
  'use strict';

  Deck.scene('journal', {
    label: '像素手账',
    family: 'hand',
    mascot: 'diandian',       // 默认形象：点点（像素墨水瓶）
    enter: 'write',
    titleIn: 'write',
    recede: .8,
    ease: { write: 'power2.out' },
    rough: { strokeWidth: 2.4, roughness: 1.1, bowing: .8, hachureGap: 13, hachureAngle: -38, fillWeight: 3, markWidth: 3 },   // 细墨线，填充线疏一点
    fx: {
      // 写字：从左往右露出来，同时从下面 8px 落到位
      write(tl, e, t, ctx) {
        const from = { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% -6%)' };
        const to = { clipPath: 'inset(-30% -6% -30% -6%)', duration: ctx.dur, ease: ctx.ease, immediateRender: true, onComplete: ctx.done };
        if (!(e instanceof SVGElement)) {
          const tilt = ctx.tilt();
          from.y = 8; to.y = 0;
          if (tilt) { from.rotation = tilt; to.rotation = tilt; }
        }
        tl.fromTo(e, from, to, t);
        return ctx.dur;
      },
    },
    // 「已复制」提示框像素式地一格格弹出
    copied({ tl, tip }) {
      tl.fromTo(tip, { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, duration: .22, ease: 'steps(3)' });
    },
    mascotSay: { copied: '已复制！' },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
