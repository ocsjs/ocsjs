# 雨课堂（studentCards）课件自动完成 —— 可行性说明与实现记录

> 本文件记录：① OCS 目前能否二次开发；② 现有雨课堂模块的覆盖与缺口；③ 本次新增的「图文 / 视频 / 习题 / 混合课件」自动完成能力与验证方式。

---

## 一、OCS 现在能不能二次开发？

结论：**能（源码开放，MIT 许可），但官方对“深度二次开发”采取“部分开放 + 联系作者”的态度。**

证据：

1. 官方开发文档 <https://docs.ocsjs.com/docs/other/api> 明确写着：
   > “由于现在盗版脚本猖獗，所以只提供部分 API 以及开发教程，**如需二次开发或者加入开发者，请联系作者进行确认并获取使用步骤**。”
   - 也就是说官方**只公开了部分 API**（如题库 `AnswererWrapper` 配置解析、特殊占位符、自定义 handler 等），完整的脚本框架/各平台脚本未在文档中系统开放，深度二次开发需要联系作者。
   - 文档同时给出了技术选型与目录结构：原生 JS + WebComponent；核心在 `packages/scripts/src/projects/` 下。
2. GitHub 仓库 <https://github.com/ocsjs/ocsjs> 是**完整开源**的（`package.json` 版本 5.x，`LICENSE` 为 MIT，版权 enncy）。MIT 许可意味着：**可以合法 fork、修改、再发行**。
3. 因此实际可行性分两层：
   - **法律/技术上**：可以。克隆仓库后直接在 `packages/scripts/src/projects/` 增加平台脚本即可，构建产物为油猴/脚本猫可安装脚本。
   - **官方支持上**：文档只承诺部分 API；要做“完整能力”的二次开发，官方建议联系作者确认，避免与官方版本冲突。
4. 推荐做法（本次采用）：**不改核心框架，只新增一个平台脚本 + 一个纯逻辑模块**，这样既符合 MIT、又最小化与上游的耦合，后续上游升级也容易合并。

---

## 二、现有雨课堂模块的覆盖与缺口

文件：`packages/scripts/src/projects/yuketang.ts`（约 1500 行）

已覆盖：

| 能力 | 位置 | 说明 |
| --- | --- | --- |
| PPT/图文（旧版浅层） | 原 `ppt` 脚本 | 仅点击 `.swiper-container .container` 内含 `.noRead` 的项，然后提示“手动切换到下一个任务” |
| AI 学伴：视频 | `ai` 脚本 → `watch()` / `ai_watch()` | `.detail-container video`，可设倍速/音量 |
| AI 学伴：讨论 | `autoCommentYktForum()` | `.lms-graph-forum` |
| AI 学伴：作业/习题 | `ai` 脚本 → `createYktEmbeddedWorkLoop()` | `iframe#iframeExerciseId` → `.container-problem .subject-item` 逐题作答 |
| 考试/随堂练习 | `exam` 脚本 → `examination()` | `examination.xuetangx.com` |
| 加密字体解密 | `setupYuketangFontDecrypt()` | 反字体混淆 |

缺口（也正是本次要补的）：

- **图文任务点（AI 学伴内）**：`getNextJob()` 虽然把 `图文` 标签列为支持，但 `study()` 里并没有“阅读图文”的分支，导致图文任务点可能一直未完成而被反复跳过/循环。
- **studentCards 课件**：原 `ppt` 脚本只会“点一遍 `.noRead` 就收工”，且**不处理视频、不处理课件内习题**，无法支撑“混合课件”。
- 缺少一个**统一的状态驱动循环**：识别当前是图文/视频/习题 → 执行 → 再看下一状态。

---

## 三、本次新增内容

### 3.1 新增「纯逻辑核心」（可单测，零依赖）

`packages/scripts/src/projects/yuketang-courseware-core.ts`

- `readDeckState(root, selectors)`：读取课件状态（未读页数量、总页数、习题数、是否有视频、是否有习题 iframe、是否需要先打开查看器）。
- `decideDeckStep(state)`：决策下一步动作：`open-deck | watch-video | read-slides | solve-exercise | done`。
- `collectUnreadTargets()`：兼容两种前端版本的“未读页”识别：
  - 新版：`span.flag.noRead` / `.flag.noRead` / `.noRead`（来自实测用户脚本）。
  - 旧版：`.swiper-container .container` 内含 `.noRead`（来自 OCS 原 `ppt` 脚本）。
- `deckStateSignature()` / `describeDeckState()`：用于“无进展保护”和日志。

选择器证据：
- 「雨课堂-自动看PPT-Pro」用户脚本（`@match *://*.yuketang.cn/v2/web/studentCards/*`）使用 `.ppt_img_box`、`span.flag.noRead`、`.ppt_page`（`(N页)`）、`.exercises_total`（`共N题`）、`.close`。
- OCS 原 `ppt` 脚本使用 `.swiper-container .container` + `.noRead`。

### 3.2 改造 `yuketang.ts`

1. 把原「📚 PPT自动阅读」升级为「📚 课件自动完成」脚本：
   - `matches` 覆盖 `/v2/web/studentCards/**/ppt`、`/video` 以及 `/v2/web/studentCards/`。
   - 新增配置：习题自动作答开关、视频音量/倍速。
   - `oncomplete` 调用新的驱动 `runStudentCardsCourseware()`。
2. 新增驱动函数（在 `yuketang.ts` 内）：
   - `runStudentCardsCourseware()`：`读状态 → 决策 → 执行` 主循环，带 `无进展保护`、`习题只尝试一次`、结束后自动关闭查看器。
   - `playDeckVideo()`：播放至 `ended`，自动续播，被页面切换时正常返回。
   - `solveDeckExercise()`：复用现有 `commonWork + createYktEmbeddedWorkLoop`，对课件内同源 `iframe` 习题逐题作答（需配置题库）。
3. 在 `ai` 脚本的 `study()` 中补一个**受保护的图文分支**：仅当 `.detail-container` 内出现“未读”标记时才逐页点击阅读，无标记则完全跳过，不影响视频/讨论/作业流程。

映射到需求：

| 需求 | 实现 |
| --- | --- |
| 图文页 | `read-slides`：逐页点击未读标记，内容为 PPT/幻灯片 |
| 视频页 | `watch-video`：`playDeckVideo()` 播放到结束 |
| 习题页 | `solve-exercise`：`solveDeckExercise()` 复用逐题答题器 |
| 混合课件 | 同一课件内按状态循环：视频 → 图文 → 习题 → 完成 |

---

## 四、已验证 / 待实测

### 已在本机验证（无需登录、无需浏览器）

- `node --experimental-strip-types --check` 对两个改动文件**语法通过**。
- 纯逻辑核心的 Mock 单元自测：`node --experimental-strip-types tools/verify-yuketang-courseware-core.ts`
  - 9 个场景全部通过：图文未读/已读、课件未打开、视频、习题、混合优先级、旧版容器、去重、状态签名。

### 已用真实页面只读实测（2026-11-12）

通过 Playwright（当前浏览器为已登录态）访问该 studentCards 页面，实测结构：

- 总 **11 页**；未读 **10**（第 1 页已读）。
- 每页类型：第 1、6 页 = **图文**；第 2–5 页 = **视频**（`.video-box`）；第 7–11 页 = **习题**（`.slide_layer.MultipleChoice`）。
- 逐页分类：图文 2 / 视频 4 / 习题 5 / 混合 0，与 `analyzeStudentCardsDeck()` + `DEFAULT_STUDENTCARDS_SELECTORS` 计算结果**完全一致**。

真实选择器（已写入核心）：

- 缩略图 `.pptThumbsSwiper .container`；未读 `.flag.noRead`（实测 10 个）。
- 主播放区 `.pptSwiper .swiper-slide`（每 slide 即一“课件页”，全部页同时在 DOM 中，故必须按 slide 逐页判断）。
- 视频 `.video-box`（默认“未观看”，点击后加载播放器）。
- 习题 `.slide_layer.MultipleChoice`，选项 `div.problembullet[data-label=A/B/C/D]`（**图片型**），提交 `div.quizImg.submitButton`。

平台规则（页面自带说明）：图文页停留 ≥1s；视频页观看 ≥90%；习题页需完成作答；混合页以习题为准。

> 安全边界：`analyzeStudentCardsDeck()` 只做识别、不点击/不提交；视频 90% 与图片型习题的“自动作答”尚未在真实账号上联调（不能对真实作业提交猜测答案）。

---

## 五、如何构建 / 运行

```bash
git clone https://github.com/ocsjs/ocsjs.git
cd ocsjs
corepack enable            # 或安装 pnpm
pnpm install
npm run build              # gulp 构建
# 开发调试：npm run dev
```

> 本沙箱内 pnpm/npm registry 不可用，故未执行完整 `pnpm install && build`；已完成语法检查与纯逻辑单测。

运行纯逻辑自测（仅需 Node 22）：

```bash
node --experimental-strip-types tools/verify-yuketang-courseware-core.ts
```

---

## 六、上游 PR / Issue 核查（2026-11-12）

结论：**上游目前没有任何 PR 实现“雨课堂课件（图文/视频/习题/混合）自动完成”。** 最接近的是**未解决的 Issue #342**。

| 编号 | 类型 | 状态 | 与本案关系 |
| --- | --- | --- | --- |
| [#342](https://github.com/ocsjs/ocsjs/issues/342) | Issue「[Feature]: 课件功能」 | **open** | **正主**：诉求=“雨课堂自动看课件，每页停留 >1s”，无关联 PR、无人实现 |
| [#343](https://github.com/ocsjs/ocsjs/pull/343) | PR「增强雨课堂 AI 学伴目录展开与跨章节切换」 | open | 只做 AI 学伴目录/切章健壮性，**不涉及课件页类型** |
| [#294](https://github.com/ocsjs/ocsjs/pull/294) | PR「add YukeTang exam answer support」 | open | 考试作答，非课件 |
| [#291](https://github.com/ocsjs/ocsjs/pull/291) / [#292](https://github.com/ocsjs/ocsjs/pull/292) | PR「字形哈希解密加密字体」 | closed（未合并） | 字体解密；当前代码已内置等价能力 |
| [#348](https://github.com/ocsjs/ocsjs/issues/348) | Issue「雨课堂的 AI 学堂无法正常观看」 | open | Bug，非本功能 |
| [#337](https://github.com/ocsjs/ocsjs/issues/337) | Issue「雨课堂倍速播放问题」 | open | Bug，非本功能 |
| [#269](https://github.com/ocsjs/ocsjs/issues/269) | Issue「长江云课堂以前支持，新的不支持了」 | open | Bug，非本功能 |
| [#106](https://github.com/ocsjs/ocsjs/issues/106) / [#63](https://github.com/ocsjs/ocsjs/issues/63) | 历史「添加雨课堂支持」 | closed | 早期接入，非本功能 |

搜索方式：GitHub `pulls?state=all`（77 条）+ `search/issues` 关键字 `studentCards`(0)/`课件`/`图文`/`雨课堂`/`PPT 自动` 全量检索。

因此本次实现对 #342 是**补位**，不是重复造轮子。

---

## 七、第二轮：基于真实页面的精确实现与实测（2026-11-12）

在被测页面上（已登录）通过 Playwright 实测，确认 studentCards 课件是 **Vue + Swiper**，关键机制：

- 根组件 `.studentCoursewarePPT__component.__vue__`：`allSlides` 为 11 个页面对象，每页含
  - `noRead`：是否未读（完成信号，服务端完成后会置 false）；
  - `noWatch` / `hasMedia`：视频页标记；
  - `Problem`：习题对象（无正确答案，仅 A/B/C/D）。
- 子组件 `.basePPT__component.__vue__`：`thumbSwiperClick(i)` 翻页；`handlePageTimer` 每 100ms 累计该页停留时长。
- 视频：点击 `.video-box` 后加载真实 `<video class="xt_video_player">`（阿里 CDN，单视频可达 25 分钟）；
  `getVideoWatchProgress()` 返回 `watch_length`（真实观看秒数）/`video_length`/`rate`。**只认真实播放时长，跳进度无效**。
- 习题：`.slide_layer.MultipleChoice`，选项为 `.problembullet[data-label=A/B/C/D]`（仅字母标签，题面/选项都在整页图里），
  提交按钮 `.quizImg.submitButton`；`Problem.Result.answer` 为空，**数据里没有答案，必须调用 OCS 题库**。

实测结论（真实页面）：

| 项 | 结果 |
| --- | --- |
| 自动翻页 | ✅ 缩略页 `#1→#11` 全部切换成功 |
| 图文页 | ✅ 仅停留 ~3.5s，学习进度 `1/11 → 2/11`，该页未读清除 |
| 视频页 | ✅ 自动播放时真实观看量 `watch_length 22s → 52s`（`rate 8%`，时长 654s）持续增长；达 90% 由服务端置 `noRead=false` 判定完成。**需真实播放时长**（不跳进度） |
| 习题页 | ✅ 已接 OCS 题库（整页图作题干 + A/B/C/D 标签），题库返回字母后点击选项并提交；无正确作答则不算完成 |

实现（`yuketang.ts`，基于页面 Vue 而非脆弱的 DOM 猜测）：

- `runStudentCardsCourseware()`：逐页 `thumbSwiperClick(i)`，跳过 `noRead===false` 的已完成页，按类型处理。
- `watchCoursewareVideo()`：打开视频框 → 播放 → 轮询 `getVideoWatchProgress().data[*].rate` 与 `noRead`，到 90% 或完成后进入下一页（尝试 2x 倍速缩短）。
- `solveCoursewareProblem()`：整页图交 OCS 题库（`buildAnswererEnv` + `defaultAnswerWrapperHandler`）→ 解析字母 → 点选 → 提交 → 等 `noRead` 清除。

**限制（客观）**：本课程 4 个视频时长约 25/25/11/… 分钟，完整跑完视频页需按其真实时长挂机（脚本可无人值守）；习题需在 OCS「通用-全局设置」配置题库。本轮未在数分钟内把 25 分钟视频看完，故以“录制播放 + 真实观看量增长 + 编排跑通”作证。

