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
                const msgs = Array.from(message)
                    .map((m) => ` -m "${m}" `)
                    .join(" ");
                out(child_process.spawn("git add . && git commit " + msgs, { shell: true }), () => {
                    console.log("\n\tversion updating...");
                    out(child_process.spawn("npm version " + tag, { shell: true }), () => {
                        // 同时更新 app 进程版本
                        out(child_process.spawn("npm version " + tag, { cwd: "./app/", shell: true }), () => {
                            console.log("\n\tbuilding...");
                            out(child_process.spawn("npm run vbed", { shell: true }), () => {
                                console.log("\n\tchange latest message info...");
                                let latest = JSON.parse(fs.readFileSync(path.resolve("/resource/latest.json")));
                                latest.message = message;
                                fs.writeFileSync(path.resolve("/resource/latest.json"), JSON.stringify(latest));
                            });
                        });
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
        process.exit(0);
    });
    spawn.on("exit", callback);
    spawn.on("close", callback);
}
