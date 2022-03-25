# ocsjs

> OCS (Online Course Script) 网课刷课脚本，帮助大学生解决网课难题

# 使用方法

-   [浏览器运行](#浏览器运行)
-   [油猴运行](#油猴运行)
-   [OCS 软件运行](#OCS软件运行)
-   [自动答题功能](https://enncy.github.io/online-course-script/answerer-wrappers)
-   [项目开发文档](#项目开发文档)

# 交流群

-   qq 1 群: 976662217 （已满）
-   qq 2 群: 940881245
-   qq 3 群: 688788798
-   软件内测群：641347645

## 浏览器运行

> `优点`：简单

> `缺点`：不方便，每次都需要重新输入代码，有些功能不能使用，例如倍速破解。

1.在任意的 [`网课平台`](#网课平台) 页面，打开 `开发者工具`，方法如下。

| 谷歌 chrome | 火狐 Firefox |      微软 Edge       |
| :---------: | :----------: | :------------------: |
|    `F12`    |    `F12`     | `Ctrl`+ `Shift` +`i` |

2.点击`开发者工具`上方的：`Console` 或者 `控制台`

3.然后输入下面代码

5.按下回车运行

```js
var resource = (url) => fetch(url).then((res) => res.text());
// 载入 OCS 并运行
(async () => {
    const style = await resource("https://cdn.jsdelivr.net/npm/ocsjs@latest/dist/style/common.css");
    const ocsjs = await resource("https://cdn.jsdelivr.net/npm/ocsjs@latest/dist/js/index.min.js");

    // 加载 bootstrap icons 图标样式
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.innerText = ocsjs;
    document.body.appendChild(script);
    OCS.start({
        style,
        // 支持拖动
        draggable: true,
        // 加载默认脚本列表，默认 OCS.definedScripts
        scripts: OCS.definedScripts,
    });
})();
```

## 油猴运行

> `优点`：不需要重复输入代码，只需新建脚本保存即可

> `缺点`：需要安装油猴拓展

1.安装油猴浏览器拓展

-   `官网` https://www.tampermonkey.net/
-   `谷歌网上商店` [https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
-   `Edge外接程序` [https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd?hl=zh-CN](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd?hl=zh-CN)

2.安装 OCS 油猴脚本 [https://greasyfork.org/zh-CN/scripts/442075-ocs-%E7%BD%91%E8%AF%BE%E5%8A%A9%E6%89%8B](https://greasyfork.org/zh-CN/scripts/442075-ocs-%E7%BD%91%E8%AF%BE%E5%8A%A9%E6%89%8B)

3.打开任意的 [`网课平台`](#网课平台) 即可自动运行

## OCS 软件运行

> `优点`：全自动运行(推荐)

下载地址: https://github.com/enncy/online-course-script/releases

## 项目开发文档

[https://enncy.github.io/online-course-script/api](https://enncy.github.io/online-course-script/api)

# 网课平台

目前支持的网课平台 :

-   `超星` (别名: 尔雅/泛雅/学习通)

-   `智慧树` (别名: 知道)
