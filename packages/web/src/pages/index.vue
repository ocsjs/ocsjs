<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component
        :is="Component"
        class="overflow-auto h-100"
      />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts"></script>

<style scope lang="less">
.home {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.content {
  padding: 32px 0;
}
</style>
