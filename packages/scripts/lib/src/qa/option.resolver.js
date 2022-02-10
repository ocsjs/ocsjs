"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = void 0;
var question_type_resolver_1 = require("./question.type.resolver");
/**
 * resolve option string of specify element
 */
function getOptions(question, target) {
    var options = Array.from(question.querySelectorAll(target));
    var questionType = (0, question_type_resolver_1.getQuestionType)(question);
    return options.map(function (option) {
        return questionType === "completion" ? "" : option.innerText;
    });
}
exports.getOptions = getOptions;
