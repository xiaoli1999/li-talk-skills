/* =====================================================================
   工位桌面 desk 自己的样板页（虚构主题：怎么泡好一杯茶）：
   封面 t-desk-cover、桌面俯视 t-desk-items、标签机待办 t-desk-steps、回形针便签 t-desk-pits、三键小键盘 t-desk-keys、贴在电脑上的便签 t-desk-end
   - 内容和通用样板（samples.js）大致对应，版式全按「从上往下看一张办公桌」来：东西摆上桌，便签贴在旁边，
     标签机吐出一条条待办贴在本子上，回形针把改法别在打印纸上，小键盘一颗颗装上键帽，下班前在电脑上贴一张便签
   - 招牌页两页：桌面俯视（第 2 页，三样东西摆上桌、一拍一件、旁边贴一张便签）、标签机待办（第 3 页，标签机一拍吐出一条，做完的打勾）
   - 每拍「发生了什么」由工位桌面的版式组件（.dk-*，写法见 scenes/desk.css 末尾、出场见 scenes/desk.js 开头）自己完成：
     东西被放到桌上、纸片落下来、纸胶带按上、便签拍平、标签从标签机里吐出来、马克笔打勾、工牌晃两下、键帽咔哒装上。
     页面里只写结构和 data-beat，不写 onBeat、不写 data-in
   - 可读性（翻到最后一拍整页要一眼读清）：
     · 讲过的纸片、标签都留在桌上；打勾以后不变灰、不划掉，只由引擎退到 .8
     · 字都写在实色的纸上（便签、白纸、标签、键帽、工牌），插画只当图看、不放字；真话写在便签和纸上
     · 一页一条阅读路径：从左到右三列（桌面俯视、回形针便签、小键盘），或从上到下（标签待办），手写圈号 1、2、3 就是顺序
     · 珊瑚红只给重点：重点词的马克笔、打勾、一枚强调键帽，一页不超过 3 处；字横排，纸片歪不超过 1.5°
   - 组件只在工位桌面里有样子（换成别的风格会乱）：这几页只给 scene: 'desk' 用，不进通用样册
   - 抄一页过去：整段 Deck.add 抄进章节文件，id 换成讲稿页号，samples/desk.css 里同一页的 [data-id="t-desk-…"] 一起换；
     字照讲稿改；坐标都是舞台坐标（1920×1080），挪了位置跑 check --browser 看有没有压字
   ===================================================================== */

/* 封面：桌上摊着一张讲稿纸。左边一大张白纸，两个上角各贴一条纸胶带，纸上手写大标题和一行副题；
   右上角摆一只盖碗（俯视），左下角一支铅笔；第 1 拍一张工牌连着挂绳落到右下角，写着讲者和日期，卷卷跳到工牌旁边高兴一下。
   第 0 拍：铅笔、盖碗放到桌上，白纸落下、两条胶带按上；第 1 拍：工牌落下、晃两下停住。
   为什么是工位桌面：讲稿纸 + 工牌 + 茶杯 + 铅笔，就是开讲前从上往下看自己工位的样子；工牌把「讲者是谁」变成桌上的一样东西。
   可读性：纸上从上往下一条路（大标题 → 副题），讲者写在工牌的白底上；强调只有「泡好」一处；盖碗、铅笔、挂绳都不压字。
   抄过去改：大标题（160px 一行 5 个字以内，再多就把 .cv-title 的字号调小或改成两行）、副题、工牌上的讲者和日期；
   工牌往右上甩出的挂绳占着约 460×260 的一片，盖碗要摆在它上面（盖碗底边在 y 540 以上） */
Deck.add({
  id: 't-desk-cover',
  chapter: '开场',
  scene: 'desk',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <i class="dk-obj abs" data-dk-art="pencil" data-beat="0" style="left:200px;top:884px;width:440px;--r:-5deg"></i>
    <i class="dk-obj abs" data-dk-art="gaiwan" data-beat="0" style="left:1290px;top:146px;width:380px"></i>
    <div class="dk-sheet corners abs cv-sheet" data-beat="0" style="left:150px;top:176px;width:1000px;--r:-1deg">
      <p class="cv-title">怎么<em class="key">泡好</em><br>一杯茶</p>
      <p class="cv-sub">水温、茶量、时间，三件事讲清楚</p>
    </div>
    <div class="dk-badge abs" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="happy" style="left:1240px;top:640px;width:540px;--r:1.5deg">
      <b>讲者：〈你的名字〉</b><span>〈日期〉</span>
    </div>
    <div class="mascot guide" data-face="left" style="left:1060px;top:826px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 桌面俯视（招牌页）：从上往下看桌面，三样东西从左到右摆着：盖碗、开着盖的茶叶罐、电水壶（简笔插画，俯视），
   每样东西底下贴一张便签，便签上手写圈号、名字和一句说明。
   第 0 拍：一句话解释「盖碗」；第 1–3 拍：每拍一样——先把东西放到桌上（影子从远收到近），再贴上它的便签（上沿先粘住、下半截拍平）。
   卷卷每拍走到刚贴好的那张便签底下。
   为什么是工位桌面：俯视的桌面 + 便签，是在工位上备东西、给同事留话的样子；东西都画成从上往下看的样子（圆盘、罐口、壶盖），
   一眼就是桌面，不是货架。
   可读性：从左到右一条路，圈号 1、2、3 就是顺序；名字和说明都写在便签上，讲完一直贴着；重点词三处（盖碗、三克、八十度）。
   抄过去改：换东西就改 data-dk-art（可选的见 scenes/desk.css 的 .dk-obj），东西要在便签正上方、底边在 y 590 以上；
   便签的名字（44px，一行 8 个字以内）和说明（36px，一行 10 个字以内，想在哪断行写 <br>）；
   多一样东西就改成四列：便签宽 380、列距 420，东西缩到宽 260 以内 */
Deck.add({
  id: 't-desk-items',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'desk',
  title: '泡茶之前，备好三样东西',
  html: `
    <p class="explain" data-beat="0"><b>盖碗</b>：带盖的小茶碗，泡茶、闻香、出汤都用它</p>
    <i class="dk-obj abs" data-dk-art="gaiwan" data-beat="1" style="left:250px;top:298px;width:270px"></i>
    <i class="dk-obj abs" data-dk-art="tin" data-beat="2" style="left:762px;top:320px;width:380px"></i>
    <i class="dk-obj abs" data-dk-art="kettle" data-beat="3" style="left:1352px;top:292px;width:330px"></i>
    <div class="dk-note abs it-note" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3" style="left:165px;top:600px;width:440px;--r:-1.4deg">
      <h3><i class="dk-no">1</i>一只<em class="key">盖碗</em></h3><p>白瓷的最好，<br>看得清茶色</p>
    </div>
    <div class="dk-note p abs it-note" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3" style="left:740px;top:616px;width:440px;--r:1.2deg">
      <h3><i class="dk-no">2</i><em class="key">三克</em>绿茶</h3><p>大约铺满碗底，<br>薄薄一层</p>
    </div>
    <div class="dk-note b abs it-note" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" style="left:1315px;top:600px;width:440px;--r:-1deg">
      <h3><i class="dk-no">3</i>一壶热水</h3><p>烧开后，<br>晾到<em class="key">八十度</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1610px;top:826px"></div>`,
  notes: [
    { beat: 0, key: '盖碗', say: '动手之前先备齐东西。盖碗就是带盖的小茶碗，泡、闻、倒都用它。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: '八十度', say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 标签机待办（招牌页）：左边一台标签机（俯视），右边一本合上的牛皮纸本子。
   第 1–3 拍：每拍标签机吐出一条标签（从右边靠下的出口一格格吐出来），撕下来贴到本子上，一条一步：勾选框 + 步骤名 + 说明；
   每拍先给上一条打一个珊瑚红的勾（做完了），再吐下一条；第 4 拍给最后一条打勾，再吐出一条黑色的命令标签（点一下复制）。
   卷卷每拍站到刚贴好的那条标签右边。
   为什么是工位桌面：用标签机打待办、贴在本子上、做完一条勾一条，是工位上的老习惯；
   命令条本来就是工位桌面的黑色标签，这里让它也从标签机里出来，和待办连成一套。
   可读性：本子上从上往下一条路，三条标签讲完都留着；打勾以后不变灰、不划掉；强调是三个勾，步骤名不另加重点词。
   抄过去改：每条标签的步骤名（54px，4 个字以内）和说明（40px，10 个字以内），标签的 top 每条差 144；
   多一步就再加一条，四条时把 top 的间距改成 116；标签机要在本子左边，标签才是往右吐出来的；
   标签机的出口（标签机高度的 .8 处）要低于最后一条步骤标签的下沿，吐出来时才不盖住贴好的标签 */
Deck.add({
  id: 't-desk-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'desk',
  title: '泡一杯绿茶，只要三步',
  html: `
    <i class="dk-obj abs" data-dk-art="maker" data-beat="0" style="left:210px;top:380px;width:330px"></i>
    <div class="dk-book abs" data-beat="0" style="left:660px;top:272px;width:980px;height:690px;--r:-.4deg"></div>
    <p class="dk-label abs" data-beat="1" data-mascot="1" data-mascot-side="right" style="left:760px;top:332px;--r:-.8deg">
      <i class="dk-box"><i class="dk-tick" data-beat="2"></i></i><b>温杯</b><span>热水把盖碗烫一遍</span>
    </p>
    <p class="dk-label abs" data-beat="2" data-mascot="2" data-mascot-side="right" style="left:760px;top:476px;--r:.6deg">
      <i class="dk-box"><i class="dk-tick" data-beat="3"></i></i><b>投茶</b><span>三克茶叶铺满碗底</span>
    </p>
    <p class="dk-label abs" data-beat="3" data-mascot="3" data-mascot-side="right" style="left:760px;top:620px;--r:-.5deg">
      <i class="dk-box"><i class="dk-tick" data-beat="4"></i></i><b>注水</b><span>八十度水沿碗边倒</span>
    </p>
    <button class="copy abs" type="button" data-beat="4" data-mascot="4" data-mascot-side="right" style="left:760px;top:800px;--r:.4deg" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button>
    <div class="mascot guide" data-face="left" style="left:1420px;top:770px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。我把它们打成标签贴在本子上，做完一步勾一步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '温好杯，勾掉。第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。' },
    { beat: 4, key: '命令', show: '全部勾完 · 命令标签', say: '三步都勾完了。懒得记的话，这条命令标签点一下就能复制。' },
  ],
});

/* 回形针便签（三个坑）：三张打印的纸用纸胶带贴在桌上，从左到右一张一个坑，纸上写错的做法，底下配一个铅笔小图（温度计、钟、一堆茶叶）；
   每张纸的下半截用回形针别着一张便签，写着改法。
   第 1–3 拍：每拍一个坑——打印纸落下、胶带按上，紧跟着便签落下来别到它下面（回形针在便签右上角）。卷卷每拍走到刚别上的便签底下。
   为什么是工位桌面：在打印稿上别一张便签写改法，是工位上改东西最常见的做法；错的写在纸上，对的别在旁边，一眼看出「坑 → 改法」。
   可读性：从左到右三列，每列从上往下（坑 → 改法），圈号 1、2、3 就是顺序；错的做法不划掉，照样读得清；
   便签只压住纸下半截的空白，回形针不碰字；重点词三处都在改法里（八十度、一分钟、三克）。
   抄过去改：坑（64px，4 个字以内）、改法（48px，「→」后面 6 个字以内）；小图换 data-dk-art（thermo、timer、leaves），
   在字下面正中；便签的 top 要压住纸下沿 60–80px（纸 min-height 400，便签 top = 纸 top + 330） */
Deck.add({
  id: 't-desk-pits',
  chapter: '二、动手',
  topic: '别踩的三个坑',
  scene: 'desk',
  title: '别踩这三个坑',
  html: `
    <div class="dk-sheet abs pt-memo" data-beat="1" style="left:150px;top:300px;width:480px;--r:-1deg">
      <p class="pt-bad"><i class="dk-no">1</i>水太烫</p><i class="dk-obj pt-ic" data-dk-art="thermo"></i>
    </div>
    <div class="dk-note clip abs pt-fix" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3" style="left:190px;top:630px;width:420px;--r:1.4deg">
      <p>→ 晾到<em class="key">八十度</em></p>
    </div>
    <div class="dk-sheet stripe abs pt-memo" data-beat="2" style="left:720px;top:300px;width:480px;--r:.9deg">
      <p class="pt-bad"><i class="dk-no">2</i>泡太久</p><i class="dk-obj pt-ic" data-dk-art="timer"></i>
    </div>
    <div class="dk-note g clip abs pt-fix" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3" style="left:760px;top:630px;width:420px;--r:-1.2deg">
      <p>→ <em class="key">一分钟</em>出汤</p>
    </div>
    <div class="dk-sheet abs pt-memo" data-beat="3" style="left:1290px;top:300px;width:480px;--r:-.8deg">
      <p class="pt-bad"><i class="dk-no">3</i>茶太多</p><i class="dk-obj pt-ic" data-dk-art="leaves"></i>
    </div>
    <div class="dk-note b clip abs pt-fix" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" style="left:1330px;top:630px;width:420px;--r:1deg">
      <p>→ 只放<em class="key">三克</em></p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1610px;top:840px"></div>`,
  notes: [
    { beat: 0, key: '三个坑', say: '知道了怎么泡，再说三个最容易踩的坑。' },
    { beat: 1, key: '八十度', say: '第一个坑，水太烫。开水直接冲，茶就烫熟了，又黄又苦。改法：晾到八十度。' },
    { beat: 2, key: '一分钟', say: '第二个坑，泡太久。茶叶一直泡着，越泡越涩。改法：一分钟就出汤。' },
    { beat: 3, key: '三克', say: '第三个坑，茶太多。放一大把，茶汤浓得发苦。改法：只放三克。' },
  ],
});

/* 三键小键盘（三个数）：桌上一块三键的小键盘（俯视），线从右上角伸出去；三颗键帽从左到右一拍装一颗，
   键帽左上角是名字（水温、茶量、时间），正中是大数字（80℃、3 克、1 分钟）。第一颗是珊瑚红的强调键（最要紧的水温）。
   第 1–3 拍：每拍一颗键帽落到轴上，咔哒按一下再弹回来。卷卷每拍站到刚装好的键帽底下。
   为什么是工位桌面：键盘是工位上最熟的东西；把三个数做成三颗键帽，「记住三个数」就成了「按下三个键」，一颗一个数。
   可读性：从左到右一条路；名字和数字都写在浅色键帽上（墨色字），装好的键帽一直留着；强调只有一颗珊瑚红键帽。
   抄过去改：键帽的名字（42px，4 个字以内）和数字（150px 数字 + 60px 单位，数字 3 位以内）；
   四个数就改成四颗键：小键盘宽 1500 不变，键帽宽 320、间距 40，数字字号改成 120px */
Deck.add({
  id: 't-desk-keys',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'desk',
  title: '记住三个数，一键一个',
  html: `
    <div class="dk-macro abs" data-beat="0" style="left:210px;top:290px;width:1500px;height:560px;--r:-.5deg"></div>
    <div class="dk-key c abs" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".29" style="left:270px;top:350px;width:420px;height:440px">
      <span>水温</span><b>80<small>℃</small></b>
    </div>
    <div class="dk-key abs" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".29" style="left:750px;top:350px;width:420px;height:440px">
      <span>茶量</span><b>3<small>克</small></b>
    </div>
    <div class="dk-key abs" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".29" style="left:1230px;top:350px;width:420px;height:440px">
      <span>时间</span><b>1<small>分钟</small></b>
    </div>
    <div class="mascot guide" data-face="left" style="left:1716px;top:812px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '开头说的三件事，水温、茶量、时间，其实各是一个数，记住就能泡出好茶。' },
    { beat: 1, key: '80℃', say: '水温：八十度，烧开后晾一晾。这是最要紧的一个。' },
    { beat: 2, key: '3 克', say: '茶量：三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '1 分钟', say: '时间：一分钟。注水后大约一分钟就出汤，泡久了会苦。' },
  ],
});

/* 贴在电脑上的便签（结尾）：下班前合上笔记本电脑，在机盖上贴一张大便签，写着今天要记住的一句话；
   右边一杯泡好的茶冒着热气。第 1 拍：再贴一张粉便签「谢谢大家，欢迎提问」，卷卷跳到它旁边说谢谢。署名由引擎自动加在右下角。
   第 0 拍：电脑、茶杯放到桌上，大便签贴上；第 1 拍：粉便签贴上。
   为什么是工位桌面：把最要紧的一句话写在便签上贴在电脑上，是工位上的「明天也别忘了」；和封面的讲稿纸首尾呼应。
   可读性：左边一句大字、右下一句致谢，两张便签都是实色，字是墨色；强调只有「不苦」一处；茶杯不压字。
   抄过去改：金句（116px，一行 5 个字以内，两行）、致谢（46px，一行 10 个字以内）；y 990 以下留给署名，别放东西 */
Deck.add({
  id: 't-desk-end',
  chapter: '结尾',
  scene: 'desk',
  title: '谢谢',
  noTitle: true,
  html: `
    <div class="dk-laptop abs" data-beat="0" style="left:140px;top:176px;width:1060px;height:720px;--r:-1.2deg"></div>
    <i class="dk-obj abs" data-dk-art="cup" data-beat="0" style="left:1336px;top:200px;width:380px"></i>
    <div class="dk-note abs ed-note" data-beat="0" style="left:250px;top:292px;width:820px;--r:-1deg">
      <p class="ed-q">水温对了，<br>茶就<em class="key">不苦</em></p>
    </div>
    <div class="dk-note p abs ed-thx" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-pose="happy" data-mascot-say="谢谢！" style="left:1250px;top:664px;width:540px;--r:1.5deg">
      <p class="ed-thanks">谢谢大家，欢迎提问</p>
    </div>
    <div class="mascot guide" data-face="left" style="left:1420px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
