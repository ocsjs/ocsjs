import { Project } from '../interfaces/project';

import { createConfigProxy, getMatchedScripts, uuid } from './common';
import { getTab, setTab } from './tampermonkey';

/**
 * 启动配置
 */
export interface StartConfig {
	style: string;
	projects: Project[];
}

/**
 * 启动项目
 * @param cfg 启动配置
 */
export function start(cfg: StartConfig) {
	// 添加当前标签唯一id
	getTab(({ tabId }) => {
		if (tabId === undefined) {
			setTab({ tabId: uuid() });
		}
	});

	/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
	cfg.projects = cfg.projects.map((p) => {
		p.scripts = p.scripts.map((s) => {
			s.cfg = createConfigProxy(s);
			return s;
		});
		return p;
	});

	const scripts = getMatchedScripts(cfg.projects, [location.href]);

	/** 执行脚本 */

	scripts.forEach((script) => {
		script.onstart?.(cfg);
	});

	document.addEventListener('readystatechange', () => {
		if (document.readyState === 'interactive') {
			scripts.forEach((script) => {
				script.onactive?.(cfg);
			});
		}
		if (document.readyState === 'complete') {
			scripts.forEach((script) => {
				script.oncomplete?.(cfg);
			});
		}
	});

	window.onbeforeunload = () => {
		scripts.forEach((script) => {
			script.onbeforeunload?.(cfg);
		});
	};
}
