import { Modal } from "ant-design-vue";
import { h } from "vue";
import { config } from "../../config";
import Description from "../Description.vue";

const fs = require("fs") as typeof import("fs");
const fsExtra = require("fs-extra") as typeof import("fs-extra");
const path = require("path") as typeof import("path");

export { fs, fsExtra, path };

/** 文件节点状态 */
export interface FileStats {
    createTime: number;
    modifyTime: number;
    /** 是否为文件夹 */
    isDirectory: boolean;
    /** 是否显示 */
    show: boolean;

    /** 是否正在打开编辑 */
    opened: boolean;
    /** 是否运行中 */
    running: boolean;
}

/**
 * 文件节点
 */
export interface FileNode {
    /** 文件名 */
    title: string;
    uid: string;
    key: string;
    slots: {
        icon: string;
    };
    /** 文件信息 */
    stat: FileStats;
    /** 文件路径 */
    path: string;
    /** 父目录 */
    parent: string;
    /** 文件内容 */
    content: string;
    /** 子文件 */
    children?: FileNode[];
}

export class FileNode {}

/**
 * 获取可用文件名
 * @param rootPath 父目录
 * @param name 名字模板, 例如 新建文件夹($count) , $count - 序号占位符
 */
export function validFileName(rootPath: string, name: string) {
    if (!name.includes("$count")) throw "名字模板未带有序号占位符 - $count";
    let count = 0;
    let p = "";
    while (true) {
        p = path.resolve(rootPath, name.replace("($count)", count++ === 0 ? "" : `(${count})`));
        if (!fs.existsSync(p)) {
            break;
        }
    }
    return p;
}

/**
 * 提供文件遍历操作
 * @param files 文件源
 * @param handlers 处理器
 */
export function loopFiles(files: FileNode[], ...handlers: { (files: FileNode[]): FileNode[] }[]) {
    for (const handler of handlers) {
        files = handler(files);
    }

    for (const file of files) {
        if (file.children) {
            for (const handler of handlers) {
                file.children = handler(file.children);
            }
            loopFiles(file.children, ...handlers);
        }
    }

    return files;
}

/**
 * 扁平化目录结构
 * @param files 文件源
 */
export function flatFiles(files: FileNode[]): FileNode[] {
    let _files: FileNode[] = Array.from(JSON.parse(JSON.stringify(files)));
    let flat = [] as FileNode[];
    while (_files.length !== 0) {
        const file = _files.shift();
        if (file) {
            if (file.children) {
                _files = _files.concat(file.children);
            }
            flat.push(file);
        }
    }

    return flat;
}

export function createFile(parent: FileNode) {
    const newFilePath = validFileName(parent.path, "新建OCS文件($count).ocs");
    fs.writeFileSync(newFilePath, config.ocsFileTemplate);
}
export function mkdir(parent: FileNode) {
    const newDirPath = validFileName(parent.path, "新建文件夹($count)");
    fs.mkdirSync(newDirPath);
}

export function detail(file: FileNode) {
    Modal.info({
        title: () => "文件属性",
        mask: false,
        closable: true,
        maskClosable: true,
        okText: "确定",
        width: 500,
        icon: undefined,
        content: () =>
            h("div", {}, [
                desc("uid", file.uid),
                desc("文件名", file.title),
                desc("位置", file.path),
                desc("创建时间", new Date(file.stat.createTime).toLocaleString()),
                desc("最近修改", new Date(file.stat.modifyTime).toLocaleString()),
            ]),
    });

    function desc(label: string, desc: string) {
        return h(Description, { label, desc });
    }
}
