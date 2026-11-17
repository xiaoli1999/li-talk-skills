/* =====================================================================
   演示稿引擎 · 自检（selftest.js）
   - 打开 index.html?selftest=1（可带 &pages=3-5 只查几页、&scene=dark 临时换风格）进入自检模式（接口约定 D）：
     不播开场、翻拍不带动画（core.js 的 motion() 在自检模式下为假，形象直接到位），
     等字体和图片加载完，逐页逐拍直接跳到每拍的最终状态量一遍，再一拍拍退回第 0 拍看收干净没有；
     结果写进 <pre id="deck-selftest" hidden>（JSON），写完再设 document.documentElement.dataset.selftest = 'done'
   - 坐标一律是舞台坐标（1920×1080）：屏幕坐标减去舞台左上角，再除以缩放比例
   - 文字框：当前页里所有看得见的文字（跳过形象、气泡、署名、「已复制」提示、涟漪层），
     用 Range.getClientRects() 取每行的框，按所属元素归在一起；每行只取「字身」：
     高度取字号的 0.9 倍、在行框里居中（行框上下的空白不算字，免得形象站在文字上沿、两行挨得近时误报）
   - 量什么（type）：out-of-stage 超出舞台、text-overflow 文字超出容器、overlap 文字互相压、
     mascot-cover 形象挡字（只量看得见的身子：SVG 里画出来的图形的外框并起来，不含画布四周的空白；说话时加上气泡）、
     zone 进了风格禁区、font-small 字太小、scrollbar 出滚动条、not-cleared 退回第 0 拍没收干净、
     console-error 控制台报错、deck-warn 引擎的 [Deck] 提醒、media-missing 图片视频加载失败、page-error onBeat 或建页出错；
     阅读模式（竖屏）只查 reading-overflow（这页比屏幕宽）、media-missing、console-error（和 page-error）
   - 同一页里同一个问题只在它第一次出现的那一拍报一次；字太小的同类元素（同样的标签、类名、字号）合成一条
   - 形象挡字、文字互相压只算看得见的部分：交叠宽高都不到 5px 的擦边不算形象挡字；
     一段字整个被不透明的东西盖住（比如故意贴一张便签盖住旧字）时，不算它和别的字互相压
   - 自检时为了量得准：去掉所有 CSS 过渡、CSS 动画一下播完；倾斜（CSS 的 rotate 属性，卡片、便签那几度歪）
     暂时摆正（形象的落脚点本来就按摆正的框算）；页面的 onBeat 返回的动画直接跳到结尾；
     页面里的元素临时都能被 elementsFromPoint 取到（量「被盖住」用）
   - 退回第 0 拍没收干净：和第一次进这一页的第 0 拍比，多出了看得见的带拍块或文字才算
     （有的页面故意让某个带拍的块一直显示，只用它的拍号做强调，那不算）
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、reading）、I.dom（stage）、I.sc（风格的 zones）；
     beats.js 的 I.setInstant、I.finishRunning、I.callOnBeat（自检模式下换成同步跑完、记下异常的版本）；
     pages.js 的 I.go、I.finishPageTl、I.afterChange
   - 挂到总线：runSelftest（core.js 的 boot 在自检模式下调用）
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, G, QS, SELFTEST, $$, toInt, PAGES } = I;
  const S = I.state, dom = I.dom;

  /* 阈值（舞台 px） */
  const EDGE = 2;                 // 超出舞台、容器多少才算
  const OVERLAP_MIN = 60, OVERLAP_RATIO = .15;   // 文字互相压：交叠面积大于 60px²，且大于小的那块的 15%
  const COVER_MIN = 40;           // 形象挡字：交叠面积大于 40px²
  const COVER_DEPTH = 5;          // 而且交叠部分宽、高都至少 5px（只擦到字的边、气泡底边碰到字顶的不算）
  const ZONE_MIN = 40;            // 进禁区：交叠面积大于 40px²
  const FONT_MIN = 34, FONT_SMALL = 24;          // 正文最小字号；标了 data-small 的最小字号
  const SEEN = .05;               // 累计不透明度低于它就算看不见
  const CORE = .9;                // 字身高 = 字号 × 0.9

  const FIX = {
    'out-of-stage': '把这块往里挪，或删减文字',
    'text-overflow': '删减这块的文字，或去掉容器的固定宽高',
    'overlap': '调整位置，或删减其中一块的文字',
    'mascot-cover': '在目标元素上加 data-mascot-dx / data-mascot-dy 把形象挪开，或换一侧 data-mascot-side',
    'zone': '这块进了风格的禁区，往里挪',
    'font-small': '正文至少 34px；确实是注释类小字的，加 data-small（不小于 24px）',
    'scrollbar': '页面比窗口大，检查有没有元素用了 100vw 或写死了很大的宽高',
    'not-cleared': '这块退回第 0 拍后还在，检查 onBeat 退拍时有没有收回',
    'console-error': '按报错信息改',
    'page-error': '按报错信息改',
    'deck-warn': '按提醒里的说明改；确实不用改的，说明为什么',
    'media-missing': '检查文件名和路径，文件要放在课件目录里',
    'reading-overflow': '手机竖屏下这页太宽，检查写死的宽度',
  };
  /* 这些地方的字不按字号查：主题行、署名、形象和气泡、引擎自己生成的界面小字
     （终端标题栏、截图位的「点开看大图」和「截图待补」占位、「已复制」提示） */
  const FONT_FREE = '.s-topic, .li-sign, .mascot, .kid, .mascot-say, .kid-say, .term-bar, .shot-zoom, .shot-miss, .copied-tip';
  /* 不算页面文字的地方 */
  const NOT_TEXT = '.mascot, .kid, .copied-tip, .ripple-layer, .li-sign, script, style, noscript, template';
  /* 容器的叫法：「第 3 张卡片的文字超出卡片底边」 */
  const KINDS = [['.card', '张', '卡片'], ['.term', '个', '终端窗口'], ['.copy', '条', '命令'], ['.cell', '个', '格子'],
    ['.steps > li', '个', '步骤'], ['.tag', '个', '标签'], ['.lab', '个', '小标签'], ['.shot', '张', '截图'], ['.quote', '段', '金句']];
  const SIDE = { top: '顶边', right: '右边', bottom: '底边', left: '左边' };

  const r1 = v => Math.round(v);
  const sleep = ms => new Promise(ok => setTimeout(ok, ms));
  const race = (p, ms) => Promise.race([Promise.resolve(p).catch(() => {}), sleep(ms)]);
  const errText = e => e && e.message ? ((e.name && e.name !== 'Error' ? e.name + '：' : '') + e.message) : String(e);
  const snip = (el, n = 16) => {
    const t = String((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n) + '…' : t;
  };
  const elName = el => {
    const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean)[0] : '';
    return '<' + el.tagName.toLowerCase() + (c ? '.' + c : '') + '>';
  };
  const label = el => { const t = snip(el); return t ? `「${t}」` : elName(el); };

  /* 每个元素一个编号（去重用的键） */
  const ids = new WeakMap(); let idSeq = 0;
  const uid = el => { if (!ids.has(el)) ids.set(el, ++idSeq); return ids.get(el); };

  /* ---------- 框的运算（{ l, t, r, b }，舞台坐标） ---------- */
  function ref() { const r = dom.stage.getBoundingClientRect(); return { x: r.left, y: r.top, k: r.width / W || 1 }; }
  const toStage = (r, R) => ({ l: (r.left - R.x) / R.k, t: (r.top - R.y) / R.k, r: (r.right - R.x) / R.k, b: (r.bottom - R.y) / R.k });
  const union = (a, b) => a ? { l: Math.min(a.l, b.l), t: Math.min(a.t, b.t), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b) } : Object.assign({}, b);
  const inter = (a, b) => { const l = Math.max(a.l, b.l), t = Math.max(a.t, b.t), r = Math.min(a.r, b.r), bb = Math.min(a.b, b.b); return r > l && bb > t ? { l, t, r, b: bb } : null; };
  const area = b => b ? (b.r - b.l) * (b.b - b.t) : 0;
  /* 一组框和另一组框的交叠：总面积，以及交叠部分合起来的外框 */
  function cross(as, bs) {
    let sum = 0, box = null;
    as.forEach(a => bs.forEach(b => { const x = inter(a, b); if (x) { sum += area(x); box = union(box, x); } }));
    return { sum, box };
  }
  const size = b => `${r1(b.r - b.l)}×${r1(b.b - b.t)}px`;

  /* ---------- 被盖住：舞台上 (x, y) 这一点，文字 t 上面有没有不透明的东西（不是它自己的祖先）盖着 ----------
     用 elementsFromPoint 取这一点从上到下叠着的元素（自检模式下页面里的元素都临时能被点到，见文件末尾） */
  function opaque(e) {
    const tag = e.tagName.toLowerCase();
    if (tag !== 'img' && tag !== 'video' && tag !== 'canvas' && alpha(getComputedStyle(e).backgroundColor) < .85) return false;
    return opacity(e, null) >= .85;
  }
  function coveredAt(t, x, y, R) {
    for (const e of document.elementsFromPoint(R.x + x * R.k, R.y + y * R.k)) {
      if (e === t.el || t.el.contains(e)) return false;   // 先碰到这段字自己：没被盖住
      if (e.contains(t.el)) continue;                     // 它的祖先（卡片、页面）
      if (opaque(e)) return true;
    }
    return false;
  }
  /* 这段字整个被盖住了：每一行的左、中、右三个点都被不透明的东西盖着（故意贴一张便签盖住旧字就是这样）；
     只盖住一部分的照常算互相压 */
  function buried(t, R, cache) {
    if (cache.has(t.el)) return cache.get(t.el);
    const v = t.rects.every(r => [.1, .5, .9].every(f => coveredAt(t, r.l + (r.r - r.l) * f, (r.t + r.b) / 2, R)));
    cache.set(t.el, v);
    return v;
  }

  /* ---------- 看不看得见 ---------- */
  let opCache = new Map();   // 元素自己的不透明度（同一拍里量过的不再算）
  function ownOpacity(e) {
    let v = opCache.get(e);
    if (v == null) { v = parseFloat(getComputedStyle(e).opacity); if (isNaN(v)) v = 1; opCache.set(e, v); }
    return v;
  }
  /* 从 el 到 top（含）累计的不透明度 */
  function opacity(el, top) {
    let v = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) { v *= ownOpacity(e); if (e === top) break; }
    return v;
  }
  /* 元素自己看得见：没有 display:none、visibility 是 visible、累计不透明度够 */
  function shown(el, top) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility !== 'visible') return false;
    return opacity(el, top) >= SEEN;
  }

  /* ---------- 字号（SVG 里的字按 viewBox 的缩放折算） ---------- */
  function fontPx(el) {
    let f = parseFloat(getComputedStyle(el).fontSize) || 0;
    if (el instanceof SVGElement && el.getCTM) {
      try { const m = el.getCTM(); if (m) f *= Math.hypot(m.a, m.b); } catch (e) { /* 量不到就按原字号 */ }
    }
    return f;
  }

  /* ---------- 这一页现在看得见的文字：[{ el, rects（每行的字身框）, box（外框）, area, fs }] ---------- */
  function texts(slide, R) {
    opCache = new Map();
    const map = new Map(), vis = new Map();
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      const pe = n.parentElement;
      if (!pe || pe.closest(NOT_TEXT)) continue;
      if (!vis.has(pe)) vis.set(pe, shown(pe, slide));
      if (!vis.get(pe)) continue;
      rg.selectNodeContents(n);
      let t = map.get(pe);
      for (const r of rg.getClientRects()) {
        if (r.width < .5 || r.height < .5) continue;
        if (!t) { t = { el: pe, rects: [], box: null, area: 0, fs: fontPx(pe) }; map.set(pe, t); }
        const b = toStage(r, R), h = Math.min(b.b - b.t, t.fs * CORE || (b.b - b.t)), cy = (b.t + b.b) / 2;
        const c = { l: b.l, r: b.r, t: cy - h / 2, b: cy + h / 2 };
        t.rects.push(c); t.box = union(t.box, c); t.area += area(c);
      }
    }
    return [...map.values()];
  }

  /* ---------- 文字所在的容器：往上找最近的有底色、边框或阴影的元素，到页面为止；
     先碰到一个绝对定位的块（比如贴在卡片角上的小标签）就不再往外找 ---------- */
  const alpha = c => {
    if (!c || c === 'transparent') return 0;
    const m = /rgba?\(([^)]*)\)/.exec(c);
    if (!m) return 1;
    const v = m[1].split(/[\s,/]+/).filter(Boolean);
    return v.length >= 4 ? parseFloat(v[3]) * (/%$/.test(v[3]) ? .01 : 1) : 1;
  };
  function isBox(cs) {
    if (alpha(cs.backgroundColor) > .02 || (cs.backgroundImage && cs.backgroundImage !== 'none')) return true;
    for (const s of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(cs['border' + s + 'Width']) > 0 && !/none|hidden/.test(cs['border' + s + 'Style']) && alpha(cs['border' + s + 'Color']) > .02) return true;
    }
    return !!cs.boxShadow && cs.boxShadow !== 'none';
  }
  function boxOf(el, slide, cache) {
    if (cache.has(el)) return cache.get(el);
    let found = null;
    for (let e = el; e && e !== slide; e = e.parentElement) {
      if (e instanceof SVGElement && !(e instanceof SVGSVGElement)) continue;   // SVG 里面的图形不算容器
      const cs = getComputedStyle(e);
      if (isBox(cs)) { found = e; break; }
      if (cs.position === 'absolute' || cs.position === 'fixed') break;
    }
    cache.set(el, found);
    return found;
  }
  function boxName(c, slide) {
    for (const [sel, unit, noun] of KINDS) {
      if (c.matches(sel)) { const all = $$(sel, slide); return { desc: `第 ${all.indexOf(c) + 1} ${unit}${noun}`, noun }; }
    }
    const t = snip(c, 12);
    return { desc: t ? `「${t}」所在的框` : `${elName(c)} 框`, noun: '框' };
  }

  /* ---------- 形象占的地方：看得见的身子（SVG 里画出来的图形并起来）和说话时的气泡 ---------- */
  const SHAPES = 'path,circle,ellipse,rect,polygon,polyline,line,text,image,use';
  const paints = (v, o) => !!v && v !== 'none' && !(parseFloat(o) <= 0);
  function bodyBox(svg, R) {
    if (!svg || !svg.querySelectorAll) return null;
    let open = null, clipped = null;
    svg.querySelectorAll(SHAPES).forEach(s => {
      if (s.closest('defs, clipPath, mask, pattern, marker, symbol')) return;
      const cs = getComputedStyle(s);
      if (cs.display === 'none' || cs.visibility !== 'visible' || opacity(s, svg) < SEEN) return;
      const tag = s.tagName.toLowerCase();
      if (tag !== 'image' && tag !== 'use' && !paints(cs.fill, cs.fillOpacity) && !(paints(cs.stroke, cs.strokeOpacity) && parseFloat(cs.strokeWidth) > 0)) return;
      const r = s.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) return;
      const b = toStage(r, R);
      // 被裁切或蒙版的图形（比如只在身子里面上的色）：露出来的部分不会超出身子，不单独算
      let cut = false;
      for (let e = s; e && e !== svg.parentNode; e = e.parentNode) if (e.getAttribute && (e.getAttribute('clip-path') || e.getAttribute('mask'))) { cut = true; break; }
      if (cut) clipped = union(clipped, b); else open = union(open, b);
    });
    return open || clipped || toStage(svg.getBoundingClientRect(), R);
  }
  function mascotParts(slide, R) {
    const out = [];
    $$('.mascot', slide).forEach(m => {
      const st = m._mascot;
      if (!st || m.hidden || !shown(m, slide)) return;
      const body = bodyBox(st.svg, R);
      if (body) out.push({ part: '身子', box: body });
      if (st.say && st.say.classList.contains('on') && st.say.textContent.trim()) {
        st.say.style.transition = 'none';   // 气泡出现时有缩放过渡，不去掉会读到中间态
        out.push({ part: '气泡', box: toStage(st.say.getBoundingClientRect(), R) });
      }
    });
    return out;
  }

  /* ---------- 风格的禁区 ---------- */
  function zonesOf(p) {
    const zs = I.sc(p.scene).zones;
    return (Array.isArray(zs) ? zs : []).filter(z => z && typeof z === 'object')
      .map(z => ({ l: +z.x || 0, t: +z.y || 0, r: (+z.x || 0) + (+z.w || 0), b: (+z.y || 0) + (+z.h || 0), name: String(z.name || '禁区') }))
      .filter(z => z.r > z.l && z.b > z.t);
  }

  /* =================================================================
     记录问题
     ================================================================= */
  function issue(level, type, p, beat, msg, data) {
    const o = { level, type, page: p ? p.i + 1 : null };
    if (p) { o.id = p.id; o.title = p.def.title || ''; o.beat = beat == null ? null : beat; }
    o.msg = msg; o.fix = FIX[type] || '';
    if (data) o.data = data;
    return o;
  }

  /* 页面的 onBeat：自检时同步跑完（返回的动画直接跳到结尾），出错记成 page-error，不往控制台报 */
  const pageErrs = [];
  function callOnBeat(p, n, dir) {
    if (typeof p.def.onBeat !== 'function') return;
    try {
      const r = p.def.onBeat(n, p.el, dir);
      if (r && typeof r.progress === 'function') { try { r.progress(1); } catch (e) { /* 跳不到结尾就算了 */ } }
    } catch (e) {
      pageErrs.push(issue('error', 'page-error', p, n, `第 ${n} 拍的 onBeat 出错：${errText(e)}`, { beat: n }));
    }
  }

  /* 让所有动画立刻到结尾：gsap 里不是无限循环的、CSS 动画和过渡 */
  function flush() {
    if (G && G.globalTimeline) {
      G.globalTimeline.getChildren(false, true, true).forEach(t => {
        try { if (!(t.repeat && t.repeat() === -1)) t.progress(1); } catch (e) { /* 忽略 */ }
      });
    }
    if (document.getAnimations) {
      document.getAnimations().forEach(a => { try { if (a.playState !== 'finished') a.finish(); } catch (e) { /* 无限循环的结束不了 */ } });
    }
  }

  /* 控制台报错的出处：每一步之前记下条数，之后多出来的就算这一页这一拍的 */
  const errAt = [];
  const errs = () => (Array.isArray(window.__deckErrors) ? window.__deckErrors : []);
  function tagErrors(mark, p, n) { const E = errs(); for (let i = mark; i < E.length; i++) if (!errAt[i]) errAt[i] = { p, n }; }

  /* =================================================================
     演示模式：逐页逐拍量
     ================================================================= */
  function enter(p) {
    const mark = errs().length;
    I.go(p.i, 0, { anim: false, dir: 1 });
    flush();
    tagErrors(mark, p, 0);
  }
  function step(p, n, dir) {
    const mark = errs().length;
    I.finishRunning(); I.finishPageTl();
    I.setInstant(p, n);
    I.callOnBeat(p, n, dir);
    S.cur = { p: p.i, b: p.beat };
    I.afterChange();
    flush();
    tagErrors(mark, p, n);
  }

  /* 去掉空项，再去掉「外层元素也命中了」的内层文字（一段话和它里面的重点词只报那段话） */
  function outer(hits) {
    const list = hits.filter(Boolean);
    return list.filter(h => !list.some(o => o !== h && o.t.el !== h.t.el && o.t.el.contains(h.t.el)));
  }
  function measure(p, n, add, fonts) {
    const R = ref(), slide = p.el;
    const ts = texts(slide, R);
    // 1. 超出舞台
    outer(ts.map(t => {
      const o = { right: t.box.r - W, bottom: t.box.b - H, left: -t.box.l, top: -t.box.t };
      const side = Object.keys(o).sort((a, b) => o[b] - o[a])[0];
      return o[side] > EDGE ? { t, side, over: r1(o[side]) } : null;
    })).forEach(({ t, side, over }) => add(`stage|${uid(t.el)}`, issue('error', 'out-of-stage', p, n, `${label(t.el)}超出舞台${SIDE[side]} ${over}px（舞台 1920×1080）`, { over, side })));
    // 2. 文字超出容器
    const cache = new Map(), boxes = new Map();
    ts.forEach(t => {
      const c = boxOf(t.el, slide, cache);
      if (!c) return;
      let e = boxes.get(c);
      if (!e) { e = { c, cr: toStage(c.getBoundingClientRect(), R), over: { top: 0, right: 0, bottom: 0, left: 0 } }; boxes.set(c, e); }
      t.rects.forEach(r => {
        e.over.bottom = Math.max(e.over.bottom, r.b - e.cr.b); e.over.top = Math.max(e.over.top, e.cr.t - r.t);
        e.over.right = Math.max(e.over.right, r.r - e.cr.r); e.over.left = Math.max(e.over.left, e.cr.l - r.l);
      });
    });
    boxes.forEach(e => ['bottom', 'right', 'top', 'left'].forEach(side => {
      const v = e.over[side];
      if (!(v > EDGE)) return;
      const nm = boxName(e.c, slide), tall = side === 'top' || side === 'bottom';
      const dim = tall ? '高' : '宽', box = r1(tall ? e.cr.b - e.cr.t : e.cr.r - e.cr.l), over = r1(v);
      add(`ovf|${uid(e.c)}|${side}`, issue('error', 'text-overflow', p, n,
        `${nm.desc}的文字超出${nm.noun}${SIDE[side]} ${over}px（${nm.noun}${dim} ${box}，内容${dim} ${box + over}）`, { over, box, content: box + over, side }));
    }));
    // 3. 文字互相压（其中一段整个被不透明的东西盖住的不算，比如故意贴上去盖住旧字的便签）
    const hid = new Map();
    for (let i = 0; i < ts.length; i++) {
      for (let j = i + 1; j < ts.length; j++) {
        const a = ts[i], b = ts[j];
        if (!inter(a.box, b.box) || a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const x = cross(a.rects, b.rects), small = Math.min(a.area, b.area);
        if (x.sum > OVERLAP_MIN && x.sum > OVERLAP_RATIO * small && !buried(a, R, hid) && !buried(b, R, hid)) {
          const pct = r1(x.sum / small * 100);
          add(`ovl|${uid(a.el)}|${uid(b.el)}`, issue('error', 'overlap', p, n,
            `${label(a.el)}和${label(b.el)}叠在一起（交叠约 ${size(x.box)}，占小的那块的 ${pct}%）`, { area: r1(x.sum), percent: pct }));
        }
      }
    }
    // 4. 形象挡字
    mascotParts(slide, R).forEach(m => outer(ts.map(t => {
      const x = cross([m.box], t.rects);
      return x.sum > COVER_MIN && x.box.r - x.box.l >= COVER_DEPTH && x.box.b - x.box.t >= COVER_DEPTH ? { t, x } : null;
    })).forEach(({ t, x }) => add(`cover|${m.part}|${uid(t.el)}`, issue('error', 'mascot-cover', p, n,
      `形象的${m.part}压住了${label(t.el)}（交叠约 ${size(x.box)}）`, { area: r1(x.sum), part: m.part }))));
    // 5. 风格禁区（主题行本来就在「主题行」那块里，不算）
    zonesOf(p).forEach((z, zi) => outer(ts.map(t => {
      if (t.el.closest('.s-topic')) return null;
      const x = cross([z], t.rects);
      return x.sum > ZONE_MIN ? { t, x } : null;
    })).forEach(({ t, x }) => add(`zone|${zi}|${uid(t.el)}`, issue('error', 'zone', p, n,
      `${label(t.el)}进了风格的禁区「${z.name}」（交叠约 ${size(x.box)}）`, { area: r1(x.sum), zone: z.name }))));
    // 6. 字号：先攒着，一页量完再按「同样的元素、同样的字号」合成一条（一排 11 个编号不报 11 条）
    ts.forEach(t => {
      if (t.el.closest(FONT_FREE) || fonts.seen.has(t.el)) return;
      // 截图的图注属于注释类小字，和 data-small 一样允许到 24px（引擎默认 32px）
      const fs = Math.round(t.fs * 10) / 10, small = !!t.el.closest('[data-small], figcaption');
      if (small ? fs >= FONT_SMALL - .05 : fs >= FONT_MIN - .05) return;
      fonts.seen.add(t.el);
      const pe = t.el.parentElement;
      const key = [small, fs, elName(t.el), t.el.className, pe ? elName(pe) : ''].join('|');
      const g = fonts.groups.get(key);
      if (g) g.els.push(t.el); else fonts.groups.set(key, { small, fs, beat: n, els: [t.el] });
    });
  }
  function fontIssues(p, fonts, issues) {
    fonts.groups.forEach(g => {
      const who = g.els.length === 1 ? label(g.els[0]) : g.els.slice(0, 3).map(label).join('') + `${g.els.length > 3 ? '…' : ''}等 ${g.els.length} 处`;
      const data = { size: g.fs, min: g.small ? FONT_SMALL : FONT_MIN, count: g.els.length };
      issues.push(g.small
        ? issue('warn', 'font-small', p, g.beat, `${who}标了 data-small，字号 ${g.fs}px，小于 ${FONT_SMALL}px`, data)
        : issue('error', 'font-small', p, g.beat, `${who}字号 ${g.fs}px，小于 ${FONT_MIN}px`, data));
    });
  }

  /* 第 0 拍时，这一页里看得见的 data-beat > 0 的块（有的页面故意让某个带拍的块一直显示，只用它的拍号做强调） */
  function laterBeats(slide) {
    opCache = new Map();
    return $$('[data-beat]', slide).filter(e => {
      if (!(toInt(e.dataset.beat) > 0) || !shown(e, slide)) return false;
      const r = e.getBoundingClientRect();
      return r.width >= 1 || r.height >= 1;
    });
  }
  /* 退回第 0 拍后，和第一次进这页时比：多出了看得见的 data-beat > 0 的块，或者多出了看得见的字 */
  function cleared(p, first, add) {
    const slide = p.el, R = ref();
    const left = laterBeats(slide).filter(e => !first.beats.has(e));
    left.forEach(e => add(`ncl|${uid(e)}`, issue('error', 'not-cleared', p, 0, `退回第 0 拍后，第 ${toInt(e.dataset.beat)} 拍的${label(e)}还看得见`, { beat: toInt(e.dataset.beat) })));
    texts(slide, R).forEach(t => {
      if (first.texts.has(t.el) || left.some(e => e.contains(t.el))) return;
      add(`ncl|${uid(t.el)}`, issue('error', 'not-cleared', p, 0, `退回第 0 拍后，${label(t.el)}还在（第一次进这一页时没有）`, null));
    });
  }

  /* 页面比窗口大（出滚动条）：每个尺寸只报一次 */
  const scroll = { w: 0, h: 0 };
  function scrollCheck() {
    const d = document.documentElement, b = document.body;
    scroll.w = Math.max(scroll.w, d.scrollWidth, b ? b.scrollWidth : 0);
    scroll.h = Math.max(scroll.h, d.scrollHeight, b ? b.scrollHeight : 0);
  }

  async function checkShow(sel, issues) {
    scrollCheck();
    for (const p of sel) {
      const seen = new Set();
      const add = (key, it) => { if (!seen.has(key)) { seen.add(key); issues.push(it); } };
      enter(p);
      const first = { beats: new Set(laterBeats(p.el)), texts: new Set(texts(p.el, ref()).map(t => t.el)) };
      const fonts = { seen: new Set(), groups: new Map() };
      measure(p, 0, add, fonts);
      for (let n = 1; n <= p.total; n++) { step(p, n, 1); measure(p, n, add, fonts); }
      for (let n = p.total - 1; n >= 0; n--) step(p, n, -1);
      cleared(p, first, add);
      fontIssues(p, fonts, issues);
      scrollCheck();
      await sleep(0);   // 让一让主线程，脚本那边的轮询能插进来
    }
    const dx = r1(scroll.w - innerWidth), dy = r1(scroll.h - innerHeight);
    if (dx > 1 || dy > 1) {
      const parts = [dx > 1 ? `宽 ${dx}px` : '', dy > 1 ? `高 ${dy}px` : ''].filter(Boolean).join('、');
      issues.push(issue('error', 'scrollbar', null, null, `页面比窗口${parts}，出现了滚动条`, { w: dx > 1 ? dx : 0, h: dy > 1 ? dy : 0 }));
    }
  }

  /* =================================================================
     阅读模式（竖屏）：每页的内容都已展开，只看这页是不是比屏幕宽
     ================================================================= */
  function checkReading(sel, issues) {
    sel.forEach(p => {
      const it = p.item, fr = p.el.parentNode;
      const over = Math.max(it.scrollWidth - it.clientWidth, fr ? fr.scrollWidth - fr.clientWidth : 0);
      if (over > 1) {
        issues.push(issue('error', 'reading-overflow', p, null,
          `竖屏阅读模式下这一页比屏幕宽 ${r1(over)}px（可用宽 ${r1(it.clientWidth)}，内容宽 ${r1(it.clientWidth + over)}）`, { over: r1(over) }));
      }
    });
    const d = document.documentElement, ow = d.scrollWidth - d.clientWidth;
    if (ow > 1) issues.push(issue('error', 'reading-overflow', null, null, `竖屏阅读模式下整个页面比屏幕宽 ${r1(ow)}px（屏幕宽 ${d.clientWidth}）`, { over: r1(ow) }));
  }

  /* =================================================================
     图片、截图、视频
     ================================================================= */
  async function waitMedia(sel) {
    const imgs = [], vids = [];
    sel.forEach(p => {
      $$('img', p.el).forEach(img => { if (img.loading === 'lazy') img.loading = 'eager'; if (!img.complete) imgs.push(img); });
      $$('video', p.el).forEach(v => {
        if (v.error || v.readyState > 0 || v.networkState === 3) return;
        if (v.preload === 'none') v.preload = 'metadata';
        vids.push(v);
        try { v.load(); } catch (e) { /* 忽略 */ }
      });
    });
    const once = (el, evs) => new Promise(ok => evs.forEach(ev => el.addEventListener(ev, ok, { once: true, capture: true })));
    await race(Promise.all(imgs.map(i => once(i, ['load', 'error']))), 8000);
    await race(Promise.all(vids.map(v => once(v, ['loadedmetadata', 'error']))), 5000);
  }
  function checkMedia(sel, issues) {
    sel.forEach(p => {
      const bad = msg => issues.push(issue('error', 'media-missing', p, null, msg, null));
      $$('.shot', p.el).forEach(f => {
        if (!f.classList.contains('missing')) return;
        const src = f.dataset.src || '';
        bad(src ? `截图加载失败：${src}` : '截图位没写图片地址（data-src）');
      });
      $$('img', p.el).forEach(img => {
        if (img.closest('.shot')) return;
        const src = img.getAttribute('src') || '';
        if (!src) bad('图片没写地址（src）');
        else if (!img.complete) bad(`图片过了 8 秒还没加载完：${src}`);
        else if (!img.naturalWidth) bad(`图片加载失败：${src}`);
      });
      $$('video', p.el).forEach(v => {
        const s = v.querySelector('source');
        const src = v.getAttribute('src') || (s && s.getAttribute('src')) || '';
        if (v.error || v.networkState === 3) bad(`视频加载失败：${src || '（没写地址）'}`);
      });
    });
  }

  /* =================================================================
     控制台报错、引擎提醒
     ================================================================= */
  function mediaUrls() {
    const s = new Set();
    $$('img, video, audio, source').forEach(e => { if (e.src) s.add(e.src); if (e.currentSrc) s.add(e.currentSrc); });
    return s;
  }
  /* 报错里课件目录下的地址写成相对路径（slides/ch2.js），不带本机的绝对路径 */
  function rel(txt) {
    const base = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
    let s = txt.split(base).join('');
    try { s = s.split(decodeURI(base)).join(''); } catch (e) { /* 地址解不开就算了 */ }
    return s.replace(/(^|\s|：)([^\s：]*%[0-9A-Fa-f]{2}[^\s：]*)/g, (m, a, u) => { try { return a + decodeURI(u); } catch (e) { return m; } });
  }
  function collectErrors(issues) {
    const media = mediaUrls(), done = new Set();
    errs().forEach((raw, i) => {
      const txt = String(raw).trim();
      if (!txt || done.has(txt)) return;
      done.add(txt);
      const lf = /^加载失败：(.+)$/.exec(txt);
      if (lf && media.has(lf[1])) return;            // 图片、视频加载失败已经记成 media-missing
      const pm = /页面 (\S+?) 组件初始化出错[：:]?\s*([\s\S]*)$/.exec(txt);
      const pp = pm && PAGES.find(x => x.id === pm[1]);
      if (pp) { issues.push(issue('error', 'page-error', pp, null, `建这一页时组件初始化出错：${pm[2] || txt}`, null)); return; }
      const at = errAt[i];
      const short = rel(txt);
      issues.push(issue('error', 'console-error', at ? at.p : null, at ? at.n : null, `控制台报错：${short.length > 300 ? short.slice(0, 300) + '…' : short}`, null));
    });
    pageErrs.forEach(e => issues.push(e));
  }
  function collectWarns(issues) {
    const done = new Set();
    (Array.isArray(window.__deckWarns) ? window.__deckWarns : []).forEach(raw => {
      const txt = String(raw).trim();
      if (!txt || done.has(txt)) return;
      done.add(txt);
      const m = /^页面 ([^\s：（(]+)/.exec(txt);
      const p = m && PAGES.find(x => x.id === m[1]);
      issues.push(issue('warn', 'deck-warn', p || null, null, txt, null));
    });
  }

  /* =================================================================
     跑一遍、写结果
     ================================================================= */
  /* ?pages=3 或 3-5；写错了返回 undefined（查全部，并给一条提醒） */
  function range() {
    const v = QS.get('pages');
    if (v == null || v === '') return null;
    const m = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(v);
    const a = m && +m[1], b = m && +(m[2] || m[1]);
    return m && a >= 1 && b >= a ? { a, b } : undefined;
  }

  let started = false, finished = false;
  function finish(issues) {
    if (finished) return;
    finished = true;
    const res = {
      engine: Deck.version,
      viewport: { w: innerWidth, h: innerHeight, reading: !!S.reading },
      pages: PAGES.length,
      beats: PAGES.reduce((s, p) => s + p.total, 0),
      list: PAGES.map(p => ({ no: p.i + 1, id: p.id, title: p.def.title || '', total: p.total, scene: p.scene })),
      issues,
    };
    let pre = document.getElementById('deck-selftest');
    if (!pre) { pre = document.createElement('pre'); pre.id = 'deck-selftest'; pre.hidden = true; document.body.appendChild(pre); }
    pre.textContent = JSON.stringify(res);   // 先写好结果，再设完成标记（脚本看到标记就来读）
    document.documentElement.dataset.selftest = 'done';
    const ne = issues.filter(x => x.level === 'error').length;
    console.info(`[Deck] 自检完成：${res.pages} 页 ${res.beats} 拍，${ne} 个错误、${issues.length - ne} 个提醒`);
  }

  async function runSelftest() {
    if (started) return;
    started = true;
    const issues = [];
    try {
      const rg = range();
      if (rg === undefined) issues.push(issue('warn', 'deck-warn', null, null, `地址里的 ?pages=${QS.get('pages')} 看不懂（要写成 3 或 3-5），这次查了全部页面`, null));
      const sel = PAGES.filter(p => !rg || (p.i + 1 >= rg.a && p.i + 1 <= rg.b));
      if (document.fonts && document.fonts.ready) await race(document.fonts.ready, 4000);
      await waitMedia(sel);
      if (S.reading) checkReading(sel, issues);
      else await checkShow(sel, issues);
      checkMedia(sel, issues);
      collectErrors(issues);
      if (!S.reading) collectWarns(issues);
    } catch (e) {
      issues.push(issue('error', 'page-error', null, null, `自检本身出错，结果不完整：${errText(e)}`, null));
    }
    finish(issues);
  }

  I.runSelftest = runSelftest;
  if (!SELFTEST) return;

  /* ---------- 以下只在自检模式下生效 ---------- */
  // 页面没带记录报错的那段脚本（旧课件）时，从这里开始记
  if (!Array.isArray(window.__deckErrors)) {
    const E = window.__deckErrors = [];
    addEventListener('error', e => { const t = e.target; E.push(t && t !== window && (t.src || t.href) ? '加载失败：' + (t.src || t.href) : String(e.message)); }, true);
    const o = console.error;
    console.error = function () { E.push([].slice.call(arguments).join(' ')); return o.apply(console, arguments); };
  }
  addEventListener('unhandledrejection', e => { window.__deckErrors.push('没有处理的 Promise 异常：' + errText(e.reason)); });
  // 去掉 CSS 过渡、CSS 动画一下播完、倾斜摆正
  const st = document.createElement('style');
  st.className = 'deck-selftest';
  // 页面里的元素都临时能被点到（量「被盖住」要用 elementsFromPoint，pointer-events:none 的元素它找不到）
  st.textContent = '*,*::before,*::after{transition:none!important;animation-duration:.01ms!important;animation-delay:0s!important;animation-iteration-count:1!important;rotate:none!important}'
    + '.slide,.slide *{pointer-events:auto!important}';
  document.head.appendChild(st);
  // 页面的 onBeat 换成同步跑完、记下异常的版本（pages.js、ui.js 都经总线调用）
  I.callOnBeat = callOnBeat;
  // 保险：引擎没能启动（boot 出错）时也要交一份结果，免得脚本干等
  addEventListener('load', () => setTimeout(() => {
    if (started) return;
    started = true;
    const issues = [issue('error', 'page-error', null, null, '课件加载完 20 秒了，引擎还没开始自检：多半是启动时出错了，看下面的控制台报错', null)];
    collectErrors(issues);
    finish(issues);
  }, 20000));
})();
