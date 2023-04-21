<template>
	<div class="bookmarks">
		<a-spin
			class="w-100 h-100 p-3"
			:loading="state.loading"
		>
			<template #element>
				<div><icon-loading /></div>
				<div
					v-for="(tip, index) of state.tips"
					:key="index"
					style="font-size: 12px"
				>
					{{ tip }}
				</div>
			</template>

			<h1>OCS 导航页</h1>
			<div id="notes">
				<div
					class="bookmarks-blockquote text-secondary mb-3"
					style="font-size: 14px"
				>
					<div>进入浏览器并等待初始化后，即可使用安装的浏览器脚本管理拓展，进行脚本的运行。</div>
					<div>
						如果您使用的是 “OCS 网课助手”，请打开以下任意一个网课平台即可，会出现脚本悬浮窗，并有对应的使用教程。
					</div>
				</div>

				<div
					class="bookmarks-blockquote text-secondary mb-3"
					:class="{ warn: state.warn }"
				>
					<div
						v-for="(tip, index) of state.tips"
						:key="index"
					>
						{{ tip }}
					</div>
				</div>
			</div>
			<template
				v-for="item of bookmarks"
				:key="item?.group"
			>
				<Card
					v-if="!!item"
					class="bookmarks-card rounded shadow-sm p-0"
					:bordered="false"
					:title="item.group"
				>
					<div class="bookmark-card-body">
						<div
							v-for="bookmark of item.values"
							:key="bookmark?.name"
							class="bookmark"
						>
							<a
								v-if="!!bookmark"
								:href="bookmark.url"
								target="_blank"
							>
								<a-tooltip background-color="#6c6c6ccf">
									<template #content>
										<div>{{ bookmark.description || '暂无描述' }}</div>
									</template>
									<div class="icon col-12">
										<img :src="bookmark.icon" />
									</div>
								</a-tooltip>
								<div class="col-12 mt-1 text-black text-decoration-underline">
									{{ bookmark.name }}
								</div>
							</a>
						</div>
					</div>
				</Card>
			</template>
		</a-spin>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { getRemoteInfos } from '../utils';
import { Card } from '@arco-design/web-vue';
import { BookmarkResource } from '../utils/apis';

type BookMark = BookmarkResource;

const bookmarks = ref<BookMark[]>([]);

const state = reactive({
	loading: false,
	warn: false,
	tips: ['']
});

// @ts-ignore 暴露方法给 playwright 脚本
window.setBookmarkLoadingState = (_state) => {
	Object.assign(state, _state);
};

onMounted(async () => {
	const infos = await getRemoteInfos();

	// 用 fori 是为了保证每个网站的位置固定

	for (let i = 0; i < infos.bookmark.length; i++) {
		const bookmark = infos.bookmark[i] as BookMark;

		bookmark.values.forEach(async (_, j) => {
			const site = reactive(bookmark.values[j]);
			bookmarks.value[i] = bookmarks.value[i] || { group: '', values: [] };
			bookmarks.value[i].group = bookmark.group;
			bookmarks.value[i].values[j] = site;
		});
	}
});
</script>

<style scoped lang="less">
.bookmarks-blockquote {
	border-left: 6px solid #8db1e7;
	padding-left: 12px;

	&.warn {
		border-left: 6px solid #e4cc61;
	}
}
.bookmarks {
	height: 100%;
	background-color: #f2f2f2;

	.bookmarks-card {
		background-color: white;
	}
	.bookmarks-card + .bookmarks-card {
		margin-top: 24px;
	}

	:deep(.arco-card-body) {
		padding: 0px;
	}
}

.bookmark-card-body {
	display: grid;
	grid-template-columns: repeat(auto-fill, 120px);

	.bookmark {
		text-align: center;
		margin: 12px;
	}
}

.icon {
	width: 64px;
	height: 64px;
	padding: 12px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #e1e1e1;
	border-radius: 100%;
	cursor: pointer;

	&:hover {
		border: 1px solid #70d5fd;
	}

	object,
	img {
		width: 24px;
		height: 24px;
		display: block;
	}
}
</style>
