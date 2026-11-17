/* 测试章节：蓝图 blueprint，7 页把通用组件都用一遍（虚构主题：搭一个书架）
   1 封面（大字、副标题、一排标签、图签栏）     2 清单（卡片 + 小标签 + 重点词 + 圈注）
   3 竖排步骤（点划中心线串起序号，第三步带一行命令：审图章盖在命令旁边）
   4 横排步骤加手绘箭头（+ 下划线圈注）        5 终端加可复制的一行（+ 卡片 + 图签栏：审图章盖进「审核」格）
   6 金句加截图位                              7 左右对比加一排小格（最后一页 2 拍，引擎自动加署名）
   每页放一只形象（.mascot.guide），目标元素上写 data-mascot 拍号 */

Deck.add({
  id: 'b1',
  chapter: '开场',
  scene: 'blueprint',
  title: '搭一个书架',
  noTitle: true,
  html: `
    <p class="abs t-xl b" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:150px;top:330px">搭一个书架</p>
    <p class="abs lead muted" data-beat="0" style="left:150px;top:470px">一张图纸、五块板，二十分钟装好</p>
    <div class="abs row" data-beat="1" data-stagger data-mascot="1" data-mascot-side="right" style="left:150px;top:610px;--gap:34px;--align:center">
      <span class="tag">周末手工</span><span class="tag t-white">二十分钟</span><span class="tag">不用电钻</span>
    </div>
    <div class="bp-titleblock" data-speaker="讲者"></div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '今天讲怎么照着图纸搭一个书架。' },
    { beat: 1, say: '周末就能做，二十分钟，不用电钻。' },
  ],
});

Deck.add({
  id: 'b2',
  chapter: '一、备料',
  topic: '要备的板材',
  scene: 'blueprint',
  title: '动手之前，先认三种板',
  html: `
    <p class="explain" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-dx="40" data-mascot-dy="46"><b>板材</b>：书架的侧板、层板和背板</p>
    <div class="abs grid" style="left:120px;top:360px;width:1680px;--cols:3;--gap:70px">
      <div class="card" data-beat="1" data-mascot="1" data-mascot-side="bottom">
        <span class="lab">两块</span><h3>侧板</h3><p>立在两边，<em class="key">承重</em>全靠它</p>
      </div>
      <div class="card t-yellow" data-beat="2" data-mascot="2" data-mascot-side="bottom">
        <span class="lab">两块</span><h3>层板</h3><p>架在中间，<em class="key">横着</em>放书</p>
      </div>
      <div class="card t-blue tape" data-beat="3" data-mascot="3" data-mascot-side="bottom">
        <span class="lab">一块</span><h3>背板</h3><p>钉在背面，书架就<span data-mark="circle">不晃</span></p>
      </div>
    </div>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '板材', say: '先认识三种板。' },
    { beat: 1, key: '承重', say: '侧板立在两边，承重全靠它。' },
    { beat: 2, key: '横着', say: '层板横着架在中间放书。' },
    { beat: 3, say: '背板钉在背面，书架就不晃了。' },
  ],
});

Deck.add({
  id: 'b3',
  chapter: '二、装配',
  topic: '装配顺序',
  scene: 'blueprint',
  title: '照这个顺序装，不会返工',
  html: `
    <p class="explain" data-beat="0"><b>装配</b>：把零件按顺序拼成一个整体</p>
    <p class="abs lead muted" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:120px;top:420px">先立框，再放层，<br>最后钉背板。</p>
    <ol class="abs steps" style="left:1000px;top:330px;width:800px;--gap:60px">
      <li data-beat="1" data-mascot="1" data-mascot-side="left"><b>立<em class="key">侧板</em></b><span>两块侧板竖着摆好</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="left"><b><em class="key">装层板</em></b><span>从下往上一层层装</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="left"><b>钉背板</b><span><em class="key">一条命令</em>算好钉子</span>
        <button class="copy" type="button" data-copy="shelf nails --size 80x180">shelf nails --size 80x180</button></li>
    </ol>
    <div class="mascot guide" style="left:640px;top:440px"></div>`,
  notes: [
    { beat: 0, key: '装配', say: '装配就是把零件按顺序拼起来。' },
    { beat: 1, key: '侧板', say: '第一步，立起两块侧板。' },
    { beat: 2, key: '装层板', say: '第二步，从下往上装层板。' },
    { beat: 3, key: '一条命令', say: '第三步钉背板，这行命令点一下就能复制。' },
  ],
});

Deck.add({
  id: 'b4',
  chapter: '二、装配',
  topic: '三步横着排',
  scene: 'blueprint',
  title: '横着看也一样：三步装好',
  html: `
    <p class="explain" data-beat="0"><b>层板</b>：架在两块侧板之间、放书的那块板</p>
    <ol class="abs steps h" style="left:120px;top:420px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">量尺寸</em></b><span>量好两块侧板的间距</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">打孔</em></b><span>侧板上画线再打孔</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b>装上去</b><span><span data-mark="underline">拧紧螺丝</span>就好</span></li>
    </ol>
    <svg class="sketch">
      <path d="M598 470 C628 450 670 450 700 470" data-arrow data-beat="2"/>
      <path d="M1204 470 C1234 450 1276 450 1306 470" data-arrow data-beat="3"/>
    </svg>
    <div class="mascot guide" style="left:150px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '层板', say: '层板就是放书的那块板。' },
    { beat: 1, key: '量尺寸', say: '第一步量尺寸。' },
    { beat: 2, key: '打孔', say: '第二步画线打孔。' },
    { beat: 3, say: '第三步装上去，拧紧螺丝。' },
  ],
});

Deck.add({
  id: 'b5',
  chapter: '二、装配',
  topic: '算一算要几颗钉子',
  scene: 'blueprint',
  title: '一条命令算出用料',
  html: `
    <p class="explain" data-beat="0"><b>终端</b>：输入命令的窗口，Windows 上叫 PowerShell</p>
    <div class="term abs" data-beat="1" data-title="终端" data-mascot="1" data-mascot-side="right" style="left:120px;top:300px;width:1000px">
      <p class="in">shelf plan --layers 4</p>
      <p class="dim">正在算用料……</p>
      <p class="ok">板材 5 块，钉子 24 颗</p>
    </div>
    <button class="copy abs" type="button" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="left:120px;top:660px">shelf plan --layers 4</button>
    <div class="card abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="left:1300px;top:300px;width:500px">
      <h3>点一下就复制</h3>
      <p>点命令只会<em class="key">复制</em>，页面不会往下翻</p>
    </div>
    <div class="bp-titleblock" data-speaker="讲者"></div>
    <div class="mascot guide" style="left:1700px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '终端', say: '先认识终端。' },
    { beat: 1, say: '在终端里输入这条命令，用料就算出来了。' },
    { beat: 2, say: '命令可以直接点一下复制。' },
    { beat: 3, key: '复制', say: '点命令不会翻页。' },
  ],
});

Deck.add({
  id: 'b6',
  chapter: '三、收尾',
  topic: '记住一句话',
  scene: 'blueprint',
  title: '最后，记住一句话',
  html: `
    <p class="explain" data-beat="0"><b>金句</b>：一页只放一句，字要大，留白要多</p>
    <p class="quote abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="left:120px;top:360px;width:760px;text-align:left">先看<em class="key">图纸</em>，<br>再拧螺丝</p>
    <figure class="shot abs" data-beat="2" data-src="shots/placeholder.svg" data-caption="装好的书架" data-mascot="2" data-mascot-side="bottom" style="left:960px;top:290px;width:840px"></figure>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '最后一句话。' },
    { beat: 1, key: '图纸', say: '先看图纸，再拧螺丝。' },
    { beat: 2, say: '装好就是这个样子。' },
  ],
});

Deck.add({
  id: 'b7',
  chapter: '三、收尾',
  topic: '以前和现在',
  scene: 'blueprint',
  title: '以前和现在',
  html: `
    <div class="vs abs" data-mid="→" style="left:120px;top:260px;width:1680px">
      <div class="card t-white" data-beat="1"><h3>以前</h3><p><span data-mark="strike">凭感觉锯，锯完才发现短了</span></p></div>
      <div class="card t-blue" data-beat="1" data-delay=".3" data-mascot="1" data-mascot-side="bottom"><h3>现在</h3><p>先画图纸，<em class="key">一次锯对</em></p></div>
    </div>
    <div class="cells abs" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:120px;top:640px;width:1680px">
      <div class="cell human"><i>第一步</i><b>量尺寸</b><span>你来</span></div>
      <div class="cell ai"><i>第二步</i><b>算用料</b><span>工具来</span></div>
      <div class="cell ai"><i>第三步</i><b>出图纸</b><span>工具来</span></div>
      <div class="cell idle"><i>不用了</i><b>返工</b><span>省下来</span></div>
    </div>
    <div class="mascot guide" style="left:1716px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '最后对比一下。' },
    { beat: 1, key: '一次锯对', say: '以前凭感觉锯，现在先画图纸，一次锯对。' },
    { beat: 2, say: '分工是这样的。' },
  ],
});
