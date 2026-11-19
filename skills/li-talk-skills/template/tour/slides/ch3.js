/* li-talk-skills 教程 · 第三部分：演讲者视图和彩排、小工具、常用命令、分享、更新、常见问题、结尾（p17–p23） */

/* p17 演讲者视图（聚焦框）：一扇模拟的演讲者视图，一拍框一处：讲词、计时、彩排 */
Deck.add({
  id: 'p17',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '演讲者视图',
  scene: 'fangguo',
  title: '演讲者视图：讲词、计时、彩排',
  html: `
    <div class="abs fg-win p17-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1160px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="users" data-fg-tone="teal"></i>演讲者视图<span data-small>按 S 打开</span></div>
      <div class="p17-body" data-small>
        <div class="p17-now"><i class="fg-ph on"></i><span>当前页</span></div>
        <div class="p17-side">
          <div class="p17-notes" data-fg-focus="1"><span>本拍讲词</span><p>先说结论：一页只讲一件事。下一拍讲为什么。</p></div>
          <div class="p17-timer" data-fg-focus="2"><b>06:42</b><span>T 开始或暂停 · R 归零</span></div>
        </div>
      </div>
      <div class="p17-reh" data-fg-focus="3" data-small><p><span>第 3 页</span><i style="--v:.6"></i><em>正常</em></p><p class="over"><span>第 4 页</span><i style="--v:1"></i><em>超时</em></p></div>
    </div>
    <div class="abs p17-keys" style="left:1340px;top:270px;width:460px">
      <p data-beat="1" data-mascot="1" data-mascot-side="stay" data-mascot-pose="think"><b><i class="fg-kbd">S</i>演讲者视图</b>另开窗口：本拍讲词高亮，预告下一拍</p>
      <p data-beat="2"><b><i class="fg-kbd">T</i><i class="fg-kbd">R</i>计时</b>开始或暂停、归零</p>
      <p data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok"><b><i class="fg-kbd">H</i>彩排</b>超时的页整条变红；小结复制给 AI，删减讲词</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '讲的时候，最好另开一个演讲者视图。' },
    { beat: 1, key: '讲词', say: '按 S 打开。它是另一个窗口，显示这一拍的讲词，还预告下一拍讲什么。' },
    { beat: 2, key: '计时', say: 'T 开始或暂停计时，R 归零。' },
    { beat: 3, key: '彩排', say: '正式讲之前，在演讲者视图里按 H 彩排一遍，超时的页整条变红。再按 H 出小结，复制给 AI，它会删减超时页的讲词。' },
  ],
});

/* p18 讲的时候的小工具：编辑式网格，键帽 + 一句话，一拍点亮两条 */
Deck.add({
  id: 'p18',
  chapter: '四、讲的时候',
  chapterShort: '讲的时候',
  topic: '小工具',
  scene: 'fangguo',
  title: '讲的时候的小工具',
  html: `
    <div class="abs fg-values p18-v" style="left:120px;top:280px;width:1680px">
      <div class="fg-val"><i></i><b><i class="fg-kbd">O</i>总览</b><p data-beat="1">铺开所有页，点一页跳过去</p></div>
      <div class="fg-val"><i></i><b><i class="fg-kbd">B</i>黑屏</b><p data-beat="1">翻页笔的黑屏键也行</p></div>
      <div class="fg-val"><i></i><b><i class="fg-kbd">L</i>激光笔</b><p data-beat="2">鼠标变成带拖尾的红点</p></div>
      <div class="fg-val"><i></i><b><i class="fg-kbd">F</i>全屏</b><p data-beat="2">全屏放映，再按退出</p></div>
      <div class="fg-val" data-mascot="3" data-mascot-side="stay" data-mascot-pose="idea"><i></i><b>进度条</b><p data-beat="3">底边一条细线，自己会走</p></div>
      <div class="fg-val"><i></i><b>手机竖屏</b><p data-beat="3">自动变成阅读模式，上下滑着看</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '讲的时候还有几个小工具。' },
    { beat: 1, key: '总览', say: 'O 是总览，铺开所有页，点一页跳过去。B 是黑屏，翻页笔的黑屏键也行。' },
    { beat: 2, key: '激光笔', say: 'L 是激光笔，F 是全屏。' },
    { beat: 3, key: '进度条', say: '底边那条细线是进度条，自己会走。在手机上竖着看，会自动变成阅读模式。' },
  ],
});

/* p19 常用命令一览：两栏代码条，一拍一栏；平时只需要对 AI 说话 */
Deck.add({
  id: 'p19',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '命令',
  scene: 'fangguo',
  title: '常用命令一览',
  html: `
    <p class="abs fg-cap" data-beat="0" style="left:120px;top:186px">平时只需要对 AI 说话；这页给想了解的人看</p>
    <div class="abs p19-col" data-beat="1" style="left:120px;top:290px;width:800px">
      <p><span class="fg-code">guide</span>看做到哪一步、下一步做什么</p>
      <p><span class="fg-code">styles --open</span>打开样册</p>
      <p><span class="fg-code">check</span>不开浏览器的检查</p>
      <p><span class="fg-code">check --browser</span>后台浏览器自检</p>
    </div>
    <div class="abs p19-col" data-beat="2" data-mascot="2" data-mascot-side="bottom" data-mascot-x=".6" data-mascot-pose="think" style="left:1000px;top:290px;width:800px">
      <p><span class="fg-code">open</span>用浏览器打开课件</p>
      <p><span class="fg-code">tour</span>打开这份教程</p>
      <p><span class="fg-code">version</span>查看版本和安装位置</p>
      <p><span class="fg-code">update</span>立即检查并更新</p>
    </div>
    <p class="abs p19-foot" data-beat="0" style="left:120px;top:900px"><span data-small>每条命令前面都是 node "〈skill 目录〉/scripts/li-talk.mjs"，AI 会替你填好</span></p>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '平时你只需要对 AI 说话。想了解背后的命令，这一页列了常用的几条。' },
    { beat: 1, key: 'guide', say: 'guide 看做到哪一步，styles --open 打开样册，check 是两种检查。' },
    { beat: 2, key: 'update', say: 'open 打开课件，tour 打开这份教程，version 看版本，update 立即更新。' },
  ],
});

/* p20 分享课件：左边三步，右边一扇文件夹窗口，聚焦框框住 index.html */
Deck.add({
  id: 'p20',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '分享',
  scene: 'fangguo',
  title: '分享课件：拷走整个文件夹',
  html: `
    <div class="abs fg-flow" style="left:120px;top:270px;width:800px">
      <div class="fg-step"><div><h4>拷走整个目录</h4><p data-beat="1">或者压成 zip 发过去</p></div></div>
      <div class="fg-step"><div><h4>对方双击 index.html</h4><p data-beat="2">Chrome、Edge 打开效果最好</p></div></div>
      <div class="fg-step" data-mascot="3" data-mascot-side="right" data-mascot-pose="ok"><div><h4>离线也能打开</h4><p data-beat="3">不连网，不加载任何外部资源</p></div></div>
    </div>
    <div class="abs fg-win p20-win" data-beat="0" data-recede="off" style="left:1080px;top:290px;width:720px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="box" data-fg-tone="amber"></i>我的分享<span data-small>课件目录</span></div>
      <div class="p20-files" data-small>
        <p data-fg-focus="2"><i class="p20-f"></i>index.html</p>
        <p><i class="p20-d"></i>slides/</p>
        <p><i class="p20-d"></i>素材/</p>
        <p><i class="p20-d"></i>engine/</p>
        <p><i class="p20-d"></i>scenes/ · mascots/ · vendor/</p>
        <p><i class="p20-f"></i>讲稿.md</p>
      </div>
    </div>
    <div class="mascot guide" style="left:1660px;top:860px"></div>`,
  notes: [
    { beat: 0, say: '讲完想把课件发给别人？' },
    { beat: 1, key: '整个目录', say: '把整个课件目录拷走，或者压成 zip 发过去。' },
    { beat: 2, key: 'index.html', say: '对方双击里面的 index.html 就能看，用 Chrome 或 Edge 效果最好。' },
    { beat: 3, key: '离线', say: '不用联网，也不加载任何外部资源，内网、会议室的电脑都能放。' },
  ],
});

/* p21 自动更新：一扇聊天窗，AI 转告已经更新；你问版本，AI 回答 */
Deck.add({
  id: 'p21',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '更新',
  scene: 'fangguo',
  title: '自动更新，做好的课件不会被改',
  html: `
    <div class="abs fg-win" data-beat="0" data-recede="off" style="left:120px;top:250px;width:1120px">
      <div class="fg-win-hd"><i class="fg-ico fg-ico-s" data-fg-ico="bulb"></i>和 AI 的对话<span data-small>每天第一次用时</span></div>
      <div class="fg-chat">
        <p class="fg-msg ai" data-beat="1">li-talk-skills 已经自动更新了，新开一个对话后生效。已经做好的课件不会被改动。</p>
        <p class="fg-msg me" data-beat="2">看看 li-talk-skills 的版本</p>
        <p class="fg-msg ai" data-beat="3" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ok">已经是最新版。想马上检查更新，对我说「更新 li-talk-skills」就行。</p>
      </div>
    </div>
    <div class="abs card p21-card" data-beat="0" style="left:1300px;top:290px;width:500px">
      <h3>怎么更新</h3>
      <p>每天第一次用时自动检查，只下载变了的文件，全部校验通过才替换</p>
    </div>
    <div class="mascot guide" style="left:1660px;top:820px"></div>`,
  notes: [
    { beat: 0, say: '最后说更新，你几乎不用管。' },
    { beat: 1, key: '自动更新', say: '每天第一次用时会自动检查，有新版本就更新，AI 会转告你，新开一个对话后生效。已经做好的课件不会被改动。' },
    { beat: 2, key: '版本', say: '想看版本，就对 AI 说看看 li-talk-skills 的版本。' },
    { beat: 3, key: '更新', say: '想马上更新，就说更新 li-talk-skills。' },
  ],
});

/* p22 常见问题：编辑式网格，问题大字、回答小字，一拍一条 */
Deck.add({
  id: 'p22',
  chapter: '五、更多',
  chapterShort: '更多',
  topic: '常见问题',
  scene: 'fangguo',
  title: '常见问题',
  html: `
    <div class="abs fg-values p22-v" style="left:120px;top:280px;width:1680px">
      <div class="fg-val"><i></i><b>字体要联网吗？</b><p data-beat="1">第一次会下载字体；下载不了先用自带的小字库</p></div>
      <div class="fg-val"><i></i><b>支持哪些浏览器？</b><p data-beat="2">Chrome、Edge 功能全；Safari、Firefox 能看，少数效果会降级</p></div>
      <div class="fg-val" data-mascot="3" data-mascot-side="stay" data-mascot-pose="ask"><i></i><b>截图要注意什么？</b><p data-beat="3">点开显示的是原图，放进去之前先处理掉敏感信息</p></div>
    </div>
    <div class="mascot guide" style="left:1660px;top:96px"></div>`,
  notes: [
    { beat: 0, say: '最后几个常见问题。' },
    { beat: 1, key: '字体', say: '字体要联网吗？手绘风第一次会下载完整字体；下载不了就先用自带的常用字小字库，不卡流程。' },
    { beat: 2, key: '浏览器', say: '支持哪些浏览器？Chrome、Edge 所有功能正常；Safari、Firefox 能看，少数效果会降级。' },
    { beat: 3, key: '截图', say: '截图要注意什么？课件里的截图点开显示的是原图，放进去之前先把敏感信息处理掉。' },
  ],
});

/* p23 结尾（金句页）：现在就对 AI 说一句；项目地址点一下复制 */
Deck.add({
  id: 'p23',
  chapter: '结尾',
  scene: 'fangguo',
  title: '现在就对 AI 说：用 li-talk-skills 做一份课件',
  noTitle: true,
  html: `
    <i class="fg-bleed fg-wash" hidden></i>
    <p class="abs fg-quote p23-q" data-beat="0" style="left:150px;top:250px;white-space:nowrap">现在就对 AI 说：<br>用 li-talk-skills <span class="fg-hl">做一份课件</span></p>
    <p class="abs p23-link" data-beat="1" data-mascot="1" data-mascot-side="right" data-mascot-pose="thanks" style="left:154px;top:640px"><span data-small>项目地址，点一下复制</span><span class="fg-code" data-copy="https://github.com/xiaoli1999/li-talk-skills">github.com/xiaoli1999/li-talk-skills</span></p>
    <i class="abs fg-deco" style="left:1260px;top:200px;width:600px"></i>
    <div class="mascot guide" style="left:1500px;top:760px"></div>`,
  notes: [
    { beat: 0, key: '做一份课件', say: '教程就到这里。现在就对 AI 说：用 li-talk-skills 做一份课件。' },
    { beat: 1, say: '项目地址在这里，点一下就能复制。谢谢你看完，祝你讲得顺利。' },
  ],
});
