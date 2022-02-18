export async function sleep(period: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, period);
    });
}


function loggerPrefix(level: "info" | "error" | "warn" | "debug") {
    let bgColor;
    bgColor =
        level === "info" ? "#2196f3a3" : level === "debug" ? "#9e9e9ec4" : level === "warn" ? "#ffc107db" : "#f36c71cc";
    let extra = level === "error" ? "[错误]" : level === "warn" ? "[警告]" : undefined;
    return [
        `%c[OCS][${new Date().toLocaleTimeString()}]${extra || ""}`,
        `background:${bgColor};color:white;padding:2px;border-radius:2px`,
    ];
}


/** 输出 */
export async function logger(level: "info" | "error" | "warn" | "debug", ...msg: any[]) {
    console.log(...loggerPrefix(level), ...msg);
}

/** 匹配 url */
export function urlGlob(pattern: string, input = window.location.href) {
    var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1").replace(/\*/g, ".*"));
    return re.test(input);
}
