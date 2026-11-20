/* =====================================================================
   形象 · 透透 toutou（液态玻璃 glass 的默认形象）
   - 名字：透透
   - 长相：一颗圆润透亮的玻璃小液滴，和页面上的玻璃是同一种材料。身体近乎无色，靠蓝色细轮廓、
     边缘一圈偏蓝的厚度暗部、贴着内壁的一圈白光、左上一道弧形高光、底部聚起来的一小团焦散亮光，
     表现「透明又厚」；头顶一个微微歪向右边的小尖，是液滴的标志；两只小手是两颗小水珠，平时半藏在身体后面；
     脚下一小片影子，玻璃把光聚起来，所以影子中间带一点亮
   - 画布 viewBox -74 -128 148 134（原点在脚底中点，向上为负），舞台上显示 136×123；脚底在 y=0（foot .955）
   - 姿势（默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     · idle  平常：端正站着，小手垂在两侧，微笑
     · point 指向：身体朝右探 6°，右手拉长成一颗伸出去的水珠，眼睛看向右边
     · happy 开心：身体压扁变宽，两只小手举起，眯眼张嘴，头边冒两颗小星光
     · rest  休息：化成一摊打盹，闭眼，头上冒两颗小泡泡
     · 过渡帧（照样页里透透动起来时的挤压拉伸画成静止的一帧）：
       walk（跑过去时：身体朝前倾、微微拉长，脚下的影子留在地上不画）、
       jump（腾空时：拉长成一滴水，小手往上扬，不画影子）、squat（落地时：压扁一点）
   - 眨眼：opts.blink 为真时，idle、point、walk、jump、squat 的睁眼换成两道闭眼弧线；happy、rest 本来就是眯眼、闭眼
   - 视线：opts.look 是 [x, y]（-1–1，x 正向是面朝的方向，引擎已把镜像算进去）时，眼睛那一组跟着平移，最多横 4、竖 2.5（画像坐标），
     叠在姿势自带的偏移上（指向时眼睛本来就往右看）
   - 渐变、裁切、遮罩写在 defs 里（引擎放进页面公用的 .deck-defs），id 都以 toutou- 开头；
     站着和化成一摊的身体轮廓不同，裁切和遮罩各备两份（-r 结尾的是休息时用的）。每只透透的 SVG 里只引用，不再自带 <defs>
   - 来源：定稿样页（05 液态玻璃）里的 mascotSvg，照原样移植（画法、配色不变）；
     加了 walk、jump、squat 三个过渡帧、视线参数和脚下的影子（样页的影子是单独一个元素，这里画进 SVG）
   ===================================================================== */
(function () {
  'use strict';
  const POSES = ['idle', 'point', 'happy', 'rest', 'walk', 'jump', 'squat'];
  const INK = '#16203A', LINE = 'rgba(30,76,190,.62)', PINK = '#FF8FA6';
  const STAND = 'M2 -118C6 -119 8 -115 9 -112C16 -95 44 -77 46 -43C48 -17 28 0 0 0C-28 0 -48 -17 -46 -43C-44 -73 -14 -91 -2 -113C-1 -116 0 -117.5 2 -118Z';
  const PUDDLE = 'M-58 0C-66 -6 -56 -33 -16 -41C-8 -43 -2 -49 2 -55C4 -58 7 -57 7 -54C8 -48 12 -44 18 -42C54 -36 66 -8 58 0Z';
  const out = (id, d) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="-90" y="-150" width="180" height="162"><rect x="-90" y="-150" width="180" height="162" fill="#fff"/><path d="${d}" fill="#000"/></mask>`;

  const DEFS =
    '<linearGradient id="toutou-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6EAFF" stop-opacity=".62"/><stop offset=".5" stop-color="#BBDCFF" stop-opacity=".46"/><stop offset="1" stop-color="#78AEFF" stop-opacity=".6"/></linearGradient>'
    + '<radialGradient id="toutou-edge" cx=".42" cy=".6" r=".62"><stop offset=".55" stop-color="#5A96FF" stop-opacity="0"/><stop offset=".86" stop-color="#4C88F5" stop-opacity=".15"/><stop offset="1" stop-color="#2F6BE6" stop-opacity=".44"/></radialGradient>'
    + '<radialGradient id="toutou-glow"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    // 脚下的影子：外圈偏蓝的影子，中间聚起来的一点亮
    + '<radialGradient id="toutou-shade"><stop offset="0" stop-color="#1E42AA" stop-opacity=".28"/><stop offset="1" stop-color="#1E42AA" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="toutou-caustic"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    + `<clipPath id="toutou-clip"><path d="${STAND}"/></clipPath><clipPath id="toutou-clip-r"><path d="${PUDDLE}"/></clipPath>`
    + out('toutou-out', STAND) + out('toutou-out-r', PUDDLE);

  // 一颗玻璃小水珠（手、泡泡共用）：同样的填色、暗边、轮廓，加一点高光
  const bead = (cx, cy, rx, ry, rot) => `<g transform="translate(${cx} ${cy}) rotate(${rot || 0})">`
    + `<ellipse rx="${rx}" ry="${ry}" fill="url(#toutou-fill)"/><ellipse rx="${rx}" ry="${ry}" fill="url(#toutou-edge)"/>`
    + `<ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${LINE}" stroke-width="2"/>`
    + `<ellipse cx="${-rx * .35}" cy="${-ry * .4}" rx="${Math.max(1.4, rx * .22)}" ry="${Math.max(1.2, ry * .18)}" fill="#fff" opacity=".9"/></g>`;
  const star = (x, y, s) => `<path transform="translate(${x} ${y})" d="M0 ${-s}Q0 0 ${s} 0Q0 0 0 ${s}Q0 0 ${-s} 0Q0 0 0 ${-s}Z" fill="#fff" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const smile = `<path d="M-5 -34Q0 -29.5 5 -34" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  const cheeks = (y, o) => `<ellipse cx="-22" cy="${y}" rx="6.5" ry="3.8" fill="${PINK}" opacity="${o}"/><ellipse cx="22" cy="${y}" rx="6.5" ry="3.8" fill="${PINK}" opacity="${o}"/>`;
  // 睁眼（带一点白色反光）或眨眼时的弧线；dx dy 是眼睛那一组的平移
  const eyes = (dx, dy, shut) => `<g transform="translate(${dx} ${dy})">` + (shut
    ? `<g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"><path d="M-16 -45Q-11 -41.5 -6 -45"/><path d="M6 -45Q11 -41.5 16 -45"/></g>`
    : `<ellipse cx="-11" cy="-46" rx="5.2" ry="7" fill="${INK}"/><ellipse cx="11" cy="-46" rx="5.2" ry="7" fill="${INK}"/>`
      + '<circle cx="-9.4" cy="-48.6" r="1.9" fill="#fff"/><circle cx="12.6" cy="-48.6" r="1.9" fill="#fff"/>') + '</g>';
  // 左上的弧形高光 + 小亮点；底部焦散亮光；右下一道偏蓝的折射弧
  const SHINE = '<path d="M-33 -52C-31 -64 -22 -78 -11 -89" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".92"/>'
    + '<circle cx="-37" cy="-37" r="3" fill="#fff" opacity=".9"/>'
    + '<ellipse cx="6" cy="-12" rx="23" ry="6.5" fill="url(#toutou-glow)"/>'
    + '<path d="M29 -27C26 -18 19 -13 10 -12" fill="none" stroke="rgba(47,107,230,.2)" stroke-width="4" stroke-linecap="round"/>';
  const SHINE_REST = '<path d="M-44 -16C-40 -26 -30 -33 -18 -36" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>'
    + '<ellipse cx="6" cy="-8" rx="26" ry="5" fill="url(#toutou-glow)"/>';

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const rest = pose === 'rest', body = rest ? PUDDLE : STAND, sfx = rest ? '-r' : '';
    // 视线：叠在姿势自带的眼睛偏移上
    const lk = Array.isArray(o.look) && o.look.length === 2 ? o.look : null;
    const lx = lk ? Math.max(-1, Math.min(1, +lk[0] || 0)) * 4 : 0, ly = lk ? Math.max(-1, Math.min(1, +lk[1] || 0)) * 2.5 : 0;
    const shut = !!o.blink;
    let arms = '', face = '', extra = '', wrap = '';
    if (pose === 'idle' || pose === 'squat') {
      if (pose === 'squat') wrap = 'scale(1.1 .9)';
      arms = bead(-44, -22, 8, 6.5, -20) + bead(44, -22, 8, 6.5, 20);
      face = eyes(lx, ly, shut) + cheeks(-34, .5) + smile;
    } else if (pose === 'walk') {
      wrap = 'rotate(5) scale(.96 1.05)';
      arms = bead(-46, -26, 8, 6.5, -30) + bead(42, -18, 8, 6.5, 30);
      face = eyes(3 + lx, ly, shut) + cheeks(-34, .5) + smile;
    } else if (pose === 'jump') {
      wrap = 'scale(.88 1.14)';
      arms = bead(-46, -40, 7, 7.5, -40) + bead(46, -40, 7, 7.5, 40);
      face = eyes(lx, ly - 1, shut) + cheeks(-34, .5) + smile;
    } else if (pose === 'point') {
      wrap = 'rotate(6)';
      arms = bead(-44, -22, 8, 6.5, -20) + bead(57, -55, 14.5, 7, -18);
      face = eyes(5 + lx * .5, -1 + ly, shut) + cheeks(-34, .5) + `<path d="M-3 -34.5Q2 -29 7 -34.5" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    } else if (pose === 'happy') {
      wrap = 'scale(1.07 .93)';
      arms = bead(-44, -70, 6.5, 11, -34) + bead(44, -70, 6.5, 11, 34);
      face = `<g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M-16 -44Q-11 -52 -6 -44"/><path d="M6 -44Q11 -52 16 -44"/></g>`
        + cheeks(-34, .78) + `<path d="M-6.5 -35Q0 -23 6.5 -35Z" fill="${INK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
      extra = star(-52, -104, 7) + star(54, -96, 5);
    } else {                                                   // rest
      face = `<g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"><path d="M-16 -24Q-11 -20.5 -6 -24"/><path d="M6 -24Q11 -20.5 16 -24"/></g>`
        + `<ellipse cx="-22" cy="-15" rx="6" ry="3.4" fill="${PINK}" opacity=".5"/><ellipse cx="22" cy="-15" rx="6" ry="3.4" fill="${PINK}" opacity=".5"/>`
        + `<path d="M-3 -14Q0 -12 3 -14" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
      extra = bead(30, -64, 5.5, 5.5) + bead(41, -80, 3.6, 3.6);
    }
    // 脚下的影子：腾空的两帧（跑、跳）不画
    const shade = pose === 'walk' || pose === 'jump' ? ''
      : `<ellipse cx="2" cy="1" rx="${rest ? 56 : 46}" ry="6.5" fill="url(#toutou-shade)"/><ellipse cx="2" cy="1" rx="${rest ? 56 : 46}" ry="6.5" fill="url(#toutou-caustic)"/>`;
    return `<svg viewBox="-74 -128 148 134" aria-hidden="true" focusable="false" overflow="visible">${shade}`
      + `<g transform="${wrap}">`
      +   `<g mask="url(#toutou-out${sfx})">${arms}</g>`
      +   `<path d="${body}" fill="url(#toutou-fill)"/>`
      +   `<path d="${body}" fill="url(#toutou-edge)"/>`
      +   `<g clip-path="url(#toutou-clip${sfx})"><path d="${body}" fill="none" stroke="#fff" stroke-width="7" opacity=".55"/>${rest ? SHINE_REST : SHINE}</g>`
      +   `<path d="${body}" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>`
      +   face
      + `</g>${extra}</svg>`;
  }

  const def = {
    label: '透透',
    svg,
    size: [136, 123],        // 舞台上的外框（样页里透透的大小）；看得见的身子约 112px 高
    foot: .955,              // 脚底在 y=0（128/134）：站上沿、落地压扁都以它为准
    frames: ['walk', 'jump', 'squat'],
    flipSvg: false,          // 朝左时由引擎用 CSS 镜像
    outline: true,           // 浅色底的风格里引擎本来就不描边；放到深色底的风格里时由引擎加一圈浅色描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('toutou', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「透透」先不注册，换成支持形象注册的引擎后会自动出现');
})();
