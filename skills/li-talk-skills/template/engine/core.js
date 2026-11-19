/* =====================================================================
   演示稿引擎 · 核心（core.js）
   - 最先执行的引擎文件：建好 window.Deck 和内部总线 Deck._（各文件里记作 I）
   - 负责：共享常量、工具函数、可变状态 I.state、外壳元素表 I.dom、
     页面注册 Deck.add、风格注册 Deck.scene（注册表 I.SCENES，内置朴素风格 plain）、
     形象注册 Deck.mascot（注册表 I.MASCOTS）与选形象 pickMascot（选中的键名在 I.state.mascot）、
     提示条 toast、等字体、主题行缩字、风格混用检查、启动 boot（自检模式下交给 selftest.js 的 I.runSelftest）、对外接口；
     [Deck] 提醒 warn 同时记进 window.__deckWarns（自检记成 deck-warn）；
     点了不进拍的元素 NO_ADVANCE、署名的链接 SIGN_URL、开场时长上限 INTRO_MAX
   - 引入顺序固定：vendor/gsap.min.js → vendor/rough.min.js → engine/core.js → build.js
     → beats.js → mascot.js → pages.js → ui.js → presenter.js → tools.js → selftest.js
     → scenes/*.js → mascots/*.js → 各章 slides/*.js
   - 其余引擎文件都写成 (function () { 'use strict'; const I = Deck._; … })()，
     跨文件调用一律写 I.某函数()；可变状态一律读写 I.state.某项，不在各文件里留副本
   - 启动：DOMContentLoaded 时调用 I.boot()，这时引擎和各章的同步脚本都已执行完
   - 各章用 Deck.add({...}) 注册页面，页面顺序 = 调用顺序；
     页面里用 data-beat="n" 标出每块属于第几拍，拍数由引擎自动算
   - 普通 <script src> 引入，双击 file:// 打开即可用，不依赖网络
   ===================================================================== */
(function () {
  'use strict';

  /* 内部总线：各引擎文件共享的常量、工具、状态和函数都挂在这里 */
  const I = {};

  const W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg';
  const MAX_BEAT = 1.2;                                                // 单拍动效总时长上限（秒）
  const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter']);
  const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']);
  const G = window.gsap, R = window.rough;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const QS = new URLSearchParams(location.search);
  const FORCE = QS.has('read') ? 'read' : QS.has('show') ? 'show' : '';
  const SHOW_NOTES = QS.get('notes') === '1';   // 阅读模式默认不公开讲词；?notes=1 才显示
  const SELFTEST = QS.has('selftest');          // 自检模式（selftest.js）：不播开场、不播动画，boot 交给 I.runSelftest
  const INTRO_MAX = 2.4;                        // 开场（风格的 intro 加上形象落下）总时长上限（秒），超了就整体加速
  /* 点到这些元素（或它们里面）不进拍：可复制的命令、署名、形象、链接、视频音频、截图位、展开详情、表单、按钮，
     以及页面自己标了 data-noclick（旧写法 .no-advance）的元素；页面和风格要加「点了不翻拍」的元素，标 data-noclick 即可。
     其中 [data-copy]、截图位、形象另有自己的反应（复制、看大图、蹦一下），在 ui.js 的点击处理里先于这条判断 */
  const NO_ADVANCE = '[data-copy], .li-sign, .mascot, .kid, a, video, audio, .shot, details, summary, input, textarea, select, button, label, [data-noclick], .no-advance, #toast, #lightbox';
  /* 最后一页的署名链接（build.js 的 addSign 加上，ui.js 的 placeSign 找位置） */
  const SIGN_URL = 'https://github.com/xiaoli1999/li-talk-skills';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* [Deck] 提醒：打到控制台，同时记进 window.__deckWarns（自检把每一条记成 deck-warn 提醒） */
  const WARNS = Array.isArray(window.__deckWarns) ? window.__deckWarns : (window.__deckWarns = []);
  const warnText = a => a.map(v => {
    if (typeof v === 'string') return v;
    if (v instanceof Element) { const c = typeof v.className === 'string' ? v.className.trim().split(/\s+/).filter(Boolean).join('.') : ''; return '<' + v.tagName.toLowerCase() + (c ? '.' + c : '') + '>'; }
    if (v instanceof Error) return v.message;
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }).join(' ');
  const warn = (...a) => { WARNS.push(warnText(a)); console.warn('[Deck]', ...a); };
  const toInt = v => { const n = parseInt(v, 10); return isNaN(n) ? NaN : n; };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  if (!G) console.error('[Deck] 没加载到 gsap（vendor/gsap.min.js），动效全部关闭，只做直接显示');
  if (!R) console.error('[Deck] 没加载到 rough.js（vendor/rough.min.js），手绘线退回普通线条');

  const DEFS = [];          // 注册进来的页面定义
  const PAGES = [];         // 构建好的页面

  /* 可变状态：所有引擎文件读写的都是这一份（不要在别的文件里拷一份同名变量） */
  const S = {
    booted: false,
    reading: false,           // 是否处于竖屏阅读模式
    cur: { p: 0, b: 0 },      // 当前第几页（从 0 起）、第几拍
    running: null,            // 正在播放的节拍动画（再按一下就快进到结尾）
    pageTl: null,             // 正在播放的翻页动画
    curScene: null,           // 当前风格（键名）
    mountedScene: null,       // 调用过 mount、还没 unmount 的风格（阅读模式下为 null）
    forceScene: null,         // 地址 ?scene=<键名> 指定且已注册的风格：所有页面临时都用它
    sceneTl: null,            // 换风格时外框（章节、页码、节拍格）淡出再淡入的动画
    pres: null,               // 演讲者窗口
    timer: { acc: 0, start: 0 },   // 计时（刷新后保留）：acc 已累计的毫秒，start 本轮开始的时刻
    toastT: 0,                // 提示条自动消失的定时器
    mascot: null,             // 这份课件用的形象（键名）；没有可用的形象时为 null（pickMascot 选出）
    mascotWarns: [],          // 选形象时攒下的提醒：页面真的用到形象时才说（mascot.js 的 warnMascotOnce）
    lastAct: 0,               // 最近一次有人操作（按键、点击、触屏、滚轮、移动鼠标、翻拍）的时刻：形象的空闲动作和打盹看它
    signAt: null,             // 署名在最后一页上的位置 { x, y, at: 'right' | 'left' | 'center' }（ui.js 的 placeSign 启动时量一次）
  };
  /* 外壳里的元素：build.js 的 buildShell 填上；bg 是各风格的背景层（键名 → 元素）；sign 是最后一页的署名（build.js 的 addSign） */
  const dom = { bg: {} };
  /* 要不要播动画：没有 gsap、开了「减少动态」、阅读模式、自检模式时都不播（翻拍、走位直接到位） */
  const motion = () => !!G && !RMQ.matches && !S.reading && !SELFTEST;

  /* =================================================================
     风格注册表：Deck.scene(key, opts)（接口约定 B）
     - 每种风格是 scenes/ 下的 <键名>.js 和 <键名>.css，js 里调用 Deck.scene 注册
     - 引擎只按注册表办事，不认识任何具体的风格；内置一个朴素风格 plain 兜底
     ================================================================= */
  const SCENES = {};
  const FAMILY = { corp: '企业', hand: '手绘', modern: '现代', pixel: '像素' };
  /* 认识的字段和类型：类型不对的字段给提醒并丢掉，引擎改走默认做法 */
  const SCENE_FIELDS = {
    label: 'string', family: 'string', dark: 'boolean', mascot: 'string',
    enter: 'string', enterBy: 'object', titleIn: 'string', ease: 'object', recede: 'number',
    rough: 'object', fx: 'object', plan: 'function', decorate: 'function', backdrop: 'function',
    onBack: 'function', pageTurn: 'function', copied: 'function', mascotSay: 'object', intro: 'function',
    mount: 'function', unmount: 'function', ripple: 'function', zones: 'array', defs: 'string',
  };
  /* 手绘线的默认参数（风格的 rough 只写要改的项）：strokeWidth 线宽、roughness 粗糙度、bowing 弯曲度，
     hachureGap / hachureAngle / fillWeight 填充线的间距、角度、粗细，markWidth 圈注的线宽；
     可选 markRoughness / markBowing 圈注的粗糙度、弯曲度（不写时：roughness ≥ 1 用圈注的默认 1.4 / 1.2，
     小于 1 按 roughness 的比例变直，见 beats.js 的 buildMark） */
  const ROUGH = { strokeWidth: 2.6, roughness: 1.1, bowing: 1, hachureGap: 9, hachureAngle: -41, fillWeight: 2.6, markWidth: 3.5 };
  /* 内置的朴素风格：浅色底、墨色字、无装饰；样子写在 engine.css 里，只用 CSS 变量的默认值 */
  SCENES.plain = { key: 'plain', label: '朴素', family: 'modern', enter: 'rise', titleIn: 'fade' };

  const typeOf = v => Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
  function scene(key, opts) {
    if (S.booted) { warn(`Deck.scene 要在页面加载完之前调用：把风格文件用 <script src> 写进 index.html。这次注册的「${key}」被忽略`); return; }
    if (typeof key !== 'string' || !/^[a-z][a-z0-9-]*$/.test(key)) { warn('Deck.scene 的第一个参数是风格的键名：小写字母开头，只含小写字母、数字和 -。这次收到：', key); return; }
    if (!opts || typeof opts !== 'object') { warn(`风格 ${key}：Deck.scene 的第二个参数要是一个对象，这次注册被忽略`); return; }
    const o = { key };
    Object.keys(opts).forEach(k => {
      const want = SCENE_FIELDS[k];
      if (!want) { warn(`风格 ${key}：不认识的字段「${k}」，已忽略。认识的字段：${Object.keys(SCENE_FIELDS).join('、')}`); return; }
      const got = typeOf(opts[k]);
      if (got !== want) { warn(`风格 ${key}：字段 ${k} 应该是 ${want}，这里是 ${got}，已忽略，改走默认做法`); return; }
      o[k] = opts[k];
    });
    if (!o.label) { warn(`风格 ${key}：没写 label（给人看的名字），先叫它 ${key}`); o.label = key; }
    if (!FAMILY[o.family]) { warn(`风格 ${key}：family 只能是 corp（企业）、hand（手绘）、modern（现代）、pixel（像素），这里是「${o.family}」，先按 modern 处理`); o.family = 'modern'; }
    if (o.recede != null && !(o.recede >= 0 && o.recede <= 1)) { warn(`风格 ${key}：recede 要在 0 到 1 之间，这里是 ${o.recede}，已忽略`); delete o.recede; }
    // 讲过的字也要看得清：再淡，后排就看不见了
    if (o.recede != null && o.recede < .75) { warn(`风格 ${key}：recede 不能低于 .75（讲过的字会淡到看不清），这里是 ${o.recede}，已按 .75`); o.recede = .75; }
    if (SCENES[key]) warn(`风格 ${key} 重复注册了，以后注册的为准`);
    SCENES[key] = o;
  }
  /* 按键名取风格；没注册的给朴素风格 */
  const sc = key => SCENES[key] || SCENES.plain;
  /* 某个风格的手绘线参数：默认值加上风格的 rough */
  const roughOf = key => Object.assign({}, ROUGH, sc(key).rough);
  /* 调用风格的钩子：钩子不存在返回 undefined；出错只记一条报错，不影响放映 */
  function hook(s, name, ...args) {
    const f = s && s[name];
    if (typeof f !== 'function') return undefined;
    try { return f.apply(s, args); } catch (e) { console.error(`[Deck] 风格 ${s.key} 的 ${name} 出错：`, e); return undefined; }
  }
  /* 已注册的风格（不含朴素），给提醒用：「已注册的风格：<label> <键名>、…」 */
  function sceneList() {
    const ks = Object.keys(SCENES).filter(k => k !== 'plain');
    return ks.length ? '已注册的风格：' + ks.map(k => `${SCENES[k].label} ${k}`).join('、') : '还没有注册任何风格（index.html 里要引入 scenes/<键名>.js）';
  }
  /* 所有页面建好后：用到的风格不属于同一家时给提醒（退回朴素样子的页不算） */
  function checkFamilies() {
    const used = [];
    PAGES.forEach(p => { if (!p.fallback && !used.includes(p.scene)) used.push(p.scene); });
    const base = used[0];
    if (!base) return;
    const seen = new Set([sc(base).family]);
    used.forEach(k => {
      const f = sc(k).family;
      if (seen.has(f)) return;
      seen.add(f);
      warn(`风格混用了不同的家：${sc(base).label}（${FAMILY[sc(base).family]}）和 ${sc(k).label}（${FAMILY[f]}）。同一份课件里最好只用同一家的风格`);
    });
  }

  /* =================================================================
     形象注册表：Deck.mascot(key, opts)（接口约定 C）
     - 每个形象是 mascots/ 下的 <键名>.js，里面调用 Deck.mascot 注册；引擎不认识任何具体的形象
     - 一份课件只用一个形象（按章换风格时形象不跟着换），选中的键名存在 I.state.mascot
     ================================================================= */
  const MASCOTS = {};
  const MASCOT_FIELDS = {
    label: 'string', svg: 'function', size: 'array', foot: 'number', frames: 'array',
    flipSvg: 'boolean', outline: 'boolean', defs: 'string',
    pixel: 'boolean',         // 像素画：落定的位置取整到整数屏幕像素（mascot.js 的 pixelSnap）
  };
  function mascot(key, opts) {
    if (S.booted) { warn(`Deck.mascot 要在页面加载完之前调用：把形象文件用 <script src> 写进 index.html。这次注册的「${key}」被忽略`); return; }
    if (typeof key !== 'string' || !/^[a-z][a-z0-9-]*$/.test(key)) { warn('Deck.mascot 的第一个参数是形象的键名：小写字母开头，只含小写字母、数字和 -。这次收到：', key); return; }
    if (!opts || typeof opts !== 'object') { warn(`形象 ${key}：Deck.mascot 的第二个参数要是一个对象，这次注册被忽略`); return; }
    const o = { key };
    Object.keys(opts).forEach(k => {
      const want = MASCOT_FIELDS[k];
      if (!want) { warn(`形象 ${key}：不认识的字段「${k}」，已忽略。认识的字段：${Object.keys(MASCOT_FIELDS).join('、')}`); return; }
      const got = typeOf(opts[k]);
      if (got !== want) { warn(`形象 ${key}：字段 ${k} 应该是 ${want}，这里是 ${got}，已忽略，改走默认做法`); return; }
      o[k] = opts[k];
    });
    if (!o.svg) { warn(`形象 ${key}：没写 svg(pose, opts)（画形象的函数），这次注册被忽略`); return; }
    if (!o.label) { warn(`形象 ${key}：没写 label（给人看的名字），先叫它 ${key}`); o.label = key; }
    const sz = o.size;
    if (!(sz && sz.length === 2 && sz.every(v => typeof v === 'number' && v > 0))) {
      if (sz) warn(`形象 ${key}：size 要写成 [宽, 高]（px，正数），这里是 ${JSON.stringify(sz)}，先按 [120, 120]`);
      else warn(`形象 ${key}：没写 size（舞台上显示的 [宽, 高]），先按 [120, 120]`);
      o.size = [120, 120];
    }
    if (o.foot == null) o.foot = 1;
    else if (!(o.foot > 0 && o.foot <= 1)) { warn(`形象 ${key}：foot 要在 0 到 1 之间（脚底在高度里的位置），这里是 ${o.foot}，先按 1`); o.foot = 1; }
    o.frames = (o.frames || []).filter(f => typeof f === 'string');
    if (MASCOTS[key]) warn(`形象 ${key} 重复注册了，以后注册的为准`);
    MASCOTS[key] = o;
  }
  /* 已注册的形象，给提醒用 */
  function mascotList() {
    const ks = Object.keys(MASCOTS);
    return ks.length ? '已注册的形象：' + ks.map(k => `${MASCOTS[k].label} ${k}`).join('、') : '还没有注册任何形象（index.html 里要引入 mascots/<键名>.js）';
  }
  /* 选这份课件用哪个形象（约定 C）：地址 ?mascot= > <meta name="li-talk-mascot"> > 第一页风格的 mascot > 第一个注册的形象。
     地址里写错的马上提醒；meta 和风格里写了却没注册的，攒进 S.mascotWarns，页面真的用到形象时才提醒 */
  function pickMascot() {
    const q = QS.get('mascot');
    if (q) {
      if (MASCOTS[q]) return (S.mascot = q);
      warn(`地址里的 ?mascot=${q} 没有注册，忽略。${mascotList()}`);
    }
    const meta = document.querySelector('meta[name="li-talk-mascot"]');
    const mv = meta ? String(meta.getAttribute('content') || '').trim() : '';
    if (mv) {
      if (MASCOTS[mv]) return (S.mascot = mv);
      S.mascotWarns.push(`<meta name="li-talk-mascot"> 写的形象「${mv}」没有注册。${mascotList()}。用这个形象的话，index.html 里要引入 mascots/${mv}.js`);
    }
    const first = DEFS[0];
    const fk = S.forceScene || (first && first.scene);
    const fs = fk && SCENES[fk];
    if (fs && fs.mascot) {
      if (MASCOTS[fs.mascot]) return (S.mascot = fs.mascot);
      S.mascotWarns.push(`第一页的风格「${fs.label}」默认用形象「${fs.mascot}」，可它没有注册。${mascotList()}。用这个形象的话，index.html 里要引入 mascots/${fs.mascot}.js`);
    }
    const ks = Object.keys(MASCOTS);
    S.mascot = ks.length ? ks[0] : null;
    if (S.mascot && S.mascotWarns.length) S.mascotWarns.push(`先用已注册的「${MASCOTS[S.mascot].label}」`);
    return S.mascot;
  }

  /* =================================================================
     页面注册
     ================================================================= */
  function add(def) {
    if (S.booted) { warn('Deck.add 要在页面加载完之前调用：把章节文件用 <script src> 写进 index.html。这次调用被忽略：', def && def.id); return; }
    if (!def || typeof def !== 'object') { warn('Deck.add 需要传一个对象'); return; }
    const d = Object.assign({}, def);
    const no = DEFS.length + 1;
    if (!d.id) { d.id = 'page' + no; warn(`第 ${no} 页没写 id，先叫它 ${d.id}`); }
    if (DEFS.some(x => x.id === d.id)) { const nid = d.id + '-' + no; warn(`id「${d.id}」重复了，第 ${no} 页改叫「${nid}」`); d.id = nid; }
    // 风格到 boot 时才对照注册表（build.js 的 pickScene），风格文件引入得晚一点也不要紧
    if (typeof d.html !== 'string') d.html = '';
    if (!d.title) warn(`页面 ${d.id}：没写 title（演讲者视图、阅读模式要用）`);
    d.topic = d.topic ? String(d.topic) : '';
    d.chapterShort = d.chapterShort ? String(d.chapterShort) : String(d.chapter || '').replace(/^[一二三四五六七八九十百零\d]+[、.．]\s*/, '').trim();
    DEFS.push(d);
  }

  /* =================================================================
     提示
     ================================================================= */
  function toast(html, ms = 3500) {
    dom.toastEl.innerHTML = html; dom.toastEl.classList.add('show');
    clearTimeout(S.toastT); S.toastT = setTimeout(() => dom.toastEl.classList.remove('show'), ms);
  }

  /* =================================================================
     启动
     ================================================================= */
  /* 等字体：先点名加载霞鹜文楷的两个字重，再等 document.fonts.ready，把风格自带的字体（比如像素游戏的缝合像素字体）
     和页面用到的其他字块也等完，这样量主题行、署名位置、形象落脚点时用的是真字体，不是退回的字体。
     字体要等页面排过版才开始加载，所以等 ready 之前先强制排一次版。最多等 2.5 秒：字体出问题也不让课件卡在 loading */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const wk = Promise.all([document.fonts.load('400 40px WK'), document.fonts.load('700 40px WK')]).catch(() => {});
    const all = wk.then(() => {
      void document.body.offsetWidth;   // 强制排版：页面里用到、还没加载的字体这时开始加载
      return document.fonts.ready;
    }).catch(() => {});
    return Promise.race([all, new Promise(r => setTimeout(r, 2500))]);
  }
  /* 主题行放不下（超过 TOPIC_MAX 宽）时：先把主题从 42px 往下缩到 34px，再缩章节标签；不换行 */
  const TOPIC_MAX = 1260;
  function fitTopics() {
    PAGES.forEach(p => {
      const row = $(':scope > .s-topic', p.el); if (!row) return;
      const tt = $('.tt', row), tc = $('.tc', row);
      for (let f = 42; f >= 34 && row.scrollWidth > TOPIC_MAX; f -= 2) tt.style.fontSize = f + 'px';
      for (let f = 28; f >= 22 && row.scrollWidth > TOPIC_MAX; f -= 2) tc.style.fontSize = f + 'px';
      if (row.scrollWidth > TOPIC_MAX) warn(`页面 ${p.id}：主题太长，缩到最小还是放不下，请改短：${p.def.topic}`);
    });
  }
  function boot() {
    if (S.booted) return;
    const force = QS.get('scene');
    if (force) { if (SCENES[force]) S.forceScene = force; else warn(`地址里的 ?scene=${force} 没有注册，忽略。${sceneList()}`); }
    pickMascot();
    S.lastAct = Date.now();
    I.buildShell();
    DEFS.forEach((d, i) => PAGES.push(I.buildPage(d, i)));
    S.booted = true;
    checkFamilies();
    if (!PAGES.length) {
      document.body.classList.remove('loading');
      toast('还没有页面：在 index.html 里引入章节文件，文件里调用 Deck.add({...})', 10000);
      if (SELFTEST && I.runSelftest) I.runSelftest();   // 自检也要交一份（空的）结果
      return;
    }
    I.restoreTimer();
    I.bindInput();
    fontsReady().then(() => {
      fitTopics();
      I.fit();
      I.placeSign();          // 字体、缩放都定下来了，再给署名找空位
      if (SELFTEST && I.runSelftest) {   // 自检模式（selftest.js）：不播开场，逐页逐拍跳到最终状态去量
        document.body.classList.remove('loading');
        I.runSelftest();
        return;
      }
      if (!S.reading) {
        const r = I.parseHash();
        if (r) I.go(r.p, r.b, { anim: false });   // 带 #页/拍 打开：直接摆好，不播开场
        else { S.cur = { p: -1, b: 0 }; I.go(0, 0, { dir: 1, intro: !SELFTEST }); }   // 第一次进第一页：风格写了 intro 就播开场
      } else { const r = I.parseHash(); if (r) { S.cur = { p: clamp(r.p, 0, PAGES.length - 1), b: 0 }; I.scrollToPage(S.cur.p); } }
      document.body.classList.remove('loading');
      I.tick();
      console.info(`[Deck] 共 ${PAGES.length} 页：` + PAGES.map(p => `${p.i + 1}.${p.id}(${p.scene},${p.total}拍)`).join(' '));
    });
  }

  /* =================================================================
     挂到总线
     ================================================================= */
  Object.assign(I, {
    W, H, NS, MAX_BEAT, NEXT_KEYS, PREV_KEYS,
    G, R, RMQ, QS, FORCE, SHOW_NOTES, SELFTEST, INTRO_MAX, NO_ADVANCE, SIGN_URL,
    $, $$, clamp, esc, warn, toInt, el,
    DEFS, PAGES, state: S, dom, motion,
    SCENES, FAMILY, ROUGH, sc, roughOf, hook, sceneList, checkFamilies,
    MASCOTS, mascotList, pickMascot,
    add, scene, mascot, toast, fontsReady, fitTopics, boot,
  });

  /* =================================================================
     对外接口（演讲者窗口靠 _key、_attach、_presenter 和主窗口通信）
     其余文件里的函数在调用时才从总线上取，所以这里可以先写好
     ================================================================= */
  window.Deck = {
    version: '0.2.0',
    add,
    scene,
    mascot,                                    // 注册形象（mascots/<键名>.js 里调用）
    mascotEl: opts => I.mascotEl(opts),        // 生成一个形象的标记（写进页面的 html）
    kid: opts => I.mascotEl(opts),             // 旧名，和 mascotEl 相同
    next: () => I.next(),
    prev: () => I.prev(),
    go: (n, b = 0) => I.go(typeof n === 'string' ? PAGES.findIndex(p => p.id === n) : n - 1, b, { anim: false }),
    get motion() { return motion(); },
    get page() { return PAGES[S.cur.p] ? { no: S.cur.p + 1, id: PAGES[S.cur.p].id, beat: S.cur.b, total: PAGES[S.cur.p].total } : null; },
    get pages() { return PAGES.map(p => ({ no: p.i + 1, id: p.id, scene: p.scene, title: p.def.title, total: p.total })); },
    copy: text => I.copyText(text),
    toast,
    _key: (e) => I.onKey(e), _attach: w => I.attach(w), _presenter: () => S.pres,
    _mascotSvg: (pose, opts) => I.mascotSvg(pose, opts), _kidSvg: pose => I.mascotSvg(pose),   // 画当前形象（_kidSvg 是旧名）
    _: I,
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => I.boot());
  else setTimeout(() => I.boot(), 0);
})();
