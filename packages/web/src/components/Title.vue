<template>
    <div class="title border-bottom">
        <ul :style="config.title.style">
            <li><img :src="favicon" width="16" height="16" /></li>
            <template v-for="(item, index) in routes">
                <li
                    @click="router.push(item.path), active($event)"
                    :data-route-name="item.name"
                    :class="item.path === '/' ? token : ''"
                >
                    {{ item.meta?.title || "" }}
                </li>
            </template>
            <a-dropdown>
                <li>
                    <span @click.prevent> 工具 </span>
                </li>

                <template #overlay>
                    <a-menu class="title-menu">
                        <a-menu-item @click="remote.webContents.call('openDevTools')"
                            >开发者工具</a-menu-item
                        >

                        <a-menu-item @click="openLog">打开日志目录</a-menu-item>

                        <a-menu-divider />
                        <a-menu-item @click="remote.webContents.call('reload')"
                            >重新加载</a-menu-item
                        >

                        <a-menu-item @click="relaunch">重新启动</a-menu-item>
                        <a-menu-divider />

                        <a-menu-item @click="remote.win.call('setAlwaysOnTop')"
                            >窗口置顶</a-menu-item
                        >

                        <a-menu-item @click="remote.win.call('maximize')">
                            最大化
                        </a-menu-item>
                        <a-menu-item @click="remote.win.call('minimize')">
                            最小化
                        </a-menu-item>
                        <a-menu-item @click="remote.win.call('restore')">
                            还原
                        </a-menu-item>
                        <a-menu-item @click="remote.win.call('close')">关闭</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>

            <a-dropdown>
                <li>
                    <span @click.prevent> 帮助 </span>
                </li>

                <template #overlay>
                    <a-menu class="title-menu">
                        <TitleLink
                            title="教程"
                            url="https://github.com/enncy/online-course-script#readme"
                        />
                        <TitleLink
                            title="关于"
                            url="https://github.com/enncy/online-course-script#readme"
                        />
                        <TitleLink
                            title="版本更新"
                            url="https://github.com/enncy/online-course-script/releases"
                        />
                        <TitleLink
                            title="变更日志"
                            url="https://github.com/enncy/online-course-script/blob/3.0/CHANGELOG.md"
                        />
                    </a-menu>
                </template>
            </a-dropdown>
        </ul>
        <ul class="traffic-light w-100">
            <li title="最小化" @click="remote.win.call('minimize')">
                <Icon type="icon-minus" />
            </li>
            <li :title="max ? '还原' : '最大化'" @click="max = !max">
                <Icon :type="max ? 'icon-Batchfolding' : 'icon-border'" />
            </li>
            <li title="关闭" @click="remote.win.call('close')">
                <Icon type="icon-close" />
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { config } from "../config";
import { router, routes } from "../route";
import { remote } from "../utils/remote";
import TitleLink from "./TitleLink.vue";
import { formatDate } from "../utils";
import { path } from "./file/File";
import { ref, watch } from "vue";
import favicon from "root/public/favicon.ico";

const { shell } = require("electron");

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

function relaunch() {
    remote.app.call("relaunch");
    remote.app.call("quit");
}

function openLog() {
    shell.openPath(path.join(remote.app.call("getPath", "logs"), formatDate()));
}

const max = ref<boolean>(remote.win.call("isMaximized"));

watch(max, () => {
    if (max.value) {
        remote.win.call("maximize");
    } else {
        remote.win.call("restore");
    }
});
</script>

<style scope lang="less">
.title {
    width: 100%;
    display: flex;
    align-items: center;

    .traffic-light {
        display: flex;
        justify-content: end;
        -webkit-app-region: drag;

        .ocsicon {
            font-size: 14px;
            padding: 0px 4px 0px 4px;
            color: black;
        }
    }

    ul {
        white-space: nowrap;
        list-style-type: none;
        display: flex;
        padding: 0;
        margin: 0;
        height: 100%;

        li {
            display: inline-flex;
            align-items: center;
            font-size: 14px;
            padding: 0px 8px;
            color: gray;
            cursor: pointer;
            border-radius: 2px;
            -webkit-app-region: no-drag;
        }

        li:hover {
            background: #f5f5f5;
        }

        li.active {
            color: black;
            font-weight: bold;
        }
    }
}

.title-menu {
    .ant-dropdown-menu-item {
        font-size: 12px;
        padding: 2px 12px;
    }
}
</style>
