import { defaultsDeep } from "lodash";
import { reactive, watch } from "vue";
import { DefineScript } from "../core/define.script";
import { OCSLocalStorage } from "../core/store";
import { WorkResult } from "../core/worker/interface";
import { defaultOCSSetting } from "../scripts";

/** 本地存储数据 */
export const _localStorage: OCSLocalStorage = reactive(
    defaultsDeep(JSON.parse(localStorage.getItem("OCS") || "{}"), {
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

/** 监听，并保存到本地 */

watch(_localStorage, () => {
    localStorage.OCS = JSON.stringify(_localStorage);
});

/** 全局设置 */
export const setting: typeof defaultOCSSetting = defaultsDeep(_localStorage.setting, defaultOCSSetting);

// @ts-ignore
_localStorage.setting = setting;

export interface OCSStore {
    /** 版本号 */
    VERSION: string;
    setting: typeof defaultOCSSetting;
    localStorage: OCSLocalStorage;
    /** 当前视频 */
    currentMedia: HTMLMediaElement | null;
    /** 超星 videojs 元素 */
    videojs: HTMLElement | null;
    scripts: DefineScript[];
    /** 搜索结果存储 */
    workResults: WorkResult<any>[];
}

const _store = reactive<OCSStore>({
    localStorage: _localStorage,
    // @ts-ignore
    VERSION: _VERSION_,
    setting: setting,
    currentMedia: null,
    videojs: null,
    scripts: [],
    workResults: [],
});

// @ts-ignore
export let store: OCSStore;

try {
    store = top?.OCS?.store || _store;
} catch (e) {
    store = _store;
}
