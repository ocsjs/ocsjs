import { ipcMain,  app, dialog } from "electron";

import { CurrentWindow } from "..";
import { registerRemoteEventNames } from "../../types";
import { logger } from "../../types/logger"
 
import { ScriptRemote } from "./scripts";
const { info, error } = logger("remote");
/**
 * 注册主进程远程通信事件
 * @param name 事件前缀名称，需要传递到 {@link registerRemoteEventNames}
 * @param target 事件目标
 */
export function registerRemoteEvent(name: string, target: any) {
    const events = registerRemoteEventNames(name);
    info("remote事件注册", name);
    ipcMain
        .on(events.get, (event: any, arg: any[]) => {
            info(events.get, arg);
            const property = arg[0];
            event.returnValue = target[property];
        })
        .on(events.set, (event: any, arg: any[]) => {
            info(events.set, arg);
            const [property, value] = [arg[0], arg[1]];
            event.returnValue = target[property] = value;
        })
        .on(events.call, async (event: any, arg: any[]) => {
            info(events.call, arg);
            const [property, ...value] = [arg.shift(), ...arg];
            event.returnValue = await target[property](...value);
        })
        .on(events.on, (event: any, eventName: string) => {
            info(events.on, eventName);
            // eventName 格式为 : 监听事件-UUID，uuid 是为了区分渲染进程中的监听事件，防止渲染进程中一次监听被多次调用
            target.on(eventName.split("-")[0], () => event.reply(eventName));
        })
        .on(events.once, (event: any, eventName: string) => {
            info(events.once, eventName);
            // eventName 格式为 : 监听事件-UUID，uuid 是为了区分渲染进程中的监听事件，防止渲染进程中一次监听被多次调用
            target.once(eventName.split("-")[0], () => event.reply(eventName));
        });
}

/**
 *  注册远程事件，渲染进程通过同样的方式注册，然后进行 ipc 通信，只需要相应的事件名称一致即可
 * ***
 * 具体实现参考：{@link registerRemoteEventNames} 和 {@link registerRemoteEvent}
 *
 * @example
 * ipcMain.on('app-get',(e,args)=>{
 *    returnValuee. =   qpp[args] // isAlwaysOnTop : true or false
 * })
 * ipcRenderer.sendSync('app-get','isAlwaysOnTop');
 *
 *
 */
export function RemoteRouter() {
    const win: any = CurrentWindow;
    const script = ScriptRemote;
    registerRemoteEvent("script", script);
    registerRemoteEvent("app", app);
    registerRemoteEvent("win", win);
    registerRemoteEvent("dialog", dialog);
}
