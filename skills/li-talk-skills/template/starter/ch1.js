/* 第一章。照 references/templates.md 往下写：每页一个 Deck.add({ … })，页面顺序就是写的顺序。
   - id 全稿唯一（p01、p02……）；这一章的页面样式写在 ch1.css 里，选择器以 [data-id="p01"] 这样开头
   - scene 写风格名，只能用 index.html 里引入了的风格
   - data-beat 是第几拍出现（0 是翻到这页就有）；notes 里每拍一句讲词，拍号和页面上的对上
   - 新增一章：建 slides/ch2.js 和 ch2.css，再在 index.html 里两对「章节」注释之间各加一行引入 */

Deck.add({
  id: 'p01',
  chapter: '开场',
  scene: '{{SCENE}}',
  title: '{{TITLE}}',
  noTitle: true,               // 封面不要左上角的页标题，下面自己放一个大标题
  html: `
    <div class="abs col" style="left:150px;top:330px;width:1300px;align-items:flex-start;--gap:36px">
      <p class="t-xl b" data-beat="0" data-mascot="0" data-mascot-side="right">{{TITLE_HTML}}</p>
      <p class="lead muted" data-beat="1">一句话说清讲给谁、讲什么（照讲稿第 1 页改）</p>
    </div>
    <div class="mascot guide"></div>`,
  notes: [
    { beat: 0, key: '开场', say: '大家好，今天讲{{TITLE}}。' },
    { beat: 1, say: '（照讲稿第 1 页的讲词改）' },
  ],
});
