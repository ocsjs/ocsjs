import { defaultsDeep } from "lodash";
import { reactive, watch } from "vue";
import { DefineScript } from "../core/define.script";
import { OCSLocalStorage } from "../core/store";
import { defaultOCSSetting } from "../scripts";

/** 本地存储数据 */
export const localStorage: OCSLocalStorage = reactive(
    // @ts-ignore
    defaultsDeep(JSON.parse(unsafeWindow?.top?.localStorage.getItem("OCS") || "{}"), {
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

/** 试试监听，并保存到本地 */
watch(localStorage, () => {
    // @ts-ignore
    if (unsafeWindow?.top?.localStorage) {
        // @ts-ignore
        unsafeWindow.top.localStorage.OCS = JSON.stringify(localStorage);
    }
});

/** 全局设置 */
export const setting: typeof defaultOCSSetting = defaultsDeep(localStorage.setting, defaultOCSSetting);

// @ts-ignore
localStorage.setting = setting;

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
}

export const store =
    // @ts-ignore
    (unsafeWindow?.top?.OCS?.store as OCSStore) ||
    reactive<OCSStore>({
        localStorage,
        // @ts-ignore
        VERSION: _VERSION_,
        setting: setting,
        currentMedia: null,
        videojs: null,
        scripts: [],
    });
