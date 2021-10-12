

import { BrowserWindow, App, Dialog } from 'electron';
import { registerRemoteEventNames } from "app/lib/types/index";
 
const { ipcRenderer } = require('electron')
const uuid = require('uuid');
 

function registerRemote<T>(eventName: string) {

    const events = registerRemoteEventNames(eventName)

    return {
        get(property: keyof T) {
            return ipcRenderer.sendSync(events.get, [property])
        },
        set(property: keyof T, value: any) {
            return ipcRenderer.sendSync(events.set, [property, value])
        },
        call(property: keyof T, ...args: any[]) {
            return ipcRenderer.sendSync(events.call, [property, ...args])
        },
        on(event: keyof T, handler: () => void) {
            const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
            ipcRenderer.send(events.on, _eventName)
            ipcRenderer.on(_eventName, handler)
        },
        once(event: keyof T, handler: () => void) {
            const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
            ipcRenderer.send(events.once, _eventName)
            ipcRenderer.once(_eventName, handler)
        },
    }
}

export const Remote = {
    win: registerRemote<BrowserWindow>('win'),
    app: registerRemote<App>('app'),
    dialog: registerRemote<Dialog>('dialog'),

    // get(property: keyof BrowserWindow) {
    //     return ipcRenderer.sendSync(IPCEventTypes.REMOTE_GET, [property])
    // },
    // set(property: keyof BrowserWindow, value: any) {
    //     return ipcRenderer.sendSync(IPCEventTypes.REMOTE_SET, [property, value])
    // },
    // call(property: keyof BrowserWindow, ...args: any[]) {
    //     return ipcRenderer.sendSync(IPCEventTypes.REMOTE_CALL, [property, ...args])
    // },
    // on(event: keyof BrowserWindow, handler: () => void) {
    //     const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
    //     ipcRenderer.send(IPCEventTypes.REMOTE_ON, _eventName)
    //     ipcRenderer.on(_eventName, handler)
    // },
    // once(event: keyof BrowserWindow, handler: () => void) {
    //     const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
    //     ipcRenderer.send(IPCEventTypes.REMOTE_ONCE, _eventName)
    //     ipcRenderer.once(_eventName, handler)
    // },

}
 