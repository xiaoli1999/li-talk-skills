/* =====================================================================
   形象 · 沙沙 shasha（黑板 board 的默认形象）
   - 名字：沙沙，取粉笔在黑板上写字的声音
   - 长相：一截白粉笔头，写字的那头磨成斜面；身上有粉笔的颗粒和小坑（滤镜做的），
     左边亮、右边略灰，周身一圈淡淡的粉尘光；脸是深色的，两团黄粉笔腮红；
     手脚是它自己在黑板上画出来的白粉笔线。只用白粉笔和一点黄粉笔，跟黑板页的两种颜色一致
   - 姿势（svg(pose, opts) 的 pose）：
     idle  平常站着，两条粉笔线手臂垂着
     point 身子朝右前倾 4°，右手画成一支粉笔箭头指出去，眼睛看过去；朝左时由引擎整体镜像
     happy 笑眼、张嘴，两手举起，身边扬起几圈粉尘，画一颗黄粉笔星星
     rest  横躺着睡（像下课后搁在粉笔槽里的粉笔），闭眼、小嘴微张，旁边写两个 z
   - 眨眼：opts.blink 为真时 idle、point 的眼睛换成两道短线（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边），眼睛往那边挪一点；point 没给时默认朝前看
   - 画布 120×116，舞台上按 150×145 显示（看得见的身子约 115px 高）；脚底在 y≈112（foot .966）
   - 白身子在深绿板面上自己就亮，还带一圈粉尘光，所以 outline: false（引擎不再加浅色描边）
   - 粉笔颗粒、粉尘光两个滤镜和身体渐变放在 defs 里，引擎把它们放进页面公用的 .deck-defs；id 都以 shasha- 开头
   - 取自原有风格形象的定稿样页，原样移植（画法、配色不变），只改成形象接口
   ===================================================================== */
(function () {
  'use strict';
  const C = { chalk: '#F6F4EE', face: '#22332B', yellow: '#FFDC6A' };
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const f1 = n => Math.round(n * 10) / 10;
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  // 粉笔头：竖着的圆柱，顶上是往右上斜的磨损面（一个转了 -12° 的椭圆）
  const SIL = 'M36.5 33 L36.5 92 A23.5 6 0 0 0 83.5 92 L83.5 23 A24 6.5 -12 0 0 36.5 33 Z';
  const TOP = '<ellipse cx="60" cy="28" rx="24" ry="6.5" transform="rotate(-12 60 28)"/>';

  const DEFS =
    // 身子：左边亮、右边略灰
    '<linearGradient id="shasha-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#F4F2EB"/><stop offset=".78" stop-color="#D9D6CC"/><stop offset="1" stop-color="#BDBAB0"/></linearGradient>' +
    // 粉笔颗粒：边缘抖一点，再按噪声把一部分地方擦淡（不是挖穿），像粉笔在板上留下的颗粒
    '<filter id="shasha-chalk" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="11" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -5 4.5" result="holes"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/><feComposite in="d" in2="holes" operator="in"/></filter>' +
    // 粉尘光
    '<filter id="shasha-halo" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>';

  // 粉笔线手臂，末端一个小圆点当手
  const limb = (d, hx, hy) => `<path d="${d}"/>` + (hx ? `<circle cx="${hx}" cy="${hy}" r="2.8" fill="${C.chalk}" stroke="none"/>` : '');
  const ARMS = {
    idle: limb('M37.5 62 Q29 68 26 78', 25.4, 80.6) + limb('M82.5 60 Q91 66 94 76', 94.6, 78.6),
    point: limb('M37.5 62 Q29 68 26 78', 25.4, 80.6) + limb('M82.5 58 Q97 52 110 47') + limb('M102.5 42.5 L111 46.6 L104.5 53.2'),
    happy: limb('M37.5 56 Q28.5 46 26 34', 25.6, 31.2) + limb('M82.5 52 Q91.5 42 94 30', 94.4, 27.2),
    rest: '',
  };
  const LEGS = 'M48.5 96 L47 109.5 L40.5 110.5 M71.5 96 L73 109.5 L79.5 110.5';
  // 五角星（黄粉笔描的）
  const star5 = (cx, cy, R) => {
    let d = '';
    for (let k = 0; k < 10; k++) {
      const a = (-90 + k * 36) * Math.PI / 180, r = k % 2 ? R * .45 : R;
      d += (k ? 'L' : 'M') + f1(cx + r * Math.cos(a)) + ' ' + f1(cy + r * Math.sin(a));
    }
    return `<path d="${d}Z" ${L(C.yellow, 2.2)} filter="url(#shasha-chalk)"/>`;
  };

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const rest = P === 'rest';
    // 粉笔身子（躺下时整段转 90°，落到地上）
    const body = `<g${rest ? ' transform="translate(0 30.5) rotate(90 60 59)"' : ''}>` +
      `<path d="${SIL}" fill="#fff" opacity=".16" filter="url(#shasha-halo)"/>` +                       // 粉尘光
      '<g filter="url(#shasha-chalk)">' +
        `<path d="${SIL}" fill="url(#shasha-body)"/>` +
        `<g fill="#FFFFFF" stroke="#C3C8C0" stroke-width="1.2">${TOP}</g>` +                              // 磨出来的斜面
        `<path d="M42 40 V86" ${L('#fff', 3)} opacity=".7"/>` +                                           // 左边一道亮
      '</g></g>';
    let face, extra = '', legs = '', arms = '';
    if (rest) {
      face = `<g ${L(C.face, 2.4)}><path d="M48 86 Q52 89 56 86"/><path d="M64 86 Q68 89 72 86"/></g>` +
        `<ellipse cx="60" cy="94.5" rx="2" ry="2.3" fill="${C.face}"/>` +
        `<g fill="${C.yellow}" opacity=".7" filter="url(#shasha-chalk)"><ellipse cx="44" cy="93" rx="4.6" ry="2.6"/><ellipse cx="76" cy="93" rx="4.6" ry="2.6"/></g>`;
      extra = `<g ${L(C.chalk, 2.2)} filter="url(#shasha-chalk)"><path d="M84 52 h7 l-7 8 h7"/><path d="M95 36 h9 l-9 10 h9"/></g>`;
    } else {
      let eyes, mouth;
      if (P === 'happy') {
        eyes = `<g ${L(C.face, 2.6)}><path d="M47 60 Q51 53 55 60"/><path d="M65 60 Q69 53 73 60"/></g>`;
        mouth = `<path d="M55 65 Q60 74 65 65 Z" fill="${C.face}" stroke="${C.face}" stroke-width="1.4" stroke-linejoin="round"/>`;
        extra = `<g ${L('#fff', 1.6)} stroke-dasharray="1.5 3" opacity=".75"><circle cx="13" cy="52" r="5"/><circle cx="107" cy="58" r="4"/><circle cx="17" cy="20" r="3.4"/></g>` +
          star5(104, 22, 7.5);
      } else {
        if (o.blink) eyes = `<g ${L(C.face, 2.4)}><path d="M47.5 58.6 H54.5"/><path d="M65.5 58.6 H72.5"/></g>`;
        else {
          const v = Array.isArray(o.look) ? o.look : (P === 'point' ? [1, 0] : null);
          const lk = v ? ` transform="translate(${f1(v[0] * 2.2)} ${f1(v[1] * 1.6)})"` : '';
          eyes = `<g${lk}><ellipse cx="51" cy="58" rx="3.6" ry="4.6" fill="${C.face}"/><ellipse cx="69" cy="58" rx="3.6" ry="4.6" fill="${C.face}"/>` +
            `<circle cx="52.3" cy="56.2" r="1.3" fill="#fff"/><circle cx="70.3" cy="56.2" r="1.3" fill="#fff"/></g>`;
        }
        mouth = `<path d="M56 67 Q60 70.5 64 67" ${L(C.face, 2.2)}/>`;
      }
      face = `<g fill="${C.yellow}" opacity="${P === 'happy' ? .85 : .7}" filter="url(#shasha-chalk)"><ellipse cx="44" cy="66" rx="5" ry="3"/><ellipse cx="76" cy="66" rx="5" ry="3"/></g>` + eyes + mouth;
      legs = `<g ${L(C.chalk, 3.6)} filter="url(#shasha-chalk)"><path d="${LEGS}"/></g>`;          // 腿画在身子后面
      arms = `<g ${L(C.chalk, 3.6)} filter="url(#shasha-chalk)">${ARMS[P]}</g>`;                   // 手画在身子前面
    }
    const tilt = P === 'point' ? 'rotate(4 60 112)' : '';
    return '<svg viewBox="0 0 120 116" aria-hidden="true" focusable="false">' +
      `<g transform="${tilt}">` + legs + body + face + arms + '</g>' +
      extra + '</svg>';
  }

  const def = {
    label: '沙沙',
    svg,
    size: [150, 145],
    foot: .966,
    flipSvg: false,     // 朝左时由引擎用 CSS 整体镜像
    outline: false,     // 白粉笔身子自己就亮，还带一圈粉尘光，深色底上不用再加描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('shasha', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「沙沙」先不注册，换成支持形象注册的引擎后会自动出现');
})();
