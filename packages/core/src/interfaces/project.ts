import { Script } from './script';

export interface Project {
	name: string;
	domains: string[];
	scripts: Script[];
}
