/* li-talk-skills 教程 · 第三部分：翻页、演讲者视图、小工具（两页）、常用命令、分享、更新、常见问题、结尾（p17–p26）
   风格是水彩田园 watercolor：按键写成一块块水彩小标签，界面示意画在水彩纸上（要指的地方用铅笔圈出来），
   进度条和手机是晾在绳子上的两张小画，和 AI 的对话照旧写成绘本对白，结尾是一张从田园寄来的明信片 */

/* p17 翻页：三张水彩纸条一拍一张，左边是按键（水彩小标签），右边写这几个键做什么 */
Deck.add({
  id: 'p17',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '翻页',
  scene: 'watercolor',
  title: '翻页：这几个键就够',
  html: `
    <div class="abs p17-rows" style="left:120px;top:280px;width:1680px">
      <div class="wc-paper p17-r" data-beat="1" data-mascot="1" data-mascot-side="stay" style="--r:-.5deg"><p class="p17-k"><span class="tag t-blue">→</span><span class="tag t-blue">↓</span><span class="tag t-blue">空格</span><span class="tag t-blue">PageDown</span><span class="tag t-blue">Enter</span><span class="p17-or">或点一下</span></p><b class="p17-do">下一拍</b></div>
      <div class="wc-paper p17-r" data-beat="2" style="--r:.4deg"><p class="p17-k"><span class="tag t-blue">←</span><span class="tag t-blue">↑</span><span class="tag t-blue">PageUp</span><span class="tag t-blue">Backspace</span></p><b class="p17-do">上一拍</b></div>
      <div class="wc-paper p17-r" data-beat="3" style="--r:-.3deg"><p class="p17-k"><span class="tag t-blue">Home</span><span class="tag t-blue">End</span><span class="p17-or">平板、手机上左右滑</span></p><b class="p17-do">第一页 / 最后一页</b></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '课件做好了，讲的时候怎么翻？' },
    { beat: 1, key: '下一拍', say: '往后：方向键右或下、空格、PageDown、Enter，或者直接点一下，都是下一拍，本页拍完就进下一页。' },
    { beat: 2, key: '上一拍', say: '往回：方向键左或上、PageUp、Backspace。' },
    { beat: 3, key: '第一页', say: 'Home 和 End 跳到第一页和最后一页。平板手机上左右滑；刷新页面不会丢位置。' },
  ],
});

/* p18 演讲者视图（示意）：一大张水彩纸上画出演讲者视图的样子（当前页是一幅小画，讲词、计时、彩排各一块水彩底），
   一拍用铅笔圈出一处：讲词、计时、彩排；右边三张便签写对应的按键（水彩小标签） */
Deck.add({
  id: 'p18',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '演讲者视图',
  scene: 'watercolor',
  title: '演讲者视图：讲词、计时、彩排',
  html: `
    <div class="wc-paper abs p18-win" data-beat="0" data-recede="off" style="left:120px;top:236px;width:1160px;height:660px">
      <p class="abs p18-hd" style="left:36px;top:24px"><span class="tag t-blue">演讲者视图</span><span class="p18-hint" data-small>按 S 打开</span></p>
      <div class="wc-art abs p18-now" style="left:36px;top:110px;width:520px;height:290px">
        <svg class="wc-paint" viewBox="0 0 520 290" aria-hidden="true">
          <rect class="sky" x="0" y="0" width="520" height="190" style="--o:.24"/>
          <circle class="sun" cx="420" cy="66" r="34" style="--o:.55"/>
          <path class="grass" d="M0 200C120 172 260 182 380 168C440 160 490 162 520 166V290H0Z" style="--o:.4"/>
        </svg>
        <svg class="sketch" viewBox="0 0 520 290" aria-hidden="true">
          <rect x="0" y="0" width="520" height="290" data-roughness=".5"/>
          <path d="M0 200C120 172 260 182 380 168C440 160 490 162 520 166" data-roughness=".6"/>
          <path d="M40 56H240M40 98H180" data-roughness=".4" stroke-width="3"/>
        </svg>
      </div>
      <p class="abs p18-lb" data-small style="left:36px;top:410px">当前页</p>
      <div class="abs card t-blue p18-notes" style="left:600px;top:110px;width:520px;min-height:190px"><span class="p18-lb" data-small>本拍讲词</span><p data-small>先说结论：一页只讲一件事。下一拍讲为什么。</p></div>
      <div class="abs card t-yellow p18-timer" style="left:600px;top:330px;width:520px;min-height:100px"><b>06:42</b><span class="p18-lb" data-small>T 开始或暂停 · R 归零</span></div>
      <div class="abs card t-white p18-reh" style="left:36px;top:480px;width:1084px;min-height:150px">
        <p class="p18-bar" data-small><span>第 3 页</span><i><s style="--v:.6"></s></i><em>正常</em></p>
        <p class="p18-bar p18-over" data-small><span>第 4 页</span><i><s style="--v:1"></s></i><em>超时</em></p>
      </div>
    </div>
    <svg class="sketch" aria-hidden="true">
      <rect class="c-mark" data-beat="1" x="706" y="332" width="548" height="218" stroke-width="3.5"/>
      <rect class="c-mark" data-beat="2" x="706" y="554" width="548" height="126" stroke-width="3.5"/>
      <rect class="c-mark" data-beat="3" x="142" y="702" width="1112" height="178" stroke-width="3.5"/>
    </svg>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:918px"><span class="tag">示意</span>演讲者视图另开一个窗口，听众看不到</p>
    <div class="abs p18-keys" style="left:1340px;top:250px;width:460px">
      <div class="wc-paper p18-k" data-beat="1" data-mascot="1" data-mascot-side="stay" style="--r:-.8deg"><p class="p18-kh"><span class="tag t-blue">S</span><b>演讲者视图</b></p><p class="p18-kt">本拍讲词高亮，预告下一拍</p></div>
      <div class="wc-paper p18-k" data-beat="2" style="--r:.6deg"><p class="p18-kh"><span class="tag t-blue">T</span><span class="tag t-blue">R</span><b>计时</b></p><p class="p18-kt">开始或暂停、归零</p></div>
      <div class="wc-paper p18-k" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="happy" style="--r:-.5deg"><p class="p18-kh"><span class="tag t-blue">H</span><b>彩排</b></p><p class="p18-kt">超时的页整条变红；小结复制给 AI，删减讲词</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:110px"></div>`,
  notes: [
    { beat: 0, say: '讲的时候，最好另开一个演讲者视图，听众看不到。' },
    { beat: 1, key: '讲词', say: '按 S 打开。它显示这一拍的讲词，还预告下一拍讲什么。' },
    { beat: 2, key: '计时', say: 'T 开始或暂停计时，R 归零。' },
    { beat: 3, key: '彩排', say: '正式讲之前，在演讲者视图里按 H 彩排一遍，超时的页整条变红。再按 H 出小结，复制给 AI，它会删减超时页的讲词。' },
  ],
});

/* p19 小工具（一）：O 总览、B 黑屏、L 激光笔、F 全屏，一拍一张纸条；右边一张水彩纸画着总览的样子（六张小缩略图，示意） */
Deck.add({
  id: 'p19',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '小工具',
  scene: 'watercolor',
  title: '讲的时候的小工具',
  html: `
    <div class="abs p19-rows" style="left:120px;top:270px;width:860px">
      <p class="wc-paper p19-r" data-beat="1" data-mascot="1" data-mascot-side="right" style="--r:-.5deg"><span class="tag t-blue">O</span><b>总览</b><span>铺开所有页，点一页跳过去</span></p>
      <p class="wc-paper p19-r" data-beat="2" style="--r:.4deg"><span class="tag t-blue">B</span><b>黑屏</b><span>翻页笔的黑屏键也行</span></p>
      <p class="wc-paper p19-r" data-beat="3" style="--r:-.3deg"><span class="tag t-blue">L</span><b>激光笔</b><span>鼠标变成带拖尾的红点</span></p>
      <p class="wc-paper p19-r" data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="happy" style="--r:.5deg"><span class="tag t-blue">F</span><b>全屏</b><span>全屏放映，再按退出</span></p>
    </div>
    <div class="wc-paper abs p19-win" data-beat="0" data-recede="off" style="left:1120px;top:300px;width:680px;--r:.6deg">
      <p class="p19-hd"><span class="tag t-blue">总览</span><span class="p19-hint" data-small>按 O</span></p>
      <div class="p19-grid"><i class="p19-th"></i><i class="p19-th"></i><i class="p19-th on"></i><i class="p19-th"></i><i class="p19-th"></i><i class="p19-th"></i></div>
    </div>
    <p class="abs p-capt" data-beat="0" data-small style="left:1120px;top:720px"><span class="tag">示意</span>按 O 铺开所有页的缩略图</p>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '讲的时候还有几个小工具。' },
    { beat: 1, key: '总览', say: 'O 是总览，铺开所有页的缩略图，点一页跳过去。' },
    { beat: 2, key: '黑屏', say: 'B 是黑屏，想让大家看着你说话时用，翻页笔的黑屏键也行。' },
    { beat: 3, key: '激光笔', say: 'L 是激光笔，鼠标变成带拖尾的红点。' },
    { beat: 4, key: '全屏', say: 'F 全屏。' },
  ],
});

/* p20 小工具（二）：晾衣绳上一拍夹上一张小画——一页课件底边的进度条、一部竖着拿的手机（示意）；
   绳子的算法见 samples/watercolor.js 的晾画绳（画纸中心 x 540、1380 处，绳子高 348） */
Deck.add({
  id: 'p20',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '进度条和手机',
  scene: 'watercolor',
  title: '自己会走的进度条，手机上也能看',
  html: `
    <svg class="sketch" aria-hidden="true">
      <g data-beat="0">
        <path d="M134 906L132 284" stroke-width="3"/>
        <path d="M1786 900L1788 284" stroke-width="3"/>
        <path d="M120 300Q960 428 1800 300"/>
      </g>
    </svg>
    <div class="wc-paper wc-hang abs p20-h" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".08" style="left:160px;top:356px;width:760px;--r:-.8deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 704 220" aria-hidden="true">
          <rect class="white" x="72" y="6" width="560" height="208" style="--o:.95"/>
          <rect class="sky" x="72" y="6" width="560" height="120" style="--o:.26"/>
          <circle class="sun" cx="560" cy="52" r="26" style="--o:.55"/>
          <path class="grass" d="M72 140C200 116 360 126 480 112C560 104 610 108 632 110V180H72Z" style="--o:.36"/>
          <rect class="sky-d" x="96" y="192" width="130" height="12" style="--o:.6"/>
          <rect class="sky-d" x="246" y="192" width="130" height="12" style="--o:.6"/>
          <rect class="sun" x="396" y="192" width="74" height="12" style="--o:.85"/>
          <rect class="shade" x="470" y="192" width="56" height="12" style="--o:.3"/>
          <rect class="shade" x="546" y="192" width="62" height="12" style="--o:.3"/>
        </svg>
        <svg class="sketch" viewBox="0 0 704 220" aria-hidden="true">
          <rect x="72" y="6" width="560" height="208"/>
          <path d="M72 140C200 116 360 126 480 112C560 104 610 108 632 110" data-roughness=".6"/>
          <path d="M108 44H300M108 80H240" data-roughness=".4" stroke-width="3"/>
          <path d="M72 180H632" data-roughness=".4" stroke-width="1.5"/>
        </svg>
      </div>
      <h3>进度条</h3>
      <p>舞台底边一条细线，按章节分段，自己会走</p>
    </div>
    <div class="wc-paper wc-hang abs p20-h" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".72" data-mascot-pose="happy" style="left:1000px;top:356px;width:760px;--r:.8deg">
      <div class="wc-art">
        <svg class="wc-paint" viewBox="0 0 704 220" aria-hidden="true">
          <path class="white" d="M310 6H394Q416 6 416 28V192Q416 214 394 214H310Q288 214 288 192V28Q288 6 310 6Z" style="--o:.95"/>
          <rect class="sky" x="302" y="30" width="100" height="50" style="--o:.4"/>
          <rect class="sun" x="302" y="90" width="100" height="50" style="--o:.4"/>
          <rect class="mint" x="302" y="150" width="100" height="44" style="--o:.5"/>
        </svg>
        <svg class="sketch" viewBox="0 0 704 220" aria-hidden="true">
          <path d="M310 6H394Q416 6 416 28V192Q416 214 394 214H310Q288 214 288 192V28Q288 6 310 6Z"/>
          <rect x="302" y="30" width="100" height="50" data-roughness=".5" stroke-width="1.5"/>
          <rect x="302" y="90" width="100" height="50" data-roughness=".5" stroke-width="1.5"/>
          <rect x="302" y="150" width="100" height="44" data-roughness=".5" stroke-width="1.5"/>
          <path d="M470 50L470 170" data-arrow="both" data-roughness=".5"/>
        </svg>
      </div>
      <h3>手机竖屏</h3>
      <p>自动变成阅读模式，上下滑着看</p>
    </div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:926px"><span class="tag">示意</span>左：课件底边的进度条；右：手机上的阅读模式</p>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '还有两个不用按键的。' },
    { beat: 1, key: '进度条', say: '舞台底边有一条细线，是进度条，按章节分段，自己会走，讲到哪一看就知道。' },
    { beat: 2, key: '手机竖屏', say: '在手机上竖着看，会自动变成阅读模式，所有拍直接展开，上下滑着看。' },
  ],
});

/* p21 常用命令：四张水彩纸条一拍一张，每张两条命令（命令写在淡蓝水彩小标签上）；平时只需要对 AI 说话 */
Deck.add({
  id: 'p21',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '命令',
  scene: 'watercolor',
  title: '常用命令一览',
  html: `
    <p class="abs p21-cap" data-beat="0" style="left:120px;top:186px">平时只需要对 AI 说话；这页给想了解的人看</p>
    <div class="abs p21-rows" style="left:120px;top:280px;width:1680px">
      <div class="wc-paper p21-r" data-beat="1" data-mascot="1" data-mascot-side="stay" style="--r:-.4deg"><p><span class="tag t-blue p21-c">guide</span>看做到哪一步</p><p><span class="tag t-blue p21-c">styles --open</span>打开样册</p></div>
      <div class="wc-paper p21-r" data-beat="2" style="--r:.3deg"><p><span class="tag t-blue p21-c">check</span>不开浏览器的检查</p><p><span class="tag t-blue p21-c">check --browser</span>后台浏览器自检</p></div>
      <div class="wc-paper p21-r" data-beat="3" style="--r:-.3deg"><p><span class="tag t-blue p21-c">open</span>用浏览器打开课件</p><p><span class="tag t-blue p21-c">tour</span>打开这份教程</p></div>
      <div class="wc-paper p21-r" data-beat="4" style="--r:.4deg"><p><span class="tag t-blue p21-c">version</span>查看版本</p><p><span class="tag t-blue p21-c">update</span>立即检查并更新</p></div>
    </div>
    <p class="abs p21-foot" data-beat="0" style="left:120px;top:900px"><span data-small>每条命令前面都是 node "〈skill 目录〉/scripts/li-talk.mjs"，AI 会替你填好</span></p>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '平时你只需要对 AI 说话。想了解背后的命令，这一页列了常用的几条。' },
    { beat: 1, key: 'guide', say: 'guide 看做到哪一步，styles --open 打开样册。' },
    { beat: 2, key: 'check', say: 'check 是两种检查，加上 --browser 就是后台浏览器自检。' },
    { beat: 3, key: 'open', say: 'open 打开课件，tour 打开这份教程。' },
    { beat: 4, key: 'update', say: 'version 看版本，update 立即更新。' },
  ],
});

/* p22 分享课件：左边三步（序号是一滴天空蓝颜料），右边一张水彩纸画着课件文件夹（示意），第 2 拍用铅笔圈出 index.html */
Deck.add({
  id: 'p22',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '分享',
  scene: 'watercolor',
  title: '分享课件：拷走整个文件夹',
  html: `
    <ol class="abs steps p22-flow" style="left:120px;top:270px;width:800px;--gap:40px">
      <li><b>拷走整个目录</b><span data-beat="1">或者压成 zip 发过去</span></li>
      <li><b>对方双击 index.html</b><span data-beat="2">Chrome、Edge 打开效果最好</span></li>
      <li data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" data-mascot-pose="happy"><b>离线也能打开</b><span data-beat="3">不连网，不加载任何外部资源</span></li>
    </ol>
    <div class="wc-paper abs p22-win" data-beat="0" data-recede="off" style="left:1080px;top:290px;width:720px">
      <p class="p22-hd"><span class="tag t-yellow">我的分享</span><span class="p22-hint" data-small>课件目录</span></p>
      <div class="p22-files">
        <p data-small><i class="p22-f"></i>index.html</p>
        <p data-small><i class="p22-d"></i>slides/</p>
        <p data-small><i class="p22-d"></i>素材/</p>
        <p data-small><i class="p22-d"></i>engine/</p>
        <p data-small><i class="p22-d"></i>scenes/ · mascots/ · vendor/</p>
        <p data-small><i class="p22-f"></i>讲稿.md</p>
      </div>
    </div>
    <svg class="sketch" aria-hidden="true">
      <ellipse class="c-mark" data-beat="2" cx="1250" cy="407" rx="170" ry="42" stroke-width="3.5"/>
    </svg>
    <p class="abs p-capt" data-beat="0" data-small style="left:1080px;top:840px"><span class="tag">示意</span>一份课件就是一个文件夹</p>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '讲完想把课件发给别人？' },
    { beat: 1, key: '整个目录', say: '把整个课件目录拷走，或者压成 zip 发过去。' },
    { beat: 2, key: 'index.html', say: '对方双击里面的 index.html 就能看，用 Chrome 或 Edge 效果最好。' },
    { beat: 3, key: '离线', say: '不用联网，也不加载任何外部资源，内网、会议室的电脑都能放。' },
  ],
});

/* p23 在线托管（示意）：AI 工具能把网页托管成在线链接时，做完课件 AI 会问要不要发。对话写成绘本对白，右边三张便签一拍一条要点 */
Deck.add({
  id: 'p23',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '在线链接',
  scene: 'watercolor',
  title: '发成在线链接，点开就能看',
  html: `
    <div class="wc-paper abs p-say" data-beat="1" data-mascot="1" data-mascot-side="stay" style="left:120px;top:240px;width:1100px;--r:-.5deg"><span class="tag t-mint p-who">AI</span><div class="p-col"><p class="p-txt">要不要把课件发成一个在线链接？发给别人点开就能看，不用拷文件。</p><p class="p-warn" data-small>会把整个课件上传到当前 AI 工具的服务器，包括里面的截图</p><p class="p-opts"><span class="tag t-yellow">1 发（推荐）</span><span class="tag t-yellow">2 不发：只留在本机</span></p></div></div>
    <div class="wc-paper abs p-say p-me" data-beat="2" style="left:920px;top:590px;width:300px;--r:1deg"><span class="tag t-peach p-who">你</span><p class="p-txt">1</p></div>
    <div class="wc-paper abs p-say" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:720px;width:1100px;--r:.5deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">发好了：<span class="p-url" data-small>https://example.com/你的课件</span> 拿到链接的人都能打开</p></div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:924px"><span class="tag">示意</span>AI 工具能托管网页时，课件做完会问这一句</p>
    <div class="abs p23-pts" style="left:1300px;top:250px;width:500px">
      <div class="wc-paper p23-pt" data-beat="0" style="--r:.8deg"><b>工具不支持就不问</b><p>照样可以拷目录分享</p></div>
      <div class="wc-paper p23-pt" data-beat="3" data-mascot="3" data-mascot-side="stay" style="--r:-.6deg"><b>改过要重新发</b><p>重新发布一次，链接里才会更新</p></div>
      <div class="wc-paper p23-pt" data-beat="4" data-mascot="4" data-mascot-side="stay" style="--r:.5deg"><b>有内部截图？</b><p>发之前想一想，截图会一起上传</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:110px"></div>`,
  notes: [
    { beat: 0, say: '除了拷文件，还可以发成一个在线链接。有的 AI 工具能把网页托管成在线链接，比如 WorkBuddy、Codex；工具不支持的话就不问，照样拷目录分享。' },
    { beat: 1, key: '在线链接', say: '课件做完时，AI 会问你要不要发成在线链接，并提醒你：整个课件会上传到当前 AI 工具的服务器，包括里面的截图。' },
    { beat: 2, key: '发', say: '你说发它才上传。发好以后告诉你链接，也说清楚这个链接谁能打开。' },
    { beat: 3, key: '重新发', say: '课件改过以后，要重新发布一次，链接里才会更新。' },
    { beat: 4, key: '截图', say: '课件里有内部截图的，发之前想一想。' },
  ],
});

/* p24 自动更新（示意）：绘本对白，AI 转告已经更新；你问版本，AI 回答；右边一块水彩底的卡说怎么更新 */
Deck.add({
  id: 'p24',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '更新',
  scene: 'watercolor',
  title: '自动更新，做好的课件不会被改',
  html: `
    <p class="abs p-hd" data-beat="0" style="left:120px;top:250px"><span class="tag t-blue">和 AI 的对话</span><span class="p-hint" data-small>每天第一次用时</span></p>
    <div class="wc-paper abs p-say" data-beat="1" style="left:120px;top:350px;width:1100px;--r:-.5deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">li-talk-skills 已经自动更新了，新开一个对话后生效。已经做好的课件不会被改动。</p></div>
    <div class="wc-paper abs p-say p-me" data-beat="2" style="left:560px;top:570px;width:660px;--r:.8deg"><span class="tag t-peach p-who">你</span><p class="p-txt">看看 li-talk-skills 的版本</p></div>
    <div class="wc-paper abs p-say" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="happy" style="left:120px;top:710px;width:1100px;--r:.4deg"><span class="tag t-mint p-who">AI</span><p class="p-txt">已经是最新版。想马上检查更新，对我说「更新 li-talk-skills」就行。</p></div>
    <p class="abs p-capt" data-beat="0" data-small style="left:120px;top:924px"><span class="tag">示意</span>更新的事 AI 会转告你</p>
    <div class="abs card t-yellow p24-card" data-beat="0" style="left:1300px;top:290px;width:500px;--r:1deg">
      <h3>怎么更新</h3>
      <p>每天第一次用时自动检查，只下载变了的文件，全部校验通过才替换</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '更新你几乎不用管。' },
    { beat: 1, key: '自动更新', say: '每天第一次用时会自动检查，有新版本就更新，AI 会转告你，新开一个对话后生效。已经做好的课件不会被改动。' },
    { beat: 2, key: '版本', say: '想看版本，就对 AI 说看看 li-talk-skills 的版本。' },
    { beat: 3, key: '更新', say: '想马上更新，就说更新 li-talk-skills。' },
  ],
});

/* p25 常见问题：一排三块水彩底的卡，一拍一块（编号是一滴天空蓝颜料、问题、回答） */
Deck.add({
  id: 'p25',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '常见问题',
  scene: 'watercolor',
  title: '常见问题',
  html: `
    <div class="abs grid p25-v" style="left:120px;top:300px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-blue p25-c" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".1" style="--r:-.8deg"><h3><i class="wc-no">1</i>字体要联网吗？</h3><p>第一次会下载字体；下载不了先用自带的小字库</p></div>
      <div class="card t-yellow p25-c" data-beat="2" style="--r:.6deg"><h3><i class="wc-no">2</i>支持哪些浏览器？</h3><p>Chrome、Edge 功能全；Safari、Firefox 能看，少数效果会降级</p></div>
      <div class="card t-peach p25-c" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".1" style="--r:-.5deg"><h3><i class="wc-no">3</i>截图要注意什么？</h3><p>点开显示的是原图，放进去之前先处理掉敏感信息</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '最后几个常见问题。' },
    { beat: 1, key: '字体', say: '字体要联网吗？手绘风第一次会下载完整字体；下载不了就先用自带的常用字小字库，不卡流程。' },
    { beat: 2, key: '浏览器', say: '支持哪些浏览器？Chrome、Edge 所有功能正常；Safari、Firefox 能看，少数效果会降级。' },
    { beat: 3, key: '截图', say: '截图要注意什么？课件里的截图点开显示的是原图，放进去之前先把敏感信息处理掉。' },
  ],
});

/* p26 结尾（明信片）：一张从田园寄来的水彩明信片，左半边一幅小画（一条小路通向暖阳下的远方），右半边写收尾金句，
   右上角一枚邮票、一个铅笔邮戳；第 1 拍明信片下面出一行话和可以复制的项目地址。署名由引擎自动加在最后一页底下 */
Deck.add({
  id: 'p26',
  chapter: '结尾',
  scene: 'watercolor',
  title: '想好要讲什么，剩下的交给 AI',
  noTitle: true,
  html: `
    <div class="wc-paper wc-post abs" data-beat="0" style="left:250px;top:110px;width:1420px;height:640px;--r:-.6deg">
      <div class="wc-art abs" style="left:46px;top:46px;width:600px;height:548px">
        <svg class="wc-paint" viewBox="0 0 600 548" aria-hidden="true">
          <path class="sun" d="M8 8H592V340C460 320 280 360 8 330Z" style="--o:.3"/>
          <circle class="sun" cx="440" cy="120" r="58" style="--o:.6"/>
          <path class="peach" d="M8 220C200 200 420 236 592 210V360C470 350 300 390 8 396Z" style="--o:.22"/>
          <path class="grass" d="M8 380C180 344 380 352 592 322V540H8Z" style="--o:.38"/>
          <path class="wood st" d="M190 540C230 480 330 452 330 410C330 380 380 356 420 340" style="--w:34;--o:.38"/>
          <path class="wood" d="M470 300L520 300L534 312L520 324L470 324Z" style="--o:.55"/>
          <circle class="pink" cx="110" cy="452" r="9" style="--o:.6"/>
          <circle class="sun" cx="140" cy="476" r="8" style="--o:.7"/>
          <circle class="pink" cx="480" cy="430" r="9" style="--o:.6"/>
        </svg>
        <svg class="sketch" viewBox="0 0 600 548" aria-hidden="true">
          <rect x="8" y="8" width="584" height="532" data-roughness=".5" stroke-width="1.6"/>
          <path d="M8 380C180 344 380 352 592 322"/>
          <path d="M470 300L520 300L534 312L520 324L470 324Z" data-roughness=".5"/>
          <path d="M490 324L490 360" data-roughness=".5"/>
          <path d="M96 470q4 -16 8 0q4 -18 8 0M466 444q4 -14 8 0q4 -16 8 0" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <i class="wc-stamp abs" style="left:1196px;top:42px;width:154px;height:182px;--r:2deg"></i>
      <div class="wc-art abs" style="left:0;top:0;width:1420px;height:640px">
        <svg class="sketch" viewBox="0 0 1420 640" aria-hidden="true">
          <path d="M712 90L714 560" data-roughness=".6"/>
          <circle cx="1170" cy="146" r="64" data-roughness=".6" stroke-width="1.8"/>
          <circle cx="1170" cy="146" r="50" data-roughness=".5" stroke-width="1.4"/>
          <path d="M970 126q16 -8 32 0t32 0t32 0t32 0M970 146q16 -8 32 0t32 0t32 0t32 0M970 166q16 -8 32 0t32 0t32 0t32 0" data-roughness=".4" stroke-width="1.6"/>
        </svg>
      </div>
      <p class="wc-title abs p26-q" style="left:770px;top:270px">想好要讲什么，<br>剩下的<em class="key">交给 AI</em></p>
    </div>
    <div class="abs p26-link" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" style="left:254px;top:790px"><p class="p26-tip" data-small>现在就对 AI 说「用 li-talk-skills 做一份课件」。项目地址，点一下复制：</p><button class="copy" type="button" data-copy="https://github.com/xiaoli1999/li-talk-skills">github.com/xiaoli1999/li-talk-skills</button></div>
    <div class="mascot guide" style="left:100px;top:800px"></div>`,
  notes: [
    { beat: 0, key: '交给 AI', say: '教程就到这里。你只管想好要讲什么，剩下的交给 AI。' },
    { beat: 1, say: '现在就对 AI 说：用 li-talk-skills 做一份课件。项目地址在这里，点一下就能复制。谢谢你看完，祝你讲得顺利。' },
  ],
});
