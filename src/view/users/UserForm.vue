<template>
    <div id="user-form">
        <a-form>
            <a-form-item label="用户名字/备注">
                <a-input v-model:value="tempUser.name" />
            </a-form-item>
            <a-form-item label="平台类型">
                <a-radio-group
                    default-value="cx"
                    @change="(e:any)=>tempUser.platform=e.target.value"
                >
                    <a-radio-button value="cx" @click="tempUser.params = 'userLogin'">
                        超星
                    </a-radio-button>
                    <a-radio-button value="zhs" @click="tempUser.params = 'phoneLogin'">
                        智慧树
                    </a-radio-button>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="登录类型">
                <a-radio-group
                    v-if="tempUser.platform === 'cx'"
                    :default-value="FromScriptName('cx-user-login')"
                    @change="(e:any)=>tempUser.params=e.target.value"
                >
                    <a-radio-button :value="FromScriptName('cx-user-login')">
                        用户登录
                    </a-radio-button>
                    <a-radio-button :value="FromScriptName('cx-phone-login')">
                        手机验证码登录
                    </a-radio-button>
                    <a-radio-button :value="FromScriptName('cx-unit-login')">
                        机构单位登录
                    </a-radio-button>
                </a-radio-group>
            </a-form-item>
            <template v-if="tempUser.platform === 'cx'">
                <template v-if="tempUser.loginScript === 'cx-user-login'">
                    <a-form-item label="账号">
                        <a-input v-model:value="tempUser.loginInfo.cx.userLogin.phone" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input
                            v-model:value="tempUser.loginInfo.cx.userLogin.password"
                        />
                    </a-form-item>
                </template>
                <template v-else-if="tempUser.loginScript === 'cx-phone-login'">
                    <a-form-item label="手机号">
                        <a-input v-model:value="tempUser.loginInfo.cx.phoneLogin.phone" />
                    </a-form-item>
                </template>
                <template v-else-if="tempUser.loginScript === 'cx-unit-login'">
                    <a-form-item label="学校/单位">
                        <a-input
                            v-model:value="tempUser.loginInfo.cx.unitLogin.unitname"
                        />
                    </a-form-item>
                    <a-form-item label="工号/学号">
                        <a-input v-model:value="tempUser.loginInfo.cx.unitLogin.uname" />
                    </a-form-item>
                    <a-form-item label="密码">
                        <a-input
                            v-model:value="tempUser.loginInfo.cx.unitLogin.password"
                        />
                    </a-form-item>
                </template>
            </template>

            <a-form-item v-if="tempUser.course.length !== 0" label="课程列表">
                <a-list item-layout="horizontal" :data-source="tempUser.course">
                    <template #renderItem="{ item }">
                        <a-list-item>
                            <a-list-item-meta
                                :description="item.url"
                            >
                                <template #title>
                                    <a >{{item.profile.replace(/\n+/,"-") }}</a>
                                </template>
                                <template #avatar>
                                    <a-avatar
                                        :src="item.img"
                                    />
                                </template>
                            </a-list-item-meta>
                        </a-list-item>
                    </template>
                </a-list>
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 12, offset: 12 }">
                <div class="space-10 flex">
                    <a-button
                        v-if="mode === 'create'"
                        type="primary"
                        @click="getCourseList()"
                    >
                        获取课程列表
                    </a-button>

                    <template v-if="tempUser.course.length === 0">
                        <a-popover content="请先获取课程列表，之后才能添加 ">
                            <a-button type="primary" :disabled="true">
                                {{ btnText }}
                            </a-button>
                        </a-popover>
                    </template>
                    <template v-else>
                        <a-button type="primary" @click="emits('ok', tempUser)">
                            {{ btnText }}
                        </a-button>
                    </template>
                </div>
            </a-form-item>
        </a-form>

        <!-- 显示任务步骤 -->
        <a-modal
            v-model:visible="visible"
            :footer="null"
            centered
            title=""
            :maskClosable="false"
            :keyboard="false"
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
                            v-text="
                                task.status === 'wait'
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
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { reactive, ref, toRaw, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";

import { User, FromScriptName, TaskType } from "app/types";

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

//
const tasks: any[] = reactive<TaskType[]>([]);

// 获取课程列表
async function getCourseList() {
    visible.value = true;
    // 开启脚本，并获取任务列表
    Object.assign(
        tasks,
        Remote.script.call("login", tempUser.loginScript, toRaw(tempUser))
    );
    // 遍历监听任务变化，并显示出步骤条到页面
    tasks.forEach((task: any) => {
        Remote.task(task.id).process(() => {
            console.log("process", task);
            task.status = "process";
        });
        Remote.task(task.id).finish((e: any, value: any) => {
            console.log("finish", task);
            task.status = "finish";
            if (tasks[tasks.length - 1].status === "finish") {
                if (value.length !== 0) {
                    // 获取完成时的返回值
                    tempUser.course = value;
                    console.log("tempUser.course", tempUser.course);
                    message.success("课程列表获取成功!");
                    setTimeout(() => {
                        visible.value = false;
                    }, 2000);
                } else {
                    message.error("课程列表获取失败 , 请重新获取!");
                }
            }
        });
        Remote.task(task.id).error(() => {
            message.error("课程列表获取失败 , 请重新获取!");
            task.status = "error";
        });
    });
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
        params: "userLogin",
        loginScript: "cx-user-login",
        course: [],
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
</script>

<style scope lang="less">
#user-form {
    overflow: auto;
    max-height: 300px;
}
</style>
