import { createWriteStream, existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, unlinkSync, statSync } from "fs";
import { join, resolve } from "path";
const archiver = require("archiver");

// 打包文件
export default function AfterAllPack() {
    const root = resolve("../resource");
    const resourcePath = resolve(join(root, "ocs-app-resource.zip"));
    const latestPath = resolve(join(root, "latest.json"));
    const resourceDistPath = resolve("./dist/win-unpacked/resources/app/");

    if (!existsSync(root)) {
        mkdirSync(root);
    } else {
        rmSync(root, { recursive: true, force: true });
        mkdirSync(root);
        if (existsSync(resourcePath)) {
            unlinkSync(resourcePath);
        }
    }

    var output = createWriteStream(resourcePath);
    var archive = archiver("zip");

    archive.on("error", function (err: any) {
        throw err;
    });
    archive.directory(resourceDistPath, false);
    archive.pipe(output);
    archive.finalize();

    output.on("close", function () {
        console.log("打包完毕!");
        const stat = statSync(resourcePath);
        writeFileSync(
            resolve(latestPath),
            JSON.stringify(
                {
                    version: "",
                    size: stat.size,
                    date: Date.now(),
                    message: "无",
                },
                null,
                4
            )
        );
    });
}
