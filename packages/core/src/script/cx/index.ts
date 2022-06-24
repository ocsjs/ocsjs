import { createNote, createSearchResultPanel, createTerminalPanel } from '../../components';
import { ExamSettingPanel } from '../../components/cx/ExamSettingPanel';
import { StudySettingPanel } from '../../components/cx/StudySettingPanel';
import { WorkSettingPanel } from '../../components/cx/WorkSettingPanel';
import { message } from '../../components/utils';
import { defineScript } from '../../core/define.script';
import { domSearch, sleep, useUnsafeWindow } from '../../core/utils';
import { logger } from '../../logger';
import { useContext, useSettings } from '../../store';
import { LiveSettingPanel } from '../../components/cx/LiveSettingPanel';
import { rateHack } from './rate.hack';
import { mapRecognize, ocrRecognize } from './recognize';
import { study, switchPlayLine } from './study';
import CXAnalyses from './utils';
import { workOrExam } from './work';
import { watch } from 'vue';
import { CXSetting } from '../../scripts';

/** 需切换版本的 url 页面 */
const updateURLs = [
	'**mooc2=0**',
	'**/mycourse/studentcourse**',
	'**/work/getAllWork**',
	'**/work/doHomeWorkNew**',
	'**/exam/test?**',
	'**exam/test/reVersionTestStartNew**examsystem**'
];

export const CXScript = defineScript({
	name: '超星学习通',
	routes: [
		{
			name: '版本切换脚本',
			url: updateURLs,
			async onload() {
				if (top === window) {
					message(
						'warn',
						'OCS网课助手不支持旧版超星, 即将切换到超星新版, 如有其他第三方插件请关闭, 可能有兼容问题频繁频繁切换。'
					);
					// 跳转到最新版本的超星
					await sleep(1000);
					const experience = document.querySelector('.experience') as HTMLElement;
					if (experience) {
						experience.click();
					} else {
						const params = new URLSearchParams(window.location.href);
						params.set('mooc2', '1');
						// 兼容考试切换
						params.set('newMooc', 'true');
						params.delete('examsystem');
						window.location.replace(decodeURIComponent(params.toString()));
					}
				}
			}
		},
		{
			name: '屏蔽倍速限制',
			url: '**/ananas/modules/video/**',
			onstart() {
				console.log('屏蔽倍速限制启动');
				rateHack();
			}
		},

		{
			name: '任务切换脚本',
			url: '**/mycourse/studentstudy**',
			onload() {
				// 开始任务切换
				const { restudy } = useSettings().cx.study;

				if (restudy) {
					logger('debug', '当前为复习模式，将会从当前章节往下学习!');
				} else {
					// 如果不是复习模式，则寻找需要运行的任务
					const params = new URLSearchParams(window.location.href);
					const mooc = params.get('mooc2');
					/** 切换新版 */
					if (mooc === null) {
						params.set('mooc2', '1');
						window.location.replace(decodeURIComponent(params.toString()));
						return;
					}

					let chapters = CXAnalyses.getChapterInfos();

					chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);

					if (chapters.length === 0) {
						logger('warn', '页面任务点数量为空! 请刷新重试!');
					} else {
						const params = new URLSearchParams(window.location.href);
						const courseId = params.get('courseId');
						const classId = params.get('clazzid');
						setTimeout(() => {
							// @ts-ignore 进入需要进行的章节
							// eslint-disable-next-line no-undef
							getTeacherAjax(courseId, classId, chapters[0].chapterId);
						}, 1000);
					}
				}
			}
		},
		{
			name: '学习脚本',
			url: '**/knowledge/cards**',
			async onload() {
				logger('info', '开始学习');
				await sleep(5000);

				const settings = useSettings().cx.study;

				/** 监听跨域顶层的设置修改 */
				watch([() => settings.playbackRate, () => settings.volume], () => {
					// 实时更新媒体设置
					const ctx = useContext();
					if (ctx.common.currentMedia) {
						// 倍速设置
						ctx.common.currentMedia.playbackRate = settings.playbackRate;
						// 音量设置
						ctx.common.currentMedia.volume = settings.volume;
						if (ctx.cx.videojs && settings.line) {
							// 切换线路
							switchPlayLine(settings, ctx.cx.videojs, ctx.common.currentMedia, settings.line);
						}
					}
				});

				/** 监听跨域顶层的设置修改 */
				watch([() => settings.line], () => {
					// 实时更新媒体设置
					const ctx = useContext();
					if (ctx.common.currentMedia && ctx.cx.videojs && settings.line) {
						// 切换线路
						switchPlayLine(settings, ctx.cx.videojs, ctx.common.currentMedia, settings.line);
					}
				});

				await study();
			}
		},
		{
			/** iframe 跨域问题， 必须在 iframe 中执行 ， 所以脱离学习脚本运行。 */
			name: '阅读脚本',
			url: '**/readsvr/book/mooc**',
			onload() {
				console.log('阅读脚本启动');
				setTimeout(() => {
					// @ts-ignore
					// eslint-disable-next-line no-undef
					readweb.goto(epage);
				}, 5000);
			}
		},
		{
			name: '作业脚本',
			url: '**/mooc2/work/dowork**',
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
			name: '整卷预览脚本',
			url: '**/exam/test/reVersionTestStartNew**',
			async onload() {
				message('warn', '即将自动切换到整卷预览。。。');
				await sleep(3000);
				// @ts-ignore
				// eslint-disable-next-line no-undef
				topreview();
			}
		},
		{
			name: '考试脚本',
			url: '**/mooc2/exam/preview**',
			async onload() {
				await sleep(5000);
				const { common } = useSettings();
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
			name: '屏蔽作业考试填空简答题粘贴限制',
			url: ['**/mooc2/exam/preview**', '**/mooc2/work/dowork**', '**/work/doHomeWorkNew/**'],
			onload() {
				try {
					// @ts-ignore
					// eslint-disable-next-line no-undef
					const EDITORUI = $EDITORUI;
					for (const key in EDITORUI) {
						const ui = EDITORUI[key];
						// eslint-disable-next-line no-proto
						if (ui.__proto__.uiName === 'editor') {
							// @ts-ignore
							// eslint-disable-next-line no-undef
							ui.editor.removeListener('beforepaste', editorPaste);
						}
					}
				} catch (e) {
					console.log('屏蔽作业考试粘贴限制错误', e);
				}
			}
		},
		{
			name: '繁体字识别脚本',
			url: [
				'**/mycourse/studentstudy**',
				'**/work/doHomeWorkNew**',
				'**/mooc2/exam/preview**',
				'**/mooc2/work/dowork**'
			],
			async onload() {
				const { recognize } = useSettings().cx.common;
				if (recognize === 'map') {
					mapRecognize();
				} else if (recognize === 'ocr') {
					ocrRecognize();
				} else {
					logger('debug', '繁体字识别已被关闭，可能会导致繁体字出现。');
				}
			}
		},
		{
			name: '图片识别脚本',
			url: ['**/work/doHomeWorkNew**', '**/mooc2/exam/preview**', '**/mooc2/work/dowork**'],
			onload() {
				document.body.querySelectorAll('img').forEach((img) => {
					const div = document.createElement('div');
					div.style.display = 'none';
					div.textContent = img.src;
					img.after(div);
				});
			}
		},
		{
			name: '直播回放脚本',
			url: '**zhibo.chaoxing.com**',
			async onload() {
				/** 移除页面输出 */
				// @ts-ignore
				useUnsafeWindow().console.info = () => {};
				// @ts-ignore
				useUnsafeWindow().console.log = () => {};

				await sleep(5000);
				const video = document.querySelector('video');
				const settings = useSettings().cx.live;

				if (video) {
					video.play();
					setLive(video, settings);
					watch(settings, () => {
						setLive(video, settings);
					});
				}

				/** 设置直播 */
				function setLive(video: HTMLVideoElement, settings: CXSetting['live']) {
					video.volume = settings.volume;
					video.playbackRate = settings.playbackRate;
					const { bar } = domSearch({ bar: '.vjs-control-bar' });
					if (bar) {
						bar.style.opacity = settings.showProgress ? '1' : '0';
					}
				}
			}
		}
	],
	panels: [
		{
			name: '版本切换助手',
			url: updateURLs,
			el: () => createNote('必须切换到最新版本才能使用此脚本', '请寻找 `体验新版` 的按钮, 并点击。')
		},
		{
			name: '超星助手',
			url: '**/space/index**',

			el: () => createNote('提示您:', '请点击任意的课程进入。')
		},
		{
			name: '直播回放小助手',
			url: '**zhibo.chaoxing.com**',
			el: () => createNote('提示您:', '进入直播设置调整倍速及音量'),
			children: [
				{
					name: '直播设置',
					el: () => LiveSettingPanel
				},
				createTerminalPanel()
			]
		},
		{
			name: '学习助手',
			url: '**/mycourse/**pageHeader=1**',
			el: () => createNote('提示您:', '请点击任意的章节进入学习。')
		},
		{
			name: '作业助手',
			url: '**/mycourse/**pageHeader=8**',
			el: () => createNote('提示您:', '请点击任意的作业进入。')
		},
		{
			name: '考试助手',
			url: '**/mycourse/**pageHeader=9**',
			el: () => createNote('提示您:', '请点击任意的考试进入。')
		},
		{
			name: '学习助手',
			url: '**/mycourse/studentstudy**',

			el: () => createNote('📢 进入设置面板可以调整学习设置', '章节栏你随便点, 脚本卡了算我输。', '5秒后将自动开始...'),
			children: [
				{
					name: '学习设置',
					el: () => StudySettingPanel
				},
				createTerminalPanel(),
				createSearchResultPanel()
			]
		},
		{
			name: '作业助手',
			url: '**/mooc2/work/dowork**',
			el: () => createNote('进入设置面板可以调整作业设置', '5秒后将自动开始...'),
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
			name: '考试助手',
			url: '**/mooc2/exam/preview**',
			el: () => createNote('进入设置面板可以调整考试设置', '5秒后将自动开始...'),
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
			name: '考试助手',
			url: '**/exam/test/reVersionTestStartNew**',
			el: () => createNote('注意！ 即将切换到整卷预览页面， 然后才可以自动考试！')
		}
	]
});
