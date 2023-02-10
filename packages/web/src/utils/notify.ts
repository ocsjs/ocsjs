import { Button, Notification } from '@arco-design/web-vue';
import { h, VNodeChild } from 'vue';
import { electron } from './node';
import { StringUtils } from '@ocsjs/common/src/utils/string';
const { clipboard } = electron;

interface NotifyOptions {
	type?: 'error' | 'success' | 'info' | 'warning';
	duration?: number;
	btn?: VNodeChild | undefined;
	copy?: boolean;
	close?: boolean;
}

export function notify(title: string, msg: any, key: string, options?: NotifyOptions) {
	return Notification[options?.type || 'info']({
		id: key,
		title,
		closable: true,
		content: () => h('span', { title: String(msg) }, StringUtils.max(String(msg), 100)),
		duration: options?.duration ?? (options?.type === 'error' ? 6000 : 3000),
		footer: () =>
			options?.btn ||
			h('div', [
				options?.copy ? cerateCopyButton(title, msg, key, options) : '',
				options?.close ? createCloseButton(key) : ''
			])
	});
}

/**
 * 创建关闭按钮
 */
function createCloseButton(key: string) {
	return h(
		Button,
		{
			type: 'primary',
			size: 'small',
			onClick: () => {
				Notification.remove(key);
			}
		},
		'关闭'
	);
}

/**
 * 创建复制信息按钮
 */
function cerateCopyButton(title: string, msg: any, key: string, options?: NotifyOptions) {
	return h(
		Button,
		{
			type: 'primary',
			size: 'small',
			onClick: () => {
				clipboard.writeText(title + '\n' + String(msg));

				notify(title, msg, key, {
					...options,
					...{
						btn: h(
							Button,
							{
								type: 'primary',
								size: 'small',
								disabled: true
							},
							'复制成功√'
						)
					}
				});
			}
		},
		'复制信息'
	);
}
