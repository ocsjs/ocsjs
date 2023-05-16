import { AnswererWrapper, SearchInformation, Result } from './interface';
import { request } from '../utils/request';
import { $ } from '../../utils';

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
): Promise<SearchInformation[]> {
	const searchInfos: SearchInformation[] = [];
	const temp: AnswererWrapper[] = JSON.parse(JSON.stringify(answererWrappers));
	if (temp.length === 0) {
		throw new Error('题库配置不能为空，请配置后重新开始自动答题。');
	}
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
				let results: Result[] = [];
				// 请求数据
				let requestData;
				// 请求地址
				let url: URL;
				if (method === 'get') {
					url = new URL(resolvePlaceHolder(wrapper.url, { encodeURI: true }));
					/**
					 * 如果 data 存在数据并且 method 为 get，则将 data 数据拼接到 url 上，覆盖原有的  url 同名参数
					 * data 参数的优先级高于 url 参数
					 */
					Object.keys(wrapperData).forEach((key) => {
						// searchParams.set 方法会自动编码，所以不需要 encodeURI: true
						url.searchParams.set(key, resolvePlaceHolder(wrapperData[key.toString()]));
					});
					// get 的请求数据为空
					requestData = {};
				} else if (method === 'post') {
					url = new URL(wrapper.url);
					// 构造请求数据
					const data: Record<string, string> = Object.create({});
					/** 构造一个请求数据 */
					Object.keys(wrapperData).forEach((key) => {
						// 解析data数据
						Reflect.set(data, key, resolvePlaceHolder(wrapperData[key]));
					});

					requestData = data;
				} else {
					throw new Error('不支持的请求方式');
				}

				// 发送请求
				const responseData = await Promise.race([
					request(url.toString(), {
						method,
						// 历史遗留的命名问题
						responseType: contentType,
						data: requestData,
						type,
						headers: JSON.parse(JSON.stringify(headers || {}))
					}),
					$.sleep(30 * 1000)
				]);
				if (responseData === undefined) {
					throw new Error('题库连接超时，请检查网络或者重试。');
				}

				/** 从 handler 获取搜索到的题目和回答 */

				// eslint-disable-next-line no-new-func
				const info = Function(handler)()(responseData);
				if (info && Array.isArray(info)) {
					/** 如果返回一个二维数组 */
					if (info.every((item: any) => Array.isArray(item))) {
						results = results.concat(
							info.map((item: any) => ({
								question: item[0],
								answer: item[1]
							}))
						);
					} else {
						results.push({
							question: info[0],
							answer: info[1]
						});
					}
				}

				searchInfos.push({
					url: wrapper.url,
					name,
					homepage,
					results,
					response: responseData,
					data: requestData
				});
			} catch (error) {
				searchInfos.push({
					url: wrapper.url,
					name,
					homepage,
					results: [],
					response: undefined,
					data: undefined,
					error: (error as any)?.message || '题库连接失败'
				});
			}
		})
	);

	// 替换占位符
	function resolvePlaceHolder(str: string, options?: { encodeURI?: boolean }) {
		if (typeof str === 'string') {
			const matches = str.match(/\${(.*?)}/g) || [];
			matches.forEach((placeHolder) => {
				/** 获取占位符的值 */
				const value: any = env[placeHolder.replace(/\${(.*)}/, '$1')];
				str = str.replace(placeHolder, options?.encodeURI ? encodeURIComponent(value) : value);
			});
		}

		return str;
	}

	return searchInfos;
}
