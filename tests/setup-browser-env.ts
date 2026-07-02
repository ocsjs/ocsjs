/**
 * 测试预加载：在任意业务模块导入前模拟浏览器环境。
 *
 * 用法：tsx --import ./tests/setup-browser-env.ts tests/answerer.test.ts
 *
 * 为什么必须是独立预加载文件？
 *   easy-us 在模块顶层执行 `class IElement extends HTMLElement {}`，
 *   只要任何 `import` 触发它加载，就会立即引用全局 HTMLElement。
 *   而 ES `import` 语句会被提升到模块顶部，写在 `require('browser-env')()`
 *   之前并不能保证先执行——因此必须用 tsx 的 --import 在加载测试文件
 *   之前就装好 HTMLElement 等全局符号。
 */
require('browser-env')();

// @ts-ignore - 构建管线也需要 unsafeWindow
globalThis.unsafeWindow = {};

// @ts-ignore - GM_xmlhttpRequest 在 Node 下不可用，request() 会降级为 node-fetch
globalThis.GM_xmlhttpRequest = undefined;
