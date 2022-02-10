"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.judgmentHandler = exports.startWithRight = exports.wrong = exports.right = void 0;
var similarity = require("string-similarity");
exports.right = "是|对|正确|√|对的|是的|正确的|true|yes|YES|Yes";
exports.wrong = "否|错|错误|x|错的|不正确的|不正确|不是|不是的|false|no|NO|No";
exports.startWithRight = true;
function judgmentHandler(answers, options) {
    var target = similarity.findBestMatch(answers[0], exports.right.split("|").concat(exports.wrong.split("|"))).bestMatch.target;
    var index = 1;
    // 开始选择
    if (exports.startWithRight) {
        if (RegExp(exports.right).test(target)) {
            index = 0;
        }
    }
    else {
        if (RegExp(exports.wrong).test(target)) {
            index = 0;
        }
    }
    options[index].click();
}
exports.judgmentHandler = judgmentHandler;
