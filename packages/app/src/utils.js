/** 异步任务 */

const { Logger } = require("./logger");

const logger = Logger("task");

exports.task = async function task(name, func) {
    const time = Date.now();
    const res = await func();
    logger.info(name, " 耗时:", Date.now() - time);
    return res;
};
