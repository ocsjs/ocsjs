import { SearchInformation } from '../answer-wrapper/interface';

export type ElementResolver<R> = (root: HTMLElement | Document) => R;
export type RawElements = Record<
	string | symbol,
	string | ElementResolver<HTMLElement[]> | ElementResolver<HTMLElement>[]
> & {
	/** 题目元素选择器 */
	title?: string | ElementResolver<HTMLElement[]> | ElementResolver<HTMLElement>[];
	/** 题目选项的元素选择器 */
	options?: string | ElementResolver<HTMLElement[]> | ElementResolver<HTMLElement>[];
};

export type SearchedElements<E, T> = Record<keyof E, T> & {
	/** 题目元素选择器 */
	title?: T extends Array<infer ArrayType> ? (undefined | ArrayType)[] : T;
	/** 题目选项的元素选择器 */
	options?: T extends Array<infer ArrayType> ? (undefined | ArrayType)[] : T;
};

/** 答题器上下文 */
export interface WorkContext<E> {
	root: HTMLElement;
	elements: SearchedElements<E, HTMLElement[]>;
	searchInfos: SearchInformation[];
}

/** 题目类型 */
export type QuestionTypes = 'single' | 'multiple' | 'completion' | 'judgement' | undefined;

/** 答案题目处理器结果 */
export interface ResolverResult {
	[x: string]: any;
	finish: boolean;
}

/** 答题结果 */
export interface WorkResult<E extends RawElements> {
	/** 正在等待 查题 线程处理 */
	requesting: boolean;
	/** 正在等待 答题 线程处理 */
	resolving: boolean;
	result?: ResolverResult;
	error?: string;
	ctx?: WorkContext<E>;
	type: 'single' | 'multiple' | 'completion' | 'judgement' | undefined;
}

/**
 * 简化的答题结果 一般用于存储到本地
 *
 * 为什么不直接用 {@link WorkResult} ，因为对象里太多嵌套对象，一旦结果超过10个以上，可能导致 I/O 变慢，并且页面卡顿。
 */
export interface SimplifyWorkResult {
	/** 题目 */
	question: string;
	/** 答题错误信息 */
	error?: string;
	/** 是否完成 */
	finish?: boolean;
	/** 正在等待 查题 线程处理 */
	requesting: boolean;
	/** 正在等待 答题 线程处理 */
	resolving: boolean;
	/** 查题信息 */
	searchInfos: {
		/** 题目名 */
		name: SearchInformation['name'];
		/** 题库链接 */
		homepage?: SearchInformation['homepage'];
		/** 题库搜索错误信息 */
		error?: string;
		/** 搜索结果 [题目，答案] */
		results: [string, string][];
	}[];
}

/** 答案题目处理器 */
export type QuestionResolver<E> = (
	/** 查题信息 */
	searchInfos: SearchInformation[],
	/** 选项 */
	options: HTMLElement[],
	handler: (
		type: QuestionTypes,
		answer: string,
		option: HTMLElement,
		ctx: WorkContext<SearchedElements<E, HTMLElement[]>>
	) => void | Promise<void>
) => Promise<ResolverResult>;

/**
 * 使用默认工作器
 *
 * 需要自定义 handler
 */
export interface DefaultWork<E extends RawElements> {
	/** 工作器的题目类型 */
	type?: QuestionTypes | { (ctx: WorkContext<E>): QuestionTypes };
	/**
     * 处理器， 每个题目的处理器， 实例可看默认的 zhs `作业脚本` 写法 : https://github.com/ocsjs/ocsjs/blob/3.0/packages/scripts/src/browser/zhs/work.ts
     *
     *
     * @param type 题目类型
     * @param answer 根据 查题器 解析出来的正确答案，
     * @param element 目标选项的dom对象
     *
     * @example
     *
     * ```js
    {
        elements:{
            // 必须提供 options 元素选择器，代表题目的子选项
            options: '.subject .option'
        },
        work: {
            // 自定义处理器例子：
            handler(type, answer, option, ctx) {
                // 如果是选择题，则获取目标按钮，并点击
                if (type === "judgement" || type === "single" || type === "multiple") {
                    if (!option.querySelector("input")?.checked) {
                        option.click();
                    }
                }
                // 如果是填空题，则获取 textarea 元素并输入答案
                else if (type === "completion") {
                    const text = option.querySelector("textarea");
                    if (text) {
                        text.value = answer;
                    }
                }
            },
        },
    }
     * ```
     *
     */
	handler: (
		type: QuestionTypes,
		answer: string,
		option: HTMLElement,
		ctx: WorkContext<SearchedElements<E, HTMLElement[]>>
	) => void;
}
/**
 * 自定义工作器
 *
 * 如果默认工作器不满足需求，可以自定义
 *
 * ```js
 *
 * {
 *      elements:{
 *          inputs: 'input',
 *      },
 *      // 简单例子
 *      work({ root, elements, searchResults}){
 *          for(const input of elements.inputs){
 *              if(searchResults.map(res=>res.answers.map(ans=>ans.answer)).includes(input.value)){
 *                  input.click()
 *                  return true
 *              }
 *          }
 *          return false
 *      }
 *
 * }
 *
 * ```
 *
 */
export type CustomWork<E extends RawElements> = (ctx: WorkContext<E>) => Promise<ResolverResult>;

/**  查题器的类型  */

export type AnswererType<E> = (
	elements: SearchedElements<E, HTMLElement[]>,
	type: string | undefined,
	ctx: WorkContext<SearchedElements<E, HTMLElement[]>>
) => SearchInformation[] | Promise<SearchInformation[]>;

/**
 * 答题器参数
 */
export type WorkOptions<E extends RawElements> = {
	/** 父元素 */
	root: string | HTMLElement[];
	/** dom元素解析器，可以在 WorkContext.elements 中使用解析后的元素 */
	elements: E;
	/** 查题器 */
	answerer: AnswererType<E>;
	/** 工作器 */
	work: DefaultWork<E> | CustomWork<E>;
	/** 查题间隔（秒） */
	requestPeriod?: number;
	/** 答题间隔（秒）, 如果过快可能导致保存答案失败啊，或者被检测到 */
	resolvePeriod?: number;
	/** 多线程数量（个） */
	thread?: number;
	/** 当元素被搜索到 */
	onElementSearched?: (elements: SearchedElements<E, HTMLElement[]>, root: HTMLElement) => void | Promise<void>;
	/** 监听搜题结果 */
	onResultsUpdate?: (res: WorkResult<E>[], currentResult: WorkResult<E>) => void | Promise<void>;
	/** 监听答题结果 */
	onResolveUpdate?: (res: WorkResult<E>) => void | Promise<void>;
};

export type WorkUploadType = 'save' | 'nomove' | 'force' | number;
