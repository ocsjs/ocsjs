import { get } from "lodash";
import { getItem } from "../store";
import { answerSimilar, clearString } from "../utils";
import { QuestionTypes, QuestionResolver, AnswererWrapper, Elements } from "./interface";

/** 默认答案题目处理器 */
export const defaultQuestionResolve: Record<QuestionTypes, QuestionResolver> = {
    /** 单选题处理器 */
    single(answers, options, handler) {
        /** 配对选项的相似度 */
        const ratings = answerSimilar(
            answers,
            options.map((el) => el.innerText)
        );
        /** 找出最相似的选项 */
        const index = ratings.findIndex((rating) => rating.rating > 0.6);
        if (index !== -1) {
            /** 经自定义的处理器进行处理 */
            handler("single", ratings[index].target, options[index]);
            return { type: "single", answers, options, finish: true };
        }
        return { type: "single", answers, finish: false };
    },
    /** 多选题处理器 */
    multiple(answers, options, handler) {
        const ratings = answerSimilar(
            answers,
            options.map((el) => el.innerText)
        );
        if (ratings.some((rating) => rating.rating > 0.6)) {
            options.forEach((el, i) => {
                if (ratings[i].rating > 0.6) {
                    handler("multiple", ratings[i].target, el);
                }
            });

            return { type: "multiple", answers, options, finish: true };
        }
        return { type: "multiple", answers, finish: false };
    },
    /** 判断题处理器 */
    judgement(answers, options, handler) {
        const correctWords = ["是", "对", "正确", "√", "对的", "是的", "正确的", "true", "yes", "1"];
        const incorrectWords = [
            "非",
            "否",
            "错",
            "错误",
            "×",
            "X",
            "错的",
            "不对",
            "不正确的",
            "不正确",
            "不是",
            "不是的",
            "false",
            "no",
            "0",
        ];

        /** 答案显示正确 */
        const answerShowCorrect = answers.find((answer) => matches(answer, correctWords));
        /** 答案显示错误 */
        const answerShowIncorrect = answers.find((answer) => matches(answer, incorrectWords));

        if (answerShowCorrect || answerShowIncorrect) {
            let option: HTMLElement | undefined;
            options.forEach((el, i) => {
                /** 选项显示正确 */
                const textShowCorrect = matches(el.innerText, correctWords);
                /** 选项显示错误 */
                const textShowIncorrect = matches(el.innerText, incorrectWords);
                if (answerShowCorrect && textShowCorrect) {
                    option = el;
                    handler("judgement", answerShowCorrect, el);
                }
                if (answerShowIncorrect && textShowIncorrect) {
                    option = el;
                    handler("judgement", answerShowIncorrect, el);
                }
            });

            return { type: "judgement", answers, options: option ? [option] : [], finish: true };
        }

        function matches(target: string, options: string[]) {
            return options.map((option) => RegExp(clearString(option)).test(clearString(target)));
        }

        return { type: "judgement", answers, finish: false };
    },
    /** 填空题处理器 */
    completion(answers, options, handler) {
        if (answers.length === options.length) {
            options.forEach((el, i) => {
                handler("completion", answers[i], el);
            });
            return { type: "completion", answers, options, finish: true };
        }
        return { type: "completion", answers, options, finish: false };
    },
};

/**
 *
 * 默认搜题方法构造器
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
 * @param answererWrappers 搜题构造器
 * @returns
 */
export async function defaultAnswerWrapperHandler(
    elements: Elements<HTMLElement[]>,
    answererWrappers: AnswererWrapper[]
) {
    let answers: string[] = [];

    for (const wrapper of answererWrappers) {
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
        const res = await $.ajax({ url, method: wrapper.method, data });
        /** 从路径获取回答 */
        let answer = get(res, wrapper.answerPath);

        /** 自定义回答处理器 */
        if (wrapper.answerHandler) {
            answer = Function(wrapper.answerHandler)()(answer);
        }
        answers = answers.concat(answer);
    }

    function resolvePlaceHolder(str: string) {
        const matches = str.match(/\${(.*?)}/g) || [];
        matches.forEach((placeHolder) => {
            const value: any =
                /** 获取元素属性 */
                get(elements, placeHolder.replace(/\${(.*)}/, "$1")) ||
                /** 获取本地存储 */
                getItem(placeHolder.replace(/\${(.*)}/, "$1"));
            str = str.replace(placeHolder, value);
        });
        return str;
    }

    return answers;
}
