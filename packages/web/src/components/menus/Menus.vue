<template>
	<a-menu>
		<template
			v-for="item in data"
			:key="item.key"
		>
			<a-menu-divider v-if="item.divide" />
			<template v-if="!item.children">
				<a-menu-item
					v-if="!item.hide"
					:key="item.title"
					:selectable="false"
					:disabled="item.disable"
					@click="click(item)"
				>
					<template #icon>
						<Icon :type="item.icon" />
					</template>
					<slot
						name="title"
						:item="item"
					>
						{{ item.title }}
					</slot>
				</a-menu-item>
			</template>
			<template v-else>
				<SubMenus
					:key="item.title"
					:menu="item"
				/>
			</template>
		</template>
	</a-menu>
</template>

<script
	setup
	lang="ts"
>
import { toRefs } from 'vue';
import { MenuItem } from '.';
import SubMenus from './SubMenus.vue';

export interface MenusProps {
	data: MenuItem[];
	target: any;
}

const props = withDefaults(defineProps<MenusProps>(), {
	data: [] as any
});
const { data, target } = toRefs(props);
const emits = defineEmits<{
	(e: 'error', error: Error): void;
}>();

function click(item: MenuItem) {
	try {
		item.onClick?.(target.value);
	} catch (e) {
		emits('error', e as Error);
	}
}
</script>

<style
	scoped
	lang="less"
></style>
