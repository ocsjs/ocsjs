
import { app, BrowserWindowConstructorOptions } from 'electron';
var mode = app.isPackaged ? 'prod' : 'dev'

export const BrowserConfig: BrowserWindowConstructorOptions = {
    width: 800,
    height: 540,

    minWidth: 800,
    minHeight: 540,

    maximizable: false,

    icon:'./public/favicon.ico',
    frame: false,
    center: true,
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
        webSecurity: false,
        // 开启node
        nodeIntegration: true,
        contextIsolation: false,
      
    },

}