import { getOptionSimilarly } from ".";
const similarity = require("string-similarity");

export const right = "是|对|正确|√|对的|是的|正确的|true|yes|YES|Yes";
export const wrong = "否|错|错误|x|错的|不正确的|不正确|不是|不是的|false|no|NO|No";
export const startWithRight = true;

export function judgmentHandler(answers: string[], options: Element[]) {
    const { target } = similarity.findBestMatch(answers[0], right.split("|").concat(wrong.split("|"))).bestMatch;
    let index = 1;
    // 开始选择
    if (startWithRight) {
        if (RegExp(right).test(target)) {
            index = 0;
        }
    } else {
        if (RegExp(wrong).test(target)) {
            index = 0;
        }
    }
    (options[index] as HTMLElement).click();
}
