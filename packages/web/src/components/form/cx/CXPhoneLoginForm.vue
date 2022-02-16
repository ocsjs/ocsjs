<template>
    <a-form :model="props" :label-col="4" :wrapper-col="8">
        <a-form-item label="账号">
            <a-input v-model:value="props.password" />
        </a-form-item>
        <a-form-item label="密码">
            <a-input-password v-model:value="props.password" />
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { ScriptOptions } from "@ocsjs/scripts";

const props = defineProps<ScriptOptions["cx-login-phone"]>();
</script>

<style scope lang="less"></style>
