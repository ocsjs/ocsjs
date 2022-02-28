<template>
    <div class="file-tree">
        <a-collapse v-model:activeKey="key" :bordered="false" class="text-start">
            <template #expandIcon="{ isActive }">
                <Icon type="icon-caret-right" :rotate="isActive ? 90 : 0" />
            </template>
            <a-collapse-panel :key="title" :disabled="openSearch">
                <template #header="{ isActive }">
                    <div class="header d-flex">
                        <div class="col-6 title">
                            {{ title }}
                        </div>
                        <div
                            v-if="isActive"
                            class="col-6 d-flex align-items-center justify-content-end"
                        >
                            <Icon
                                :type="openSearch ? 'icon-close-circle' : 'icon-search'"
                                @click.stop="search"
                            />
                        </div>
                    </div>
                </template>

                <a-input-search
                    v-if="openSearch"
                    class="rounded"
                    size="small"
                    v-model:value="searchValue"
                    placeholder="搜索"
                />

                <a-tree
                    class="tree"
                    ref="fileTree"
                    :tree-data="resultList.length === 0 ? files : resultList"
                    show-icon
                    default-expand-all
                    draggable
                    @drop="onDrop"
                >
                    <template #switcherIcon>
                        <Icon type="icon-down" />
                    </template>
                    <template #file>
                        <Icon type="icon-file-text" />
                    </template>
                    <template #dir>
                        <Icon type="icon-wenjianjia" />
                    </template>
                    <template #title="file">
                        <template v-if="file.stat">
                            <a-dropdown :trigger="['contextmenu']">
                                <span @click="clickFile(file)">
                                    {{ StringUtils.maximum(file.title, 20) }}
                                </span>
                                <template #overlay>
                                    <FileMenu :stat="file.stat"></FileMenu>
                                </template>
                            </a-dropdown>
                        </template>
                        <template v-else>
                            <span>{{ StringUtils.maximum(file.title, 20) }}</span>
                        </template>
                    </template>
                </a-tree>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, watch, nextTick } from "vue";
import { File } from "./File";
import Icon from "../Icon.vue";
import { StringUtils } from "../../utils/string";
import FileMenu from "./FileMenu.vue";
import { fileStore } from "./store";
import { DropEvent, TreeDataItem } from "ant-design-vue/lib/tree/Tree";

interface FileTreeProps {
    files: File[];
    title: string;
}
const props = withDefaults(defineProps<FileTreeProps>(), {});

const key = ref([props.title]);
const files = ref(props.files);
const searchValue = ref("");
const resultList = ref<TreeDataItem[]>([]);
const fileTree = ref();

// 打开文件搜索
const openSearch = ref(false);

/**
 * 拖动文件
 */
function onDrop(info: DropEvent) {
    const dropKey = info.node.eventKey;
    const dragKey = info.dragNode.eventKey;
    const dropPos = info.node.pos.split("-");
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data: TreeDataItem[], key: string, callback: any) => {
        data.forEach((item, index, arr) => {
            if (item.key === key) {
                return callback(item, index, arr);
            }
            if (item.children) {
                return loop(item.children, key, callback);
            }
        });
    };
    const data = [...files.value];

    // Find dragObject
    let dragObj: TreeDataItem = {};
    loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
        arr.splice(index, 1);
        dragObj = item;
    });
    if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item: TreeDataItem) => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.push(dragObj);
        });
    } else if (
        (info.node.children || []).length > 0 && // Has children
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
    ) {
        loop(data, dropKey, (item: TreeDataItem) => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.unshift(dragObj);
        });
    } else {
        let ar: TreeDataItem[] = [];
        let i = 0;
        loop(data, dropKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
            ar = arr;
            i = index;
        });
        if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
        } else {
            ar.splice(i + 1, 0, dragObj);
        }
    }
    files.value = data;
}

/**
 * 文件搜索
 */
watch(searchValue, (value) => {
    resultList.value = [];
    if (value) {
        let _files = JSON.parse(JSON.stringify(files.value));
        while (_files.length !== 0) {
            let item = _files.shift();

            if (item && item.title?.includes(value)) {
                resultList.value.push(item);
            }
            if (item?.children) {
                _files = _files.concat(item.children);
            }
        }
    }
});

/**
 * 文件夹置顶
 */
watch(files, () => {
    for (const file of files.value) {
        topDir(file);
    }
    function topDir(file: File) {
        if (file.children) {
            file.children = file.children.sort((a, b) => (a.stat?.isDirectory ? -1 : 1));
            console.log(file.children);
        }
    }
});

/**
 * 点击文件
 */
function clickFile(file: File) {
    fileStore.current = file;
}

function search() {
    openSearch.value = !openSearch.value;

    if (openSearch.value === false) {
        searchValue.value = "";
    }
}
</script>

<style scope lang="less">
#app .file-tree {
    .header {
        white-space: nowrap;

        .title {
            font-size: 12px;
        }
    }

    .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
        left: 0;
    }

    .ant-collapse > .ant-collapse-item > .ant-collapse-header {
        padding: 0px 0px 0px 20px;
    }
    .ant-collapse-content > .ant-collapse-content-box {
        padding: 0;
    }
    .ant-collapse-borderless {
        background-color: white;
    }
    .ant-collapse-item {
        border: none;
    }
}

.tree {
    .ocsicon {
        transform: translate(-0.5px, -3px);
    }
}

em {
    background-color: yellow;
    font-weight: bold;
}
</style>
