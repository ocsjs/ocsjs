import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';
import { author, description, homepage, license, name } from '../../package.json';
import dotenv from 'dotenv';

const bannerContent = `
/*!
 * ${name} ( ${homepage} )
 * ${description}
 * copyright ${author}
 * license ${license}
 */
`;

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		/** 取消css代码分离 */
		cssCodeSplit: false,
		/** 输出路径 */
		outDir: process.env.VITE_BUILD_PATH,
		/** 清空输出路径 */
		emptyOutDir: false,
		/** 是否压缩代码 */
		minify: false,
		/** 打包库， 全局名字为 OCS */
		lib: {
			entry: './src/index.ts',
			name: 'OCS',
			fileName: () => 'core.js',
			formats: ['umd']
		},
		/**
		 * pnpm link 后 easy-us 被解析到仓库真实路径（如 ../eus/lib），不在 node_modules 内，
		 * 需把该路径纳入 commonjs 转换（easy-us 的 lib 是 CJS 产物）
		 */
		commonjsOptions: {
			include: [/node_modules/, /eus/]
		}
	},

	plugins: [visualizer(), banner(bannerContent)]
});
