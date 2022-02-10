"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionTypeWords = exports.getQuestionType = void 0;
/**
 * 判断一个字符串或者元素的题目类型 {@link QuestionType}
 * @param target
 * @returns QuestionType
 */
function getQuestionType(target) {
    var type = undefined;
    if (typeof target === "string") {
        if (match(target, exports.questionTypeWords.singleChoice)) {
            type = "single_choice";
        }
        else if (match(target, exports.questionTypeWords.multipleChoice)) {
            type = "multiple_choice";
        }
        else if (match(target, exports.questionTypeWords.judgment)) {
            type = "judgment";
        }
        else if (match(target, exports.questionTypeWords.completion)) {
            type = "completion";
        }
    }
    else {
        var inputs = Array.from(target.querySelectorAll("input"));
        if (inputs.length !== 0) {
            if (inputs.length === 2) {
                if (inputs.every(function (input) { return input.type === "radio"; })) {
                    type = "judgment";
                }
            }
            else if (target.querySelector("textarea")) {
                type = "completion";
            }
            else {
                if (inputs.every(function (input) { return input.type === "radio"; })) {
                    type = "single_choice";
                }
                else if (inputs.every(function (input) { return input.type === "checkbox"; })) {
                    type = "multiple_choice";
                }
            }
        }
    }
    return type;
}
exports.getQuestionType = getQuestionType;
function match(target, arr) {
    return arr.some(function (str) { return RegExp(str).test(target); });
}
exports.questionTypeWords = {
    singleChoice: ["单选", "单选题", "单项选择题"],
    multipleChoice: ["多选", "多选题", "多项选择题"],
    judgment: ["判断", "判断题"],
    completion: ["填空", "填空题"],
};
