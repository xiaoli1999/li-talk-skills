/* 测试章节：新粗野主义 brutal，6 页把通用组件都用一遍
   1 封面（金句大字、标签）  2 清单（卡片 + 小标签 + 重点词 + 圈注）  3 横排步骤加箭头
   4 终端加可复制的一行      5 金句加截图位                         6 左右对比加一排小格（最后一页有自动署名）
   每页放一只形象（.mascot.guide），目标元素上写 data-mascot 拍号 */

Deck.add({
  id: 'b1',
  chapter: '开场',
  scene: 'brutal',
  title: '一份课件，三步做完',
  noTitle: true,
  html: `
    <p class="quote abs" data-beat="0" style="left:0;right:0;top:380px;font-size:104px">一份课件，三步做完</p>
    <p class="lead muted abs center" data-beat="0" style="left:0;right:0;top:540px">课件就是一个能一拍一拍翻的网页，双击就能打开</p>
    <div class="abs center" data-beat="1" style="left:0;right:0;top:700px"><span class="tag">技术分享</span>　<span class="tag t-pink">上手篇</span></div>
    <div class="mascot guide" data-pose="rest" style="left:1490px;top:393px"></div>`,
  notes: [
    { beat: 0, say: '今天讲怎么用三步做出一份课件。' },
    { beat: 1, say: '这是一次面向新手的技术分享。' },
  ],
});

Deck.add({
  id: 'b2',
  chapter: '一、准备',
  topic: '动手之前',
  scene: 'brutal',
  title: '动手之前，先想清楚三件事',
  html: `
    <p class="explain abs" data-beat="0"><b>讲稿</b>：按页写下要说的话，课件跟着讲稿走</p>
    <div class="grid abs" style="left:120px;top:330px;width:1680px;--cols:3;--gap:48px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom"><span class="lab">听众</span><h3>讲给谁听</h3><p>听众是<em class="key">新人</em>还是老手，决定从哪里讲起</p></div>
      <div class="card t-pink" data-beat="2" data-mascot="2" data-mascot-side="bottom"><span class="lab">目标</span><h3>讲完做到什么</h3><p>听完能<em class="key">自己动手</em>，做出第一份课件</p></div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom"><span class="lab">时长</span><h3>最多讲多久</h3><p>一页讲一两分钟，二十分钟大约<em class="key" data-mark="circle">十页</em></p></div>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '讲稿', say: '先有讲稿，再有课件。' },
    { beat: 1, key: '新人', say: '第一件：讲给谁听。' },
    { beat: 2, key: '自己动手', say: '第二件：讲完要做到什么。' },
    { beat: 3, key: '十页', say: '第三件：最多讲多久，二十分钟大约十页。' },
  ],
});

Deck.add({
  id: 'b3',
  chapter: '二、上手',
  topic: '三步做出一份课件',
  scene: 'brutal',
  title: '一份课件，三步做完',
  html: `
    <p class="explain abs" data-beat="0"><b>课件</b>：一个能一拍一拍翻的网页，双击就能打开</p>
    <ol class="steps h abs" style="left:120px;top:330px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b>写讲稿</b><span>把想讲的话按页写下来</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">选风格</em></b><span>从样册里挑一个顺眼的</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b>出页面</b><span><em class="key">一条命令</em>搭好骨架</span></li>
    </ol>
    <svg class="sketch">
      <path d="M604 450 C636 432 670 432 702 450" data-arrow data-beat="2"/>
      <path d="M1210 450 C1242 432 1276 432 1308 450" data-arrow data-beat="3"/>
    </svg>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '课件就是一个网页。' },
    { beat: 1, say: '第一步，写讲稿。' },
    { beat: 2, key: '选风格', say: '第二步，选一个风格。' },
    { beat: 3, key: '一条命令', say: '第三步，一条命令搭好骨架。' },
  ],
});

Deck.add({
  id: 'b4',
  chapter: '二、上手',
  topic: '装好只要一条命令',
  scene: 'brutal',
  title: '装好只要一条命令',
  html: `
    <p class="explain abs" data-beat="0"><b>终端</b>：输入命令的窗口，Windows 上叫 PowerShell</p>
    <div class="term abs" data-beat="1" data-title="终端" style="left:120px;top:300px;width:1000px" data-mascot="1" data-mascot-side="right">
      <p class="in">npx li-talk-skills guide</p>
      <p class="dim">正在检查环境……</p>
      <p class="ok">一切就绪，可以开始了</p>
    </div>
    <button class="copy abs" type="button" data-beat="2" style="left:120px;top:650px" data-mascot="2" data-mascot-side="bottom">npx li-talk-skills guide</button>
    <div class="card t-blue abs" data-beat="3" style="left:1300px;top:300px;width:500px" data-mascot="3" data-mascot-side="bottom">
      <h3>点一下就复制</h3>
      <p>点命令只会<em class="key">复制</em>，页面不会往下翻</p>
    </div>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '终端', say: '先认识终端。' },
    { beat: 1, say: '在终端里输入这条命令。' },
    { beat: 2, say: '命令可以直接点一下复制。' },
    { beat: 3, key: '复制', say: '点命令不会翻页。' },
  ],
});

Deck.add({
  id: 'b5',
  chapter: '三、收尾',
  topic: '记住一句话',
  scene: 'brutal',
  title: '最后，记住一句话',
  html: `
    <p class="explain abs" data-beat="0"><b>金句</b>：一页只放一句，字要大，留白要多</p>
    <p class="quote abs" data-beat="1" style="left:120px;top:340px;width:760px;text-align:left" data-mascot="1" data-mascot-side="bottom">先写<em class="key">讲稿</em>，<br>再做页面</p>
    <figure class="shot abs" data-beat="2" data-src="shots/placeholder.svg" data-caption="课件在浏览器里的样子" style="left:960px;top:290px;width:840px" data-mascot="2" data-mascot-side="bottom"></figure>
    <div class="mascot guide" style="left:1680px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '最后一句话。' },
    { beat: 1, key: '讲稿', say: '先写讲稿，再做页面。' },
    { beat: 2, say: '做出来就是这个样子。' },
  ],
});

Deck.add({
  id: 'b6',
  chapter: '三、收尾',
  topic: '以前和现在',
  scene: 'brutal',
  title: '以前和现在',
  html: `
    <div class="vs abs" data-beat="1" data-mid="→" style="left:120px;top:270px;width:1680px">
      <div class="card t-white" data-mascot="1" data-mascot-side="bottom"><h3>以前</h3><p>改一个字，要重新排一遍版</p></div>
      <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom"><h3>现在</h3><p>改讲稿，<em class="key">页面跟着变</em></p></div>
    </div>
    <div class="cells abs" data-beat="3" style="left:120px;top:640px;width:1680px" data-mascot="3" data-mascot-side="stay">
      <div class="cell human"><i data-small>第一步</i><b>写讲稿</b><span>你来</span></div>
      <div class="cell ai"><i data-small>第二步</i><b>排版</b><span>AI 来</span></div>
      <div class="cell ai"><i data-small>第三步</i><b>自检</b><span>AI 来</span></div>
      <div class="cell idle"><i data-small>不用了</i><b>拖文本框</b><span>省下来</span></div>
    </div>
    <div class="mascot guide" style="left:1700px;top:110px"></div>`,
  notes: [
    { beat: 0, say: '最后对比一下。' },
    { beat: 1, say: '以前改一个字要重新排版。' },
    { beat: 2, key: '页面跟着变', say: '现在改讲稿，页面跟着变。' },
    { beat: 3, say: '分工是这样的。' },
  ],
});
