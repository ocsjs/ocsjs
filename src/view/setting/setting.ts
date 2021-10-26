 
import { config } from "@/utils/store";
import { ScriptSetting } from "app/types/store";
import { h, VNode } from "vue";

export const setting = config.setting;

export type SettingTemplate = FormSettingTemplate | RawTemplate;

// vnode 元素
export interface RawTemplate {
    type: "vnode";
    content: VNode;
    show?: boolean;
    label: string;
    description?: string;
}

// 表单元素
export type FormSettingTemplate =
    | {
 
          label: string;
          description?: string;
          bind: any;
          property: string;
          style?: any;
          disable?: boolean;
          show?: boolean;
          blur?: (v: any) => void;
          change?: (v: any) => void;
      } & (InputSettingTemplate | NumberSettingTemplate | SwitchSettingTemplate | CheckboxSettingTemplate | RadioSettingTemplate);

export interface InputSettingTemplate {
    type: "text" | "password";
    size?: "small" | "default" | "large";
}

export interface NumberSettingTemplate {
    type: "number";
    size?: "small" | "default" | "large";
    max?: number;
    min?: number;
    step?: number;

    formatter?: (v: any) => string;
}

export interface SwitchSettingTemplate {
    type: "switch";
    size?: "small" | "default";
}

export interface CheckboxSettingTemplate {
    type: "checkbox";
}

export interface RadioSettingTemplate {
    type: "radio";
}
