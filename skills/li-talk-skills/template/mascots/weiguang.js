/* =====================================================================
   形象 · 微光 weiguang（科技暗黑 dark 的默认形象）
   - 名字：微光
   - 长相：一枚悬浮的钛灰色圆角小方块探测器。外形只有一个圆角方块和两只悬浮的小胶囊手，
     轮廓极简，投影上一眼认得出；正面一块深色玻璃面罩，里面一条柔光眼灯（冰蓝 #8CC0FF），
     是全身唯一的亮色，和科技暗黑的强调色同一家；方块一圈从上往下渐隐的亮边，在近黑底上自己勾出轮廓
     （所以 outline: false，引擎不用再给它加浅色描边）；身下一圈淡淡的悬浮光晕，说明它是飘着的。
     静止时完全不动（不做循环漂浮），只在换拍、被点、偶尔的小动作时动
   - 画布 120×128，舞台上显示 144×154；悬浮光晕的底边在 y≈116（foot .9）：站在目标上沿时是光晕踩在线上，
     机身飘在线的上方，光晕不会落进目标框里
   - 姿势（默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     · idle  平常：悬停，双手垂在两侧，眼灯是一条横向胶囊，略微看向前方
     · point 指向：身体朝前探 7°，前手平伸出去，眼灯看向前方
     · happy 开心：眼灯弯成一道笑眼弧，双手举起，身体轻轻上浮
     · rest  休息：落地待机，身体下沉、微微侧倒，眼灯收成一条暗线，悬浮光晕熄灭、换成接地的影子
     · 过渡帧：walk（飞过去时：身体朝前倾、双手往后拖）、jump（腾空转圈时：身体拉长上提、双手往后下方拖、光晕变小变淡）、
       squat（落地蹲一下：身体压扁下沉、双手张开撑住、光晕变大变亮）
   - 眨眼：opts.blink 为 true 时眼灯竖向压成一条缝（等价于眼灯闪一下），引擎播 100–150ms 再换回来；
     开心（笑眼弧）和休息（暗线）没有眨眼帧
   - 视线：opts.look 是 [x, y]（-1–1，x 正向是面朝的方向，引擎已把镜像算进去）时眼灯跟着平移，最多横 7、竖 3（画像坐标）；
     没给时 idle、point、walk、jump 默认略微往前看
   - 渐变和柔光滤镜写在 defs 里（引擎放进页面公用的 .deck-defs），id 都以 weiguang- 开头；每只微光的 SVG 里只引用，不再自带 <defs>
   - 来源：定稿样页（科技暗黑）里的 mascotSvg，照原样移植；新增了 walk、jump、squat 三个过渡帧和眨眼帧
   ===================================================================== */
(function () {
  'use strict';
  const POSES = ['idle', 'point', 'happy', 'rest', 'walk', 'jump', 'squat'];

  const DEFS =
    '<linearGradient id="weiguang-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#868F9D"/><stop offset=".5" stop-color="#464D58"/><stop offset="1" stop-color="#1D2127"/></linearGradient>'
    + '<linearGradient id="weiguang-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#9CC6FF" stop-opacity=".4"/></linearGradient>'
    + '<linearGradient id="weiguang-under" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#8CC0FF" stop-opacity="0"/><stop offset="1" stop-color="#8CC0FF" stop-opacity=".3"/></linearGradient>'
    + '<radialGradient id="weiguang-pool"><stop offset="0" stop-color="#9CC8FF" stop-opacity=".6"/><stop offset="1" stop-color="#9CC8FF" stop-opacity="0"/></radialGradient>'
    + '<filter id="weiguang-glow" x="-60%" y="-150%" width="220%" height="400%"><feGaussianBlur stdDeviation="3"/></filter>';

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const rest = pose === 'rest', happy = pose === 'happy', point = pose === 'point';
    const walk = pose === 'walk', jump = pose === 'jump', squat = pose === 'squat';
    const by = rest ? 10 : happy ? -3 : squat ? 5 : jump ? -5 : walk ? -2 : 0;   // 身体上下偏移
    const tilt = point ? 7 : walk ? 10 : rest ? -5 : 0;                          // 身体倾斜（正值朝前）
    // 视线：引擎给了 look 就照着移眼灯，没给就按姿势往前看一点（朝向内容）
    const lk = Array.isArray(o.look) && o.look.length === 2 && !rest && !happy ? o.look : null;
    const look = lk ? Math.max(-1, Math.min(1, +lk[0] || 0)) * 7 : point || walk ? 6 : pose === 'idle' ? 3 : jump ? 4 : 0;
    const lookY = lk ? Math.max(-1, Math.min(1, +lk[1] || 0)) * 3 : 0;
    // 身体压扁 / 拉长（以机身底边中点为原点）
    const body = squat ? 'translate(60 88) scale(1.07 .9) translate(-60 -88)' : jump ? 'translate(60 88) scale(.95 1.06) translate(-60 -88)' : '';
    // 手：外层 g 留给动画用，姿势自带的旋转写在里面的 rect 上
    const hand = (cls, x, y, w, h, r) => `<g class="wg-hand ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" transform="rotate(${r} ${x + w / 2} ${y + h / 2})" fill="url(#weiguang-body)" stroke="url(#weiguang-rim)" stroke-width="1.4"/></g>`;
    let hands;
    if (point) hands = hand('wg-hand-b', 11, 58, 10, 22, 14) + hand('wg-hand-f', 98, 49, 24, 10, -6);
    else if (happy) hands = hand('wg-hand-b', 8, 20, 10, 22, -32) + hand('wg-hand-f', 102, 20, 10, 22, 32);
    else if (rest) hands = hand('wg-hand-b', 13, 82, 10, 18, -6) + hand('wg-hand-f', 97, 82, 10, 18, 6);
    else if (walk) hands = hand('wg-hand-b', 11, 55, 10, 22, 24) + hand('wg-hand-f', 99, 55, 10, 22, 24);
    else if (squat) hands = hand('wg-hand-b', 6, 54, 10, 22, 34) + hand('wg-hand-f', 104, 54, 10, 22, -34);
    else if (jump) hands = hand('wg-hand-b', 14, 62, 10, 22, -16) + hand('wg-hand-f', 96, 62, 10, 22, 16);
    else hands = hand('wg-hand-b', 10, 54, 10, 22, 8) + hand('wg-hand-f', 100, 54, 10, 22, -8);
    // 眼灯
    let eye;
    if (happy) {
      const d = `M48 ${60 + by} Q60 ${47 + by} 72 ${60 + by}`;
      eye = `<path d="${d}" fill="none" stroke="#8CC0FF" stroke-width="8" stroke-linecap="round" filter="url(#weiguang-glow)"/><path d="${d}" fill="none" stroke="#EAF5FF" stroke-width="4.4" stroke-linecap="round"/>`;
    } else if (rest) {
      eye = `<rect x="48" y="${60.5 + by}" width="24" height="2.6" rx="1.3" fill="#8CC0FF" opacity=".55"/>`;
    } else {
      eye = `<rect x="45" y="${50 + by}" width="30" height="10" rx="5" fill="#8CC0FF" filter="url(#weiguang-glow)"/><rect x="47" y="${51 + by}" width="26" height="8" rx="4" fill="#EAF5FF"/>`;
      if (o.blink) { const cy = 55 + by; eye = `<g transform="translate(0 ${cy}) scale(1 .12) translate(0 ${-cy})">${eye}</g>`; }
    }
    // 身下：悬浮光晕（过渡帧时变大变亮或变小变淡）/ 休息时的接地阴影
    const pr = squat ? 33 : jump ? 19 : walk ? 24 : 28, po = squat ? 1 : jump ? .5 : walk ? .7 : .85;
    const ground = rest
      ? `<ellipse cx="60" cy="101" rx="34" ry="3.2" fill="#000" opacity=".8" filter="url(#weiguang-glow)"/>`
      : `<ellipse class="wg-pool" cx="60" cy="111" rx="${pr}" ry="5" fill="url(#weiguang-pool)" opacity="${po}"/><ellipse cx="60" cy="111" rx="${pr * .43}" ry="1.4" fill="#CFE6FF" opacity="${happy ? .65 : jump ? .25 : .42}"/>`;
    const under = rest ? '' : `<rect x="26" y="${26 + by}" width="68" height="62" rx="22" fill="url(#weiguang-under)"/>`;
    return `<svg viewBox="0 0 120 128" aria-hidden="true" overflow="visible">${ground}<g class="wg-fig"${body ? ` transform="${body}"` : ''}>${hands}`
      + `<g transform="rotate(${tilt} 60 ${72 + by})">`
      +   `<rect x="26" y="${26 + by}" width="68" height="62" rx="22" fill="url(#weiguang-body)" stroke="url(#weiguang-rim)" stroke-width="1.6"/>${under}`
      +   `<path d="M42 ${29 + by} Q60 ${27.2 + by} 78 ${29 + by}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>`
      +   `<rect x="33" y="${38 + by}" width="54" height="34" rx="13" fill="#06080B" stroke="#fff" stroke-opacity=".1"/>`
      +   `<path d="M39 ${47 + by} Q39.5 ${42 + by} 45 ${41.5 + by}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.6" stroke-linecap="round"/>`
      +   `<g class="wg-eye" transform="translate(${look} ${lookY})">${eye}</g>`
      + `</g></g></svg>`;
  }

  const def = {
    label: '微光',
    svg,
    size: [144, 154],        // 舞台上的外框；看得见的身子（含手和光晕）约 115px 高
    foot: .9,                // 悬浮光晕的底边（116/128）：站上沿、落地压扁都以它为准
    frames: ['walk', 'jump', 'squat'],
    flipSvg: false,          // 朝左时由引擎用 CSS 镜像
    outline: false,          // 自带亮边，深色底上不用再加描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('weiguang', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「微光」先不注册，换成支持形象注册的引擎后会自动出现');
})();
