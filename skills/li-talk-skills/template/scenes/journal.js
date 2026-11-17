/* =====================================================================
   风格 · 像素手账 journal（手绘家）
   - 样子：很淡的点阵纸、墨绿字、琥珀色强调；正文是手写楷体，
     像素感只留给形象的对话框、「已复制」提示框和节拍格（像素小方格，当前一格蹦一下）
   - 适合讲：以角色为主线的章节、讲原理的示意图
   - 出场：字从左往右写出来，同时轻轻落下 8px（不丢掉元素自己的倾斜）；手账自有组件各有自己的出场（见下面）
   - 翻页：用引擎默认的整页横移，像翻手账
   - 复制：页上有形象时形象蹦一下喊「已复制！」，命令框变绿，不再放提示框；没有形象才放像素提示框
   - 禁区（zones，舞台坐标 1920×1080）：
     · 左上角主题行（engine.css 的 .s-topic：x 120 起，宽到 1260，y 18–78）
     · 右上角页码和像素节拍格（engine.css 的 .meta：右边距 64、y 40–80；按每页最多 4 拍量，留出余量后是 x 1340–1856、y 30–90）
   - 大标题是 72px，比别的风格大一号，第 0 拍的解释句跟着往下让到 y 200
   - 手账自有的版式组件（类名带 jn- 前缀，样子在 journal.css 末尾，样板页见 samples/journal.js；别的风格不认识，只是普通容器）。
     「每一拍发生了什么」按手账本的习惯来：贴纸从贴纸页上揭下来贴到本子上、纸胶带撕一截压住、印章「咚」地盖下去、
     打勾、拿彩笔一格一格涂满记录格。这些动作都做在组件里（enterBy 按类名配好），页面只写结构和 data-beat，不写 onBeat、不写 data-in：
     · .jn-art[data-jn-art="名字"]：手绘小图（墨线 + 错开一点的彩色涂色），建页时填进去。内置 gaiwan 盖碗、leaf 茶叶、kettle 水壶、
       cup 冒热气的茶杯、heart 爱心、star 星星。宽度写在 style 的 width 里（默认 160），高度按 160×140 的比例自己算。图里不放字
     · .jn-sticker：模切贴纸（一圈白边、淡色底、软影子），里面放一个 .jn-art 和一行手写标签 <b>。颜色类 t-yellow / t-mint / t-blue / t-pink 换底色；
       倾斜写 --r（±2° 以内，里面有字）。出场「揭下来贴上」：写了 data-jn-from="名字" 的，从同一页 .jn-slot[data-jn-slot="名字"] 的位置
       揭起、飞过来、按平；没写的从上面落下、按平。贴纸里的 .jn-tape 等贴纸按平后再撕一截贴上
     · .jn-sheet > .jn-slot[data-jn-slot]：贴纸页（一张带模切线的贴纸底纸）。建页时自动把揭它的那张贴纸复制一份放进格子里，
       贴纸到拍时格子里那张就揭走了，只剩模切线和底纸。格子的大小写成和贴纸一样
     · .jn-tape：纸胶带（两头撕口）。颜色类 jn-amber（琥珀斜条，默认）/ jn-mint（薄荷圆点）/ jn-pink（粉格子）；
       宽高写在 style 里，倾斜写 --r（胶带不是字，角度随意）。出场「撕一截贴上」：从一头往另一头压出来。只压在纸角上，不压字
     · .jn-stamp[data-jn-icon="名字"]：圆形印章（双圈 + 图标，朱红印泥，带一点漏墨的斑驳）。内置 cup、leaf、kettle、heart、check；
       大小写 --s（默认 180px），倾斜写 --r。出场「盖章」：从上面砸下来、压一下、弹回，落下那一下印泥往外洇一圈
     · .jn-tick（绿色的勾）、.jn-cross（红色的叉）：手写的勾叉（内联 svg，建页时填进去）。单独带拍时一笔画出来；
       放在 .jn-card 里的勾等卡片落定后再打。.jn-arw 是随手画的箭头（朝左，加 .jn-down 朝下），大小跟着字号走
     · .jn-no：手画圈里的编号（1、2、3）；.jn-spot：一圈虚线（印章将要盖下去的地方）；.jn-dots：一道点线（菜单那种引线，连起左右两块）
     · .jn-pocket[data-jn-pocket="名字"] + .jn-card[data-jn-from="名字"]：牛皮纸口袋和从里面抽出来的索引卡。
       口袋只写一块（口袋背面建页时自动补在它后面）；卡片写在它落定的位置。出场「抽卡」：卡片从口袋里往上抽出来，
       再移到自己的位置、转到自己的角度，最后卡片里的 .jn-tick 打上勾
     · .jn-meter[data-jn-n="格数"][data-jn-cell="tube|leaf|box"] > .jn-ink[data-jn-k="涂几格"]：手账的涂色记录格。
       .jn-meter 第 0 拍就在（一排空格子），.jn-ink 写 data-beat：到拍时拿彩笔一格一格涂过去。
       tube 是横放的温度计（左边一个球、一节一节的管子），leaf 是一排叶子，box 是一排方格
     · .jn-clock > .jn-ink：一只秒表（顶上一个按钮、一圈 12 道刻度，指针建页时补上），到拍时一格一格涂满一圈（一圈 = 一分钟这类）
     · .jn-say：像素对话框（形象说的话，和形象头上的气泡同一种像素框；尾巴默认朝左下，加 .jn-r 朝右下）。出场一格格弹出
     · .jn-book + .jn-band + .jn-label：手账本的封面（牛皮纸面、左边书脊、右边一根松紧带）和贴在上面的标签纸（双线框、切角）
     · .jn-memo：从线圈本上撕下来的一页便签（顶上一排穿孔、一圈虚线内框，结尾放金句）
   - 可读性约定（形态丰富，但翻到最后一拍整页要读得清）：
     · 讲过的不藏：贴纸、卡片、印章、涂好的格子讲完都留在页上；贴纸页上揭走的只是复制品，真的贴纸就在本子上
     · .jn-say 只放形象的一句话（旁白、致谢），要点写在本子上
     · 句子一律横排；有字的贴纸、卡片倾斜不超过 2°；胶带、印章只压在纸角和空白处，不压字
     · 讲过的只退到 .8（recede），组件里不另加透明度；印章、勾叉、胶带、涂色都是实色或够深的颜色
     · 一页的强调（荧光带、圈）不超过 3 处：印章、勾叉是动作的结果，不算强调，但也别一页盖满
   - 自己加的出场名：jnstick、jnpull、jntape、jnstamp、jntick、jnfill、jnsay、jndoodle，只在这个风格里认
     （别的风格会提醒并换成它的默认出场）；页面里不写，由类名自动选
   - 样子在 journal.css 里
   ===================================================================== */
(function () {
  'use strict';
  const G = () => window.gsap;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* 出场留下的行内样式：清掉以后回到 CSS 决定的「贴好了」的样子（跳拍时补间自己的 clearProps 不生效，一律直接删） */
  const PROPS = ['opacity', 'visibility', 'transform', 'transform-origin', 'translate', 'rotate', 'scale', 'clip-path', '--jn-lift', '--jn-p'];
  const clean = e => { if (e && e.style) PROPS.forEach(k => e.style.removeProperty(k)); };
  const cleanStroke = s => ['stroke-dasharray', 'stroke-dashoffset', 'opacity'].forEach(k => s.style.removeProperty(k));
  /* 元素自己的倾斜角（--r 写进 CSS 的 rotate）：gsap 动画时会把 rotate 写成 none，倾斜要并进 gsap 的 rotation */
  const tiltOf = e => {
    if (!e || e instanceof SVGElement) return 0;
    e.style.removeProperty('rotate');
    const v = getComputedStyle(e).rotate;
    return v && v !== 'none' ? parseFloat(v) || 0 : 0;
  };
  /* 元素在页面里的框（舞台坐标，沿 offsetParent 累加：不受缩放、翻页动画影响） */
  function boxIn(node, slide) {
    let l = 0, t = 0, n = node;
    while (n && n !== slide) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    return { l, t, w: node.offsetWidth || 0, h: node.offsetHeight || 0 };
  }
  const esc = s => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"'));

  /* =================================================================
     手绘小图 .jn-art：墨线 + 错开一点的彩色涂色（像手账里随手画、再拿彩笔涂一下），画布 160×140
     c1 琥珀、c2 薄荷、c3 粉、c4 淡蓝、c5 朱红（颜色在 journal.css）；ln 是墨线，tn 是细墨线
     ================================================================= */
  const fillG = s => `<g class="jn-fl" transform="translate(6 5)">${s}</g>`;
  const ART = {
    // 盖碗：拱起的盖子、碗、碗托，碗上一道花纹
    gaiwan: fillG('<path class="c4" d="M34 68 Q36 110 80 112 Q124 110 126 68 Z"/><path class="c4" d="M40 64 Q46 34 80 32 Q114 34 120 64 Z"/>')
      + '<g class="ln"><path d="M38 64 Q44 30 80 28 Q116 30 122 64 Z"/><path d="M70 28 L72 19 H88 L90 28"/><ellipse cx="80" cy="16" rx="11" ry="4"/>'
      + '<path d="M28 68 H132"/><path d="M32 68 Q34 110 80 112 Q126 110 128 68"/><path d="M62 112 L60 122 H100 L98 112"/><path d="M18 127 Q80 139 142 127"/></g>'
      + '<path class="tn" d="M46 86 Q80 96 114 86"/>',
    // 茶叶：两大一小三片叶子，带叶脉
    leaf: fillG('<path class="c2" d="M20 96 C36 56 84 44 118 54 C102 94 54 110 20 96 Z"/><path class="c2" d="M70 120 C80 96 116 88 140 96 C128 120 94 130 70 120 Z"/><path class="c2" d="M96 32 C104 18 122 14 134 18 C128 32 110 38 96 32 Z"/>')
      + '<g class="ln"><path d="M20 96 C36 56 84 44 118 54 C102 94 54 110 20 96 Z"/><path d="M70 120 C80 96 116 88 140 96 C128 120 94 130 70 120 Z"/><path d="M96 32 C104 18 122 14 134 18 C128 32 110 38 96 32 Z"/></g>'
      + '<path class="tn" d="M26 94 Q70 78 112 57"/><path class="tn" d="M76 118 Q106 104 134 98"/>',
    // 水壶：壶身、提梁、壶嘴朝左，嘴上一缕热气
    kettle: fillG('<path class="c1" d="M44 124 C38 84 52 60 82 60 C112 60 126 84 120 124 Z"/>')
      + '<g class="ln"><path d="M44 124 C38 84 52 60 82 60 C112 60 126 84 120 124 Z"/><path d="M64 62 C66 50 98 50 100 62"/><circle cx="82" cy="45" r="5"/>'
      + '<path d="M58 60 C54 24 110 24 106 60"/><path d="M48 96 C34 92 26 78 18 66 L26 60 C32 74 40 84 50 86"/><path d="M38 125 H126"/></g>'
      + '<path class="tn" d="M18 50 q-7 -9 0 -18 q7 -9 0 -18"/>',
    // 茶杯：杯身、把手、杯托，上面三缕热气
    cup: fillG('<path class="c3" d="M40 66 H120 L112 112 Q108 122 96 122 H64 Q52 122 48 112 Z"/>')
      + '<g class="ln"><path d="M38 66 H122 L114 112 Q110 124 96 124 H64 Q50 124 46 112 Z"/><path d="M120 78 C144 76 144 106 113 106"/><path d="M22 131 Q80 141 138 131"/></g>'
      + '<path class="tn" d="M62 52 q-8 -10 0 -20 q8 -10 0 -20"/><path class="tn" d="M82 54 q-8 -10 0 -20 q8 -10 0 -20 q-8 -8 0 -14"/><path class="tn" d="M102 52 q-8 -10 0 -20 q8 -10 0 -20"/>',
    // 爱心、星星：点缀
    heart: fillG('<path class="c3" d="M80 124 C40 96 22 74 30 52 C38 32 66 32 80 54 C94 32 122 32 130 52 C138 74 120 96 80 124 Z"/>')
      + '<path class="ln" d="M80 124 C40 96 22 74 30 52 C38 32 66 32 80 54 C94 32 122 32 130 52 C138 74 120 96 80 124 Z"/>',
    star: fillG('<path class="c1" d="M80 14 L95 54 L136 56 L103 81 L115 122 L80 98 L45 122 L57 81 L24 56 L65 54 Z"/>')
      + '<path class="ln" d="M80 14 L95 54 L136 56 L103 81 L115 122 L80 98 L45 122 L57 81 L24 56 L65 54 Z"/>',
  };
  /* 印章里的图标（画布 100×100，中心 50,50；印泥颜色跟着 currentColor） */
  const STAMP = {
    cup: '<path d="M30 42 H70 L66 64 Q64 71 57 71 H43 Q36 71 34 64 Z"/><path d="M69 48 C80 48 80 62 66 62"/><path d="M42 34 q-4 -5 0 -10 M52 34 q-4 -5 0 -10 M62 34 q-4 -5 0 -10"/><path d="M28 76 H72"/>',
    leaf: '<path d="M26 68 C32 42 56 30 76 32 C70 58 48 72 26 68 Z"/><path d="M30 66 Q52 54 72 36"/>',
    kettle: '<path d="M32 72 C29 52 37 42 52 42 C67 42 75 52 72 72 Z"/><path d="M42 42 C40 26 64 26 62 42"/><path d="M34 60 C26 58 22 50 18 44"/><path d="M28 74 H76"/>',
    heart: '<path d="M50 74 C30 60 22 48 26 38 C30 28 44 28 50 40 C56 28 70 28 74 38 C78 48 70 60 50 74 Z"/>',
    check: '<path d="M28 52 L44 66 L74 34"/>',
  };
  const TICK = '<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><path d="M9 33 C14 37 19 42 24 47 C32 34 41 22 52 11"/></svg>';
  const CROSS = '<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><path d="M14 13 C24 24 35 35 47 47"/><path d="M47 14 C36 24 25 35 13 47"/></svg>';
  // 随手画的箭头（朝左；加 .jn-down 转成朝下）
  const ARW = '<svg viewBox="0 0 70 40" aria-hidden="true" focusable="false"><path d="M66 22 C50 26 32 23 9 20"/><path d="M21 8 L8 20 L22 31"/></svg>';

  function fillArt(el) {
    const name = el.dataset.jnArt, s = ART[name];
    if (!s) { console.warn(`[Deck] 手账小图 data-jn-art="${name}" 不认识，可选：${Object.keys(ART).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 160 140" focusable="false">${s}</svg>`;
  }
  function fillStamp(el) {
    const name = el.dataset.jnIcon || 'check', s = STAMP[name];
    if (!s) { console.warn(`[Deck] 手账印章 data-jn-icon="${name}" 不认识，可选：${Object.keys(STAMP).join('、')}`); return; }
    el.setAttribute('aria-hidden', 'true');
    // 外圈粗、内圈细，上下各一颗小星；整枚套 jn-ink 滤镜（漏墨的斑驳）
    el.innerHTML = '<svg viewBox="0 0 100 100" focusable="false"><g filter="url(#jn-ink)">'
      + '<circle cx="50" cy="50" r="45" class="o"/><circle cx="50" cy="50" r="38.5" class="i"/>'
      + '<path class="s" d="M50 8.5 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 Z"/>'
      + `<g class="g">${s}</g></g></svg>`;
  }

  /* 建页时补全：小图、印章、勾叉、记录格的格子、贴纸页里的复制品、口袋背面 */
  function decorate(slide) {
    slide.querySelectorAll('.jn-art[data-jn-art]').forEach(fillArt);
    slide.querySelectorAll('.jn-stamp').forEach(fillStamp);
    slide.querySelectorAll('.jn-tick').forEach(e => { if (!e.querySelector('svg')) e.innerHTML = TICK; e.setAttribute('aria-hidden', 'true'); });
    slide.querySelectorAll('.jn-cross').forEach(e => { if (!e.querySelector('svg')) e.innerHTML = CROSS; e.setAttribute('aria-hidden', 'true'); });
    slide.querySelectorAll('.jn-arw').forEach(e => { if (!e.querySelector('svg')) e.innerHTML = ARW; e.setAttribute('aria-hidden', 'true'); });
    // 记录格：空格子 n 个铺在底下，彩笔涂的那层放 k 个（同样的格子大小和间距，叠在左边对齐）
    slide.querySelectorAll('.jn-meter').forEach(m => {
      if (m.querySelector(':scope > .jn-cells')) return;
      const n = clamp(parseInt(m.dataset.jnN, 10) || 10, 1, 24);
      m.insertAdjacentHTML('afterbegin', `<span class="jn-cells" aria-hidden="true">${'<s></s>'.repeat(n)}</span>`);
      m.querySelectorAll(':scope > .jn-ink').forEach(ink => {
        const k = clamp(parseInt(ink.dataset.jnK, 10) || n, 1, n);
        ink.setAttribute('aria-hidden', 'true');
        ink.innerHTML = '<s></s>'.repeat(k);
      });
    });
    // 钟面：补一根指着 12 点的指针（压在涂色上面）
    slide.querySelectorAll('.jn-clock').forEach(c => { if (!c.querySelector(':scope > .jn-hand')) c.insertAdjacentHTML('beforeend', '<b class="jn-hand" aria-hidden="true"></b>'); });
    // 贴纸页：揭它的那张贴纸复制一份放进格子里（去掉拍号、形象、重点词、胶带，只留样子），到拍时格子里这张藏起来
    slide.querySelectorAll('.jn-sticker[data-jn-from]').forEach(st => {
      const slot = slide.querySelector(`.jn-slot[data-jn-slot="${esc(st.dataset.jnFrom)}"]`);
      if (!slot || slot.querySelector('.jn-ghost')) return;
      const g = st.cloneNode(true);
      g.querySelectorAll('.jn-tape, .mascot').forEach(x => x.remove());
      [g, ...g.querySelectorAll('*')].forEach(x => {
        [...x.attributes].forEach(a => { if (/^data-(beat|mascot|delay|in|jn-from|transient|mark)/.test(a.name) || a.name === 'style') x.removeAttribute(a.name); });
        if (x.classList.contains('key')) x.classList.remove('key');
      });
      g.classList.remove('abs');
      g.classList.add('jn-ghost');
      g.setAttribute('aria-hidden', 'true');
      slot.dataset.jnPeel = st.dataset.beat || '1';
      slot.appendChild(g);
    });
    // 口袋：背面（深一点的牛皮纸，比正面高出一截）补在页面最底下，卡片抽出来时夹在背面和正面之间
    slide.querySelectorAll('.jn-pocket').forEach(pk => {
      if (pk.previousElementSibling && pk.previousElementSibling.classList.contains('jn-pocket-back')) return;
      const back = document.createElement('i');
      back.className = 'jn-pocket-back';
      back.setAttribute('aria-hidden', 'true');
      ['left', 'top', 'width', 'height'].forEach(k => { if (pk.style[k]) back.style[k] = pk.style[k]; });
      const rl = slide.querySelector(':scope > .ripple-layer');
      if (rl) rl.after(back); else slide.prepend(back);
    });
  }

  /* =================================================================
     出场
     ================================================================= */
  /* 纸胶带：从一头往另一头压出来（只动 clip-path，不碰胶带自己的倾斜） */
  const TAPE0 = 'inset(-40% 101% -40% -4%)', TAPE1 = 'inset(-40% -4% -40% -4%)';
  function tapeIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 1, clipPath: TAPE0 }, { clipPath: TAPE1, duration: .24, ease: 'power2.out', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    tl.call(done, null, t + .25);
    return .24;
  }
  /* 一笔画出 svg 里的线（勾、叉、小图的墨线）：按长度分时间 */
  function strokeIn(tl, root, t, D, immediate) {
    const ps = [...root.querySelectorAll('path, circle, ellipse, line, polyline')].filter(s => { const cs = getComputedStyle(s); return cs.stroke && cs.stroke !== 'none'; });
    const lens = ps.map(s => { try { return Math.ceil(s.getTotalLength()) + 2; } catch (e) { return 0; } });
    const total = lens.reduce((a, v) => a + v, 0) || 1;
    let c = t;
    ps.forEach((s, i) => {
      const L = lens[i]; if (!L) return;
      const d = D * L / total, done = () => cleanStroke(s);
      tl.fromTo(s, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', immediateRender: immediate !== false, onComplete: done, onInterrupt: done }, c);
      c += d;
    });
    if (ps.length) tl.call(() => ps.forEach(cleanStroke), null, t + D + .01);
    return ps.length ? D : 0;
  }
  /* 没到时候先藏好 svg 里的线（卡片里的勾：卡片落定后才打） */
  function strokeHide(root) {
    root.querySelectorAll('path, circle, ellipse, line, polyline').forEach(s => {
      let L = 0;
      try { L = Math.ceil(s.getTotalLength()) + 2; } catch (e) { L = 0; }
      if (L) { s.style.strokeDasharray = L + ' ' + L; s.style.strokeDashoffset = L; }
    });
  }

  /* 贴纸：揭起（略放大、影子变大、转一点）→ 沿一道弧飞到自己的位置、转到自己的角度 → 按平（压一下、影子收小）→ 撕胶带压住一角。
     有 data-jn-from 的从贴纸页上那一格起飞；没有的从上面落下来 */
  function stickIn(tl, e, t, ctx) {
    const slide = e.closest('.slide');
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    const tapes = [...e.querySelectorAll(':scope > .jn-tape')];
    const src = slide && e.dataset.jnFrom ? slide.querySelector(`.jn-slot[data-jn-slot="${esc(e.dataset.jnFrom)}"]`) : null;
    let dx = 0, dy = -90, r0 = tilt - 6, T1 = .08, T2 = .3;
    if (src) {
      const a = boxIn(src, slide), b = boxIn(e, slide);
      dx = a.l + a.w / 2 - (b.l + b.w / 2); dy = a.t + a.h / 2 - (b.t + b.h / 2); r0 = 0; T1 = .14; T2 = .42;
    }
    const done = () => clean(e);
    tapes.forEach(tp => tl.fromTo(tp, { autoAlpha: 1, clipPath: TAPE0 }, { clipPath: TAPE0, duration: .01, immediateRender: true }, t));
    tl.fromTo(e, { autoAlpha: 1, x: dx, y: dy, rotation: r0, scale: 1, '--jn-lift': src ? 0 : 1, transformOrigin: '50% 50%' },
      { scale: 1.07, rotation: r0 - 3, '--jn-lift': 1, duration: T1, ease: 'power2.out', immediateRender: true }, t);
    tl.to(e, { x: 0, rotation: tilt, duration: T2, ease: 'power2.inOut' }, t + T1);
    tl.to(e, { y: Math.min(dy, 0) / 2 - (src ? 50 : 0), duration: T2 / 2, ease: 'power1.out' }, t + T1);
    tl.to(e, { y: 0, duration: T2 / 2, ease: 'power1.in' }, t + T1 + T2 / 2);
    const tm = t + T1 + T2;
    tl.to(e, { scale: .97, '--jn-lift': 0, duration: .07, ease: 'power2.in' }, tm);
    tl.to(e, { scale: 1, duration: .16, ease: 'back.out(3)', onComplete: done, onInterrupt: done }, tm + .07);
    tl.call(done, null, tm + .24);
    let end = tm + .24 - t;
    tapes.forEach((tp, i) => { const s = tm + .06 + i * .1; end = Math.max(end, s + tapeIn(tl, tp, s) - t); });
    return end;
  }

  /* 索引卡从口袋里抽出来：卡片从口袋里往上抽（超出口袋底边的部分裁掉，口袋正面压在卡片上面）→ 移到自己的位置、
     转到自己的角度 → 卡片里的勾打上。没找到口袋时从上面落下来 */
  function pullIn(tl, e, t, ctx) {
    const slide = e.closest('.slide');
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    const pk = slide && e.dataset.jnFrom ? slide.querySelector(`.jn-pocket[data-jn-pocket="${esc(e.dataset.jnFrom)}"]`) : null;
    const ticks = [...e.querySelectorAll('.jn-tick')];
    const done = () => clean(e);
    ticks.forEach(strokeHide);
    let mv = t;
    if (pk) {
      const a = boxIn(pk, slide), b = boxIn(e, slide);
      const dx = a.l + a.w / 2 - (b.l + b.w / 2);
      const y0 = a.t + 28 - b.t;                 // 起点：卡片顶边在口袋口下面一点（整张藏在口袋里）
      const y1 = a.t - 24 - (b.t + b.h);         // 抽出来：卡片底边升到口袋口上面
      const C = b.t + b.h - (a.t + a.h);         // 卡片底边比口袋底边低多少（加上 y），超出的部分裁掉
      tl.fromTo(e, { autoAlpha: 1, x: dx, y: y0, rotation: 0, scale: .96, clipPath: `inset(-40px -40px ${C + y0}px -40px)` },
        { y: y1, clipPath: `inset(-40px -40px ${C + y1}px -40px)`, duration: .34, ease: 'power2.out', immediateRender: true }, t);
      tl.to(e, { x: 0, y: 0, rotation: tilt, scale: 1, duration: .36, ease: 'power2.inOut', onComplete: done, onInterrupt: done }, t + .34);
      mv = t + .7;
    } else {
      tl.fromTo(e, { autoAlpha: 0, y: -60, rotation: tilt - 4 }, { autoAlpha: 1, y: 0, rotation: tilt, duration: .4, ease: 'back.out(1.6)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
      mv = t + .4;
    }
    tl.call(done, null, mv + .01);
    let end = mv - t;
    ticks.forEach((tk, i) => { const s = mv + .04 + i * .12; end = Math.max(end, s + strokeIn(tl, tk, s, .26, false) - t); });
    if (!ticks.length) end += .02;
    return end;
  }

  /* 印章：从上面砸下来（大、歪、半透明 → 原大、落正）→ 压一下再弹回；落下那一下印泥往外洇一圈（临时的一圈，播完拿走） */
  function thud(e) {
    const g = G();
    if (!g || !e.isConnected) return;
    const r = document.createElement('i');
    r.className = 'jn-thud';
    r.setAttribute('aria-hidden', 'true');
    e.appendChild(r);
    g.fromTo(r, { scale: .9, opacity: .55 }, { scale: 1.32, opacity: 0, duration: .34, ease: 'power2.out', onComplete: () => r.remove(), onInterrupt: () => r.remove() });
  }
  function stampIn(tl, e, t, ctx) {
    const tilt = ctx && ctx.tilt ? ctx.tilt() : tiltOf(e);
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 0, scale: 1.7, rotation: tilt - 16, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: .9, rotation: tilt, duration: .2, ease: 'power3.in', immediateRender: true }, t);
    tl.call(() => thud(e), null, t + .2);
    tl.to(e, { scale: 1, duration: .18, ease: 'back.out(2.6)', onComplete: done, onInterrupt: done }, t + .2);
    tl.call(done, null, t + .39);
    return .38;
  }

  /* 涂色：彩笔一格一格涂过去（.jn-ink 按格数分步露出来）；钟面那种一圈一格涂满 */
  function fillIn(tl, e, t) {
    const done = () => clean(e);
    if (e.parentElement && e.parentElement.classList.contains('jn-clock')) {
      tl.fromTo(e, { autoAlpha: 1, '--jn-p': 0 }, { '--jn-p': 1, duration: .72, ease: 'steps(12)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
      tl.call(done, null, t + .73);
      return .72;
    }
    const k = Math.max(1, e.children.length), d = clamp(k * .08, .24, .72);
    tl.fromTo(e, { autoAlpha: 1, clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)', duration: d, ease: `steps(${k})`, immediateRender: true, onComplete: done, onInterrupt: done }, t);
    tl.call(done, null, t + d + .01);
    return d;
  }

  /* 小图：墨线一笔笔描出来，涂色随后铺上 */
  function doodleIn(tl, e, t) {
    const svg = e.querySelector('svg');
    if (!svg) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, immediateRender: true, onComplete: () => clean(e) }, t); return .3; }
    const fl = svg.querySelector('.jn-fl');
    tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true }, t);
    const d = strokeIn(tl, svg, t, .55);
    if (fl) tl.fromTo(fl, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power1.out', immediateRender: true, onComplete: () => fl.style.removeProperty('opacity') }, t + d * .7);
    tl.call(() => { clean(e); if (fl) fl.style.removeProperty('opacity'); }, null, t + d + .3);
    return d + .25;
  }

  /* 像素对话框：一格格弹出（三步，不平滑） */
  function sayIn(tl, e, t) {
    const done = () => clean(e);
    tl.fromTo(e, { autoAlpha: 1, scale: .3, transformOrigin: e.classList.contains('jn-r') ? '100% 100%' : '0% 100%' },
      { scale: 1, duration: .24, ease: 'steps(3)', immediateRender: true, onComplete: done, onInterrupt: done }, t);
    tl.call(done, null, t + .25);
    return .24;
  }

  const FX = {
    // 写字：从左往右露出来，同时从下面 8px 落到位
    write(tl, e, t, ctx) {
      const from = { autoAlpha: 1, clipPath: 'inset(-30% 100% -30% -6%)' };
      const to = { clipPath: 'inset(-30% -6% -30% -6%)', duration: ctx.dur, ease: ctx.ease, immediateRender: true, onComplete: ctx.done };
      if (!(e instanceof SVGElement)) {
        const tilt = ctx.tilt();
        from.y = 8; to.y = 0;
        if (tilt) { from.rotation = tilt; to.rotation = tilt; }
      }
      tl.fromTo(e, from, to, t);
      return ctx.dur;
    },
    jnstick(tl, e, t, ctx) { return e instanceof SVGElement ? 0 : stickIn(tl, e, t, ctx); },
    jnpull(tl, e, t, ctx) { return e instanceof SVGElement ? 0 : pullIn(tl, e, t, ctx); },
    jntape(tl, e, t) { return e instanceof SVGElement ? 0 : tapeIn(tl, e, t); },
    jnstamp(tl, e, t, ctx) { return e instanceof SVGElement ? 0 : stampIn(tl, e, t, ctx); },
    jntick(tl, e, t) {
      if (e instanceof SVGElement) return 0;
      tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01, immediateRender: true, onComplete: () => clean(e) }, t);
      return strokeIn(tl, e, t, .26) || .01;
    },
    jnfill(tl, e, t) { return e instanceof SVGElement ? 0 : fillIn(tl, e, t); },
    jnsay(tl, e, t) { return e instanceof SVGElement ? 0 : sayIn(tl, e, t); },
    jndoodle(tl, e, t) { return e instanceof SVGElement ? 0 : doodleIn(tl, e, t); },
  };

  Deck.scene('journal', {
    label: '像素手账',
    family: 'hand',
    mascot: 'diandian',       // 默认形象：点点（像素墨水瓶）
    enter: 'write',
    // 手账自有组件按类名配好出场（见文件开头）
    enterBy: { 'jn-sticker': 'jnstick', 'jn-card': 'jnpull', 'jn-tape': 'jntape', 'jn-stamp': 'jnstamp', 'jn-tick': 'jntick', 'jn-cross': 'jntick',
      'jn-ink': 'jnfill', 'jn-say': 'jnsay', 'jn-art': 'jndoodle' },
    titleIn: 'write',
    recede: .8,
    ease: { write: 'power2.out' },
    rough: { strokeWidth: 2.4, roughness: 1.1, bowing: .8, hachureGap: 13, hachureAngle: -38, fillWeight: 3, markWidth: 3 },   // 细墨线，填充线疏一点
    fx: FX,
    // 印章的印泥：斑驳一点（一些地方没沾上墨），边缘轻轻抖一下
    defs: '<filter id="jn-ink" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">'
      + '<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="9" result="n"/>'
      + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.05" result="m"/>'
      + '<feComposite in="SourceGraphic" in2="m" operator="in" result="s"/>'
      + '<feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="1" seed="4" result="w"/>'
      + '<feDisplacementMap in="s" in2="w" scale="2.2"/></filter>',
    decorate,
    // 退一拍：像把贴上去的东西撕下来——贴纸、卡片、印章先翘起一点（转几度、放大一点）再淡掉
    onBack({ tl, units }) {
      const lifted = [];
      units.forEach(u => {
        const e = u.el;
        if (e instanceof SVGElement || !e.matches('.jn-sticker, .jn-card, .jn-stamp')) return;
        tl.to(e, { rotation: '+=5', scale: 1.04, duration: .14, ease: 'power1.out' }, 0);
        lifted.push(e);
      });
      if (lifted.length) tl.call(() => lifted.forEach(e => { clean(e); const g = G(); if (g) g.set(e, { clearProps: 'transform' }); }), null, .34);
      return { at: .05, gap: .03, y: -12, dur: .22 };
    },
    // 「已复制」提示框像素式地一格格弹出
    copied({ tl, tip }) {
      tl.fromTo(tip, { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, duration: .22, ease: 'steps(3)' });
    },
    mascotSay: { copied: '已复制！' },
    zones: [
      { x: 120, y: 18, w: 1260, h: 60, name: '主题行' },
      { x: 1340, y: 30, w: 516, h: 60, name: '页码和节拍格' },
    ],
  });
})();
