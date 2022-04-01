//@ts-check
/** 异步任务 */

const { join } = require("path");
const { default: axios } = require("axios");
const { createWriteStream, existsSync } = require("fs");
const { finished } = require("stream/promises");
const { Logger } = require("./logger");

const taskLogger = Logger("task");
const logger = Logger("utils");

exports.task = async function (name, func) {
    const time = Date.now();
    const res = await func();
    taskLogger.info(name, " 耗时:", Date.now() - time);
    return res;
};

/**
 * 下载文件
 * @param {string} fileURL 文件路径
 * @param {string} outputURL 输出路径
 * @param {(rate,totalLength,chunkLength)=>void} rateHandler 速率监听器
 * @returns
 */
exports.downloadFile = async function (fileURL, outputURL, rateHandler) {
    logger.info("downloadFile", fileURL, outputURL);
    const writer = createWriteStream(outputURL);
    return new Promise(async (resolve, reject) => {
        const { data, headers } = await axios.get(fileURL, {
            responseType: "stream",
        });
        const totalLength = parseInt(headers["content-length"]);
        let chunkLength = 0;
        data.on("data", (chunk) => {
            chunkLength += String(chunk).length;
            const rate = ((chunkLength / totalLength) * 100).toFixed(2);
            rateHandler(rate, totalLength, chunkLength);
        });

        data.pipe(writer);
        resolve(finished(writer));
    });
};
