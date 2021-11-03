import { toRaw } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { StoreSchema } from "app/types";

import { onMounted, reactive, ref, watch } from "vue";
import { Remote } from "./remote";
import { AxiosGet, NetWorkCheck } from "./request";

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

// 设置路径
export function setBinaryPath() {
    config.setting.script.launch.binaryPath = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openFile"],
            multiSelections: false,
            defaultPath: config.setting.script.launch.binaryPath,
        })
        .pop();
}

// 查题信息请求中
export const CheckLoading = ref(false)
// 查题剩余次数
export const TokenInfo = ref({
    code:0,
    all_times: 0,
    query_times: 0,
    success_times: 0,
    msg: "",
});

 


export async  function checkToken(queryToken:string) {
 
    if (queryToken === "") {
        return false;
    }
    if (queryToken && queryToken.length === 32) {
        if (await NetWorkCheck()) {
            CheckLoading.value = true;
            AxiosGet({
                url: "http://wk.enncy.cn/query/chatiId/" + queryToken,
            })
                .then((res: any) => {
                    if (res.data.code === 1) {
                        TokenInfo.value = res.data.data;
                        TokenInfo.value.code = res.data.code
                    } else {
                        message.error("查题码无效，请重新填写");
                        TokenInfo.value.msg = "查题码无效，请重新填写";
                    }
                    CheckLoading.value = false;
                })
                .catch((err: any) => {
                    console.error(err);
                    message.error("获取查题次数失败,可能为网络错误！");
                    CheckLoading.value = false;
                });
        } else {
            CheckLoading.value = false;
        }
    } else {
        message.warn("请输入正确的查题码，一般为32个长度的字符串！");
        CheckLoading.value = false;
    }
}