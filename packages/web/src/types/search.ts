import { ExtensionResource } from '@ocsjs/common';
import { CommonUserScript } from './user.script';

export interface ScriptSearchEngine {
	name: string;
	homepage: string;
	search: (keyword: string, page: number, size: number) => Promise<CommonUserScript[]>;
}

export interface ExtensionSearchEngine {
	name: string;
	homepage: string;
	search: () => Promise<ExtensionResource[]>;
}
