// 命令行公用的小工具：参数解析、给用户看的错误、按需加载命令模块
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 解析命令行：位置参数放进 _；--名字 值、--名字=值；bools 里列出的是开关，不带值
export function parseArgs(argv, bools = []) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) { out[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2);
    const nx = argv[i + 1];
    if (!bools.includes(k) && nx !== undefined && !nx.startsWith('--')) { out[k] = nx; i++; }
    else out[k] = true;
  }
  return out;
}

// 给用户看的错误：只打印中文说明，不打印堆栈；exitCode 1 是用法或内容错误，2 是环境问题
export class UserError extends Error {
  constructor(message, exitCode = 1) { super(message); this.userMessage = message; this.exitCode = exitCode; }
}

// 加载一个命令模块（file 是 file: 地址或路径），返回它的 run 函数。
// 模块文件还不存在（这个命令还没写）时抛 UserError，不让 Node 打出一大段堆栈。
export async function loadCommand(file) {
  const url = file instanceof URL ? file : pathToFileURL(String(file));
  if (!existsSync(fileURLToPath(url))) throw new UserError('这个命令还没做好，先用别的命令。');
  const mod = await import(url.href);
  if (typeof mod.run !== 'function') throw new UserError('这个命令还没做好，先用别的命令。');
  return mod.run;
}
