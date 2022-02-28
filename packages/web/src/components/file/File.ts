import { Stats } from "fs";
import { store } from "../../store";

const fs = require("fs") as typeof import("fs");
const path = require("path") as typeof import("path");

export { fs, path };

export interface File {
    title: string;
    key: string;
    slots: {
        icon: string;
    };

    stat?: FileStats;
    path?: string;
    content?: string;
    children?: File[];
}

export interface FileStats {
    isDirectory: boolean;
    createTime: number;
    modifyTime: number;
}

/**
 * 获取可用文件名
 * @param name 名字模板, 例如 新建文件夹($count)
 */
export function validFileName(name: string) {
    let count = 0;
    let p = "";
    while (true) {
        p = path.resolve(store.workspace, name.replace("($count)", count++ === 0 ? "" : `(${count})`));
        if (!fs.existsSync(p)) {
            break;
        }
    }
    return p;
}

/**
 * 创建文件(夹)对象
 *
 * @param filePath 文件(夹)路径
 * @param title 覆盖文件显示名
 * @returns
 */
export function createFile(filePath: string, title?: string): File {
    const stat = fs.statSync(filePath);
    let children;
    let content;
    let icon;
    if (stat.isDirectory()) {
        icon = "dir";
        children = fs
            .readdirSync(filePath)
            .map((childFilePath) => createFile(path.resolve(filePath, childFilePath)))
            .filter((f) => !!f);
    } else {
        icon = "file";
        content = fs.readFileSync(filePath).toString();
    }

    title = title || path.basename(filePath);
    let p = path.dirname(filePath);
    return {
        title,
        key: filePath,
        slots: {
            icon,
        },
        stat: {
            isDirectory: stat.isDirectory(),
            createTime: stat.birthtimeMs,
            modifyTime: stat.ctimeMs,
        },
        content,
        path: p,
        children,
    };
}
