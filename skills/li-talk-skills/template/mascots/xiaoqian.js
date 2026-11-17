/* =====================================================================
   形象 · 小铅 xiaoqian（杂志复古 magazine 的默认形象）
   - 名字：小铅，一枚会走路的铅字块（活字）
   - 长相：身体是一块竖长的橘红铅字（圆角方块），下部两道「字槽」（真铅字身上用来认方向的凹槽）；
     头顶凸起一个反写的段落符号 ¶（铅字上的字面是反的，印到纸上才正过来），是它的「呆毛」；
     套印错位：橘红的身体色块故意偏出墨线几像素，像老印刷品没套准；腮红是两小撮半调网点；
     外面一圈米白的剪纸边，像从杂志上剪下来贴到页面上的，墨绿底、深色底上都看得清（所以 outline: false）；
     只用杂志复古的颜色：墨黑线、橘红身体（深一档做腮红）、米白剪纸边
   - 画布 120×146，舞台上显示 104×127；脚底在 y≈142.5（foot .976）
   - 姿势（默认身体朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     · idle  平常站着，两手垂在身侧，眼睛略看向正面一侧
     · point 身体往前倾，前手伸出去指，后手叉腰
     · happy 举起双手，眯眼张嘴笑
     · rest  坐下打盹：身子下沉、两脚伸出、闭眼，头顶的 ¶ 也耷拉下来
     · 另有样页里的 stretch（伸懒腰：双手上举、闭眼、打个哈欠），引擎目前不用，留着
   - 眨眼：opts.blink 为真时，idle、point 的圆眼睛换成两道闭眼弧线（样页用 .me-o / .me-c 两套切换，这里直接画闭眼那套）；
     happy（笑眼）、rest（闭眼）没有眨眼帧
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边，引擎已把镜像算进去）时，眼珠往那边挪，最多横 2.8、竖 2（画像坐标）；
     没给时照样页：idle 往前看 1.2、point 往前看 2.4
   - 没有滤镜和渐变，不用 defs
   - 来源：定稿样页 07-杂志复古.html 里的 mascotSvg，照原样移植（画法、配色不变），只改成引擎的接口
   ===================================================================== */
(function () {
  'use strict';
  const MC = { ink: '#1C1A17', body: '#E0532B', deep: '#B23C1B', cut: '#F7F2E6', hi: '#FFFDF6' };
  const POSES = ['idle', 'point', 'happy', 'rest', 'stretch'];
  const f1 = n => Math.round(n * 10) / 10;
  const clamp = v => Math.max(-1, Math.min(1, +v || 0));

  function svg(pose, opts) {
    const o = opts || {};
    if (!POSES.includes(pose)) pose = 'idle';
    const sit = pose === 'rest';
    const up = `translate(0 ${sit ? 16 : 0})${pose === 'point' ? ' rotate(5 60 118)' : ''}`;   // 上半身：坐下时下沉，指向时前倾
    // 手臂路径与手的位置
    const ARMS = {
      idle:    [['M28 82Q19 92 19 102', 19, 102], ['M92 82Q101 92 101 102', 101, 102]],
      point:   [['M28 84L16 94L27 103', 27, 103], ['M92 78L116 65', 116, 65]],
      happy:   [['M28 76L13 54', 13, 54], ['M92 76L107 54', 107, 54]],
      stretch: [['M28 74L23 44', 23, 44], ['M92 74L97 44', 97, 44]],
      rest:    [['M28 86Q17 98 31 106', 31, 106], ['M92 86Q103 98 89 106', 89, 106]],
    }[pose];
    const BODY = 'x="26" y="40" width="68" height="76" rx="9"';
    const TUFT = `<path d="M48 11H61A9.5 9.5 0 0 1 61 30V40H56.5V15.5H52.5V40H48Z"${sit ? ' transform="rotate(-18 56 40)"' : ''}/>`;
    const arms = ARMS.map(a => `<path d="${a[0]}"/>`).join('');
    const hands = ARMS.map(a => `<circle cx="${a[1]}" cy="${a[2]}" r="3.8"/>`).join('');
    const legs = sit ? '<path d="M45 131L37 137M75 131L83 137"/>' : '<path d="M47 116V134M73 116V134"/>';
    const feet = sit
      ? '<ellipse cx="35" cy="138.5" rx="8.5" ry="4.6"/><ellipse cx="85" cy="138.5" rx="8.5" ry="4.6"/>'
      : '<ellipse cx="45" cy="138" rx="7.6" ry="4.3"/><ellipse cx="75" cy="138" rx="7.6" ry="4.3"/>';
    // 脸：眼睛、嘴
    const LN = `fill="none" stroke="${MC.ink}" stroke-width="3" stroke-linecap="round"`;
    let face;
    if (pose === 'happy') {
      face = `<path d="M43 73q5-7 10 0M67 73q5-7 10 0" ${LN}/>` +
             `<path d="M53.5 80.5H66.5Q66.5 90 60 90Q53.5 90 53.5 80.5Z" fill="${MC.ink}"/>`;
    } else if (sit || pose === 'stretch') {
      face = `<path d="M43.5 70q4.5 4.4 9 0M67.5 70q4.5 4.4 9 0" ${LN}/>` +
             (sit ? `<path d="M57 85h6" ${LN}/>` : `<ellipse cx="60" cy="85" rx="3.6" ry="4.6" fill="${MC.ink}"/>`);
    } else {
      // 视线：引擎给了 look 就照着挪眼珠，没给就照样页往正面一侧偏一点
      const lk = Array.isArray(o.look) && o.look.length === 2 ? o.look : null;
      const g = lk ? f1(clamp(lk[0]) * 2.8) : pose === 'point' ? 2.4 : 1.2;
      const gy = lk ? f1(clamp(lk[1]) * 2) : 0;
      const eyes = o.blink
        ? `<path d="M${43.5 + g} ${71 + gy}q4.5 2.6 9 0M${67.5 + g} ${71 + gy}q4.5 2.6 9 0" ${LN}/>`
        : `<g fill="${MC.ink}"><ellipse cx="${48 + g}" cy="${70 + gy}" rx="4.4" ry="5.8"/><ellipse cx="${72 + g}" cy="${70 + gy}" rx="4.4" ry="5.8"/>` +
          `<circle cx="${49.6 + g}" cy="${67.6 + gy}" r="1.5" fill="${MC.hi}"/><circle cx="${73.6 + g}" cy="${67.6 + gy}" r="1.5" fill="${MC.hi}"/></g>`;
      face = eyes + `<path d="M55 82.5q5 4.6 10 0" ${LN}/>`;
    }
    const cheeks = [[35.5, 79.5, 1.5], [39.5, 79.5, 1.7], [37.5, 83, 1.7], [41.5, 83, 1.3], [33.5, 83, 1.1]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${120 - x}" cy="${y}" r="${r}"/>`).join('');
    // 第一层：米白剪纸边（同样的轮廓描粗）
    const halo = `<g fill="${MC.cut}" stroke="${MC.cut}" stroke-linejoin="round" stroke-linecap="round">` +
      `<g stroke-width="12">${legs}${feet}</g>` +
      `<g transform="${up}"><rect ${BODY} stroke-width="11"/><g stroke-width="8">${TUFT}</g>` +
      `<g stroke-width="13" fill="none">${arms}</g><g stroke-width="8">${hands}</g></g></g>`;
    // 第二层：墨线与色块
    const ink = `<g fill="none" stroke="${MC.ink}" stroke-width="5" stroke-linecap="round">${legs}</g>` +
      `<g fill="${MC.ink}">${feet}</g>` +
      `<g transform="${up}">` +
        `<rect ${BODY} fill="${MC.body}" transform="translate(3.5 2.5)"/>` +                       // 色块偏出墨线：套印错位
        `<g fill="${MC.ink}">${TUFT}</g>` +
        `<rect ${BODY} fill="none" stroke="${MC.ink}" stroke-width="4.2"/>` +
        `<path d="M28 103H92" stroke="${MC.ink}" stroke-width="3"/><path d="M28 108.5H92" stroke="${MC.ink}" stroke-width="1.4"/>` +   // 字槽
        `<g fill="${MC.deep}">${cheeks}</g>${face}` +
        `<g fill="none" stroke="${MC.ink}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">${arms}</g>` +
        `<g fill="${MC.ink}">${hands}</g>` +
      `</g>`;
    return `<svg viewBox="0 0 120 146" aria-hidden="true" focusable="false">${halo}${ink}</svg>`;
  }

  const def = {
    label: '小铅',
    svg,
    size: [104, 127],     // 和样页一样大；看得见的身子（含 ¶ 和脚）约 120px 高
    foot: .976,           // 脚底 y≈142.5 / 146
    flipSvg: false,       // 朝左时由引擎用 CSS 镜像
    outline: false,       // 自带一圈米白剪纸边，深色底上不用再加描边
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('xiaoqian', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「小铅」先不注册，换成支持形象注册的引擎后会自动出现');
})();
