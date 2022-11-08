import { cors } from '../interfaces/cors';
import { Project } from '../interfaces/project';

import { getMatchedScripts, createConfigProxy } from './common';

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
	/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
	cfg.projects = cfg.projects.map((p) => {
		p.scripts = p.scripts.map((s) => {
			s.cfg = createConfigProxy(s);
			return s;
		});
		return p;
	});

	const scripts = getMatchedScripts(cfg.projects, [location.href]);

	scripts.forEach((script) => {
		/** 执行脚本 */
		script.onstart?.(cfg);

		document.addEventListener('readystatechange', () => {
			if (document.readyState === 'interactive') {
				script.onactive?.(cfg);
			}
			if (document.readyState === 'complete') {
				script.oncomplete?.(cfg);
			}
		});
	});

	window.onbeforeunload = () => {
		scripts.forEach((script) => {
			script.onbeforeunload?.(cfg);
		});
	};

	cors.init();
}
