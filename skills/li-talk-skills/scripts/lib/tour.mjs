// tour 命令：新手教程。用户第一次用、刚装好、说「带我熟悉一下」时运行
//   tour           用浏览器打开新手教程课件（template/tour/index.html），记下「看过了」
//   tour --skip    用户选「先不学」：只记下，不打开
//
// 记录放在本机数据目录 ~/.li-talk-skills/tour.json（{ state: 'seen' | 'skipped', at }），跨课件共用：
// guide 在 ① 起点读它，没有记录就先问用户要不要过一遍教程；有了（看过或跳过）就不再问。
// 教程必须由 AI 运行这条命令打开，不要只把路径发给用户；打不开浏览器时才请用户手动双击。
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, TPL_DIR } from './paths.mjs';
import { openPath } from './open.mjs';
import { cli, posix } from './guide.mjs';

const RECORD = 'tour.json';
/** 新手教程课件的入口 */
export const TOUR = join(TPL_DIR, 'tour', 'index.html');

/** 读记录：没有或读不了返回 null */
export function readTour(dataDir = DATA_DIR) {
  try {
    const r = JSON.parse(readFileSync(join(dataDir, RECORD), 'utf8'));
    return r && (r.state === 'seen' || r.state === 'skipped') ? r : null;
  } catch { return null; }
}

// 写记录：先写临时文件再改名；写不了也不影响命令（下次 guide 会再问一次）
function writeTour(dataDir, state) {
  try {
    mkdirSync(dataDir, { recursive: true });
    const p = join(dataDir, RECORD);
    writeFileSync(`${p}.${process.pid}.tmp`, JSON.stringify({ state, at: new Date().toISOString() }, null, 2) + '\n');
    renameSync(`${p}.${process.pid}.tmp`, p);
    return true;
  } catch { return false; }
}

// 回来看教程的说法（跳过时、看完时都告诉用户）
const COMEBACK = '以后想再看，对 AI 说「打开 li-talk-skills 新手教程」就行。';

// tour 命令；opts.opener 换打开函数、opts.dataDir 换记录目录、opts.tour 换教程入口（测试用）
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const dataDir = opts.dataDir || DATA_DIR;
  const opener = opts.opener || openPath;
  const tour = opts.tour || TOUR;

  if (args.skip) {
    writeTour(dataDir, 'skipped');
    log('已记下：这次先不看新手教程，以后不再主动问。');
    log(`告诉用户：${COMEBACK}`);
    log('接着照 guide 的输出往下做（问用户手上有什么）。');
    return 0;
  }

  if (!existsSync(tour)) {
    log('新手教程课件不在（skill 可能没装完整）：先运行 update 或重新安装。现在可以直接打开样册，带用户过一遍全部风格：');
    log('  ' + cli('styles', '--open'));
    return 1;
  }
  if (!(await opener(tour))) {
    log(`打不开浏览器，请用户手动双击打开新手教程：${posix(tour)}`);
    log('用户看完以后，照下面第 2 步打开样册。');
    return 2;
  }
  writeTour(dataDir, 'seen');
  log(`已用浏览器打开新手教程：${posix(tour)}`);
  log('接下来这样带用户：');
  log('  1. 告诉用户：教程已经在浏览器里打开了，按 → 或空格一拍一拍往下翻，按 S 能看每页的讲解；20 多页，翻完大约 5 分钟。');
  log('     用户边看边问，就照教程内容和 SKILL.md 回答；没做的功能直接说「这一版还没有」。');
  log('  2. 用户说看完了，运行下面这条打开样册，带用户过一遍全部风格（首页是总览，点一张卡片从第一页看这种风格，左下角的小条随时换风格）：');
  log('     ' + cli('styles', '--open'));
  log(`  3. 风格看完，问用户要不要现在就做一份课件：要做就运行 guide 从 ① 起点开始；不做也行，告诉用户：${COMEBACK}`);
  return 0;
}
