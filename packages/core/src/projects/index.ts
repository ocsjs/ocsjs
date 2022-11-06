import { CommonProject } from './common';
import { CXProject } from './cx';
import { InitProject } from './init';
import { ZHSProject } from './zhs';

export function getDefinedProjects() {
	return [InitProject, CommonProject, CXProject, ZHSProject];
}
