const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 600,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#f8f8f8",
            symbolColor: "black",
        },

        webPreferences: {
            devTools: true,
        },
    });

    win.loadFile("./public/index.html")
        .then((result) => {
            win.webContents.openDevTools();
        })
        .catch((err) => {});
}

app.whenReady().then(() => {
    createWindow();

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
