import { Script } from './script';

export interface ProjectOptions<T extends Record<string, Script>> {
	name: string;
	domains: string[];
	scripts: T;
	/** 是否为网课平台学习程序 ， 仅作为打包后其他工具的解析字段 */
	studyProject?: boolean;
}

export class Project<T extends Record<string, Script> = Record<string, Script>> implements ProjectOptions<T> {
	name: string;
	domains: string[];
	studyProject?: boolean;
	scripts: T;

	constructor({ name, domains, scripts, studyProject }: ProjectOptions<T>) {
		this.name = name;
		this.domains = domains;
		this.scripts = scripts;
		this.studyProject = studyProject;
	}

	static create<T extends Record<string, Script>>(opts: ProjectOptions<T>): Project<T> {
		return new Project(opts);
	}
}
