<template>
  <IconFont
    :type="type"
    :title="title"
    class="ocsicon"
  />
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
interface IconProps {
  type: string
  title?: string
}
const props = withDefaults(defineProps<IconProps>(), {
  title: ''
});
const { type } = toRefs(props);
</script>

<style scope lang="less">
.ant-input-suffix{
  .ocsicon {
    transform: translate(0.5px, 0px);
  }
}
.ocsicon {
    transform: translate(0.5px, 5px);
}
</style>
