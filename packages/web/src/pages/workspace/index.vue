<template>
    <div id="workspace" class="text-center h-100 d-flex">
        <!-- 搜索文件夹 -->
        <div class="files resizable overflow-auto col-3 p-2 border-end">
            <FileTree title="工作区" class="mb-2" :files="roots.workspace"></FileTree>
            <FileTree title="打开的文件" :files="roots.opened"></FileTree>
        </div>
        <div class="col-10">
            <template v-if="fileStore.current === undefined">
                打开 (.ocs) 文件进行编辑或者运行
            </template>
            <template v-else>
                {{ fileStore.current }}
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, reactive, Ref, ref } from "vue";

import { store } from "../../store";
import interact from "interactjs";
import { createFile, File, fs } from "../../components/file/File";
import FileTree from "../../components/file/FileTree.vue";
import { fileStore } from "../../components/file/store";

const roots = reactive({
    workspace: createFile(store.workspace).children || [],
    opened: store.files
        .filter((f) => fs.existsSync(String(f)))
        .map((f) => createFile(String(f))),
});

const activeKey = ref(["1"]);

onMounted(() => {
    /** 边框拖拽，改变目录大小 */
    interact(".resizable").resizable({
        edges: { top: false, left: false, bottom: false, right: true },
        margin: 8,
        listeners: {
            move: function (event: any) {
                let { x, y } = event.target.dataset;

                x = (parseFloat(x) || 0) + event.deltaRect.left;
                y = (parseFloat(y) || 0) + event.deltaRect.top;

                Object.assign(event.target.style, {
                    width: `${event.rect.width}px`,
                    height: `${event.rect.height}px`,
                    transform: `translate(${x}px, ${y}px)`,
                });

                Object.assign(event.target.dataset, { x, y });
            },
        },
    });
});
</script>

<style scope lang="less">
#workspace {
    padding: 0;

    .files {
        max-width: 50vw;
        min-width: 100px;
        height: 100% !important;
        background-color: white;

        ul {
            text-align: left;
            padding: 0;
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

        .ant-tree-child-tree .ant-tree-treenode-switcher-open {
            border-left: 1px solid #dfdfdf;
        }

        .ant-tree li .ant-tree-node-content-wrapper {
            padding: 0;
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
}

#nav {
    position: sticky;
    top: 48px;
    z-index: 99;
}

#breadcrumb {
    white-space: nowrap;
    overflow: auto;
}

#actions {
    display: inline-flex;
    flex-wrap: nowrap;
    button {
        margin: 0 4px;
    }
}

.dirs {
    display: grid;
    grid-template-columns: repeat(auto-fill, 120px);
    grid-template-rows: auto;
}

.dir {
    border-radius: 4px;
    width: 100%;

    .dir-name {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    svg {
        width: 48px;
        height: 48px;
    }

    &.select {
        box-shadow: 0px 0px 4px #40a9ff7b;
    }
}

.dir:first-child {
    margin: 0;
}

[role="menuitem"],
[role="menu"] {
    width: 180px;
}
</style>
