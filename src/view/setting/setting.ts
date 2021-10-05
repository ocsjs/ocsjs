import { Remote } from "@/utils/remote";
import { ref, watch } from "vue";
import store from "@/utils/store";
import { SystemSetting } from "app/types";


export const systemSetting = ref<SystemSetting>({
    win: {
        isAlwaysOnTop: Remote.win.call("isAlwaysOnTop"),
    },
    path: {
        userData: Remote.app.call("getPath", "userData"),
        logs: Remote.app.call("getPath", "logs"),
    },
});

watch(systemSetting.value, () => {
    store.set("setting", systemSetting.value);
});