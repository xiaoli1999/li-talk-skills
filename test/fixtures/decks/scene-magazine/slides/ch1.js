/* 测试章节：杂志复古 magazine，7 页把通用组件都用一遍
   1 封面（封面色块 .mag-cover 和里面反白的大字、标签、卡片）  2 清单（卡片 + 小标签 + 重点词 + 圈注）
   3 横排步骤加手绘箭头   4 终端加可复制的一行（剪角券）加卡片   5 竖排步骤（三张纸条左右错开、略歪，最后一张带命令券）
   6 金句加截图位        7 左右对比加一排小格（最后一页，2 拍，自动署名）
   每页放一只形象（.mascot.guide），目标元素上写 data-mascot 拍号 */

Deck.add({
  id: 'm1',
  chapter: '开场',
  scene: 'magazine',
  title: '一份课件，三步做完',
  noTitle: true,
  html: `
    <div class="mag-cover abs" data-beat="0" style="left:120px;top:150px;width:790px;height:816px">
      <p class="abs cover-t">一份课件<span class="c-mark">，</span><br>三步做完</p>
      <i class="abs cover-bar"></i>
      <p class="abs lead cover-deck">课件就是一个能一拍一拍翻的网页，<br>双击就能打开。</p>
    </div>
    <div class="abs row" data-beat="0" style="left:1052px;top:200px;--gap:22px">
      <span class="tag">技术分享</span><span class="tag t-peach">上手篇</span>
    </div>
    <div class="card t-yellow abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="left:1052px;top:340px;width:748px;--r:-.6deg">
      <span class="lab">新人分享会</span>
      <h3>讲者：〈你的名字〉</h3>
      <p>二十分钟，讲完就能自己动手</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:858px;top:408px"></div>`,
  notes: [
    { beat: 0, say: '今天讲怎么用三步做出一份课件。' },
    { beat: 1, say: '这是一次面向新人的分享，二十分钟。' },
  ],
});

Deck.add({
  id: 'm2',
  chapter: '一、准备',
  topic: '动手之前',
  scene: 'magazine',
  title: '动手之前，先想清楚三件事',
  html: `
    <p class="explain" data-beat="0"><b>讲稿</b>：按页写下要说的话，课件跟着讲稿走</p>
    <div class="abs grid" style="left:120px;top:360px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-1deg">
        <span class="lab">听众</span><h3>讲给<em class="key">谁</em>听</h3><p>新人还是老手，决定从哪里讲起</p>
      </div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.8deg">
        <span class="lab">目标</span><h3>讲完<em class="key">做到</em>什么</h3><p>听完能自己动手，做出第一份</p>
      </div>
      <div class="card t-white" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.6deg">
        <span class="lab">时长</span><h3>最多讲<em class="key">多久</em></h3><p>二十分钟，大约<span data-mark="circle">十页</span></p>
      </div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '讲稿', say: '先有讲稿，再有课件。' },
    { beat: 1, key: '谁', say: '第一件：讲给谁听。' },
    { beat: 2, key: '做到', say: '第二件：讲完要做到什么。' },
    { beat: 3, key: '多久', say: '第三件：最多讲多久，二十分钟大约十页。' },
  ],
});

Deck.add({
  id: 'm3',
  chapter: '二、上手',
  topic: '三步做出一份课件',
  scene: 'magazine',
  title: '一份课件，三步做完',
  html: `
    <p class="explain" data-beat="0"><b>课件</b>：一个能一拍一拍翻的网页，双击就能打开</p>
    <ol class="steps h abs" style="left:120px;top:330px;width:1680px;--gap:140px">
      <li class="tilt" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-.8deg"><b>写<em class="key">讲稿</em></b><span>按页写下要说的话</span></li>
      <li class="tilt" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.6deg"><b><em class="key">选风格</em></b><span>挑一个顺眼的风格</span></li>
      <li class="tilt" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.4deg"><b>出页面</b><span><em class="key">一条命令</em>搭好骨架</span></li>
    </ol>
    <svg class="sketch">
      <path d="M598 420 C632 398 668 398 714 420" data-arrow data-beat="2"/>
      <path d="M1204 420 C1238 398 1274 398 1320 420" data-arrow data-beat="3"/>
    </svg>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '课件', say: '课件就是一个网页。' },
    { beat: 1, key: '讲稿', say: '第一步，写讲稿。' },
    { beat: 2, key: '选风格', say: '第二步，选一个风格。' },
    { beat: 3, key: '一条命令', say: '第三步，一条命令搭好骨架。' },
  ],
});

Deck.add({
  id: 'm4',
  chapter: '二、上手',
  topic: '装好只要一条命令',
  scene: 'magazine',
  title: '装好只要一条命令',
  html: `
    <p class="explain" data-beat="0"><b>终端</b>：输入命令的窗口，Windows 上叫 PowerShell</p>
    <div class="term abs" data-beat="1" data-title="终端" style="left:120px;top:300px;width:1000px" data-mascot="1" data-mascot-side="right">
      <p class="in">npx li-talk-skills guide</p>
      <p class="dim">正在检查环境……</p>
      <p class="ok">一切就绪，可以开始了</p>
    </div>
    <button class="copy abs" type="button" data-beat="2" style="left:120px;top:660px;--r:-.5deg" data-mascot="2" data-mascot-side="bottom">npx li-talk-skills guide</button>
    <div class="card t-peach tape abs" data-beat="3" style="left:1300px;top:320px;width:500px;--r:1deg" data-mascot="3" data-mascot-side="bottom">
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
  id: 'm5',
  chapter: '二、上手',
  topic: '照着做一遍',
  scene: 'magazine',
  title: '照着做，十分钟出第一页',
  html: `
    <ol class="steps abs" style="left:600px;top:236px;width:1200px;--gap:28px">
      <li class="tilt" data-beat="1" data-mascot="1" data-mascot-side="left" style="--r:-.6deg;width:1000px"><b>写<em class="key">讲稿</em></b><span>把想讲的话按页写下来</span></li>
      <li class="tilt" data-beat="2" data-mascot="2" data-mascot-side="left" style="--r:.5deg;width:960px;margin-left:80px"><b><em class="key">选风格</em></b><span>从样册里挑一个顺眼的</span></li>
      <li class="tilt" data-beat="3" data-mascot="3" data-mascot-side="left" style="--r:-.35deg;width:1040px;margin-left:-40px"><b>出页面</b><span><em class="key">一条命令</em>搭好骨架</span>
        <button class="copy" type="button" style="justify-self:start;margin-top:22px" data-copy="node li-talk.mjs new 我的分享">node li-talk.mjs new 我的分享</button></li>
    </ol>
    <div class="mascot guide" style="left:200px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '照着做一遍，十分钟就能看到第一页。' },
    { beat: 1, key: '讲稿', say: '先写讲稿。' },
    { beat: 2, key: '选风格', say: '再选风格。' },
    { beat: 3, key: '一条命令', say: '最后一条命令搭好骨架，点一下就能复制。' },
  ],
});

Deck.add({
  id: 'm6',
  chapter: '三、收尾',
  topic: '记住一句话',
  scene: 'magazine',
  title: '最后，记住一句话',
  html: `
    <p class="explain" data-beat="0"><b>金句</b>：一页只放一句，字要大，留白要多</p>
    <p class="quote abs" data-beat="1" style="left:120px;top:330px;width:760px;text-align:left" data-mascot="1" data-mascot-side="bottom">先写<em class="key">讲稿</em>，<br>再做页面</p>
    <figure class="shot abs" data-beat="2" data-src="shots/placeholder.svg" data-caption="课件在浏览器里的样子" style="left:960px;top:300px;width:840px;--r:1.2deg" data-mascot="2" data-mascot-side="bottom"></figure>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '最后一句话。' },
    { beat: 1, key: '讲稿', say: '先写讲稿，再做页面。' },
    { beat: 2, say: '做出来就是这个样子。' },
  ],
});

Deck.add({
  id: 'm7',
  chapter: '三、收尾',
  topic: '以前和现在',
  scene: 'magazine',
  title: '以前和现在',
  html: `
    <div class="vs abs" data-beat="1" data-mid="→" style="left:120px;top:250px;width:1680px">
      <div class="card t-white" data-mascot="1" data-mascot-side="bottom" style="--r:-.8deg"><h3>以前</h3><p>改一个字，要重新排一遍版</p></div>
      <div class="card t-yellow" style="--r:.6deg"><h3>现在</h3><p>改讲稿，<em class="key">页面跟着变</em></p></div>
    </div>
    <div class="cells abs" data-beat="2" style="left:120px;top:640px;width:1680px" data-mascot="2" data-mascot-side="stay">
      <div class="cell human"><i data-small>第一步</i><b>写讲稿</b><span>你来</span></div>
      <div class="cell ai"><i data-small>第二步</i><b>排版</b><span>AI 来</span></div>
      <div class="cell ai"><i data-small>第三步</i><b>自检</b><span>AI 来</span></div>
      <div class="cell idle"><i data-small>不用了</i><b>拖文本框</b><span>省下来</span></div>
    </div>
    <div class="mascot guide" style="left:1716px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '最后对比一下。' },
    { beat: 1, key: '页面跟着变', say: '以前改一个字要重新排版，现在改讲稿，页面跟着变。' },
    { beat: 2, say: '分工是这样的。' },
  ],
});
