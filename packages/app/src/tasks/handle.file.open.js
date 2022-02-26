// @ts-check

const { app } = require("electron");
const fs = require("fs");
const Store = require("electron-store");

/**
 * 检测是否打开了(.ocs)拓展文件
 */
exports.handleOpenFile = function (logger) {
    const file = getFile();
    if (file) {
        logger.info({ msg: "open file", path: file.path, content: file.content });
        const store = new Store();
        /**
         * 添加新的文件到编辑文件区
         */
        const files = store.get("files");
        const newFiles = Array.isArray(files) ? Array.from(files).concat(file) : [file];
        store.set("files", newFiles);
    }
};

function getFile() {
    if (app.isPackaged) {
        if (process.platform === "win32" && process.argv[1]) {
            if (fs.existsSync(process.argv[1])) {
                return {
                    content: fs.readFileSync(process.argv[1]).toString(),
                    path: process.argv[1],
                };
            }
        }
    }
}
