import { reactive, watch } from "vue";
import { remote } from "../utils/remote";
const Store = require("electron-store");
const { ipcRenderer } = require("electron");

const s = new Store();

export const store = reactive({
    name: s.get("name"),
    version: s.get("version"),
    workspace: s.get("workspace"),
    "config-path": s.get("config-path"),
    "user-data-path": s.get("user-data-path"),
    "exe-path": s.get("exe-path"),
    "logs-path": s.get("logs-path"),
    path: s.get("path"),
    /** 开机自启 */
    "auto-launch": s.get("auto-launch"),
    /** 文件编辑 */
    files: Array.from(s.get("files") || []),
    /** 置顶 */
    alwaysOnTop: s.get("alwaysOnTop"),
    /** win setting */
    win: {
        /** 窗口大小 */
        size: s.get("win")?.["size"] || 1.0,
        /** 开发者工具 */
        devtools: s.get("win")?.["devtools"] || false,
    },
});

ipcRenderer.once("ready", () => {
    setAlwaysOnTop();
    setZoomFactor();
    devtools();
    autoLaunch();

    watch(store, (newStore) => {
        s.store = JSON.parse(JSON.stringify(newStore));
    });

    watch(() => store.alwaysOnTop, setAlwaysOnTop);
    watch(() => store["auto-launch"], autoLaunch);
    watch(() => store.win.size, setZoomFactor);
    watch(() => store.win.devtools, devtools);
});

function setAlwaysOnTop() {
    remote.win.call("setAlwaysOnTop", store.alwaysOnTop);
}

function autoLaunch() {
    remote.methods.call("autoLaunch");
}

function setZoomFactor() {
    remote.webContents.call("setZoomFactor", store.win.size);
}

function devtools() {
    if (store.win.devtools) {
        /**
         * using `mode` options to prevent issue : {@link https://github.com/electron/electron/issues/32702}
         */
        remote.webContents.call("openDevTools", { mode: "detach" });
    } else {
        remote.webContents.call("closeDevTools");
    }
}
