const { series, src, dest } = require("gulp");
const del = require("del");
const { exec } = require("child_process");

function cleanOutput() {
    return del(["./dist", "./packages/scripts/lib", "./lib", "./CHANGELOG.md"]);
}

function tsc() {
    return exec("tsc", { cwd: "./packages/scripts" });
}

function copyLib() {
    return src("./packages/scripts/lib/**/*").pipe(dest("./lib"));
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
    return src([
        "./packages/scripts/src/browser/assets/css/**/*",
        "./packages/scripts/src/browser/assets/less/**/*",
    ]).pipe(dest("./dist/style"));
}

exports.default = series(cleanOutput, tsc, copyLib, copyCSS, webpack);
