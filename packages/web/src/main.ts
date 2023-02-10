import { remote } from './utils/remote';
import { createApp } from 'vue';
import ArcoVue, { Icon } from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import App from './App.vue';
import '@arco-design/web-vue/dist/arco.css';
import { router } from './route';
import { notify } from './utils/notify';
import Vue3ColorPicker from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';
import 'material-icons/iconfont/material-icons.css';

window.addEventListener('error', function (e) {
	console.error(e);
	if (e instanceof ErrorEvent) {
		// arco design 问题，暂时无需处理，复现方式，鼠标重复经过 tooltip 或者 dropdown ， 打开 modal 都会出现
		if (e.message === 'ResizeObserver loop limit exceeded') {
			return;
		}
	}
	remote.logger.call('error', '未知的错误', e);
	notify('未知的错误', e instanceof ErrorEvent ? e.error : e, 'render-error', {
		type: 'error',
		copy: true
	});
});

window.addEventListener('unhandledrejection', function (e) {
	e.promise.catch((e) => {
		console.error(e);
		remote.logger.call('error', '未捕获的异步错误', e);
		notify('未捕获的异步错误', e, 'render-error', {
			type: 'error',
			copy: true
		});
	});
});

createApp(App)
	.use(router)
	.use(ArcoVue)
	.use(ArcoVueIcon)
	.use(Vue3ColorPicker)
	.component('IconFont', Icon.addFromIconFontCn({ src: 'js/acro.font.js' }))
	.directive('focus', {
		mounted(el) {
			el.focus();
		}
	})
	.mount('#app');
