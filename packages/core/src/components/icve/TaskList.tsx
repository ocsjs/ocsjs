import { defineComponent } from 'vue';
import { useSettings } from '../../store';

export const TaskList = defineComponent({
  props: {
    selectable: {
      default: true,
      type: Boolean
    }
  },
  setup(this, props, ctx) {
    const settings = useSettings().icve.study;

    return () => (
      <>
        <table>
          <thead>

            <tr>
              <th>
                <span>任务点</span>
              </th>
              <th>
                <span>类型</span>
              </th>
              <th>
                <span>进度</span>
              </th>
              <th>
                <span>名称</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              settings.cells.map((item, index) => (
                <tr>
                  <td>
                    <input
                      id={'task_' + index.toString()}
                      style={{ marginRight: '2px' }}
                      type="checkbox"
                      checked={item.isTask}
                      disabled={!props.selectable}
                      onChange={(e:any) => {
                        settings.cells[index].isTask = e.target.checked;
                      }}/>
                  </td>
                  <td>
                    {item.categoryName.toLocaleUpperCase()}
                  </td>
                  <td>
                    {item.stuCellPercent}%
                  </td>
                  <td title={item.href}>
                    <label for={'task_' + index.toString()} style={{ cursor: 'pointer' }}>
                      {item.cellName}
                    </label>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

      </>
    );
  }
});
