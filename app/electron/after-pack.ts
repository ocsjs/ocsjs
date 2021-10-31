import { createWriteStream, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
const yaml = require("yaml");
const archiver = require("archiver");

// 打包文件
export default function AfterAllPack() {
    if (!existsSync(resolve("../resource"))) {
        mkdirSync(resolve("../resource"));
    }
    const latest = readFileSync(resolve("./dist/latest.yml")).toString();
    const { version, files } = yaml.parse(latest);

    writeFileSync(
        resolve("../resource/latest.json"),
        JSON.stringify(
            {
                version,
                size: files[0].size,
                date: Date.now(),
                message: "无",
            },
            null,
            4
        )
    );

    var output = createWriteStream(resolve("../resource/ocs-app-resource.zip"));
    var archive = archiver("zip");

    archive.on("error", function (err: any) {
        throw err;
    });
    archive.directory(resolve("./dist/win-unpacked/resources/app/"), false);
    archive.pipe(output);
    archive.finalize();

    console.log("打包完毕!");
}
