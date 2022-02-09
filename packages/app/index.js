const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const Store = require("electron-store");

app.commandLine.appendSwitch("enable-webgl");

/**
 * electron store
 */
const store = new Store();
exports.store = store;

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
            nodeIntegration: true,
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

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.on("window-minimize", function (event) {
    BrowserWindow.fromWebContents(event.sender).minimize();
});

ipcMain.on("window-maximize", function (event) {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.isMaximized() ? window.unmaximize() : window.maximize();
});

ipcMain.on("window-close", function (event) {
    BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on("window-is-maximized", function (event) {
    event.returnValue = BrowserWindow.fromWebContents(event.sender).isMaximized();
});
