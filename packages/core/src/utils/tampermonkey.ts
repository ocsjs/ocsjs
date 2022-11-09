/**
 * 油猴封装库
 *
 * 在对本地持久化存储时可以使用 getValue , setValue 等方法
 * 在对当前标签页中的临时变量，可以使用 getTab , setTab 的方法
 *
 * 例如设置信息则使用本地持久化存储
 * 而对于消息推送，弹窗通知等临时，但是需要跨域的变量，可以使用标签页去存储临时信息
 */

/**
 * 通过key获取存储的值
 * @param key 键
 * @param defaultValue 默认值
 * @returns
 */
export function getValue(key: string, defaultValue?: any) {
	// eslint-disable-next-line no-undef
	return GM_getValue(key, defaultValue);
}

export function deleteValue(key: string) {
	// eslint-disable-next-line no-undef
	GM_deleteValue(key);
}

export function listValues() {
	// eslint-disable-next-line no-undef
	return GM_listValues();
}

/**
 * 存储值
 * @param key 键
 * @param value 值
 * @returns
 */
export function setValue(key: string, value: any) {
	// eslint-disable-next-line no-undef
	GM_setValue(key, typeof value === 'undefined' ? '' : value);
}

export function addConfigChangeListener(key: string, handler: (pre: any, curr: any, remote: boolean) => any) {
	// eslint-disable-next-line no-undef
	return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
		handler(pre, curr, remote);
	});
}

export function removeConfigChangeListener(listenerId: number) {
	// eslint-disable-next-line no-undef
	GM_removeValueChangeListener(listenerId);
}

export function getTab(callback: (obj: any) => void) {
	// eslint-disable-next-line no-undef
	GM_getTab(callback);
}

export function setTab(value: object) {
	// eslint-disable-next-line no-undef
	GM_saveTab(value);
}

export function getInfos() {
	// eslint-disable-next-line no-undef
	return GM_info;
}

/**
 * 发送系统通知
 * @param content 内容
 * @param options 选项
 */
export function notification(
	content: string,
	options?: {
		/** 通知点击时 */
		onclick?: () => void;
		/** 通知关闭时 */
		ondone?: () => void;
		/** 通知是否重要 */
		important?: boolean;
		/** 显示时间，默认为0 */
		timeout?: number;
	}
) {
	const { onclick, ondone, important, timeout } = options || {};
	const { icon, name } = getInfos().script;
	// eslint-disable-next-line no-undef
	GM_notification({
		title: name,
		text: content,
		image: icon || '',
		highlight: important,
		onclick,
		ondone,
		silent: true,
		timeout
	});
}
