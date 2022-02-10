import { completionHandler } from "./handler/completion";
import { judgmentHandler } from "./handler/judgment";
import { multipleChoiceHandler } from "./handler/multiple.choice";
import { singleChoiceHandler } from "./handler/single.choice";
import { getQuestionType } from "./question.type.resolver";
import { ElementLike, QAOptions, QueryFunction, Question, QuestionTemplate } from "./types";

export { getOptions } from "./option.resolver";
export { getQuestionType, questionTypeWords } from "./question.type.resolver";
export { QuestionType } from "./types";

export function fromElementArrayLike(
    target?: string | QueryFunction<Element[]>,
    container: HTMLElement = document.body
): HTMLElement[] | undefined {
    if (typeof target === "string") {
        let el = container.querySelectorAll(target);
        if (el === null) {
            return undefined;
        } else {
            return Array.from(el) as HTMLElement[];
        }
    } else if (typeof target === "function") {
        return Reflect.apply(target, document, [container]);
    } else {
        return target;
    }
}

export function fromElementLike(
    target?: ElementLike<Element>,
    container: HTMLElement = document.body
): HTMLElement | undefined {
    if (typeof target === "string") {
        let el = container.querySelector(target);
        if (el === null) {
            return undefined;
        } else {
            return el as HTMLElement;
        }
    } else if (typeof target === "function") {
        return Reflect.apply(target, document, [container]);
    } else {
        return target as HTMLElement;
    }
}

export class QA {
    options: QAOptions;
    questions: Question[] = [];

    public static default: QAOptions = {
        type: getQuestionType,
        answer: () => ({ question: "", answers: [] }),
        question: {
            container: "ul",
            title: "div span",
            single: {
                text: "li",
                target: "li input",
                handler: singleChoiceHandler,
            },
            multiple: {
                text: "li",
                target: "li input",
                handler: multipleChoiceHandler,
            },
            judgment: {
                text: "li",
                target: "li input",
                isRightInFirst: true,
                right: ["是", "对", "正确", "√", "对的", "是的", "正确的", "true", "yes", "YES", "Yes"],
                wrong: [
                    "否",
                    "错",
                    "错误",
                    "x",
                    "错的",
                    "不正确的",
                    "不正确",
                    "不是",
                    "不是的",
                    "false",
                    "no",
                    "NO",
                    "No",
                ],
                handler: judgmentHandler,
            },
            completion: {
                target: "textarea",
                handler: completionHandler,
            },
        },
    };

    constructor(options: Partial<QAOptions>) {
        this.options = Object.assign(QA.default, options);
        this.handleQuestionTemplate();
    }

    /**
     * resolve {@link QuestionTemplate} to {@link Question}
     */
    private handleQuestionTemplate(question: Partial<QuestionTemplate<ElementLike>> = QA.default.question) {
        for (const container of fromElementArrayLike(question.container) || []) {
            const el = container as HTMLElement;
            const title = fromElementLike(question.title, el);
            const type = getQuestionType(title?.textContent || "") || getQuestionType(el);
            console.log({
                container,
                title,
                type,
            });
            if (type) {
                const qe: Question = {
                    container: container,
                    type,
                    title: fromElementLike(question.title, el),
                    single:
                        type === "single_choice"
                            ? {
                                  text: fromElementLike(question.single?.text, el),
                                  target: fromElementLike(question.single?.target, el),
                              }
                            : {},
                    multiple:
                        type === "multiple_choice"
                            ? {
                                  text: fromElementLike(question.multiple?.text, el),
                                  target: fromElementLike(question.multiple?.target, el),
                              }
                            : {},
                    judgment:
                        type === "judgment"
                            ? {
                                  text: fromElementLike(question.judgment?.text, el),
                                  target: fromElementLike(question.judgment?.target, el),
                              }
                            : {},
                    completion:
                        type === "completion"
                            ? {
                                  target: fromElementLike(question.completion?.target, el),
                              }
                            : {},
                };
                this.questions.push(qe);
            }
        }
    }
}
