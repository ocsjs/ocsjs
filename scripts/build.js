const { series, src, dest } = require("gulp");
const del = require("del");
const zip = require("gulp-zip");
const { exec } = require("child_process");

function buildWeb() {
    return exec("pnpm build", { cwd: "../packages/web" });
}

function buildApp() {
    return exec("pnpm dist", { cwd: "../packages/app" });
}

function cleanOutput() {
    return del(["../packages/app/dist/app.zip"], { force: true });
}

function packResource() {
    return src("../packages/app/dist/win-unpacked/resources/app/**/*")
        .pipe(zip("app.zip"))
        .pipe(dest("../packages/app/dist"));
}

exports.default = series(cleanOutput, buildWeb, buildApp, packResource);
