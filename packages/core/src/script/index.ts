import defaultsDeep from "lodash/defaultsDeep";
import { reactive, watch } from "vue";
import { DefineScript } from "../core/define.script";
import { OCSLocalStorage } from "../core/store";
import { WorkResult } from "../core/worker/interface";
import { defaultOCSSetting } from "../scripts";

export interface OCSStore {
    /** 版本号 */
    VERSION: string;
    setting: typeof defaultOCSSetting;
    localStorage: OCSLocalStorage;
    /** 当前视频 */
    currentMedia: HTMLMediaElement | null;
    /** 超星 videojs 元素 */
    videojs: HTMLElement | null;
    /** 搜索结果存储 */
    workResults: WorkResult<any>[];
}

/** 本地存储数据 */
const _localStorage: OCSLocalStorage = reactive(
    defaultsDeep(typeof global === "undefined" ? JSON.parse(localStorage.getItem("OCS") || "{}") : {}, {
        logs: [],
        workResults: [],
        /** 是否缩小隐藏面板 */
        hide: false,
        /** 面板位置 */
        position: {
            x: 0,
            y: 0,
        },
    } as OCSLocalStorage)
);

/** 全局设置 */
const setting: typeof defaultOCSSetting = defaultsDeep(_localStorage.setting, defaultOCSSetting);

// @ts-ignore
_localStorage.setting = setting;

const _store = reactive<OCSStore>({
    localStorage: _localStorage,
    // @ts-ignore
    VERSION: process.env._VERSION_,
    setting: setting,
    currentMedia: null,
    videojs: null,
    workResults: [],
});

// @ts-ignore
export let store: OCSStore = _store;

if (typeof global === "undefined") {
    /** 监听，并保存到本地 */
    watch(_localStorage, () => {
        localStorage.OCS = JSON.stringify(_localStorage);
    });
    /** 初始化 store */
    document.addEventListener("readystatechange", () => {
        if (document.readyState === "complete") {
            // @ts-ignore
            store = unsafeWindow?.top?.OCS.store || _store;
        }
    });
}
