/* =====================================================================
   新手教程 · 第二章：讲的时候、讲完以后、结尾（p07–p11）
   - 按键都画成受光的键帽（.tour-key），键帽旁边直接写这个键做什么；样子在 ch2.css
   - 可读性：每拍出的一行讲完留在页上，翻到最后一拍整页信息完整，从上往下一条路读下来
   ===================================================================== */

/* 圆片徽标里的单色图标（扁平插画内置的图标里没有文件夹、刷新、手机，这里自己画，48×48，颜色跟着 currentColor） */
const TOUR_ICON = {
  folder: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 14a4 4 0 0 1 4-4h9l4 5h15a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" fill="currentColor"/></svg>',
  refresh: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M38 20A15 15 0 0 0 11 15M10 28a15 15 0 0 0 27 5" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M40 9v12H28M8 39V27h12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="5" width="22" height="38" rx="5" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M20 36h8" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>',
};

/* 翻页：三条白色胶囊横条从上往下，每拍出一条：左边几枚键帽，一排明黄箭头指到右边的「下一拍」这类胶囊。
   最后一拍下面一枚胶囊：讲过的会变淡一点（上面三条正好就是例子） */
Deck.add({
  id: 'p07',
  chapter: '三、讲的时候',
  topic: '翻页',
  scene: 'flat',
  title: '翻页：一拍一拍往下点',
  html: `
    <p class="explain" data-beat="0"><b>一拍</b>：点一下出一块内容，一页通常 2 到 4 拍</p>
    <div class="fl-row abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:120px;top:290px;width:1500px">
      <span class="tour-keys"><kbd class="tour-key">→</kbd><kbd class="tour-key">空格</kbd><kbd class="tour-key">点击</kbd></span>
      <i class="fl-track"></i>
      <p class="fl-pill t-yellow"><em class="key">下一拍</em></p>
    </div>
    <div class="fl-row abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:120px;top:460px;width:1500px">
      <span class="tour-keys"><kbd class="tour-key">←</kbd></span>
      <i class="fl-track"></i>
      <p class="fl-pill t-yellow"><em class="key">上一拍</em></p>
    </div>
    <div class="fl-row abs" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:120px;top:630px;width:1500px">
      <span class="tour-keys"><kbd class="tour-key">Home</kbd><kbd class="tour-key">End</kbd></span>
      <i class="fl-track"></i>
      <p class="fl-pill t-yellow">第一页 / 最后一页</p>
    </div>
    <p class="fl-pill abs tour-note" data-beat="4" data-mascot="4" data-mascot-side="right" style="left:120px;top:830px"><i class="tour-note-dot"></i>讲过的会<em class="key">变淡</em>一点，但一直留在页上</p>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '一拍', say: '讲的时候怎么翻？这份课件是一拍一拍走的：点一下出一块内容，一页通常 2 到 4 拍。' },
    { beat: 1, key: '下一拍', say: '往下走：方向键右、空格，或者点一下鼠标，都是下一拍。这页拍完了，再按就进下一页。' },
    { beat: 2, key: '上一拍', say: '讲快了想退回去，按方向键左，退一拍。' },
    { beat: 3, key: 'Home', say: 'Home 跳到第一页，End 跳到最后一页。' },
    { beat: 4, key: '变淡', say: '你看上面这几行，讲过的会变淡一点，但一直留在页上，翻到最后一拍，整页内容都在。' },
  ],
});

/* 演讲者视图：左边三行「键帽 + 一句话」（S、T R、H），右边一扇演讲者窗口：左边当前页、右边几行讲词，
   第 2 拍角上贴出计时器，第 3 拍底下冒出一条标红的超时页。最后一拍下面一条横条：彩排小结 → 复制给 AI → 删减超时页的讲词 */
Deck.add({
  id: 'p08',
  chapter: '三、讲的时候',
  topic: '演讲者视图',
  scene: 'flat',
  title: '按 S，打开演讲者视图',
  html: `
    <p class="explain" data-beat="0"><b>演讲者视图</b>：另开一个窗口，讲词只有你看得到</p>
    <div class="tour-krow abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:120px;top:300px"><span class="tour-keys"><kbd class="tour-key">S</kbd></span><p>打开演讲者视图</p></div>
    <div class="tour-krow abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:120px;top:440px"><span class="tour-keys"><kbd class="tour-key">T</kbd><kbd class="tour-key">R</kbd></span><p><em class="key">计时</em>：开始暂停 / 归零</p></div>
    <div class="tour-krow abs" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:120px;top:580px"><span class="tour-keys"><kbd class="tour-key">H</kbd></span><p><em class="key">彩排</em>：记下每页用时</p></div>
    <div class="tour-pv abs" data-beat="1" style="left:1060px;top:290px;width:740px">
      <div class="tour-pv-slide"><i></i><i></i><i></i></div>
      <div class="tour-pv-notes"><i></i><i></i><i></i><i></i></div>
      <p class="tour-pv-time" data-beat="2">03:12</p>
      <p class="tour-pv-over" data-beat="3"><span data-small>第 5 页超时</span></p>
    </div>
    <div class="fl-row abs tour-flow" data-beat="4" data-mascot="4" data-mascot-side="right" style="left:120px;top:800px;width:1500px">
      <p class="fl-pill">彩排小结</p>
      <i class="fl-track"></i>
      <p class="fl-pill">复制给 AI</p>
      <i class="fl-track"></i>
      <p class="fl-pill t-yellow">删减<em class="key">超时页</em>的讲词</p>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '演讲者视图', say: '正式讲的时候，按 S 打开演讲者视图。它是另开的一个窗口，讲词只有你看得到，观众看不到。' },
    { beat: 1, key: 'S', say: '窗口里有这一页每拍的讲词，当前这一拍高亮，还会预告下一拍出什么。' },
    { beat: 2, key: '计时', say: '按 T 开始或暂停计时，按 R 归零。' },
    { beat: 3, key: '彩排', say: '正式讲之前，在演讲者视图里按 H 彩排一遍。它记下每页用了多久，超时的页整条标红。' },
    { beat: 4, key: '超时页', say: '彩排完再按一次 H，会出一份小结。把小结复制给 AI，它就只删减超时那几页的讲词。' },
  ],
});

/* 讲的时候的小工具：四张受光的卡片从左到右，每张顶上是键帽（O、B 和点、L、F），下面名字和一句说明；
   最后一拍下面一块白色横板，画着舞台底边那条分段的进度条 */
Deck.add({
  id: 'p09',
  chapter: '三、讲的时候',
  topic: '讲的时候的小工具',
  scene: 'flat',
  title: '讲的时候，还有这些小工具',
  html: `
    <div class="abs grid" style="left:120px;top:280px;width:1680px;--cols:4;--gap:40px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".35">
        <span class="tour-keys"><kbd class="tour-key">O</kbd></span><h3><em class="key">总览</em>跳页</h3><p>铺开所有页，<br>点一页跳过去</p>
      </div>
      <div class="card t-pink" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".35">
        <span class="tour-keys"><kbd class="tour-key">B</kbd><kbd class="tour-key">.</kbd></span><h3><em class="key">黑屏</em></h3><p>再按一下恢复，<br>不会翻页</p>
      </div>
      <div class="card t-blue" data-beat="3">
        <span class="tour-keys"><kbd class="tour-key">L</kbd></span><h3>激光笔</h3><p>鼠标变成<br>带拖尾的红点</p>
      </div>
      <div class="card" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".35">
        <span class="tour-keys"><kbd class="tour-key">F</kbd></span><h3>全屏</h3><p>铺满整个屏幕</p>
      </div>
    </div>
    <div class="tour-bar-board abs" data-beat="4" data-mascot="4" data-mascot-side="right" style="left:120px;top:730px;width:1500px">
      <p>底部<em class="key">进度条</em>：按全稿拍数走，自己会动</p>
      <span class="tour-prog"><i style="--g:3"></i><i style="--g:4"></i><i style="--g:3"></i><i style="--g:2"></i></span>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '小工具', say: '讲的时候还有几个顺手的小工具，都是一个键。' },
    { beat: 1, key: '总览', say: '按 O 铺开所有页的缩略图，点一页，或者敲页码回车，就跳过去。再按 O 或 Esc 关掉。' },
    { beat: 2, key: '黑屏', say: '按 B 或者句点黑屏，想让大家看你、不看屏幕的时候用。很多翻页笔的黑屏键发的就是句点。再按一下就恢复，不会顺手翻页。' },
    { beat: 3, key: ['激光笔', '全屏'], say: '按 L 打开激光笔，鼠标变成带拖尾的红点，指哪儿都清楚。按 F 全屏。' },
    { beat: 4, key: '进度条', say: '舞台底边还有一条细细的进度条，按全稿拍数走、按章节分段，不用设置，自己会走。' },
  ],
});

/* 分享和更新：三条白色胶囊横条，左边一枚圆片徽标加一个问题（第 0 拍就在），每拍一排明黄箭头伸出去，答案的胶囊贴上来 */
Deck.add({
  id: 'p10',
  chapter: '四、讲完以后',
  topic: '分享和更新',
  scene: 'flat',
  title: '发给别人、更新、手机上看',
  html: `
    <div class="fl-row abs" data-mascot="1" data-mascot-side="right" style="left:120px;top:290px;width:1500px">
      <i class="fl-badge t-pink" style="--s:110px">${TOUR_ICON.folder}</i>
      <p class="tour-q">发给别人</p>
      <i class="fl-track" data-beat="1"></i>
      <p class="fl-pill t-yellow" data-beat="1">拷走整个目录，或压成 <em class="key">zip</em></p>
    </div>
    <div class="fl-row abs" data-mascot="2" data-mascot-side="right" style="left:120px;top:490px;width:1500px">
      <i class="fl-badge t-yellow" style="--s:110px">${TOUR_ICON.refresh}</i>
      <p class="tour-q">每天自动更新</p>
      <i class="fl-track" data-beat="2"></i>
      <p class="fl-pill t-yellow" data-beat="2">做好的课件<em class="key">不会被改</em></p>
    </div>
    <div class="fl-row abs" data-mascot="3" data-mascot-side="right" style="left:120px;top:690px;width:1500px">
      <i class="fl-badge" style="--s:110px">${TOUR_ICON.phone}</i>
      <p class="tour-q">手机竖屏</p>
      <i class="fl-track" data-beat="3"></i>
      <p class="fl-pill t-yellow" data-beat="3">自动变成<em class="key">阅读模式</em></p>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '分享', say: '讲完以后，大家常问三件事：怎么发给别人、更新了会不会出问题、手机上能不能看。' },
    { beat: 1, key: 'zip', say: '发给别人：把整个课件目录拷走，或者压成 zip。对方解压后双击 index.html 就能看，不用联网。' },
    { beat: 2, key: '不会被改', say: 'skill 每天第一次用的时候会自动检查更新。更新只换 skill 本身，已经做好的课件不会被改。' },
    { beat: 3, key: '阅读模式', say: '在手机、平板上竖着看，会自动变成阅读模式：页面上下滑，所有拍直接展开。' },
  ],
});

/* 结尾：左上一个白色大气泡「现在就试试！」，右下明黄圆上立着一扇网页窗口；
   第 1 拍贴出一行可以点击复制的话，第 2 拍明黄胶囊：接下来 AI 会打开样册，小页高兴一下 */
Deck.add({
  id: 'p11',
  chapter: '结尾',
  scene: 'flat',
  title: '现在就试试',
  noTitle: true,
  html: `
    <i class="fl-blob t-yellow abs" data-beat="0" style="left:1240px;top:400px;width:540px"></i>
    <div class="tour-win abs" data-beat="0" aria-hidden="true" style="left:1290px;top:530px;width:440px">
      <div class="tour-mini"><i class="tour-bar a"></i><i class="tour-bar b"></i><i class="tour-bar c"></i><span class="tour-dots"><i></i><i></i><i></i></span></div>
    </div>
    <i class="fl-art abs" data-fl-art="spark" data-beat="0" style="left:1700px;top:330px;width:44px"></i>
    <i class="fl-art abs" data-fl-art="ring" data-beat="0" style="left:1250px;top:420px;width:34px"></i>
    <div class="fl-bubble abs" data-beat="0" style="left:150px;top:200px;--fl-tx:90px"><p>现在就<em class="key">试试</em>！</p></div>
    <p class="abs tour-say" data-beat="1" style="left:170px;top:590px">对 AI 说（点一下就能复制）：</p>
    <p class="fl-pill abs tour-copy" data-beat="1" style="left:170px;top:656px" data-copy="用 li-talk-skills 做一份关于「你的主题」的课件"><i class="tour-copy-ico"></i>用 li-talk-skills 做一份关于「你的主题」的课件</p>
    <p class="fl-pill t-yellow abs tour-end-next" data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="走吧！" style="left:170px;top:820px">接下来，AI 会打开<em class="key">样册</em></p>
    <div class="mascot guide" data-face="left" style="left:1100px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '试试', say: '教程就到这里。最好的上手办法，就是现在试一份。' },
    { beat: 1, show: '一句可复制的话', say: '对 AI 说：用 li-talk-skills 做一份关于你的主题的课件。这句话点一下就能复制。' },
    { beat: 2, key: '样册', say: '接下来 AI 会打开样册，带你把 16 种风格都过一遍，挑一个你喜欢的。' },
  ],
});
