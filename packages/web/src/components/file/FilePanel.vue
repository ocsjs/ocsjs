<template>
	<template v-if="data.options !== undefined">
		<div class="file">
			<div class="form-header text-start border-bottom">
				<div class="file-title">
					<span>{{ data.file.name }}</span>
					<div class="w-100 text-end">
						<a-space :size="12">
							<a
								class="link"
								@click="closeEditor"
								>关闭编辑</a
							>
							<a
								class="link"
								@click="openLocalEditor"
								>打开文件</a
							>
						</a-space>
					</div>
				</div>
				<a-space
					class="actions"
					:size="24"
				>
					<Icon
						title="设置"
						type="icon-edit-square"
						:active="activeKey === 'setting'"
						@click="activeKey = 'setting'"
					/>
					<Icon
						title="源文件"
						type="icon-file-text"
						:active="activeKey === 'content'"
						@click="openSource"
					/>

					<Icon
						title="控制台"
						type="icon-codelibrary"
						:active="activeKey === 'terminal'"
						@click="openTerminal"
					/>

					<Icon
						title="实时图像"
						type="icon-image"
						:active="activeKey === 'screenshot'"
						@click="activeKey = 'screenshot'"
					/>

					<Icon
						:title="data.stat.running ? '关闭' : '运行'"
						:type="data.stat.running ? 'icon-close-circle' : 'icon-play-circle'"
						:active="data.stat.running"
						@click="submitData"
					/>

					<template v-if="data.process?.launched">
						<Icon
							type="icon-totop"
							title="显示当前的浏览器"
							@click="data.process.bringToFront()"
						/>
					</template>
				</a-space>
			</div>

			<div class="form-container">
				<CodeHighlight
					v-show="activeKey === 'content'"
					class="h-100"
					lang="json"
					:code="data.file.read()"
				/>
				<ScreenShot
					v-show="activeKey === 'screenshot'"
					class="h-100"
					:show-all="true"
					:screenshots="data.process.screenshots"
				/>

				<div
					v-show="activeKey === 'terminal'"
					class="iterminal overflow-hidden h-100"
				>
					<a-space class="iterminal-items">
						<span>控制台</span>
						<span @click="data.xterm.clear()">清空</span>
					</a-space>

					<Terminal
						class="h-100"
						:xterm="data.xterm"
						:file="data"
						:process="data.process"
					/>
				</div>

				<Card
					v-show="activeKey === 'setting'"
					title="启动设置"
					class="p-3"
				>
					<div class="form">
						<label>加载本地脚本</label>
						<span class="w-100 text-start">
							<a-switch
								v-model:checked="data.options.init"
								checked-children="开启"
								un-checked-children="关闭"
							/>
						</span>
					</div>

					<div class="form">
						<label>启动类型</label>
						<a-select
							v-model:value="data.options.scripts[0].name"
							style="width: 100%"
							show-search
							@change="onScriptChange"
						>
							<template
								v-for="(name, index) in scriptNames"
								:key="index"
							>
								<a-select-option :value="name[0]">
									{{ name[1] }}
								</a-select-option>
							</template>
						</a-select>
					</div>

					<form ref="dataForm">
						<template
							v-for="(item, index) in loginTypeForms"
							:key="index"
						>
							<div class="form">
								<label> {{ item.title }} </label>
								<template v-if="['tel', 'text'].includes(item.type)">
									<a-input
										v-model:value="(data.options.scripts[0].options as any)[item.name]"
										:type="item.type"
										:placeholder="'输入' + item.title"
										:required="item.required"
										:name="item.name"
									/>
								</template>
								<template v-if="item.type === 'password'">
									<a-input-password
										v-model:value="(data.options.scripts[0].options as any)[item.name]"
										:placeholder="'输入' + item.title"
										:required="item.required"
										:name="item.name"
									/>
								</template>
							</div>
						</template>
					</form>
				</Card>
			</div>
		</div>
	</template>
	<template v-if="data.error">
		<div class="error-page">
			<div class="error-message w-100">
				<a-space>
					<span>解析文件时第 {{ data.error?.line }} 行发生错误:</span>

					<a
						class="link"
						@click="closeEditor"
						>关闭编辑</a
					>
					<a
						class="link"
						@click="openLocalEditor"
						>打开文件</a
					>
				</a-space>
				<pre style="color: red">{{ data.error?.message }}</pre>

				<CodeHighlight
					class="json-editor border rounded overflow-auto"
					lang="json"
					:code="data.file.read()"
					:error-line="data.error?.line"
				/>
			</div>
		</div>
	</template>
</template>

<script
	setup
	lang="ts"
>
import { computed, nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { Form, scriptForms } from '.';
import { NodeJS } from '../../utils/export';
import { debounce } from '../../utils/index';
import Card from '../Card.vue';
import CodeHighlight from '../CodeHighlight.vue';
import Icon from '../Icon.vue';
import Terminal from '../terminal/Terminal.vue';
import { startup, validFileContent } from './File';
import ScreenShot from './ScreenShot.vue';
import { File } from '../../core/File';
import { FileData, createFileData } from './data';

const { scriptNames } = require('@ocsjs/scripts') as typeof import('@ocsjs/scripts');
const childProcess = require('child_process') as typeof import('child_process');

interface FormCreateProps {
	file: File;
}
const props = withDefaults(defineProps<FormCreateProps>(), {});
const { file } = toRefs(props);

const emits = defineEmits<{
	(e: 'close', file: File): void;
}>();

const data = ref<FileData>({} as any);
const activeKey = ref<'setting' | 'terminal' | 'content' | 'screenshot'>('setting');
const dataForm = ref();

onMounted(() => {
	nextTick(() => {
		data.value = createFileData(file.value);

		/** 如果已经在运行，则切换到控制台 */
		if (data.value.stat.running) activeKey.value = 'terminal';

		/** 解析文件内容 */
		const result = validFileContent(data.value.file.read());
		if (typeof result === 'string') {
			data.value.options = JSON.parse(result);
		} else {
			data.value.error = result.error;
		}

		/** 监听文件更新 */
		if (data.value.options && data.value.error === undefined) {
			watch(
				data.value.options,
				debounce(() => {
					const value = JSON.stringify(data.value.options, null, 4);
					data.value.file.write(value);
					NodeJS.fs.writeFileSync(file.value.path, value);
				}, 500)
			);
		}
	});
});

/**
 * 解析第一个 script 内容，根据 script 的名字进行解析，并生成表单
 */
const loginTypeForms = computed(() => {
	if (data.value.options) {
		const target = scriptForms[data.value.options.scripts[0].name] as Form<any>;
		const keys = Reflect.ownKeys(target || {});
		return keys.map((key) => ({
			name: key,
			title: target[key].title,
			type: target[key].type,
			required: target[key].required
		}));
	}

	return undefined;
});

/** 登录脚本名更新时，重置options内容 */
function onScriptChange() {
	if (data.value.options) {
		data.value.options.scripts[0].options = {} as any;
	}
}

/** 验证表单 */
function submitData() {
	if (data.value.stat.running) {
		data.value.stat.running = false;
		data.value.process.close();
	} else {
		if (dataForm.value.checkValidity()) {
			activeKey.value = 'terminal';
			startup([data.value]);
		} else {
			dataForm.value.reportValidity();
		}
	}
}

function closeEditor() {
	emits('close', file.value);
}

function openLocalEditor() {
	childProcess.exec(`notepad "${file.value.path}"`);
}

function openSource() {
	activeKey.value = 'content';
}
function openTerminal() {
	activeKey.value = 'terminal';
}

onUnmounted(() => {
	emits('close', file.value);
});
</script>

<style
	scoped
	lang="less"
>
.error-page {
	width: 100%;
	padding-top: 50px;
	text-align: left;

	.error-message {
		padding: 4px;
		width: fit-content;
		margin: 0 auto;

		.json-editor {
			width: 100%;
		}
	}
}

.file {
	height: 100%;
	display: grid;
	grid-template-rows: min-content auto;
}

.form-header {
	padding: 4px 12px;
	height: 80px;
	overflow: auto;

	.info {
		font-size: 11px;
		color: #6c757d;
	}

	.file-title {
		font-size: 20px;
		font-weight: bold;
		display: flex;
		white-space: nowrap;
		width: 100%;

		.link {
			font-size: 11px;
		}
	}

	.actions {
		width: 100%;
		padding-top: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;

		& * {
			font-size: 24px;
			cursor: pointer;
		}
	}
}

.form-container {
	height: calc(100vh - 104px);
	overflow: auto;
}

.iterminal {
	background: #32302f;
	color: #ededed;
	text-align: left;
	padding: 2px 0px 12px 12px;
	font-size: 10px;
}

.form {
	display: flex;
	white-space: nowrap;
	align-items: center;
	margin-bottom: 12px;

	.ant-input,
	.ant-input-password,
	.ant-input-affix-wrapper {
		border: none;
		border-bottom: 1px solid #dadada;
	}
	:deep(.ant-select .ant-select-selector) {
		text-align: left;
		border: none !important;
		border-bottom: 1px solid #dadada !important;
	}

	label {
		width: 40%;
		text-align: left;

		&::after {
			content: '：';
		}
	}
}

.iterminal-items {
	* {
		cursor: pointer;
	}
}
</style>
