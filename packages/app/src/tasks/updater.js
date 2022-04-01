// @ts-check

const { default: axios } = require("axios");
const { app, dialog, clipboard } = require("electron");
const semver = require("semver");
const { Logger } = require("../logger");

const path = require("path");
const { downloadFile } = require("../utils");
const { fork } = require("child_process");

exports.updater = async function (win) {
    const logger = Logger("updater");
    const { data } = await axios.get("https://enncy.github.io/online-course-script/infos.json?t=" + Date.now());

    /**
     * @type {any[]}
     */
    const versions = data.versions || [];

    const newVersion = versions.find((version) => semver.lt(app.getVersion(), version.tag));
    /** 自动更新 */
    if (newVersion) {
        const { url, tag, description } = newVersion;
        const { response } = await dialog.showMessageBox(null, {
            title: "OCS软件自动更新程序",
            message: [
                `检测到最新版本：${tag}`,
                "新增功能:",
                description?.["feat"]?.map((s) => `    + ${s}`).join("\n"),
                "修复BUG:",
                description?.["fix"]?.map((s) => `    - ${s}`).join("\n"),
                "",
                "是否更新 ?",
            ].join("\n"),
            buttons: ["下次一定", "立即更新"],
            icon: path.join(app.getAppPath(), "./public/favicon.ico"),
            noLink: true,
            defaultId: 1,
        });

        if (response === 1) {
            const dest = path.join(app.getAppPath(), `../app-${tag}.zip`);
            try {
                /** 下载最新版本 */
                await downloadFile(url, dest, (rate, totalLength, chunkLength) => {
                    win?.webContents?.send("update", tag, rate, totalLength, chunkLength);
                });

                /** 解压缩 */
                const AdmZip = require("adm-zip");
                const zip = new AdmZip(dest);

                new Promise((resolve, reject) => {
                    zip.extractAllTo(path.join(app.getAppPath(), "../"), true);
                    resolve();
                })
                    .then(() => {
                        dialog.showMessageBox(null, {
                            title: "OCS更新程序",
                            message: "即将重启软件...",
                            type: "warning",
                            noLink: true,
                        });
                        setTimeout(() => {
                            app.relaunch();
                            app.quit();
                        }, 2000);
                    })
                    .catch((err) => logger.error("更新失败", err));
            } catch (e) {
                const { response } = await dialog.showMessageBox(null, {
                    title: "OCS更新程序",
                    message: "OCS更新失败:\n" + e,
                    type: "error",
                    noLink: true,
                    defaultId: 1,
                    buttons: ["继续使用", "复制错误日志"],
                });
                if (response === 1) {
                    clipboard.writeText(String(e));
                }
                logger.error("更新失败", e);
            }
        }
    }
};
