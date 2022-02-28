const { app } = require("electron");
const Store = require("electron-store");

/** 配置自动启动 */
function autoLaunch() {
    if (app.isPackaged) {
        const store = new Store();
        app.setLoginItemSettings({
            openAtLogin: Boolean(store.get("auto-launch") || false),
        });
    }
}

exports.autoLaunch = autoLaunch;
