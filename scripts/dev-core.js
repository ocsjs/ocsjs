const { series } = require('gulp');
const { execOut } = require('./utils');

exports.default = series(
  () => execOut('vite build -w --clearScreen --emptyOutDir false', { cwd: '../packages/core' })
);
