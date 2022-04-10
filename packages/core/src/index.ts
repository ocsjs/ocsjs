import { defineScript } from "./core/define.script";
import { OCSWorker } from "./core/worker";
import { logger } from "./logger";
import { getItem, setItem } from "./core/store";
import { CXScript } from "./script/cx";
import { ZHSScript } from "./script/zhs";
import { QuestionTypeEnum } from "./core/worker/interface";
import { defaultAnswerWrapperHandler } from "./core/worker/answer.wrapper.handler";
import { CommonScript } from "./script/common";
import { store } from "./script";

/** 统一导出 */
export { getItem, setItem, logger, defineScript, OCSWorker, QuestionTypeEnum, defaultAnswerWrapperHandler };
export * as utils from "./core/utils";

export { start, app, panel } from "./main";

/** 默认脚本列表 */
export const definedScripts = [CommonScript, ZHSScript, CXScript];

/**
 * 本地存储
 *
 * 监听 localStorage 的值的变化，当改变时，保存到 window.localStorage.OCS 对象
 */

export { store };
