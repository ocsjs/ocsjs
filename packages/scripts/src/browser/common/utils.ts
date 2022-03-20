import { GlobPattern, DefineScript, ScriptPanel, ScriptRoute } from "./define.script";
import interact from "interactjs";
import { findBestMatch, Rating } from "string-similarity";

export async function sleep(period: number): Promise<void> {
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

/**
 * 删除特殊字符，只保留英文，数字，中文
 * @param str
 * @returns
 */
export function clearString(str: string) {
    return str
        .trim()
        .toLocaleLowerCase()
        .replace(/[^\u4e00-\u9fa5A-Za-z0-9]*/g, "");
}

/**
 * 元素搜索
 *
 * @example
 *
 * const { title , btn , arr } = domSearch(document.body,{
 *      title: '.title'
 *      btn: ()=> '.btn',
 *      arr: ()=> Array.from(document.body.querySelectorAll('.function-arr'))
 * })
 *
 * console.log(title) // 等价于 Array.from(document.body.querySelectorAll('.title'))
 * console.log(btn)// 等价于 Array.from(document.body.querySelectorAll('.btn'))
 */
export function domSearch(
    root: HTMLElement = document.body,
    /** 搜索构造器 */
    wrapper: Record<string, string | HTMLElement[] | { (): string | HTMLElement[] }>
): Record<string, HTMLElement[]> {
    const obj = Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
        let value = wrapper[key.toString()];

        if (typeof value === "function") {
            setValue(value());
        } else {
            setValue(value);
        }

        function setValue(value: string | HTMLElement[]) {
            if (typeof value === "string") {
                Reflect.set(obj, key, Array.from(root.querySelectorAll(value)));
            } else if (Array.isArray(value)) {
                Reflect.set(obj, key, value);
            }
        }
    });
    return obj;
}

/**
 * 答案相似度匹配 , 返回相似度对象列表 Array<{@link Rating}>
 *
 * 相似度计算算法 : https://www.npmjs.com/package/string-similarity
 *
 * @param answers 答案列表
 * @param options 选项列表
 *
 *
 * @example
 *
 * ```js
 *
 * answerSimilar( ['3'], ['1+2','3','4','错误的例子'] ) // [0, 1, 0, 0]
 *
 * answerSimilar( ['hello world','console.log("hello world")'], ['console.log("hello world")','hello world','1','错误的例子'] ) // [1, 1, 0, 0]
 *
 * ```
 *
 */
export function answerSimilar(answers: string[], options: string[]): Rating[] {
    return options.map((option) => findBestMatch(option, answers).bestMatch);
}
