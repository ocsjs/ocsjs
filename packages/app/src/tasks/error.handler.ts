import { app } from 'electron';
import { Logger } from '../logger';

/**
 * 处理错误
 */
export function handleError() {
	const logger = Logger('error');

	app.on('render-process-gone', (e, c, details) => {
		logger.error('render-process-gone', details);
		process.exit(0);
	});
	app.on('child-process-gone', (e, details) => {
		logger.error('child-process-gone', details);
		process.exit(0);
	});

	process.on('uncaughtException', (e) => {
		logger.error('rejectionHandled', e);
	});
	process.on('unhandledRejection', (e) => {
		logger.error('unhandledRejection', e);
	});
}
