<template>
    <!-- 显示任务步骤 -->
    <a-modal
        centered
        title="添加课程"
        :destroyOnClose="true"
        ok-text="确认"
        cancel-text="取消"
    >
        <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
            <a-form-item label="名字" required>
                <a-input v-model:value="course.name">
                    <template #suffix>
                        <a-tooltip title="课程名字，可任意取，自己分得清就好">
                            <QuestionCircleOutlined />
                        </a-tooltip>
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="备注/简介" required>
                <a-input v-model:value="course.profile">
                    <template #suffix>
                        <a-tooltip title="课程备注，可任意写">
                            <QuestionCircleOutlined />
                        </a-tooltip>
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="进入链接" required>
                <a-input v-model:value="course.url">
                    <template #suffix>
                        <a-tooltip
                            title="课程链接，1.自己在其他浏览器里面登录到超星 2.然后选中任意课程点进去 3.把浏览器链接复制粘贴到这里"
                        >
                            <QuestionCircleOutlined />
                        </a-tooltip>
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="图片">
                <a-input v-model:value="course.img" />
            </a-form-item>
            <a-form-item label="平台">
                <a-radio-group v-model:value="course.platform">
                    <a-radio-button value="cx"> 超星 </a-radio-button>
                    <a-radio-button value="zhs"> 智慧树 </a-radio-button>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="所属账号id">
                <a-input disabled v-model:value="course.uid" />
            </a-form-item>
            <a-form-item label="课程id">
                <a-input disabled v-model:value="course.id" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { Course } from "app/types/script/course";
import { ref, reactive, toRefs } from "vue";
interface CourseFormProps {
    course: Course;
}
const props = withDefaults(defineProps<CourseFormProps>(), {});
const {} = toRefs(props);
</script>

<style scope lang="less"></style>
