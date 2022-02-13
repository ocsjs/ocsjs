<template>
    <div class="dir" :data-dir-name="data.name" :class="data.selected ? 'select' : ''">
        <Icon
            @mouseup="down($event, data)"
            class="pointer"
            @click="data.click($event)"
            type="icon-wenjianjia"
        ></Icon>

        <template v-if="data.editing">
            <!-- 编辑状态 -->
            <a-input
                size="small"
                class="dir-edit-input"
                v-model:value="data.name"
            ></a-input>
        </template>
        <template v-else>
            <!-- 文件夹名字 -->
            <span
                @dblclick="data.edit()"
                class="dir-name"
                style="font-size: 12px"
                :title="data.name"
            >
                {{ data.name }}
            </span>
        </template>

        <a-modal v-model:visible="data.showDetail" :footer="null" :mask="false">
            <Description label="文件夹名" :desc="data.name" />
            <Description
                label="位置"
                :desc="
                    data
                        .getAllParent()
                        .map((d) => d.name)
                        .join('/')
                "
            />
            <Description label="子文件夹数量" :desc="data.children.length" />
            <Description label="任务数量" :desc="data.tasks.length" />
            <Description
                label="创建时间"
                :desc="new Date(data.createTime).toLocaleString()"
            />
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
import { current, Directory } from "./directory";
import Description from "../Description.vue";
interface DirectoryProps {
    data: Directory;
}
const props = defineProps<DirectoryProps>();
const { data } = toRefs(props);

/**
 * 鼠标右键选中
 */
function down(e: MouseEvent, dir: Directory) {
    if (e.button === 2) {
        current.value.unselectedChildren();
        dir.select();
    }
}
</script>

<style scope lang="less">
.ant-modal-content {
    border-radius: 12px;
}
</style>
