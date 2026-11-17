// 发版清单 manifest.json：版本号和 skill 目录里每个文件的 sha256
//   { "version": "x.y.z", "files": { "<相对 skill 目录的路径>": "<sha256>", … } }
// 发版脚本 build.mjs 用它生成清单，自动更新 update.mjs 用它比对本地文件，两边共用同一套规则。
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const MANIFEST = 'manifest.json';

// 不进清单、不安装的文件和目录：占位文件、系统垃圾、课件自检输出、备份和临时文件
const SKIP_NAMES = new Set(['.gitkeep', '.li-talk', '.DS_Store', 'Thumbs.db', '.git', 'node_modules']);
const SKIP_RE = /^\.backup-|\.(log|tmp)$/i;

export const skipName = name => SKIP_NAMES.has(name) || SKIP_RE.test(name);

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

// 列出目录里要安装的文件，返回用 / 分隔的相对路径，按字符顺序排好；根目录的 manifest.json 不算
export function listFiles(dir) {
  const out = [];
  const walk = (abs, rel) => {
    for (const name of readdirSync(abs)) {
      if (skipName(name)) continue;
      const a = join(abs, name);
      const r = rel ? rel + '/' + name : name;
      if (statSync(a).isDirectory()) walk(a, r);
      else if (r !== MANIFEST) out.push(r);
    }
  };
  walk(dir, '');
  return out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

// 算出目录里每个文件的校验值：Map<相对路径, sha256>
export function hashFiles(dir, list = listFiles(dir)) {
  return new Map(list.map(rel => [rel, sha256(readFileSync(join(dir, ...rel.split('/'))))]));
}

// 按目录现状生成清单对象；version 不传时取目录里的 version.txt
export function buildManifest(dir, version) {
  const v = version || readFileSync(join(dir, 'version.txt'), 'utf8').trim();
  const files = {};
  for (const [rel, h] of hashFiles(dir)) files[rel] = h;
  return { version: v, files };
}

// 清单写成文本：两格缩进、末尾换行，生成结果稳定，便于看 diff
export function manifestText(m) {
  return JSON.stringify(m, null, 2) + '\n';
}

// 读目录里的 manifest.json；没有或读不出来时给 null
export function readManifest(dir) {
  const p = join(dir, MANIFEST);
  if (!existsSync(p)) return null;
  try {
    const m = JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
    return m && typeof m === 'object' && m.files && typeof m.files === 'object' ? m : null;
  } catch {
    return null;
  }
}
