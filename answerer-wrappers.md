
# OCS 题库配置

> 题库配置 一般为一行 json 文本，不会配置的请联系题库作者(提供题库的人)

> OCS 提供了强大的 [`题库配置解析器`](https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/common/worker/answer.wrapper.handler.ts)，你可以对接大多数的题库进行使用

答题配置可以提供以下的功能

- 自动答题
- 自动搜题

## 题库配置

### `推荐的配置列表`

> 可以联系作者进行其他题库配置添加

- [enncy 题库](https://wk.enncy.cn/tk)


### `手动配置`
 
一般是题库负责人进行配置的提供。

参数如下：
[参数详情](https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/common/worker/answer.wrapper.handler.ts)
```ts

/**
 * 题库配置器
 */
export interface AnswererWrapper {
    /** 答题器请求路径 */
    url: string;
    data?: Record<string, string>;
    method: string;
    /**
     * 答题器答案的属性路径
     *
     * @example
     *
     * // 例1 接口返回
     * ```json
     * {"code": 1, "data": { "answers": [3] , "title":"1+2" }, "msg":"成功"}
     * ```
     * // 则此处应填写  `data.answers`
     *
     *
     *
     * // 例2 接口返回
     * ```json
     * {"ans": 3 , "title":"1+2" }
     * ```
     * // 则此处应填写  `ans`
     *
     *
     * @see — https://www.lodashjs.com/docs/lodash.get
     */
    answerPath: string;
    /**
     * 此选项是个字符串， 使用 [Function(string)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function) 构造方法进行解析生成方法，并传入一个参数（ answerPath 获取到的值 ）
     *
     * 可以对返回的回答进行自定义解析
     *
     * @example
     *
     * ```js
     * {
     *      answerHandler: `return (answers)=> answers === '未搜到答案' ? [] : answers`
     * }
     * ```
     *
     */
    answerHandler?: string;
}


```

例子: 
```ts
// 假设有一个接口 : https://example.com/search?title=1+2,2+3
// 此接口返回 {code: 1, data: { answers: [3 , 5] , title:'1+2' }, msg:'成功'}

defaultAnswerWrapperHandler(
    {
        titleElements: Array.from(document.querySelector(".title")),
    },
    [
        // 可以有多个构造器，最终通过 answerPath 一起合并到一个列表并返回
        {
            url: "https://example.com/search/"// url 也可以进行解析 ${titleElements[0]} ,
            method: "get",
            answerPath: "data.answers",
            data: {
                title: "${titleElements[0]}", // 1+2,2+3
            },
            answerHandler: "return (answers)=> answers.pop()" // 取结果的最后一个
        },
    ]
); // 函数返回 [5] 

```
注意：
`${xxx}` 是变量占位符 
- xxx 为对象属性路径 , 详情看 [lodash.get](https://www.lodashjs.com/docs/lodash.get)
- 可以使用在 `data` 和 `url` 字段中
- 可以解析 `第一个参数(源码中定义)` 的任意属性
- 可以解析 [`localStorage.OCS`](https://enncy.github.io/online-course-script/api/#localStorage.OCS) 的任意属性

所以最终填写的 `题库配置` 为： 
```json
[{"url":"https://example.com/search/","method":"get","answerPath":"data.answers","data":{"title":"${titleElements[0]}"},"answerHandler":"return (answers)=> answers.pop()"}]
```

