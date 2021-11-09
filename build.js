const child_process = require("child_process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { program } = require("commander");
program.version("0.0.1").requiredOption("-t, --tag <tagname>", "tag name").requiredOption("-m, --message [message...]", "message of this tag");

run();
function run() {
    console.log("your options list:");
    program.parse();
    const { tag, message } = program.opts();
    console.log({ tag, message });
    rl.question("continue process? (y or n)", (answer) => {
        if (answer.toUpperCase() === "Y") {
            if (tag && message) {
                console.log("\n\tgit commiting...");

                console.log("\n\tversion updating...");

                // 更新版本

                versionChange(path.resolve("./package.json"), tag);

                versionChange(path.resolve("./app/package.json"), tag);

                console.log("\n\tbuilding...");
                out(child_process.spawn("npm run vbed", { shell: true }), () => {
                    console.log("\n\tchange latest message info");
                    // 设置更新包的描述
                    let latest = JSON.parse(fs.readFileSync(path.resolve("./resource/latest.json")));
                    latest.message = message;
                    fs.writeFileSync(path.resolve("./resource/latest.json"), JSON.stringify(latest,null,4));

                    //  git 描述参数
                    const msgs = Array.from(message)
                        .map((m) => ` -m "${m}" `)
                        .join(" ");

                    out(child_process.spawn("git add . && git commit " + msgs, { shell: true }), () => {
                        console.log("\n\tbuild finish!!!");
                    });
                });
            } else {
                console.log("argment is error");
            }
        } else if (answer.toUpperCase() === "N") {
            rl.close();
        } else {
            console.log("that was a wrong answer, try again.");
            run();
        }
    });
}

function out(spawn, callback) {
    spawn.stdout.on("data", (data) => {
        console.log(data.toString());
    });

    spawn.stderr.on("data", (data) => {
        console.error(data.toString());
    });
    spawn.on("exit", callback);
    spawn.on("close", callback);
}

function versionChange(path, tag) {
    let package = JSON.parse(fs.readFileSync(path));
    package.version = tag;
    fs.writeFileSync(path, JSON.stringify(package,null,4));
}
