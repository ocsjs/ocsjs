import { SearchResult } from './answer.wrapper.handler';

export type RawElements = Record<string | symbol, string> & {
  /** 题目元素选择器 */
  title?: string
  /** 题目选项的元素选择器 */
  options?: string
}

export type SearchedElements<E, T> = Record<keyof E, T> & {
  /** 题目元素选择器 */
  title?: T
  /** 题目选项的元素选择器 */
  options?: T
}

/** 答题器上下文 */
export interface WorkContext<E> {
  root: HTMLElement
  elements: SearchedElements<E, HTMLElement[]>
  searchResults: SearchResult[]
}

/** 题目类型 */
export type QuestionTypes = 'single' | 'multiple' | 'completion' | 'judgement' | undefined

/** 答案题目处理器结果 */
export interface ResolverResult {
  [x: string]: any
  finish: boolean
}

/** 答题结果 */
export interface WorkResult<E extends RawElements> {
  time: number
  consume: number
  result?: ResolverResult
  error?: Error
  ctx?: WorkContext<E>
  type: 'single' | 'multiple' | 'completion' | 'judgement' | undefined

}

/** 答案题目处理器 */
export type QuestionResolver<E> = (
  /** 答案 */
  searchResults: SearchResult[],
  /** 选项 */
  options: HTMLElement[],
  handler: (
    type: QuestionTypes,
    answer: string,
    option: HTMLElement,
    ctx: WorkContext<SearchedElements<E, HTMLElement[]>>
  ) => void
) => ResolverResult

/**
 * 使用默认工作器
 *
 * 需要自定义 handler
 */
export interface DefaultWork<E extends RawElements> {
  /** 工作器的题目类型 */
  type?: QuestionTypes | { (ctx: WorkContext<E>): QuestionTypes }
  /**
     * 处理器， 每个题目的处理器， 实例可看默认的 zhs `作业脚本` 写法 : https://github.com/enncy/online-course-script/blob/3.0/packages/scripts/src/browser/zhs/work.ts
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
  ) => void
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
export type CustomWork<E extends RawElements> = (ctx: WorkContext<E>) => ResolverResult

/**  查题器的类型  */

export type AnswererType<E> = (
  elements: SearchedElements<E, HTMLElement[]>,
  type: string | undefined,
  ctx: WorkContext<SearchedElements<E, HTMLElement[]>>
) => SearchResult[] | Promise<SearchResult[]>

/**
 * 答题器参数
 */
export type WorkOptions<E extends RawElements> = {
  /** 父元素 */
  root: string | HTMLElement[]
  /** dom元素解析器，可以在 WorkContext.elements 中使用解析后的元素 */
  elements: E
  /** 查题器 */
  answerer: AnswererType<E>
  /** 工作器 */
  work: DefaultWork<E> | CustomWork<E>
  /** 答题间隔 */
  period?: number
  /** 出错时暂停答题 */
  stopWhenError?: boolean
  /** 回答器请求超时时间(毫秒) */
  timeout?: number
  /** 回答器请求重试次数 */
  retry?: number
  /** 监听答题结果 */
  onResult?: (res: WorkResult<E>) => void
  /** 当元素被搜索到的钩子 */
  onElementSearched?: (elements: SearchedElements<E, HTMLElement[]>) => void
  /** 拦截器，返回 true 代表通过，返回 false 代表此题被拦截 */
  interceptor?: (ctx: WorkContext<E>) => Promise<boolean> | boolean
  /** 监听错误事件 */
  onError?: (e: Error, ctx?: WorkContext<E>) => void
}
