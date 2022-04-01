const { series, src, dest } = require("gulp");
const del = require("del");
const { exec } = require("child_process");

function cleanOutput() {
    return del(["./dist", "./packages/core/lib", "./lib"]);
}

function tsc() {
    return exec("tsc", { cwd: "./packages/core" });
}

function copyLib() {
    return src("./packages/core/lib/**/*").pipe(dest("./lib"));
}

/**
 * 打包浏览器端  js 代码
 */
function webpack() {
    return exec("npm run webpack");
}

/**
 * 打包浏览器端 css 代码
 */
function copyCSS() {
    return src(["./packages/core/src/assets/css/**/*", "./packages/core/src/assets/less/**/*"]).pipe(
        dest("./dist/style")
    );
}

exports.default = series(cleanOutput, tsc, copyLib, copyCSS, webpack);
