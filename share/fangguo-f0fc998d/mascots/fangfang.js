/* =====================================================================
   形象 · 方小果 fangfang（方果风格 fangguo 的默认形象；键名沿用 fangfang，老课件不用改）
   - 照公司官方 IP「方小果」用 SVG 重画：软胶质感的红色圆角方脑袋（左上受光），浅粉屏幕脸，
     星光大眼睛、腮红、小微笑，头顶歪歪的黑色果柄和一片绿叶；小身子、短手短脚
   - 头整体缩到 85%（HEAD），要调头的大小只改这一个数
   - 姿势（svg(pose, opts) 的 pose，画的是朝右）：idle 平常、point 招手指向、happy 欢呼、rest 打盹，
     以及 frames：ask 疑问、think 思考、idea 灵感、wow 惊讶、ok 点赞、no 不太行、thanks 谢谢、love 比心
   - 动起来：叶子轻轻摆、头微微呼吸、符号（问号、灯泡、爱心）轻轻浮动；减少动态时停住
   - 眨眼 opts.blink、视线 opts.look；朝左时 opts.flip 自己画镜像，符号只挪位置不翻
   - 画布 200×250，舞台上显示 112×140；脚底在 y≈236（foot .945）
   - 渐变和动画样式放在 defs 里，引擎放进页面公用的 .deck-defs；id、类名都以 fxg- 开头
   ===================================================================== */
(function () {
  'use strict';
  var root = window;
  var C = {
    red: '#F04A5C', redHi: '#FF7F8C', redLo: '#C9303F',
    face: '#FFE6E3', faceLo: '#F6CFCB', eye: '#1F1A1E', blush: '#FF8E9B',
    stem: '#3A3236', stemHi: '#5C5257', leaf: '#7DBE3F', leafHi: '#A8DA62', leafLo: '#4E9128',
    gold: '#FFC93D', goldLo: '#E9A112', blue: '#3B74F0', green: '#2DB36B', mute: '#9AA8BA',
  };
  var DEFS =
    '<radialGradient id="fxg-head" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="' + C.redHi + '"/><stop offset=".55" stop-color="' + C.red + '"/><stop offset="1" stop-color="' + C.redLo + '"/></radialGradient>' +
    '<radialGradient id="fxg-body" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="' + C.redHi + '"/><stop offset=".6" stop-color="' + C.red + '"/><stop offset="1" stop-color="' + C.redLo + '"/></radialGradient>' +
    '<linearGradient id="fxg-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1EF"/><stop offset="1" stop-color="' + C.faceLo + '"/></linearGradient>' +
    '<linearGradient id="fxg-stem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.stemHi + '"/><stop offset="1" stop-color="' + C.stem + '"/></linearGradient>' +
    '<linearGradient id="fxg-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.leafHi + '"/><stop offset=".55" stop-color="' + C.leaf + '"/><stop offset="1" stop-color="' + C.leafLo + '"/></linearGradient>' +
    '<radialGradient id="fxg-blush"><stop offset="0" stop-color="' + C.blush + '" stop-opacity=".75"/><stop offset="1" stop-color="' + C.blush + '" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="fxg-gold" cx="35%" cy="30%"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="' + C.goldLo + '"/></radialGradient>' +
    '<style>' +
      '@keyframes fxg-leaf{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(6deg)}}' +
      '@keyframes fxg-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(1.6px)}}' +
      '@keyframes fxg-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}' +
      '.fxg-leaf{transform-box:fill-box;transform-origin:0% 100%;animation:fxg-leaf 3.2s ease-in-out infinite}' +
      '.fxg-head{animation:fxg-breathe 3.6s ease-in-out infinite}' +
      '.fxg-sym{animation:fxg-bob 2.4s ease-in-out infinite}' +
      '@media (prefers-reduced-motion:reduce){.fxg-leaf,.fxg-head,.fxg-sym{animation:none}}' +
    '</style>';

  // 手臂：一段圆头胶囊（粗描边），上面再描一道亮边，像软胶
  function arm(d) {
    return '<path d="' + d + '" fill="none" stroke="' + C.redLo + '" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="url(#fxg-body)" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  var hand = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 10) + '" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>'; };
  var thumb = function (x, y) { return hand(x, y + 10, 11) + '<rect x="' + (x - 5) + '" y="' + (y - 14) + '" width="10" height="20" rx="5" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>'; };

  // 手臂姿势（肩膀约在 (80,168) 和 (120,168)，画布 200×250）
  var ARMS = {
    idle: arm('M80 170 Q66 182 66 196') + arm('M120 170 Q134 182 134 196'),
    point: arm('M80 170 Q66 182 66 196') + arm('M121 168 Q144 152 156 130') + hand(158, 126),
    happy: arm('M79 168 Q60 150 52 128') + hand(50, 124) + arm('M121 168 Q140 150 148 128') + hand(150, 124),
    rest: '',
    ask: arm('M80 170 Q66 182 66 196') + arm('M121 172 Q118 190 104 188') + hand(101, 186, 10),
    think: arm('M80 172 Q90 192 112 190') + arm('M121 170 Q128 160 116 150') + hand(113, 148, 10),
    idea: arm('M80 170 Q66 182 66 196') + arm('M121 168 Q140 150 144 122') + '<rect x="139" y="98" width="10" height="24" rx="5" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>' + hand(144, 124, 10),
    wow: arm('M79 168 Q60 166 50 150') + hand(48, 146) + arm('M121 168 Q140 166 150 150') + hand(152, 146),
    ok: arm('M80 170 Q66 182 66 196') + arm('M121 170 Q142 166 150 148') + thumb(152, 140),
    thanks: arm('M80 170 Q88 186 98 184') + arm('M120 170 Q112 186 102 184') + '<ellipse cx="100" cy="182" rx="12" ry="14" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>',
    love: arm('M80 170 Q86 182 92 182') + arm('M120 170 Q114 182 108 182'),
    no: arm('M80 170 Q66 182 66 196') + arm('M121 168 Q140 156 146 136') + hand(147, 132),
  };
  // 身子姿态
  var TILT = { idle: '', point: 'rotate(3 100 236)', happy: 'translate(0 -4)', rest: 'translate(0 8)', ask: 'rotate(-6 100 236)', think: 'rotate(-3 100 236)',
    idea: 'translate(0 -3)', wow: 'translate(0 -5)', ok: 'rotate(2 100 236)', thanks: 'rotate(6 100 236)', love: '', no: 'rotate(-2 100 236)' };

  function star(x, y, s) { // 眼睛里的四角星光
    return '<path d="M' + x + ' ' + (y - s) + ' Q' + (x + s * .22) + ' ' + (y - s * .22) + ' ' + (x + s) + ' ' + y + ' Q' + (x + s * .22) + ' ' + (y + s * .22) + ' ' + x + ' ' + (y + s) + ' Q' + (x - s * .22) + ' ' + (y + s * .22) + ' ' + (x - s) + ' ' + y + ' Q' + (x - s * .22) + ' ' + (y - s * .22) + ' ' + x + ' ' + (y - s) + 'Z" fill="#E9E9EE"/>';
  }
  function face(P, o) {
    var v = Array.isArray(o.look) ? o.look : null;
    var dx = v ? v[0] * 3 : 0, dy = v ? v[1] * 2.4 : 0;
    if (P === 'think') { dx = -3; dy = -3; }
    var eyes = function (rx, ry) {
      rx = rx || 9.5; ry = ry || 11.5;
      return '<g transform="translate(' + dx + ' ' + dy + ')"><ellipse cx="80" cy="112" rx="' + rx + '" ry="' + ry + '" fill="' + C.eye + '"/><ellipse cx="120" cy="112" rx="' + rx + '" ry="' + ry + '" fill="' + C.eye + '"/>' +
        star(83, 107, 4.2) + star(123, 107, 4.2) + '</g>';
    };
    var closed = '<path d="M71 113 Q80 119 89 113 M111 113 Q120 119 129 113" fill="none" stroke="' + C.eye + '" stroke-width="4" stroke-linecap="round"/>';
    var smileUp = '<path d="M71 114 Q80 104 89 114 M111 114 Q120 104 129 114" fill="none" stroke="' + C.eye + '" stroke-width="4.2" stroke-linecap="round"/>';
    var smile = '<path d="M92 125 Q100 132 108 125" fill="none" stroke="' + C.eye + '" stroke-width="3.6" stroke-linecap="round"/>';
    var blinkable = ['idle', 'point', 'ask', 'think', 'idea', 'ok', 'no'].indexOf(P) >= 0;
    if (blinkable && o.blink) return closed + smile;
    switch (P) {
      case 'happy': return smileUp + '<path d="M90 123 Q100 136 110 123 Z" fill="' + C.eye + '"/><path d="M95 129 Q100 133 105 129" fill="#FF7D8C"/>';
      case 'thanks': return smileUp + smile;
      case 'love': return smileUp.replace('M111 114 Q120 104 129 114', '') + eyes().replace(/<ellipse cx="80"[^>]*\/>/, '').replace(/<path d="M83[^>]*\/>/, '') + smile;
      case 'rest': return closed + '<ellipse cx="100" cy="127" rx="3.4" ry="4" fill="' + C.eye + '" opacity=".85"/>';
      case 'wow': return eyes(11, 13.5) + '<ellipse cx="100" cy="128" rx="6" ry="7.5" fill="' + C.eye + '"/>';
      case 'ask': return eyes() + '<path d="M70 96 L88 99 M112 95 Q121 89 131 93" fill="none" stroke="' + C.eye + '" stroke-width="3" stroke-linecap="round"/>' + '<path d="M93 127 L108 124" fill="none" stroke="' + C.eye + '" stroke-width="3.4" stroke-linecap="round"/>';
      case 'think': return eyes() + '<path d="M93 127 L106 127" fill="none" stroke="' + C.eye + '" stroke-width="3.4" stroke-linecap="round"/>';
      case 'no': return eyes(9.5, 10) + '<path d="M93 127 L107 127" fill="none" stroke="' + C.eye + '" stroke-width="3.4" stroke-linecap="round"/>';
      case 'idea': return eyes(10, 12) + '<path d="M90 123 Q100 134 110 123" fill="none" stroke="' + C.eye + '" stroke-width="3.8" stroke-linecap="round"/>';
      default: return eyes() + smile;
    }
  }
  // 身外的小符号：朝左时只挪位置、不翻转
  function extra(P, flip) {
    var X = function (x) { return flip ? 200 - x : x; };
    var at = function (x, y, s) { return '<g class="fxg-sym"><g transform="translate(' + X(x) + ' ' + y + ')">' + s + '</g></g>'; };
    switch (P) {
      case 'ask': return at(166, 40, '<path d="M-8 -6 a8.5 8.5 0 1 1 12 7.8 c-3.5 1.8 -3.8 3.8 -3.8 7.2" fill="none" stroke="' + C.eye + '" stroke-width="5.5" stroke-linecap="round"/><circle cx="0" cy="17" r="3.6" fill="' + C.eye + '"/>');
      case 'think': return '<g class="fxg-sym"><circle cx="' + X(160) + '" cy="70" r="4" fill="' + C.mute + '" opacity=".7"/><circle cx="' + X(170) + '" cy="54" r="6" fill="' + C.mute + '" opacity=".7"/><circle cx="' + X(182) + '" cy="34" r="9" fill="' + C.mute + '" opacity=".7"/></g>';
      case 'idea': return at(150, 52, '<g stroke="' + C.goldLo + '" stroke-width="3" stroke-linecap="round"><path d="M0 -30 V-23 M-21 -21 L-16 -16 M21 -21 L16 -16 M-28 0 H-21 M28 0 H21"/></g><circle r="14" fill="url(#fxg-gold)"/><path d="M-5 2 Q0 -5 5 2" fill="none" stroke="#B9770A" stroke-width="2"/><rect x="-7" y="13" width="14" height="8" rx="3" fill="' + C.stem + '"/>');
      case 'wow': return at(168, 54, '<circle r="15" fill="#FF5C6E"/><rect x="-2.6" y="-9" width="5.2" height="11" rx="2.6" fill="#fff"/><circle cx="0" cy="7" r="2.8" fill="#fff"/>');
      case 'ok': return at(40, 60, '<circle r="15" fill="' + C.green + '"/><path d="M-6.5 .5 L-1.5 5.5 L7 -4.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>');
      case 'no': return at(150, 104, '<rect x="-2" y="2" width="4" height="22" rx="2" fill="' + C.stem + '"/><circle r="17" fill="#fff" stroke="#E5414F" stroke-width="4"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#E5414F" stroke-width="4" stroke-linecap="round"/>');
      case 'love': return at(100, 180, '<path d="M0 14 C-22 0 -18 -18 -7 -16 C-3 -15 0 -12 0 -9 C0 -12 3 -15 7 -16 C18 -18 22 0 0 14 Z" fill="#FF4F67" stroke="#D42E46" stroke-width="2"/>') +
        at(38, 74, '<path d="M0 6 C-9 0 -7 -7 -3 -7 C-1 -7 0 -5 0 -4 C0 -5 1 -7 3 -7 C7 -7 9 0 0 6 Z" fill="#FF6B80"/>') + at(166, 64, '<path d="M0 6 C-9 0 -7 -7 -3 -7 C-1 -7 0 -5 0 -4 C0 -5 1 -7 3 -7 C7 -7 9 0 0 6 Z" fill="#FF6B80"/>');
      case 'happy': return at(170, 70, '<path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="' + C.gold + '"/>') + at(30, 84, '<path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="' + C.gold + '"/>');
      case 'thanks': return at(160, 84, '<path d="M0 6 C-10 0 -8 -8 -3 -8 C-1 -8 0 -6 0 -4 C0 -6 1 -8 3 -8 C8 -8 10 0 0 6 Z" fill="#FF6B80"/>');
      case 'rest': return at(158, 50, '<path d="M0 0 H11 L0 11 H11" fill="none" stroke="' + C.mute + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>') + at(176, 30, '<path d="M0 0 H8 L0 8 H8" fill="none" stroke="' + C.mute + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>');
      default: return '';
    }
  }

  function svg(pose, opts) {
    var P = ARMS.hasOwnProperty(pose) ? pose : 'idle';
    var o = opts || {};
    var flip = !!o.flip;
    // 第一版的身子和腿；头整体缩到 85%（以脖子为中心缩），用户要求。FXG_HEAD 可以临时换别的比例看
    var HEAD = root.FXG_HEAD || .85;
    var legs = P === 'rest' ? '' :
      '<rect x="80" y="206" width="17" height="30" rx="8" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/><rect x="103" y="206" width="17" height="30" rx="8" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>';
    var body = '<rect x="72" y="156" width="56" height="60" rx="24" fill="url(#fxg-body)" stroke="' + C.redLo + '" stroke-width="2"/>' +
      '<ellipse cx="88" cy="172" rx="9" ry="5" fill="#fff" opacity=".18"/>';
    var head =
      '<g class="fxg-head"><g transform="translate(100 162) scale(' + HEAD + ') translate(-100 -162)">' +
        '<g class="fxg-leaf"><path d="M110 50 C114 30 132 18 154 20 C152 40 136 54 112 54 Z" fill="url(#fxg-leaf)"/><path d="M114 50 C124 40 136 32 148 26" fill="none" stroke="' + C.leafLo + '" stroke-width="1.6" opacity=".55" stroke-linecap="round"/></g>' +
        '<g transform="rotate(-9 96 52)"><rect x="88" y="16" width="16" height="42" rx="7" fill="url(#fxg-stem)"/><rect x="91" y="19" width="4" height="22" rx="2" fill="#fff" opacity=".18"/></g>' +
        '<rect x="26" y="48" width="148" height="122" rx="42" fill="url(#fxg-head)" stroke="' + C.redLo + '" stroke-width="2"/>' +
        '<path d="M44 78 Q46 58 70 56" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".28"/>' +
        '<rect x="48" y="80" width="104" height="70" rx="26" fill="url(#fxg-face)"/>' +
        '<rect x="48" y="80" width="104" height="70" rx="26" fill="none" stroke="#E2A9A7" stroke-width="2.4" opacity=".7"/>' +
        '<ellipse cx="64" cy="132" rx="13" ry="8" fill="url(#fxg-blush)"/><ellipse cx="136" cy="132" rx="13" ry="8" fill="url(#fxg-blush)"/>' +
        face(P, o) +
      '</g></g>';
    var art = '<ellipse cx="100" cy="240" rx="44" ry="6" fill="#16233F" opacity=".1"/>' +
      '<g transform="' + TILT[P] + '">' + legs + body + head + ARMS[P] + '</g>';
    return '<svg viewBox="0 0 200 250" aria-hidden="true" focusable="false">' +
      (flip ? '<g transform="translate(200 0) scale(-1 1)">' + art + '</g>' : art) + extra(P, flip) + '</svg>';
  }


  Deck.mascot('fangfang', {
    label: '方小果',
    svg: svg,
    size: [112, 140],
    foot: .945,
    frames: ['ask', 'think', 'idea', 'wow', 'ok', 'no', 'thanks', 'love'],
    flipSvg: true,
    defs: DEFS,
  });
})();
