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
    scripts: DefineScript[];
    /** 搜索结果存储 */
    workResults: WorkResult<any>[];
}

export function createStore(): OCSStore {
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

    /** 监听，并保存到本地 */
    if (typeof global === "undefined") {
        watch(_localStorage, () => {
            localStorage.OCS = JSON.stringify(_localStorage);
        });
    }

    const _store = reactive<OCSStore>({
        localStorage: _localStorage,
        // @ts-ignore
        VERSION: process.env._VERSION_,
        setting: setting,
        currentMedia: null,
        videojs: null,
        scripts: [],
        workResults: [],
    });

    // @ts-ignore
    let store: OCSStore;

    if (typeof global === "undefined") {
        try {
            // @ts-ignore
            store = top?.OCS?.store || _store;
            return store;
        } catch (e) {
            store = _store;
            return store;
        }
    }

    return {} as OCSStore;
}

export const store = createStore();
