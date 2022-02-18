const { series } = require("gulp");
const del = require("del");
const { exec } = require("child_process");

function cleanOutput() {
    return del(["./dist", "./packages/scripts/lib", "./CHANGELOG.md"]);
}

function tsc() {
    return exec("tsc", { cwd: "./packages/scripts" });
}

function webpack() {
    return exec("npm run webpack");
}

function changelog() {
    return exec("npm run changelog");
}

exports.default = series(cleanOutput, tsc, webpack, changelog);
