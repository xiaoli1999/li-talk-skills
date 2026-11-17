#!/usr/bin/env node
// li-talk-skills 的唯一脚本入口：node li-talk.mjs <命令> [参数]
//
// 先查 Node 版本再加载别的模块：静态 import 会在版本检查之前执行，
// 老版本 Node 碰到新语法直接报一串英文，所以这里只用动态 import，也不用顶层 await。

const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  console.error(`需要 Node 18 或以上，当前是 ${process.versions.node}。请先升级 Node（https://nodejs.org）。`);
  process.exit(2);
}

const BOOLS = ['browser', 'shots', 'open', 'yes', 'force'];
const COMMANDS = {
  guide: './lib/guide.mjs', styles: './lib/styles.mjs', materials: './lib/materials.mjs',
  new: './lib/new.mjs', open: './lib/open.mjs', confirm: './lib/meta.mjs',
  check: './lib/check.mjs', fonts: './lib/fonts.mjs', version: './lib/version.mjs',
};
const HELP = `用法：node li-talk.mjs <命令> [参数]
  guide [课件目录]                    看做到哪一步、下一步做什么
  styles [--open]                     列出所有风格；--open 打开样册
  materials <素材目录>                列素材清单，生成截图说明表
  new <课件目录> --title 标题 --scenes 风格[,风格] [--mascot 形象]
  open <课件目录>                     用浏览器打开课件
  confirm <课件目录> <outline|script|style|trial|review>   记下用户已确认的环节
  check <课件目录> [--browser] [--pages 3-5] [--shots] [--scene 风格]
  fonts [--into 课件目录]             下载或检查完整字体
  version                             查看版本`;

// 等输出都写完再退出：Windows 上 stdout 接管道时是异步写，直接 process.exit 可能截掉报告的尾巴
function finish(code) {
  process.exitCode = code;
  let left = 2;
  const done = () => { if (--left === 0) process.exit(code); };
  process.stdout.write('', done);
  process.stderr.write('', done);
}

async function main() {
  const argv = process.argv.slice(2);
  let cmd = argv[0];
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') { console.log(HELP); return 0; }
  if (cmd === '--version' || cmd === '-v') cmd = 'version';
  if (!COMMANDS[cmd]) { console.error(`不认识的命令「${cmd}」。\n\n${HELP}`); return 1; }

  const { parseArgs, loadCommand } = await import('./lib/cli.mjs');
  const run = await loadCommand(new URL(COMMANDS[cmd], import.meta.url));
  const code = await run(parseArgs(argv.slice(1), BOOLS));
  return typeof code === 'number' ? code : 0;
}

main().then(finish, e => {
  console.error(e && e.userMessage ? e.userMessage : '出错了：' + (e && e.stack || e));
  finish(e && typeof e.exitCode === 'number' ? e.exitCode : 1);
});
