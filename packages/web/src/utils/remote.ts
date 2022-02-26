import { BrowserWindow, App, Dialog, WebContents } from "electron";
const { ipcRenderer } = require("electron");

/**
 * 注册渲染进程远程通信
 * @param eventName
 * @returns
 */
function registerRemote<T>(eventName: string) {
    return {
        // 获取远程变量
        get(property: keyof T) {
            return ipcRenderer.sendSync(eventName + "-get", [property]);
        },
        // 设置远程变量
        set(property: keyof T, value: any) {
            return ipcRenderer.sendSync(eventName + "-set", [property, value]);
        },
        // 调用远程方法
        call(property: keyof T, ...args: any[]) {
            return ipcRenderer.sendSync(eventName + "-call", [property, ...args]);
        },
    };
}

export const remote = {
    // 注册 window 通信
    win: registerRemote<BrowserWindow>("win"),
    // 注册 window 通信
    webContents: registerRemote<WebContents>("webContents"),
    // 注册 app 通信
    app: registerRemote<App>("app"),
    // 注册 dialog 通信
    dialog: registerRemote<Dialog>("dialog"),
    // 暴露方法
    methods: registerRemote<any>("methods"),
};
