// @ts-check

const { LoggerCore } = require('./lib/src/logger.core');
const { ScriptWorker } = require('./lib/src/worker/index');

console.log('...');

/**
 * @type {import('./types').AppStore}
 */
// @ts-ignore
let store = {};
// 脚本工作器
let worker;

// 监听消息
process.on('message', async (message) => {
	// @ts-ignore
	const { action, init, data, uid } = JSON.parse(message);

	if (init) {
		console.log('正在初始化进程...');
		store = data;

		// 初始化脚本工作器
		worker = new ScriptWorker({
			// 拓展路径
			extensionPaths: store.extensionsPaths,
			// 截图间隔
			screenshotPeriod: 1000 * 60
		});

		// 监听监听事件
		worker.on('screenshot', (screenshots) => {
			process.send({ action: 'screenshot', data: screenshots });
		});

		// 初始化日志
		worker.logger = new LoggerCore(store['logs-path'], false, 'script', uid);
		console.log('初始化成功');
	} else {
		// 分配任务
		worker.dispatch(action, data);
	}
});
