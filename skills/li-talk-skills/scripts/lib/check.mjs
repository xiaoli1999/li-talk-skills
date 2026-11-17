// check 命令：先做不开浏览器的检查；带 --browser 时再用无头浏览器在 5 个尺寸下跑引擎的自检
//   check <课件目录> [--browser] [--pages 3-5] [--shots] [--scene 风格]
// 退出码：有错误 1，没有 0；找不到浏览器等环境问题 2
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { checkStatic } from './check-static.mjs';
import { readDeck, deckEntry } from './deck.mjs';
import { findBrowser } from './browser.mjs';
import { openBrowser } from './selftest-run.mjs';
import { formatReport, mergeIssues } from './report.mjs';

// 自检的尺寸：常见的横屏，加手机竖屏（阅读模式）
export const SIZES = [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [390, 844]];
const SHOT = [1920, 1080];

// --pages 只认「3」或「3-5」；返回 { from, to }，写错时抛 UserError
export function parsePages(v) {
  const m = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(String(v));
  const from = m && Number(m[1]);
  const to = m && Number(m[2] || m[1]);
  if (!m || from < 1 || to < from) throw new UserError(`--pages 要写成 3 或 3-5 这样的页码范围，现在是「${v}」。`);
  return { from, to };
}

// 某个尺寸没读到结果时，报告里写的原因（去掉开头的尺寸，尺寸在报告里另有一栏）
const reason = e => String((e && (e.userMessage || e.message)) || e).replace(/^\d+×\d+\s*/, '');

export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const target = args._ && args._[0];
  if (!target) throw new UserError('check 后面要写课件目录，比如：check ./我的分享 --browser');
  const dir = resolve(String(target));
  // 入口文件：平常是 index.html；模板目录（index.html 带 {{…}} 占位符、旁边有 gallery.html）改查样册，两种检查都一样
  const entry = deckEntry(dir);
  if (entry !== 'index.html') log(`这是模板目录：index.html 是带占位符的入口模板，改查样册 ${entry}（全部风格、形象和样板页）。\n`);

  // 1. 不开浏览器的检查（目录不对时 checkStatic 会抛带中文说明的错误）
  const st = await checkStatic(dir);
  log(st.text);
  if (!args.browser) return st.errors ? 1 : 0;

  // 2. 后台浏览器自检
  if (args.pages === true) throw new UserError('--pages 后面要写页码范围，比如：--pages 3-5');
  if (args.scene === true) throw new UserError('--scene 后面要写风格名，比如：--scene dark');
  const range = args.pages ? parsePages(args.pages) : null;
  const pages = range ? (range.from === range.to ? String(range.from) : `${range.from}-${range.to}`) : undefined;
  const scene = args.scene || undefined;

  const env = opts.env || process.env;
  const browser = (opts.findBrowser || findBrowser)();
  if (!browser) {
    throw new UserError('没找到 Edge 或 Chrome，后台自检跑不了。可以装一个 Chrome，或用环境变量 LI_TALK_BROWSER 指定浏览器路径。', 2);
  }
  log('');
  if (env.LI_TALK_BROWSER && env.LI_TALK_BROWSER !== browser) {
    log(`提醒：环境变量 LI_TALK_BROWSER 指向的 ${env.LI_TALK_BROWSER} 不存在，改用找到的浏览器。`);
  }
  log(`后台自检：${SIZES.length} 个尺寸${pages ? `，只查第 ${pages} 页` : ''}${scene ? `，临时换成风格 ${scene}` : ''}（浏览器：${browser}）`);

  const slidesMtime = readDeck(dir).slidesMtime;   // 开跑前记下，跑的过程中改了章节就算过期
  const b = await (opts.openBrowser || openBrowser)(browser);
  const runs = [];
  let shotDir = null;
  let shotCount = 0;
  try {
    for (let i = 0; i < SIZES.length; i++) {
      const [w, h] = SIZES[i];
      log(`  正在用 ${w}×${h} 自检（${i + 1}/${SIZES.length}）…`);
      try {
        runs.push({ w, h, result: await b.selftest(dir, { w, h, pages, scene, entry }) });
      } catch (e) {
        if (i === 0) throw e;   // 第一个尺寸就跑不了，后面多半也一样，直接停下说明原因
        runs.push({ w, h, error: reason(e) });
      }
    }

    // 3. 截图：每页最后一拍，1920×1080
    if (args.shots) {
      const first = runs.find(r => r.result);
      const list = ((first && first.result.list) || []).filter(p => !range || (p.no >= range.from && p.no <= range.to));
      shotDir = join(dir, '.li-talk', 'shots');
      mkdirSync(shotDir, { recursive: true });
      if (!range) for (const f of readdirSync(shotDir)) if (/^p\d+\.png$/.test(f)) unlinkSync(join(shotDir, f));   // 整份重截时清掉旧图
      const pad = Math.max(2, String(list.reduce((m, p) => Math.max(m, p.no), 0)).length);   // p01.png，按文件名就能排好序
      for (const p of list) {
        log(`  截图 第 ${p.no} 页（${++shotCount}/${list.length}）…`);
        const file = join(shotDir, `p${String(p.no).padStart(pad, '0')}.png`);
        await b.screenshot(dir, file, { w: SHOT[0], h: SHOT[1], page: p.no, beat: p.total || 0, scene, entry });
      }
    }
  } finally {
    await b.close();
  }

  log('');
  log(formatReport(runs));
  const { errors, warnings } = mergeIssues(runs);
  if (st.errors) log(`\n另外，最上面不开浏览器的检查还有 ${st.errors} 个错误，也要改完。`);
  if (shotDir) log(`\n截图存在：${shotDir}（每页最后一拍，${SHOT[0]}×${SHOT[1]}，共 ${shotCount} 张）`);

  // 4. 记下这次自检，guide 用它判断自检是不是过期、有没有错误（两种检查的错误合计，和退出码一致）。
  //    只查部分页面或临时换风格时不记，免得把没查的页也算成通过；模板目录不是课件，也不记（免得把 .li-talk/ 留在模板里）
  const total = { errors: st.errors + errors.length, warnings: st.warnings + warnings.length };
  if (pages || scene) {
    if (entry === 'index.html') log(`\n${pages ? '只查了部分页面' : '临时换了风格'}，没有更新自检记录；改完后跑一次完整的 check --browser。`);
  } else if (entry === 'index.html') {
    const rec = {
      at: new Date().toISOString(),
      slidesMtime,
      sizes: SIZES.map(([w, h]) => `${w}x${h}`),
      errors: total.errors,
      warnings: total.warnings,
    };
    mkdirSync(join(dir, '.li-talk'), { recursive: true });
    writeFileSync(join(dir, '.li-talk', 'selftest.json'), JSON.stringify(rec, null, 2) + '\n');
  }
  return total.errors ? 1 : 0;
}
