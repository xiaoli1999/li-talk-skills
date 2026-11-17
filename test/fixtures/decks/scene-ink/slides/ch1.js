/* 测试章节：水墨国风 ink，7 页把通用组件都用一遍
   1 封面（大字、副标题、一排标签）       2 清单（卡片 + 小标签 + 重点词 + 胶带 + 圈注）
   3 竖排步骤（墨点由竖笔串起来，第三步带一行命令，样页的版式）
   4 横排步骤加手绘箭头（+ 下划线圈注）   5 终端加可复制的一行（+ 卡片）
   6 金句加截图位                         7 左右对比加一排小格（最后一页 2 拍，引擎自动加署名）
   每页放一只形象（.mascot.guide），目标元素上写 data-mascot 拍号 */

Deck.add({
  id: 'i1',
  chapter: '开场',
  scene: 'ink',
  title: '一份课件，三步做完',
  noTitle: true,
  html: `
    <p class="abs t-xl b" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:150px;top:330px">一份课件，三步做完</p>
    <p class="abs lead muted" data-beat="0" style="left:150px;top:470px">课件就是一个能一拍一拍翻的网页，双击就能打开</p>
    <div class="abs row" data-beat="1" data-stagger data-mascot="1" data-mascot-side="right" style="left:150px;top:610px;--gap:34px;--align:center">
      <span class="tag">上手篇</span><span class="tag t-white">二十分钟</span><span class="tag t-blue">不用写代码</span>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '今天讲怎么用三步做出一份课件。' },
    { beat: 1, say: '面向第一次做的人，二十分钟，不用写代码。' },
  ],
});

Deck.add({
  id: 'i2',
  chapter: '一、准备',
  topic: '动手之前',
  scene: 'ink',
  title: '动手之前，先想清楚三件事',
  html: `
    <p class="explain" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-dx="40" data-mascot-dy="46"><b>讲稿</b>：按页写下要说的话，课件跟着讲稿走</p>
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:3;--gap:60px">
      <div class="card" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-.8deg">
        <span class="lab">听众</span><h3>讲给谁听</h3><p>听众是<em class="key">新人</em>还是老手，决定从哪里讲起</p>
      </div>
      <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.6deg">
        <span class="lab">目标</span><h3>讲完做到什么</h3><p>听完能<em class="key">自己动手</em>，做出第一份课件</p>
      </div>
      <div class="card t-blue tape" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.5deg">
        <h3>最多讲多久</h3><p>二十分钟大约<span data-mark="circle">十页</span>，一页讲一两分钟</p>
      </div>
    </div>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '讲稿', say: '先有讲稿，再有课件。' },
    { beat: 1, key: '新人', say: '第一件：讲给谁听。' },
    { beat: 2, key: '自己动手', say: '第二件：讲完要做到什么。' },
    { beat: 3, say: '第三件：最多讲多久，二十分钟大约十页。' },
  ],
});

Deck.add({
  id: 'i3',
  chapter: '二、上手',
  topic: '三步做出一份课件',
  scene: 'ink',
  title: '一份课件，三步做完',
  html: `
    <p class="explain" data-beat="0"><b>课件</b>：一个能一拍一拍翻的网页，双击就能打开</p>
    <p class="abs lead muted" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:120px;top:420px">一拍只讲一件事，<br>讲过的自己淡下去。</p>
    <ol class="abs steps" style="left:1000px;top:330px;width:800px;--gap:60px">
      <li data-beat="1" data-mascot="1" data-mascot-side="left"><b>写<em class="key">讲稿</em></b><span>把想讲的话按页写下来</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="left"><b><em class="key">选风格</em></b><span>从样册里挑一个顺眼的</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="left"><b>出页面</b><span><em class="key">一条命令</em>搭好骨架</span>
        <button class="copy" type="button" data-copy="node li-talk.mjs new 我的分享">node li-talk.mjs new 我的分享</button></li>
    </ol>
    <div class="mascot guide" style="left:640px;top:440px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '课件就是一个网页，一拍讲一件事。' },
    { beat: 1, key: '讲稿', say: '第一步，写讲稿。' },
    { beat: 2, key: '选风格', say: '第二步，选一个风格。' },
    { beat: 3, key: '一条命令', say: '第三步，一条命令搭好骨架，这行命令点一下就能复制。' },
  ],
});

Deck.add({
  id: 'i4',
  chapter: '二、上手',
  topic: '三步横着排',
  scene: 'ink',
  title: '横着排也一样：三步做完',
  html: `
    <p class="explain" data-beat="0"><b>样册</b>：所有风格、所有样板页放在一起的页面</p>
    <ol class="abs steps h" style="left:120px;top:420px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b>写<em class="key">讲稿</em></b><span>按页写下想说的话</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">选风格</em></b><span>样册里挑一个</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b>出页面</b><span><span data-mark="underline">一条命令</span>搭骨架</span></li>
    </ol>
    <svg class="sketch">
      <path d="M598 470 C628 450 670 450 700 470" data-arrow data-beat="2"/>
      <path d="M1204 470 C1234 450 1276 450 1306 470" data-arrow data-beat="3"/>
    </svg>
    <div class="mascot guide" style="left:150px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '样册', say: '样册就是把所有风格放在一起看的页面。' },
    { beat: 1, key: '讲稿', say: '第一步写讲稿。' },
    { beat: 2, key: '选风格', say: '第二步在样册里挑风格。' },
    { beat: 3, say: '第三步一条命令搭好骨架。' },
  ],
});

Deck.add({
  id: 'i5',
  chapter: '二、上手',
  topic: '装好只要一条命令',
  scene: 'ink',
  title: '装好只要一条命令',
  html: `
    <p class="explain" data-beat="0"><b>终端</b>：输入命令的窗口，Windows 上叫 PowerShell</p>
    <div class="term abs" data-beat="1" data-title="终端" data-mascot="1" data-mascot-side="right" style="left:120px;top:300px;width:1000px">
      <p class="in">npx li-talk-skills guide</p>
      <p class="dim">正在检查环境……</p>
      <p class="ok">一切就绪，可以开始了</p>
    </div>
    <button class="copy abs" type="button" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="left:120px;top:660px">npx li-talk-skills guide</button>
    <div class="card abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="left:1300px;top:300px;width:500px">
      <h3>点一下就复制</h3>
      <p>点命令只会<em class="key">复制</em>，页面不会往下翻</p>
    </div>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '终端', say: '先认识终端。' },
    { beat: 1, say: '在终端里输入这条命令。' },
    { beat: 2, say: '命令可以直接点一下复制。' },
    { beat: 3, key: '复制', say: '点命令不会翻页。' },
  ],
});

Deck.add({
  id: 'i6',
  chapter: '三、收尾',
  topic: '记住一句话',
  scene: 'ink',
  title: '最后，记住一句话',
  html: `
    <p class="explain" data-beat="0"><b>金句</b>：一页只放一句，字要大，留白要多</p>
    <p class="quote abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="left:120px;top:360px;width:760px;text-align:left">先写<em class="key">讲稿</em>，<br>再做页面</p>
    <figure class="shot abs" data-beat="2" data-src="shots/placeholder.svg" data-caption="课件在浏览器里的样子" data-mascot="2" data-mascot-side="bottom" style="left:960px;top:290px;width:840px;--r:-.8deg"></figure>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '最后一句话。' },
    { beat: 1, key: '讲稿', say: '先写讲稿，再做页面。' },
    { beat: 2, say: '做出来就是这个样子。' },
  ],
});

Deck.add({
  id: 'i7',
  chapter: '三、收尾',
  topic: '以前和现在',
  scene: 'ink',
  title: '以前和现在',
  html: `
    <div class="vs abs" data-mid="→" style="left:120px;top:260px;width:1680px">
      <div class="card t-white" data-beat="1"><h3>以前</h3><p><span data-mark="strike">改一个字，重新排一遍版</span></p></div>
      <div class="card t-peach" data-beat="1" data-delay=".3" data-mascot="1" data-mascot-side="bottom"><h3>现在</h3><p>改讲稿，<em class="key">页面跟着变</em></p></div>
    </div>
    <div class="cells abs" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:120px;top:640px;width:1680px">
      <div class="cell human"><i>第一步</i><b>写讲稿</b><span>你来</span></div>
      <div class="cell ai"><i>第二步</i><b>排版</b><span>AI 来</span></div>
      <div class="cell ai"><i>第三步</i><b>自检</b><span>AI 来</span></div>
      <div class="cell idle"><i>不用了</i><b>拖文本框</b><span>省下来</span></div>
    </div>
    <div class="mascot guide" style="left:1716px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '最后对比一下。' },
    { beat: 1, key: '页面跟着变', say: '以前改一个字要重新排版，现在改讲稿，页面跟着变。' },
    { beat: 2, say: '分工是这样的。' },
  ],
});
