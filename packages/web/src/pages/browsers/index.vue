<template>
	<div
		id="browsers"
		class="h-100"
	>
		<div class="col-12 p-1 ps-2 pe-2 operations">
			<!-- 路径栏 -->
			<!-- 当处于搜索状态时隐藏 -->
			<FileBreadcrumb v-show="currentSearchedEntities === undefined"></FileBreadcrumb>
			<!-- 文件筛选 -->
			<FileFilters></FileFilters>

			<!-- 搜索时禁止文件操作 -->
			<template v-if="currentSearchedEntities">
				<a-button
					size="mini"
					@click="resetSearch"
				>
					<Icon type="restart_alt"> 重置 </Icon>
				</a-button>
			</template>
		</div>

		<!-- 文件操作 -->
		<FileMultipleOperators></FileMultipleOperators>

		<template v-if="Object.keys(currentEntities).length === 0">
			<div class="d-flex align-items-center mt-5">
				<a-empty class="p-3">
					<div>暂无浏览器，可点击上方的帮助查看使用教程哦~</div>
				</a-empty>
			</div>
		</template>
		<template v-else-if="currentSearchedEntities !== undefined && currentSearchedEntities.length === 0">
			<a-empty
				class="p-3"
				description="暂无浏览器搜索结果"
			></a-empty>
		</template>

		<div
			v-else
			class="col-12 p-2 pt-1 entities-container"
		>
			<FileHeader></FileHeader>
			<!-- 显示浏览器以及文件夹列表 -->
			<div class="entities">
				<template v-for="child of currentSearchedEntities ? currentSearchedEntities : currentEntities">
					<Entity
						v-if="child.type !== 'browser'"
						:key="child.uid"
						class="entity"
						:entity="child"
					>
						<template #icon>
							<Icon
								theme="filled"
								type="folder"
								style="height: 24px"
								class="fs-5 ps-1"
							></Icon>
						</template>

						<template #actions>
							<EntityOperator
								type="folder"
								:entity="child"
								:permissions="currentSearchedEntities ? ['location'] : ['rename', 'remove']"
							></EntityOperator>
						</template>
					</Entity>
				</template>

				<template v-for="child of currentSearchedEntities ? currentSearchedEntities : currentEntities">
					<Entity
						v-if="child && child.type === 'browser'"
						:key="child.uid"
						class="entity"
						:entity="child"
					>
						<template #prefix>
							<!-- 单选框 -->
							<a-col
								flex="32px"
								class="d-flex"
							>
								<a-checkbox v-model="child.checked"></a-checkbox>
							</a-col>
						</template>

						<template #extra>
							<!-- 备注 -->
							<a-col
								flex="250px"
								class="text-secondary notes"
							>
								<a-tooltip
									content="备注描述"
									position="tl"
								>
									<template #content>
										<div>备注描述</div>
										<a-divider class="mt-1 mb-1" />
										<div>
											{{ child.notes }}
										</div>
									</template>
									<span> {{ child.notes }} </span>
								</a-tooltip>
							</a-col>

							<!-- 标签 -->
							<a-col flex="180px">
								<Tags
									:tags="child.tags"
									:read-only="true"
									size="small"
								></Tags>
							</a-col>
						</template>

						<template #actions>
							<BrowserOperators :browser="child">
								<template #split>
									<a-divider direction="vertical" />
								</template>
							</BrowserOperators>
							<EntityOperator
								type="browser"
								:entity="child"
							></EntityOperator>
						</template>
					</Entity>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from '../../components/Icon.vue';
import Entity from '../../components/Entity.vue';
import Tags from '../../components/Tags.vue';
import BrowserOperators from '../../components/browsers/BrowserOperators.vue';
import { resetSearch } from '../../utils/entity';
import EntityOperator from '../../components/EntityOperator.vue';
import FileFilters from '../../components/browsers/FileFilters.vue';
import FileBreadcrumb from '../../components/browsers/FileBreadcrumb.vue';
import { currentEntities, currentSearchedEntities } from '../../fs';
import FileHeader from '../../components/browsers/FileHeader.vue';
import FileMultipleOperators from '../../components/browsers/FileMultipleOperators.vue';
</script>

<style scoped lang="less">
.operations {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
}

.list-container {
	height: calc(100% - 94px);
	position: relative;
	overflow: hidden;
}

.list {
	display: grid;
	grid-template-columns: repeat(auto-fill, 100px);
}

.browser-profile {
	display: grid;
	grid-template-columns: repeat(auto-fill, 1fr);
}

.add-folder-or-browser {
	border: 2px dashed #dbdbdb;
	border-radius: 4px;
	display: flex;
	justify-content: center;
	align-items: center;

	&::before {
		color: #ebebeb;
		font-size: 64px;
		content: '+';
	}

	&:hover {
		background-color: #f7f7f7;
	}
}

.notes {
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

.entity {
	padding: 4px 0px;
}

.entities-container {
	height: calc(100% - 90px);
}

.entities {
	height: calc(100% - 24px);
	overflow: overlay;
}

.filters-btn {
	padding: 0 4px;
	margin: 0;
}
</style>
