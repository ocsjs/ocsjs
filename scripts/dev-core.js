const { parallel } = require('gulp');
const { execOut } = require('./utils');

// 一键开发：同时监听源码（vite build watch）与样式（less -> style.css 自动编译）
exports.default = parallel(
	() => execOut('vite build -w --emptyOutDir false', { cwd: '../packages/scripts' }),
	() => execOut('node build-style.js --watch', { cwd: __dirname })
);
