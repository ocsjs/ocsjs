import { defineComponent } from 'vue';
import { store } from '../../store';
import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const WorkSettingPanel = defineComponent({

  setup (props, { slots }) {
    const settings = store.setting.zhs.work;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <CommonWorkSettingPanel settings={settings} upload={settings.upload} > </CommonWorkSettingPanel>
        </div>
      </div>

    );
  }
});
