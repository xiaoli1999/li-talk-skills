/* =====================================================================
   形象 · 方方 fangfang（方果风格 fangguo 的默认形象）
   - 名字：方方，取方果的「方」
   - 长相：从方果的 Logo 化来——圆角方块的果身（品牌红 #ED5E6E），头顶一根 T 形果柄（深石板 #3C4A54），
     右上一片叶子（叶绿 #6CBB4F）；果身左上一道浅色高光，圆眼睛带高光点，小微笑；两只石板色小脚。
     手臂比果身深一档的红，放在果身前面也看得清。圆角取在 Logo 的圆润和几何之间，表情稳重，不撒娇
   - 姿势（svg(pose, opts) 的 pose，画的是朝右）——4 种基本姿势 + 6 个自己的姿势（frames），
     页面上用 data-mascot-pose="ask" 这样写：
     · idle   平常站着，两手垂在身侧
     · point  一只手朝前上方指，讲到这一拍的内容（引擎默认）
     · happy  两手举起、笑眼，旁边两颗小星光（鼠标移上去时也是它）
     · rest   打盹：身子压低、闭眼，头上飘两个 z
     · ask    疑问：歪头、一边眉毛挑起、手托下巴，头顶一个蓝色问号气泡（讲「为什么……」时用）
     · think  思考：眼睛看向左上、手托下巴，旁边三个由小到大的思考泡（讲原因、分析时用）
     · idea   灵感：一根手指举起、眼睛发亮，头顶一盏亮起的小灯泡（讲办法、转折、答案时用）
     · wow    惊讶：眼睛睁大、嘴成小圆、两手张开，旁边一个红色感叹号（讲关键数字、反差时用）
     · ok     点赞：一手竖大拇指、眨一只眼，旁边一个绿色对勾（讲结论、效果、确认时用）
     · thanks 致谢：微微鞠躬、笑眼、两手合在身前，旁边一颗小红心（结尾用）
   - 眨眼：opts.blink 为真时，idle、point、ask、think、idea 的圆眼睛换成两道弧（引擎随机 2.5–6 秒眨一次）
   - 视线：opts.look = [x, y]（-1 到 1，x 正向是它面朝的那边），眼珠往那边挪一点；think 固定看左上
   - 镜像（flipSvg: true）：朝左时自己画镜像——果身整体翻过去，问号、感叹号、灯泡这些符号只挪到另一侧、不翻转，
     问号不会变成反的
   - 画布 150×162，舞台上显示 124×134；脚底在 y≈152（foot .94）
   - 不用滤镜、不用 defs；投影由风格的 --mascot-shadow 管
   ===================================================================== */
(function () {
  'use strict';
  const C = {
    red: '#ED5E6E', arm: '#D94A5C', hi: '#FFFFFF', stem: '#3C4A54', leaf: '#6CBB4F',
    eye: '#263038', blue: '#3B74F0', amber: '#F4A62A', amberL: '#FFD775', green: '#27A36A', mute: '#9AA8BA',
  };
  const POSES = ['idle', 'point', 'happy', 'rest', 'ask', 'think', 'idea', 'wow', 'ok', 'thanks'];
  const f1 = n => Math.round(n * 10) / 10;
  const S = (w, col) => `fill="none" stroke="${col || C.arm}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const arm = d => `<path d="${d}" ${S(10)}/>`;
  const hand = (x, y, r = 6.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.arm}"/>`;

  // 手臂：左肩约在 (28,100)，右肩约在 (116,98)
  const ARMS = {
    idle: arm('M28 102 L17 116') + arm('M116 102 L127 116'),
    point: arm('M28 102 L17 116') + arm('M116 98 L138 78') + hand(140, 76),
    happy: arm('M28 98 L13 76') + hand(12, 73) + arm('M116 98 L131 76') + hand(132, 73),
    rest: arm('M30 112 L22 122') + arm('M114 112 L122 122'),
    ask: arm('M28 102 L17 116') + arm('M116 104 Q112 122 96 120') + hand(94, 119, 7),
    think: arm('M28 102 L17 116') + arm('M116 104 Q114 124 98 122') + hand(96, 121, 7),
    idea: arm('M28 102 L17 116') + arm('M116 98 L130 70') + hand(131, 68) + `<rect x="128" y="50" width="7" height="16" rx="3.5" fill="${C.arm}"/>`,
    wow: arm('M28 100 L10 88') + hand(9, 87) + arm('M116 100 L134 88') + hand(135, 87),
    ok: arm('M28 102 L17 116') + arm('M116 100 L134 86') + `<rect x="128" y="78" width="16" height="16" rx="6" fill="${C.arm}"/><rect x="131" y="62" width="8" height="18" rx="4" fill="${C.arm}"/>`,
    thanks: arm('M30 108 Q42 124 60 124') + arm('M114 108 Q102 124 84 124') + `<ellipse cx="72" cy="124" rx="14" ry="7.5" fill="${C.arm}"/>`,
  };
  // 果身的姿态（绕脚底转）
  const TORSO = {
    idle: '', point: 'rotate(3 72 152)', happy: 'translate(0 -3)', rest: 'translate(72 156) scale(1.06 .9) translate(-72 -152)',
    ask: 'rotate(-7 72 152)', think: 'rotate(-3 72 152)', idea: 'translate(0 -3)', wow: 'translate(0 -4)', ok: 'rotate(2 72 152)', thanks: 'rotate(8 72 152)',
  };

  // 眼睛：圆眼带高光；lk 是视线位移
  const roundEyes = (lk, r = 6.5) => `<g${lk}><circle cx="57" cy="90" r="${r}" fill="${C.eye}"/><circle cx="87" cy="90" r="${r}" fill="${C.eye}"/>` +
    `<circle cx="${f1(57 + r * .34)}" cy="${f1(90 - r * .37)}" r="${f1(r * .34)}" fill="#fff"/><circle cx="${f1(87 + r * .34)}" cy="${f1(90 - r * .37)}" r="${f1(r * .34)}" fill="#fff"/></g>`;
  const shut = `<path d="M50 91 Q57 95 64 91 M80 91 Q87 95 94 91" ${S(4.5, C.eye)}/>`;
  const smileEyes = `<path d="M50 92 Q57 84 64 92 M80 92 Q87 84 94 92" ${S(5, C.eye)}/>`;

  function face(P, o) {
    const v = Array.isArray(o.look) ? o.look : null;
    const lk = v ? ` transform="translate(${f1(v[0] * 2.6)} ${f1(v[1] * 2)})"` : '';
    const blinkable = ['idle', 'point', 'ask', 'think', 'idea'].includes(P);
    if (blinkable && o.blink) return shut + `<path d="M64 108 Q72 114 80 108" ${S(4.5, C.eye)}/>`;
    switch (P) {
      case 'happy': return smileEyes + `<path d="M62 106 Q72 118 82 106 Z" fill="${C.eye}"/>`;
      case 'thanks': return smileEyes + `<path d="M64 108 Q72 114 80 108" ${S(4.5, C.eye)}/>`;
      case 'rest': return shut + `<ellipse cx="72" cy="110" rx="3" ry="3.4" fill="${C.eye}" opacity=".85"/>`;
      case 'ask': return roundEyes(lk) + `<path d="M50 78 L62 80 M82 76 Q88 71 95 74" ${S(3.6, C.eye)}/>` + `<path d="M66 110 L80 107" ${S(4.5, C.eye)}/>`;
      case 'think': return roundEyes(' transform="translate(-2.4 -2.2)"') + `<path d="M50 79 L62 78 M82 78 L94 79" ${S(3.6, C.eye)}/>` + `<path d="M66 109 L78 109" ${S(4.5, C.eye)}/>`;
      case 'idea': return roundEyes(lk, 7) + `<path d="M63 106 Q72 116 81 106" ${S(4.8, C.eye)}/>`;
      case 'wow': return roundEyes('', 8) + `<path d="M49 76 Q57 72 64 76 M80 76 Q87 72 95 76" ${S(3.6, C.eye)}/>` + `<ellipse cx="72" cy="111" rx="5.5" ry="7" fill="${C.eye}"/>`;
      case 'ok': return `<path d="M50 91 Q57 95 64 91" ${S(4.5, C.eye)}/>` + `<g${lk}><circle cx="87" cy="90" r="6.5" fill="${C.eye}"/><circle cx="89.2" cy="87.6" r="2.2" fill="#fff"/></g>` +
        `<path d="M63 106 Q72 116 81 106" ${S(4.8, C.eye)}/>`;
      default: return roundEyes(lk) + `<path d="M64 108 Q72 114 80 108" ${S(4.5, C.eye)}/>`;
    }
  }

  // 身外的小符号（问号、灯泡……）：x 是朝右时的位置，朝左时挪到另一侧，符号本身不翻
  function extra(P, flip) {
    const X = x => (flip ? 150 - x : x);
    const at = (x, y, inner) => `<g transform="translate(${X(x)} ${y})">${inner}</g>`;
    switch (P) {
      case 'ask': return at(124, 24, `<circle r="17" fill="${C.blue}"/><path d="M-5.5 -4.5 a5.8 5.8 0 1 1 8 5.4 c-2.4 1.2 -2.6 2.6 -2.6 5" ${S(3.6, '#fff')}/><circle cx="0" cy="10.5" r="2.3" fill="#fff"/>` +
        `<path d="M-9 13 L-15 22 L-3 16 Z" fill="${C.blue}"/>`);
      case 'think': return `<circle cx="${X(112)}" cy="46" r="3.5" fill="${C.mute}" opacity=".7"/>` +
        `<circle cx="${X(122)}" cy="34" r="5" fill="${C.mute}" opacity=".7"/><circle cx="${X(134)}" cy="18" r="8" fill="${C.mute}" opacity=".7"/>`;
      case 'idea': return at(126, 22, `<g ${S(3, C.amber)}><path d="M0 -24 V-18 M-17 -17 L-13 -13 M17 -17 L13 -13 M-22 0 H-16 M22 0 H16"/></g>` +
        `<circle r="11" fill="${C.amberL}" stroke="${C.amber}" stroke-width="2.6"/><path d="M-4 1 Q0 -4 4 1" ${S(2, C.amber)}/>` +
        `<rect x="-5.5" y="10" width="11" height="7" rx="2.5" fill="${C.stem}"/>`);
      case 'wow': return at(126, 30, `<circle r="15" fill="${C.red}"/><rect x="-2.4" y="-9" width="4.8" height="11" rx="2.4" fill="#fff"/><circle cx="0" cy="7" r="2.6" fill="#fff"/>`);
      case 'ok': return at(26, 30, `<circle r="15" fill="${C.green}"/><path d="M-6.5 0.5 L-1.5 5.5 L7 -4.5" ${S(3.6, '#fff')}/>`);
      case 'thanks': return at(134, 62, `<path d="M0 6 C-12 -2 -9 -12 -3 -11 C-1 -10.6 0 -9 0 -7.6 C0 -9 1 -10.6 3 -11 C9 -12 12 -2 0 6 Z" fill="${C.red}"/>`);
      case 'happy': return at(130, 34, `<path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="${C.amber}"/>`) +
        at(18, 40, `<path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="${C.amber}" opacity=".8"/>`);
      case 'rest': return at(128, 52, `<path d="M0 0 H9 L0 9 H9" ${S(2.6, C.mute)}/>`) + at(141, 36, `<path d="M0 0 H6 L0 6 H6" ${S(2.2, C.mute)}/>`);
      default: return '';
    }
  }

  function svg(pose, opts) {
    const P = POSES.includes(pose) ? pose : 'idle';
    const o = opts || {};
    const flip = !!o.flip;
    const body =
      `<g transform="${TORSO[P]}">` +
        `<rect x="66.5" y="10" width="11" height="40" rx="5.5" fill="${C.stem}"/><rect x="51" y="43" width="42" height="11" rx="5.5" fill="${C.stem}"/>` +
        `<path d="M84.5 31.5c7.5-9.5 19-13 29-11 2.5 10.5-1 22-10.5 28.5-5 3.4-11 4.2-16 2.5-3.4-5.5-5-14-2.5-20z" fill="${C.leaf}"/>` +
        `<rect x="26" y="50" width="92" height="92" rx="18" fill="${C.red}"/>` +
        `<rect x="36" y="60" width="20" height="8" rx="4" fill="${C.hi}" opacity=".28"/>` +
        face(P, o) +
        ARMS[P] +
      '</g>';
    const feet = P === 'rest' ? '' : `<rect x="45" y="141" width="12" height="11" rx="4" fill="${C.stem}"/><rect x="87" y="141" width="12" height="11" rx="4" fill="${C.stem}"/>`;
    const art = feet + body;
    return '<svg viewBox="0 0 150 162" aria-hidden="true" focusable="false">' +
      (flip ? `<g transform="translate(150 0) scale(-1 1)">${art}</g>` : art) +
      extra(P, flip) + '</svg>';
  }

  Deck.mascot('fangfang', {
    label: '方方',
    svg,
    size: [124, 134],
    foot: .94,
    frames: ['ask', 'think', 'idea', 'wow', 'ok', 'thanks'],
    flipSvg: true,
  });
})();
