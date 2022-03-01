const fs = require("fs") as typeof import("fs");
const path = require("path") as typeof import("path");

export { fs, path };

/** 文件状态 */
export interface FileStats {
    createTime: number;
    modifyTime: number;
    /** 是否为文件夹 */
    isDirectory: boolean;
    /** 已被删除 */
    removed: boolean;
    /** 是否选中 */
    selected: boolean;
    /** 重命名中 */
    renaming: boolean;
}

/**
 * 文件对象
 */
export interface File {
    /** 文件名 */
    title: string;
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
    children?: File[];
}

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
 * 创建文件(夹)对象，到文件树
 *
 * @param filePath 文件(夹)路径
 * @param title 覆盖文件显示名
 * @returns
 */
export function createFileNode(rootPath: string, filePath?: string): File {
    filePath = filePath || rootPath;
    const stat = fs.statSync(filePath);
    let children;
    let content = "";
    let icon;
    if (stat.isDirectory()) {
        icon = "dir";
        children = fs
            .readdirSync(filePath)
            .map((childFilePath) => createFileNode(rootPath, path.resolve(filePath || rootPath, childFilePath)))
            .filter((f) => !!f);
    } else {
        icon = "file";
        content = fs.readFileSync(filePath).toString();
    }

    let title = path.basename(filePath);
    let p = path.dirname(filePath);
    return {
        title,
        key: filePath
            .replace(rootPath + "\\", "")
            .split("\\")
            .join("-"),
        slots: {
            icon,
        },
        stat: {
            isDirectory: stat.isDirectory(),
            createTime: stat.birthtimeMs,
            modifyTime: stat.ctimeMs,
            removed: false,
            selected: false,
            renaming: true,
        },
        content,
        parent: p,
        path: filePath,
        children,
    };
}

/**
 * 提供文件遍历操作
 * @param files 文件源
 * @param handlers 处理器
 */
export function loopFiles(files: File[], ...handlers: { (files: File[]): File[] }[]) {
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
