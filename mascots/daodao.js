/* =====================================================================
   形象 · 叨叨 daodao（漫画 comic 的默认形象）
   - 名字：叨叨，一个爱说话的对话框
   - 长相：一个椭圆对话框，毛笔墨线左下压笔粗、右上收笔细（外墨形和里面的白形错开一点做出来）；
     右下一块网点；对话框的小尾巴是它的标志，尾巴尖是一笔实墨；
     腮红是漫画里的朱红斜线「///」；两只白色小手、两只白色小脚，墨线描边
   - 没用「一滴墨」（撞水墨国风的墨丸）和「拟声词贴纸」（撞新粗野主义的砰砰）
   - 姿势（svg(pose, opts) 的 pose，默认朝右；朝左时由引擎用 CSS 整体镜像，flipSvg: false）：
     idle  平常：尾巴朝左下，两手垂在身侧
     point 尾巴甩到右下（像对话框指着说话的人），身子朝右倾 4°，右手指向右上，眼睛看过去
     happy 笑眼、大张嘴（朱红舌头），两手举起，身子鼓一点，头顶四道钴蓝效果线
     rest  塌下来打盹（身子压扁变宽）、闭眼、小嘴微张，冒一个钴蓝睡觉泡泡
   - 眨眼：opts.blink 为真时 idle、point 的眼睛换成两道弧（引擎随机 2.5–6 秒眨一次，闭 140ms）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边）时眼睛往那边挪一点（最多横 2.6、竖 1.8，画像坐标）；
     point 没给时默认朝前看
   - 画布 136×110（viewBox），舞台上按 177×143 显示（看得见的身子约 117px 高）；脚底在 y≈105（foot .954）
   - 网点图案和对话框内圈的裁切放在 defs 里，引擎把它们放进页面公用的 .deck-defs，id 都以 daodao- 开头；
     每只叨叨的 SVG 里只引用，不再自带 <defs>
   - 来源：作者定稿的形象样页（形象-原有风格）里叨叨那段 mascotSvg，画法、配色原样搬过来；
     只做了接口适配：视线参数夹在 -1 到 1 之间，注册前先确认引擎支持 Deck.mascot
   ===================================================================== */
(function () {
  'use strict';
  const C = { ink: '#16130F', white: '#FFFDF8', red: '#E2452A', blue: '#1D6CB4' };
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const f1 = n => Math.round(n * 10) / 10;
  const clamp = v => Math.max(-1, Math.min(1, +v || 0));
  const L = (col, w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const E = { cx: 68, cy: 52, rx: 47, ry: 37 };            // 外墨形
  const IN = { cx: 69.3, cy: 50.8, rx: 44.2, ry: 34 };     // 里面的白形：往右上错开，墨线就左下粗、右上细
  const pt = (e, deg) => { const t = deg * Math.PI / 180; return [f1(e.cx + e.rx * Math.cos(t)), f1(e.cy + e.ry * Math.sin(t))]; };
  // 带尾巴的对话框：从 A 绕长弧到 B，再拉出尾巴尖回到 A
  const balloon = (e, a, b, tip, c1, c2, sweep) => {
    const [ax, ay] = pt(e, a), [bx, by] = pt(e, b);
    return `M${ax} ${ay}A${e.rx} ${e.ry} 0 1 ${sweep} ${bx} ${by}Q${c1[0]} ${c1[1]} ${tip[0]} ${tip[1]}Q${c2[0]} ${c2[1]} ${ax} ${ay}Z`;
  };
  const BUB = {
    left: [balloon(E, 115, 140, [16, 102], [26, 90], [36, 98], 0), balloon(IN, 115, 140, [23, 96.5], [28, 88], [37, 93], 0)],
    right: [balloon(E, 65, 40, [120, 102], [110, 90], [100, 98], 1), balloon(IN, 65, 40, [113, 96.5], [108, 88], [99, 93], 1)],
  };
  const DEFS =
    '<pattern id="daodao-dots" width="4.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.1" cy="2.1" r=".95" fill="#16130F"/></pattern>' +
    '<clipPath id="daodao-in"><ellipse cx="69.3" cy="50.8" rx="44.2" ry="34"/></clipPath>';
  const mit = (cx, cy, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="5.2" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const ARMS = {
    idle: mit(17.5, 63, -55) + mit(118.5, 63, 55),
    point: mit(17.5, 63, -55) + mit(124, 40, -35),
    happy: mit(20, 24, 35) + mit(116, 24, -35),
    rest: mit(22, 80, -20) + mit(114, 80, 20),
  };
  const BODY = { idle: '', point: 'rotate(4 68 105)', happy: 'translate(68 105) scale(1.03) translate(-68 -105)', rest: 'translate(68 105) scale(1.07 .86) translate(-68 -105)' };
  const BLUSH = `<g ${L(C.red, 1.8)}><path d="M42.5 61 L45.5 56 M46.5 61 L49.5 56 M50.5 61 L53.5 56"/><path d="M82.5 61 L85.5 56 M86.5 61 L89.5 56 M90.5 61 L93.5 56"/></g>`;

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const [outer, inner] = P === 'point' ? BUB.right : BUB.left;
    let eyes, mouth, extra = '', inside = '';
    if (P === 'happy') {
      eyes = `<g ${L(C.ink, 3.2)}><path d="M51 52 Q56 42.5 61 52"/><path d="M75 52 Q80 42.5 85 52"/></g>`;
      mouth = `<path d="M60 57 Q68 70 76 57 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="68" cy="63.6" rx="3.4" ry="2" fill="${C.red}"/>`;
      extra = `<g ${L(C.blue, 2.6)}><path d="M40 9 L36 2"/><path d="M96 9 L100 2"/><path d="M25 17 L17 11"/><path d="M111 17 L119 11"/></g>`;
    } else if (P === 'rest') {
      eyes = `<g ${L(C.ink, 2.6)}><path d="M51 50 Q56 54.5 61 50"/><path d="M75 50 Q80 54.5 85 50"/></g>`;
      mouth = `<ellipse cx="68" cy="60" rx="2.2" ry="2.6" fill="${C.ink}"/>`;
      inside = `<circle cx="80" cy="71" r="6.2" fill="#E6F0FA" stroke="${C.blue}" stroke-width="1.6"/><path d="M76.9 68.6 Q78.4 66.8 80.6 67" ${L('#fff', 1.4)}/>`;   // 睡觉泡泡
    } else {
      if (o.blink) eyes = `<g ${L(C.ink, 2.8)}><path d="M51.5 49 Q56 52.5 60.5 49"/><path d="M75.5 49 Q80 52.5 84.5 49"/></g>`;
      else {
        const v = Array.isArray(o.look) ? [clamp(o.look[0]), clamp(o.look[1])] : (P === 'point' ? [1, 0] : null);
        const lk = v ? ` transform="translate(${f1(v[0] * 2.6)} ${f1(v[1] * 1.8)})"` : '';
        eyes = `<g${lk}><ellipse cx="56" cy="48" rx="4.4" ry="6.4" fill="${C.ink}"/><ellipse cx="80" cy="48" rx="4.4" ry="6.4" fill="${C.ink}"/>` +
          `<ellipse cx="57.6" cy="45.2" rx="1.7" ry="2.2" fill="#fff"/><ellipse cx="81.6" cy="45.2" rx="1.7" ry="2.2" fill="#fff"/></g>`;
      }
      mouth = `<path d="M63 59 Q68 63.5 73 59" ${L(C.ink, 2.4)}/>`;
    }
    return '<svg viewBox="0 0 136 110" aria-hidden="true" focusable="false">' +
      `<g fill="${C.white}" stroke="${C.ink}" stroke-width="2.4"><ellipse cx="56" cy="99.5" rx="8.5" ry="5.2"/><ellipse cx="82" cy="99.5" rx="8.5" ry="5.2"/></g>` +   // 两只小脚
      `<g transform="${BODY[P]}">` +
        `<path d="${outer}" fill="${C.ink}"/><path d="${inner}" fill="${C.white}"/>` +                                     // 毛笔墨线的对话框
        `<g clip-path="url(#daodao-in)"><ellipse cx="94" cy="90" rx="48" ry="24" fill="url(#daodao-dots)" opacity=".5"/></g>` + // 右下一块网点
        BLUSH + eyes + mouth + inside +
        `<g fill="${C.white}" stroke="${C.ink}" stroke-width="2.4">${ARMS[P]}</g>` +
      '</g>' + extra + '</svg>';
  }

  const def = {
    label: '叨叨',
    svg,
    size: [177, 143],
    foot: .954,
    flipSvg: false,     // 朝左时由引擎用 CSS 整体镜像
    outline: true,      // 轮廓是墨线，放到深色底的风格上要引擎加浅色描边
    defs: DEFS,
  };
  if (window.Deck && typeof Deck.mascot === 'function') Deck.mascot('daodao', def);
  else console.warn('[Deck] 这个引擎还不支持 Deck.mascot：形象「叨叨」先不注册，换成支持形象注册的引擎后会自动出现');
})();
