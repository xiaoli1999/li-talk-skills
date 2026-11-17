/* =====================================================================
   像素游戏 pixel 自己的样板页：同一个虚构主题「怎么泡好一杯茶」，按 8-bit 游戏的各个画面重新排
   - 和通用样板（samples.js）内容大致对应，版式全换成游戏里的画面：
     t-pixel-cover 标题画面（封面）、t-pixel-items 道具栏（要备的三样东西）、t-pixel-map 关卡地图（泡茶三步，招牌页）、
     t-pixel-boss 回合制战斗（别踩的三个坑，招牌页）、t-pixel-end NPC 对话框（收尾金句）
   - 每拍「发生了什么」是游戏里的事：光标移到下一格、道具掉进格子、关卡点亮、点路一段段亮起、血条掉一截、对话框一个字一个字打出来。
     这些动作由像素游戏风格的版式组件（.px-*）自己完成，页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 可读性：游戏画面是包装，要点直接写在版面上、讲完一直留着——道具的说明写在格子里，每关做什么写在关卡名下面，
     三个坑和破法写在「攻略」清单里。底部的对话框只显示最新一句，所以只放旁白和过渡语（「获得【一只盖碗】！」「第一关 通过！」），
     被后一句换掉的几句和伤害数字都加 data-transient。翻到每页最后一拍，整页信息是完整的
   - 组件只在像素游戏里有样子（换成别的风格会乱）：这几页只给 scene: 'pixel' 用，不进通用样册
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/pixel.css 里对应的 [data-id="t-pixel-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/pixel.js 开头的说明
   - 像素规矩：位置、大小都取 4 的倍数；字号只用 24、48、96、144（12px 点阵的整数倍）
   ===================================================================== */

/* 标题画面（封面）：像一盘游戏卡带插上电的第一屏——上面一行「出品」，正中金色大字标，底下一句副标题、一只像素盖碗，
   再下面「按任意键开始」闪两下后常亮。1 拍：最下面一行讲者署名打出来，形象从盖碗旁边的打盹里醒来、跑过去高兴一下。
   为什么适合：游戏的标题画面就是「这盘游戏叫什么」，和封面的作用一模一样；居中、对称、大字标，正是 8-bit 封面的格式。
   抄过去改哪里：出品一行、大字标（7 个字以内，144px 一个字 144 宽；超过 8 个字风格会自动换成实色字）、副标题、
   图标（data-px-icon 换成别的）、讲者一行 */
Deck.add({
  id: 't-pixel-cover',
  chapter: '开场',
  scene: 'pixel',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <p class="abs center t-pixel-cover-by" data-beat="0" style="left:0;right:0;top:120px">新人茶话会 出品</p>
    <p class="abs center px-logo" data-beat="0" style="left:0;right:0;top:216px">怎么泡好一杯茶</p>
    <p class="abs center t-pixel-cover-sub" data-beat="0" style="left:0;right:0;top:436px"><span>水温、茶量、时间，三件事讲清楚</span></p>
    <i class="abs px-icon" data-px-icon="cup" data-beat="0" data-in="drop" style="--px-s:2;left:864px;top:520px"></i>
    <div class="abs center" style="left:0;right:0;top:772px"><p class="px-press" data-beat="0">按任意键开始</p></div>
    <div class="abs center" style="left:0;right:0;top:880px"><p class="t-pixel-cover-me" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="happy">讲者：〈你的名字〉 · 〈日期〉</p></div>
    <div class="mascot guide" data-pose="rest" style="left:712px;top:584px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 道具栏（要备的三样东西）：一排三个道具格，开场时都是空的（问号）；每拍一件道具从上面掉进格子、冒一圈金光，
   名字和两行说明依次打出来，光标 ▼ 跳到这一格上，形象跑到这一格下面看着；底下的对话框打出「获得【…】！」。
   三件道具的名字和说明都写在各自的格子里，一直留着，翻到最后一拍三件都看得全；对话框只放旁白（前三句加 data-transient）。
   为什么适合：「出发前备齐东西」在游戏里就是往道具栏里收道具；光标、获得道具的提示框、一格一格的栏位都是游戏里最熟的界面。
   抄过去改哪里：每格的图标（data-px-icon）、名字（4 个字以内）、说明（两行，一行 5 个字以内，用 <br> 断行）；
   对话框每拍一句（第 0 拍一句开场白，后面每拍「获得【…】！」，最后一句不加 data-transient）。
   格子数改了要重算 .px-inv 的 left（格宽 384，--gap 是格子间距），让整排居中 */
Deck.add({
  id: 't-pixel-items',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'pixel',
  title: '备齐三样道具',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <div class="abs px-inv" style="left:320px;top:320px;--gap:64px">
      <div class="px-slot" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3"><div data-beat="1"><i class="px-icon" data-px-icon="cup" style="--px-s:2"></i><b>一只盖碗</b><span><em class="key">白瓷</em>最好，<br>看得清茶色</span></div></div>
      <div class="px-slot" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3"><div data-beat="2"><i class="px-icon" data-px-icon="leaf" style="--px-s:2"></i><b><em class="key">三克</em>绿茶</b><span>铺满碗底<br>薄薄一层</span></div></div>
      <div class="px-slot" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3"><div data-beat="3"><i class="px-icon" data-px-icon="kettle" style="--px-s:2"></i><b>一壶热水</b><span>烧开后晾到<br><em class="key">八十度</em>再用</span></div></div>
    </div>
    <div class="abs px-msg" style="left:120px;top:880px;width:1680px">
      <p data-beat="0" data-transient>泡茶之前，先收集三样道具！</p>
      <p data-beat="1" data-transient>获得【一只盖碗】！</p>
      <p data-beat="2" data-transient>获得【三克绿茶】！</p>
      <p data-beat="3">获得【一壶热水】！三样道具齐了</p>
    </div>
    <div class="mascot guide" style="left:168px;top:736px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '白瓷', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 关卡地图（泡茶三步，招牌页）：从左下的起点出发，一条像素点路弯弯曲曲连着三个关卡，最后通到右下的终点——一杯好茶。
   开场时关卡都是锁着的深蓝圆章、点路是暗的，形象站在起点上；每拍：通往下一关的点路一段段亮起，关卡圆章白闪两下变金、
   关卡名和一句说明（这一关做什么）依次打出来，形象跳到这一关上。第 3 拍最后一段路通到终点，终点冒闪光，旁边出一行可复制的命令。
   每关做什么直接写在关卡名下面，过了的关一直亮着、说明一直在；底下的对话框只报「第一关 通过！」这类过场话（加 data-transient）。
   为什么适合：分步骤 = 闯关。「过了的关亮着、下一关还锁着、小人站在当前这关」比横排三张卡片更能让人感到走到哪一步了，
   而这种世界地图只有像素游戏做得出来。
   抄过去改哪里：关卡名（2–3 个字）和说明（两行，一行 5 个字以内：上下两排关卡之间是竖着的点路，说明要夹在两条竖路中间）、
   对话框每拍一句；关卡多一个就加一个 .px-node 和一条 .px-road，
   点路的 data-path 写关卡圆章中心的坐标（圆章 96×96，中心 = left + 48、top + 48），相邻两点的距离取 24 的倍数 */
Deck.add({
  id: 't-pixel-map',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'pixel',
  title: '泡一杯绿茶，要过三关',
  html: `
    <i class="px-road" data-beat="1" data-path="216,600 408,600 408,384 600,384"></i>
    <i class="px-road" data-beat="2" data-path="600,384 792,384 792,600 984,600"></i>
    <i class="px-road" data-beat="3" data-path="984,600 1176,600 1176,384 1368,384"></i>
    <div class="abs px-node px-on" style="left:168px;top:552px"><b>起点</b></div>
    <div class="abs px-node" data-n="1" style="left:552px;top:336px" data-mascot="1" data-mascot-side="top" data-mascot-x=".5"><p data-beat="1"><b>温杯</b><span>热水把盖碗<br><em class="key">烫一遍</em></span></p></div>
    <div class="abs px-node" data-n="2" style="left:936px;top:552px" data-mascot="2" data-mascot-side="top" data-mascot-x=".5"><p data-beat="2"><b>投茶</b><span><em class="key">三克</em>茶叶<br>铺满碗底</span></p></div>
    <div class="abs px-node" data-n="3" style="left:1320px;top:336px" data-mascot="3" data-mascot-side="top" data-mascot-x=".5"><p data-beat="3"><b>注水</b><span><em class="key">八十度</em>水<br>沿碗边倒</span></p></div>
    <div class="abs px-msg" style="left:120px;top:864px;width:1680px">
      <p data-beat="0" data-transient>东西备齐了，出发！</p>
      <p data-beat="1" data-transient>第一关 通过！</p>
      <p data-beat="2" data-transient>第二关 通过！</p>
      <p data-beat="3">三关全通，好茶到手！</p>
    </div>
    <i class="px-road" data-beat="3" data-delay=".1" data-path="1368,384 1560,384 1560,600 1704,600"></i>
    <div class="abs px-node px-goal" style="left:1656px;top:552px"><i class="px-icon" data-px-icon="cup"></i><b data-beat="3">好茶</b></div>
    <button class="abs copy" type="button" data-beat="3" data-delay=".3" style="left:968px;top:884px" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" style="left:160px;top:424px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步，我们一关一关过。' },
    { beat: 1, key: '温杯', say: '第一关温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二关投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三关注水：八十度的水沿着碗边慢慢倒，一杯好茶就到手了。懒得记的话，下面这行命令点一下就能复制。' },
  ],
});

/* 回合制战斗（别踩的三个坑，招牌页）：左上是敌人的名字和血条，右边站着「苦涩怪」，左边是形象（勇者）站的台子；
   底下左边是「攻略」清单（RPG 命令菜单的样子），右边是战斗记录。攻略一直在：开场时三行都是暗紫的「？？？」，
   每拍光标 ▶ 移到下一行、这一行反白闪两下，「坑 → 怎么破」打出来，之后一直亮着；同时苦涩怪白闪、抖两下、
   头上蹦出伤害数字，血条从右往左掉一截，战斗记录报一句伤害。形象第 1 拍冲到怪物跟前，第 2 拍跳到它头上踩一脚，
   第 3 拍怪物闪三下消失、原地掉下一只盖碗（好茶到手），形象回到台子上高兴。
   真话写在攻略里（水太烫 → 晾到八十度），观众不用把「晾水」「称茶」这种命令自己翻译成做法；
   战斗记录和伤害数字是过场（加 data-transient），翻到最后一拍，三条攻略都在。
   为什么适合：「三个常见的坑」讲成三个回合打倒一个怪，一个坑一个招，血条一截截掉，是只有游戏画面才有的讲法，
   而且每拍的变化（光标、血条、伤害数字）一眼就看得出讲到第几个了。
   抄过去改哪里：怪物的名字、攻略每行「坑 → 怎么破」（一行 10 个字以内，每行的 .px-cur 和字都写第几拍）、
   战斗记录每拍一句（最后一句不加 data-transient）、伤害数字和血条每拍掉的那一段
   （--from、--to 加起来正好从 1 掉到 0；最后一击的伤害数字加 .px-ko） */
Deck.add({
  id: 't-pixel-boss',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'pixel',
  title: '打倒苦涩怪',
  html: `
    <p class="explain" data-beat="0"><b>苦涩怪</b>：踩了泡茶的坑，茶就又苦又涩</p>
    <div class="abs px-win t-pixel-boss-stat" style="left:120px;top:296px;width:648px">
      <p class="t-pixel-boss-name">苦涩怪</p>
      <div class="t-pixel-boss-hp">
        <span>HP</span>
        <div class="px-bar" style="width:488px">
          <i class="px-cut" data-beat="1" data-delay=".3" style="--from:.6;--to:1"></i>
          <i class="px-cut" data-beat="2" data-delay=".3" style="--from:.3;--to:.6"></i>
          <i class="px-cut" data-beat="3" data-delay=".3" style="--from:0;--to:.3"></i>
        </div>
      </div>
    </div>
    <i class="abs px-icon" data-px-icon="plat" style="--px-s:2;left:248px;top:584px" data-mascot="3" data-mascot-side="top" data-mascot-x=".5" data-mascot-dy="16" data-mascot-pose="happy"></i>
    <i class="abs px-icon" data-px-icon="plat" style="--px-s:2;left:1320px;top:528px"></i>
    <div class="abs px-foe" style="left:1312px;top:320px" data-mascot="1" data-mascot-side="left">
      <i class="px-icon" data-px-icon="foe" style="--px-s:2" data-mascot="2" data-mascot-side="top" data-mascot-x=".5" data-mascot-dy="56"></i>
      <div class="abs px-swap" style="left:288px;top:24px">
        <b class="px-dmg" data-beat="1" data-delay=".1" data-transient>-40</b>
        <b class="px-dmg" data-beat="2" data-delay=".1" data-transient>-30</b>
        <b class="px-dmg px-ko" data-beat="3" data-delay=".1" data-transient>-30</b>
      </div>
    </div>
    <i class="abs px-icon" data-px-icon="cup" data-beat="3" data-in="drop" data-delay=".62" style="--px-s:2;left:1344px;top:352px"></i>
    <div class="abs t-pixel-boss-guide" style="left:120px;top:680px;width:720px">
      <ul class="px-menu">
        <li><i class="px-cur" data-beat="1"></i><span data-beat="1">水太烫 → 晾到<em class="key">八十度</em></span></li>
        <li><i class="px-cur" data-beat="2"></i><span data-beat="2">泡太久 → <em class="key">一分钟</em>出汤</span></li>
        <li><i class="px-cur" data-beat="3"></i><span data-beat="3">茶太多 → 只放<em class="key">三克</em></span></li>
      </ul>
      <span class="px-who">攻略</span>
    </div>
    <div class="abs px-msg" style="left:888px;top:680px;width:912px">
      <p data-beat="0" data-transient>苦涩怪出现了！<br>照着攻略，一招一招打</p>
      <p data-beat="1" data-transient>苦涩怪受到 40 点伤害！</p>
      <p data-beat="2" data-transient>苦涩怪受到 30 点伤害！</p>
      <p data-beat="3">苦涩怪倒下了！<br>获得一杯好茶</p>
    </div>
    <div class="mascot guide" style="left:312px;top:472px"></div>`,
  notes: [
    { beat: 0, key: '苦涩怪', say: '泡茶最怕三个坑，坑踩多了茶就又苦又涩，我们管它叫苦涩怪。' },
    { beat: 1, key: '八十度', say: '第一个坑是水太烫，滚水一冲茶就苦。办法是先晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑是泡太久，茶会发涩。一分钟左右就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑是茶放太多，味道太浓。只放三克，苦涩怪就倒下了。' },
  ],
});

/* NPC 对话框（结尾）：上面是泡好的一杯茶在发光，下面一个 RPG 对话框，名牌写着说话的人，形象站在对话框上沿当 NPC；
   金句一个字一个字打出来，打完右下角 ▼ 闪两下后常亮。1 拍：对话框右上方弹出一扇小窗（先横着拉开、再竖着展开），
   打出「谢谢大家，欢迎提问！」，形象高兴一下。金句留在对话框里不换掉：阅读模式、总览只看得到最后一拍，最要紧的一句要一直在。
   金句是句子，用实色金字（不用条纹渐变字面），重点词浅金加下划线。
   为什么适合：游戏里最后的道理总是 NPC 在对话框里说的，▼ 一闪就是「还有下文」，讲者再按一下，弹出的小窗就像 RPG 里接着弹出的选项框。
   抄过去改哪里：名牌（形象换了就改成它的名字）、金句（96px，一行 16 个字以内）、小窗里的致谢；署名由引擎自动加在最后一页底部 */
Deck.add({
  id: 't-pixel-end',
  chapter: '结尾',
  scene: 'pixel',
  title: '谢谢',
  noTitle: true,
  html: `
    <i class="abs px-icon" data-px-icon="spark" style="--px-s:2;left:744px;top:176px"></i>
    <i class="abs px-icon" data-px-icon="spark" style="--px-s:3;left:1120px;top:232px"></i>
    <i class="abs px-icon" data-px-icon="spark" style="--px-s:2;left:728px;top:384px"></i>
    <i class="abs px-icon" data-px-icon="cup" style="--px-s:3;left:816px;top:160px"></i>
    <div class="abs px-msg" style="left:120px;top:600px;width:1680px" data-mascot="0" data-mascot-side="top" data-mascot-x=".02">
      <span class="px-who">小旗</span>
      <p class="quote" data-beat="0">水温对了，茶就<em class="key">不苦</em></p>
    </div>
    <div class="abs px-win t-pixel-end-thanks" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:1232px;top:448px"><p>谢谢大家，欢迎提问！</p></div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
