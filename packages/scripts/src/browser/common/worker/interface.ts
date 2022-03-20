export type Elements<T> = Record<string, T> & {
    /** 题目选项的元素选择器 */
    options?: T;
};

/**
 * 使用默认工作器
 *
 * 需要自定义 handler
 */
export interface DefaultWork {
    /** 工作器的题目类型 */
    type?: QuestionTypes | { (ctx: WorkContext): QuestionTypes };
    /**
     * 处理器， 每个题目的处理器， 实例可看默认的 zhs `作业脚本` 写法 : https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/zhs/index.ts
     * 
     * 
     * @param type 题目类型
     * @param answer 根据 查题器:{@link } 解析出来的正确答案，
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
            handler(type, answer, element) {
                // 如果是选择题，则获取目标按钮，并点击
                if (type === "judgement" || type === "single" || type === "multiple") {
                    if (!element.querySelector("input")?.checked) {
                        element.click();
                    }
                } 
                // 如果是填空题，则获取 textarea 元素并输入答案
                else if (type === "completion" && element.querySelector("textarea")?.innerText === "") {
                    const text = element.querySelector("textarea");
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
    handler: (type: QuestionTypes, answer: string, element: HTMLElement) => void;
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
 *
 *      },
 *      work({ root,  elements, answers}: WorkContext){
 *
 *
 *      }
 *
 * }
 *
 * ```
 *
 */
export type CustomWork = (ctx: WorkContext) => ResolverResult;

/**  查题器的类型  */

export type AnswererType = (elements: Elements<HTMLElement[]>) => string[] | Promise<string[]>;

/**
 * 答题器参数
 */
export type WorkOptions<
    E extends Elements<string | HTMLElement[] | { (): string | HTMLElement[] }> = Elements<
        string | HTMLElement[] | { (): string | HTMLElement[] }
    >
> = {
    /** 父元素 */
    root: string | HTMLElement[];
    /** dom元素解析器，可以在 WorkContext.elements 中使用解析后的元素 */
    elements: E;
    /** 查题器 */
    answerer: "default" | AnswererType;
    /** 工作器 */
    work: DefaultWork | CustomWork;
    /** 监听答题结果 */
    onResult?: (res: WorkResult) => void;
    /** 答题间隔 */
    period?: number;
    /** 监听错误事件 */
    onError?: (e: Error, ctx?: WorkContext) => void;
    /** 出错时暂停答题 */
    stopWhenError?: boolean;
    /** 回答器请求超时时间(毫秒) */
    timeout?: number;
    /** 回答器请求重试次数 */
    retry?: number;
};

/** 答题器上下文 */
export interface WorkContext<E extends Elements<HTMLElement[]> = Elements<HTMLElement[]>> {
    root: HTMLElement;
    elements: E;
    answers: string[];
}

/** 答题结果 */
export interface WorkResult<E extends Elements<HTMLElement[]> = Elements<HTMLElement[]>> {
    time: number;
    consume: number;
    result?: ResolverResult;
    error?: Error;
    ctx?: WorkContext<E>;
}

/** 题目类型 */
export type QuestionTypes = keyof typeof QuestionTypeEnum;

export enum QuestionTypeEnum {
    single,
    multiple,
    completion,
    judgement,
}

/** 答案题目处理器结果 */
export interface ResolverResult {
    type: QuestionTypes;
    answers: string[];
    options?: HTMLElement[];
    finish: boolean;
}

/** 答案题目处理器 */
export type QuestionResolver = (
    /** 答案 */
    answers: string[],
    /** 选项 */
    options: HTMLElement[],
    handler: (type: QuestionTypes, answer: string, element: HTMLElement) => void
) => ResolverResult;

/**
 * 答题器自动构造器
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
     *      answerHandler: `return (answer)=> answer === '未搜到答案' ? [] : answer`
     * }
     * ```
     *
     */
    answerHandler?: string;
}
