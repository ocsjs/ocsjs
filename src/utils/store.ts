import { toRaw } from '@vue/reactivity';
import { StoreSchema } from 'app/types';
 
import { reactive, watch } from 'vue';

const Store = require('electron-store');


const store = new Store()

export const config: StoreSchema = reactive<StoreSchema>(store.store);


watch(config, () => {
    console.log("config change", config);
    config.setting
    store.store = toRaw(config)
});