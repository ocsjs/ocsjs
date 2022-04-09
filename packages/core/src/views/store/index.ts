import { reactive } from "vue";
import { DefineScript } from "../../core/define.script";

export const store = reactive<{
    scripts: DefineScript[];
}>({
    scripts: [],
});
