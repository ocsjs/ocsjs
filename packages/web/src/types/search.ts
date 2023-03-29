import { CommonUserScript } from './user.script';

export interface ScriptSearchEngine {
	name: string;
	homepage: string;
	search: (keyword: string, page: number, size: number) => Promise<CommonUserScript[]>;
}
