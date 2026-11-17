/* =====================================================================
   样板页：封面 t-cover、清单 t-list、步骤（图示）t-steps、结尾 t-end
   - 写页面时先找最接近的样板，整段抄过去再改（说明见 references/templates.md）：
     id 换成 p〈讲稿页号〉，samples.css 里对应的 [data-id="t-…"] 一起换成新 id；scene 换成选定的风格；字照讲稿改
   - 只用通用组件和 CSS 变量，不写死颜色，所以每种风格下都成立；样册 gallery.html 加 ?scene=<键名> 换风格看
   - 虚构主题：怎么泡好一杯茶
   ===================================================================== */

/* 封面：左边大标题一组（标签、大标题、副标题、讲者），右边一张封面图；形象站在封面图的上沿。1 拍：讲者出现，形象高兴一下。
   没有封面图就整行删掉 figure，形象待在它的起点（大标题右边） */
Deck.add({
  id: 't-cover',
  chapter: '开场',
  scene: 'paper',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <div class="abs col" style="left:150px;top:320px;width:940px;align-items:flex-start;--gap:30px">
      <span class="tag" data-beat="0" style="--r:-2deg">新人茶话会</span>
      <p class="cover-title b" data-beat="0">怎么泡好一杯茶</p>
      <p class="lead muted" data-beat="0">水温、茶量、时间，三件事讲清楚</p>
      <p class="muted" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy">讲者：〈你的名字〉　·　〈日期〉</p>
    </div>
    <figure class="abs shot" data-beat="0" data-src="samples/placeholder.svg" data-mascot="0" data-mascot-side="top" data-mascot-x=".84" style="left:1150px;top:360px;width:650px;--r:2deg"></figure>
    <div class="mascot guide" style="left:1240px;top:440px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 清单：一句话解释（第 0 拍），三张卡片一拍出一张，每张一个重点词；形象每拍站到当前卡片下面 */
Deck.add({
  id: 't-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'paper',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="abs grid" style="left:120px;top:360px;width:1680px;--cols:3;--gap:60px">
      <div class="card t-yellow" data-beat="1" data-mascot="1" data-mascot-side="bottom" style="--r:-1deg">
        <span class="lab">器具</span><h3>一只<em class="key">盖碗</em></h3><p>白瓷的最好，看得清茶色</p>
      </div>
      <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-side="bottom" style="--r:.8deg">
        <span class="lab">茶叶</span><h3><em class="key">三克</em>绿茶</h3><p>大约铺满碗底薄薄一层</p>
      </div>
      <div class="card t-blue" data-beat="3" data-mascot="3" data-mascot-side="bottom" style="--r:-.6deg">
        <span class="lab">水</span><h3>一壶<em class="key">热水</em></h3><p>烧开后晾到<span data-mark="circle">八十度</span></p>
      </div>
    </div>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '热水', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 步骤（图示）：三步横排，手绘箭头连起来，一拍出一步；最后一步带一行可复制的命令；形象每拍走到当前这一步 */
Deck.add({
  id: 't-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'paper',
  title: '泡一杯绿茶，只要三步',
  html: `
    <ol class="abs steps h" style="left:120px;top:420px;width:1680px;--gap:140px">
      <li data-beat="1" data-mascot="1" data-mascot-side="bottom"><b><em class="key">温杯</em></b><span>热水把盖碗烫一遍</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="bottom"><b><em class="key">投茶</em></b><span>三克茶叶铺满碗底</span></li>
      <li data-beat="3"><b><em class="key">注水</em></b><span>八十度水沿碗边倒</span></li>
    </ol>
    <svg class="sketch">
      <path data-beat="2" data-arrow d="M604 470 C634 450 676 450 708 470"/>
      <path data-beat="3" data-arrow d="M1210 470 C1240 450 1282 450 1314 470"/>
    </svg>
    <button class="abs copy" type="button" data-beat="3" data-mascot="3" data-mascot-side="left" style="right:120px;top:650px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:150px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 结尾：一句收尾金句，第 1 拍出致谢；形象先站在金句右边，再到致谢旁边说一句话。署名由引擎自动加在最后一页 */
Deck.add({
  id: 't-end',
  chapter: '结尾',
  scene: 'paper',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="abs col" style="left:160px;right:160px;top:360px;align-items:center;--gap:130px">
      <p class="quote" data-beat="0" data-mascot="0" data-mascot-side="right">水温对了，茶就<em class="key">不苦</em></p>
      <p class="lead muted" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问</p>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
