/* 自检测试：图片加载失败——一张不存在的图片、一个指向不存在文件的截图位，只该报 media-missing */
Deck.add({
  id: 'mi1',
  chapter: '图片',
  scene: 'paper',
  title: '图片加载失败',
  html: `
    <img class="abs mi-img" src="img/nope.png" alt="">
    <figure class="shot abs mi-shot" data-src="img/also-nope.png" data-beat="1"></figure>`,
  notes: [
    { beat: 0, say: '一张图。' },
    { beat: 1, say: '一个截图位。' },
  ],
});
