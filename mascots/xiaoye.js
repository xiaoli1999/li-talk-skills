/* =====================================================================
   形象 · 小页 xiaoye（扁平插画 flat 的默认形象）
   - 名字：小页，取「一页一页」的页——课件是一页页翻的
   - 长相：一只几何扁平风的小狐狸。珊瑚色的毛，白色口鼻（连着两侧的腮毛尖）和肚皮，墨蓝的小腿和爪尖，
     脖子上一条明黄小围巾，围巾结垂在一侧；尾巴尖是白的。
     和扁平插画的页面用同一套语言：形状只用圆、圆角矩形、圆角三角；配色只用珊瑚、明黄、墨蓝和白；
     光从左上来——每块形状的右下沿露出一条深一级的暗部（把本色朝左上错开一点盖在暗色上，裁在原形状里），
     头顶左上一道浅色亮边，眼睛和鼻头的高光点都在左上
   - 姿势（svg(pose, opts) 的 pose，画的是朝右）：
     · idle  站着，两爪垂在身侧
     · point 身体前倾一点、一只爪伸直指向前方，眼睛看过去
     · happy 两爪举高、眼睛眯成 ^^、张嘴笑，耳朵往外张
     · rest  趴下打盹：脑袋搁在前爪上，尾巴圈在身前，眼睛闭成两道弧，耳朵耷拉
   - 眨眼：opts.blink 为真时，idle、point 的圆眼睛换成两道闭眼弧（引擎随机 2.5–6 秒眨一次，闭 140ms）；
     happy（笑眼）、rest（闭眼）没有眨眼帧
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的方向），眼睛往那边挪，最多横 2.2、竖 1.4（画像坐标）；
     打盹时不跟
   - 镜像（flipSvg: true）：朝左时引擎传 opts.flip = true，由这里自己画镜像——整只翻过去，
     同时暗部、亮边、高光换成左右对调的那一份，翻过去以后仍然是左上受光（引擎不再用 CSS 镜像）
   - 画布 120×130，舞台上显示 120×130；脚底在 y=128（foot .985）
   - 各部位的裁切（画暗部用）放在 defs 里，引擎放进页面公用的 .deck-defs；id 都以 xiaoye- 开头，
     每只小页的 SVG 里只引用，不再自带 <defs>
   - 投影不画在 SVG 里：用所在风格的 --mascot-shadow（扁平插画是落向右下、不模糊的同色相半透明影）
   - 来源：定稿样页 06-扁平插画.html 里的 mascotSvg，照原样移植（形状、配色、姿势不变）；
     改的只有接口：裁切挪进公用 defs，原来靠 CSS 显隐的「朝右 / 朝左两份暗部」改成按 opts.flip 只画一份，
     眨眼、视线改由 opts 传入
   ===================================================================== */
(function () {
  'use strict';
  const MC = {
    fur: '#FF6B57', furD: '#E2503E', furL: '#FFA08C',
    cream: '#FFFAF7', creamD: '#F3D9D0', inEar: '#FFD5C9',
    ink: '#1F2A44', sun: '#FFC53D', sunD: '#EAA11D',
    blush: '#FFAE9C', tongue: '#FF8A78',
  };
  // 各部位的形状（画像坐标，画的是朝右）
  const MS = {
    head: 'M60 26C79 26 92 36 94 51L101 61Q102.5 63.6 99.6 64.5L92 66C87 74 75 79 60 79C45 79 33 74 28 66L20.4 64.5Q17.5 63.6 19 61L26 51C28 36 41 26 60 26Z',
    muzzle: 'M19 61C27 57 38 56.6 47 60.5C52 62.8 55.5 64 60 64C64.5 64 68 62.8 73 60.5C82 56.6 93 57 101 61Q102.5 63.6 99.6 64.5L92 66C87 74 75 79 60 79C45 79 33 74 28 66L20.4 64.5Q17.5 63.6 19 61Z',
    earL: 'M27.5 47L31.6 11.5Q32.6 5.5 37.6 9L56 31Z',
    earR: 'M92.5 47L88.4 11.5Q87.4 5.5 82.4 9L64 31Z',
    inL: 'M34 38.5L36 18.5Q36.6 15 39.2 17.2L49 29.5Z',
    inR: 'M86 38.5L84 18.5Q83.4 15 80.8 17.2L71 29.5Z',
    body: 'M45 76C38 80 35.5 92 36.5 104C37.2 113.5 42 119 50 119H70C78 119 82.8 113.5 83.5 104C84.5 92 82 80 75 76Z',
    belly: 'M47.5 104a12.5 13 0 1 0 25 0a12.5 13 0 1 0-25 0Z',
    scarf: 'M36.5 73C47 79.5 73 79.5 83.5 73L85 80.5C73.5 88 46.5 88 35 80.5Z',
    tail: 'M0 0C-14 6-36 2-39-18C-41.5-34-31-48-18-55C-19-40-12-22 6-10Z',
    tip: 'M-18-55C-27-50-37-42-39.6-30C-32-32-24-34-16-35.5C-17-42-18.4-49-18-55Z',
    loaf: 'M22 128C14 128 11 121 13 114C17 101 32 94 52 94H74C96 94 108 103 108 116C108 123 103 128 96 128Z',
    curl: 'M100 101C111 102 116 111 114 119C112 126 106 129 98 129H42C35 129 31 126 31 123C31 120 35 118.5 42 118.5H90C96 118.5 100 113 100 101Z',
  };
  // 要画暗部的形状各一个裁切（引用它的元素自己的坐标系，所以放在耳朵、尾巴的旋转里也对得上）
  const CLIPS = ['head', 'muzzle', 'earL', 'earR', 'body', 'belly', 'scarf', 'tail', 'loaf', 'curl'];
  const DEFS = CLIPS.map(k => `<clipPath id="xiaoye-c-${k}"><path d="${MS[k]}"/></clipPath>`).join('');
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => Math.round(n * 10) / 10;

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const flip = !!o.flip, rest = pose === 'rest';
    const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
    const L = (d, color, w) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 带暗部的形状：先铺整块暗色，再把本色朝左上错开 dx/dy 盖上去（裁在原形状里），右下就露出一条暗部。
    // 镜像时整只会翻过去，所以本色改朝右上错开，翻过去以后暗部仍在右下
    const sh = (k, base, dark, dx, dy) => P(MS[k], dark) +
      `<g clip-path="url(#xiaoye-c-${k})">${P(MS[k], base, ` transform="translate(${flip ? dx : -dx} ${-dy})"`)}</g>`;

    // —— 尾巴 ——
    let tail;
    if (rest) {
      tail = sh('curl', MC.fur, MC.furD, 4, 3) + `<g clip-path="url(#xiaoye-c-curl)"><circle cx="24" cy="132" r="19" fill="${MC.cream}"/></g>`;
    } else {
      const rot = { idle: -16, point: -26, happy: -34 }[pose];
      tail = `<g class="xy-tail"><g transform="translate(41 113) rotate(${rot})">` + sh('tail', MC.fur, MC.furD, 4, 4) +
        `<g clip-path="url(#xiaoye-c-tail)">${P(MS.tip, MC.cream)}</g></g></g>`;
    }

    // —— 头：耳朵、脸、口鼻、亮边、腮红、眼睛、鼻子、嘴 ——
    const tilt = rest ? 18 : pose === 'happy' ? 7 : 0;
    const ears =
      `<g class="xy-earL"><g${tilt ? ` transform="rotate(${-tilt} 42 36)"` : ''}>${sh('earL', MC.fur, MC.furD, 4, 3)}${P(MS.inL, MC.inEar)}</g></g>` +
      `<g class="xy-earR"><g${tilt ? ` transform="rotate(${tilt} 78 36)"` : ''}>${sh('earR', MC.fur, MC.furD, 4, 3)}${P(MS.inR, MC.inEar)}</g></g>`;
    let face;
    if (pose === 'happy') face = L('M42.6 55.5Q47 48.6 51.4 55.5M68.6 55.5Q73 48.6 77.4 55.5', MC.ink, 3);
    else if (rest) face = L('M42.6 53.5Q47 57.8 51.4 53.5M68.6 53.5Q73 57.8 77.4 53.5', MC.ink, 2.6);
    else if (o.blink) face = L('M42.6 54Q47 56.4 51.4 54M68.6 54Q73 56.4 77.4 54', MC.ink, 2.6);
    else {
      const hx = flip ? 1.5 : -1.5;   // 眼睛高光在左上（镜像时画在右边，翻过去就在左边）
      face = `<ellipse cx="47" cy="53" rx="4.4" ry="5.4" fill="${MC.ink}"/><ellipse cx="73" cy="53" rx="4.4" ry="5.4" fill="${MC.ink}"/>` +
        `<g fill="#fff"><circle cx="${47 + hx}" cy="51" r="1.6"/><circle cx="${73 + hx}" cy="51" r="1.6"/></g>`;
    }
    // 视线：指着的时候本来就往前看一点；引擎给了 look 再往那边挪
    let lx = pose === 'point' ? 1.8 : 0, ly = 0;
    if (!rest && Array.isArray(o.look) && o.look.length === 2) {
      lx += clamp(+o.look[0] || 0, -1, 1) * 2.2;
      ly += clamp(+o.look[1] || 0, -1, 1) * 1.4;
    }
    const eyes = `<g class="xy-eyes"${lx || ly ? ` transform="translate(${f1(lx)} ${f1(ly)})"` : ''}>${face}</g>`;
    const nose = P('M55 63.6Q60 61.8 65 63.6Q63.4 68.2 60 68.8Q56.6 68.2 55 63.6Z', MC.ink) +
      `<ellipse cx="${flip ? 62.2 : 57.8}" cy="64.3" rx="1.7" ry="1" fill="#fff" fill-opacity=".55"/>`;
    const mouth = pose === 'happy'
      ? P('M55.4 70Q60 71 64.6 70Q63.6 77.4 60 77.6Q56.4 77.4 55.4 70Z', MC.ink) + P('M57.2 74.8Q60 72.8 62.8 74.8Q61.8 77 60 77.1Q58.2 77 57.2 74.8Z', MC.tongue)
      : L('M60 68.8V70.6M56.2 70.4Q58.1 73 60 70.6Q61.9 73 63.8 70.4', MC.ink, 1.9);
    const blush = `<g fill="${MC.blush}"><ellipse cx="36.5" cy="65.6" rx="5.2" ry="3"/><ellipse cx="83.5" cy="65.6" rx="5.2" ry="3"/></g>`;
    // 头顶左上的亮边（镜像时画在右上，翻过去就在左上）
    const rim = flip ? L('M89.4 47C87.8 36.5 79 30 68 29', MC.furL, 3.2) : L('M30.6 47C32.2 36.5 41 30 52 29', MC.furL, 3.2);
    const head = ears + sh('head', MC.fur, MC.furD, 9, 6) + sh('muzzle', MC.cream, MC.creamD, 9, 6) + rim + blush + eyes + nose + mouth;

    // —— 身体、腿、围巾、手臂 ——
    const legs = `<g fill="${MC.ink}"><rect x="45.5" y="110" width="11" height="18" rx="5.5"/><rect x="63.5" y="110" width="11" height="18" rx="5.5"/></g>`;
    const scarfBand = sh('scarf', MC.sun, MC.sunD, 3, 3);
    const scarfEnd = `<g transform="rotate(-12 76 82)"><rect x="71" y="80" width="10" height="20" rx="5" fill="${MC.sunD}"/><rect x="${flip ? 73.5 : 71}" y="80" width="7.5" height="17.5" rx="3.75" fill="${MC.sun}"/></g>`;
    const arm = (d, x, y) => L(d, MC.fur, 10) + `<circle cx="${x}" cy="${y}" r="5.3" fill="${MC.ink}"/>`;
    const armIdleL = arm('M41 85Q35 95 37.5 104.5', 37.5, 104.5);

    let g;
    if (rest) {
      const paws = `<g fill="${MC.ink}"><ellipse cx="46" cy="114" rx="8" ry="5"/><ellipse cx="74" cy="114" rx="8" ry="5"/></g>`;
      g = sh('loaf', MC.fur, MC.furD, 8, 6) + paws + `<g transform="translate(0 32)">${scarfBand}<g class="xy-head">${head}</g></g>` + tail;
    } else {
      const body = sh('body', MC.fur, MC.furD, 7, 5) + sh('belly', MC.cream, MC.creamD, 5, 4);
      let arms;
      if (pose === 'point') arms = armIdleL + arm('M79 85Q92 83 104.5 76.5', 104.5, 76.5);
      else if (pose === 'happy') arms = arm('M41 85Q28 80 22.5 69', 22.5, 69) + arm('M79 85Q92 80 97.5 69', 97.5, 69);
      else arms = armIdleL + arm('M79 85Q85 95 82.5 104.5', 82.5, 104.5);
      const front = pose === 'happy';           // 举手时手臂画在头前面
      g = tail + legs + body + (front ? '' : arms) + scarfEnd + scarfBand + `<g class="xy-head">${head}</g>` + (front ? arms : '');
      if (pose === 'point') g = `<g transform="rotate(5 60 128)">${g}</g>`;   // 指向时身体往前倾一点
    }
    if (flip) g = `<g transform="matrix(-1 0 0 1 120 0)">${g}</g>`;
    return `<svg viewBox="0 0 120 130" aria-hidden="true" focusable="false" overflow="visible">${g}</svg>`;
  }

  const def = {
    label: '小页',
    svg,
    size: [120, 130],       // 舞台上的外框（和样页一样大）
    foot: .985,             // 脚底在 y=128（128/130）
    flipSvg: true,          // 朝左时自己画镜像，暗部、亮边仍在左上受光的位置
    outline: true,          // 没有自带浅色亮边：深色底的风格里由引擎加一圈浅色描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('xiaoye', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「小页」先不注册，换成支持形象注册的引擎后会自动出现');
})();
