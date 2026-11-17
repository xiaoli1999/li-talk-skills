/* =====================================================================
   形象 · 尖尖 jianjian（方格纸 paper 的默认形象）
   - 名字：尖尖。一截用短了的黄色六棱铅笔头，削尖的那头朝上
   - 长相：黄漆笔身分左亮、中黄、右暗三道棱面，漆面在木头处收成三道波浪边；削出来的木头尖，
     顶上一点墨蓝石墨笔尖；下面一圈银色铁箍、一块粉橡皮，两只墨蓝小脚。
     墨蓝铅笔线轻轻抖一下，再叠一道错开的淡线，像在方格本上随手画的。
     配色就是方格纸页面的「墨蓝笔迹 + 荧光黄」
   - 姿势（svg(pose, opts) 的 pose）：
     idle  平常站着，两只纸白小圆手垂在身侧
     point 身子朝右前倾 5°，右手朝右上方指出去，眼睛看过去；朝左时由引擎整体镜像
     happy 笑眼、张嘴，两手举起，旁边画两颗黄星星
     rest  往后靠着打盹：身子后仰 9°、闭眼、小嘴微张，两手搭在肚子上，旁边写两个 z
   - 眨眼：opts.blink 为真时 idle、point 的眼睛换成两道弧（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边），眼睛往那边挪一点；point 没给时默认朝前看
   - 画布 120×132，舞台上按 120×132 显示（看得见的身子约 119px 高）；脚底在 y≈130（foot .985）
   - 抖线滤镜和漆面裁切放在 defs 里，引擎把它们放进页面公用的 .deck-defs；id 都以 jianjian- 开头
   - 取自原有风格形象的定稿样页，原样移植（画法、配色不变），只改成形象接口
   ===================================================================== */
(function () {
  'use strict';
  const C = { ink: '#1E2B48', ink2: '#4A5368', paper: '#FBFBF7', y: '#FFE27A', yD: '#F2C94C', yL: '#FFF2B3',
    wood: '#F7DFB8', woodD: '#E6C08A', lead: '#2B3550', fer: '#D5D8DE', ferD: '#9AA0AA', er: '#F6AFA6', cheek: '#F5B342' };
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const f1 = n => Math.round(n * 10) / 10;
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const CONE = 'M36 50 L57.6 14.6 Q60 11 62.4 14.6 L84 50 Z';                 // 削出来的木头尖
  const SIL = 'M36 100 L36 50 L57.6 14.6 Q60 11 62.4 14.6 L84 50 L84 100 Z';  // 笔尖加笔身的外轮廓
  const WAVE = 'M36 50 Q44 40 48 47 Q60 33 72 47 Q76 40 84 50';               // 漆面收口的三道波浪边

  const DEFS =
    // 铅笔线轻轻抖一下
    '<filter id="jianjian-wobble" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    // 黄漆只涂到波浪边以下
    `<clipPath id="jianjian-paint"><path d="${WAVE} Z"/><rect x="36" y="49.5" width="48" height="51"/></clipPath>`;

  // 手臂：一笔墨蓝线加一个纸白小圆手
  const arm = (d, hx, hy) => `<path d="${d}" ${L(C.ink, 3)}/><circle cx="${hx}" cy="${hy}" r="4.3" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.4"/>`;
  const ARMS = {
    idle: arm('M37 80 Q30.5 85 28.5 91', 27.6, 94.2) + arm('M83 80 Q89.5 85 91.5 91', 92.4, 94.2),
    point: arm('M37 80 Q30.5 85 28.5 91', 27.6, 94.2) + arm('M83 77 Q94 71 102 63', 104.6, 60.6),
    happy: arm('M37 77 Q29.5 69 27 60', 26.2, 56.4) + arm('M83 77 Q90.5 69 93 60', 93.8, 56.4),
    rest: arm('M37 82 Q41 90 47 90.5', 50.5, 90.5) + arm('M83 82 Q79 90 73 90.5', 69.5, 90.5),
  };
  // 身子的姿态：指向时绕脚底往前倾，打盹时往后靠
  const TILT = { idle: '', point: 'rotate(5 60 128)', happy: '', rest: 'rotate(-9 60 128)' };
  // 随手画的四角星
  const star = (cx, cy, r) => {
    const k = r * .2;
    return `<path d="M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z" fill="${C.y}" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/>`;
  };

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const shut = `<g ${L(C.ink, 2.4)}><path d="M47 71 Q51 74 55 71"/><path d="M65 71 Q69 74 73 71"/></g>`;
    let eyes, mouth, extra = '';
    if (P === 'happy') {
      eyes = `<g ${L(C.ink, 2.6)}><path d="M47 72.5 Q51 65.5 55 72.5"/><path d="M65 72.5 Q69 65.5 73 72.5"/></g>`;
      mouth = `<path d="M55 77.5 Q60 87 65 77.5 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="60" cy="82" rx="2.4" ry="1.3" fill="${C.er}"/>`;
      extra = star(21, 32, 7.5) + star(100, 22, 5);
    } else if (P === 'rest') {
      eyes = shut;
      mouth = `<ellipse cx="60" cy="80" rx="2.2" ry="2.5" fill="${C.ink}"/>`;
      extra = `<g ${L(C.ink2, 2)}><path d="M86 32 h7 l-7 8 h7"/><path d="M97 17 h9 l-9 10 h9"/></g>`;
    } else {
      if (o.blink) eyes = shut;
      else {
        const v = Array.isArray(o.look) ? o.look : (P === 'point' ? [1, 0] : null);
        const lk = v ? ` transform="translate(${f1(v[0] * 2.2)} ${f1(v[1] * 1.6)})"` : '';
        eyes = `<g${lk}><ellipse cx="51" cy="70" rx="3.5" ry="4.6" fill="${C.ink}"/><ellipse cx="69" cy="70" rx="3.5" ry="4.6" fill="${C.ink}"/>` +
          `<circle cx="52.3" cy="68.2" r="1.3" fill="#fff"/><circle cx="70.3" cy="68.2" r="1.3" fill="#fff"/></g>`;
      }
      mouth = `<path d="M56 79 Q60 82.5 64 79" ${L(C.ink, 2.2)}/>`;
    }
    return '<svg viewBox="0 0 120 132" aria-hidden="true" focusable="false">' +
      `<g transform="${TILT[P]}">` +
        `<g fill="${C.ink}"><ellipse cx="48" cy="126.6" rx="6.6" ry="3.8"/><ellipse cx="72" cy="126.6" rx="6.6" ry="3.8"/></g>` +   // 两只小脚
        `<path d="${CONE}" fill="${C.wood}"/><path d="M61.2 13.6 L84 50 L72 50 Z" fill="${C.woodD}"/>` +                            // 木头尖：右边一面背光
        `<path d="M50.6 26 L57.6 14.6 Q60 11 62.4 14.6 L69.4 26 Q60 28.8 50.6 26 Z" fill="${C.lead}"/>` +                           // 石墨笔尖
        `<path d="M56.6 18.5 L54.6 23.5" ${L('#fff', 1.2)} opacity=".45"/>` +
        '<g clip-path="url(#jianjian-paint)">' +                                                                                    // 黄漆：三道棱面
          `<rect x="30" y="30" width="18" height="71" fill="${C.yL}"/><rect x="48" y="30" width="24" height="71" fill="${C.y}"/><rect x="72" y="30" width="18" height="71" fill="${C.yD}"/>` +
        '</g>' +
        `<path d="${WAVE}" ${L(C.ink2, 1.6)}/>` +
        `<path d="M48 47.5 V99 M72 47.5 V99" ${L(C.ink2, 1.2)} opacity=".5"/>` +
        `<path d="${SIL}" ${L(C.ink, 2.8)} filter="url(#jianjian-wobble)"/>` +                                                       // 抖一下的铅笔外轮廓
        `<path d="${SIL}" ${L(C.ink, 1.2)} opacity=".28" transform="translate(1.3 -1)"/>` +                                          // 错开的一道淡线
        `<path d="M36.5 110.5 H83.5 V117.5 Q83.5 123.5 77.5 123.5 H42.5 Q36.5 123.5 36.5 117.5 Z" fill="${C.er}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>` + // 橡皮
        `<rect x="34.5" y="98.5" width="51" height="12" rx="2.2" fill="${C.fer}" stroke="${C.ink}" stroke-width="2.4"/>` +           // 铁箍
        `<path d="M36 102.5 H84 M36 106.5 H84" stroke="${C.ferD}" stroke-width="1.3"/>` +
        `<g fill="${C.cheek}" opacity="${P === 'happy' ? .85 : .65}"><ellipse cx="44.5" cy="78" rx="4.5" ry="2.6"/><ellipse cx="75.5" cy="78" rx="4.5" ry="2.6"/></g>` +
        eyes + mouth + ARMS[P] +
      '</g>' + extra + '</svg>';
  }

  const def = {
    label: '尖尖',
    svg,
    size: [120, 132],
    foot: .985,
    flipSvg: false,     // 朝左时由引擎用 CSS 整体镜像
    outline: true,      // 墨蓝线条，放到深色底上时要引擎加浅色描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('jianjian', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「尖尖」先不注册，换成支持形象注册的引擎后会自动出现');
})();
