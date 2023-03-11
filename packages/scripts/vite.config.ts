import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import { author, description, homepage, license, name } from '../../package.json';

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
		emptyOutDir: false,
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
		banner(bannerContent)
	]
});
