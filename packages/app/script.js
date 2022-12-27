// @ts-check

const { LoggerCore } = require('./lib/src/logger.core');
const { ScriptWorker } = require('./lib/src/worker/index');
const path = require('path');
const fs = require('fs');

console.log('...');

/**
 * @type {import('./types').AppStore}
 */
// @ts-ignore
let store = {};
/**
 * @type {ScriptWorker}
 */
let worker;

// 监听消息
process.on('message', async (message) => {
	// @ts-ignore
	const { action, init, data, cachePath } = JSON.parse(message);

	if (init) {
		console.log('正在初始化进程...');
		store = data;
		// 拓展文件夹路径
		const extensionsFolder = path.join(store['user-data-path'], './extensions');
		// 初始化脚本工作器
		worker = new ScriptWorker({
			// 拓展路径
			extensionPaths: fs.readdirSync(extensionsFolder).map((file) => path.join(extensionsFolder, file))
		});

		['launched', 'page-image', 'page-load', 'page-close', 'page-switch'].forEach((action) => {
			// 事件转移
			worker.on(action, (data) => {
				process.send?.({ action, data });
			});
		});

		// 初始化日志
		worker.logger = new LoggerCore(store['logs-path'], false, 'script', path.basename(cachePath));
		console.log('初始化成功');
	} else {
		// 分配任务
		worker.dispatch(action, data);
	}
});
