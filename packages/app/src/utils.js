/** 异步任务 */

const { Logger } = require("./logger");

const logger = Logger("main");

exports.task = async function task(name, func) {
    const time = Date.now();
    const res = await func();
    logger.debug(name, " 耗时:", Date.now() - time);
    return res;
};
