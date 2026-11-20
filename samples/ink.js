/* =====================================================================
   水墨国风 ink 自己的样板页：封面 t-ink-cover、手卷清单 t-ink-list、竖墨三步 t-ink-steps、印谱 t-ink-seals、题画诗 t-ink-end
   - 内容和通用样板（samples.js）大致对应（虚构主题：怎么泡好一杯茶），版式、结构、每拍的节奏按水墨来：
     像一幅展开的手卷、一页册页；大量留白、一个视觉重心；题签、物名、印文竖排；每拍是一列字写出来、一笔墨洇开、一枚印盖下
   - 可读性（第二轮改的）：竖排只给短的——书名题签、引首、物名、印文、两列诗句，一块不超过 12 个字，一页竖排的字
     （含印上的字）加起来不超过 24 个；副题、说明、讲者、落款一律横排（.ink-heng，也是一个字一个字写出来）。
     重点词一页最多两处（转朱砂、字下淡淡一道朱笔）；讲过的只退到 .8，不另调淡
   - 只能配水墨国风用：用了这种风格自己的组件（.ink-v 竖排、.ink-heng 横写、.ink-tiqian 题签、.ink-scroll 手卷、.ink-seal 朱印……，
     用法见 scenes/ink.js 开头），换成别的风格会退成普通的横排字
   - 抄过去：整段 Deck.add 抄进章节文件，id 换成讲稿页号，samples/ink.css 里对应的 [data-id="t-ink-…"] 一起换；字照讲稿改。
     竖排的字不要带逗号句号（用分列或全角空格「　」），一列字数照页面 CSS 里的字号算：一个字约占（字号 × 1.14）高
   - 页面里不写 data-in：竖排、横写的块、题签、手卷、印、画都由风格按类名选好出场
   ===================================================================== */

/* 封面：线装书的封面。右边一条竖长的题签写书名（视觉重心，竖排 7 个字），题签右上角一枚引首章「新人茶话会」；
   题签左边横排两行副题，靠右对齐贴着题签；左边大片留白，远山在底下。
   第 0 拍：题签从上往下展开、书名一个字一个字写出来，副题一个字一个字横着写出，最后盖下引首章；
   第 1 拍：讲者和日期在副题下面横着写出来，末尾钤一枚小印，墨丸跳到落款旁边高兴一下。
   为什么适合水墨：书名竖写在题签上、落款钤印，是中国书画和线装书本来的样子；不用封面图，靠留白和远山。
   可读性：竖排只有书名和印文（13 个字）；副题、讲者横排，从书名往左、从上往下一条路读下来。
   抄过去时改：书名（8 个字以内）、副题、落款的字；书名字多了按「一个字约占字号 × 1.14 高」重算 top，题签底边别过 y 960 */
Deck.add({
  id: 't-ink-cover',
  chapter: '开场',
  scene: 'ink',
  title: '怎么泡好一杯茶',
  noTitle: true,
  html: `
    <p class="abs ink-tiqian" data-beat="0" style="left:1200px;top:138px">怎么<em class="key">泡好</em>一杯茶</p>
    <p class="abs ink-heng t-ic-sub" data-beat="0" data-delay=".5" style="left:560px;top:318px;width:572px">水温、茶量、时间<br>三件事讲清楚</p>
    <p class="abs ink-seal sm" data-beat="0" data-delay=".9" style="left:1396px;top:150px;--r:2deg">新人茶话会</p>
    <p class="abs ink-heng t-ic-sign" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-dx="150" data-mascot-pose="happy" style="left:560px;top:600px;width:572px">讲者：〈你的名字〉<br>〈日期〉<span class="ink-seal sm zhu">茶</span></p>
    <div class="mascot guide" style="left:560px;top:660px"></div>`,
  notes: [
    { beat: 0, key: '泡好', say: '大家好，今天聊一件小事：怎么泡好一杯茶。' },
    { beat: 1, say: '我是〈你的名字〉，平时爱喝茶，也踩过不少坑。' },
  ],
});

/* 清单（招牌页「竖排手卷」）：一段展开的手卷，从右往左读。最右是引首（标题竖写两行，错落开），
   往左一样东西一段：段首框字（器、茶、水），物名大字竖写（4 个字），下面横排两行小注；段与段之间是乌丝栏。
   第 0 拍：手卷从右往左展开，引首写出来；第 1–3 拍：每拍一段——乌丝栏从上往下画出，物名一个字一个字竖着写下来、
   小注横着写出来，重点词转朱砂、朱笔划一道；第 3 拍最后在拖尾盖一枚闲章「清欢」。墨丸一直站在「下一段要写的地方」，每拍往左挪一段。
   为什么适合水墨：手卷、从右往左、乌丝栏、引首、闲章，都是只有中文古籍和书画才有的版式。
   可读性：说明句横排；竖排只有引首和三个物名（加闲章一共 24 个字，到顶了，别再加竖排的字）；重点词两处（三克、八十度）。
   抄过去时改：引首和三段的字（物名 4 个字以内、小注每行 6 个字以内、最多两行）；
   多一段就多写一个 .ink-col，手卷宽度不够就把 .t-il-it 的宽度改小或手卷往左放 */
Deck.add({
  id: 't-ink-list',
  chapter: '一、准备',
  topic: '要备的三样东西',
  scene: 'ink',
  title: '泡茶之前，备好三样东西',
  noTitle: true,
  html: `
    <div class="abs ink-scroll" data-beat="0" style="left:300px;top:124px;width:1500px">
      <div class="ink-col ink-head">
        <p class="ink-v t-il-pre">泡茶之前</p>
        <p class="ink-v t-il-h">备好三样东西</p>
      </div>
      <div class="ink-col t-il-it" data-beat="1" data-mascot="1" data-mascot-side="left">
        <span class="ink-box">器</span>
        <p class="ink-v t-il-name">一只盖碗</p>
        <p class="ink-heng ink-note">带盖的小茶碗<br>白瓷的最好</p>
      </div>
      <div class="ink-col t-il-it" data-beat="2" data-mascot="2" data-mascot-side="left">
        <span class="ink-box">茶</span>
        <p class="ink-v t-il-name"><em class="key">三克</em>绿茶</p>
        <p class="ink-heng ink-note">大约铺满碗底<br>薄薄一层</p>
      </div>
      <div class="ink-col t-il-it" data-beat="3" data-mascot="3" data-mascot-side="left">
        <span class="ink-box">水</span>
        <p class="ink-v t-il-name">一壶热水</p>
        <p class="ink-heng ink-note">烧开后晾到<br><em class="key">八十度</em></p>
      </div>
    </div>
    <p class="abs ink-seal" data-beat="3" data-delay=".8" style="left:356px;top:700px;--r:-3deg">清欢</p>
    <div class="mascot guide" style="left:1360px;top:470px"></div>`,
  notes: [
    { beat: 0, key: '三样', say: '动手之前先备齐东西，一共三样。' },
    { beat: 1, key: '盖碗', say: '第一样是盖碗，就是带盖的小茶碗。白瓷的最好，茶汤什么颜色一眼就看清。' },
    { beat: 2, key: '三克', say: '第二样是茶叶，三克就够，大约铺满碗底薄薄一层。' },
    { beat: 3, key: ['热水', '八十度'], say: '第三样是热水。水烧开后别急，晾到八十度左右再用。' },
  ],
});

/* 步骤（竖墨三步）：左边大标题两行，右边一笔从上往下的竖墨，三个墨点落在三步上（序号是汉字），最后一步收成悬针，
   旁边是线装书题签样子的命令，点一下复制、盖一枚朱印「已复制」。
   第 1–3 拍：上一个墨点往下写一笔竖画 → 落笔一顿，墨点洇开、溅出细墨 → 步骤名、说明洇出；第 3 拍再往下写出悬针。
   当前这一步的步骤名是朱砂色（页面 CSS），讲过的回到浓墨、只退一点；墨丸每拍顺着竖笔淌到当前墨点的左边。
   为什么适合水墨：一笔竖画串起几个墨点，比一排卡片加箭头更像在纸上写字；这是定稿样页 09 的版式。
   可读性：全横排；重点词只有标题里的「三步」，步骤名不再标重点词（当前步的朱砂就是这一拍的强调）。
   抄过去时改：标题、三步的字和命令；多一步就多一个 li，--gap 调小一点，最后一步的底边别过 y 960 */
Deck.add({
  id: 't-ink-steps',
  chapter: '二、动手',
  topic: '泡茶三步',
  scene: 'ink',
  title: '泡一杯绿茶，只要三步',
  noTitle: true,
  html: `
    <p class="abs t-is-title" data-beat="0" style="left:130px;top:196px">泡一杯绿茶<br>只要<em class="key">三步</em></p>
    <ol class="abs steps ink-cn ink-needle" style="left:1010px;top:206px;width:790px;--gap:84px">
      <li data-beat="1" data-mascot="1" data-mascot-side="left"><b>温杯</b><span>热水把盖碗烫一遍</span></li>
      <li data-beat="2" data-mascot="2" data-mascot-side="left"><b>投茶</b><span>三克茶叶铺满碗底</span></li>
      <li data-beat="3" data-mascot="3" data-mascot-side="left"><b>注水</b><span>八十度水沿碗边倒</span>
        <button class="copy" type="button" data-copy="tea brew --green --temp 80">tea brew --green --temp 80</button></li>
    </ol>
    <div class="mascot guide" style="left:660px;top:356px"></div>`,
  notes: [
    { beat: 0, key: '三步', say: '东西备齐了，泡一杯绿茶其实只要三步。' },
    { beat: 1, key: '温杯', say: '第一步温杯：热水把盖碗里外烫一遍，倒掉。' },
    { beat: 2, key: '投茶', say: '第二步投茶：三克茶叶放进去，铺满碗底就行。' },
    { beat: 3, key: '注水', say: '第三步注水：八十度的水沿着碗边慢慢倒。懒得记的话，旁边这行命令点一下就能复制。' },
  ],
});

/* 招牌页「印谱」：一页印谱，右边竖写标题，往左三个空着的版框；每拍往一个框里盖下一枚大印（数字刻在印上），
   印下面竖写释文（这个数管的是什么）。三枚印形状不一样：白文长方印、朱文方印、白文椭圆印，像真的印谱。
   第 1–3 拍：一枚印盖下（提起、压下、印泥洇开、溅出朱砂）→ 释文写出来；墨丸每拍站到刚盖好的那一格下面。
   为什么适合水墨：把要记住的数「刻成印」一枚枚盖下，是只有篆刻、印谱才有的样子；版框先空着，盖一枚满一格。
   可读性：竖排都是短的（标题 6 个字、印文 8 个字、释文 6 个字）；释文用浓墨大字，讲过的也看得清。
   抄过去时改：印上的字（2–3 个字）、释文（2 个字）；印的形状换 .zhu / .round 搭配；格子多了就把 .t-ip-cell 的宽度改小 */
Deck.add({
  id: 't-ink-seals',
  chapter: '三、记住',
  topic: '三个数',
  scene: 'ink',
  title: '三件事，三个数',
  noTitle: true,
  html: `
    <p class="abs ink-v t-ip-title" data-beat="0" style="left:1584px;top:150px">三件事<br>三个数</p>
    <div class="abs t-ip-pu" style="left:500px;top:210px;width:988px">
      <div class="ink-frame t-ip-cell" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".3">
        <p class="ink-seal lg" data-beat="1" style="--r:-2deg">八十度</p>
        <p class="ink-v t-ip-cap" data-beat="1" data-delay=".45">水温</p>
      </div>
      <div class="ink-frame t-ip-cell" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".3">
        <p class="ink-seal lg zhu" data-beat="2" style="--r:1.5deg">三克</p>
        <p class="ink-v t-ip-cap" data-beat="2" data-delay=".45">茶量</p>
      </div>
      <div class="ink-frame t-ip-cell" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3">
        <p class="ink-seal lg round" data-beat="3" style="--r:-1deg">一分钟</p>
        <p class="ink-v t-ip-cap" data-beat="3" data-delay=".45">时间</p>
      </div>
    </div>
    <div class="mascot guide" style="left:250px;top:640px"></div>`,
  notes: [
    { beat: 0, key: '三个数', say: '开头说的三件事，水温、茶量、时间，其实各是一个数，记住就行。' },
    { beat: 1, key: '八十度', say: '水温：八十度，烧开后晾一晾。' },
    { beat: 2, key: '三克', say: '茶量：三克，铺满碗底薄薄一层。' },
    { beat: 3, key: '一分钟', say: '时间：一分钟。注水后大约一分钟就出汤，泡久了会苦。' },
  ],
});

/* 结尾（招牌页「题画诗」）：右边一幅墨染的山水（主峰、远山、一叶小舟），收尾金句竖写在山旁的天空里，像画上的题款；
   第 1 拍在金句左下横着写一行落款「谢谢大家，欢迎提问」，末尾钤一枚名章。署名由引擎自动加在最后一页底下。
   第 0 拍：墨从画的底边往上洇开 → 金句一列列写出来 → 「不苦」转朱砂、右边朱笔一道；第 1 拍：落款写出、印盖下，墨丸说谢谢。
   为什么适合水墨：诗画同框、题款落款钤印，是中国画收尾的规矩；一句话配一幅画，比居中一行大字更有余味。
   可读性：竖排只有两列诗句（8 个字）和印文；落款横排，读完诗往左下就是。
   抄过去时改：金句两列（每列 4–5 个字）、落款的字；字多了按「一个字约占字号 × 1.14 高」重算，落款别压到画上 */
Deck.add({
  id: 't-ink-end',
  chapter: '结尾',
  scene: 'ink',
  title: '谢谢',
  noTitle: true,
  html: `
    <i class="abs ink-wash ink-peaks" data-beat="0" style="left:860px;top:230px;width:1060px;height:816px"></i>
    <p class="abs ink-v t-ie-poem" style="left:880px;top:140px" data-beat="0" data-delay=".4">水温对了<br>茶就<em class="key">不苦</em></p>
    <p class="abs ink-heng t-ie-sign" style="left:500px;top:700px;width:520px" data-beat="1" data-mascot="1" data-mascot-side="left" data-mascot-dx="40" data-mascot-pose="happy" data-mascot-say="谢谢！">谢谢大家，欢迎提问<span class="ink-seal sm">清欢</span></p>
    <div class="mascot guide" style="left:360px;top:700px"></div>`,
  notes: [
    { beat: 0, key: '不苦', say: '最后只记一句：水温对了，茶就不苦。' },
    { beat: 1, say: '谢谢大家，有问题现在可以问。' },
  ],
});
