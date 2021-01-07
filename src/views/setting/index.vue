<template>
  <div style="width: 100%;height: 100%;">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="基础配置">
        <base-setting></base-setting>
      </a-tab-pane>
      <a-tab-pane key="2" tab="超星配置" force-render>
        <cx-setting></cx-setting>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>
<script>
  import BaseSetting from './components/BaseSetting.vue'
  import CxSetting from './components/CXSetting.vue'


  export default {
    components:{
      CxSetting,BaseSetting
    },
    data() {
      return {};
    },
    methods: {
      callback(key) {
        console.log(key);
      },
    },
  };
</script>
