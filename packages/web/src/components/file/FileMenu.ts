import { remote } from "./../../utils/remote";
import { MenuItem } from "../menus";
import { createFile, detail, FileNode, fs, mkdir, validFileName } from "./File";
import { message, Modal } from "ant-design-vue";
import { h } from "vue";
import { Project } from "../project";
const { shell, clipboard } = require("electron");

export function createFileMenus(file: FileNode) {
    const dirMenus: MenuItem[] = [
        {
            title: "新建文件夹",
            icon: "icon-wenjianjia",
            onClick() {
                mkdir(file);
            },
        },
        {
            title: "新建OCS文件",
            icon: "icon-file-text",
            onClick() {
                createFile(file);
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
                shell.showItemInFolder(file.path);
            },
        },
        {
            title: "复制文件路径",
            icon: "icon-file-copy",
            onClick() {
                clipboard.writeText(file.path);
            },
        },
        {
            title: "删除",
            icon: "icon-delete",
            onClick() {
                remote.methods.call("trash", file.path);
            },
        },
        {
            title: "重命名",
            icon: "icon-redo",
            onClick() {
                Project.renamingFile.value = file;
            },
        },
        {
            title: "属性",
            icon: "icon-unorderedlist",
            onClick() {
                detail(file)
            },
        },
    ];

    return {
        dirMenus,
        fileMenus,
        baseMenus,
    };
}
