## [4.8.24](https://github.com/ocsjs/ocsjs/compare/4.8.13...4.8.24) (2024-03-28)


### Bug Fixes

* **core:** 修复窗口隐藏/显示 快捷键无效的BUG ([8002c82](https://github.com/ocsjs/ocsjs/commit/8002c8246339f936cfbafc677f9c053a6e0cfcbc))
* **core:** 修复单选题答案回调内容不一致的BUG ([4265263](https://github.com/ocsjs/ocsjs/commit/4265263821e781cd3636c275120f8b987c63bbbf))
* **core:** 修复设置超出最大最小值，导致变更时，本地的值没有同步导致刷新后依然没有发生变化的BUG ([0b05507](https://github.com/ocsjs/ocsjs/commit/0b05507875340c57689b5825f2d5efd8a4e6ebef))
* **core:** 修复新版答题算法中搜题线程参数无效的BUG，始终只有一个搜题线程在运行 ([9e052f8](https://github.com/ocsjs/ocsjs/commit/9e052f85909b947f8fd53851233cdee93c47ca9a))
* **core:** 修复已经在暂停状态，但是依然在答题的BUG ([3f04e21](https://github.com/ocsjs/ocsjs/commit/3f04e21fdaef3ee5972aa259399e5384b11f51a7))
* **core:** 优化搜索结果的显示BUG，已搜到答案的题目显示未匹配到正确答案的BUG，以及答题进度不一致的显示BUG ([2fd9a72](https://github.com/ocsjs/ocsjs/commit/2fd9a72fb493bfe26593055346bcfe089feda8b9))
* **script:** 全面优化答题速度，优化存在题库缓存时无需执行搜题间隔等待，优化特定网课勾选答案时需要停顿，正常网课无需停顿的情况，极大加速了答案勾选过程。 ([1ca3448](https://github.com/ocsjs/ocsjs/commit/1ca34480d7010c176f79d471f2ba264716782561))
* **script:** 修复智慧树答题时题库缓存未正确存储的BUG ([978d927](https://github.com/ocsjs/ocsjs/commit/978d927f71b1f7e764d97257206615b0f7719791))
* **script:** 修复重新答题按钮点击后，答题完成后的一些操作依然在进行的BUG ([e7148a3](https://github.com/ocsjs/ocsjs/commit/e7148a368144ab55b6708c4e03d23f7de6262b8b))


### Features

* **core:** 新增额外菜单栏功能，新增超星额外菜单栏快捷页面跳转按钮 ([c2066a0](https://github.com/ocsjs/ocsjs/commit/c2066a056439270f41a2f8cb0eee61a73690717e))
* **script:** 新增【职教云】资源库作业支持 ([3cf9968](https://github.com/ocsjs/ocsjs/commit/3cf996824d1ff647499b3f8a12e6084eaf7ddf2d))



