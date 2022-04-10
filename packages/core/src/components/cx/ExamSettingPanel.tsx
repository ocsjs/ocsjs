import { defineComponent } from "vue";
import { createWorkerSetting } from "..";
import { store } from "../../script";

const settings = store.setting.cx.exam;

export const ExamSettingPanel = defineComponent({
    render() {
        return (
            <div class="ocs-setting-panel">
                <div class="ocs-setting-items">
                    {createWorkerSetting(
                        "作业提交",
                        {
                            selected: "close",
                            options: [
                                {
                                    label: "请自行检查后自行点击提交",
                                    value: "close",
                                },
                            ],
                        },
                        (e: any) => (settings.upload = e.target.value)
                    )}

                    <label>答题间隔(秒)</label>
                    <div>
                        <input
                            type="number"
                            value={settings.period}
                            min="0"
                            step="1"
                            onChange={(e: any) => {
                                settings.period = e.target.valueAsNumber;
                            }}
                        />
                    </div>

                    <label>搜题请求超时时间(秒)</label>
                    <div>
                        <input
                            type="number"
                            title="每道题最多做n秒, 超过则跳过此题。"
                            value={settings.timeout}
                            min="0"
                            step="1"
                            onChange={(e: any) => {
                                settings.timeout = e.target.valueAsNumber;
                            }}
                        />
                    </div>

                    <label>搜题请求重试次数</label>
                    <div>
                        <input
                            type="number"
                            value={settings.retry}
                            min="0"
                            max="2"
                            step="1"
                            onChange={(e: any) => {
                                settings.retry = e.target.valueAsNumber;
                            }}
                        />
                    </div>

                    <label>发生错误时暂停答题</label>
                    <div>
                        <input
                            type="checkbox"
                            checked={settings.stopWhenError}
                            onChange={(e: any) => {
                                settings.stopWhenError = e.target.checked;
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    },
});
