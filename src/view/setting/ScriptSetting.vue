<template>
    <div>
        <Card :bordered="false" color="blue" title="启动设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="浏览器路径">
                        <div class="space-10 flex ai-center">
                            <span
                                class="path"
                                @click="
                                    script.launch.binaryPath &&
                                        shell.openPath(script.launch.binaryPath)
                                "
                                >{{ script.launch.binaryPath || "未设置" }}
                            </span>
                            <FolderTwoTone @click="setBinaryPath()" />
                        </div>
                        <a-popover
                            placement="rightTop"
                            content="软件会自动检测您的谷歌浏览器路径，当路径未设置，或者你需要设置其他浏览器进行脚本操作，你可以点击蓝色的图片进行浏览器的路径设置"
                        >
                            <QuestionCircleOutlined />
                        </a-popover>
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>
        <Card :bordered="false" color="blue" title="脚本设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="功能启用">
                        <a-checkbox v-model:checked="script.script.video"
                            >自动播放视频</a-checkbox
                        >
                        <a-checkbox v-model:checked="script.script.video"
                            >自动答题</a-checkbox
                        >
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>

        <Card :bordered="false" color="blue" title="查题设置">
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="查题码">
                        <span class="space-10 ai-center">
                            <span>
                                <a-input
                                    type="text"
                                    size="small"
                                    style="width: 300px"
                                    v-model:value="script.account.queryToken"
                                    @blur="checkToken"
                                />
                            </span>
                            <a-popover
                                placement="rightTop"
                                content="必须配置查题码才能使用自动答题"
                            >
                                <QuestionCircleOutlined />
                            </a-popover>
                        </span>
                    </a-descriptions-item>

                    <template v-if="loading">
                        <span class="space-10">
                            <span>正在加载查题信息</span>
                            <LoadingOutlined />
                        </span>
                    </template>
                    <template v-else-if="tokenInfo.msg">
                        <a-descriptions-item label="提示">
                            <a-alert
                                show-icon
                                :message="tokenInfo.msg"
                                type="error"
                                style="height: 24px"
                            />
                        </a-descriptions-item>
                    </template>
                    <template v-else>
                        <a-descriptions-item label="剩余次数">
                            {{ tokenInfo.query_times }}
                        </a-descriptions-item>
                        <a-descriptions-item label="成功次数">
                            {{ tokenInfo.success_times }}
                        </a-descriptions-item>
                        <a-descriptions-item label="总查询次数">
                            {{ tokenInfo.all_times }}
                        </a-descriptions-item>
                    </template>
                </a-descriptions>
            </template>
        </Card>

        <Card :bordered="false" color="blue">
            <template #title>
                <span class="space-10">
                    <span>图形验证码破解(OCR)设置</span>
                    <a-popover
                        placement="rightTop"
                        content="当脚本遇到验证码的时候必须设置，否则需手动输入验证码验证"
                    >
                        <QuestionCircleOutlined />
                    </a-popover>
                </span>
            </template>
            <template #body>
                <a-descriptions :column="1" :labelStyle="{ fontWeight: 'bold' }">
                    <a-descriptions-item label="账号">
                        <span class="space-10">
                            <a-input
                                v-model:value="script.account.ocr.username"
                                type="text"
                                size="small"
                                style="width: 200px"
                            />
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="密码">
                        <span class="space-10">
                            <a-input-password
                                v-model:value="script.account.ocr.password"
                                size="small"
                                style="width: 200px"
                            />
                        </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="账号注册">
                        <a href="http://www.ttshitu.com/login.html"
                            >http://www.ttshitu.com/login.html</a
                        >
                    </a-descriptions-item>
                </a-descriptions>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { setting } from "./setting";
import { Remote } from "@/utils/remote";
import { AxiosGet } from "@/utils/request";
import { message } from "ant-design-vue";
import { ref, onMounted } from "vue";

const { shell } = require("electron");
const { script } = setting;

// 加载状态
const loading = ref(true);

// 查题剩余次数
let tokenInfo = ref({
    all_times: 0,
    query_times: 0,
    success_times: 0,
    msg: "",
});

onMounted(() => {
    checkToken();
});
function checkToken() {
    loading.value = true;
    AxiosGet({ url: "http://wk.enncy.cn/query/chatiId/" + script.account.queryToken })
        .then((res: any) => {
            if (res.data.code === 1) {
                tokenInfo.value = res.data.data;
            } else {
                tokenInfo.value.msg = "查题码无效，请重新填写";
            }
            loading.value = false;
        })
        .catch((err) => {
            message.error("获取查题次数失败");
        });
}

// 设置路径
function setBinaryPath() {
    script.launch.binaryPath = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openFile"],
            multiSelections: false,
            defaultPath: script.launch.binaryPath,
        })
        .pop();
}
</script>

<style scope lang="less"></style>
