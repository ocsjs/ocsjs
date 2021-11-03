<template>
    <div>
        <a-steps :current="current">
            <a-step v-for="item in steps" :key="item.title" :title="item.title" />
        </a-steps>
        <div class="steps-content">
            <template v-if="current === 0">
                <div class="padding-24">
                    <MdRender raw>
                        <pre>
                            ### 此软件会使用浏览器控制脚本进行刷课操作     
                                
                            > 支持`谷歌`,`火狐`,`Microsoft Edge`,等带有`chrome`内核的主流浏览器
                            > 如果您不知道浏览器的路径在哪，请按照如下操作查看: 
     

                            `谷歌`: 打开谷歌浏览器,输入链接 `chrome://version` , 找到 `可执行文件路径` 这一栏复制粘贴即可        
                              

                            `火狐`: 打开火狐浏览器,输入链接 `about:support`  , 找到 `应用程序二进制文件` 这一栏复制粘贴即可         
                                

                            `Microsoft Edge`: 打开谷歌浏览器，输入链接 `edge://version/` , 找到 `可执行文件路径` 这一栏复制粘贴即可       
                        </pre>
                    </MdRender>
                    <a-input class="path" v-model:value="launch.binaryPath">
                        <template #suffix>
                            <CheckCircleTwoTone
                                v-if="validPath(launch.binaryPath)"
                                twoToneColor="#52c41a"
                            />

                            <CloseCircleTwoTone v-else two-tone-color="#aa8e90" />
                        </template>
                    </a-input>

                    <div class="margin-top-18 flex jc-flex-end space-10">
                        <a-button
                            type="primary"
                            :disabled="!validPath(launch.binaryPath)"
                            @click="next"
                        >
                            下一步
                        </a-button>
                    </div>
                </div>
            </template>
            <template v-if="current === 1">
                <div class="padding-24">
                    <MdRender raw>
                        <pre>
                            ### 查题码用于脚本自动答题
                            关注微信小程序 `网课答` 即可获取查题码
                        </pre>
                    </MdRender>
                    <a-input
                        class="path"
                        v-model:value="account.queryToken"
                        @change="debouncedClick"
                    >
                        <template #suffix>
                            <CheckCircleTwoTone
                                v-if="TokenInfo.code === 1"
                                twoToneColor="#52c41a"
                            />

                            <CloseCircleTwoTone v-else two-tone-color="#aa8e90" />
                        </template>
                    </a-input>
                    <div class="margin-top-18 flex">
                        <a-button> 我暂时不想用这个功能 </a-button>
                        <div class="flex jc-flex-end">
                            <a-button
                                type="primary"
                                :disabled="TokenInfo.code === 0"
                                @click="emit('done')"
                            >
                                完成
                            </a-button>
                        </div>
                    </div>
                </div>
            </template>
            <!-- <template v-if="current === 2">
                <div></div>
            </template> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { checkToken, config,  TokenInfo } from "@/utils/store";
import { ref } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { debounce } from "lodash";
import { MdRender } from "mark-ui";
import { onUnmounted } from "vue";
const { shell } = require("electron");
const { launch, account } = config.setting.script;
const fs = require("fs");

function validPath(path: string) {
    return fs.existsSync(path);
}

const emit = defineEmits<{
    (e: "done"): void;
}>();

const current = ref(0);
const steps = ref([
    {
        id: 0,
        title: "设置浏览器路径",
    },
    {
        id: 1,
        title: "填写查题码",
    },
]);
// 如果已完成，则跳到第二步
if (config?.setting?.script?.launch?.binaryPath) {
    current.value = 1;
}

// loadsh 防抖
const debouncedClick = debounce(() => checkToken(account.queryToken), 500);
onUnmounted(() => {
    // 移除组件时，取消定时器
    debouncedClick.cancel();
});
function next() {
    current.value++;
}
function prev() {
    current.value--;
}
</script>

<style scope lang="less"></style>
