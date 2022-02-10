/**
 * 题目类型
 */
export interface QuestionType {
    single_choice: string;
    multiple_choice: string;
    judgment: string;
    completion: string;
}
 
/**
 * 题型提供器
 */
export type QuestionTypeProvider = (container: HTMLElement) => keyof QuestionType | undefined;
 
/**
 * 题目处理器
 */
export type QuestionHandler = (answers: string[], ...args: any) => void | Promise<void>;



/**
 * 答案
 */
 export interface Answer {
    question: string;
    answers: string[];
}

/**
 * 题目
 */
export interface Question<T extends HTMLElement = HTMLElement> {
    /** 类型提供器 */
    type: keyof QuestionType;
    /** 题目所在的父元素 */
    container: T;
    /** 题目标题元素 */
    title?: T;
    /** 单选题选项 */
    single: Partial<SingleQuestionOptions<T>>;
    /** 多选题选项 */
    multiple: Partial<MultipleQuestionOptions<T>>;
    /** 判断题选项 */
    judgment: Partial<JudgmentQuestionOptions<T>>;
    /** 填空题选项 */
    completion: Partial<CompletionQuestionOptions<T>>;
}

/**
 * 问题模板
 */
export interface QuestionTemplate<T = ElementLike> {
    /** 题目所在的父元素 */
    container: string | QueryFunction<HTMLElement[]>;
    /** 题目标题元素 */
    title?: T;
    /** 单选题选项 */
    single: Partial<SingleQuestionOptions<T>>;
    /** 多选题选项 */
    multiple: Partial<MultipleQuestionOptions<T>>;
    /** 判断题选项 */
    judgment: Partial<JudgmentQuestionOptions<T>>;
    /** 填空题选项 */
    completion: Partial<CompletionQuestionOptions<T>>;
}

export type QueryFunction<T> = (el: HTMLElement) => T;

/**
 * 类元素的表达
 */
export type ElementLike<T = Element> = string | T | QueryFunction<T>;

/**
 * 单选题选项
 */
export interface SingleQuestionOptions<T = ElementLike> {
    /** 选项内容 */
    text: T;
    /** 需点击的元素 */
    target: T;
    handler: QuestionHandler;
}
export interface MultipleQuestionOptions<T = ElementLike> {
    /** 选项内容 */
    text: T;
    /** 需点击的元素 */
    target: T;
    handler: QuestionHandler;
}

export interface JudgmentQuestionOptions<T = ElementLike> {
    /**
     * 正确的同义词列表
     *
     * default : {@link QA.default.judgment.right}
     */
    right: string[];
    /**
     * 错误的同义词列表
     *
     * default : {@link QA.default.judgment.wrong}
     */

    wrong: string[];
    /**
     * 正确选项是否在第一个元素
     * @example
     * ```html
     * <!-- isRightInFirst = true -->
     * <div>对</div>
     * <div>错</div>
     *
     * <!-- isRightInFirst = false -->
     * <div>错</div>
     * <div>对</div>
     * ```
     */
    isRightInFirst: boolean;
    /** 选项内容 */
    text: T;
    /** 需点击的元素 */
    target: T;
    handler: QuestionHandler;
}
export interface CompletionQuestionOptions<T = ElementLike> {
    /** 需填空的元素 */
    target: T;
    handler: QuestionHandler;
}

export interface QAOptions {
    type: QuestionTypeProvider;
    answer: (title: string, type: keyof QuestionType) => Promise<Answer> | Answer;
    question: Partial<QuestionTemplate<ElementLike>>;
    onQuestion?: void;
    onAnswer?: void;
    onError?: void;
}
