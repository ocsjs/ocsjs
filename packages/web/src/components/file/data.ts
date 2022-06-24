import { store } from './../../store/index';
import { LaunchScriptsOptions } from '@ocsjs/scripts';

import { File } from '../../core/File';
import { ITerminal } from '../terminal';
import { Process } from '../terminal/process';
import { reactive } from 'vue';

export interface FileData {
	process: Process;
	xterm: ITerminal;
	file: File;
	options?: LaunchScriptsOptions;
	error?: {
		message: string;
		line: number;
	};
	stat: {
		running: boolean;
	};
}

export const fileData = reactive(new Map<string, FileData>());

export function createFileData(file: File) {
	const data = fileData.get(file.path);

	if (data) {
		return data;
	} else {
		const newData = {
			file: file,
			process: new Process(file.path, store['logs-path']),
			xterm: new ITerminal(file.path),
			stat: {
				running: false
			}
		};
		fileData.set(file.path, newData);
		return newData;
	}
}
