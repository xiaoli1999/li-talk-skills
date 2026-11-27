/* 方果 ERP 客户演讲 · 第三部分：客户案例、效果数据、合作平台、我们的理念、走进方果、关于我们、结尾（p17–p23）
   案例和效果数据是示例；关于我们的公司信息、二维码、电话、地址是真实信息（公司信息.md） */

/* p17 客户案例（示例）：左边一张大引言卡，右边三行新旧对比一拍一行（旧的划掉、新的顶上来） */
Deck.add({
  id: 'p17',
  chapter: '三、客户和效果',
  chapterShort: '客户案例',
  topic: '一家服装工厂',
  scene: 'fangguo',
  title: '一家 POD 服装工厂的变化',
  html: `
    <div class="abs card p17-q" data-beat="0" style="left:120px;top:260px;width:760px">
      <p class="p17-say">以前 12 个人套图，<br>现在 2 个人就够了。</p>
      <p class="p17-by" data-small>某 POD 服装工厂 厂长（示例案例）</p>
    </div>
    <div class="abs p17-rows" style="left:980px;top:260px;width:820px">
      <div><span data-small>套图人力</span><p class="fg-vs"><s class="fg-old">12 人</s><i class="fg-arrow"></i><b class="fg-num fg-g fg-new" data-beat="1" data-to="2" data-mascot="1" data-mascot-side="right" data-mascot-pose="point">2<small>人</small></b></p></div>
      <div><span data-small>日发货</span><p class="fg-vs"><s class="fg-old">3,000 件</s><i class="fg-arrow"></i><b class="fg-num fg-g fg-new" data-beat="2" data-to="8000">8,000<small>件</small></b></p></div>
      <div><span data-small>错发率</span><p class="fg-vs"><s class="fg-old">3%</s><i class="fg-arrow"></i><b class="fg-num fg-g fg-new" data-beat="3">0.2<small>%</small></b></p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '说一个客户的例子。这是一家做 POD 服装的工厂，厂长原话是：以前十二个人套图，现在两个人就够了。' },
    { beat: 1, key: '2 人', say: '套图从十二个人减到两个人。' },
    { beat: 2, key: '8,000', say: '每天发货从三千件涨到八千件。' },
    { beat: 3, key: '0.2%', say: '错发率从百分之三降到千分之二。' },
  ],
});

/* p18 效果数据：四个大数字横排，竖线隔开，一拍一个按位滚上来，最后一个方方惊讶（wow）。示例数字 */
Deck.add({
  id: 'p18',
  chapter: '三、客户和效果',
  chapterShort: '效果数据',
  topic: '四个数',
  scene: 'fangguo',
  title: '用上方果之后，四个数都变了',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">来自 500 家客户上线前后的平均值（示例）</p>
    <div class="abs p18-row" style="left:120px;top:380px;width:1680px">
      <div data-beat="1"><b class="fg-num fg-g fg-odo">60<small>%</small></b><p>人效提升</p></div>
      <div data-beat="2"><b class="fg-num fg-g fg-odo">90<small>%</small></b><p>出错减少</p></div>
      <div data-beat="3"><b class="fg-num fg-g fg-odo">3<small>倍</small></b><p>日处理订单</p></div>
      <div data-beat="4" data-mascot="4" data-mascot-side="bottom" data-mascot-x=".3" data-mascot-pose="wow"><b class="fg-num fg-g fg-odo">91<small>%</small></b><p>客户续费率</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '我们统计了五百家客户上线前后的变化。' },
    { beat: 1, key: '60%', say: '人效平均提升百分之六十。' },
    { beat: 2, key: '90%', say: '出错减少九成。' },
    { beat: 3, key: '3 倍', say: '每天能处理的订单是原来的三倍。' },
    { beat: 4, key: '91%', say: '所以客户续费率有百分之九十一。' },
  ],
});

/* p19 合作平台 · 平台汇聚（整页）：十四个平台围成一圈，右半圈跨境、左半圈国内，一拍亮一半，光点沿线流进中间的方果 */
Deck.add({
  id: 'p19',
  chapter: '四、合作与联系',
  chapterShort: '合作平台',
  topic: '已对接平台',
  scene: 'fangguo',
  title: '已对接 30+ 主流电商平台',
  html: `
    <div class="abs fg-hub p19-hub" data-fg-rx="42" data-fg-ry="40" style="left:120px;top:220px;width:1680px;height:760px">
      <b class="fg-plt" data-beat="1">TEMU</b><b class="fg-plt" data-beat="1">SHEIN</b><b class="fg-plt" data-beat="1">亚马逊</b><b class="fg-plt" data-beat="1">TikTok</b><b class="fg-plt" data-beat="1">Shopee</b><b class="fg-plt" data-beat="1">Lazada</b><b class="fg-plt" data-beat="1">速卖通</b>
      <b class="fg-plt" data-beat="2">淘宝</b><b class="fg-plt" data-beat="2">拼多多</b><b class="fg-plt" data-beat="2">抖音</b><b class="fg-plt" data-beat="2">京东</b><b class="fg-plt" data-beat="2">小红书</b><b class="fg-plt" data-beat="2">1688</b><b class="fg-plt" data-beat="2" data-mascot="2" data-mascot-side="stay" data-mascot-pose="happy">快手</b>
    </div>
    <p class="abs p19-tag" data-beat="1" style="left:1560px;top:250px">跨境</p>
    <p class="abs p19-tag" data-beat="2" style="left:240px;top:250px">国内</p>
    <div class="mascot guide" style="left:1660px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '最后说说合作平台。' },
    { beat: 1, key: '跨境', say: '跨境这边，TEMU、SHEIN、亚马逊、TikTok、Shopee、Lazada、速卖通都已对接。' },
    { beat: 2, key: '国内', say: '国内的淘宝、拼多多、抖音、京东、小红书、1688、快手也都接好了，加起来三十多个平台。' },
  ],
});

/* p20 我们的理念 · 价值观网格（没有数字，文字为主）：六条价值观排成编辑式的错落网格，不做卡片；关键词第 0 拍就在，
   一拍点亮两条：说明出现、顶上的细线铺成品牌蓝、关键词变蓝。价值观来自公司信息.md，说明照官网的价值观缩成一句 */
Deck.add({
  id: 'p20',
  chapter: '四、合作与联系',
  chapterShort: '我们的理念',
  topic: '价值观',
  scene: 'fangguo',
  title: '我们相信的六件事',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">满怀理想，脚踏实地</p>
    <div class="abs fg-values" style="left:120px;top:290px;width:1680px">
      <div class="fg-val"><i></i><b>长期主义</b><p data-beat="1">长期价值和短期利益，选长期</p></div>
      <div class="fg-val"><i></i><b>用户第一</b><p data-beat="1">忧用户之忧，急用户之急</p></div>
      <div class="fg-val"><i></i><b>技术驱动</b><p data-beat="2">用技术和 AI 推动智能化生产</p></div>
      <div class="fg-val"><i></i><b>共赢</b><p data-beat="2">和客户、伙伴、团队一起分享成果</p></div>
      <div class="fg-val" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok"><i></i><b>进取</b><p data-beat="3">有进取心的人，是我们前进的动力</p></div>
      <div class="fg-val"><i></i><b>成长</b><p data-beat="3">不怕困难和改变，不断更新自己</p></div>
    </div>
    <div class="mascot guide" data-pose="think" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '说完产品，说说我们是一群什么样的人。我们相信六件事。' },
    { beat: 1, key: '长期主义', say: '长期主义：长期价值和短期利益之间，我们选长期。用户第一：忧用户之忧，急用户之急。' },
    { beat: 2, key: '技术驱动', say: '技术驱动：用技术和 AI 推动智能化生产。共赢：和客户、伙伴、团队一起分享成果。' },
    { beat: 3, key: '成长', say: '进取和成长：有进取心的人是我们的动力，不怕困难、不怕改变，不断更新自己。' },
  ],
});

/* p21 走进方果 · 图文拼贴（没有数字，图文混排）：左边一段公司介绍，右边办公环境照片拼在一起——同一张横幅照片用 --pos 裁成
   办公楼、天台花园、大堂三块，再叠一张公司文化；一拍出一组。照片取自方果官网，点开能看大图 */
Deck.add({
  id: 'p21',
  chapter: '四、合作与联系',
  chapterShort: '走进方果',
  topic: '团队与办公环境',
  scene: 'fangguo',
  title: '走进方果',
  noTitle: true,
  html: `
    <div class="abs p21-text" data-beat="0" style="left:120px;top:200px;width:580px">
      <span class="fg-chip">走进方果</span>
      <h1>在深圳天安云谷，<br>做 POD 的软件</h1>
      <p>我们是深圳市渔童科技有限公司，一群做柔性制造、智能化生产的人。业务覆盖电商、生产、打印、数码、服饰，和客户一起把按需生产做成规模生意。</p>
    </div>
    <div class="abs fg-collage" style="left:760px;top:180px;width:1040px;height:820px">
      <figure class="shot" data-beat="1" data-src="素材/办公环境.png" data-caption="办公楼" style="left:20px;top:20px;width:520px;--ar:3/4;--pos:50% 50%"></figure>
      <figure class="shot" data-beat="2" data-src="素材/办公环境.png" data-caption="天台花园" style="left:600px;top:0;width:440px;--ar:4/3;--pos:0% 50%"></figure>
      <figure class="shot" data-beat="2" data-src="素材/办公环境.png" data-caption="大堂" style="left:600px;top:400px;width:440px;--ar:4/3;--pos:100% 50%"></figure>
      <figure class="shot" data-beat="3" data-mascot="3" data-mascot-side="bottom" data-mascot-x=".1" data-mascot-dx="-170" data-mascot-pose="happy" data-src="素材/公司文化.png" data-caption="公司文化" style="left:-60px;top:420px;width:340px;--ar:16/9;--pos:50% 0%"></figure>
    </div>
    <div class="mascot guide" style="left:300px;top:840px"></div>`,
  notes: [
    { beat: 0, say: '最后请大家走进方果看看。我们在深圳天安云谷，做 POD 行业的软件。' },
    { beat: 1, key: '办公楼', say: '这是我们所在的办公楼。' },
    { beat: 2, key: '天台花园', say: '楼顶有天台花园，楼下是大堂。' },
    { beat: 3, key: '公司文化', say: '在这里，不论资排辈，只凭实力，简单直接，敢于尝试。欢迎来坐坐。' },
  ],
});

/* p22 关于我们：真实的公司信息、官网数字、三张二维码、电话和地址 */
Deck.add({
  id: 'p22',
  chapter: '四、合作与联系',
  chapterShort: '关于我们',
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
      <div><b class="fg-num fg-g fg-odo">10<small>万+</small></b><p data-small>服务用户</p></div>
      <div><b class="fg-num fg-g fg-odo">70<small>%+</small></b><p data-small>POD 市场占有率</p></div>
      <div><b class="fg-num fg-g fg-odo">8<small>年</small></b><p data-small>专注 POD</p></div>
    </div>
    <div class="abs fg-qrs" data-beat="2" data-stagger=".08" style="left:998px;top:190px">
      <div class="fg-qr" data-fg-qr="wechat"><span data-small>公众号</span></div>
      <div class="fg-qr" data-fg-qr="douyin"><span data-small>抖音号</span></div>
      <div class="fg-qr" data-fg-qr="business"><span data-small>商务合作</span></div>
    </div>
    <div class="abs fg-contact" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".78" data-mascot-pose="idle" style="left:998px;top:530px;width:802px">
      <p><b>电话</b><span>400-996-5359</span></p>
      <p><b>官网</b><span>fangguo.com</span></p>
      <p><b>地址</b><span>深圳市龙岗区坂田街道岗辉路天安云谷二期 4 栋 2002</span></p>
    </div>
    <div class="mascot guide" style="left:1640px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '最后介绍一下我们：深圳市渔童科技有限公司，满怀理想、脚踏实地。' },
    { beat: 1, key: '10 万+', say: '服务了十万多家用户，POD 市场占有率超过七成，专注这个行业八年。' },
    { beat: 2, say: '扫码关注公众号和抖音，商务合作找企业微信，或者直接打这个电话。' },
  ],
});

/* p23 结尾（浅色金句页）：一句话收尾，拍 1 致谢和联系方式，方方鞠躬（thanks） */
Deck.add({
  id: 'p23',
  chapter: '结尾',
  scene: 'fangguo',
  title: '让每一单，都准时发出去',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote" data-beat="0" style="left:150px;top:280px;white-space:nowrap">让每一单，<br>都<span class="fg-hl">准时</span>发出去</p>
    <p class="abs fg-quote-by" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="thanks" style="left:154px;top:660px">谢谢大家，欢迎交流 · 400-996-5359 · fangguo.com</p>
    <i class="abs fg-deco" style="left:1220px;top:200px;width:620px"></i>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '准时', say: '最后一句话：方果想做的，就是让每一单都准时发出去。' },
    { beat: 1, say: '谢谢大家，欢迎交流。' },
  ],
});
