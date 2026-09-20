import { CommonProject } from '../projects/common';
import { BackgroundProject } from '../projects/background';

export const $render = {
	/**
	 * 移动到边缘
	 */
	moveToEdge(x = 80, y = 100) {
		BackgroundProject.scripts.render.methods.minimize();
		BackgroundProject.scripts.render.methods.setPosition(x, y);
	}
};
