"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleChoiceHandler = void 0;
var _1 = require(".");
function multipleChoiceHandler(answers, options) {
    var ratings = (0, _1.getOptionSimilarly)(answers, options);
    for (var i = 0; i < ratings.length; i++) {
        if (ratings[i] > 0.6) {
            options[i].click();
        }
    }
}
exports.multipleChoiceHandler = multipleChoiceHandler;
