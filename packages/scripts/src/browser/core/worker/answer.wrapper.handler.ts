import { get } from "lodash";
import { getItem } from "../store";

/** 题库查询结果 */
export interface SearchResult {
    url: string;
    name: string;
    /** 主页 */
    homepage?: string;
    /** 题目答案 */
    answers: Answer[];
    /** 请求响应内容 */
    response: any;
    data: any;
}

/** 题目答案 */
export interface Answer {
    question: string;
    answer: string;
}

/**
 * 题库配置器
 */
[{"name":"enncy题库","homepage":"https://tk.enncy.cn/","url":"https://tk.enncy.cn/query","method":"get","data":{"token":"1fd9c5e867d31812b65545fcb8a67249","title":"${title}"},"contentType":"json","handler":"return (res)=>res.code === 0 ? undefined : [res.data.question,res.data.answer]"}]
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

/**
 *
 * 默认题库配置解析器
 *
 * @example
 *
 * ```js
 *
 * // 假设有一个接口 : https://example.com/search?title=1+2,2+3
 * // 此接口返回 {code: 1, data: { answers: [3 , 5] , title:'1+2' }, msg:'成功'}
 *
 * defaultAnswerWrapperHandler({
 *      titleElements: Array.from(document.querySelector('.title'))
 * },
 * [
 *  // 可以有多个构造器，最终通过 answerPath 一起合并到一个列表并返回
 *  {
 *      url: 'https://example.com/search',
 *      method: 'get',
 *      answerPath: 'data.answers',
 *      data:{
 *          title: 'titleElements[0]' // 1+2,2+3
 *      }
 *  }
 * ]) // [3 , 5]
 *
 *
 * ```
 *
 * @param elements 题目元素
 * @param answererWrappers 题库配置器数组
 * @returns
 */
export async function defaultAnswerWrapperHandler(
    answererWrappers: AnswererWrapper[],
    type?: string,
    title?: string
): Promise<SearchResult[]> {
    let searchResults: SearchResult[] = [];

    for (const wrapper of answererWrappers) {
        let answers: Answer[] = [];
        let response: Response | undefined = undefined;
        let responseData = "";

        const data = Object.create({});
        wrapper.data = wrapper.data || {};
        /** 构造一个请求数据 */
        Reflect.ownKeys(wrapper.data).map((key) => {
            if (wrapper.data) {
                Reflect.set(data, key, resolvePlaceHolder(wrapper.data[key.toString()]));
            }
        });
        /** 解析 url 数据 */
        let url = resolvePlaceHolder(wrapper.url);

        /** 请求 */

        if (wrapper.method === "post") {
            response = await fetch(url, { method: wrapper.method, body: JSON.stringify(data) });
        } else {
            const params = new URLSearchParams();
            Reflect.ownKeys(data).forEach((key) => params.set(key.toString(), data[key.toString()]));
            response = await fetch(url + "?" + params.toString(), { method: wrapper.method });
        }
        /** 从 handler 获取搜索到的题目和回答 */

        if (wrapper.handler) {
            if (wrapper.contentType === "json") {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            const info = Function(wrapper.handler)()(responseData);
            if (info) {
                /** 如果返回一个二维数组 */
                if (info.every((item: any) => Array.isArray(item))) {
                    answers = answers.concat(
                        info.map((item: any) => ({
                            question: item[0],
                            answer: item[1],
                        }))
                    );
                } else {
                    answers.push({
                        question: info[0],
                        answer: info[1],
                    });
                }
            }
        }

        searchResults.push({
            url: wrapper.url,
            name: wrapper.name,
            homepage: wrapper.homepage,
            answers,
            response,
            data: responseData,
        });
    }

    function resolvePlaceHolder(str: string) {
        const matches = str.match(/\${(.*?)}/g) || [];
        matches.forEach((placeHolder) => {
            const value: any =
                /** 获取元素属性 */
                get({ type, title }, placeHolder.replace(/\${(.*)}/, "$1")) ||
                /** 获取本地存储 */
                getItem(placeHolder.replace(/\${(.*)}/, "$1"));
            str = str.replace(placeHolder, value);
        });
        return str;
    }

    return searchResults;
}
