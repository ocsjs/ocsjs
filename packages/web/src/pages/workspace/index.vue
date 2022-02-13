<template>
    <div class="h-100">
        <ContextMenus>
            <div id="workspace" class="text-center h-100">
                <div id="nav" class="d-flex bg-white shadow-sm rounded p-2 mb-3">
                    <!-- 面包屑 -->
                    <div id="breadcrumb" class="w-100 d-flex align-items-center">
                        <a-breadcrumb class="bread-crumb ps-3 pe-3 text-start">
                            <template
                                v-for="(item, index) of current
                                    .getAllParent()
                                    .concat(current)"
                                :key="index"
                            >
                                <a-breadcrumb-item
                                    class="pointer"
                                    :title="item.name"
                                    @click="item.click($event)"
                                >
                                    {{ StringUtils.maximum(item.name, 20) }}
                                </a-breadcrumb-item>
                            </template>
                        </a-breadcrumb>
                    </div>

                    <div id="actions">
                        <!-- 搜索文件夹 -->
                        <a-button shape="circle" title="搜索文件夹">
                            <template #icon><Icon type="icon-search" /></template>
                        </a-button>
                    </div>
                </div>

                <template v-if="current.children.length === 0">
                    <div
                        class="text-center text-secondary p-3 bg-white shadow-sm rounded w-100 mb-3"
                    >
                        右键创建文件夹
                    </div>
                </template>
                <template v-else>
                    <div class="dirs bg-white shadow-sm rounded p-2 mb-3">
                        <template v-for="(item, index) in current.children" :key="index">
                            <div class="p-2">
                                <DirectoryVue :data="item" />
                            </div>
                        </template>
                    </div>
                </template>

                <template v-if="current.tasks.length === 0">
                    <div
                        class="text-center text-secondary p-3 bg-white shadow-sm rounded w-100 mb-3"
                    >
                        右键创建任务
                    </div>
                </template>
                <template v-else>
                    <div class="dirs bg-white shadow-sm rounded p-2 mb-3">
                        <template v-for="(item, index) in current.tasks" :key="index">
                            <div class="p-2">{{ item.name }}</div>
                        </template>
                    </div>
                </template>
            </div>

            <template #overlay>
                <Menus :data="menus" />
            </template>
        </ContextMenus>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, Ref, ref } from "vue";

import { MenuItem } from "../../components/menus";
import Menus from "../../components/menus/Menus.vue";
import { StringUtils } from "../../utils/string";
import { Directory, current } from "../../components/workspace/directory";
import ContextMenus from "../../components/menus/ContextMenus.vue";
import DirectoryVue from "../../components/workspace/Directory.vue";

const selectedDirs = computed(() => current.value.getAllSelected());

const menus: ComputedRef<MenuItem[]> = computed(() => {
    let menus: MenuItem[] = [
        {
            title: "新建文件夹",
            icon: "icon-folder",
            onClick() {
                current.value.add(Directory.create({ parent: current.value }));
            },
        },
    ];
    if(current.value.tasks){

    }

    if (selectedDirs.value.length > 0) {
        menus.push({
            title: "删除文件夹",
            icon: "icon-delete",
            onClick() {
                current.value.remove(...selectedDirs.value);
            },
        });
    }

    if (selectedDirs.value.length === 1) {
        menus.push({
            title: "属性",
            icon: "icon-detail",
            onClick() {
                selectedDirs.value[0].showDetail = true;
            },
        });
    }

    menus.push({
        divide: true,
        title: "新建任务",
        icon: "icon-play-circle",
        children: [
            {
                title: "超星刷课",
            },
            {
                title: "超星作业",
            },
            {
                title: "超星考试",
            },
        ],
    });

    return menus;
});

/**
 * 点击页面，取消选中
 */
document.addEventListener("click", (event) => {
    if (!event.ctrlKey) {
        current.value.unselectedChildren();
    }
});
</script>

<style scope lang="less">
#workspace {
    padding: 12px;
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
