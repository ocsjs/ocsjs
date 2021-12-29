// @ts-check

const child_process = require("child_process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * ocs 打包工程
 */

const { program } = require("commander");
program.version("0.0.1").requiredOption("-t, --tag <tagname>", "tag name").requiredOption("-m, --message [message...]", "message of this tag");

run();
function run() {
    // 列出参数
    console.log(chalk.blueBright("your options list:"));
    program.parse();
    const { tag, message } = program.opts();
    console.log({ tag, message });
    // 交互
    rl.question("continue process? (y or n)", async (answer) => {
        if (answer.toUpperCase() === "Y") {
            if (tag && message) {
                // 1. 更新版本
                console.log(chalk.greenBright("\n\tversion updating..."));
                versionChange(path.resolve("./package.json"), tag);
                versionChange(path.resolve("./app/package.json"), tag);

                // 2. 打包軟件
                console.log(chalk.greenBright("\n\tproject building..."));
                await out(child_process.spawn("npm run vbed", { shell: true }));

                // 3. 设置更新包的描述
                console.log(chalk.greenBright("\n\tlatest message info changing..."));
                let latest = JSON.parse(fs.readFileSync(path.resolve("./resource/latest.json")).toString());
                latest.message = message;
                fs.writeFileSync(path.resolve("./resource/latest.json"), JSON.stringify(latest, null, 4));

                // 4. git add 和 git commit 描述参数
                console.log(chalk.greenBright("\n\tgit committing..."));
                const msgs = Array.from(message)
                    .map((m) => ` -m "${m}" `)
                    .join(" ");
                await out(child_process.spawn("git add . && git commit " + msgs, { shell: true }));

                // 5. 标签
                console.log(chalk.greenBright("\n\tgit tagging..."));
                await out(child_process.spawn("git tag " + tag, { shell: true }));

                console.log(chalk.greenBright("\n\tbuild finish!!!"));
            } else {
                console.log(chalk.redBright("argment is error"));
            }
        } else if (answer.toUpperCase() === "N") {
            rl.close();
        } else {
            console.log(chalk.redBright("that was a wrong answer, try again."));
            run();
        }
    });
}

// 命令行输出
async function out(spawn) {
    return new Promise((resolve, reject) => {
        try {
            spawn.stdout.on("data", (data) => {
                console.log(data.toString());
            });

            spawn.stderr.on("data", (data) => {
                console.error(data.toString());
            });
            spawn.once("exit", resolve);
            spawn.once("close", resolve);
        } catch (e) {
            reject(e);
        }
    });
}

// 更改版本
function versionChange(path, tag) {
    let package = JSON.parse(fs.readFileSync(path).toString());
    package.version = tag;
    fs.writeFileSync(path, JSON.stringify(package, null, 4));
}
