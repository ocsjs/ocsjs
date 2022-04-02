const { series } = require("gulp");
const del = require("del");
const { exec } = require("child_process");
const path = require("path");

function cleanOutput() {
    return del(["../packages/common/lib", "../packages/core/lib", "../packages/scripts/lib"], { force: true });
}

exports.default = series(
    cleanOutput,
    series(
        () => exec("tsc", { cwd: "../packages/common" }),
        () => exec("tsc", { cwd: "../packages/core" }),
        () => exec("tsc", { cwd: "../packages/scripts" })
    )
);
