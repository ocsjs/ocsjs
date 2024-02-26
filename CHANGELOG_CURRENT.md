# [4.8.0](https://github.com/ocsjs/ocsjs/compare/4.7.46...4.8.0) (2024-02-26)


### Bug Fixes

* **core:** 新答题器的旧字段搜索结果显示修改 ([d8511a0](https://github.com/ocsjs/ocsjs/commit/d8511a023f87d4e8c10c4aabacf4d5118ac75177))
* **core:** 修复当数字输入框是空格后无法正确读取的BUG ([fa7f2d5](https://github.com/ocsjs/ocsjs/commit/fa7f2d593fb42897352958d5a48c78a147671af1))
* **core:** 修复新版答题器当线程为1时，无法搜题的BUG ([bd2bd53](https://github.com/ocsjs/ocsjs/commit/bd2bd5384e788f4f1c521e766a1f9c25c90b96a7))
* **core:** 优化答题器算法 ([d29c74c](https://github.com/ocsjs/ocsjs/commit/d29c74c2ab2a470630567fad9a47605baa3e2d99))
* **core:** 优化跨域通信只在顶部页面刷新时删除临时监听变量，优化代码添加注释 ([0f07dc4](https://github.com/ocsjs/ocsjs/commit/0f07dc47500f8b527f1612731c2cf0d5fe8e36aa))
* **core:** 优化搜索结果显示，内部算法报错依然可以显示搜索结果 ([e002e3d](https://github.com/ocsjs/ocsjs/commit/e002e3d45dd4609d9401b9534ab8be396e979a4a))
* **script:** 添加超星英文判断题的冗余删除 ([35b8f07](https://github.com/ocsjs/ocsjs/commit/35b8f07990d365ee239056e2281c0390200809f5))
* **script:** 添加题库缓存开关 ([35226d3](https://github.com/ocsjs/ocsjs/commit/35226d34298fc0b39b773f612f99f39d8169b4dd))
* **script:** 修复解除复制粘贴限制功能无效的BUG ([3f560a8](https://github.com/ocsjs/ocsjs/commit/3f560a83bd472c073c7de91e51720b78119fdf06))
* **script:** 修复通知时间很短就消失的BUG ([cda009f](https://github.com/ocsjs/ocsjs/commit/cda009f4679fb7cfdce121f2379b68c0d46008b1))
* **script:** 优化超星闯关模式以及解锁模式的重复进入检测算法 ([b148232](https://github.com/ocsjs/ocsjs/commit/b14823248aa4b5620756a4525d56a5f5aacbc7c8))
* **script:** 优化超星英文判断题的解析 ([78be04e](https://github.com/ocsjs/ocsjs/commit/78be04e3dfb76fda8d5cbe5d850a0131a7d1bb08))


### Features

* 新增 answer_separator 答案分隔符设置 ([a742f80](https://github.com/ocsjs/ocsjs/commit/a742f808f43c9e6d9be010258b7d36cde83caf0e))
* **script:** 添加超星 gdhkmooc.com 域名支持 ([c63e6d6](https://github.com/ocsjs/ocsjs/commit/c63e6d69e903483754895c4b14e2266f07788ce5))
* **script:** 添加超星完成全部任务点后重新从开头学习功能 ([86454d3](https://github.com/ocsjs/ocsjs/commit/86454d31f227940298c866759e071622c76097bb))
* **script:** 添加对智慧树自动保存答案的解释 ([53f0846](https://github.com/ocsjs/ocsjs/commit/53f0846b3134453cf8d9bf7c11d777407e7a111a))
* **script:** 添加开发人员调试：显示Tab变量功能 ([a779b35](https://github.com/ocsjs/ocsjs/commit/a779b35f5e422d30a81d551db1ba84528b052d74))
* **script:** 添加职教云 flv 格式支持 ([08d6719](https://github.com/ocsjs/ocsjs/commit/08d6719695d6ca293cb3333197eaf4981195678f))
* **script:** 添加职教云的作业考试【客观填空题】的支持 ([92c5133](https://github.com/ocsjs/ocsjs/commit/92c51332130b31a2e1ece5deabc023a90fde57c3))
* **script:** 添加智慧职教MOOC的单行填空题支持 ([5361ec4](https://github.com/ocsjs/ocsjs/commit/5361ec40a59d0cdb399324dcec484468b5e8d639))
* **script:** 新增 $message 跨域调用功能，新增 $modal duration 参数，修复由于删除cors监听key导致的 undefined BUG ([320903f](https://github.com/ocsjs/ocsjs/commit/320903fdd9e1b82d47ae9ab475aae0eac0d0e2bc))
* **script:** 新增新版职教云作业填空题支持 ([a09dcac](https://github.com/ocsjs/ocsjs/commit/a09dcac71cda6e95a24f6ce5e22ba6c3830f0c3b))
* **script:** 新增职教云考试支持，txt文档查看支持 ([f95e8f8](https://github.com/ocsjs/ocsjs/commit/f95e8f84e03a45dd4afee2f517800512b112efa1))
* **script:** 优化题库配置文案，优化超星文案，并添加运行时的反馈消息提示 ([d61d3ee](https://github.com/ocsjs/ocsjs/commit/d61d3ee051f6c5b1f6af849987776592159d21bb))
* **script:** 在拓展应用中添加OCS全部配置的导入导出功能 ([0237e88](https://github.com/ocsjs/ocsjs/commit/0237e88c1157201911133405058c2b9eb3a43be6))


### Performance Improvements

* **core:** update remote-playwright-log ([3578781](https://github.com/ocsjs/ocsjs/commit/35787819b390d2bed230c79ad30283456a7d57b2))
* **script and core:** 优化软件辅助类型提示以及代码 ([3394ada](https://github.com/ocsjs/ocsjs/commit/3394ada9acb234ee987ae58ac75c2cf96eacde21))
* **script:** 简化 $console 生成的堆栈信息，减少存储量 ([2669525](https://github.com/ocsjs/ocsjs/commit/2669525fd942fa9a2e34e8166785e36891e1c5a3))
* **script:** 添加更多的倍速选项 ([adf7e3d](https://github.com/ocsjs/ocsjs/commit/adf7e3dfb03838cd5dfaf3ebe1b55691685c5a09))



