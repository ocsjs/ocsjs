import { defaults } from "lodash";
import { DefineComponent, defineComponent, defineCustomElement, h, VNode, VNodeArrayChildren, VNodeProps } from "vue";
import { setItem } from "./store";
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
    return h("div", { class: "ocs-panel-footer" }, "—— OCS网课助手");
}

/**
 * 创建设置面板
 */

export function createSettingPanel(...settingItems: (SettingSelect | SettingInput)[]): DefineComponent {
    return defineComponent({
        render() {
            return h(
                "form",
                {
                    method: "get",
                    action: "/",
                    onSubmit: (e: any) => {
                        e.preventDefault();
                        const refs = this.$refs as any;
                        let res = [];
                        /** 解析 refs 里面的所有绑定值 */
                        Reflect.ownKeys(refs)
                            .filter((key) => key !== "submit")
                            .flatMap((key) => {
                                const input: HTMLInputElement = refs[key];
                                const type = input.getAttribute("type") || "text";

                                const value =
                                    type === "checkbox"
                                        ? input.checked
                                        : type === "radio"
                                        ? input.checked
                                        : type === "number"
                                        ? input.valueAsNumber
                                        : type === "object"
                                        ? JSON.parse(input.value)
                                        : parseFloat(input.value) || input.value;
                                res.push([key.toString(), value]);
                                setItem(key.toString(), value);
                            });

                        refs.submit.value = "保存成功√ 即将刷新";
                        refs.submit.disabled = true;
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    },
                },
                [
                    h(
                        "div",
                        {
                            class: "ocs-setting-items",
                        },
                        settingItems
                            .map((input) => [h("label", input.label), createSettingItem.apply(this, [input])])
                            .flat()
                    ),
                    h(
                        "div",
                        {
                            class: "ocs-setting-buttons",
                            style: {
                                marginTop: "4px",
                            },
                        },
                        [
                            h("input", {
                                type: "reset",
                                value: "重置",
                            }),
                            h("input", {
                                type: "submit",
                                ref: "submit",
                                value: "保存",
                            }),
                        ]
                    ),
                ]
            );
        },
    });
}

export interface SettingItem {
    label: string;
    type: string;
    ref: string;
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
        | "object";
}

/**
 * 创建选择框
 */
function createSettingSelect(input: SettingSelect) {
    return h(
        "select",
        {
            ref: input.ref,
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
        ref: input.ref,
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
    ref: string,
    config?: CreateWorkerSettingConfig
): [SettingSelect, SettingInput] {
    return [
        {
            label,
            ref,
            type: "select",
            attrs: {
                title: "答题设置",
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
            ref: "setting.answererWrappers",
            type: "object",
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
                title: "输入题库配置, 点击右侧查看教程 ",
                value: OCS.setting.answererWrappers.length === 0 ? "" : JSON.stringify(OCS.setting.answererWrappers),
                required: true,
                placeholder: "点击右侧查看教程 ",
            },
        },
    ];
}
