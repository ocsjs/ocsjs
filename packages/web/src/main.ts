import { remote } from './utils/remote';
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import { router } from './route';
import { createFromIconfontCN } from '@ant-design/icons-vue';
import Icon from './components/Icon.vue';
import { notify } from './utils/notify';

console.log(Date.now());

process.on('uncaughtException', (e) => {
  remote.logger.call('error', '未知的错误', e);
  notify('未知的错误', e.stack, 'render-error', {
    type: 'error',
    copy: true
  });
});
process.on('unhandledRejection', (e: Error) => {
  remote.logger.call('error', '未知的错误', e);
  notify('未知的错误', e.stack, 'render-error', {
    type: 'error',
    copy: true
  });
});

const IconFont = createFromIconfontCN({
  scriptUrl: 'js/iconfont.js' // 在 iconfont.cn 上生成,
});

const app = createApp(App);

app.use(router).use(Antd).component('IconFont', IconFont).component('Icon', Icon).mount('#app');

app.directive('focus', {
  mounted (el) {
    el.focus();
  }
});

console.log(Date.now());
