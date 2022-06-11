import { defineComponent } from 'vue';
import { useSettings } from '../../store';
import { WorkerSetting } from '../WorkerSetting';
import { CommonWorkSettingPanel } from './CommonWorkSettingPanel';

export const ExamSettingPanel = defineComponent({
  setup () {
    const settings = useSettings().zhs.exam;

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <CommonWorkSettingPanel
            settings={settings}
            v-slots={{
              upload: (
                <WorkerSetting
                  label='自动答题'
                  config={{
                    selected: 'close',
                    options: [
                      {
                        label: '请自行检查后自行点击提交',
                        value: 'close'
                      }
                    ]
                  }}
                  changeHandler={(e: any) => (settings.upload = e.target.value)}
                />
              )
            }}>
          </CommonWorkSettingPanel>

        </div>
      </div>

    );
  }
});
