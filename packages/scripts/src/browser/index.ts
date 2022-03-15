import { defineComponent, h, isVNode, ref, createApp, computed, watch, App } from "vue";
import { logger } from "../logger";
import { createContainers, createFooter, createHeaders, createNote } from "./common/create.element";
import { DefineScript } from "./common/define.script";
import { getItem, setItem } from "./common/store";
import { getCurrentRoutes, getCurrentPanels, addEvent, dragEnable } from "./common/util";
import { CXScript } from "./cx";
import { ZHSScript } from "./zhs";

export { getCurrentRoutes, getCurrentPanels, getItem, setItem, logger };

/** 面板元素 */
export let panel: HTMLElement | undefined | null;
/** vue app 元素 */
export let app: App;
/** 默认脚本列表 */
export const definedScripts = [ZHSScript, CXScript];

interface StartOptions {
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
    showPanels(options);
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
        dragEnable(panel);
    }

    function createPanel() {
        return defineComponent({
            data() {
                const panels = ref(getCurrentPanels(scripts));
                const activeKey = ref(panels.value[0]?.name);

                history.pushState = addEvent(history, "pushState");
                history.replaceState = addEvent(history, "replaceState");

                window.addEventListener("pushState", () => (panels.value = getCurrentPanels(scripts)));
                window.addEventListener("replaceState", () => (panels.value = getCurrentPanels(scripts)));

                watch(panels, () => {
                    activeKey.value = panels.value[0]?.name;
                });

                return { panels, activeKey };
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
                const about = createNote("- 进入相应的学习，作业，或者考试页面即可", "- 此窗口可以使用鼠标拖拽");

                const main =
                    this.panels.length === 0
                        ? [createHeaders(h("div", { class: "title" }, "OCS助手")), createContainers(about), footer]
                        : [
                              /** 添加 tab 栏 */
                              createHeaders(
                                  this.panels.map((panel) =>
                                      h(
                                          "div",
                                          {
                                              class: ["title", this.activeKey === panel.name ? "active" : ""].join(" "),
                                              onClick: () => {
                                                  // 隐藏其他面板，显示点击的面板
                                                  this.activeKey = panel.name;
                                              },
                                          },
                                          panel.name
                                      )
                                  )
                              ),

                              /** 显示面板 */
                              createContainers(
                                  this.panels.map((panel, i) => {
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
                                          panel: panel.name,

                                          style: {
                                              display: this.activeKey === panel.name ? "block" : "none",
                                          },
                                      });
                                  })
                              ),

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

    for (const route of routes) {
        let setting;
        if (route.settingPath) {
            setting = getItem(route.settingPath);
        }
        route.script(setting);
    }
}
