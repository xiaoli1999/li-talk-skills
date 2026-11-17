/* 测试章节：漫画 comic，8 页把通用组件都用一遍（虚构主题：周末去爬山）
   1 封面（大字、副标题、一排标签、拟声大字）     2 清单（卡片 + 小标签 + 重点词 + 圈注）
   3 横排步骤加手绘箭头（+ 下划线圈注）           4 竖排步骤，第三步带一行命令
   5 终端加可复制的一行（+ 卡片）                 6 金句加截图位
   7 左右对比加一排小格                           8 漫画自己的组件：分镜格里的拟声大字破格、对白气泡（最后一页，引擎自动加署名）
   每页放一只形象（.mascot.guide），目标元素上写 data-mascot 拍号 */

Deck.add({
  id: 'c1',
  chapter: '开场',
  scene: 'comic',
  title: '周末去爬山',
  noTitle: true,
  html: `
    <p class="abs t-xl b" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:150px;top:330px">周末去爬山</p>
    <p class="abs lead muted" data-beat="0" style="left:150px;top:470px">一座小山、一壶水、一个晴天</p>
    <div class="abs row" data-beat="1" data-stagger data-mascot="1" data-mascot-side="right" style="left:150px;top:610px;--gap:34px;--align:center">
      <span class="tag">轻松路线</span><span class="tag t-pink">半天来回</span><span class="tag t-blue">不用装备</span>
    </div>
    <p class="abs cm-sfx" data-beat="1" style="left:1240px;top:330px">出发！</p>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, say: '这个周末，我们去爬一座小山。' },
    { beat: 1, say: '路线轻松，半天来回，不用买装备。出发！' },
  ],
});

Deck.add({
  id: 'c2',
  chapter: '一、准备',
  topic: '包里装三样',
  scene: 'comic',
  title: '出门之前，包里装好三样',
  html: `
    <p class="explain" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-dx="40" data-mascot-dy="46"><b>补给</b>：路上吃的、喝的，背在自己包里</p>
    <div class="abs grid" style="left:120px;top:340px;width:1680px;--cols:3;--gap:60px">
      <div class="card" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-.6deg">
        <span class="lab">喝的</span><h3>一壶温水</h3><p>爬一小时，大约<em class="key">喝掉半壶</em></p>
      </div>
      <div class="card t-pink" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.5deg">
        <span class="lab">吃的</span><h3>两个饭团</h3><p>坐在<em class="key">山顶上</em>吃最香</p>
      </div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.4deg">
        <span class="lab">穿的</span><h3>一件外套</h3><p>山顶风大，<span data-mark="circle">冷五度</span></p>
      </div>
    </div>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '补给', say: '先说补给，就是路上吃的喝的。' },
    { beat: 1, key: '喝掉半壶', say: '第一样是水，爬一小时差不多喝掉半壶。' },
    { beat: 2, key: '山顶上', say: '第二样是饭团，留到山顶上吃。' },
    { beat: 3, say: '第三样是外套，山顶比山脚冷五度左右。' },
  ],
});

Deck.add({
  id: 'c3',
  chapter: '二、上山',
  topic: '上山三步',
  scene: 'comic',
  title: '上山不累，只要三步',
  html: `
    <p class="explain" data-beat="0"><b>歇脚</b>：走一段停一下，喘匀了再接着走</p>
    <ol class="abs steps h" style="left:120px;top:400px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">热身</em></b><span>先活动脚踝和膝盖</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">慢走</em></b><span><span data-mark="underline">一步一步</span>不着急</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="bottom"><b><em class="key">歇脚</em></b><span>半小时坐五分钟</span></li>
    </ol>
    <svg class="sketch">
      <path d="M598 500 C628 480 670 480 700 500" data-arrow data-beat="2"/>
      <path d="M1204 500 C1234 480 1276 480 1306 500" data-arrow data-beat="3"/>
    </svg>
    <div class="mascot guide" style="left:150px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '歇脚', say: '歇脚就是走一段停一下。' },
    { beat: 1, key: '热身', say: '第一步热身，活动开脚踝和膝盖。' },
    { beat: 2, key: '慢走', say: '第二步慢慢走，一步一步来。' },
    { beat: 3, key: '歇脚', say: '第三步歇脚，每半小时坐五分钟。' },
  ],
});

Deck.add({
  id: 'c4',
  chapter: '二、上山',
  topic: '出门前看一眼',
  scene: 'comic',
  title: '出门之前，先看三样',
  html: `
    <p class="abs lead muted" data-beat="0" data-mascot="0" data-mascot-side="right" style="left:120px;top:400px">下雨就改天，<br>山又不会跑。</p>
    <ol class="abs steps" style="left:960px;top:290px;width:840px;--gap:44px">
      <li data-beat="1" data-mascot="1" data-mascot-side="left"><b>看<em class="key">天气</em></b><span>晴天、不太热最好</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="left"><b>看<em class="key">路线</em></b><span>挑一条走过的人多的</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="left"><b>说一声</b><span>告诉家人几点回来</span>
        <button class="copy" type="button" data-copy="hike plan --back 17:00">hike plan --back 17:00</button></li>
    </ol>
    <div class="mascot guide" style="left:600px;top:420px"></div>`,
  notes: [
    { beat: 0, say: '出门前看一眼，下雨就改天。' },
    { beat: 1, key: '天气', say: '第一看天气。' },
    { beat: 2, key: '路线', say: '第二看路线，挑走的人多的。' },
    { beat: 3, say: '第三跟家里说一声几点回来，这行命令点一下就能复制。' },
  ],
});

Deck.add({
  id: 'c5',
  chapter: '二、上山',
  topic: '一条命令查天气',
  scene: 'comic',
  title: '查天气，只要一条命令',
  html: `
    <p class="explain" data-beat="0"><b>终端</b>：输入命令的窗口，这里拿它查天气</p>
    <div class="term abs" data-beat="1" data-title="终端" data-mascot="1" data-mascot-side="right" style="left:120px;top:310px;width:1000px">
      <p class="in">hike check --day sat</p>
      <p class="dim">正在查周六的天气……</p>
      <p class="ok">晴，十八度，适合出门</p>
    </div>
    <button class="copy abs" type="button" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="left:120px;top:680px">hike check --day sat</button>
    <div class="card abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="left:1300px;top:310px;width:500px">
      <h3>点一下就复制</h3>
      <p>点命令只会<em class="key">复制</em>，页面不会往下翻</p>
    </div>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, key: '终端', say: '先认识终端。' },
    { beat: 1, say: '输入这条命令，就能查到周六的天气。' },
    { beat: 2, say: '命令可以直接点一下复制。' },
    { beat: 3, key: '复制', say: '点命令不会翻页。' },
  ],
});

Deck.add({
  id: 'c6',
  chapter: '三、山顶',
  topic: '记住一句话',
  scene: 'comic',
  title: '最后，记住一句话',
  html: `
    <p class="quote abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="left:120px;top:330px;width:760px;text-align:left">慢慢走，<br>山<em class="key">不会跑</em></p>
    <figure class="shot abs" data-beat="2" data-src="shots/placeholder.svg" data-caption="山顶上拍的一张" data-mascot="2" data-mascot-side="bottom" style="left:960px;top:270px;width:840px;--r:-.8deg"></figure>
    <div class="mascot guide" style="left:1700px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '最后一句话。' },
    { beat: 1, key: '不会跑', say: '慢慢走，山不会跑。' },
    { beat: 2, say: '到了山顶，拍一张留个纪念。' },
  ],
});

Deck.add({
  id: 'c7',
  chapter: '三、山顶',
  topic: '以前和现在',
  scene: 'comic',
  title: '以前和现在',
  html: `
    <div class="vs abs" data-mid="→" style="left:120px;top:260px;width:1680px">
      <div class="card t-white" data-beat="1"><h3>以前</h3><p><span data-mark="strike">一口气冲到山顶</span></p></div>
      <div class="card t-peach" data-beat="1" data-delay=".3" data-mascot="1" data-mascot-side="bottom"><h3>现在</h3><p>走走停停，<em class="key">看看风景</em></p></div>
    </div>
    <div class="cells abs" data-beat="2" data-mascot="2" data-mascot-side="stay" style="left:120px;top:640px;width:1680px">
      <div class="cell human"><i>带路</i><b>我</b><span>走在前面</span></div>
      <div class="cell ai"><i>导航</i><b>地图</b><span>自动指路</span></div>
      <div class="cell ai"><i>报天气</i><b>手机</b><span>自动提醒</span></div>
      <div class="cell idle"><i>不用了</i><b>赶时间</b><span>省下来</span></div>
    </div>
    <div class="mascot guide" style="left:1716px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '最后对比一下。' },
    { beat: 1, key: '看看风景', say: '以前一口气冲到山顶，现在走走停停看风景。' },
    { beat: 2, say: '一路上谁管什么，是这样分的。' },
  ],
});

Deck.add({
  id: 'c8',
  chapter: '三、山顶',
  topic: '到了山顶',
  scene: 'comic',
  title: '到了山顶，回头看一眼',
  html: `
    <div class="cm-panel abs" data-beat="0" style="left:120px;top:300px;width:900px;height:560px">
      <p class="cm-sfx abs" data-beat="1" style="left:520px;top:-56px">到顶啦！</p>
      <p class="cm-say abs" data-beat="2" data-mascot="2" data-mascot-side="left" style="left:330px;top:250px">风景真好，<br>下次还来</p>
    </div>
    <p class="abs lead" data-beat="1" style="left:1120px;top:420px">爬到山顶，<br>记得<em class="key">回头看</em>一眼。</p>
    <div class="mascot guide" style="left:200px;top:640px"></div>`,
  notes: [
    { beat: 0, say: '我们到山顶了。' },
    { beat: 1, key: '回头看', say: '到顶啦！记得回头看一眼走过的路。' },
    { beat: 2, say: '风景真好，下次还来。' },
  ],
});
