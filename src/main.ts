import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'

import { message } from 'ant-design-vue';




import { createFromIconfontCN } from "@ant-design/icons-vue";
const IconFont = createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_2849771_9ym27ock1za.js",
});

message.config({
    top: `74px`,
    duration: 2,
    maxCount: 3,
});

createApp(App)
    .use(router)
    .component('IconFont',IconFont)
    .mount('#app')



