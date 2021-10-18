import { registerRemoteEventNames, ScriptRemoteType } from "app/types";
import { BrowserWindow, App, Dialog } from "electron";

const { ipcRenderer } = require("electron");
const uuid = require("uuid");

/**
 * 注册渲染进程远程通信
 * @param eventName
 * @returns
 */
function registerRemote<T>(eventName: string) {
    const events = registerRemoteEventNames(eventName);

    return {
        // 获取远程变量
        get(property: keyof T) {
            return ipcRenderer.sendSync(events.get, [property]);
        },
        // 设置远程变量
        set(property: keyof T, value: any) {
            return ipcRenderer.sendSync(events.set, [property, value]);
        },
        // 调用远程方法
        call(property: keyof T, ...args: any[]) {
            return ipcRenderer.sendSync(events.call, [property, ...args]);
        },
        // 监听远程事件
        on(event: keyof T, handler: () => void) {
            // 指定事件ID
            const _eventName = event + "-" + uuid.v4().replace(/-/g, "");
            ipcRenderer.send(events.on, _eventName);
            ipcRenderer.on(_eventName, handler);
        },
        // 监听一次远程事件
        once(event: keyof T, handler: () => void) {
            // 指定事件ID
            const _eventName = event + "-" + uuid.v4().replace(/-/g, "");
            ipcRenderer.send(events.once, _eventName);
            ipcRenderer.once(_eventName, handler);
        },
    };
}

export const Remote = {
    // 注册 window 通信
    win: registerRemote<BrowserWindow>("win"),
    // 注册 app 通信
    app: registerRemote<App>("app"),
    // 注册 dialog 通信
    dialog: registerRemote<Dialog>("dialog"),
    // 注册 脚本 通信
    script: registerRemote<ScriptRemoteType>("script"),
};
