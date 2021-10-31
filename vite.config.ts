import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ViteComponents, { AntDesignVueResolver } from "vite-plugin-components";
import path from "path";
// import commonjs from "@rollup/plugin-commonjs";
// import resolve from "@rollup/plugin-node-resolve";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        build: {
            outDir: "./app/public",
            rollupOptions: {
                external: ["electron"],
                input: "./index.html",
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            return id.toString().split("node_modules/")[1].split("/")[0].toString();
                        }
                    },
                },
            },
        },
        optimizeDeps: {
            exclude: ["electron"],
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                root: path.resolve(__dirname),
                app: path.resolve(__dirname, "./app"),
            },
        },
        plugins: [
            vue(),
            // commonjs(),
            // resolve(),
            {
                name: "html-transform",
                transformIndexHtml(html) {
                    return html.replace(/(src|href)="\/(.*)"/g, `$1="$2"`);
                },
            },
            ViteComponents({
                customComponentResolvers: [
                    AntDesignVueResolver({
                        importStyle: "css",
                        resolveIcons: true,
                    }),
                ],
            }),
            visualizer(),
        ],
    };
});
