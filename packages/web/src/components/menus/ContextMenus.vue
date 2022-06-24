<template>
	<div class="h-100">
		<div
			ref="container"
			class="h-100"
		>
			<slot />
		</div>
		<div
			ref="contextmenu"
			class="contextmenu"
		>
			<slot
				name="overlay"
				class="rounded"
			/>
		</div>
	</div>
</template>

<script
	setup
	lang="ts"
>
import { ref, onMounted, Ref } from 'vue';

const contextmenu: Ref<HTMLElement> = ref() as any;
const container: Ref<HTMLElement> = ref() as any;

onMounted(() => {
	document.addEventListener('mousedown', () => {
		contextmenu.value.style.visibility = 'hidden';
	});

	// 右键菜单单击
	container.value.oncontextmenu = function (event) {
		console.log(event);
		// 判断是否在文件或者文件夹之上点击
		const overFileNode = event.composedPath().some((t) => (t as HTMLElement).classList?.contains('ant-tree-title'));

		if (!overFileNode) {
			const x = event.clientX;
			const y = event.clientY;

			console.log({ x, y, el: [contextmenu.value] });

			contextmenu.value.style.visibility = 'visible';
			contextmenu.value.style.left = x + 10 + 'px';
			contextmenu.value.style.top = y + 10 + 'px';

			return false;
		}
	};
});
</script>

<style
	scoped
	lang="less"
>
.contextmenu {
	visibility: hidden;
	position: fixed;
	width: 180px;
	z-index: 999;

	box-shadow: 0px 0px 8px rgb(232, 232, 232);

	ul {
		padding: 0 !important;
	}
}

body #app .contextmenu .ant-menu-item {
	color: #2c3e50;
	margin: 0;
	background-color: white;
	height: 32px;
	line-height: 32px;
	padding: 0 12px;

	.ant-menu-item-icon + span {
		margin-left: 2px;
	}

	.ant-menu-title-content {
		font-size: 12px;
	}

	&:hover {
		background-color: #e6f7ff;
		color: #1890ff;
	}
}
</style>
