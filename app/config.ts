

var mode = process.env?.NODE_ENV?.startsWith("dev") ? 'dev' : 'prod'

export const BrowserConfig = {
    width: 800,
    height: 540,

    minWidth: 800,
    minHeight: 540,

    maximizable: false,


    frame: false,
    center: true,
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: mode === 'dev',
    webPreferences: {
        webSecurity: false,
        // 开启node
        nodeIntegration: true,
        contextIsolation: false,
    },

}