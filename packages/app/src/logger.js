//@ts-check

const { app } = require("electron");
const path = require("path");
const dayjs = require("dayjs");
const util = require("util");
const fs = require("fs");

module.exports = function logger(name) {
    const dest = path.join(app.getPath("logs"), "/", dayjs().format("YYYY-MM-DD"), "/", name + ".log");

    function log(level, ...msg) {
        const data = msg
            .map((s) => {
                if (typeof s === "object" || typeof s === "function") {
                    s = util.inspect(s);
                }
                return s;
            })
            .join("");
        const txt = `[${level}] ${new Date().toLocaleString()} \t ` + data;
        console.log(txt);
        if (!fs.existsSync(path.dirname(dest))) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
        }
        fs.appendFileSync(dest, txt + "\n");
    }

    return {
        log: (...msg) => log("信息", ...msg),
        info: (...msg) => log("信息", ...msg),
        error: (...msg) => log("错误", ...msg),
        debug: (...msg) => log("调试", ...msg),
        warn: (...msg) => log("警告", ...msg),
    };
};
