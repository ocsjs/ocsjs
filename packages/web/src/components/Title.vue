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
            <li>
                <a-dropdown>
                    <span @click.prevent> 帮助 </span>
                    <template #overlay>
                        <a-menu>
                            <Link
                                title="关于"
                                url="https://github.com/enncy/online-course-script#readme"
                            />
                            <Link
                                title="教程"
                                url="https://github.com/enncy/online-course-script#readme"
                            />
                            <Link
                                title="版本更新"
                                url="https://github.com/enncy/online-course-script/releases"
                            />
                            <Link
                                title="变更日志"
                                url="https://github.com/enncy/online-course-script/blob/3.0/CHANGELOG.md"
                            />
                        </a-menu>
                    </template>
                </a-dropdown>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";
import { config } from "../config";
import { router, routes } from "../route";
const { shell } = require("electron");

const token = "active";

const Link = defineComponent({
    template: `<a-menu-item  @click="open(url)">{{title}}</a-menu-item>`,
    props: ["title", "url"],
    methods: {
        open(url: string) {
            shell.openExternal(url);
        },
    },
});

function active(event: MouseEvent) {
    const el = document.elementFromPoint(event.x, event.y);

    document.querySelectorAll(".title ul li").forEach((el) => {
        el.classList.remove(token);
    });

    if (!el?.classList.contains(token)) {
        el?.classList.add(token);
    }
}

function open(url: string) {
    shell.openExternal(url);
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
