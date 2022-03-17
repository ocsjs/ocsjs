import { remote } from "./../../utils/remote";
import { MenuItem } from "../menus";
import { createFile, detail, FileNode, fs, mkdir, validFileName } from "./File";
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

    const baseMenus: MenuItem[] = [
        {
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
                Project.opened.value = Project.opened.value.filter((f) => f.path !== file.path);
            },
        },
        {
            title: "重命名",
            icon: "icon-redo",
            onClick() {
                Project.renamingFilePath.value = file.path;
            },
        },
        {
            title: "属性",
            icon: "icon-unorderedlist",
            onClick() {
                detail(file);
            },
        },
    ];

    return {
        dirMenus,
        baseMenus,
    };
}
