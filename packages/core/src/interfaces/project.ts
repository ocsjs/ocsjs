import { Script } from './script';

export interface Project {
	name: string;
	level?: number;
	domains: string[];
	scripts: Script[];
}
