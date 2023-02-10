<template>
	<div v-show="state.loading === false">
		<a-space class="mb-3">
			<a-tooltip>
				<template #content>
					<div>
						OCS 网课脚本配置，将会与浏览器中的脚本配置进行同步，如果您不使用OCS脚本，或者不想进行同步，可手动关闭同步。
					</div>

					<div>使用OCS全局配置，只需配置全局数据，则可同步到所有浏览器。</div>
					<div>也可以为每个浏览器设置独立的数据，例如：自动登录的手机和密码。</div>
					<a-divider class="mt-1 mb-1" />
					<div>
						(开启独立配置后，未经过修改过的数据依然会使用全局配置，例如修改了手机号，但是其他未修改，如全局配置的倍速中，视频倍速为
						16，那么这里的配置也是使用全局配置的 16 倍速。)
					</div>
				</template>

				<a-select
					v-model="state.type"
					size="mini"
				>
					<a-option value="global"> 使用全局配置 </a-option>
					<a-option value="override"> 使用独立配置 </a-option>
				</a-select>
			</a-tooltip>
			<template v-if="state.type === 'override'">
				<a-tooltip content="查看已修改的配置">
					<a-button
						v-if="Object.keys(props.store).length !== 0"
						size="mini"
						@click="state.showModifiedConfigs = true"
					>
						<Icon type="visibility" />
						<span> 查看修改的配置 </span>
					</a-button>
					<a-modal
						v-model:visible="state.showModifiedConfigs"
						:footer="false"
						:simple="true"
						:width="600"
						modal-class="p-0 m-0"
					>
						<div class="m-3">
							<div
								class="ms-2 me-2"
								style="max-height: 70vh; overflow: overlay"
							>
								<template
									v-for="(item, index) of translateConfigKeyToLabel()"
									:key="index"
								>
									<a-descriptions
										size="small"
										:column="1"
									>
										<a-descriptions-item :label="item[0]">
											{{ item[1] }}
										</a-descriptions-item>
									</a-descriptions>
								</template>
							</div>
						</div>
					</a-modal>
				</a-tooltip>

				<a-tooltip content="恢复默认的配置数据">
					<a-button
						v-if="Object.keys(props.store).length !== 0"
						size="mini"
						@click="resetBrowserStore"
					>
						<Icon type="sync" /> 重置配置
					</a-button>
				</a-tooltip>
			</template>
		</a-space>

		<template v-if="state.type === 'override'">
			<OCSConfigs
				:store="props.store"
				@update:project="(val) => (state.projects = val)"
				@update:store="(val) => emits('update:store', val)"
				@error="(err) => (state.err = err)"
				@loaded="() => (state.loading = false)"
				@loading="() => (state.loading = true)"
			></OCSConfigs>
		</template>
	</div>
	<div
		v-show="state.loading === false && state.err !== ''"
		style="color: red"
	>
		解析错误！
	</div>
	<div v-show="state.loading === true && state.err === ''"><icon-loading /> 正在获取最新OCS配置</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import OCSConfigs from './OCSConfigs.vue';
import Icon from './Icon.vue';
import { ConfigElement, Project } from '@ocsjs/scripts';

const props = defineProps<{
	store: object;
}>();

const emits = defineEmits<{
	(e: 'update:store', val: object);
}>();

const state = reactive({
	/** 是否加载 */
	loading: false,
	/** 是否加载错误 */
	err: '',
	/**  global : 全局配置 ,  : 独立配置 */
	type: Object.keys(props.store).length > 0 ? 'override' : ('global' as 'global' | 'override'),
	showModifiedConfigs: false,
	projects: [] as Project[]
});

function resetBrowserStore() {
	emits('update:store', {});
	Message.success(`已重置`);
}

/**
 * 将 ocs 配置字段转换成可视化解释字段，例如 zhs.login.phone: 111 => 智慧树-手机登录 : 111
 */
function translateConfigKeyToLabel(): [string, string][] {
	const list: [string, string][] = [];
	// @ts-ignore
	const OCS = global.OCS as typeof import('@ocsjs/scripts');

	for (const key in props.store) {
		if (Object.prototype.hasOwnProperty.call(props.store, key)) {
			const value = props.store[key];

			const scripts = state.projects
				.map((p) => {
					return Object.keys(p.scripts).map((k) => {
						const script = p.scripts[k];
						script.projectName = p.name;
						return script;
					});
				})
				.flat();

			// 如果是动态生成的，尝试根据 . 分隔去找
			const split = key.split('.');

			const script =
				scripts.find((s) => {
					for (const ck in s.configs) {
						if (Object.prototype.hasOwnProperty.call(s.configs, ck)) {
							if (OCS.$.namespaceKey(s.namespace, ck) === key) {
								return true;
							}
						}
					}

					return false;
				}) || scripts.find((s) => s.namespace === split[0] + '.' + split[1]);

			if (script && script.configs) {
				let success = false;
				for (const ck in script.configs || {}) {
					if (Object.prototype.hasOwnProperty.call(script.configs, ck)) {
						if (OCS.$.namespaceKey(script.namespace, ck) === key) {
							list.push([`${script.projectName || ''}-${script.name}-${script.configs[ck].label || ''}`, value]);
							success = true;
							break;
						}
					}
				}

				if (!success) {
					const el = OCS.$$el('config-element', OCS.$elements.root as any as HTMLElement).find(
						(el) => el.key === key
					) as ConfigElement;

					if (el) {
						list.push([
							`${script.projectName || ''}-${script.name}-${el.label.textContent || split.at(-1) || ''}`,
							value
						]);
					}
				}
			}
		}
	}

	return list;
}
</script>

<style lang="less"></style>
