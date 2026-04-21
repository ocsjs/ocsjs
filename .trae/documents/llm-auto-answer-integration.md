# 大模型API自动答题功能集成计划

## 一、项目现状分析

### 核心架构
- **项目类型**: 油猴用户脚本 (UserScript)，pnpm monorepo 结构
- **核心包**: `@ocsjs/core` (答题逻辑) + `@ocsjs/scripts` (平台脚本与UI)
- **UI框架**: `easy-us` 库，提供 `$modal`, `$message`, `$ui`, `h()`, `$store`, `Project`, `Script` 等
- **持久化**: `$store` (基于 `GM_setValue`/`GM_getValue`)

### 现有题库系统关键接口
- **`AnswererWrapper`** 接口: 定义题库配置 (`url`, `name`, `method`, `handler` 等)
- **`defaultAnswerWrapperHandler`**: 查题核心，多题库并发请求，占位符替换，`Function()` 动态 handler 解析
- **`AnswerWrapperParser`**: 题库配置解析器 (URL/JSON/Base64)
- **`SearchInformation`**: 查题结果接口 (`results`, `name`, `url`, `error` 等)
- **`OCSWorker`**: 答题器，搜题/答题双线程

### 关键集成点
1. `CommonProject.scripts.settings.configs.answererWrappers` — 题库配置存储
2. `CommonProject.scripts.settings.methods.getWorkOptions()` — 获取答题配置（含题库过滤）
3. `workPreCheckMessage()` — 检查 `answererWrappers.length === 0` 时提示"还没设置题库"
4. `defaultAnswerWrapperHandler()` — 查题核心调用
5. 题库连接测试 — `request(new URL(item.url).origin + '/?t=' + t, { type: 'GM_xmlhttpRequest', method: 'head' })`

---

## 二、实施方案

### 核心设计思路

**将大模型作为一种新的题库类型（`AnswererWrapper`）集成到现有题库系统**，而非独立模块。这样：
- 复用现有题库切换、禁用、缓存等全部逻辑
- 不需要修改 `workPreCheckMessage` 的检查逻辑（大模型配置也计入 `answererWrappers`）
- 两种答题模式天然并行兼容

### 新增接口定义

在 `AnswererWrapper` 接口基础上，通过 `type` 字段扩展标识大模型题库：

```typescript
// 扩展 AnswererWrapper.type
type: 'fetch' | 'GM_xmlhttpRequest' | 'llm';

// 大模型题库额外字段（存储在 AnswererWrapper 的扩展属性中）
interface LLMAnswererWrapper extends AnswererWrapper {
    type: 'llm';
    // 以下字段存储在 data 或 headers 中
    // apikey -> headers['Authorization']
    // model -> data['model']
    // messages模板 -> data['messages_template']
}
```

### 大模型题库的 AnswererWrapper 构造

当用户配置大模型时，自动构建一个特殊的 `AnswererWrapper` 对象：

```typescript
{
    name: '大模型答题',
    url: 'https://api.openai.com/v1/chat/completions',  // 用户配置的API地址
    homepage: '#',
    method: 'post',
    type: 'GM_xmlhttpRequest',
    contentType: 'json',
    headers: {
        'Authorization': 'Bearer sk-xxx',  // 用户配置的apikey
        'Content-Type': 'application/json'
    },
    data: {
        model: 'gpt-3.5-turbo',  // 用户配置的模型名称
        messages: {
            handler: "return (env) => { ... }"  // 动态构建messages
        }
    },
    handler: "return (res) => { ... }"  // 解析大模型响应
}
```

---

## 三、详细实施步骤

### 步骤1: 扩展 `AnswererWrapper` 接口和解析器

**文件**: `packages/core/src/core/answer-wrapper/interface.ts`

- 在 `AnswererWrapper.type` 联合类型中增加 `'llm'`
- 新增 `LLMConfig` 接口定义大模型配置字段

**文件**: `packages/core/src/core/answer-wrapper/answer.wrapper.parser.ts`

- 在 `fromObject` 验证方法中增加 `llm` 类型的验证逻辑
- 新增 `fromLLMConfig` 静态方法，将大模型配置转换为 `AnswererWrapper`

### 步骤2: 开发大模型API调用模块

**新文件**: `packages/core/src/core/answer-wrapper/llm.handler.ts`

- 导出 `llmAnswerWrapperHandler` 函数，签名与 `defaultAnswerWrapperHandler` 兼容
- 实现大模型API请求构建（OpenAI兼容格式）
- 实现响应解析（从 `choices[0].message.content` 提取答案）
- 实现默认prompt模板设计
- 实现错误处理和超时控制
- 导出 `createLLMAnswererWrapper` 工厂函数，根据用户配置生成 `AnswererWrapper`

**默认prompt模板设计**:
```
你是一个网课答题助手。请根据题目和选项给出正确答案。

题目：${title}
选项：${options}
题型：${type}

要求：
1. 如果是单选题，只输出正确选项的字母（如A、B、C、D）
2. 如果是多选题，输出所有正确选项的字母，用#分隔（如A#B#C）
3. 如果是判断题，输出"正确"或"错误"
4. 如果是填空题，直接输出答案内容
5. 只输出答案，不要输出任何解释
```

**handler设计**（解析大模型响应）:
```javascript
return (res) => {
    const content = res.choices?.[0]?.message?.content;
    if (content) {
        return [undefined, content.trim()];
    }
    return undefined;
}
```

**data.messages handler设计**（动态构建messages）:
```javascript
return (env) => {
    const typeMap = { single: '单选题', multiple: '多选题', judgement: '判断题', completion: '填空题' };
    const questionType = typeMap[env.type] || '未知题型';
    return [
        { role: 'system', content: '你是一个网课答题助手...' },
        { role: 'user', content: `题目：${env.title}\n选项：${env.options || '无'}\n题型：${questionType}` }
    ];
}
```

### 步骤3: 修改 `defaultAnswerWrapperHandler` 支持大模型类型

**文件**: `packages/core/src/core/answer-wrapper/answer.wrapper.handler.ts`

- 在 `temp.map` 循环中，检测 `wrapper.type === 'llm'`
- 如果是大模型题库，调用 `llmAnswerWrapperHandler` 处理
- 否则使用原有逻辑

### 步骤4: 修改题库配置解析器

**文件**: `packages/core/src/core/answer-wrapper/answer.wrapper.parser.ts`

- 在 `fromObject` 中增加对 `type: 'llm'` 的验证
- `llm` 类型时，`handler` 非必填（使用默认handler）
- 增加 `apikey`、`model` 等字段的验证

### 步骤5: 更新 `packages/core/src/core/answer-wrapper/index.ts` 导出

- 导出新增的 `llmAnswerWrapperHandler`、`createLLMAnswererWrapper`、`LLMConfig`

### 步骤6: 开发大模型API配置弹窗UI

**文件**: `packages/scripts/src/projects/common.ts`

在 `settings` 脚本的 `configs` 中新增：

```typescript
llmConfig: {
    defaultValue: {} as LLMConfig
},
llmConfigButton: {
    label: '大模型配置',
    defaultValue: '点击配置',
    attrs: { type: 'button' },
    onload() {
        const config = CommonProject.scripts.settings.cfg.llmConfig;
        this.value = config?.apikey ? '当前已配置大模型，点击重新配置' : '点击配置';
        this.onclick = () => {
            showLLMConfigModal(this);
        };
    }
}
```

**大模型配置弹窗 `showLLMConfigModal`**:
- 模仿现有题库配置弹窗 (`$modal.prompt`) 的风格和关闭逻辑
- 包含字段：
  - API密钥 (apikey) — 必填，`type="password"`
  - 接口地址 (url) — 必填，默认 `https://api.openai.com/v1/chat/completions`
  - 模型名称 (model) — 必填，默认 `gpt-3.5-turbo`
  - 消息模板 (messages) — 选填，`textarea`，提供默认prompt
- 保存按钮：验证必填项 → 构建 `LLMConfig` → 持久化到 `llmConfig` → 自动生成 `AnswererWrapper` 并添加到 `answererWrappers` → 关闭弹窗
- 取消按钮：直接关闭弹窗 (`modal?.remove()`)

### 步骤7: 修改题库配置弹窗，增加大模型选项

**文件**: `packages/scripts/src/projects/common.ts`

在现有题库配置弹窗的解析器选择 (`select`) 中增加 `大模型` 选项：

```typescript
h('option', { title: '使用大模型API进行答题' }, '大模型')
```

当选择"大模型"时，弹出大模型配置弹窗，保存后自动将大模型题库添加到 `answererWrappers`。

### 步骤8: 修改题库连接测试逻辑

**文件**: `packages/scripts/src/projects/common.ts` 的 `updateState` 函数

当前测试方式：`request(new URL(item.url).origin + '/?t=' + t, { type: 'GM_xmlhttpRequest', method: 'head' })`

修改为根据题库类型区分测试：
- **普通题库**: 保持原有 HEAD 请求测试
- **大模型题库** (`type === 'llm'`): 发送一个简单的 models 列表请求或 chat completions 请求测试连通性

```typescript
if (item.type === 'llm') {
    // 大模型测试：发送一个简短的测试请求
    res = await request(item.url, {
        type: 'GM_xmlhttpRequest',
        method: 'post',
        responseType: 'json',
        headers: {
            'Authorization': item.headers?.['Authorization'] || '',
            'Content-Type': 'application/json'
        },
        data: {
            model: item.data?.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 1
        }
    });
} else {
    // 原有测试逻辑
}
```

### 步骤9: 修改 `createAnswererWrapperList` 展示大模型题库信息

**文件**: `packages/scripts/src/projects/common.ts`

在题库列表展示中，对大模型题库显示特殊信息：
- 名称显示为 "🤖 大模型答题"
- 详情中显示模型名称而非请求体
- 隐藏敏感的apikey信息

### 步骤10: 更新 `getWorkOptions` 方法

**文件**: `packages/scripts/src/projects/common.ts`

确保 `getWorkOptions` 正确过滤大模型题库（与普通题库使用相同的禁用逻辑）。

### 步骤11: 更新 `packages/core/src/index.ts` 导出

确保新增的模块正确导出。

### 步骤12: 构建与测试

- 运行 `pnpm build` 确保构建成功
- 运行 `pnpm lint` 确保代码规范
- 手动验证功能流程

---

## 四、文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/core/src/core/answer-wrapper/interface.ts` | 修改 | 扩展 `AnswererWrapper.type`，新增 `LLMConfig` 接口 |
| `packages/core/src/core/answer-wrapper/llm.handler.ts` | 新建 | 大模型API调用模块 |
| `packages/core/src/core/answer-wrapper/answer.wrapper.handler.ts` | 修改 | 支持大模型类型路由 |
| `packages/core/src/core/answer-wrapper/answer.wrapper.parser.ts` | 修改 | 支持大模型配置验证 |
| `packages/core/src/core/answer-wrapper/index.ts` | 修改 | 导出新模块 |
| `packages/core/src/index.ts` | 确认 | 确保导出正确 |
| `packages/scripts/src/projects/common.ts` | 修改 | 新增大模型配置UI、修改题库测试逻辑、修改题库列表展示 |

---

## 五、关键设计决策

1. **大模型题库作为 `AnswererWrapper` 的一种类型**：而非独立系统，确保与现有题库切换、禁用、缓存逻辑完全复用
2. **使用 `type: 'llm'` 标识**：在 `AnswererWrapper.type` 中新增值，便于在 handler 和测试中区分
3. **大模型配置独立存储**：`llmConfig` 单独存储原始配置（apikey等），同时自动生成对应的 `AnswererWrapper` 存入 `answererWrappers`
4. **prompt模板参数化**：存储在 `data.messages_template` 中，支持用户自定义
5. **复用 `GM_xmlhttpRequest`**：大模型请求也使用油猴跨域API，避免CORS问题
6. **默认handler**：大模型题库提供默认的 handler 和 data.messages handler，用户无需手动编写

---

## 六、风险与注意事项

1. **apikey安全性**：apikey存储在 `GM_setValue` 中，仅本地存储，不上传服务器
2. **响应时间**：大模型API响应可能较慢（5-30秒），需合理设置超时时间
3. **答案格式**：大模型输出格式不稳定，需在prompt中严格约束，并在handler中做容错处理
4. **费用控制**：大模型API按token计费，需在UI中提醒用户
5. **兼容性**：支持OpenAI兼容格式的API（包括国内中转站、本地部署的Ollama等）
