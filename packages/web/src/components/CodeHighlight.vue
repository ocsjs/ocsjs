<template>
    <pre
        class="highlight"
        ref="code"
    ><code v-html="render(code, lang,[[errorLine - 1,'error']])" ></code></pre>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue";

import hljs from "highlight.js";
import jsonLanguage from "highlight.js/lib/languages/json";
import "highlight.js/styles/atom-one-light.css";
hljs.registerLanguage("json", jsonLanguage);

interface CodeHighlightProps {
    code: string;
    lang: string;
    errorLine?: number;
}
const props = withDefaults(defineProps<CodeHighlightProps>(), {
    errorLine: -1,
});
const { code, errorLine } = toRefs(props);

/**
 * 渲染代码高亮
 * @param content 内容
 * @param language 语言
 * @param styleList Array<[number,class]> 元素类列表， number - 行号
 */
function render(content: string, language: string, styleList: any[]) {
    let html = hljs.highlight(content, { language }).value;
    console.log(styleList);

    return Array.from(html.match(/(.*?)\n/g) || [])
        .map(
            (s, i) =>
                `<div class="${
                    styleList.find((s) => s[0] === i)?.[1] || ""
                }"><line>${i}</line>${s}</div>`
        )
        .join("");
}
</script>

<style scope lang="less">
.highlight {
    text-align: left;
    height: 100%;

    .error {
        background-color: #ff000030;
    }
    .info {
        background-color: #70b2df30;
    }
}

line {
    color: #97979790;
    left: 10px;
    width: 30px;
    margin-right: 4px;
    display: inline-block;
    border-right: 1px solid #97979790;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
