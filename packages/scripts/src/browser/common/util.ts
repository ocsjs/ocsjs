import { GlobPattern, DefineScript, ScriptPanel, ScriptRoute } from "./define.script";
import interact from "interactjs";

export async function sleep(period: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, period);
    });
}

/** glob 格式进行url匹配 */
export function urlGlob(pattern: string, input = window.location.href) {
    var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, ".*"));
    return re.test(input);
}

/**
 * 匹配url
 * @param target 字符串，正则表达式，glob表达式
 */
export function urlMatch(target: string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[]) {
    const targetURL = Array.isArray(target) ? target : [target];
    return targetURL.some((target) =>
        typeof target === "string" ? urlGlob(target) : target.test(window.location.href)
    );
}

/**
 * 当前的脚本路由
 */
export function getCurrentRoutes(scripts: DefineScript[]): ScriptRoute[] {
    let routes: ScriptRoute[] = [];
    for (const script of scripts) {
        for (const route of script.routes || []) {
            if (urlMatch(route.url)) {
                routes.push(route);
            }
        }
    }

    return routes;
}

/**
 * 当前面板
 */
export function getCurrentPanels(scripts: DefineScript[]) {
    let panels: Pick<ScriptPanel, "name" | "el">[] = [];
    for (const script of scripts) {
        for (const panel of script.panels || []) {
            if (urlMatch(panel.url)) {
                panels.push(panel);

                if (panel.children) {
                    panels = panels.concat(panel.children);
                }
            }
        }
    }
    return panels;
}

/**
 * 添加事件调用监听器
 */
export function addEvent<T>(obj: T, type: keyof T) {
    const origin = obj[type];
    return function () {
        // @ts-ignore
        const res = origin.apply(this, arguments);
        const e = new Event(type.toString());
        window.dispatchEvent(e);
        return res;
    };
}

/**
 * 启用拖动效果
 * @param el 元素
 */
export function dragEnable(el: HTMLElement | string) {
    interact(el).draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true,
                /** 设置边框，防止完全贴合在最边上 */
                offset: { left: 20, top: 100, right: 20, bottom: 20 },
            }),
        ],
        listeners: {
            move: dragMoveListener,
        },
    });

    function dragMoveListener(event: any) {
        var target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // translate the element
        target.style.transform = "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
    }
}
