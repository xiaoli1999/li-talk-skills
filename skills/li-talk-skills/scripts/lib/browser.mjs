// 找本机的 Edge / Chrome；可用环境变量 LI_TALK_BROWSER 指定
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// 返回浏览器可执行文件的路径，找不到返回 null。env、platform 只给测试用
export function findBrowser(env = process.env, platform = process.platform) {
  if (env.LI_TALK_BROWSER && existsSync(env.LI_TALK_BROWSER)) return env.LI_TALK_BROWSER;
  const list = [];
  if (platform === 'win32') {
    // Windows 10 以后系统自带 Edge，一般在 Program Files (x86) 下
    for (const base of [env['PROGRAMFILES(X86)'], env.PROGRAMFILES, env.LOCALAPPDATA].filter(Boolean)) {
      list.push(join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
      list.push(join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    }
  } else if (platform === 'darwin') {
    list.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
      try {
        const p = execFileSync('which', [name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (p) list.push(p);
      } catch { /* 没装就试下一个 */ }
    }
  }
  return list.find(p => existsSync(p)) || null;
}
