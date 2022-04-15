const { series, src, dest } = require('gulp');
const del = require('del');
const util = require('util');
const execOut = util.promisify(require('./utils').execOut);

function cleanOutput () {
  return del(['../dist', '../lib', '../packages/core/lib'], { force: true });
}

function build () {
  return Promise.all([execOut('tsc', { cwd: '../packages/core' }), execOut('npm run build', { cwd: '../packages/core' })]);
}

function copyDist () {
  return src('../packages/core/dist/**/*').pipe(dest('../dist'));
}
function copyLib () {
  return src('../packages/core/lib/**/*').pipe(dest('../lib'));
}

exports.default = series(cleanOutput, build, copyDist, copyLib);
