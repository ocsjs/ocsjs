import { Worker } from "./common/worker/worker";
import { logger } from "../logger";
import { getItem, setItem } from "./common/store";
import { CXScript } from "./cx";
import { ZHSScript } from "./zhs";
import { QuestionTypeEnum } from "./common/worker/interface";
import { defaultAnswerWrapperHandler } from "./common/worker/question.resolver";

/** 统一导出 */
export { getItem, setItem, logger, Worker, QuestionTypeEnum, defaultAnswerWrapperHandler };
export * as utils from "./common/utils";

export { start, app, panel } from "./bootstrap";

/** 默认脚本列表 */
export const definedScripts = [ZHSScript, CXScript];
