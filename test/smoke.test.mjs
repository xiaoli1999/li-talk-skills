// 冒烟测试：模板里的本地依赖都在
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'skills', 'li-talk-skills', 'template');

test('vendor 里的依赖和许可证都在', () => {
  for (const f of ['gsap.min.js', 'rough.min.js', 'LICENSE-roughjs.txt', 'LICENSE-gsap.txt',
    'fonts/wenkai-lite-regular.woff2', 'fonts/wenkai-lite-bold.woff2', 'fonts/OFL-LXGW-WenKai.txt']) {
    assert.ok(existsSync(join(TPL, 'vendor', f)), '缺少 vendor/' + f);
  }
});
