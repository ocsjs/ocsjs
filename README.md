# online-course-script

> ocs online-course-script  在线网络课程辅助脚本工具
> 简称网课脚本，帮助大学生解决网课难题，目前支持的平台：超星，智慧树

## `新版目前正在开发中，旧版使用方法请到 master 分支查看！`

## 简介

- 使用 `electron ` + `vue3` + `typescript` 的方式搭建的跨平台网课脚本软件，核心使用 `pupeteer` + 自研的 `pioneerjs` 脚本库来进行浏览器以及 js 脚本的驱动。
- 一键式运行刷课脚本，只需要添加账号和一些基本参数，则可一键刷课，全程躺平，支持自动答题模块
- 软件采用增量更新，自动更新，快捷迭代

## 软件使用教程
- 到 release 下载对应版本的安装程序即可
- 详细教程请到 [Discussions讨论区](https://github.com/enncy/online-course-script/discussions) 查看
## 项目运行
- 本项目使用的是 nodejs 环境，如果未安装，请先自行安装！

```sh
# 克隆项目到本地
git clone git@github.com:enncy/online-course-script.git
# 进入目录
cd online-course-script
# 安装依赖
npm install
# 为防止 electron 安装失败，手动执行安装
node node_modules/electron/install.js
# 进入 electron app 文件夹
cd app
# 安装 electron 依赖 （本项目使用双依赖结构，具体参考 https://www.electron.build/tutorials/two-package-structure）
npm install
# 回到根目录
cd ..
# 运行项目
npm run dev
# ... 其他命令请参考 package.json


```





