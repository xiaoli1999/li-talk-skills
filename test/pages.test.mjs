// pages.mjs：把教程课件打成 GitHub Pages 用的独立目录。打出来的 index.html 不再引用 ../，引用的文件都在目录里
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { buildPages } from '../pages.mjs';

const made = [];
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

test('教程打包：index.html 只引用目录里的文件，CSS 里 url() 用到的字体、图标也一起带上', () => {
  const out = join(mkdtempSync(join(tmpdir(), 'li-talk-pages-')), 'site');
  made.push(dirname(out));
  const files = buildPages(out);
  assert.ok(files.length > 5, '至少带上引擎、风格、形象');
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /(href|src)="\.\.\//, '不能再引用模板目录');
  for (const m of html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)) {
    assert.ok(existsSync(join(out, m[1].split(/[?#]/)[0])), '缺文件：' + m[1]);
  }
  assert.ok(existsSync(join(out, '.nojekyll')));
  assert.ok(!existsSync(join(out, '.li-talk')), '自检记录不带上去');
});
