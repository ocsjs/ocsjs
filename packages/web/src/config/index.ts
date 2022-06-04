import { reactive, shallowRef } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import setting from '@/pages/setting/index.vue';
import workspace from '@/pages/workspace/index.vue';
import userScripts from '@/pages/user-scripts/index.vue';
import { LaunchScriptsOptions } from '@ocsjs/scripts';
import { path } from '../components/file/File';
import { store } from '../store';
import { GreasyForkUserScript, ScriptCatUserScript, ScriptSearchEngine, CommonUserScript } from '../types/user.script';
import { remote } from '../utils/remote';

const { randomUUID } = require('crypto') as typeof import('crypto');

export const config = reactive({
  /** 标题设置 */
  title: {
    style: {
      backgroundColor: '#fff'
    }
  },
  /**
   * 状态存储
   */
  status: {},
  /**
   * 路由设置
   *
   * why use shallowRef:
   *
   * Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead,
   * and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.
   */
  routes: {
    workspace: {
      name: 'workspace',
      path: '/',
      component: shallowRef(workspace),
      meta: {
        title: '工作区'
      }
    },
    scripts: {
      name: 'user-scripts',
      path: '/user-scripts',
      component: shallowRef(userScripts),
      meta: {
        title: '用户脚本'
      }
    },
    setting: {
      name: 'setting',
      path: '/setting',
      component: shallowRef(setting),
      meta: {
        title: '设置'
      }
    }
  } as Record<any, RouteRecordRaw>,
  /**
   * 初始文件模板
   */
  ocsFileTemplate: (uid?: string) => {
    uid = uid || randomUUID().replace(/-/g, '');

    return JSON.stringify(
      {
        uid,
        launchOptions: {
          headless: false,
          executablePath: 'default'
        },

        scripts: [
          {
            name: 'cx-login-phone',
            options: {} as any
          }
        ],
        userDataDir: path.join(store['user-data-path'], 'scriptUserData', uid),
        init: true,
        localStorage: 'default',
        userScripts: []
      } as LaunchScriptsOptions,
      null,
      4
    );
  },
  /** 用户脚本搜索引擎 */
  scriptSearchEngines: [
    {
      name: 'GreasyFork',
      homepage: 'https://greasyfork.org',
      search: async (keyword: string, page: number, size: number) => {
        const data = await remote.methods.call('get', 'https://greasyfork.org/zh-CN/scripts.json?' + new URLSearchParams({
          q: keyword,
          page: page <= 0 ? '1' : page.toString()
        }));

        let list = data as GreasyForkUserScript[];

        list = list.sort((a, b) => {
          return b.daily_installs - a.daily_installs;
        });

        return list.map(item => {
          const ratings = (item.good_ratings / (item.good_ratings + item.bad_ratings)) * 10;

          return {
            url: item.url,
            name: item.name,
            description: item.description,
            homepage: item.url,
            id: item.id,
            createTime: new Date(item.created_at).getTime(),
            updateTime: new Date(item.code_updated_at).getTime(),
            daily_installs: item.daily_installs,
            total_installs: item.total_installs,
            authors: item.users,
            ratings: parseFloat(ratings.toFixed(1)),
            code_url: item.code_url,
            license: item.license,
            version: item.version
          } as CommonUserScript;
        });
      }
    }, {
      name: 'ScriptCat - 脚本猫',
      homepage: 'https://scriptcat.org',
      search: async (keyword: string, page: number, size: number) => {
        const data = await remote.methods.call('get',
          'https://scriptcat.org/api/v1/scripts?' + new URLSearchParams({
            count: size.toString(),
            page: page <= 0 ? '1' : page.toString(),
            keyword
          }));

        let list = data.list as ScriptCatUserScript[];

        list = list.sort((a, b) => {
          return b.today_install - a.today_install;
        });

        return list.map(item => {
          return {
            id: item.script.script_id,
            version: item.script.version,
            authors: [{
              url: `https://scriptcat.org/users/${item.user_id}`,
              name: item.username,
              avatar: item.avatar ? `https://scriptcat.org${item.avatar}` : undefined
            }],
            name: item.name,
            description: item.description,
            url: `https://scriptcat.org/script-show-page/${item.script.script_id}`,
            code_url: `https://scriptcat.org/scripts/code/${item.script.script_id}/${item.name}.user.js`,
            ratings: item.score ? (item.score * 2) / 10 : 0,
            createTime: item.createtime * 1000,
            updateTime: item.updatetime * 1000,
            daily_installs: item.today_install,
            total_installs: item.total_install
          } as CommonUserScript;
        });
      }
    }
  ] as ScriptSearchEngine[]
});
