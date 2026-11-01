import { Project } from 'easy-us';
import { CommonProject } from './projects/common';
import { ZHSProject } from './projects/zhs';
import { CXProject } from './projects/cx';
import { BackgroundProject } from './projects/background';
import { IcveMoocProject } from './projects/icve';
import { ZJYProject } from './projects/zjy';
import { ICourseProject } from './projects/icourse';
import { YKTProject } from './projects/yuketang';
import { getUnsafeWindowProxy } from './utils/page-bridge';

/**
 * MV3 兼容：Tampermonkey 5.3+ 在 Chromium 138+ 使用 userScripts API 注入，
 * @grant GM_* 与 @grant unsafeWindow 组合会被拒绝注入，因此脚本不再申请 unsafeWindow。
 * 在 USER_SCRIPT（隔离）世界中以 MAIN 世界桥接代理补位；
 * 在旧油猴沙箱 / Node 构建环境中 unsafeWindow 已存在，此 polyfill 不生效。
 */
if (typeof (globalThis as any).unsafeWindow === 'undefined') {
	try {
		(globalThis as any).unsafeWindow = getUnsafeWindowProxy();
	} catch (e) {
		/* 非 DOM 环境忽略 */
	}
}

/** 导出所有的 OCS 核心模块 */
export * from '@ocsjs/core';
/** 导出启动函数，以及全局对象 */
export { start, $elements, $store } from 'easy-us';
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
