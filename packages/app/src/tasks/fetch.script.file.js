// @ts-check

const { default: fetch } = require("node-fetch");
const { Logger } = require("../logger");
const Store = require("electron-store");

exports.fetchScriptFile = function () {
    const logger = Logger("fetch-script");

    fetch("https://cdn.jsdelivr.net/npm/ocsjs@latest/public/index.js")
        .then((result) => {
            if (result.status === 200 || result.status === 304) {
                result
                    .text()
                    .then((result) => {
                        const store = new Store();
                        store.set("script", result);
                    })
                    .catch((err) => {
                        logger.error("脚本获取失败", err);
                    });
            } else {
                logger.error("脚本获取失败", "资源文件不存在");
            }
        })
        .catch((err) => {
            logger.error("脚本获取失败", err);
        });
};
