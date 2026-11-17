/* 测试课件：这一章一运行就出错（调用了没定义的函数），检查要报「这一章没查到」 */
const parts = makeParts();

Deck.add({ id: 'b1', scene: 'paper', title: '永远加不上的一页', html: '' });
