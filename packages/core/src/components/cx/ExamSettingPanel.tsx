import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../store';
import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const ExamSettingPanel = defineComponent({
  setup () {
    const settings = store.setting.cx.exam;

    return () => (
      <CommonWorkSettingPanel settings={settings} v-slots={{
        upload: createWorkerSetting(
          '自动答题',
          {
            selected: 'close',
            options: [
              {
                label: '请自行检查后自行点击提交',
                value: 'close'
              }
            ]
          },
          (e: any) => (settings.upload = e.target.value)
        )
      }}>
      </CommonWorkSettingPanel>

    );
  }
});