import { createApp } from "vue";
import Antd from "ant-design-vue";
import App from "./App.vue";
import "ant-design-vue/dist/antd.css";
import { router } from "./route";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import { defineComponent } from "vue";

const Icon = createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_3178947_s7ia1igqqoq.js", // 在 iconfont.cn 上生成
});

const app = createApp(App);

app.use(router).use(Antd).component("Icon", Icon).mount("#app");
