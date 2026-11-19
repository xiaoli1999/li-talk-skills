/* =====================================================================
   方果 fangguo 自己的样板页：一份方果 ERP 的客户演讲 / 季度汇报，主题照定稿（方果-第三轮.html）：方果 ERP、自动套图、Q3 增长
   - 8 页，覆盖一份客户演讲或领导汇报：
     t-fangguo-cover 封面、t-fangguo-part 章节页、t-fangguo-hero 大数字、t-fangguo-chart 柱状图加环形图、
     t-fangguo-kpi 指标卡加趋势线加进度环、t-fangguo-feat 功能卡加合作平台、t-fangguo-flow 流程清单、t-fangguo-about 关于我们（最后一页）
   - 每拍发生的事由方果的版式组件（.fg-*）自己完成：数字从 0 滚到读数、柱子和环按拍生长、趋势线画出来、当前一步用品牌蓝点亮。
     页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 背景按页型自动换：封面、章节页、关于我们是组合 A（柔光 + 波纹），其余是组合 B（晕染 + 网格）
   - 可读性：要点讲完一直留在页上；讲过的块只由引擎退到 .8；渐变只给大数字；一页的蓝色点亮、红字加起来不超过 3 处
   - 组件只在方果里有样子（换成别的风格会乱）：这几页只给 scene: 'fangguo' 用
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/fangguo.css 里对应的 [data-id="t-fangguo-…"] 一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/fangguo.js 开头的说明。
     除了「关于我们」和大数字页的官网数字，其余经营数字都是示例数字，换成你的
   ===================================================================== */

/* 封面（对客户）：不对称构图。左边一组大字——浅蓝小胶囊、两行 112px 的大标题（品牌红只点「少出错」三个字）、一句副标题；
   右边一整块浅蓝底板从舞台 x 1000 一直铺到窗口边缘、上下出血（.fg-bleed，画在背景层里，窗口不是 16:9 也铺满），
   底板上一扇放大的白色界面窗（订单中心，两个浅蓝小格里的数字从 0 滚上来），左下角叠一扇轻轻倾斜的浮窗（进度环 98%），
   右上角一枚折角标签「10 万+ 用户」压在窗角上。
   1 拍：讲者和日期淡入，折角标签浮上来，方方开心一下。
   抄过去改哪里：小胶囊、大标题（两行，每行 7 个字以内；.fg-red 只包一两个词）、副标题、讲者和日期；
   界面窗的标题和两个小格、浮窗里的进度和两行字（示例数字，换成你的）；折角标签的字。
   浮窗只盖住界面窗里的骨架线和图片占位，不盖字 */
Deck.add({
  id: 't-fangguo-cover',
  chapter: '开场',
  scene: 'fangguo',
  title: '让 POD 工厂多接单、少出错',
  noTitle: true,
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-cover" data-beat="0" style="left:150px;top:230px;width:840px">
      <span class="fg-chip">方果 ERP · 解决方案</span>
      <h1 class="fg-hero t-fangguo-cover-h">让 POD 工厂<br>多接单、<span class="fg-red">少出错</span></h1>
      <p class="fg-sub">从接单、套图到生产发货，一套系统跑通</p>
    </div>
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:1100px;top:200px;width:700px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="layers"></i>订单中心<span data-small>今日</span></div>
      <div class="fg-tiles">
        <div class="fg-tile"><span data-small>新订单</span><b class="fg-num fg-g" data-to="2318">2,318</b></div>
        <div class="fg-tile"><span data-small>已套图</span><b class="fg-num fg-g" data-to="2296">2,296</b></div>
      </div>
      <i class="fg-sk" style="width:78%;margin-top:24px"></i><i class="fg-sk" style="width:56%"></i>
      <div class="fg-phs"><i class="fg-ph on"></i><i class="fg-ph on"></i><i class="fg-ph"></i></div>
      <i class="fg-sk" style="width:38%;margin-bottom:30px"></i>
    </div>
    <div class="abs fg-win fg-float" data-beat="0" data-recede="off" style="left:1000px;top:600px;width:450px">
      <div class="fg-float-b">
        <div class="fg-ring" data-fg-ring="98" style="width:124px;height:124px"><b class="fg-num" data-to="98" style="font-size:38px">98<small>%</small></b></div>
        <p data-small><b>自动套图</b>今日完成率</p>
      </div>
    </div>
    <p class="abs fg-who" data-beat="1" style="left:150px;top:880px"><span>主讲 <b>产品部</b></span><span>2026 年 11 月</span></p>
    <div class="abs fg-fold" data-beat="1" data-recede="off" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:1530px;top:140px"><b class="fg-num" data-to="10">10</b> 万+ 用户</div>
    <div class="mascot guide" style="left:1580px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '少出错', say: '大家好，今天花二十分钟，讲讲方果怎么帮 POD 工厂多接单、少出错。' },
    { beat: 1, say: '我是产品部的同事。方果现在已经服务了十万多家用户。' },
  ],
});

/* 章节页（超大编号）：左边一个 460px 的淡蓝渐变编号，右边「PART 01」、章节名、一句说明；底下一排目录，本章加粗点亮。
   1 拍：章节名和说明浮上来；2 拍：目录淡入，方方在旁边想一想（think）。
   抄过去改哪里：编号（两位数）、PART 后面的数字、章节名（8 个字以内）、一句说明；目录的条目和 .on（本章是哪一条） */
Deck.add({
  id: 't-fangguo-part',
  chapter: '一、关于方果',
  chapterShort: '第一部分',
  topic: '关于方果',
  scene: 'fangguo',
  title: '关于方果',
  noTitle: true,
  html: `
    <b class="abs fg-num fg-g fg-bigno" data-beat="0" style="left:110px;top:260px">01</b>
    <div class="abs fg-chapter" data-beat="1" style="left:820px;top:350px;width:900px">
      <p class="fg-part" data-small>PART 01</p>
      <h1>关于方果</h1>
      <p>一家只做 POD 的软件公司，和它的客户</p>
    </div>
    <p class="abs fg-toc" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="think" style="left:820px;top:860px"><span class="on"><b>01</b>关于方果</span><span><b>02</b>增长与效率</span><span><b>03</b>核心能力</span><span><b>04</b>自动套图</span></p>
    <div class="mascot guide" style="left:1640px;top:300px"></div>`,
  notes: [
    { beat: 0, say: '先进入第一部分。' },
    { beat: 1, say: '第一部分，先简单介绍一下方果。' },
    { beat: 2, say: '今天一共讲四部分：关于方果、增长与效率、核心能力、自动套图。' },
  ],
});

/* 大数字（一个主数字 + 三个辅助）：左边一个超大的主数字（330px，淡蓝渐变）和一句说明，右边一列三张横着的小卡，
   每张左边一个大数字、右边两行说明；底部一行数据来源。
   1 拍：主数字从 0 滚到 10，方方惊讶一下（wow）；2–4 拍：右边三张小卡一张张浮上来，数字滚到读数。
   抄过去改哪里：主数字（data-to 和字一起改，单位写在 <small>）、说明；三张小卡的数字、两行说明（每行 6 个字以内）；
   数据来源。这一页的数字取自方果官网 */
Deck.add({
  id: 't-fangguo-hero',
  chapter: '一、关于方果',
  chapterShort: '关于方果',
  topic: '用数字说话',
  scene: 'fangguo',
  title: '专注 POD 的 SaaS ERP',
  html: `
    <div class="abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="wow" data-mascot-dy="-40" style="left:120px;top:290px">
      <b class="fg-num fg-g t-fangguo-hero-n" data-to="10">10<small>万+</small></b>
      <p class="fg-cap">累计服务用户</p>
    </div>
    <div class="abs col t-fangguo-hero-side" style="left:1100px;top:270px;width:700px;--gap:26px">
      <div class="fg-mini" data-beat="2"><b class="fg-num" data-to="70">70<small>%+</small></b><p>POD 市场<br>占有率</p></div>
      <div class="fg-mini" data-beat="3"><b class="fg-num" data-to="95">95<small>%</small></b><p>覆盖<br>印花行业</p></div>
      <div class="fg-mini" data-beat="4"><b class="fg-num" data-to="8">8<small>年</small></b><p>专注<br>POD 行业</p></div>
    </div>
    <p class="abs fg-foot" data-beat="0" style="left:120px;right:120px;top:960px"><span data-small>数据来源：方果官网</span><span data-small>fangguo.com</span></p>
    <div class="mascot guide" style="left:760px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '先用几个数字认识一下方果。' },
    { beat: 1, key: '10 万+', say: '方果累计服务的用户已经超过十万。' },
    { beat: 2, key: '70%', say: 'POD 行业的市场占有率超过七成。' },
    { beat: 3, key: '95%', say: '覆盖了九成五的印花行业。' },
    { beat: 4, key: '8 年', say: '我们只做一件事，专注 POD 已经八年。' },
  ],
});

/* 图表（柱状图 + 环形图）：左边一张大卡是每月新增付费工厂的柱状图（读数、月份是真的字），右边一张环形图卡（中间放合计、下面图例）高出一截、
   叠在柱状图卡的右上角，投影更深，拉出前后层次（柱状图卡右边留了空，环形图卡只压空白，不压字）。
   1 拍：柱子一根根从底下长出来，方方歪头疑问（ask：为什么九月这么高？）；2 拍：九月那根用渐变蓝点亮、读数变大，方方惊讶（wow）；
   3 拍：环形图一段段画出来，中间的合计从 0 滚上来。
   抄过去改哪里：.fg-bars 的 data-fg-bars（读数）、data-fg-labels（月份）、data-fg-hi（第几根突出）、data-fg-hi-beat（第几拍点亮）；
   .fg-donut 的 data-fg-donut（各段比例）、中间的合计（data-to 和字）、图例的名字和百分比。示例数字，换成你的 */
Deck.add({
  id: 't-fangguo-chart',
  chapter: '二、增长与效率',
  chapterShort: '增长',
  topic: '季度数字',
  scene: 'fangguo',
  title: 'Q3 新增工厂创新高',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">9 月自动套图上线，当月新增破 500</p>
    <div class="abs card t-fangguo-chart-bar" data-beat="1" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".06" data-mascot-pose="ask" style="left:120px;top:290px;width:1200px">
      <p class="fg-ch">每月新增付费工厂<span data-small>单位：家</span></p>
      <div class="fg-bars" data-fg-bars="286,318,352,371,402,511" data-fg-labels="4 月,5 月,6 月,7 月,8 月,9 月" data-fg-hi="6" data-fg-hi-beat="2" data-fg-max="540" style="height:400px;margin-top:22px"></div>
      <i class="t-fangguo-chart-hi" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".2" data-mascot-pose="wow"></i>
    </div>
    <div class="abs card t-fangguo-chart-pie" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" style="left:1240px;top:236px;width:560px">
      <p class="fg-ch">新增工厂来自哪里</p>
      <div class="fg-donut" data-fg-donut="52,27,21" style="margin:22px auto 26px"><b class="fg-num" data-to="1284">1,284</b><span data-small>Q3 合计</span></div>
      <div class="fg-legend"><p><i></i>跨境平台<b>52%</b></p><p><i></i>国内平台<b>27%</b></p><p><i></i>工厂直签<b>21%</b></p></div>
    </div>
    <div class="mascot guide" style="left:1680px;top:880px"></div>`,
  notes: [
    { beat: 0, say: '再看增长。这个季度最大的变化是九月自动套图上线。' },
    { beat: 1, key: '每月新增', say: '这是每个月新增的付费工厂，一直在涨。为什么九月会突然跳上去？' },
    { beat: 2, key: '511', say: '九月新增五百一十一家，比八月多了一百多家，就是自动套图带来的。' },
    { beat: 3, key: '1,284', say: '整个第三季度新增一千两百多家，一半以上来自跨境平台。' },
  ],
});

/* 图表（指标卡 + 趋势线 + 进度环）：上面一排三张指标卡（名字、小图标、大数字、一行变化），
   下面左边一张卡是日均处理订单的趋势线（带面积，终点一个圆点和读数），右边一张卡是自动套图覆盖率的进度环。
   1 拍：三张指标卡依次浮上来，数字滚到读数；2 拍：趋势线从左往右画出来；3 拍：进度环长到 90%，方方点个赞（ok）。
   抄过去改哪里：指标卡的名字、图标（data-fg-ico、data-fg-tone）、数字（data-to 和字一起改）、单位、变化（变差了给 fg-delta 加 down）；
   .fg-line 的 data-fg-line（每个点的读数）、data-fg-labels（横轴，空的不写）；.fg-ring 的 data-fg-ring 和中间的数字、旁边的说明。
   示例数字，换成你的 */
Deck.add({
  id: 't-fangguo-kpi',
  chapter: '二、增长与效率',
  chapterShort: '效率',
  topic: '生产端',
  scene: 'fangguo',
  title: '生产效率：三个数都在变好',
  html: `
    <div class="abs grid" data-beat="1" data-stagger=".1" style="left:120px;top:250px;width:1680px;--cols:3;--gap:36px">
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>日均处理订单</span><i class="fg-ico fg-ico-s" data-fg-ico="box"></i></p><b class="fg-num fg-g" data-to="52">52<small>万单</small></b><p class="fg-delta" data-small>▲ 环比 +12%</p></div>
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>一款图套图用时</span><i class="fg-ico fg-ico-s" data-fg-ico="img" data-fg-tone="teal"></i></p><b class="fg-num" data-to="10">10<small>秒</small></b><p class="fg-delta" data-small>▼ 原来约 20 分钟</p></div>
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>客户续费率</span><i class="fg-ico fg-ico-s" data-fg-ico="check" data-fg-tone="amber"></i></p><b class="fg-num" data-to="91">91<small>%</small></b><p class="fg-delta" data-small>▲ 同比 +4 个点</p></div>
    </div>
    <div class="abs card" data-beat="2" style="left:120px;top:560px;width:1100px">
      <p class="fg-ch">日均处理订单<span data-small>单位：万单</span></p>
      <div class="fg-line" data-fg-line="31,32,34,35,37,40,42,45,49,52" data-fg-labels="4 月,,,6 月,,,8 月,,,9 月" style="height:200px;margin-top:26px"></div>
    </div>
    <div class="abs card" data-beat="3" data-mascot="3" data-mascot-side="top" data-mascot-x=".7" data-mascot-pose="ok" style="left:1260px;top:560px;width:540px">
      <div class="row" style="--gap:30px;--align:center">
        <div class="fg-ring" data-fg-ring="90" data-fg-tone="teal" style="width:170px;height:170px"><b class="fg-num" data-to="90">90<small>%</small></b></div>
        <p class="fg-ch">自动套图<br>覆盖率</p>
      </div>
      <p class="t-fangguo-kpi-say">九成订单不用人工套图，目标年底 95%</p>
    </div>
    <div class="mascot guide" style="left:1640px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '效率这边，生产端有三个数都在变好。' },
    { beat: 1, key: '52 万单', say: '日均处理订单五十二万单，环比涨了百分之十二；一款图套图只要十秒；客户续费率百分之九十一。' },
    { beat: 2, key: '日均处理订单', say: '从四月到九月，日均订单一路往上走。' },
    { beat: 3, key: '90%', say: '自动套图已经覆盖九成订单，年底目标是百分之九十五。' },
  ],
});

/* 功能卡（渐变图标 + 合作平台）：一排三张功能卡，每张一个渐变圆角图标、名字、一句说明，底下一条分隔线和一个大数字；
   最下面一条「已对接平台」横栏。1–3 拍：功能卡一张张浮上来，当前这一张描边变蓝、数字滚上来；4 拍：平台横栏淡入，方方冒出灵感（idea）。
   抄过去改哪里：图标（data-fg-ico、data-fg-tone）、名字（6 个字以内）、说明（两行，24 个字以内）、大数字和单位；
   平台横栏的名字（9 个以内，放不下就删几个）。示例数字，换成你的 */
Deck.add({
  id: 't-fangguo-feat',
  chapter: '三、核心能力',
  chapterShort: '核心能力',
  topic: '三件事',
  scene: 'fangguo',
  title: '方果帮工厂做好三件事',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">每一件都直接省人、省时间</p>
    <div class="abs fg-feats" style="left:120px;top:280px;width:1680px">
      <div class="fg-fc" data-beat="1"><i class="fg-ico" data-fg-ico="layers"></i><h4>多平台接单</h4><p>TEMU、SHEIN、亚马逊等平台订单自动汇总</p><div class="fg-fc-m"><b class="fg-num fg-g" data-to="30">30<small>+ 平台</small></b></div></div>
      <div class="fg-fc" data-beat="2"><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i><h4>自动套图</h4><p>一张印花自动套进全部款式和尺码</p><div class="fg-fc-m"><b class="fg-num fg-g" data-to="10">10<small>秒 / 款</small></b></div></div>
      <div class="fg-fc" data-beat="3"><i class="fg-ico" data-fg-ico="truck" data-fg-tone="teal"></i><h4>智能分拣发货</h4><p>批次、面单、快递自动匹配</p><div class="fg-fc-m"><b class="fg-num fg-g">0<small>漏发错发</small></b></div></div>
    </div>
    <div class="abs fg-plat" data-beat="4" data-mascot="4" data-mascot-side="right" data-mascot-pose="idea" style="left:120px;top:840px"><span data-small>已对接平台</span><b>TEMU</b><b>SHEIN</b><b>亚马逊</b><b>TikTok</b><b>Shopee</b><b>速卖通</b><b>淘宝</b><b>拼多多</b><b>抖音</b></div>
    <div class="mascot guide" style="left:1660px;top:100px"></div>`,
  notes: [
    { beat: 0, say: '方果帮工厂做好三件事，每一件都直接省人、省时间。' },
    { beat: 1, key: '多平台接单', say: '第一件，多平台接单：三十多个平台的订单自动汇总到一处。' },
    { beat: 2, key: '自动套图', say: '第二件，自动套图：一张印花自动套进全部款式和尺码，十秒一款。' },
    { beat: 3, key: '智能分拣发货', say: '第三件，智能分拣发货：批次、面单、快递自动匹配，不漏发、不错发。' },
    { beat: 4, say: '主流的跨境和国内平台都已经对接好了。' },
  ],
});

/* 流程清单（当前一步点亮）：左边四步，名字一开始就摆出来（整条路先看清），每拍讲一步：说明淡入、序号变成渐变蓝、名字变蓝，
   讲过的序号留成浅蓝；右边一整块出血的浅蓝底板（.fg-bleed，铺到窗口边缘）上一扇放大的「套图工具」界面窗。
   3 拍讲到自动套图时，界面窗左下角叠上一扇轻轻倾斜的浮窗「全部尺码已生成」。
   4 拍讲完最后一步时，右上角的折角标签「20 分钟 → 10 秒」浮上来，方方点个赞（ok）。
   抄过去改哪里：每一步的名字（6 个字以内）、说明（一行，16 个字以内）；步骤多一步就加一个 .fg-step、data-beat 往后排；
   界面窗的标题、按钮；折角标签的字（示例数字，换成你的） */
Deck.add({
  id: 't-fangguo-flow',
  chapter: '三、自动套图',
  chapterShort: '自动套图',
  topic: '四步走完',
  scene: 'fangguo',
  title: '四步，从印花到生产',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">以前设计师一张张套，现在系统按款式自动生成</p>
    <div class="abs fg-flow" style="left:120px;top:280px;width:780px">
      <div class="fg-step" data-mascot="1" data-mascot-side="right"><div><h4>上传印花</h4><p data-beat="1">拖进来就行，支持 PSD、PNG</p></div></div>
      <div class="fg-step" data-mascot="2" data-mascot-side="right"><div><h4>匹配款式</h4><p data-beat="2">按订单 SKU 找到对应模板</p></div></div>
      <div class="fg-step" data-mascot="3" data-mascot-side="right" data-mascot-pose="idea"><div><h4>自动套图</h4><p data-beat="3">全部尺码一次生成，位置自动对齐</p></div></div>
      <div class="fg-step" data-mascot="4" data-mascot-side="right" data-mascot-pose="ok"><div><h4>推送生产</h4><p data-beat="4">生成的图直接进生产批次</p></div></div>
    </div>
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:1080px;top:330px;width:720px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="img"></i>套图工具<span class="fg-btn" data-small>本地套图</span></div>
      <div class="fg-phs"><i class="fg-ph on"></i><i class="fg-ph on"></i><i class="fg-ph"></i></div>
      <i class="fg-sk" style="width:60%"></i><i class="fg-sk" style="width:40%;margin-bottom:30px"></i>
    </div>
    <div class="abs fg-win fg-float" data-beat="3" data-recede="off" style="left:1040px;top:720px;width:470px;--fg-tilt:2deg">
      <div class="fg-float-b"><i class="fg-ico" data-fg-ico="check" data-fg-tone="teal"></i><p data-small><b>S / M / L / XL</b>全部尺码已生成</p></div>
    </div>
    <div class="abs fg-fold" data-beat="4" data-recede="off" style="left:1380px;top:268px"><b class="fg-num">20</b> 分钟 → <b class="fg-num">10</b> 秒</div>
    <div class="mascot guide" style="left:930px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '自动生成', say: '自动套图怎么用？一共四步。以前设计师一张张套，现在系统按款式自动生成。' },
    { beat: 1, key: '上传印花', say: '第一步上传印花，拖进来就行。' },
    { beat: 2, key: '匹配款式', say: '第二步，系统按订单的 SKU 找到对应的模板。' },
    { beat: 3, key: '自动套图', say: '第三步自动套图，全部尺码一次生成，位置自动对齐。' },
    { beat: 4, key: '推送生产', say: '第四步，生成的图直接进生产批次。一款图从二十分钟变成十秒。' },
  ],
});

/* 关于我们（结尾前可选加的一页，这里是最后一页）：左边公司名小胶囊、「满怀理想 脚踏实地」两行大字、一句简介，下面三个官网数字；
   右边三张二维码卡（公众号、抖音号、商务合作企业微信）和一张联系方式卡（电话、官网、地址）。
   1 拍：三个数字从 0 滚上来；2 拍：二维码和联系方式浮上来，方方鞠躬致谢（thanks）。
   这一页的信息都是方果的真实信息（取自官网），二维码图片在 vendor/brand/fangguo/，由 fangguo.css 按 data-fg-qr 显示：
   wechat 公众号、douyin 抖音号、business 商务合作。抄过去基本不用改；最后一页底部留给引擎自动加的署名，别往 y 990 以下放字 */
Deck.add({
  id: 't-fangguo-about',
  chapter: '关于我们',
  topic: '联系方式',
  scene: 'fangguo',
  title: '关于我们',
  noTitle: true,
  html: `
    <div class="abs fg-about" data-beat="0" style="left:150px;top:190px;width:760px">
      <span class="fg-chip">深圳市渔童科技有限公司</span>
      <h1>满怀理想<br>脚踏实地</h1>
      <p>致力于柔性制造、智能化生产，让按需生产、自动化、规模化、智能化成为可能。</p>
    </div>
    <div class="abs fg-facts" data-beat="1" style="left:150px;top:690px">
      <div><b class="fg-num fg-g" data-to="10">10<small>万+</small></b><p data-small>服务用户</p></div>
      <div><b class="fg-num fg-g" data-to="70">70<small>%+</small></b><p data-small>POD 市场占有率</p></div>
      <div><b class="fg-num fg-g" data-to="8">8<small>年</small></b><p data-small>专注 POD</p></div>
    </div>
    <div class="abs fg-qrs" data-beat="2" data-stagger=".08" style="left:998px;top:190px">
      <div class="fg-qr" data-fg-qr="wechat"><span data-small>公众号</span></div>
      <div class="fg-qr" data-fg-qr="douyin"><span data-small>抖音号</span></div>
      <div class="fg-qr" data-fg-qr="business"><span data-small>商务合作</span></div>
    </div>
    <div class="abs fg-contact" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".78" data-mascot-pose="thanks" style="left:998px;top:530px;width:802px">
      <p><b>电话</b><span>400-996-5359</span></p>
      <p><b>官网</b><span>fangguo.com</span></p>
      <p><b>地址</b><span>深圳市龙岗区坂田街道岗辉路天安云谷二期 4 栋 2002</span></p>
    </div>
    <div class="mascot guide" style="left:1640px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '最后介绍一下我们：深圳市渔童科技有限公司，满怀理想、脚踏实地。' },
    { beat: 1, key: '10 万+', say: '我们服务了十万多家用户，POD 市场占有率超过七成，专注这个行业八年。' },
    { beat: 2, say: '扫码关注公众号和抖音，商务合作找企业微信，或者直接打电话。谢谢大家！' },
  ],
});
