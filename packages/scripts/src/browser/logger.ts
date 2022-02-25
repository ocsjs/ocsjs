export function prefix(level: "info" | "error" | "warn" | "debug") {
    let extra = level === "error" ? "[错误]" : level === "warn" ? "[警告]" : undefined;

    if (typeof global === "undefined") {
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
    } else {
        return [`[OCS][${new Date().toLocaleTimeString()}]${extra || ""}`];
    }
}

export function createLog(level: "info" | "error" | "warn" | "debug", ...msg: any[]) {
    return [...prefix(level), ...msg];
}
