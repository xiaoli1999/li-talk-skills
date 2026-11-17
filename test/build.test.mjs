// 发版脚本 build.mjs：--manifest 生成清单、--check 干净度检查。都在临时目录里造的假仓库上做，不改真仓库。
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeManifest, checkRepo, topChangelogVersion } from '../build.mjs';
import { sha256 } from '../skills/li-talk-skills/scripts/lib/manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-build-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function writeTree(dir, files) {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(dir, ...rel.split('/'));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
}

const S = 'skills/li-talk-skills/';
function fakeRepo(extra = {}) {
  const root = tmp();
  writeTree(root, {
    [S + 'SKILL.md']: '---\nname: li-talk-skills\n---\n装到 ~/.claude/skills/li-talk-skills\n',
    [S + 'version.txt']: '0.2.0\n',
    [S + 'scripts/li-talk.mjs']: '// 入口\n',
    [S + 'template/engine/build.js']: "const a = el('a', 'li-sign', '由 小黎 · li-talk-skills 提供支持');\n",
    [S + 'template/samples/.gitkeep']: '',
    [S + 'template/vendor/x.woff2']: Buffer.from([0, 1, 2, 0, 67, 58, 92]),
    'docs/design.md': '# 设计\n署名写「由 小黎 · li-talk-skills 提供支持」。地址 https://example.com/a:b\n',
    'README.md': '# li-talk-skills\n',
    'CHANGELOG.md': '# 更新说明\n\n## 0.2.0\n\n- 要点\n\n## 0.1.0\n\n- 旧\n',
    ...extra,
  });
  return root;
}

test('--manifest：版本号取 version.txt，列出所有要安装的文件和校验值，不含 manifest.json 和 .gitkeep', () => {
  const root = fakeRepo();
  const { path, manifest } = writeManifest(root);
  assert.equal(path, join(root, 'skills', 'li-talk-skills', 'manifest.json'));
  assert.equal(manifest.version, '0.2.0');
  assert.deepEqual(Object.keys(manifest.files), [
    'SKILL.md', 'scripts/li-talk.mjs', 'template/engine/build.js', 'template/vendor/x.woff2', 'version.txt',
  ]);
  assert.equal(manifest.files['SKILL.md'], sha256(readFileSync(join(root, S, 'SKILL.md'))));
  const text = readFileSync(path, 'utf8');
  assert.deepEqual(JSON.parse(text), manifest);
  writeManifest(root);
  assert.equal(readFileSync(path, 'utf8'), text, '再生成一次结果不变');
});

test('--check：干净的仓库通过（不是 git 仓库时只提醒）', () => {
  const root = fakeRepo();
  writeManifest(root);
  const r = checkRepo(root);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some(w => /git/.test(w)));
});

test('--check：本机路径、内部词、CRLF、版本号对不上、清单过期都报出来；作者的署名放行', () => {
  const root = fakeRepo({
    [S + 'references/a.md']: '见 C:\\Users\\someone\\x 和 /Users/bob/demo\n还有 TAPD 需求，小克说的，小黎写的\n',
    [S + 'references/crlf.md']: '第一行\r\n第二行\r\n',
    'docs/b.md': '放在 D:/Users/x/y 下面\n路径 /home/alice/work/\n',
    'README.en.md': 'ask tapd\n',
  });
  writeManifest(root);
  writeFileSync(join(root, S, 'scripts', 'li-talk.mjs'), '// 改过了\n');
  writeFileSync(join(root, S, 'scripts', 'new.mjs'), '// 新文件\n');
  writeFileSync(join(root, 'CHANGELOG.md'), '# 更新说明\n\n## 0.1.9\n\n- 要点\n');
  const { errors } = checkRepo(root, { git: false });
  const all = errors.join('\n');
  assert.match(all, /references\/a\.md:1：像是 Windows 本机绝对路径「C:\\」/);
  assert.match(all, /references\/a\.md:1：像是 macOS 本机绝对路径「\/Users\/bob」/);
  assert.match(all, /references\/a\.md:2：有内部词「TAPD」/);
  assert.match(all, /references\/a\.md:2：有内部词「小克」/);
  assert.match(all, /references\/a\.md:2：有内部词「小黎」/);
  assert.match(all, /docs\/b\.md:1：像是 Windows 本机绝对路径/);
  assert.match(all, /docs\/b\.md:2：像是 Linux 本机绝对路径/);
  assert.match(all, /README\.en\.md:1：有内部词「tapd」/);
  assert.match(all, /references\/crlf\.md：换行是 CRLF/);
  assert.match(all, /version\.txt 是 0\.2\.0，CHANGELOG\.md 最上面一版是 0\.1\.9/);
  assert.match(all, /manifest\.json 和文件对不上（2 处）/);
  assert.match(all, /\n {4}清单里少了 scripts\/new\.mjs/);
  assert.match(all, /\n {4}scripts\/li-talk\.mjs 改过了/);
  assert.doesNotMatch(all, /build\.js|design\.md|x\.woff2/, '署名、网址、二进制文件不该报');
});

test('--check：没有清单、版本号不是正式版本号', () => {
  const root = fakeRepo({ [S + 'version.txt']: '0.2.0-beta\n' });
  const all = checkRepo(root, { git: false }).errors.join('\n');
  assert.match(all, /manifest\.json 不存在/);
  assert.match(all, /不是 x\.y\.z 这样的正式版本号/);
});

test('CHANGELOG 最上面一版', () => {
  assert.equal(topChangelogVersion('# 更新说明\n\n## 0.3.0（开发版）\n\n## 0.2.0\n'), '0.3.0');
  assert.equal(topChangelogVersion('## v1.2.3\n'), '1.2.3');
  assert.equal(topChangelogVersion('# 没有版本\n'), null);
});

test('命令行：node build.mjs --manifest / --check（复制到假仓库里跑，不碰真仓库）', () => {
  const root = fakeRepo();
  copyFileSync(join(ROOT, 'build.mjs'), join(root, 'build.mjs'));
  mkdirSync(join(root, S, 'scripts', 'lib'), { recursive: true });
  copyFileSync(join(ROOT, S, 'scripts', 'lib', 'manifest.mjs'), join(root, S, 'scripts', 'lib', 'manifest.mjs'));
  const run = (...args) => spawnSync(process.execPath, [join(root, 'build.mjs'), ...args], { cwd: root, encoding: 'utf8' });

  const c0 = run('--check');
  assert.equal(c0.status, 1);
  assert.match(c0.stdout, /manifest\.json 不存在/);

  const m = run('--manifest');
  assert.equal(m.status, 0, m.stderr);
  assert.match(m.stdout, /已写 .*manifest\.json：0\.2\.0，6 个文件/);
  assert.ok(existsSync(join(root, S, 'manifest.json')));

  const c1 = run('--check');
  assert.equal(c1.status, 0, c1.stdout + c1.stderr);
  assert.match(c1.stdout, /干净度检查：通过/);

  writeFileSync(join(root, S, 'SKILL.md'), '内部用 TAPD\n');
  const c2 = run('--check');
  assert.equal(c2.status, 1);
  assert.match(c2.stdout, /SKILL\.md:1：有内部词「TAPD」/);
  assert.match(c2.stdout, /SKILL\.md 改过了/);
});
