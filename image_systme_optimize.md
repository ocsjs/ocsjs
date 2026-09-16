# 优化图片题解析：结构化 DOM 遍历重构（方案 C）

## Context

`optimizationElementWithImage`（[work.ts:207-226](packages/scripts/src/utils/work.ts#L207-L226)）注入 `font-size:0px` 隐藏 `<span>` 把 `img.src` 塞进 DOM，调用方再读 `innerText`/`textContent` 回提 URL，最后 `createImageSuggestion` 用 `imageUrlRegex`（[answerer-env.ts:156](packages/scripts/src/utils/answerer-env.ts#L156)）从拼接字符串里二次提取。该 `0px-span → innerText → 正则` 链路存在三处 fragility：

1. 相邻图片 URL 无分隔直接拼接，贪婪查询组 `(?:\?[^\s一-鿿＀-￯]*)?`（排除 `\s` 但不排除 `:/`）会吞掉后续 URL —— 即用户报告的“url 正则匹配不正确、歧义”。
2. `innerText` 受 CSS 影响（icve/icourse 已被迫改用 `textContent` 规避，[icve.ts:952-953](packages/scripts/src/projects/icve.ts#L952-L953)）。
3. `clone_node=false` 调用破坏性地向真实页面 DOM 注入隐藏 span。

全量调研后另发现两类必须兼顾的消费者：
- **展示/搜索/缓存层**消费**原始 URL 文本**：[search.infos.ts:8-21](packages/scripts/src/elements/search.infos.ts#L8-L21) `transformImgLinkOfQuestion` 把题目文本里的 URL 重新包成 `<img>` 渲染；[utils/index.ts:172-193](packages/scripts/src/utils/index.ts#L172-L193) `createQuestionTitleExtra` 用原文本做百度搜索/复制；[common.ts:1482-1505](packages/scripts/src/projects/common.ts#L1482-L1505) `searchAnswerInCaches` 用 `cache.title.trim() === title.trim()` 精确匹配。这些**不能改成占位符文本**，否则展示丢图、百度搜索失效、缓存全量失效。
- **字符串输入调用方**无法用 DOM 遍历：[common.ts:1328-1331](packages/scripts/src/projects/common.ts#L1328-L1331) 在线搜索（textarea 文本）、[unipus/exploration.ts:903-907](packages/scripts/src/projects/unipus/exploration.ts#L903-L907)（纯文本题，不含图片 URL）、[tests/answerer.test.ts](tests/answerer.test.ts)。`createImageSuggestion` 的正则路径是它们唯一的图片提取手段，**必须保留为回退**。

## 设计原则

- `extractTextWithImages(root).text` 产出**原始 URL 文本**（URL 间用空格分隔），与今日 `optimizationElementWithImage(...).innerText` 输出**同格式**——展示/搜索/缓存层零改动、缓存不失效。
- `extractTextWithImages(root).images` 额外返回按文档顺序的 URL 数组，让 `createImageSuggestion` 在 DOM 调用方**跳过正则**，直接用数组下载/编号/占位替换；字符串调用方仍走正则回退（且因分隔空格，正则也安全）。
- 解析器匹配路径：给 `DefaultWork` 增加可选 `optionText` 提供器，worker 内部 `createDefaultQuestionResolver(ctx, optionText)` 优先用提供器而非 `o.innerText`，从而**移除 4 处实时 DOM 改造**。

## 改动清单

### 1. 新增 `extractTextWithImages` —— [work.ts](packages/scripts/src/utils/work.ts)

```ts
export interface ExtractTextOptions {
  /** 仅收集满足条件的 img（zhs 选项需排除按钮图片） */
  imgFilter?: (img: HTMLImageElement) => boolean;
}
export function extractTextWithImages(
  root: HTMLElement,
  opts?: ExtractTextOptions
): { text: string; images: string[] }
```

递归遍历 `childNodes`：文本节点 push `textContent`；`<img>`（通过 `imgFilter`）push ` ${url} ` 到 parts、push `url` 到 images；`<br>` push `\n`；其他元素递归，跳过 `getComputedStyle(el).display === 'none'`（模拟 innerText 对非渲染节点的跳过，避免 textContent 收进隐藏文本）。`text = parts.join('')`。**不改造 DOM、不读 innerText、不用正则**。对 detached 元素（zhs 2615 由 JSON HTML 构建的 div）同样适用。

### 2. `createImageSuggestion` 跳过正则（保留回退）—— [answerer-env.ts:151-240](packages/scripts/src/utils/answerer-env.ts#L151-L240)

新增可选形参 `titleImages?: string[]` / `optionImages?: string[]`：
- 提供时：直接用作 `titleUrls`/`optionUrls`，**跳过 `imageUrlRegex` 的 `match`**；后续去重/下载/放大/`[图片N]` 占位逻辑不变，URL→占位仍用 `text.split(url).join(placeholder)`。
- 未提供时：回退到现有 `title.match(imageUrlRegex)` 正则路径（供 common.ts 在线搜索、unipus、测试使用；因 DOM 调用方已注入空格分隔，正则路径也安全）。
- `ImageSuggestionResult` 结构不变；`defaultAnswerWrapperHandler` 的 `${images}`/`${suggestion_title}`/`${suggestion_options}` 占位名不变（[answer.wrapper.handler.ts:77-82](packages/core/src/core/answer-wrapper/answer.wrapper.handler.ts#L77-L82)）。

### 3. `buildAnswererEnv` / `createCommonAnswerer` 穿透 images

- [answerer-env.ts:268-300](packages/scripts/src/utils/answerer-env.ts#L268-L300) `buildAnswererEnv` 增加可选 `titleImages?`/`optionsImages?`，透传给 `createImageSuggestion`。`env.title`/`env.options` 仍为**原始 URL 文本**不变。
- [work.ts:320-349](packages/scripts/src/utils/work.ts#L320-L349) `createCommonAnswerer` 的 `titleTransform`/`optionsTransform` 返回类型放宽为 `string | { text: string; images?: string[] }`；内部归一化后调用 `buildAnswererEnv({ title, options, titleImages, optionsImages, enableImageOptimize })`。

### 4. 解析器 `optionText` 提供器（core，向后兼容）

- [question.resolver.ts:5-103](packages/core/src/core/worker/question.resolver.ts#L5-L103) `createDefaultQuestionResolver<E>(ctx, optionText?: (el: E, i: number) => string)`：行 15/48/72 的 `options.map((o) => o.innerText)` 改为 `options.map((o, i) => optionText ? optionText(o, i) : o.innerText)`。不传则维持 `innerText`，旧调用方零影响。
- [interface.ts:109-156](packages/core/src/core/worker/interface.ts#L109-L156) `DefaultWork<E>` 增加可选 `optionText?: (el: HTMLElement, i: number) => string`。
- [worker.ts:220](packages/core/src/core/worker/worker.ts#L220) `createDefaultQuestionResolver(result.ctx, this.opts.work.optionText)`。

### 5. 迁移搜索路径（title/options 文本提取）

把 `optimizationElementWithImage(el, true).innerText`（或 `.textContent`+`replace`）改为 `extractTextWithImages(el)`，`titleTransform`/`optionsTransform` 返回 `{ text, images }`：

- cx：[cx.ts:780](packages/scripts/src/projects/cx.ts#L780) title、[cx.ts:841](packages/scripts/src/projects/cx.ts#L841) options、[cx.ts:1844](packages/scripts/src/projects/cx.ts#L1844) chapter title、[cx.ts:1896](packages/scripts/src/projects/cx.ts#L1896) chapter options
- zhs：[zhs.ts:2615](packages/scripts/src/projects/zhs.ts#L2615) title（detached div）、[zhs.ts:2770/2879/3029/3180/3291/3410](packages/scripts/src/projects/zhs.ts#L2770) 六处 `titleTransform`
- icve：[icve.ts:951-954](packages/scripts/src/projects/icve.ts#L951-L954) title（移除 textContent workaround 注释）、[icve.ts:999](packages/scripts/src/projects/icve.ts#L999) options
- icourse：[icourse.ts:488-490](packages/scripts/src/projects/icourse.ts#L488-L490) title、[icourse.ts:516](packages/scripts/src/projects/icourse.ts#L516) options

下游归一化保留：cx 的 `StringUtils.nowrap`+`nospace`（[string.ts:29-51](packages/core/src/utils/string.ts#L29-L51)）、icve/icourse 的 `replace(/\s+/g,' ')`。`extractTextWithImages` 产出的空格分隔经归一化后仍保留至少一个空格，`createImageSuggestion` 的 `split(url).join(placeholder)` 与回退正则均安全。

### 6. 迁移解析器匹配路径（4 处 + zhs 选项）

移除实时 DOM 改造，改传 `optionText`：

- cx：[cx.ts:858](packages/scripts/src/projects/cx.ts#L858) `createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)`，[cx.ts:861](packages/scripts/src/projects/cx.ts#L861) options 直接传 `elements.options`；[cx.ts:1909/1941](packages/scripts/src/projects/cx.ts#L1909) 同理。
- icve：[icve.ts:1033](packages/scripts/src/projects/icve.ts#L1033) `onElementSearched` 移除 `optimizationElementWithImage`；在 OCSWorker `work.optionText` 传 `(o) => extractTextWithImages(o).text`。
- icourse：[icourse.ts:557](packages/scripts/src/projects/icourse.ts#L557) 移除 `optimizationElementWithImage(el)`，**保留** 对/错图标 `replaceWith('对'/'错')`；`work.optionText` 同上。
- zhs 选项：[zhs.ts:2630-2641](packages/scripts/src/projects/zhs.ts#L2630-L2641) `elements.options` 选择器中移除 `createUnVisibleTextOfImage`；`data-src`→`src` 懒加载提升与 `imgFilter` 排除按钮图片移入 `work.optionText`：`(o) => extractTextWithImages(o, { imgFilter: (img) => { const u = img.dataset.src || img.src; if (img.dataset.src) img.src = img.dataset.src; return !!img.closest('.node_detail'); } }).text`（沿用原注释“zhs 选项按钮也是图片”的意图，仅采集 `.node_detail` 内图片）。

### 7. 保留的消费者（零改动，仅验证）

- [search.infos.ts:8-21](packages/scripts/src/elements/search.infos.ts#L8-L21) `transformImgLinkOfQuestion`：消费原始 URL 文本，`extractTextWithImages` text 仍含原始 URL，渲染不变。
- [utils/index.ts:172-193](packages/scripts/src/utils/index.ts#L172-L193) `createQuestionTitleExtra`：百度搜索/复制用原文本，不变。
- [common.ts:1328-1331](packages/scripts/src/projects/common.ts#L1328-L1331) 在线搜索、[unipus/exploration.ts:903-907](packages/scripts/src/projects/unipus/exploration.ts#L903-L907)、[tests/answerer.test.ts](tests/answerer.test.ts)：字符串输入，走 `createImageSuggestion` 正则回退，不变。
- [common.ts:1443-1505](packages/scripts/src/projects/common.ts#L1443-L1505) 缓存：`title` 仍为原始 URL 文本，`trim()` 精确匹配不变，**无缓存失效**。风险项见下。

### 8. 清理

迁移完毕后删除 `optimizationElementWithImage` 与 `createUnVisibleTextOfImage`（[work.ts:207-237](packages/scripts/src/utils/work.ts#L207-L237)）及其 export；[work.ts:14-24](packages/scripts/src/utils/work.ts#L14-L24) 的 re-export 同步移除已无外部引用的项。

## 风险与验证

- **textContent vs innerText 空格差异 → 缓存命中**：`extractTextWithImages` 用 textContent 遍历，旧路径用 innerText（CSS 折叠空白）。`display:none` 跳过已覆盖主要差异；其余差异由各调用点既有归一化兜底。验证：对 cx/icve 各取一道含图片真题，对比 `extractTextWithImages(el).text` 经归一化后与旧 `optimizationElementWithImage(el,true).innerText` 经归一化后的字符串是否一致；若不一致需在 `extractTextWithImages` 内补空白折叠。
- **单元测试**（`tests/` 下新建或并入 `answerer.test.ts`）：
  1. 相邻双 `<img>` → `extractTextWithImages` 断言 `text` 中两 URL 间有空格、`images.length === 2`。
  2. `createImageSuggestion(title, undefined, titleImages)` 跳过正则路径，断言 `images.length === 2`、`suggestion_title` 含独立的 `[图片1]`/`[图片2]`。
  3. 回归：`answerer.config.json` 现有 icve 查询串夹具跑通，单图 happy path 不变。
  4. `createDefaultQuestionResolver(ctx, optionText)` 用提供器返回的文本与 `o.innerText` 在无图片时结果一致。
- **类型与构建**：`pnpm build` 通过；`DefaultWork.optionText`、`createDefaultQuestionResolver` 第二参、`buildAnswererEnv`/`createCommonAnswerer` 新参均为可选，core 包 d.ts 无破坏性变更。
- **手动**：cx/超星 含相邻图片题的页面跑一次搜题，确认题库收到的 `suggestion_title` 每图独立编号、无 URL 拼接；图片选项仍被 resolver 正确匹配点击；结果面板图片正常渲染；缓存命中正常。

## 附录：调研覆盖的图片题相关模块

全量检索后确认涉及图片题解析的模块清单（用于回归核对）：

| 模块 | 作用 | 改动 |
| --- | --- | --- |
| [work.ts](packages/scripts/src/utils/work.ts) `optimizationElementWithImage` / `createUnVisibleTextOfImage` | 0px-span 注入 | 删除 |
| [work.ts](packages/scripts/src/utils/work.ts) `simplifyWorkResult` | 题目文本入结果 | 间接（titleTransform 变） |
| [work.ts](packages/scripts/src/utils/work.ts) `createCommonAnswerer` | 搜题入口 | 穿透 images |
| [answerer-env.ts](packages/scripts/src/utils/answerer-env.ts) `createImageSuggestion` / `buildAnswererEnv` / `imageToBase64` | 正则提取+下载+占位 | 跳过正则+穿透 images |
| [answerer-env.ts](packages/scripts/src/utils/answerer-env.ts) `isAnswererWrappersSupportImageOptimize` | POST 检测 | 不变 |
| [png-upscaler.ts](packages/scripts/src/utils/png-upscaler.ts) | 小图放大 | 不变 |
| [answer.wrapper.handler.ts](packages/core/src/core/answer-wrapper/answer.wrapper.handler.ts) `defaultAnswerWrapperHandler` | `${images}` 等占位 | 不变 |
| [search.infos.ts](packages/scripts/src/elements/search.infos.ts) `transformImgLinkOfQuestion` | 展示渲染 | 不变（仍消费原始 URL） |
| [utils/index.ts](packages/scripts/src/utils/index.ts) `createQuestionTitleExtra` | 百度/复制 | 不变 |
| [question.resolver.ts](packages/core/src/core/worker/question.resolver.ts) `createDefaultQuestionResolver` | 选项匹配 | 增 optionText |
| [interface.ts](packages/core/src/core/worker/interface.ts) `DefaultWork` / `QuestionResolver` | 类型 | 增可选 optionText |
| [worker.ts](packages/core/src/core/worker/worker.ts) | 内部建 resolver | 透传 optionText |
| [common.ts](packages/scripts/src/projects/common.ts) `imageOptimize` 配置 / `checkImageOptimizeCompatibility` / 缓存 | 配置与缓存 | 不变 |
| [common.ts](packages/scripts/src/projects/common.ts) 在线搜索 `buildAnswererEnv` | 字符串输入 | 不变（正则回退） |
| cx / zhs / icve / icourse 项目 | titleTransform/optionsTransform/onElementSearched | 迁移 |
| unipus / zjy 项目 | 不用图片提取 | 不变 |
| [tests/answerer.test.ts](tests/answerer.test.ts) / [tests/resolver.test.ts](tests/resolver.test.ts) | 测试 | 补单测+回归 |
