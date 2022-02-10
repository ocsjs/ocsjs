"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleChoiceHandler = void 0;
var _1 = require(".");
function singleChoiceHandler(answers, options) {
    var ratings = (0, _1.getOptionSimilarly)(answers, options);
    var max = ratings.sort()[ratings.length - 1];
    options[ratings.findIndex(function (r) { return r === max; })].click();
}
exports.singleChoiceHandler = singleChoiceHandler;
