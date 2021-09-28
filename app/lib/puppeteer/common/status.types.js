"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
/**
 * 状态码
 * ```
 * 1000-2000 成功信息
 * 2000-3000 调试信息
 * 3000-4000 警告信息
 * 4000-5000 错误信息
 * 5000-6000 脚本内部错误
 * ```
 */
var Status;
(function (Status) {
    // 1000-2000
    Status[Status["\u6D4F\u89C8\u5668\u542F\u52A8\u6210\u529F"] = 1000] = "\u6D4F\u89C8\u5668\u542F\u52A8\u6210\u529F";
    Status[Status["\u9A8C\u8BC1\u7801\u7834\u89E3\u6210\u529F"] = 1001] = "\u9A8C\u8BC1\u7801\u7834\u89E3\u6210\u529F";
    Status[Status["\u767B\u5F55\u6210\u529F"] = 1002] = "\u767B\u5F55\u6210\u529F";
    // 2000-3000
    Status[Status["\u7B49\u5F85\u7528\u6237\u81EA\u884C\u767B\u5F55\u4E2D"] = 2000] = "\u7B49\u5F85\u7528\u6237\u81EA\u884C\u767B\u5F55\u4E2D";
    Status[Status["\u811A\u672C\u8FD0\u884C\u4E2D"] = 2010] = "\u811A\u672C\u8FD0\u884C\u4E2D";
    // 3000-4000
    Status[Status["\u672A\u63D0\u4F9B\u6D4F\u89C8\u5668\u8DEF\u5F84"] = 3000] = "\u672A\u63D0\u4F9B\u6D4F\u89C8\u5668\u8DEF\u5F84";
    // 4000-5000
    Status[Status["\u6D4F\u89C8\u5668\u8DEF\u5F84\u65E0\u6548"] = 4000] = "\u6D4F\u89C8\u5668\u8DEF\u5F84\u65E0\u6548";
    Status[Status["\u6D4F\u89C8\u5668\u542F\u52A8\u5931\u8D25"] = 4001] = "\u6D4F\u89C8\u5668\u542F\u52A8\u5931\u8D25";
    Status[Status["\u672A\u63D0\u4F9B\u9A8C\u8BC1\u7801\u7834\u89E3\u7684\u8D26\u53F7\u548C\u5BC6\u7801"] = 4010] = "\u672A\u63D0\u4F9B\u9A8C\u8BC1\u7801\u7834\u89E3\u7684\u8D26\u53F7\u548C\u5BC6\u7801";
    Status[Status["\u9A8C\u8BC1\u7801\u7834\u89E3\u5931\u8D25"] = 40011] = "\u9A8C\u8BC1\u7801\u7834\u89E3\u5931\u8D25";
    Status[Status["\u767B\u5F55\u5931\u8D25"] = 4020] = "\u767B\u5F55\u5931\u8D25";
    Status[Status["\u81EA\u52A8\u767B\u5F55\u8FD0\u884C\u8D85\u8FC7\u9650\u5236\u6B21\u6570"] = 4021] = "\u81EA\u52A8\u767B\u5F55\u8FD0\u884C\u8D85\u8FC7\u9650\u5236\u6B21\u6570";
    // 5000-6000
    Status[Status["\u7F51\u7EDC\u9519\u8BEF"] = 5000] = "\u7F51\u7EDC\u9519\u8BEF";
    Status[Status["\u811A\u672C\u8FD0\u884C\u8D85\u65F6"] = 5010] = "\u811A\u672C\u8FD0\u884C\u8D85\u65F6";
    Status[Status["\u811A\u672C\u6267\u884C\u9519\u8BEF"] = 5011] = "\u811A\u672C\u6267\u884C\u9519\u8BEF";
    Status[Status["\u811A\u672C\u6267\u884C\u7684\u5143\u7D20\u4E0D\u5B58\u5728"] = 5012] = "\u811A\u672C\u6267\u884C\u7684\u5143\u7D20\u4E0D\u5B58\u5728";
})(Status = exports.Status || (exports.Status = {}));
