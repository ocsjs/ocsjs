import { computed, defineComponent, h } from "vue";
import { store } from "../script";

import { StringUtils } from "../core/utils";

export const SearchResults = defineComponent({
    data() {
        // 判断是否有搜索结果
        const validResult = computed(() =>
            store.localStorage.workResults.filter((res) => res.ctx?.elements.title?.[0]?.innerText)
        );
        const hasResult = computed(() => validResult.value.length > 0);
        return { hasResult, validResult };
    },

    render() {
        return (
            <div id="search-results">
                {this.hasResult ? (
                    <div>
                        <div style="text-align:center"> 📢 点击以下任意题目，可以展开查看搜索详情 📢 </div>
                        <hr></hr>
                        {this.validResult.map((res) => {
                            const title = res.ctx?.elements.title?.[0];

                            return (
                                <details>
                                    <summary
                                        style={{ color: res.ctx?.searchResults.length ? "" : "red" }}
                                        title={title?.innerText || ""}
                                    >
                                        {StringUtils.of(title?.innerText || "")
                                            .nowrap()
                                            .max(40)
                                            .text()}
                                    </summary>
                                    {res.ctx?.searchResults.length ? (
                                        res.ctx?.searchResults.map((searchResult) => (
                                            <div class="search-results-container">
                                                <span class="search-results-title">
                                                    <span>题库:</span>
                                                    <a href={searchResult.homepage ? searchResult.homepage : "#"}>
                                                        {searchResult.name}
                                                    </a>
                                                    一共有 {searchResult.answers.length} 个答案
                                                </span>
                                                <div style={{ paddingLeft: "12px" }}>
                                                    {searchResult.answers.map((answer) => (
                                                        <div class="search-results-item">
                                                            <div title={answer.question}>
                                                                <span>
                                                                    <span style="color: #a7a7a7">题目: </span>
                                                                    {StringUtils.of(answer.question)
                                                                        .nowrap()
                                                                        .max(50)
                                                                        .text()}
                                                                </span>
                                                            </div>
                                                            <div title={answer.answer}>
                                                                <span>
                                                                    <span style="color: #a7a7a7">回答: </span>
                                                                    {StringUtils.of(answer.answer)
                                                                        .nowrap()
                                                                        .max(50)
                                                                        .text()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ color: "red", padding: "0px 0px 0px 8px" }}>未搜索到答案</div>
                                    )}
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div class="search-results-empty" style={{ textAlign: "center" }}>
                        没有搜索结果
                    </div>
                )}
            </div>
        );
    },
});
