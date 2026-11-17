/* 测试章节：第 1 页的风格 nope 没有注册（应退回朴素样子），第 2 页是方格纸 */
Deck.add({
  id: 'p1',
  chapter: '一、测试',
  topic: '没注册的风格',
  scene: 'nope',
  title: '这一页应该是朴素样子',
  html: `
    <p class="explain abs"><b>朴素</b>：浅色底、墨色字、没有装饰</p>
    <div class="card abs" data-beat="1" style="left:120px;top:300px;width:760px">
      <h3>一张卡片</h3>
      <p>第 1 拍出现，<em class="key">重点词</em>在这一拍划出来</p>
    </div>
    <div class="cells abs" data-beat="2" style="left:960px;top:300px;width:840px">
      <div class="cell ai"><b>写稿</b><span>AI 来</span></div>
      <div class="cell human"><b>确认</b><span>你来</span></div>
    </div>
    <button class="copy abs" type="button" data-beat="2" style="left:120px;top:640px">npx li-talk-skills guide</button>`,
  notes: [
    { beat: 0, say: '第一页用了一个没注册的风格。' },
    { beat: 1, key: '重点词', say: '卡片出来，重点词划一下。' },
    { beat: 2, say: '小格和命令一起出来。' },
  ],
});

Deck.add({
  id: 'p2',
  chapter: '一、测试',
  topic: '方格纸',
  scene: 'paper',
  title: '这一页是方格纸',
  html: `
    <div class="card abs t-yellow" data-beat="1" style="left:160px;top:300px;width:700px;--r:-2deg">
      <h3>一张便签</h3>
      <p>左边有一列活页孔，<em class="key">重点词</em>用荧光笔</p>
    </div>`,
  notes: [
    { beat: 0, say: '第二页是方格纸。' },
    { beat: 1, key: '重点词', say: '便签贴上来。' },
  ],
});
