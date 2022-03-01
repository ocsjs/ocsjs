<template>
    <Menus :data="menus"></Menus>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, Ref } from "vue";
import { MenuItem } from "../menus";

import { createFileNode, File, fs, path, validFileName } from "./File";
import Menus from "../menus/Menus.vue";
const { shell } = require("electron");
interface FileMenuProps {
    file: File;
    rootPath: string;
}
const props = defineProps<FileMenuProps>();
const emits = defineEmits<{
    (e: "update:file", file: File): void;
    (e: "fileChange", file: File): void;
}>();
const { file, rootPath } = toRefs(props);

const dirMenus: MenuItem[] = [
    {
        title: "新建文件夹",
        icon: "icon-wenjianjia",
        onClick() {
            createFile("新建文件夹($count)", (newFilePath) => {
                fs.mkdirSync(newFilePath);
            });
        },
    },
    {
        title: "新建OCS文件",
        icon: "icon-file-text",
        onClick() {
            createFile("新建OCS文件($count).ocs", (newFilePath) => {
                fs.writeFileSync(newFilePath, "{}");
            });
        },
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
        onClick() {
            shell.showItemInFolder(file.value.path);
        },
    },
    {
        title: "删除",
        icon: "icon-delete",
        onClick() {
            fs.unlinkSync(file.value.path);
            file.value.stat.removed = true;
            emits("update:file", file.value);
            emits("fileChange", file.value);
        },
    },
    {
        title: "重命名",
        icon: "icon-redo",
        onClick() {
            file.value.stat.renaming = true;
            emits("update:file", file.value);
            emits("fileChange", file.value);
        },
    },
    {
        title: "属性",
        icon: "icon-unorderedlist",
    },
];

const menus: Ref<MenuItem[]> = ref(baseMenus);

if (file.value.stat?.isDirectory) {
    let mes = menus.value;
    mes[0].divide = true;
    menus.value = dirMenus.concat(...mes);
} else {
    let mes = menus.value;
    mes[0].divide = true;
    menus.value = fileMenus.concat(...mes);
}

/**
 * 创建文件（夹）到本地，并且添加到文件树中
 * @param newFileNameFormate 文件格式化字符串 {@link validFileName}
 * @param handler 文件路径结果处理
 */
function createFile(newFileNameFormate: string, handler: (newFilePath: string) => void) {
    let _file = file.value;
    let newFilePath = validFileName(_file.path, newFileNameFormate);
    handler(newFilePath);
    _file.children = _file.children || [];
    _file.children.push(createFileNode(rootPath.value, newFilePath));
    emits("update:file", _file);
    emits("fileChange", _file);
}
</script>

<style scope lang="less"></style>
