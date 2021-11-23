<template>
    <a-row>
        <a-col :span="20" class="font-v3">
            <a-menu theme="light" mode="horizontal">

                <a-menu-item key="users" @click="$router.push('/users')">
                    <UsergroupAddOutlined class="icon" /> 账号管理
                </a-menu-item>

                <a-menu-item key="task" @click="$router.push('/task')">
                    <UnorderedListOutlined class="icon" /> 任务列表
                </a-menu-item>
            
                <a-menu-item
                    key="setting-common"
                    @click="$router.push('/setting/script/cx')"
                >
                    <SettingOutlined class="icon" /> 设置
                </a-menu-item>
                
            </a-menu>
        </a-col>
        <a-col :span="4">
            <a-menu
                theme="light"
                mode="horizontal"
                id="operations"
                class="flex jc-flex-end"
                :selectable="false"
            >
                <a-menu-item @click="top">
                    <IconFont
                        title="置顶"
                        type="icon-relieve-full"
                        v-if="system.win.isAlwaysOnTop"
                    />
                    <IconFont title="取消置顶" type="icon-relieve" v-else />
                </a-menu-item>

                <a-menu-item @click="Remote.win.call('minimize')" title="最小化">
                    <MinusOutlined />
                </a-menu-item>

                <!-- <a-menu-item @click="Remote.call(max ? 'unmaximize' : 'maximize')">
                    <BorderOutlined v-if="!max" />
                    <MinusSquareOutlined v-else />
                </a-menu-item> -->

                <a-menu-item @click="Remote.win.call('close')" title="最大化">
                    <CloseOutlined />
                </a-menu-item>
            </a-menu>
        </a-col>
    </a-row>
</template>

<script setup lang="ts">
import { setting } from "@/view/setting/setting";
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";

import { Remote } from "../../utils/remote";

const router = useRouter();
const { system } = setting;

const current = ref(["users"]);

// 置顶
function top() {
    system.win.isAlwaysOnTop = !system.win.isAlwaysOnTop;
    console.log(
        "setAlwaysOnTop",
        Remote.win.call("setAlwaysOnTop", system.win.isAlwaysOnTop)
    );
}
</script>

<style scope lang="less">
.icon {
    margin-right: 8px;
}

#operations {
    min-width: 125px;
    li {
        padding: 0 10px;
    }
}
</style>
