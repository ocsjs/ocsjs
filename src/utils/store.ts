import { toRaw } from "@vue/reactivity";
import { StoreSchema } from "app/types";

import { reactive, watch } from "vue";

const Store = require("electron-store");

const store = new Store();

/**
 * 本地config配置
 */
export const config: StoreSchema = reactive<StoreSchema>(store.store);

watch(config, () => {
    console.log("config change", config);
    store.store = toRaw(config);
});
