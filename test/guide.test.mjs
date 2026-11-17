// guide：从课件目录的实际状态推断做到哪一步，告诉 AI 下一步做什么、问用户什么；以及 styles 命令
// 搭骨架时字体一律用假的清单和假的下载函数，不联网，也不碰本机的字体缓存
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { guideText, run as runGuide, talkMinutes, targetChars } from '../skills/li-talk-skills/scripts/lib/guide.mjs';
import { run as runStyles } from '../skills/li-talk-skills/scripts/lib/styles.mjs';
import { confirmStep } from '../skills/li-talk-skills/scripts/lib/meta.mjs';
import { createDeck } from '../skills/li-talk-skills/scripts/lib/new.mjs';
import { readDeck } from '../skills/li-talk-skills/scripts/lib/deck.mjs';
import { sha256 } from '../skills/li-talk-skills/scripts/lib/fonts.mjs';
import { SKILL_DIR } from '../skills/li-talk-skills/scripts/lib/paths.mjs';

const made = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'li-talk-guide-')); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

const fwd = p => p.replace(/\\/g, '/');
const CLI = `node "${fwd(SKILL_DIR)}/scripts/li-talk.mjs"`;
const cmd = (...parts) => `${CLI} ${parts.join(' ')}`;
const q = d => `"${fwd(d)}"`;

// 假字体：缓存目录是空的、下载一律失败 → 用自带的小字库
const BLOCK = Buffer.from('假字体块');
const offline = () => ({
  log() {},
  fonts: {
    manifest: {
      package: 'fake-font', version: '0.0.1', family: 'WK', mirrors: ['https://m1.test/'],
      files: [{ path: 'files/x-400.woff2', weight: 400, range: 'U+4e00-4e2f', sha256: sha256(BLOCK), size: BLOCK.length }],
    },
    dir: join(tmp(), 'cache'),
    fetch: async () => { throw new Error('测试里不联网'); },
  },
});

// 讲稿：标题、提纲，加 n 页「## 第 N 页」
function script(n, { title = '怎么泡好一杯茶', extra = '' } = {}) {
  let s = `# ${title}\n\n## 给组织方\n- 一句话简介：讲怎么泡茶\n- 大纲：\n  1. 选茶（2 页）\n\n${extra}\n`;
  for (let i = 1; i <= n; i++) {
    s += `\n## 第 ${i} 页 第${i}页的标题\n\n**屏幕**\n- 标题：第 ${i} 页\n\n**讲词**\n【第 0 拍】先烧水，水开了再等一会儿。\n【第 1 拍】**温杯**很重要。\n`;
  }
  return s;
}

// 章节文件：按给的 id 写几页
const chapter = ids => ids.map((id, i) =>
  `Deck.add({ id: '${id}', scene: 'paper', title: '页面${i + 1}', html: '<p data-beat="0">x</p><p data-beat="1">y</p>', ` +
  `notes: [{ beat: 0, say: '甲' }, { beat: 1, say: '乙' }] });`).join('\n') + '\n';

// 搭好骨架、确认到风格为止的课件
async function builtDeck({ scriptPages = 5, confirm = [] } = {}) {
  const dir = join(tmp(), '我的分享');
  mkdirSync(dir);
  writeFileSync(join(dir, '讲稿.md'), script(scriptPages));
  for (const s of ['outline', 'script']) confirmStep(dir, s);
  confirmStep(dir, 'style', { scenes: ['paper'] });
  await createDeck(dir, { title: '怎么泡好一杯茶' }, offline());
  for (const s of confirm) confirmStep(dir, s);
  return dir;
}

// 写自检记录（默认：刚跑过、和当前页面一致、0 个错误）
function selftest(dir, rec = {}) {
  mkdirSync(join(dir, '.li-talk'), { recursive: true });
  writeFileSync(join(dir, '.li-talk', 'selftest.json'), JSON.stringify({
    at: new Date().toISOString(), slidesMtime: readDeck(dir).slidesMtime,
    sizes: ['1920x1080'], errors: 0, warnings: 0, ...rec,
  }));
}

// 四块按顺序都在；【问用户】里每个问题最多 4 个选项（Claude Code 的提问卡片最多 4 个），并标了推荐项
function checkShape(t) {
  const heads = ['【现在在哪一步】', '【下一步做什么】', '【问用户】', '【可以这样对 AI 说】'];
  let at = -1;
  for (const h of heads) {
    const i = t.indexOf(h);
    assert.ok(i > at, `缺少或顺序不对：${h}\n${t}`);
    at = i;
  }
  assert.match(t, /【可以这样对 AI 说】「[^」]+」/);
  const ask = t.slice(t.indexOf('【问用户】'), t.indexOf('【可以这样对 AI 说】'));
  const qs = ask.split(/\n\s*问题 \d+：/).slice(1);
  for (const one of qs) {
    const opts = one.split('\n').filter(l => /^\s+\d+\. /.test(l));
    assert.ok(opts.length >= 2 && opts.length <= 4, `每个问题 2 到 4 个选项：\n${one}`);
    assert.ok(opts.some(l => /（推荐/.test(l)), `每个问题都要标推荐项：\n${one}`);
  }
  return qs.length;
}

test('空目录从起点开始，问手上有什么', () => {
  const t = guideText(join(tmpdir(), 'li-talk-not-exist-' + Date.now()));
  assert.match(t, /【现在在哪一步】① 起点/);
  assert.match(t, /你手上现在有什么/);
  assert.match(t, /1\. 只有一个主题/);
  assert.match(t, /【可以这样对 AI 说】/);
  checkShape(t);
});

test('提纲和讲稿确认后进入选风格', () => {
  const dir = mkdtempSync(join(tmpdir(), 'li-talk-guide-'));
  made.push(dir);
  writeFileSync(join(dir, '讲稿.md'), '## 第 1 页 封面\n');
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】④ 风格/);
  assert.match(t, /styles --open/);
});

test('起点：命令写成 skill 的绝对路径，课件目录也写绝对路径', () => {
  const dir = join(tmp(), '新课件');
  const t = guideText(dir);
  assert.ok(t.includes(cmd('guide', q(dir))), t);
  assert.ok(t.includes(cmd('materials', q(join(dir, '素材')))), t);
  assert.ok(t.includes(fwd(dir) + '/讲稿.md'), '告诉 AI 讲稿.md 写在哪');
  assert.match(t, /共 9 步/);
});

test('起点：素材已经放进来了，提示先跑 materials', () => {
  const dir = tmp();
  mkdirSync(join(dir, '素材'));
  writeFileSync(join(dir, '素材', 'a.md'), '笔记');
  writeFileSync(join(dir, '素材', 'b.png'), 'x');
  const t = guideText(dir);
  assert.match(t, /① 起点/);
  assert.match(t, /素材\/ 里已经有 2 个文件/);
  checkShape(t);
});

test('起点：目录里有别的文件时，建议在里面另建一个课件目录；子目录里已有课件时列出来', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'package.json'), '{}');
  mkdirSync(join(dir, '旧分享'));
  writeFileSync(join(dir, '旧分享', '.li-talk.json'), '{}');
  const t = guideText(dir);
  assert.match(t, /① 起点/);
  assert.ok(t.includes(fwd(join(dir, '我的分享'))), t);
  assert.match(t, /package\.json/);
  assert.ok(t.includes(cmd('guide', q(join(dir, '旧分享')))), '已有的课件给出接着做的命令');
});

test('提纲：讲稿.md 只有标题时问场合，确认后运行 confirm outline', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), '# 怎么泡好一杯茶\n');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】② 提纲/);
  assert.match(t, /讲给谁/);
  assert.match(t, /讲多久/);
  assert.match(t, /带走什么/);
  assert.ok(t.includes(cmd('confirm', q(dir), 'outline')), t);
  assert.match(t, /给组织方/);
  assert.match(t, /等用户/);
  assert.ok(checkShape(t) >= 4);
});

test('提纲：讲稿或素材里已经写了讲多久、在哪讲，标出来，由 AI 判断不再问', () => {
  // 第三次替身实测的原稿：第一行写了「大概 8 分钟」「用会议室的电视」，正文里还有番茄的「25 分钟」
  const raw = '读书分享（大概 8 分钟，周五下午茶时间讲，用会议室的电视）\n\n定一个 25 分钟的闹钟，响了就休息 5 分钟。\n';
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), '# 读书分享\n\n' + raw);
  const t = guideText(dir);
  assert.match(t, /② 提纲/);
  assert.match(t, /\n {2}讲稿里已写：大概 8 分钟；用会议室的电视（guide 粗略认出来的，你再核对）/);
  assert.doesNotMatch(t, /已写：[^\n]*25 分钟/, '内容里光秃秃的「25 分钟」不当成讲多久');
  assert.match(t, /由你（AI）先判断：对照素材和讲稿[^\n]*已经写了答案的问题不再问，直接用用户的原话写进提纲，并告诉用户「从你的讲稿里看到：……」；只把没写的问题放进【问用户】/);
  assert.match(t, /（讲稿里已写「大概 8 分钟」：确认说的就是这个，就不问，直接写进提纲）\n {2}问题 2：讲多久？/);
  assert.match(t, /（讲稿里已写「用会议室的电视」：确认说的就是这个，就不问，直接写进提纲）\n {2}问题 3：在什么场合、什么屏幕上讲？/);
  checkShape(t);

  // 写在素材里也认
  const mat = tmp();
  writeFileSync(join(mat, '讲稿.md'), '# 读书分享\n');
  mkdirSync(join(mat, '素材'));
  writeFileSync(join(mat, '素材', '我的讲稿.txt'), raw);
  assert.match(guideText(mat), /\n {2}素材 我的讲稿\.txt里已写：大概 8 分钟；用会议室的电视/);

  // 什么都没写：不标「已写」，问题照常列出
  const none = tmp();
  writeFileSync(join(none, '讲稿.md'), '# 读书分享\n');
  const nt = guideText(none);
  assert.doesNotMatch(nt, /已写/);
  assert.ok(checkShape(nt) >= 4);
});

test('提纲：讲稿.md 里已经有讲稿时，从讲稿里整理提纲', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(3));
  const t = guideText(dir);
  assert.match(t, /② 提纲/);
  assert.match(t, /已经有 3 页/);
});

test('讲稿：给出讲稿格式说明的绝对路径、现有页数和字数，确认后运行 confirm script', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2));
  confirmStep(dir, 'outline');
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】③ 讲稿/);
  assert.ok(t.includes(fwd(SKILL_DIR) + '/references/script-format.md'), t);
  assert.ok(t.includes(cmd('confirm', q(dir), 'script')), t);
  assert.match(t, /现在有 2 页/);
  assert.match(t, /讲词约 \d+ 字/);
  assert.match(t, /## 第 N 页/);
  checkShape(t);
});

test('讲多久：从「给组织方」里读，取讲的那个数，读不出返回 null', () => {
  const sec = line => `# 标题\n\n## 给组织方\n- 一句话简介：5 分钟讲清楚\n${line}\n\n## 第 1 页 封面\n- 时间与时长：99 分钟\n`;
  assert.deepEqual(talkMinutes(sec('- 时间与时长：20 分钟；会议室投影')), { lo: 20, hi: 20 }, '看「时长」那一行，不看简介');
  assert.deepEqual(talkMinutes(sec('- 时间与时长：40 分钟（讲 35 分钟，问答 5 分钟）')), { lo: 35, hi: 35 });
  assert.deepEqual(talkMinutes(sec('- 时间与时长：15～20 分钟')), { lo: 15, hi: 20 });
  assert.deepEqual(talkMinutes(sec('- 时间与时长：1 小时')), { lo: 60, hi: 60 });
  assert.deepEqual(talkMinutes(sec('- 时间与时长：半小时左右')), { lo: 30, hi: 30 });
  assert.deepEqual(talkMinutes(sec('- 时间与时长：二十分钟，在投影上讲')), { lo: 20, hi: 20 });
  assert.equal(talkMinutes(sec('- 时间与时长：午休时间，看情况')), null);
  assert.equal(talkMinutes('# 标题\n\n## 第 1 页 封面\n- 时间与时长：5 分钟\n'), null, '没有「给组织方」就跳过');
  assert.deepEqual(targetChars({ lo: 5, hi: 5 }), { lo: 1100, hi: 1250 });
});

test('讲稿：按「给组织方」里的时长算目标字数；不到下限的 90% 时问用户怎么办，不让 AI 自己凑字', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { extra: '- 时间与时长：5 分钟，会议室投影\n- 合计：约 2 页' }));
  confirmStep(dir, 'outline');
  const t = guideText(dir);
  assert.match(t, /③ 讲稿/);
  // 每页讲词 16 字，2 页 32 字；5 分钟目标 1100–1250 字
  assert.match(t, /讲 5 分钟（讲稿开头「给组织方」里写的）：目标约 1100–1250 字，现在 32 字，还差约 1068 字/);
  assert.match(t, /超过 1250 字要删；低于 990 字（目标下限的 90%）先问用户怎么补/);
  assert.match(t, /不要为了凑字数加空话：补的每一句都要有具体内容（例子、步骤、数字），具体内容来自用户或素材；没有就问用户，不能编/);
  assert.match(t, /提纲里的页都写了（合计约 2 页/);
  assert.match(t, /提纲里的页都写了还不够，问用户怎么办（问题 1），照用户选的做，不要自己往讲词里凑字/);
  // 不再要求「先补够」
  assert.doesNotMatch(t, /先补到目标范围|才可以不补/);
  // 【问用户】里多一个问题，排在「讲稿可以吗」前面，推荐项第一，最多 4 个选项（checkShape 查）
  const ask = t.slice(t.indexOf('【问用户】'));
  assert.match(ask, /问题 1：讲稿现在约 32 字，只够讲约 0\.5 分钟（目标 5 分钟）。怎么办？\n {4}1\. 把现有的页讲细：我列出哪几页可以展开、需要你补哪些具体内容（例子、步骤、数字）（推荐）\n {4}2\. 加几页新内容：我列出提纲里还能加的方向，请你给要点\n {4}3\. 就讲这么短：把时长改成约 0\.5 分钟\n/);
  assert.match(ask, /（问题 1 处理完、讲稿改好以后问）\n {2}问题 2：讲稿写好了，你看一遍，可以吗？/);
  assert.match(t, /写完给用户看（问题 2：先问完问题 1、照用户选的改好，再问这个）/);
  // 选「就讲这么短」：页数按约每分钟 1 页看，可以合并，但不删用户原稿的内容，调整也给用户看
  assert.match(t, /选「就讲这么短」：把「给组织方」里的时长改成约 0\.5 分钟；再按约每分钟 1 页看一下提纲的页数，内容少的页可以合并，但不要为了对上页数删掉用户原稿里的内容；页数怎么调也要给用户看/);
  assert.equal(checkShape(t), 2);

  // 提纲还有页没写：先照提纲写完，写完还不够再问
  const half = tmp();
  writeFileSync(join(half, '讲稿.md'), script(2, { extra: '- 时间与时长：5 分钟\n- 合计：约 5 页' }));
  confirmStep(half, 'outline');
  assert.match(guideText(half), /提纲里还有约 3 页没写，先照提纲写完；写完还不够，问用户怎么办（问题 1）/);

  // 「40 分钟（讲 35 分钟）」按讲的 35 分钟算
  const qa = tmp();
  writeFileSync(join(qa, '讲稿.md'), script(1, { extra: '- 时间与时长：40 分钟（讲 35 分钟）' }));
  confirmStep(qa, 'outline');
  assert.match(guideText(qa), /讲 35 分钟（讲稿开头「给组织方」里写的）：目标约 7700–8750 字/);

  // 超过上限：先删
  const long = tmp();
  writeFileSync(join(long, '讲稿.md'), '# 长\n\n## 给组织方\n- 时间与时长：5 分钟\n\n## 第 1 页 封面\n\n**讲词**\n【第 0 拍】' + '好'.repeat(1300) + '\n');
  confirmStep(long, 'outline');
  const lt = guideText(long);
  assert.match(lt, /目标约 1100–1250 字，现在 1300 字，超出约 50 字/);
  assert.match(lt, /先删到 1250 字以内/);
  assert.doesNotMatch(lt, /怎么办？/);
  assert.equal(checkShape(lt), 1);

  // 到了下限的 90% 就不问
  const near = tmp();
  writeFileSync(join(near, '讲稿.md'), '# 近\n\n## 给组织方\n- 时间与时长：5 分钟\n\n## 第 1 页 封面\n\n**讲词**\n【第 0 拍】' + '好'.repeat(1000) + '\n');
  confirmStep(near, 'outline');
  const nt = guideText(near);
  assert.match(nt, /现在 1000 字，还差约 100 字（差得不多，可以不补）/);
  assert.doesNotMatch(nt, /怎么办？/);
  assert.equal(checkShape(nt), 1);

  // 15 分钟、1543 字（第二次替身实测的第一稿）：只够讲约 6.5 分钟，问用户，而不是自己凑到 3300 字
  const meet = tmp();
  writeFileSync(join(meet, '讲稿.md'), '# 周会\n\n## 给组织方\n- 时间与时长：15 分钟左右；大会议室投屏讲\n- 合计：约 1 页\n\n## 第 1 页 封面\n\n**讲词**\n【第 0 拍】' + '好'.repeat(1543) + '\n');
  confirmStep(meet, 'outline');
  const mt = guideText(meet);
  assert.match(mt, /目标约 3300–3750 字，现在 1543 字/);
  assert.match(mt, /问题 1：讲稿现在约 1543 字，只够讲约 6\.5 分钟（目标 15 分钟）。怎么办？/);
  assert.match(mt, /就讲这么短：把时长改成约 6\.5 分钟/);

  // 读不出时长：不写目标，提示怎么写；不凑字的规矩照样写
  const none = tmp();
  writeFileSync(join(none, '讲稿.md'), script(2));
  confirmStep(none, 'outline');
  const xt = guideText(none);
  assert.doesNotMatch(xt, /目标约/);
  assert.match(xt, /没读到讲多久/);
  assert.match(xt, /不要为了凑字数加空话/);
  assert.doesNotMatch(xt, /怎么办？/);
});

test('讲稿：拍数说法统一——第 0 拍不算，模板里普通页写到第 2 拍', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2));
  confirmStep(dir, 'outline');
  const t = guideText(dir);
  assert.match(t, /拍数 = 翻到这页后要点几下，第 0 拍不算：第 0 拍 \+ 第 1、2 拍 = 2 拍/);
  assert.match(t, /- 第 2 拍：出现什么｜重点词：……（普通页写到第 2～4 拍，封面、结尾写到第 1～2 拍）/);
  assert.match(t, /- 图注：……（有截图、截图下面要一行说明时才写；不要写成「截图说明：」）/);
});

test('风格：讲稿写了在投影上讲，深色底（黑板、科技暗黑）降分，推荐理由写明优先浅色底', () => {
  const steps = '讲安装步骤：安装、配置、命令、步骤、教程、培训。';
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { extra: `- 时间与时长：20 分钟，在会议室投影上讲\n${steps}` }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  const ask = t.slice(t.indexOf('【问用户】'), t.indexOf('【可以这样对 AI 说】'));
  const first = /\n\s+1\. ([^\n]*)/.exec(ask)[1];
  assert.doesNotMatch(first, /（board）|（dark）/, '深色底不排第一');
  assert.match(first, /（推荐：[^\n]*在投影上讲，优先浅色底）/);
  assert.match(first, /更像黑板，但它是深色底/);
  assert.equal(checkShape(t), 1);

  // 同样的词、不在投影上讲：黑板照样排第一
  const online = tmp();
  writeFileSync(join(online, '讲稿.md'), script(2, { extra: `- 时间与时长：20 分钟，线上会议共享屏幕\n${steps}` }));
  confirmStep(online, 'outline');
  confirmStep(online, 'script');
  const o = guideText(online);
  assert.match(o, /\n\s+1\. 黑板（board）[^\n]*（推荐/);
  assert.doesNotMatch(o, /优先浅色底/);
});

test('风格：推荐理由只列讲稿里实际匹配到的词和次数；一个都没匹配到时照实说', () => {
  // 第一个选项里「词」N 处，每个都要在讲稿里正好出现 N 次
  const reasonWords = (t, text) => {
    const first = /问题 1：[^\n]*\n\s+1\. ([^\n]*)/.exec(t)[1];
    const pairs = [...first.matchAll(/「([^」]+)」(\d+) 处/g)];
    for (const [, w, c] of pairs) assert.equal(text.split(w).length - 1, Number(c), `「${w}」在讲稿里的次数：${first}`);
    return { first, pairs };
  };
  const mixed = tmp();
  const text = script(2, { extra: '- 时间与时长：15 分钟；大会议室投屏讲\n主持人这个角色不复杂。讲安装步骤：安装、配置、步骤。' });
  writeFileSync(join(mixed, '讲稿.md'), text);
  confirmStep(mixed, 'outline');
  confirmStep(mixed, 'script');
  const m = reasonWords(guideText(mixed), text);
  // 「角色」只出现 1 次，不到门槛：像素手账不加分，理由里也不列它
  assert.match(m.first, /^方格纸（paper）[^\n]*（推荐：讲稿里的「安装」2 处、「步骤」2 处、「配置」1 处更像黑板，但它是深色底；在投影上讲，优先浅色底）/);
  assert.doesNotMatch(m.first, /角色」/);
  assert.ok(m.pairs.length >= 2);

  // 一个关键词都没有：不列词，写「没有明显的关键词」
  const plain = tmp();
  const ptext = script(2);
  writeFileSync(join(plain, '讲稿.md'), ptext);
  confirmStep(plain, 'outline');
  confirmStep(plain, 'script');
  const p = reasonWords(guideText(plain), ptext);
  assert.equal(p.pairs.length, 0);
  assert.match(p.first, /（推荐：讲稿里没有明显的关键词，按适合讲什么挑的）/);
  assert.doesNotMatch(p.first, /「/);
});

test('风格：关键词只数内容（给组织方、屏幕、讲词），节拍、画面和「步骤 1：」这类格式字样不计分', () => {
  // 每页「步骤」出现 6 次：屏幕里 2 个行首标签、节拍 2 次、画面 2 次，都是格式字样
  const page = (i, say) => `\n## 第 ${i} 页 第${i}页\n\n**屏幕**（投出来的字，原样使用）\n- 标题：泡茶\n- 步骤 1：烧水｜水开了再等一会儿\n- 步骤 2：温杯｜先烫一下杯子\n\n` +
    '**节拍**\n- 第 0 拍：标题｜重点词：泡茶\n- 第 1 拍：步骤 1 出现｜重点词：烧水\n- 第 2 拍：步骤 2 出现｜重点词：温杯\n\n' +
    '**画面**（怎么画、怎么动）\n两个步骤横排，每拍出一个步骤，照步骤样板。\n\n' +
    `**讲词**（照着讲，不投出来）\n【第 0 拍】${say}\n【第 1 拍】先烧水。\n【第 2 拍】再温杯。\n`;
  const make = say1 => {
    const d = tmp();
    writeFileSync(join(d, '讲稿.md'), '# 泡茶\n\n## 给组织方\n- 一句话简介：讲泡茶\n' + page(1, say1) + page(2, '接着讲。'));
    confirmStep(d, 'outline');
    confirmStep(d, 'script');
    return /问题 1：[^\n]*\n\s+1\. ([^\n]*)/.exec(guideText(d))[1];
  };
  const fmt = make('今天讲泡茶。');
  assert.doesNotMatch(fmt, /（board）/, '只在节拍、画面、行首标签里的「步骤」不让黑板排第一');
  assert.doesNotMatch(fmt, /步骤/);
  assert.match(fmt, /^方格纸（paper）[^\n]*（推荐：讲稿里没有明显的关键词，按适合讲什么挑的）/);

  // 讲词里真的讲到了「步骤」：算数，屏幕标签和节拍、画面里的仍然不算
  const said = make('下面讲具体的步骤，一共两个步骤。');
  assert.match(said, /^黑板（board）[^\n]*（推荐：讲稿里出现了「步骤」2 处）/);
});

test('风格：某个风格的关键词合计只命中 1 次，当作没有匹配，不会排第一、理由里也不列', () => {
  const once = tmp();
  writeFileSync(join(once, '讲稿.md'), script(2, { extra: '主持人这个角色不复杂。' }));
  confirmStep(once, 'outline');
  confirmStep(once, 'script');
  const t = guideText(once);
  const first = /问题 1：[^\n]*\n\s+1\. ([^\n]*)/.exec(t)[1];
  assert.doesNotMatch(first, /（journal）/, '只出现一次的「角色」不让像素手账排第一');
  assert.doesNotMatch(first, /角色」/);
  assert.match(first, /^方格纸（paper）[^\n]*（推荐：讲稿里没有明显的关键词，按适合讲什么挑的）/);
  checkShape(t);

  // 出现两次就算数
  const twice = tmp();
  writeFileSync(join(twice, '讲稿.md'), script(2, { extra: '主持人这个角色不复杂。讲讲每个角色做什么。' }));
  confirmStep(twice, 'outline');
  confirmStep(twice, 'script');
  assert.match(guideText(twice), /\n\s+1\. 像素手账（journal）[^\n]*（推荐：讲稿里出现了「角色」2 处）/);
});

test('风格：讲稿写了在投影上讲，技术词很多也先推浅色底；深色底出现在选项里时标出来', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { extra: '- 时间与时长：20 分钟，大会场幕布\n讲代码怎么部署，接口和架构。代码、部署、性能。' }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.doesNotMatch(t, /\n\s+1\. 科技暗黑（dark）/);
  assert.match(t, /\n\s+1\. [^\n]*在投影上讲，优先浅色底/);
  assert.doesNotMatch(t, /\n\s+[23]\. (黑板|科技暗黑)（(board|dark)）(?![^\n]*深色底，投影上容易发灰)/);
  checkShape(t);
});

test('风格：按讲稿内容给推荐，推荐项排第一；选定后运行 confirm style --scenes', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { extra: '讲代码怎么部署，接口和架构，命令行里敲命令。代码、部署。' }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /问题 1：.*风格/);
  assert.match(t, /\n\s+1\. 科技暗黑（dark）[^\n]*（推荐/);
  assert.ok(t.includes(cmd('confirm', q(dir), 'style', '--scenes')), t);
  assert.ok(t.includes(cmd('styles')), t);
  checkShape(t);

  const plain = tmp();
  writeFileSync(join(plain, '讲稿.md'), script(2));
  confirmStep(plain, 'outline');
  confirmStep(plain, 'script');
  assert.match(guideText(plain), /\n\s+1\. 方格纸（paper）[^\n]*（推荐/);
});

test('搭骨架：风格确认后给出 new 命令，标题取讲稿的一级标题', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2, { title: '新同事入门' }));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  confirmStep(dir, 'style', { scenes: ['paper'] });
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑤ 搭骨架/);
  assert.ok(t.includes(cmd('new', q(dir), '--title', '"新同事入门"', '--scenes', 'paper')), t);
  checkShape(t);
});

test('搭骨架：目录里有别的文件时先说清楚，不然 new 会拒绝', () => {
  const dir = tmp();
  writeFileSync(join(dir, '讲稿.md'), script(2));
  writeFileSync(join(dir, '旧稿.docx'), 'x');
  for (const s of ['outline', 'script']) confirmStep(dir, s);
  confirmStep(dir, 'style', { scenes: ['paper'] });
  const t = guideText(dir);
  assert.match(t, /⑤ 搭骨架/);
  assert.match(t, /旧稿\.docx/);
});

test('先做 3 页：刚搭好只有封面，写到 3 页再自检', async () => {
  const dir = await builtDeck();
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑥ 先做 3 页/);
  assert.match(t, /现在 1 页/);
  assert.ok(t.includes(fwd(SKILL_DIR) + '/references/templates.md'), t);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')), t);
  checkShape(t);
});

test('先做 3 页：写够了但没跑自检、自检过期、自检有错误，都要先跑 check --browser', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  let t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.match(t, /还没跑过后台自检/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));
  assert.doesNotMatch(t, /confirm .* trial/);

  selftest(dir, { errors: 2, warnings: 1 });
  t = guideText(dir);
  assert.match(t, /还有 2 个错误/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));

  selftest(dir, { slidesMtime: readDeck(dir).slidesMtime - 60000 });
  t = guideText(dir);
  assert.match(t, /改过/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));

  // 自检之后又改了 index.html（比如加了一章）也算过期
  selftest(dir, { at: new Date(Date.now() - 60000).toISOString() });
  t = guideText(dir);
  assert.match(t, /改过/);
});

test('先做 3 页：自检清零后打开给用户看，认可后运行 confirm trial', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir, { warnings: 1 });
  const t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.ok(t.includes(cmd('open', q(dir))), t);
  assert.ok(t.includes(cmd('confirm', q(dir), 'trial')), t);
  assert.match(t, /这 3 页/);
  checkShape(t);
});

test('章节运行出错时先让 AI 运行 check 看是哪里错了', async () => {
  const dir = await builtDeck();
  writeFileSync(join(dir, 'slides', 'ch1.js'), 'Deck.add({ id: "p01", title: "x", html: "" });\nthis is not js\n');
  const t = guideText(dir);
  assert.match(t, /⑥ 先做 3 页/);
  assert.match(t, /slides\/ch1\.js/);
  assert.ok(t.includes(cmd('check', q(dir))), t);
});

test('写全稿：页数少于讲稿，列出还没写的页', async () => {
  const dir = await builtDeck({ scriptPages: 5, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p05']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑦ 写全稿/);
  assert.match(t, /讲稿 5 页，课件现在 3 页/);
  assert.match(t, /第 3 页「第3页的标题」/);
  assert.match(t, /第 4 页「第4页的标题」/);
  assert.doesNotMatch(t, /第 5 页「/);
  assert.match(t, /ch2\.js/);
  checkShape(t);
});

test('写全稿：页数够了但自检过期，也停在这一步先自检清零', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir, { slidesMtime: 1 });
  const t = guideText(dir);
  assert.match(t, /⑦ 写全稿/);
  assert.ok(t.includes(cmd('check', q(dir), '--browser')));
});

test('过稿：写完、自检清零后给用户过稿，认可后运行 confirm review', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑧ 过稿/);
  assert.ok(t.includes(cmd('open', q(dir))));
  assert.ok(t.includes(cmd('confirm', q(dir), 'review')));
  checkShape(t);
});

test('完成：告诉用户怎么讲', async () => {
  const dir = await builtDeck({ scriptPages: 3, confirm: ['trial', 'review'] });
  writeFileSync(join(dir, 'slides', 'ch1.js'), chapter(['p01', 'p02', 'p03']));
  selftest(dir);
  const t = guideText(dir);
  assert.match(t, /【现在在哪一步】⑨ 完成/);
  for (const k of [/S/, /T/, /F/, /空格/]) assert.match(t, k);
  checkShape(t);
});

test('跳过确认直接 new 的课件，按顺序回到没确认的那一步', async () => {
  const dir = join(tmp(), 'deck');
  await createDeck(dir, { title: 't', scenes: ['paper'] }, offline());
  assert.match(guideText(dir), /② 提纲/);
  writeFileSync(join(dir, '讲稿.md'), script(2));
  confirmStep(dir, 'outline');
  confirmStep(dir, 'script');
  const t = guideText(dir);
  assert.match(t, /④ 风格/);
  assert.match(t, /已经搭好骨架/);
  assert.match(t, /\n\s+1\. 方格纸（paper）[^\n]*（推荐/);
});

test('目录是个文件时报中文错误；run 打印说明并返回 0', async () => {
  const f = join(tmp(), 'x.txt');
  writeFileSync(f, 'x');
  assert.throws(() => guideText(f), /是一个文件/);
  const lines = [];
  const code = await runGuide({ _: [join(tmp(), '新的')] }, { log: s => lines.push(s) });
  assert.equal(code, 0);
  assert.match(lines.join('\n'), /① 起点/);
});

/* ------------------------------------------------------------------
   styles
   ------------------------------------------------------------------ */

test('styles：按家分组列出所有风格，末尾写推荐规则', async () => {
  const lines = [];
  const code = await runStyles({ _: [] }, { log: s => lines.push(s) });
  const t = lines.join('\n');
  assert.equal(code, 0);
  assert.match(t, /手绘家/);
  assert.match(t, /现代家/);
  for (const k of ['paper', 'board', 'journal', 'desk', 'watercolor', 'dark']) assert.match(t, new RegExp(`\\b${k}\\b`));
  assert.ok(t.indexOf('手绘家') < t.indexOf('paper') && t.indexOf('现代家') < t.indexOf('dark'));
  assert.match(t, /方格纸/);
  assert.match(t, /适合/);
  assert.match(t, /不适合/);
  assert.match(t, /最多 3 种/);
  assert.match(t, /同一家/);
  assert.match(t, /微光/, '写出各风格默认的形象');
});

test('styles --open：样册还没做好时说明并返回 0；做好了就用浏览器打开', async () => {
  const tpl = tmp();
  mkdirSync(join(tpl, 'scenes'));
  writeFileSync(join(tpl, 'scenes', 'index.json'), JSON.stringify([{ key: 'paper', label: '方格纸', family: 'hand', mascot: 'duoduo', look: 'a', fit: 'b', notFit: 'c', risk: 'd' }]));
  writeFileSync(join(tpl, 'scenes', 'paper.js'), '');
  const opened = [];
  const opener = async f => { opened.push(f); return true; };
  let lines = [];
  let code = await runStyles({ _: [], open: true }, { log: s => lines.push(s), tplDir: tpl, opener });
  assert.equal(code, 0);
  assert.match(lines.join('\n'), /样册还没做好/);
  assert.equal(opened.length, 0);

  writeFileSync(join(tpl, 'gallery.html'), '<!doctype html>');
  lines = [];
  code = await runStyles({ _: [], open: true }, { log: s => lines.push(s), tplDir: tpl, opener });
  assert.equal(code, 0);
  assert.deepEqual(opened, [join(tpl, 'gallery.html')]);
  assert.match(lines.join('\n'), /已用浏览器打开样册/);
});

test('styles：说明里有、文件还没做好的风格标出来，别让 AI 选', async () => {
  const tpl = tmp();
  mkdirSync(join(tpl, 'scenes'));
  writeFileSync(join(tpl, 'scenes', 'index.json'), JSON.stringify([
    { key: 'paper', label: '方格纸', family: 'hand', mascot: 'duoduo', look: 'a', fit: 'b', notFit: 'c', risk: 'd' },
    { key: 'ink', label: '水墨国风', family: 'hand', mascot: 'x', look: 'a', fit: 'b', notFit: 'c', risk: 'd' },
  ]));
  writeFileSync(join(tpl, 'scenes', 'paper.js'), '');
  const lines = [];
  await runStyles({ _: [] }, { log: s => lines.push(s), tplDir: tpl });
  assert.match(lines.join('\n'), /ink.*还没做好/);
});
