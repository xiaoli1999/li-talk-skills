/* =====================================================================
   演示稿引擎 · 形象（mascot.js）
   - 引擎不画任何具体的形象：长相来自 mascots/<键名>.js 用 Deck.mascot 注册的 svg(pose, opts)（接口约定 C），
     这里只管外层——标记、走位、换姿势、镜像、深色底描边、说的话，以及各种动作
   - 页面写法：<div class="mascot guide"></div> 放形象；目标元素上写 data-mascot="拍号"，
     配 data-mascot-side（top / left / right / bottom / stay）、-x、-dx、-dy、-pose、-say、-face。
     旧写法 .kid.guide、data-kid*、Deck.kid() 全部继续认，效果相同
   - 动作：
     · 每拍走或蹦到目标旁（同一页里按拍号轮换：小跑、蹦两下、跳起来转一圈；退拍、翻页时小跑），
       落地压一下，然后点头、指向，视线朝着这一拍的内容
     · 随机间隔 2.5–6 秒眨一次眼（重画时带 opts.blink）
     · 鼠标移上去变开心；点它轮换「蹦一下 / 转一圈 / 压扁回弹」，不进拍（ui.js 调 mascotClick）
     · 复制成功时替你高兴一下（ui.js 调 mascotCheer，风格写了 mascotSay.copied 就喊这句）
     · 空闲时每 8–15 秒随机做个小动作（东张西望、伸懒腰、原地小跳），翻拍或有人操作后 5 秒内不做
     · 打盹：超过 napAfter 秒没人操作才换 rest（默认 300 秒，<meta name="li-talk-nap" content="秒数"> 可改，0 不打盹），
       任何操作（按键、点击、触屏、滚轮、移动鼠标、翻拍）都会叫醒它
     · 减少动态时：不眨眼、没有空闲动作、不打盹、直接到位；自检模式（?selftest）也不眨眼、不做小动作、不打盹
   - 每个形象元素的结构（引擎生成）：
     .mascot > .mascot-body（蹦跳、压扁） > .mascot-spin（转圈） > .mascot-art（画像；CSS 镜像、描边在这层）
             > .mascot-say（说的话）
   - 依赖总线：core 的常量和工具、I.MASCOTS、I.PAGES、I.sc、I.mascotList、
     I.state（cur、mascot、mascotWarns、lastAct、reading、booted）、I.motion；build.js 的 I.boxIn
   - 挂到总线：mascotDef、mascotSvg、mascotEl、initMascotEl、bindMascot、warnMascotOnce、setPose、spotFor、applySpot、
     mascotXY、placeMascot、moveMascot、mascotCheer、mascotClick、mascotActivity、napAfter
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { W, H, G, QS, RMQ, $, clamp, esc, warn, motion, PAGES } = I;
  const S = I.state;
  const SELFTEST = QS.has('selftest');

  /* =================================================================
     当前形象
     ================================================================= */
  const POSES = ['idle', 'point', 'happy', 'rest'];
  const ALIAS = { lie: 'rest' };            // 旧写法里的姿势名
  const mascotDef = () => (S.mascot && I.MASCOTS[S.mascot]) || null;
  const hasFrame = f => { const d = mascotDef(); return !!(d && d.frames.includes(f)); };
  /* 姿势名：认四种基本姿势和形象自己的过渡帧，别的一律当 idle */
  const normPose = p => { p = ALIAS[p] || p; return POSES.includes(p) || hasFrame(p) ? p : 'idle'; };
  /* 落地压扁的原点：脚底那条线（形象的 foot） */
  const origin = () => { const d = mascotDef(); return `50% ${((d ? d.foot : 1) * 100).toFixed(1)}%`; };

  /* 画当前形象：pose 姿势，opts = { blink 闭眼, flip 自己画镜像（形象的 flipSvg 为真时才会传 true）, look 视线 [x, y] }。
     没有形象或画的时候出错返回空串（同一个姿势只报一次错） */
  const failed = new Set();
  function mascotSvg(pose, opts) {
    const d = mascotDef();
    if (!d) return '';
    const p = normPose(pose);
    try {
      const s = d.svg(p, Object.assign({ blink: false, flip: false, look: null }, opts));
      if (typeof s !== 'string') throw new Error('svg() 要返回 SVG 字符串');
      return s;
    } catch (e) {
      if (!failed.has(p)) { failed.add(p); console.error(`[Deck] 形象 ${d.key} 画姿势「${p}」时出错：`, e); }
      return '';
    }
  }

  /* 选形象时攒下的提醒（meta、风格里写的形象没注册），以及根本没有可用形象的提醒：页面真的用到形象时才说，只说一次 */
  let warned = false;
  function warnMascotOnce() {
    if (warned) return;
    warned = true;
    S.mascotWarns.forEach(m => warn(m));
    if (!S.mascot) warn(`页面里用了形象（.mascot、data-mascot，或旧写法 .kid、data-kid），可还没有可用的形象，先不显示。${I.mascotList()}`);
  }

  /* =================================================================
     标记
     ================================================================= */
  /** 生成一个形象的标记（Deck.mascotEl，旧名 Deck.kid）。opts：{ pose, size（宽，px）, x, y, face, say, guide } */
  function mascotEl(opts = {}) {
    const st = [];
    if (opts.size) st.push(`--mascot-size:${parseFloat(opts.size)}px`);
    if (opts.x != null) st.push(`left:${parseFloat(opts.x)}px`);
    if (opts.y != null) st.push(`top:${parseFloat(opts.y)}px`);
    return `<div class="mascot${opts.guide === false ? '' : ' guide'}" data-pose="${esc(opts.pose || 'idle')}"`
      + (opts.face ? ` data-face="${esc(opts.face)}"` : '') + (opts.say ? ` data-say="${esc(opts.say)}"` : '')
      + (st.length ? ` style="${st.join(';')}"` : '') + '></div>';
  }
  /* 把页面里的一个 .mascot（或旧写法 .kid）补全成形象：生成内部结构、画上第一个姿势。
     p 是所在的页（用来看风格是不是深色底）。返回这个形象的状态对象（也挂在元素的 _mascot 上） */
  function initMascotEl(m, p) {
    if (m._mascot) return m._mascot;
    const d = mascotDef();
    const legacy = m.classList.contains('kid');   // 旧写法：内部元素多带一个旧类名，页面 CSS 里的 .kid-say 之类照样生效
    m.classList.add('mascot');
    if (m.dataset.size) m.style.setProperty('--mascot-size', parseFloat(m.dataset.size) + 'px');
    m.dataset.face = m.dataset.face === 'left' ? 'left' : 'right';
    if (d.flipSvg) m.classList.add('self-flip');
    // 深色底的风格：形象外层加一圈浅色描边（形象自带亮边的写 outline: false）
    if (p && I.sc(p.scene).dark && d.outline !== false) m.classList.add('outline');
    m.innerHTML = `<div class="mascot-body${legacy ? ' kid-body' : ''}"><div class="mascot-spin"><div class="mascot-art"></div></div></div>`
      + `<span class="mascot-say${legacy ? ' kid-say' : ''}"></span>`;
    m.title = d.label;
    m.setAttribute('aria-hidden', 'true');
    const k = {
      el: m, body: $('.mascot-body', m), spin: $('.mascot-spin', m), art: $('.mascot-art', m), say: $('.mascot-say', m), svg: null,
      pose: '', face: m.dataset.face, blink: false, lookW: null, page: null,
    };
    m._mascot = k;
    setState(k, { pose: m.dataset.pose || 'idle', force: true });
    return k;
  }
  /* 页面的向导形象（.mascot.guide）：记下起始姿势，挂上悬停。返回的对象就是 page.mascot */
  function bindMascot(p, g) {
    const k = initMascotEl(g, p);
    Object.assign(k, {
      page: p, cur: null,
      home: { pose: normPose(g.dataset.pose || 'idle'), face: g.dataset.face || 'right', say: g.dataset.say || '' },
      hover: false, walking: false, napping: false, cheering: false,
      fx: null,          // 形象自己的小动画（空闲动作、点它的反应、复制时的高兴、醒来），翻拍时收掉
      breath: null,      // 打盹时的呼吸
      cheerT: 0, reactI: 0, lastReact: '', lastIdle: '',
    });
    k.body.addEventListener('mouseenter', () => onEnter(k));
    k.body.addEventListener('mouseleave', () => onLeave(k));
    return k;
  }

  /* =================================================================
     换姿势、朝向、视线（合在一起只重画一次）
     ================================================================= */
  const sameVec = (a, b) => (!a && !b) || (!!a && !!b && Math.abs(a[0] - b[0]) < .05 && Math.abs(a[1] - b[1]) < .05);
  function draw(k) {
    const d = mascotDef(), v = k.lookW;
    // 视线按画像自己的坐标给：x 正向是它面朝的方向（引擎用 CSS 镜像朝左时，要把 x 反过来）
    const look = v ? [k.face === 'left' ? -v[0] : v[0], v[1]] : null;
    k.art.innerHTML = mascotSvg(k.pose, { blink: k.blink, flip: !!d.flipSvg && k.face === 'left', look });
    k.svg = k.art.firstElementChild;
  }
  /* o = { pose, face, look（世界坐标里的方向，null 为正视）, blink, force } */
  function setState(k, o) {
    const d = mascotDef();
    let dirty = !!o.force;
    if (o.pose != null) { const p = normPose(o.pose); if (p !== k.pose) { k.pose = p; k.blink = false; dirty = true; } }
    if (o.face != null) {
      const f = o.face === 'left' ? 'left' : 'right';
      if (f !== k.face) { k.face = f; k.el.dataset.face = f; if (d.flipSvg || k.lookW) dirty = true; }
    }
    if (o.look !== undefined && !sameVec(k.lookW, o.look)) { k.lookW = o.look || null; dirty = true; }
    if (o.blink != null && o.blink !== k.blink) { k.blink = o.blink; dirty = true; }
    if (dirty) draw(k);
  }
  const setPose = (k, pose) => setState(k, { pose });
  /* 回到这一拍该有的姿势（鼠标停在身上、正在高兴时保持开心；打盹时不动） */
  function restPose(k) {
    if (k.napping) return;
    setPose(k, k.hover || k.cheering ? 'happy' : (k.cur ? k.cur.pose : k.home.pose));
  }
  function bubble(k, text) {
    if (text) { k.say.textContent = text; k.say.classList.remove('on'); void k.say.offsetWidth; k.say.classList.add('on'); }
    else k.say.classList.remove('on');
  }
  /* 形象自己的小动画：记在 k.fx 上，播完自己清掉 */
  function own(k, anim) {
    k.fx = anim;
    anim.eventCallback('onComplete', () => { if (k.fx === anim) k.fx = null; });
    return anim;
  }
  function finishFx(k) { if (k.fx) { const t = k.fx; k.fx = null; t.progress(1); t.kill(); } }
  function resetBody(k) { if (G) { G.killTweensOf([k.body, k.spin]); G.set([k.body, k.spin], { clearProps: 'transform' }); } }
  /* 收起所有自己的小动画、打盹、高兴（翻拍、直接摆好时） */
  function stopActs(k) {
    if (k.fx) { const t = k.fx; k.fx = null; t.kill(); }
    if (k.breath) { k.breath.kill(); k.breath = null; }
    clearTimeout(k.cheerT); k.cheering = false;
    if (k.napping) { k.napping = false; k.el.classList.remove('napping'); }
    if (k.blink) setState(k, { blink: false });
  }

  /* =================================================================
     落脚点与走位
     ================================================================= */
  /* 读目标上的形象属性：data-mascot-* 优先，没有就读旧写法 data-kid-* */
  const dv = (ds, name) => { const a = ds['mascot' + name]; return a != null && a !== '' ? a : ds['kid' + name]; };
  /* 第 n 拍时形象该在哪：取 data-mascot（或 data-kid）≤ n 的最后一个目标；没有就待在原地。
     返回 { x, y（相对放在页面上的位置的位移）, pose, face, say, look（视线方向，世界坐标）} */
  function spotFor(p, n) {
    const k = p.mascot, s = p.el;
    let tg = null;
    p.targets.forEach(t => { if (t.beat <= n && (!tg || t.beat >= tg.beat)) tg = t; });   // 拍号最大的那个；同一拍取写在后面的
    const kw = k.el.offsetWidth, kh = k.el.offsetHeight;
    if (!tg) return { x: 0, y: 0, pose: k.home.pose, face: k.home.face, say: k.home.say, look: null };
    const b = I.boxIn(tg.el, s), ds = tg.el.dataset;
    const side = dv(ds, 'Side') || 'top';
    const pose = normPose(dv(ds, 'Pose') || 'point'), say = dv(ds, 'Say') || '', faceSet = dv(ds, 'Face');
    if (side === 'stay') {   // 原地不动，只换姿势、说话
      const base = tg.beat > 0 ? spotFor(p, tg.beat - 1) : { x: 0, y: 0, face: k.home.face, look: null };
      return { x: base.x, y: base.y, pose, face: faceSet || base.face, say, look: base.look };
    }
    const fx = dv(ds, 'X') != null ? parseFloat(dv(ds, 'X')) : .12;
    const foot = mascotDef().foot;
    let x, y, face;
    if (side === 'left') { x = b.l - kw - 14; y = b.t + b.h / 2 - kh / 2; face = 'right'; }
    else if (side === 'right') { x = b.l + b.w + 14; y = b.t + b.h / 2 - kh / 2; face = 'left'; }
    else if (side === 'bottom') { x = b.l + b.w * fx; y = b.t + b.h + 10; face = 'right'; }
    else { x = b.l + (b.w - kw) * fx; y = b.t - kh * foot; face = 'right'; }   // 站在目标上沿：脚底踩在上边线
    x += parseFloat(dv(ds, 'Dx')) || 0; y += parseFloat(dv(ds, 'Dy')) || 0;
    x = clamp(x, 8, W - kw - 8); y = clamp(y, 8, H - kh - 4);
    // 视线：从形象的脸看向目标中间
    const vx = b.l + b.w / 2 - (x + kw / 2), vy = b.t + b.h / 2 - (y + kh * .45), dd = Math.hypot(vx, vy) || 1;
    const hl = k.el.offsetLeft, ht = k.el.offsetTop;
    return { x: x - hl, y: y - ht, pose, face: faceSet || face, say, look: [vx / dd, vy / dd] };
  }
  function applySpot(k, sp) {
    const same = k.cur && k.cur.pose === sp.pose && k.cur.face === sp.face && k.cur.say === sp.say && k.say.classList.contains('on') === !!sp.say;
    k.cur = sp;
    if (same) return;
    setState(k, { pose: k.hover ? 'happy' : sp.pose, face: sp.face, look: sp.look });
    bubble(k, sp.say);
  }
  function mascotXY(k) { return G ? { x: +G.getProperty(k.el, 'x') || 0, y: +G.getProperty(k.el, 'y') || 0 } : { x: 0, y: 0 }; }
  /* 直接摆到第 n 拍的位置（不播动画） */
  function placeMascot(p, n) {
    const k = p.mascot;
    if (!k) return;
    stopActs(k);
    const sp = spotFor(p, n), e = k.el;
    if (G) { G.killTweensOf(e); G.set(e, { x: sp.x, y: sp.y }); resetBody(k); }
    else e.style.transform = `translate(${sp.x}px,${sp.y}px)`;
    e.style.removeProperty('opacity'); e.style.removeProperty('visibility');
    e.classList.remove('walk');
    k.walking = false;
    k.cur = null;
    applySpot(k, sp);
  }
  /* 到位后的小表演：点头（举手指时跟着点一下，开心时连点两下） */
  function nod(tl, k, sp, t) {
    if (!G) return;
    const n = sp.pose === 'happy' ? 3 : 1;
    tl.fromTo(k.body, { y: 0 }, { y: 4, duration: .1, yoyo: true, repeat: n, ease: 'sine.inOut', immediateRender: false }, t);
  }
  /* 第 n 拍用哪种走法：第 1 拍小跑、第 2 拍蹦两下、第 3 拍跳起来转一圈，再往后轮着来；不给 n（退拍、翻页）就小跑 */
  const TRAVEL = ['twirl', 'run', 'hop'];
  /* 从 from 走到 sp（都是相对位移），往 tl 的第 t 秒起加动画：起步、移动、落地压一下，然后摆姿势、点头、说话。
     走动时有 walk 过渡帧就用它，腾空转圈时有 jump 就用它（没有用 happy），落地时有 squat 就蹲一下。返回用时 */
  function moveMascot(tl, p, from, sp, t, n) {
    const k = p.mascot;
    if (!k) return 0;
    stopActs(k);
    resetBody(k);
    const dist = Math.hypot(sp.x - from.x, sp.y - from.y);
    if (dist < 3) {
      const changed = !k.cur || k.cur.pose !== sp.pose || k.cur.say !== sp.say;
      tl.call(() => applySpot(k, sp), null, t);
      if (changed) nod(tl, k, sp, t + .05);
      return 0;
    }
    const kind = n == null ? 'run' : TRAVEL[n % TRAVEL.length];
    const dir = sp.x < from.x ? 'left' : 'right';
    const ground = hasFrame('walk') ? 'walk' : 'idle';
    const start = pose => tl.call(() => {
      k.walking = true; k.el.classList.add('walk'); k.say.classList.remove('on');
      setState(k, { pose, face: dir, look: null });
    }, null, t);
    let d;
    if (kind === 'hop') {            // 蹦、蹦两下
      d = clamp(.5 + dist / 3000, .56, .8);
      const h = d / 2;
      start(ground);
      tl.fromTo(k.el, { x: from.x, y: from.y }, { x: sp.x, y: sp.y, duration: d, ease: 'none', immediateRender: false }, t);
      [[0, 58], [h, 40]].forEach(([s0, ht]) => {
        tl.fromTo(k.body, { y: 0 }, { y: -ht, duration: h / 2, ease: 'power2.out', immediateRender: false }, t + s0)
          .to(k.body, { y: 0, duration: h / 2, ease: 'power2.in' }, t + s0 + h / 2);
      });
      tl.fromTo(k.body, { scaleX: 1.1, scaleY: .9, transformOrigin: origin() }, { scaleX: 1, scaleY: 1, duration: .1, immediateRender: false }, t + h);
    } else if (kind === 'twirl') {   // 高高跳起，空中转一圈
      d = .62;
      start(hasFrame('jump') ? 'jump' : 'happy');
      tl.fromTo(k.el, { x: from.x, y: from.y }, { x: sp.x, y: sp.y, duration: d, ease: 'power1.inOut', immediateRender: false }, t)
        .fromTo(k.body, { y: 0 }, { y: -Math.min(92, 46 + dist * .08), duration: d / 2, ease: 'power2.out', immediateRender: false }, t)
        .to(k.body, { y: 0, duration: d / 2, ease: 'power2.in' }, t + d / 2)
        .fromTo(k.spin, { rotation: 0 }, { rotation: dir === 'left' ? -360 : 360, duration: d * .9, ease: 'power1.inOut', immediateRender: false }, t + .03)
        .set(k.spin, { rotation: 0 }, t + d);
    } else {                         // 小跑：抛物线过去，腿交替
      d = clamp(.32 + dist / 2600, .4, .75);
      const peak = Math.min(from.y, sp.y) - Math.min(130, 36 + dist * .14);
      start(ground);
      tl.fromTo(k.el, { x: from.x }, { x: sp.x, duration: d, ease: 'power1.inOut', immediateRender: false }, t);
      tl.fromTo(k.el, { y: from.y }, { y: peak, duration: d * .45, ease: 'power2.out', immediateRender: false }, t);
      tl.to(k.el, { y: sp.y, duration: d * .55, ease: 'power2.in' }, t + d * .45);
    }
    // 落地压一下（有 squat 帧就先蹲 0.12 秒），然后摆姿势、点头、说话
    const squat = hasFrame('squat');
    tl.call(() => {
      k.el.classList.remove('walk'); k.walking = false;
      if (squat) setPose(k, 'squat'); else { k.cur = null; applySpot(k, sp); }
    }, null, t + d);
    if (squat) tl.call(() => { k.cur = null; applySpot(k, sp); }, null, t + d + .12);
    tl.fromTo(k.body, { scaleY: .84, scaleX: 1.1, transformOrigin: origin() }, { scaleY: 1, scaleX: 1, duration: .26, ease: 'back.out(3)', immediateRender: false }, t + d);
    nod(tl, k, sp, t + d + .26);
    return d + .5;
  }

  /* =================================================================
     悬停、点它、复制时的高兴
     ================================================================= */
  function onEnter(k) {
    k.hover = true;
    mascotActivity();
    if (k.walking || k.cheering) return;
    finishFx(k);
    setPose(k, 'happy');
    if (motion()) own(k, G.fromTo(k.body, { scaleX: 1.06, scaleY: .94, transformOrigin: origin() }, { scaleX: 1, scaleY: 1, duration: .3, ease: 'back.out(3)' }));
  }
  function onLeave(k) { k.hover = false; if (!k.walking && !k.cheering) restPose(k); }

  /* 点形象（ui.js 调用，body 是被点的 .mascot-body）：向导形象轮换三种反应，都不进拍；页面上装饰用的形象只蹦一下 */
  const REACTS = ['hop', 'spin', 'squash'];
  function mascotClick(body) {
    mascotActivity();
    const m = body.closest('.mascot'), k = m && m._mascot;
    if (!k) return;
    if (!k.page) { if (motion()) G.fromTo(k.body, { y: 0 }, { y: -26, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' }); return; }
    react(k);
  }
  function react(k, kind) {
    if (k.walking) return;
    finishFx(k);
    kind = kind || REACTS[k.reactI++ % REACTS.length];
    k.lastReact = kind;
    k.cheering = true;
    clearTimeout(k.cheerT);
    setPose(k, 'happy');
    let end = 1.3;
    if (motion()) {
      resetBody(k);
      const tl = own(k, G.timeline()), o = origin();
      if (kind === 'spin') {            // 跳起来转一圈
        tl.to(k.body, { y: -30, duration: .22, ease: 'power2.out' }, 0)
          .to(k.body, { y: 0, duration: .22, ease: 'power2.in' }, .22)
          .fromTo(k.spin, { rotation: 0 }, { rotation: k.face === 'left' ? -360 : 360, duration: .46, ease: 'power1.inOut' }, 0)
          .set(k.spin, { rotation: 0 }, .46)
          .fromTo(k.body, { scaleX: 1.12, scaleY: .88, transformOrigin: o }, { scaleX: 1, scaleY: 1, duration: .22, ease: 'back.out(3)', immediateRender: false }, .46);
        end = 1.2;
      } else if (kind === 'squash') {   // 压扁，再弹回来
        tl.to(k.body, { scaleX: 1.22, scaleY: .72, duration: .14, ease: 'power2.out', transformOrigin: o }, 0)
          .to(k.body, { scaleX: 1, scaleY: 1, duration: .62, ease: 'elastic.out(1.2,.35)' }, .2);
        end = 1.1;
      } else {                          // 蹦一下：先蹲、空中拉长、落地压扁回弹
        tl.to(k.body, { scaleX: 1.08, scaleY: .9, duration: .08, ease: 'power1.out', transformOrigin: o }, 0)
          .to(k.body, { y: -36, scaleX: .93, scaleY: 1.08, duration: .2, ease: 'power2.out' }, .08)
          .to(k.body, { y: 0, scaleX: 1, scaleY: 1, duration: .17, ease: 'power2.in' }, .28)
          .fromTo(k.body, { scaleX: 1.12, scaleY: .88 }, { scaleX: 1, scaleY: 1, duration: .22, ease: 'back.out(3)', immediateRender: false }, .45);
        end = 1.2;
      }
    }
    k.cheerT = setTimeout(() => { k.cheering = false; if (!k.walking) restPose(k); }, end * 1000);
  }
  /* 复制成功：开心地蹦一下；say 是风格的口头禅（mascotSay.copied），写了就由形象喊出来；1.5 秒后回到这一拍的样子 */
  function mascotCheer(k, say) {
    if (!k || !k.page) return;
    mascotActivity();
    finishFx(k);
    k.cheering = true;
    setPose(k, 'happy');
    if (say) bubble(k, say);
    if (motion()) {
      resetBody(k);
      own(k, G.fromTo(k.body, { y: 0 }, { keyframes: [{ y: -30, scaleX: .94, scaleY: 1.07, duration: .18, ease: 'power2.out' }, { y: 0, scaleX: 1.1, scaleY: .9, duration: .16, ease: 'power2.in' }, { scaleX: 1, scaleY: 1, duration: .14 }], transformOrigin: origin() }));
    }
    clearTimeout(k.cheerT);
    k.cheerT = setTimeout(() => {
      k.cheering = false;
      if (!k.cur || k.walking) return;
      const c = k.cur; k.cur = null; applySpot(k, c);
    }, 1500);
  }

  /* =================================================================
     眨眼、空闲动作、打盹
     ================================================================= */
  const curMascot = () => { const p = PAGES[S.cur.p]; return p && p.mascot && p.el.classList.contains('active') ? p.mascot : null; };
  const lively = () => S.booted && motion() && !SELFTEST && !document.hidden;

  /* 眨眼：随机间隔 2.5–6 秒，闭眼 140ms；只在平常站着、指着的时候眨 */
  (function blinkLoop() {
    setTimeout(() => {
      const k = lively() && curMascot();
      if (k && !k.walking && !k.napping && !k.fx && !k.blink && (k.pose === 'idle' || k.pose === 'point')) {
        setState(k, { blink: true });
        setTimeout(() => { if (k.blink) setState(k, { blink: false }); }, 140);
      }
      blinkLoop();
    }, 2500 + Math.random() * 3500);
  })();

  /* 空闲时的小动作（8–15 秒随机一次，不重复上一个） */
  const IDLES = {
    look(tl, k) {        // 东张西望：先看左后看右，身子跟着歪一点
      const v = k.lookW;
      tl.call(() => setState(k, { pose: 'idle', look: [-.9, -.3] }))
        .to(k.body, { rotation: -3, duration: .3, ease: 'sine.inOut', transformOrigin: origin() })
        .call(() => setState(k, { look: [.9, -.3] }), null, '+=.55')
        .to(k.body, { rotation: 3, duration: .4, ease: 'sine.inOut' }, '<')
        .call(() => { setState(k, { look: v }); restPose(k); }, null, '+=.55')
        .to(k.body, { rotation: 0, duration: .3, ease: 'sine.inOut' }, '<');
    },
    stretch(tl, k) {     // 伸个懒腰：闭着眼往上一拉，再回弹
      tl.call(() => setState(k, { pose: 'idle', blink: true }))
        .to(k.body, { scaleX: .94, scaleY: 1.09, duration: .4, ease: 'sine.out', transformOrigin: origin() })
        .to(k.body, { scaleX: 1, scaleY: 1, duration: .45, ease: 'back.out(2.5)' }, '+=.35')
        .call(() => { setState(k, { blink: false }); restPose(k); });
    },
    bounce(tl, k) {      // 原地小跳两下
      tl.call(() => setPose(k, 'happy'))
        .to(k.body, { y: -16, duration: .14, ease: 'power2.out' })
        .to(k.body, { y: 0, duration: .14, ease: 'power2.in' })
        .to(k.body, { y: -10, duration: .12, ease: 'power2.out' }, '+=.04')
        .to(k.body, { y: 0, duration: .12, ease: 'power2.in' })
        .call(() => restPose(k));
    },
  };
  function idleAct() {
    const k = lively() && curMascot();
    if (!k || !k.cur || k.walking || k.hover || k.cheering || k.napping || k.fx) return;
    if (S.running || S.pageTl || Date.now() - S.lastAct < 5000) return;
    const pool = Object.keys(IDLES).filter(x => x !== k.lastIdle), key = pool[Math.random() * pool.length | 0];
    k.lastIdle = key;
    resetBody(k);
    IDLES[key](own(k, G.timeline()), k);
  }
  (function idleLoop() { setTimeout(() => { idleAct(); idleLoop(); }, 8000 + Math.random() * 7000); })();

  /* 多久没人操作才打盹（秒）：<meta name="li-talk-nap" content="秒数">，默认 300，0 表示不打盹 */
  let napSec = null;
  function napAfter() {
    if (napSec != null) return napSec;
    napSec = 300;
    const m = document.querySelector('meta[name="li-talk-nap"]');
    if (m) {
      const raw = String(m.getAttribute('content') || '').trim(), v = Number(raw);
      if (raw !== '' && isFinite(v) && v >= 0) napSec = v;
      else warn(`<meta name="li-talk-nap"> 要写成秒数（0 表示不打盹），这里是「${raw}」，先按默认的 300 秒`);
    }
    return napSec;
  }
  function nap(k) {
    finishFx(k);
    k.napping = true;
    k.el.classList.add('napping');
    k.say.classList.remove('on');
    setPose(k, 'rest');
    if (G) { resetBody(k); k.breath = G.to(k.body, { scaleX: 1.03, scaleY: .96, transformOrigin: origin(), duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }); }
  }
  function wake(k) {
    if (!k.napping) return;
    k.napping = false;
    k.el.classList.remove('napping');
    if (k.breath) { k.breath.kill(); k.breath = null; }
    resetBody(k);
    if (k.cur) { const c = k.cur; k.cur = null; applySpot(k, c); } else setPose(k, k.home.pose);
    if (motion()) own(k, G.fromTo(k.body, { y: 0 }, { y: -18, duration: .14, yoyo: true, repeat: 1, ease: 'power2.out' }));   // 一激灵醒过来
  }
  /* 每秒看一次：当前页的形象超过 napAfter 秒没人理就打盹（减少动态、阅读模式、自检时不打盹） */
  function napCheck() {
    const sec = napAfter();
    if (!sec || !S.booted || S.reading || RMQ.matches || SELFTEST) return;
    const k = curMascot();
    if (!k || !k.cur || k.napping || k.walking || k.cheering || k.hover) return;
    if (Date.now() - S.lastAct >= sec * 1000) nap(k);
  }
  setInterval(napCheck, 1000);

  /* 有人操作了：记下时刻（空闲动作、打盹看它），正在打盹的形象醒过来。
     输入事件在捕获阶段先到这里（先醒、再处理翻拍）；pages.js 的 afterChange 每次翻拍也会调一次（演讲者窗口遥控时主窗口收不到按键） */
  function mascotActivity() {
    S.lastAct = Date.now();
    const p = PAGES[S.cur.p], k = p && p.mascot;
    if (k && k.napping) wake(k);
  }
  ['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart'].forEach(t => document.addEventListener(t, mascotActivity, { capture: true, passive: true }));

  Object.assign(I, {
    mascotDef, mascotSvg, mascotEl, initMascotEl, bindMascot, warnMascotOnce, setPose, spotFor, applySpot,
    mascotXY, placeMascot, moveMascot, mascotCheer, mascotClick, mascotActivity, napAfter,
  });
})();
