import { LaunchScriptsOptions } from "@ocsjs/scripts";
import { ChildProcess } from "child_process";
import { ITerminal } from ".";
import { Instance as Chalk } from "chalk";
import { Page } from "playwright";
import { message } from "ant-design-vue";
const child_process = require("child_process") as typeof import("child_process");
const chalk = new Chalk({ level: 2 });

/**
 * 运行进程
 */
export class Process {
    shell: ChildProcess | undefined;
    launched: boolean = false;
    options?: LaunchScriptsOptions;

    constructor(public uid: string, public logsPath: string) {}

    /**
     * 使用 child_process 运行 ocs 命令
     */
    init(xterm: ITerminal) {
        const shell = child_process.fork("./script.js", { stdio: ["ipc"] });
        shell.stdout?.on("data", (data: any) => xterm.write(data));
        shell.stderr?.on("data", (data: any) => xterm.write(chalk.redBright(data)));
        this.shell = shell;
    }

    /**
     * 给子进程发送信息
     * @param action 事件名
     * @param data 数据
     */
    send(
        action: "launch" | "close" | "call",
        data: LaunchScriptsOptions | { name: keyof Page; args: any[] } | undefined
    ) {
        console.log("process send :", { action, data });

        this.shell?.send(
            JSON.stringify({
                action,
                data: JSON.stringify(data),
                uid: this.uid,
                logsPath: this.logsPath,
            })
        );
    }

    /** 启动文件 */
    launch(options: LaunchScriptsOptions) {
        this.send("launch", options);
        this.launched = true;
        this.options = options;
    }

    /** 关闭进程 */
    close() {
        this.send("close", undefined);
        this.launched = false;
    }

    /** 显示当前的浏览器  */
    bringToFront() {
        if (this.launched && this.options) {
            child_process.exec(
                `"${this.options.launchOptions.executablePath}" --user-data-dir="${this.options.userDataDir}" "about:blank"`
            );
        } else {
            message.warn("必须先启动文件");
        }
    }
}
