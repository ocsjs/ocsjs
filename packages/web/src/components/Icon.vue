<template>
    <IconFont :type="icon" class="ocsicon"></IconFont>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface IconProps {
    icon: string;
}
const props = withDefaults(defineProps<IconProps>(), {});
const { icon } = toRefs(props);
</script>

<style scope lang="less"></style>
