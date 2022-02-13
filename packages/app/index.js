const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const path = require("path");

/**
 * electron store
 */
const store = new Store();
exports.store = store;
require("./src/init.store")(store);

function createWindow() {
    return new BrowserWindow({
        minHeight: 400,
        minWidth: 600,
        show: false,
        backgroundColor: "#f8f8f8",
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#fff",
            symbolColor: "black",
        },
        center: true,

        webPreferences: {
            // 关闭拼写矫正
            spellcheck: false,
            webSecurity: true,
            // 开启node
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
}

app.whenReady().then(async () => {
    const win = createWindow();

    if (!app.isPackaged) {
        /**
         * using `mode` options to prevent issue : {@link https://github.com/electron/electron/issues/32702}
         */
        await win.loadURL("http://localhost:3000");
        win.webContents.openDevTools({ mode: "detach" });
    } else {
        await win.loadFile("./public/index.html");
    }
    win.show();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
