---
title: 油猴脚本链接打不开的解决方法
---

1. 如果打不开链接，那么就只能点击右上角的油猴，打开管理面板，点击右上角的加号图标，添加新的脚本。
2. 然后删除里面的所有代码
3. 复制下面的代码，到新建的脚本里面
4. 按下快捷键 `ctrl+s` 保存即可
5. 注意，此方法脚本不会实时更新，你必须定时查看此页面的代码，然后把最新的代码重复的方式复制进去。

油猴源代码，不定时更新，实在访问不了油猴脚本的的情况下，才使用此方法。

```js
// ==UserScript==
// @name         OCS 网课助手
// @namespace    https://enncy.cn
// @license      MIT
// @version      3.2.11
// @description  ocs 网课助手，支持各平台网课学习，支持超星学习通，知道智慧树，等网课的学习，作业，考试功能。
// @author       enncy
// @match        *://*.chaoxing.com/*
// @match        *://*.zhihuishu.com/*
// @require      https://cdn.jsdelivr.net/npm/ocsjs@3.2.9/dist/js/index.min.js
// @resource     OCS_STYLE https://cdn.jsdelivr.net/npm/ocsjs@3.2.9/dist/style/common.css
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @run-at       document-start
// ==/UserScript==
 
/* eslint no-undef: 0 */
 
(async function () {
    "use strict";
 
    // 加载 bootstrap icons 图标样式
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);
 
    /** 将OCS对象加入到全局属性 */
    unsafeWindow.OCS = OCS;
 
 
    OCS.start({
        // 加载样式
        style: GM_getResourceText("OCS_STYLE"),
        // 支持拖动
        draggable: true,
        // 加载默认脚本列表，默认 OCS.definedScripts
        scripts: OCS.definedScripts,
    });
})();
```
