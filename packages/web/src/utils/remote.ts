import { BrowserWindow, App, Dialog, WebContents, Clipboard } from "electron";
import { notify } from "./notify";
const { ipcRenderer } = require("electron");

/**
 * 注册渲染进程远程通信
 * @param eventName
 * @returns
 */
function registerRemote<T>(eventName: string) {
    function sendSync(channel: string, ...args: any[]): any {
        console.log(channel, args);
        let res = ipcRenderer.sendSync(channel, ...args);

        if (res?.error) {
            notify("remote 模块错误", res.error, "remote", { copy: true, type: "error" });
        }
        return res;
    }

    return {
        // 获取远程变量
        get(property: keyof T) {
            return sendSync(eventName + "-get", [property]);
        },
        // 设置远程变量
        set(property: keyof T, value: any) {
            return sendSync(eventName + "-set", [property, value]);
        },
        // 调用远程方法
        call(property: keyof T, ...args: any[]) {
            return sendSync(eventName + "-call", [property, ...args]);
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
    // 日志
    logger: registerRemote<Console>("logger"),
};
