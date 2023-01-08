import { Project, RenderProject } from '@ocsjs/core';
import { CommonProject } from './projects/common';
import { ZHSProject } from './projects/zhs';
import { CXProject } from './projects/cx';

export * from '@ocsjs/core';
export { CommonProject } from './projects/common';
export { ZHSProject } from './projects/zhs';
export { CXProject } from './projects/cx';

export function definedProjects(): Project[] {
	return [RenderProject, CommonProject, ZHSProject, CXProject];
}
