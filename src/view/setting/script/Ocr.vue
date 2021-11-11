<template>
    <div>
        <item
            label="账号"
            font-bold
            md
            description="图形验证码破解(OCR) <br>  `自动破解`登录时遇到的`验证码`，否则需手动输入验证码验证<br>`例如` : 当您使用超星机构登录时会出现验证码"
        >
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
    </div>
</template>

<script setup lang="ts">
import { config } from "@/utils/store";

const account = config.setting.script.account;
</script>

<style scope lang="less"></style>
