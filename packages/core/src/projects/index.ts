import { Project } from '../interfaces/project';
import { CommonProject } from './common';
import { CXProject } from './cx';
import { RenderProject } from './init';
import { ZHSProject } from './zhs';

export function getDefinedProjects(): Project[] {
	return [RenderProject, CommonProject, CXProject, ZHSProject];
}
