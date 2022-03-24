import { OCSWorker } from "./core/worker";
import { logger } from "../logger";
import { getItem, setItem } from "./core/store";
import { CXScript } from "./cx";
import { ZHSScript } from "./zhs";
import { QuestionTypeEnum } from "./core/worker/interface";
import { defaultAnswerWrapperHandler } from "./core/worker/answer.wrapper.handler";
import { defaultOCSSetting } from "./scripts";
import { defaultsDeep } from "lodash";
import { CommonScript } from "./common";

/** 统一导出 */
export { getItem, setItem, logger, OCSWorker, QuestionTypeEnum, defaultAnswerWrapperHandler };
export * as utils from "./core/utils";

export { start, app, panel } from "./bootstrap";

/** 默认脚本列表 */
export const definedScripts = [CommonScript, ZHSScript, CXScript];

/** 全局设置 */
export const setting: typeof defaultOCSSetting = defaultsDeep(getItem("setting"), defaultOCSSetting);
