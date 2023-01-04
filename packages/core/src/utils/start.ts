import { Project } from '../interfaces/project';

import { $ } from './common';
import { $gm } from './tampermonkey';

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
	$gm.getTab(({ tabId }) => {
		if (tabId === undefined) {
			$gm.setTab({ tabId: $.uuid() });
		}
	});

	/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
	cfg.projects = cfg.projects.map((p) => {
		for (const key in p.scripts) {
			if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
				p.scripts[key].cfg = $.createConfigProxy(p.scripts[key]);
			}
		}
		return p;
	});

	const scripts = $.getMatchedScripts(cfg.projects, [location.href]);

	/** 执行脚本 */

	scripts.forEach((script) => {
		script.onstart?.(cfg);
	});

	/** 防止 onactive 执行两次 */
	let active = false;

	/** 存在一开始就是 active 的情况 */
	if (document.readyState === 'interactive') {
		active = true;
		scripts.forEach((script) => {
			script.onactive?.(cfg);
		});
	}

	document.addEventListener('readystatechange', () => {
		if (
			document.readyState === 'interactive' &&
			/** 防止执行两次 */
			active === false
		) {
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

	window.onbeforeunload = (e) => {
		let prevent;
		for (const script of scripts) {
			if (script.onbeforeunload?.(cfg)) {
				prevent = true;
			}
		}

		if (prevent) {
			e.preventDefault();
			e.returnValue = true;
			return true;
		}
	};
}
