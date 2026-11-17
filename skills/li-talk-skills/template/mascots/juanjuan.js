/* =====================================================================
   形象 · 卷卷 juanjuan（工位桌面 desk 的默认形象）
   - 名字：卷卷，一卷躺在桌上的和纸胶带
   - 长相：米白和纸胶带卷，身上上下两组珊瑚红细条纹；顶面看得见一圈圈胶带层、牛皮纸芯和中间的孔；
     撕开的胶带头从身子右下拖到桌上当尾巴，末端是撕口；铅笔灰的手绘轮廓轻轻抖动；
     珊瑚红只用在条纹、尾巴中线和腮红上，跟工位桌面「珊瑚红点缀」一致
   - 姿势（svg(pose, opts) 的 pose）：
     idle  平常站着，两只小手垂在身侧，尾巴搭在桌上
     point 右手把胶带头拉出来，斜斜伸向右上方（像要把它贴到目标上），眼睛看过去；朝左时由引擎整体镜像
     happy 笑眼、张嘴，两手举起，尾巴在身后卷成一个圈
     rest  往下坐（脚收进去）、闭眼、小嘴微张，尾巴松松地摊在桌上，旁边写两个 z
   - 眨眼：opts.blink 为真时 idle、point 的眼睛换成两道弧（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边），眼睛往那边挪一点；point 没给时默认朝前看
   - 画布 134×120，舞台上按 181×162 显示（看得见的身子约 108px 高）；脚底在 y≈106（foot .883）
   - 抖线滤镜和身体渐变放在 defs 里，引擎把它们放进页面公用的 .deck-defs；id 都以 juanjuan- 开头
   - 取自原有风格形象的定稿样页，原样移植（画法、配色不变），只改成形象接口
   ===================================================================== */
(function () {
  'use strict';
  const C = { ink: '#4A423B', cream: '#FFF8EC', top: '#FBF2E2', ring: '#E2D0AE', kraft: '#C9A26B', kraftD: '#A07A4A', hole: '#5E4630', coral: '#EF6A43', foot: '#5A5048' };
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const f1 = n => Math.round(n * 10) / 10;
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const SIL = 'M23 40 L23 84 A42 14 0 0 0 107 84 L107 40 A42 14 0 0 0 23 40 Z';   // 侧面加顶面的外轮廓

  const DEFS =
    // 胶带侧面：左亮右暗
    '<linearGradient id="juanjuan-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFDF7"/><stop offset=".45" stop-color="#FFF6E7"/><stop offset="1" stop-color="#E6D5B8"/></linearGradient>' +
    // 手绘轮廓轻轻抖一下
    '<filter id="juanjuan-wobble" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="1" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter>';

  // 胶带尾巴：一条描边的带子，中间一道珊瑚红细线；end 给出撕口的位置和方向
  const ribbon = (d, end) => {
    let tear = '';
    if (end) {
      const [x, y, ang] = end;
      tear = `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 -5.6 L2.4 -3.4 L0 -1.2 L2.4 1 L0 3.2 L2.4 5.6" ${L(C.ink, 1.6)}/></g>`;
    }
    return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="11.4" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${C.cream}" stroke-width="8" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="${C.coral}" stroke-width="1.4" opacity=".85"/>` + tear;
  };
  const RIBBON = {
    idle: ribbon('M101 84 C105 95 109 101 118 101.6 L126 101.6', [126, 101.6, 0]),
    point: ribbon('M101 70 L124 55', null),
    happy: ribbon('M101 86 C112 101 129 98 128 84 C127 74 115 76 117 86', [117, 86, 100]),
    rest: ribbon('M100 90 C104 99 108 103.4 117 103.6 L129 103.6', [129, 103.6, 0]),
  };
  // 小手：米白小团子，铅笔灰描边
  const mit = (cx, cy, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="6.8" ry="5" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const ARMS = {
    idle: mit(18.5, 75, -62) + mit(111.5, 75, 62),
    point: mit(18.5, 75, -62) + mit(125, 55, -30),
    happy: mit(16, 50, 40) + mit(114, 50, -40),
    rest: mit(21, 92, -15) + mit(109, 92, 15),
  };

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const shut = `<g ${L(C.ink, 2.4)}><path d="M49 72 Q53 75 57 72"/><path d="M73 72 Q77 75 81 72"/></g>`;
    let eyes, mouth, extra = '';
    if (P === 'happy') {
      eyes = `<g ${L(C.ink, 2.6)}><path d="M49 73.5 Q53 66.5 57 73.5"/><path d="M73 73.5 Q77 66.5 81 73.5"/></g>`;
      mouth = `<path d="M60 78 Q65 87.5 70 78 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="65" cy="82.6" rx="2.4" ry="1.3" fill="${C.coral}"/>`;
    } else if (P === 'rest') {
      eyes = shut;
      mouth = `<ellipse cx="65" cy="80" rx="2.1" ry="2.4" fill="${C.ink}"/>`;
      extra = `<g ${L(C.ink, 2)} opacity=".75"><path d="M10 24 h7 l-7 8 h7"/><path d="M20 8 h9 l-9 10 h9"/></g>`;
    } else {
      if (o.blink) eyes = shut;
      else {
        const v = Array.isArray(o.look) ? o.look : (P === 'point' ? [1, 0] : null);
        const lk = v ? ` transform="translate(${f1(v[0] * 2.4)} ${f1(v[1] * 1.6)})"` : '';
        eyes = `<g${lk}><ellipse cx="53" cy="71" rx="3.8" ry="4.8" fill="${C.ink}"/><ellipse cx="77" cy="71" rx="3.8" ry="4.8" fill="${C.ink}"/>` +
          `<circle cx="54.4" cy="69" r="1.4" fill="#fff"/><circle cx="78.4" cy="69" r="1.4" fill="#fff"/></g>`;
      }
      mouth = `<path d="M61 79 Q65 82.6 69 79" ${L(C.ink, 2.2)}/>`;
    }
    const sink = P === 'rest' ? 'translate(0 4)' : '';
    const feet = P === 'rest' ? '' : `<g fill="${C.foot}"><ellipse cx="50" cy="101.5" rx="8.5" ry="4.8"/><ellipse cx="80" cy="101.5" rx="8.5" ry="4.8"/></g>`;
    const tailBack = P === 'happy';                          // 开心时尾巴卷到身后
    return '<svg viewBox="0 0 134 120" aria-hidden="true" focusable="false">' +
      feet + (tailBack ? RIBBON.happy : '') +
      `<g transform="${sink}">` +
        `<path d="${SIL}" fill="url(#juanjuan-band)"/>` +                                                       // 胶带外圈（侧面）
        `<g ${L(C.coral, 3.2)}><path d="M23 46 A42 14 0 0 0 107 46"/><path d="M23 77 A42 14 0 0 0 107 77"/></g>` + // 珊瑚红条纹
        `<g ${L(C.coral, 1.2)} opacity=".8"><path d="M23 50.5 A42 14 0 0 0 107 50.5"/><path d="M23 72.5 A42 14 0 0 0 107 72.5"/></g>` +
        `<ellipse cx="65" cy="40" rx="42" ry="14" fill="${C.top}"/>` +                                         // 顶面：一圈圈胶带层
        `<g fill="none" stroke="${C.ring}" stroke-width="1"><ellipse cx="65" cy="40" rx="36" ry="12"/><ellipse cx="65" cy="40" rx="30" ry="10"/><ellipse cx="65" cy="40" rx="25.5" ry="8.5"/></g>` +
        `<ellipse cx="65" cy="40" rx="21" ry="7" fill="${C.kraft}"/>` +                                         // 牛皮纸芯
        `<ellipse cx="65" cy="40" rx="17" ry="5.6" fill="${C.kraftD}"/>` +                                      // 孔里看得见的纸芯内壁
        `<ellipse cx="65" cy="41.8" rx="15" ry="3.6" fill="${C.hole}"/>` +
        `<path d="M29 52 V80" ${L('#fff', 3)} opacity=".6"/>` +
        `<g filter="url(#juanjuan-wobble)"><path d="${SIL}" ${L(C.ink, 2.4)}/><ellipse cx="65" cy="40" rx="42" ry="14" ${L(C.ink, 2)}/><ellipse cx="65" cy="40" rx="21" ry="7" ${L(C.ink, 1.4)}/></g>` +
        `<g fill="${C.coral}" opacity="${P === 'happy' ? .6 : .45}"><ellipse cx="43" cy="79" rx="5" ry="2.8"/><ellipse cx="87" cy="79" rx="5" ry="2.8"/></g>` +
        eyes + mouth +
      '</g>' +
      (tailBack ? '' : RIBBON[P]) +
      `<g fill="${C.cream}" stroke="${C.ink}" stroke-width="2.2">${ARMS[P]}</g>` +
      extra + '</svg>';
  }

  const def = {
    label: '卷卷',
    svg,
    size: [181, 162],
    foot: .883,
    flipSvg: false,     // 朝左时由引擎用 CSS 整体镜像
    outline: true,      // 铅笔灰轮廓，放到深色底上时要引擎加浅色描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('juanjuan', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「卷卷」先不注册，换成支持形象注册的引擎后会自动出现');
})();
