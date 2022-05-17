import { createNote, createSearchResultPanel, createTerminalPanel } from '../../components';
import { ExamSettingPanel } from '../../components/cx/ExamSettingPanel';
import { message } from '../../components/utils';
import { CreditWorkSettingPanel } from '../../components/zhs/CreditWorkSettingPanel';
import { StudySettingPanel } from '../../components/zhs/StudySettingPanel';
import { WorkSettingPanel } from '../../components/zhs/WorkSettingPanel';
import { defineScript } from '../../core/define.script';
import { sleep } from '../../core/utils';
import { logger } from '../../logger';
import { store } from '../../store';
import { creditStudy, study } from './study';
import { creditWork, workOrExam } from './work';

export const ZHSScript = defineScript({
  name: '知道智慧树',
  routes: [
    {
      name: '共享课视频脚本',
      url: '**zhihuishu.com/videoStudy.html**',
      async onload(setting = store.setting.zhs.video) {
        await sleep(5000);
        setting.creditStudy = false;
        // 智慧树视频学习
        logger('info', '开始智慧树共享课视频学习');
        await study(setting);
      }
    },
    {
      name: '共享课作业脚本',
      url: '**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**',
      async onload(setting = store.setting.zhs.work) {
        await sleep(5000);
        if (store.setting.answererWrappers.length === 0) {
          logger('error', '未设置题库配置！');
          message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
        } else {
          /** 运行作业脚本 */
          await workOrExam(setting, 'work');
        }
      }
    },
    {
      name: '共享课考试提醒脚本',
      url: '**zhihuishu.com/stuExamWeb.html#/webExamList?**',
      onload: () => message('warn', '考试时如果没有显示考试设置面板，请刷新页面。')
    },
    {
      name: '共享课考试脚本',
      url: '**zhihuishu.com/stuExamWeb.html#/webExamList/doexamination*',
      async onload(setting = store.setting.zhs.exam) {
        await sleep(5000);
        if (store.setting.answererWrappers.length === 0) {
          logger('error', '未设置题库配置！');
          message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
        } else {
          /** 运行考试脚本 */
          await workOrExam(setting, 'exam');
        }
      }
    },
    {
      name: '学分课视频脚本',
      /** 学分共享课（翻转课） */
      url: '**zhihuishu.com/aidedteaching/sourceLearning/**',
      async onload(setting = store.setting.zhs.video) {
        await sleep(5000);
        setting.creditStudy = true;
        // 智慧树视频学习
        logger('info', '开始智慧树学分课视频学习');
        await creditStudy(setting);
      }
    },

    {
      name: '学分课作业脚本',
      url: '**zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList**',
      async onload(setting = store.setting.zhs.work) {
        await sleep(5000);
        if (store.setting.answererWrappers.length === 0) {
          logger('error', '未设置题库配置！');
          message('error', '未设置题库配置！请在设置面板设置后刷新重试！');
        } else {
          /** 运行作业脚本 */
          await creditWork(setting);
        }
      }
    },
    {
      name: '文本识别脚本',
      url: [
        '**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**',
        '**zhihuishu.com/stuExamWeb.html#/webExamList/doexamination*',
        '**zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList**'
      ],
      start() {
        // @ts-ignore
        window.Element.prototype.attachShadow = undefined;
        // @ts-ignore
        // eslint-disable-next-line no-undef
        unsafeWindow.Element.prototype.attachShadow = undefined;
      }
    },
    {
      name: '屏蔽视频检测脚本',
      url: '**zhihuishu.com/videoStudy.html**',
      start() {
        function hookAddEventListener() {
          const args = [...arguments];
          const temp = args[1];
          args[1] = function () {
            const args2 = [...arguments];
            args2[0] = new Proxy(args2[0], {
              get(target: any, p: string | symbol) {
                return p === 'isTrusted' ? true : target[p];
              }
            });
            return temp(...args2);
          };
          // @ts-ignore
          return this._addEventListener(...args);
        };
        if (Element.prototype.addEventListener !== hookAddEventListener) {
          // @ts-ignore
          Element.prototype._addEventListener = Element.prototype.addEventListener;
          Element.prototype.addEventListener = hookAddEventListener;
        }
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
      url: '**zhihuishu.com/videoStudy.html**',
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
      el: () => createNote('点击任意作业可以使用作业功能', '考试可能不稳定，请大家预留其他搜题方式', '考试时如果没有显示考试设置面板，请刷新页面。')
    }
  ]
});
