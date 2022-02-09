<template>
    <div class="title" :style="config.title.style">
        <img :src="config.title.icon" width="16" height="16" />
        <span class="ms-2">
            {{ config.title.text }}
        </span>
        <ul>
            <template v-for="(item, index) in routes">
                <li
                    @click="router.push(item.path), active($event)"
                    :data-route-name="item.name"
                    :class="item.path === '/' ? token : ''"
                >
                    {{ item.meta?.title || "" }}
                </li>
            </template>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { config } from "../store";
import { ref, reactive, toRefs, nextTick, onMounted } from "vue";
import { router, routes } from "../route";

const token = "active";

function active(event: MouseEvent) {
    const el = document.elementFromPoint(event.x, event.y);

    document.querySelectorAll(".title ul li").forEach((el) => {
        el.classList.remove(token);
    });

    if (!el?.classList.contains(token)) {
        el?.classList.add(token);
    }
}
</script>

<style scope lang="less">
.title {
    padding: 0px 10px;
    height: 30px;
    width: 100%;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    -webkit-app-region: drag;

    ul {
        -webkit-app-region: no-drag;
        list-style-type: none;
        display: flex;
        padding: 0;
        margin: 0 14px;

        li {
            font-size: 12px;
            margin: 0px 8px;
            color: gray;
            cursor: pointer;
        }

        li.active {
            color: black;
            font-weight: bold;
        }
    }
}
</style>
