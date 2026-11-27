/* =====================================================================
   形象 · 点点 diandian（像素手账 journal 的默认形象）
   - 名字：点点，取点阵手账的「点」，也是一个个像素点
   - 长相：一只 24×21 格的像素墨水瓶，全身只用 rect 拼：琥珀色螺纹瓶盖、细瓶颈、透亮的瓶肩，
     瓶肩上是 2×2 格的豆豆眼、小嘴和琥珀腮红；下半瓶是墨绿墨水，墨面一道亮线；
     瓶身左边一串斜斜的反光格；底下两只墨绿小脚。外轮廓一格墨绿（和页面墨色同色）
   - 和像素游戏的「小旗」拉开：点点是个物件，没有帽子、没有旗、不是人形，只用墨绿和琥珀两色
   - 姿势（svg(pose, opts) 的 pose）：
     idle  平常站着，两只像素小手垂着
     point 右手平伸出去（4 格），眼睛和嘴往右挪一格看过去；朝左时由引擎整体镜像
     happy 眼睛弯成 ^ ^、张嘴（琥珀舌头），两手举起，墨水晃出波浪，左右各蹦出一颗琥珀小星
     rest  收脚坐下（整只往下沉一格）、闭眼、小嘴，右上角冒一个像素 Z
   - 眨眼：opts.blink 为真时 idle、point 的 2×2 眼睛只留下面一行（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]，x > .3 眼睛往前挪一格、x < -.3 往后挪一格；point 没给时默认朝前看
   - 画布 24×21 格（viewBox 0 0 24 21，shape-rendering crispEdges），舞台上按 144×126 显示，一格 6px；
     脚底在第 21 格的下沿（foot 1）
   - pixel: true：引擎把它落定的位置取整到整数屏幕像素，放在半像素上边缘会虚
   - 没有 defs
   - 取自原有风格形象的定稿样页，原样移植（画法、配色不变），只改成形象接口
   ===================================================================== */
(function () {
  'use strict';
  const PAL = { k: '#1F3B2F', g: '#E4EFE5', w: '#FFFFFF', m: '#4F9B75', i: '#2F6E52', j: '#22513D', a: '#F2A93B', b: '#C98123', y: '#FFD889' };
  const W = 24, H = 21;
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const BASE = [
    '........kkkkkkkk........', // 0 瓶盖顶
    '.......kyaaaaaabk.......', // 1 瓶盖
    '.......kyabababbk.......', // 2 瓶盖螺纹
    '.......kyabababbk.......', // 3
    '.......kkkkkkkkkk.......', // 4 瓶盖下沿
    '.........kwgggk.........', // 5 瓶颈
    '.......kkgwggggkk.......', // 6 瓶肩
    '.....kkgwggggggggkk.....', // 7
    '....kgwggggggggggggk....', // 8
    '....kwgggggggggggggk....', // 9  脸在这一段
    '....kwgggggggggggggk....', // 10
    '....kggggggggggggggk....', // 11
    '....kggggggggggggggk....', // 12
    '....kggggggggggggggk....', // 13
    '....kmmmmmmmmmmmmmmk....', // 14 墨面
    '....kmiiiiiiiiiiiiik....', // 15 墨水
    '....kmiiiiiiiiiiiiik....', // 16
    '....kiiiiiiiiiiiiiik....', // 17
    '....kjjjjjjjjjjjjjjk....', // 18
    '.....kkkkkkkkkkkkkk.....', // 19 瓶底
    '.......kkk....kkk.......', // 20 两只脚
  ];
  BASE.forEach((r, i) => { if (r.length !== W) console.warn('点点：第 ' + i + ' 行不是 ' + W + ' 格', r); });
  const sh = (list, dx) => list.map(([x, y]) => [x + dx, y]);
  const EYES = [[7, 9], [8, 9], [7, 10], [8, 10], [15, 9], [16, 9], [15, 10], [16, 10]];
  const EYES_SHUT = [[7, 10], [8, 10], [15, 10], [16, 10]];
  const SMILE = [[10, 11], [13, 11], [11, 12], [12, 12]];
  const CHEEKS = [[5, 12], [6, 12], [17, 12], [18, 12]];
  const ARMS = {
    idle: [[3, 12], [2, 13], [2, 14], [20, 12], [21, 13], [21, 14]],
    point: [[3, 12], [2, 13], [2, 14], [20, 11], [21, 11], [22, 11], [23, 11]],
    happy: [[3, 11], [2, 10], [2, 9], [20, 11], [21, 10], [21, 9]],
    rest: [],
  };

  // 按姿势、眨眼、视线排出每一格的颜色字符（'' 是透明）
  function cells(P, o) {
    const dy = P === 'rest' ? 1 : 0;                       // 休息：收脚坐下，整只往下沉一格
    const g = Array.from({ length: H }, () => Array(W).fill(''));
    BASE.forEach((row, y) => {
      if (P === 'rest' && y === 20) return;
      for (let x = 0; x < W; x++) if (row[x] !== '.' && y + dy < H) g[y + dy][x] = row[x];
    });
    const put = (list, ch, off = dy) => list.forEach(([x, y]) => { const yy = y + off; if (x >= 0 && x < W && yy >= 0 && yy < H) g[yy][x] = ch; });
    if (P === 'happy') {
      put([[5, 13], [6, 13], [17, 13], [18, 13]], 'm');    // 蹦起来时墨水贴着瓶壁往上涌
      put([[6, 10], [7, 9], [8, 9], [9, 10], [14, 10], [15, 9], [16, 9], [17, 10]], 'k');   // ^ ^ 笑眼
      put([[11, 11], [12, 11], [10, 12], [13, 12], [11, 13], [12, 13]], 'k');               // 张开的嘴
      put([[11, 12], [12, 12]], 'a');
      put(CHEEKS, 'a');
      put([[2, 2], [1, 3], [2, 3], [3, 3], [2, 4], [21, 1], [20, 2], [21, 2], [22, 2], [21, 3]], 'a'); // 两颗小星
      put([[4, 6], [19, 5]], 'y');
    } else if (P === 'rest') {
      put(EYES_SHUT, 'k');
      put([[11, 12], [12, 12]], 'k');
      put(CHEEKS, 'a');
      put([[19, 0], [20, 0], [21, 0], [22, 0], [21, 1], [20, 2], [19, 3], [20, 3], [21, 3], [22, 3]], 'm', 0); // Z
    } else {
      const lx = Array.isArray(o.look) ? o.look[0] : (P === 'point' ? 1 : 0);
      const dx = lx > .3 ? 1 : lx < -.3 ? -1 : 0;
      put(sh(o.blink ? EYES_SHUT : EYES, dx), 'k');
      put(sh(SMILE, dx), 'k');
      put(CHEEKS, 'a');
    }
    put(ARMS[P], 'k');
    return g;
  }

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const g = cells(P, opts || {});
    const byColor = {};
    g.forEach((row, y) => {                                  // 同一行相邻同色的格子合成一个 rect
      for (let x = 0; x < W;) {
        const ch = row[x];
        if (!ch) { x++; continue; }
        let n = 1;
        while (x + n < W && row[x + n] === ch) n++;
        (byColor[ch] = byColor[ch] || []).push(`<rect x="${x}" y="${y}" width="${n}" height="1"/>`);
        x += n;
      }
    });
    const order = ['k', 'g', 'w', 'm', 'i', 'j', 'b', 'a', 'y'];
    return `<svg viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">` +
      order.filter(c => byColor[c]).map(c => `<g fill="${PAL[c]}">${byColor[c].join('')}</g>`).join('') + '</svg>';
  }

  const def = {
    label: '点点',
    svg,
    size: [144, 126],   // 24×21 格，一格 6px
    foot: 1,
    pixel: true,        // 像素画：引擎把落点取整到整数屏幕像素，边缘不虚
    flipSvg: false,     // 朝左时由引擎用 CSS 整体镜像
    outline: true,      // 墨绿轮廓，放到深色底上时要引擎加浅色描边
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('diandian', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「点点」先不注册，换成支持形象注册的引擎后会自动出现');
})();
