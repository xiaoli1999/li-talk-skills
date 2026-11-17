/* =====================================================================
   形象 · 墨丸 mowan（水墨国风 ink 的默认形象）
   - 名字：墨丸。古人管墨锭叫「墨丸」，正好是一团圆滚滚的墨
   - 长相：一滴刚从笔尖落到宣纸上的墨——
     · 身子是一滴墨的形状：淡墨渲染，中间留白多、边缘积墨深（像墨在纸上洇开时的水痕），底部墨往下沉更浓；
       外面浓墨勾一圈有粗细变化的轮廓（左下压笔更粗），再晕出一圈极淡的墨边；左上一抹没染到的留白，像墨滴的反光
     · 头顶不是芽，是提笔时留下的一缕「笔锋」
     · 眉心点一粒朱砂，两颊淡淡朱砂腮红——全身只有这两处红，和页面「朱砂只做强调」一致
     · 手是两笔短短的撇捺（起笔粗、收笔尖），脚是两个墨点
   - 姿势（svg(pose, opts) 的 pose，默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     idle  平常站着，两手垂在身侧
     point 身子朝前探 5°、一只手斜斜伸出去指
     happy 眯成两道弯的笑眼、张嘴、双手高举，腮红更深
     rest  摊坐打盹：身子压扁成一团、笔锋耷拉到一边、闭眼、小嘴微张
   - 眨眼：opts.blink 为真时，idle、point 的两颗墨点眼换成两道往下弯的弧（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边）时眼睛往那边挪，最多横 3、竖 3（画像坐标）；
     没给时 idle、point、happy 略微看向前方（样页的 data-look="f"）
   - 画布 120×140（viewBox），舞台上显示 118×138（身子连笔锋约 128px 高）；脚底墨点的底边在 y≈136（foot .97）
   - 渐变和两个滤镜（墨线轻轻抖一下、外沿的墨晕）放在 defs 里，引擎把它们放进页面公用的 .deck-defs，id 都以 mowan- 开头；
     每只墨丸的 SVG 里只引用，不再自带 <defs>。.m-tip 是笔锋、.m-armf 是指向那只手（data-o 是转动中心），给以后的小动作用
   - 来源：定稿样页 09-水墨国风.html 里的 mascotSvg，画法、配色原样移植；只做了接口适配（眨眼、视线改成参数，defs 挪出去）
   ===================================================================== */
(function () {
  'use strict';
  const INK = '#1E1C19', ZHU = '#B8352B', PAPER = '#F3EDE1';
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const clamp = v => Math.max(-1, Math.min(1, +v || 0));

  // 一笔有粗细的短画：沿二次曲线，起笔宽 w0、收笔宽 w1
  function taper(x0, y0, cx, cy, x1, y1, w0, w1) {
    const nrm = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    const [ax, ay] = nrm(x0, y0, cx, cy), [bx, by] = nrm(cx, cy, x1, y1), [mx, my] = nrm(x0, y0, x1, y1), wm = (w0 + w1) / 2;
    const f = v => +v.toFixed(1);
    return `M${f(x0 + ax * w0 / 2)} ${f(y0 + ay * w0 / 2)}Q${f(cx + mx * wm / 2)} ${f(cy + my * wm / 2)} ${f(x1 + bx * w1 / 2)} ${f(y1 + by * w1 / 2)}`
      + `L${f(x1 - bx * w1 / 2)} ${f(y1 - by * w1 / 2)}Q${f(cx - mx * wm / 2)} ${f(cy - my * wm / 2)} ${f(x0 - ax * w0 / 2)} ${f(y0 - ay * w0 / 2)}Z`;
  }

  const DEFS =
    `<radialGradient id="mowan-g" cx=".42" cy=".44" r=".68"><stop offset="0" stop-color="#D2C9B8"/><stop offset=".55" stop-color="#B7AD9A"/><stop offset=".85" stop-color="#928877"/><stop offset="1" stop-color="#6C6357"/></radialGradient>`
    + `<linearGradient id="mowan-p" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity=".34"/></linearGradient>`
    + `<radialGradient id="mowan-s"><stop offset="0" stop-color="${PAPER}" stop-opacity=".85"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></radialGradient>`
    + `<filter id="mowan-r" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`
    + `<filter id="mowan-h" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`;

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const rest = pose === 'rest';
    // 身子：一滴墨（站着）/ 摊开的一团（打盹）；press 是左下压笔加粗的那一截
    const body = rest
      ? 'M60 54C69 63 107 72 107 101C107 121 87 130 60 130C33 130 13 121 13 101C13 72 51 63 60 54Z'
      : 'M60 30C68 42 99 56 100 88C101 113 83 129 60 129C37 129 19 113 20 88C21 57 52 42 60 30Z';
    const press = rest ? 'M11.6 106C14.5 123 35 131.6 60 131.6' : 'M18.6 99C22.5 118 39 130.6 60 130.6';
    // 笔锋：根部坐标、曲线
    const tip = rest ? { o: '60 59', d: taper(59.5, 60, 47, 50, 33, 63, 8.5, 1.2) }
      : pose === 'happy' ? { o: '60 36', d: taper(59.5, 38, 52, 17, 75, 9, 9.5, 1.2) }
      : { o: '60 36', d: taper(59.5, 38, 56, 21, 71, 8, 9.5, 1.2) };
    // 手：两笔撇捺
    let arms;
    if (pose === 'point') arms = `<path d="${taper(23, 95, 14, 101, 10, 110, 6.2, 1.6)}"/><path class="m-armf" data-o="97 88" d="${taper(97, 88, 111, 80, 124, 62, 6.8, 1.6)}"/>`;
    else if (pose === 'happy') arms = `<path d="${taper(25, 84, 15, 73, 10, 58, 6.6, 1.6)}"/><path d="${taper(95, 84, 105, 73, 110, 58, 6.6, 1.6)}"/>`;
    else if (rest) arms = `<path d="${taper(16, 111, 8, 116, 10, 124, 5.6, 1.5)}"/><path d="${taper(104, 111, 112, 116, 110, 124, 5.6, 1.5)}"/>`;
    else arms = `<path d="${taper(23, 95, 14, 101, 10, 110, 6.2, 1.6)}"/><path d="${taper(97, 95, 106, 101, 110, 110, 6.2, 1.6)}"/>`;
    // 视线：给了 look 就照着挪眼睛，没给就略微看向前方（打盹时不挪）
    const lk = Array.isArray(o.look) && o.look.length === 2 ? o.look : null;
    const ex = lk ? clamp(lk[0]) * 3 : rest ? 0 : 2.6, ey = lk && !rest ? clamp(lk[1]) * 3 : 0;
    const shift = ex || ey ? ` transform="translate(${+ex.toFixed(1)} ${+ey.toFixed(1)})"` : '';
    // 脸：眼、嘴、腮红、眉心朱砂（打盹时整张脸跟着身子往下挪）
    let eyes, mouth;
    if (pose === 'happy') {
      eyes = `<g class="m-eyes"${shift} fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"><path d="M41.5 87Q47 79 52.5 87"/><path d="M67.5 87Q73 79 78.5 87"/></g>`;
      mouth = `<path d="M52.5 95.5Q60 108.5 67.5 95.5Z" fill="${INK}"/><ellipse cx="60" cy="102.6" rx="3.6" ry="2.1" fill="${ZHU}"/>`;
    } else if (rest) {
      eyes = `<g class="m-eyes" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"><path d="M41 85Q47 90 53 85"/><path d="M67 85Q73 90 79 85"/></g>`;
      mouth = `<ellipse cx="60" cy="97.5" rx="2.6" ry="2.2" fill="${INK}"/>`;
    } else {
      eyes = o.blink
        ? `<g class="m-eyes"${shift}><g class="m-ec" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M42 85.5Q47 88 52 85.5"/><path d="M68 85.5Q73 88 78 85.5"/></g></g>`
        : `<g class="m-eyes"${shift}><g class="m-eo" fill="${INK}"><ellipse cx="47" cy="84" rx="4.7" ry="5.9"/><ellipse cx="73" cy="84" rx="4.7" ry="5.9"/>`
          + `<circle cx="48.8" cy="81.7" r="1.6" fill="${PAPER}"/><circle cx="74.8" cy="81.7" r="1.6" fill="${PAPER}"/></g></g>`;
      mouth = `<path d="M55 97.5Q60 102 65 97.5" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    const blushA = pose === 'happy' ? .62 : .45;
    const face = `<g transform="translate(0 ${rest ? 16 : 0})">`
      + `<ellipse cx="36.5" cy="95" rx="6.2" ry="3.4" fill="${ZHU}" opacity="${blushA}"/><ellipse cx="83.5" cy="95" rx="6.2" ry="3.4" fill="${ZHU}" opacity="${blushA}"/>`
      + `<ellipse cx="60" cy="64" rx="3" ry="3.6" fill="${ZHU}"/>${eyes}${mouth}</g>`;
    const feet = rest ? '' : `<g fill="${INK}"><ellipse cx="47" cy="132" rx="7.5" ry="3.8"/><ellipse cx="73" cy="132" rx="7.5" ry="3.8"/></g>`;
    const lean = pose === 'point' ? ' transform="rotate(5 60 130)"' : rest ? ' transform="rotate(-6 60 130)"' : '';   // 指的时候往前探，打盹时脑袋歪向一边
    return `<svg viewBox="0 0 120 140" aria-hidden="true" focusable="false">`
      + feet
      + `<g${lean}>`
      + `<path d="${body}" fill="none" stroke="${INK}" stroke-opacity=".16" stroke-width="11" filter="url(#mowan-h)"/>`   // 外沿洇开的淡墨
      + `<path d="${body}" fill="url(#mowan-g)"/><path d="${body}" fill="url(#mowan-p)"/>`                                // 淡墨渲染 + 底部积墨
      + `<ellipse cx="41" cy="${rest ? 82 : 62}" rx="${rest ? 13 : 9}" ry="${rest ? 8 : 14}" transform="rotate(${rest ? -12 : 24} 41 ${rest ? 82 : 62})" fill="url(#mowan-s)"/>`   // 左上一抹留白
      + `<g filter="url(#mowan-r)" fill="${INK}"><path d="${body}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
      + `<path d="${press}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
      + `<path class="m-tip" data-o="${tip.o}" d="${tip.d}"/>${arms}</g>`
      + face + `</g></svg>`;
  }

  Deck.mascot('mowan', {
    label: '墨丸',
    svg,
    size: [118, 138],
    foot: .97,
    flipSvg: false,
    outline: true,      // 自己的轮廓是浓墨，深色底上要引擎加浅色描边
    defs: DEFS,
  });
})();
