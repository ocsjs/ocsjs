import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: "../app/public",
    },
    base: "",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            root: path.resolve(__dirname),
            app: path.resolve(__dirname, "./app"),
        },
    },
    plugins: [vue()],
});
