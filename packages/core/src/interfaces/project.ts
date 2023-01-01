import { Script } from './script';

export interface ProjectOptions<T extends Record<string, Script>> {
	name: string;
	level?: number;
	domains: string[];
	scripts: T;
}

export class Project<T extends Record<string, Script> = Record<string, Script>> implements ProjectOptions<T> {
	name: string;
	level?: number;
	domains: string[];
	scripts: T;

	constructor({ name, level, domains, scripts }: ProjectOptions<T>) {
		this.name = name;
		this.level = level;
		this.domains = domains;
		this.scripts = scripts;
	}

	static create<T extends Record<string, Script>>(opts: ProjectOptions<T>): Project<T> {
		return new Project(opts);
	}
}
