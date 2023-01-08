import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import { author, description, homepage, license, name } from '../../package.json';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const bannerContent = `
/*!
 * ${name} ( ${homepage} )
 * ${description}
 * copyright ${author}
 * license ${license}
 */
`;

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@ocsjs/core': '../core/src/index.ts'
		}
	},

	build: {
		/** 取消css代码分离 */
		cssCodeSplit: false,
		/** 输出路径 */
		outDir: '../../dist',
		/** 清空输出路径 */
		emptyOutDir: true,
		/** 是否压缩代码 */
		minify: false,
		/** 打包库， 全局名字为 OCS */
		lib: {
			entry: './src/index.ts',
			name: 'OCS',
			fileName: () => 'index.js',
			formats: ['umd']
		}
	},

	plugins: [
		// commonjs(),
		visualizer(),
		banner(bannerContent),
		{
			// 将打包后的 unicode 中文全部转换成正常中文
			name: 'escape-code',
			closeBundle() {
				const content = readFileSync(path.resolve(__dirname, '../../dist/index.js')).toString();
				writeFileSync(
					path.resolve(__dirname, '../../dist/index.js'),

					// eslint-disable-next-line no-eval
					JSON.parse(
						JSON.stringify(`${content}`).replace(/\\\\u([\d\w]{4})/gi, function (match, grp) {
							return String.fromCharCode(parseInt(grp, 16));
						})
					)
				);
			}
		}
	]
});
