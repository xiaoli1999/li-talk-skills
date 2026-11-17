// styles 命令：列出所有风格，按「家」分组；--open 用浏览器打开样册
//   styles [--open]
// 风格说明取自 template/scenes/index.json（接口约定 F）。说明里有、风格文件还没做好的，标出来别让 AI 选。
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TPL_DIR } from './paths.mjs';
import { mascotList, sceneIndex } from './new.mjs';
import { openPath } from './open.mjs';
import { cli, posix } from './guide.mjs';

// 三家：同一份课件只在同一家里混用（字体、网格各成一套）
const FAMILIES = [
  ['hand', '手绘家', '楷书，霞鹜文楷'],
  ['modern', '现代家', '系统黑体'],
  ['pixel', '像素家', '中文像素字体，自成一套，不和别家混用'],
];

/** styles 的说明文字 */
export function stylesText(tplDir = TPL_DIR) {
  const list = sceneIndex(tplDir);
  const mascots = mascotList(tplDir);
  const mascot = k => { const m = mascots.find(x => x.key === k); return m ? `${m.label}（${m.key}）` : k || '无'; };
  const ready = s => existsSync(join(tplDir, 'scenes', s.key + '.js'));
  const out = [`内置风格：${list.filter(ready).length} 种能用。每种写了键名、名字、样子、适合讲什么、不适合什么、要注意的、默认形象。`];

  const known = FAMILIES.map(f => f[0]);
  const groups = FAMILIES.map(([key, name, font]) => ({ name: `${name}（${font}）`, items: list.filter(s => s.family === key) }));
  groups.push({ name: '其他', items: list.filter(s => !known.includes(s.family)) });
  for (const g of groups) {
    if (!g.items.length) continue;
    out.push('', g.name);
    for (const s of g.items) {
      out.push(`  ${s.key}  ${s.label || s.key}${ready(s) ? '' : '（还没做好，先别选）'}`);
      if (s.look) out.push(`    样子：${s.look}`);
      if (s.fit) out.push(`    适合：${s.fit}`);
      if (s.notFit) out.push(`    不适合：${s.notFit}`);
      if (s.risk) out.push(`    注意：${s.risk}`);
      out.push(`    形象：${mascot(s.mascot)}`);
    }
  }

  out.push('', '怎么推荐：',
    '  1. 按讲稿每部分讲什么，对照「适合」挑一个主推，跟用户说一句理由；同时打开样册给用户看。样册里的风格都能选，用户说了算。',
    '  2. 内容跨度大时可以按章分配风格：最多 3 种，只在同一家里混（手绘家和现代家不混用）。字体、强调色、形象全稿统一。',
    '  3. 一份课件一个形象，默认跟第一种风格走；用户想换再加 --mascot 键名。',
    '  4. 会议室投影时，深色底（黑板、科技暗黑）在幕布上容易发灰，推荐前先跟用户说一声。',
    '', '打开样册：', `  ${cli('styles', '--open')}`,
    '用户选定后记下（换成真实的课件目录和风格键名，多种用逗号隔开）：',
    `  ${cli('confirm', '"〈课件目录〉"', 'style', '--scenes', '〈风格键名〉')}`);
  return out.join('\n');
}

// styles 命令；opts.tplDir 换模板目录、opts.opener 换打开函数（测试用，不真的打开浏览器）
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const tplDir = opts.tplDir || TPL_DIR;
  const opener = opts.opener || openPath;
  log(stylesText(tplDir));
  if (!args.open) return 0;

  const gallery = join(tplDir, 'gallery.html');
  log('');
  if (!existsSync(gallery)) {
    log('样册还没做好：先照上面的文字说明，和用户一起挑风格。');
    return 0;
  }
  if (await opener(gallery)) {
    log(`已用浏览器打开样册：${posix(gallery)}`);
    log('样册里可以切换风格，看同一批样板页在各种风格下的样子。');
    return 0;
  }
  log(`打不开浏览器，请手动双击打开样册：${posix(gallery)}`);
  return 2;
}
