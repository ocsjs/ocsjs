import { DefineComponent, VNode } from "vue";

/**
 * url glob pattern
 *  @see https://en.wikipedia.org/wiki/Glob_(programming)
 */
export type GlobPattern = string;

/** 脚本路由 */
export interface ScriptRoute {
    /** 名字 */
    name: string;
    /** 页面路径匹配 */
    url: string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[];
    /**
     * 需要传入 script 函数设置参数的路径
     *
     * @see https://www.lodashjs.com/docs/lodash.get
     *
     * @example
     *
     * "智慧树.视频"
     * "超星.学习.视频.默认设置"
     */
    settingPath?: string;

    /** 运行入口 */
    script: (setting: any) => any;
}

/** 脚本面板 */
export interface ScriptPanel {
    /** 名字 */
    name: string;
    /** 页面路径匹配 */
    url: string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[];
    /** 返回一个 html 元素
     *
     * 支持 3种 el 元素， {@link VNode} ， {@link DefineComponent} ， string template
     *
     */
    el: () => DefineComponent<any> | VNode | HTMLElement | string;
    /** 其余的子面板  */
    children?: Omit<ScriptPanel, "url" | "children">[];
}

export interface DefineScript {
    name: string;
    routes?: ScriptRoute[];
    panels?: ScriptPanel[];
}

export const scripts: DefineScript[] = [];

export function defineScript(options: DefineScript) {
    scripts.push(options);
    return options;
}
