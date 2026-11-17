/* =====================================================================
   演示稿引擎 · 核心（core.js）
   - 最先执行的引擎文件：建好 window.Deck 和内部总线 Deck._（各文件里记作 I）
   - 负责：共享常量、工具函数、可变状态 I.state、外壳元素表 I.dom、
     页面注册 Deck.add、提示条 toast、等字体、主题行缩字、启动 boot、对外接口
   - 引入顺序固定：vendor/gsap.min.js → vendor/rough.min.js → engine/core.js → build.js
     → beats.js → mascot.js → pages.js → ui.js → presenter.js → selftest.js
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
  const SCENES = ['paper', 'board', 'journal', 'desk'];
  const SCENE_NAME = { paper: '方格纸', board: '黑板', journal: '像素手账', desk: '工位桌面' };
  const SCENE_IN = { paper: 'rise', board: 'write', journal: 'write', desk: 'drop' };      // 各场景默认的出场动效
  const TITLE_IN = { paper: 'write', board: 'write', journal: 'write', desk: 'fade' };     // 页标题的出场
  const MAX_BEAT = 1.2;                                                // 单拍动效总时长上限（秒）
  const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter']);
  const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']);
  const G = window.gsap, R = window.rough;
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const QS = new URLSearchParams(location.search);
  const FORCE = QS.has('read') ? 'read' : QS.has('show') ? 'show' : '';
  const SHOW_NOTES = QS.get('notes') === '1';   // 阅读模式默认不公开讲词；?notes=1 才显示

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const warn = (...a) => console.warn('[Deck]', ...a);
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
    curScene: null,           // 当前场景
    sceneTl: null,            // 换场景时外框（章节、页码、节拍格）淡出再淡入的动画
    pres: null,               // 演讲者窗口
    timer: { acc: 0, start: 0 },   // 计时（刷新后保留）：acc 已累计的毫秒，start 本轮开始的时刻
    toastT: 0,                // 提示条自动消失的定时器
  };
  /* 外壳里的元素：build.js 的 buildShell 填上；bg 是各场景的背景层 */
  const dom = { bg: {} };
  const motion = () => !!G && !RMQ.matches && !S.reading;

  /* =================================================================
     注册
     ================================================================= */
  function add(def) {
    if (S.booted) { warn('Deck.add 要在页面加载完之前调用：把章节文件用 <script src> 写进 index.html。这次调用被忽略：', def && def.id); return; }
    if (!def || typeof def !== 'object') { warn('Deck.add 需要传一个对象'); return; }
    const d = Object.assign({}, def);
    const no = DEFS.length + 1;
    if (!d.id) { d.id = 'page' + no; warn(`第 ${no} 页没写 id，先叫它 ${d.id}`); }
    if (DEFS.some(x => x.id === d.id)) { const nid = d.id + '-' + no; warn(`id「${d.id}」重复了，第 ${no} 页改叫「${nid}」`); d.id = nid; }
    if (!SCENES.includes(d.scene)) { warn(`页面 ${d.id}：scene「${d.scene}」不认识，只能是 paper、board、journal、desk，先按 paper 显示`); d.scene = 'paper'; }
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
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([
      Promise.all([document.fonts.load('400 40px WK'), document.fonts.load('700 40px WK')]).catch(() => {}),
      new Promise(r => setTimeout(r, 2500)),
    ]);
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
    I.buildShell();
    DEFS.forEach((d, i) => PAGES.push(I.buildPage(d, i)));
    S.booted = true;
    if (!PAGES.length) { document.body.classList.remove('loading'); toast('还没有页面：在 index.html 里引入章节文件，文件里调用 Deck.add({...})', 10000); return; }
    I.restoreTimer();
    I.bindInput();
    fontsReady().then(() => {
      fitTopics();
      I.fit();
      if (!S.reading) {
        const r = I.parseHash();
        if (r) I.go(r.p, r.b, { anim: false });
        else { S.cur = { p: -1, b: 0 }; I.go(0, 0, { dir: 1 }); }
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
    W, H, NS, SCENES, SCENE_NAME, SCENE_IN, TITLE_IN, MAX_BEAT, NEXT_KEYS, PREV_KEYS,
    G, R, RMQ, QS, FORCE, SHOW_NOTES,
    $, $$, clamp, esc, warn, toInt, el,
    DEFS, PAGES, state: S, dom, motion,
    add, toast, fontsReady, fitTopics, boot,
  });

  /* =================================================================
     对外接口（演讲者窗口靠 _key、_attach、_presenter 和主窗口通信）
     其余文件里的函数在调用时才从总线上取，所以这里可以先写好
     ================================================================= */
  window.Deck = {
    version: '0.1.0',
    add,
    kid: opts => I.kid(opts),
    next: () => I.next(),
    prev: () => I.prev(),
    go: (n, b = 0) => I.go(typeof n === 'string' ? PAGES.findIndex(p => p.id === n) : n - 1, b, { anim: false }),
    get motion() { return motion(); },
    get page() { return PAGES[S.cur.p] ? { no: S.cur.p + 1, id: PAGES[S.cur.p].id, beat: S.cur.b, total: PAGES[S.cur.p].total } : null; },
    get pages() { return PAGES.map(p => ({ no: p.i + 1, id: p.id, scene: p.scene, title: p.def.title, total: p.total })); },
    copy: text => I.copyText(text),
    toast,
    _key: (e) => I.onKey(e), _attach: w => I.attach(w), _presenter: () => S.pres, _kidSvg: pose => I.kidSvg(pose),
    _: I,
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => I.boot());
  else setTimeout(() => I.boot(), 0);
})();
