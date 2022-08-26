// @ts-check
import { LoggerCore } from './logger.core';
import { app } from 'electron';

export function Logger(...name: any[]) {
	return new LoggerCore(app.getPath('logs'), true, ...name);
}
