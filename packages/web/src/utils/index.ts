/**
 * 防抖
 * @param fn 方法
 * @param period 间隔
 */
export function debounce(fn: Function, period: number) {
    var timer: number | null = null;
    return function () {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, period);
    };
}

/**
 * 检测 json 语法
 * @param jsonString json 字符串
 */
export function jsonLint(jsonString: string) {
    try {
        JSON.parse(jsonString);
    } catch (e) {
        const msg = (e as Error).message;
        const match = msg.match(/Unexpected token(.*)in JSON at position (\d+)/);
        const position = parseInt(match?.[2] || "0");
        let count = 0;
        let line = 0;
        for (const str of jsonString.split("\n")) {
            count += str.length + 1;

            if (count >= position) {
                return {
                    token: match?.[1],
                    line,
                };
            }

            line++;
        }
    }
}

export function formatDate() {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getDate().toString().padStart(2, "0"),
    ].join("-");
}
