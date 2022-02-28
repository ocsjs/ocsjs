// @ts-check

const { app, ipcMain, BrowserWindow } = require("electron");
const Store = require("electron-store");
const Logger = require("./src/logger");
const { handleOpenFile } = require("./src/tasks/handle.file.open");
const { openWindow } = require("./src/main");
const { remoteRegister } = require("./src/tasks/remote.register");
const { initStore } = require("./src/tasks/init.store");
const { autoLaunch } = require("./src/tasks/auto.launch");

const logger = Logger("main");

const store = new Store();

app.on("second-instance", (event, argv, workingDirectory, additionalData) => {
    logger.debug({ event, argv, workingDirectory, additionalData });
});

task("OCS启动程序", () =>
    Promise.all([
        task("初始化错误处理", () => handleError()),
        task("初始化本地设置", () => initStore()),
        task("初始化自动启动", () => autoLaunch()),
        task("检测启动文件", () => handleOpenFile(logger)),
        (async () => {
            /** @type {BrowserWindow} */
            const win = await task("启动软件", () => open());
            await task("初始化远程通信模块", () => remoteRegister(win));
            win.webContents.send("ready");
        })(),
    ])
);

/** 处理错误 */
function handleError() {
    app.on("render-process-gone", (e) => {
        logger.error("render-process-gone", e);
        process.exit(0);
    });
    app.on("child-process-gone", (e) => {
        logger.error("child-process-gone", e);
        process.exit(0);
    });

    process.on("uncaughtException", (e) => {
        logger.error("rejectionHandled", e);
    });
    process.on("unhandledRejection", (e) => {
        logger.error("unhandledRejection", e);
    });
}

/** 等待显示 */
async function open() {
    return new Promise((resolve) => {
        app.whenReady().then(async () => {
            const win = await openWindow();

            win.setAlwaysOnTop(Boolean(store.get("alwaysOnTop") || false));

            resolve(win);
        });
    });
}

/** 注册任务 */
async function task(name, func) {
    const time = Date.now();
    const res = await func();
    logger.debug(name, "耗时:", Date.now() - time);
    return res;
}
