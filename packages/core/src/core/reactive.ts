import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { watch } from 'vue';

/**
 * 创建跨域响应式存储功能
 * @param key 本地存储的键
 * @param target  响应式对象
 * @param updateListener  更新监听器
 */
export function createReactive<T extends object>(
	key: string,
	target: T,
	updateListener?: (oldValue: any, newValue: T) => void
) {
	if (
		typeof GM_setValue === 'function' &&
		typeof GM_getValue === 'function' &&
		typeof GM_addValueChangeListener === 'function' &&
		typeof GM_removeValueChangeListener === 'function'
	) {
		let watcher = createWatcher(key, target);
		// eslint-disable-next-line no-undef
		GM_addValueChangeListener(key, (name, oldValue, newValue: T, remote) => {
			if (remote === true) {
				// 关闭监听器
				watcher?.();
				// 深度变更
				deepChange(target, newValue);
				// 调用更新钩子
				updateListener?.(oldValue, target);
				// 重新创建监听器
				watcher = createWatcher(key, target);
			}
		});
	} else {
		throw new Error('当前环境不支持油猴跨域通信');
	}
}

/** 创建响应式监听器 */
function createWatcher(key: string, target: any) {
	// 声明cache变量，便于匹配是否有循环引用的情况
	const cache: any[] = [];

	return watch(
		() => cloneDeep(target),
		debounce((_new) => {
			// eslint-disable-next-line no-undef
			GM_setValue(
				key,
				JSON.parse(
					JSON.stringify(_new, function (key, value) {
						if (typeof value === 'object' && value !== null) {
							if (cache.indexOf(value) !== -1) {
								// 移除
								return;
							}
							// 收集所有的值
							cache.push(value);
						}
						return value;
					})
				)
			);
		}, 100),
		{ deep: true }
	);
}

/** 深度赋值 */
function deepChange(origin: any, target: any) {
	if (target) {
		for (const key in origin) {
			if (Object.prototype.hasOwnProperty.call(origin, key)) {
				if (typeof origin[key] === 'object' && !Array.isArray(origin[key])) {
					deepChange(origin[key], target[key]);
				} else {
					origin[key] = target[key];
				}
			}
		}
	}
}
