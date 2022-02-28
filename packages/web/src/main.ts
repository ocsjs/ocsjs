import { createApp } from "vue";
import Antd from "ant-design-vue";
import App from "./App.vue";
import "ant-design-vue/dist/antd.css";
import { router } from "./route";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import Icon from "./components/Icon.vue";

const IconFont = createFromIconfontCN({
    scriptUrl: "js/iconfont.js", // 在 iconfont.cn 上生成,
});

const app = createApp(App);

app.use(router).use(Antd).component("IconFont", IconFont).component("Icon", Icon).mount("#app");

app.directive("focus", {
    mounted(el) {
        el.focus();
    },
});
