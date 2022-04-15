// @ts-check
const path = require('path');
const util = require('util');
const fs = require('fs');

function formatDate () {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getDate().toString().padStart(2, '0')
  ].join('-');
}

/**
 * 日志对象
 * ```js
 * const l = new LoggerCore(app.getPath("logs"), true, 'test') // create `${logs}/YYYY-MM-DD/test.log`
 * const l2 = new LoggerCore(app.getPath("logs"), true,'project','error','1') // create `${logs}/YYYY-MM-DD/project/error/1.log`
 * ```
 * @param {string} basePath 根路径
 * @param {boolean} withConsole 是否同时使用 console 输出
 * @param {string[]} name 日志名，每个代表一个路径
 */
exports.LoggerCore = class LoggerCore {
  basePath
  withConsole
  dest
  constructor (basePath, withConsole = true, ...name) {
    this.basePath = basePath;
    this.withConsole = withConsole;
    this.dest = path.join(this.basePath, '/', formatDate(), '/', name.join('/') + '.log');
  }

  log = (...msg) => this._log(this.dest, '信息', ...msg)
  info = (...msg) => this._log(this.dest, '信息', ...msg)
  error = (...msg) => this._log(this.dest, '错误', ...msg)
  debug = (...msg) => this._log(this.dest, '调试', ...msg)
  warn = (...msg) => this._log(this.dest, '警告', ...msg)

  _log (dest, level, ...msg) {
    const data = msg
      .map((s) => {
        if (typeof s === 'object' || typeof s === 'function') {
          s = util.inspect(s);
        }
        return s;
      })
      .join(' ');
    const txt = `[${level}] ${new Date().toLocaleString()} \t ` + data;

    if (this.withConsole) {
      console.log(txt);
    }

    return new Promise((resolve) => {
      if (!fs.existsSync(path.dirname(dest))) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
      }
      fs.appendFileSync(dest, txt + '\n');
      resolve();
    });
  }
};
