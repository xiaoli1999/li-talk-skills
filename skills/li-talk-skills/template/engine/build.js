/* =====================================================================
   演示稿引擎 · 构建（build.js）
   - 搭外壳 buildShell：#app、#world、每个注册风格一层背景（建好后调风格的 backdrop）、#stage、#slides、
     外框（章节、页码、节拍格、计时）、提示条、看大图层、各风格和各形象 defs 里的 SVG 滤镜、
     各风格 recede 对应的 --recede、深色底风格的署名颜色 --sign-color、
     当前形象的大小（--mascot-w、--mascot-k、--mascot-foot）；建好的元素填进 I.dom
   - 建页面 buildPage：选风格 pickScene（地址 ?scene= 优先；没注册的退回朴素样子 plain），
     把 Deck.add 注册的定义建成 section.slide（最前面放一层点击涟漪层 .ripple-layer），再依次 upgrade（补全组件标记、手绘线）
     → collect（节拍单元、重点词、圈注、形象的落脚点、拍数）→ normalizeNotes（讲词）→ 风格的 decorate
     → 最后一页加署名 addSign（位置由 ui.js 的 placeSign 在字体加载完后定）
   - 演讲者视图要用的 autoShow、keysOf；位置换算 boxIn
   - 依赖总线：core 的常量和工具、风格注册表（I.SCENES、I.sc、I.roughOf、I.hook、I.sceneList）、I.dom、I.state；
     形象注册表 I.MASCOTS；mascot.js 的 I.mascotDef、I.mascotEl、I.initMascotEl、I.bindMascot、I.warnMascotOnce
     （调用时才取，所以引入顺序在它前面也没关系）
   - 挂到总线：buildShell、buildPage、addSign、boxIn、autoShow、keysOf
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, SHOW_NOTES, R, $, $$, esc, warn, toInt, el } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     外壳
     ================================================================= */
  function buildShell() {
    document.body.classList.add('loading');
    const app = el('div'); app.id = 'app';
    dom.world = el('div'); dom.world.id = 'world';
    const scenes = Object.values(I.SCENES);
    // 每个注册的风格一层背景（叠放，当前的一层在上）；风格要往背景里放东西就写 backdrop(layer)
    scenes.forEach(s => { const b = el('div', 'bg'); b.dataset.scene = s.key; dom.bg[s.key] = b; dom.world.appendChild(b); I.hook(s, 'backdrop', b); });
    dom.stage = el('div'); dom.stage.id = 'stage';
    dom.slidesBox = el('div'); dom.slidesBox.id = 'slides';
    dom.slidesBox.appendChild(el('div', 'r-top', `<b>${esc(document.title)}</b>竖屏阅读模式：每页的内容都已展开。横过来看就是演示模式。`));
    const chrome = el('div', 'chrome', `<div class="chap"></div><div class="meta"><div class="pageno"></div><div class="meter"><span class="dots"></span><span class="mnum"></span></div></div><div class="timer"></div>`);
    dom.stage.append(dom.slidesBox, chrome);
    dom.world.appendChild(dom.stage);
    app.appendChild(dom.world);
    document.body.prepend(app);
    dom.chap = $('.chap', chrome); dom.meter = $('.meter', chrome); dom.dotsBox = $('.dots', chrome); dom.mnum = $('.mnum', chrome); dom.pageno = $('.pageno', chrome); dom.timerEl = $('.timer', chrome);
    dom.toastEl = el('div'); dom.toastEl.id = 'toast'; document.body.appendChild(dom.toastEl);
    dom.lb = el('div', '', `<div class="lb-scroll"><img alt=""></div><button class="lb-close" type="button" aria-label="关闭">×</button><div class="lb-cap"></div>`);
    dom.lb.id = 'lightbox'; dom.lb.hidden = true; document.body.appendChild(dom.lb);
    // 各风格、各形象需要的 SVG 滤镜（它们的 defs）放进同一个隐藏的 svg；id 由各自加前缀，免得撞上
    const defs = scenes.map(s => s.defs || '').concat(Object.values(I.MASCOTS).map(m => m.defs || '')).filter(Boolean);
    document.body.insertAdjacentHTML('beforeend', `<svg class="deck-defs" aria-hidden="true"><defs>${defs.join('\n')}</defs></svg>`);
    // 各风格「讲过的拍变到多淡」（风格的 recede）写成 --recede；用 :where 不加优先级，页面 CSS 还能改
    const rc = scenes.filter(s => typeof s.recede === 'number').map(s => `:where([data-scene="${s.key}"]){--recede:${s.recede}}`);
    // 深色底的风格（dark: true）：署名默认改用浅色；风格的 CSS 里写了 --sign-color 就以风格的为准
    scenes.filter(s => s.dark).forEach(s => rc.push(`:where([data-scene="${s.key}"]){--sign-color:rgba(255,255,255,.55)}`));
    // 当前形象的大小：size 的宽写成 --mascot-w、高宽比写成 --mascot-k，foot 写成 --mascot-foot（落地压扁的原点）
    const md = I.mascotDef();
    if (md) rc.push(`:root{--mascot-w:${md.size[0]}px;--mascot-k:${+(md.size[1] / md.size[0]).toFixed(4)};--mascot-foot:${+(md.foot * 100).toFixed(1)}%}`);
    if (rc.length) { const st = el('style', 'deck-scene-vars', rc.join('\n')); document.head.appendChild(st); }
  }

  /* =================================================================
     构建页面
     ================================================================= */
  /* 这一页用哪个风格：地址 ?scene= 指定的优先；页面写的风格没注册（或没写）就提醒，退回朴素样子 plain */
  function pickScene(d) {
    let key = d.scene == null ? '' : String(d.scene), fallback = false;
    if (!key) { warn(`页面 ${d.id}：没写 scene（风格），先按朴素样子显示。${I.sceneList()}`); key = 'plain'; fallback = true; }
    else if (!I.SCENES[key]) { warn(`页面 ${d.id}：风格「${key}」没有注册，先按朴素样子显示。${I.sceneList()}。用这个风格的话，index.html 里要引入 scenes/${key}.js 和 scenes/${key}.css`); key = 'plain'; fallback = true; }
    if (S.forceScene) { key = S.forceScene; fallback = false; }
    return { key, fallback };
  }
  function buildPage(d, i) {
    const { key, fallback } = pickScene(d);
    const item = el('div', 'r-item');
    const head = el('div', 'r-head', `<b>${i + 1}</b><span>${esc(d.chapter || '')}</span>`);
    const frame = el('div', 'frame');
    const s = document.createElement('section');
    s.className = 'slide'; s.id = 'slide-' + d.id; s.dataset.id = d.id; s.dataset.scene = key;
    s.setAttribute('aria-label', d.title || d.id);
    s.innerHTML = (d.topic ? `<div class="s-topic"><span class="tc">${esc(d.chapterShort)}</span><span class="ts">›</span><span class="tt">${esc(d.topic)}</span></div>` : '')
      + (d.noTitle ? '' : `<h2 class="s-title">${d.titleHtml || esc(d.title || '')}</h2>`) + d.html;
    // 点击涟漪层：压在这一页所有内容下面（engine.css 里 z-index:-1，页面 isolation:isolate），风格的 ripple 往里放东西
    const rl = el('div', 'ripple-layer'); rl.setAttribute('aria-hidden', 'true'); s.prepend(rl);
    if (d.recede === false) s.dataset.recede = 'off';
    frame.appendChild(s);
    item.append(head, frame);
    dom.slidesBox.appendChild(item);
    const p = { def: d, i, id: d.id, scene: key, fallback, el: s, item, total: 0, beat: 0, units: [], keys: [], marks: [], targets: [], mascot: null, notes: [] };
    try { upgrade(p); } catch (e) { console.error(`[Deck] 页面 ${d.id} 组件初始化出错：`, e); }
    collect(p);
    normalizeNotes(p);
    I.hook(I.sc(key), 'decorate', s, p);   // 风格给每页加装饰（不进拍）
    if (i === I.DEFS.length - 1) addSign(p);
    const notesEl = el('details', 'r-notes', `<summary>讲词</summary><ol>${p.notes.filter(n => n.say).map(n => `<li><b>${n.beat === 0 ? '开场' : '第 ' + n.beat + ' 拍'}</b>${esc(n.say)}</li>`).join('')}</ol>`);
    if (SHOW_NOTES && p.notes.some(n => n.say)) item.appendChild(notesEl);
    return p;
  }

  /* 最后一页的署名（设计文档 5.4）：不进拍、第 0 拍就在、点它复制链接（ui.js 的点击处理走 data-copy，拦下跳转）；
     不提供关闭的开关。颜色用 --sign-color，风格可以在自己的 CSS 里改；位置由 ui.js 的 placeSign 定 */
  function addSign(p) {
    const a = el('a', 'li-sign', `由 li-talk-skills 提供支持 · ${esc(I.SIGN_URL.replace(/^https?:\/\//, ''))}`);
    a.href = I.SIGN_URL; a.target = '_blank'; a.rel = 'noopener';
    a.dataset.copy = I.SIGN_URL;
    a.title = '点一下复制链接';
    p.el.appendChild(a);
    dom.sign = a;
  }

  /* 把组件的简写标记补全 */
  function upgrade(p) {
    const s = p.el;
    // 形象：<div class="mascot">（旧写法 <div class="kid">）补全成当前形象；没有可用的形象时先藏起来
    $$('.mascot, .kid', s).forEach(m => {
      I.warnMascotOnce();
      if (I.mascotDef()) I.initMascotEl(m, p);
      else { m.classList.add('mascot'); m.hidden = true; }
    });
    $$('.key', s).forEach(k => { k.dataset.k = k.textContent; });   // 有的风格要用 content:attr(data-k) 把重点词再描一遍
    $$('.copy', s).forEach(c => {
      const t = c.textContent.trim();
      if (!c.dataset.copy) c.dataset.copy = t;
      if (!$('.ct', c)) c.innerHTML = `<span class="ps">$</span><span class="ct">${esc(t)}</span><i class="ic"></i>`;
    });
    $$('.term', s).forEach(t => {
      if (!$(':scope > .term-bar', t)) t.insertAdjacentHTML('afterbegin', `<div class="term-bar"><i></i><i></i><i></i>${esc(t.dataset.title || '终端')}</div>`);
    });
    $$('.shot', s).forEach(f => {
      const src = f.dataset.src || '', cap = f.dataset.caption || '';
      f.innerHTML = `<div class="shot-img"><img alt="${esc(cap)}" src="${esc(src)}" draggable="false"><span class="shot-miss"><span>截图待补<br><small>${esc(src)}</small></span></span></div>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}<span class="shot-zoom">点开看大图</span>`;
      const img = $('img', f);
      const bad = () => f.classList.add('missing');
      if (!src) bad(); else { img.addEventListener('error', bad); if (img.complete && !img.naturalWidth) bad(); }
      f.setAttribute('role', 'button'); f.tabIndex = -1;
    });
    $$('[data-copy]', s).forEach(c => { c.title = c.title || '点一下复制'; if (c.tagName !== 'BUTTON') { c.setAttribute('role', 'button'); c.tabIndex = -1; } });
    $$('svg.sketch', s).forEach((svg, k) => roughen(svg, p.i * 100 + k * 17 + 1, I.roughOf(p.scene)));
  }

  /* 手绘线稿：把 svg.sketch 里的普通形状换成 rough.js 线条；线的手感（L）来自风格的 rough */
  function roughen(svg, seed0, L) {
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (!R) return;
    const rc = R.svg(svg);
    let seed = seed0;
    $$('rect,ellipse,circle,line,path,polyline,polygon', svg).forEach(sh => {
      if (sh.closest('defs') || sh.hasAttribute('data-plain') || sh.closest('[data-rough-done]')) return;
      const a = n => parseFloat(sh.getAttribute(n)) || 0;
      const fillAttr = sh.getAttribute('fill');
      const o = {
        stroke: sh.getAttribute('stroke') || 'currentColor',
        strokeWidth: parseFloat(sh.getAttribute('stroke-width')) || L.strokeWidth,
        roughness: parseFloat(sh.dataset.roughness) || L.roughness, bowing: L.bowing, seed: seed++,
      };
      if (fillAttr && fillAttr !== 'none') { o.fill = fillAttr; o.fillStyle = sh.dataset.fillStyle || 'hachure'; o.hachureGap = L.hachureGap; o.hachureAngle = L.hachureAngle; o.fillWeight = L.fillWeight; }
      if (sh.hasAttribute('stroke-dasharray')) o.strokeLineDash = sh.getAttribute('stroke-dasharray').split(/[\s,]+/).map(Number);
      let g = null;
      try {
        switch (sh.tagName.toLowerCase()) {
          case 'rect': g = rc.rectangle(a('x'), a('y'), a('width'), a('height'), o); break;
          case 'ellipse': g = rc.ellipse(a('cx'), a('cy'), a('rx') * 2, a('ry') * 2, o); break;
          case 'circle': g = rc.circle(a('cx'), a('cy'), a('r') * 2, o); break;
          case 'line': g = rc.line(a('x1'), a('y1'), a('x2'), a('y2'), o); break;
          case 'polyline': case 'polygon': {
            const pts = (sh.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
            const arr = []; for (let i = 0; i + 1 < pts.length; i += 2) arr.push([pts[i], pts[i + 1]]);
            g = sh.tagName.toLowerCase() === 'polygon' ? rc.polygon(arr, o) : rc.linearPath(arr, o); break;
          }
          case 'path': g = rc.path(sh.getAttribute('d'), Object.assign({}, o, { roughness: Math.min(o.roughness, .9) })); break;
        }
      } catch (e) { warn('手绘线生成失败，保留原图形：', sh, e); }
      if (!g) return;
      if (sh.hasAttribute('data-arrow')) addArrowHeads(rc, sh, g, o);
      g.setAttribute('data-rough-done', '');
      [...sh.attributes].forEach(at => { if (/^(data-|class$|style$|opacity$)/.test(at.name)) g.setAttribute(at.name, at.value); });
      sh.replaceWith(g);
    });
  }
  function addArrowHeads(rc, sh, g, o) {
    const tag = sh.tagName.toLowerCase();
    let ends = [];
    if (tag === 'line') {
      const a = n => parseFloat(sh.getAttribute(n)) || 0;
      ends.push([[a('x1'), a('y1')], [a('x2'), a('y2')]]);
      if (sh.dataset.arrow === 'both') ends.push([[a('x2'), a('y2')], [a('x1'), a('y1')]]);
    } else if (sh.getTotalLength) {
      const L = sh.getTotalLength(), e = sh.getPointAtLength(L), q = sh.getPointAtLength(Math.max(0, L - 16));
      ends.push([[q.x, q.y], [e.x, e.y]]);
      if (sh.dataset.arrow === 'both') { const s0 = sh.getPointAtLength(0), s1 = sh.getPointAtLength(Math.min(L, 16)); ends.push([[s1.x, s1.y], [s0.x, s0.y]]); }
    }
    ends.forEach(([[x1, y1], [x2, y2]]) => {
      const ang = Math.atan2(y2 - y1, x2 - x1), len = 18 + o.strokeWidth * 2;
      const h = rc.linearPath([[x2 - len * Math.cos(ang - .5), y2 - len * Math.sin(ang - .5)], [x2, y2], [x2 - len * Math.cos(ang + .5), y2 - len * Math.sin(ang + .5)]], Object.assign({}, o, { fill: undefined, roughness: .7, seed: o.seed + 50 }));
      [...h.childNodes].forEach(n => g.appendChild(n));
    });
  }

  /* 收集节拍单元、重点词、圈注、形象的落脚点 */
  function collect(p) {
    const s = p.el;
    const beatOf = node => { const b = node.closest('[data-beat]'); return b && s.contains(b) ? (toInt(b.dataset.beat) || 0) : 0; };
    const cnt = {};
    const ord = n => { cnt[n] = (cnt[n] || 0) + 1; return cnt[n] - 1; };   // 同一拍里的第几个，用来错开出场
    // 不写 data-in 时的默认出场：风格的 enterBy 按组件类名细分（如 { copy: 'print' }），其余用风格的 enter
    const sc = I.sc(p.scene), by = sc.enterBy || {};
    const enterOf = e => { for (const c in by) if (e.classList.contains(c)) return by[c]; return sc.enter || 'rise'; };
    $$('[data-beat]', s).forEach(e => {
      let n = toInt(e.dataset.beat);
      if (isNaN(n) || n < 0) { warn(`页面 ${p.id}：data-beat="${e.dataset.beat}" 不是 0 以上的整数，按 0 处理`, e); n = 0; }
      const svgEl = e instanceof SVGElement && !(e instanceof SVGSVGElement);
      const isM = e.classList.contains('mascot'), guide = isM && e.classList.contains('guide');
      const fx = guide ? 'none' : e.dataset.in || (svgEl ? 'draw' : isM ? 'pop' : enterOf(e));
      const start = ord(n) * .12 + (parseFloat(e.dataset.delay) || 0);
      if (e.hasAttribute('data-stagger')) {
        const step = parseFloat(e.dataset.stagger) || .1;
        p.units.push({ el: e, beat: n, fx: e.dataset.in || 'none', container: true, start });
        [...e.children].forEach((c, k) => p.units.push({ el: c, beat: n, fx: c.dataset.in || (c instanceof SVGElement ? 'draw' : enterOf(c)), child: true, start: start + .08 + k * step + (parseFloat(c.dataset.delay) || 0) }));
      } else {
        p.units.push({ el: e, beat: n, fx, start });
      }
    });
    p.keys = $$('.key', s).map(k => ({ el: k, beat: beatOf(k) }));
    p.marks = $$('[data-mark]', s).map(m => ({ el: m, beat: m.dataset.markBeat != null ? (toInt(m.dataset.markBeat) || 0) : beatOf(m), kinds: m.dataset.mark.split(/\s+/).filter(Boolean) }));
    // 形象每拍的目标：data-mascot="拍号"（旧写法 data-kid）
    p.targets = $$('[data-mascot],[data-kid]', s).map(t => ({ el: t, beat: toInt(t.dataset.mascot != null ? t.dataset.mascot : t.dataset.kid) || 0 }));
    p.arranges = $$('.scatter[data-arrange]', s).map(e => ({ el: e, beat: toInt(e.dataset.arrange) || 1 }));
    p.keys.forEach(k => k.el.style.setProperty('--k', 0));
    // 会自动退后的块：顶层的 HTML 节拍块（不含线稿、形象、第 0 拍），data-recede="off" 的不算
    const recedeOff = s.dataset.recede === 'off';
    p.receders = recedeOff ? [] : p.units.filter(u => !u.child && u.beat > 0 && !(u.el instanceof SVGElement) && !u.el.classList.contains('mascot')
      && !u.el.closest('[data-recede="off"]') && !p.units.some(o => o !== u && !o.child && o.beat > 0 && o.el !== u.el && o.el.contains(u.el)));
    // 向导形象：页面里的 .mascot.guide（旧写法 .kid.guide，upgrade 时已补上 .mascot）；
    // 用了 data-mascot 却没放形象时，自动放一个在右下角
    let g = $('.mascot.guide', s);
    if (g || p.targets.length) I.warnMascotOnce();
    if (I.mascotDef()) {
      if (!g && p.targets.length) {
        s.insertAdjacentHTML('beforeend', I.mascotEl({ x: 1700, y: 900, face: 'left' }));
        g = s.lastElementChild;
        I.initMascotEl(g, p);
      }
      if (g) p.mascot = I.bindMascot(p, g);
    }
    const beats = [0].concat(p.units.map(u => u.beat), p.keys.map(k => k.beat), p.marks.map(m => m.beat), p.targets.map(t => t.beat), p.arranges.map(a => a.beat));
    p.total = Math.max(...beats);
  }

  function normalizeNotes(p) {
    let ns = p.def.notes;
    if (typeof ns === 'string') ns = [{ beat: 0, say: ns }];
    if (!Array.isArray(ns)) ns = [];
    p.notes = ns.map(n => {
      const keys = n.key == null ? [] : [].concat(n.key).map(String).filter(Boolean);
      return { beat: toInt(n.beat) || 0, keys, show: n.show || '', say: n.say || '' };
    });
    p.notes.forEach(n => { if (n.beat > p.total) warn(`页面 ${p.id}：notes 里有第 ${n.beat} 拍，可页面上最多只到第 ${p.total} 拍`); });
    const miss = []; for (let n = 0; n <= p.total; n++) if (!p.notes.some(x => x.beat === n)) miss.push(n);
    if (miss.length && p.notes.length) console.info(`[Deck] 页面 ${p.id}：第 ${miss.join('、')} 拍还没写讲词`);
  }
  /* 这一拍出现什么：notes 里写了 show 就用，没写就取这一拍内容的开头几个字 */
  function autoShow(p, n) {
    const t = p.units.filter(u => u.beat === n && !u.child && !(u.el instanceof SVGElement) && !u.el.classList.contains('mascot'))
      .map(u => u.el.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' · ');
    return t.length > 34 ? t.slice(0, 34) + '…' : t;
  }
  function keysOf(p, n) {
    const ns = p.notes.filter(x => x.beat === n);
    let ks = [].concat(...ns.map(x => x.keys));
    if (!ks.length) ks = p.keys.filter(k => k.beat === n).map(k => k.el.textContent.trim());
    return [...new Set(ks)].filter(Boolean);
  }

  /* =================================================================
     位置换算：元素在 1920×1080 页面坐标里的框（不受缩放、动画影响）
     ================================================================= */
  function boxIn(node, slide) {
    if (node instanceof SVGGraphicsElement && !(node instanceof SVGSVGElement)) {
      try { const b = node.getBBox(); return { l: b.x, t: b.y, w: b.width, h: b.height }; } catch (e) { return { l: 0, t: 0, w: 0, h: 0 }; }
    }
    let l = 0, t = 0, n = node;
    while (n && n !== slide) { l += n.offsetLeft || 0; t += n.offsetTop || 0; n = n.offsetParent; }
    return { l, t, w: node.offsetWidth || 0, h: node.offsetHeight || 0 };
  }

  Object.assign(I, { buildShell, buildPage, addSign, boxIn, autoShow, keysOf });
})();
