import { Project } from '@ocsjs/core';
import { CommonProject } from './projects/common';
import { ZHSProject } from './projects/zhs';
import { CXProject } from './projects/cx';
import { BackgroundProject } from './projects/background';

/** 导出所有的 OCS 核心模块 */
export * from '@ocsjs/core';
/** 导出本包的核心脚本工程 */
export { BackgroundProject } from './projects/background';
export { CommonProject } from './projects/common';
export { ZHSProject } from './projects/zhs';
export { CXProject } from './projects/cx';

export function definedProjects(): Project[] {
	return [ZHSProject, CXProject, CommonProject, BackgroundProject];
}
