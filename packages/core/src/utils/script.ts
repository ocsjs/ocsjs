import { Script } from '../interfaces/script';
import { $store } from './store';

/**
 * 脚本工具库
 */
export const $script = {
	/**
	 * 置顶脚本
	 */
	pin(script: Script) {
		$store.set('render.panel.currentPanelName', `${script.projectName}-${script.name}`);
	}
};
