import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        /** 取消css代码分离 */
        cssCodeSplit: true,
        /** 输出路径 */
        outDir: "./dist",
        /** 清空输出路径 */
        emptyOutDir: true,
        /** 压缩代码 */
        minify: true,
        /** 打包库， 全局名字为 OCS */
        lib: {
            entry: "./index.ts",
            name: "OCS",
            fileName: (m) => `index.min.js`,
            formats: ["umd"],
        },
        sourcemap: true,
    },
    define: {
        _VERSION_: JSON.stringify("1.0.0"),
    },

    plugins: [vue(), , visualizer()],
});
