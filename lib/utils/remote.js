const { ipcRenderer } = require("electron");
const uuid = require('uuid');
export const Remote = {
    get(property) {
        return ipcRenderer.sendSync('get', [property]);
    },
    set(property, value) {
        return ipcRenderer.sendSync('set', [property, value]);
    },
    call(property, ...args) {
        return ipcRenderer.sendSync('call', [property, ...args]);
    },
    on(event, handler) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '');
        ipcRenderer.send('on', _eventName);
        ipcRenderer.on(_eventName, handler);
    },
    once(event, handler) {
        const _eventName = event + "-" + uuid.v4().replace(/-/g, '');
        ipcRenderer.send('once', _eventName);
        ipcRenderer.once(_eventName, handler);
    },
};
