import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: '../app/public',
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return id.toString().split('node_modules/')[1].split('/')[0].toString();
					}
				}
			}
		}
	},
	base: '',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			root: path.resolve(__dirname),
			app: path.resolve(__dirname, './app')
		}
	},
	plugins: [vue(), visualizer()]
});
