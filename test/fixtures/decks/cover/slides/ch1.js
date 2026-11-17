/* 自检测试：形象挡字，只该报 mascot-cover
   - 第 0 拍：形象摆在一行字的正中间，身子压住字
   - 第 1 拍：形象走到右下的一个空目标上沿，说一句话，气泡压住上面的一行字 */
Deck.add({
  id: 'cv1',
  chapter: '挡字',
  scene: 'paper',
  title: '形象挡字',
  html: `
    <p class="abs t-lg cv-line">这一行字被形象挡住了一大块</p>
    <p class="abs t-md cv-up">气泡会压住这一行字</p>
    <i class="abs cv-spot" data-mascot="1" data-mascot-side="top" data-mascot-say="我挡住上面的字了"></i>
    <div class="mascot guide" style="left:560px;top:372px"></div>`,
  notes: [
    { beat: 0, say: '形象压在字上。' },
    { beat: 1, say: '形象走开，可它说的话又压住了字。' },
  ],
});
