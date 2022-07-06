import { defineComponent, ref } from 'vue';

import { switchPlaybackRate } from '../../script/zjooc/study';
import { useContext, useSettings } from '../../store';
import { Tooltip } from '../Tooltip';

export const StudySettingPanel = defineComponent({
  setup () {
    const settings = useSettings().zjooc.video;
    const ctx = useContext();

    // 切换倍速防抖
    const switching = ref(false);

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">
          <label>视频倍速 </label>
          <div>
            <Tooltip title="最高4倍速">
              <input type="range"
                step="0.25"
                max="4"
                min="0.5"
                value={settings.playbackRate}
                disabled={switching.value}
                onChange={async (e:any) => {
                  switching.value = true;
                  settings.playbackRate = e.target.valueAsNumber;
                  await switchPlaybackRate(settings.playbackRate);
                  switching.value = false;
                }}></input>
            </Tooltip>
            <span>{settings.playbackRate}x</span>
          </div>

          <label>音量调节</label>
          <div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onInput={(e: any) => {
                settings.volume = e.target.valueAsNumber;
                if (ctx.common.currentMedia) ctx.common.currentMedia.volume = e.target.valueAsNumber;
              }}
            ></input>
            <span> {Math.round(settings.volume * 100)}% </span>
          </div>

          <label>复习模式</label>
          <div>
            <Tooltip title="将播放过的视频再播放一遍。">
              <input
                class="input-switch"
                type="checkbox"
                checked={settings.restudy}
                onChange={(e: any) => (settings.restudy = e.target.checked)}
              ></input>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
});
