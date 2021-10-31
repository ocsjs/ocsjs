import { createWriteStream, existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, unlinkSync } from "fs";
import { join, resolve } from "path";
const yaml = require("yaml");
const archiver = require("archiver");

// 打包文件
export default function AfterAllPack() {
    const root = resolve("../resource");
    const resourcePath = resolve(join(root, "ocs-app-resource.zip"));
    const latestPath = resolve(join(root, "latest.json"));
    const resourceDistPath = resolve("./dist/win-unpacked/resources/app/");
    const latestDistPath = resolve("./dist/latest.yml");

    if (!existsSync(root)) {
        mkdirSync(root);
    } else {
        rmSync(root, { recursive: true, force: true });
        mkdirSync(root);
        if (existsSync(resourcePath)) {
            unlinkSync(resourcePath);
        }
    }
    const latest = readFileSync(latestDistPath).toString();
    const { version, files } = yaml.parse(latest);

    writeFileSync(
        resolve(latestPath),
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

    var output = createWriteStream(resourcePath);
    var archive = archiver("zip");

    archive.on("error", function (err: any) {
        throw err;
    });
    archive.directory(resourceDistPath, false);
    archive.pipe(output);
    archive.finalize();

    console.log("打包完毕!");
}
