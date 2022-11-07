import { Project } from '../interfaces/project';
import { getMatchedScripts, createConfigProxy } from './common';

export interface StartConfig {
	style: string;
	projects: Project[];
}

export function start(startConfig: StartConfig) {
	getMatchedScripts(startConfig.projects).forEach((script) => {
		/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
		script.cfg = createConfigProxy(script);

		/** 执行脚本 */
		script.onstart?.(startConfig);

		document.addEventListener('readystatechange', () => {
			if (document.readyState === 'interactive') {
				script.onactive?.(startConfig);
			}
			if (document.readyState === 'complete') {
				script.oncomplete?.(startConfig);
			}
		});
	});
}
