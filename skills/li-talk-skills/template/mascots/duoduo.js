/* =====================================================================
   形象 · 朵朵 duoduo（水彩田园风格的形象）
   - 名字：朵朵，一朵圆滚滚的小积云
   - 长相：从水彩天空里那朵积云化来，用水彩画云的老办法上色——亮面留纸白，底部和背光的一侧晕一抹天空蓝，
     左上角透一点暖阳黄；外轮廓是轻轻抖动的铅笔线；腮红是两团晕开的粉；头顶一缕卷卷的云丝是它的记号；
     底下两只淡蓝小圆脚，能走能蹦
   - 姿势（svg(pose, opts) 的 pose）：
     idle  平常站着，两只小手垂在身侧，圆眼睛、小微笑
     point 身子朝右探一点，右手朝右上方指；朝左时由引擎整体镜像
     happy 眯成两道弯的笑眼、张嘴笑、两手举起，头边几道开心的铅笔短线
     rest  坐下打盹：身子压扁盖住小脚、闭眼、嘴成小圆、云丝耷拉下来，旁边一个小泡泡
     walk  过渡帧（引擎在走动、蹦跳时用）：和 idle 一样，两只小脚一抬一落（SVG 自带的小动画，0.2 秒一轮）
   - 眨眼：opts.blink 为真时，idle、point、walk 的圆眼睛换成两道弧（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边），眼珠往那边挪一点
   - 画布 120×112，舞台上显示 132×123；脚底在 y≈110（foot .98）
   - 铅笔抖线、水彩晕染两个滤镜和云身的裁切放在 defs 里，引擎把它们放进页面公用的 .deck-defs；id 都以 duoduo- 开头
   - 取自水彩田园的定稿样页，原样移植（画法、配色不变）
   ===================================================================== */
(function () {
  'use strict';
  const C = { ink: '#3A322B', line: '#5E564D', paper: '#FFFEFA', sky: '#8EC3E6', skyD: '#4F8DBF', sun: '#F4C35A', blush: '#F29C8F', foot: '#EAF3F9' };
  const POSES = ['idle', 'point', 'happy', 'rest', 'walk'];
  const f1 = n => Math.round(n * 10) / 10;
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  // 云身：几个圆加一块圆角矩形拼成；同一组形状用三次（描边垫底、纸白填充、上色的裁切范围）
  const SHAPE = '<circle cx="60" cy="44" r="27"/><circle cx="35" cy="59" r="19"/><circle cx="85" cy="59" r="19"/>' +
    '<circle cx="29" cy="81" r="16"/><circle cx="91" cy="81" r="16"/><rect x="25" y="56" width="70" height="44" rx="20"/>';
  // 手：一小团带铅笔边的云
  const arm = (cx, cy, rot, rx = 10, ry = 7) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const ARMS = {
    idle: arm(15, 81, -35) + arm(105, 81, 35),
    point: arm(15, 81, -35) + arm(108, 49, -48, 13, 7),
    happy: arm(15, 46, 52) + arm(105, 46, -52),
    rest: arm(23, 93, -12, 9, 6) + arm(97, 93, 12, 9, 6),
  };
  ARMS.walk = ARMS.idle;
  // 身子的姿态：探身是绕脚底转一点；打盹是压扁坐下
  const TORSO = { idle: '', point: 'rotate(6 60 106)', happy: '', rest: 'translate(60 113) scale(1.12 .82) translate(-60 -104)', walk: '' };

  const DEFS =
    // 铅笔外轮廓：轻轻抖一下
    '<filter id="duoduo-pencil" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="1" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    // 水彩晕染：边缘不规则再化开
    '<filter id="duoduo-soft" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>' +
    `<clipPath id="duoduo-clip">${SHAPE}</clipPath>`;

  // 迈步：左脚先抬 3 个单位、右脚后抬，0.2 秒一轮（discrete：一下抬起、一下落下）
  const step = first => `<animateTransform attributeName="transform" type="translate" values="${first ? '0 -3;0 0' : '0 0;0 -3'}" keyTimes="0;.5" calcMode="discrete" dur=".2s" repeatCount="indefinite"/>`;

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const shut = `<g ${L(C.ink, 2.4)}><path d="M44.5 63.5 Q49 66.5 53.5 63.5"/><path d="M66.5 63.5 Q71 66.5 75.5 63.5"/></g>`;
    let eyes, mouth, extra = '';
    if (P === 'happy') {
      eyes = `<g ${L(C.ink, 2.7)}><path d="M44 66 Q49 57.5 54 66"/><path d="M66 66 Q71 57.5 76 66"/></g>`;
      mouth = `<path d="M53.5 70.5 Q60 81.5 66.5 70.5 Z" fill="${C.ink}"/><ellipse cx="60" cy="74.4" rx="3" ry="1.6" fill="${C.blush}"/>`;
      extra = `<g ${L(C.line, 2.2)} opacity=".85"><path d="M99 21 L105 14"/><path d="M106 30 L114 28"/><path d="M93 15 L95 7"/>` +
        `<path d="M21 21 L15 14"/><path d="M14 30 L6 28"/><path d="M27 15 L25 7"/></g>`;
    } else if (P === 'rest') {
      eyes = shut;
      mouth = `<ellipse cx="60" cy="73" rx="2.2" ry="2.6" fill="${C.ink}" opacity=".85"/>`;
      extra = `<circle cx="101" cy="47" r="6.5" fill="#fff" fill-opacity=".75" stroke="${C.skyD}" stroke-width="1.6" stroke-opacity=".75"/><circle cx="99" cy="45" r="1.6" fill="#fff"/>`;
    } else {
      if (o.blink) eyes = shut;
      else {
        const v = Array.isArray(o.look) ? o.look : null;
        const lk = v ? ` transform="translate(${f1(v[0] * 2.6)} ${f1(v[1] * 2)})"` : '';
        eyes = `<g${lk}><ellipse cx="49" cy="63" rx="4.3" ry="5.4" fill="${C.ink}"/><ellipse cx="71" cy="63" rx="4.3" ry="5.4" fill="${C.ink}"/>` +
          `<circle cx="50.6" cy="60.8" r="1.5" fill="#fff"/><circle cx="72.6" cy="60.8" r="1.5" fill="#fff"/></g>`;
      }
      mouth = `<path d="M55.5 71.5 Q60 76 64.5 71.5" ${L(C.ink, 2.2)}/>`;
    }
    // 云丝：从头顶长出来、往右弯下去、末端卷一个小旋；打盹时整缕耷拉到一边
    const wisp = P === 'rest'
      ? `<path d="M60 20 C63 15 70 14.5 74 17.5 C77 20 75.5 24 72.5 23.5 C70.5 23 70.5 20.5 72.5 20" ${L(C.line, 2.6)}/>`
      : `<path d="M60 18 C59 11 63 5.5 69.5 6 C74 6.5 75.5 11 73 13.5 C71 15.2 68 14 68.6 11.6" ${L(C.line, 2.6)}/>`;
    const walk = P === 'walk';
    const feet = P === 'rest' ? '' : `<g fill="${C.foot}" stroke="${C.line}" stroke-width="2.6">` +
      `<ellipse cx="46" cy="103.5" rx="9" ry="6.2">${walk ? step(true) : ''}</ellipse>` +
      `<ellipse cx="74" cy="103.5" rx="9" ry="6.2">${walk ? step(false) : ''}</ellipse></g>`;
    return '<svg viewBox="0 0 120 112" aria-hidden="true" focusable="false">' +
      feet +
      `<g transform="${TORSO[P]}">` +
        `<g fill="${C.line}" stroke="${C.line}" stroke-width="5.4" filter="url(#duoduo-pencil)">${SHAPE}</g>` +   // 描边垫底：只露出外圈
        `<g fill="${C.paper}">${SHAPE}</g>` +                                                                  // 留白的云身
        '<g clip-path="url(#duoduo-clip)">' +                                                                  // 水彩上色：底部天空蓝、右侧背光、左上暖光
          `<ellipse cx="62" cy="108" rx="58" ry="25" fill="${C.sky}" fill-opacity=".55" filter="url(#duoduo-soft)"/>` +
          `<ellipse cx="102" cy="66" rx="13" ry="28" fill="${C.sky}" fill-opacity=".24" filter="url(#duoduo-soft)"/>` +
          `<ellipse cx="44" cy="35" rx="19" ry="12" fill="${C.sun}" fill-opacity=".28" filter="url(#duoduo-soft)"/>` +
        '</g>' +
        `<g fill="${C.blush}" opacity="${P === 'happy' ? .8 : .55}" filter="url(#duoduo-soft)"><ellipse cx="37" cy="73.5" rx="7.5" ry="4.4"/><ellipse cx="83" cy="73.5" rx="7.5" ry="4.4"/></g>` +
        eyes + mouth +
        `<g fill="${C.paper}" stroke="${C.line}" stroke-width="2.6">${ARMS[P]}</g>` +
        wisp +
      '</g>' + extra + '</svg>';
  }

  Deck.mascot('duoduo', {
    label: '朵朵',
    svg,
    size: [132, 123],
    foot: .98,
    frames: ['walk'],
    flipSvg: false,
    outline: true,      // 自己的铅笔边是深色的，深色底上要引擎加浅色描边
    defs: DEFS,
  });
})();
