import { reactive } from "vue";
import { File } from "./File";

export interface FileStore {
    current?: File;
}

export const fileStore = reactive<FileStore>({});
