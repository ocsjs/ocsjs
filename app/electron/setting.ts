import { app } from "electron";
import log from "electron-log";
import { CurrentWindow } from ".";
import { Setting, StoreSchema } from "../types";
import { store, StoreGet, StoreSet } from "../types/setting";
import { Version } from "../types/version";
import { logger } from "../types/logger";
import { basename, join, resolve } from "path";
import { existsSync, mkdirSync } from "fs";
const { info } = logger("setting");

export function InitSetting() {
    let setting: Setting | undefined = store.get("setting");
    // 版本比较，如果当前版本不比本地版本高，则不更新

    if (setting && setting.version) {
        const update = new Version(app.getVersion()).greaterThan(new Version(setting.version));
        info(update ? "检测到设置版本需要更新!" : "本地设置无需更新");

        if (update) {
            const defaultSetting = GetDefaultSetting();
            info("本地设置:", setting);
            info("更新设置值:", defaultSetting);
            // 合并设置，除了 version 字段 , 其他以原有设置为准，添加新的配置
            setting.version = app.getVersion()
            const newValue: Setting = mergeJSON(defaultSetting, setting);
            StoreSet("setting", newValue);
            info("合并后的设置值:", newValue);

            // 更新赋值
            setting = newValue;
        }
    } else {
        const defaultSetting = GetDefaultSetting();

        info("初始化设置值:", defaultSetting);
        // 初始化配置
        StoreSet("setting", defaultSetting);
        StoreSet("tasks", []);
        StoreSet("users", []);
        initPath(defaultSetting.system.path);
        // 初始化赋值
        setting = defaultSetting;
    }

    const { path, win } = setting.system;
    if (path) initPath(path);
    if (win) CurrentWindow?.setAlwaysOnTop(win.isAlwaysOnTop);

    // 清空任务列表
    StoreSet("tasks", []);
}

export function GetDefaultSetting() {
    const initSetting: Setting = {
        version: app.getVersion(),
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
                // 任务点超时检测 单位小时
                taskTimeoutPeriod: 1,
                cx: {
                    // 是否形成队列
                    study: {
                        enable: true,
                        queue: true,
                        // 复习模式
                        review: false,
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
                            passRate: 60,
                        },
                    },

                    work: {
                        enable: true,
                    },
                    exam: {
                        enable: true,
                    },
                },
                zhs: {
                    // 半个小时自动停止
                    autoStop: 0.5,

                    video: {
                        enable: true,
                        playbackRate: 2,
                        mute: true,
                    },
                    qa: {
                        enable: true,
                        autoReport: true,
                        passRate: 60,
                    },
                    work: {
                        enable: true,
                    },
                    exam: {
                        enable: true,
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
                courseImg: resolve(join(app.getPath("userData"), "./course-img/")),
            },
        },
    };

    return initSetting;
}

function initPath(path: StoreSchema["setting"]["system"]["path"]) {
    if (path) {
        for (const key in path) {
            const p = (path as any)[key];
            info("设置路径:" + key, p);
            // 如果文件夹不存在则创建
            if (!existsSync(p)) {
                info("mkdirs", p);
                mkdirs(p);
            }
            try {
                app.setPath(key, p);
            } catch {}
        }
    }
}

// 获取 chrome 路径
export function getChromePath() {
    let paths = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], "C:\\Program Files", "C:\\Program Files (x86)"];
    let chromePath = paths.map((p) => join(p || "", "\\Google\\Chrome\\Application\\chrome.exe")).find((p) => existsSync(p));
    info("获取本地chrome浏览器路径:", chromePath);
    return chromePath;
}

export function mkdirs(url: string) {
    if (!existsSync(url)) {
        mkdirs(resolve(url, "../"));
        mkdirSync(url);
    }
}

// 遇到相同元素级属性，以后者（main）为准
// 不返还新Object，而是main改变
function mergeJSON(minor: any, main: any) {
    for (var key in minor) {
        if (main[key] === undefined) {
            // 不冲突的，直接赋值
            main[key] = minor[key];
            continue;
        }

        // 冲突了，如果是Object，看看有么有不冲突的属性
        // 不是Object 则以main为主，忽略即可。故不需要else
        if (isJSON(minor[key])) {
            // arguments.callee 递归调用，并且与函数名解耦
            arguments.callee(minor[key], main[key]);
        }
    }

    return main;
}

// 附上工具
function isJSON(target: any) {
    return typeof target == "object" && target.constructor == Object;
}
