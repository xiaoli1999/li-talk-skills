/* =====================================================================
   形象 · 小旗 xiaoqi（像素游戏 pixel 的默认形象）
   - 名字：小旗。游戏里给玩家带路的像素小向导 NPC，背着一面金色三角小旗——举旗带路，
     正好对应「讲者带着听众一步一步走」
   - 长相：橘色毛线帽（白绒球、金色帽檐）、奶白圆脸、豆豆眼和腮红，绿围巾、蓝短袍、锈红小靴；
     旗杆插在身后，转身时旗子跟着换边（朝左由引擎用 CSS 整体镜像，flipSvg: false）。
     26×30 格，先自动补一圈深色描边，再在最外面加一圈浅紫亮边（直接画进像素里，不用滤镜，所以 outline: false），
     合计 28×32 格；一格 4px，舞台上 112×128px，和像素游戏全页同一张 4px 网格。
     配色只用像素游戏的 16 色调色板
   - 姿势（默认朝右）：
     · idle  平常站着，后手握旗杆
     · point 朝前伸手指过去
     · happy 眯眼张嘴（^ ^），前手举过头顶
     · rest  坐下打盹：头低下来、闭眼，腿往前伸、靴尖朝上，头顶冒一个 z
     · 过渡帧：jump 腾空（举手、腿收起）、squat 下蹲（整个人往下沉两格、腿收掉；起跳和落地「压一下」用）
   - 眨眼：opts.blink 为 true 时，睁眼的两格换成每只眼一条两格宽的横线（样页里给外层加 .blink 的做法，
     这里改成重画时直接画闭眼）；happy、rest 本来就没有睁眼，不眨
   - 视线：像素小人的眼睛只有一格，不跟 opts.look 移动；朝向由引擎的镜像负责
   - 来源：定稿样页（像素游戏）里的 MASCOT 像素表和 mascotSvg，照原样移植，只改成形象接口
   ===================================================================== */
(function () {
  'use strict';

  /* 调色板：像素游戏的 16 色（和 scenes/pixel.css 的颜色一一对应） */
  const PAL = {
    k: '#0B0B1E', 1: '#141634', 2: '#1D2250', 3: '#2B3375', 4: '#46529E', 5: '#7F8DD0', 6: '#C3CBF0',
    w: '#F7F1E1', a: '#FFF2A6', y: '#FFCB3D', o: '#F08A2C', r: '#A9432A',
    l: '#A8F07A', g: '#4CC764', d: '#23805A', p: '#F2727F',
  };
  // 特殊格：O 旗杆、A 旗杆顶、Z 睡觉的 z、S/T 闪光——不自动描边；E 眼睛；R 外圈亮边
  const ALIAS = { O: 'o', A: 'a', Z: '6', S: 'a', T: 'w', E: 'w', R: '6' };
  const NOLINE = 'OAZST';
  const colorOf = c => PAL[ALIAS[c] || c];

  /* 像素工具：一行一个字符串，一个字符一格，'.' 透明 */
  const toGrid = rows => rows.map(r => [...r]);
  // 自动描边：空格子若上下左右挨着「需要描边的色格」，就填成 c。near 给定时只认这些字符
  function outline(g, c = 'k', near = null) {
    const h = g.length, w = g[0].length, out = g.map(r => r.slice());
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (g[y][x] !== '.') continue;
      const hit = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const v = (g[y + dy] || [])[x + dx];
        if (!v || v === '.') return false;
        return near ? near.includes(v) : (v !== 'k' && v !== c && !NOLINE.includes(v));
      });
      if (hit) out[y][x] = c;
    }
    return out;
  }
  function pad(g, n = 1) {
    const w = g[0].length + n * 2, empty = () => Array(w).fill('.'), side = Array(n).fill('.');
    return [...Array(n)].map(empty).concat(g.map(r => [...side, ...r, ...side]), [...Array(n)].map(empty));
  }
  // 转 SVG：同色横向连成一条 rect；高度多给 0.02 防止缩放时行间露缝
  function svgOf(g, extra) {
    const h = g.length, w = g[0].length;
    let out = '';
    for (let y = 0; y < h; y++) for (let x = 0; x < w;) {
      const c = g[y][x];
      if (c === '.') { x++; continue; }
      const col = colorOf(c);
      let n = 1;
      while (x + n < w && g[y][x + n] !== '.' && colorOf(g[y][x + n]) === col) n++;
      out += `<rect x="${x}" y="${y}" width="${n}" height="1.02" fill="${col}"/>`;
      x += n;
    }
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${out}${extra}</svg>`;
  }

  /* 像素表（照样页原样） */
  const FRAMES = (() => {
    const R = (...p) => { const s = p.join(''); if (s.length !== 26) console.warn('[Deck] 小旗：像素行长度不对', s); return s; };
    const D14 = '..............', S5 = '.....', D26 = D14 + D14.slice(2);
    // 头（14 格宽 15 格高）：绒球、帽身、帽檐、脸
    const H = ['.....kkk......', '....kwwwk.....', '....kww6k.....', '..kkkkkkkkkk..', '.kyyooooooork.', 'kyoooooooooork',
      'koooooooooorrk', 'kaaaaaaaaaaayk', 'kyyyyyyyyyyyok', 'k666666666666k', 'kwwwwwEwwwEwwk', 'kwwwwwEwwwEwwk',
      'kwwwwpwwkwwpwk', 'k6wwwwwwwwww6k', '.kkkkkkkkkkkk.'];
    // 身后的旗（7 格宽）：旗杆顶、三角旗面（中间一点白星）、旗杆
    const F = ['.......', '.....A.', '...kkO.', '..kaaO.', '.kayyO.', 'kyywyO.', '.kyyyO.', '..kyyO.', '...kkO.'];
    const P = '.....O.';
    const idle = [];
    for (let y = 0; y < 17; y++) idle.push(R(F[y] || P, y < 2 ? D14 : H[y - 2], S5));
    idle.push(
      R('.....O.', '..', 'klggggggdk', '.......'),                          // 17 围巾
      R('.....O', 'kkkk', 'dddddgdd', 'k', 'kk', S5),                       // 18
      R('.....O', 'w', '444', '4554443k', '44', 'k', S5),                   // 19 后手握旗杆、短袍、前臂
      R('.....O', 'w', '444', '4544433k', '44', 'k', S5),                   // 20
      R('.....O', 'k', 'kkk', 'krrarrrk', 'ww', 'k', S5),                   // 21 腰带、前手
      R('.....O', '...', 'k45444433k', 'k', '......'),                       // 22 袍摆
      R('.....O', '...', 'k33333333k', '.......'),                           // 23
      R('.....O', '...', 'kkkkkkkkkk', '.......'),                           // 24
      R('.....O', '....', 'k33kk33k', '........'),                           // 25 腿
      R('.....O', '....', 'k33kk33k', '........'),                           // 26
      R('.....O', '....', 'krrkkrrk', '........'),                           // 27 靴子
      R('.....O', '....', 'krrrkrrrk', '.......'),                           // 28
      R('.....O', '....', 'kkkkkkkkk', '.......'));                          // 29
    const point = idle.slice();
    point[18] = R('.....O', 'kkkk', 'dddddgdd', 'k', 'kkkkkk', '.');
    point[19] = R('.....O', 'w', '444', '4554443', '4', '44444', 'ww', 'k');
    point[20] = R('.....O', 'w', '444', '4544433', '3', '33333', 'ww', 'k');
    point[21] = R('.....O', 'k', 'kkk', 'krrarrrk', 'kkkkkkk', '.');
    point[22] = R('.....O', '...', 'k45444433k', '.......');
    // 前臂举起：从肩膀斜着伸到头的右上方
    const armUp = rows => {
      rows[14] = rows[14].slice(0, 21) + '.ww..'; rows[15] = rows[15].slice(0, 21) + '.ww..'; rows[16] = rows[16].slice(0, 21) + '44...';
      rows[17] = R('.....O.', '..', 'klggggggdk', '.', '44', '....');
      rows[18] = R('.....O', 'kkkk', 'dddddgdd', 'k', '44', S5);
      rows[19] = R('.....O', 'w', '444', '4554443k', '44', '.', S5);
      rows[20] = R('.....O', 'w', '444', '4544433k', '..', '.', S5);
      rows[21] = R('.....O', 'k', 'kkk', 'krrarrrk', '..', '.', S5);
      rows[22] = R('.....O', '...', 'k45444433k', '.......');
      return rows;
    };
    const happy = armUp(idle.slice());
    happy[12] = R(P, 'kwwwwwkwwwkwwk', S5);                                // 眯眼 ^ ^
    happy[13] = R(P, 'kwwwwkwkwkwkwk', S5);
    happy[14] = R(P, 'kwwwwpwkkkwpwk', happy[14].slice(21));               // 张嘴
    happy[15] = R(P, 'k6wwwwwkpkww6k', happy[15].slice(21));
    const jump = armUp(idle.slice());
    jump[25] = R('.....O', '....', 'k33kk33k', '........');
    jump[26] = R('.....O', '....', 'krrkkrrk', '........');
    jump[27] = R('.....O', '....', 'kkkkkkkk', '........');
    jump[28] = R('.....O', D14, '......');
    jump[29] = D26;
    // 下蹲：整个人往下沉两格，腿收掉（落地「压一下」用的帧）
    const squat = [D26, D26, ...idle.slice(0, 25), ...idle.slice(27)];
    // 坐下打盹：头低下来、闭眼，腿往前伸，靴尖朝上，头顶一个 z
    const rest = [D26, D26,
      R(D14, '........', 'ZZZ', '.'), R(D14, '........', '..Z', '.'),
      R('.....A', '.', D14, '.', '.Z.', '.'), R('...kkO.', D14, '.', 'ZZZ', '.'), R('..kaaO.', D14, S5)];
    for (let i = 0; i < 15; i++) {
      let h = H[i];
      if (i === 10) h = 'kwwwwwwwwwwwwk';
      if (i === 11) h = 'kwwwwkkwwkkwwk';
      rest.push(R(F[i + 4] || P, h, S5));
    }
    rest.push(
      R('.....O.', '..', 'klggggggdk', '.......'),
      R('.....O', 'kkkk', 'dddddgdd', 'k', '.......'),
      R('.....O', 'w', '444', '4554443k', '....', 'rr', '..'),
      R('.....O', 'kkkk', '45444433', '....', 'rr', '..'),
      R('.....O', '...', 'k', 'rrarrrr', '33333', 'rr', '..'),
      R('.....O', '...', 'k', '3333333', '33333', 'rr', '..'),
      R('.....O', '....', '333333333333', 'rr', '..'),
      R('.....O', D14, '......'));
    return { idle, point, happy, rest, jump, squat };
  })();

  /* 画一个姿势：先补齐深色描边，再加一圈亮边；眼睛单独画（睁眼一格，闭眼一条两格宽的线） */
  const cache = {};
  function svg(pose, opts) {
    if (!FRAMES[pose]) pose = 'idle';
    const blink = !!(opts && opts.blink);
    const id = pose + (blink ? '-b' : '');
    if (cache[id]) return cache[id];
    const g = outline(pad(outline(toGrid(FRAMES[pose]))), 'R', ['k']);
    let eyes = '';
    const eyeCol = {};
    g.forEach((r, y) => r.forEach((c, x) => {
      if (c !== 'E') return;
      if (!blink) eyes += `<rect x="${x}" y="${y}" width="1" height="1.02" fill="${PAL.k}"/>`;
      eyeCol[x] = Math.max(eyeCol[x] || 0, y);
    }));
    if (blink) Object.keys(eyeCol).forEach(x => { eyes += `<rect x="${x - 1}" y="${eyeCol[x]}" width="2" height="1.02" fill="${PAL.k}"/>`; });
    return (cache[id] = svgOf(g, eyes));
  }

  const def = {
    label: '小旗',
    svg,
    size: [112, 128],        // 28×32 格，一格 4px
    foot: 124 / 128,         // 脚底在最下面那圈亮边的上沿：站在窗口顶上时，靴底正好踩在边框上
    frames: ['squat', 'jump'],
    pixel: true,             // 像素画：引擎把落点取整到整数屏幕像素，边缘不虚
    flipSvg: false,          // 朝左时由引擎用 CSS 镜像，旗子跟着换边
    outline: false,          // 浅紫亮边已经画进像素里，深色底上不用再加描边
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('xiaoqi', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「小旗」先不注册，换成支持形象注册的引擎后会自动出现');
})();
