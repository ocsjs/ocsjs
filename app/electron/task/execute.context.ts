import { error } from "electron-log";
import { Page, TimeoutError } from "puppeteer-core";
import { LoginScript } from "../../script/login/types";
import { StoreGet, StoreSet } from "../../types/setting";
import { RunnableTask } from "./runnable.task";

export class ExecuteContext<R extends LoginScript> {
    // 当前的任务
    currentTask: RunnableTask<R>;

    // 启动任务
    launchTask: RunnableTask<R>;

    // 是否继续
    isContinue: boolean;

    constructor(launchTask: RunnableTask<R>) {
        this.launchTask = launchTask;
        this.currentTask = launchTask;
        this.isContinue = true;
    }

    // 运行任务
    public exec(): RunnableTask<R> {
        new Promise(async (resolve, reject) => {
            process.on("uncaughtException", (err) => this.scriptErrorHandler(err));

            process.on("unhandledRejection", (err: any, promise) => {
                promise.catch((err) => this.scriptErrorHandler(err));
            });

            this.launchTask.process();
            const script = await this.launchTask.target({
                task: this.launchTask,
            });

            if (this.launchTask.children) {
                // 执行任务
                this.execChildTask(this.launchTask.children, script);
            } else {
                this.launchTask.error("没有任务！");
            }
        });

        // 保存任务
        let localTasks = StoreGet("tasks") || [];
        localTasks.push(this.launchTask.toString());
        StoreSet("tasks", localTasks);

        return this.launchTask.toString();
    }

    // 运行子任务
    public async execChildTask(task: RunnableTask<R>, script: LoginScript) {
        this.currentTask = task;

        if (this.isContinue) {
            if (task.timeout) {
                setTimeout(() => {
                    if (task.status !== "finish") {
                        task.error("任务执行超时！请重试！");
                        this.isContinue = false;
                    }
                }, task.timeout);
            }

            // 如果是阻塞任务
            if (task.needBlock) {
                try {
                    task.process();

                    const value = await task.target({ task, script });

                    task.finish(value);
                    if (task.children) await this.execChildTask(task.children, script);
                } catch (err) {
                    error(task.name + " 任务出错:", err);
                    task.error(err as any);
                }
            }
            // 如果是非阻塞任务
            else {
                task.process();
                task.target({ task, script })
                    .then((result) => {
                        task.finish(result);
                        if (task.children) this.execChildTask(task.children, script);
                    })
                    .catch((err) => {
                        error(task.name + " 任务出错:", err);
                        task.error(err);
                    });
            }
        }
    }

    scriptPageErrorHandler(page: Page) {
        page.on("pageerror", (err) => {
            this.currentTask.error("页面内部js脚本执行出错 : " + err);
        });
    }

    scriptErrorHandler(err: any) {
        let errMsg = err.toString();
      
        if (err.toString().indexOf("Most likely the page has been closed") !== -1 || err.toString().indexOf("Target closed") !== -1) {
            errMsg = "任务运行错误，可能浏览器已关闭，或浏览器访问页面出错，请重启。";
            this.currentTask.error(errMsg);
            this.currentTask.destroy();
        } else if (err.toString().indexOf("Execution context was destroyed") !== -1) {
            errMsg = "任务运行错误，可能是页面刷新导致，请刷新页面或者重启。";
        }
        this.currentTask.error(errMsg);
        error(this.currentTask.name + " 任务异常 unhandledRejection", err);
    }
}
