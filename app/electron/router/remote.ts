import { IPCEventTypes } from './../events/index';

import { IpcMain } from "electron";
import { CurrentWindow } from "../main";


export function RemoteRouter(ipcMain: IpcMain) {
    const win: any = CurrentWindow
    ipcMain
        .on(IPCEventTypes.REMOTE_GET, (event: any, arg: any[]) => {
            const property = arg[0]
            event.returnValue = win[property]

        }).on(IPCEventTypes.REMOTE_SET, (event: any, arg: any[]) => {
            const [property, value] = [arg[0], arg[1]]
            event.returnValue = win[property] = value

        }).on(IPCEventTypes.REMOTE_CALL, (event: any, arg: any[]) => {
            const [property, ...value] = [arg.shift(), ...arg]
            event.returnValue = win[property](value)

        }).on(IPCEventTypes.REMOTE_ON, (event: any, eventName: string) => {
            win.on(eventName.split('-')[0], () => event.reply(eventName))
            
        }).on(IPCEventTypes.REMOTE_ONCE, (event: any, eventName: string) => {
            win.once(eventName.split('-')[0], () => event.reply(eventName))
        })
}


