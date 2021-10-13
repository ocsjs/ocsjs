<template>
    <div class="font-v4 flex nowrap height-24">
        <div class="flex nowrap space-10 jc-flex-start ai-center">
            <li>{{ json.name }} - v{{ json.version }}</li>
            <!-- 路由信息 -->
            <!-- <li class="space-4">
                <span v-for="(info, i) of routesInfo" class="space-4">
                    <span v-if="i !== 0"> / </span>
                    <span>{{ info }}</span>
                </span>
            </li> -->
        </div>

        <div class="flex nowrap space-10 jc-flex-end ai-center ac-center">
            <span style="cursor: pointer; display: flex">
                <HomeOutlined title="首页" class="font-v2" @click="$router.push('/')" />
            </span>

            <span style="cursor: pointer; display: flex">
                <QuestionCircleOutlined title="关于" class="font-v2" @click="showModal" />
            </span>
        </div>

        <a-modal v-model:visible="visible" title="使用须知" @ok="handleOk" :footer="false">
            <p>
                <md-render
                    codeStyle="github-dark"
                    renderKey="1"
                    style="text-align: left; letter-spacing: 1px"
                    raw
                    @copy="onCopy"
                >
                    <pre>
  
                     - 本软件完全开源免费，**谨防上当受骗** ，禁止用于商业用途，仅供学习交流使用
                     - 此软件不会收集您的个人信息，所有信息均保存到本地
                     - 此软件涉及到的脚本如有任何侵权行为，请联系作者进行删除
                     - 如有任何疑问，请到BUG反馈处反馈，或者直接联系作者邮箱 **enncyemail@qq.com**
                    </pre>
                </md-render>
            </p>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref } from "@vue/reactivity";
import { message } from "ant-design-vue";
import json from "root/package.json";
 
import { MdRender } from "mark-ui";

// const router = useRouter();
// const routesInfo = ref<any[]>([]);
// router.beforeEach((to, from) => {
//     routesInfo.value = to.matched.map((route) => route.meta.desc);
// });

function onCopy() {
    message.success("复制成功!");
}

const visible = ref<boolean>(false);

const showModal = () => {
    visible.value = true;
};

const handleOk = (e: MouseEvent) => {
    console.log(e);
    visible.value = false;
};
</script>

<style scope lang="less"></style>
