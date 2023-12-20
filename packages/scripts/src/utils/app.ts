import { $message, $modal, el } from '@ocsjs/core';

export const $playwright = {
	showError: () => {
		const href = 'https://docs.ocsjs.com/docs/script-helper';
		const errorEl = el('div', [
			'软件辅助启动失败，无法执行脚本操作，请开启软件辅助，点击链接查看开启教程 => ',
			el('a', { href: href, target: '_blank' }, href)
		]);
		$modal('alert', {
			maskCloseable: false,
			title: '⛔ 错误',
			confirmButtonText: '我已知晓',
			content: errorEl.cloneNode(true)
		});
		$message('error', { content: errorEl.cloneNode(true), duration: 0 });
	}
};
