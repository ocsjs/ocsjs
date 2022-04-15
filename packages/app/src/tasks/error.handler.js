const { app } = require('electron');
const { Logger } = require('../logger');

/**
 * 处理错误
 */
exports.handleError = function () {
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
};
