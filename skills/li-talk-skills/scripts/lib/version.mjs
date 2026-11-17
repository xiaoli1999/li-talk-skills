// version 命令：打印版本号、安装位置、安装方式、上次检查更新的时间和结果（不联网，立即更新用 update）
import { SKILL_DIR, DATA_DIR } from './paths.mjs';
import { localVersion, statusLines } from './update.mjs';

// 第二个参数只给测试用：skillDir、dataDir、log
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const skillDir = opts.skillDir || SKILL_DIR;
  const dataDir = opts.dataDir || DATA_DIR;
  const version = localVersion(skillDir);
  if (!version) {
    log('li-talk-skills 版本未知：skill 目录里没有 version.txt，可能没装完整，请重新安装。');
    log(`安装位置：${skillDir}`);
    return 2;
  }
  log(`li-talk-skills ${version}`);
  for (const line of statusLines({ skillDir, dataDir })) log(line);
  return 0;
}
