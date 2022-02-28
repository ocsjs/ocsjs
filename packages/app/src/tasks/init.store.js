// @ts-check

const Store = require("electron-store");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * 初始化配置
 */
exports.initStore = function () {
    const store = new Store();
    if (store.get("version") === undefined) {
        store.set("version", app.getVersion());
        store.set("name", app.getName());
        store.set("user-data-path", app.getPath("userData"));
        store.set("exe-path", app.getPath("exe"));
        store.set("logs-path", app.getPath("logs"));

        /** 配置文件路径 */
        store.set("config-path", path.resolve(app.getPath("userData"), "./config.json"));
        
        /** 工作区路径 */
        const workspace = path.resolve(app.getPath("userData"), "./workspace");
        fs.mkdirSync(workspace, { recursive: true });
        store.set("workspace", workspace);

        /** 自动启动 */
        store.set("auto-launch", false);

        /** 置顶 */
        store.set("alwaysOnTop", false);
    }
};
