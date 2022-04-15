// @ts-check
const { LoggerCore } = require('./logger.core');
const { app } = require('electron');

exports.Logger = function Logger (...name) {
  return new LoggerCore(app.getPath('logs'), true, ...name);
};
