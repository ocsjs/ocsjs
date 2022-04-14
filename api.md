# OCS开发文档

{:toc}
  
## 项目结构

```
+ packages
    + core				   # 油猴脚本库
    + scripts               # 软件自动登录库
    + common			   # 公共库 (一些工具方法)
    + web                   # 使用 vue3 + ts + ant design vue 构建的 electron 渲染进程
    + app                   # electron 主进程
+ scripts				   # 项目打包构建 gulp 文件
- webpack.config.js         # webpack 打包配置 ： 打包  core 油猴脚本库 作为浏览器端环境
```

## package.json 命令介绍

```jsonc
{
        "build:core": "gulp -f ./scripts/build-core.js", /** core构建， 文件夹清理，css文件打包等构建流程 */
        "build:app": "pnpm build && gulp -f ./scripts/build-app.js",  /** 打包 web 和 app 的软件端 */
        "build": "gulp -f ./scripts/tsc.js", /** 为每个 typescript 子项目运行 tsc 命令 */
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
// @require      file://E:\xxx\xxx\ocs\dist\index.min.js
// @resource     OCS_STYLE file://E:\xxx\xxx\ocs\dist\style.css
```

# API



- [类型](#类型)
	- [DefineScript](#definescript)
	- [ScriptRoute](#scriptroute)
	- [ScriptPanel](#scriptpanel)
	- [AnswererWrapper](#answererwrapper)

- [方法](#方法)
	- [OCS.start](#start)
	- [OCS.definescript](#definescript-1)

- [定义](#定义)
	- [AnswererWrapper 题库配置](#answererwrapper--题库配置)

- [变量](#变量)




## 类型



### DefineScript

> 脚本声明，油猴脚本的核心

-  `name`: `string`    脚本名

-  `routes`?: `Array<ScriptRoute>`    脚本路由

-  `panels`?: `Array<ScriptPanel>`    脚本面板

 

### ScriptRoute

> 脚本路由， 类似油猴的 include ， 匹配页面路径执行脚本

 

- `name`: `string`    脚本名字

- `url`: `string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[]`   页面路径匹配
  - 使用例子
    - \*\*example.com\*\* : 匹配所有包含 example.com 的路径
    - https://example.com/ : 只匹配 https://example.com/  页面

- `onload`?: `Function `    等待页面加载完毕调用

- `start`?: `Function`  页面加载时 立即执行 

- `priority`?: `number`   执行优先级, 默认0

### ScriptPanel

> 脚本面板， 面板的组成对象类型。

 

- `name`: `string`    名字

- `url`:` string | RegExp | GlobPattern | string[] | RegExp[] | GlobPattern[]`  页面路径匹配 ， 与 `ScriptRoute.url`  类型一致

-  `el`:  `() => DefineComponent<any> | VNode | HTMLElement | string;`    支持 3种  元素  `VNode `  ,`DefineComponent`  , `string`
  - 例子： 
  - el : ()=> \<span>xxx\</span>
  - el : ()=> h("span", "xxx")

-  `children`?: `Array<ScriptPanelChild>`    其余的子面板

-  `priority`?: `number `     优先级, 默认0

-  `default`?: `boolean`      当页面没有任何面板时，是否显示 

### AnswererWrapper

> 题库配置器的参数

- `url`: `string`     答题器请求路径
- `name`: `string `    题库名字
- `homepage`?: `string`     题库网址
- `data`?: `Record<string, string>`     传递的参数, get 请求将会添加到 url 后面， post 请求会生成请求体
- `method`: `"post" | "get"`     请求方法
- `contentType`: `"json" | "text"`     定义 handler 中的参数类型
- `handler`: `string `
  此选项是个字符串， 使用 [Function(string)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function) 构造方法进行解析生成方法
  方法传入一个参数 : 请求获取到的文本 ，可以使用 contentType 定义文本类型
  对返回的数据进行自定义解析
  并且返回一个数组 : `[题目, 答案]`
  或者二维数据 : `[[题目1, 答案1],[题目2, 答案2], ...`
  如果搜不到则返回 undefined
  例子：`return (res)=> res.code === 0 ? undefined : [res.question, undefined]`

  
## 方法

### `start(...)`

> 加载  OCS

**参数**
 
- `draggable`:`boolean` 是否开启拖拽功能
- `scripts` : [`Array<DefineScript>`](#DefineScript) 需要运行的脚本



### `defineScript(...)`

> 定义一个脚本

**参数** : 

- `options`: [`DefineScript`](#DefineScript )

**例子**

```ts
export const ExampleScript = defineScript({
    name: "脚本例子",
    routes: [
        {
            name: "页面加载后运行的脚本",
            url: "**example.com/video.html**",
            async onload() {},
        },
        {
            name: "页面加载前运行的脚本",
            url: "**example.com/work.html**",
            async start() {},
        },
    ],
    panels: [
        {
            name: "脚本助手",
            url: "https://www.example.com",
            el: () => ...,
        },
        {
            name: "脚本助手，带有子面板",
            url: "**example.com**",
            el: () =>...,
            children: [
                {
                    name: "子面板",
                    el: () => ...,
                },
            ],
        },
    ],
});

// 运行脚本
OCS.start({
	scripts: [ExampleScript]
})

```

## 定义

### AnswererWrapper  题库配置


> OCS 提供了强大的 [`题库配置解析器`](https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/core/worker/answer.wrapper.handler.ts)，你可以对接大多数的题库进行使用

**类型** : Array\<[`AnswererWrapper`](#AnswererWrapper)>

**简单例子** 

```ts
// 假设有一个接口 : https://example.com/search?title=1+2,2+3
// 此接口返回 {code: 1, data: { answers: [3 , 5] , title:'1+2' }, msg:'成功'}

defaultAnswerWrapperHandler(
    {
        // 题目
        title: '1+2,2+3',
        // 题目类型
        type: 'single'
    },
    [
        // 可以有多个构造器，最终通过 answerPath 一起合并到一个列表并返回
        {
            url: "https://example.com/search/"// url 也可以进行解析 ${title} , 例如 https://example.com/search/${title}/,
            method: "get",
            contentType: "json",
            data: {
                title: "${title}", // 1+2,2+3,
                abc: "123", // 自定义参数,
                platform: "${platform}" // 解析本地 localStorage.OCS 参数,
                upload: "${setting.cx.work.upload}" // 解析本地 localStorage.OCS 参数
            },
            handler: `return (res)=> res.code === 0 ? undefined : [res.data.title, res.data.answers[0]]`  // 取第一个结果
        },
    ]
); 

```
注意：
- 文本为 json 数组， 数组意味着你可以配置多个题库
- `${xxx}` 是变量占位符 
    - 可以使用在 `data` 和 `url` 字段中
    - 可以解析 
        - $title: 题目标题
        - $type: 题目类型
    - 可以解析 [`localStorage.OCS`](#OCSLocalStorage) 的任意属性

所以最终填写的 `题库配置` 为：  （不要使用这个，这个只是例子！！！！）
```json
[{"url":"https://example.com/search/","method":"get","contentType":"json","data":{"title":"${title}"},"handler":"return (res)=> res.code === 0 ? undefined : [res.data.title, res.data.answers[0]]"}]
```



## 变量

### `definedScripts`  : [Array\<DefineScript>](#DefineScript)

> 内置定义的全部脚本列表

### `app` :  App

> vue对象

### `panel` : HTMLElement

> OCS面板的元素对象

### `store` : OCSStore

> OCS存储，存储一些临时元素，以及本地存储数据。

