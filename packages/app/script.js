// @ts-check

const { LoggerCore } = require('./lib/src/logger.core');
const { ScriptWorker } = require('./lib/src/worker/index');
const path = require('path');

const worker = new ScriptWorker(path.resolve('./resources/app/extensions/Tampermonkey'));

worker.on('screenshot', (screenshots) => {
  process.send({ action: 'screenshot', data: screenshots });
});

process.on('message', async (message) => {
  // @ts-ignore
  const { action, data, uid, logsPath } = JSON.parse(message);
  if (worker.logger === undefined) {
    worker.logger = new LoggerCore(logsPath, false, 'script', uid);
  }
  worker.dispatch(action, data);
});
