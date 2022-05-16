import { existsSync } from 'fs';
import { join } from 'path';
import { ValidBrowser } from './interface';

// 获取 chrome 路径
export function getValidBrowsers(): ValidBrowser[] {
  return [
    {
      name: '微软浏览器(Microsoft Edge)',
      path: resolveBrowserPath('Microsoft\\Edge\\Application\\msedge.exe')
    },
    {
      name: '谷歌浏览器(chrome)',
      path: resolveBrowserPath('Google\\Chrome\\Application\\chrome.exe')
    },
    {
      name: '火狐浏览器(Firefox)',
      path: resolveBrowserPath('Mozilla Firefox\\firefox.exe')
    }
  ];
}

function resolveBrowserPath(commonPath: string) {
  return [
    // @ts-ignore
    join(process.env.ProgramFiles, commonPath),
    // @ts-ignore
    join(process.env['ProgramFiles(x86)'], commonPath),
    join('C:\\Program Files', commonPath),
    join('C:\\Program Files (x86)', commonPath)
  ].find((p) => existsSync(p));
}
