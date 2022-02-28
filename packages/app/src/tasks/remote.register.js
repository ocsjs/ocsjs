const { ipcMain, app, dialog, BrowserWindow } = require("electron");
const Logger = require("../logger");

const { autoLaunch } = require("./auto.launch");

/**
 * 注册主进程远程通信事件
 * @param name 事件前缀名称
 * @param target 事件目标
 */
function registerRemoteEvent(name, target) {
    const logger = Logger("remote");
    ipcMain
        .on(name + "-get", (event, args) => {
            logger.info({ event: name + "-get", args });
            const property = args[0];
            event.returnValue = target[property];
        })
        .on(name + "-set", (event, args) => {
            logger.info({ event: name + "-set", args });
            const [property, value] = [args[0], args[1]];
            event.returnValue = target[property] = value;
        })
        .on(name + "-call", async (event, args) => {
            logger.info({ event: name + "-call", args });
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
