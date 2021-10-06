
import { reactive, watch } from "vue";
import { store } from "@/utils/store";
import { Setting } from "app/types";



const localSetting = store.get("setting");


export const setting = reactive<Setting>(localSetting);


watch(setting, () => {
    console.log("setting change", setting);

    store.set("setting", setting);
});