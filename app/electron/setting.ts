import { app } from "electron";
import path from "path";
import { CurrentWindow } from ".";
import { Setting } from "../types";
import { StoreGet, StoreSet } from "../types/setting";
import fs from "fs";
 
import { log } from "electron-log";
import { Version } from "../types/version";

export function initSetting() {
    const setting: Setting = StoreGet("setting");
    // 版本比较，如果当前版本不比本地版本高，则不更新
    const update = new Version(app.getVersion()).greaterThan(new Version(setting.version));
    log(update ? "检测到设置版本需要更新!" : "本地设置无需更新");

    if (setting && !update) {
        const { path, win } = setting.system;
        if (path) {
            for (const key in path) {
                const p = (path as any)[key];
                log("设置路径:" + key, p);
                // 如果文件夹不存在则创建
                if (!fs.existsSync(p)) {
                    log("mkdirs", p);
                    mkdirs(p);
                }
                try {
                    app.setPath(key, p);
                } catch {}
            }
        }

        if (win) {
            CurrentWindow?.setAlwaysOnTop(win.isAlwaysOnTop);
        }
    } else {
        const initSetting: Setting = {
            version: app.getVersion(),
            update: {
                autoUpdate: true,
                hour: 1,
                lastTime: 0,
 
            },
            common: {
                task: {
                    maxTasks: 4,
                },
            },
            script: {
                // 启动设置
                launch: {
                    // 浏览器执行路径
                    binaryPath: getChromePath() || "",
                },
                // 脚本设置
                script: {
                    // 任务间隔3秒
                    taskPeriod: 3 * 1000,
                    cx: {
                        media: {
                            enable: true,
                            playbackRate: 2,
                            mute: true,
                        },
                        ppt: true,
                        book: true,
                        qa: {
                            enable: true,
                            autoReport: true,
                        },
                        work: {

                            enable: true,
                            autoReport: true,
                        },
                        exam: {
                            enable: true,
                            autoReport: true,
                        },
                    },
                    zhs: {
                        // 一个小时自动停止
                        autoStop: 60 * 60 * 1000,
            
                        video: {
                            enable: true,
                            playbackRate: 2,
                            mute: true,
                        },
                        qa: {
                            enable: true,
                            autoReport: true,
                        },
                        work: {
                            enable: true,
                            autoReport: true,
                        },
                        exam: {
                            enable: true,
                            autoReport: true,
                        },
                    },
                },
                // 信息设置
                account: {
                    // 查题码
                    queryToken: "",
                    // ocr 设置
                    ocr: {
                        username: "",
                        password: "",
                    },
                },
            },
            system: {
                win: {
                    isAlwaysOnTop: CurrentWindow?.isAlwaysOnTop() || true,
                },
                path: {
                    userData: app.getPath("userData"),
                    logs: app.getPath("logs"),
                    courseImg: path.resolve(path.join(app.getPath("userData"), "./course-img/")),
                },
            },
        };
        log(initSetting);
        const s = StoreGet("setting");
        log(s);
        // 合并设置
        StoreSet("setting", Object.assign({}, s, initSetting));
    }

    // 清空任务列表
    StoreSet("tasks", []);
    if (!StoreGet("users")) {
        StoreSet("users", []);
    }
}

// 获取 chrome 路径
export function getChromePath() {
    let paths = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], "C:\\Program Files", "C:\\Program Files (x86)"];
    let chromePath = paths.map((p) => path.join(p || "", "\\Google\\Chrome\\Application\\chrome.exe")).find((p) => fs.existsSync(p));
    return chromePath;
}

export function mkdirs(url: string) {
    if (!fs.existsSync(url)) {
        mkdirs(path.resolve(url, "../"));
        fs.mkdirSync(url);
    }
}
