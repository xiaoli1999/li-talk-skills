// open 命令：用系统默认的浏览器打开课件
//   open <课件目录>        打开里面的 index.html；也可以直接写一个 .html 文件
// openPath 也给别的命令用（比如 styles --open 打开样册）
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UserError } from './cli.mjs';

/**
 * 各系统打开一个文件的命令：{ cmd, args, options }。
 * Windows 用 cmd 的 start；整条命令自己加引号、原样交给 cmd（windowsVerbatimArguments），
 * 路径里有空格、& 这类字符也不会被 cmd 拆开。start 的第一个引号参数是窗口标题，所以先给一个空的 ""。
 */
export function openCommand(target, platform = process.platform) {
  if (platform === 'win32') {
    return { cmd: 'cmd', args: ['/d', '/s', '/c', `"start "" "${target}""`], options: { windowsVerbatimArguments: true } };
  }
  if (platform === 'darwin') return { cmd: 'open', args: [target], options: {} };
  return { cmd: 'xdg-open', args: [target], options: {} };
}

/**
 * 用系统的默认程序打开文件（.html 就是默认浏览器）。不等它关掉；
 * 返回 Promise<boolean>：命令启动了就是 true，找不到命令等启动失败是 false。
 */
export function openPath(target) {
  const { cmd, args, options } = openCommand(target);
  return new Promise(done => {
    let child;
    try {
      child = spawn(cmd, args, { ...options, detached: true, stdio: 'ignore', windowsHide: true });
    } catch (e) {
      done(false);
      return;
    }
    child.once('error', () => done(false));
    child.once('spawn', () => { child.unref(); done(true); });
  });
}

// open 命令；opts.opener 可替换打开函数（测试用，不真的打开浏览器）
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const opener = opts.opener || openPath;
  const target = resolve(String((args._ && args._[0]) || '.'));
  let file = target;
  if (existsSync(target) && statSync(target).isDirectory()) file = join(target, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {
    throw new UserError(`没找到课件：${file} 不存在。请确认课件目录写对了；还没搭骨架的话先运行 new。`);
  }
  if (await opener(file)) {
    log(`已用浏览器打开：${file}`);
    log('翻页用 → / 空格，S 打开演讲者视图，F 全屏。');
    return 0;
  }
  log(`打不开浏览器，请手动双击打开：${file}`);
  return 2;
}
