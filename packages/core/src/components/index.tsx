import { defineComponent, Fragment, VNodeProps } from "vue";
import { ScriptPanelChild } from "../core/define.script";

import { store } from "../script";
import { Terminal } from "./Terminal";
import { SearchResults } from "./SearchResults";
import { logger } from "../logger";

/**
 * 创建提示面板
 */
export function createNote(...notes: string[]) {
    return defineComponent({
        render() {
            return (
                <div>
                    <ul>
                        {notes.map((note) => (
                            <li>{note}</li>
                        ))}
                    </ul>
                </div>
            );
        },
    });
}

export interface CreateWorkerSettingConfig {
    /** 默认提交设置 */
    selected?: string;
    /** 自定义选项 */
    options?: {
        label: string;
        value: any;
        attrs?: (VNodeProps & Record<string, any>) | undefined;
    }[];
}

/**
 * 公共答题设置组件
 * @param label 设置备注
 * @param ref   本地设置路径
 * @param defaultUpload 默认值
 */
export function createWorkerSetting(
    label: string,
    config: CreateWorkerSettingConfig,
    changeHandler: (e: Event) => void
) {
    let options: any[] = config?.options
        ? config.options
        : [
              {
                  label: "关闭自动答题",
                  value: "close",
              },
              {
                  label: "完成后自动保存",
                  value: "save",
              },
              {
                  label: "完成后不做任何动作",
                  value: "nomove",
              },
              ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => ({
                  label: `查到大于${rate}%的题目则自动提交`,
                  value: rate,
                  attrs: {
                      title: `例如: 100题, 搜索到大于 ${rate} 的题, 则会自动提交答案。`,
                  },
              })),
              {
                  label: "每个题目都查到答案才自动提交",
                  value: 100,
              },
          ];

    options = options.map((option) => {
        if (option.value === config?.selected) {
            option.selected = true;
        }
        return option;
    });

    // 根据以上 vnode 变量，生成 jsx 渲染函数
    return (
        <Fragment>
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
                <input
                    type="text"
                    title="请复制粘贴题库配置, 点击右侧查看教程 "
                    placeholder="点击右侧问号查看教程 => "
                    value={
                        store.setting.answererWrappers.length === 0
                            ? ""
                            : JSON.stringify(store.setting.answererWrappers)
                    }
                    onChange={(e: any) => {
                        try {
                            const value = JSON.parse(e.target.value);

                            if (value && Array.isArray(value)) {
                                store.setting.answererWrappers = value;
                            } else {
                                store.setting.answererWrappers = [];
                            }
                        } catch (e) {
                            logger("error", "题库格式错误");
                            store.setting.answererWrappers = [];
                        }
                    }}
                ></input>
                <span style={{ color: store.setting.answererWrappers.length ? "green" : "red" }}>
                    {store.setting.answererWrappers.length ? (
                        <i title="题库配置正确" class="bi bi-check-circle bi-icon" />
                    ) : (
                        <i title="题库没有配置, 自动答题功能将不能使用 !" class="bi bi-x-circle bi-icon" />
                    )}
                </span>
                <i
                    class="bi bi-question-circle bi-icon"
                    title="点击查看题库配置教程"
                    onClick={() => {
                        window.open("https://enncy.github.io/online-course-script/answerer-wrappers");
                    }}
                ></i>
            </div>
        </Fragment>
    );
}

/**
 * 创建日志面板
 */
export function createTerminalPanel(): ScriptPanelChild {
    return {
        name: "日志",
        el: () => Terminal,
    };
}

/**
 * 添加题目答题结果
 */
export function createSearchResultPanel() {
    return {
        name: "搜题结果",
        el: () => SearchResults,
    };
}
