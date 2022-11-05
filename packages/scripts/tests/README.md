# OCS 测试模块

> 使用 [Playwright Test](https://playwright.dev/) 测试所有例子

## 使用方法

```shell
npx playwright install
npx playwright test
```

全部信息 : [https://playwright.dev/docs/intro#command-line](https://playwright.dev/docs/intro#command-line)

## 注意

我们使用 `.gitignore` 去隐藏本地配置文件，防止个人信息的泄露。

所以你需要自己创建配置文件，否则将无法进行测试，例如：

`./tests/local.config.ts`

```ts
import { CXLogin, ZHSLogin } from '../src';

CXLogin.setting.timeout = 60 * 1000;
ZHSLogin.setting.timeout = 60 * 1000;

export default {
	cx: {
		login: {
			phone: {
				phone: 'xxx',
				password: 'xxx'
			},
			school: {
				unitname: 'xxx',
				uname: 'xxx',
				password: 'xxx',
				verify: {
					username: 'xxx',
					password: 'xxx'
				}
			},
			other: {
				timeout: 60 * 1000
			}
		} as CXLogin.CXLoginOptions
	},
	zhs: {
		login: {
			phone: {
				phone: 'xxx',
				password: 'xxx'
			},
			school: {
				schoolname: 'xxx',
				code: 'xxx',
				password: 'xxx'
			},
			other: {
				timeout: 60 * 1000
			}
		} as ZHSLogin.ZHSLoginOptions
	}
};
```
