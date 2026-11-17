/* 自检测试：干净的 3 页（方格纸 + 朵朵）
   - 封面：第 1 拍出一张便签，形象走到它右边
   - 内容：三张卡片一拍一张，形象站到当前卡片的上沿；第 2 拍形象说一句话（气泡不能压字）
   - 结尾：最后一页，引擎自动加署名；形象站在右边，不挡署名 */
(function () {
  'use strict';

  Deck.add({
    id: 'g1',
    chapter: '封面',
    scene: 'paper',
    title: '自检通过的样例',
    html: `
      <p class="abs lead g1-sub">三页干净的内容：没有溢出、重叠、挡字</p>
      <div class="mascot guide" style="left:1500px;top:300px"></div>
      <div class="card abs t-yellow g1-card" data-beat="1" data-mascot="1" data-mascot-side="right">
        <h3>第 1 拍</h3>
        <p>一张便签，形象站在它右边</p>
      </div>`,
    notes: [
      { beat: 0, say: '封面。' },
      { beat: 1, say: '一张便签。' },
    ],
  });

  Deck.add({
    id: 'g2',
    chapter: '一、内容',
    topic: '一页正常的内容',
    scene: 'paper',
    title: '三张卡片排一排',
    html: `
      <div class="abs grid g2-grid">
        <div class="card t-yellow" data-beat="1" data-mascot="1"><h3>第一张</h3><p>按页写下要讲的话</p></div>
        <div class="card t-mint" data-beat="2" data-mascot="2" data-mascot-say="看这张"><h3>第二张</h3><p>截图放进素材文件夹</p></div>
        <div class="card t-blue" data-beat="3" data-mascot="3"><h3>第三张</h3><p>每页两到四拍</p></div>
      </div>
      <div class="mascot guide" style="left:1680px;top:860px"></div>`,
    notes: [
      { beat: 0, say: '三张卡片。' },
      { beat: 1, say: '第一张。' },
      { beat: 2, say: '第二张。' },
      { beat: 3, say: '第三张。' },
    ],
  });

  Deck.add({
    id: 'g3',
    chapter: '结尾',
    scene: 'paper',
    title: '谢谢',
    html: `
      <div class="mascot guide" style="left:1500px;top:420px"></div>
      <p class="abs t-xl g3-quote">先做 3 页，再往下做</p>
      <p class="abs g3-sub" data-beat="1">自检清零，再给别人看</p>`,
    notes: [
      { beat: 0, say: '结尾。' },
      { beat: 1, say: '自检清零。' },
    ],
  });
})();
