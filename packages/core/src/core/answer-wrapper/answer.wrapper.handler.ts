import { AnswererWrapper, SearchInformation, Result } from './interface';
import { request } from '../utils/request';
import { $ } from '../../utils';

export const AnswerWrapperHandlerConfig = {
	// 超时时间，单位毫秒
	timeout_seconds: 60
};

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
	env: {
		title?: string;
		options?: string;
		/** 选项数组，便于题库接口直接拿到结构化选项（未提供时会由 options 按换行自动推导） */
		optionsArray?: string[];
		type?: string;
		[x: string]: any;
	}
): Promise<SearchInformation[]> {
	const searchInfos: SearchInformation[] = [];
	/**
	 * 补充 optionsArray 占位符：
	 * 各项目通常将选项以换行拼接后传入 options，这里在未显式提供 optionsArray 时自动推导，
	 * 使得题库配置中可以直接使用 ${optionsArray} 拿到结构化选项数组。
	 */
	if (env.optionsArray === undefined) {
		env.optionsArray = typeof env.options === 'string' && env.options.length > 0 ? env.options.split('\n') : [];
	}
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
				if (method.toLocaleLowerCase() === 'get') {
					url = new URL(resolvePlaceHolder(wrapper.url, { encodeURI: true }));
					/**
					 * 如果 data 存在数据并且 method 为 get，则将 data 数据拼接到 url 上，覆盖原有的  url 同名参数
					 * data 参数的优先级高于 url 参数
					 */
					Object.keys(wrapperData).forEach((key) => {
						// searchParams.set 方法会自动编码，所以不需要 encodeURI: true
						const value = resolvePlaceHolder(wrapperData[key]);
						/** 若占位符解析结果为数组（如 ${optionsArray}），序列化为 JSON 字符串 */
						url.searchParams.set(key, Array.isArray(value) ? JSON.stringify(value) : value);
					});
					// get 的请求数据为空
					requestData = {};
				} else if (method.toLocaleLowerCase() === 'post') {
					url = new URL(wrapper.url);
					// 构造请求数据
					const data: Record<string, string> = Object.create({});
					/** 构造一个请求数据 */
					Object.keys(wrapperData).forEach((key) => {
						// 如果存在字段解析器
						if (typeof (wrapperData as any)[key] === 'object' && Reflect.has((wrapperData as any)[key], 'handler')) {
							// eslint-disable-next-line no-new-func
							const handler = Function(Reflect.get((wrapperData as any)[key], 'handler'))();
							if (typeof handler !== 'function') {
								throw new Error('data 字段解析器必须返回一个函数');
							}
							const result = handler(env);
							Reflect.set(data, key, result);
						} else {
							// 解析data数据
							Reflect.set(data, key, resolvePlaceHolder(wrapperData[key]));
						}
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
					$.sleep((AnswerWrapperHandlerConfig.timeout_seconds ?? 60) * 1000)
				]);
				if (responseData === undefined) {
					throw new Error('题库请求超时，可能是题库问题，或者请检查网络或者重试。');
				}

				/** 从 handler 获取搜索到的题目和回答 */

				// eslint-disable-next-line no-new-func
				const responseHandler = Function(handler)();
				if (typeof responseHandler !== 'function') {
					throw new Error('handler 响应处理器必须返回一个函数');
				}
				const info = responseHandler(responseData);
				if (info && Array.isArray(info)) {
					/** 如果返回一个二维数组 */
					if (info.every((item: any) => Array.isArray(item))) {
						results = results.concat(
							info.map((item: any) => ({
								question: item[0],
								answer: item[1],
								extra_data: item[2] || {}
							}))
						);
					} else {
						results.push({
							question: info[0],
							answer: info[1],
							extra_data: info[2] || {}
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
				console.error(error);
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
	function resolvePlaceHolder(data: any, options?: { encodeURI?: boolean }) {
		if (typeof data === 'string') {
			/**
			 * 如果整个字段值就是一个占位符（例如 `"${optionsArray}"`），且对应的环境变量是数组，
			 * 则直接返回该数组：POST 请求会以数组形式提交，GET 请求会序列化为 JSON 字符串。
			 */
			const singleMatch = data.match(/^\${(.*?)}$/);
			if (singleMatch) {
				const singleValue = env[singleMatch[1]];
				if (Array.isArray(singleValue)) {
					return options?.encodeURI ? encodeURIComponent(JSON.stringify(singleValue)) : singleValue;
				}
			}
			const matches = data.match(/\${(.*?)}/g) || [];
			matches.forEach((placeHolder) => {
				/** 获取占位符的值 */
				const value: any = env[placeHolder.replace(/\${(.*)}/, '$1')];
				/** 内嵌在字符串中的数组占位符序列化为 JSON 字符串 */
				const resolved = Array.isArray(value) ? JSON.stringify(value) : value;
				data = data.replace(placeHolder, options?.encodeURI ? encodeURIComponent(resolved) : resolved);
			});
		} else if (typeof data === 'object') {
			// 递归替换
			const keys = Object.keys(data);
			for (const key of keys) {
				data[key] = resolvePlaceHolder(data[key], options);
			}
		}
		return data;
	}

	return searchInfos;
}
