// 公用的目录和版本号
//   SKILL_DIR  skill 目录（scripts 的上一级）
//   TPL_DIR    模板目录：引擎、风格、形象、vendor、起步章节
//   DATA_DIR   本机数据目录 ~/.li-talk-skills：字体缓存等，跨课件复用
//   VERSION    skill 的版本号，取自 SKILL_DIR/version.txt
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TPL_DIR = join(SKILL_DIR, 'template');
export const DATA_DIR = join(homedir(), '.li-talk-skills');

// version.txt 不见了说明 skill 没装完整；这时给 null，由用到的地方给出说明，不在加载时就报错
function readVersion() {
  try { return readFileSync(join(SKILL_DIR, 'version.txt'), 'utf8').trim() || null; } catch { return null; }
}
export const VERSION = readVersion();
