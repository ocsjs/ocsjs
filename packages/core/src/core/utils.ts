import { GlobPattern, DefineScript, ScriptPanel, ScriptRoute, ScriptPanelChild } from "./define.script";

import { findBestMatch, Rating } from "string-similarity";
import { RawElements, SearchedElements } from "./worker/interface";
import { h } from "vue";
import { logger } from "../logger";

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
    let panels: Pick<ScriptPanel, "name" | "el" | "default" | "priority">[] = [];
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
export function addFunctionEventListener(obj: any, type: string) {
    const origin = obj[type];
    return function () {
        // @ts-ignore
        const res = origin.apply(this, arguments);
        const e = new Event(type.toString());
        // @ts-ignore
        e.arguments = arguments;
        window.dispatchEvent(e);
        return res;
    };
}

/**
 * 删除特殊字符，只保留英文，数字，中文
 * @param str
 * @returns
 */
export function clearString(str: string, ...exclude: string[]) {
    return str
        .trim()
        .toLocaleLowerCase()
        .replace(RegExp(`[^\\u4e00-\\u9fa5A-Za-z0-9${exclude.join("")}]*`, "g"), "");
}

/**
 * 与 {@link domSearchAll } 相同，区别是这个只返回单个元素，而不是一个元素数组
 * @param root
 * @param wrapper
 * @returns
 */
export function domSearch<E extends RawElements>(
    /** 搜索构造器 */
    wrapper: E,
    root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement | null> {
    const obj = Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
        Reflect.set(obj, key, root.querySelector(wrapper[key.toString()]));
    });
    return obj;
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
export function domSearchAll<E extends RawElements>(
    /** 搜索构造器 */
    wrapper: E,
    root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement[]> {
    const obj = Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
        Reflect.set(obj, key, Array.from(root.querySelectorAll(wrapper[key.toString()])));
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
    answers = answers.map(removeRedundant);
    options = options.map(removeRedundant);

    const similar =
        answers.length !== 0
            ? options.map((option) => findBestMatch(option, answers).bestMatch)
            : options.map((opt) => ({ rating: 0, target: "" } as Rating));
    logger("debug", "结果匹配", { answers, options, similar });
    return similar;
}

/**
 * 删除题目选项中开头的冗余字符串
 */
export function removeRedundant(str: string) {
    return str.trim().replace(/[A-Z]{1}[^A-Za-z0-9\u4e00-\u9fa5]+([A-Za-z0-9\u4e00-\u9fa5]+)/, "$1");
}

/**
 * 创建日志面板
 */
export function createTerminalPanel(): ScriptPanelChild {
    return {
        name: "日志",
        el: () => h("div", { class: "terminal" }),
    };
}

/**
 * 元素拖拽
 */

export function dragElement(
    draggable: string | HTMLElement,
    container: string | HTMLElement,
    root: Document | HTMLElement = document
) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    const draggableEl = typeof draggable === "string" ? (root.querySelector(draggable) as HTMLElement) : draggable;
    const containerEl = typeof container === "string" ? (root.querySelector(container) as HTMLElement) : container;

    if (draggableEl) {
        // if present, the header is where you move the DIV from:
        draggableEl.onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        containerEl.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e: any) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e: any) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        containerEl.style.top = containerEl.offsetTop - pos2 + "px";
        containerEl.style.left = containerEl.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * 添加题目答题结果
 */
export function createSearchResultPanel() {
    return {
        name: "搜题结果",
        el: () => h("div", { id: "search-results" }, ["暂无搜索结果"]),
    };
}

/** 清除搜题结果 */
export function clearSearchResult(el: HTMLElement | null) {
    /** 清空内容 */
    if (el) el.innerHTML = "开始搜索，点击题目可以展开查看搜题结果。";
}

export class StringUtils {
    constructor(private _text: string) {}

    /** 删除换行符 */
    static nowrap(str?: string) {
        return str?.replace(/\n/g, "") || "";
    }
    /** 删除特殊字符 */
    static noSpecialChar(str?: string) {
        return str?.replace(/[^\w\s]/gi, "") || "";
    }

    /** 最大长度，剩余显示省略号 */
    static max(str: string, len: number) {
        return str.length > len ? str.substring(0, len) + "..." : str;
    }

    nowrap() {
        this._text = StringUtils.nowrap(this._text);
        return this;
    }

    noSpecialChar() {
        this._text = StringUtils.noSpecialChar(this._text);
        return this;
    }

    max(len: number) {
        this._text = StringUtils.max(this._text, len);
        return this;
    }

    static of(text: string) {
        return new StringUtils(text);
    }

    text() {
        return this._text;
    }
}
