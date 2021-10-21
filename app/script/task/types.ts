import { ScriptOptions } from "vm";
import { Task } from "../../electron/task";
import { User } from "../../types";
import { Course } from "../../types/script/course";

export const CourseListTasks: { (script: ScriptOptions): Task<Course[]> }[] = [];

export function CourseListTask(platform: keyof User["loginInfo"]) {
    return (target: any) => {
        Reflect.defineMetadata("platform", platform, target);
        CourseListTasks.push(target);
    };
}

export function getCourseList(platform: keyof User["loginInfo"], script: ScriptOptions) {
    for (const task of CourseListTasks) {
        if (Reflect.getMetadata("platform", task) === platform) {
            return task(script);
        }
    }
}
