<template>
    <div class="title border-bottom">
        <ul :style="config.title.style">
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
import { config } from "../config";
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
    width: 100%;

    ul {
        list-style-type: none;
        display: flex;
        padding: 4px 0;
        margin: 0;

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
