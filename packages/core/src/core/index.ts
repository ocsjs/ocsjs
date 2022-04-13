import { defineScript } from "./define.script";
import { OCSWorker } from "./worker";
import { logger } from "../logger";
import { QuestionTypeEnum } from "./worker/interface";
import { defaultAnswerWrapperHandler } from "./worker/answer.wrapper.handler";

/** 统一导出 */
export { logger, defineScript, OCSWorker, QuestionTypeEnum, defaultAnswerWrapperHandler };
export * as utils from "./utils";
