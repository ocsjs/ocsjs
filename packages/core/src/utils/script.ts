import { Script } from '../interfaces/script';
import { $const } from './const';
import { $store } from './store';

/**
 * 脚本工具库
 */
export const $script = {
	/**
	 * 置顶脚本
	 */
	async pin(script: Script) {
		if (script.projectName) {
			await $store.setTab($const.TAB_CURRENT_PANEL_NAME, `${script.projectName}-${script.name}`);
		} else if (script.namespace) {
			await $store.setTab($const.TAB_CURRENT_PANEL_NAME, script.namespace);
		} else {
			console.warn('[OCS]', `${script.name} 无法置顶， projectName 与 namespace 都为 undefined`);
		}
	}
};
