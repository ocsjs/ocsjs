const { series } = require('gulp');
const { execOut } = require('./utils');

exports.default = series(() => execOut('vite build -w --emptyOutDir false', { cwd: '../packages/scripts' }));
