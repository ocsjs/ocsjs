/**
 * 通过key获取存储的值
 * @param key 键
 * @param defaultValue 默认值
 * @returns
 */
export function getConfig(key: string, defaultValue?: any) {
	// eslint-disable-next-line no-undef
	return GM_getValue(key, defaultValue) || '';
}

/**
 * 存储值
 * @param key 键
 * @param value 值
 * @returns
 */
export function setConfig(key: string, value: any) {
	// eslint-disable-next-line no-undef
	GM_setValue(key, value);
}

export function onConfigChange(key: string, handler: (pre: any, curr: any, remote: boolean) => any) {
	// eslint-disable-next-line no-undef
	GM_addValueChangeListener(key, (_, pre, curr, remote) => {
		handler(pre, curr, remote);
	});
}
