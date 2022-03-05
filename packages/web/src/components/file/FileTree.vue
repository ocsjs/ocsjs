<template>
    <div class="file-tree">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" class="text-start">
            <template #expandIcon="{ isActive }">
                <Icon type="icon-caret-right" :rotate="isActive ? 90 : 0" />
            </template>
            <a-collapse-panel :key="project.title" :disabled="openSearch">
                <template #header="{ isActive }">
                    <div class="header d-flex">
                        <div class="col-6 title">
                            {{ project.title }}
                        </div>
                        <div
                            v-if="isActive"
                            class="col-6 d-flex align-items-center justify-content-end"
                        >
                            <Icon
                                title="新建文件夹"
                                class="me-2"
                                type="icon-folder-plus"
                                @click.stop="mkdir(project.node)"
                            />
                            <Icon
                                title="新建文件"
                                class="me-2"
                                type="icon-file-plus"
                                @click.stop="createFile(project.node)"
                            />
                            <Icon
                                title="搜索文件"
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

                <template v-if="node.children && node.children.length === 0">
                    <div style="font-size: 11px" class="text-center p-1 text-secondary">
                        没有任何文件
                    </div>
                </template>
                <template v-else>
                    <ATree
                        class="tree"
                        v-model:tree-data="node.children"
                        :expandedKeys="expandedKeys"
                        show-icon
                        :draggable="node.children !== undefined"
                        @drop="onDrop"
                        @expand="onExpand"
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
                                        <FileMenu :file="file"></FileMenu>
                                    </template>
                                </a-dropdown>
                            </template>
                            <template v-else>
                                <span>{{ StringUtils.maximum(file.title, 20) }}</span>
                            </template>
                        </template>
                    </ATree>
                </template>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue";
import { FileNode, fs, path, createFile, mkdir, flatFiles } from "./File";
import Icon from "../Icon.vue";
import { StringUtils } from "../../utils/string";
import FileMenu from "./FileMenu.vue";
import { TreeDataItem } from "ant-design-vue/lib/tree/Tree";
import { notify } from "../../utils/notify";
import { remote } from "../../utils/remote";
import { message } from "ant-design-vue";
import { Project } from "../project";
import ATree from "ant-design-vue/lib/tree";

interface FileTreeProps {
    project: Project;
}
const props = withDefaults(defineProps<FileTreeProps>(), {});

const { project } = toRefs(props);

const activeKey = ref([project.value.title]);
const expandedKeys = ref(
    flatFiles(project.value.node.children || [])
        .filter((file) => file.stat.expand)
        .map((file) => file.key)
);
const node = project.value.node;

// 打开文件搜索
const openSearch = ref(false);
// 搜索值
const searchValue = ref("");
// 搜索结果
const resultList = ref<TreeDataItem[]>([]);

/**
 * 拖动文件
 */
function onDrop(info: any) {
    try {
        const destFile: FileNode = info.node.dataRef;
        const dragFile: FileNode = info.dragNode.dataRef;

        // 如果移到元素上，并且该元素不是文件夹，则不做反应
        if (info.dropToGap === false && !destFile.stat?.isDirectory) {
            return;
        }

        /** 放置后的文件夹路径 */
        const destPath = path.join(
            info.dropToGap === false ? destFile.path : destFile.parent,
            dragFile.title
        );
        /** 路径相同，则不做处理 */
        if (dragFile.path === destPath) {
            return;
        }
        if (fs.existsSync(destPath)) {
            message.error("路径下存在相同名字的文件(夹)！");
            return;
        }

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
        const data = [...(node.children || [])];

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

        node.children = data;
    } catch (e) {
        notify("移动文件时出错", e, "file-move", { copy: true, type: "error" });
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
        let _files = JSON.parse(JSON.stringify(node.children));
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
 * 点击文件
 */
function clickFile(file: FileNode) {
    if (file.stat.isDirectory) {
        file.stat.expand = !file.stat.expand;
        expandedKeys.value = flatFiles(project.value.node.children || [])
            .filter((file) => file.stat.expand)
            .map((file) => file.key);
    } else {
        /** 隐藏所有编辑文件 */
        Project.opened.value.forEach((file) => (file.stat.opened = false));
        /** 寻找打开过的文件 */
        const openedFile = Project.opened.value.find((f) => f.key === file.key);
        /** 如果该文件之前打开过 */
        if (openedFile) {
            openedFile.stat.opened = true;
        } else {
            /** 新增文件编辑 */
            file.stat.opened = true;
            Project.opened.value.push(file);
        }
    }
}

/** 如果搜索关闭，则清空搜索框 */
function search() {
    openSearch.value = !openSearch.value;
    if (openSearch.value === false) {
        searchValue.value = "";
    }
}

function onExpand(keys: string[], e: { expanded: boolean; node: any }) {
    expandedKeys.value = keys;
    e.node.dataRef.stat.expand = e.expanded;
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
        max-height: 100vh;
        overflow: auto;
    }

    ul {
        text-align: left;
        padding: 0px 0px 12px 0px;

        .ocsicon {
            transform: translate(0.5px, -3px);
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
