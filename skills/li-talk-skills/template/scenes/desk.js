/* =====================================================================
   风格 · 工位桌面 desk（手绘风）
   - 样子：很淡的米色木纹桌面，内容是落在桌上的白纸、便签；纸胶带贴章节，珊瑚红马克笔划重点；
     可复制的命令是标签机打出来的黑条，「已复制」是一个红色印章；线稿带铅笔的毛边（SVG 滤镜 pencil）
   - 适合讲：讲者自己的故事、多方协作
   - 出场：纸从上面落到桌上，落地前略微抬起、带一点投影；命令条按标签机的样子一格格打出来；
     大标题淡入
   - 翻页：旧纸被推到一边，新的一张滑进来
   - 退一拍：这一拍的纸片被拿起来（往上抬一点再消失），不往下掉
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和图钉节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 样子在 desk.css 里

   - 工位桌面自有的版式组件（类名带 dsk- 前缀，样子和写法见 desk.css 末尾「工位桌面自有版式组件」，样板页见 samples/desk.js；
     别的风格不认识，只是普通容器）。整页当成从上往下看的一张办公桌：东西摆上桌、便签贴在旁边、标签机吐出一条条标签。
     每拍「发生了什么」由组件自己做（enterBy 按类名配好，页面只写结构和 data-beat，不写 data-in、不写 onBeat）：
     · .dsk-obj[data-dsk-art="名字"] 桌上的东西（俯视的简笔插画，建页时这里把 SVG 填进去）：出场「放下」dkset——
       从桌面上方一点被放下来，影子从大而淡收到小而实。内置：gaiwan 盖碗、tin 开着盖的茶叶罐、kettle 电水壶、cup 一杯茶、
       pencil 铅笔、maker 标签机、thermo 温度计、timer 钟、leaves 一堆茶叶（后三个是小图标，放在纸上配字）
     · .dsk-note 便签（四种颜色：默认黄、p 粉、g 绿、b 蓝；加 clip 是用回形针别在下面那张纸上）：出场「贴上」dkstick——
       从上面落下来，上沿先粘住，下半截随后拍平
     · .dsk-sheet 白纸（打印的纸、卡片）：出场「贴上」dkstick——纸落到桌上，纸胶带随后从一头按下去
       （默认上沿正中一条；corners 两个上角各一条；stripe 换成珊瑚条纹的胶带）
     · .dsk-label 标签条（标签机打出来的一条，里面可以放 .dsk-box 勾选框）：出场「吐出」dkprint——
       这页有标签机（.dsk-obj[data-dsk-art="maker"]）时，标签从标签机右边靠下的出口一格格吐出来，撕下、挪到自己的位置贴好；
       没有标签机时就地一格格打出来。可复制的命令 .copy 也是这样出场
     · .dsk-tick 马克笔勾（放在 .dsk-box 里，写自己的 data-beat）：出场「打勾」dktick——珊瑚红马克笔从左往右一笔勾上
     · .dsk-badge 工牌（带挂绳）：出场「挂上」dkswing——从上面落下来，绕挂绳那头晃两下停住
     · .dsk-key 键帽（放在 .dsk-macro 小键盘上）：出场「装键帽」dkkey——键帽落到轴上，咔哒按一下再弹回来
     · .dsk-book 牛皮纸本子、.dsk-macro 小键盘、.dsk-laptop 合上的笔记本电脑：大件，出场和桌上的东西一样「放下」dskset
     · .dsk-no 手写圈号（1、2、3，就是阅读顺序）：跟着所在的纸一起出现，不另出场
   - 同一拍里的先后（plan）：先打勾（上一条做完了），再放桌上的东西和大件，最后贴纸、吐标签（「先有东西，再贴说明」）
   - 自己加的出场名：dkset、dkstick、dkprint、dktick、dkswing、dkkey，只在这个风格里认（别的风格会提醒并换成它的默认出场）
   - 可读性约定（形态丰富，翻到最后一拍整页仍要读得清）：
     · 讲过的纸片、标签一律留在桌上，打勾以后不变灰、不划掉（只由引擎退到 .8）；组件里不另加透明度
     · 字都写在实色的纸、便签、标签、键帽上（深色字压浅色纸，命令条是浅色字压黑条），身后不垫插画和胶带
     · 字横排；纸片歪不超过 2°（--r 在 ±1.5deg 以内），标签机吐出来时是正的，贴好才歪那一点
     · 插画是包装，真话写在旁边的便签、纸上；插画里不放字
     · 珊瑚红只给重点：重点词的马克笔、打勾、一枚强调键帽，一页加起来不超过 3 处；圈号、勾选框是墨色
   ===================================================================== */
(function () {
  'use strict';

  /* =================================================================
     桌上的东西 .dsk-obj[data-dsk-art]：俯视的简笔插画（墨色轮廓 + 平涂，光从左上来，投影由 desk.css 的 drop-shadow 画）
     vb 是画布；slot 只有标签机有：标签出口在画布里的位置（按宽、高的比例），标签从这里吐出来
     ================================================================= */
  const K = '#4A423B', K2 = '#8A7F73', W = '#FFFDF9', TEA = '#E2D38A', CORAL = '#EF6A43', DARK = '#3E3935', TIN = '#5F8A78', TIND = '#4B7161', METAL = '#DCD4C5', BLUE = '#5D7FA6';
  const ln = (w, c) => `stroke="${c || K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  /* 一堆茶叶：在圆 (cx, cy, r) 里撒 n 片（固定种子，每次画得一样） */
  function leafPile(cx, cy, r, n, seed, s) {
    let x = seed, out = '';
    const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    const greens = ['#7E9F58', '#94B46A', '#6A8C47', '#A9C47E', '#5E7E3F'];
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r, px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
      const k = (s || 1) * (.8 + rnd() * .45);
      out += `<path transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${Math.round(rnd() * 360)}) scale(${k.toFixed(2)})" d="M-15 0C-9-7 9-7 15 0C9 7-9 7-15 0Z" fill="${greens[i % 5]}" ${ln(1.6, '#4E6B35')}/>`;
    }
    return out;
  }
  /* 一大堆茶叶（侧看是个小山包）：在底边 (cx, base) 上堆 n 片，宽 2r、高 h，两边再掉几片 */
  function leafHeap(cx, base, r, h, n, seed) {
    let x = seed, out = '';
    const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    const greens = ['#7E9F58', '#94B46A', '#6A8C47', '#A9C47E', '#5E7E3F'];
    const leaf = (px, py, a, k, i) => `<path transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${a}) scale(${k.toFixed(2)})" d="M-15 0C-9-7 9-7 15 0C9 7-9 7-15 0Z" fill="${greens[i % 5]}" ${ln(1.6, '#4E6B35')}/>`;
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1, top = h * (1 - u * u);
      out += leaf(cx + u * r, base - 6 - rnd() * top, Math.round(rnd() * 180 - 90), .85 + rnd() * .35, i);
    }
    [[-1.25, -4, 20], [1.2, -3, -30], [1.45, -2, 70]].forEach(([u, dy, a], i) => { out += leaf(cx + u * r, base + dy, a, .8, i + 1); });
    return out;
  }
  const ART = {
    // 盖碗（俯视）：茶托、碗沿，盖子略微错开一点，露出一弯茶汤；盖子上一圈青花蓝的描线，正中是盖钮
    gaiwan: { vb: '0 0 320 320', svg:
      `<circle cx="160" cy="160" r="146" fill="${W}" ${ln(3.5)}/>`
      + `<circle cx="160" cy="160" r="122" fill="#F1EADD" ${ln(2, K2)}/>`
      + `<circle cx="160" cy="160" r="110" fill="#FFFFFF" ${ln(3.5)}/>`
      + `<circle cx="160" cy="160" r="97" fill="${TEA}" ${ln(2, K2)}/>`
      + `<circle cx="170" cy="148" r="90" fill="${W}" ${ln(3.5)}/>`
      + '<path d="M232 196A90 90 0 0 1 112 216A78 78 0 0 0 232 196Z" fill="rgba(150,120,80,.14)"/>'
      + `<circle cx="170" cy="148" r="64" fill="none" ${ln(4.5, BLUE)}/><circle cx="170" cy="148" r="56" fill="none" ${ln(2, BLUE)} stroke-dasharray="3 9"/>`
      + `<circle cx="170" cy="148" r="25" fill="#FFFFFF" ${ln(3.5)}/>`
      + `<circle cx="170" cy="148" r="13" fill="none" ${ln(2.5, K2)}/>` },
    // 茶叶罐（俯视）：罐子开着，里面一满罐绿茶；罐盖搁在右边
    tin: { vb: '0 0 400 280', svg:
      `<circle cx="140" cy="140" r="124" fill="${TIN}" ${ln(3.5)}/>`
      + `<circle cx="140" cy="140" r="108" fill="${METAL}" ${ln(2.5)}/>`
      + '<circle cx="140" cy="140" r="96" fill="#4A403A"/>'
      + leafPile(140, 140, 80, 46, 7)
      + `<circle cx="320" cy="156" r="74" fill="${TIN}" ${ln(3.5)}/>`
      + `<circle cx="320" cy="156" r="60" fill="${TIND}" ${ln(2, '#3D5C4F')}/>`
      + `<circle cx="320" cy="156" r="38" fill="${W}" ${ln(2.5)}/>`
      + `<path d="M334 136C306 140 298 162 306 178C330 176 342 156 334 136Z" fill="#7E9F58" ${ln(2, '#4E6B35')}/><path d="M308 174Q318 158 330 142" fill="none" ${ln(2, '#4E6B35')}/>` },
    // 电水壶（俯视）：黑色底座露出一圈，白色壶身、左边壶嘴冒热气、右边把手，盖上一枚珊瑚红的开盖按钮
    kettle: { vb: '0 0 400 330', svg:
      `<path d="M318 252C346 284 378 296 400 290" fill="none" ${ln(7, DARK)}/>`
      + `<circle cx="190" cy="165" r="142" fill="${DARK}" ${ln(3)}/>`
      + `<path d="M262 80C344 66 378 118 378 165C378 212 344 264 262 250L270 222C322 230 348 202 348 165C348 128 322 100 270 108Z" fill="${W}" ${ln(3.5)}/>`
      + `<path d="M80 138L30 148Q18 165 30 182L80 192Z" fill="${W}" ${ln(3.5)}/>`
      + `<circle cx="190" cy="165" r="120" fill="${W}" ${ln(3.5)}/>`
      + '<path d="M290 230A120 120 0 0 1 96 240A104 104 0 0 0 290 230Z" fill="rgba(150,120,80,.14)"/>'
      + `<circle cx="190" cy="165" r="76" fill="#F1EADD" ${ln(3)}/>`
      + `<rect x="170" y="150" width="40" height="30" rx="11" fill="${CORAL}" ${ln(2.5)}/>`
      + `<path d="M24 134q-12-14 0-28q12-14 0-28M50 128q-10-12 0-24q10-12 0-24" fill="none" ${ln(5, K2)} stroke-opacity=".6"/>` },
    // 一杯茶（俯视）：白杯子里一杯黄绿的茶汤，右边把手，杯口冒三缕热气
    cup: { vb: '0 0 320 310', svg:
      `<path d="M236 152C300 140 310 236 240 226" fill="none" ${ln(24)}/><path d="M236 152C300 140 310 236 240 226" fill="none" ${ln(16, W)}/>`
      + `<circle cx="150" cy="190" r="112" fill="${W}" ${ln(3.5)}/>`
      + `<circle cx="150" cy="190" r="94" fill="${TEA}" ${ln(2.5, K2)}/>`
      + '<path d="M222 236A94 94 0 0 1 88 258A80 80 0 0 0 222 236Z" fill="rgba(160,130,40,.16)"/>'
      + '<ellipse cx="112" cy="150" rx="34" ry="12" transform="rotate(-32 112 150)" fill="rgba(255,255,255,.6)"/>'
      + `<path d="M112 120q-14-18 0-36q14-18 0-36M152 110q-14-18 0-36q14-18 0-36q-14-18 0-30M192 120q-14-18 0-36q14-18 0-36" fill="none" ${ln(6, K2)} stroke-opacity=".55"/>` },
    // 铅笔：黄色六棱笔杆、银色箍、粉色橡皮，横着放（要斜放写 --r）
    pencil: { vb: '0 0 420 44', svg:
      `<path d="M2 22L46 6V38Z" fill="#EAD2A8" ${ln(2.5)}/><path d="M2 22L15 17V27Z" fill="${DARK}"/>`
      + `<rect x="46" y="6" width="298" height="32" fill="#F2C14E" ${ln(2.5)}/><path d="M46 17H344M46 27H344" ${ln(2, '#D29E33')}/>`
      + `<rect x="344" y="5" width="34" height="34" fill="#CFC9C0" ${ln(2.5)}/><path d="M354 6V38M366 6V38" ${ln(2, '#9E978D')}/>`
      + `<rect x="378" y="6" width="38" height="32" rx="9" fill="#F4A3A0" ${ln(2.5)}/>` },
    // 标签机（俯视）：炭灰色机身，上面一块绿灰液晶屏，下面四排打字的小键和一条空格键、一颗珊瑚红打印键；右边靠下的出口伸出一截白标签
    maker: { vb: '0 0 392 560', slot: [386 / 392, 448 / 560], svg:
      `<rect x="360" y="436" width="28" height="24" fill="${W}" ${ln(2)}/><path d="M326 420H360Q368 420 368 428V468Q368 476 360 476H326Z" fill="#2A2522" ${ln(3)}/>`
      + `<rect x="24" y="20" width="310" height="520" rx="64" fill="${DARK}" ${ln(3.5)}/>`
      + '<rect x="38" y="34" width="282" height="492" rx="54" fill="none" stroke="#5A534D" stroke-width="3"/>'
      + '<rect x="62" y="70" width="234" height="122" rx="16" fill="#1F1C1A"/><rect x="76" y="84" width="206" height="94" rx="8" fill="#BFCBA8"/>'
      + '<rect x="94" y="106" width="92" height="16" rx="3" fill="#56614A"/><rect x="194" y="104" width="12" height="20" fill="#56614A"/><rect x="94" y="136" width="146" height="12" rx="3" fill="#86937A"/>'
      + (() => { let k = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) k += `<rect x="${50 + c * 38 + (r % 2) * 6}" y="${220 + r * 36}" width="30" height="27" rx="6" fill="#E9E3D6" stroke="#231F1C" stroke-width="2"/>`; return k + '<rect x="96" y="366" width="166" height="27" rx="7" fill="#E9E3D6" stroke="#231F1C" stroke-width="2"/>'; })()
      + `<circle cx="179" cy="462" r="40" fill="${CORAL}" ${ln(3)}/><circle cx="179" cy="462" r="27" fill="none" stroke="#F7A68B" stroke-width="3"/><circle cx="94" cy="462" r="17" fill="#6B635C" ${ln(2.5)}/><circle cx="264" cy="462" r="17" fill="#6B635C" ${ln(2.5)}/>` },
    // 小图标：温度计（水银到顶，旁边两道热气）、钟（指针走过一大圈，蓝色箭头）、一大堆茶叶（堆成小山，两边还掉了几片）
    thermo: { vb: '0 0 130 150', svg:
      `<path d="M52 24a13 13 0 0 1 26 0v66a24 24 0 1 1-26 0Z" fill="${W}" ${ln(3.5)}/>`
      + `<rect x="60" y="22" width="10" height="84" rx="5" fill="${CORAL}"/><circle cx="65" cy="112" r="15" fill="${CORAL}"/>`
      + `<path d="M86 34h12M86 52h8M86 70h12" fill="none" ${ln(3, K2)}/>`
      + `<path d="M24 64q-9-9 0-18q9-9 0-18M108 108q-9-9 0-18q9-9 0-18" fill="none" ${ln(3.5, K2)}/>` },
    timer: { vb: '0 0 140 140', svg:
      `<circle cx="70" cy="76" r="54" fill="${W}" ${ln(3.5)}/><path d="M58 14h24M70 14v8M112 34l8-8" fill="none" ${ln(4)}/>`
      + `<path d="M70 76V40M70 76l28 16" fill="none" ${ln(4.5)}/><circle cx="70" cy="76" r="5" fill="${K}"/>`
      + `<path d="M70 32A44 44 0 1 1 30 92" fill="none" ${ln(5, BLUE)}/><path d="M24 82l6 12 12-6" fill="none" ${ln(4, BLUE)}/>` },
    leaves: { vb: '0 0 150 120', svg:
      `<path d="M6 108H144" fill="none" ${ln(3, K2)}/>` + leafHeap(75, 106, 50, 70, 34, 3) },
  };
  function fillArt(el) {
    const a = ART[el.dataset.dskArt];
    if (!a) { console.warn(`[Deck] 工位桌面的插画 data-dsk-art="${el.dataset.dskArt}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="${a.vb}" focusable="false">${a.svg}</svg>`;
  }

  /* =================================================================
     出场
     - 引擎不清函数出场留下的行内样式，这里在每个元素自己的补间都排完以后清（直接 removeProperty：跳拍时时间线被推到结尾，
       补间 onComplete 里的 gsap.set clearProps 不生效）
     ================================================================= */
  const PROPS = ['opacity', 'visibility', 'transform', 'translate', 'rotate', 'scale', 'clip-path', 'transform-origin', '--dsk-lift', '--dsk-tp'];
  const clean = e => { if (e && e.style) PROPS.forEach(k => e.style.removeProperty(k)); };
  const later = (tl, e, at) => tl.call(() => clean(e), null, at);
  /* 元素自己的倾斜角（页面写的 --r）：gsap 动画时会把 rotate 写成 none，倾斜要并进 gsap 的 rotation */
  const tiltOf = e => {
    if (!e || e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? parseFloat(v) || 0 : 0;
  };
  /* 显示：节拍单元本身连 visibility 一起管（autoAlpha），没有 data-beat 的子元素只管 opacity */
  const vis = (from, to, unit) => { if (unit) { from.autoAlpha = 0; to.autoAlpha = 1; } else { from.opacity = 0; to.opacity = 1; } };
  /* 元素在页面里的位置（舞台坐标，不受缩放、动画影响） */
  function posIn(e) {
    let l = 0, t = 0, n = e;
    while (n && !(n.classList && n.classList.contains('slide'))) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    return { l, t };
  }
  function fadeIn(tl, e, t) {
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .35, ease: 'power1.out', immediateRender: true }, t);
    later(tl, e, t + .36);
    return .36;
  }

  /* 放下：从桌面上方一点被放下来，影子从大而淡收到小而实（大件抬得低一点） */
  function setIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = tiltOf(e), big = e.matches('.dsk-book, .dsk-macro, .dsk-laptop');
    const from = { y: big ? -16 : -30, scale: big ? 1.025 : 1.07, rotation: tilt + (big ? .8 : 3), '--dsk-lift': 1 };
    const to = { y: 0, scale: 1, rotation: tilt, '--dsk-lift': 0, duration: big ? .5 : .45, ease: 'power2.out', immediateRender: true };
    vis(from, to, true);
    tl.fromTo(e, from, to, t);
    later(tl, e, t + to.duration + .01);
    return to.duration;
  }
  /* 贴上：纸从上面落下来贴住。便签上沿先粘住，下半截随后拍平；白纸落下后纸胶带从一头按下去 */
  function stickIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = tiltOf(e), note = e.matches('.dsk-note');
    const side = tilt < 0 ? -1 : 1;
    const from = { y: -46, rotation: tilt + side * 4, scale: 1.05, '--dsk-lift': 1 };
    const to = { y: 0, rotation: tilt, scale: 1, '--dsk-lift': 0, duration: .42, ease: 'power3.out', immediateRender: true };
    vis(from, to, true);
    if (note) { from.transformOrigin = '50% 0%'; from.scaleY = .9; to.scaleY = .97; }
    tl.fromTo(e, from, to, t);
    let end = .42;
    if (note) {
      // 下半截拍平：上沿不动，往下压一下再回来
      tl.to(e, { keyframes: [{ scaleY: 1.015, duration: .08, ease: 'power2.out' }, { scaleY: 1, duration: .12, ease: 'power1.inOut' }] }, t + .42);
      end = .62;
    } else {
      tl.fromTo(e, { '--dsk-tp': 0 }, { '--dsk-tp': 1, duration: .22, ease: 'power2.out', immediateRender: true }, t + .34);
      end = .56;
    }
    later(tl, e, t + end + .01);
    return end;
  }
  /* 吐出：标签机在这页上，标签从它右边靠下的出口一格格吐出来（左头贴着出口，从左往右一格格长出来，字按顺序出现），撕下、挪到自己的位置贴好；
     这页没有标签机，就地一格格打出来 */
  function printIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = tiltOf(e);
    const page = e.closest('.slide');
    const maker = page && page.querySelector('.dsk-obj[data-dsk-art="maker"]');
    const n = Math.max(10, Math.min(28, (e.textContent || '').trim().length + 4));
    if (!maker || !maker.offsetWidth) {
      const from = { clipPath: 'inset(-30% 100% -30% -4%)' }, to = { clipPath: 'inset(-30% -4% -30% -4%)', duration: .5, ease: `steps(${n})`, immediateRender: true };
      vis(from, to, true);
      if (tilt) { from.rotation = tilt; to.rotation = tilt; }
      tl.fromTo(e, from, to, t);
      later(tl, e, t + .51);
      return .5;
    }
    const h = e.offsetHeight, p = posIn(e), m = posIn(maker);
    const slot = ART.maker.slot;
    const sx = m.l + maker.offsetWidth * slot[0], sy = m.t + maker.offsetHeight * slot[1];
    const x0 = sx - p.l, y0 = sy - (p.t + h / 2), dp = .5;
    tl.fromTo(e, { autoAlpha: 1, x: x0, y: y0, rotation: 0, '--dsk-lift': .5, clipPath: 'inset(-40% 100% -40% -6%)' },
      { clipPath: 'inset(-40% -6% -40% -6%)', duration: dp, ease: `steps(${n})`, immediateRender: true }, t);
    // 撕下来，挪到自己的位置（这时才歪那一点），按一下贴牢
    tl.to(e, { x: 0, y: 0, rotation: tilt, '--dsk-lift': 0, duration: .4, ease: 'power2.inOut' }, t + dp + .06);
    tl.to(e, { keyframes: [{ scale: .97, duration: .06, ease: 'power2.out' }, { scale: 1, duration: .12, ease: 'power1.out' }] }, t + dp + .46);
    later(tl, e, t + dp + .65);
    return dp + .64;
  }
  /* 打勾：珊瑚红马克笔从左往右一笔勾上，落笔处略微压一下 */
  function tickIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    tl.fromTo(e, { autoAlpha: 1, clipPath: 'inset(-10% 100% -10% -10%)', scale: 1.15 },
      { clipPath: 'inset(-10% -10% -10% -10%)', scale: 1, duration: .3, ease: 'power1.inOut', immediateRender: true }, t);
    later(tl, e, t + .31);
    return .3;
  }
  /* 挂上：工牌从上面落下来，绕挂绳那头（上沿正中往上一点）晃两下停住 */
  function swingIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = tiltOf(e);
    tl.fromTo(e, { autoAlpha: 0, y: -70, rotation: tilt - 9, transformOrigin: '50% -30px', '--dsk-lift': 1 },
      { autoAlpha: 1, y: 0, rotation: tilt + 5, '--dsk-lift': 0, duration: .4, ease: 'power2.in', immediateRender: true }, t);
    tl.to(e, { keyframes: [{ rotation: tilt - 3, duration: .22, ease: 'sine.inOut' }, { rotation: tilt + 1.4, duration: .2, ease: 'sine.inOut' }, { rotation: tilt, duration: .18, ease: 'sine.out' }] }, t + .4);
    later(tl, e, t + 1.01);
    return 1;
  }
  /* 装键帽：键帽落到轴上，咔哒按下去一下再弹回来 */
  function keyIn(tl, e, t) {
    if (e instanceof SVGElement) return fadeIn(tl, e, t);
    const tilt = tiltOf(e);
    tl.fromTo(e, { autoAlpha: 0, y: -36, scale: 1.1, rotation: tilt - 2, '--dsk-lift': 1 },
      { autoAlpha: 1, y: 0, scale: 1, rotation: tilt, '--dsk-lift': 0, duration: .34, ease: 'power2.in', immediateRender: true }, t);
    tl.to(e, { keyframes: [{ y: 7, scale: .985, duration: .07, ease: 'power2.out' }, { y: 0, scale: 1, duration: .18, ease: 'back.out(2.5)' }] }, t + .36);
    later(tl, e, t + .62);
    return .61;
  }
  const FX = { dskset: setIn, dskstick: stickIn, dskprint: printIn, dsktick: tickIn, dskswing: swingIn, dskkey: keyIn };
  const BY = { copy: 'dskprint', 'dsk-label': 'dskprint', 'dsk-tick': 'dsktick', 'dsk-obj': 'dskset', 'dsk-book': 'dskset', 'dsk-macro': 'dskset', 'dsk-laptop': 'dskset',
    'dsk-note': 'dskstick', 'dsk-sheet': 'dskstick', 'dsk-badge': 'dskswing', 'dsk-key': 'dskkey' };
  const isTick = u => !!(u.el.classList && u.el.classList.contains('dsk-tick'));
  const isHeavy = u => !!(u.el.matches && u.el.matches('.dsk-obj, .dsk-book, .dsk-macro, .dsk-laptop'));

  Deck.scene('desk', {
    label: '工位桌面',
    family: 'hand',
    mascot: 'juanjuan',       // 默认形象：卷卷（一卷和纸胶带）
    enter: 'drop',
    // 命令条、标签条：标签机吐出来；工位桌面自有组件各有自己的出场（见文件开头）
    enterBy: BY,
    titleIn: 'fade',
    recede: .8,
    rough: { strokeWidth: 2.2, roughness: 1.3, bowing: 1.2, markWidth: 2.8 },   // 铅笔
    fx: Object.assign({
      // 纸落得更像样页：起点低一点、回弹多一点
      drop: { from: { autoAlpha: 0, y: -50, scale: 1.08, rotation: 4, '--lift': 1 }, to: { autoAlpha: 1, y: 0, scale: 1, rotation: 0, '--lift': 0 }, dur: .55, ease: 'back.out(1.7)' },
    }, FX),
    defs: `<filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
      <filter id="stamp-ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.45" result="holes"/><feComposite in="SourceGraphic" in2="holes" operator="in" result="ink"/><feDisplacementMap in="ink" in2="t" scale="2.5"/></filter>`,
    // 建页时把桌上东西的插画填进去
    decorate(s) { s.querySelectorAll('.dsk-obj[data-dsk-art]').forEach(fillArt); },
    // 同一拍里：先打勾，再放桌上的东西和大件，最后贴纸、吐标签。没有这几样的拍照默认顺序
    plan(units, { base }) {
      const ticks = units.filter(isTick), heavy = units.filter(u => !isTick(u) && isHeavy(u));
      if (!ticks.length && !heavy.length) return undefined;
      const rest = units.filter(u => !isTick(u) && !isHeavy(u));
      const at = new Map();
      let c = base;
      ticks.forEach((u, i) => at.set(u, c + i * .08));
      if (ticks.length) c += .34;
      heavy.forEach((u, i) => at.set(u, c + i * .1));
      if (heavy.length && rest.length) c += .28;
      const s0 = rest.length ? Math.min(...rest.map(u => u.start)) : 0;
      rest.forEach(u => at.set(u, c + u.start - s0));
      return units.map(u => at.get(u));
    },
    // 退一拍：这一拍的纸片被拿起来（往上抬一点再消失）
    onBack() { return { y: -22, dur: .24 }; },
    // 翻页：旧纸往一边推走，新的一张从另一边滑进来
    pageTurn({ tl, from, to, dir, retire, clear }) {
      tl.to(from.el, { x: -160 * dir, rotation: -1.2 * dir, autoAlpha: 0, duration: .45, ease: 'power2.in', onComplete: retire }, 0);
      tl.fromTo(to.el, { x: 200 * dir, rotation: 1.5 * dir, autoAlpha: 0 }, { x: 0, rotation: 0, autoAlpha: 1, duration: .6, ease: 'power3.out', immediateRender: true, onComplete: () => clear(to.el) }, .2);
      return .25;
    },
    // 「已复制」：盖一个印章
    copied({ tl, tip }) {
      tl.fromTo(tip, { autoAlpha: 0, scale: 2.2, rotation: -26 }, { autoAlpha: .92, scale: 1, rotation: -10, duration: .2, ease: 'power3.in' });
    },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
