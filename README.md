# ocsjs

> OCS (Online Course Script) 网课刷课脚本，帮助大学生解决网课难题

# 使用方法

- [浏览器运行](#浏览器运行)
- [油猴运行](#油猴运行)
- [OCS软件运行](#OCS软件运行)

## 浏览器运行

> `优点`：简单

> `缺点`：不方便，每次都需要重新输入代码

1.在指定的 [网课学习页面](#网课学习页面)，打开 `开发者工具`，方法如下。

| 谷歌 chrome | 火狐 Firefox | 微软 Edge  |
| :---------: | :----------: | :--------: |
|    `F12`    |    `F12`     | `Ctrl`+`i` |

2.点击`开发者工具`上方的：`Console` 或者 `控制台`

3.然后输入下面代码

4.根据下面提示修改你想要的设置

5.按下回车运行

```js
let meta = `
// 下面为OCS设置，所有设置都写在等于号(=)的后面，请不要另起一行，按照格式  @设置=文本  填写即可，你不需要考虑空格的问题，只需要保证写在等于号后面即可。
// 你可以使用  "开始","关闭","任何文本或者数字"  进行设置的填写

// ======== 知道智慧树的设置 ========

// @智慧树.观看时间(分钟) = 30

// 提示：智慧树的倍速最多只能 1.5 倍速，否则很容易会被封号!
// @智慧树.播放速度(倍速) = 1

// @智慧树.复习模式 = 开启

// @智慧树.视频静音 = 开启

// ==================================

`;

if (window.jQuery) {
    loadOCS(window.jQuery);
} else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js";
    document.body.append(script);
    setTimeout(() => {
        loadOCS(window.jQuery);
    }, 1000);
}

// 载入 OCS 并运行
function loadOCS($) {
    $.getScript("https://cdn.jsdelivr.net/npm/ocsjs/dist/index.min.js", function () {
        OCS.start(OCS.GM_meta(meta, "=", "."));
    });
}
```

## 油猴运行
> `优点`：不需要重复输入代码，只需新建脚本保存即可

> `缺点`：需要安装油猴拓展

1.打开右上角油猴浏览器拓展

2.点击添加新脚本

3.输入以下代码

4.根据下面提示修改你想要的设置

5.按下 `Ctrl + s` 保存代码

6.打开指定的 [网课学习页面](#网课学习页面) 即可自动运行

```js
// ==UserScript==
// @name         OCS 脚本
// @namespace    https://github.com/enncy
// @version      1.0.0
// @description  OCS 油猴模块，支持各平台网课学习
// @author       enncy
// @match        https://**.zhihuishu.com/**
// @match        https://**.chaoxing.com/**
// @noframes
// @require      https://cdn.jsdelivr.net/npm/ocsjs/dist/index.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// 上面的信息请不要修改

// 下面为OCS设置，所有设置都写在等于号(=)的后面，请不要另起一行，按照格式  @设置=文本  填写即可，你不需要考虑空格的问题，只需要保证写在等于号后面即可。
// 你可以使用  "开始","关闭","任何文本或者数字"  进行设置的填写

// ======== 知道智慧树的设置 ========

// @智慧树.观看时间(分钟) = 30

// 提示：智慧树的倍速最多只能 1.5 倍速，否则很容易会被封号!
// @智慧树.播放速度(倍速) = 1

// @智慧树.复习模式 = 开启

// @智慧树.视频静音 = 开启

// ==================================

// ==/UserScript==

/* eslint-disable */

var window = unsafeWindow;

/** @see: https://github.com/enncy/online-course-script/blob/3.0/README.md#OCS */
const Ocs = OCS;

/* eslint-enable */

(function () {
    /**
     * 读取油猴头部信息
     * @see https://github.com/enncy/online-course-script/blob/3.0/README.md#GM_meta
     */
    const settings = Ocs.GM_meta(GM_info.scriptMetaStr, "=", ".");

    Ocs.start(settings);
})();
```

## OCS软件运行
> `优点`：全自动运行(推荐)

# 网课学习页面

-   `超星/尔雅/学习通` : `**chaoxing.com/mycourse/studentstudy/**`
-   `智慧树/知道` : `**zhihuishu.com/videoStudy.html#/studyVideo/**`

大部分学习页面类似下图

![study-page](img/README/study-page.png)
