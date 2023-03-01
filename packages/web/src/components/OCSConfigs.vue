<template>
	<div class="h-100">
		<a-select v-model="Store.render.setting.ocs.currentProjectName">
			<template #prefix> 配置 : </template>
			<template
				v-for="project of state.projects"
				:key="project.name"
			>
				<a-option :value="project.name"> {{ project.name }} </a-option>
			</template>
		</a-select>
		<div
			id="ocs-browser-configs"
			class="mt-3"
		></div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, onActivated, reactive, watch, ref, WatchStopHandle, onDeactivated } from 'vue';
import { remote } from '../utils/remote';
import { Project } from '@ocsjs/scripts';
import { store as Store } from '../store/index';

const props = defineProps<{
	store: object;
}>();

const store = ref(props.store);

const emits = defineEmits<{
	(e: 'update:store', val: object);
	(e: 'update:project', val: Project[]);
	(e: 'loading');
	(e: 'loaded');
	(e: 'error', val: string);
}>();

const state = reactive({
	/** ocs root 元素 */
	root: undefined as ShadowRoot | undefined,
	css: '',
	/** 是否加载 */
	loading: false,
	/** 是否报错 */
	err: '',
	/** 当前选中的 ocs project */
	projects: [] as Project[],
	watchStopHandle: undefined as WatchStopHandle | undefined
});

watch(
	() => [Store.render.setting.ocs.currentProjectName],
	() => {
		nextTick(renderOCS);
	}
);

state.watchStopHandle = watch(store, () => {
	emits('update:store', store.value);
});

function renderOCS() {
	// @ts-ignore
	const OCS = global.OCS as typeof import('@ocsjs/scripts');
	const project = state.projects.find((p) => p.name === Store.render.setting.ocs.currentProjectName);

	// 清空元素
	OCS.$elements.root.replaceChildren();

	OCS.$.loadCustomElements(OCS.definedCustomElements);

	OCS.$elements.root.append(OCS.el('style', state.css));

	/** 删除阴影 */
	OCS.$elements.root.append(OCS.el('style', `script-panel-element {box-shadow: none;resize: none;color:#2e2e2e}`));

	if (project) {
		for (const key in project.scripts) {
			if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
				const script = project.scripts[key];

				/** 为对象添加响应式特性，在设置值的时候同步到本地存储中 */
				script.cfg = Object.keys(script.cfg).length === 0 ? OCS.$.createConfigProxy(script) : script.cfg;

				if (script.namespace && script.configs && script.hideInPanel !== false) {
					const panel = OCS.$creator.scriptPanel(script, { expandAll: false, projectName: '' });

					/** 添加到页面中，并执行 onrender 函数 */
					OCS.$elements.root.append(panel);
					try {
						script.onrender?.({ panel, header: OCS.el('header-element') })?.catch((err) => {
							console.error(err);
						});
					} catch (err) {
						console.error(err);
					}
				}
			}
		}

		/** 挂载 ocs panel */
		OCS.$el(`#ocs-browser-configs`).replaceChildren(OCS.$elements.panel);
		state.root = state.root || OCS.$elements.root;
	}
}

async function loadOCS() {
	state.loading = true;
	emits('loading');
	try {
		// @ts-ignore
		if (global.OCS === undefined) {
			// 加载 OCS
			const code = await remote.methods.call('get', 'https://cdn.ocsjs.com/index.js');
			await remote.webContents.call('executeJavaScript', code);
		}

		if (state.css === '') {
			// 加载样式
			state.css = await remote.methods.call('get', 'https://cdn.ocsjs.com/style.css');
		}

		// @ts-ignore
		const OCS = global.OCS as typeof import('@ocsjs/scripts');

		/** 双向绑定数据 */
		OCS.ObjectStoreProvider._source.store = store.value;

		state.projects = OCS.definedProjects().sort(({ level: l1 = 0 }, { level: l2 = 0 }) => l2 - l1);
		emits('update:project', state.projects);
		if (!Store.render.setting.ocs.currentProjectName) {
			Store.render.setting.ocs.currentProjectName = state.projects[0].name;
		}
	} catch (err) {
		state.err = String(err);
		emits('error', state.err);
	}

	state.loading = false;
	emits('loaded');
}

onMounted(() => {
	nextTick(async () => {
		await loadOCS();
		renderOCS();
	});
});

onActivated(() => {
	nextTick(async () => {
		await loadOCS();
		renderOCS();
	});
});

onDeactivated(() => {
	// @ts-ignore
	const OCS = global.OCS as typeof import('@ocsjs/scripts');
	OCS.ObjectStoreProvider._source.store = {};
	state.watchStopHandle?.();
});
</script>

<style scoped lang="less">
#ocs-browser-configs {
	overflow: overlay;
	height: calc(100% - 64px);
}
</style>
