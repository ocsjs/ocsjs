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
							<th>
								<span>操作</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{settings.cells.map((item, index) => (
							<tr>
								<td>
									<input
										id={'task_' + index.toString()}
										style={{ marginRight: '2px' }}
										type="checkbox"
										checked={item.isTask}
										disabled={!props.selectable}
										onChange={(e: any) => {
											settings.cells[index].isTask = e.target.checked;
										}}
									/>
								</td>
								<td>{item.categoryName.toLocaleUpperCase()}</td>
								<td>{item.stuCellPercent || item.stuCellFourPercent}%</td>
								<td title={item.href}>
									<label
										for={'task_' + index.toString()}
										style={{ cursor: 'pointer' }}
									>
										{item.cellName}
										<span style={{ fontWeight: 'bold' }}>
											{settings.cells.find((cell) => cell.isTask)?.Id === item.Id ? ' (下个任务)' : ''}
										</span>
									</label>
								</td>
								<td title={item.href}>
									<a href={item.href}>进入</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	}
});
