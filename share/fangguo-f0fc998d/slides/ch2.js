/* 方果 ERP 客户演讲 · 第二部分：核心能力（p08–p16）。界面里的订单号、数量、效率数字都是示例数字 */

/* p08 产品界面一览 · 截图叠放（没有数字，大图为主）：右边三张真实的产品界面截图错落叠在一起，一拍出一张，
   当前讲的那张浮到最上面、放大一点、外面一圈品牌蓝；左边一拍一条功能说明。图片取自方果官网「工具箱」，点开能看大图 */
Deck.add({
  id: 'p08',
  chapter: '二、核心能力',
  chapterShort: '产品一览',
  topic: '方果工具箱',
  scene: 'fangguo',
  title: '一套工具箱，覆盖整条链路',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">打开就能用的产品界面，下面是其中三件</p>
    <div class="abs p08-list" style="left:120px;top:300px;width:540px">
      <div data-beat="1"><i class="fg-ico" data-fg-ico="cart"></i><div><b>上架工具</b><p>多平台采集，AI 写标题</p></div></div>
      <div data-beat="2"><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i><div><b>套图工具</b><p>自动、手动、本地套图</p></div></div>
      <div data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".3" data-mascot-pose="idea"><i class="fg-ico" data-fg-ico="box" data-fg-tone="teal"></i><div><b>方果 PDA</b><p>扫码入库、生产拣货</p></div></div>
    </div>
    <div class="abs fg-stack" style="left:700px;top:250px;width:1100px;height:740px">
      <figure class="shot" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point" data-src="素材/上架工具.png" data-caption="上架工具" style="left:0;top:40px;width:760px;--ar:512/375;--fit:contain;--r:-1.5deg"></figure>
      <figure class="shot" data-beat="2" data-src="素材/套图工具.png" data-caption="套图工具" style="left:640px;top:0;width:460px;--ar:512/375;--fit:contain;--r:1.5deg"></figure>
      <figure class="shot" data-beat="3" data-src="素材/方果PDA.png" data-caption="方果 PDA" style="left:680px;top:380px;width:420px;--ar:512/375;--fit:contain;--r:-1deg"></figure>
    </div>
    <div class="mascot guide" style="left:440px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '这些能力，都落在一套打开就能用的工具箱里。挑三件给大家看看。' },
    { beat: 1, key: '上架工具', say: '第一件是上架工具：多个平台的商品一键采集过来，标题让 AI 批量写好。' },
    { beat: 2, key: '套图工具', say: '第二件是套图工具，自动套、手动套、本地套，三种方式都支持。' },
    { beat: 3, key: '方果 PDA', say: '第三件是方果 PDA，车间里拿着它扫码入库、生产拣货、批次出库。' },
  ],
});

/* p09 多平台接单 · 平台汇聚：右边平台胶囊一圈圈亮起，各自一条线、一颗光点流向中间的方果；最后左边亮出「30+ 平台」 */
Deck.add({
  id: 'p09',
  chapter: '二、核心能力',
  chapterShort: '多平台接单',
  topic: '订单自动汇总',
  scene: 'fangguo',
  title: '几十个平台的订单，汇到一处',
  html: `
    <div class="abs p09-l" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".1" style="left:120px;top:320px;width:620px">
      <b class="fg-num fg-g fg-odo p09-n">30<small>+ 平台</small></b>
      <p class="fg-cap">跨境、国内平台的订单，自动拉到方果里，不用再一个个后台导表</p>
    </div>
    <div class="abs fg-hub" style="left:820px;top:240px;width:980px;height:720px">
      <b class="fg-plt" data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="point">TEMU</b><b class="fg-plt" data-beat="1">SHEIN</b><b class="fg-plt" data-beat="1">亚马逊</b><b class="fg-plt" data-beat="1">TikTok</b>
      <b class="fg-plt" data-beat="2">淘宝</b><b class="fg-plt" data-beat="2">拼多多</b><b class="fg-plt" data-beat="2">抖音</b><b class="fg-plt" data-beat="2">京东</b>
    </div>
    <div class="mascot guide" style="left:600px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '先说接单。工厂的订单来自几十个平台。' },
    { beat: 1, key: '跨境', say: 'TEMU、SHEIN、亚马逊、TikTok 这些跨境平台的订单，自动流进方果。' },
    { beat: 2, key: '国内', say: '淘宝、拼多多、抖音、京东这些国内平台也一样。' },
    { beat: 3, key: '30+', say: '一共对接了三十多个平台，不用再一个个后台导表。' },
  ],
});

/* p10 多平台接单 · 界面演示：光标点「一键拉单」，订单一行行拉进来打勾；再点「批量审单」，底部汇总出来；右上角弹出「订单已全部到齐」 */
Deck.add({
  id: 'p10',
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
      <p class="p10-sum" data-beat="2" data-small>已审核 <b>2,296</b> 单 · 待处理 <b>22</b> 单（地址不全）</p>
      <span class="fg-toast" data-beat="3" data-small>订单已全部到齐</span>
    </div>
    <div class="abs p10-r" data-beat="0" style="left:1380px;top:330px;width:420px">
      <p class="fg-kpi-l"><span data-small>拉单、审单用时</span></p>
      <p class="fg-vs p10-vs"><s class="fg-old">2 小时</s><i class="fg-arrow"></i></p>
      <b class="fg-num fg-g fg-new p10-new" data-beat="3" data-to="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".2" data-mascot-pose="ok">3<small>分钟</small></b>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '我们现场看一下，在方果里拉单是什么样子。' },
    { beat: 1, key: '一键拉单', say: '点一下一键拉单，各个平台的订单一行行进来，自动打勾。' },
    { beat: 2, key: '批量审单', say: '再点批量审单，两千多单审完，地址不全的二十几单单独拎出来。' },
    { beat: 3, key: '3 分钟', say: '订单全部到齐。以前拉单审单要两个小时，现在三分钟。' },
  ],
});

/* p11 自动套图 · 套图：左边一张印花，一拍套一件（印花飞到商品上落下）：T 恤 → 卫衣、手机壳、帆布包 → 马克杯、抱枕 */
Deck.add({
  id: 'p11',
  chapter: '二、核心能力',
  chapterShort: '自动套图',
  topic: '一张图套全款',
  scene: 'fangguo',
  title: '一张印花，自动套进全部商品',
  html: `
    <div class="abs p11-src" data-beat="0" style="left:120px;top:300px;width:420px">
      <i class="fg-print" style="width:360px;height:360px"></i>
      <p class="fg-cap">一张印花（PNG）</p>
    </div>
    <i class="abs p11-arrow" data-beat="0" style="left:560px;top:450px"></i>
    <div class="abs p11-grid" style="left:700px;top:270px;width:1100px">
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

/* p12 自动套图 · 新旧对比（斜切分区）：左边「20 分钟」划掉、「10 秒」顶上来，右边斜切底板上两张指标卡依次出现 */
Deck.add({
  id: 'p12',
  chapter: '二、核心能力',
  chapterShort: '自动套图',
  topic: '效果',
  scene: 'fangguo',
  title: '一款图：20 分钟变成 10 秒',
  html: `
    <i class="fg-bleed fg-slant" hidden></i>
    <span class="abs fg-chip" data-beat="0" style="left:120px;top:250px">自动套图上线后（示例）</span>
    <p class="abs fg-vs p12-vs" data-beat="0" data-mascot="1" data-mascot-side="bottom" data-mascot-x=".55" data-mascot-pose="wow" style="left:120px;top:380px">
      <s class="fg-old">20 分钟</s><i class="fg-arrow"></i><b class="fg-num fg-g fg-new" data-beat="1" data-to="10">10<small>秒</small></b>
    </p>
    <div class="abs fg-kpi" data-beat="2" style="left:1300px;top:270px;width:500px">
      <p class="fg-kpi-l"><span data-small>自动套图覆盖率</span><i class="fg-ico fg-ico-s" data-fg-ico="img" data-fg-tone="purple"></i></p>
      <div class="row" style="--gap:28px;--align:center;margin-top:16px"><div class="fg-ring" data-fg-ring="90" data-fg-tone="purple" style="width:150px;height:150px"><b class="fg-num" style="font-size:48px">90<small>%</small></b></div><p class="p12-t" data-small>九成订单不用人工套图</p></div>
    </div>
    <div class="abs fg-kpi" data-beat="3" style="left:1300px;top:600px;width:500px">
      <p class="fg-kpi-l"><span data-small>套图设计师</span><i class="fg-ico fg-ico-s" data-fg-ico="users" data-fg-tone="teal"></i></p>
      <b class="fg-num fg-odo">12<small>人 → 2 人</small></b>
      <p class="fg-delta" data-small>▼ 省下的人去做新款</p>
    </div>
    <div class="mascot guide" style="left:880px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '效果有多明显？以前一款图要二十分钟。' },
    { beat: 1, key: '10 秒', say: '现在十秒。' },
    { beat: 2, key: '90%', say: '九成订单已经完全不用人工套图。' },
    { beat: 3, key: '2 人', say: '原来十二个套图设计师，现在两个人就够，省下的人去做新款。' },
  ],
});

/* p13 智能生产 · 订单流水线：四个工位第 0 拍就摆好，一拍亮一站，订单卡沿轨道往前走，计数滚上来 */
Deck.add({
  id: 'p13',
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

/* p14 智能生产 · 聚焦框：一扇生产看板，一拍框住一处（缺料的批次 → 机台排产 → 今日进度），四周压暗；右边一拍一句说明 */
Deck.add({
  id: 'p14',
  chapter: '二、核心能力',
  chapterShort: '智能生产',
  topic: '生产看板',
  scene: 'fangguo',
  title: '哪一批卡住了，一眼就看到',
  html: `
    <div class="abs fg-win p14-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="shirt" data-fg-tone="amber"></i>生产看板<span data-small>3 号车间</span></div>
      <div class="p14-t" data-small>
        <p class="p14-h"><span>批次</span><span>款式</span><span>机台</span><span>进度</span></p>
        <p><b>B-1101</b><span>T 恤 · 白</span><span>DTG-01</span><span><i style="--v:1"></i>完成</span></p>
        <p><b>B-1102</b><span>卫衣 · 黑</span><span data-fg-focus="2">DTG-02</span><span><i style="--v:.72"></i>72%</span></p>
        <p data-fg-focus="1" class="p14-bad"><b>B-1103</b><span>帆布包</span><span>热转印-01</span><span><i style="--v:.3"></i>缺料</span></p>
        <p><b>B-1104</b><span>手机壳</span><span>UV-01</span><span><i style="--v:.55"></i>55%</span></p>
      </div>
      <div class="p14-sum" data-fg-focus="3" data-small><span>今日完成</span><b class="fg-num fg-g">82<small>%</small></b><span>预计 18:30 全部完成</span></div>
    </div>
    <div class="abs p14-notes" style="left:1340px;top:280px;width:460px">
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

/* p15 仓储发货：左边三步一拍一步点亮，右边出血底板上一张白卡，错发率「3%」划掉、「0.1%」顶上来 */
Deck.add({
  id: 'p15',
  chapter: '二、核心能力',
  chapterShort: '仓储发货',
  topic: '扫码分拣',
  scene: 'fangguo',
  title: '扫码分拣，错发漏发降下来',
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-flow" style="left:120px;top:270px;width:800px">
      <div class="fg-step"><div><h4>扫码出库</h4><p data-beat="1">生产完一扫，系统自动对上订单</p></div></div>
      <div class="fg-step"><div><h4>自动分拣</h4><p data-beat="2">一单多件自动归到同一个格口</p></div></div>
      <div class="fg-step"><div><h4>面单匹配</h4><p data-beat="3">按平台、按渠道自动打面单</p></div></div>
    </div>
    <div class="abs card p15-card" data-beat="0" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".64" data-mascot-pose="ok" style="left:1120px;top:300px;width:680px">
      <p class="fg-ch">错发率<span data-small>旺季平均（示例）</span></p>
      <p class="fg-vs p15-vs"><s class="fg-old">3%</s><i class="fg-arrow"></i><b class="fg-num fg-g fg-new" data-beat="4">0.1<small>%</small></b></p>
      <p class="p15-t">扫码到格口、面单自动匹配，人不用再一张张核对</p>
    </div>
    <div class="mascot guide" style="left:930px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '最后一公里是仓储发货，错发漏发都出在这里。' },
    { beat: 1, key: '扫码出库', say: '生产完一扫码，系统自动对上是哪一单。' },
    { beat: 2, key: '自动分拣', say: '一单多件，自动归到同一个格口。' },
    { beat: 3, key: '面单匹配', say: '面单按平台、按渠道自动打出来。' },
    { beat: 4, key: '0.1%', say: '旺季错发率从百分之三降到千分之一。' },
  ],
});

/* p16 数据看板（密页）：上面四张指标卡（数字按位滚），左下趋势线、右下柱状图依次出来 */
Deck.add({
  id: 'p16',
  chapter: '二、核心能力',
  chapterShort: '数据看板',
  topic: '经营数据',
  scene: 'fangguo',
  title: '老板每天打开看一眼就够',
  html: `
    <div class="abs grid" data-beat="1" data-stagger=".08" style="left:120px;top:240px;width:1680px;--cols:4;--gap:30px">
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>今日订单</span><i class="fg-ico fg-ico-s" data-fg-ico="cart"></i></p><b class="fg-num fg-g fg-odo p16-n">2,318</b><p class="fg-delta" data-small>▲ 环比 +12%</p></div>
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>准时发货率</span><i class="fg-ico fg-ico-s" data-fg-ico="truck" data-fg-tone="teal"></i></p><b class="fg-num fg-odo p16-n">98<small>%</small></b><p class="fg-delta" data-small>▲ +6 个点</p></div>
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>人均日产</span><i class="fg-ico fg-ico-s" data-fg-ico="users" data-fg-tone="purple"></i></p><b class="fg-num fg-odo p16-n">186<small>件</small></b><p class="fg-delta" data-small>▲ +60%</p></div>
      <div class="fg-kpi"><p class="fg-kpi-l"><span data-small>售后率</span><i class="fg-ico fg-ico-s" data-fg-ico="shield" data-fg-tone="coral"></i></p><b class="fg-num fg-odo p16-n">0.4<small>%</small></b><p class="fg-delta" data-small>▼ −1.2 个点</p></div>
    </div>
    <div class="abs card" data-beat="2" style="left:120px;top:540px;width:1000px">
      <p class="fg-ch">日均订单<span data-small>单位：单</span></p>
      <div class="fg-line" data-fg-line="1480,1530,1610,1700,1760,1850,1960,2080,2190,2318" data-fg-labels="6 月,,,7 月,,,8 月,,,9 月" data-fg-end="2,318" style="height:220px;margin-top:22px"></div>
    </div>
    <div class="abs card" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="happy" style="left:1160px;top:540px;width:640px">
      <p class="fg-ch">各平台订单<span data-small>本周</span></p>
      <div class="fg-bars" data-fg-bars="820,610,430,280,178" data-fg-labels="TEMU,SHEIN,亚马逊,抖音,淘宝" data-fg-hi="1" style="height:270px;margin-top:14px"></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '所有这些数据，最后都汇到一块看板上。' },
    { beat: 1, key: '今日订单', say: '今天多少单、准时发了多少、人均做了多少、售后多少，一眼就看到。' },
    { beat: 2, key: '日均订单', say: '日均订单这几个月一直在往上走。' },
    { beat: 3, key: 'TEMU', say: '哪个平台的单最多也一目了然，老板每天打开看一眼就够。' },
  ],
});
