// 把多个尺寸的自检结果排成一份中文报告；同一个问题在几个尺寸都出现时合成一条
//
// runs：[{ w, h, result }]，result 是引擎写的自检结果（接口约定 D）；
// 某个尺寸没读到结果时写成 { w, h, error: '原因' }，报告里记成一条「整份课件」的错误。

const FAILED_FIX = '课件在这个尺寸下没跑完：先用 check 看有没有运行出错，改好后重跑 check --browser';

// 合并各尺寸的问题，返回 { errors, warnings }，每条带 sizes: ['1440×900', …]
export function mergeIssues(runs) {
  const map = new Map();
  for (const { w, h, result, error } of runs) {
    const list = ((result && result.issues) || []).slice();
    if (error) list.push({ level: 'error', type: 'selftest-failed', page: null, msg: error, fix: FAILED_FIX });
    for (const it of list) {
      const key = [it.level, it.type, it.page, it.beat, it.msg].join('|');
      if (!map.has(key)) map.set(key, Object.assign({}, it, { sizes: [] }));
      const size = `${w}×${h}`;
      const sizes = map.get(key).sizes;
      if (!sizes.includes(size)) sizes.push(size);
    }
  }
  const all = [...map.values()].sort((a, b) => (a.page || 0) - (b.page || 0) || (a.beat || 0) - (b.beat || 0));
  return { errors: all.filter(i => i.level === 'error'), warnings: all.filter(i => i.level !== 'error') };
}

// 「第 4 页 p04「三种安装方式」第 2 拍」；和页无关的写「整份课件」
function where(i) {
  if (!i.page) return '整份课件';
  let s = `第 ${i.page} 页` + (i.id ? ` ${i.id}` : '') + (i.title ? `「${i.title}」` : '');
  if (i.beat != null) s += (i.title ? '' : ' ') + `第 ${i.beat} 拍`;
  return s;
}

export function formatReport(runs) {
  const first = (runs.find(r => r.result) || {}).result || { pages: 0, beats: 0 };
  const { errors, warnings } = mergeIssues(runs);
  const head = `自检报告：${first.pages} 页 ${first.beats} 拍 × ${runs.length} 个尺寸，${errors.length} 个错误、${warnings.length} 个提醒`;
  if (!errors.length && !warnings.length) return head + '\n\n没有发现问题。';
  // 排版和设计文档 10.4、静态检查一致：标题行后空一行，「错误」「提醒」两块之间不空行
  const block = (name, list) => {
    if (!list.length) return '';
    return '\n' + name + '\n' + list.map(i =>
      `  ${where(i)}｜${i.sizes.join('、')}\n    ${i.msg}` + (i.fix ? `\n    → ${i.fix}` : ''),
    ).join('\n');
  };
  return head + '\n' + block('错误', errors) + block('提醒', warnings);
}
