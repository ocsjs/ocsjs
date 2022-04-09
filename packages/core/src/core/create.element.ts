import { defaults } from "lodash";
import {
    DefineComponent,
    defineComponent,
    defineCustomElement,
    h,
    isVNode,
    VNode,
    VNodeArrayChildren,
    VNodeProps,
} from "vue";
import { togglePanel } from "./utils";
/**
 * 创建自定义元素
 */
export function createCustomElement(name: string, element: any) {
    let Element = defineCustomElement(typeof element === "function" ? element() : element);
    const el = customElements.get(name);
    if (el) {
        return new el();
    } else {
        customElements.define(name, Element);
        return new Element();
    }
}

/**
 * 创建提示面板
 */
export function createNote(...notes: string[]) {
    return h(
        "div",
        h(
            "ul",
            notes.map((note) => h("li", note))
        )
    );
}

export function createHeaders(children: string | number | boolean | VNode | VNodeArrayChildren) {
    return h(
        "div",
        {
            class: "ocs-panel-header draggable",
        },
        children
    );
}

export function createContainers(children: string | number | boolean | VNode | VNodeArrayChildren) {
    return h(
        "div",
        {
            class: "ocs-panel-container",
        },
        children
    );
}

export function createFooter() {
    return h(
        "div",
        {
            class: "ocs-panel-footer draggable",
        },
        [
            h(
                "span",
                {
                    class: "hide-btn",
                    style: { float: "left", cursor: "pointer" },
                    onClick() {
                        togglePanel();
                    },
                },
                "点击隐藏"
            ),
            h("span", { class: "ocs-tip" }, `OCS网课助手 ${OCS.VERSION}`),
            h("img", {
                class: "ocs-icon",
                src: "https://cdn.ocs.enncy.cn/logo.png",
                title: "双击展开",
                onclick(e: any) {
                    e.stopPropagation();
                },
                ondblclick(e: any) {
                    e.stopPropagation();
                    togglePanel();
                },
            }),
        ]
    );
}

/**
 * 创建设置面板
 */

export function createSettingPanel(...settingItems: FormType[]): DefineComponent {
    return defineComponent({
        render() {
            return h("form", [
                h(
                    "div",
                    {
                        class: "ocs-setting-items",
                    },
                    settingItems
                        .map((item) =>
                            isVNode(item) ? item : [h("label", item.label), createSettingItem.apply(this, [item])]
                        )
                        .flat()
                ),
            ]);
        },
    });
}

export interface SettingItem {
    label: string;
    type: string;
    icons?: ({
        type: string;
        onClick?: (eL: HTMLElement) => void;
    } & { attrs?: VNodeProps & Record<string, any> })[];
    attrs?: VNodeProps & Record<string, any>;
}

export interface SettingSelect extends SettingItem {
    type: "select";
    options?: { label: string; value: any; attrs?: VNodeProps & Record<string, any> }[];
}

export type FormType = VNode | SettingSelect | SettingInput;

export interface SettingInput extends SettingItem {
    type:
        | "button"
        | "checkbox"
        | "color"
        | "date"
        | "datetime"
        | "datetime-local"
        | "email"
        | "file"
        | "hidden"
        | "image"
        | "month"
        | "number"
        | "password"
        | "radio"
        | "range"
        | "reset"
        | "search"
        | "submit"
        | "tel"
        | "text"
        | "time"
        | "url"
        | "week"

        /** 自定义类型 */
        | "object"
        | "array";
}

/**
 * 创建选择框
 */
function createSettingSelect(input: SettingSelect) {
    return h(
        "select",
        {
            ...input.attrs,
        },
        input.options?.map((option) =>
            h(
                "option",
                {
                    value: option.value,
                    ...option.attrs,
                },
                option.label
            )
        )
    );
}

/**
 * 创建文本输入框
 */
function createSettingInput(input: SettingInput) {
    return h("input", {
        type: input.type,
        ...input.attrs,
    });
}

/**
 * 创建设置项
 */
function createSettingItem(input: SettingSelect | SettingInput) {
    return h(
        "div",
        {
            style: {
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
            },
        },
        [
            input.type === "select" ? createSettingSelect(input) : createSettingInput(input),
            input.icons?.map((icon) => {
                icon.attrs = icon.attrs || {};
                icon.attrs.style = defaults(
                    {
                        fontSize: "14px",
                        cursor: "pointer",
                    },
                    icon?.attrs?.style
                );
                return h("i", {
                    class: icon?.type,
                    onClick: () => {
                        // @ts-ignore
                        icon?.onClick?.(this.$refs[input.ref] as HTMLElement);
                    },
                    ...icon?.attrs,
                });
            }),
        ]
    );
}

export interface CreateWorkerSettingConfig {
    /** 默认提交设置 */
    defaultUpload?: string;
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
): [SettingSelect, SettingInput] {
    return [
        {
            label,
            type: "select",
            attrs: {
                title: "答题设置",
                onchange: changeHandler,
            },
            options: config?.options
                ? config.options
                : (
                      [
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
                      ] as SettingSelect["options"]
                  )?.map((option) => {
                      if (option.value === config?.defaultUpload) {
                          option.attrs = option.attrs || {};
                          option.attrs.selected = true;
                      }
                      return option;
                  }),
        },
        {
            label: "题库配置",
            type: "array",
            icons: [
                {
                    type: "bi bi-question-circle",
                    attrs: {
                        title: "点击查看题库配置教程",
                    },
                    onClick() {
                        window.open("https://enncy.github.io/online-course-script/answerer-wrappers");
                    },
                },
            ],
            attrs: {
                onchange: (e: any) => (OCS.setting.answererWrappers = JSON.parse(e.target.value)),
                title: "输入题库配置, 点击右侧查看教程 ",
                value: OCS.setting.answererWrappers.length === 0 ? "" : JSON.stringify(OCS.setting.answererWrappers),
                placeholder: "点击右侧查看教程 ",
            },
        },
    ];
}
