import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router";

import { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
// antdv IconFont 远程阿里图标库ICON
import { createFromIconfontCN } from "@ant-design/icons-vue";
const IconFont = createFromIconfontCN({
    scriptUrl: "https://at.alicdn.com/t/font_2849771_3az41crtc9.js",
});

// antdv message 全局配置
message.config({
    top: `74px`,
    duration: 2,
    maxCount: 3,
});

const app = createApp(App);
app.use(router)

    // 注册远程ICON
    .component("IconFont", IconFont)
    .mount("#app");
