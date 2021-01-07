<template>
  <div id="app">
    <a-layout id="components-layout-demo-top" class="layout" style="height: 100%;">
      <a-layout-header>
        <div class="logo">ocs-helper</div>
        <a-menu theme="dark" mode="horizontal" :default-selected-keys="['1']" style="line-height: 64px;display: flex;justify-content: start;">
          <a-menu-item key="1" @click="$router.push('/')">
            首页
          </a-menu-item>
          <a-menu-item key="2" @click="$router.push('/setting')">
            设置
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content style="padding: 20px">

        <div :style="{ background: '#fff', padding: '24px', minHeight: '280px' }">
          <router-view></router-view>
        </div>

      </a-layout-content>
      <a-layout-footer style="text-align: center">
        ocs-helper ©2020 Created by klskeleton
      </a-layout-footer>
    </a-layout>

  </div>
</template>

<script>
  import index from './views/index/index.vue'

  export default {
    components: {
      index
    },
    name: 'App'
  }
</script>

<style>
  #components-layout-demo-top .logo {

    height: 31px;
    font-size: large;
    color: white;
    margin: 0px 50px 16px 0;
    float: left;
  }


  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
 
    color: #2c3e50;
    height: auto;
    width: 100%;

  }

  body,
  html {
    background-color: #f0f2f5;
    height: 100%;
    width: 100%;
  }
</style>
