import { defineComponent, VNodeProps } from 'vue';
import { ScriptPanelChild } from '../core/define.script';

import { StringUtils } from '../core/utils';
import { AnswererWrapper } from '../core/worker/answer.wrapper.handler';
import { store } from '../store';
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
        value: 'close'
      },
      {
        label: '完成后自动保存',
        value: 'save'
      },
      {
        label: '完成后不做任何动作',
        value: 'nomove'
      },
      ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => ({
        label: `查到大于${rate}%的题目则自动提交`,
        value: rate,
        attrs: {
          title: `例如: 100题, 搜索到大于 ${rate} 的题, 则会自动提交答案。`
        }
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

  // 根据以上 vnode 变量，生成 jsx 渲染函数
  return (
    <>
      <label>{label}</label>
      <div>
        <select title="答题设置" onChange={changeHandler}>
          {options.map((option) => (
            <option value={option.value} selected={option.selected}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label>题库配置</label>
      <div>
        <Tooltip title="请复制粘贴题库配置, 点击右侧问号查看教程 ">
          <input
            type="text"
            placeholder="点击右侧问号查看教程 => "
            value={store.setting.answererWrappers.length === 0 ? '' : JSON.stringify(store.setting.answererWrappers)}
            onPaste={(e) => {
              store.setting.answererWrappers = parseAnswererWrappers(e.clipboardData?.getData('text') || '');
            }}
          ></input>
        </Tooltip>

        <span
          style={{
            color: store.setting.answererWrappers.length ? 'green' : 'red'
          }}
        >
          {store.setting.answererWrappers.length
            ? (
              <Tooltip
                v-slots={{
                  title: () => (
                    <>
                      <span>解析成功, 一共有 {store.setting.answererWrappers.length} 个题库</span>
                      <ol>
                        {store.setting.answererWrappers.map((aw) => (
                          <li>
                            <details>
                              <summary>{aw.name}</summary>
                              <ul>
                                <li>
                                主页:
                                  <a href={aw.homepage ? aw.homepage : '#'}>{aw.homepage}</a>
                                </li>
                                <li>接口: {aw.url}</li>
                                <li>请求方式: {aw.method}</li>
                                <li>数据类型: {aw.contentType}</li>
                                <li>请求类型: {aw.type}</li>
                                <li>
                                  请求头:
                                  <ul style={{ paddingLeft: '12px' }}>
                                    {Reflect.ownKeys(aw.headers || {}).map((key) => (
                                      <li>
                                        {key.toString()} ={hideToken(aw.headers?.[key.toString()] || '')}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                                <li>
                                  请求数据:
                                  <ul style={{ paddingLeft: '12px' }}>
                                    {Reflect.ownKeys(aw.data || {}).map((key) => (
                                      <li>
                                        {key.toString()} ={hideToken(aw.data?.[key.toString()] || '')}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                                <li>处理方法: {aw.handler}</li>
                              </ul>
                            </details>
                          </li>
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
              window.open('https://docs.ocsjs.com/answerer-wrappers');
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
    const aw = JSON.parse(value);
    if (aw && Array.isArray(aw)) {
      message('success', '题库配置成功！');
      return aw;
    } else {
      message('error', '题库配置格式错误！');
      return [];
    }
  } catch (e) {
    console.log(e);
    message('error', '题库配置格式错误！');
    return [];
  }
}

/** 隐藏 token， 只保留头尾的几个字符串 */
function hideToken (token: string) {
  return /[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}/.test(token) ||
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(token)
    ? StringUtils.of(token)
      .hide(4, token.length - 4)
      .toString()
    : token;
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
