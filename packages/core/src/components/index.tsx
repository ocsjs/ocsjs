import { defineComponent, VNodeProps } from 'vue';
import { ScriptPanelChild } from '../core/define.script';

import { AnswererWrapper } from '../core/worker/answer.wrapper.handler';
import { useSettings } from '../store';
import { SearchResults } from './SearchResults';
import { Terminal } from './Terminal';
import { Tooltip } from './Tooltip';
import { message } from './utils';

/**
 * 创建提示面板
 */
export function createNote (...notes: string[]) {
  return defineComponent({
    render () {
      return (
        <div>
          <ul>
            {notes.map((note) => (
              <li>{note}</li>
            ))}
          </ul>
        </div>
      );
    }
  });
}

export interface CreateWorkerSettingConfig {
  /** 默认提交设置 */
  selected?: string
  /** 自定义选项 */
  options?: {
    label: string
    value: any
    attrs?: (VNodeProps & Record<string, any>) | undefined
  }[]
}

/**
 * 公共答题设置组件
 * @param label 设置备注
 * @param ref   本地设置路径
 * @param defaultUpload 默认值
 */
export function createWorkerSetting (
  label: string,
  config: CreateWorkerSettingConfig,
  changeHandler: (e: Event) => void
) {
  let options: any[] = config?.options
    ? config.options
    : [
      {
        label: '关闭自动答题',
        value: 'close',
        title: '关闭自动答题后, 脚本将忽略答题, 自动进入下一节。'
      },
      {
        label: '完成后自动保存',
        value: 'save',
        title: '完成后自动保存答案, 注意如果你开启了随机作答, 有可能分辨不出答案是否正确。'
      },
      {
        label: '完成后不做任何动作',
        value: 'nomove',
        title: '完成后既不保存也不提交, 等待时间过后将会自动下一节, 适合在测试脚本时使用。'
      },
      {
        label: '强制自动提交',
        value: 'force',
        title: '不管答案是否正确直接强制自动提交，如需开启，请配合随机作答谨慎使用。'

      },
      ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => ({
        label: `查到大于${rate}%的题目则自动提交`,
        value: rate,
        title: `例如: 100题, 搜索到大于 ${rate} 的题, 则会自动提交答案。`
      })),
      {
        label: '每个题目都查到答案才自动提交',
        value: 100
      }
    ];

  options = options.map((option) => {
    config.selected = config?.selected || 'close';
    if (option.value === config.selected || String(option.value) === config.selected) {
      option.selected = true;
    }
    return option;
  });

  const { common } = useSettings();

  return (
    <>
      <label>{label}</label>
      <div>
        <Tooltip title="答题设置, 鼠标悬浮在选项上可以查看每个选项的具体解释。">

          <select onChange={(e) => {
            changeHandler(e);
          }}>
            {options.map((option) => (
              <option title={option.title} value={option.value} selected={option.selected}>
                {option.label}
              </option>
            ))}
          </select>
        </Tooltip>
      </div>

      <label>题库配置</label>
      <div>
        <Tooltip title="请复制粘贴题库配置, 点击右侧问号查看教程\n(如需覆盖直接复制粘贴新的即可) ">
          <input
            type="text"
            placeholder="点击右侧问号查看教程 => "
            value={ common.answererWrappers.length === 0 ? '' : JSON.stringify(common.answererWrappers)}
            onPaste={async(e) => {
              const text = e.clipboardData?.getData('text') || await navigator.clipboard.readText() || '';
              common.answererWrappers = parseAnswererWrappers(text);
              console.log('common', { common });
            }}
          ></input>
        </Tooltip>

        <span
          style={{
            color: common.answererWrappers.length ? 'green' : 'red'
          }}
        >
          { common.answererWrappers.length
            ? (
              <Tooltip
                v-slots={{
                  title: () => (
                    <>
                      <span>解析成功, 一共有 { common.answererWrappers.length} 个题库</span>
                      <ol>
                        { common.answererWrappers.map((aw) => (
                          <li>{aw.name}</li>
                        ))}
                      </ol>
                    </>
                  )
                }}
              >
                <span class="pointer">✅</span>
              </Tooltip>
            )
            : (
              <Tooltip title="题库没有配置, 自动答题功能将不能使用 !">
                <span class="pointer">❌</span>
              </Tooltip>
            )}
        </span>
        <span>
          <Tooltip title="点击查看题库配置教程">
            <span class="pointer" onClick={() => {
              window.open('https://docs.ocsjs.com/docs/work');
            }}>
              ❓
            </span>
          </Tooltip>
        </span>
      </div>

    </>
  );
}

function parseAnswererWrappers (value: string): AnswererWrapper[] {
  try {
    const aw: AnswererWrapper[] = JSON.parse(value);
    if (aw && Array.isArray(aw)) {
      if (aw.length) {
        if (aw.every((item) => item.url && item.handler)) {
          message('success', '题库配置成功！');
          return aw;
        } else {
          message('error', '题库缺少必要参数: `url` 或 `handler` ');
        }
      } else {
        message('error', '题库为空！');
      }
      return aw;
    } else {
      message('error', '题库配置格式错误！');
    }
  } catch (e) {
    console.log(e);
    message('error', '题库配置格式错误！');
  }

  return [];
}

/**
 * 创建日志面板
 */
export function createTerminalPanel (): ScriptPanelChild {
  return {
    name: '日志',
    priority: -999,
    el: () => Terminal
  };
}

/**
 * 添加题目答题结果
 */
export function createSearchResultPanel () {
  return {
    name: '搜题结果',
    el: () => SearchResults
  };
}
