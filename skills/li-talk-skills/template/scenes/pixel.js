/* =====================================================================
   风格 · 像素游戏 pixel（像素家，深色底）
   - 样子：整页是一块 8-bit 游戏的标题画面。规矩只有一条：所有东西对齐同一张像素网格，一格 = 4px；
     边框、阴影、图标、位移、粒子、经验条都是 4px 的整数倍；字用缝合像素字体（12px 点阵）：
     正文 48px = 每个字点 1 格，大标题和金句 96px = 每个字点 2 格，主题行、页码、「已复制」这类小字 24px。
     配色只用 16 色：夜空蓝 7 级 + 暖白 + 金橙 4 级 + 绿 3 级 + 玫红（和 pixel.css 的 --px-* 一一对应）
   - 适合讲：新人引导、闯关式的分步教程、轻松的团队分享。不适合：严肃汇报、大段阅读、密集数据
   - 默认形象：小旗 xiaoqi（戴毛线帽、背三角旗的像素小向导；浅紫亮边画在像素里，不加描边）
   - 字体：缝合像素字体 Fusion Pixel 12px Proportional zh-Hans（OFL），放在 vendor/fonts/pixel/，
     由 pixel.css 的 @font-face 引用。这里一加载就让浏览器开始下载它（document.fonts.load），
     自检等 document.fonts.ready 时会把它一起等上；加载不到时退回系统黑体，字会变宽
   - 从定稿样页（像素游戏）搬来的效果，以及改成对任意页面都成立的写法：
     1. 背景：抖动渐变的夜空（两条有序抖动带）、按舞台坐标铺的星星、两层量化成整格台阶的远山。
        样页按窗口像素现算；这里一加载就生成成 data URI 写进 :root 的 --px-* 变量，夜空写进 --scene-bg
        （阅读模式每页也用它），星星和远山由 backdrop 放进铺满窗口的背景层，宽屏、窄屏都不露边
     2. 窗口：样页每扇 RPG 窗口手写了阴影层和窗框层；这里卡片、小格、步骤每一项、终端、截图位
        都用一个伪元素画窗框（深色描边一格 → 暖白边一格 → 内衬一格 → 顶上一格亮蓝高光，四角各切一格），
        硬阴影用 drop-shadow 往右下错开两格。页面不用多写任何标记
     3. 出场「窗口拉开」（fx.pxwin，卡片类组件和一排卡片的容器默认用它）：窗口先横向拉成一条、再竖向展开（逐格），
        里面的字随后「逐字打出」。一排卡片的容器整拍出场时，里面的窗口一扇接一扇拉开
     4. 「逐字打出」（fx.pxtype，默认出场）：样页把字拆成一个个 span 打字；这里不改页面结构，
        用 clip-path 按字数分步从左往右露出（steps），任何元素都成立
     5. 大标题（titleIn: pxtitle）和开场：游戏标题画面式的像素字标——金色抖动字面 + 深色字板 + 锈红厚度。
        样页叠了两层字；这里只有一层（自检不会量到重复的字）：字面用 background-clip:text 的抖动金色，
        字板和厚度用一串 drop-shadow 把字形逐格外扩出来（pixel.css）。出场时一行纯文字的标题临时拆成单字，
        一个字一个字从上面掉下来落位，播完拆回原样；带重点词或多行的标题整行掉下、逐字露出
     6. 重点词：到拍时反白闪两下，落定成金色 + 一格像素下划线，角上蹦一颗星。样页用时间线一帧帧设；
        这里全写在 CSS 里，跟着引擎本来就会推的 --k 走（pixel.css）；引擎的放大一下被 CSS 关掉（像素不缩放）
     7. 节拍指示：像素经验条（EXP + 每拍一格 + 「1/3 拍」）。进一拍时一格经验逐格灌满、白闪一下、冒三颗小星，
        拍号从上面落一格；退一拍时逐格放掉（全在 pixel.css，跟着引擎写的 .on / .now 走）
     8. 悬停：窗框变金色，窗口左边出现 RPG 菜单的选择箭头（只滑入一次）；按下时压一格。命令按钮抬起一格、边框变金（CSS）
     9. 复制（copied）：命令按钮顶出一枚旋转的像素金币，到顶碎成一圈金色像素、换成「+1」往上飘；
        「已复制」小窗先横向拉开一条再竖向展开（绿框、像素对勾）
     10. 退一拍（onBack）：窗口里的字闪一下没了，窗口竖向压扁成一条、再横向收没；单独的字闪两下消失
     11. 点击处冒几颗很淡的像素粒子（ripple）；同风格翻页（pageTurn）：旧页分三步暗下去，新页逐格从一边擦出来
     12. 线稿和圈注：rough 的粗糙度压到 0（直线、正圆），再套一个像素化滤镜（defs 里的 pixel-px），
        线条变成一格一格的方块；描线也是分步的（fx.draw）。舞台缩得太小（缩放 × 设备像素比 < 0.6）和阅读模式里
        滤镜取样会漏掉线条，mount 时量一下、给舞台加 .px-lores 关掉滤镜，退回普通直线
     13. 内置的出场名（rise、fade、pop、drop、slide、stamp、write、type、print、draw）在这里都改成逐格走的版本，
        到点直接出现，不做半透明的平滑过渡
   - 没搬的：背景随鼠标视差（这一版不做）；形象的走位、蹦跳和小动作（引擎的形象部分统一做，平滑移动）
   - 自己加的出场名：pxwin、pxtype、pxdrop、pxpop、pxtitle，以及下面版式组件用的 pxtalk、pxitem、pxnode、pxroad、pxcur、
     pxdrain、pxdmg、pxblink，只在这个风格里认（别的风格会提醒并换成它的默认出场）。页面里不用写，组件按类名、所在位置自动选
   - 像素游戏自己的版式组件（.px-*，只在这个风格里有样子；样板页 samples/pixel.js 把每个都用了一遍，整段抄过去改字就行）。
     每拍「发生了什么」是游戏里的事：光标移到下一项、对话框打字、关卡点亮、血条掉一截，不是卡片淡入：
     · .px-icon[data-px-icon="名字"]：像素图标（这里画好，建页时填进去）。内置 cup 盖碗、leaf 茶叶、kettle 热水壶、
       foe 苦涩怪（敌人）、plat 战斗站台、flag 小旗、spark 闪光、coin 金币。一格默认 4px，style 写 --px-s:2（或 3）放大到一格 8px（12px）
     · .px-logo：标题画面的大字标，144px（每个字点 3 格），金色抖动字面 + 深色字板 + 锈红厚度；出场一个字一个字掉下来
     · .px-press：「按任意键开始」那一行（前面一个 ▶）。出场闪两下后常亮（不循环）
     · .px-win：一扇普通的 RPG 窗口（和卡片同样的窗框），里面放什么都行
     · .px-msg：RPG 对话框。每句话一个子元素、各带 data-beat，叠在同一个位置，只显示最新到拍的一句；
       到拍时一个字一个字打出来，打完右下角的 ▼ 闪两下后常亮。里面可以放一个 .px-who（压在上沿的名牌：谁在说话）
     · .px-swap：几块叠在同一个位置，只显示最新到拍的一块（伤害数字这类）
     · .px-inv > .px-slot：道具栏。每格里放一块带拍的内容（图标 + 名字）：没到拍是空格子（一个问号）；
       到拍时图标从上面掉进来、冒一圈金色像素、名字打出来，光标 ▼ 跳到这一格上（只停在最新拿到的那一格）
     · .px-node[data-n] + .px-road[data-path]：关卡地图。关卡点是一枚圆章（data-n 是章上的数字），里面放带拍的关卡名：
       没到拍是锁着的深蓝圆章；到拍时等路走到（约 .3 秒）、白闪两下变金、冒一圈金色像素、关卡名打出来。
       .px-on 一直亮着（起点），.px-goal 是终点（里面放一个 .px-icon 代替圆章）。
       像素路径写 data-path="x,y x,y …"（舞台坐标，相邻两点的距离取 24 的倍数，点才对得齐；两点不在同一条横线、竖线上时先横后竖）：
       建页时在它下面铺一条暗的点路，到拍时亮的点路按走向一段一段逐格亮起
     · .px-menu：RPG 命令菜单（加 .px-2col 排成两列）。选项里放 <i class="px-cur" data-beat="n"></i>：第 n 拍光标 ▶ 移到这一项、
       这一项反白闪两下；只显示最新的光标，选过的项变灰
     · .px-bar > .px-cut：血条（20 格，宽 488 时一格 24px）。.px-cut 写 style="--from:.6;--to:1"（占整条的比例）和 data-beat：
       到拍时这一段从右往左逐格掉空
     · .px-foe：敌人（里面放 .px-icon 和装伤害数字的 .px-swap）。.px-dmg 是伤害数字：到拍时蹦一下，敌人白闪两下、左右抖两格；
       带 .px-ko 的是最后一击：敌人再闪三下消失
     道具格、关卡点、点路、血条里的块不随讲过的拍变淡（拿到的道具、过了的关要一直看得清；现在讲到哪由光标、形象、对话框交代）
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和经验条（pixel.css 把 .meta 改到 top 24、高 48；按每页最多 4 拍量，算上经验条外圈和余量是 x 1300–1872、y 12–84）
   - 版式：大标题 96px 放在 y 88（字板和厚度到 y 204），一句话解释 48px 下移到 y 220，标题 15 个字以内（长了会换行压到解释）
   - 样子在 pixel.css 里
   ===================================================================== */
(function () {
  'use strict';
  const gs = () => window.gsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const snap4 = v => Math.round(v / 4) * 4;

  /* 先让浏览器开始下载像素字体：自检等 document.fonts.ready 时会把它一起等上 */
  try { if (document.fonts && document.fonts.load) document.fonts.load('48px FusionPixel', '课件').catch(() => {}); } catch (e) { /* 老浏览器没有字体接口，退回系统字体 */ }

  /* =================================================================
     调色板：全页只用这 16 色
     ================================================================= */
  const PAL = {
    k: '#0B0B1E', 1: '#141634', 2: '#1D2250', 3: '#2B3375', 4: '#46529E', 5: '#7F8DD0', 6: '#C3CBF0',
    w: '#F7F1E1', a: '#FFF2A6', y: '#FFCB3D', o: '#F08A2C', r: '#A9432A',
    l: '#A8F07A', g: '#4CC764', d: '#23805A', p: '#F2727F',
  };
  // 特殊格：S/T 闪光、V 热气——不自动描边；# 是做遮罩用的实心格
  const ALIAS = { S: 'a', T: 'w', '#': 'w', V: '6' };
  const NOLINE = 'ST#V';
  const colorOf = c => PAL[ALIAS[c] || c];

  /* =================================================================
     像素工具（照样页）：一行一个字符串，一个字符一格，'.' 透明
     ================================================================= */
  const toGrid = rows => rows.map(r => [...r]);
  function outline(g, c = 'k') {
    const h = g.length, w = g[0].length, out = g.map(r => r.slice());
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (g[y][x] !== '.') continue;
      const hit = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const v = (g[y + dy] || [])[x + dx];
        return !!v && v !== '.' && v !== 'k' && v !== c && !NOLINE.includes(v);
      });
      if (hit) out[y][x] = c;
    }
    return out;
  }
  // 转 SVG（带 xmlns，能放进 data URI）：同色横向连成一条 rect
  function svgOf(g) {
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
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${out}</svg>`;
  }
  const uri = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  // 小画布：画矩形、点
  function canvas(w, h) {
    const g = Array.from({ length: h }, () => Array(w).fill('.'));
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; };
    return {
      g, set,
      rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) set(x + i, y + j, c); },
      pts(list, c) { list.forEach(([x, y]) => set(x, y, c)); },
      row(y, x0, x1, c) { for (let x = x0; x <= x1; x++) set(x, y, c); },   // 横着一段：x0 到 x1（含）
    };
  }

  /* =================================================================
     小图标（一格 = 舞台上 4px）
     ================================================================= */
  const ICON = {};
  // 小闪光：重点词、标题角上蹦一下（7×7）
  ICON.spark = svgOf(toGrid(['...S...', '...S...', '..STS..', 'SSTTTSS', '..STS..', '...S...', '...S...']));
  // 选择箭头：RPG 菜单里那个 ▶（6×9）
  ICON.cursor = svgOf(outline(toGrid(['......', '.a....', '.ay...', '.ayy..', '.ayyo.', '.ayo..', '.ao...', '.a....', '......'])));
  // 主题行前的小宝石（5×5）
  ICON.gem = svgOf(outline(toGrid(['.....', '..a..', '.ayo.', '..o..', '.....'])));
  // 主题行的分隔符 ›（像素字体里没有这个字，画一个；带一格深色投影，和字的投影一样）
  ICON.sep = svgOf(toGrid(['y...', '.y..', '..y.', '.y.k', 'y.k.', '.k..']));
  // 「已复制」的对勾（9×8）
  ICON.check = svgOf(outline(toGrid(['.........', '.......l.', '......lg.', '.l...lg..', '.gl.lg...', '..glg....', '...g.....', '.........'])));
  // 命令按钮上的复制图标、复制成功后的对勾：只取形状做遮罩（7×7）
  ICON.copy = svgOf(toGrid(['####...', '#..#...', '#.#####', '###...#', '..#...#', '..#...#', '..#####']));
  ICON.tick = svgOf(toGrid(['......#', '.....##', '#...##.', '##.##..', '.###...', '..#....', '.......']));
  // 截图位「点开看大图」前的小放大镜（5×5）
  ICON.zoom = svgOf(toGrid(['www..', 'w.w..', 'www..', '...w.', '....w']));
  // 金币三帧：正面、侧一半、侧边（翻转时轮换）
  const coinFrame = rx => {
    const c = canvas(10, 10);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const v = ((x - 4.5) / rx) ** 2 + ((y - 4.5) / 3.6) ** 2;
      if (v > 1) continue;
      const t = (x - 4.5) / Math.max(rx, .6);
      c.set(x, y, t < -.35 ? 'a' : t > .4 ? 'o' : 'y');
    }
    if (rx > 3) c.rect(5, 3, 1, 4, 'o');                                      // 正面的一道刻痕
    return svgOf(outline(c.g));
  };
  const COIN = [coinFrame(3.6), coinFrame(2.1), coinFrame(.7)];
  // 往下指的光标：道具栏里停在当前那一格的上方；对话框右下角「还有下文」的 ▼（9×6）
  ICON.down = svgOf(outline(toGrid(['.........', '.aayyyyo.', '..ayyyo..', '...ayo...', '....o....', '.........'])));
  // 空道具格里的问号（暗蓝，不描边，6×8）
  ICON.q = svgOf(toGrid(['.4444.', '44..44', '....44', '...44.', '..44..', '..44..', '......', '..44..']));

  /* =================================================================
     版式组件用的像素画（.px-icon、关卡圆章）：一格 = 舞台上 4px，画在格子画布上再自动描边
     ================================================================= */
  const ART = {};
  const art = (k, g) => {
    // 再做一张全白的剪影：敌人挨打、关卡点亮时白闪用
    const white = g.map(r => r.map(c => (c === '.' ? '.' : 'w')));
    ART[k] = { w: g[0].length, h: g.length, svg: svgOf(g), white: svgOf(white).replace('<svg ', '<svg class="px-ws" ') };
  };
  // 盖碗：盖钮、拱起的盖子、碗（两道青花带、中间一排小花）、碗托；上面两缕热气（不描边）
  (() => {
    const c = canvas(24, 24);
    c.pts([[9, 4], [8, 3], [8, 2], [9, 1], [9, 0], [14, 4], [15, 3], [15, 2], [14, 1], [14, 0]], 'V');
    c.row(5, 11, 12, 'w'); c.row(6, 10, 12, 'w'); c.set(13, 6, '6');
    c.row(7, 7, 14, 'w'); c.row(7, 15, 16, '6');
    c.row(8, 5, 16, 'w'); c.row(8, 17, 18, '6'); c.row(8, 6, 7, 'a');
    c.row(9, 4, 17, 'w'); c.row(9, 18, 19, '6');
    c.row(10, 3, 19, '6'); c.set(20, 10, '5');
    c.row(11, 1, 20, 'w'); c.set(21, 11, '6'); c.set(22, 11, '6');
    c.row(12, 2, 19, 'w'); c.row(12, 20, 21, '6');
    c.row(13, 3, 20, '4');
    c.row(14, 3, 18, 'w'); c.row(14, 19, 20, '6'); c.pts([[6, 14], [10, 14], [14, 14]], '5');
    c.row(15, 4, 17, 'w'); c.row(15, 18, 19, '6'); c.pts([[8, 15], [12, 15], [16, 15]], '5');
    c.row(16, 4, 19, '4');
    c.row(17, 5, 16, 'w'); c.row(17, 17, 18, '6');
    c.row(18, 7, 14, 'w'); c.row(18, 15, 16, '6');
    c.row(19, 9, 14, '5');
    c.row(20, 2, 19, 'w'); c.row(20, 20, 21, '6');
    c.row(21, 4, 19, '6'); c.set(20, 21, '5');
    art('cup', outline(c.g));
  })();
  // 茶叶：一根嫩枝，两片叶子、一个芽（叶子按旋转的「两头尖」形状算格子，中间一道叶脉）
  (() => {
    const c = canvas(24, 24);
    const leaf = (cx, cy, L, Wd, a) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
        const dx = x + .5 - cx, dy = y + .5 - cy;
        const u = (dx * ca + dy * sa) / L, v = (-dx * sa + dy * ca) / Wd;
        if (Math.abs(u) > 1 || Math.abs(v) > 1 - u * u) continue;
        let col = v < 0 ? 'l' : 'g';
        if ((Math.abs(v * Wd) < .55 && u > -.75 && u < .8) || v > .45 * (1 - u * u)) col = 'd';
        c.set(x, y, col);
      }
    };
    for (let y = 10; y <= 21; y++) c.set(12, y, 'd');
    leaf(7.6, 15.2, 6.4, 3.1, -2.45);
    leaf(16.6, 11.4, 6.4, 3.1, -.72);
    leaf(12.5, 5.6, 4.4, 2.1, -Math.PI / 2);
    art('leaf', outline(c.g));
  })();
  // 热水壶：提梁、壶盖、铜壶身（左上亮、右下暗、一点高光）、壶嘴、壶嘴上一缕热气
  (() => {
    const c = canvas(24, 24);
    c.row(2, 9, 14, 'r'); c.pts([[8, 3], [15, 3], [7, 4], [16, 4], [7, 5], [16, 5], [7, 6], [16, 6]], 'r');
    c.row(6, 11, 12, 'y');
    c.row(7, 9, 14, 'o'); c.row(7, 9, 10, 'y');
    for (let y = 8; y <= 20; y++) for (let x = 2; x <= 22; x++) {
      const dx = (x + .5 - 12) / 8.6, dy = (y + .5 - 14.2) / 6.6, d = dx * dx + dy * dy;
      if (d > 1) continue;
      c.set(x, y, dx + dy > .55 ? 'r' : dx + dy < -.5 && d > .25 ? 'y' : 'o');
    }
    c.pts([[7, 10], [8, 10], [6, 11]], 'a');
    [[4, 15], [3, 14], [3, 13], [2, 12], [2, 11], [1, 10]].forEach(([x, y]) => { c.set(x, y, 'o'); c.set(x + 1, y, 'o'); });
    c.set(1, 10, 'y');
    c.row(20, 6, 17, 'r'); c.row(21, 7, 16, 'r');
    c.pts([[2, 7], [1, 6], [1, 5], [2, 4]], 'V');
    art('kettle', outline(c.g));
  })();
  // 苦涩怪（敌人）：一坨皱着眉的绿色史莱姆，头顶冒一片叶子（32×30，常用 --px-s:2）
  (() => {
    const c = canvas(32, 30);
    for (let y = 8; y <= 27; y++) for (let x = 1; x <= 30; x++) {
      const dx = (x + .5 - 16) / 14.2;
      const dy = y < 20 ? (y + .5 - 20) / 11.5 : (y >= 26 ? (y - 25) / 2.6 : 0);
      if (dx * dx + dy * dy > 1) continue;
      let col = 'g';
      if (dx * .8 + (y - 18) / 12 > .62 || y >= 26) col = 'd';
      const hl = dx * dx + ((y + .5 - 20) / 11.5) ** 2;
      if (x < 13 && y < 17 && hl > .5 && hl < .78) col = 'l';
      c.set(x, y, col);
    }
    c.pts([[8, 12], [9, 11]], 'w');
    c.row(28, 6, 7, 'd'); c.row(28, 15, 17, 'd'); c.row(28, 24, 25, 'd'); c.set(16, 29, 'd');
    c.rect(9, 16, 4, 4, 'w'); c.rect(19, 16, 4, 4, 'w');
    c.rect(11, 18, 2, 2, 'k'); c.rect(19, 18, 2, 2, 'k');
    c.pts([[8, 13], [9, 13], [10, 14], [11, 14], [12, 15], [13, 15], [23, 13], [22, 13], [21, 14], [20, 14], [19, 15], [18, 15]], 'k');
    c.row(23, 13, 19, 'k'); c.pts([[12, 24], [20, 24]], 'k'); c.pts([[14, 24], [18, 24]], 'w');
    c.pts([[16, 7], [16, 6]], 'd');
    c.pts([[17, 5], [18, 5], [18, 4], [19, 4], [19, 3], [20, 3], [21, 3]], 'l'); c.pts([[17, 6], [18, 6], [19, 5], [20, 4]], 'g');
    art('foe', outline(c.g));
  })();
  // 战斗站台：一块扁扁的椭圆地面（30×6，常用 --px-s:2）
  (() => {
    const c = canvas(30, 6);
    for (let y = 0; y < 6; y++) for (let x = 0; x < 30; x++) {
      const dx = (x + .5 - 15) / 14, dy = (y + .5 - 3) / 2.4;
      if (dx * dx + dy * dy <= 1) c.set(x, y, y <= 1 ? '4' : y >= 4 ? '2' : '3');
    }
    art('plat', outline(c.g));
  })();
  // 小旗（起点）
  (() => {
    const c = canvas(12, 14);
    for (let y = 1; y <= 11; y++) c.set(3, y, 'w');
    c.row(1, 4, 9, 'p'); c.row(2, 4, 8, 'p'); c.row(3, 4, 7, 'p'); c.row(4, 4, 6, 'p'); c.row(5, 4, 5, 'p');
    c.row(2, 4, 5, 'w');
    c.row(12, 2, 5, '6');
    art('flag', outline(c.g));
  })();
  art('spark', toGrid(['...S...', '...S...', '..STS..', 'SSTTTSS', '..STS..', '...S...', '...S...']));
  art('coin', (() => {
    const c = canvas(10, 10);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const v = ((x - 4.5) / 3.6) ** 2 + ((y - 4.5) / 3.6) ** 2;
      if (v <= 1) { const t = (x - 4.5) / 3.6; c.set(x, y, t < -.35 ? 'a' : t > .4 ? 'o' : 'y'); }
    }
    c.rect(5, 3, 1, 4, 'o');
    return outline(c.g);
  })());
  // 关卡圆章（24×24，舞台上 96px）：锁着是深蓝，亮了是金色，白闪时全白
  function badge(fill, ring, hi, sh) {
    const c = canvas(24, 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const dx = x + .5 - 12, dy = y + .5 - 12, r = Math.hypot(dx, dy);
      if (r > 10.9) continue;
      let col = fill;
      if (r > 9.4) col = ring;
      else if (r > 6.6 && dx < -1 && dy < -1 && dx + dy < -8.4) col = hi;
      else if (r > 6.6 && dx > 1 && dy > 1 && dx + dy > 8.4) col = sh;
      c.set(x, y, col);
    }
    return svgOf(outline(c.g));
  }
  // 像素路径的点（24px 一格的平铺块）：一个 12px 的方点，右下一道 4px 的深色硬影子；亮的点左上一格浅金高光
  const roadTile = (c, hi) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" shape-rendering="crispEdges">`
    + `<rect x="4" y="4" width="12" height="12" fill="${PAL.k}"/><rect width="12" height="12" fill="${c}"/>`
    + (hi ? `<rect width="4" height="4" fill="${hi}"/>` : '') + '</svg>';

  /* =================================================================
     背景纹理和金色字面：一加载就生成，写进 :root 的 --px-* 变量（pixel.css 引用）
     ================================================================= */
  // 抖动带：4×6 格，从上到下 25% → 50% → 75% 换成下一级颜色（有序抖动）
  function ditherBand(a, b) {
    const cells = [[0, 0], [2, 0], [0, 2], [2, 2], [1, 3], [3, 3], [0, 4], [1, 4], [2, 4], [3, 4], [1, 5], [3, 5]];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="6" shape-rendering="crispEdges"><rect width="4" height="6" fill="${a}"/>` +
      cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${b}"/>`).join('') + '</svg>';
  }
  // 两色棋盘（一格一色）：经验条空格、截图待补的底
  const checker = (a, b) => `<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" shape-rendering="crispEdges"><rect width="2" height="2" fill="${a}"/><rect width="1" height="1" fill="${b}"/><rect x="1" y="1" width="1" height="1" fill="${b}"/></svg>`;
  // 远山：几段正弦叠出来的山脊，量化成整格台阶，宽度取周期的整数倍保证无缝平铺
  function ridge(w, h, base, waves, color) {
    let out = '';
    for (let x = 0; x < w; x++) {
      let v = base;
      waves.forEach(([amp, k, ph]) => { v += amp * Math.sin(2 * Math.PI * k * x / w + ph); });
      const top = Math.max(1, Math.round(h - v));
      out += `<rect x="${x}" y="${top}" width="1" height="${h - top}" fill="${color}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges">${out}</svg>`;
  }
  // 星星：坐标是舞台上的格（480×270，一格 4px）；d 一格、x 十字
  const STARS = [[262, 14, 'x', '5'], [300, 40, 'd', '4'], [340, 34, 'd', '5'], [372, 58, 'x', 'w'], [410, 44, 'd', '4'], [452, 70, 'd', '5'],
    [318, 86, 'd', '4'], [388, 100, 'd', '4'], [470, 96, 'x', '5'], [270, 108, 'd', '5'], [196, 96, 'd', '4'], [150, 110, 'x', '4'],
    [60, 100, 'd', '4'], [130, 100, 'd', '5'], [20, 130, 'd', '4'], [466, 20, 'd', '4'], [200, 8, 'd', '5'], [168, 18, 'd', '4'],
    [12, 40, 'd', '4'], [6, 90, 'x', '4'], [474, 128, 'd', '4']];
  const starTile = () => `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" shape-rendering="crispEdges">` +
    STARS.map(([x, y, t, c]) => t === 'd'
      ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[c]}"/>`
      : `<rect x="${x - 1}" y="${y}" width="3" height="1" fill="${PAL[c === 'w' ? 5 : 4]}"/><rect x="${x}" y="${y - 1}" width="1" height="3" fill="${PAL[c === 'w' ? 5 : 4]}"/><rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[c]}"/>`).join('') + '</svg>';
  // 金色抖动字面：一行一块（2 格宽），浅金 → 金 → 橙，交界各一行棋盘抖动。
  // pad 是行高比字号多出来的、上下各几格（标题行高 1em：0；金句行高 1.25em：3）
  // mid 是中间金色那一段的行数（标题画面的大字标 144px 行高 1em：pad 5、mid 6，一共 36 行，一行还是一格 4px）
  function goldTile(pad, mid = 4) {
    const rows = [];
    const band = (n, c) => { for (let i = 0; i < n; i++) rows.push([c, c]); };
    band(8 + pad, 'a'); rows.push(['y', 'a'], ['a', 'y']); band(mid, 'y'); rows.push(['o', 'y'], ['y', 'o']); band(8 + pad, 'o');
    return svgOf(rows);
  }
  (function paintVars() {
    const st = document.documentElement.style;
    const set = (k, v) => st.setProperty(k, v);
    set('--px-d12', uri(ditherBand(PAL[1], PAL[2])));
    set('--px-d23', uri(ditherBand(PAL[2], PAL[3])));
    set('--px-dith-23', uri(checker(PAL[2], PAL[3])));
    set('--px-dith-12', uri(checker(PAL[1], PAL[2])));
    set('--px-far', uri(ridge(120, 40, 15, [[8, 1, 0], [5, 3, 1], [2.5, 7, 2]], PAL[2])));
    set('--px-near', uri(ridge(80, 20, 7, [[3.5, 1, 2.2], [2, 3, .4]], PAL[1])));
    set('--px-stars', uri(starTile()));
    set('--px-gold-t', uri(goldTile(0)));
    set('--px-gold-q', uri(goldTile(3)));
    set('--px-gold-l', uri(goldTile(5, 6)));
    ['spark', 'cursor', 'gem', 'sep', 'check', 'copy', 'tick', 'zoom', 'down', 'q'].forEach(k => set('--px-' + k, uri(ICON[k])));
    // 版式组件：关卡圆章三种样子、小旗、像素路径的暗点和亮点
    set('--px-node-off', uri(badge('2', '4', '3', '1')));
    set('--px-node-on', uri(badge('y', 'w', 'a', 'o')));
    set('--px-node-w', uri(badge('w', 'w', 'w', 'w')));
    set('--px-flag', uri(ART.flag.svg));
    set('--px-road-off', uri(roadTile(PAL[4])));
    set('--px-road-on', uri(roadTile(PAL.y, PAL.a)));
  })();

  /* =================================================================
     出场
     ================================================================= */
  const WIN = '.card, .cell, .term, .shot, .steps > li, .px-win';
  const SKIP = 'svg.marks, .mascot, .kid, .ripple-layer, .copied-tip, .px-bit, script, style';
  /* 默认出场按组件类名分：窗口和一排窗口的容器「拉开」，金句「掉下来」，标签「蹦出来」，其余文字「逐字打出」 */
  const BY = {
    copy: 'pxwin', card: 'pxwin', cell: 'pxwin', term: 'pxwin', shot: 'pxwin', steps: 'pxwin', cells: 'pxwin',
    grid: 'pxwin', row: 'pxwin', col: 'pxwin', vs: 'pxwin', quote: 'pxdrop', tag: 'pxpop',
    // 版式组件：大字标掉下来、「按任意键开始」闪两下、点路逐段亮起、菜单光标滑进来、血条掉空、伤害数字蹦一下、普通窗口拉开
    'px-logo': 'pxtitle', 'px-press': 'pxblink', 'px-road': 'pxroad', 'px-cur': 'pxcur', 'px-cut': 'pxdrain', 'px-dmg': 'pxdmg', 'px-win': 'pxwin',
  };
  const CTX = { tilt: () => 0, done: () => {} };
  const isWin = e => !!(e && e.matches && e.matches(WIN));
  const isBar = e => !!(e && e.matches && e.matches('.copy'));
  /* 跟着一起出场的子元素：自己另有 data-beat 的不算（它在自己那一拍出场） */
  const kidsOf = e => [...e.children].filter(c => !c.hasAttribute('data-beat') && !c.matches(SKIP));
  /* 清掉出场留下的内联样式（用 gsap 的 clearProps，连它缓存的变形一起清，免得下次出场接着旧的缩放） */
  function clean(e, props = ALL) {
    const G = gs();
    if (G) G.set(e, { clearProps: props });
    else props.split(',').forEach(k => e.style.removeProperty(k === 'clipPath' ? 'clip-path' : k));
  }
  const ALL = 'transform,transformOrigin,opacity,visibility,clipPath';
  const textLen = e => [...String(e.textContent || '').replace(/\s+/g, '')].length;

  /* 逐字打出：clip-path 按字数分步从左往右露出（不改页面结构）；vis 为真时连可见性一起管 */
  function typeIn(tl, e, t, vis) {
    const n = textLen(e);
    const d = clamp(n * .03, .12, .5);
    const from = { clipPath: 'inset(-40% 100% -40% -8%)' };
    const props = vis ? 'clipPath,opacity,visibility' : 'clipPath';
    const to = { clipPath: 'inset(-40% -8% -40% -8%)', duration: d, ease: `steps(${clamp(n, 3, 24)})`, immediateRender: true,
      onComplete: () => clean(e, props), onInterrupt: () => clean(e, props) };
    if (vis) { from.autoAlpha = 1; to.autoAlpha = 1; }
    tl.fromTo(e, from, to, t);
    return d;
  }
  /* 窗口里的一个子元素：窗口套窗口就再拉开一扇，命令按钮横向拉开，其余逐字打出 */
  function kidIn(tl, c, t) {
    if (c instanceof SVGElement) return 0;
    if (isWin(c)) return winIn(tl, c, t, false);
    if (isBar(c)) return barIn(tl, c, t, false);
    return typeIn(tl, c, t, false);
  }
  /* 窗口拉开：先横向拉成一条（3 格），再竖向展开（4 格）；里面的字随后依次打出 */
  function winIn(tl, e, t, vis) {
    const from = { scaleX: .06, scaleY: .04, transformOrigin: '50% 50%' };
    if (vis) from.autoAlpha = 1;
    const done = vis ? 'transform,transformOrigin,opacity,visibility' : 'transform,transformOrigin';
    tl.fromTo(e, from, { scaleX: 1, duration: .12, ease: 'steps(3)', immediateRender: true }, t)
      .to(e, { scaleY: 1, duration: .16, ease: 'steps(4)', onComplete: () => clean(e, done), onInterrupt: () => clean(e, done) }, t + .12);
    let end = .28;
    kidsOf(e).forEach((c, i) => { const s = .28 + i * .06; end = Math.max(end, s + kidIn(tl, c, t + s)); });
    return Math.min(end, 1.1);
  }
  /* 命令按钮：横向拉开一条（3 格），命令随后打出 */
  function barIn(tl, e, t, vis) {
    const from = { scaleX: .06, transformOrigin: '50% 50%' };
    if (vis) from.autoAlpha = 1;
    const done = vis ? 'transform,transformOrigin,opacity,visibility' : 'transform,transformOrigin';
    tl.fromTo(e, from, { scaleX: 1, duration: .1, ease: 'steps(3)', immediateRender: true, onComplete: () => clean(e, done), onInterrupt: () => clean(e, done) }, t);
    const ct = e.querySelector('.ct');
    return ct ? .1 + typeIn(tl, ct, t + .08, false) : .1;
  }
  /* 一排东西的容器：先亮出来，里面的子元素各按自己的出场依次跟上（窗口一扇接一扇拉开） */
  function groupIn(tl, e, t, kids) {
    tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true, onComplete: () => clean(e, 'opacity,visibility') }, t);
    const gap = kids.some(c => isWin(c) || isBar(c)) ? .14 : .1;
    let end = .1;
    kids.forEach((c, i) => { const s = i * gap; end = Math.max(end, s + runFx(tl, c, t + s)); });
    return Math.min(end, 1.2);
  }
  /* 掉下来：从上面 8 格逐格掉下，落地往下多沉一格再弹回；同时逐字露出 */
  function dropIn(tl, e, t, h) {
    tl.fromTo(e, { autoAlpha: 1, y: -h }, { y: 8, duration: .16, ease: 'steps(4)', immediateRender: true }, t)
      .to(e, { y: 0, duration: .04, ease: 'steps(1)', onComplete: () => clean(e, 'transform,opacity,visibility'), onInterrupt: () => clean(e, 'transform,opacity,visibility') }, t + .16);
    return Math.max(.2, typeIn(tl, e, t, false));
  }
  /* 大标题：一行纯文字时临时拆成单字，一个字一个字从上面掉下来落位，播完拆回原样；否则整行掉下、逐字露出 */
  function titleIn(tl, e, t) {
    const G = gs();
    const txt = e.textContent || '';
    const lh = parseFloat(getComputedStyle(e).lineHeight) || e.offsetHeight || 1;
    const plain = G && !e.children.length && [...txt].length > 0 && [...txt].length <= 30 && e.offsetHeight < lh * 1.5;
    if (!plain) return dropIn(tl, e, t, 48);
    e.classList.add('px-split');
    e.textContent = '';
    const spans = [...txt].map(c => { const s = document.createElement('span'); s.className = 'px-ch'; s.textContent = c; e.appendChild(s); return s; });
    G.set(spans, { autoAlpha: 0, y: -64 });
    spans.forEach((s, i) => {
      const at = t + i * .035;
      tl.set(s, { autoAlpha: 1 }, at).to(s, { y: 8, duration: .12, ease: 'steps(3)' }, at).to(s, { y: 0, duration: .04, ease: 'steps(1)' }, at + .12);
    });
    const end = spans.length * .035 + .16;
    const restore = () => { if (e.classList.contains('px-split')) { e.classList.remove('px-split'); e.textContent = txt; } };
    tl.call(restore, null, t + end);
    return end;
  }
  /* 线稿、圈注：按笔画分步描出（每 24px 一步）；虚线分两步亮起 */
  function drawIn(tl, e, t) {
    const ps = e.matches('path,line,rect,circle,ellipse,polyline') ? [e] : [...e.querySelectorAll('path')];
    if (!ps.length) return 0;
    const lenOf = q => { if (q._pxLen == null) { try { q._pxLen = Math.ceil(q.getTotalLength()) + 2; } catch (err) { q._pxLen = 0; } } return q._pxLen; };
    const total = ps.reduce((a, q) => a + lenOf(q), 0) || 1;
    const d = clamp(total / 2600, .3, .8);
    const restore = q => () => { q.style.strokeDasharray = ''; q.style.strokeDashoffset = ''; q.style.opacity = ''; };
    let c = t;
    ps.forEach(q => {
      const L = lenOf(q), pd = d * L / total;
      const dash = q.getAttribute('stroke-dasharray');
      if (dash && dash !== 'none' && parseFloat(dash) > 0) tl.fromTo(q, { opacity: 0 }, { opacity: 1, duration: Math.max(.2, pd), ease: 'steps(2)', immediateRender: true, onComplete: restore(q) }, c);
      else tl.fromTo(q, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: pd, ease: `steps(${clamp(Math.round(L / 24), 2, 24)})`, immediateRender: true, onComplete: restore(q) }, c);
      c += pd;
    });
    return d;
  }
  /* 开场里、容器里给一个元素选出场（和引擎选默认出场的规则一致：data-in 优先，再按类名，最后逐字打出） */
  function runFx(tl, e, t) {
    const name = e.dataset && e.dataset.in;
    if (name === 'none') return 0;
    if (name && FX[name]) return FX[name](tl, e, t, CTX);
    const by = Object.keys(BY).find(c => e.classList.contains(c));
    return FX[by ? BY[by] : 'pxtype'](tl, e, t, CTX);
  }
  /* =================================================================
     版式组件（.px-*）的出场：每拍发生的是游戏里的事——对话框打字、道具到手、关卡点亮、点路亮起、光标移动、血条掉空、挨打
     ================================================================= */
  /* 出场途中临时改了结构或加了类的收尾动作：正常由时间线播到时执行；时间线万一被掐断，退拍、翻页时也执行一遍 */
  const pending = new Set();
  function later(tl, at, fn) {
    let done = false;
    const run = () => { if (done) return; done = true; pending.delete(run); fn(); };
    pending.add(run);
    tl.call(run, null, at);
  }
  function settle() { [...pending].forEach(run => { try { run(); } catch (e) { /* 元素已经不在了 */ } }); pending.clear(); }
  /* 一个元素到点就整块看得见（里面的东西各自再动） */
  const showAt = (tl, e, t) => tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true, onComplete: () => clean(e, 'opacity,visibility') }, t);
  /* 白闪两下（加、去掉一个类，类的样子写在 pixel.css）；最后一次去掉也登记成收尾，免得卡在白的 */
  function flash2(tl, el, cls, t) {
    tl.call(() => el.classList.add(cls), null, t).call(() => el.classList.remove(cls), null, t + .06).call(() => el.classList.add(cls), null, t + .12);
    later(tl, t + .18, () => el.classList.remove(cls));
  }

  /* 对话框打字（.px-msg 里的一句）：把句子里的字临时拆成一个个 span，一个字一个字露出来，打完拆回原样。
     只动文字节点，重点词、换行这些结构原样不动；打字时对话框加 .px-typing（右下角的 ▼ 先藏起来） */
  function talkIn(tl, e, t) {
    const box = e.closest('.px-msg');
    const nodes = [];
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest(SKIP))) nodes.push(n);
    const parts = [], chars = [];
    nodes.forEach(n => {
      const frag = document.createDocumentFragment();
      const spans = [...n.nodeValue].map(ch => {
        const s = document.createElement('span');
        s.className = 'px-c'; s.textContent = ch; frag.appendChild(s);
        if (ch.trim()) chars.push(s);
        return s;
      });
      n.parentNode.replaceChild(frag, n);
      parts.push({ n, spans });
    });
    showAt(tl, e, t);
    const dt = chars.length ? clamp(.72 / chars.length, .022, .05) : 0;
    chars.forEach((s, i) => tl.call(() => s.classList.add('px-v'), null, t + .04 + i * dt));
    const end = .06 + chars.length * dt;
    if (box) box.classList.add('px-typing');
    later(tl, t + end, () => {
      parts.forEach(({ n, spans }) => { const f = spans[0]; if (f && f.parentNode) f.parentNode.insertBefore(n, f); spans.forEach(s => s.remove()); });
      if (box) box.classList.remove('px-typing');
    });
    return end;
  }
  /* 道具到手（.px-slot 里那一块）：图标从格子上方逐格掉进来、落地往下多沉一格再弹回，冒一圈金色像素；名字随后打出来 */
  function itemIn(tl, e, t) {
    showAt(tl, e, t);
    const icon = e.querySelector('.px-icon');
    if (icon) {
      tl.fromTo(icon, { y: -48 }, { y: 8, duration: .16, ease: 'steps(4)', immediateRender: true }, t)
        .to(icon, { y: 0, duration: .04, ease: 'steps(1)', onComplete: () => clean(icon, 'transform'), onInterrupt: () => clean(icon, 'transform') }, t + .16);
      tl.call(() => burst(e, icon.offsetLeft + icon.offsetWidth / 2, icon.offsetTop + icon.offsetHeight / 2,
        { n: 8, colors: [PAL.a, PAL.y, PAL.w], dist: 112, size: 8, dur: .32 }), null, t + .2);
    }
    let end = .24;
    kidsOf(e).filter(c => c !== icon).forEach((c, i) => { const s = .2 + i * .06; end = Math.max(end, s + typeIn(tl, c, t + s, false)); });
    return end;
  }
  /* 关卡点亮（.px-node 里的关卡名）：先等路走到（.3 秒），圆章白闪两下变金、冒一圈金色像素，关卡名随后打出来 */
  function nodeIn(tl, e, t) {
    const node = e.parentElement, at = t + .3;
    node.classList.add('px-wait');
    later(tl, at, () => node.classList.remove('px-wait'));
    flash2(tl, node, 'px-flash', at);
    tl.call(() => burst(node, node.offsetWidth / 2, node.offsetHeight / 2, { n: 8, colors: [PAL.a, PAL.y, PAL.w], dist: 80, size: 8, dur: .32 }), null, at);
    return .3 + typeIn(tl, e, at, true);
  }
  /* 点路亮起（.px-road）：一段一段按走向逐格亮，一格 24px，整条约 .2–.36 秒 */
  const ROAD_FROM = { r: 'inset(0% 100% 0% 0%)', l: 'inset(0% 0% 0% 100%)', d: 'inset(0% 0% 100% 0%)', u: 'inset(100% 0% 0% 0%)' };
  function roadIn(tl, e, t) {
    showAt(tl, e, t);
    const segs = [...e.children].filter(s => s.dataset.dir);
    const len = s => Math.max(s.offsetWidth, s.offsetHeight);
    const total = segs.reduce((a, s) => a + len(s), 0) || 1;
    const D = clamp(total / 2000, .2, .36);
    let c = t;
    segs.forEach(s => {
      const d = D * len(s) / total;
      tl.fromTo(s, { clipPath: ROAD_FROM[s.dataset.dir] || ROAD_FROM.r }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: `steps(${Math.max(1, Math.round(len(s) / 24))})`,
        immediateRender: true, onComplete: () => clean(s, 'clipPath'), onInterrupt: () => clean(s, 'clipPath') }, c);
      c += d;
    });
    return D;
  }
  /* 菜单光标（.px-menu 里的 .px-cur）：从左边滑进来两格，这一项反白闪两下 */
  function curIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 1, x: -16 }, { x: 0, duration: .08, ease: 'steps(2)', immediateRender: true,
      onComplete: () => clean(e, 'transform,opacity,visibility'), onInterrupt: () => clean(e, 'transform,opacity,visibility') }, t);
    const li = e.parentElement;
    if (li) flash2(tl, li, 'px-sel', t + .1);
    return .3;
  }
  /* 血条掉血（.px-bar 里的 .px-cut）：空掉的那一段从右往左逐格露出来 */
  function drainIn(tl, e, t) {
    const n = Math.max(1, Math.round(e.offsetWidth / 24)), d = clamp(n * .04, .16, .48);
    tl.fromTo(e, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: `steps(${n})`, immediateRender: true,
      onComplete: () => clean(e, 'clipPath,opacity,visibility'), onInterrupt: () => clean(e, 'clipPath,opacity,visibility') }, t);
    return d;
  }
  /* 伤害数字（.px-dmg）：数字往上蹦两格再落回；同一个 .px-foe 里的敌人白闪两下、左右抖两格。
     带 .px-ko 的是最后一击：敌人再闪三下消失（之后由 pixel.css 一直藏着：.px-foe 里有到拍的 .px-ko 时） */
  function dmgIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 1, y: 0 }, { y: -24, duration: .08, ease: 'steps(2)', immediateRender: true }, t)
      .to(e, { y: 0, duration: .08, ease: 'steps(2)', onComplete: () => clean(e, 'transform,opacity,visibility'), onInterrupt: () => clean(e, 'transform,opacity,visibility') }, t + .08);
    const foe = e.closest('.px-foe'), spr = foe && foe.querySelector(':scope > .px-icon');
    if (!spr) return .16;
    flash2(tl, spr, 'px-flash', t);
    [8, -8, 8, -8, 0].forEach((x, i) => tl.set(spr, { x }, t + i * .04));
    later(tl, t + .2, () => clean(spr, 'transform'));
    if (!e.classList.contains('px-ko')) return .24;
    foe.classList.add('px-hold');
    [0, 1, 0, 1, 0].forEach((v, i) => tl.set(spr, { autoAlpha: v }, t + .28 + i * .08));
    later(tl, t + .66, () => { foe.classList.remove('px-hold'); clean(spr, 'transform,opacity,visibility'); });
    return .68;
  }
  /* 「按任意键开始」（.px-press）：到点出现，闪两下，然后常亮（不循环） */
  function blinkIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .01, immediateRender: true }, t);
    [0, 1, 0, 1].forEach((v, i) => tl.set(e, { autoAlpha: v }, t + .16 * (i + 1)));
    later(tl, t + .68, () => clean(e, 'opacity,visibility'));
    return .68;
  }
  /* 放在版式组件里的块，按所在的组件选出场：道具格里「到手」、关卡点里「点亮」、对话框里「打字」；不在这些组件里返回 -1 */
  function ctxIn(tl, e, t) {
    const up = !(e instanceof SVGElement) && e.parentElement;
    if (!up) return -1;
    if (up.classList.contains('px-slot')) return itemIn(tl, e, t);
    if (up.classList.contains('px-node')) return nodeIn(tl, e, t);
    if (up.classList.contains('px-msg')) return talkIn(tl, e, t);
    return -1;
  }

  /* 逐格移动的通用写法：到点直接出现，位移、缩放按格走 */
  const stepMove = (from, dur, n) => (tl, e, t) => {
    if (e instanceof SVGElement) return FX.fade(tl, e, t);
    tl.fromTo(e, Object.assign({ autoAlpha: 1 }, typeof from === 'function' ? from(e) : from),
      { x: 0, y: 0, scale: 1, duration: dur, ease: `steps(${n})`, immediateRender: true, onComplete: () => clean(e, 'transform,opacity,visibility'), onInterrupt: () => clean(e, 'transform,opacity,visibility') }, t);
    return dur;
  };

  const popIn = stepMove({ scale: .5 }, .12, 2);

  const FX = {
    // 窗口拉开（卡片、小格、步骤、终端、截图位、命令、一排窗口的容器）
    pxwin(tl, e, t) {
      if (e instanceof SVGElement) return drawIn(tl, e, t);
      if (isWin(e)) return winIn(tl, e, t, true);
      if (isBar(e)) return barIn(tl, e, t, true);
      const kids = kidsOf(e);
      return kids.length ? groupIn(tl, e, t, kids) : typeIn(tl, e, t, true);
    },
    // 逐字打出（默认出场）。步骤的每一项（li 没有类名，引擎按类名选不到）这类窗口照样拉开，命令照样横向拉开
    // 放在版式组件（道具格、关卡点、对话框）里的块，按组件选出场
    pxtype(tl, e, t) {
      if (e instanceof SVGElement) return drawIn(tl, e, t);
      const c = ctxIn(tl, e, t);
      if (c >= 0) return c;
      if (isWin(e)) return winIn(tl, e, t, true);
      if (isBar(e)) return barIn(tl, e, t, true);
      return typeIn(tl, e, t, true);
    },
    // 掉下来（金句）；放在对话框里的金句照样一个字一个字打出来
    pxdrop(tl, e, t) {
      if (e instanceof SVGElement) return drawIn(tl, e, t);
      const c = ctxIn(tl, e, t);
      return c >= 0 ? c : dropIn(tl, e, t, 32);
    },
    // 蹦出来（标签）：半大 → 原大，分两步
    pxpop(tl, e, t, ctx) {
      const c = ctxIn(tl, e, t);
      return c >= 0 ? c : popIn(tl, e, t, ctx);
    },
    // 版式组件的出场（页面里不用写，按类名和所在的组件自动选；也可以 data-in 直接点名）
    pxtalk(tl, e, t) { return e instanceof SVGElement ? drawIn(tl, e, t) : talkIn(tl, e, t); },
    pxitem(tl, e, t) { return e instanceof SVGElement ? drawIn(tl, e, t) : itemIn(tl, e, t); },
    pxnode(tl, e, t) { return e.parentElement && e.parentElement.classList.contains('px-node') ? nodeIn(tl, e, t) : typeIn(tl, e, t, true); },
    pxroad(tl, e, t) { return e instanceof SVGElement ? drawIn(tl, e, t) : roadIn(tl, e, t); },
    pxcur(tl, e, t) { return curIn(tl, e, t); },
    pxdrain(tl, e, t) { return drainIn(tl, e, t); },
    pxdmg(tl, e, t) { return dmgIn(tl, e, t); },
    pxblink(tl, e, t) { return blinkIn(tl, e, t); },
    // 大标题
    pxtitle(tl, e, t) { return titleIn(tl, e, t); },
    // 内置出场名的逐格版本
    rise: stepMove({ y: 32 }, .2, 4),
    pop: stepMove({ scale: .5 }, .18, 3),
    drop: stepMove({ y: -48 }, .2, 4),
    slide: stepMove(e => { const f = e.dataset.from || 'left'; return { x: f === 'left' ? -96 : f === 'right' ? 96 : 0, y: f === 'top' ? -72 : f === 'bottom' ? 72 : 0 }; }, .24, 6),
    stamp: stepMove({ scale: 2 }, .18, 3),
    fade(tl, e, t) {
      tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18, ease: 'steps(3)', immediateRender: true, onComplete: () => clean(e, 'opacity,visibility'), onInterrupt: () => clean(e, 'opacity,visibility') }, t);
      return .18;
    },
    write(tl, e, t) { return e instanceof SVGElement ? drawIn(tl, e, t) : typeIn(tl, e, t, true); },
    type(tl, e, t) { return typeIn(tl, e, t, true); },
    print(tl, e, t) { return typeIn(tl, e, t, true); },
    draw(tl, e, t) { return e instanceof SVGElement ? drawIn(tl, e, t) : typeIn(tl, e, t, true); },
  };

  /* =================================================================
     粒子：像素小方块往外蹦几格就消失（点击、复制金币碎开）
     ================================================================= */
  function burst(host, x, y, o) {
    const G = gs();
    if (!G || !host) return;
    const n = o.n || 4, dist = o.dist || 24, size = o.size || 4, up = o.up || 0;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.className = 'px-bit';
      host.appendChild(el);
      const ang = (i / n) * Math.PI * 2 + (i % 2 ? .35 : -.2);
      const dx = snap4(Math.cos(ang) * dist), dy = snap4(Math.sin(ang) * dist - up);
      const x0 = snap4(x - size / 2), y0 = snap4(y - size / 2);
      G.set(el, { width: size, height: size, backgroundColor: o.colors[i % o.colors.length], x: x0, y: y0, opacity: o.alpha || 1 });
      G.to(el, { x: x0 + dx, y: y0 + dy, duration: o.dur || .3, ease: 'steps(4)', onComplete: () => el.remove() });
    }
  }

  /* =================================================================
     像素化滤镜的分辨率保护：滤镜按 4px 一格取样，舞台缩得太小（缩放 × 设备像素比 < 0.6，比如很小的窗口）时
     取样会漏掉线条，线稿和圈注就看不见了。这时给舞台加 .px-lores，pixel.css 里关掉滤镜，退回普通的直线
     ================================================================= */
  let onResize = null;
  function checkRes(stage) {
    const w = stage.getBoundingClientRect().width;
    stage.classList.toggle('px-lores', !!w && w / 1920 * (window.devicePixelRatio || 1) < .6);
  }

  /* =================================================================
     建页时补全版式组件（decorate）：像素图标填进 SVG、像素路径拆成横竖几段并在下面铺一条暗的点路
     ================================================================= */
  function fillIcon(el) {
    const name = el.dataset.pxIcon, a = ART[name];
    if (!a) { console.warn(`[Deck] 像素图标 data-px-icon="${name}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.style.setProperty('--px-iw', a.w);
    el.style.setProperty('--px-ih', a.h);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = a.svg + a.white;
  }
  /* data-path="x,y x,y …" → 横竖几段，每段一个 <b>（舞台坐标，点的中心落在路线上）；两点不在一条横线、竖线上时先横后竖 */
  function buildRoad(el) {
    const pts = String(el.dataset.path).trim().split(/\s+/).map(s => s.split(',').map(Number)).filter(p => p.length === 2 && p.every(Number.isFinite));
    if (pts.length < 2) { console.warn(`[Deck] 像素路径 data-path="${el.dataset.path}" 至少要两个点，写成 "x,y x,y"`); return; }
    const segs = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      if (x1 !== x2 && y1 !== y2) segs.push([x1, y1, x2, y1], [x2, y1, x2, y2]);
      else if (x1 !== x2 || y1 !== y2) segs.push([x1, y1, x2, y2]);
    }
    const html = segs.map(([x1, y1, x2, y2]) => {
      const h = y1 === y2;
      const dir = h ? (x2 >= x1 ? 'r' : 'l') : (y2 >= y1 ? 'd' : 'u');
      return `<b data-dir="${dir}" style="left:${Math.min(x1, x2) - 6}px;top:${Math.min(y1, y2) - 6}px;width:${h ? Math.abs(x2 - x1) + 16 : 16}px;height:${h ? 16 : Math.abs(y2 - y1) + 16}px"></b>`;
    }).join('');
    el.innerHTML = html;
    el.setAttribute('aria-hidden', 'true');
    // 暗的点路：不带拍，一翻到这页就在；亮的点路盖在它上面
    const base = document.createElement('i');
    base.className = 'px-road-base';
    base.setAttribute('aria-hidden', 'true');
    base.innerHTML = html;
    el.parentNode.insertBefore(base, el);
  }

  /* =================================================================
     注册
     ================================================================= */
  Deck.scene('pixel', {
    label: '像素游戏',
    family: 'pixel',
    dark: true,
    mascot: 'xiaoqi',
    enter: 'pxtype',
    enterBy: BY,
    titleIn: 'pxtitle',
    recede: .8,
    // 线稿和圈注：粗糙度、弯曲度都是 0（直线、正圆），线宽一格；像素化交给 pixel.css 里套的 pixel-px 滤镜
    rough: { strokeWidth: 4, roughness: 0, bowing: 0, hachureGap: 8, hachureAngle: -45, fillWeight: 4, markWidth: 4, markRoughness: 0, markBowing: 0 },
    fx: FX,
    // 像素化滤镜：整张 1920×1080 的线稿层、圈注层按同一张 4px 网格，每 4×4 取一个点、放大成一整格，透明度只留全有或全无
    defs: '<filter id="pixel-px" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080" color-interpolation-filters="sRGB">'
      + '<feFlood x="1" y="1" width="2" height="2" flood-color="#000"/><feComposite width="4" height="4"/><feTile result="px-grid"/>'
      + '<feComposite in="SourceGraphic" in2="px-grid" operator="in"/><feMorphology operator="dilate" radius="2"/>'
      + '<feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter>',
    // 背景层：星星一层（按舞台坐标对齐）、远山近山两层（贴着窗口底边平铺）；夜空本身是 --scene-bg
    backdrop(layer) {
      layer.insertAdjacentHTML('beforeend', '<i class="px-stars"></i><i class="px-hills px-far"></i><i class="px-hills px-near"></i>');
    },
    // 建页：版式组件里的像素图标、像素路径补全（只看这一页里的）
    decorate(s) {
      s.querySelectorAll('.px-icon[data-px-icon]').forEach(fillIcon);
      s.querySelectorAll('.px-road[data-path]').forEach(buildRoad);
    },
    // 变成当前风格时量一次舞台的缩放（窗口变了再量），离开时摘掉
    mount(stage) {
      if (onResize) return;
      onResize = () => checkRes(stage);
      addEventListener('resize', onResize);
      checkRes(stage);
    },
    unmount(stage) {
      if (onResize) removeEventListener('resize', onResize);
      onResize = null;
      stage.classList.remove('px-lores');
    },
    // 退一拍：窗口里的字闪一下没了，窗口竖向压扁成一条、再横向收没；单独的字闪两下消失
    onBack({ tl, units }) {
      settle();   // 版式组件出场时临时加的类、拆开的字，先收拾干净
      const touched = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement) return;
        const wins = isWin(e) || isBar(e) ? [e] : kidsOf(e).filter(c => isWin(c) || isBar(c));
        if (wins.length) {
          wins.forEach(w => {
            const inner = kidsOf(w);
            if (inner.length) { tl.set(inner, { autoAlpha: 0 }, 0).set(inner, { autoAlpha: 1 }, .04).set(inner, { autoAlpha: 0 }, .08); touched.push(...inner); }
            tl.to(w, { scaleY: .04, duration: .12, ease: 'steps(3)' }, .06).to(w, { scaleX: 0, duration: .1, ease: 'steps(2)' }, .18);
            touched.push(w);
          });
        } else {
          tl.set(e, { autoAlpha: 0 }, 0).set(e, { autoAlpha: 1 }, .04).set(e, { autoAlpha: 0 }, .08);
        }
      });
      if (touched.length) tl.call(() => touched.forEach(c => clean(c, 'transform,transformOrigin,opacity,visibility')), null, .31);
      return { at: .28, gap: 0, y: 0, dur: .02, childAt: .3 };
    },
    // 同风格翻页：旧页分三步暗下去，新页逐格从一边擦出来（前进从左往右，后退从右往左）
    pageTurn({ tl, from, to, dir, retire, clear }) {
      settle();
      tl.to(from.el, { autoAlpha: 0, duration: .18, ease: 'steps(3)', onComplete: retire }, 0);
      tl.fromTo(to.el, { autoAlpha: 1, clipPath: dir > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: .32, ease: 'steps(8)', immediateRender: true, onComplete: () => clear(to.el) }, .12);
      return .16;
    },
    // 「已复制」：命令按钮顶出一枚旋转的金币，到顶碎成一圈金色像素、换成「+1」往上飘；小窗先横向拉开再竖向展开
    copied({ tl, tip, node, ok }) {
      tl.fromTo(tip, { autoAlpha: 1, scaleX: .1, scaleY: .15 }, { scaleX: 1, duration: .08, ease: 'steps(2)', immediateRender: true }, .04)
        .to(tip, { scaleY: 1, duration: .08, ease: 'steps(2)' }, .12);
      if (!ok || !node || !node.matches || !node.matches('.copy')) return;
      node.querySelectorAll('.px-coin, .px-plus').forEach(x => x.remove());
      const coin = document.createElement('span');
      coin.className = 'px-coin';
      coin.setAttribute('aria-hidden', 'true');
      coin.innerHTML = COIN.map((s, i) => s.replace('<svg ', `<svg class="f${i}" `)).join('');
      const plus = document.createElement('span');
      plus.className = 'px-plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+1';
      node.append(coin, plus);
      tl.set(coin, { autoAlpha: 1, attr: { 'data-f': '0' } }, 0)
        .fromTo(coin, { y: 0 }, { y: -48, duration: .3, ease: 'steps(6)', immediateRender: true }, 0);
      [1, 2, 1, 0, 1, 2, 1, 0].forEach((f, i) => tl.set(coin, { attr: { 'data-f': String(f) } }, .05 + i * .05));
      tl.call(() => {
        const cx = coin.offsetLeft + coin.offsetWidth / 2, cy = coin.offsetTop - 48 + coin.offsetHeight / 2;
        burst(node, cx, cy, { n: 6, colors: [PAL.a, PAL.y, PAL.o], dist: 36, size: 4, dur: .3 });
      }, null, .32)
        .set(coin, { autoAlpha: 0 }, .32)
        .fromTo(plus, { autoAlpha: 1, y: 0 }, { y: -16, duration: .2, ease: 'steps(4)', immediateRender: false }, .32)
        .set(plus, { autoAlpha: 0 }, .9)
        .call(() => { coin.remove(); plus.remove(); }, null, .95);
    },
    // 开场（约 1 秒）：星星分三步亮起、远山逐格升上来 → 经验条和主题行亮起 → 大标题一个字一个字掉下来、
    // 角上一闪 → 第 0 拍依次打出 → 重点词反白闪两下落定（形象由引擎在结尾从上面落下）
    intro(ctx) {
      const tl = ctx && ctx.tl, page = ctx && ctx.page;
      const root = page && (page.el || page);
      if (!tl || !root || !root.querySelector) return 0;
      const bg = document.querySelector('.bg[data-scene="pixel"]');
      if (bg) {
        const stars = bg.querySelector('.px-stars');
        if (stars) tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: .24, ease: 'steps(3)', immediateRender: true, onComplete: () => clean(stars, 'opacity') }, 0);
        [...bg.querySelectorAll('.px-hills')].forEach((h, i) => tl.fromTo(h, { y: 24 - i * 8 }, { y: 0, duration: .2, ease: 'steps(4)', immediateRender: true, onComplete: () => clean(h, 'transform') }, .04 + i * .06));
      }
      const stage = root.closest('#stage');
      [stage && stage.querySelector(':scope > .chrome'), root.querySelector(':scope > .s-topic')].filter(Boolean).forEach(e => {
        tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'steps(3)', immediateRender: true, onComplete: () => clean(e, 'opacity,visibility') }, 0);
      });
      const title = root.querySelector(':scope > .s-title');
      if (title) {
        // 先量好标题末尾的位置（拆字、掉落之前），角上的闪光放在那里
        let sp = null;
        try {
          const rg = document.createRange();
          rg.selectNodeContents(title);
          const rs = [...rg.getClientRects()], rr = root.getBoundingClientRect(), k = rr.width / 1920 || 1;
          const last = rs[rs.length - 1];
          if (last) sp = { x: snap4((last.right - rr.left) / k - 12), y: snap4((last.top - rr.top) / k - 16) };
        } catch (e) { sp = null; }
        const d = titleIn(tl, title, .04);
        if (sp) {
          const s = document.createElement('i');
          s.className = 'px-spark';
          s.style.left = sp.x + 'px'; s.style.top = sp.y + 'px';
          root.appendChild(s);
          const at = .04 + d;
          tl.set(s, { autoAlpha: 1, scale: .5 }, at).set(s, { scale: 1 }, at + .06).set(s, { scale: .5 }, at + .18).set(s, { autoAlpha: 0 }, at + .26)
            .call(() => s.remove(), null, at + .3);
        }
      }
      // 第 0 拍：只取最外层的，形象由引擎管
      const zero = [...root.querySelectorAll('[data-beat="0"]')].filter(e => !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest('[data-beat]')));
      let end = .5;
      zero.forEach((e, i) => { const s = (title ? .44 : .2) + i * .1; end = Math.max(end, s + runFx(tl, e, s)); });
      const keys = [...root.querySelectorAll('.key')].filter(k => { const b = k.closest('[data-beat]'); return !b || b.dataset.beat === '0'; });
      if (keys.length) tl.fromTo(keys, { '--k': 0 }, { '--k': 1, duration: .45, ease: 'power2.out', immediateRender: true }, Math.min(end, .9));
      return Math.max(end, 1);
    },
    // 点击处几颗很淡的像素粒子（坐标是舞台坐标，layer 在内容下面）
    ripple(x, y, layer) {
      if (!gs() || !layer || !Deck.motion) return;
      burst(layer, x, y, { n: 4, colors: [PAL[6], PAL[5]], dist: 24, size: 4, dur: .28, alpha: .8 });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1300, y: 12, w: 572, h: 72, name: '页码和经验条' },
    ],
  });
})();
