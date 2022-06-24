<template>
	<div class="text-start text-secondary w-100">
		<div class="m-auto help-content markdown">
			<p>鼠标<Key>右键</Key>文件显示文件菜单，可新建<code>文件夹</code>和<code>文件</code></p>
			<p>鼠标<Key>左键</Key>文件进行<code>编辑</code>或者<code>运行</code></p>
			<p>鼠标<Key>左键</Key>拖拽文件进行移动</p>
		</div>
	</div>
</template>

<script
	setup
	lang="ts"
>
import Key from './Key.vue';
</script>

<style
	scoped
	lang="less"
>
.help-content {
	width: fit-content;
}
</style>
