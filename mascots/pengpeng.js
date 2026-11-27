/* =====================================================================
   形象 · 砰砰 pengpeng（新粗野主义 brutal 的默认形象）
   - 名字：砰砰，一枚长了手脚的「爆炸贴纸」小怪物
   - 长相：新粗野主义版面上最常见的锯齿爆炸贴、粗黑描边和硬阴影，砰砰就是从这种贴纸里蹦出来的：
     黄色 14 齿锯齿身体、4px 墨黑描边、左上一道白色高光、粉色腮红和舌头、蓝色小鞋，配色全取风格的三个强调色。
     手臂是「黑粗线 + 黄细线」叠出来的描边软管，换姿势只改路径。轮廓靠锯齿身体立住，投影上一眼能认；
     表情靠两只大眼睛（瞳孔看向当前内容）、眉毛和嘴型。硬阴影不画在 SVG 里：新粗野主义风格用 --mascot-shadow
     给它加一道无模糊的硬投影（朝左时风格把投影方向反过来，光向不变）
   - 画布 150×140，脚底在 y 134（foot .957）；舞台上按 1.1 倍显示 165×154，身体从头顶到鞋底约 125px。
     所有姿势共用同一张画布，换姿势不跳位
   - 姿势（默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     · idle  平常：站着、手垂两侧、抿嘴笑
     · point 指向：身体前倾、朝右伸手、挑眉张嘴
     · happy 开心：双手举高、眯眼大笑露舌头、头顶冒三道开心线
     · rest  休息：坐下打盹，身体矮下去歪着头、闭眼、两只鞋底朝前
     · 过渡帧：walk（走动时：和平常一样，两只脚一抬一落，SVG 自带的迈步小动画，0.24 秒一轮）、
       jump（腾空时：双手举高、眼睛睁大、嘴张成圆、两腿收起来）
   - 眨眼：opts.blink 为真时两只眼睛（眼白连同瞳孔）竖着压成一条线（样页的 .blink 是 scaleY(.1)，这里直接画进 SVG）；
     只有睁着眼的姿势（idle、point、walk、jump）有，开心（眯眼）和休息（闭眼）没有
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是面朝的方向，引擎已把镜像算进去）时瞳孔跟着平移，最多横 3.6、竖 3.4（画布单位），
     和样页 lookAt 的幅度一样；没给时正视
   - 不需要滤镜、渐变，所以没有 defs
   - 来源：定稿样页（新粗野主义）里的 mascotSvg，照原样移植（画法、配色、坐标不变）；新增了 walk、jump 两个过渡帧
   ===================================================================== */
(function () {
  'use strict';
  const MC = { ink: '#15120F', body: '#FFCC2F', pink: '#FF7DB4', blue: '#6E9CFF', white: '#FFFDF7' };
  const MW = 150, MH = 140, FOOT = 134;            // 画布宽高、脚底 y（SVG 单位）
  const POSES = ['idle', 'point', 'happy', 'rest', 'walk', 'jump'];
  const clamp = v => Math.max(-1, Math.min(1, +v || 0));

  // 爆炸贴纸的锯齿外形：14 个尖
  const BURST = (() => {
    const n = 14, cx = 75, cy = 66, R = 44, r = 37.5;
    let d = '';
    for (let k = 0; k < n * 2; k++) {
      const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r : R;
      d += (k ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  })();

  // 迈步：一只脚先抬 5 个单位、另一只后抬，0.24 秒一轮（discrete：一下抬起、一下落下）
  const step = first => `<animateTransform attributeName="transform" type="translate" values="${first ? '0 -5;0 0' : '0 0;0 -5'}" keyTimes="0;.5" calcMode="discrete" dur=".24s" repeatCount="indefinite"/>`;

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const K = MC.ink;
    const tube = d => `<path d="${d}" fill="none" stroke="${K}" stroke-width="13" stroke-linecap="round"/>` +
                      `<path d="${d}" fill="none" stroke="${MC.body}" stroke-width="5" stroke-linecap="round"/>`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${MC.body}" stroke="${K}" stroke-width="4"/>`;
    const line = (d, w = 4.5) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const shoe = (x, y, rx = 12, ry = 7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${MC.blue}" stroke="${K}" stroke-width="4"/>`;
    // 视线：瞳孔组整体平移；眨眼：眼白连同瞳孔竖着压成一条线（以眼睛中心为原点）
    const lk = Array.isArray(o.look) && o.look.length === 2 ? o.look : null;
    const pt = lk ? `translate(${(clamp(lk[0]) * 3.6).toFixed(2)} ${(clamp(lk[1]) * 3.4).toFixed(2)})` : '';
    const eye = (x, y) => {
      const body = `<ellipse cx="${x}" cy="${y}" rx="9.5" ry="11.5" fill="${MC.white}" stroke="${K}" stroke-width="4"/>` +
        `<g class="m-pupil"${pt ? ` transform="${pt}"` : ''}><circle cx="${x}" cy="${y + 1.5}" r="5.2" fill="${K}"/><circle cx="${x + 1.8}" cy="${y - .6}" r="1.7" fill="${MC.white}"/></g>`;
      return o.blink ? `<g class="m-eye" transform="translate(0 ${y}) scale(1 .1) translate(0 ${-y})">${body}</g>` : `<g class="m-eye">${body}</g>`;
    };
    const armL = tube('M46 80 Q34 88 29 99') + hand(29, 100), armR = tube('M104 80 Q116 88 121 99') + hand(121, 100);
    const armsUp = tube('M48 70 Q32 58 26 33') + hand(26, 31) + tube('M102 70 Q118 58 124 33') + hand(124, 31);
    let arms, bodyT = '', legs = '', front = '', over = '', face;
    const cheeks = `<ellipse cx="53" cy="77" rx="6.5" ry="4" fill="${MC.pink}"/><ellipse cx="97" cy="77" rx="6.5" ry="4" fill="${MC.pink}"/>`;
    if (pose === 'point') {                     // 朝右伸手、身体前倾
      arms = armL + tube('M100 64 L134 57') + hand(136, 57);
      bodyT = 'rotate(6 75 110)';
      face = eye(62, 60) + eye(88, 60) + line('M53 45 Q60 39 69 42', 4) + line('M81 42 Q90 39 97 45', 4) +
             `<ellipse cx="75" cy="80" rx="5" ry="5.5" fill="${K}"/>`;
    } else if (pose === 'happy') {              // 双手举高、眯眼大笑、头顶三道开心线
      arms = armsUp;
      face = line('M53 63 Q62 52 71 63') + line('M79 63 Q88 52 97 63') +
             `<path d="M62 74 H88 Q87 92 75 92 Q63 92 62 74 Z" fill="${K}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>` +
             `<ellipse cx="75" cy="87.5" rx="6.5" ry="3.6" fill="${MC.pink}"/>`;
      over = line('M58 14 L54 5', 4) + line('M75 11 L75 2.5', 4) + line('M92 14 L96 5', 4);
    } else if (pose === 'rest') {               // 坐下打盹：矮下去、歪头、闭眼、鞋底朝前
      arms = tube('M48 82 Q38 92 34 101') + hand(34, 102) + tube('M102 82 Q112 92 116 101') + hand(116, 102);
      bodyT = 'translate(0 13) rotate(-5 75 110)';
      face = line('M54 61 Q62 67 70 61') + line('M80 61 Q88 67 96 61') + `<ellipse cx="75" cy="82" rx="3.2" ry="2.8" fill="${K}"/>`;
      front = shoe(57, 124, 9.5, 8.5) + shoe(93, 124, 9.5, 8.5);
    } else if (pose === 'jump') {               // 腾空：双手举高、眼睛睁大、嘴张成圆、两腿收起
      arms = armsUp;
      face = eye(62, 58) + eye(88, 58) + `<ellipse cx="75" cy="81" rx="6" ry="7" fill="${K}"/>`;
    } else {                                    // 平常（walk 也用这张脸）：手垂两侧、抿嘴笑
      arms = armL + armR;
      face = eye(62, 60) + eye(88, 60) + line('M67 78 Q75 85 83 78', 4);
    }
    if (pose === 'walk') {
      legs = `<g>${line('M64 98 L62 118', 7)}${shoe(59, 125)}${step(true)}</g><g>${line('M86 98 L88 118', 7)}${shoe(91, 125)}${step(false)}</g>`;
    } else if (pose === 'jump') {
      legs = line('M64 98 L60 111 M86 98 L90 111', 7) + shoe(57, 117) + shoe(93, 117);
    } else if (pose !== 'rest') {
      legs = line('M64 98 L62 118 M86 98 L88 118', 7) + shoe(59, 125) + shoe(91, 125);
    }
    const gloss = `<path d="M45 57 Q46 46 54 40" fill="none" stroke="${MC.white}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
    return `<svg viewBox="0 0 ${MW} ${MH}" aria-hidden="true" overflow="visible">${legs}<g${bodyT ? ` transform="${bodyT}"` : ''}>${arms}` +
           `<path d="${BURST}" fill="${MC.body}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/>${gloss}${cheeks}${face}</g>${over}${front}</svg>`;
  }

  const def = {
    label: '砰砰',
    svg,
    size: [165, 154],                 // 舞台上的外框（画布 150×140 的 1.1 倍）；看得见的身子约 125px 高
    foot: +(FOOT / MH).toFixed(3),    // 鞋底：站上沿、落地压扁都以它为准
    frames: ['walk', 'jump'],
    flipSvg: false,                   // 朝左时由引擎用 CSS 镜像（硬投影的方向由风格 CSS 反过来）
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('pengpeng', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「砰砰」先不注册，换成支持形象注册的引擎后会自动出现');
})();
