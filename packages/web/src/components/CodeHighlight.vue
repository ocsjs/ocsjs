<template>
	<pre class="highlight"><code><div
			v-for="(line,index) of  render(code, lang)"
			:key="index"
			class="line"
			:class="{
				error: errorLine === index,
			}">
			<span class="line-count"> {{index}} </span>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<span v-html="line"></span>
	</div></code></pre>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

import highlight from 'highlight.js/lib/core';
import jsonLanguage from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/atom-one-light.css';
highlight.registerLanguage('json', jsonLanguage);

interface CodeHighlightProps {
	code: string;
	lang: string;
	errorLine?: number;
}
const props = withDefaults(defineProps<CodeHighlightProps>(), {
	errorLine: -1
});

const { code, errorLine, lang } = toRefs(props);

/**
 * 渲染代码高亮
 * @param content 内容
 * @param language 语言
 */
function render(content: string, language: string) {
	const html = highlight.highlight(content, { language }).value;
	return html.trim().split('\n');
}
</script>

<style scoped lang="less">
pre,
code {
	padding: 0 !important;
	margin: 0 !important;
}

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

.line {
	display: flex;
}

.line-count {
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
