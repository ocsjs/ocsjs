import { Project, start as rawStart, $ } from 'easy-us';
import { createGuardedStart } from './utils/start-guard';
import { CommonProject } from './projects/common';
import { ZHSProject } from './projects/zhs';
import { CXProject } from './projects/cx';
import { BackgroundProject } from './projects/background';
import { IcveMoocProject } from './projects/icve';
import { ZJYProject } from './projects/zjy';
import { ICourseProject } from './projects/icourse';
import { YKTProject } from './projects/yuketang';

/** 导出所有的 OCS 核心模块 */
export * from '@ocsjs/core';
/** 判断当前页面是否存在需要显示悬浮窗的脚本（与 easy-us 的挂载条件保持一致） */
function shouldMountWindow(config: Parameters<typeof rawStart>[0]) {
	if (self !== top) return false;
	return $.getMatchedScripts(config.projects, [location.href]).some((s) => s.hideInPanel === false);
}

/**
 * 启动函数（已加入「同一文档只创建一个悬浮窗」的防护）。
 *
 * easy-us 的 mounted 标记是模块级变量，重复注入脚本时无法跨实例生效，
 * 这里改为在 documentElement 上打标记，避免页面上出现多个悬浮窗。
 */
export const start = createGuardedStart(rawStart, shouldMountWindow);

/** 导出全局对象 */
export { $elements, $store } from 'easy-us';
/** 导出本包的核心脚本工程，开发者调试的时候使用 BackgroundProject 中的注入脚本，访问脚本 window 上下文 */
export { BackgroundProject } from './projects/background';
export { CommonProject } from './projects/common';
export { ZHSProject } from './projects/zhs';
export { CXProject } from './projects/cx';
export { ZJYProject } from './projects/zjy';
export { IcveMoocProject } from './projects/icve';
export { ICourseProject } from './projects/icourse';
export { YKTProject } from './projects/yuketang';
export { RenderScript } from './render';

export function definedProjects(): Project[] {
	return [
		ZHSProject,
		CXProject,
		IcveMoocProject,
		ZJYProject,
		ICourseProject,
		YKTProject,
		CommonProject,
		BackgroundProject
	];
}
