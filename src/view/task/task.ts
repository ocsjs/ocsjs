import { Remote } from "@/utils/remote";
import { config } from "@/utils/store";
import { BaseTask, User } from "app/types";
import { Course } from "app/types/script/course";

// import { Task } from "app/lib/types/index";
import { reactive, ref } from "vue";

export interface CourseTask {
    target: BaseTask<any>;
    course: Course;
    user: User;
}

export const tasks = reactive<CourseTask[]>([]);

export function TaskToList(task: BaseTask<any>) {
    let list: BaseTask<any>[] = [];
    while (task) {
        if (task.children) {
            list.push(task.children);
            task = task.children;
        } else {
            break;
        }
    }
    return list;
}

export function TaskUpdater({
    baseTasks,
    finish,
    process,
    error,
    message,
}: {
    baseTasks?: BaseTask<any>[];
    finish?: (task: CourseTask, value: any) => void;
    process?: (task: CourseTask, value: any) => void;
    error?: (task: CourseTask, value: any) => void;
    message?: (task: CourseTask, value: any) => void;
}) {
    (baseTasks || tasks).forEach((task: any) => {
        const target = Remote.task(task.id);
        target.process((e: any, value: any) => {
            task.msg = value;
            task.status = "process";
            process?.(task, value);
            console.log("process",task.name);
        });
        target.finish((e: any, value: any) => {
            task.status = "finish";
            finish?.(task, value);
            console.log("finish",task.name);
        });
        target.error((e: any, value: any) => {
            error?.(task, value);
            task.msg = value;
            task.status = "error";
            console.log("error",task.name);
        });
        target.message((e: any, value: any) => {
            message?.(task, value);
            task.msg = value;
            task.status = "error";
            console.log("message",task.name);
        });
    });
}

export function AddCourseTask(ct: CourseTask) {
    tasks.push(ct);
    const ts = TaskToList(ct.target);
    TaskUpdater({
        baseTasks: ts,
    });
}
