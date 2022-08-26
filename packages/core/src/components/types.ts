import { VNodeProps } from 'vue';

export interface AlertType {
	key: any;
	type: 'info' | 'success' | 'warn' | 'error';
	text: string;
}

export interface CreateWorkerSettingConfig {
	/** 默认提交设置 */
	selected?: string;
	/** 自定义选项 */
	options?: {
		label: string;
		value: any;
		attrs?: (VNodeProps & Record<string, any>) | undefined;
	}[];
}
