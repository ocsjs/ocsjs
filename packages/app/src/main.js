// @ts-check
const { BrowserWindow, app } = require("electron");
const path = require("path");
const { Library } = require("ffi-napi");

app.disableHardwareAcceleration();

function createWindow(show = true) {
    const win = new BrowserWindow({
        title: "ocs",
        icon: path.resolve("./public/favicon.ico"),

        minHeight: 500,
        minWidth: 700,
        center: true,
        frame: false,
        show,
        backgroundColor: "#fff",
        hasShadow: true,

        webPreferences: {
            // 关闭拼写矫正
            spellcheck: false,
            webSecurity: true,
            // 开启node
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    transition(win);

    return win;
}

/**
 * 通过调用window底层方法，实现启动过渡
 *
 *  ffi - napi
 */
function transition(win) {
    var ffi = Library("user32.dll", {
        SetWindowLongA: ["int", ["int", "int", "long"]],
        SetWindowPos: ["int", ["int", "int", "int", "int", "int", "int", "int"]],
    });
    // 细边框
    const WS_THICKFRAME = 0x00040000;
    // 显示窗口。
    const SWP_SHOWWINDOW = 0x0040;
    ffi.SetWindowLongA(win.getNativeWindowHandle().readUint32LE(), -16, WS_THICKFRAME);
    ffi.SetWindowPos(win.getNativeWindowHandle().readUint32LE(), 0, 0, 0, 0, 0, SWP_SHOWWINDOW);
    win.center();
}

exports.createWindow = createWindow;
