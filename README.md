# OCS 学银在线适配修复

基于 ocsjs 5.4.0 的补丁，使脚本在学银在线（xueyinonline.com）正常工作。

## 交付内容

| 文件 | 说明 |
|---|---|
| `修复说明.html` | **建议先看这个** — 带代码高亮的完整说明 |
| `修复说明.txt` | 纯文本版，方便终端/邮件查看 |
| `xueyin-online.patch` | 标准 unified diff，可 `git apply` |
| `packages/scripts/src/utils/cx-platform.ts` | 新增文件（完整内容） |
| `packages/scripts/src/projects/cx.ts` | 修改后的完整文件 |
| `OCS 网课助手.user.js` | 已构建产物，可直接安装验证 |

## 应用方式

### 方式一：patch（推荐）
```bash
git apply xueyin-online.patch
```

### 方式二：直接替换文件
把 `packages/` 下的两个文件覆盖到仓库对应位置。

## 核心问题

1. **路径前缀** — 学银页面在 `/mooc-ans/` 下，脚本 `matches` 硬编码根路径导致匹配不上
2. **任务点匹配** — 学银的 `window.attachments` 只有 `objectid`，原逻辑用 `jobid` 反查，导致 0/4 任务点被跳过

## 验证

安装 `OCS 网课助手.user.js`，打开学银节点页，预期视频自动播放、播完自动跳下一节。
