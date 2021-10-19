import { info, log, error } from "console";
import { app, protocol, BrowserWindow, BrowserWindow as BW, shell } from "electron";
import path from "path";
import { Setting } from "../types";
import fs from "fs";

import { BrowserConfig } from "./config";
import { RemoteRouter } from "./router/remote";
import { UpdateRouter } from "./router/update";
import { StoreGet, StoreSet } from "../types/setting";
import { initSetting } from "./setting";
const Store = require("electron-store");
const t = Date.now();

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
        info({ path: resolve });
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

    // 初始化更新程序
    UpdateRouter();
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
            .then((result: any) => {
                win.show();
                win.webContents.openDevTools();
                log("启动用时:" + (Date.now() - t));
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
                    log("reloading!");
                    load();
                }, 2000);
                error(err);
            });
    }

    return win;
}
