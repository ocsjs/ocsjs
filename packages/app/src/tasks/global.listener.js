const { app } = require("electron");
const { getFileInArguments } = require("./handle.file.open");

exports.globalListenerRegister = function (win) {
    app.on("second-instance", (e, argv) => {
        if (process.platform === "win32") {
            if (win) {
                if (win.isMinimized()) {
                    win.restore();
                }
                if (win.isVisible()) {
                    win.focus();
                } else {
                    win.show();
                }

                const filePath = getFileInArguments(argv);
                win.webContents.send("open-file", filePath);
            }
        }
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
};
