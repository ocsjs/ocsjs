import { app, protocol, BrowserWindow, BrowserWindow as BW, shell } from "electron";
import path from "path";
import { logger } from "../types/logger"
import { log } from "electron-log";
import { BrowserConfig } from "./config";
import { RemoteRouter } from "./router/remote";
import { initSetting } from "./setting";
const t = Date.now();

const { info, error, success, warn } = logger("system");
 
// process.on("uncaughtException", (err) => {
//     log("uncaughtException",err);
//     error("uncaughtException", err);
// });

// process.on("unhandledRejection", (err) => {
//     log("unhandledRejection",err);
//     error("unhandledRejection", err);
// });

// 判断开发环境
var mode = app.isPackaged ? "prod" : "dev";

info("开发环境:" + mode);

export let CurrentWindow: BW | undefined = undefined;

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    // 注册协议
    protocol.registerFileProtocol("app", (req: any, callback: any) => {
        const url = req.url.replace("app://", "");
        const resolve = path.normalize(path.resolve(`./resources/app/public`, url));
        // info("app协议模式:", { path: resolve });
        callback({ path: resolve });
    });

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    app.on("window-all-closed", function () {
        if (process.platform !== "darwin") app.quit();
    });

    // 以下顺序不能更换！
    // 初始化配置
    initSetting();
    CurrentWindow = await createWindow();
    // 初始化远程通信
    RemoteRouter();
});

async function createWindow() {
    const win: any = new BrowserWindow(BrowserConfig);

    load();
    function load() {
        // Load a remote URL
        const promise = mode === "dev" ? win.loadURL("http://localhost:3000") : win.loadURL("app://./index.html");

        promise
            .then(() => {
                win.show();
                win.webContents.openDevTools();
                info("启动用时:" + (Date.now() - t));
                // 拦截页面跳转
                win.webContents.on("will-navigate", (e: { preventDefault: () => void }, url: any) => {
                    e.preventDefault();
                    shell.openExternal(url);
                });
                win.webContents.setWindowOpenHandler((data: { url: any }) => {
                    shell.openExternal(data.url);
                    return {
                        action: "deny",
                    };
                });
            })
            .catch((err: any) => {
                setTimeout(() => {
                    info("正在重新加载中!");
                    load();
                }, 3000);
                error(err);
            });
    }

    return win;
}
