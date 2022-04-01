import { createApp, defineComponent, ref, h, isVNode, App, watch, computed, KeepAlive, onMounted, nextTick } from "vue";
import { definedScripts } from ".";
import { logger } from "./logger";
import { createFooter, createHeaders, createContainers } from "./core/create.element";
import { DefineScript } from "./core/define.script";
import { getCurrentPanels, addFunctionEventListener, getCurrentRoutes, domSearchAll, dragElement } from "./core/utils";

/** 面板元素 */
export let panel: HTMLElement | undefined | null;
/** vue app 元素 */
export let app: App;

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

/**
 * 显示面板，检测是否存在需要运行的脚本，并执行
 */
export function start(options?: StartOptions) {
    if (top === window) {
        if (window.document.readyState === "complete") {
            showPanels(options);
            logger("info", "OCS 加载成功");
        } else {
            /** 加载后执行 */
            document.addEventListener("readystatechange", () => {
                if (document.readyState === "interactive") {
                    showPanels(options);
                    logger("info", "OCS 加载成功");
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
    const { style = "", draggable, scripts = definedScripts } = options || {};

    app = createApp(createPanel());
    panel = document.createElement("ocs-panel");
    document.body.appendChild(panel);
    app.mount(panel);

    if (draggable) {
        dragElement("ocs-panel .draggable", panel);
    }

    function createPanel() {
        return defineComponent({
            data() {
                const panels = ref(getCurrentPanels(scripts));

                history.pushState = addFunctionEventListener(history, "pushState");
                history.replaceState = addFunctionEventListener(history, "replaceState");

                window.addEventListener("pushState", () => (panels.value = getCurrentPanels(scripts)));
                window.addEventListener("replaceState", () => (panels.value = getCurrentPanels(scripts)));

                /**
                 * 对面板进行处理
                 *
                 * 当所有面板都为 default 状态的时候，才显示 default 面板
                 *
                 * 否则显示其他面板
                 */
                const currentPanels = computed(() => {
                    return (
                        panels.value.every((panel) => panel.default === true)
                            ? panels.value
                            : panels.value.filter((panel) => !panel.default)
                    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));
                });

                const activeKey = ref(currentPanels.value[0]?.name);

                /** 当面板发生改变时重绘 */
                watch(currentPanels, () => {
                    const key = currentPanels.value.find((p) => p.name === activeKey.value);

                    /** 缓存页面，  如果存在相同的面板，则不切换，否则切换回到第一个页面 */
                    if (!key) {
                        activeKey.value = currentPanels.value[0].name;
                    }
                    nextTick(update);
                });

                watch(activeKey, update);
                onMounted(() => nextTick(update));

                // 切换页面，和标题样式改变
                function update() {
                    const { panelElements, panelTitles } = domSearchAll({
                        panelElements: "[panel]",
                        panelTitles: "[paneltitle]",
                    });
                    panelElements.forEach((_, i) => {
                        panelElements[i].style.display = "none";
                        panelTitles[i].classList.remove("active");
                    });
                    const index = panelElements.findIndex((el) => el.getAttribute("panel") === activeKey.value);
                    if (index !== -1) {
                        panelElements[index].style.display = "block";
                        panelTitles[index].classList.add("active");
                    }
                }

                return { panels, activeKey, currentPanels };
            },
            render() {
                const footer = createFooter();
                const styleElement =
                    /** 添加样式 */
                    /[a-zA-z]+:\/\/[^\s]*/.test(style)
                        ? h("link", {
                              href: style,
                              type: "text/css",
                              rel: "stylesheet",
                          })
                        : h("style", style);

                const main = [
                    /** 添加 tab 栏 */
                    createHeaders(
                        this.currentPanels.map((panel) =>
                            h(
                                "div",
                                {
                                    panelTitle: panel.name,
                                    class: "title",
                                    onClick: () => {
                                        // 隐藏其他面板，显示点击的面板
                                        this.activeKey = panel.name;
                                    },
                                },
                                panel.name
                            )
                        )
                    ),

                    h(KeepAlive, [
                        /** 显示面板 */
                        createContainers(
                            this.currentPanels.map((panel, i) => {
                                const el = panel.el();

                                let element;
                                if (isVNode(el)) {
                                    element = defineComponent({ render: () => el });
                                } else if (typeof el === "string") {
                                    element = defineComponent({ template: el });
                                } else {
                                    element = el;
                                }

                                return h(element, {
                                    style: {
                                        display: "none",
                                    },
                                    panel: panel.name,
                                });
                            })
                        ),
                    ]),

                    footer,
                ];

                return h("div", [styleElement, ...main]);
            },
        });
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
