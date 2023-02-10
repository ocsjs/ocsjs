import { existsSync } from 'fs';
import { join } from 'path';
import { ValidBrowser } from '../interface';
import os from 'os';

// 获取可用浏览器路径
export function getValidBrowsers(): ValidBrowser[] {
	switch (os.platform()) {
		case 'darwin': {
			return [];
		}
		case 'win32': {
			return [
				{
					name: '微软浏览器(Microsoft Edge)',
					path: resolveBrowserPath('Microsoft\\Edge\\Application\\msedge.exe')
				},
				{
					name: '谷歌浏览器(chrome)',
					path: resolveBrowserPath('Google\\Chrome\\Application\\chrome.exe')
				}
			].filter((b) => b.path) as ValidBrowser[];
		}
		default: {
			return [];
		}
	}
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
