 
import { app } from "electron";
import path from "path";
import { CurrentWindow } from ".";
import { Setting } from "../types";
import { StoreGet, StoreSet } from "../types/setting";
import fs from "fs";
import { Version } from "./updater";
import { log } from "electron-log";

export function initSetting() {
    const setting: Setting = StoreGet("setting");
    // 版本比较，如果当前版本不比本地版本高，则不更新
    const update = new Version(app.getVersion()).greaterThan(new Version(setting.version));
    if (setting && !update) {
        const { path, win } = setting.system;
        if (path) {
            for (const key in path) {
                const p = (path as any)[key];
                log("设置路径:" + key, p);
                // 如果文件夹不存在则创建
                if (!fs.existsSync(p)) {
                    log("mkdirs",p)
                    mkdirs(p);
                }
                try{
                    app.setPath(key, p);
                }catch{}
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
                    // 看视频
                    video: true,
                    // 做题
                    qa: true,
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

        // 合并设置
        StoreSet("setting", Object.assign(initSetting, StoreGet("setting")));
    }

    if (!StoreGet("task")) {
        StoreSet("task", []);
    }
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
