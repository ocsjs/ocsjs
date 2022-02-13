import { MenuItem } from "./../menus/index";
import EventEmitter from "events";
import { nextTick, reactive, Ref, ref } from "vue";

export interface DirectoryType {
    parent?: Directory;
    name: string;
    children: Directory[];
    tasks: Task[];
    createTime?: number;
}

/**
 * 文件夹
 */
export class Directory implements DirectoryType {
    parent?: Directory | undefined;
    name: string;
    children: Directory[];
    tasks: Task[];

    /** status */
    createTime: number;
    selected: boolean = false;
    editing: boolean = false;
    showDetail?: boolean = false;

    /**
     * 绑定元素
     */
    el?: HTMLElement;

    constructor(dir: DirectoryType) {
        this.parent = dir.parent;
        this.name = dir.name;
        this.children = dir.children;
        this.tasks = dir.tasks;
        this.createTime = dir.createTime || Date.now();
    }
    /**
     * 新增文件夹
     */
    add(dir: Directory) {
        dir = Directory.validName(dir);
        this.children.push(dir);
        dir.edit();
    }

    /**
     * 选中当前文件夹
     */
    select() {
        this.selected = !this.selected;
        return this;
    }

    /**
     * 编辑文件夹名
     */
    edit() {
        this.editing = true;

        nextTick(() => {
            this.el = document.querySelector(`[data-dir-name="${this.name}"]`) as HTMLElement;
            const input = this.el.querySelector(".dir-edit-input") as HTMLElement;
            if (input) {
                input.focus();
                input.onblur = () => {
                    this.editing = false;
                };
            }
        });

        return this;
    }

    /**
     * 点击文件夹
     */
    click(event: MouseEvent) {
        if (event.ctrlKey) {
            this.select();
        } else {
            this.into();
        }
    }

    /**
     * 删除文件夹
     */
    remove(...dirs: Directory[]) {
        for (const dir of dirs) {
            this.children = this.children.filter((d) => d.name !== dir.name);
        }
    }

    into() {
        current.value = this;
    }

    getAllSelected() {
        return this.children.filter((d) => d.selected);
    }

    unselectedChildren() {
        this.children.forEach((d) => (d.selected = false));
    }

    /**
     *
     * 获取全部的父文件夹，顺序为 大 -> 小
     */
    getAllParent() {
        let dir: Directory = this;
        let list = [];
        while (dir && dir.parent) {
            list.unshift(dir.parent);
            dir = dir.parent;
        }
        return list;
    }

    /**
     * 创建文件夹
     */
    static create(dir?: Partial<DirectoryType>): Directory {
        return reactive(
            new Directory({
                parent: dir?.parent,
                name: dir?.name || "",
                children: dir?.children || [],
                tasks: dir?.tasks || [],
            })
        );
    }

    /**
     * 检测文件夹名字是否重复
     *
     * 如果重复，改名并返回新的文件夹
     *
     */
    static validName(dir: Directory): Directory {
        dir.name = dir.name === "" ? "新建文件夹" : dir.name;
        let same = current.value.children.find((d) => d.name === dir.name);
        if (same) {
            /** 起始序号 */
            let num = 2;
            let reg = /\((\d*)\)/;

            /**
             * 如果重复的文件夹带有序号，则根据序号进行递增命名
             *
             */
            if (reg.test(same.name)) {
                let match = same.name.match(reg)?.[1];
                num = match ? parseInt(match) + 1 : num;
                dir.name = dir.name.replace(reg, `(${num})`);
            } else {
                dir.name = dir.name + `(${num})`;
            }

            /** 递归检测，直到没有重名为止 */
            return this.validName(dir);
        } else {
            return dir;
        }
    }

    toString() {
        return this as DirectoryType;
    }
}

/** 当前文件夹 */
export let current: Ref<Directory> = ref(
    Directory.create({
        name: "工作台",
        children: [],
        tasks: [],
    })
);
