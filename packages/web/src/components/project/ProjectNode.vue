<template>
    <div class="file-tree">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" class="text-start">
            <template #expandIcon="{ isActive }">
                <Icon type="icon-caret-right" :rotate="isActive ? 90 : 0" />
            </template>
            <a-collapse-panel :key="title" :disabled="openSearch">
                <template #header="{ isActive }">
                    <ProjectHeader
                        :title="title"
                        :root-node="rootNode"
                        :expend="isActive"
                        v-model:open-search="openSearch"
                        v-model:search-value="searchValue"
                    ></ProjectHeader>
                </template>

                <template v-if="rootNode?.children?.length === 0 || files?.length === 0">
                    <div style="font-size: 11px" class="text-center p-1 text-secondary">
                        没有任何文件
                    </div>
                </template>
                <template v-else>
                    <template v-if="resultList.length !== 0">
                        <FileTree :files="resultList"></FileTree>
                    </template>
                    <template v-else>
                        <FileTree :files="rootNode?.children || files || []"></FileTree>
                    </template>
                </template>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue";
import { FileNode, flatFiles } from "../File/File";
import Icon from "../Icon.vue";
import { TreeDataItem } from "ant-design-vue/lib/tree/Tree";
import FileTree from "../file/FileTree.vue";
import ProjectHeader from "./ProjectHeader.vue";

interface FileTreeProps {
    title: string;
    rootNode?: FileNode;
    files?: FileNode[];
}
const props = withDefaults(defineProps<FileTreeProps>(), {});

const { rootNode, files, title } = toRefs(props);

const activeKey = ref([title.value]);
const expandedKeys = ref(
    flatFiles(rootNode?.value?.children || files?.value || [])
        .filter((file) => file.stat.expand)
        .map((file) => file.key)
);

// 打开文件搜索
const openSearch = ref(false);

// 搜索结果
const resultList = ref<FileNode[]>([]);

const searchValue = ref("");

/**
 * 文件搜索
 */
watch(searchValue, (value) => {
    console.log(value);

    resultList.value = [];
    if (value) {
        let _files: FileNode[] = JSON.parse(
            JSON.stringify(rootNode?.value?.children || files?.value)
        );
        while (_files.length !== 0) {
            let item = _files.shift();

            if (item && item.title?.includes(value)) {
                item.stat.expand = false;
                resultList.value.push(item);
            }
            if (item?.children) {
                _files = _files.concat(item.children);
            }
        }
    }
    console.log("搜索结果", resultList.value);
});

/** 如果搜索关闭，则清空搜索框 */
watch(openSearch, () => {
    if (openSearch.value === false) {
        searchValue.value = "";
    }
});
</script>

<style scope lang="less">
#app .file-tree {
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
