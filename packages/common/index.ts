// @ts-check

const { existsSync } = require("fs");
const { join } = require("path");

// 获取 chrome 路径
export function getValidBrowserPaths() {
    return {
        "谷歌浏览器(chrome)": resolveBrowserPath("/Google/Chrome/Application/chrome.exe"),
        "微软浏览器(Microsoft Edge)": resolveBrowserPath("/Microsoft/Edge/Application/msedge.exe"),
    };
}

function resolveBrowserPath(commonPath: string) {
    return [
        join(process.env.ProgramFiles, commonPath),
        join(process.env["ProgramFiles(x86)"], commonPath),
        join("C:\\Program Files", commonPath),
        join("C:\\Program Files (x86)", commonPath),
    ].find((p) => existsSync(p));
}
