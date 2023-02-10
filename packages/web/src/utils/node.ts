import type Electron from 'electron';
import type childProcess from 'child_process';

// @ts-ignore
export const inBrowser = typeof global === 'undefined';

if (inBrowser === false) {
	// @ts-ignore
	window.electron = require('electron');
	// @ts-ignore
	window.child_process = require('child_process');
}

// @ts-ignore
export const electron: typeof Electron = window.electron || {
	ipcRenderer: {
		sendSync: () => {},
		send: () => {},
		on: () => {},
		once: () => {}
	}
};
// @ts-ignore
export const child_process: typeof childProcess = window.child_process || {};
