import { Remote } from "@/utils/remote";
import { config } from "@/utils/store";
import { Task } from "app/electron/task";
import { BaseTask, User } from "app/types";
import { Course } from "app/types/script/course";

// import { Task } from "app/lib/types/index";
import { reactive, ref } from "vue";

export interface CourseTask {
    target: Task;
    course: Course;
    user: User;
}

export const tasks = ref<CourseTask[]>([]);

export function TaskToList(task: Task) {
    let list: Task[] = [];
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

export function AddCourseTask(ct: CourseTask) {
    tasks.value.push(ct);
    for (const t of TaskToList(ct.target)) {
        ListeningTaskChange(t, {});
    }
}

export function ListeningTaskChange(
    task: Task,
    {
        finish,
        process,
        error,
        warn,
    }: {
        finish?: (task: Task, value: any) => void;
        process?: (task: Task, value: any) => void;
        error?: (task: Task, value: any) => void;
        warn?: (task: Task, value: any) => void;
    }
) {
    if (task.id) {
        const target = Remote.task(task.id);
        target.process((e: any, value: any) => {
            task.msg = value;
            task.status = "process";
            process?.(task, value);
            console.log("process", task.name, value);
        });
        target.finish((e: any, value: any) => {
            task.status = "finish";
            finish?.(task, value);
            console.log("finish", task.name);
        });
        target.error((e: any, value: any) => {
            error?.(task, value);
            task.msg = value;
            task.status = "error";
            console.log("error", task.name);
        });
        target.warn((e: any, value: any) => {
            warn?.(task, value);
            task.msg = value;
            task.status = "warn";
            console.log("warn", task.name);
        });
    }
}
