<template>
	<span class="key">
		<slot />
	</span>
</template>

<script
	setup
	lang="ts"
></script>

<style
	scoped
	lang="less"
>
.key {
	padding: 2px;
	margin: 0px 4px 0px 4px;
	border-radius: 3px;
	color: #5e6163;
	background: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
	box-shadow: inset 0 -2px 0 0 #cdcde6, inset 0 0 1px 1px #fff, 0 1px 2px 1px rgba(30, 35, 90, 0.4);
}
</style>
