/* li-talk-skills 教程 · 第二部分：九步流程、接着做、选风格、样册、形象、质量把关、「关于我」页、翻页（p09–p16） */

/* p09 九步流程、五处停下：上面一条九步的小路线，五处停下的地方点成蓝色；下面一条流水线，一拍走到下一处停下 */
Deck.add({
  id: 'p09',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '九步流程',
  scene: 'fangguo',
  title: '九步流程，五处停下来等你点头',
  html: `
    <p class="abs p09-road" data-beat="0" style="left:120px;top:210px;width:1680px"><span>① 起点</span><span class="on">② 提纲</span><span class="on">③ 讲稿</span><span class="on">④ 风格</span><span>⑤ 搭骨架</span><span class="on">⑥ 先做 3 页</span><span>⑦ 写全稿</span><span class="on">⑧ 过稿</span><span>⑨ 完成</span></p>
    <div class="abs fg-pipe" style="left:120px;top:360px;width:1680px">
      <div class="fg-st"><i class="fg-ico" data-fg-ico="doc"></i><b>提纲</b><p data-beat="0" data-small>分几部分</p></div>
      <div class="fg-st" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".32" data-mascot-pose="point"><i class="fg-ico" data-fg-ico="layers" data-fg-tone="teal"></i><b>讲稿</b><p data-beat="1" data-small>字、拍数、讲词</p></div>
      <div class="fg-st" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".32"><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i><b>风格</b><p data-beat="2" data-small>看样册，你来选</p></div>
      <div class="fg-st" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".32"><i class="fg-ico" data-fg-ico="bolt" data-fg-tone="amber"></i><b>先做 3 页</b><p data-beat="3" data-small>封面加两页</p></div>
      <div class="fg-st" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".32" data-mascot-pose="ok"><i class="fg-ico" data-fg-ico="check" data-fg-tone="coral"></i><b>过稿</b><p data-beat="4" data-small>整份看一遍</p></div>
    </div>
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:800px">每处停下，你说「可以」，AI 才往下走</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '五处', say: '接下来 AI 一步步往下走，一共九步，其中五处会停下来等你说可以。第一处是提纲：分几部分、每部分几页。' },
    { beat: 1, key: '讲稿', say: '第二处是讲稿：每页屏幕上的字、分几拍、照着讲的讲词。' },
    { beat: 2, key: '风格', say: '第三处是风格：AI 按内容推荐，并打开样册让你看，你说了算。' },
    { beat: 3, key: '先做 3 页', say: '第四处，先做三页：封面加两页最典型的内容，自检通过后给你看，满意了再写全稿。' },
    { beat: 4, key: '过稿', say: '最后一处是过稿：整份课件给你看，按你的意见改。' },
  ],
});

/* p10 换对话也能接着做：左边一句话说清楚，右边终端里 AI 先跑 guide，一拍一行 */
Deck.add({
  id: 'p10',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '接着做',
  scene: 'fangguo',
  title: '换对话、换模型，也能接着做',
  html: `
    <div class="abs p10-l" data-beat="0" style="left:120px;top:300px;width:620px">
      <p class="p10-big">进度记在课件目录里</p>
      <p class="p10-sm">确认过哪些环节，都写在课件目录的文件里。AI 每次开工，都先跑一次 <span class="fg-code">guide</span> 看做到哪一步。</p>
    </div>
    <div class="abs term p10-term" data-title="终端" data-beat="0" data-recede="off" style="left:820px;top:290px;width:980px">
      <p class="in" data-beat="1">guide 我的分享</p>
      <p class="ok" data-beat="2">【现在在哪一步】⑥ 先做 3 页</p>
      <p class="hi" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="think">【下一步做什么】写封面和两页最典型的内容</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '课件目录', say: '中途换对话、换模型都不怕：进度记在课件目录里，AI 每次开工都先查一遍。' },
    { beat: 1, key: 'guide', say: '它先跑一次 guide。' },
    { beat: 2, say: 'guide 会告诉它现在在哪一步。' },
    { beat: 3, say: '下一步做什么也写得清清楚楚，接着往下做就行。' },
  ],
});

/* p11 选风格：四类风格排成四栏，一拍点亮一栏 */
Deck.add({
  id: 'p11',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '选风格',
  scene: 'fangguo',
  title: '选风格：16 种，分四类',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">AI 按内容推荐，你说了算；按章换风格，只能在同一类里换</p>
    <div class="abs fg-values p11-v" style="left:120px;top:300px;width:1680px;--cols:4;--gap:48px">
      <div class="fg-val"><i></i><b>企业风</b><p data-beat="1">方果</p></div>
      <div class="fg-val"><i></i><b>手绘风</b><p data-beat="2">方格纸、黑板、像素手账、工位桌面、水彩田园、水墨国风、蓝图、漫画</p></div>
      <div class="fg-val"><i></i><b>现代风</b><p data-beat="3">科技暗黑、毛玻璃、液态玻璃、扁平插画、杂志复古、新粗野主义</p></div>
      <div class="fg-val" data-mascot="4" data-mascot-side="stay" data-mascot-pose="idea"><i></i><b>像素风</b><p data-beat="4">像素游戏</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '到了第三处停下，要选风格。一共十六种，分四类。按章换风格的话，只能在同一类里换。' },
    { beat: 1, key: '企业风', say: '企业风现在有一种，就是你正在看的方果。' },
    { beat: 2, key: '手绘风', say: '手绘风最多，方格纸、黑板、水彩、水墨、蓝图、漫画这些。' },
    { beat: 3, key: '现代风', say: '现代风有科技暗黑、毛玻璃、液态玻璃、扁平插画、杂志复古、新粗野主义。' },
    { beat: 4, key: '像素风', say: '还有一种像素游戏。' },
  ],
});

/* p12 样册（聚焦框）：一扇模拟的样册窗口，一拍框一处：一张卡片、左下角的小条、「全部风格」 */
Deck.add({
  id: 'p12',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '样册',
  scene: 'fangguo',
  title: '样册：全部风格一屏看完',
  html: `
    <div class="abs fg-win p12-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="img" data-fg-tone="purple"></i>li-talk-skills 样册<span data-small>全部风格</span></div>
      <div class="p12-grid" data-small>
        <p><em>企业风</em><span>方果</span></p>
        <p><em>手绘风</em><span>方格纸</span><span>黑板</span><span data-fg-focus="1">水彩田园</span><span>水墨国风</span><span>蓝图</span><span>漫画</span></p>
        <p><em>现代风</em><span>科技暗黑</span><span>毛玻璃</span><span>液态玻璃</span><span>扁平插画</span><span>杂志复古</span></p>
        <p><em>像素风</em><span>像素游戏</span></p>
      </div>
      <p class="p12-bar" data-small><span data-fg-focus="3">全部风格</span><i data-fg-focus="2">手绘：方格纸 · 黑板 · 水彩田园 · …</i></p>
    </div>
    <div class="abs p12-notes" style="left:1340px;top:280px;width:460px">
      <p data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point"><b>点一张卡片</b>从第一页看这种风格的样板</p>
      <p data-beat="2"><b>左下角的小条</b>随时换一种风格看</p>
      <p data-beat="3"><b>点「全部风格」</b>回到总览；想再看就对 AI 说「打开样册」</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '到选风格这一步，AI 会自动在浏览器里打开样册。首页一屏放下全部风格。' },
    { beat: 1, key: '卡片', say: '点一张卡片，就从第一页看这种风格的样板。' },
    { beat: 2, key: '小条', say: '左下角有个小条，随时换一种风格看。' },
    { beat: 3, key: '全部风格', say: '点全部风格回到总览。关掉了也没关系，对 AI 说打开样册就行。' },
  ],
});

/* p13 形象：左边四条，每拍讲一条，方方就走到这一条旁边、换一个动作 */
Deck.add({
  id: 'p13',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '形象',
  scene: 'fangguo',
  title: '每种风格，都有一个小形象',
  html: `
    <div class="abs p13-list" style="left:120px;top:280px;width:900px">
      <p data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="point"><b>会走过去</b>走到正在讲的内容旁边</p>
      <p data-beat="2" data-mascot="2" data-mascot-side="right" data-mascot-pose="wow"><b>会换动作</b>指一指、惊讶一下、点个赞</p>
      <p data-beat="3" data-mascot="3" data-mascot-side="right" data-mascot-pose="happy"><b>会和你玩</b>鼠标移上去会开心，点它会蹦一下</p>
      <p data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="rest"><b>会打个盹</b>很久没人操作，它就睡一会儿</p>
    </div>
    <div class="abs card p13-card" data-beat="0" style="left:1220px;top:300px;width:580px">
      <h3>这份教程的形象：方方</h3>
      <p>每种风格的形象长得不一样，在样册里都能看到；不喜欢也可以换成别的风格的形象</p>
    </div>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, say: '每种风格都有一个小形象。这份教程里的是方方。' },
    { beat: 1, key: '走过去', say: '讲到哪，它就走到哪块内容旁边。' },
    { beat: 2, key: '换动作', say: '它会换动作，指一指、惊讶一下、点个赞。' },
    { beat: 3, key: '玩', say: '鼠标移上去它会开心，点它会蹦一下，点它不会翻页。' },
    { beat: 4, key: '打个盹', say: '很久没人操作，它就打个盹。' },
  ],
});

/* p14 质量把关：两张卡讲两种检查，最后一条「错误清零才给你看」 */
Deck.add({
  id: 'p14',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '质量把关',
  scene: 'fangguo',
  title: '写完先检查，错误清零才给你看',
  html: `
    <div class="abs card p14-c" data-beat="1" style="left:120px;top:270px;width:810px">
      <span class="fg-chip">不开浏览器的检查</span>
      <p>几秒查完：写法错误、越界的用法、讲词和拍数对不上</p>
      <span class="fg-code">check 我的分享</span>
    </div>
    <div class="abs card p14-c" data-beat="2" style="left:990px;top:270px;width:810px">
      <span class="fg-chip">后台浏览器自检</span>
      <p>五个尺寸逐页逐拍量：溢出、重叠、形象挡字、字太小</p>
      <span class="fg-code">check 我的分享 --browser</span>
    </div>
    <p class="abs p14-pass" data-beat="3" data-mascot="3" data-mascot-side="right" data-mascot-pose="ok" style="left:120px;top:720px"><i class="fg-ico" data-fg-ico="check" data-fg-tone="teal"></i>两种检查都没有错误，AI 才把课件打开给你看</p>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '页面是 AI 手写的，写完怎么知道效果对不对？靠两种检查。' },
    { beat: 1, key: '不开浏览器', say: '第一种不开浏览器，几秒查完写法错误、越界的用法、讲词和拍数对不上。' },
    { beat: 2, key: '后台浏览器', say: '第二种在后台用浏览器打开课件，按五个尺寸逐页逐拍量一遍，出一份中文报告。' },
    { beat: 3, key: '错误清零', say: '两种检查都没有错误，AI 才把课件给你看。' },
  ],
});

/* p15 「关于我」页（金句页）：过稿前 AI 转告的那句愿景 */
Deck.add({
  id: 'p15',
  chapter: '三、做一份课件',
  chapterShort: '做课件',
  topic: '「关于我」页',
  scene: 'fangguo',
  title: '分享知识的最后，也分享一下你自己',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote p15-q" data-beat="0" style="left:150px;top:260px;white-space:nowrap">在分享知识和经验的最后，<br>也<span class="fg-hl">分享一下你自己</span></p>
    <p class="abs fg-quote-by" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:154px;top:620px">小黎的愿景 · 过稿前，AI 会问你要不要加一页「关于我」</p>
    <p class="abs p15-note" data-beat="2" style="left:154px;top:730px"><span class="fg-chip">用方果风格时，问的是「关于我们」</span></p>
    <i class="abs fg-deco" style="left:1260px;top:220px;width:600px"></i>
    <div class="mascot guide" style="left:1500px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '分享一下你自己', say: '过稿之前，AI 会转告一句话：小黎的愿景，希望你在分享知识和经验的最后，也分享一下你自己。' },
    { beat: 1, key: '关于我', say: '然后问你要不要在结尾前加一页关于我，让听众认识讲这堂课的人。' },
    { beat: 2, key: '关于我们', say: '用方果风格时，问的是要不要加一页关于我们。' },
  ],
});

/* p16 翻页：键帽一行一行出来，右边写这几个键做什么 */
Deck.add({
  id: 'p16',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '翻页',
  scene: 'fangguo',
  title: '翻页：这几个键就够',
  html: `
    <div class="abs p16-rows" style="left:120px;top:280px;width:1680px">
      <div data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point"><p><i class="fg-kbd">→</i><i class="fg-kbd">↓</i><i class="fg-kbd">空格</i><i class="fg-kbd">PageDown</i><i class="fg-kbd">Enter</i><span>或点一下</span></p><b>下一拍</b></div>
      <div data-beat="2"><p><i class="fg-kbd">←</i><i class="fg-kbd">↑</i><i class="fg-kbd">PageUp</i><i class="fg-kbd">Backspace</i></p><b>上一拍</b></div>
      <div data-beat="3"><p><i class="fg-kbd">Home</i><i class="fg-kbd">End</i></p><b>第一页 / 最后一页</b></div>
    </div>
    <p class="abs fg-cap" data-beat="3" style="left:120px;top:800px">平板、手机上左右滑动翻页；刷新页面不丢位置</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '课件做好了，讲的时候怎么翻？' },
    { beat: 1, key: '下一拍', say: '往后：方向键右或下、空格、PageDown、Enter，或者直接点一下，都是下一拍，本页拍完就进下一页。' },
    { beat: 2, key: '上一拍', say: '往回：方向键左或上、PageUp、Backspace。' },
    { beat: 3, key: '第一页', say: 'Home 和 End 跳到第一页和最后一页。平板手机上左右滑；刷新页面不会丢位置。' },
  ],
});
