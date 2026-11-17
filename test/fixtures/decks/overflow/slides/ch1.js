/* 自检测试：文字超出卡片——卡片写死 200px 高，里面 6 行 40px 的字（约 350px 高），只该报 text-overflow */
Deck.add({
  id: 'of1',
  chapter: '溢出',
  scene: 'paper',
  title: '文字超出卡片',
  html: `
    <div class="card abs t-yellow of-card" data-beat="1">
      <p>第一行：卡片只有 200px 高</p>
      <p>第二行：字却有六行</p>
      <p>第三行：每行 40px</p>
      <p>第四行：一定会超出底边</p>
      <p>第五行：自检要报出来</p>
      <p>第六行：还要写清超出多少</p>
    </div>`,
  notes: [
    { beat: 0, say: '标题。' },
    { beat: 1, say: '一张塞满字的卡片。' },
  ],
});
