import { ipcMain, IpcMain, app, dialog } from "electron"
 
import { CurrentWindow } from ".."
import { registerRemoteEventNames } from "../../../types"

 


export function registerRemoteEvent(name: string, target: any) {
    const events = registerRemoteEventNames(name)

    ipcMain
        .on(events.get, (event: any, arg: any[]) => {
            const property = arg[0]
            event.returnValue = target[property]

        }).on(events.set, (event: any, arg: any[]) => {
            const [property, value] = [arg[0], arg[1]]
            event.returnValue = target[property] = value

        }).on(events.call, (event: any, arg: any[]) => {
            const [property, ...value] = [arg.shift(), ...arg]
            event.returnValue = target[property](...value)

        }).on(events.on, (event: any, eventName: string) => {
            target.on(eventName.split('-')[0], () => event.reply(eventName))

        }).on(events.once, (event: any, eventName: string) => {
            target.once(eventName.split('-')[0], () => event.reply(eventName))
        })
}

export function RemoteRouter(ipcMain: IpcMain) {
    const win: any = CurrentWindow
    const _app: any = app

    registerRemoteEvent('app',_app)
    registerRemoteEvent('win',win)
    registerRemoteEvent('dialog',dialog)
}


