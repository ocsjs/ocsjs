import { computed, defineComponent, ref } from 'vue';
import { loadTasks, nextTask } from '../../script/icve/study';
import { useSettings } from '../../store';
import { TaskList } from './TaskList';
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
      <>
        <div style={{ display: 'flex' }}>
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
              onClick={() => nextTask()}
            >
              开始学习
            </button>
          </Tooltip>
        </div>
        <hr/>
        <div>
          {
            settings.cells.length === 0
              ? (
                <span>暂无任务，请点击获取</span>
              )
              : (
                <Tooltip title='勾选或者取消任务，选中的任务将会自动切换并运行。' >
                  <TaskList />
                </Tooltip>
              )
          }
        </div>
      </>

    );
  }
});
