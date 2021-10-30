const { mkdirSync, readFileSync, writeFileSync, createWriteStream, rmSync } = require("fs");
const path = require("path");

import JSZip from "jszip";
import { Remote } from "./remote";

export function unzip(_path: string, dist: string, rateUpdate?: (rate: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            JSZip.loadAsync(readFileSync(_path), { createFolders: true }).then(async (res) => {
                // 删除 app 文件夹
                rmSync(path.resolve(path.join(dist)), { recursive: true, force: true });
                mkdirSync(path.resolve(path.join(dist)));
                const totalFiles = Reflect.ownKeys(res.files).length;
                let count = 0;
                for (let key in res.files) {
                    const file = res.files[key];
                    if (file.dir) {
                        mkdirSync(path.resolve(path.join(dist, file.name)));
                    } else {
                        writeFileSync(path.resolve(path.join(dist, file.name)), await file.async("nodebuffer"));
                    }

                    rateUpdate?.(count++ / totalFiles);
                }
                resolve(true);
            });
        } catch (err) {
            console.log(err);
            reject(false);
        }
    });
}

export async function zip(dist: string) {
    var zip = new JSZip();
    const date = new Date().toLocaleDateString("zh-CN").split("/").join("-");
    zip.folder(path.resolve(path.join(Remote.app.call("getPath", "logs"), date)));
    zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })
        .pipe(createWriteStream("log-" + +".zip"))
        .on("finish", () => {
            console.log("out.zip written.");
        })
        .on("error", () => {});
}
