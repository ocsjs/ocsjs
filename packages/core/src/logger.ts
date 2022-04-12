import { store } from "./script";

export function loggerPrefix(level: "info" | "error" | "warn" | "debug") {
    let extra = level === "error" ? "[错误]" : level === "warn" ? "[警告]" : undefined;

    if (typeof window === "undefined") {
        return [`[OCS][${new Date().toLocaleTimeString()}]${extra || ""}`];
    } else {
        let bgColor;
        bgColor =
            level === "info"
                ? "#2196f3a3"
                : level === "debug"
                ? "#9e9e9ec4"
                : level === "warn"
                ? "#ffc107db"
                : "#f36c71cc";

        return [
            `%c[OCS][${new Date().toLocaleTimeString()}]${extra || ""}`,
            `background:${bgColor};color:white;padding:2px;border-radius:2px`,
        ];
    }
}

export function createLog(level: "info" | "error" | "warn" | "debug", ...msg: any[]) {
    return loggerPrefix(level).concat(...msg);
}

/** 输出 */
export function logger(level: "info" | "error" | "warn" | "debug", ...msg: any[]) {
    if (level === "error") {
        console.error(...createLog(level, msg));
    } else {
        console.log(...createLog(level, msg));
    }

    if (document) {
        let extra =
            level === "info"
                ? "信息"
                : level === "error"
                ? "错误"
                : level === "warn"
                ? "警告"
                : level === "debug"
                ? "调试"
                : "";
        const text = msg.map((s) => {
            const type = typeof s;
            return type === "function"
                ? "[Function]"
                : type === "object"
                ? "[Object]"
                : type === "undefined"
                ? "无"
                : s;
        });
        const logs = store.localStorage.logs;
        if (logs.length > 50) {
            logs.shift();
        }

        logs.push({
            time: Date.now(),
            level,
            extra,
            text: text.join(" "),
        });
    }
}
