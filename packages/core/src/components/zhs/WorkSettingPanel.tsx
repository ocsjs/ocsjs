import { defineComponent } from 'vue';
import { createWorkerSetting } from '..';
import { useSettings } from '../../store';

import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const WorkSettingPanel = defineComponent({

  setup (props, { slots }) {
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
                  selected: settings.upload

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
