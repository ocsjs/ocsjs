import { QuestionType } from "./types";

/**
 * 判断一个字符串或者元素的题目类型 {@link QuestionType}
 * @param target
 * @returns QuestionType
 */
export function getQuestionType(target: string | HTMLElement): keyof QuestionType | undefined {
    let type: keyof QuestionType | undefined = undefined;
    if (typeof target === "string") {
        if (match(target, questionTypeWords.singleChoice)) {
            type = "single_choice";
        } else if (match(target, questionTypeWords.multipleChoice)) {
            type = "multiple_choice";
        } else if (match(target, questionTypeWords.judgment)) {
            type = "judgment";
        } else if (match(target, questionTypeWords.completion)) {
            type = "completion";
        }
    } else {
        const inputs = Array.from(target.querySelectorAll("input"));
        if (inputs.length !== 0) {
            if (inputs.length === 2) {
                if (inputs.every((input) => input.type === "radio")) {
                    type = "judgment";
                }
            } else if (target.querySelector("textarea")) {
                type = "completion";
            } else {
                if (inputs.every((input) => input.type === "radio")) {
                    type = "single_choice";
                } else if (inputs.every((input) => input.type === "checkbox")) {
                    type = "multiple_choice";
                }
            }
        }
    }

    return type;
}

function match(target: string, arr: string[]) {
    return arr.some((str) => RegExp(str).test(target));
}

export const questionTypeWords = {
    singleChoice: ["单选", "单选题", "单项选择题"],
    multipleChoice: ["多选", "多选题", "多项选择题"],
    judgment: ["判断", "判断题"],
    completion: ["填空", "填空题"],
};
