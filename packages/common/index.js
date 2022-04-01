"use strict";
// @ts-check
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidBrowserPaths = void 0;
var existsSync = require("fs").existsSync;
var join = require("path").join;
// 获取 chrome 路径
function getValidBrowserPaths() {
    return {
        "谷歌浏览器(chrome)": resolveBrowserPath("/Google/Chrome/Application/chrome.exe"),
        "微软浏览器(Microsoft Edge)": resolveBrowserPath("/Microsoft/Edge/Application/msedge.exe"),
    };
}
exports.getValidBrowserPaths = getValidBrowserPaths;
function resolveBrowserPath(commonPath) {
    return [
        join(process.env.ProgramFiles, commonPath),
        join(process.env["ProgramFiles(x86)"], commonPath),
        join("C:\\Program Files", commonPath),
        join("C:\\Program Files (x86)", commonPath),
    ].find(function (p) { return existsSync(p); });
}
