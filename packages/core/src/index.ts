import { defineScript } from "./core/define.script";
import { OCSWorker } from "./core/worker";
import { logger } from "./logger";
import { getItem, OCSLocalStorage, setItem } from "./core/store";
import { CXScript } from "./cx";
import { ZHSScript } from "./zhs";
import { QuestionTypeEnum } from "./core/worker/interface";
import { defaultAnswerWrapperHandler } from "./core/worker/answer.wrapper.handler";
import { defaultOCSSetting } from "./scripts";
import { defaultsDeep } from "lodash";
import { CommonScript } from "./common";
import { reactive, watch } from "vue";

/** 统一导出 */
export { getItem, setItem, logger, defineScript, OCSWorker, QuestionTypeEnum, defaultAnswerWrapperHandler };
export * as utils from "./core/utils";

export { start, app, panel } from "./bootstrap";

/** 默认脚本列表 */
export const definedScripts = [CommonScript, ZHSScript, CXScript];

/**
 * 本地存储
 *
 * 监听 localStorage 的值的变化，当改变时，保存到 window.localStorage.OCS 对象
 */

export const localStorage: OCSLocalStorage = reactive(
    defaultsDeep(JSON.parse(window.localStorage.getItem("OCS") || "{}"), {
        logs: [],
        workResults: [],
        hide: false,
    } as OCSLocalStorage)
);

watch(localStorage, () => {
    window.localStorage.OCS = JSON.stringify(localStorage);
});

/** 全局设置 */
export const setting: typeof defaultOCSSetting = defaultsDeep(localStorage.setting, defaultOCSSetting);

// @ts-ignore
localStorage.setting = setting;

export function useOCS(): typeof OCS {
    // @ts-ignore
    return unsafeWindow?.OCS;
}
