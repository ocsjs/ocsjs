import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { store } from '../script';

import { StringUtils } from '../core/utils';
import { WorkResult } from '../core/worker/interface';

export const SearchResults = defineComponent({
  setup () {
    // 判断是否有搜索结果
    const validResult = computed(() => store.workResults);
    const hasResult = computed(() => validResult.value.length > 0);
    // 当前搜索对象
    const currentResult: Ref<WorkResult<any> | undefined> = ref(undefined);
    //  当前展示的结果
    const currentSearchResults = computed(() => currentResult.value?.ctx?.searchResults);
    // 简短标题
    const currentTitle = computed(() =>
      StringUtils.of(currentResult.value?.ctx?.elements.title?.[0].innerText || '')
        .nowrap()
        .toString()
    );

    onMounted(() => {
      // 清空搜索结果
      store.workResults = [];

      // 监听页面点击事件，然后关闭搜索悬浮窗
      document.addEventListener('click', () => {
        currentResult.value = undefined;
      });
    });

    return () => (
      <div id="search-results">
        {hasResult.value
          ? (
            <div>
              {currentResult.value
                ? (
                  <div class="search-result-modal" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => (currentResult.value = undefined)}>
                    ❌
                      </span>

                      {currentTitle.value}
                    </div>
                    <hr />
                    <div class="search-results-error" style={{ color: 'red', padding: '0px 0px 0px 8px' }}>
                      <span>
                        {currentResult.value?.error
                          ? currentResult.value?.error.message
                          : currentResult.value?.result?.finish === false
                            ? '未完成, 可能是没有匹配的选项'
                            : currentResult.value?.ctx?.searchResults?.length === 0
                              ? '未搜索到答案'
                              : ''}
                      </span>
                    </div>

                    {currentSearchResults.value?.map((res) => (

                      <div class="search-results-container">

                        <span class="search-results-title">
                          <span>题库:</span>
                          <a href={res.homepage ? res.homepage : '#'} target="_blank">
                            {res.name}
                          </a>
                          <span> {res.error ? '此题库请求错误: ' + res.error.message : `一共有 ${res.answers.length} 个答案`} </span>
                        </span>
                        {res.error
                          ? (
                            <div></div>
                          )
                          : (
                            <div style={{ paddingLeft: '12px' }}>
                              {res.answers.map((answer) => (
                                <div class="search-results-item">
                                  <div title={answer.question}>
                                    <span>
                                      <span style="color: #a7a7a7">题目: </span>
                                      {StringUtils.of(answer.question).nowrap().max(50).toString()}
                                    </span>
                                  </div>
                                  <div title={answer.answer}>
                                    <span>
                                      <span style="color: #a7a7a7">回答: </span>
                                      {StringUtils.of(answer.answer).nowrap().max(50).toString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                      </div>
                    ))}
                  </div>
                )
                : (
                  <div></div>
                )}

              <div style="text-align:center; padding-bottom: 4px">
                <span>📢 鼠标移到任意题目，可以查看搜索详情 📢</span><br/>
                <span>❗如果题目文字变大，则是正在对文本进行文字识别，属于正常情况❗</span>
              </div>

              <hr />

              <div>
                {validResult.value.map((res, i) => {
                  const title = res.ctx?.elements.title?.[0];

                  return (
                    <div
                      class="search-results-title"
                      onMouseenter={() => (currentResult.value = res)}
                      style={{ color: res.result?.finish ? '' : 'red' }}
                      title={res.ctx?.elements.title?.[0].innerText}
                    >
                      <span style={{
                        borderRight: '1px solid #cbcbcb',
                        marginRight: '2px',
                        paddingRight: '2px',
                        color: 'darkgrey'
                      }}>
                        {i + 1}
                      </span>
                      <span>
                        {StringUtils.of(title?.innerText || '')
                          .nowrap()
                          .max(40)
                          .toString()}
                      </span>

                    </div>
                  );
                })}
              </div>
            </div>
          )
          : (
            <div class="search-results-empty" style={{ textAlign: 'center' }}>
            暂无搜索结果
              <br />
            如果当前为学习页面，请等待视频，ppt等完成后才会开始自动答题
            </div>
          )}
      </div>
    );
  }
});
