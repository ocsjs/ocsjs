import { log } from "console";
import { app } from "electron";
import path from "path";
import { CurrentWindow } from ".";
import { Setting } from "../types";
import { StoreGet, StoreSet } from "../types/setting";
import fs from "fs";

export function initSetting() {
    const setting: Setting = StoreGet("setting");
    if (setting) {
        const { path, win } = setting.system;
        if (path) {
            for (const key in path) {
                log("设置路径:" + key, (path as any)[key]);
                app.setPath(key, (path as any)[key]);
            }
        }

        if (win) {
            CurrentWindow?.setAlwaysOnTop(win.isAlwaysOnTop);
        }
    } else {
        const initSetting: Setting = {
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
                },
            },
        };

        StoreSet("setting", initSetting);
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
