// @ts-nocheck

// 简单例子

metas = GM_meta(
    `
    // ==UserScript==
    // @number       1
    // @string       this is string
    // @boolean      true
    // @object.somekey.list  1
    // @object.somekey.list  2
    // @object.somekey.str  this is str      
    // ==/UserScript==
    `,
    " ",
    "."
);

console.log(metas);
// 输出：
metas = {
    number: 1,
    string: "this is string",
    boolean: true,
    object: { someKey: { list: [1, 2], str: "this is str" } },
};

// 如果在油猴环境下运行可以使用如下代码解析

metas = GM_meta(GM_info.scriptMetaStr);

// 如果只想解析个人配置，可以吧分隔符修改成 `=` ，然后使用 `=` 去定义设置值

metas = GM_meta(GM_info.scriptMetaStr, "=");

// 如果想修改对象创建规则，可以吧对象分隔符改成任意字符。

metas = GM_meta(
    `
    // ==UserScript==
    // @number       = 1
    // @string       = this is string
    // @boolean      = true
    // @object-somekey-list = 1
    // @object-somekey-list = 2
    // @object-somekey-str = this is str      
    // ==/UserScript==
    `,
    "=",
    "-"
);


export default {}