import { reactive, ref, Ref } from "vue";
import { FileNode, flatFiles, fs, path, validFileContent } from "../file/File";
import { md } from "node-forge";

export class Project {
    path: string;
    title: string = "未命名";
    node: FileNode;
    /** 打开的文件 */
    static opened: Ref<FileNode[]> = ref([]);
    /** 重命名中的文件 */
    static renamingFilePath: Ref<string> = ref("");

    constructor(title: string, path: string, node?: FileNode) {
        if (fs.statSync(path).isDirectory() === false) {
            throw Error("项目路径应该为文件夹路径！");
        }
        this.title = title;
        this.path = path;
        this.node = reactive(node || Project.createFileNode(path));
        /** 深层监听文件，如果文件有改变则更新 */
        this.watchDirectory(this.node);
    }

    /** 创建文件节点 */
    static createFileNode(filePath: string): FileNode {
        const stat = fs.statSync(filePath);
        let isDirectory = stat.isDirectory();
        let children;
        let content;
        let icon;
        if (isDirectory) {
            icon = "dir";
            children = fs
                .readdirSync(filePath)
                .map((childFilePath) => this.createFileNode(path.resolve(filePath, childFilePath)))
                .filter((f) => !!f)
                /** 文件夹置顶 */
                .sort((a, b) => (a.stat?.isDirectory ? -1 : 1));
            content = "";
        } else {
            icon = "file";
            content = fs.readFileSync(filePath).toString();
        }

        let parent = path.dirname(filePath);
        console.log(filePath);

        const result = validFileContent(content);
        let options;
        if (typeof result === "string") {
            options = JSON.parse(result);
        }

        return reactive({
            title: path.basename(filePath),
            uid: options?.uid,
            content,
            slots: {
                icon,
            },
            stat: {
                isDirectory,
                createTime: stat.birthtimeMs,
                modifyTime: stat.ctimeMs,
                expand: isDirectory ? true : false,
                show: false,
                opened: false,
                running: false,
            },
            parent,
            path: filePath,
            children,
        });
    }

    /** 监听项目，如果发生变化。则重新渲染子目录 */
    watchDirectory(dir: FileNode) {
        fs.watch(dir.path, { recursive: true }, (e, f) => {
            Object.assign(this.node, Project.createFileNode(dir.path));
        });
    }

    public static create(title: string, path: string, node?: FileNode) {
        return new Project(title, path, node);
    }
}
