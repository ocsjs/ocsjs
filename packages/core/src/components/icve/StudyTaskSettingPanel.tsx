import { computed, defineComponent, ref } from 'vue';

import { loadTasks, nextTask } from '../../script/icve/study';
import { useSettings } from '../../store';

import { Tooltip } from '../Tooltip';
import { message } from '../utils';

export const StudyTaskSettingPanel = defineComponent({
  setup () {
    const settings = useSettings().icve.study;
    const loading = ref(false);
    // 显示加载动画
    const count = ref(0);
    setInterval(() => (count.value = count.value > 2 ? 0 : count.value + 1), 1000 / 3);
    // 是否有选中任务
    const hasCell = computed(() => settings.cells.length > 0);
    const hasTask = computed(() => settings.cells.some(cell => cell.isTask));

    return () => (
      <div class="ocs-setting-panel">
        <div class="ocs-setting-items">

          <label>操作</label>
          <div>
            <Tooltip title='点击读取任务列表，读取后勾选任务，即可点击开始学习。' containerStyle={{ width: 'fit-content' }}>
              <button
                class="ocs-btn-primary"
                disabled={loading.value}
                onClick={async () => {
                  message('info', '请等待全部任务读取完毕（为了避免验证码，此过程可能较久）');
                  loading.value = true;
                  await loadTasks();
                  loading.value = false;
                  message('success', '读取完毕!');
                }}>
                { loading.value ? '读取任务中' + '.'.repeat(count.value) : (hasCell.value ? '重新读取任务' : '读取任务') }
              </button>
            </Tooltip>
            <Tooltip
              title={ hasCell.value ? (hasTask.value ? '开始学习选中的任务' : '请选中需要学习的任务') : '任务列表为空，请先获取任务。'}
              containerStyle={{ width: 'fit-content' }}>
              <button
                class="ocs-btn-primary"
                disabled={loading.value || hasTask.value === false || hasCell.value === false}
                onClick={() => {
                  settings.isStarting = true;
                  nextTask(false);
                }}
              >
              开始学习
              </button>
            </Tooltip>
          </div>

          <label>任务列表</label>
          <div>
            {
              settings.cells.length === 0
                ? (
                  <span>暂无任务，请点击获取</span>
                )
                : (
                  <Tooltip title='勾选或者取消任务，选中的任务将会自动切换并运行。' >
                    {
                      settings.cells.map((item, index) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            id={'task_' + index.toString()}
                            style={{ marginRight: '2px' }}
                            type="checkbox"
                            checked={item.isTask}
                            onChange={(e:any) => {
                              settings.cells[index].isTask = e.target.checked;
                            }}/>
                          <label for={'task_' + index.toString()}>
                            <span >{item.categoryName.toLocaleUpperCase()}</span>
                            {' '}
                            <div style={{ display: 'inline-block', width: '30px', textAlign: 'right' }}>{item.stuCellPercent}%</div>
                            {' : '}
                            <span>{item.cellName}</span>
                          </label>
                        </div>

                      ))
                    }

                  </Tooltip>
                )
            }

          </div>

        </div>
      </div>
    );
  }
});
