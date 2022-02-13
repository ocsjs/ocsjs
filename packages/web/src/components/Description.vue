<template>
    <p class="row flex-nowrap">
        <span class="fw-bold me-1 col-3"> {{ label }} : </span>

        <div class="ms-1 col-9 w"> <span class="desc">{{ String(desc) }}</span> </div>
    </p>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
interface DescriptionProps {
    label: string;
    desc: any
}
const props = withDefaults(defineProps<DescriptionProps>(), {});
const { label, desc } = toRefs(props);
</script>

<style scope lang="less">
.desc{
     word-wrap:break-word;  
    word-break:break-all; 
}

</style>
