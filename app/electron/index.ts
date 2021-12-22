import { app, dialog, BrowserWindow, BrowserWindow as BW, shell, protocol } from "electron";
import { normalize, resolve } from "path";
import { Logger } from "./logger";
import { BrowserConfig } from "./config";
import { RemoteRouter } from "./router/remote";
import { InitSetting } from "./setting";

const t = Date.now();

let logger: Logger;

process.on("uncaughtException", (err) => {
    logger?.error("uncaughtException", err);
    dialog.showErrorBox("系统错误", err.stack || err.toString());
});

process.on("unhandledRejection", (err: any) => {
    logger?.error("unhandledRejection", err);
    dialog.showErrorBox("系统错误", err.stack || err.toString());
});

// 判断开发环境
var mode = app.isPackaged ? "prod" : "dev";

export let CurrentWindow: BW | undefined = undefined;

// 禁用 GPU 加速
// app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    logger = Logger.of("system");
    logger.info("开发环境:" + mode);
    logger.info("ready 启动用时:" + (Date.now() - t));

    // 加载 logo
    const logo = new BrowserWindow({
        width: 120,
        height: 120,
        minWidth: 120,
        minHeight: 120,
        maximizable: false,
        frame: false,
        center: true,
        alwaysOnTop: true,
        transparent: true,
        webPreferences: {
            // 开启node
            nodeIntegration: true,
        },
    });

    await logger.task("注册协议", async () => {
        return protocol.registerFileProtocol("app", (req: any, callback: any) => {
            const url = req.url.replace("app://", "");
            const _path = normalize(resolve(`./resources/app/public`, url));
            callback({ path: _path });
        });
    });

    logo.loadURL("app://./logo.html");

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow(logo);
    });

    app.on("window-all-closed", function () {
        if (process.platform !== "darwin") app.quit();
    });

    // 以下顺序不能更换！
    // 初始化配置
    logger.task("初始化系统设置", async () => {
        return InitSetting();
    });
    logger.task("渲染进程启动", async () => {
        return createWindow(logo);
    });
    logger.task("初始化远程通信", async () => {
        return RemoteRouter();
    });
});

async function createWindow(logo: BW) {
    const t2 = Date.now();

    CurrentWindow = new BrowserWindow(BrowserConfig);

    load(CurrentWindow);
    function load(win: BW) {
        // Load a remote URL
        const promise = mode === "dev" ? win.loadURL("http://localhost:3000") : win.loadURL("app://./index.html");

        promise
            .then(() => {
                logo.close();
                win.show();

                if (mode === "dev") win.webContents.openDevTools();

                logger.info("show 软件渲染用时:" + (Date.now() - t2));
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
                if (mode === "dev") {
                    setTimeout(() => {
                        logger.info("正在重新加载中!");
                        load(win);
                    }, 2000);
                    logger.error(err);
                } else {
                    dialog.showErrorBox("启动失败", err);
                }
            });
    }
}
