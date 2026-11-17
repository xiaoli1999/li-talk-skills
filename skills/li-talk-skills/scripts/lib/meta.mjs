// 课件进度文件 .li-talk.json 的读写，以及 confirm 命令
//   confirm <课件目录> <outline|script|style|trial|review> [--scenes a,b] [--mascot m]
// 五处必须停下等用户确认的环节（提纲、讲稿、风格、3 页试做、过稿），用户点头后由 AI 运行 confirm 记下来，
// guide 据此判断做到哪一步；换对话、换模型也能接着做。
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UserError } from './cli.mjs';
import { VERSION } from './paths.mjs';

export const META_FILE = '.li-talk.json';
export const STEPS = ['outline', 'script', 'style', 'trial', 'review'];
export const STEP_NAMES = { outline: '提纲', script: '讲稿', style: '风格', trial: '3 页试做', review: '过稿' };

export const metaPath = dir => join(dir, META_FILE);

const blankConfirmed = () => Object.fromEntries(STEPS.map(s => [s, false]));

/**
 * 读进度文件。没有文件时返回默认结构（不写盘）：
 * { tool, version, title, scenes, mascot, confirmed: { outline … review }, created }
 * 文件写坏了（不是合法的 JSON）时抛 UserError，不悄悄当成空的，免得之后写回去把确认记录冲掉。
 */
export function readMeta(dir) {
  const file = metaPath(dir);
  let data = {};
  if (existsSync(file)) {
    try {
      data = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
    } catch (e) {
      data = null;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new UserError(`${file} 不是合法的 JSON，可能被改坏了。把它改回 JSON 格式，或者删掉它，再重新确认做过的环节。`);
    }
  }
  const confirmed = blankConfirmed();
  const c = data.confirmed && typeof data.confirmed === 'object' ? data.confirmed : {};
  for (const s of STEPS) confirmed[s] = c[s] === true;
  return {
    ...data,   // 认不得的字段原样留着
    tool: 'li-talk-skills',
    version: typeof data.version === 'string' && data.version ? data.version : VERSION,
    title: typeof data.title === 'string' ? data.title : '',
    scenes: Array.isArray(data.scenes) ? data.scenes.filter(s => typeof s === 'string' && s) : [],
    mascot: typeof data.mascot === 'string' && data.mascot ? data.mascot : null,
    confirmed,
    created: typeof data.created === 'string' && data.created ? data.created : null,
  };
}

/**
 * 改进度文件：patch 里的字段覆盖原来的，confirmed 按环节合并；目录不存在时建好。返回写进去的内容。
 */
export function writeMeta(dir, patch = {}) {
  const cur = readMeta(dir);
  const { tool, version, title, scenes, mascot, confirmed, created, ...rest } = {
    ...cur,
    ...patch,
    confirmed: { ...cur.confirmed, ...(patch.confirmed || {}) },
  };
  // 按约定的顺序写，方便人看
  const next = {
    tool: 'li-talk-skills', version, title, scenes, mascot, confirmed,
    created: created || new Date().toISOString(),
    ...rest,
  };
  mkdirSync(dir, { recursive: true });
  writeFileSync(metaPath(dir), JSON.stringify(next, null, 2) + '\n');
  return next;
}

/**
 * 记下用户已确认的环节。extra 可带 { scenes, mascot }（确认风格时顺带记下）。返回写进去的内容。
 */
export function confirmStep(dir, step, extra = {}) {
  if (!STEPS.includes(step)) throw new UserError(`环节只能是 ${STEPS.join('、')}，现在是「${step}」。`);
  const patch = { confirmed: { [step]: true } };
  if (extra.scenes && extra.scenes.length) patch.scenes = extra.scenes.slice();
  if (extra.mascot) patch.mascot = extra.mascot;
  return writeMeta(dir, patch);
}

const USAGE = 'confirm <课件目录> <outline|script|style|trial|review> [--scenes 风格,风格] [--mascot 形象]';

// confirm 命令
export async function run(args = {}, opts = {}) {
  const log = opts.log || (s => console.log(s));
  const [target, step] = args._ || [];
  if (!target || !step) throw new UserError(`用法：${USAGE}\n  比如用户确认了提纲：confirm ./我的分享 outline`);
  if (!STEPS.includes(step)) throw new UserError(`环节只能是 ${STEPS.join('、')}，现在是「${step}」。\n用法：${USAGE}`);
  const dir = resolve(String(target));
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new UserError(`找不到目录：${dir}。先建好课件目录（讲稿.md 放在里面），再记确认。`);
  }
  if (args.scenes === true) throw new UserError('--scenes 后面要写风格，比如：--scenes paper 或 --scenes paper,board');
  if (args.mascot === true) throw new UserError('--mascot 后面要写形象，比如：--mascot duoduo');
  const wantStyle = args.scenes || args.mascot;
  if (wantStyle && step !== 'style') throw new UserError('--scenes、--mascot 只在确认 style 时用。');

  // 前提：提纲、讲稿写在 讲稿.md 里；3 页试做和过稿要先有课件
  if ((step === 'outline' || step === 'script') && !existsSync(join(dir, '讲稿.md'))) {
    throw new UserError(`${dir} 里还没有 讲稿.md。${STEP_NAMES[step]}要写进 讲稿.md，给用户看过、用户确认后再运行 confirm。`);
  }
  if ((step === 'trial' || step === 'review') && !existsSync(join(dir, 'index.html'))) {
    throw new UserError(`${dir} 还没搭骨架（没有 index.html），谈不上${STEP_NAMES[step]}。先运行 new 搭骨架、写好页面。`);
  }

  const extra = {};
  let picked = null;
  if (wantStyle) {
    // 风格、形象的校验和 new 共用；动态引入，避免两个模块互相静态引用
    const { resolveScenes, resolveMascot, sceneIndex } = await import('./new.mjs');
    const cur = readMeta(dir);
    const scenes = args.scenes ? resolveScenes(String(args.scenes)) : null;
    const keys = scenes ? scenes.map(s => s.key) : cur.scenes;
    const mascot = resolveMascot(args.mascot ? String(args.mascot) : null, scenes || keys);
    if (scenes) extra.scenes = keys;
    extra.mascot = mascot.key;
    const index = sceneIndex();
    picked = { scenes: scenes || keys.map(k => index.find(s => s.key === k) || { key: k, label: k }), mascot };
    if (existsSync(join(dir, 'engine')) && scenes && keys.join() !== cur.scenes.join()) {
      log('提醒：这份课件已经搭好骨架，这里只改了记录。要真的换风格，还得把新风格的文件放进 scenes/，并在 index.html 里引入。');
    }
  }

  const meta = confirmStep(dir, step, extra);
  if (step === 'style') {
    const list = picked ? picked.scenes : meta.scenes.map(k => ({ key: k, label: k }));
    const sc = list.length ? list.map(s => (s.label && s.label !== s.key ? `${s.label}（${s.key}）` : s.key)).join('、') : '（还没记下）';
    const m = picked ? `${picked.mascot.label}（${picked.mascot.key}）` : meta.mascot || '（还没记下）';
    log(`已记下：风格已确认。风格：${sc}；形象：${m}。`);
    if (!meta.scenes.length) log('还没记下用了哪些风格：可以重新运行 confirm <课件目录> style --scenes 风格，或者搭骨架时用 new --scenes 指定。');
  } else {
    log(`已记下：${STEP_NAMES[step]}已确认。`);
  }
  log(`下一步：运行 guide ${target} 看接下来做什么。`);
  return 0;
}
