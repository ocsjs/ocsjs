const { ipcMain, app, dialog, BrowserWindow } = require("electron");
const { autoLaunch } = require("./auto.launch");

/**
 * 注册主进程远程通信事件
 * @param name 事件前缀名称
 * @param target 事件目标
 */
function registerRemoteEvent(name, target) {
    ipcMain
        .on(name + "-get", (event, args) => {
            const property = args[0];
            event.returnValue = target[property];
        })
        .on(name + "-get", (event, args) => {
            const [property, value] = [args[0], args[1]];
            event.returnValue = target[property] = value;
        })
        .on(name + "-call", async (event, args) => {
            const [property, ...value] = [args.shift(), ...args];
            event.returnValue = await target[property](...value);
        });
}

/**
 *
 * @param {BrowserWindow} win
 */
exports.remoteRegister = function (win) {
    registerRemoteEvent("win", win);
    registerRemoteEvent("webContents", win.webContents);
    registerRemoteEvent("app", app);
    registerRemoteEvent("dialog", dialog);
    registerRemoteEvent("methods", {
        autoLaunch,
    });
};
