import { $ui, Config } from 'easy-us';
import { definition, restudy, volume } from './configs';

/**
 * 智慧树学习脚本通用配置。
 *
 * 智慧树平台的多个学习脚本（共享课 / 新形态课程 / 校内课 / 新智慧学习 / AI 教学空间）已收敛到
 * 统一的命名空间 `zhs.study` 下，因此这些通用配置只需要在任意一个学习脚本中设置一次，
 * 即可在所有智慧树学习脚本中生效。
 */

/**
 * 智慧树学习倍速配置。
 * 说明：智慧树倍速最高只能 1.5x，超出存在封号风险，因此与 utils/configs 中的通用倍速配置（最高 16x）区分。
 */
export const playbackRate: Config = {
	label: '视频倍速',
	tag: 'select',
	attrs: { title: '目前智慧树倍速最高只能1.5x，超出有封号风险' },
	defaultValue: 1,
	options: [
		['1', '1 x'],
		['1.25', '1.25 x'],
		['1.5', '1.5 x']
	]
};

/** 视频黑屏时自动刷新配置 */
export const reloadWhenError: Config = {
	label: '视频黑屏时自动刷新',
	attrs: { type: 'checkbox', title: '当视频出现加载失败，或者黑屏等异常时，自动刷新页面3次尝试修复' },
	defaultValue: true
};

/** 智慧树学习脚本统一使用提示（合并各平台公共提示） */
export const studyNotes: Config = {
	defaultValue: $ui.notes([
		'请手动进入视频、作业、考试页面，脚本会自动运行。',
		'章节测试/掌握度请大家观看完视频后手动打开。',
		[
			'请大家仔细打开视频上方的“学前必读”，查看成绩分布。',
			'如果“平时成绩-学习习惯成绩”占比多的话，就需要规律学习。',
			'每天定时半小时可获得一分习惯分，如不需要可忽略。'
		],
		'不要最小化浏览器/关闭电脑屏幕，可能导致脚本暂停。',
		'请使用时关闭卡巴斯基软件，否则会被检测出异常脚本。',
		'运行中请将浏览器缩放调整至适合的大小（例如 50%），避免元素遮挡导致无法点击。',
		'兴趣课会自动下一个，所以不提供脚本。'
	]).outerHTML
};

/** 智慧树作业考试脚本统一使用提示 */
export const workNotes: Config = {
	defaultValue: $ui.notes([
		'自动答题前请在 “通用-全局设置” 中设置题库配置。',
		'可以搭配 “通用-在线搜题” 一起使用。',
		'⚠️ 如果没开始答题，请尝试刷新页面。',
		'⚠️ 禁止一次性打开多个作业/考试页面。',
		['⚠️ 答题中请勿进行任何操作，如需暂停请', '等待全部题目搜索完成并执行自动保存功能后再操作。']
	]).outerHTML
};

/** 作业答题开始延迟 */
export const workDelay: Config = {
	label: '作业答题开始时间延迟（秒）',
	defaultValue: 3,
	attrs: { type: 'number', min: '1', step: '1', max: '10' }
};

/** 共享课考前/作业须知阅读确认 */
export const readNotes: Config = {
	defaultValue: false
};

/** 共享课-学习脚本独有：定时停止（仅共享课系列学习页面生效） */
export const stopTime: Config = {
	label: '定时停止',
	tag: 'select',
	attrs: {
		title:
			'到时间后自动暂停脚本。仅在共享课系列学习页面生效：\n共享课学习页面(studyvideoh5.zhihuishu.com)、\n新共享课学习页面(studyplush5.zhihuishu.com)、\n新版AI课页面(fusioncourseh5.zhihuishu.com/stuStudy)、\n2025-9月新智慧共享课学习页面(studywisdomh5.zhihuishu.com/study/index)。其它学习平台（新形态/校内课/新智慧/AI教学空间）不受此配置影响。'
	},
	defaultValue: '0',
	options: [
		['0', '关闭'],
		['0.5', '半小时后'],
		['1', '一小时后'],
		['2', '两小时后']
	]
};

/** 新形态课程-学习脚本独有：跳转模式（仅新形态课程学习页面生效） */
export const switchMode: Config = {
	label: '跳转模式',
	tag: 'select',
	attrs: {
		title:
			'章节跳转方式。仅在新形态课程学习页面生效：\nsmartcoursestudent.zhihuishu.com \n及其新域名 ai-smart-course-student-pro.zhihuishu.com 的学习页/课程首页。其它学习平台（共享课/校内课/新智慧/AI教学空间）不受此配置影响。'
	},
	defaultValue: 'job' as 'job' | 'all',
	options: [
		['job', '只跳转必学章节', '章节后面有必学，并且必学数量未完成的章节，如果全部完成将停止学习'],
		['all', '顺序跳转']
	]
};

/** 新智慧学习-学习脚本独有：忽略习惯分弹窗（仅新智慧学习页面生效） */
export const skipStudyTimeWarnDialog: Config = {
	label: '忽略习惯分弹窗',
	attrs: {
		title:
			'忽略学习时长达到习惯分时弹出的提示弹窗。仅在\n新智慧学习页面(wisdom-mooc.zhihuishu.com/study/index)生效。开启后将不再弹出习惯分提示，但如果课程有习惯分需要自行控制学习时长，忽略提示可能拿不到习惯分。',
		type: 'checkbox'
	},
	defaultValue: false
};

/**
 * 学习设置中心统一展示的完整配置。
 * 各 key 虽然也会在被隐藏的运行脚本中声明，但因同属 `zhs.study` 命名空间，存储值完全一致，
 * 用户只需在设置中心修改一次即可。
 */
export const studyCenterConfigs: Record<string, Config> = {
	notes: studyNotes,
	playbackRate,
	volume,
	definition,
	restudy,
	reloadWhenError,
	stopTime: { ...stopTime, separator: '平台相关高级选项（仅在对应学习页生效）' },
	switchMode,
	skipStudyTimeWarnDialog
};

/**
 * 作业考试设置中心统一展示的完整配置。
 * 使用 `zhs.work` 命名空间。
 */
export const workCenterConfigs: Record<string, Config> = {
	notes: workNotes,
	workDelay,
	readNotes
};
