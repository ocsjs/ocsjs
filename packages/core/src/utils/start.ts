import { Project } from '../interfaces/project';

import { $ } from './common';
import { $gm } from './tampermonkey';

/**
 * 启动配置
 */
export interface StartConfig {
	/** 样式 */
	style: string;
	/** 项目列表 */
	projects: Project[];
}

/**
 * 启动项目
 * @param startConfig 启动配置
 */
export function start(startConfig: StartConfig) {
	// 添加当前标签唯一id
	$gm.getTab(({ tabId }) => {
		if (tabId === undefined) {
			$gm.setTab({ tabId: $.uuid() });
		}
	});

	/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
	startConfig.projects = startConfig.projects.map((p) => {
		for (const key in p.scripts) {
			if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
				p.scripts[key].cfg = $.createConfigProxy(p.scripts[key]);
			}
		}
		return p;
	});

	const scripts = $.getMatchedScripts(startConfig.projects, [location.href]);

	for (const script of scripts) {
		/**
		 * 以下是在每个脚本加载之后，统计每个脚本当前所运行的页面链接，链接不会重复
		 * 初始化页面的脚本可以根据此链接列表，进行脚本页面的生成
		 */

		const _onstart = script.onstart;
		script.onstart = (...args: any) => {
			_onstart?.call(script, ...args);
			const urls: string[] = Array.from($gm.getValue('_urls_', []));
			const urlHasInRecord = urls.find((u) => u === location.href);
			if (!urlHasInRecord) {
				$gm.setValue('_urls_', urls.concat(location.href));
			}
		};

		const _onbeforeunload = script.onbeforeunload;
		script.onbeforeunload = (...args: any) => {
			const prevent = _onbeforeunload?.call(script, ...args);
			const urls: string[] = Array.from($gm.getValue('_urls_', []));
			const urlIndex = urls.findIndex((u) => u === location.href);
			if (urlIndex !== -1) {
				$gm.setValue('_urls_', urls.splice(urlIndex, 1));
			}
			return prevent;
		};
	}

	/** 执行脚本 */
	scripts.forEach((script) => {
		script.emit('start', startConfig);
		script.onstart?.(startConfig);
	});

	/** 防止 onactive 执行两次 */
	let active = false;

	/** 存在一开始就是 active 的情况 */
	if (document.readyState === 'interactive') {
		active = true;
		scripts.forEach((script) => script.onactive?.(startConfig));
	}

	/**
	 * 监听 readystatechange
	 */
	document.addEventListener('readystatechange', () => {
		if (
			document.readyState === 'interactive' &&
			/** 防止执行两次 */
			active === false
		) {
			scripts.forEach((script) => {
				script.emit('active', startConfig);
				script.onactive?.(startConfig);
			});
		}
		if (document.readyState === 'complete') {
			scripts.forEach((script) => {
				script.emit('complete');
				script.oncomplete?.(startConfig);
			});
		}
	});

	/**
	 * 监听 history 更改
	 */
	history.pushState = addFunctionEventListener(history, 'pushState');
	history.replaceState = addFunctionEventListener(history, 'replaceState');
	window.addEventListener('pushState', () => {
		scripts.forEach((script) => {
			script.emit('historychange', 'push', startConfig);
			script.onhistorychange?.('push', startConfig);
		});
	});
	window.addEventListener('replaceState', () => {
		scripts.forEach((script) => {
			script.emit('historychange', 'replace', startConfig);
			script.onhistorychange?.('replace', startConfig);
		});
	});

	/**
	 * 监听页面离开
	 */
	window.onbeforeunload = (e) => {
		let prevent;
		for (const script of scripts) {
			script.emit('beforeunload');
			if (script.onbeforeunload?.(startConfig)) {
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

/**
 * 添加事件调用监听器
 */
export function addFunctionEventListener(obj: any, type: string) {
	const origin = obj[type];
	return function (...args: any[]) {
		// @ts-ignore
		const res = origin.apply(this, args);
		const e = new Event(type.toString());
		// @ts-ignore
		e.arguments = args;
		window.dispatchEvent(e);
		return res;
	};
}
