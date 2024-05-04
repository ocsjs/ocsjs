import { CommonProject } from '../projects/common';

export const $render = {
	/**
	 * 移动到边缘
	 */
	moveToEdge() {
		CommonProject.scripts.render.methods.minimize();
		CommonProject.scripts.render.methods.setPosition(80, 100);
	}
};
