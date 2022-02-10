"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionSimilarly = void 0;
var string_similarity_1 = __importDefault(require("string-similarity"));
// export async function handleQuestion(container: string | Element, answer: AnswerProvider, question: QuestionProvider) {
//     const element = fromElementLike(container);
// const type = question.type(element);
// const title = question.title(element).textContent;
// if (title) {
//     const options = question.options(element);
//     const answers = await answer({ title, options: options.map((option) => option.textContent || ""), type });
//     if (type === "single_choice") {
//         return singleChoiceHandler(answers, options);
//     }
//     if (type === 'multiple_choice') {
//         return multipleChoiceHandler(answers, options);
//     }
//     if (type === 'judgment') {
//         return judgmentHandler(answers, options);
//     }
//     if (type === 'completion') {
//         return singleChoiceHandler(answers, options);
//     }
// }
// }
function getOptionSimilarly(answers, options) {
    return options.map(function (option) {
        if (option.textContent) {
            return string_similarity_1.default.findBestMatch(option.textContent, answers).bestMatch.rating;
        }
        else {
            return 0;
        }
    });
}
exports.getOptionSimilarly = getOptionSimilarly;
