import { computed, defineComponent } from "vue";
import { store } from "../script";

import { StringUtils } from "../core/utils";

export const SearchResults = defineComponent({
    data() {
        // 判断是否有搜索结果
        const validResult = computed(() => store.workResults.filter((res) => res.ctx?.elements.title?.[0]?.innerText));
        const hasResult = computed(() => validResult.value.length > 0);
        return { hasResult, validResult };
    },

    render() {
        return (
            <div id="search-results">
                {this.hasResult ? (
                    <div>
                        <div style="text-align:center; padding-bottom: 4px">
                            📢 点击以下任意题目，可以展开查看搜索详情 📢{" "}
                        </div>
                        <hr />
                        {this.validResult.map((res) => {
                            const title = res.ctx?.elements.title?.[0];

                            return (
                                <details>
                                    <summary
                                        style={{
                                            color: res.ctx?.searchResults.length && res.result?.finish ? "" : "red",
                                        }}
                                        title={title?.innerText || ""}
                                    >
                                        {StringUtils.of(title?.innerText || "")
                                            .nowrap()
                                            .max(40)
                                            .text()}
                                    </summary>
                                    <div
                                        class="search-results-error"
                                        style={{ color: "red", padding: "0px 0px 0px 8px" }}
                                    >
                                        {res.result?.finish === false ? (
                                            <span>未完成, 可能是没有匹配的选项</span>
                                        ) : res.ctx?.searchResults.length === 0 ? (
                                            <span>未搜索到答案</span>
                                        ) : (
                                            {}
                                        )}
                                    </div>

                                    {res.ctx?.searchResults.map((searchResult) => (
                                        <div class="search-results-container">
                                            <span class="search-results-title">
                                                <span>题库:</span>
                                                <a
                                                    href={searchResult.homepage ? searchResult.homepage : "#"}
                                                    target="_blank"
                                                >
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
                                                                {StringUtils.of(answer.answer).nowrap().max(50).text()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div class="search-results-empty" style={{ textAlign: "center" }}>
                        没有搜索结果
                        <br />
                        如果当前为学习页面，请等待视频，ppt等完成后才会开始自动答题
                    </div>
                )}
            </div>
        );
    },
});
