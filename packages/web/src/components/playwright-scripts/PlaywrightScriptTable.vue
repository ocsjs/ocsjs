<template>
	<div
		ref="tableRef"
		:style="{ height: store.render.state.height - 160 + 'px', overflow: 'overlay' }"
	>
		<div class="ps-3 pe-3">
			<a-table
				v-model:pagination="state.pagination"
				size="small"
				:columns="columns"
				:data="data"
				:scroll="{
					y: store.render.state.height - 280
				}"
				@page-change="(page) => (state.pagination.current = page)"
				@page-size-change="(size) => (state.pagination.pageSize = size)"
			>
				<template #index="{ record }">
					<span class="text-nowrap"> {{ record.index }} </span>
				</template>

				<template #browserName="{ record, column }">
					<a-tooltip>
						<template #content>
							如果不填写，默认使用自动规则进行填充：<br />
							{{ state.browserNameFields.join('+') }}
						</template>
						<a-input
							v-model="record[column.dataIndex]"
							size="mini"
							placeholder="自动填充"
						></a-input>
					</a-tooltip>
				</template>

				<template #data="{ record, rowIndex, column }">
					<a-input
						v-model="record[column.dataIndex]"
						size="mini"
						@input="() => onRecordInput(rowIndex)"
					/>
				</template>
			</a-table>
		</div>

		<div class="mt-3">
			<div class="float-end">
				<a-space>
					<span> 浏览器名生成规则： </span>
					<a-select
						v-model="state.browserNameFields"
						size="mini"
						multiple
						style="width: 300px; overflow-x: auto; white-space: nowrap"
					>
						<template
							v-for="config of arrayLikeConfigs"
							:key="config.key"
						>
							<a-option
								:label="config.label"
								:value="config.key"
							></a-option>
						</template>
					</a-select>

					<a-tooltip content="导出固定格式的批量创建模板表格，编辑好模板表格后可以导入。">
						<a-button
							size="mini"
							@click="exportTemplateExcel"
						>
							<a-space> <icon-file /> 导出表格模板 </a-space>
						</a-button>
					</a-tooltip>

					<a-tooltip content="导入与上面格式相同的表格数据">
						<a-button
							size="mini"
							@click="importTemplateExcelConfirm"
						>
							<a-space> <icon-file /> 导入表格 </a-space>
						</a-button>
					</a-tooltip>

					<a-button
						size="mini"
						type="outline"
						@click="onConfirm"
					>
						<Icon type="web"> 批量创建 </Icon>
					</a-button>
				</a-space>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onDeactivated, computed } from 'vue';
import { RawPlaywrightScript } from '.';
import { Modal, TableColumnData } from '@arco-design/web-vue';
import uniqueId from 'lodash/uniqueId';
import { store } from '../../store';
import Icon from '../Icon.vue';
import { Config } from '@ocsjs/app/src/scripts/interface';
import { remote } from '../../utils/remote';
import xlsx from 'xlsx';

const props = defineProps<{
	rawPlaywrightScript: RawPlaywrightScript;
}>();

const emits = defineEmits<{
	(e: 'confirm', raw: RawPlaywrightScript, configsList: (RawPlaywrightScript['configs'] & { browserName: string })[]);
	(e: 'cancel');
}>();

const { rawPlaywrightScript } = toRefs(props);

/** 将 configs 对象转换成 config 数组 */
const arrayLikeConfigs = computed(() =>
	Object.keys(rawPlaywrightScript.value.configs)
		.filter((k) => !rawPlaywrightScript.value.configs[k].hide)
		.map((k) => ({ ...rawPlaywrightScript.value.configs[k], key: k }))
);

const state = reactive({
	/** 分页 */
	pagination: {
		total: 1000,
		current: 1,
		pageSize: 100
	},
	/** 存在数据的行索引 */
	validDataIndex: new Set<number>(),
	/** 浏览器名字生成规则 */
	browserNameFields: arrayLikeConfigs.value.map((c) => c.key)
});

const columns = ref<TableColumnData[]>([
	{
		title: '',
		dataIndex: 'index',
		slotName: 'index',
		width: 42,
		bodyCellClass: 'ps-table-index'
	},
	{
		title: '浏览器名',
		dataIndex: 'browserName',
		slotName: 'browserName',
		width: 120
	}
]);

const tableRef = ref();

const data = ref<any[]>(
	new Array(1000).fill(1).map((item, index) => {
		item = Object.create({});
		item.index = index;
		item.key = uniqueId();
		return item;
	})
);

for (const config of arrayLikeConfigs.value) {
	columns.value.push({
		title: config.label,
		dataIndex: config.key,
		slotName: 'data',
		bodyCellClass: 'ps-body-cell'
	});
}

onDeactivated(() => {
	state.browserNameFields = [];
	data.value = [];
	columns.value = [
		{
			title: '#',
			dataIndex: 'index',
			slotName: 'index',
			width: 70
		}
	];
});

function onRecordInput(index: number) {
	state.validDataIndex.add(index);
}

function getValidData() {
	const validData: any[] = [];
	// 对存在数据的行数索引进行排序，然后根据索引提取出 data 里面的数据
	for (const index of Array.from(state.validDataIndex).sort((a, b) => a - b)) {
		validData.push(data.value[index]);
	}
	return validData;
}

function onConfirm() {
	const validData = getValidData();

	const configsList: (RawPlaywrightScript['configs'] & { browserName: string })[] = [];

	for (const obj of validData) {
		const configs: RawPlaywrightScript['configs'] & { browserName: string } = Object.create({});
		const object: Record<string, any> & { browserName: string } = JSON.parse(JSON.stringify(obj));

		Reflect.deleteProperty(object, 'index');
		Reflect.deleteProperty(object, 'key');

		for (const key in object) {
			if (Object.prototype.hasOwnProperty.call(object, key)) {
				Reflect.set(configs, key, {
					hide: !!rawPlaywrightScript.value.configs[key]?.hide,
					label: rawPlaywrightScript.value.configs[key]?.label,
					value: object[key]
				} as Config);
			}
		}
		configs.browserName = object.browserName || state.browserNameFields.map((f) => configs[f]?.value || '').join(' ');
		configsList.push(configs);
	}

	emits('confirm', props.rawPlaywrightScript, configsList);
}

function exportTemplateExcel() {
	const book = xlsx.utils.book_new();
	const template = Object.create({});
	template.浏览器名 = '';
	for (const config of arrayLikeConfigs.value) {
		template[config.label] = '';
	}

	xlsx.utils.book_append_sheet(book, xlsx.utils.json_to_sheet([template]), 'Sheet1');
	xlsx.writeFile(book, `${props.rawPlaywrightScript.name} 创建模板.xlsx`);
}

function importTemplateExcelConfirm() {
	if (getValidData().length > 0) {
		Modal.warning({
			content: '当前存在已经编辑的数据，导入后将覆盖数据，是否确认导入。',
			onOk: importTemplateExcel,
			simple: true,
			cancelText: '取消',
			okText: '确认导入'
		});
	} else {
		importTemplateExcel();
	}
}

function importTemplateExcel() {
	remote.dialog
		.call('showOpenDialog', {
			title: '选择表格进行导入',
			buttonLabel: '导入',
			filters: [{ extensions: ['xlsx', 'csv', 'xls'], name: 'excel表格' }]
		})
		.then(async ({ canceled, filePaths }) => {
			if (canceled === false && filePaths.length) {
				const text = await remote.fs.call('readFileSync', filePaths[0]);
				const book = xlsx.read(text, { type: 'array' });

				const excel = book.SheetNames.map((name) => ({
					SheetName: name,
					data: xlsx.utils.sheet_to_json(book.Sheets[name]) as any[]
				}));

				const list = excel.map((s) => s.data).flat();
				for (let index = 0; index < list.length; index++) {
					const item = list[index];
					const row = Object.create({});

					for (const key in item) {
						if (Object.prototype.hasOwnProperty.call(item, key)) {
							const val = String(item[key] || '');
							const config = arrayLikeConfigs.value.find((c) => c.label === key);
							if (config) {
								Reflect.set(row, config.key, val);
							}
							if (key === '浏览器名') {
								Reflect.set(row, 'browserName', val);
							}
						}
					}

					state.validDataIndex.add(index);
					data.value[index] = row;
				}
			}
		});
}
</script>

<style scoped lang="less">
:deep(.arco-table-cell) {
	padding: 0px;
}

:deep(.ps-body-cell) {
	padding: 0px;
	border: 1px solid #efefef;

	.arco-input-wrapper {
		background: white;
	}
}

:deep(.arco-table-tr) {
	.ps-table-index {
		background-color: #f4f4f4;
		cursor: default;
		text-align: center;
		color: #969696;
	}
}
</style>
