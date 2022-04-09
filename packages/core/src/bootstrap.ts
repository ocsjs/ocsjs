import { createApp, App as VueApp } from "vue";
import { definedScripts } from ".";
import { logger } from "./logger";
import { DefineScript } from "./core/define.script";
import { getCurrentRoutes, dragElement } from "./core/utils";
import App from "./views/App.vue";
import { store } from "./views/store";

/** 面板元素 */
export let panel: HTMLElement | undefined | null;
/** vue app 元素 */
export let app: VueApp;

export interface StartOptions {
    /**
     * 面板样式 url | string
     */
    style?: string;
    /**
     * 是否开启面板拖拽
     */
    draggable?: boolean;
    /** 脚本列表 */
    scripts?: DefineScript[];
}

let loaded = false;

/**
 * 显示面板，检测是否存在需要运行的脚本，并执行
 */
export function start(options?: StartOptions) {
    if (top === window) {
        if (window.document.readyState === "complete" && !loaded) {
            loaded = true;
            showPanels(options);
            logger("info", `OCS ${OCS.VERSION} 加载成功`);
        } else {
            /** 加载后执行 */
            document.addEventListener("readystatechange", () => {
                if (document.readyState !== "loading" && !loaded) {
                    loaded = true;
                    showPanels(options);
                    logger("info", `OCS ${OCS.VERSION} 加载成功`);
                }
            });
        }
    }

    executeScripts(options?.scripts);
}

/**
 * 显示面板
 */
export function showPanels(options?: StartOptions) {
    const { draggable, scripts = definedScripts } = options || {};

    store.scripts = scripts;

    app = createApp(App);
    panel = document.createElement("ocs-panel");
    document.body.appendChild(panel);
    app.mount(panel);

    if (draggable) {
        dragElement("ocs-panel .ocs-panel-header", panel);
        dragElement("ocs-panel .ocs-panel-footer", panel);
        dragElement(".ocs-icon", panel);
    }
}

/**
 * 执行脚本
 */
export function executeScripts(scripts: DefineScript[] = definedScripts) {
    const routes = getCurrentRoutes(scripts);
    if (window.document.readyState === "complete") {
        load();
    } else {
        /** 加载后执行 */
        window.addEventListener("load", load);
    }

    function load() {
        for (const route of routes.filter((route) => route.onload)) {
            route.onload?.();
        }
    }

    /** 立即执行 */
    for (const route of routes.filter((route) => route.start)) {
        route.start?.();
    }
}
