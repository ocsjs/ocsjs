# OCS开发文档

## 目录

- [项目结构](#项目结构)
- [项目运行](#项目运行) 
- [软件打包](#软件打包) 
- [项目打包](#项目打包) 
- [本地调试](#本地调试) 
- [API](#API)

## 项目结构

```
+ packages
    + app                   # electron 主进程
    + scripts               # 脚本实现库
        + src
            + browser       # 浏览器脚本实现
            + nodejs        # node 端实现， 使用 playwright 进行浏览器控制
    + web                   # 使用 vue3 + ts + ant design vue 构建的 electron 渲染进程
- gulpfile.js               # gulp 文件
- webpack.config.js         # webpack 打包配置 ： 打包 packages/browser.entry.js 作为浏览器端环境
```

## 项目运行

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

## 软件打包

```sh
# 进入 web 渲染进程
cd packages/web
# 编译 vue 项目到 app 下的 public 目录
npm run build
```

```sh
# 进入 app 主进程
cd packages/app
# 轻量打包
npm run pack
# 生成执行文件
npm run dist
```

## 项目打包

```sh
npm run gulp
```

## 本地调试

在本地浏览器安装油猴，并且 `@require ` 引用本地打包好的文件，即可本地调试。

[油猴 API](https://www.tampermonkey.net/documentation.php)

```js
// @require      file://E:\xxx\xxx\ocs\dist\js\index.js
// @resource     OCS_STYLE file://E:\xxx\xxx\ocs\dist\style\common.css
```

## API
...


