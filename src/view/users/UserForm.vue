<template>
    <div>
        <div id="user-form">
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                <a-form-item label="用户名字/备注">
                    <a-input v-model:value="tempUser.name" />
                </a-form-item>
                <a-form-item label="平台类型">
                    <a-radio-group
                        :default-value="tempUser.platform || 'cx'"
                        @change="(e:any)=>{
                        tempUser.platform=e.target.value
                    }"
                    >
                        <a-radio-button
                            value="cx"
                            @click="
                                tempUser.loginScript = FromScriptName('cx-user-login')
                            "
                        >
                            {{ PlatformAlias["cx"] }}
                        </a-radio-button>
                        <a-radio-button
                            value="zhs"
                            @click="
                                tempUser.loginScript = FromScriptName('zhs-phone-login')
                            "
                        >
                            {{ PlatformAlias["zhs"] }}
                        </a-radio-button>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="登录类型">
                    <transition name="fade" mode="out-in" :duration="200">
                        <a-radio-group
                            v-if="tempUser.platform === 'cx'"
                            :default-value="tempUser.loginScript"
                            @change="(e:any)=>tempUser.loginScript=e.target.value"
                        >
                            <a-radio-button :value="FromScriptName('cx-user-login')">
                                {{ showLoginScriptName("cx-user-login") }}
                            </a-radio-button>
                            <a-radio-button :value="FromScriptName('cx-phone-login')">
                                {{ showLoginScriptName("cx-phone-login") }}
                            </a-radio-button>
                            <a-radio-button :value="FromScriptName('cx-unit-login')">
                                {{ showLoginScriptName("cx-unit-login") }}
                            </a-radio-button>
                        </a-radio-group>
                        <a-radio-group
                            v-else-if="tempUser.platform === 'zhs'"
                            :default-value="tempUser.loginScript"
                            @change="(e:any)=>tempUser.loginScript=e.target.value"
                        >
                            <a-radio-button :value="FromScriptName('zhs-phone-login')">
                                {{ showLoginScriptName("zhs-phone-login") }}
                            </a-radio-button>
                            <a-radio-button
                                :value="FromScriptName('zhs-studentId-login')"
                            >
                                {{ showLoginScriptName("zhs-studentId-login") }}
                            </a-radio-button>
                        </a-radio-group>
                    </transition>
                </a-form-item>
                <template v-if="tempUser.platform === 'cx'">
                    <transition-group name="fade" mode="out-in" :duration="200">
                        <template v-if="tempUser.loginScript === 'cx-user-login'">
                            <a-form-item label="账号">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.userLogin.phone
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="密码">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.userLogin.password
                                    "
                                />
                            </a-form-item>
                        </template>
                        <template v-else-if="tempUser.loginScript === 'cx-phone-login'">
                            <a-form-item label="手机号">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.phoneLogin.phone
                                    "
                                />
                            </a-form-item>
                        </template>
                        <template v-else-if="tempUser.loginScript === 'cx-unit-login'">
                            <a-form-item label="学校/单位">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.unitLogin.unitname
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="工号/学号">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.unitLogin.uname
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="密码">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.cx.unitLogin.password
                                    "
                                />
                            </a-form-item>
                        </template>
                        <template v-else> </template>
                    </transition-group>
                </template>
                <template v-else-if="tempUser.platform === 'zhs'">
                    <transition-group name="fade" mode="out-in" :duration="200">
                        <template v-if="tempUser.loginScript === 'zhs-phone-login'">
                            <a-form-item label="手机号">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.zhs.phoneLogin.phone
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="密码">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.zhs.phoneLogin.password
                                    "
                                />
                            </a-form-item>
                        </template>
                        <template
                            v-else-if="tempUser.loginScript === 'zhs-studentId-login'"
                        >
                            <a-form-item label="学校名 ">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.zhs.studentIdLogin.school
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="大学学号">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.zhs.studentIdLogin.studentId
                                    "
                                />
                            </a-form-item>
                            <a-form-item label="密码">
                                <a-input
                                    v-model:value.trim="
                                        tempUser.loginInfo.zhs.studentIdLogin.password
                                    "
                                />
                            </a-form-item>
                        </template>
                    </transition-group>
                </template>

                <a-form-item v-if="tempUser.courses.length !== 0" label="课程">
                    <CourseList :user="tempUser" detail show-img :show-only="true" />
                </a-form-item>
            </a-form>

            <!-- 显示任务步骤 -->
            <a-modal
                v-model:visible="visible"
                :footer="null"
                centered
                title=""
                :width="700"
                :maskClosable="false"
                :keyboard="false"
                :closable="isLoginClose()"
                :destroyOnClose="true"
            >
                <a-steps style="padding: 20px 12px 0px 12px">
                    <a-step
                        v-for="(task, index) in tasks"
                        :key="index"
                        :title="task.name"
                        :status="task.status"
                    >
                        <template #description>
                            <span
                                style="white-space: nowrap"
                                v-text="
                                    task.msg
                                        ? task.msg
                                        : task.status === 'wait'
                                        ? '等待中'
                                        : task.status === 'process'
                                        ? '正在运行'
                                        : task.status === 'finish'
                                        ? '已完成'
                                        : '错误'
                                "
                            ></span>
                        </template>
                        <template v-if="task.status === 'process'" #icon>
                            <LoadingOutlined />
                        </template>
                    </a-step>
                </a-steps>
            </a-modal>
        </div>

        <div class="space-10 flex jc-flex-end margin-top-8">
            <a-popconfirm
                placement="top"
                ok-text="确认"
                cancel-text="取消"
                title="你确定要重新获取课程吗"
                @confirm="getCourseList()"
            >
                <a-button type="primary">
                    {{ mode === "create" ? "获取课程列表" : "重新获取课程列表" }}
                </a-button>
            </a-popconfirm>

            <template v-if="tempUser.courses.length === 0">
                <a-popover content="请先获取课程列表，之后才能添加 ">
                    <a-button type="primary" :disabled="true">
                        {{ btnText }}
                    </a-button>
                </a-popover>
            </template>
            <template v-else>
                <a-button type="primary" @click="ok">
                    {{ btnText }}
                </a-button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { reactive, ref, toRaw, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { Task } from "app/electron/task";

import {
    User,
    FromScriptName,
    PlatformAlias,
    AllScriptAlias,
    AllScriptObjects,
    BaseTask,
} from "app/types";
import { ListeningTaskChange, TaskToList } from "../task/task";
import CourseList from "./CourseList.vue";

const uuid = require("uuid");

const props = defineProps<{
    // 按钮文字
    btnText: string;
    // 默认绑定的 user，如果没有默认user，则新创建 createUser
    user?: User;
    // 模式, 修改 | 创建
    mode: "modify" | "create";
}>();
const { btnText, user, mode } = toRefs(props);

const emits = defineEmits<{
    (e: "ok", value: User): void;
}>();

// 临时变量
const tempUser = reactive<User>(user?.value || createUser());

// 模态框显示
const visible = ref(false);

// 登录任务
const tasks: Task[] = reactive<Task[]>([]);

function ok() {
    console.log("mode.value", mode.value);

    if (mode.value === "modify") {
        tempUser.updateTime = Date.now();
    }
    emits("ok", tempUser);
}

function isLoginClose() {
    if (tasks.length !== 0) {
        return (
            tasks[tasks?.length - 1].status === "finish" ||
            tasks?.some((t) => t.status === "error")
        );
    }

    return false;
}

// 获取课程列表
async function getCourseList() {
    visible.value = true;
    // 开启脚本，并获取任务列表
    const task = Remote.script.call(
        "getCourseList",
        tempUser.loginScript,
        toRaw(tempUser)
    );

    if (task) {
        Object.assign(tasks, TaskToList(task));
        console.log("get course list ", tasks);

        for (const t of tasks) {
            ListeningTaskChange(t, {
                finish(e, value) {
                    if (tasks?.[tasks.length - 1].status === "finish") {
                        if (value.length !== 0) {
                            // 设置课程
                            // 1. 删除指定平台的课程信息
                            // 2. 再填充最新的课程信息
                            Object.assign(
                                tempUser.courses,
                                tempUser.courses
                                    .filter((c) => c.platform !== tempUser.platform)
                                    .concat(value)
                            );
                            message.success("课程列表获取成功!");
                            setTimeout(() => {
                                visible.value = false;
                            }, 2000);
                        } else {
                            message.error("课程列表获取失败 , 请重新获取!");
                        }
                    }
                },
                error(e, value) {
                    message.error("课程列表获取失败 , 请重新获取!");
                },
            });
        }

        // 遍历监听任务变化，并显示出步骤条到页面
    }
}

// 默认用户模板
function createUser(): User {
    return {
        uid: uuid.v4().replace(/-/g, ""),
        name: "",
        loginTime: 0,
        delete: false,
        updateTime: Date.now(),
        createTime: Date.now(),
        platform: "cx",
        loginScript: "cx-user-login",
        courses: [],
        loginInfo: {
            cx: {
                phoneLogin: {
                    phone: "",
                },
                unitLogin: {
                    password: "",
                    uname: "",
                    unitname: "",
                },
                userLogin: {
                    password: "",
                    phone: "",
                },
            },
            zhs: {
                phoneLogin: {
                    password: "",
                    phone: "",
                },
                studentIdLogin: {
                    password: "",
                    school: "",
                    studentId: "",
                },
            },
        },
    };
}

// 去掉前缀平台名
function showLoginScriptName(alias: keyof AllScriptObjects) {
    return AllScriptAlias[alias].split("-").slice(1).join("-");
}
</script>

<style scope lang="less">
#user-form {
    overflow: auto;
    max-height: 340px;
}
</style>
