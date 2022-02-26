import { Command } from "commander";
import { launchScripts } from "./script";
import fs from "fs";
import path from "path";
import { prefix } from "../browser/logger";
import chalk from "chalk";

const ocs = new Command();

ocs.name("ocs")
    .addHelpText(
        "afterAll",
        `
Example:
    ocs ./test.ocs
    ocs D:/ocs/test.ocs
`
    )
    .argument("file", "path of ocs file")
    .option("--cwd [path]", "working directory of the Node.js process (default: 'process.cwd()')")
    .action(async (config, options) => {
        const cwd = options.cwd || process.cwd();
        const filePath = path.resolve(cwd, config);
        try {
            const file = fs.readFileSync(filePath).toString();
            try {
                const data = JSON.parse(file);
                await launchScripts(data.launch, data.scripts);
            } catch {
                console.log(`\n\t${chalk.bgRedBright(prefix("error"))} 文件格式错误 : ${filePath}\n`);
            }
        } catch {
            console.log(`\n\t${chalk.bgRedBright(prefix("error"))} 文件不存在 : ${filePath}\n`);
        }
    })

    .parse();
