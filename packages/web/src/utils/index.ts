

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
