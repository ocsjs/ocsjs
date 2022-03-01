<template>
    <div class="file-tree">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" class="text-start">
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

                <template v-if="files.length === 0">
                    <div style="font-size: 11px" class="text-center p-1 text-secondary">
                        没有任何文件
                    </div>
                </template>
                <template v-else>
                    <a-tree
                        class="tree"
                        :tree-data="resultList.length === 0 ? files : resultList"
                        show-icon
                        default-expand-all
                        :draggable="root !== undefined"
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
                            <template
                                v-if="root && file.stat && file.stat.removed === false"
                            >
                                <a-dropdown :trigger="['contextmenu']">
                                    <span @click="clickFile(file)">
                                        {{ StringUtils.maximum(file.title, 20) }}
                                    </span>

                                    <template #overlay>
                                        <FileMenu
                                            @fileChange="fileChange"
                                            :root-path="root"
                                            :file="file"
                                        ></FileMenu>
                                    </template>
                                </a-dropdown>
                            </template>
                            <template v-else>
                                <span>{{ StringUtils.maximum(file.title, 20) }}</span>
                            </template>
                        </template>
                    </a-tree>
                </template>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { File, fs, loopFiles, path } from "./File";
import Icon from "../Icon.vue";
import { StringUtils } from "../../utils/string";
import FileMenu from "./FileMenu.vue";
import { fileStore } from "./store";
import { DropEvent, TreeDataItem } from "ant-design-vue/lib/tree/Tree";
import { notify } from "../../utils/notify";
import { remote } from "../../utils/remote";

interface FileTreeProps {
    /** 根路径 */
    root?: string;
    /** 文件 */
    files: File[];
    /** 标题 */
    title: string;
}
const props = withDefaults(defineProps<FileTreeProps>(), {});

const activeKey = ref([props.title]);
const files = ref(props.files);

// 打开文件搜索
const openSearch = ref(false);
// 搜索值
const searchValue = ref("");
// 搜索结果
const resultList = ref<TreeDataItem[]>([]);

/**
 * 拖动文件
 */
function onDrop(info: DropEvent) {
    try {
        const destFile: File = info.node.dataRef;
        const dragFile: File = info.dragNode.dataRef;

        // 如果移到元素上，并且该元素不是文件夹，则不做反应
        if (info.dropToGap === false && !destFile.stat?.isDirectory) return;

        /** 放置后的文件夹路径 */
        const destPath = path.join(
            info.dropToGap === false ? destFile.path : destFile.parent,
            dragFile.title
        );
        /** 移动文件(夹) */
        fs.renameSync(dragFile.path, destPath);

        /** 改变文件目录 */
        dragFile.parent = destPath;
        dragFile.path = destPath;

        // code original : https://2x.antdv.com/components/tree-cn#components-tree-demo-draggable
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
            loop(
                data,
                dropKey,
                (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
                    ar = arr;
                    i = index;
                }
            );
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        files.value = data;
    } catch (e) {
        notify("移动文件时出错", e, "file-move", { copy: true });
        remote.logger.call(
            "error",
            "移动文件时出错 : " + (e as Error).message + "\n" + (e as Error).stack
        );
    }
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

function fileChange(file: File) {
    console.log("fileChange", file);

    files.value = loopFiles(files.value, topDir, clearRemovedFile);
}

files.value = loopFiles(files.value, topDir, clearRemovedFile);

/**
 * 文件夹置顶
 */
function topDir(files: File[]) {
    return files.sort((a, b) => (a.stat?.isDirectory ? -1 : 1));
}

/**
 * 清理被删除文件
 */
function clearRemovedFile(files: File[]) {
    return files.filter((f) => f.stat.removed === false);
}

/**
 * 点击文件
 */
function clickFile(file: File) {
    fileStore.current = file;
}

/** 如果搜索关闭，则清空搜索框 */
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
        left: 4px;
    }

    .ant-collapse > .ant-collapse-item > .ant-collapse-header {
        border-radius: 4px;
        background-color: #f8f8f8;
        padding: 0px 4px 0px 20px;
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

    .ant-tree {
        max-height: 50vh;
        overflow: auto;
    }

    ul {
        text-align: left;
        padding: 0px 0px 12px 0px;

        .ocsicon {
            transform: translate(-0.5px, -3px);
        }
    }

    .ant-tree-switcher {
        width: 12px;
        height: 12px;
    }
    .ant-tree-switcher-icon {
        transform: translate(-0.5px, -3px);
    }

    // background-color: #188fff31;
    .ant-tree.ant-tree-directory
        > li.ant-tree-treenode-selected
        > span.ant-tree-node-content-wrapper::before {
        background-color: #188fff54;
    }
    .ant-tree.ant-tree-directory
        .ant-tree-child-tree
        > li.ant-tree-treenode-selected
        > span.ant-tree-node-content-wrapper::before {
        background-color: #188fff54;
    }

    .ant-tree-child-tree {
        .ant-tree-treenode-switcher-open,
        .ant-tree-treenode-switcher-close {
            border-left: 1px solid #dfdfdf;
        }
    }

    .ant-tree li .ant-tree-node-content-wrapper {
        padding: 0px 8px 0px 0px;
    }
    .ant-tree li ul {
        padding: 0px 0px 0px 6px;
    }
    .ant-tree li {
        padding: 0;
    }
    .ant-tree-title {
        font-size: 11px;
    }
}

em {
    background-color: yellow;
    font-weight: bold;
}
</style>
