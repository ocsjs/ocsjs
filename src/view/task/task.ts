import { config } from "@/utils/store";

// import { Task } from "app/lib/types/index";
import { reactive } from "vue";

export const tasks = reactive<any[]>(config.task || []);
