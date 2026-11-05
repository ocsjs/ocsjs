const { series } = require('gulp');
const util = require('util');
/** @type {(...args: any[])=> Promise<void>} */
// promisify 确保 tsc 非零退出时任务失败（CI 的 build-core.js 同款写法），
// 否则 ChildProcess 的退出码不一定能阻断 husky pre-push 检查
const execOut = util.promisify(require('./utils').execOut);

exports.default = series(
	series(
		() => execOut('tsc', { cwd: '../packages/utils' }),
		() => execOut('tsc', { cwd: '../packages/core' }),
		// 与 CI 的 build-core.js buildPackages 保持一致：packages/scripts 也必须过 tsc，
		// 否则本地预检查通过但 CI 编译报错（vite 构建前的类型检查）
		() => execOut('tsc', { cwd: '../packages/scripts' })
	)
);
