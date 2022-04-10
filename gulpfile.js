const { series, src, dest } = require("gulp");
const del = require("del");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

function cleanOutput() {
    return del(["./dist", "./lib", "./packages/core/lib"]);
}

function build() {
    return Promise.all([exec("tsc", { cwd: "./packages/core" }), exec("npm run build", { cwd: "./packages/core" })]);
}

function copyDist() {
    return src("./packages/core/dist/**/*").pipe(dest("./dist"));
}
function copyLib() {
    return src("./packages/core/lib/**/*").pipe(dest("./lib"));
}

exports.default = series(cleanOutput, build, copyDist, copyLib);
