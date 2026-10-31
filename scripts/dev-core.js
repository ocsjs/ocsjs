const { parallel, watch } = require('gulp');
const { execOut } = require('./utils');
const { createDevUserScript } = require('./build-core');

// 一键开发：同时监听源码（vite build watch）与样式（less -> style.css 自动编译）
// 以及入口文件（entry.*.js 的内容会原样内联进用户脚本，见 script.builder.ts，
// 改动后必须重新生成 ocs.dev.user.js，否则 Tampermonkey 中仍是旧入口代码）
exports.default = parallel(
	() => execOut('vite build -w --emptyOutDir false', { cwd: '../packages/scripts' }),
	() => execOut('node build-style.js --watch', { cwd: __dirname }),
	() =>
		watch(
			['packages/scripts/entry.js', 'packages/scripts/entry.dev.js', 'packages/scripts/entry.common.js'],
			createDevUserScript
		)
);
