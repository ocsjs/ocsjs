import { logger } from '../logger';
import { defineScript } from './define.script';
import { OCR } from './ocr';
import { OCSWorker } from './worker';
import { defaultAnswerWrapperHandler } from './worker/answer.wrapper.handler';

/** 统一导出 */
export * as utils from './utils';
export { logger, defineScript, OCSWorker, defaultAnswerWrapperHandler, OCR };
