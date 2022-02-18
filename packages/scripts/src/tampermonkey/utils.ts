// @ts-check

import example from "./utils.example";

/**
 * 获取油猴头设置:  @设置名=设置值
 *
 * - `设置名` : 设置的名字，以`@`符号开头，可以使用 `.` 进行深层对象的表达，如果有重复的设置名称出现，则值将被解析成一个数组
 * - `设置值` : 设置的值
 *      - `字符串类型` : 任何字符串，无需加双引号
 *      - `数字类型` : 任何数字
 *      - `布尔类型` :
 *          - `true` : 可被解析的值有： `true`,`open`,`是`,`开启`
 *          - `false` : 可被解析的值有： `false`,`close`,`否`,`关闭`
 *
 *
 * 代码例子： {@link example}
 *
 * @param metaString 油猴头部信息，通常使用 `GM_info.scriptMetaStr` 获取
 * @param separator 设置名与设置值的分隔符，默认一个空格 : `' '`
 * @param objectSeparator 深度对象创建分隔符，默认一个点 : `'.'`
 * @returns `meta object of UserScript`
 */
export function GM_meta(metaString: string, separator = " ", objectSeparator = ".") {
    const object = {};
    const regexp = RegExp(`// *@(.*?)${separator}(.*)`);

    let metas = metaString.match(RegExp(regexp, "g")) || [];

    let data = metas
        // 去除空格
        .map((item) => item.trim())
        // 转换成 key value 形式
        .map((item) => {
            const match = item.match(regexp);
            if (match) {
                return { key: match[1].trim(), value: match[2].trim() };
            }
        })
        .filter((item) => item !== undefined) as {
        key: string;
        value: any;
    }[];
    // 类型转换
    data.map((item) => {
        item.value = Number(item.value)
            ? Number(item.value)
            : item.value === "true"
            ? true
            : item.value === "false"
            ? false
            : item.value === "open"
            ? true
            : item.value === "close"
            ? false
            : item.value === "是"
            ? true
            : item.value === "否"
            ? false
            : item.value === "开启"
            ? true
            : item.value === "关闭"
            ? false
            : String(item.value);
        return item;
    })
        // 生成对象
        .forEach((item) => {
            // 使用 `.` 进行深度对象创建
            if (item.key.includes(objectSeparator)) {
                const keys = item.key.split(objectSeparator);
                const lastKey = keys.pop();
                if (lastKey) {
                    let obj = undefined;
                    for (const key of keys) {
                        let target: any = obj || object;
                        if (target[key] === undefined) {
                            target[key] = {};
                        }
                        obj = target[key];
                    }

                    setValue(obj, lastKey, item.value);
                }
            } else {
                setValue(object, item.key, item.value);
            }

            /** 解析变量，如果是重复设置，则解析成数组 */
            function setValue(obj: any, key: string, value: any) {
                if (obj[key] === undefined) {
                    obj[key] = value;
                } else {
                    if (Array.isArray(obj[key])) {
                        obj[key].push(value);
                    } else {
                        obj[key] = [obj[key], value];
                    }
                }
            }
        });

    return object;
}
