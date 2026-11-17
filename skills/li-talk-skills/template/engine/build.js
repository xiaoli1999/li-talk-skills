/* =====================================================================
   演示稿引擎 · 构建（build.js）
   - 搭外壳 buildShell：#app、#world、各场景背景层、#stage、#slides、外框（章节、页码、节拍格、计时）、
     板擦、提示条、看大图层、粉笔铅笔印章的 SVG 滤镜；建好的元素填进 I.dom
   - 建页面 buildPage：把 Deck.add 注册的定义建成 section.slide，
     再依次 upgrade（补全组件标记、手绘线）→ collect（节拍单元、重点词、圈注、小克落脚点、拍数）
     → normalizeNotes（讲词）
   - 演讲者视图要用的 autoShow、keysOf；位置换算 boxIn
   - 依赖总线：core 的常量和工具、I.dom、I.state；
     mascot.js 的 I.kidSvg、I.kid、I.bindKid（调用时才取，所以引入顺序在它前面也没关系）
   - 挂到总线：buildShell、buildPage、boxIn、autoShow、keysOf
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, SCENES, SCENE_IN, SHOW_NOTES, R, $, $$, esc, warn, toInt, el } = I;
  const dom = I.dom;

  /* =================================================================
     外壳
     ================================================================= */
  function buildShell() {
    document.body.classList.add('loading');
    const app = el('div'); app.id = 'app';
    dom.world = el('div'); dom.world.id = 'world';
    SCENES.forEach(s => { const b = el('div', 'bg'); b.dataset.scene = s; dom.bg[s] = b; dom.world.appendChild(b); });
    dom.bg.board.innerHTML = `<div class="bd-ledge"><i style="left:300px;width:118px;--c:#F1EEE6;rotate:-2deg"></i><i style="left:450px;width:74px;--c:#FFDC6A;rotate:3deg"></i><b style="right:300px"></b></div>`;
    dom.stage = el('div'); dom.stage.id = 'stage';
    dom.slidesBox = el('div'); dom.slidesBox.id = 'slides';
    dom.slidesBox.appendChild(el('div', 'r-top', `<b>${esc(document.title)}</b>竖屏阅读模式：每页的内容都已展开。横过来看就是演示模式。`));
    const chrome = el('div', 'chrome', `<div class="chap"></div><div class="meta"><div class="pageno"></div><div class="meter"><span class="dots"></span><span class="mnum"></span></div></div><div class="timer"></div>`);
    dom.eraserEl = el('div', 'bd-eraser');
    dom.stage.append(dom.slidesBox, chrome, dom.eraserEl);
    dom.world.appendChild(dom.stage);
    app.appendChild(dom.world);
    document.body.prepend(app);
    dom.chap = $('.chap', chrome); dom.meter = $('.meter', chrome); dom.dotsBox = $('.dots', chrome); dom.mnum = $('.mnum', chrome); dom.pageno = $('.pageno', chrome); dom.timerEl = $('.timer', chrome);
    dom.toastEl = el('div'); dom.toastEl.id = 'toast'; document.body.appendChild(dom.toastEl);
    dom.lb = el('div', '', `<div class="lb-scroll"><img alt=""></div><button class="lb-close" type="button" aria-label="关闭">×</button><div class="lb-cap"></div>`);
    dom.lb.id = 'lightbox'; dom.lb.hidden = true; document.body.appendChild(dom.lb);
    /* 粉笔、铅笔、印章的质感滤镜 */
    document.body.insertAdjacentHTML('beforeend', `<svg class="deck-defs" aria-hidden="true"><defs>
      <filter id="chalk-text" x="-4%" y="-12%" width="108%" height="124%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="11" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -4 0 0 0 3.5" result="ga"/>
        <feComposite in="d" in2="ga" operator="in"/></filter>
      <filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
      <filter id="stamp-ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.45" result="holes"/><feComposite in="SourceGraphic" in2="holes" operator="in" result="ink"/><feDisplacementMap in="ink" in2="t" scale="2.5"/></filter>
    </defs></svg>`);
  }

  /* =================================================================
     构建页面
     ================================================================= */
  function buildPage(d, i) {
    const item = el('div', 'r-item');
    const head = el('div', 'r-head', `<b>${i + 1}</b><span>${esc(d.chapter || '')}</span>`);
    const frame = el('div', 'frame');
    const s = document.createElement('section');
    s.className = 'slide'; s.id = 'slide-' + d.id; s.dataset.id = d.id; s.dataset.scene = d.scene;
    s.setAttribute('aria-label', d.title || d.id);
    s.innerHTML = (d.scene === 'paper' ? '<div class="pp-holes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' : '')
      + (d.topic ? `<div class="s-topic"><span class="tc">${esc(d.chapterShort)}</span><span class="ts">›</span><span class="tt">${esc(d.topic)}</span></div>` : '')
      + (d.noTitle ? '' : `<h2 class="s-title">${d.titleHtml || esc(d.title || '')}</h2>`) + d.html;
    if (d.recede === false) s.dataset.recede = 'off';
    frame.appendChild(s);
    item.append(head, frame);
    dom.slidesBox.appendChild(item);
    const p = { def: d, i, id: d.id, scene: d.scene, el: s, item, total: 0, beat: 0, units: [], keys: [], marks: [], targets: [], kid: null, notes: [] };
    try { upgrade(p); } catch (e) { console.error(`[Deck] 页面 ${d.id} 组件初始化出错：`, e); }
    collect(p);
    normalizeNotes(p);
    const notesEl = el('details', 'r-notes', `<summary>讲词</summary><ol>${p.notes.filter(n => n.say).map(n => `<li><b>${n.beat === 0 ? '开场' : '第 ' + n.beat + ' 拍'}</b>${esc(n.say)}</li>`).join('')}</ol>`);
    if (SHOW_NOTES && p.notes.some(n => n.say)) item.appendChild(notesEl);
    return p;
  }

  /* 把组件的简写标记补全 */
  function upgrade(p) {
    const s = p.el;
    $$('.kid', s).forEach(k => {
      if (k.dataset.size) k.style.setProperty('--kid', parseFloat(k.dataset.size) + 'px');
      k.dataset.face = k.dataset.face || 'right';
      k.innerHTML = `<div class="kid-body">${I.kidSvg(k.dataset.pose)}</div><span class="kid-say"></span>`;
      k._pose = k.dataset.pose || 'idle';
      k.title = '小克';
    });
    $$('.key', s).forEach(k => { k.dataset.k = k.textContent; });   // 黑板上黄粉笔描一遍要用
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
    $$('svg.sketch', s).forEach((svg, k) => roughen(svg, p.i * 100 + k * 17 + 1, p.scene));
  }

  /* 各场景的线条手感：方格纸墨线、黑板粗粉笔、手账细墨线、桌面铅笔 */
  const LINE = {
    paper: { w: 2.6, rough: 1.1, bow: 1 },
    board: { w: 4, rough: 1, bow: .9 },
    journal: { w: 2.4, rough: 1.1, bow: .8 },
    desk: { w: 2.2, rough: 1.3, bow: 1.2 },
  };
  /* 手绘线稿：把 svg.sketch 里的普通形状换成 rough.js 线条 */
  function roughen(svg, seed0, scene) {
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (!R) return;
    const rc = R.svg(svg), L = LINE[scene] || LINE.paper;
    let seed = seed0;
    $$('rect,ellipse,circle,line,path,polyline,polygon', svg).forEach(sh => {
      if (sh.closest('defs') || sh.hasAttribute('data-plain') || sh.closest('[data-rough-done]')) return;
      const a = n => parseFloat(sh.getAttribute(n)) || 0;
      const fillAttr = sh.getAttribute('fill');
      const o = {
        stroke: sh.getAttribute('stroke') || 'currentColor',
        strokeWidth: parseFloat(sh.getAttribute('stroke-width')) || L.w,
        roughness: parseFloat(sh.dataset.roughness) || L.rough, bowing: L.bow, seed: seed++,
      };
      if (fillAttr && fillAttr !== 'none') { o.fill = fillAttr; o.fillStyle = sh.dataset.fillStyle || 'hachure'; o.hachureGap = scene === 'journal' ? 13 : 9; o.hachureAngle = scene === 'journal' ? -38 : -41; o.fillWeight = scene === 'journal' ? 3 : 2.6; }
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

  /* 收集节拍单元、重点词、圈注、小克的落脚点 */
  function collect(p) {
    const s = p.el;
    const beatOf = node => { const b = node.closest('[data-beat]'); return b && s.contains(b) ? (toInt(b.dataset.beat) || 0) : 0; };
    const cnt = {};
    const ord = n => { cnt[n] = (cnt[n] || 0) + 1; return cnt[n] - 1; };   // 同一拍里的第几个，用来错开出场
    $$('[data-beat]', s).forEach(e => {
      let n = toInt(e.dataset.beat);
      if (isNaN(n) || n < 0) { warn(`页面 ${p.id}：data-beat="${e.dataset.beat}" 不是 0 以上的整数，按 0 处理`, e); n = 0; }
      const svgEl = e instanceof SVGElement && !(e instanceof SVGSVGElement);
      const guide = e.classList.contains('kid') && e.classList.contains('guide');
      const fx = guide ? 'none' : e.dataset.in || (svgEl ? 'draw' : e.classList.contains('kid') ? 'pop' : (p.scene === 'desk' && e.classList.contains('copy')) ? 'print' : SCENE_IN[p.scene]);
      const start = ord(n) * .12 + (parseFloat(e.dataset.delay) || 0);
      if (e.hasAttribute('data-stagger')) {
        const step = parseFloat(e.dataset.stagger) || .1;
        p.units.push({ el: e, beat: n, fx: e.dataset.in || 'none', container: true, start });
        [...e.children].forEach((c, k) => p.units.push({ el: c, beat: n, fx: c.dataset.in || (c instanceof SVGElement ? 'draw' : SCENE_IN[p.scene]), child: true, start: start + .08 + k * step + (parseFloat(c.dataset.delay) || 0) }));
      } else {
        p.units.push({ el: e, beat: n, fx, start });
      }
    });
    p.keys = $$('.key', s).map(k => ({ el: k, beat: beatOf(k) }));
    p.marks = $$('[data-mark]', s).map(m => ({ el: m, beat: m.dataset.markBeat != null ? (toInt(m.dataset.markBeat) || 0) : beatOf(m), kinds: m.dataset.mark.split(/\s+/).filter(Boolean) }));
    p.targets = $$('[data-kid]', s).map(t => ({ el: t, beat: toInt(t.dataset.kid) || 0 }));
    p.arranges = $$('.scatter[data-arrange]', s).map(e => ({ el: e, beat: toInt(e.dataset.arrange) || 1 }));
    p.keys.forEach(k => k.el.style.setProperty('--k', 0));
    // 会自动退后的块：顶层的 HTML 节拍块（不含线稿、小克、第 0 拍），data-recede="off" 的不算
    const recedeOff = s.dataset.recede === 'off';
    p.receders = recedeOff ? [] : p.units.filter(u => !u.child && u.beat > 0 && !(u.el instanceof SVGElement) && !u.el.classList.contains('kid')
      && !u.el.closest('[data-recede="off"]') && !p.units.some(o => o !== u && !o.child && o.beat > 0 && o.el !== u.el && o.el.contains(u.el)));
    // 小克：页面里的 .kid.guide；用了 data-kid 却没放小克时自动放一只在右下角
    let g = $('.kid.guide', s);
    if (!g && p.targets.length) {
      s.insertAdjacentHTML('beforeend', I.kid({ x: 1700, y: 900 }));
      g = s.lastElementChild;
      g.dataset.face = 'left'; g.innerHTML = `<div class="kid-body">${I.kidSvg('idle')}</div><span class="kid-say"></span>`; g._pose = 'idle';
    }
    if (g) {
      p.kid = { el: g, body: $('.kid-body', g), svg: $('svg', g), say: $('.kid-say', g), home: { pose: g.dataset.pose || 'idle', face: g.dataset.face || 'right', say: g.dataset.say || '' } };
      I.bindKid(p);
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
    const t = p.units.filter(u => u.beat === n && !u.child && !(u.el instanceof SVGElement) && !u.el.classList.contains('kid'))
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

  Object.assign(I, { buildShell, buildPage, boxIn, autoShow, keysOf });
})();
