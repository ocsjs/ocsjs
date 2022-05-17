import { defineComponent } from 'vue';
import { store } from '../../main';
import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const WorkSettingPanel = defineComponent({

  setup () {
    const settings = store.setting.cx.work;
    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <CommonWorkSettingPanel settings={settings}></CommonWorkSettingPanel>
        </div>
      </div>
    );
  }
});
