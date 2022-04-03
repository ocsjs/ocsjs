// @ts-check

const { app, dialog, clipboard } = require("electron");
const semver = require("semver");
const { Logger } = require("../logger");
const AdmZip = require("adm-zip");
const path = require("path");
const { downloadFile } = require("../utils");
const { OCSApi } = require("@ocsjs/common");
const { writeFileSync, rmSync } = require("fs");

exports.updater = async function (win) {
    const logger = Logger("updater");
    const infos = await OCSApi.getInfos();

    const versions = infos.versions || [];

    const newVersion = versions.find((version) => semver.lt(app.getVersion(), version.tag));

    logger.info("updater", { versions, newVersion });

    /** 自动更新 */
    if (newVersion) {
        const { url, tag, description } = newVersion;
        const { response } = await dialog.showMessageBox(null, {
            title: "OCS软件自动更新程序",
            message: [
                `检测到最新版本：${tag}`,
                "新增功能:",
                description?.feat?.map((s) => `    + ${s}`).join("\n"),
                "修复BUG:",
                description?.fix?.map((s) => `    - ${s}`).join("\n"),
                "",
                "是否更新 ?",
            ].join("\n"),
            buttons: ["下次一定", "立即更新"],
            icon: path.join(app.getAppPath(), "./public/favicon.ico"),
            noLink: true,
            defaultId: 1,
        });

        if (response === 1) {
            const appPath = app.getAppPath();
            /** 日志路径 */
            const logPath = path.join(appPath, `../update-${tag}.log`);
            /** 安装路径 */
            const dest = path.join(appPath, `../app-${tag}.zip`);
            /** 解压路径 */
            const unzipDest = path.join(appPath, "./");

            /** 删除app */
            rmSync(unzipDest, { recursive: true, force: true });
            /** 添加日志 */
            writeFileSync(logPath, JSON.stringify(Object.assign(newVersion, { dest, unzipDest }), null, 4));

            logger.info("更新文件 : " + dest);
            logger.info("解压路径 : " + unzipDest);
            try {
                /** 下载最新版本 */
                await downloadFile(url, dest, (rate, totalLength, chunkLength) => {
                    win?.webContents?.send("update", tag, rate, totalLength, chunkLength);
                });

                /** 解压缩 */
                const zip = new AdmZip(dest);

                new Promise((resolve, reject) => {
                    zip.extractAllTo(unzipDest, true);
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
