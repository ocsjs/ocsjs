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
    </div>
</template>

<script setup lang="ts">
import { Remote } from "@/utils/remote";
import { reactive, toRaw, toRefs } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { AllScriptObjects, User, FromScriptName } from "app/types";

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

// 获取课程列表
async function getCourseList() {
    //
    tempUser.course = await Remote.script.call(
        "login",
        tempUser.loginScript,
        toRaw(tempUser)
    );
    if (tempUser.course) {
        console.log("tempUser.course", tempUser.course);
        message.success("课程列表获取成功!");
    } else {
        message.error("课程列表获取失败 , 请重新获取!");
    }
}

// 用户模板
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
}
</style>
