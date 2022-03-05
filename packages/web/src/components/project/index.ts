import { reactive, ref, Ref } from "vue";
import { FileNode, fs, path } from "../file/File";
import { md } from "node-forge";

export class Project {
    path: string;
    title: string = "未命名";
    node: FileNode;
    static opened: Ref<FileNode[]> = ref([]);

    constructor(title: string, path: string, node?: FileNode) {
        if (fs.statSync(path).isDirectory() === false) {
            throw Error("项目路径应该为文件夹路径！");
        }
        this.title = title;
        this.path = path;
        this.node = node || Project.createFileNode(path);
        /** 深层监听文件，如果文件有改变则更新 */
        Project.watchDirectory(this.node);
    }

    static createFileNode(filePath: string): FileNode {
        const stat = fs.statSync(filePath);
        let isDirectory = stat.isDirectory();
        let children;
        let content = "";
        let icon;
        if (isDirectory) {
            icon = "dir";
            children = fs
                .readdirSync(filePath)
                .map((childFilePath) => this.createFileNode(path.resolve(filePath, childFilePath)))
                .filter((f) => !!f)
                /** 文件夹置顶 */
                .sort((a, b) => (a.stat?.isDirectory ? -1 : 1));
        } else {
            icon = "file";
            content = fs.readFileSync(filePath).toString();
        }

        let parent = path.dirname(filePath);
        let uid = md.md5.create().update(filePath).digest().toHex();
        return reactive({
            title: path.basename(filePath),
            key: filePath,
            uid,
            slots: {
                icon,
            },
            stat: {
                isDirectory,
                createTime: stat.birthtimeMs,
                modifyTime: stat.ctimeMs,
                expand: isDirectory ? true : false,
                selected: false,
                renaming: true,
                opened: false,
            },
            content,
            parent,
            path: filePath,
            children,
        });
    }

    static watchDirectory(dir: FileNode) {
        fs.watch(dir.path, (e, f) => {
            console.log(e, f);

            const newDir = this.createFileNode(dir.path);
            dir.children = newDir.children || [];

            if (fs.existsSync(path.join(dir.path, f)) && fs.statSync(path.join(dir.path, f)).isDirectory()) {
                this.watchDirectory(newDir);
            }
        });

        if (dir.children) {
            for (const file of dir.children) {
                if (file.stat.isDirectory) {
                    this.watchDirectory(file);
                }
            }
        }
    }

    public static create(title: string, path: string, node?: FileNode) {
        return new Project(title, path, node);
    }
}
