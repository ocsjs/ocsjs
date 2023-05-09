import { $creator, Config } from '@ocsjs/core';
import { createRangeTooltip } from '.';

/**
 * 可复用的配置参数
 */

/** 音量调节配置  */
export const volume: Config = {
	label: '音量调节',
	attrs: { type: 'range', step: '0.05', min: '0', max: '1' },
	defaultValue: 0,
	onload() {
		createRangeTooltip(this, '0', (val) => `${parseFloat(val) * 100}%`);
	}
};

/** 复习模式配置 */
export const restudy: Config = {
	label: '复习模式',
	attrs: { title: '已经完成的视频继续学习', type: 'checkbox' },
	defaultValue: false
};

/** 清晰度配置 */
export const definition: Config = {
	label: '清晰度',
	tag: 'select',
	defaultValue: 'line1bq',
	onload() {
		this.append(
			...$creator.selectOptions(this.getAttribute('value'), [
				['line1bq', '流畅'],
				['line1gq', '高清']
			])
		);
	}
};

/** 开启自动答题 */
export const auto: Config = {
	label: '开启自动答题',
	attrs: { type: 'checkbox' },
	defaultValue: false
};

/** 答题提示 */
export const workNotes = {
	defaultValue: $creator.notes([
		'自动答题前请在 “通用-全局设置” 中设置题库配置。',
		'可以搭配 “通用-在线搜题” 一起使用。'
	]).outerHTML
} as Config<any, string>;
