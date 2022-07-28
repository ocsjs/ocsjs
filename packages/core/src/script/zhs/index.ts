import { createNote, createSearchResultPanel, createTerminalPanel } from '../../components';
import { ExamSettingPanel } from '../../components/cx/ExamSettingPanel';
import { message } from '../../components/utils';
import { CreditWorkSettingPanel } from '../../components/zhs/CreditWorkSettingPanel';
import { StudySettingPanel } from '../../components/zhs/StudySettingPanel';
import { WorkSettingPanel } from '../../components/zhs/WorkSettingPanel';
import { defineScript } from '../../core/define.script';
import { sleep } from '../../core/utils';
import { logger } from '../../logger';
import { useSettings } from '../../store';
import { creditStudy, study } from './study';
import { creditWork, workOrExam } from './work';

export const ZHSScript = defineScript({
	name: '知道智慧树',
	routes: [
		{
			name: '共享课视频脚本',
			url: '**zhihuishu.com/stuStudy**',
			async onload() {
				const settings = useSettings().zhs.video;
				await sleep(5000);
				settings.creditStudy = false;
				// 智慧树视频学习
				logger('info', '开始智慧树共享课视频学习');
				await study();
			}
		},
		{
			name: '共享课作业脚本',
			url: '**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**',
			async onload() {
				await sleep(5000);
				const { common } = useSettings();
				if (common.answererWrappers.length === 0) {
					logger('error', '未设置题库配置！');
					message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
				} else {
					/** 运行作业脚本 */
					await workOrExam('work');
				}
			}
		},
		{
			name: '共享课作业考试提醒脚本',
			url: ['**zhihuishu.com/stuExamWeb.html#/webExamList?**'],
			onload: () => message('warn', '考试功能属于测试阶段，可能无法使用，大家预留好其他搜题方式。')
		},
		{
			name: '共享课考试脚本',
			url: '**zhihuishu.com/stuExamWeb.html#/webExamList/doexamination*',
			async onload() {
				const { common } = useSettings();
				await sleep(5000);
				if (common.answererWrappers.length === 0) {
					logger('error', '未设置题库配置！');
					message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
				} else {
					/** 运行考试脚本 */
					await workOrExam('exam');
				}
			}
		},
		{
			name: '学分课视频脚本',
			/** 学分共享课（翻转课） */
			url: '**zhihuishu.com/aidedteaching/sourceLearning/**',
			async onload() {
				const settings = useSettings().zhs.video;
				await sleep(5000);
				settings.creditStudy = true;
				// 智慧树视频学习
				logger('info', '开始智慧树学分课视频学习');
				await creditStudy();
			}
		},

		{
			name: '学分课作业脚本',
			url: '**zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList**',
			async onload() {
				const { common } = useSettings();
				await sleep(5000);
				if (common.answererWrappers.length === 0) {
					logger('error', '未设置题库配置！');
					message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
				} else {
					/** 运行作业脚本 */
					await creditWork();
				}
			}
		},
		{
			name: '文字识别脚本',
			url: [
				'**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**',
				'**zhihuishu.com/stuExamWeb.html#/webExamList/doexamination*'
			],
			async onload() {
				setTimeout(() => {
					for (const div of Array.from(document.querySelectorAll('.subject_describe > div'))) {
						// @ts-ignore
						div.__vue__.$el.innerHTML = div.__vue__._data.shadowDom.textContent;
					}
				}, 3000);
			}
		},
		{
			name: '视频守护脚本',
			url: ['**zhihuishu.com/stuStudy**'],
			onload() {
				// @ts-ignore
				const study = document.querySelector('.video-study').__vue__;
				const empty = () => {};
				// @ts-ignore
				study.checkout = empty;
				// @ts-ignore
				study.notTrustScript = empty;
				// @ts-ignore
				study.checkoutNotTrustScript = empty;
				// @ts-ignore
				const _videoClick = study.videoClick;
				// @ts-ignore
				study.videoClick = function (...args) {
					args[args.length - 1] = { isTrusted: true };
					// @ts-ignore
					return _videoClick.apply(study, args);
				};
			}
		}
	],
	panels: [
		{
			name: '智慧树助手',
			url: 'https://www.zhihuishu.com/',
			el: () => createNote('提示您:', '点击登录后, 进入个人页面才能使用其他的功能哦。')
		},
		{
			name: '智慧树助手',
			url: 'https://onlineweb.zhihuishu.com/onlinestuh5',
			el: () => createNote('提示您:', '请点击任意的课程进入。')
		},
		{
			name: '共享课视频助手',
			/** 共享课 */
			url: '**zhihuishu.com/stuStudy**',
			el: () =>
				createNote(
					'进入 视频设置面板 可以调整视频设置',
					'点击右侧 作业考试 可以使用作业功能',
					'5秒后自动开始播放视频...'
				),
			children: [
				{
					name: '学习设置',
					el: () => StudySettingPanel
				},
				createTerminalPanel()
			]
		},
		{
			name: '共享课作业助手',
			url: '**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**',
			el: () => createNote('进入 作业设置面板 可以调整作业设置', '5秒后自动开始作业...'),
			children: [
				{
					name: '作业设置',
					el: () => WorkSettingPanel
				},
				createTerminalPanel(),
				createSearchResultPanel()
			]
		},
		{
			name: '共享课考试助手',
			url: '**zhihuishu.com/stuExamWeb.html#/webExamList/doexamination*',
			el: () => createNote('进入 考试设置面板 可以调整考试设置', '5秒后自动开始作业...'),
			children: [
				{
					name: '考试设置',
					el: () => ExamSettingPanel
				},
				createTerminalPanel(),
				createSearchResultPanel()
			]
		},
		{
			name: '学分课视频助手',
			/** 学分共享课（翻转课） */
			url: '**zhihuishu.com/aidedteaching/sourceLearning/**',
			el: () =>
				createNote('进入 视频设置面板 可以调整视频设置', '学分课默认1倍速, 不可修改', '5秒后自动开始播放视频...'),
			children: [
				{
					name: '学习设置',
					el: () => StudySettingPanel
				},
				createTerminalPanel()
			]
		},
		{
			name: '学分课作业助手',
			url: '**zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList**',
			el: () => createNote('进入 作业设置面板 可以调整作业设置', '5秒后自动开始作业...'),
			children: [
				{
					name: '作业设置',
					el: () => CreditWorkSettingPanel
				},
				createTerminalPanel(),
				createSearchResultPanel()
			]
		},
		{
			name: '作业考试助手',
			url: '**zhihuishu.com/stuExamWeb.html#/webExamList?**',
			el: () =>
				createNote(
					'点击任意作业可以使用作业功能',
					'考试可能不稳定，请大家预留其他搜题方式',
					'考试时如果没有显示考试设置面板，请刷新页面。'
				)
		}
	]
});
