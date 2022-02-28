<template>
    <IconFont :type="type" class="ocsicon"></IconFont>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface IconProps {
    type: string;
}
const props = withDefaults(defineProps<IconProps>(), {});
const { type } = toRefs(props);
</script>

<style scope lang="less"></style>
