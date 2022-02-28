<template>
    <Menus :data="menus"></Menus>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, Ref } from "vue";
import { MenuItem } from "../menus";

import { FileStats } from "./File";
import Menus from "../menus/Menus.vue";
interface FileMenuProps {
    stat: FileStats;
}
const props = defineProps<FileMenuProps>();
const { stat } = toRefs(props);

const dirMenus: MenuItem[] = [
    {
        title: "新建文件夹",
        icon: "icon-wenjianjia",
    },
    {
        title: "新建OCS文件",
        icon: "icon-file-text",
    },
];

const fileMenus: MenuItem[] = [
    {
        title: "运行",
        icon: "icon-play-circle",
    },
];

const baseMenus: MenuItem[] = [
    {
        divide: true,
        title: "打开文件位置",
        icon: "icon-location",
    },
    {
        title: "删除",
        icon: "icon-delete",
    },
    {
        title: "重命名",
        icon: "icon-redo",
    },
    {
        title: "属性",
        icon: "icon-unorderedlist",
    },
];

const menus: Ref<MenuItem[]> = ref(baseMenus);

if (stat.value.isDirectory) {
    let mes = menus.value;
    mes[0].divide = true;
    menus.value = dirMenus.concat(...mes);
} else {
    let mes = menus.value;
    mes[0].divide = true;
    menus.value = fileMenus.concat(...mes);
}
</script>

<style scope lang="less"></style>
