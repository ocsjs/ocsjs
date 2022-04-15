<template>
  <IconFont
    :type="type"
    class="ocsicon"
  />
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
interface IconProps {
  type: string
}
const props = withDefaults(defineProps<IconProps>(), {});
const { type } = toRefs(props);
</script>

<style scope lang="less"></style>
