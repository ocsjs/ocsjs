import { Project, RenderProject } from '@ocsjs/core';
import { CommonProject } from './projects/common';
import { ZHSProject } from './projects/zhs';
import { CXProject } from './projects/cx';

/** 导出所有的 OCS 核心模块 */
export * from '@ocsjs/core';
/** 导出本包的核心脚本工程 */
export { CommonProject } from './projects/common';
export { ZHSProject } from './projects/zhs';
export { CXProject } from './projects/cx';

export function definedProjects(): Project[] {
	return [RenderProject, CommonProject, ZHSProject, CXProject];
}
