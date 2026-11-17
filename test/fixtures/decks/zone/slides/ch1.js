/* 自检测试：进了风格禁区——一行字从 x=20 开始，压进方格纸左边的活页孔（x < 66），只该报 zone */
Deck.add({
  id: 'zn1',
  chapter: '禁区',
  scene: 'paper',
  title: '进了风格禁区',
  html: `
    <p class="abs zn-in" data-beat="1">这行字太靠左，压进了活页孔</p>`,
  notes: [
    { beat: 0, say: '标题。' },
    { beat: 1, say: '一行太靠左的字。' },
  ],
});
