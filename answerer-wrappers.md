
# OCS 题库配置
 
答题配置可以提供以下的功能

- 自动答题
- 自动搜题

## 使用

1. 点击下面的配置列表， 进入查看每个配置列表的教程，根据相应的教程获取题库配置
2. 获取到题库配置后， 打开你安装好OCS助手脚本的浏览器， 然后打开学习，作业，考试任意页面，即可看到设置面板，设置面板里面会有题库配置的设置，填写进去保存即可！！

## 推荐的配置列表
 
- [enncy 题库](https://tk.enncy.cn/) （OCS作者提供）
- 更多题库配置请等待更新...

<br>
<br>
<br>
<br>
<br>
 

##  API （小白不要看下面的）

> 不会配置的请联系题库作者(提供题库的人)

> 题库配置 一般为一行 json 文本

> OCS 提供了强大的 [`题库配置解析器`](https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/common/worker/answer.wrapper.handler.ts)，你可以对接大多数的题库进行使用
  

参数如下：
[参数详情](https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/common/worker/answer.wrapper.handler.ts)
```ts

/**
 * 题库配置器
 */
export interface AnswererWrapper {
    /** 答题器请求路径 */
    url: string;
    /** 题库名字 */
    name: string;
    /** 题库网址 */
    homepage?: string;
    /** 传递的参数, get 请求将会添加到 url 后面， post 请求会生成请求体 */
    data?: Record<string, string>;
    method: "post" | "get";
    /** 定义 handler 中的参数类型 */
    contentType: "json" | "text";
    /**
     * 此选项是个字符串， 使用 [Function(string)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function) 构造方法进行解析生成方法
     *
     * 方法传入一个参数 : 请求获取到的文本 ，可以使用 contentType 定义文本类型
     *
     * 对返回的数据进行自定义解析
     *
     * 并且返回一个数组 : `[题目, 答案]`
     *
     * 或者二维数据 : `[[题目1, 答案1],[题目2, 答案2], ...`
     *
     * 如果搜不到则返回 undefined
     *
     * @example
     *
     * ```js
     * {
     *      handler: `return (res)=> res.code === 0 ? undefined : [res.question, undefined]`
     * }
     * ```
     *
     */
    handler: string;
}


```

## 简单例子 
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
    - 可以解析 [`localStorage.OCS`](https://enncy.github.io/online-course-script/api/#localStorage.OCS) 的任意属性

所以最终填写的 `题库配置` 为：  （这个只是例子！！！！）
```json
[{"url":"https://example.com/search/","method":"get","contentType":"json","data":{"title":"${title}"},"handler":"return (res)=> res.code === 0 ? undefined : [res.data.title, res.data.answers[0]]"}]
```



