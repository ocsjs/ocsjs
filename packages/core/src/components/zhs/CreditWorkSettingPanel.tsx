import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { useSettings } from '../../store';

import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const CreditWorkSettingPanel = defineComponent({

  setup () {
    const settings = useSettings().zhs.work;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <CommonWorkSettingPanel
            settings={settings}
            v-slots={{
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
          </CommonWorkSettingPanel>
        </div>
      </div>

    );
  }
});
