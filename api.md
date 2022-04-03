# OCS开发文档

## 目录

- [项目结构](#项目结构)
- [项目构建](#项目构建) 
- [项目运行](#项目运行) 
- [软件打包](#软件打包) 
- [脚本打包](#脚本打包) 
- [本地调试](#本地调试) 
- [API](#API)

## 项目结构

```
+ packages
    + core				   # 油猴脚本库
    + scripts              # 软件自动登录库
    + common			   # 公共库 (一些工具方法)
    + web                  # 使用 vue3 + ts + ant design vue 构建的 electron 渲染进程
    + app                  # electron 主进程
+ scripts				   # 项目打包构建 gulp 文件
- gulpfile.js              # 主 gulp 文件，打包 core 油猴脚本库
- webpack.config.js        # webpack 打包配置 ： 打包  core 油猴脚本库 作为浏览器端环境
```

## package.json 命令介绍

```json
{
        "webpack": "webpack --config webpack.config.js", // 打包 core 油猴脚本库 作为浏览器端环境
        "build:core": "pnpm build && gulp --allowEmpty", // 配合 webpack 命令进行 core构建， 文件夹清理，css文件打包等构建流程
        "build:app": "pnpm build && gulp -f ./scripts/build.js ", // 打包 web 和 app 的软件端
        "build": "gulp -f ./scripts/tsc.js", // 为每个 typescript 子项目运行 tsc 命令
}
```

 

## 项目构建

```sh
# 全局安装 pnpm ，如果已经安装，则无需执行
npm i pnpm -g
# 下载项目
git clone https://github.com/enncy/online-course-script.git ocs
# 进入目录
cd ocs
# 使用 pnpm 安装依赖
pnpm i -w
# 构建项目 (为每个子项目进行 tsc 构建)
pnpm build
```

## 项目运行

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

## 软件打包

```sh
pnpm build:app
```

## 脚本打包

```sh
pnpm build:core
```

## 本地调试

在本地浏览器安装油猴，并且 `@require ` 引用本地打包好的文件，即可本地调试。

[油猴 API](https://www.tampermonkey.net/documentation.php)

```js
// @require      file://E:\xxx\xxx\ocs\dist\js\index.js
// @resource     OCS_STYLE file://E:\xxx\xxx\ocs\dist\style\common.css
```

## API

...编写中
