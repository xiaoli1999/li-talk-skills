/* =====================================================================
   演示稿引擎 · 演讲者视图与彩排（presenter.js）
   - 计时：T 开始/暂停、R 归零，存在 sessionStorage 里，刷新后保留；每 500ms 刷新一次
   - 时间来源 I.now()：计时和彩排都从它取「现在」，默认 Date.now()；
     测试时在控制台换成假时钟（let t = Date.now(); Deck._.now = () => t; 之后 t += 50000 就是快进 50 秒），不用真等
   - 演讲者视图（按 S）：独立窗口，和主窗口同步当前页、当前拍、讲词、重点词和下一拍
     字号为旧稿演讲者视图的 80%（正文 30px → 24px）
   - 演讲者窗口里的脚本通过 window.opener.Deck 的 _key、_attach、_presenter、next、prev 和主窗口通信，
     彩排的按钮和 H 键走总线 Deck._.rhAct、复制走 Deck._.rhText；
     主窗口开着在线编辑（edit.js 的 I.notesEditable() 为真）时，点一拍的讲词就能改，走 Deck._.noteText 取原文、Deck._.editNote 保存
   - 演讲者窗口被刷新过（document.open 后它的地址是课件地址，刷新会把整份课件或空白页加载进去）：
     主窗口在下一次 tick 里发现里面没有演讲者视图，就重新写进去；主窗口里再按 S 也会重写
   - 彩排（演讲者窗口里按 H 或点「开始彩排」）：
     · 开始时计时归零并开始，同时清空旧记录、开始记录；再按一次 H 结束，弹出小结
     · 每页用时：记下每页实际停留的时间，来回翻也累加到对应页；计时暂停（T）时不记
     · 建议用时（sugOf）：这一页讲词（notes 里各拍的 say）的字数 ÷ 每分钟 235 字，最少 15 秒；没写讲词的页按 30 秒
     · 小结：总用时对比建议总时长、超时的页按超出多少排序，没超时的页折叠成一行，可以复制成文字贴给 AI 删讲词
     · 记录存在 sessionStorage（键 deck-rehearsal:<路径>），刷新主窗口或演讲者窗口都不丢；「清空记录重新来」从头再练
     · 只在演讲者窗口里显示，主窗口（观众看的）和阅读模式不受影响；自检模式（?selftest）下不启用
   - 依赖总线：core 的常量和工具、I.sc（风格的 label）、I.PAGES、I.state（cur、pres、timer、reading）、I.dom（timerEl）、I.toast；
     build.js 的 I.keysOf、I.autoShow
   - 挂到总线：now、timerMs、restoreTimer、toggleTimer、resetTimer、tick、openPresenter、attach、syncPresenter；
     彩排：state.rh（记录）、sugOf、rhSync、rhAct、rhReport、rhText
   ===================================================================== */
(function () {
  'use strict';
  const I = Deck._;
  const { esc, toast, PAGES } = I;
  const S = I.state, dom = I.dom;

  /* 时间来源：内部一律经 I.now() 取，测试时整个换掉它就能快进 */
  I.now = () => Date.now();
  const now = () => I.now();
  const pad = n => String(n).padStart(2, '0');

  /* =================================================================
     计时（刷新后保留）
     ================================================================= */
  function timerMs() { return S.timer.acc + (S.timer.start ? Math.max(0, now() - S.timer.start) : 0); }
  function saveTimer() { try { sessionStorage.setItem('deck-timer', JSON.stringify(S.timer)); } catch (e) { /* 存不了就算了 */ } }
  function restoreTimer() {
    try { const t = JSON.parse(sessionStorage.getItem('deck-timer') || 'null'); if (t) Object.assign(S.timer, t); } catch (e) { /* 忽略 */ }
    rhRestore();
  }
  function toggleTimer() {
    if (S.timer.start) { S.timer.acc += Math.max(0, now() - S.timer.start); S.timer.start = 0; } else S.timer.start = now();
    saveTimer(); rhSync(); tick();
    toast(S.timer.start ? '计时开始（再按 T 暂停）' : '计时暂停（再按 T 继续，R 归零）', 1600);
  }
  function resetTimer() { S.timer.acc = 0; S.timer.start = S.timer.start ? now() : 0; saveTimer(); tick(); toast('计时归零', 1200); }
  const fmt = ms => { const s = Math.floor(ms / 1000); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  function tick() {
    if (!dom.timerEl) return;   // 外壳还没建好（启动晚于第一次刷新）
    rhSync();                   // 换页也可能不经过 afterChange（比如阅读模式里滚动），这里兜一下
    const ms = timerMs(), presOpen = S.pres && !S.pres.closed;
    dom.timerEl.textContent = (ms > 0 && !presOpen) ? fmt(ms) : '';
    dom.timerEl.classList.toggle('paused', !S.timer.start);
    if (presOpen) {
      try {
        let d = S.pres.document;
        // 演讲者窗口被刷新过：里面成了整份课件或空白页，把演讲者视图重新写进去
        if (!d.getElementById('tm') && d.readyState !== 'loading') { writePres(S.pres); d = S.pres.document; syncPresenter(); }
        if (!d.getElementById('tm')) return;
        d.getElementById('tm').textContent = fmt(ms);
        d.getElementById('tm').className = S.timer.start ? 'run' : 'stop';
        const wall = new Date();
        d.getElementById('ck').textContent = pad(wall.getHours()) + ':' + pad(wall.getMinutes()) + ':' + pad(wall.getSeconds());
        rhRender(d);
      } catch (e) { /* 演讲者窗口不可写 */ }
    }
  }
  setInterval(tick, 500);

  /* =================================================================
     彩排：记录每页用时，按讲词字数估建议用时，结束时出小结
     记录 S.rh = { on 彩排中, pages { 页 id: 已讲毫秒 }, seg { id, at } 正在计的这一段（计时暂停时为 null）,
                   ended 结束彩排的时刻（有小结可看）, startedAt 开始彩排的时刻（小结标题用）, showSum 小结开着（不存） }
     ================================================================= */
  const RH_CPM = 235;    // 每分钟讲多少字（中文演讲常见 220–250 的中间值）
  const RH_MIN = 15;     // 每页建议用时至少多少秒
  const RH_NONE = 30;    // 没写讲词的页按多少秒估
  const RH_KEY = 'deck-rehearsal:' + location.pathname;
  const blankRh = () => ({ on: false, pages: {}, seg: null, ended: 0, startedAt: 0, showSum: false });
  S.rh = blankRh();
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const mmss = sec => { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + pad(sec % 60); };

  /* 讲词的字数：汉字一个算一个字，英文单词、数字一串算一个字；标点、空格不算。
     和 scripts/lib/check-static.mjs 的 countWords 同一个算法，check 报的「讲词共 N 字」和这里对得上 */
  function countChars(t) {
    return (t.match(/[㐀-鿿豈-﫿]/g) || []).length
      + (t.match(/[A-Za-z0-9]+(?:['.-][A-Za-z0-9]+)*/g) || []).length;
  }
  /* 一页的建议用时：{ chars 讲词字数, sec 建议秒数 }；chars 为 0 表示没写讲词，按 RH_NONE 秒估 */
  function sugOf(p) {
    const chars = countChars(p.notes.map(n => n.say || '').join('\n'));
    return { chars, sec: chars ? Math.max(RH_MIN, Math.round(chars / RH_CPM * 60)) : RH_NONE };
  }
  const sugTotal = () => PAGES.reduce((a, p) => a + sugOf(p).sec, 0);

  function rhSave() {
    if (I.SELFTEST) return;
    const R = S.rh;
    try { sessionStorage.setItem(RH_KEY, JSON.stringify({ on: R.on, pages: R.pages, seg: R.seg, ended: R.ended, startedAt: R.startedAt })); } catch (e) { /* 存不了就算了 */ }
  }
  function rhRestore() {
    if (I.SELFTEST) return;
    try {
      const o = JSON.parse(sessionStorage.getItem(RH_KEY) || 'null');
      if (!o || typeof o !== 'object') return;
      const r = blankRh();
      r.on = o.on === true;
      if (o.pages && typeof o.pages === 'object') Object.keys(o.pages).forEach(k => { const v = +o.pages[k]; if (isFinite(v) && v >= 0) r.pages[k] = v; });
      if (r.on && o.seg && typeof o.seg.id === 'string' && isFinite(+o.seg.at)) r.seg = { id: o.seg.id, at: +o.seg.at };
      r.ended = +o.ended || 0;
      r.startedAt = +o.startedAt || 0;
      S.rh = r;
    } catch (e) { /* 记录坏了就当没有 */ }
  }
  /* 跟上当前页和计时状态：换了页或计时暂停，就把正在计的这一段累加到那一页；计时在走且没在计，就从现在开始计当前页。
     stop 为 true 时只收尾、不再开新的一段（结束彩排用） */
  function rhSync(stop) {
    const R = S.rh;
    if (I.SELFTEST || !R.on) return;
    const t = now(), p = PAGES[S.cur.p], id = p ? p.id : null;
    const run = !stop && !!S.timer.start && !!id;
    let changed = false;
    if (R.seg && (!run || R.seg.id !== id)) {
      R.pages[R.seg.id] = (own(R.pages, R.seg.id) ? R.pages[R.seg.id] : 0) + Math.max(0, t - R.seg.at);
      R.seg = null; changed = true;
    }
    if (run && !R.seg) { R.seg = { id, at: t }; if (!own(R.pages, id)) R.pages[id] = 0; changed = true; }
    if (changed) rhSave();
  }
  /* 某一页到现在一共讲了多少毫秒（含正在计的这一段） */
  function pageMs(id) {
    const R = S.rh;
    return (own(R.pages, id) ? R.pages[id] : 0) + (R.seg && R.seg.id === id ? Math.max(0, now() - R.seg.at) : 0);
  }
  function totalMs() { return Object.keys(S.rh.pages).reduce((a, k) => a + pageMs(k), 0); }
  const hasRecord = () => S.rh.on || Object.keys(S.rh.pages).length > 0;

  function rhStart() {
    S.rh = blankRh(); S.rh.on = true; S.rh.startedAt = Date.now();
    S.timer.acc = 0; S.timer.start = now(); saveTimer();
    rhSync(); rhSave(); showSum(false); tick();
  }
  function rhEnd() {
    const R = S.rh;
    if (!R.on) return;
    rhSync(true);
    R.on = false; R.ended = Date.now();
    if (S.timer.start) { S.timer.acc += Math.max(0, now() - S.timer.start); S.timer.start = 0; saveTimer(); }   // 彩排结束，计时也停下
    rhSave(); showSum(true); tick();
  }
  /* 不小心结束了：接着上次的记录练 */
  function rhResume() {
    const R = S.rh;
    if (R.on || !hasRecord()) return;
    R.on = true; R.ended = 0;
    if (!S.timer.start) { S.timer.start = now(); saveTimer(); }
    rhSync(); rhSave(); showSum(false); tick();
  }
  /* 演讲者窗口里的按钮和 H 键：toggle 开始或结束、resume 继续、restart 清空记录重新来、sum 看小结、close 关小结 */
  function rhAct(act) {
    if (I.SELFTEST) return;
    if (act === 'toggle') { if (S.rh.on) rhEnd(); else rhStart(); }
    else if (act === 'resume') rhResume();
    else if (act === 'restart') rhStart();
    else if (act === 'sum') { if (hasRecord()) showSum(true); }
    else if (act === 'close') showSum(false);
  }

  /* 小结的数据：总用时、建议总时长、超时的页（按超出多少排序）、没超时的页、没讲到的页 */
  function rhReport() {
    const R = S.rh;
    const rows = PAGES.map(p => {
      const s = sugOf(p), sec = Math.floor(pageMs(p.id) / 1000);
      return { no: p.i + 1, id: p.id, title: p.def.title || p.id, sec, sug: s.sec, chars: s.chars, seen: own(R.pages, p.id), over: sec - s.sec };
    });
    const seen = rows.filter(r => r.seen);
    const over = seen.filter(r => r.over > 0).sort((a, b) => b.over - a.over || a.no - b.no);
    const ok = seen.filter(r => r.over <= 0);
    const miss = rows.filter(r => !r.seen);
    const total = Math.floor(totalMs() / 1000);
    const sug = rows.reduce((a, r) => a + r.sug, 0), seenSug = seen.reduce((a, r) => a + r.sug, 0);
    // 这次的语速：讲到的、写了讲词的页，字数 ÷ 实际分钟数（讲得太短时不算）
    const wr = seen.filter(r => r.chars), wc = wr.reduce((a, r) => a + r.chars, 0), ws = wr.reduce((a, r) => a + r.sec, 0);
    const rate = ws >= 30 ? Math.round(wc / (ws / 60)) : 0;
    return { on: R.on, startedAt: R.startedAt, total, sug, seenSug, rate, over, ok, miss, rows };
  }
  const diffText = d => d > 0 ? `超了 ${mmss(d)}` : d < 0 ? `比建议短 ${mmss(-d)}` : '和建议一样';
  const nos = list => list.map(x => x.no).join('、');
  /* 超时的页照这次的讲法要删到多少字才能讲进建议用时 */
  const target = x => Math.max(1, Math.round(x.chars * x.sug / Math.max(1, x.sec)));
  /* 超时的页给 AI 的一句话：讲词多少字、要删到多少；实际用时到了建议的三倍，多半是讲词外临场说了不少，提一句 */
  const overNote = x => !x.chars ? `这页没有讲词（按 ${RH_NONE} 秒估）。`
    : x.sec >= x.sug * 3 ? `讲词约 ${x.chars} 字，实际用时是建议的 ${Math.round(x.sec / x.sug)} 倍，多半是讲词外临场说了不少；照这次的讲法讲词要删到约 ${target(x)} 字，或者讲的时候少发挥一些。`
    : `讲词约 ${x.chars} 字，照这次的讲法要删到约 ${target(x)} 字。`;
  /* 小结的纯文字版：方便贴给 AI，让它照着删减讲词 */
  function rhText() {
    const r = rhReport(), L = [];
    const d = new Date(r.startedAt || Date.now());
    L.push(`【彩排小结】${document.title}`);
    L.push(`彩排时间：${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}${r.on ? '（还在彩排中）' : ''}`);
    L.push(`总用时 ${mmss(r.total)}，建议总时长 ${mmss(r.sug)}，${diffText(r.total - r.sug)}。`);
    if (r.miss.length) L.push(`有 ${r.miss.length} 页没讲到（第 ${nos(r.miss)} 页），讲到的页建议合计 ${mmss(r.seenSug)}。`);
    L.push(`建议用时按讲词字数估：约 ${RH_CPM} 字/分钟，每页至少 ${RH_MIN} 秒；没写讲词的页按 ${RH_NONE} 秒估。` + (r.rate ? `这次实际约 ${r.rate} 字/分钟。` : ''));
    L.push('');
    if (r.over.length) {
      L.push(`超时的页（${r.over.length} 页，按超出多少排序）：`);
      r.over.forEach((x, i) => L.push(`${i + 1}. 第 ${x.no} 页「${x.title}」：实际 ${mmss(x.sec)}，建议 ${mmss(x.sug)}，超了 ${mmss(x.over)}。${overNote(x)}`));
    } else L.push('没有超时的页。');
    if (r.ok.length) L.push(`没超时的页：第 ${nos(r.ok)} 页。`);
    if (r.over.some(x => x.chars)) {
      L.push('');
      L.push('请帮我删减上面超时页的讲词（notes 里各拍的 say），每页删到建议的字数左右，意思和重点词保留，没超时的页不动。');
    }
    return L.join('\n');
  }
  function sumHtml() {
    const r = rhReport();
    const head = '<tr><th>页</th><th>标题</th><th>实际</th><th>建议</th><th>超了</th></tr>';
    const row = x => `<tr><td>${x.no}</td><td class="t">${esc(x.title)}</td><td>${mmss(x.sec)}</td><td>${mmss(x.sug)}${x.chars ? '' : '<small>没讲词</small>'}</td><td class="ov">${x.over > 0 ? '+' + mmss(x.over) : '—'}</td></tr>`;
    return `<div class="sm" role="dialog" aria-label="彩排小结">`
      + `<h2>彩排小结</h2>`
      + `<p class="tot">总用时 <b>${mmss(r.total)}</b>　建议总时长 <b>${mmss(r.sug)}</b>　<span class="${r.total > r.sug ? 'bad' : 'good'}">${diffText(r.total - r.sug)}</span></p>`
      + (r.miss.length ? `<p class="mi">有 ${r.miss.length} 页没讲到（第 ${nos(r.miss)} 页），讲到的页建议合计 ${mmss(r.seenSug)}</p>` : '')
      + (r.over.length ? `<h3>超时的页（${r.over.length} 页，按超出多少排序）</h3><table>${head}${r.over.map(row).join('')}</table>` : '<h3 class="good">没有超时的页</h3>')
      + (r.ok.length ? `<details><summary>${r.over.length ? '其余 ' : ''}${r.ok.length} 页没超时：第 ${nos(r.ok)} 页</summary><table>${head}${r.ok.map(row).join('')}</table></details>` : '')
      + `<p class="how">建议用时按讲词字数估：约 ${RH_CPM} 字/分钟，每页至少 ${RH_MIN} 秒；没写讲词的页按 ${RH_NONE} 秒估。${r.rate ? `这次实际约 ${r.rate} 字/分钟。` : ''}</p>`
      + `<div class="acts"><button type="button" class="pri" data-act="copy">复制成文字</button>`
      + (r.on ? '' : `<button type="button" data-act="resume">继续彩排</button>`)
      + `<button type="button" data-act="restart">清空记录重新来</button><button type="button" data-act="close">关闭（Esc）</button><span class="cp" id="cpok"></span></div>`
      + `<textarea id="smt" readonly hidden></textarea></div>`;
  }
  /* 演讲者窗口里可写的 document（没打开、被关掉、连不上、里面不是演讲者视图时为 null） */
  function presDoc() {
    try { const d = S.pres && !S.pres.closed && S.pres.document; return d && d.getElementById('ls') ? d : null; } catch (e) { return null; }
  }
  function showSum(on) {
    S.rh.showSum = !!on;
    const d = presDoc(), box = d && d.getElementById('sum');
    if (!box) return;
    if (on) box.innerHTML = sumHtml();
    box.hidden = !on;   // 不把焦点挪到按钮上：不然按空格、回车翻页时会顺手点了按钮
  }
  /* 演讲者窗口里的彩排条：没在彩排时显示本页和全稿的建议用时；彩排中显示本页已讲 / 建议，超时变红；结束后可以再看小结 */
  function rhRender(d) {
    const box = d.getElementById('rh'), btn = d.getElementById('bh'), p = PAGES[S.cur.p];
    if (!box || !p) return;
    const R = S.rh, sg = sugOf(p), done = !R.on && R.ended && hasRecord();
    const sugTxt = `建议 ${mmss(sg.sec)}` + (sg.chars ? '' : `<span class="est">没有讲词，按 ${RH_NONE} 秒估</span>`);
    let h, cls = 'rh';
    if (I.SELFTEST) h = `<span class="lab">本页${sugTxt}</span>`;
    else if (R.on) {
      const sec = Math.floor(pageMs(p.id) / 1000), over = sec > sg.sec;
      cls += over ? ' on over' : ' on';
      h = `<span class="rec">${S.timer.start ? '● 彩排中' : '‖ 彩排暂停（按 T 继续）'}</span>`
        + `<span class="lab">本页已讲 <b>${mmss(sec)}</b> / ${sugTxt}</span>`
        + (over ? `<span class="ov">超了 ${mmss(sec - sg.sec)}</span>` : '')
        + `<span>全稿已用 <b>${mmss(Math.floor(totalMs() / 1000))}</b> / 建议 ${mmss(sugTotal())}</span>`
        + (S.cur.p === PAGES.length - 1 && p.beat === p.total ? '<span class="end">讲完最后一拍了：按 H 结束彩排，看小结</span>' : '');
    } else if (done) {
      const r = rhReport();
      h = `<span>上次彩排：用时 <b>${mmss(r.total)}</b> / 建议 ${mmss(r.sug)}，${r.over.length ? `<span class="bad">超时 ${r.over.length} 页</span>` : '没有超时的页'}</span>`
        + `<button type="button" data-act="sum">看小结</button><span class="lab">本页${sugTxt}</span>`;
    } else {
      h = `<span class="lab">本页${sugTxt}</span><span>全稿建议 <b>${mmss(sugTotal())}</b>（${PAGES.length} 页，按讲词约 ${RH_CPM} 字/分钟估）</span><span class="hint">按 H 开始彩排</span>`;
    }
    if (box._h !== h) { box._h = h; box.innerHTML = h; }   // 内容没变就不重写，免得点不到里面的按钮
    if (box.className !== cls) box.className = cls;
    if (btn) {
      btn.hidden = !!I.SELFTEST;
      const t = R.on ? '结束彩排 H' : done ? '重新彩排 H' : '开始彩排 H';
      if (btn.textContent !== t) btn.textContent = t;
      btn.classList.toggle('on', R.on);
    }
  }

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
  .rh{display:flex;flex-wrap:wrap;align-items:center;gap:4px 18px;margin:0 22px 6px;padding:7px 16px;border-radius:10px;background:#EFE7D3;font-size:18px;line-height:1.5;color:#5A5444}
  .rh:empty{display:none}
  .rh b{font:700 21px/1.2 Consolas,monospace;color:#1E2B48}
  .rh .lab{color:#1E2B48}
  .rh .est{margin-left:8px;font-size:15px;color:#9A6B00}
  .rh .hint{color:#9A8F78;font-size:16px}
  .rh .bad{color:#C92A2A;font-weight:700}
  .rh .rec{font-weight:700;color:#2B8A3E}
  .rh.on{background:#fff;box-shadow:inset 0 0 0 2px #2B8A3E}
  .rh.over{background:#C92A2A;color:#FFE3E3;box-shadow:none}
  .rh.over b,.rh.over .lab,.rh.over .rec,.rh.over .est{color:#fff}
  .rh .ov{font-weight:700;padding:0 10px;border-radius:6px;background:#fff;color:#C92A2A}
  .rh .end{flex-basis:100%;font-weight:700;color:#C2410C}
  .rh.over .end{color:#FFE066}
  .rh button{padding:5px 12px;font-size:16px}
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
  .say.editable{cursor:text;border-radius:6px}
  .say.editable:hover{box-shadow:0 0 0 2px #C9BFA8}
  .say.ed{background:#fff;box-shadow:0 0 0 2px #2563EB;outline:none;padding:2px 6px}
  .nx{padding:10px 22px;border-top:2px dashed #C9BFA8;background:#EFE7D3;font-size:19px}
  .nx b{color:#F76707}
  footer{display:flex;align-items:center;gap:12px;padding:8px 22px 10px;font-size:16px;color:#7A6F5A}
  footer span{flex:1}
  button{font:600 18px/1 "Microsoft YaHei",sans-serif;padding:10px 16px;border-radius:8px;border:1.5px solid #C9BFA8;background:#fff;color:#1E2B48;cursor:pointer}
  button.on{background:#C92A2A;border-color:#C92A2A;color:#fff}
  #sum{position:fixed;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(30,43,72,.45)}
  #sum[hidden]{display:none}
  .sm{width:min(980px,100%);max-height:100%;overflow:auto;padding:20px 28px 22px;border-radius:14px;background:#F6F1E4;box-shadow:0 24px 60px -20px rgba(0,0,0,.55);font-size:19px;line-height:1.55}
  .sm h2{margin:0 0 6px;font-size:26px}
  .sm h3{margin:16px 0 6px;font-size:20px}
  .sm .tot{margin:0;font-size:21px}
  .sm .tot b{font:700 26px/1.2 Consolas,monospace}
  .sm .bad{color:#C92A2A;font-weight:700}
  .sm .good{color:#2B8A3E;font-weight:700}
  .sm .mi{margin:4px 0 0;color:#9A6B00}
  .sm table{width:100%;border-collapse:collapse;font-size:18px}
  .sm th{text-align:left;font-weight:600;color:#7A6F5A;border-bottom:2px solid #C9BFA8;padding:4px 8px}
  .sm td{padding:5px 8px;border-bottom:1px solid #E3DAC4;font-family:Consolas,"Microsoft YaHei",monospace;white-space:nowrap}
  .sm td.t{width:100%;white-space:normal;font-family:inherit}
  .sm td small{margin-left:6px;font-size:14px;color:#9A6B00}
  .sm td.ov{color:#C92A2A;font-weight:700}
  .sm details{margin-top:12px}
  .sm summary{cursor:pointer;color:#5A5444}
  .sm details td.ov{color:#9A8F78;font-weight:400}
  .sm .how{margin:14px 0 0;font-size:15px;color:#7A6F5A}
  .sm .acts{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px}
  .sm .acts .pri{background:#1E2B48;border-color:#1E2B48;color:#fff}
  .sm .cp{font-size:16px;color:#2B8A3E}
  .sm textarea{display:block;width:100%;height:220px;margin-top:10px;font:15px/1.5 Consolas,"Microsoft YaHei",monospace}
  .sm textarea[hidden]{display:none}
  </style></head><body>
  <header><span class="pg" id="pg"></span><div class="tt" id="tt"></div><span class="sc" id="sc"></span><div class="clk"><div id="ck"></div><div id="tm"></div></div></header>
  <div class="bar" id="bar"></div>
  <div class="rh" id="rh"></div>
  <ol id="ls"></ol>
  <div class="nx" id="nx"></div>
  <footer><span id="ft">→ / 空格 下一拍　← 上一拍　T 计时开始/暂停　R 计时归零　H 彩排</span><button id="bh" type="button" data-act="toggle">开始彩排 H</button><button id="bp" type="button">◀ 上一拍</button><button id="bn" type="button">下一拍 ▶</button></footer>
  <div id="sum" hidden></div>
  <script>
  (function(){
    var lost = false;
    function D(){ try { var d = window.opener && !window.opener.closed && window.opener.Deck; lost = false; return d; } catch (e) { lost = true; return null; } }
    function $(id){ return document.getElementById(id); }
    /* 在线编辑（主窗口开着编辑模式时）：点一拍的讲词就能改，回车或点外面保存，Esc 取消；交给主窗口的 Deck._.editNote 保存 */
    var editing = null;
    function startSay(el){
      var d = D(); if (!d || !d._ || !d._.noteText) return;
      var b = +el.getAttribute('data-beat'), pi = +$('ls').getAttribute('data-p');
      editing = { el: el, b: b, p: pi };
      el.textContent = d._.noteText(pi, b);
      el.setAttribute('contenteditable', 'true'); el.classList.add('ed'); el.focus();
      var r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
    function endSay(save){
      var e = editing; if (!e) return; editing = null;
      e.el.removeAttribute('contenteditable'); e.el.classList.remove('ed');
      var d = D(); if (!d || !d._) return;
      if (save && d._.editNote) d._.editNote(e.p, e.b, e.el.textContent);
      if (d._.syncPresenter) d._.syncPresenter();
    }
    document.addEventListener('focusout', function(e){ if (editing && e.target === editing.el) endSay(true); });
    document.addEventListener('paste', function(e){
      if (!editing || !editing.el.contains(e.target)) return;
      e.preventDefault();
      var t = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
      document.execCommand('insertText', false, t.replace(/[\\r\\n]+/g, ' '));
    });
    document.addEventListener('keydown', function(e){
      if (editing) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); endSay(true); }
        else if (e.key === 'Escape') { e.preventDefault(); endSay(false); }
        return;   // 改讲词时键盘归输入，不翻页
      }
      if (e.target && /^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return;   // 在小结的文字框里选字、复制时不翻页
      var d = D(); if (!d) return;
      if (!e.ctrlKey && !e.metaKey && !e.altKey && d._ && d._.rhAct) {
        if (e.key === 'h' || e.key === 'H') { e.preventDefault(); d._.rhAct('toggle'); return; }
        if (e.key === 'Escape' && !$('sum').hidden) { e.preventDefault(); d._.rhAct('close'); return; }
      }
      d._key(e, window);
    });
    $('bn').onclick = function(){ this.blur(); var d = D(); if (d) d.next(); };
    $('bp').onclick = function(){ this.blur(); var d = D(); if (d) d.prev(); };
    /* 复制小结：先用同步的老办法，不行再试剪贴板接口；都不行就把文字放进文字框全选，让人按 Ctrl+C */
    function copy(t){
      var ok = false;
      try { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length); ok = document.execCommand('copy'); ta.remove(); } catch (e) { ok = false; }
      function done(ok){
        var tip = $('cpok'), box = $('smt'); if (!tip || !box) return;
        tip.textContent = ok ? '已复制，可以直接贴给 AI，让它照着删讲词' : '复制不了：下面的文字已经全选，按 Ctrl+C 复制';
        tip.style.color = ok ? '' : '#C92A2A';
        if (!ok) { box.value = t; box.hidden = false; box.focus(); box.select(); }
      }
      if (ok) return done(true);
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function(){ done(true); }, function(){ done(false); });
      else done(false);
    }
    document.addEventListener('click', function(e){
      var t = e.target, d = D(); if (!d || !d._) return;
      var sy = t && t.closest && t.closest('.say.editable');
      if (sy && !sy.classList.contains('ed')) { startSay(sy); return; }
      if (!d._.rhAct) return;
      if (t && t.id === 'sum') { d._.rhAct('close'); return; }   // 点小结外面的空白：关掉
      var b = t && t.closest && t.closest('[data-act]'); if (!b) return;
      if (b.tagName === 'BUTTON') b.blur();
      var act = b.getAttribute('data-act');
      if (act === 'copy') copy(d._.rhText()); else d._.rhAct(act);
    });
    setInterval(function(){
      var d = D();
      if (d && d._presenter() !== window) d._attach(window);
      var ft = $('ft');
      if (lost || !window.opener || window.opener.closed) { ft.textContent = '主窗口刷新或关闭过，这里已经连不上：回到主窗口按一次 S，会换一个新的演讲者窗口'; ft.style.color = '#C92A2A'; }
    }, 1000);
  })();
  <\/script></body></html>`;

  function writePres(w) { w.document.open(); w.document.write(PRES_HTML); w.document.close(); }
  function openPresenter() {
    // 已经开着、里面也还是演讲者视图：切过去就行；里面被刷新成了别的（课件、空白页），往下走重新写一遍
    if (S.pres && !S.pres.closed) {
      let ok = false;
      try { ok = !!S.pres.document.getElementById('ls'); } catch (e) { ok = false; }
      if (ok) { S.pres.focus(); return; }
    }
    const feat = 'width=1100,height=780';
    let w = window.open('', 'deck-presenter', feat);
    if (!w) { toast('演讲者窗口被浏览器拦截了：请允许本页弹出窗口，再按 S'); return; }
    try { writePres(w); }
    catch (e) {
      // 主窗口刷新过，旧的演讲者窗口已经连不上（file:// 下每次刷新算新来源）：关掉旧的，开一个新的
      try { w.close(); } catch (_) { /* 关不掉就算了 */ }
      w = window.open('', 'deck-presenter-' + Date.now(), feat);
      if (!w) { toast('请先关掉旧的演讲者窗口，再按 S'); return; }
      try { writePres(w); } catch (e2) { toast('演讲者窗口打开了，但写不进内容'); return; }
    }
    attach(w);
  }
  function attach(w) {
    S.pres = w; syncPresenter(); tick();
    if (S.rh.showSum) showSum(true);   // 小结开着的时候演讲者窗口换了（刷新、重开）：接着显示
  }
  function hlSay(say, keys) {
    let h = esc(say);
    keys.slice().sort((a, b) => b.length - a.length).forEach(k => { const e = esc(k); if (e) h = h.split(e).join('\u0001' + e + '\u0002'); });
    return h.replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>').replace(/<mark>([^<]*)<mark>/g, '<mark>$1').replace(/<\/mark>([^<]*)<\/mark>/g, '$1</mark>');
  }
  function syncPresenter() {
    rhSync();   // 每次换页、换拍都会走到这里：彩排记录先跟上当前页
    if (!S.pres || S.pres.closed || !PAGES.length) return;
    try {
      const d = S.pres.document, p = PAGES[S.cur.p], np = PAGES[S.cur.p + 1];
      if (!d.getElementById('ls') || !p) return;
      // 正在演讲者窗口里改讲词：先不重画，免得把正在打的字冲掉（改完会再同步一次）
      const ae = d.activeElement;
      if (ae && ae.classList && ae.classList.contains('ed')) return;
      const editable = !!(I.notesEditable && I.notesEditable());
      d.getElementById('pg').textContent = `${p.i + 1} / ${PAGES.length}`;
      d.getElementById('tt').innerHTML = (p.def.topic ? `<span class="tp">${esc(p.def.chapterShort)} › ${esc(p.def.topic)}</span>` : '')
        + `${esc(p.def.title || p.id)}<small>${esc(p.def.chapter || '')}</small>`;
      d.getElementById('sc').textContent = '风格：' + I.sc(p.scene).label;
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
        rows += `<li class="${cls}"><div class="bh"><span class="bn">${n === 0 ? '开场' : '第 ' + n + ' 拍'}</span><span>${esc(show)}</span>${keys.map(k => `<span class="bk">${esc(k)}</span>`).join('')}</div><div class="say${editable ? ' editable' : ''}" data-beat="${n}"${editable ? ' title="点一下改讲词（回车保存，Esc 取消）"' : ''}>${say || '<i>（这一拍没写讲词）</i>'}</div></li>`;
      }
      d.getElementById('ls').innerHTML = rows;
      d.getElementById('ls').setAttribute('data-p', String(S.cur.p));
      let nx;
      if (p.beat < p.total) {
        const n = p.beat + 1, ks = I.keysOf(p, n), show = p.notes.filter(x => x.beat === n).map(x => x.show).filter(Boolean).join(' · ') || I.autoShow(p, n);
        nx = `<b>下一拍 ▸</b> 第 ${n} 拍：${esc(show)}${ks.length ? `　重点词：<b>${ks.map(esc).join('、')}</b>` : ''}`;
      } else if (np) nx = `<b>下一页 ▸</b> ${np.i + 1} · ${esc(np.def.title || np.id)}　（${esc(I.sc(np.scene).label)}${np.scene !== p.scene ? '，换风格' : ''}，共 ${np.total} 拍）`;
      else nx = '<b>已是最后一页</b>';
      d.getElementById('nx').innerHTML = nx;
      rhRender(d);
      const cur = d.querySelector('li.now');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    } catch (e) { /* 演讲者窗口不可写时忽略 */ }
  }

  Object.assign(I, { timerMs, restoreTimer, toggleTimer, resetTimer, tick, openPresenter, attach, syncPresenter, sugOf, rhSync, rhAct, rhReport, rhText });
})();
