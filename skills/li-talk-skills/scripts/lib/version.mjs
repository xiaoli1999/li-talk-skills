// version 命令：打印 skill 的版本号
import { VERSION } from './paths.mjs';

export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  if (!VERSION) {
    log('li-talk-skills 版本未知：skill 目录里没有 version.txt，可能没装完整，请重新安装。');
    return 2;
  }
  log(`li-talk-skills ${VERSION}`);
  return 0;
}
