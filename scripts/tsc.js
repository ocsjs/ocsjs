const { series } = require('gulp');
const { execOut } = require('./utils');

exports.default = series(
	series(
		() => execOut('tsc', { cwd: '../packages/utils' }),
		() => execOut('tsc', { cwd: '../packages/core' })
	)
);
