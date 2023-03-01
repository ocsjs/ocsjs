/* global Tampermonkey GM_getTab */

/**
 * 油猴封装库
 *
 * 在对本地持久化存储时可以使用 getValue , setValue 等方法
 * 在对当前标签页中的临时变量，可以使用 getTab , setTab 的方法
 *
 * 例如设置信息则使用本地持久化存储
 * 而对于消息推送，弹窗通知等临时，但是需要跨域的变量，可以使用标签页去存储临时信息
 */
export const $gm = {
	/** 全局 unsafeWindow 对象 */
	unsafeWindow: (typeof globalThis.unsafeWindow === 'undefined'
		? globalThis.window
		: globalThis.unsafeWindow) as Window & { [x: string]: any },

	/** 获取 GM_info */
	getInfos(): Tampermonkey.ScriptInfo | undefined {
		// eslint-disable-next-line no-undef
		return typeof GM_info === 'undefined' ? undefined : GM_info;
	},
	/** 与 $store.getTab 不同的是这个直接获取全部 tab 对象 */
	getTab(callback: (obj: any) => void) {
		return typeof GM_getTab === 'undefined' ? undefined : GM_getTab(callback);
	},

	/**
	 * 发送系统通知
	 * @param content 内容
	 * @param options 选项
	 */
	notification(
		content: string,
		options?: {
			/** 通知点击时 */
			onclick?: () => void;
			/** 通知关闭时 */
			ondone?: () => void;
			/** 通知是否重要 */
			important?: boolean;
			/** 显示时间，单位为秒，默认为0 */
			duration?: number;
		}
	) {
		const { onclick, ondone, important, duration = 0 } = options || {};
		const { icon, name } = $gm.getInfos()?.script || {};
		// eslint-disable-next-line no-undef
		GM_notification({
			title: name,
			text: content,
			image: icon || '',
			highlight: important,
			onclick,
			ondone,
			silent: true,
			timeout: duration * 1000
		});
	}
};
