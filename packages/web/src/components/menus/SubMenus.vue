<template>
    <a-sub-menu :title="menu.title" :selectable="false">
        <template #icon v-if="menu.icon">
            <Icon :type="menu.icon" />
        </template>

        <template v-for="(item, index) in menu.children" :key="index">
            <a-menu-divider v-if="item.divide" />
            <template v-if="item.children && item.children.length !== 0">
                <SubMenus :menu="item" />
            </template>
            <template v-else>
                <a-menu-item
                    :key="item.title"
                    :selectable="false"
                    v-if="!item.hide"
                    @click="item.onClick"
                    :disabled="item.disable"
                >
                    <Icon v-if="item.icon" :type="item.icon" />
                    <span> {{ item.title }} </span>
                </a-menu-item>
            </template>
        </template>
    </a-sub-menu>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
import { MenuItem } from ".";

export interface MenusProps {
    menu: MenuItem;
}

const props = defineProps<MenusProps>();
const { menu } = toRefs(props);
</script>

<style scope lang="less"></style>
