import { store } from "@/utils/store";
import { watch } from '@vue/runtime-core';
import { toRaw } from '@vue/reactivity';
import { Task } from "app/types";
import { reactive } from "vue";

const ts = store.get("tasks");
if (!ts) {
    store.set("tasks", []);
}

export const tasks = reactive<Task[]>(ts || []);

watch(tasks, () => {
    console.log(toRaw(tasks));
    store.set("tasks", toRaw(tasks));
});