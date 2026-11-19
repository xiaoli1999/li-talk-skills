/* =====================================================================
   方果 fangguo 自己的样板页：一份方果 ERP 的客户演讲（完整的 20 页演示在仓库外的 _private/brand/方果演示/，这里挑了最有代表性的 10 页）
   - t-fangguo-cover 封面、t-fangguo-quote 金句页、t-fangguo-hero 大数字、t-fangguo-chart 柱状图加环形图、
     t-fangguo-demo 界面演示★、t-fangguo-mock 套图★、t-fangguo-pipe 订单流水线★、t-fangguo-lens 聚焦框★、t-fangguo-hub 平台汇聚★、
     t-fangguo-about 关于我们（最后一页）。★ 是方果的招牌交互
   - 动效为内容服务，像一场高级的产品发布会：每拍 0.3–0.8 秒、平滑，同一页里一次只动一处主角——光标点按钮、印花套上商品、
     订单卡走到下一站、聚焦框移过去、光点流向方果、数字按位滚上来。页面里只写结构和 data-beat，不写 onBeat、不写风格专用的 data-in
   - 版式每页不重复：出血底板、淡蓝晕染的金句页、超大数字压版、卡片叠放和倾斜浮窗、圆形汇聚；大页和密页交替
   - 背景按页型自动换：封面、关于我们是组合 A（柔光 + 波纹），金句页是整屏淡蓝晕染，其余是组合 B（晕染 + 网格）
   - 可读性：要点讲完一直留在页上（提示不自己消失、聚焦框四周只压暗一点）；讲过的块只由引擎退到 .8；渐变只给大数字
   - 组件只在方果里有样子（换成别的风格会乱）：这几页只给 scene: 'fangguo' 用
   - 抄过去时：id 换成 p〈讲稿页号〉，samples/fangguo.css 里对应的 [data-id="t-fangguo-…"] 和 t-fangguo-… 的类名一起换；字照讲稿改；
     坐标都是舞台坐标（1920×1080），版式组件的用法见 scenes/fangguo.js 开头的说明和 references/styles.md 的方果一节。
     除了大数字页、关于我们的官网数字和公司信息，其余经营数字、案例都是示例数字，换成你的
   ===================================================================== */

/* 封面（对客户）：不对称构图。左边一组大字（品牌红只点「一站式」三个字），右边一整块出血的浅蓝底板（.fg-bleed，画在背景层里，
   窗口不是 16:9 也铺满），上面一扇放大的界面窗（数字从 0 滚上来），左下叠一扇倾斜 2° 的浮窗，右上一枚折角标签压在窗角上。
   1 拍：讲者和日期淡入，折角标签浮上来，方方开心一下（happy）。
   抄过去改哪里：小胶囊、大标题（两行，每行 7 个字以内；.fg-red 只包一两个词）、副标题、讲者和日期；界面窗、浮窗、折角标签里的字。
   界面窗和浮窗里的数字是示例数字，换成你的 */
Deck.add({
  id: 't-fangguo-cover',
  chapter: '开场',
  scene: 'fangguo',
  title: '方果 ERP：POD 工厂的一站式生产系统',
  noTitle: true,
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-cover" data-beat="0" style="left:150px;top:220px;width:860px">
      <span class="fg-chip">方果 ERP · 客户方案</span>
      <h1 class="fg-hero t-fangguo-cover-h">POD 工厂的<br><span class="fg-red">一站式</span>生产系统</h1>
      <p class="fg-sub">接单、套图、生产、发货，一套系统跑通</p>
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
    <p class="abs fg-who" data-beat="1" style="left:150px;top:880px"><span>主讲 <b>方果产品部</b></span><span>2026 年 11 月</span></p>
    <div class="abs fg-fold" data-beat="1" data-recede="off" data-mascot="1" data-mascot-side="stay" data-mascot-pose="happy" style="left:1530px;top:140px"><b class="fg-num" data-to="10">10</b> 万+ 用户</div>
    <div class="mascot guide" style="left:1580px;top:820px"></div>`,
  notes: [
    { beat: 0, key: '一站式', say: '大家好，今天花二十分钟，讲讲方果 ERP 怎么帮 POD 工厂把接单、套图、生产、发货一套跑通。' },
    { beat: 1, say: '我是方果产品部的同事。方果现在服务了十万多家用户。' },
  ],
});

/* 金句页（浅色）：整屏一层淡蓝晕染（.fg-bleed.fg-wash，画在背景层里铺满窗口），一页只放一个问题——112px 深墨色大字，
   上面一道品牌蓝渐变短线，关键词（.fg-hl）是品牌蓝渐变；右边一组淡蓝同心细圆环（.fg-deco），和别的页同一个浅色基调。
   1 拍补一句来由，2 拍亮出三个关键词；方方歪头疑问（ask）。
   为什么这样排：讲痛点前先抛一个问题，大页和密页交替，节奏一下子拉开。
   抄过去改哪里：问题（两行，每行 7 个字以内；.fg-hl 点一个词）、来由、三个关键词 */
Deck.add({
  id: 't-fangguo-quote',
  chapter: '引子',
  chapterShort: '行业痛点',
  topic: '先问一个问题',
  scene: 'fangguo',
  title: '订单越多，工厂反而越乱？',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote" data-beat="0" data-mascot="0" data-mascot-side="right" data-mascot-pose="ask" data-mascot-dy="40" style="left:150px;top:270px;white-space:nowrap">订单越多，<br>工厂反而<span class="fg-hl">越乱</span>？</p>
    <p class="abs fg-quote-by" data-beat="1" style="left:154px;top:640px">这是我们走访 POD 工厂时，听到最多的一句话</p>
    <p class="abs t-fangguo-quote-tags" data-beat="2" data-stagger=".1" style="left:150px;top:770px"><span>接单乱</span><span>套图慢</span><span>错发漏发</span></p>
    <i class="abs fg-deco" style="left:1220px;top:200px;width:620px"></i>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '越乱', say: '先问大家一个问题：订单越来越多，工厂是不是反而越来越乱？' },
    { beat: 1, say: '这是我们走访 POD 工厂时，听到最多的一句话。' },
    { beat: 2, key: '接单乱', say: '乱在哪？基本就是三件事：接单乱、套图慢、错发漏发。' },
  ],
});

/* 大数字（一个主数字 + 三个辅助）：380px 的主数字压在版面上做视觉锚点，右边三张小卡错开成台阶。
   数字都写成 .fg-num.fg-odo：到拍时每一位先快速翻动，再从左到右依次停在读数上（只改真数字自己的字）。
   1 拍主数字滚上来、方方惊讶（wow）；2–4 拍三张小卡依次浮上来。
   抄过去改哪里：主数字（单位写在 <small>）、说明；三张小卡的数字、两行说明。这一页的数字取自方果官网 */
Deck.add({
  id: 't-fangguo-hero',
  chapter: '一、方果是谁',
  chapterShort: '方果是谁',
  topic: '用数字说话',
  scene: 'fangguo',
  title: '专注 POD 的 SaaS ERP',
  html: `
    <div class="abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="wow" data-mascot-dy="-40" style="left:120px;top:280px">
      <b class="fg-num fg-g fg-odo t-fangguo-hero-n">10<small>万+</small></b>
      <p class="fg-cap">累计服务用户</p>
    </div>
    <div class="abs col t-fangguo-hero-side" style="left:1100px;top:270px;width:700px;--gap:26px">
      <div class="fg-mini" data-beat="2"><b class="fg-num fg-odo">70<small>%+</small></b><p>POD 市场<br>占有率</p></div>
      <div class="fg-mini" data-beat="3"><b class="fg-num fg-odo">95<small>%</small></b><p>覆盖<br>印花行业</p></div>
      <div class="fg-mini" data-beat="4"><b class="fg-num fg-odo">8<small>年</small></b><p>专注<br>POD 行业</p></div>
    </div>
    <p class="abs fg-foot" data-beat="0" style="left:120px;right:120px;top:960px"><span data-small>数据来源：方果官网</span><span data-small>fangguo.com</span></p>
    <div class="mascot guide" style="left:760px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '先用几个数字认识方果。' },
    { beat: 1, key: '10 万+', say: '方果累计服务的用户超过十万。' },
    { beat: 2, key: '70%', say: 'POD 行业的市场占有率超过七成。' },
    { beat: 3, key: '95%', say: '覆盖了九成五的印花行业。' },
    { beat: 4, key: '8 年', say: '我们只做这一件事，已经八年。' },
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
  chapter: '一、方果是谁',
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

/* 界面演示（招牌页）：一扇产品界面窗按拍「操作」起来，像在现场演示产品。
   1 拍：光标移到「一键拉单」点一下，订单一行行拉进来、行首的勾画出来；2 拍：光标点「批量审单」，底部出一行汇总；
   3 拍：右上角弹出「订单已全部到齐」，右边「2 小时」划掉、「3 分钟」顶上来，方方点赞（ok）。
   怎么写：窗口加 fg-demo；要「点」的元素写 data-fg-click="拍号"（光标跟着 data-now 移过去，0.6 秒）；列表一行 .fg-demo-row 带 data-beat；
   提示 .fg-toast 带 data-beat，留在版面上不消失。抄过去改哪里：标题栏、按钮、每一行的四格字、汇总、提示、右边的新旧对比。
   界面里的订单号和数字都是示例 */
Deck.add({
  id: 't-fangguo-demo',
  chapter: '二、核心能力',
  chapterShort: '多平台接单',
  topic: '现场演示',
  scene: 'fangguo',
  title: '一键拉单，几分钟就到齐',
  html: `
    <div class="abs fg-win fg-demo" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1180px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="cart"></i>订单中心 · 拉取订单<span data-small>今日 11:20</span></div>
      <div class="fg-demo-bar"><span class="fg-key" data-fg-click="1" data-small>一键拉单</span><i class="fg-search"></i><span class="fg-key fg-ghost" data-fg-click="2" data-small>批量审单</span></div>
      <div class="fg-demo-rows" data-small>
        <div class="fg-demo-row" data-beat="1"><i class="fg-chk"></i><b>TEMU-2311-0841</b><span>圆领 T 恤 · 白 · L</span><em>已拉取</em></div>
        <div class="fg-demo-row" data-beat="1"><i class="fg-chk"></i><b>SHEIN-7720-113</b><span>卫衣 · 黑 · M</span><em>已拉取</em></div>
        <div class="fg-demo-row" data-beat="1"><i class="fg-chk"></i><b>AMZ-5521-090</b><span>手机壳 · iPhone 16</span><em>已拉取</em></div>
        <div class="fg-demo-row" data-beat="1"><i class="fg-chk"></i><b>DY-8830-276</b><span>帆布包 · 米白</span><em>已拉取</em></div>
      </div>
      <p class="t-fangguo-demo-sum" data-beat="2" data-small>已审核 <b>2,296</b> 单 · 待处理 <b>22</b> 单（地址不全）</p>
      <span class="fg-toast" data-beat="3" data-small>订单已全部到齐</span>
    </div>
    <div class="abs t-fangguo-demo-r" data-beat="0" style="left:1380px;top:330px;width:420px">
      <p class="fg-kpi-l"><span data-small>拉单、审单用时</span></p>
      <p class="fg-vs t-fangguo-demo-vs"><s class="fg-old">2 小时</s><i class="fg-arrow"></i></p>
      <b class="fg-num fg-g fg-new t-fangguo-demo-new" data-beat="3" data-to="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".2" data-mascot-pose="ok">3<small>分钟</small></b>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '我们现场看一下，在方果里拉单是什么样子。' },
    { beat: 1, key: '一键拉单', say: '点一下一键拉单，各个平台的订单一行行进来，自动打勾。' },
    { beat: 2, key: '批量审单', say: '再点批量审单，两千多单审完，地址不全的二十几单单独拎出来。' },
    { beat: 3, key: '3 分钟', say: '订单全部到齐。以前拉单审单要两个小时，现在三分钟。' },
  ],
});

/* 套图（招牌页）：左边一张印花，一拍套一批商品——印花复制一份飞到商品的印花位置上落下，商品上的印花随后显出来。
   1 拍 T 恤（方方冒出灵感 idea），2 拍卫衣、手机壳、帆布包，3 拍马克杯、抱枕。
   怎么写：印花 <i class="fg-print"></i>（写宽高）；商品 <div class="fg-prod" data-fg-prod="tee" data-beat="1"><span>T 恤</span></div>，
   轮廓是 SVG：tee T 恤、hoodie 卫衣、case 手机壳、bag 帆布包、mug 马克杯、pillow 抱枕。
   抄过去改哪里：商品的种类、名字、拍号；一页 3–6 件为宜 */
Deck.add({
  id: 't-fangguo-mock',
  chapter: '二、核心能力',
  chapterShort: '自动套图',
  topic: '一张图套全款',
  scene: 'fangguo',
  title: '一张印花，自动套进全部商品',
  html: `
    <div class="abs t-fangguo-mock-src" data-beat="0" style="left:120px;top:300px;width:420px">
      <i class="fg-print" style="width:360px;height:360px"></i>
      <p class="fg-cap">一张印花（PNG）</p>
    </div>
    <i class="abs t-fangguo-mock-arrow" data-beat="0" style="left:560px;top:450px"></i>
    <div class="abs t-fangguo-mock-grid" style="left:700px;top:270px;width:1100px">
      <div class="fg-prod" data-fg-prod="tee" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="idea"><span>T 恤</span></div>
      <div class="fg-prod" data-fg-prod="hoodie" data-beat="2"><span>卫衣</span></div>
      <div class="fg-prod" data-fg-prod="case" data-beat="2"><span>手机壳</span></div>
      <div class="fg-prod" data-fg-prod="bag" data-beat="2"><span>帆布包</span></div>
      <div class="fg-prod" data-fg-prod="mug" data-beat="3"><span>马克杯</span></div>
      <div class="fg-prod" data-fg-prod="pillow" data-beat="3"><span>抱枕</span></div>
    </div>
    <div class="mascot guide" style="left:400px;top:780px"></div>`,
  notes: [
    { beat: 0, key: '一张印花', say: '再说套图。客户给你的，往往就是这样一张印花。' },
    { beat: 1, key: 'T 恤', say: '方果按订单的款式，自动把它套到 T 恤上，位置、尺寸都对齐。' },
    { beat: 2, key: '卫衣', say: '卫衣、手机壳、帆布包，不同版型一起生成。' },
    { beat: 3, key: '全部商品', say: '马克杯、抱枕也一样。一张印花，全部商品自动套好。' },
  ],
});

/* 订单流水线（招牌页）：四个工位第 0 拍就摆好（灰），一拍亮一站：图标变彩色、计数从 0 滚上来，
   一张订单卡沿轨道移到当前工位，轨道一段段填成品牌蓝；最后一站方方点赞（ok）。
   怎么写：<div class="fg-pipe"> 里放 .fg-st（图标、<b>工位名</b>、<p data-beat="n">计数和说明</p>），订单卡由风格补上，工位数自动算（最多 6 个）。
   抄过去改哪里：工位的图标、名字（4 个字以内）、计数（示例数字，换成你的）、说明 */
Deck.add({
  id: 't-fangguo-pipe',
  chapter: '二、核心能力',
  chapterShort: '智能生产',
  topic: '订单流水线',
  scene: 'fangguo',
  title: '订单进来，一路自动流到发货',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">每一站都由系统接力，数字实时更新</p>
    <div class="abs fg-pipe" style="left:120px;top:330px;width:1680px">
      <div class="fg-st" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".36" data-mascot-pose="idea"><i class="fg-ico" data-fg-ico="cart"></i><b>接单</b><p data-beat="1" data-small><b class="fg-num" data-to="2318">2,318</b>今日订单</p></div>
      <div class="fg-st" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".36"><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i><b>套图</b><p data-beat="2" data-small><b class="fg-num" data-to="2296">2,296</b>款自动生成</p></div>
      <div class="fg-st" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".36"><i class="fg-ico" data-fg-ico="shirt" data-fg-tone="amber"></i><b>生产</b><p data-beat="3" data-small><b class="fg-num" data-to="2280">2,280</b>件进生产批次</p></div>
      <div class="fg-st" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".36" data-mascot-pose="ok"><i class="fg-ico" data-fg-ico="truck" data-fg-tone="teal"></i><b>发货</b><p data-beat="4" data-small><b class="fg-num" data-to="2268">2,268</b>件当天发出</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '订单进来以后，在方果里是一条流水线。' },
    { beat: 1, key: '接单', say: '第一站接单，今天进来两千三百多单。' },
    { beat: 2, key: '套图', say: '第二站自动套图，两千两百多款图自动生成。' },
    { beat: 3, key: '生产', say: '第三站，生成的图直接进生产批次。' },
    { beat: 4, key: '发货', say: '最后一站发货，当天就发出去两千两百多件。' },
  ],
});

/* 聚焦框（招牌页）：一扇生产看板，一拍框住一处，四周压暗一点（字仍看得清），框 0.6 秒移过去；右边一拍出一句说明，讲完都留着。
   1 拍框住缺料的那一批（标红），2 拍框住机台，3 拍框住今日进度；方方在旁边想（think）。
   怎么写：要框的元素写 data-fg-focus="拍号"，放在 .fg-win（或 .fg-lensbox）里，聚焦框由风格补上。
   抄过去改哪里：看板里的表格（示例数据）、要框的位置、右边三句说明（每句标题 6 个字以内，说明 18 个字以内） */
Deck.add({
  id: 't-fangguo-lens',
  chapter: '二、核心能力',
  chapterShort: '智能生产',
  topic: '生产看板',
  scene: 'fangguo',
  title: '哪一批卡住了，一眼就看到',
  html: `
    <div class="abs fg-win t-fangguo-lens-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="shirt" data-fg-tone="amber"></i>生产看板<span data-small>3 号车间</span></div>
      <div class="t-fangguo-lens-t" data-small>
        <p class="t-fangguo-lens-h"><span>批次</span><span>款式</span><span>机台</span><span>进度</span></p>
        <p><b>B-1101</b><span>T 恤 · 白</span><span>DTG-01</span><span><i style="--v:1"></i>完成</span></p>
        <p><b>B-1102</b><span>卫衣 · 黑</span><span data-fg-focus="2">DTG-02</span><span><i style="--v:.72"></i>72%</span></p>
        <p data-fg-focus="1" class="t-fangguo-lens-bad"><b>B-1103</b><span>帆布包</span><span>热转印-01</span><span><i style="--v:.3"></i>缺料</span></p>
        <p><b>B-1104</b><span>手机壳</span><span>UV-01</span><span><i style="--v:.55"></i>55%</span></p>
      </div>
      <div class="t-fangguo-lens-sum" data-fg-focus="3" data-small><span>今日完成</span><b class="fg-num fg-g">82<small>%</small></b><span>预计 18:30 全部完成</span></div>
    </div>
    <div class="abs t-fangguo-lens-notes" style="left:1340px;top:280px;width:460px">
      <p data-beat="1"><b>缺料自动标红</b>B-1103 帆布包缺料，先停下补料</p>
      <p data-beat="2"><b>机台自动排产</b>空出来的机台马上接下一批</p>
      <p data-beat="3"><b>进度实时汇总</b>不用跑车间，也知道今天能不能交</p>
    </div>
    <div class="mascot guide" data-pose="think" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '生产这边，车间主任最常看的是这块生产看板。' },
    { beat: 1, key: '缺料', say: '先看这一行：帆布包这一批缺料，系统自动标红，先停下补料。' },
    { beat: 2, key: '排产', say: '机台空出来，系统马上把下一批排上去。' },
    { beat: 3, key: '82%', say: '今天的完成进度实时汇总，不用跑车间也知道能不能按时交。' },
  ],
});

/* 平台汇聚（招牌页）：十四个平台胶囊围成一圈，右半圈跨境、左半圈国内，一拍亮一半；
   每个胶囊亮起时，一条线从它画向中间的方果，一颗光点沿线流过去（只流一趟）；方方开心一下（happy）。
   怎么写：<div class="fg-hub" style="width;height"> 里放 <b class="fg-plt" data-beat="n">平台名</b>，风格按顺序从正上方顺时针排成一圈、补上连线和中间的方果；
   data-fg-rx、data-fg-ry 是圈的横竖半径（占宽高的百分比，默认 40）。抄过去改哪里：平台名和拍号（一圈 6–14 个为宜） */
Deck.add({
  id: 't-fangguo-hub',
  chapter: '四、合作与联系',
  chapterShort: '合作平台',
  topic: '已对接平台',
  scene: 'fangguo',
  title: '已对接 30+ 主流电商平台',
  html: `
    <div class="abs fg-hub t-fangguo-hub-hub" data-fg-rx="42" data-fg-ry="40" style="left:120px;top:220px;width:1680px;height:760px">
      <b class="fg-plt" data-beat="1">TEMU</b><b class="fg-plt" data-beat="1">SHEIN</b><b class="fg-plt" data-beat="1">亚马逊</b><b class="fg-plt" data-beat="1">TikTok</b><b class="fg-plt" data-beat="1">Shopee</b><b class="fg-plt" data-beat="1">Lazada</b><b class="fg-plt" data-beat="1">速卖通</b>
      <b class="fg-plt" data-beat="2">淘宝</b><b class="fg-plt" data-beat="2">拼多多</b><b class="fg-plt" data-beat="2">抖音</b><b class="fg-plt" data-beat="2">京东</b><b class="fg-plt" data-beat="2">小红书</b><b class="fg-plt" data-beat="2">1688</b><b class="fg-plt" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="happy">快手</b>
    </div>
    <p class="abs t-fangguo-hub-tag" data-beat="1" style="left:1560px;top:250px">跨境</p>
    <p class="abs t-fangguo-hub-tag" data-beat="2" style="left:240px;top:250px">国内</p>
    <div class="mascot guide" style="left:1660px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '最后说说合作平台。' },
    { beat: 1, key: '跨境', say: '跨境这边，TEMU、SHEIN、亚马逊、TikTok、Shopee、Lazada、速卖通都已对接。' },
    { beat: 2, key: '国内', say: '国内的淘宝、拼多多、抖音、京东、小红书、1688、快手也都接好了，加起来三十多个平台。' },
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
