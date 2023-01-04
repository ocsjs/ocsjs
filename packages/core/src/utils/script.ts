import { $gm } from './tampermonkey';
import { Script } from '../interfaces/script';

/**
 * 脚本工具库
 */
export const $script = {
	/**
	 * 置顶脚本
	 */
	pin(script: Script) {
		$gm.setValue('render.panel.currentPanelName', `${script.projectName}-${script.name}`);
	}
};
