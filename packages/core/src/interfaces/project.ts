import { Script } from './script';

export interface ProjectOptions<T extends Record<string, Script>> {
	name: string;
	domains: string[];
	scripts: T;
}

export class Project<T extends Record<string, Script> = Record<string, Script>> implements ProjectOptions<T> {
	name: string;
	domains: string[];
	scripts: T;

	constructor({ name, domains, scripts }: ProjectOptions<T>) {
		this.name = name;
		this.domains = domains;
		for (const key in scripts) {
			if (Object.prototype.hasOwnProperty.call(scripts, key)) {
				const element = scripts[key];
				element.projectName = name;
			}
		}
		this.scripts = scripts;
	}

	static create<T extends Record<string, Script>>(opts: ProjectOptions<T>): Project<T> {
		return new Project(opts);
	}
}
