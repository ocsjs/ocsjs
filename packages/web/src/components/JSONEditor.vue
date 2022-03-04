<template>
    <div class="json-editor">
        <pre
            class="code bg-white p-2 overflow-auto"
            ref="code"
        ><code v-html="jsonHtml" ></code></pre>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue";

import hljs from "highlight.js";
import jsonLanguage from "highlight.js/lib/languages/json";
import "highlight.js/styles/atom-one-light.css";
hljs.registerLanguage("json", jsonLanguage);

const code = ref();

interface JSONEditorProps {
    json: string;
}
const props = withDefaults(defineProps<JSONEditorProps>(), {});
const { json } = toRefs(props);

const jsonHtml = computed(() => {
    let html = hljs.highlight(json.value, { language: "json" }).value;

    let l = 0;
    let result = html.replace(/\n/g, function () {
        l++;
        return "\n" + '<a class="line" name="' + l + '">' + l + "</a>";
    });

    return '<a class="line" name="0">0</a>' + result;
});
</script>

<style scope lang="less">
.json-editor {
    text-align: left;
    height: 100%;
    .code {
        max-height: 100%;
    }
    .line {
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
}
</style>
