import { request } from '../utils/request';

/** 题目答案 */
export interface Answer {
	question: string;
	answer: string;
}

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
	/** 请求发起内容 */
	data: any;
	/** 错误数据 */
	error?: Error;
}

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
	/** 请求数据 */
	data?: Record<string, string>;
	/** 请求方法 */
	method: 'post' | 'get';
	/** 定义 handler 中的参数类型 */
	contentType: 'json' | 'text';
	/** 请求模式 */
	type: 'fetch' | 'GM_xmlhttpRequest';
	/** 附带请求头 */
	headers: Record<string, string>;
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
	// 上下文解析环境
	env: any
): Promise<SearchResult[]> {
	const searchResults: SearchResult[] = [];
	const temp: AnswererWrapper[] = JSON.parse(JSON.stringify(answererWrappers));
	// 多线程请求
	await Promise.all(
		temp.map(async (wrapper) => {
			// 解构数据，并赋初始值
			const {
				name = '未知题库',
				homepage = '#',
				method = 'get',
				type = 'fetch',
				contentType = 'json',
				headers = {},
				data: wrapperData = {},
				handler = 'return (res)=> [JSON.stringify(res), undefined]'
			} = wrapper;
			try {
				// 答案列表
				let answers: Answer[] = [];
				// 构造请求数据
				const data: Record<string, string> = Object.create({});
				/** 构造一个请求数据 */
				Reflect.ownKeys(wrapperData).forEach((key) => {
					// 解析data数据
					Reflect.set(data, key, resolvePlaceHolder(wrapperData[key.toString()]));
				});
				/** 解析 url 数据 */
				let url = resolvePlaceHolder(wrapper.url);

				/** 请求參數 */
				url = method === 'post' ? url : url + '?' + new URLSearchParams(data).toString();
				const requestData = {
					method,
					contentType,
					data,
					type,
					headers: JSON.parse(JSON.stringify(headers || {}))
				};
				// 发送请求
				const responseData = await request(url, requestData);
				/** 从 handler 获取搜索到的题目和回答 */

				// eslint-disable-next-line no-new-func
				const info = Function(handler)()(responseData);
				if (info && Array.isArray(info)) {
					/** 如果返回一个二维数组 */
					if (info.every((item: any) => Array.isArray(item))) {
						answers = answers.concat(
							info.map((item: any) => ({
								question: item[0],
								answer: item[1]
							}))
						);
					} else {
						answers.push({
							question: info[0],
							answer: info[1]
						});
					}
				}

				searchResults.push({
					url: wrapper.url,
					name,
					homepage,
					answers,
					response: responseData,
					data: requestData
				});
			} catch (error) {
				searchResults.push({
					url: wrapper.url,
					name,
					homepage,
					answers: [],
					response: undefined,
					data: undefined,
					error: error as any
				});
			}
		})
	);

	// 替换占位符
	function resolvePlaceHolder(str: string) {
		if (typeof str === 'string') {
			const matches = str.match(/\${(.*?)}/g) || [];
			matches.forEach((placeHolder) => {
				/** 获取占位符的值 */
				const value: any = env[placeHolder.replace(/\${(.*)}/, '$1')];
				str = str.replace(placeHolder, value);
			});
		}

		return str;
	}

	return searchResults;
}
