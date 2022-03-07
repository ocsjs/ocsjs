<template>
    <div class="file-tree">
        <a-collapse v-model:activeKey="activeKey" :bordered="false" class="text-start">
            <template #expandIcon="{ isActive }">
                <Icon type="icon-caret-right" :rotate="isActive ? 90 : 0" />
            </template>
            <a-collapse-panel :key="title" :disabled="openSearch">
                <!-- 项目列表头部 -->
                <template #header="{ isActive }">
                    <ProjectHeader
                        :title="title"
                        :root-node="rootNode"
                        :expend="isActive"
                        v-model:open-search="openSearch"
                        v-model:search-value="searchValue"
                    ></ProjectHeader>
                </template>
                <!-- 项目文件列表 -->
                <template v-if="rootNode?.children?.length === 0 || files?.length === 0">
                    <div style="font-size: 11px" class="text-center p-1 text-secondary">
                        没有任何文件
                    </div>
                </template>
                <template v-else>
                    <template v-if="resultList.length !== 0">
                        <!-- 搜索结果列表 -->
                        <FileTree
                            class="search-result-list"
                            :files="resultList"
                            :draggable="false"
                        ></FileTree>
                    </template>
                    <template v-else>
                        <!-- 
                            - 可以通过 node.children 或者 files 指定文件
                            - 如果 rootNode 为空，则此项目为虚拟路径项目，不存在实体父文件夹
                         -->
                        <FileTree
                            v-model:expandedKeys="expandedKeys"
                            :draggable="true"
                            :files="rootNode?.children || files || []"
                            @expand="onExpand"
                            @select="onSelect"
                        ></FileTree>
                    </template>
                </template>
            </a-collapse-panel>
        </a-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, getCurrentInstance } from "vue";
import { FileNode, flatFiles } from "../File/File";
import Icon from "../Icon.vue";
import FileTree from "../file/FileTree.vue";
import ProjectHeader from "./ProjectHeader.vue";
import { store } from "../../store";
import { Project } from ".";

interface FileTreeProps {
    /** 项目标题 */
    title: string;
    /**
     * 指定 rootNode ，则此项目为实体路径项目，存在父文件夹
     */
    rootNode?: FileNode;
    /**
     * 指定 files 则此项目为虚拟路径项目，不存在实体父文件夹
     */
    files?: FileNode[];
}
const props = withDefaults(defineProps<FileTreeProps>(), {});

const { rootNode, files, title } = toRefs(props);

const activeKey = ref([title.value]);

// 打开文件搜索
const openSearch = ref(false);
// 搜索结果
const resultList = ref<FileNode[]>([]);
// 搜索值
const searchValue = ref("");
// 展开的节点
const expandedKeys = ref<string[]>(store.expandedKeys);

/** 节点展开 */
function onExpand(keys: string[], { node }: { expanded: boolean; node: any }) {
    const fileNode = node.dataRef as FileNode;
    /**
     *  当父文件夹收回时，其所有的子文件夹也应该收回
     */
    expandedKeys.value = expandedKeys.value.filter(
        (key) => key.length <= fileNode.path.length
    );
    /** 保存 */
    store.expandedKeys = expandedKeys.value;
}

/** 节点选中 */

function onSelect(
    keys: string[],
    e: { selected: boolean; selectedNodes: any[]; node: any; event: any }
) {
    const file: FileNode = e.node.dataRef;
    /** 选中文件夹，则展开 */
    if (file.stat.isDirectory) {
        if (e.selected) {
            expandedKeys.value = expandedKeys.value.filter(
                (path) => path !== (e.node.dataRef as FileNode).path
            );
        } else {
            expandedKeys.value.push((e.node.dataRef as FileNode).path);
        }
    } else {
        /** 隐藏所有文件，显示当前点击的文件 */
        Project.opened.value.forEach((file) => (file.stat.show = false));

        /** 寻找打开过的文件 */
        const openedFile = Project.opened.value.find((f) => f.uid === file.uid);
        /** 如果该文件之前打开过 */
        if (openedFile) {
            openedFile.stat.show = true;
        } else {
            /** 新增文件编辑 */
            file.stat.show = true;
            Project.opened.value.push(file);
        }
    }
}

/**
 * 文件搜索
 */
watch(searchValue, (value) => {
    resultList.value = [];
    if (value) {
        let _files: FileNode[] = JSON.parse(
            JSON.stringify(rootNode?.value?.children || files?.value)
        );
        while (_files.length !== 0) {
            let item = _files.shift();

            if (
                item &&
                item.title?.toLocaleLowerCase().includes(value.toLocaleLowerCase())
            ) {
                /**
                 * 显示搜索的字符串,忽略大小写
                 */

                item.title = item.title.replace(
                    RegExp(`(${value})`, "ig"),
                    `<em>$1</em>`
                );
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
}

em {
    background-color: yellow;
    font-weight: bold;
}
</style>
