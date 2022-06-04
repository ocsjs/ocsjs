import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { WorkResult } from '../core/worker/interface';
import { useContext } from '../store';
import { Tooltip } from './Tooltip';
import { StringUtils } from '@ocsjs/common';

export const SearchResults = defineComponent({
  setup () {
    const { common } = useContext();
    // 判断是否有搜索结果
    const validResult = computed(() => common.workResults);
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
      common.workResults = [];

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
                    <div class="search-result-header">
                      <span
                        style={{ float: 'right', cursor: 'pointer' }}
                        onClick={() => (currentResult.value = undefined)}>
                        ❌
                      </span>
                      {/* 判断是否有网络图片格式的文本，有则替换成 img 标签 */}
                      <span innerHTML={
                        currentTitle.value
                          .replace(/https?:\/\/.*?\.(png|jpg|jpeg|gif)/g,
                            (match) => (`<img src="${match}" />`))
                      }>
                      </span>
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

                    <div class="search-results-containers">
                      {currentSearchResults.value?.map((res) => (

                        <div class="search-results-container">

                          <span class="search-results-title">
                            <span>题库:</span>
                            <a href={res.homepage ? res.homepage : '#'} target="_blank">
                              {res.name}
                            </a>
                            <span> {res.error ? '此题库请求错误: ' + res.error.message : `一共有 ${res.answers.length} 个结果`} </span>
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
                                        <div innerHTML={
                                          answer.question?.replace(/https?:\/\/.*?\.(png|jpg|jpeg|gif)/g,
                                            (match) => (`<img src="${match}" />`))
                                        }></div>
                                      </span>
                                    </div>
                                    <div title={answer.answer}>
                                      <span>
                                        <span style="color: #a7a7a7">回答: </span>
                                        {/* 判断是否有网络图片格式的文本，有则替换成 img 标签 */}
                                        <div innerHTML={
                                          answer.answer?.replace(/https?:\/\/.*?\.(png|jpg|jpeg|gif)/g,
                                            (match) => (`<img src="${match}" />`))
                                        }></div>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                        </div>
                      ))}
                    </div>
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

                  const isCopy = ref(false);

                  return (
                    <div
                      class="search-results-title"
                      onMouseenter={() => (currentResult.value = res)}
                      style={{ color: res.result?.finish ? '' : 'red' }}
                      title={res.ctx?.elements.title?.[0].innerText}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span
                        style={{
                          borderRight: '1px solid #cbcbcb',
                          marginRight: '2px',
                          textShadow: 'black 0px 0px',
                          fontSize: '14px',
                          display: 'inline-block',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (isCopy.value === false) {
                            isCopy.value = true;
                            navigator.clipboard.writeText(title?.innerText.trim() || '');
                            setTimeout(() => {
                              isCopy.value = false;
                            }, 500);
                          }
                        }}
                      >
                        <Tooltip title='复制题目'>
                          {isCopy.value ? '✅' : '📄'}
                        </Tooltip>

                      </span>

                      <span style={{
                        borderRight: '1px solid #cbcbcb',
                        marginRight: '2px',
                        paddingRight: '2px',
                        color: 'darkgrey',
                        userSelect: 'none'
                      }}>
                        {i + 1}
                      </span>
                      <span >
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
