import exp from "constants";
import { get, set } from "lodash";
import { ScriptSettings } from "../scripts";

let listeners: any[] = [];

/**
 * object path
 * @param path @see https://www.lodashjs.com/docs/lodash.set
 * @param value
 */
export function setItem(path: string | string[], value: any) {
    const loc: OCSLocalStorage = JSON.parse(localStorage.getItem("OCS") || "{}");
    set(loc, path, value);
    localStorage.setItem("OCS", JSON.stringify(loc));

    listeners
        .filter((l) => l.path === path)
        .forEach((listener) => {
            listener(value);
        });
}

/**
 * object path
 * @param path @see https://www.lodashjs.com/docs/lodash.get
 * @param defaults 默认值
 * @returns
 */
export function getItem(path: string | string[], defaultValue?: any) {
    const loc: OCSLocalStorage = JSON.parse(localStorage.getItem("OCS") || "{}");
    return get(loc, path) || defaultValue;
}

/**
 * OCS 本地存储类型
 */
export interface OCSLocalStorage {
    // 网课平台类型
    platform?: string;
    // 本地设置
    setting?: ScriptSettings;
}
