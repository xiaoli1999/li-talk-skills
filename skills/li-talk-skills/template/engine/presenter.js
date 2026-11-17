/* =====================================================================
   演示稿引擎 · 演讲者视图（presenter.js）
   - 计时：T 开始/暂停、R 归零，存在 sessionStorage 里，刷新后保留；每 500ms 刷新一次
   - 演讲者视图（按 S）：独立窗口，和主窗口同步当前页、当前拍、讲词、重点词和下一拍
     字号为旧稿演讲者视图的 80%（正文 30px → 24px）
   - 演讲者窗口里的脚本通过 window.opener.Deck 的 _key、_attach、_presenter、next、prev 和主窗口通信
   - 依赖总线：core 的常量和工具、I.PAGES、I.state（cur、pres、timer）、I.dom（timerEl）、I.toast；
     build.js 的 I.keysOf、I.autoShow
   - 挂到总线：timerMs、restoreTimer、toggleTimer、resetTimer、tick、openPresenter、attach、syncPresenter
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { SCENE_NAME, esc, toast, PAGES } = I;
  const S = I.state, dom = I.dom;

  /* =================================================================
     计时（刷新后保留）
     ================================================================= */
  function timerMs() { return S.timer.acc + (S.timer.start ? Date.now() - S.timer.start : 0); }
  function saveTimer() { try { sessionStorage.setItem('deck-timer', JSON.stringify(S.timer)); } catch (e) { /* 存不了就算了 */ } }
  function restoreTimer() { try { const t = JSON.parse(sessionStorage.getItem('deck-timer') || 'null'); if (t) Object.assign(S.timer, t); } catch (e) { /* 忽略 */ } }
  function toggleTimer() { if (S.timer.start) { S.timer.acc += Date.now() - S.timer.start; S.timer.start = 0; } else S.timer.start = Date.now(); saveTimer(); tick(); toast(S.timer.start ? '计时开始（再按 T 暂停）' : '计时暂停（再按 T 继续，R 归零）', 1600); }
  function resetTimer() { S.timer.acc = 0; S.timer.start = S.timer.start ? Date.now() : 0; saveTimer(); tick(); toast('计时归零', 1200); }
  const fmt = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function tick() {
    const ms = timerMs(), presOpen = S.pres && !S.pres.closed;
    dom.timerEl.textContent = (ms > 0 && !presOpen) ? fmt(ms) : '';
    dom.timerEl.classList.toggle('paused', !S.timer.start);
    if (presOpen) {
      try {
        const d = S.pres.document;
        d.getElementById('tm').textContent = fmt(ms);
        d.getElementById('tm').className = S.timer.start ? 'run' : 'stop';
        const now = new Date();
        d.getElementById('ck').textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
      } catch (e) { /* 演讲者窗口不可写 */ }
    }
  }
  setInterval(tick, 500);

  /* =================================================================
     演讲者视图（按 S）：独立窗口，和主窗口同步
     字号为旧稿演讲者视图的 80%（正文 30px → 24px）
     ================================================================= */
  const PRES_HTML = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>演讲者视图</title><style>
  *{box-sizing:border-box}
  body{margin:0;height:100vh;display:flex;flex-direction:column;background:#F6F1E4;color:#1E2B48;font:400 24px/1.6 "Microsoft YaHei","PingFang SC",sans-serif}
  header{display:flex;align-items:center;gap:18px;padding:12px 22px;border-bottom:2px dashed #C9BFA8;background:#EFE7D3}
  header .pg{font:700 21px/1.2 Consolas,monospace;color:#7A6F5A;white-space:nowrap}
  header .tt{flex:1;min-width:0;font-size:21px;font-weight:700;line-height:1.35}
  header .tt small{display:block;font-size:17px;font-weight:400;color:#7A6F5A}
  header .tt .tp{display:block;margin-bottom:2px;font-size:19px;font-weight:700;color:#C2410C}
  header .sc{font-size:16px;padding:2px 10px;border-radius:20px;background:#fff;color:#5A5444;white-space:nowrap}
  header .clk{text-align:right;font:600 18px/1.3 Consolas,monospace;color:#5A5444;white-space:nowrap}
  #tm{font-size:24px}#tm.run{color:#2B8A3E}#tm.stop{color:#9A8F78}
  .bar{display:flex;align-items:center;gap:16px;padding:10px 22px;font-size:21px}
  .bar b{font-size:24px}
  .bar .dots{display:flex;gap:8px}
  .bar .dots i{width:18px;height:18px;border-radius:50%;border:2.5px solid #9A8F78}
  .bar .dots i.on{background:#1E2B48;border-color:#1E2B48}
  .bar .dots i.now{background:#F76707;border-color:#F76707;box-shadow:0 0 0 4px rgba(247,103,7,.25)}
  .bar .left{color:#7A6F5A;font-size:18px}
  ol{flex:1;overflow:auto;margin:0;padding:6px 22px 16px;list-style:none}
  li{margin:0 0 10px;padding:10px 16px;border-radius:10px;border-left:6px solid transparent}
  li.past{opacity:.42}
  li.next{opacity:.8}
  li.now{background:#fff;border-left-color:#F76707;box-shadow:0 6px 16px -10px rgba(60,40,10,.4)}
  .bh{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;font-size:18px;color:#7A6F5A}
  .bn{font-weight:700;color:#1E2B48;white-space:nowrap}
  li.now .bn{color:#F76707}
  .bk{font-weight:700;color:#1E2B48;background:#FFE066;padding:0 8px;border-radius:4px;font-size:21px}
  li.now .bk{background:#FFD43B;font-size:24px}
  .say{margin-top:4px}
  .say mark{background:linear-gradient(transparent 35%,#FFD43B 35%);color:inherit;font-weight:700;padding:0 2px}
  .say i{color:#A39A86}
  .nx{padding:10px 22px;border-top:2px dashed #C9BFA8;background:#EFE7D3;font-size:19px}
  .nx b{color:#F76707}
  footer{display:flex;align-items:center;gap:12px;padding:8px 22px 10px;font-size:16px;color:#7A6F5A}
  footer span{flex:1}
  button{font:600 18px/1 "Microsoft YaHei",sans-serif;padding:10px 16px;border-radius:8px;border:1.5px solid #C9BFA8;background:#fff;color:#1E2B48;cursor:pointer}
  </style></head><body>
  <header><span class="pg" id="pg"></span><div class="tt" id="tt"></div><span class="sc" id="sc"></span><div class="clk"><div id="ck"></div><div id="tm"></div></div></header>
  <div class="bar" id="bar"></div>
  <ol id="ls"></ol>
  <div class="nx" id="nx"></div>
  <footer><span id="ft">→ / 空格 下一拍　← 上一拍　T 计时开始/暂停　R 计时归零</span><button id="bp" type="button">◀ 上一拍</button><button id="bn" type="button">下一拍 ▶</button></footer>
  <script>
  (function(){
    var lost = false;
    function D(){ try { var d = window.opener && !window.opener.closed && window.opener.Deck; lost = false; return d; } catch (e) { lost = true; return null; } }
    document.addEventListener('keydown', function(e){ var d = D(); if (d) d._key(e, window); });
    document.getElementById('bn').onclick = function(){ var d = D(); if (d) d.next(); };
    document.getElementById('bp').onclick = function(){ var d = D(); if (d) d.prev(); };
    setInterval(function(){
      var d = D();
      if (d && d._presenter() !== window) d._attach(window);
      var ft = document.getElementById('ft');
      if (lost || !window.opener || window.opener.closed) { ft.textContent = '主窗口刷新或关闭过，这里已经连不上：回到主窗口按一次 S，会换一个新的演讲者窗口'; ft.style.color = '#C92A2A'; }
    }, 1000);
  })();
  <\/script></body></html>`;

  function openPresenter() {
    if (S.pres && !S.pres.closed) { S.pres.focus(); return; }
    const feat = 'width=1100,height=780';
    const write = w => { w.document.open(); w.document.write(PRES_HTML); w.document.close(); };
    let w = window.open('', 'deck-presenter', feat);
    if (!w) { toast('演讲者窗口被浏览器拦截了：请允许本页弹出窗口，再按 S'); return; }
    try { write(w); }
    catch (e) {
      // 主窗口刷新过，旧的演讲者窗口已经连不上（file:// 下每次刷新算新来源）：关掉旧的，开一个新的
      try { w.close(); } catch (_) { /* 关不掉就算了 */ }
      w = window.open('', 'deck-presenter-' + Date.now(), feat);
      if (!w) { toast('请先关掉旧的演讲者窗口，再按 S'); return; }
      try { write(w); } catch (e2) { toast('演讲者窗口打开了，但写不进内容'); return; }
    }
    attach(w);
  }
  function attach(w) { S.pres = w; syncPresenter(); tick(); }
  function hlSay(say, keys) {
    let h = esc(say);
    keys.slice().sort((a, b) => b.length - a.length).forEach(k => { const e = esc(k); if (e) h = h.split(e).join('\u0001' + e + '\u0002'); });
    return h.replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>').replace(/<mark>([^<]*)<mark>/g, '<mark>$1').replace(/<\/mark>([^<]*)<\/mark>/g, '$1</mark>');
  }
  function syncPresenter() {
    if (!S.pres || S.pres.closed || !PAGES.length) return;
    try {
      const d = S.pres.document, p = PAGES[S.cur.p], np = PAGES[S.cur.p + 1];
      if (!d.getElementById('ls')) return;
      d.getElementById('pg').textContent = `${p.i + 1} / ${PAGES.length}`;
      d.getElementById('tt').innerHTML = (p.def.topic ? `<span class="tp">${esc(p.def.chapterShort)} › ${esc(p.def.topic)}</span>` : '')
        + `${esc(p.def.title || p.id)}<small>${esc(p.def.chapter || '')}</small>`;
      d.getElementById('sc').textContent = '场景：' + SCENE_NAME[p.scene];
      const left = p.total - p.beat;
      d.getElementById('bar').innerHTML = p.total
        ? `<b>第 ${p.beat} 拍 / 共 ${p.total} 拍</b><span class="dots">${Array.from({ length: p.total }, (_, i) => `<i class="${i < p.beat ? 'on' : ''}${i === p.beat - 1 ? ' now' : ''}"></i>`).join('')}</span><span class="left">${left ? `再按 ${left} 下讲完这页` : '这页讲完了，再按一下翻页'}</span>`
        : `<b>这页只有一拍</b><span class="left">按一下翻页</span>`;
      let rows = '';
      for (let n = 0; n <= p.total; n++) {
        const ns = p.notes.filter(x => x.beat === n), keys = I.keysOf(p, n);
        const show = ns.map(x => x.show).filter(Boolean).join(' · ') || (n === 0 ? '标题' : I.autoShow(p, n));
        const say = ns.filter(x => x.say).map(x => hlSay(x.say, keys)).join('<br>');
        const cls = n < p.beat ? 'past' : n === p.beat ? 'now' : 'next';
        rows += `<li class="${cls}"><div class="bh"><span class="bn">${n === 0 ? '开场' : '第 ' + n + ' 拍'}</span><span>${esc(show)}</span>${keys.map(k => `<span class="bk">${esc(k)}</span>`).join('')}</div><div class="say">${say || '<i>（这一拍没写讲词）</i>'}</div></li>`;
      }
      d.getElementById('ls').innerHTML = rows;
      let nx;
      if (p.beat < p.total) {
        const n = p.beat + 1, ks = I.keysOf(p, n), show = p.notes.filter(x => x.beat === n).map(x => x.show).filter(Boolean).join(' · ') || I.autoShow(p, n);
        nx = `<b>下一拍 ▸</b> 第 ${n} 拍：${esc(show)}${ks.length ? `　重点词：<b>${ks.map(esc).join('、')}</b>` : ''}`;
      } else if (np) nx = `<b>下一页 ▸</b> ${np.i + 1} · ${esc(np.def.title || np.id)}　（${SCENE_NAME[np.scene]}${np.scene !== p.scene ? '，换场景' : ''}，共 ${np.total} 拍）`;
      else nx = '<b>已是最后一页</b>';
      d.getElementById('nx').innerHTML = nx;
      const now = d.querySelector('li.now');
      if (now) now.scrollIntoView({ block: 'nearest' });
    } catch (e) { /* 演讲者窗口不可写时忽略 */ }
  }

  Object.assign(I, { timerMs, restoreTimer, toggleTimer, resetTimer, tick, openPresenter, attach, syncPresenter });
})();
