"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QA = exports.fromElementLike = exports.fromElementArrayLike = exports.questionTypeWords = exports.getQuestionType = exports.getOptions = void 0;
var completion_1 = require("./handler/completion");
var judgment_1 = require("./handler/judgment");
var multiple_choice_1 = require("./handler/multiple.choice");
var single_choice_1 = require("./handler/single.choice");
var question_type_resolver_1 = require("./question.type.resolver");
var option_resolver_1 = require("./option.resolver");
Object.defineProperty(exports, "getOptions", { enumerable: true, get: function () { return option_resolver_1.getOptions; } });
var question_type_resolver_2 = require("./question.type.resolver");
Object.defineProperty(exports, "getQuestionType", { enumerable: true, get: function () { return question_type_resolver_2.getQuestionType; } });
Object.defineProperty(exports, "questionTypeWords", { enumerable: true, get: function () { return question_type_resolver_2.questionTypeWords; } });
function fromElementArrayLike(target, container) {
    if (container === void 0) { container = document.body; }
    if (typeof target === "string") {
        var el = container.querySelectorAll(target);
        if (el === null) {
            return undefined;
        }
        else {
            return Array.from(el);
        }
    }
    else if (typeof target === "function") {
        return Reflect.apply(target, document, [container]);
    }
    else {
        return target;
    }
}
exports.fromElementArrayLike = fromElementArrayLike;
function fromElementLike(target, container) {
    if (container === void 0) { container = document.body; }
    if (typeof target === "string") {
        var el = container.querySelector(target);
        if (el === null) {
            return undefined;
        }
        else {
            return el;
        }
    }
    else if (typeof target === "function") {
        return Reflect.apply(target, document, [container]);
    }
    else {
        return target;
    }
}
exports.fromElementLike = fromElementLike;
var QA = /** @class */ (function () {
    function QA(options) {
        this.questions = [];
        this.options = Object.assign(QA.default, options);
        this.handleQuestionTemplate();
    }
    /**
     * resolve {@link QuestionTemplate} to {@link Question}
     */
    QA.prototype.handleQuestionTemplate = function (question) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (question === void 0) { question = QA.default.question; }
        for (var _i = 0, _h = fromElementArrayLike(question.container) || []; _i < _h.length; _i++) {
            var container = _h[_i];
            var el = container;
            var title = fromElementLike(question.title, el);
            var type = (0, question_type_resolver_1.getQuestionType)((title === null || title === void 0 ? void 0 : title.textContent) || "") || (0, question_type_resolver_1.getQuestionType)(el);
            console.log({
                container: container,
                title: title,
                type: type,
            });
            if (type) {
                var qe = {
                    container: container,
                    type: type,
                    title: fromElementLike(question.title, el),
                    single: type === "single_choice"
                        ? {
                            text: fromElementLike((_a = question.single) === null || _a === void 0 ? void 0 : _a.text, el),
                            target: fromElementLike((_b = question.single) === null || _b === void 0 ? void 0 : _b.target, el),
                        }
                        : {},
                    multiple: type === "multiple_choice"
                        ? {
                            text: fromElementLike((_c = question.multiple) === null || _c === void 0 ? void 0 : _c.text, el),
                            target: fromElementLike((_d = question.multiple) === null || _d === void 0 ? void 0 : _d.target, el),
                        }
                        : {},
                    judgment: type === "judgment"
                        ? {
                            text: fromElementLike((_e = question.judgment) === null || _e === void 0 ? void 0 : _e.text, el),
                            target: fromElementLike((_f = question.judgment) === null || _f === void 0 ? void 0 : _f.target, el),
                        }
                        : {},
                    completion: type === "completion"
                        ? {
                            target: fromElementLike((_g = question.completion) === null || _g === void 0 ? void 0 : _g.target, el),
                        }
                        : {},
                };
                this.questions.push(qe);
            }
        }
    };
    QA.default = {
        type: question_type_resolver_1.getQuestionType,
        answer: function () { return ({ question: "", answers: [] }); },
        question: {
            container: "ul",
            title: "div span",
            single: {
                text: "li",
                target: "li input",
                handler: single_choice_1.singleChoiceHandler,
            },
            multiple: {
                text: "li",
                target: "li input",
                handler: multiple_choice_1.multipleChoiceHandler,
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
                handler: judgment_1.judgmentHandler,
            },
            completion: {
                target: "textarea",
                handler: completion_1.completionHandler,
            },
        },
    };
    return QA;
}());
exports.QA = QA;
