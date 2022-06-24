<template>
	<a-sub-menu
		:title="menu.title"
		:selectable="false"
	>
		<Icon :type="menu.icon" />

		<template
			v-for="(item, index) in menu.children"
			:key="index"
		>
			<a-menu-divider v-if="item.divide" />
			<template v-if="item.children && item.children.length !== 0">
				<SubMenus :menu="item" />
			</template>
			<template v-else>
				<a-menu-item
					v-if="!item.hide"
					:key="item.title"
					:selectable="false"
					:disabled="item.disable"
					@click="item.onClick"
				>
					<Icon
						v-if="item.icon"
						:type="item.icon"
					/>
					<span> {{ item.title }} </span>
				</a-menu-item>
			</template>
		</template>
	</a-sub-menu>
</template>

<script
	setup
	lang="ts"
>
import { toRefs } from 'vue';
import { MenuItem } from '.';

export interface MenusProps {
	menu: MenuItem;
}

const props = defineProps<MenusProps>();
const { menu } = toRefs(props);
</script>

<style
	scoped
	lang="less"
></style>
