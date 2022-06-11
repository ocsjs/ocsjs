import { defineComponent } from 'vue';
import { useSettings } from '../../store';
import { WorkerSetting } from '../WorkerSetting';

import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const WorkSettingPanel = defineComponent({

  setup () {
    const settings = useSettings().cx.work;
    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <CommonWorkSettingPanel
            settings={settings}
            v-slots={{
              upload: (
                <WorkerSetting
                  label='自动答题'
                  config={{ selected: settings.upload }}
                  changeHandler={(e: any) => (settings.upload = e.target.value)}
                />
              )
            }}
          >
          </CommonWorkSettingPanel>
        </div>
      </div>
    );
  }
});
