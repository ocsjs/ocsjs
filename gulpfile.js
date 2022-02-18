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

function webpack() {
    return exec("npm run webpack");
}

function changelog() {
    return exec("npm run changelog");
}

exports.default = series(cleanOutput, tsc, copyLib, webpack, changelog);
