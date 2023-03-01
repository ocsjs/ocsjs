<template>
	<template
		v-for="(script, _index) of scripts"
		:key="_index"
	>
		<div
			class="user-script d-flex"
			:class="{ 'user-script-active': script.id === selectedScript }"
			@mouseleave="selectedScript = 0"
			@mouseover="selectedScript = script.id"
		>
			<div
				v-if="script.info"
				class="col-12"
			>
				<div class="user-script-name">
					<a
						target="_blank"
						:href="script.info.url"
					>
						<span>{{ script.info.name }}</span>
					</a>
				</div>
				<div
					class="user-script-descriptions"
					:title="script.info.description"
				>
					<a
						v-for="(author, i) of script.info.authors"
						:key="i"
						:href="author.url"
						class="user-script-author"
						target="_blank"
					>
						<img
							v-if="author.avatar"
							:src="author.avatar"
							class="user-script-icon"
						/>
						<Icon
							v-else
							type="account_circle"
							style="margin-top: 4px"
							class="user-script-icon"
						/>
						<span class="ms-1">{{ author.name }}</span>
					</a>
					：
					{{ script.info.description }}
				</div>

				<div class="user-script-infos">
					<a-space size="mini">
						<slot
							:script="script"
							name="infos"
						></slot>

						<a-tooltip content="今日安装">
							<a-tag color="blue">
								⬇️<b>{{ script.info.daily_installs }}</b>
							</a-tag>
						</a-tooltip>

						<a-tooltip content="总安装">
							<a-tag color="green">
								📦<b>{{ script.info.total_installs }}</b>
							</a-tag>
						</a-tooltip>

						<a-tooltip content="版本">
							<a-tag color="red">
								v<b>{{ script.info.version }}</b>
							</a-tag>
						</a-tooltip>

						<a-tooltip content="评分">
							<a-tag color="orange">
								⭐<b>{{ script.info.ratings ? script.info.ratings.toFixed(1) : '无' }}</b>
							</a-tag>
						</a-tooltip>

						<a-tag
							v-if="script.info.createTime > 0"
							title="创建时间"
						>
							{{ new Date(script.info.createTime).toLocaleDateString() }} 创建
						</a-tag>
						<a-tag
							v-if="script.info.updateTime > 0"
							title="更新时间"
						>
							{{ getElapsedTime(script.info.updateTime) }} 前更新
						</a-tag>
					</a-space>
				</div>
			</div>

			<div
				v-else
				class="col-12"
			>
				<div class="user-script-name">
					<a
						target="_blank"
						:href="`file://${script.url}`"
					>
						<span>{{ script.url }}</span>
					</a>
				</div>
			</div>

			<div class="user-script-actions">
				<slot
					name="actions"
					:script="script"
					:already-installed="isAlreadyInstalled(script)"
				/>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import Icon from '../../components/Icon.vue';
import { store, StoreUserScript } from '../../store';

interface ScriptListProps {
	scripts: StoreUserScript[];
}

const props = withDefaults(defineProps<ScriptListProps>(), {});
const { scripts } = toRefs(props);

/** 选中的脚本 */
const selectedScript = ref<number>(0);

/**
 * 根据指定的t，获取t距离现在过去了多少时间
 */
function getElapsedTime(t: number) {
	const now = Date.now();
	const elapsed = now - t;
	let result = '';
	const second = 1000;
	const minute = 60 * second;
	const hours = 60 * minute;
	const day = 24 * hours;
	const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	const nowYear = new Date(now).getFullYear();
	const nowMonth = new Date(now).getMonth();
	// 判断是不是闰年
	if ((nowYear % 4 === 0 && nowYear % 100 !== 0) || nowYear % 400 === 0) months[1] = 29;
	const month = Math.abs(new Date(t).getMonth() - nowMonth);
	const year = nowYear - new Date(t).getFullYear();

	if (year !== 0 && month >= 12) result = year + '年';
	else if (month !== 0 && Math.floor(elapsed / day) >= months[nowMonth]) return month + '个月';
	else if (parse(day) !== 0) result = parse(day) + '天';
	else if (parse(hours) !== 0) result = parse(hours) + '小时';
	else if (parse(minute) !== 0) result = parse(minute) + '分钟';
	else result = '刚刚';

	function parse(time: number) {
		return Math.floor(elapsed / time);
	}
	return result;
}

/**
 * 判断是否安装
 */
function isAlreadyInstalled(sc: StoreUserScript) {
	return store.render.scripts.find((s) => s.id === sc.id) !== undefined;
}
</script>

<style scoped lang="less">
.user-script-list {
	padding: 4px;
	height: calc(100vh - 180px);
	overflow-y: auto;
}

.user-script-name {
	letter-spacing: 1px;
	font-size: 14px;
	font-weight: bold;

	a {
		color: inherit;
	}
}

.user-script-author {
	color: inherit;
	display: inline-flex;
	align-items: center;
}

.user-script-name:hover {
	cursor: pointer;
	color: #1890ff;
	text-decoration: underline;
}

.user-script-icon {
	width: 24px;
	height: 24px;
	font-size: 20px;
	border-radius: 50%;
	border-radius: 50%;
}

.user-script-descriptions {
	font-size: 12px;
	display: inline-flex;
	align-items: center;
	white-space: nowrap;
	overflow: hidden;
	width: 100%;
	text-overflow: ellipsis;
}

.user-script-infos {
	font-size: 0px;
}

.user-script {
	border-bottom: 1px solid #bdbdbd;
	border-radius: 4px;
	padding: 8px 12px;
	box-shadow: 0px 2px 4px 0px #d7d7d7;
}

.user-script-active {
	box-shadow: 0px 2px 4px 0px #9ec6eb;
}

.user-script + .user-script {
	margin-top: 8px;
}

.user-script-actions {
	position: relative;
	transform: translateX(-100%);
}

.ant-tag {
	font-size: 11px !important;
	line-height: 15px !important;
}
</style>
