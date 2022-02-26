<template>
    <div id="workspace" class="text-center h-100">
        <!-- 搜索文件夹 -->
        <div class="files resizable col-2 p-2 ps-0 border-end">
            <ContextMenus>
                <a-directory-tree
                    class="overflow-auto h-100"
                    multiple
                    v-model:expandedKeys="expandedKeys"
                    v-model:selectedKeys="selectedKeys"
                >
                    <template #switcherIcon><Icon type="icon-down" /></template>
                    <a-tree-node key="0-0" title="parent 0">
                        <template #icon><Icon type="icon-wenjianjia" /></template>
                        <a-tree-node key="0-0-0" title="leaf 0-0" is-leaf />
                        <a-tree-node key="0-0-1" title="leaf 0-1" is-leaf />
                    </a-tree-node>
                </a-directory-tree>
                <template #overlay>
                    <Menus :data="menus" />
                </template>
            </ContextMenus>
        </div>
        <div class="col-10"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, Ref, ref } from "vue";

import { MenuItem } from "../../components/menus";
import Menus from "../../components/menus/Menus.vue";
import ContextMenus from "../../components/menus/ContextMenus.vue";
import { store } from "../../store";
import interact from "interactjs";

const fs = require("fs");
const path = require("path");

const expandedKeys = ref<string[]>(["0-0", "0-1"]);
const selectedKeys = ref<string[]>([]);

const menus: MenuItem[] = [
    {
        title: "新建文件夹",
        icon: "icon-wenjianjia",
        onClick() {
            const name = validName("新建文件夹($count)");
            const dir = path.resolve(store.workspace, name);
            fs.mkdirSync(dir);
            store.files.push(dir);
        },
    },
    {
        title: "新建OCS文件",
        icon: "icon-file",
        onClick() {
            const name = validName("新建文件($count).ocs");
            fs.writeFileSync(path.resolve(store.workspace, name), "{}");
            store.files.push(name);
        },
    },
];

function validName(name: string) {
    let count = 0;
    let p = "";
    while (true) {
        p = path.resolve(
            store.workspace,
            name.replace("($count)", count++ === 0 ? "" : `(${count})`)
        );

        if (!fs.existsSync(p)) {
            break;
        }
    }
    return p;
}

onMounted(() => {
    /** 边框拖拽，改变目录大小 */
    interact(".resizable").resizable({
        edges: { top: false, left: false, bottom: false, right: true },
        margin: 8,
        listeners: {
            move: function (event) {
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
            padding: 0px 16px;
        }

        .ant-tree-switcher {
            width: 12px;
            height: 12px;
        }
        .ant-tree-switcher-icon {
            transform: translate(-0.5px, -3px);
        }

        .ant-tree-treenode-selected > span.ant-tree-switcher {
            color: #188fff85;
        }
        .ant-tree-node-selected {
            color: #188fff85;
        }

        .ant-tree-treenode-selected > span.ant-tree-node-content-wrapper::before {
            background-color: rgba(255, 255, 255, 0);
        }
        .ant-tree li .ant-tree-node-content-wrapper {
            padding: 0;
        }
        .ant-tree li ul {
            padding: 0px 0px 0px 8px;
        }
        .ant-tree li {
            padding: 2px 0;
        }
        .ant-tree-title {
            font-size: 12px;
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

.anticon {
    transform: translate(-0.5px, -3px);
}
</style>
