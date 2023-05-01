const { series } = require('gulp');
const { execOut } = require('./utils');

exports.default = series(
	series(
		() => execOut('tsc', { cwd: '../packages/common' }),
		() => execOut('tsc', { cwd: '../packages/app' }),
		() => execOut('tsc', { cwd: '../packages/web' }),
		() => execOut('tsc', { cwd: '../packages/utils' }),
		() => execOut('tsc', { cwd: '../packages/core' })
	)
);
