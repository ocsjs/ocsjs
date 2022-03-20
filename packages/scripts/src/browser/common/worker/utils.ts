import { WorkContext, QuestionTypes } from "./interface";

/** 默认题目类型解析器 */
export function defaultWorkTypeResolver(ctx: WorkContext<any>): QuestionTypes | undefined {
    function count(selector: string) {
        let c = 0;
        for (const option of ctx.elements.options || []) {
            if (option.querySelector(selector) !== null) {
                c++;
            }
        }
        return c;
    }
    return count('[type="radio"]') === 2
        ? "judgement"
        : count('[type="radio"]') > 2
        ? "single"
        : count('[type="checkbox"]') > 2
        ? "multiple"
        : count("textarea") >= 1
        ? "completion"
        : undefined;
}
