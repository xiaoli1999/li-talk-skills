/* =====================================================================
   形象 · 小雾 xiaowu（毛玻璃 frost 的默认形象）
   - 名字：小雾，一块会动的磨砂玻璃小果冻
   - 长相：外形取自毛玻璃的磨砂卡片——近似超椭圆的圆角方块，像被捏圆了的一小片毛玻璃，一眼看出和卡片是一家；
     身体是乳白的半透明磨砂，里面透出紫、粉、蓝、杏四团柔和的彩色反光（就是背景光斑隔着磨砂的样子）；
     白色细亮边 + 外侧一圈极淡的靛紫细线，浅底上轮廓也清楚；左上角一道高光，右下角一段彩虹色折光；
     小圆手、小圆脚也是同样的磨砂小件；脸（眼睛、腮红、嘴）整组平移，表现「看向」哪里
   - 姿势（svg(pose, opts) 的 pose；默认朝右，朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     · idle  平常：两只小圆手垂在身侧，圆眼睛、小微笑
     · point 指向：身体往前探 6°，前面那只手伸出去指
     · happy 开心：眯成两道弯的笑眼、张嘴、双手举起，身边冒出两颗小星光
     · rest  休息：摊成一块矮软垫趴着打盹，闭眼，头顶飘一颗小泡泡
   - 眨眼：opts.blink 为真时，idle、point 的圆眼睛换成两道向下弯的弧（引擎随机 2.5–6 秒眨一次，闭 140ms）；
     happy（笑眼）、rest（闭眼）本来就闭着眼，不眨
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边）时整张脸跟着平移，最多横 3.4、竖 2.2（画像坐标）；
     没给时 point 略往前下方看（看卡片里的字），其余正视；rest 的脸固定略往下
   - 画布 120×120，舞台上显示 136×136，身形约 108px 高；脚底在 y≈111.5（foot .93），打盹时软垫底边也落在这条线上
   - 自带白色亮边（outline: false），深色底上也不用引擎再描边
   - 渐变和身体的裁切写在 defs 里（引擎放进页面公用的 .deck-defs），id 都以 xiaowu- 开头；每只小雾的 SVG 里只引用，不再自带 <defs>
     （样页每次生成都换一套 id，这里改成全稿共用一份）
   - 来源：定稿样页 04-毛玻璃.html 里的 mascotSvg，画法、配色、坐标原样移植，只做接口适配（姿势、眨眼、视线改由参数给）
   ===================================================================== */
(function () {
  'use strict';
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const INK = '#2B2452', EDGE = 'rgba(84,60,190,.36)';
  // 身体轮廓：站着是一块圆角方块；休息时摊成矮软垫，底边仍落在地面上
  const BODY = {
    stand: { d: 'M60 16C93 16 100 24 101 59C102 94 94 102 60 102C26 102 18 94 19 59C20 24 27 16 60 16Z', l: 19, r: 101, t: 16, b: 102 },
    rest: { d: 'M60 55C98 55 107 62 107 83C107 105 99 111 60 111C21 111 13 105 13 83C13 62 22 55 60 55Z', l: 13, r: 107, t: 55, b: 111 },
  };
  const glow = (id, c, a) => `<radialGradient id="xiaowu-${id}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const DEFS =
    `<clipPath id="xiaowu-clip"><path d="${BODY.stand.d}"/></clipPath>`
    + `<clipPath id="xiaowu-clip-rest"><path d="${BODY.rest.d}"/></clipPath>`
    // 乳白磨砂底、小手小脚的磨砂、右下角的彩虹折光
    + '<linearGradient id="xiaowu-milk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".94"/><stop offset="1" stop-color="#ECE5FF" stop-opacity=".86"/></linearGradient>'
    + '<linearGradient id="xiaowu-nub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4DBFF"/></linearGradient>'
    + '<linearGradient id="xiaowu-rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9CCF"/><stop offset=".5" stop-color="#B49BFF"/><stop offset="1" stop-color="#7CC2FF"/></linearGradient>'
    // 透出来的四团彩色反光（紫、粉、蓝、杏）和顶部一团白雾
    + glow('purple', '#8A66FF', .82) + glow('pink', '#FF80C0', .76) + glow('blue', '#6AAEFF', .76) + glow('peach', '#FFB487', .7) + glow('white', '#FFFFFF', .95);

  const f1 = n => Math.round(n * 100) / 100;
  // 小圆手、小圆脚：同一种磨砂小件
  const nub = (cx, cy, rx, ry, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''} fill="url(#xiaowu-nub)" stroke="${EDGE}" stroke-width="1.6"/>`;
  const ARMS = {
    idle: nub(18, 70, 7, 10.5, 16) + nub(102, 70, 7, 10.5, -16),
    point: nub(18, 72, 7, 10.5, 14) + nub(110, 66, 13, 6.8, 18),
    happy: nub(15, 38, 6.8, 11, -30) + nub(105, 38, 6.8, 11, 30),
    rest: nub(14, 104, 9.5, 5.5) + nub(106, 104, 9.5, 5.5),
  };
  const FEET = nub(46, 105, 10, 6.5) + nub(74, 105, 10, 6.5);
  const line = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.7" stroke-linecap="round"/>`;
  // 开心时的四角星光
  const star = (x, y, r) => `<path d="M${x} ${y - r}Q${x + r * .2} ${y - r * .2} ${x + r} ${y}Q${x + r * .2} ${y + r * .2} ${x} ${y + r}Q${x - r * .2} ${y + r * .2} ${x - r} ${y}Q${x - r * .2} ${y - r * .2} ${x} ${y - r}Z" fill="#fff" stroke="rgba(140,100,255,.6)" stroke-width="1.3" stroke-linejoin="round"/>`;

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const rest = pose === 'rest', happy = pose === 'happy';
    const B = rest ? BODY.rest : BODY.stand;
    const W = B.r - B.l, H = B.b - B.t, R = (W + H) / 4;
    const fy = rest ? 85 : 58;                     // 眼睛的高度
    const ex = rest ? [46, 74] : [47, 73];         // 两只眼睛的横坐标

    // 视线：整张脸平移（引擎给了 look 就照着移；没给时 point 往前下方看，其余正视；rest 固定略往下）
    const lk = Array.isArray(o.look) && o.look.length === 2 && !rest ? o.look : null;
    const cl = v => Math.max(-1, Math.min(1, +v || 0));
    const gx = rest ? 0 : lk ? cl(lk[0]) * 3.4 : pose === 'point' ? 2.4 : 0;
    const gy = rest ? 1.5 : lk ? cl(lk[1]) * 2.2 : pose === 'point' ? 2 : 0;

    // 身体：外侧靛紫细线 → 乳白磨砂底 + 四团彩色反光 + 一层白雾 + 顶部柔光 + 底部一点暗 → 白色亮边 → 彩虹折光 + 左上高光
    const bodyG = `<path d="${B.d}" fill="none" stroke="${EDGE}" stroke-width="4.8"/>`
      + `<g clip-path="url(#xiaowu-clip${rest ? '-rest' : ''})">`
      + '<rect width="120" height="120" fill="url(#xiaowu-milk)"/>'
      + `<circle cx="${f1(B.l + W * .18)}" cy="${f1(B.b - H * .12)}" r="${f1(R * .9)}" fill="url(#xiaowu-purple)"/>`
      + `<circle cx="${f1(B.r - W * .1)}" cy="${f1(B.t + H * .14)}" r="${f1(R * .76)}" fill="url(#xiaowu-pink)"/>`
      + `<circle cx="${f1(B.r - W * .12)}" cy="${f1(B.b - H * .06)}" r="${f1(R * .76)}" fill="url(#xiaowu-blue)"/>`
      + `<circle cx="${f1(B.l + W * .14)}" cy="${f1(B.t + H * .12)}" r="${f1(R * .52)}" fill="url(#xiaowu-peach)"/>`
      + '<rect width="120" height="120" fill="#fff" opacity=".26"/>'
      + `<ellipse cx="${f1(60 - W * .12)}" cy="${f1(B.t + H * .15)}" rx="${f1(W * .36)}" ry="${f1(H * .14)}" fill="url(#xiaowu-white)"/>`
      + `<ellipse cx="60" cy="${B.b + 3}" rx="${f1(W * .5)}" ry="${f1(H * .16)}" fill="#6B4CF6" opacity=".14"/>`
      + '</g>'
      + `<path d="${B.d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-opacity=".95"/>`
      + `<path d="M${B.r - 3} ${f1(B.b - H * .3)}Q${B.r - 5} ${B.b - 3} ${f1(B.r - W * .32)} ${B.b - 1.5}" fill="none" stroke="url(#xiaowu-rainbow)" stroke-width="2.6" stroke-linecap="round"/>`
      + `<path d="M${B.l + 8} ${f1(B.t + H * .3)}Q${B.l + 9} ${B.t + 8} ${f1(B.l + W * .3)} ${B.t + 5}" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`;

    // 脸
    let eyes, mouth;
    if (happy) {
      eyes = ex.map(x => line(`M${x - 5} ${fy + 2}Q${x} ${fy - 5.5} ${x + 5} ${fy + 2}`)).join('');
      mouth = `<path d="M53.5 ${fy + 8}Q60 ${fy + 18} 66.5 ${fy + 8}Z" fill="${INK}"/><ellipse cx="60" cy="${fy + 11.4}" rx="3.2" ry="1.7" fill="#FF8FB0"/>`;
    } else if (rest) {
      eyes = ex.map(x => line(`M${x - 5} ${fy}Q${x} ${fy + 4.5} ${x + 5} ${fy}`)).join('');
      mouth = `<ellipse cx="60" cy="${fy + 9}" rx="2.4" ry="1.8" fill="${INK}" opacity=".8"/>`;
    } else {
      // 睁眼：椭圆眼珠 + 一点高光；眨眼：向下弯的弧
      eyes = ex.map(x => o.blink
        ? `<path d="M${x - 4.8} ${fy + 1}Q${x} ${fy + 4.6} ${x + 4.8} ${fy + 1}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
        : `<ellipse cx="${x}" cy="${fy}" rx="4.8" ry="6.2" fill="${INK}"/><circle cx="${x + 1.6}" cy="${fy - 2.4}" r="1.8" fill="#fff"/>`).join('');
      mouth = line(`M55 ${fy + 9}Q60 ${fy + 13.5} 65 ${fy + 9}`);
    }
    const blush = [ex[0] - 9, ex[1] + 9].map(x => `<ellipse cx="${x}" cy="${fy + 9}" rx="5.6" ry="3.2" fill="#FF8DB6" opacity=".55"/>`).join('');

    // 点缀：开心时的两颗星光、打盹时的小泡泡
    let extra = '';
    if (happy) extra = `<g class="xw-spark">${star(108, 14, 8)}${star(10, 20, 5)}</g>`;
    else if (rest) extra = '<g class="xw-zz"><circle cx="99" cy="42" r="7" fill="rgba(255,255,255,.55)" stroke="rgba(140,100,255,.55)" stroke-width="1.4"/><circle cx="96.6" cy="39.6" r="1.9" fill="#fff"/>'
      + '<circle cx="89" cy="50" r="3.2" fill="rgba(255,255,255,.6)" stroke="rgba(140,100,255,.5)" stroke-width="1.2"/></g>';

    const lean = pose === 'point' ? ' transform="rotate(6 60 108)"' : '';
    const face = gx || gy ? ` transform="translate(${f1(gx)} ${f1(gy)})"` : '';
    return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><g${lean}>${ARMS[pose]}${rest ? '' : FEET}${bodyG}<g class="xw-face"${face}>${blush}${eyes}${mouth}</g></g>${extra}</svg>`;
  }

  const def = {
    label: '小雾',
    svg,
    size: [136, 136],        // 舞台上的外框；看得见的身子（含小手小脚）约 108px 高
    foot: .93,               // 脚底（111.5/120）：站上沿、落地压扁都以它为准
    flipSvg: false,          // 朝左时由引擎用 CSS 镜像
    outline: false,          // 自带白色亮边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('xiaowu', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「小雾」先不注册，换成支持形象注册的引擎后会自动出现');
})();
