import { $ } from '../utils/common';
import { $const } from '../utils/const';
import { $store } from '../utils/store';

/**
 * 跨域脚本事件通讯
 */
export class CorsEventEmitter {
	eventMap: Map<string, number> = new Map();

	private eventKey(name: string) {
		return 'cors.events.' + name;
	}

	tempKey(...args: string[]) {
		return ['_temp_', ...args].join('.');
	}

	keyOfReturn(id: string) {
		return this.tempKey('event', id, 'return');
	}

	keyOfArguments(id: string) {
		return this.tempKey('event', id, 'arguments');
	}

	keyOfState(id: string) {
		return this.tempKey('event', id, 'state');
	}

	/**
	 * 提交事件
	 * @param name 事件名
	 * @param args 事件参数
	 * @param callback 事件回调，可以接收返回值
	 */
	emit(name: string, args: any[] = [], callback?: (returnValue: any, remote: boolean) => void): void {
		$store
			.getTab($const.TAB_UID)
			.then((uid: string) => {
				const id = $.uuid().replace(/-/g, '');
				const key = uid + '.' + this.eventKey(name);

				/** 状态, 0 等待交互 ， 1 确定 , 2 取消 ， 后面紧跟着模态框中获取到的值，如果模态框类型是 prompt 则有值，否则为空字符串 */
				$store.set(this.keyOfState(id), 0);
				/** 模态框所需参数 */
				$store.set(this.keyOfArguments(id), args);

				const listenerId =
					$store.addChangeListener(this.keyOfState(id), (pre, curr, remote) => {
						// 移除此监听器
						$store.removeChangeListener(listenerId);
						// 执行回调
						callback?.($store.get(this.keyOfReturn(id)), !!remote);
						// 移除冗余的本地临时存储变量
						$store.delete(this.keyOfState(id));
						$store.delete(this.keyOfReturn(id));
						$store.delete(this.keyOfArguments(id));
					}) || 0;

				/** 添加 id 到监听队列 */
				$store.set(key, ($store.get(key) ? String($store.get(key)).split(',') : []).concat(id).join(','));
			})
			.catch(console.error);
	}

	/**
	 * 监听跨域事件
	 * @param name 事件名，全局唯一
	 * @param handler 处理器，可以通过处理器返回任意值作为另外一端的回调值
	 * @returns
	 */
	on(name: string, handler: (args: any[]) => any) {
		return new Promise<number>((resolve) => {
			$store
				.getTab($const.TAB_UID)
				.then((uid: string) => {
					const key = uid + '.' + this.eventKey(name);
					const originId = this.eventMap.get(key);

					if (originId) {
						resolve(originId);
					} else {
						const id =
							$store.addChangeListener(key, async (pre, curr, remote) => {
								if (remote) {
									const list = String(curr).split(',');
									// 处理队列
									const id = list.pop();

									if (id) {
										// 设置返回参数
										$store.set(this.keyOfReturn(id), await handler($store.get(this.keyOfArguments(id))));

										// 更新队列
										setTimeout(() => {
											// 这里改变参数，可以触发另一端的监听
											$store.set(this.keyOfState(id), 1);
											// 完成监听，删除id
											$store.set(key, list.join(','));
										}, 100);
									}
								}
							}) || 0;
						this.eventMap.set(key, id);

						resolve(id);
					}
				})
				.catch(console.error);
		});
	}

	off(name: string) {
		const key = this.eventKey(name);
		const originId = this.eventMap.get(key);
		if (originId) {
			this.eventMap.delete(key);
			$store.removeChangeListener(originId);
		}
	}
}

if (typeof GM_listValues !== 'undefined') {
	// 加载页面后
	window.onload = () => {
		// 删除全部未处理的模态框临时变量，以及监听队列
		$store.list().forEach((key) => {
			if (/_temp_.event.[0-9a-z]{32}.(state|return|arguments)/.test(key)) {
				$store.delete(key);
			}

			if (/[0-9a-z]{32}.cors.events.modal/.test(key)) {
				$store.delete(key);
			}
		});
	};
}

/**
 * 全局跨域对象
 */
export const cors = new CorsEventEmitter();
