/** 题目答案 */
export interface Result {
	question: string;
	answer: string;
	extra_data?: object;
}

/** 题库查询信息 */
export interface SearchInformation {
	results: Result[];
	name: string;
	url?: string;
	/** 主页 */
	homepage?: string;
	/** 题目答案 */
	/** 请求响应内容 */
	response?: any;
	/** 请求发起内容 */
	data?: any;
	/** 错误数据 */
	error?: string;
	/**
	 * （顺序搜题模式）当前题库命中后，尚未请求的剩余题库。
	 * 用于当前题库虽然返回了答案、但答案无法匹配到页面选项时，继续尝试后续题库。
	 */
	// eslint-disable-next-line no-use-before-define
	_remainingWrappers?: AnswererWrapper[];
	/** （顺序搜题模式）本次搜题的上下文，用于对剩余题库重放请求 */
	_searchEnv?: Record<string, any>;
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
	data?: Record<string, any>;
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
