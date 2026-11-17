/* 测试章节：封面、内容、结尾 3 页（方格纸 + 朵朵）
   - 封面：第 0 拍有一条下划线圈注（有开场的风格，圈注接在开场后面画），形象在开场末尾落下
   - 内容：一排点了不该进拍的元素（链接、按钮、展开详情、表单、data-noclick），一条可复制的命令，形象站在命令右边
     （「已复制」提示不能压在形象身上）
   - 结尾：最后一页，引擎自动加署名。地址带 ?crowd= 时在底部加东西挤署名：
     text 右下角放一行字；mascot 第 1 拍形象走到右下角；all 底部铺满一排字（三个位置都压字，署名放右下并给提醒） */
(function () {
  'use strict';
  const crowd = new URLSearchParams(location.search).get('crowd') || '';

  Deck.add({
    id: 'b1',
    chapter: '封面',
    scene: 'paper',
    title: '一份最小的测试课件',
    html: `
      <p class="explain abs"><b>用途</b>：验证开场、点击涟漪、署名和不进拍的元素</p>
      <div class="mascot guide" style="left:1480px;top:330px"></div>
      <p class="abs t-lg b1-line" data-mark="underline">第 0 拍就有的一句话，带一条下划线</p>
      <div class="card abs t-yellow b1-card" data-beat="1" data-mascot="1">
        <h3>第 1 拍</h3>
        <p>点空白处进到这一拍，点击处出涟漪</p>
      </div>`,
    notes: [
      { beat: 0, say: '封面：有开场的风格先播开场，形象最后落下。' },
      { beat: 1, say: '第一张便签。' },
    ],
  });

  Deck.add({
    id: 'b2',
    chapter: '一、交互',
    topic: '哪些东西点了不翻拍',
    scene: 'paper',
    title: '点这些元素不进拍',
    html: `
      <div class="mascot guide" style="left:1560px;top:820px"></div>
      <div class="b2-row abs">
        <a class="b2-link" href="https://example.com/" target="_blank" rel="noopener">一个链接</a>
        <button class="b2-btn" type="button">一个按钮</button>
        <label class="b2-lab"><input type="checkbox"> 勾选框</label>
        <span class="b2-nc" data-noclick>标了 data-noclick</span>
      </div>
      <details class="b2-det abs"><summary>展开详情</summary><p>展开后的一段说明文字</p></details>
      <div class="copy abs b2-copy" data-beat="1" data-mascot="1" data-mascot-side="right">npx li-talk-skills guide</div>
      <div class="card abs t-mint b2-card" data-beat="2">
        <h3>第 2 拍</h3>
        <p>点空白或这张卡片会进拍</p>
      </div>`,
    notes: [
      { beat: 0, say: '这一排点了都不进拍。' },
      { beat: 1, say: '命令点一下复制，形象站在它右边。' },
      { beat: 2, say: '卡片照常进拍。' },
    ],
  });

  const extra = crowd === 'text' ? '<p class="abs b3-foot b3-right">右下角的一行字：挤走署名</p>'
    : crowd === 'all' ? '<p class="abs b3-foot b3-wide">底部铺满一排字：左下、正下、右下都放不下署名，只好压在右下角，并给一条提醒</p>'
    : '';
  Deck.add({
    id: 'b3',
    chapter: '结尾',
    scene: 'paper',
    title: '谢谢',
    html: `
      <div class="mascot guide" style="left:1460px;top:300px"></div>
      <p class="abs t-xl b3-quote">做完 3 页，再往下做</p>
      <p class="abs b3-sub" data-beat="1">第 1 拍：最后一页的署名由引擎自动加上</p>
      ${crowd === 'mascot' ? '<i class="abs b3-spot" data-beat="1" data-mascot="1" data-mascot-side="top"></i>' : ''}
      ${extra}`,
    notes: [
      { beat: 0, say: '结尾。' },
      { beat: 1, say: '署名在底部。' },
    ],
  });
})();
