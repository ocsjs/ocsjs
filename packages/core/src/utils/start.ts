/* global GM_info */
import { Project } from '../interfaces/project';
import { $ } from './common';
import { $const } from './const';
import { $store } from './store';

/**
 * 启动配置
 */
export interface StartConfig {
	/** 样式 */
	style: string;
	/** 项目列表 */
	projects: Project[];
	/** 默认面板名称 */
	defaultPanelName: string;
}

/**
 * 启动项目
 * @param startConfig 启动配置
 */
export async function start(startConfig: StartConfig) {
	// 环境检测
	if (
		[
			'GM_getTab',
			'GM_saveTab',
			'GM_setValue',
			'GM_getValue',
			'unsafeWindow',
			'GM_listValues',
			'GM_deleteValue',
			'GM_notification',
			'GM_xmlhttpRequest',
			'GM_getResourceText',
			'GM_addValueChangeListener',
			'GM_removeValueChangeListener'
		].some((api) => typeof Reflect.get(globalThis, api) === 'undefined')
	) {
		const open = confirm(
			`OCS网课脚本不支持当前的脚本管理器（${GM_info.scriptHandler}）。` +
				'请前往 https://docs.ocsjs.com/docs/script 下载指定的脚本管理器，例如 “Scriptcat 脚本猫” 或者 “Tampermonkey 油猴”'
		);

		if (open) {
			window.location.href = 'https://docs.ocsjs.com/docs/script';
		}
		return;
	}

	// 添加当前标签唯一id
	const uid = await $store.getTab($const.TAB_UID);
	if (uid === undefined) {
		await $store.setTab($const.TAB_UID, $.uuid());
	}

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

	/** 执行脚本 */
	scripts.forEach((script) => {
		script.emit('start', startConfig);
		script.onstart?.(startConfig);
	});

	/** 防止 onactive 执行两次 */
	let active = false;

	/**
	 * 如果页面加载元素较少，或者网速极快的情况下
	 * 存在一开始就是 active 或者 complete 的情况
	 */
	if (document.readyState === 'interactive') {
		active = true;
		scripts.forEach((script) => script.onactive?.(startConfig));
	} else if (document.readyState === 'complete') {
		scripts.forEach((script) => script.onactive?.(startConfig));
		scripts.forEach((script) => script.oncomplete?.(startConfig));
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

			/**
			 * 每个脚本加载之后，统计每个脚本当前所运行的页面链接，链接不会重复
			 * 初始化页面的脚本可以根据此链接列表，进行脚本页面的生成
			 */
			$store.getTab($const.TAB_URLS).then((urls) => {
				$store.setTab($const.TAB_URLS, Array.from(new Set(urls || [])).concat(location.href));
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
