import { StringUtils } from "../utils";
import { WorkContext, QuestionTypes, WorkResult, RawElements } from "./interface";

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

/**
 * 添加题目答题结果
 */
export function createSearchResultElement<E extends RawElements>(res: WorkResult<E>) {
    var el = <T extends keyof HTMLElementTagNameMap>(tag: T) => document.createElement<T>(tag);

    const details = el("details");

    const summary = document.createElement("summary");
    const title = res.ctx?.elements.title?.[0];

    summary.innerText = StringUtils.of(title?.innerText || "")
        .nowrap()
        .max(50)
        .text();
    summary.title = title?.innerText || "";

    details.appendChild(summary);

    const error = el("div");

    if (res.error || !res.result?.finish) {
        summary.style.color = "red";

        if (res.error) {
            error.innerText = res.error.message;
        } else if (!res.result?.finish) {
            error.innerText = "未匹配到正确的选项";
        }
        error.style.padding = "0px 0px 8px 12px";
        details.appendChild(error);
    }

    for (const result of res.ctx?.searchResults || []) {
        const tk = el("div");
        tk.classList.add("search-results-container");

        let desc = el("div");
        desc.innerText = "题库：";
        let name;
        if (result.homepage) {
            name = el("a");
            name.href = result.homepage;
        } else {
            name = el("span");
        }
        name.innerText = result.name;
        name.title = `主页: ${result.homepage}\n接口: ${result.url}`;
        desc.appendChild(name);
        const length = el("span");
        length.innerText = ` ${result.answers.length}个结果`;
        desc.appendChild(name);
        desc.appendChild(length);

        let resultList = el("div");
        resultList.style.paddingLeft = "12px";

        for (const answer of result.answers) {
            const item = el("div");
            const ques = el("div");
            const ans = el("div");

            ques.innerText = `题目: ${StringUtils.of(answer.question).nowrap().max(50).text()}`;
            ques.title = answer.question;
            ans.innerText = `回答: ${StringUtils.of(answer.answer).nowrap().max(50).text()}`;
            ans.title = answer.answer;

            item.classList.add("search-results-item");
            item.appendChild(ques);
            item.appendChild(ans);
            resultList.appendChild(item);
        }

        tk.appendChild(desc);
        tk.appendChild(resultList);

        details.appendChild(tk);
    }

    return details;
}
