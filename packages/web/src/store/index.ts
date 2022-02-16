import { reactive } from "vue";
import Store from "electron-store";

export const store = reactive({
    directories: [],
    tasks: [],
});
