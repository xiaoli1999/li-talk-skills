// 测试入口：跑 test/ 下所有 *.test.mjs；可带一个关键字只跑文件名里含它的测试
// 不直接用 `node --test test/`，因为 Node 18 和 Node 22+ 对目录参数的处理不一样
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const only = process.argv[2];
const files = readdirSync(dir)
  .filter(f => f.endsWith('.test.mjs') && (!only || f.includes(only)))
  .map(f => join(dir, f));
if (!files.length) { console.error('没找到测试文件'); process.exit(1); }
const r = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
