<div align="center">

<div style="padding:8px;border-radius:100%;background:white;width:124px;height:124px">
<img src="https://cdn.ocsjs.com/resources/img/logo.png" width=124 height=124  >
</div>

# OCS 网课助手

> OCS (Online Course Script) 网课刷课脚本，帮助大学生解决网课难题

![GitHub Repo stars](https://img.shields.io/github/stars/ocsjs/ocsjs)
![npm](https://img.shields.io/npm/v/ocsjs?color=red)
![NPM](https://img.shields.io/npm/l/ocsjs)
![今日安装](https://img.shields.io/badge/dynamic/json?color=orange&label=今日安装&query=$.data.today_install&url=https://scriptcat.org/api/v2/scripts/367)
![总共安装](https://img.shields.io/badge/dynamic/json?color=red&label=总共安装&query=$.data.total_install&url=https://scriptcat.org/api/v2/scripts/367)

</div>
 
<div align="center">

## 官网及教程 [https://docs.ocsjs.com](https://docs.ocsjs.com)
</div>
## 添加功能：接入大模型api作为题库进行自动答题
代码为ai生成，相关文档位于`.trae/documents/llm-auto-answer-integration.md`
有部分关于项目构建的代码是为了在我本地构建无需合并

### 使用方法
在支持的脚本管理器安装`ocs.common.user.js`
在全局设置->大模型配置处配置大模型apikey, url, model
### 功能测试结果
有以下两个大模型分发平台经过测试可以使用

1. 智谱ai开放平台
* url: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
* model: glm系列多数可用（测试过glm-5.1, glm-5.6-air, glm-5.7-flash），免费模型限流严重较为难用
2. 阿里云百炼
* url: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
* model: qwen3.6-plus可用，部分模型如qvq-max-2025-03-25不支持http请求不可用
