/**
 * 驼峰转目标字符串
 * @param value
 * @returns
 */
export function humpToTarget(value: string, target: string) {
	return value
		.replace(/([A-Z])/g, target + '$1')
		.toLowerCase()
		.split(target)
		.slice(1)
		.join(target);
}
