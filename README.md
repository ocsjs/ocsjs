# OCS AI 答题分发版（自用 fork）

基于 [ocsjs/ocsjs](https://github.com/ocsjs/ocsjs) 网课助手的用法，配套一个**自包含的本地 AI 答题服务**：OCS 把题目 POST 给本地服务，服务调用 OpenAI 兼容的大模型接口返回答案，OCS 自动勾选/填写并提交。买套餐的题库/AI 服务由此替代为**自己的模型 key**。

本仓库的源码是本分发版的实现；原版 OCS 用户脚本本体见 `OCS网课助手-5.6.6.user.js`（官方原版，未改动刷课/防暂停逻辑）。

## 直接下载使用（推荐）

到 [Releases](../../releases/latest) 下载 `ocs-ai-答题包-v1.0.zip`，解压后按里面《使用说明-先看我.txt》的 4 步操作即可，无需安装 Python/Node。

## 4 步使用

1. 浏览器装 **脚本猫**（插件备用包在 zip 里）。
2. 导入 `OCS网课助手-5.6.6.user.js`（拖进脚本猫 → 保存）。
3. 双击 `1-启动答题服务.exe`（首次会生成 `config.json`，可先不管）。
4. 打开 <http://127.0.0.1:38987/> → 把 `题库配置-复制这段.json` 的内容粘进 OCS 的「题库配置」→ 保存。

之后在网课页点「开始答题」即可。选模型、换 API Key 都在 <http://127.0.0.1:38987/> 网页里点。

## 源码说明

- `bridge.py` — 本地答题服务单文件源码（HTTP 服务 + 选模型网页 + 调模型 API）。打包命令见下方。
- `config.json` — 预置的公网端点/key/模型示例；双击 exe 后与 exe 同目录生成，改完即时生效、不用重启。
- `answerer.json` — OCS 的 `AnswererWrapper` 题库配置（单条目，指向本地服务 `/search`）。
- `OCS网课助手-5.6.6.user.js` — OCS 官方原版脚本 v5.6.6（`// ==UserScript==` 头完整，已含 `@connect localhost/127.0.0.1`）。

## 打包命令

```powershell
F:\devenv\Python313\python.exe -m PyInstaller --noconfirm --clean --onefile --name "1-启动答题服务" bridge.py
```

生成的 exe 与 `config.json` 放同一目录即可。

## 链路

```
OCS 题库配置(GM_xmlhttpRequest) → http://127.0.0.1:38987/search → OpenAI 兼容 /chat/completions → 答案回填
```

`type` 必须是 `GM_xmlhttpRequest`，否则网课站 CSP 会拦掉到 localhost 的请求。

## 许可

OCS 原版 © enncy，MIT License。本分发版为个人自用改造，仅供学习研究。
