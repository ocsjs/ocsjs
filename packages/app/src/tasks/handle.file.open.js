// @ts-check

const Store = require('electron-store');
const { existsSync, statSync } = require('fs');

/**
 * 检测是否打开了(.ocs)拓展文件
 */
exports.handleOpenFile = function (argv) {
  const file = exports.getFileInArguments(argv);
  if (file) {
    const store = new Store();
    /**
     * 添加新的文件到编辑文件区
     */
    const files = store.get('files');
    const newFiles = Array.isArray(files) ? Array.from(files).concat(file) : [file];
    store.set('files', newFiles);
  }

  return file;
};

/**
 *
 * @param {string[]} argv
 * @returns
 */
exports.getFileInArguments = function (argv) {
  argv.shift();
  for (const arg of argv) {
    if (!arg.startsWith('-')) {
      if (existsSync(arg) && statSync(arg).isFile()) {
        return arg;
      }
    }
  }
};
