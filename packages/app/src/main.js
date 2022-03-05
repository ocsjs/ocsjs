// @ts-check
const { BrowserWindow, app } = require("electron");

app.disableHardwareAcceleration();

function createWindow() {
    return new BrowserWindow({
        minHeight: 400,
        minWidth: 600,
        center: true,
        autoHideMenuBar: true,
        show: false,
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

/**
 *
 * @param {{(win:BrowserWindow):Promise<any>}} opener
 * @returns
 */
async function openWindow(opener) {
    const win = createWindow();

    await opener(win);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    win.show();

    return win;
}

exports.createWindow = createWindow;
exports.openWindow = openWindow;
