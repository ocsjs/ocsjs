import { $creator, Config, WorkUploadType } from '@ocsjs/core';
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

/** 多个答题配置 */
export const workConfigs = {
	notes: {
		defaultValue: $creator.notes([
			'自动答题前请在 “通用-全局设置” 中设置题库配置。',
			'可以搭配 “通用-在线搜题” 一起使用。'
		]).outerHTML
	} as Config<any, string>,
	auto: {
		label: '开启自动答题',
		attrs: { type: 'checkbox' },
		defaultValue: true
	} as Config<any, boolean>,

	upload: {
		label: '答题完成后',
		tag: 'select',
		defaultValue: 'save' as WorkUploadType,
		attrs: { title: '答题完成后的设置, 鼠标悬浮在选项上可以查看每个选项的具体解释。' },
		onload() {
			this.append(
				...$creator.selectOptions(this.getAttribute('value'), [
					['save', '自动保存', '完成后自动保存答案, 注意如果你开启了随机作答, 有可能分辨不出答案是否正确。'],
					['nomove', '不保存也不提交', '等待时间过后将会自动下一节, 适合在测试脚本时使用。'],
					...([10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
						rate.toString(),
						`搜到${rate}%的题目则自动提交`,
						`例如: 100题中查询到 ${rate} 题的答案,（答案不一定正确）, 则会自动提交。`
					]) as [any, string, string][]),
					['100', '每个题目都查到答案才自动提交', '答案不一定正确'],
					['force', '强制自动提交', '不管答案是否正确直接强制自动提交，如需开启，请配合随机作答谨慎使用。']
				])
			);
		}
	} as Config<any, WorkUploadType>
};
