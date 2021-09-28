import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'
 
import { message } from 'ant-design-vue';

message.config({
    top: `74px`,
    duration: 2,
    maxCount: 3,
});

createApp(App)
    .use(router)
    .mount('#app')
