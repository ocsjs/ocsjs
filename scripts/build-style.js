// @ts-check
/**
 * 样式编译脚本
 *
 * 将 packages/scripts/assets/less/style.less（easy-us 基础样式 + custom.less 自定义样式）
 * 编译为 packages/scripts/assets/css/style.css（userscript 的 STYLE 资源）。
 *
 * 用法：
 *   node scripts/build-style.js          单次编译
 *   node scripts/build-style.js --watch  监听 less 目录，文件变化自动编译（日常开发）
 */
const path = require('path');
const fs = require('fs');
const less = require('less');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'packages/scripts/assets/less/style.less');
const OUTPUT = path.join(ROOT, 'packages/scripts/assets/css/style.css');
const WATCH_DIR = path.join(ROOT, 'packages/scripts/assets/less');

/** 编译 style.less -> style.css */
async function build() {
	const source = fs.readFileSync(ENTRY, 'utf8');
	const result = await less.render(source, {
		filename: ENTRY,
		// 压缩由下游构建（userscript 打包）决定是否处理，这里保留可读格式
		compress: false
	});
	fs.writeFileSync(OUTPUT, result.css);
	console.log(`[style] 编译完成: ${path.relative(ROOT, OUTPUT)} (${(result.css.length / 1024).toFixed(1)} KB)`);
}

/** 监听 less 目录，变化时防抖自动编译 */
function watch() {
	/** @type {NodeJS.Timeout | undefined} */
	let timer;
	fs.watch(WATCH_DIR, { recursive: true }, (_event, filename) => {
		if (!filename || !filename.endsWith('.less')) return;
		clearTimeout(timer);
		timer = setTimeout(() => {
			build().catch((err) => console.error('[style] 编译失败:', err.message));
		}, 200);
	});
	console.log(`[style] 监听中: ${path.relative(ROOT, WATCH_DIR)}（修改 .less 自动编译）`);
}

module.exports = { build, watch };

// 直接执行时：默认单次编译，--watch 进入监听模式
if (require.main === module) {
	(async () => {
		await build();
		if (process.argv.includes('--watch')) {
			watch();
		}
	})().catch((err) => {
		console.error('[style] 编译失败:', err);
		process.exit(1);
	});
}
