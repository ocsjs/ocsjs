



const { ipcRenderer } = require("electron");
const uuid = require('uuid');


export const Remote = {
    get(property: string) {
        return ipcRenderer.sendSync('get', [property])
    },
    set(property: string, value: any) {
        return ipcRenderer.sendSync('set', [property, value])
    },
    call(property: string, ...args: any[]) {
        return ipcRenderer.sendSync('call', [property, ...args])
    },
    on(event: string, handler: () => void) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
        ipcRenderer.send('on', _eventName)
        ipcRenderer.on(_eventName, handler)
    },
    once(event: string, handler: () => void) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '')
        ipcRenderer.send('once', _eventName)
        ipcRenderer.once(_eventName, handler)
    },

}