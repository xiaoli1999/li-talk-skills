/* 方果 ERP 客户演讲 · 第一部分：封面、行业痛点、方果是谁、核心能力的章节页（p01–p07）
   经营数字、案例除了官网数字（10 万+ 用户、市场占有率超 70%、覆盖 95% 印花行业、专注 8 年）以外都是示例数字 */

/* p01 封面：出血底板 + 放大的界面窗 + 倾斜浮窗 + 折角标签（示例数字：订单中心的两个数、98%） */
Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: 'fangguo',
  title: '方果 ERP：POD 工厂的一站式生产系统',
  noTitle: true,
  html: `
    <i class="fg-bleed" hidden></i>
    <div class="abs fg-cover" data-beat="0" style="left:150px;top:220px;width:860px">
      <span class="fg-chip">方果 ERP · 客户方案</span>
      <h1 class="fg-hero p01-h">POD 工厂的<br><span class="fg-red">一站式</span>生产系统</h1>
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

/* p02 金句页（浅色）：一页只放一个问题，拍 1 补一句来由，拍 2 亮出三个痛点关键词 */
Deck.add({
  id: 'p02',
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
    <p class="abs p02-tags" data-beat="2" data-stagger=".1" style="left:150px;top:770px"><span>接单乱</span><span>套图慢</span><span>错发漏发</span></p>
    <i class="abs fg-deco" style="left:1220px;top:200px;width:620px"></i>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '越乱', say: '先问大家一个问题：订单越来越多，工厂是不是反而越来越乱？' },
    { beat: 1, say: '这是我们走访 POD 工厂时，听到最多的一句话。' },
    { beat: 2, key: '接单乱', say: '乱在哪？基本就是三件事：接单乱、套图慢、错发漏发。' },
  ],
});

/* p03 三个痛点：三张卡依次出现，当前这张描边变蓝；底部大数字是示例数字 */
Deck.add({
  id: 'p03',
  chapter: '引子',
  chapterShort: '行业痛点',
  topic: '三件头疼事',
  scene: 'fangguo',
  title: '工厂最头疼的三件事',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">订单量一上来，问题就全冒出来</p>
    <div class="abs fg-feats" style="left:120px;top:290px;width:1680px;--gap:36px">
      <div class="fg-fc" data-beat="1"><i class="fg-ico" data-fg-ico="layers" data-fg-tone="coral"></i><h4>接单乱</h4><p>8 个平台 8 个后台，来回切换、导表</p><div class="fg-fc-m"><b class="fg-num" data-to="8">8<small>个后台</small></b></div></div>
      <div class="fg-fc" data-beat="2"><i class="fg-ico" data-fg-ico="img" data-fg-tone="amber"></i><h4>套图慢</h4><p>设计师一张张套，一款图要 20 分钟</p><div class="fg-fc-m"><b class="fg-num" data-to="20">20<small>分钟 / 款</small></b></div></div>
      <div class="fg-fc" data-beat="3"><i class="fg-ico" data-fg-ico="truck" data-fg-tone="red"></i><h4>错发漏发</h4><p>人工核对面单，旺季错单不断</p><div class="fg-fc-m"><b class="fg-num" data-to="3">3<small>% 错发率</small></b></div></div>
    </div>
    <div class="mascot guide" data-pose="think" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '具体来说，订单量一上来，问题就全冒出来。' },
    { beat: 1, key: '接单乱', say: '第一，接单乱。八个平台八个后台，每天来回切换、导表。' },
    { beat: 2, key: '套图慢', say: '第二，套图慢。设计师一张张套，一款图要二十分钟。' },
    { beat: 3, key: '错发漏发', say: '第三，错发漏发。面单靠人核对，旺季错单不断。这几个数是我们调研时的典型情况。' },
  ],
});

/* p04 以前的一天：右边一条时间线一拍一行，最后左边超大的「23:40」按位滚上来，方方累得打盹（rest）。示例场景 */
Deck.add({
  id: 'p04',
  chapter: '引子',
  chapterShort: '行业痛点',
  topic: '以前的一天',
  scene: 'fangguo',
  title: '以前的一天，从早忙到深夜',
  html: `
    <span class="abs fg-chip" data-beat="0" style="left:120px;top:250px">一位设计师的一天（示例）</span>
    <div class="abs p04-big" data-beat="4" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".62" data-mascot-pose="rest" style="left:120px;top:350px">
      <b class="fg-num fg-g fg-odo p04-clock">23:40</b>
      <p class="fg-cap">还在一张张套图</p>
    </div>
    <div class="abs p04-tl" style="left:1060px;top:270px;width:740px">
      <p data-beat="1"><b class="fg-num">09:00</b><span>导出 8 个平台的订单</span></p>
      <p data-beat="2"><b class="fg-num">14:00</b><span>人工审单、改尺码</span></p>
      <p data-beat="3"><b class="fg-num">20:00</b><span>还有 600 款图没套完</span></p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '我们跟一位设计师过了一天，看看以前是怎么忙的。' },
    { beat: 1, key: '09:00', say: '早上九点，先把八个平台的订单一个个导出来。' },
    { beat: 2, key: '14:00', say: '下午两点，人工审单，改尺码、改备注。' },
    { beat: 3, key: '20:00', say: '晚上八点，还有六百款图没套完。' },
    { beat: 4, key: '23:40', say: '夜里十一点四十，还在一张张套图。这样的工厂，订单越多越累。' },
  ],
});

/* p05 章节页：PART 01 方果是谁（超大编号 + 目录） */
Deck.add({
  id: 'p05',
  chapter: '一、方果是谁',
  chapterShort: '第一部分',
  topic: '方果是谁',
  scene: 'fangguo',
  title: '方果是谁',
  noTitle: true,
  html: `
    <b class="abs fg-num fg-g fg-bigno" data-beat="0" style="left:110px;top:260px">01</b>
    <div class="abs fg-chapter" data-beat="1" style="left:820px;top:330px;width:960px">
      <p class="fg-part" data-small>PART 01</p>
      <h1>方果是谁</h1>
      <p>一家只做 POD 的 SaaS ERP 公司</p>
    </div>
    <p class="abs fg-toc" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="idle" style="left:820px;top:860px"><span class="on"><b>01</b>方果是谁</span><span><b>02</b>核心能力</span><span><b>03</b>客户和效果</span><span><b>04</b>合作与联系</span></p>
    <div class="mascot guide" style="left:1640px;top:300px"></div>`,
  notes: [
    { beat: 0, say: '那方果能做什么？先说说我们是谁。' },
    { beat: 1, say: '方果是一家只做 POD 的 SaaS ERP 公司。' },
    { beat: 2, say: '接下来分四部分：方果是谁、核心能力、客户和效果、合作与联系。' },
  ],
});

/* p06 官网数字：超大主数字按位滚上来（方方 wow），右边三张小卡错开成台阶。数字取自方果官网 */
Deck.add({
  id: 'p06',
  chapter: '一、方果是谁',
  chapterShort: '方果是谁',
  topic: '用数字说话',
  scene: 'fangguo',
  title: '专注 POD 的 SaaS ERP',
  html: `
    <div class="abs" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="wow" data-mascot-dy="-40" style="left:120px;top:280px">
      <b class="fg-num fg-g fg-odo p06-n">10<small>万+</small></b>
      <p class="fg-cap">累计服务用户</p>
    </div>
    <div class="abs col p06-side" style="left:1100px;top:270px;width:700px;--gap:26px">
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

/* p07 章节页（斜切分区）：PART 02 核心能力。左边章节名和超大编号，右边斜切的浅蓝底板上五个能力一行一个 */
Deck.add({
  id: 'p07',
  chapter: '二、核心能力',
  chapterShort: '第二部分',
  topic: '核心能力',
  scene: 'fangguo',
  title: '五个核心能力',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-slant" hidden></i>
    <div class="abs fg-chapter" data-beat="1" style="left:150px;top:220px;width:760px">
      <p class="fg-part" data-small>PART 02</p>
      <h1>五个核心能力</h1>
      <p>从订单进门，到包裹出门</p>
    </div>
    <b class="abs fg-num fg-g fg-bigno p07-no" data-beat="0" style="left:130px;top:560px">02</b>
    <div class="abs p07-list" data-beat="2" data-stagger=".08" data-mascot="2" data-mascot-side="left" data-mascot-pose="point" style="left:1240px;top:230px;width:560px">
      <p><i class="fg-ico" data-fg-ico="layers"></i>多平台接单</p>
      <p><i class="fg-ico" data-fg-ico="img" data-fg-tone="purple"></i>自动套图</p>
      <p><i class="fg-ico" data-fg-ico="shirt" data-fg-tone="amber"></i>智能生产</p>
      <p><i class="fg-ico" data-fg-ico="truck" data-fg-tone="teal"></i>仓储发货</p>
      <p><i class="fg-ico" data-fg-ico="chart" data-fg-tone="coral"></i>数据看板</p>
    </div>
    <div class="mascot guide" style="left:1000px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '进入第二部分。' },
    { beat: 1, say: '方果的核心能力，从订单进门，到包裹出门。' },
    { beat: 2, key: '五个', say: '一共五块：多平台接单、自动套图、智能生产、仓储发货、数据看板。我们一个个看。' },
  ],
});
