import { domSearch } from "./core/utils";

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
    console.log(...createLog(level, msg));

    if (document) {
        const { terminal } = domSearch({ terminal: ".terminal" }, top?.document);
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
        if (terminal) {
            const logs = Array.from(terminal.querySelectorAll("div"));
            if (logs.length > 50) {
                logs.shift()?.remove();
            }

            const li = document.createElement("div");
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
            li.innerHTML = `<span style="color: gray;">${new Date().toLocaleTimeString()}</span> <level  class="${level}">${extra}</level> <span>${text.join(
                " "
            )}</span>`;
            terminal.appendChild(li);

            terminal.scrollTo({
                behavior: "auto",
                top: terminal.scrollHeight,
            });
        }
    }
}
