# ocsjs

> OCS (Online Course Script) 网课刷课脚本，帮助大学生解决网课难题

# 使用方法

-   [浏览器运行](#浏览器运行)
-   [油猴运行](#油猴运行)
-   [OCS 软件运行](#OCS软件运行)

## 浏览器运行

> `优点`：简单

> `缺点`：不方便，每次都需要重新输入代码

1.在指定的 [网课学习页面](#网课学习页面)，打开 `开发者工具`，方法如下。

| 谷歌 chrome | 火狐 Firefox | 微软 Edge  |
| :---------: | :----------: | :--------: |
|    `F12`    |    `F12`     | `Ctrl`+`i` |

2.点击`开发者工具`上方的：`Console` 或者 `控制台`

3.然后输入下面代码

5.按下回车运行

```js
if (window.$) {
    loadOCS(window.$);
} else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js";
    document.body.append(script);
    const interval = setInterval(() => {
        if (window.$) {
            loadOCS(window.$);
            clearInterval(interval);
        }
    }, 5000);
}

// 载入 OCS 并运行
function loadOCS($) {
    $("<link>")
        .attr({
            rel: "stylesheet",
            type: "text/css",
            href: "https://cdn.jsdelivr.net/npm/ocsjs/dist/style/common.css",
        })
        .appendTo("head");
    $.getScript("https://cdn.jsdelivr.net/npm/ocsjs/dist/js/index.min.js", function () {
        OCS.start();
    });
}
```

## 油猴运行

> `优点`：不需要重复输入代码，只需新建脚本保存即可

> `缺点`：需要安装油猴拓展

1.安装油猴浏览器拓展 https://www.tampermonkey.net/

2.打开右上角油猴浏览器拓展

3.点击添加新脚本

4.删除原有所有代码，输入以下的代码

5.按下 `ctrl + s` 保存代码

6.打开指定的 [网课学习页面](#网课学习页面) 即可自动运行

```js
// ==UserScript==
// @name         OCS 网课助手
// @namespace    https://enncy.cn
// @version      3.0.0
// @description  OCS 网课助手，支持各平台网课学习
// @author       enncy
// @match        *://*.chaoxing.com/*
// @match        *://*.zhihuishu.com/*
// @require      https://cdn.jsdelivr.net/npm/ocsjs/dist/js/index.min.js
// @resource     OCS_STYLE https://cdn.jsdelivr.net/npm/ocsjs/dist/style/common.css
// @grant        unsafeWindow
// @grant        GM_addElement
// @grant        GM_getResourceText
// @noframes
// ==/UserScript==

/* eslint no-undef: 0 */

(function () {
    "use strict";

    window.OCS = OCS;

    // 加载 bootstrap icons 图标样式
    GM_addElement("link", {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
    });

    OCS.start({
        // 加载样式
        style: GM_getResourceText("OCS_STYLE"),
        // 支持拖动
        draggable: true,
        // 加载默认脚本列表，默认 OCS.definedScripts
        // scripts: OCS.definedScripts
    });
})();
```

## OCS 软件运行

> `优点`：全自动运行(推荐)

下载地址: https://github.com/enncy/online-course-script/releases

## 项目开发

### 项目结构

```
+ packages
    + app                   # electron 主进程
    + scripts               # 脚本实现库
        + src
            + browser       # 浏览器脚本实现
            + nodejs        # node 端实现， 使用 playwright 进行浏览器控制
    + web                   # 使用 vue3 + ts + ant design vue 构建的 electron 渲染进程
- CHANGELOG.md              # 更新日志
- gulpfile.js               # gulp 文件
- webpack.config.js         # webpack 打包配置 ： 打包 packages/browser.entry.js 作为浏览器端环境
```

### 项目运行

```sh
# 全局安装 pnpm ，如果已经安装，则无需执行
npm i pnpm -g
# 下载项目
git clone https://github.com/enncy/online-course-script.git ocs
# 进入目录
cd ocs
# 使用 pnpm 安装依赖
pnpm i -w
```

```sh
# 进入 scripts
cd packages/scripts
# 编译 scripts 项目
npx tsc
```

接下来打开 2 个终端，分别执行 :

```sh
# 进入 web 渲染进程
cd packages/web
# 运行 vue 项目
npm run dev
```

```sh
# 进入 app 主进程
cd packages/app
# 运行 electron 软件
npm run dev
```

### 软件打包

```sh
# 进入 web 渲染进程
cd packages/web
# 编译 vue 项目到 app 下的 public 目录
npm run dist
```

```sh
# 进入 app 主进程
cd packages/app
# 轻量打包
npm run pack
# 生成执行文件
npm run dist
```

### 项目打包

```sh
npm run gulp
```

# 网课学习页面

-   `超星/尔雅/学习通` : `**chaoxing.com/mycourse/studentstudy/**`
-   `智慧树/知道` : `**zhihuishu.com/videoStudy.html#/studyVideo/**`

大部分学习页面类似下图

![study-page](img/README/study-page.png)
