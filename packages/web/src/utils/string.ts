export class StringUtils {
    /**
     * 字符串超出长度后隐藏
     * @param str 字符串
     * @param length 长度
     * @param dot 是否显示省略号
     */
    static maximum(str: string, length: number, dot: boolean = true) {
        return str.length > length ? str.substring(0, length) + (dot ? "..." : "") : str;
    }
}
 