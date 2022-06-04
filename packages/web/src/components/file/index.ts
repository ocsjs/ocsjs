import { ScriptOptions } from '@ocsjs/scripts';

/**
 * 表单生成器单项
 */
export interface FormItem {
  type: 'text' | 'number' | 'password' | 'checkbox' | 'radio' | 'tel'
  title: string
  required: boolean
}

/**
 * 表单生成器
 */
export type Form<T extends keyof ScriptOptions> = Record<keyof ScriptOptions[T], FormItem>

/**
 * 脚本的基础登录表单，使用 File.vue 可以自动生成表单内容
 */
export const scriptForms: Record<keyof ScriptOptions, any> = {
  'cx-login-phone': {
    phone: {
      type: 'tel',
      title: '手机',
      required: true
    },
    password: {
      type: 'password',
      title: '密码',
      required: true
    }
  } as Form<'cx-login-phone'>,
  'cx-login-phone-code': {
    phone: {
      type: 'tel',
      title: '手机',
      required: true
    }
  } as Form<'cx-login-phone-code'>,
  'cx-login-school': {
    unitname: {
      type: 'text',
      title: '机构名/学校名',
      required: true
    },
    uname: {
      type: 'text',
      title: '学号',
      required: true
    },
    password: {
      type: 'password',
      title: '密码',
      required: true
    }
  } as Form<'cx-login-school'>,
  'zhs-login-phone': {
    phone: {
      type: 'tel',
      title: '手机',
      required: true
    },
    password: {
      type: 'password',
      title: '密码',
      required: true
    }
  } as Form<'zhs-login-phone'>,
  'zhs-login-school': {
    schoolname: {
      type: 'text',
      title: '学校名',
      required: true
    },
    code: {
      type: 'text',
      title: '学号',
      required: true
    },
    password: {
      type: 'password',
      title: '密码',
      required: true
    }
  } as Form<'zhs-login-school'>,
  'open-diy-link': {
    url: {
      type: 'text',
      title: '链接',
      required: true
    }
  } as Form<'open-diy-link'>

};
