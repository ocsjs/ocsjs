import { $ui, Config } from 'easy-us';
import { volume } from './configs';

/**
 * 中国大学MOOC学习脚本通用配置。
 *
 * 旧版学习脚本（study）与新版智慧慕课（study_v2）已收敛到统一的命名空间 `icourse.study` 下，
 * 因此这些通用配置只需要在任意一个学习脚本中设置一次，即可在两个学习脚本中生效。
 */

/** 中国大学MOOC学习脚本统一使用提示（两脚本提示一致） */
export const studyNotes: Config = {
	defaultValue: $ui.notes([
		'请勿在使用过程中最小化浏览器',
		'自动讨论默认关闭，如需开启请在下方设置中设置',
		'作业请完成课程后手动进入'
	]).outerHTML
};

/** PPT 翻阅速度 */
export const readSpeed: Config = {
	label: 'PPT翻阅速度（秒）',
	attrs: { type: 'number', step: '1', min: '1', max: '10' },
	defaultValue: 1
};

/**
 * 中国大学学习倍速配置。
 */
export const playbackRate: Config = {
	label: '视频倍速',
	tag: 'select',
	defaultValue: 1,
	options: [
		['1', '1 x'],
		['1.25', '1.25 x'],
		['1.5', '1.5 x']
	]
};

/**
 * 讨论自动回复方式。
 *
 * 选项合并自旧版（study）与新版智慧慕课（study_v2），其中「随机抽取评论」原先仅智慧慕课支持，
 * 整合后旧版学习脚本同样支持。默认值取保守的「不讨论回复」，避免未经确认自动发布评论。
 */
export const discussionStrategy: Config = {
	label: '讨论自动回复方式',
	tag: 'select',
	attrs: {
		title: '在课程讨论任务点中自动回复评论的方式，默认为不回复，如需自动回复请手动选择。'
	},
	defaultValue: 'not-reply' as 'not-reply' | 'random' | 'max-show-up' | 'max-fav' | 'use-newest',
	options: [
		['not-reply', '不讨论回复'],
		['random', '随机抽取评论区的内容进行回复'],
		['max-show-up', '获取出现最多的评论进行回复'],
		['max-fav', '获取最多点赞的评论进行回复'],
		['use-newest', '获取最新的评论进行回复']
	]
};

/** 随堂测验自动答题 */
export const enableChapterTest: Config = {
	label: '随堂测验自动答题',
	attrs: {
		type: 'checkbox',
		title: '是否开启随堂测验自动答题，默认关闭，测试时只需点击即可完成测验，但这里保留选项防止需要开启。'
	},
	defaultValue: false
};

/**
 * 学习设置中心统一展示的完整配置。
 * 各 key 虽然也会在被隐藏的运行脚本中声明，但因同属 `icourse.study` 命名空间，存储值完全一致，
 * 用户只需在设置中心修改一次即可。
 *
 * 注意：不包含 `runAtHash`（旧版脚本调度器内部使用的调度配置，不应展示给用户修改）。
 */
export const icourseStudyCenterConfigs: Record<string, Config> = {
	notes: studyNotes,
	playbackRate,
	volume,
	readSpeed,
	discussionStrategy,
	enableChapterTest
};
