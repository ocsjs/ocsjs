import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { store } from '../../script';
import { WorkSettingPanel } from './WorkSettingPanel';

export const CreditWorkSettingPanel = defineComponent({
  setup () {
    const settings = store.setting.zhs.work;

    return () => (
      <WorkSettingPanel v-slots={{
        upload: createWorkerSetting(
          '自动答题',
          {
            selected: settings.upload,
            options: [
              { value: 'nomove', label: '完成后请自行检查并提交' }
            ]
          },
          (e: any) => (settings.upload = e.target.value)
        )
      }}>
      </WorkSettingPanel>
    );
  }
});
