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
