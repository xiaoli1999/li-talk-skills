/* =====================================================================
   形象 · 圈圈 quanquan（蓝图 blueprint 的默认形象）
   - 名字：圈圈，一只会画圈的制图圆规
   - 长相：顶上一截带滚花的手柄，圆形铰链当脑袋（脸画在铰链上），两条腿一条钢针、一条夹着铅芯；
     白色轮廓线、浅青结构线（铰链内圈、手柄滚花、身后一道点划中心线），身子填比晒图纸略亮的蓝，
     在网格上看得出是一个实心零件；全身唯一的橙色在铅芯尖上，和蓝图「橙色只做强调」一致
   - 姿势（svg(pose, opts) 的 pose，默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     idle  平常：两腿叉开站稳，两手垂着
     point 钢针腿扎住不动，铅芯腿绕铰链往外抬 24°，脚下留一道浅青虚线弧（刚划过的轨迹），右手指向右上
     happy 笑眼、张嘴，两腿各张开 14°、两手举起，旁边两个浅青对位标记
     rest  两腿并拢、整只斜靠 8° 打盹，闭眼，两手收在胸前，旁边写两个 z
   - 眨眼：opts.blink 为真时 idle、point 的眼睛换成两道短线（引擎随机 2.5–6 秒眨一次）；开心、休息本来就是弯眼，没有眨眼帧
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边）时眼睛往那边挪，最多横 2.4、竖 1.6（画像坐标）；
     point 没给时默认朝前看
   - 画布 124×138（viewBox），舞台上按 124×138 显示（看得见的身子约 127px 高）；两只脚尖在 y≈131（foot .948）
   - 白线和浅青线在深蓝底上自己就亮，所以 outline: false（不要引擎再描浅色边）；没有渐变和滤镜，不用 defs
   - 来源：作者定稿的样页「形象-原有风格」里圈圈那段 mascotSvg，造型、配色、姿势原样搬过来，只做了接口适配。
     样页代理提醒过「线条比较细，投到幕布上可能偏弱」：这里在不改造型的前提下把所有线宽加粗约四成
     （轮廓 2.4→3.4、铰链 2.8→4、浅青结构线 1→1.6、五官 2→2.8 左右），1920×1080 投到幕布上也看得清
   ===================================================================== */
(function () {
  'use strict';
  const C = { line: '#FFFFFF', cyan: '#A6F4FF', fill: '#0D3A6E', fill2: '#165089', orange: '#FFB12B' };
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const f1 = n => Math.round(n * 10) / 10;
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const HX = 62, HY = 62;                                  // 铰链转轴：两条腿绕它转
  // 左腿（钢针）
  const LEG_L = `<path d="M52.7 62.4 L63.3 65.6 L44.9 116.9 L39.1 115.1 Z" fill="${C.fill2}" stroke="${C.line}" stroke-width="3.4" stroke-linejoin="round"/>` +
    `<path d="M57.6 68 L44 112" ${L(C.cyan, 1.6)} opacity=".75"/>` +
    `<rect x="38" y="113.5" width="8" height="5" rx="1" transform="rotate(17.1 42 116)" fill="${C.fill}" stroke="${C.line}" stroke-width="2.6"/>` +
    `<path d="M41.4 118.5 L37.4 130.8" ${L(C.line, 3)}/>`;
  // 右腿（夹铅芯）：铅芯尖是全身唯一的橙色
  const LEG_R = `<path d="M71.3 62.4 L60.7 65.6 L79.1 116.9 L84.9 115.1 Z" fill="${C.fill2}" stroke="${C.line}" stroke-width="3.4" stroke-linejoin="round"/>` +
    `<path d="M66.4 68 L80 112" ${L(C.cyan, 1.6)} opacity=".75"/>` +
    `<path d="M80.9 119.6 L84.6 118.4 L86.6 130.8 Z" fill="${C.orange}" stroke="${C.orange}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<rect x="77.5" y="112.5" width="9" height="6.5" rx="1.2" transform="rotate(-17.1 82 116)" fill="${C.fill}" stroke="${C.line}" stroke-width="2.6"/>` +
    `<circle cx="82" cy="115.8" r="1.3" fill="${C.cyan}"/>`;
  const hand = (d, hx, hy) => `<path d="${d}" ${L(C.line, 3.4)}/><circle cx="${hx}" cy="${hy}" r="3.4" fill="${C.fill}" stroke="${C.line}" stroke-width="2.8"/>`;
  const ARMS = {
    idle: hand('M41.5 54 Q34 60 31 68', 30.5, 70.6) + hand('M82.5 54 Q90 60 93 68', 93.5, 70.6),
    point: hand('M41.5 54 Q34 60 31 68', 30.5, 70.6) + hand('M82.5 49 Q94 42 104 35', 106.5, 33),
    happy: hand('M41.5 47 Q33 38 30 28', 29.4, 24.8) + hand('M82.5 47 Q91 38 94 28', 94.6, 24.8),
    rest: hand('M42.5 57 Q40 64 45.5 67.5', 48.2, 68.4) + hand('M81.5 57 Q84 64 78.5 67.5', 75.8, 68.4),
  };
  const LEGS = { idle: [0, 0], point: [0, -24], happy: [14, -14], rest: [-9, 9] };
  const FIG = { idle: '', point: '', happy: 'translate(0 8.3)', rest: 'rotate(-8 62 131) translate(0 -3)' };
  // 对位标记（⊕）
  const reg = (x, y) => `<g ${L(C.cyan, 2)}><circle cx="${x}" cy="${y}" r="4.6"/><path d="M${x - 8} ${y} H${x + 8} M${x} ${y - 8} V${y + 8}"/></g>`;

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const [rl, rr] = LEGS[P];
    let eyes, mouth, extra = '';
    if (P === 'happy') {
      eyes = `<g ${L(C.line, 3.2)}><path d="M51 50 Q54.5 44 58 50"/><path d="M66 50 Q69.5 44 73 50"/></g>`;
      mouth = `<path d="M57.5 55.5 Q62 63.5 66.5 55.5 Z" fill="${C.line}" stroke="${C.line}" stroke-width="2" stroke-linejoin="round"/>`;
      extra = reg(16, 44) + reg(108, 22);
    } else if (P === 'rest') {
      eyes = `<g ${L(C.line, 3)}><path d="M51 49 Q54.5 52 58 49"/><path d="M66 49 Q69.5 52 73 49"/></g>`;
      mouth = `<circle cx="62" cy="57" r="1.9" fill="none" stroke="${C.line}" stroke-width="2.6"/>`;
      extra = `<g ${L(C.line, 2.8)}><path d="M90 24 h6 l-6 7 h6"/><path d="M100 9 h8 l-8 9 h8"/></g>`;
    } else {
      if (o.blink) eyes = `<g ${L(C.line, 3)}><path d="M51.5 48.6 H57.5"/><path d="M66.5 48.6 H72.5"/></g>`;
      else {
        const v = Array.isArray(o.look) && o.look.length === 2 ? o.look : (P === 'point' ? [1, 0] : null);
        const cl = n => Math.max(-1, Math.min(1, +n || 0));
        const lk = v ? ` transform="translate(${f1(cl(v[0]) * 2.4)} ${f1(cl(v[1]) * 1.6)})"` : '';
        eyes = `<g${lk} fill="${C.line}"><ellipse cx="54.5" cy="48" rx="3" ry="4"/><ellipse cx="69.5" cy="48" rx="3" ry="4"/></g>`;
      }
      mouth = `<path d="M58.5 56.5 Q62 59.6 65.5 56.5" ${L(C.line, 2.8)}/>`;
    }
    // 指向时铅芯腿划过的一道虚线弧
    const arc = P === 'point' ? `<path d="M86.6 130.8 A73 73 0 0 0 112.4 114.9" ${L(C.cyan, 2.2)} stroke-dasharray="4 3"/>` : '';
    return '<svg viewBox="0 0 124 138" aria-hidden="true" focusable="false">' + arc +
      `<g transform="${FIG[P]}">` +
        `<g ${L(C.cyan, 1.5)} stroke-dasharray="7 3 1.5 3" opacity=".6"><path d="M62 0 V136"/><path d="M33 50 H91"/></g>` +   // 点划中心线
        `<g transform="rotate(${rl} ${HX} ${HY})">${LEG_L}</g><g transform="rotate(${rr} ${HX} ${HY})">${LEG_R}</g>` +
        `<rect x="55" y="4" width="14" height="21" rx="3.5" fill="${C.fill2}" stroke="${C.line}" stroke-width="3"/>` +        // 滚花手柄
        `<path d="M58.5 7.5 V21.5 M62 7.5 V21.5 M65.5 7.5 V21.5" ${L(C.cyan, 1.6)} opacity=".9"/>` +
        `<rect x="58.5" y="24" width="7" height="6" fill="${C.fill2}" stroke="${C.line}" stroke-width="2.6"/>` +
        `<circle cx="62" cy="50" r="21.5" fill="${C.fill}" stroke="${C.line}" stroke-width="4"/>` +                            // 铰链（脑袋）
        `<circle cx="62" cy="50" r="17.6" fill="none" stroke="${C.cyan}" stroke-width="1.6" opacity=".6"/>` +
        `<g fill="${C.cyan}" opacity="${P === 'happy' ? .6 : .42}"><ellipse cx="48.5" cy="55.5" rx="3.6" ry="2"/><ellipse cx="75.5" cy="55.5" rx="3.6" ry="2"/></g>` +
        eyes + mouth + ARMS[P] +
      '</g>' + extra + '</svg>';
  }

  Deck.mascot('quanquan', {
    label: '圈圈',
    svg,
    size: [124, 138],
    foot: .948,
    flipSvg: false,
    outline: false,     // 白色轮廓线自己就亮，深色底上不用引擎再描边
  });
})();
