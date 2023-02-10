// @ts-check

const { ScriptWorker } = require('./lib/src/worker/index');

const worker = new ScriptWorker();

// 监听消息
process.on(
	'message',
	(
		/** @type {{event: any, args: any}} */
		message
	) => {
		/** 根据 event 名直接调用方法 */
		worker[message.event](...message.args);
	}
);
