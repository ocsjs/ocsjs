
import { BrowserWindow } from 'electron';

const { ipcRenderer } = require('electron')
const uuid = require('uuid');
import {IPCEventTypes} from 'app/electron/events/index';
 
export const Remote = {
    get(property: keyof BrowserWindow) {
        return ipcRenderer.sendSync(IPCEventTypes.REMOTE_GET, [property])
    },
    set(property: keyof BrowserWindow, value: any) {
        return ipcRenderer.sendSync(IPCEventTypes.REMOTE_SET, [property, value])
    },
    call(property: keyof BrowserWindow, ...args: any[]) {
        return ipcRenderer.sendSync(IPCEventTypes.REMOTE_CALL, [property, ...args])
    },
    on(event: keyof BrowserWindow, handler: () => void) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
        ipcRenderer.send(IPCEventTypes.REMOTE_ON, _eventName)
        ipcRenderer.on(_eventName, handler)
    },
    once(event: keyof BrowserWindow, handler: () => void) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
        ipcRenderer.send(IPCEventTypes.REMOTE_ONCE, _eventName)
        ipcRenderer.once(_eventName, handler)
    },

}