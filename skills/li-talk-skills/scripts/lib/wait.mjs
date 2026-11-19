// wait 命令：等用户在浏览器里点「通知 AI 修改」
//   wait <课件目录> [--timeout 秒]
// 给 AI 在后台运行（Claude Code 的后台任务这类）：用户一点通知，这个命令就打印修改清单（格式同 edits）并结束，
// 后台任务结束会把 AI 唤醒，AI 照清单改源码。
// 每 500ms 读一次 .li-talk/edits.json：notified 比命令开始的时刻新、通知之后没合并过、还有修改，就打印、退出码 0。
// --timeout 到了还没等到，退出码 3；默认一直等。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UserError } from './cli.mjs';
import { deckDir, formatEdits, pendingNotify, readEdits, statusLine } from './edits.mjs';

export const POLL = 500;

// 在线编辑的服务还在不在：有 serve.json，而且里面记的进程还活着（被强行结束时 serve.json 可能来不及删）
export function serveAlive(dir) {
  let rec = null;
  try { rec = JSON.parse(readFileSync(join(dir, '.li-talk', 'serve.json'), 'utf8')); } catch { return false; }
  try { process.kill(rec.pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const dir = deckDir(args._ && args._[0], 'wait');
  let limit = 0;
  if (args.timeout !== undefined) {
    limit = Number(args.timeout);
    if (args.timeout === true || !(limit > 0)) throw new UserError('--timeout 后面写等多少秒，比如：--timeout 600');
  }
  const start = Date.now();
  const poll = opts.poll || POLL;
  // 开始时就有一次没处理的通知：不算这次的（防止合并完忘了 --done 又被同一份清单叫醒），但说一声
  const first = readEdits(dir);
  if (pendingNotify(first) && opts.quiet !== true) {
    log(`提醒：还有一次在 wait 开始前发出、没处理的通知（${first.items.length} 处）。合并过了就运行 edits --done 清掉；没合并就先运行 edits 看清单。`);
  }
  let served = opts.quiet === true;   // serve 和 wait 常常同时启动：等 3 秒还没有 serve.json 再提醒
  for (;;) {
    if (!served && Date.now() - start >= 3000) {
      served = true;
      if (!serveAlive(dir)) log('提醒：没看到正在运行的在线编辑服务（.li-talk/serve.json），用户可能点不了通知。需要的话先后台运行 serve。');
    }
    const d = readEdits(dir);
    if (pendingNotify(d) && Date.parse(d.notified) > start) {
      log(statusLine(d));
      log(formatEdits(d, { dir }));
      return 0;
    }
    if (limit && Date.now() - start >= limit * 1000) {
      log(`等了 ${limit} 秒，用户还没点「通知 AI 修改」。要接着等就再后台运行一次 wait。`);
      return 3;
    }
    await new Promise(ok => setTimeout(ok, poll));
  }
}
