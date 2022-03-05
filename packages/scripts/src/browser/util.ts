import { createLog } from "../logger";

export async function sleep(period: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, period);
    });
}

/** 输出 */
export function logger(level: "info" | "error" | "warn" | "debug", ...msg: any[]) {
    console.log(createLog(level, msg));
}

/** 匹配 url */
export function urlGlob(pattern: string, input = window.location.href) {
    var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, ".*"));
    return re.test(input);
}
