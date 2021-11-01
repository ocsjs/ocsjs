<template>
    <div>
        <card title="启动设置">
            <item
                font-bold
                label="浏览器路径"
                description="软件会`自动检测`您的谷歌`浏览器路径`<br>当路径未设置，或者你需要设置`其他浏览器`进行脚本操作，你可以点击`左侧图标`进行浏览器的路径设置"
                md
            >
                <span
                    class="path"
                    @click="launch.binaryPath && shell.openPath(launch.binaryPath)"
                    >{{ launch.binaryPath || "未设置" }}
                </span>
                <template #after><FolderTwoTone @click="setBinaryPath()" /></template>
            </item>
        </card>

        <card title="脚本设置">
            <card color="gray" title="全局设置" size="small" :open-collapse="false">
                <item label="任务运行间隔时间">
                    <a-input-number
                        size="small"
                        v-model:value="script.taskPeriod"
                        :min="3"
                        :max="60"
                    >
                    </a-input-number>
                    <template #after>秒</template>
                </item>
            </card>
            <card
                color="gray"
                title="超星设置"
                size="small"
                :open-collapse="false"
                :collapse="false"
            >
                <item
                    label="队列模式"
                    description="`开启` 一个一个的执行任务<br>`关闭` 一个页面的全部任务一起执行"
                    md
                >
                    <a-switch v-model:checked="script.cx.queue" />
                </item>
                <item label="复习模式" md  description="`重新刷已经完成的章节`，可以手动点击指定的章节，脚本会自动下一章">
                    <a-switch v-model:checked="script.cx.review" />
                </item>
                <item label="自动播放音视频">
                    <a-switch v-model:checked="script.cx.media.enable" />
                </item>
                <template v-if="script.cx.media.enable">
                    <div class="margin-left-24">
                        <item label="静音">
                            <a-switch v-model:checked="script.cx.media.mute" />
                        </item>
                        <item label="倍速" description="`倍速可能会导致挂科`，观看时长后台可以看到，实际观看时间`不等于`播放时间！，如果课程严格请谨慎选择倍速，否则`后果自负`！" md>
                            <a-input-number
                                size="small"
                                v-model:value="script.cx.media.playbackRate"
                                :min="1"
                                :max="16"
                            ></a-input-number>
                        </item>
                    </div>
                </template>

                <item label="自动播放PPT">
                    <a-switch v-model:checked="script.cx.ppt" />
                </item>
                <item label="自动翻阅图书">
                    <a-switch v-model:checked="script.cx.book" />
                </item>
                <item label="自动做章节测验">
                    <a-switch v-model:checked="script.cx.qa.enable" />
                </item>
                <div v-if="script.cx.qa.enable" class="margin-left-24">
                    <item label="章节测验自动提交">
                        <a-switch v-model:checked="script.cx.qa.autoReport" />
                    </item>
                </div>

                <item label="自动做作业">
                    <a-switch v-model:checked="script.cx.work.enable" />
                </item>
                <div v-if="script.cx.work.enable" class="margin-left-24">
                    <item label="作业自动提交">
                        <a-switch
                            size="small"
                            v-model:checked="script.cx.work.autoReport"
                        />
                    </item>
                </div>

                <item label="自动考试">
                    <a-switch v-model:checked="script.cx.exam.enable" />
                </item>
                <div v-if="script.cx.exam.enable" class="margin-left-24">
                    <item label="考试自动提交">
                        <a-switch v-model:checked="script.cx.exam.autoReport" />
                    </item>
                </div>
            </card>
            <card color="gray" size="small" title="智慧树设置" :open-collapse="false">
                <item
                    label="自动暂停"
                    md
                    description="智慧树如需获取`平时分`，每天都会有`限制`的时长，如果`超出则不能累积平时分`，请根据需求进行配置"
                >
                    <a-input-number
                        size="small"
                        v-model:value="script.zhs.autoStop"
                        :defaultValue="0.5"
                        :min="0.5"
                        :max="24"
                        :step="0.5"
                        :formatter="(v:any)=>v+' 小时后'"
                    ></a-input-number>
                </item>

                <item label="自动播放视频">
                    <a-switch v-model:checked="script.zhs.video.enable" />
                </item>
                <div v-if="script.zhs.video.enable" class="margin-left-24">
                    <item label="静音">
                        <a-switch v-model:checked="script.zhs.video.mute" />
                    </item>
                    <item label="倍速" md description="智慧树只能1-1.5倍速，否则会导致`封号`！">
                        <a-input-number
                            size="small"
                            v-model:value="script.zhs.video.playbackRate"
                            :min="1"
                            :max="1.5"
                            :step="0.5"
                        ></a-input-number>
                    </item>
                </div>

                <item label="自动做章节测验">
                    <a-switch v-model:checked="script.zhs.qa.enable" />
                </item>
                <div v-if="script.zhs.qa.enable" class="margin-left-24">
                    <item label="章节测验自动提交">
                        <a-switch v-model:checked="script.zhs.qa.autoReport" />
                    </item>
                </div>

                <item label="自动做作业">
                    <a-switch v-model:checked="script.zhs.work.enable" />
                </item>

                <div v-if="script.zhs.work.enable" class="margin-left-24">
                    <item label="作业自动提交">
                        <a-switch
                            size="small"
                            v-model:checked="script.zhs.work.autoReport"
                        />
                    </item>
                </div>

                <item label="自动考试">
                    <a-switch v-model:checked="script.zhs.exam.enable" />
                </item>
                <div v-if="script.zhs.exam.enable" class="margin-left-24">
                    <item label="考试自动提交">
                        <a-switch v-model:checked="script.zhs.exam.autoReport" />
                    </item>
                </div>
            </card>
        </card>

        <card title="查题设置">
            <item description="必须配置查题码才能使用`自动答题`" label="查题码" md font-bold>
                <a-input
                    type="text"
                    size="small"
                    style="width: 300px"
                    v-model:value="account.queryToken"
                    @change="debouncedClick"
                />
            </item>

            <template v-if="loading">
                <item label="提示">
                    <span>正在加载查题信息 <LoadingOutlined /></span>
                </item>
            </template>
            <template v-else-if="tokenInfo.msg">
                <item label="提示">
                    <a-alert
                        show-icon
                        :message="tokenInfo.msg"
                        type="error"
                        style="height: 24px"
                    />
                </item>
            </template>
            <template v-else>
                <template v-if="account.queryToken && account.queryToken.length === 32">
                    <item :text="tokenInfo.query_times" label="剩余次数" />
                    <item :text="tokenInfo.success_times" label="成功次数" />
                    <item :text="tokenInfo.all_times" label="总查询次数" />
                </template>
            </template>
        </card>

        <card
            title="图形验证码破解(OCR)设置"
            md
            description="`自动破解`登录时遇到的`验证码`，否则需手动输入验证码验证<br>`例如` : 当您使用超星机构登录时会出现验证码"
        >
            <item label="账号" font-bold>
                <a-input
                    v-model:value="account.ocr.username"
                    type="text"
                    size="small"
                    style="width: 200px"
                />
            </item>
            <item label="密码" font-bold>
                <a-input-password
                    v-model:value="account.ocr.password"
                    size="small"
                    style="width: 200px"
                />
            </item>
            <item
                label="账号注册"
                font-bold
                description="在此处注册后，往账号充值一块钱，填写账号密码到上面输入框即可，一块钱可以破解将近千次的验证码"
            >
                <a href="http://www.ttshitu.com/login.html"
                    >http://www.ttshitu.com/login.html</a
                >
            </item>
        </card>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { AxiosGet, NetWorkCheck } from "@/utils/request";

import { message } from "ant-design-vue";
import { ref, onMounted, onUnmounted } from "vue";
import { config } from "@/utils/store";

import item from "@/components/common/item.vue";
import Card from "@/components/common/Card.vue";
import { debounce } from "lodash";
const { launch, script, account } = config.setting.script;
const { shell } = require("electron");

// 加载状态
const loading = ref(false);

// 查题剩余次数
let tokenInfo = ref({
    all_times: 0,
    query_times: 0,
    success_times: 0,
    msg: "",
});
onMounted(async () => {
    const queryToken = account.queryToken;
    if (queryToken && queryToken.length === 32) {
        await checkToken();
    }
});

// loadsh 防抖
const debouncedClick = debounce(checkToken, 500);
onUnmounted(() => {
    // 移除组件时，取消定时器
    debouncedClick.cancel();
});

async function checkToken() {
    const queryToken = account.queryToken;
    if (queryToken === "") {
        loading.value = false;
        return;
    }
    if (queryToken && queryToken.length === 32) {
        if (await NetWorkCheck()) {
            loading.value = true;
            AxiosGet({
                url: "http://wk.enncy.cn/query/chatiId/" + queryToken,
            })
                .then((res: any) => {
                    if (res.data.code === 1) {
                        tokenInfo.value = res.data.data;
                    } else {
                        tokenInfo.value.msg = "查题码无效，请重新填写";
                    }
                    loading.value = false;
                })
                .catch((err: any) => {
                    console.error(err);
                    message.error("获取查题次数失败,可能为网络错误！");
                    loading.value = false;
                });
        } else {
            loading.value = false;
        }
    } else {
        message.warn("请输入正确的查题码，一般为32个长度的字符串！");
        loading.value = false;
    }
}

// 设置路径
function setBinaryPath() {
    launch.binaryPath = Remote.dialog
        .call("showOpenDialogSync", {
            properties: ["openFile"],
            multiSelections: false,
            defaultPath: launch.binaryPath,
        })
        .pop();
}
</script>

<style scope lang="less">
#app .ant-descriptions-row > td {
    padding-bottom: 6px;
}

.ant-switch {
    min-width: 36px;
    height: 18px;
}
.ant-switch::after {
    width: 14px;
    height: 14px;
}
</style>
