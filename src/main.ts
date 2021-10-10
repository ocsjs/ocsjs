import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'

import { message } from 'ant-design-vue';


import { createFromIconfontCN } from "@ant-design/icons-vue";
const IconFont = createFromIconfontCN({
    scriptUrl: "https://at.alicdn.com/t/font_2849771_3az41crtc9.js",
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



