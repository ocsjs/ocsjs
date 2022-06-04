// @ts-check

const { LoggerCore } = require('./lib/src/logger.core');
const { ScriptWorker } = require('./lib/src/worker/index');

const worker = new ScriptWorker();

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
