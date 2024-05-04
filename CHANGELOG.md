## [4.9.2](https://github.com/ocsjs/ocsjs/compare/4.9.1...4.9.2) (2024-05-04)


### Bug Fixes

* 导出 $elelment 对象，便于可修改 $modal 第二个参数 ([13a1b6d](https://github.com/ocsjs/ocsjs/commit/13a1b6d9d8e211e9b92558b950fbb0e96b0d6174))



## [4.9.1](https://github.com/ocsjs/ocsjs/compare/4.9.0...4.9.1) (2024-05-04)



# [4.9.0](https://github.com/ocsjs/ocsjs/compare/4.8.30...4.9.0) (2024-05-03)


### Features

* **all:** 优化API，分离UI层为新项目 easy-us ([ecc4ff6](https://github.com/ocsjs/ocsjs/commit/ecc4ff6a56577d40a59aea47418138ad9b6c04f1))



## [4.8.30](https://github.com/ocsjs/ocsjs/compare/4.8.29...4.8.30) (2024-05-01)


### Bug Fixes

* **script:** 解决超星视频播放时出现： The play() request was interrupted by a call to pause() BUG ([4791bd8](https://github.com/ocsjs/ocsjs/commit/4791bd8c4a8f06890079bf748c0f547fd728ec94))


### Features

* **script:** 新增对职教云资源库的 spocjob 作业的支持 ([007d39a](https://github.com/ocsjs/ocsjs/commit/007d39af4fbfb474e47f180b8670479c0d7e9b4b))



## [4.8.29](https://github.com/ocsjs/ocsjs/compare/4.8.27...4.8.29) (2024-04-20)



## [4.8.27](https://github.com/ocsjs/ocsjs/compare/4.8.26...4.8.27) (2024-03-31)



## [4.8.26](https://github.com/ocsjs/ocsjs/compare/4.8.25...4.8.26) (2024-03-29)


### Features

* **script:** 新增超星 cugbonline.cn 域名支持 ([359425a](https://github.com/ocsjs/ocsjs/commit/359425a92b93fc7fd93a3d55b69526d29db38d22))



## [4.8.25](https://github.com/ocsjs/ocsjs/compare/4.8.24...4.8.25) (2024-03-28)


### Bug Fixes

* **script:** 修复添加额外菜单栏后，窗口无法正常最大化/最小化的BUG ([22c45bc](https://github.com/ocsjs/ocsjs/commit/22c45bc15d31ab1999761182d6ddbffec499e0ef))



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



## [4.8.13](https://github.com/ocsjs/ocsjs/compare/4.8.11...4.8.13) (2024-03-14)


### Bug Fixes

* **core:** 全局设置中部分元素的值为空时恢复默认值 ([9d539d0](https://github.com/ocsjs/ocsjs/commit/9d539d045df7db40035cf00eba157f10b389e623))
* **core:** 优化答题模块算法 ([545d9bc](https://github.com/ocsjs/ocsjs/commit/545d9bc5c98ff1b342789de9ec681e2e34efed0e))



## [4.8.11](https://github.com/ocsjs/ocsjs/compare/4.8.8...4.8.11) (2024-03-13)


### Bug Fixes

* **script:** 修复请求记录开启后无法读取内容的BUG ([31d2a85](https://github.com/ocsjs/ocsjs/commit/31d2a854e9ccbbef22fa1ad0ca0256f4fe493561))


### Features

* **script:** 对 TikuAdapter 做适配提示 ([cf2fe10](https://github.com/ocsjs/ocsjs/commit/cf2fe109faf5990086de68fb1f7213f0d4807500))



## [4.8.8](https://github.com/ocsjs/ocsjs/compare/4.8.7...4.8.8) (2024-03-05)


### Bug Fixes

* **script:** 优化超星视频重复播放时没有重置视频进度的问题 ([c167ff0](https://github.com/ocsjs/ocsjs/commit/c167ff094ffe4287002cd3e1f0b08b92a0a82ceb))



## [4.8.7](https://github.com/ocsjs/ocsjs/compare/4.8.6...4.8.7) (2024-03-01)


### Bug Fixes

* **script:** 修复2倍速被删除的BUG ([a861685](https://github.com/ocsjs/ocsjs/commit/a861685bea01f3bedad32c2828f2e2d3f38f94dd))



## [4.8.6](https://github.com/ocsjs/ocsjs/compare/4.8.5...4.8.6) (2024-02-28)


### Bug Fixes

* **script:** 修改软件辅助返回字段 ([270f104](https://github.com/ocsjs/ocsjs/commit/270f104d4b490c55e2b6fc5d0b58d4cf5518aa80))



## [4.8.5](https://github.com/ocsjs/ocsjs/compare/4.8.0...4.8.5) (2024-02-28)


### Bug Fixes

* **script:** 修复智慧树无法使用软件辅助，无法自动答题看视频的BUG ([a3cdb6f](https://github.com/ocsjs/ocsjs/commit/a3cdb6f13904879e0d3effd3874c567f34f468f2))


### Features

* **core:** 新增答案匹配模式选项 ([aab04af](https://github.com/ocsjs/ocsjs/commit/aab04af086a50aa72d2992087ecba69f60ad1447))
* **script:** 添加题库配置自动读取剪贴板功能 ([fe19557](https://github.com/ocsjs/ocsjs/commit/fe19557c7cc91c7909a62c3b1dc93aac5c641106))


### Performance Improvements

* **core:** 优化 tooltip ([9655442](https://github.com/ocsjs/ocsjs/commit/96554423807d329e712b08998798d3ca5a309e7f))



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



## [4.7.46](https://github.com/ocsjs/ocsjs/compare/4.7.35...4.7.46) (2023-12-20)


### Bug Fixes

* **scrpt:** 优化题库配置在软件上的域名检测 ([04fba87](https://github.com/ocsjs/ocsjs/commit/04fba87036a8a7884fb40f7f5ab816778a453744))


### Performance Improvements

* **core:** type  update ([3fd3864](https://github.com/ocsjs/ocsjs/commit/3fd3864ea536038f616f2e357d1eee377a130d03))



## [4.7.35](https://github.com/ocsjs/ocsjs/compare/4.7.34...4.7.35) (2023-12-19)


### Features

* **script:** 修复超星人脸验证时疯狂刷新的问题，新增超星人脸验证通知功能 ([e75786c](https://github.com/ocsjs/ocsjs/commit/e75786c890fc0db560a75db406195ead7ad81783))


### Performance Improvements

* **script:** 添加题库停用状态的开启提示 ([8e6aaed](https://github.com/ocsjs/ocsjs/commit/8e6aaedb13a3b3db51ffd0737ef037d628dc7033))



## [4.7.34](https://github.com/ocsjs/ocsjs/compare/4.7.33...4.7.34) (2023-12-13)


### Bug Fixes

* **script:** 优化 TikuAdapter 提示 ([43622ba](https://github.com/ocsjs/ocsjs/commit/43622ba2b48ead377c03fb52ee7c2778256b8002))



## [4.7.33](https://github.com/ocsjs/ocsjs/compare/4.7.32...4.7.33) (2023-12-13)


### Bug Fixes

* **script:** 修复部分脚本管理器无法读取 [@connect](https://github.com/connect) 头部元数据的问题 ([69cec2f](https://github.com/ocsjs/ocsjs/commit/69cec2f98ee5835baceb7796284d654ffbad5720))



## [4.7.32](https://github.com/ocsjs/ocsjs/compare/4.7.30...4.7.32) (2023-12-13)


### Bug Fixes

* **build:** 修复全域名通用版本不带官方域名的BUG ([ce042af](https://github.com/ocsjs/ocsjs/commit/ce042af9d4deb95753a4c76b94a9d4baea7f8a2a))


### Performance Improvements

* **script:** 添加 TikuAdapter 配置域名白名单提示 ([24d8026](https://github.com/ocsjs/ocsjs/commit/24d802626c5cf8f763f463b1d598227454d8e1e3))



## [4.7.30](https://github.com/ocsjs/ocsjs/compare/4.7.29...4.7.30) (2023-12-11)


### Bug Fixes

* **script:** 修改TikuAdapter type 类型解析 ([9aaeb7d](https://github.com/ocsjs/ocsjs/commit/9aaeb7d5b862eb7e848f0022dc1272bd543b71be))



## [4.7.29](https://github.com/ocsjs/ocsjs/compare/4.7.27...4.7.29) (2023-12-11)


### Bug Fixes

* **script:** 添加多版本脚本的更新模块适配 ([4a7aa19](https://github.com/ocsjs/ocsjs/commit/4a7aa19889c7d5f1a412de7e91491d6f52ace0c0))


### Performance Improvements

* **script:** 添加 TikuAdapter 解析器说明 ([d200b22](https://github.com/ocsjs/ocsjs/commit/d200b22212300cb5b055471a4767b13a428660f4))



## [4.7.27](https://github.com/ocsjs/ocsjs/compare/4.7.25...4.7.27) (2023-12-11)


### Bug Fixes

* **script:** 修复请求模块的重大BUG ([4b121bb](https://github.com/ocsjs/ocsjs/commit/4b121bb20c66e704bf32e09906a42bb7cf8566be))


### Features

* **script:** 新增 TikuAdapter 题库配置解析器，优化题库配置解析 ([1fc0d59](https://github.com/ocsjs/ocsjs/commit/1fc0d59313c2b2fe7f296b51340f3ff5d741e32e))



## [4.7.25](https://github.com/ocsjs/ocsjs/compare/4.7.24...4.7.25) (2023-12-08)


### Bug Fixes

* **core:** 复上个版本无法输入任何文字的BUG ([133dd69](https://github.com/ocsjs/ocsjs/commit/133dd69f700c2fd4bebaad37afc9fa69060038ec))



## [4.7.24](https://github.com/ocsjs/ocsjs/compare/4.7.21...4.7.24) (2023-12-08)


### Bug Fixes

* **core:** 优化对 headers 中 content-type 解析而实现传递不同的 data 数据 ([fcd962b](https://github.com/ocsjs/ocsjs/commit/fcd962bd27de2c9fbc5c3e57af9abd54ec6db5a3))
* **script:** 将中国大学MOOC的页面切换信息设置为警告信息 ([84f1d6e](https://github.com/ocsjs/ocsjs/commit/84f1d6e7881eaf886ec626952f159232d809acfc))


### Features

* **core:** 添加快捷键可以显示/隐藏 窗口功能 ([f33e67f](https://github.com/ocsjs/ocsjs/commit/f33e67f157d2ee6b1d8dfcfa3d783ddbc842a985))



## [4.7.21](https://github.com/ocsjs/ocsjs/compare/4.7.20...4.7.21) (2023-12-05)


### Bug Fixes

* **build:** 修复打包时不自动上传文件的BUG ([4983788](https://github.com/ocsjs/ocsjs/commit/4983788703e021d157b7562d0672848f00e04901))



## [4.7.20](https://github.com/ocsjs/ocsjs/compare/4.7.19...4.7.20) (2023-12-05)



## [4.7.19](https://github.com/ocsjs/ocsjs/compare/4.7.18...4.7.19) (2023-12-05)



## [4.7.18](https://github.com/ocsjs/ocsjs/compare/4.7.17...4.7.18) (2023-12-05)


### Bug Fixes

* **build:** 修复上个版本无法自动打包的BUG，优化打包代码 ([74a97cd](https://github.com/ocsjs/ocsjs/commit/74a97cd4f187f694f9b63df581a40f6c4a1382b8))



## [4.7.17](https://github.com/ocsjs/ocsjs/compare/4.7.14...4.7.17) (2023-12-05)


### Features

* **build:** 添加全域名通用脚本打包 user.common.user.js ([81f2cfa](https://github.com/ocsjs/ocsjs/commit/81f2cfa8e38f267f49930c1cc4dec402b8154835))


### Performance Improvements

* **script:** 添加请求记录方法过滤选项 HEAD ([63b58d5](https://github.com/ocsjs/ocsjs/commit/63b58d5354d5b086479a9d1a63bdadf797a71e51))
* **script:** 添加在线搜题题库配置为空的提示 ([7caf525](https://github.com/ocsjs/ocsjs/commit/7caf5252f9c7c35e69e9102bf70cdd554eae8e46))



## [4.7.14](https://github.com/ocsjs/ocsjs/compare/4.7.7...4.7.14) (2023-12-05)


### Bug Fixes

* **core:** 修复 attrs 属性的 style 特殊字段不生效的BUG， 将每个文本框设置最小的宽高 ([fdcc2ca](https://github.com/ocsjs/ocsjs/commit/fdcc2caf60f761d49fd8f0d22cf8e10cdf1803cc))
* **core:** 修复下拉选择框只有value值时不显示的BUG ([2d5f371](https://github.com/ocsjs/ocsjs/commit/2d5f371cca889c1b6ccf7acced557b0b9ae4f32f))
* **script:** 修复搜索结果序号过多时，序号页面超出页面的BUG ([8958910](https://github.com/ocsjs/ocsjs/commit/89589102791225401391f466bc36f1e7d2cd9506))
* **script:** 修复中国大学MOOC课堂测验答题完成后没有等待暂停时间步骤的BUG ([3bc76b1](https://github.com/ocsjs/ocsjs/commit/3bc76b1ef981d1fc63f51b4270a4b8af4ec924ef))
* **script:** 优化在线搜题功能，缓存搜索题目，优化划词功能 ([c4093b1](https://github.com/ocsjs/ocsjs/commit/c4093b1b64245c07db356a64094890eae314247c))


### Features

* **core:** 新增题库配置的字段解析器功能 ([f596488](https://github.com/ocsjs/ocsjs/commit/f59648871a8648ca50a15d3d162f2e01eb5a52ef))
* **script:** 添加超星 hnvist.cn fjlecb.cn 域名支持 ([afd86d6](https://github.com/ocsjs/ocsjs/commit/afd86d62425fd1140c48f764bf11102dcf1dac32))
* **script:** 新增超星旧版学习页面自动转换新版功能 ([9992a03](https://github.com/ocsjs/ocsjs/commit/9992a03597d4954049187b5d2ccce5cfe0430f9f))
* **script:** 新增开发人员请求记录调试页面 ([5baac27](https://github.com/ocsjs/ocsjs/commit/5baac2770e03a0222b8f800789d3743c1234e125))


### Performance Improvements

* **core:** request 模块的 gm http 的 data 使用 JSON.stringify 进行转换 ([7d4f660](https://github.com/ocsjs/ocsjs/commit/7d4f6602ecd7d0268b2e888c51a907f0a2cc4268))
* **script:** 删除超星多余日志 ([7be1071](https://github.com/ocsjs/ocsjs/commit/7be10712c36bd35c21175862eb7be915971d7b52))



## [4.7.7](https://github.com/ocsjs/ocsjs/compare/4.7.1...4.7.7) (2023-11-30)


### Bug Fixes

* **script:** 将超星提交功能设置为3秒延时 ([2161fa4](https://github.com/ocsjs/ocsjs/commit/2161fa461e0383278ff31b60475daa62702fdb3e))
* **script:** 新增题目冗余字段 ([596101f](https://github.com/ocsjs/ocsjs/commit/596101ff46b5fbd85bb7725fb9b9caeab6aa4169))
* **script:** 修复超星学习通章节测验已完成，但依然开始答题的BUG ([169eb4a](https://github.com/ocsjs/ocsjs/commit/169eb4aedc1e3351de6546891de9050510fe5ffc))
* **script:** 优化超星作业考试/章节测验 中 type 传递是 undefined 的BUG ([c2a1640](https://github.com/ocsjs/ocsjs/commit/c2a16402a5f8b97417cb3254faeccc2929d6ee53))
* **script:** 优化职教云-资源库：新增对 mp3 的支持，新增自动跳过测验功能 ([78634b4](https://github.com/ocsjs/ocsjs/commit/78634b4a35600d7baf48f4329e4970ce90c75b27))


### Features

* **core:** 优化答题uploadHandler API，新增 commonWork.options.onWorkerCreated 选项 ([c4154df](https://github.com/ocsjs/ocsjs/commit/c4154df1dbf4e2dfb94c92f2b4b83fd1c4c4d7c4))
* **script:** 新增中国大学MOOC，随堂测验自动答题功能 ([f79fb08](https://github.com/ocsjs/ocsjs/commit/f79fb08a93b928127d1e710d31ed0b0a5cf64f38))


### Performance Improvements

* **script:** 导出 ICourseProject 变量，开发者调试功能中可用 ([13d8787](https://github.com/ocsjs/ocsjs/commit/13d8787feafba0593f463246fb1fac4b707e1922))
* **script:** 增加超星任务点关闭后的开启提示 ([fe11e6e](https://github.com/ocsjs/ocsjs/commit/fe11e6ef7c1bc6360c1c8ea58cc7fe82e4552713))



## [4.7.1](https://github.com/ocsjs/ocsjs/compare/4.7.0...4.7.1) (2023-11-25)


### Bug Fixes

* **script:** 修复上个版本 职教云资源库获取课程信息失败 bug ([d97e538](https://github.com/ocsjs/ocsjs/commit/d97e538601a3d015c0e66609a5397033ab643a9c))



# [4.7.0](https://github.com/ocsjs/ocsjs/compare/4.6.32...4.7.0) (2023-11-25)


### Bug Fixes

* **core:** 添加题库配置 method 大小写适配 ([d496be7](https://github.com/ocsjs/ocsjs/commit/d496be7cc5253c4b7ac8ba171dbd508ba9038d2a))
* **core:** 修复选项元素在没有 title 时显示为 undefined 的 BUG ([12ff0dc](https://github.com/ocsjs/ocsjs/commit/12ff0dc8c623ca0d4e38f230946d950ce18e26db))
* **core:** 优化选择下拉框设置，优化代码，修改之前由于无法获取value而使用的 $creator.selectOptions 的BUG ([2cf5318](https://github.com/ocsjs/ocsjs/commit/2cf5318030eb9427811db65973efe5b36eac2692))
* **script:** 将软件辅助的点击设置成点击元素中心点 ([a0e421d](https://github.com/ocsjs/ocsjs/commit/a0e421df0ceeba369bb9c64c95e0de7e21e2ff7b))
* **script:** 添加智慧树题目类型判断，修复某些题目不自动填写的BUG ([7bce433](https://github.com/ocsjs/ocsjs/commit/7bce4331ec9f504b6d887ec5e3d1443613200ce1))
* **script:** 修复职教云更新后-资源库不自动学习的BUG ([2d4d026](https://github.com/ocsjs/ocsjs/commit/2d4d0269d86e525ed288d322e231a4422572e461))
* **script:** 优化脚本字间距，搜索结果字间距和窗口间距 ([bcc4d87](https://github.com/ocsjs/ocsjs/commit/bcc4d87acbfd6aa78dce50d81bc561992f5fe7ab))
* **script:** 优化软件辅助错误提示 ([7f42cba](https://github.com/ocsjs/ocsjs/commit/7f42cbafa069d6350c74fe07a06e58d8782abe54))
* **script:** 优化智慧树学习提示 ([ee44189](https://github.com/ocsjs/ocsjs/commit/ee44189adac7b50bb2e35b9e7aca5eb1c4f73937))
* **script:** 优化智慧职教填空题 ([586b1fc](https://github.com/ocsjs/ocsjs/commit/586b1fc66468d3b55d4c359b84d1a4ec36f89f73))


### Features

* **script:** 添加超星学习通 视频内题目随机答题功能 ([e2d9d5d](https://github.com/ocsjs/ocsjs/commit/e2d9d5d84a11c62d5e21a2dba54be76f3f7e3ff4))
* **script:** 添加超星学习通-章节页面自动切换脚本 ([c0ac30c](https://github.com/ocsjs/ocsjs/commit/c0ac30c0b60a72de097f53dcdb94cd9247bd0e60))
* **script:** 添加职教云遇到讨论课件时自动跳过 ([994ba3e](https://github.com/ocsjs/ocsjs/commit/994ba3e9055581b14a2fb61aa680bb9f2327eb2c))
* **script:** 新增网课 中国大学MOOC 的学习、作业脚本支持 ([17445e5](https://github.com/ocsjs/ocsjs/commit/17445e5478f398d3580bc561eee2542804872478))
* **script:** 新增智慧职教-学习中心自动学习功能 ([0a8de35](https://github.com/ocsjs/ocsjs/commit/0a8de35bd99d74a43064a5f0213069e1d9ad80a1))
* **script:** 优化全部网课平台的系统通知功能，添加任务点完成提示，添加智慧树验证码提示 ([7e30125](https://github.com/ocsjs/ocsjs/commit/7e30125fd0858bd9c2067de0e7f3ad95bf639ff9))



## [4.6.32](https://github.com/ocsjs/ocsjs/compare/4.6.29...4.6.32) (2023-11-01)


### Bug Fixes

* **script:** 新增超星其他题，类型支持 ([ee2cf4d](https://github.com/ocsjs/ocsjs/commit/ee2cf4dfd987e9adf62f7d2767c7dff3560def53))


### Features

* **core:** 添加优先级选项，排序特定脚本的执行速度 ([049234c](https://github.com/ocsjs/ocsjs/commit/049234c280835363d1e56581cbe782d8e98424e6))
* **script:** 新增职教云资源库 pdf 支持，新增职教云作业脚本 ([f703288](https://github.com/ocsjs/ocsjs/commit/f703288641ecf794635b50922a0dab3b717f3446))



## [4.6.28](https://github.com/ocsjs/ocsjs/compare/4.6.27...4.6.28) (2023-10-24)



## [4.6.29](https://github.com/ocsjs/ocsjs/compare/4.6.28...4.6.29) (2023-10-24)


### Bug Fixes

* **script:** 修复软件配置同步失败问题 ([98eeb3d](https://github.com/ocsjs/ocsjs/commit/98eeb3de94e6a434bf84f1d64a2036624203df19))



## [4.6.28](https://github.com/ocsjs/ocsjs/compare/4.6.27...4.6.28) (2023-10-24)


### Bug Fixes

* **script:** 修复上个版本无法答题的BUG ([7918a3d](https://github.com/ocsjs/ocsjs/commit/7918a3d7bf4b7e0bfb78fc4a7ac1a9e6058445d7))



## [4.6.27](https://github.com/ocsjs/ocsjs/compare/4.6.25...4.6.27) (2023-10-24)


### Bug Fixes

* **script:** 修复超星章节测试题库被禁用的时候依然使用的BUG ([fff8cc4](https://github.com/ocsjs/ocsjs/commit/fff8cc4d41e49cf8c4f0d8f13f9cde3143505434))
* **script:** 修复智慧树检测习惯分出错 ([436eedd](https://github.com/ocsjs/ocsjs/commit/436eedd449c15d74be8b4b07fdd33d7c01e3db0e))



## [4.6.25](https://github.com/ocsjs/ocsjs/compare/4.6.23...4.6.25) (2023-10-22)


### Bug Fixes

* **script:** 深度优化智慧树弹窗BUG，以及倍速清晰度不选择BUG ([f61498c](https://github.com/ocsjs/ocsjs/commit/f61498c4640cbe8583b33d6d46a922341c3a57ae))


### Features

* **script:** 新增可以设置不被软件配置同步覆盖的设置，修复智慧树学习记录刷新后清空的BUG ([b35f87f](https://github.com/ocsjs/ocsjs/commit/b35f87fc5fd01a9de37fdc2855da2f6dfd8fc9df))



## [4.6.23](https://github.com/ocsjs/ocsjs/compare/4.6.22...4.6.23) (2023-10-20)


### Bug Fixes

* **core:** 优化核心域名匹配逻辑 ([8cbcc94](https://github.com/ocsjs/ocsjs/commit/8cbcc9412726c673e9f1ad8898a46ded1f6502c4))
* **script:** 持续优化智慧树倍速和清晰度选择功能 ([86d133b](https://github.com/ocsjs/ocsjs/commit/86d133bab4fc3063dc39335f61bf7a6f88226fd1))
* **script:** 将软件同步功能加快到 onactive ([db44761](https://github.com/ocsjs/ocsjs/commit/db4476158b39765c28cfe5491cacfedc4a193c2b))
* **script:** 优化超星新课程页面不显示使用提示的问题 ([3daf262](https://github.com/ocsjs/ocsjs/commit/3daf2623a97cd1a6d22aa3c3fd6bfc1e2b960f39))
* **script:** 优化智慧树弹窗答题 ([e7a7a1f](https://github.com/ocsjs/ocsjs/commit/e7a7a1f12246da929d106e69be50aca60d519117))



## [4.6.22](https://github.com/ocsjs/ocsjs/compare/4.6.19...4.6.22) (2023-10-19)


### Bug Fixes

* **script:** 修复智慧树需要调整窗口的BUG ([45c5f0b](https://github.com/ocsjs/ocsjs/commit/45c5f0b6a834b151d8955d05bf62cfa4ecb228c0))


### Features

* **script:** 兼容智慧职教套壳网站 courshare.cn ([7a2a088](https://github.com/ocsjs/ocsjs/commit/7a2a08832cafaefc70cefc7a3cec63131796655a))
* **script:** 收录超星套壳域名 qutjxjy.cn ynny.cn ([2d9b6fc](https://github.com/ocsjs/ocsjs/commit/2d9b6fcc81fa8ddce44fcc24d1756a6ef07624af))



## [4.6.19](https://github.com/ocsjs/ocsjs/compare/4.6.10...4.6.19) (2023-10-15)


### Bug Fixes

* **script:** 补充答题冗余字段删除数据 ([6d3544d](https://github.com/ocsjs/ocsjs/commit/6d3544d8fb49db88e943cdccfa9fb171792c1078))
* **script:** 修复软件配置同步后，日志页面全锁定的BUG ([e6f0610](https://github.com/ocsjs/ocsjs/commit/e6f0610e42c7bb0137cfc7beb79921a3ef1e869b))
* **script:** 修复使用软件同步时，智慧树学习自动暂停无效的BUG，以及存在验证码时自动暂停的优化。 ([8aa4bcf](https://github.com/ocsjs/ocsjs/commit/8aa4bcfd7f85e6c3c00afbb99fb361b4a70f1a73))
* **script:** 优化窗口大小自动调整，优化窗口大小警告模块 ([6882026](https://github.com/ocsjs/ocsjs/commit/6882026b2b9f2441d689add73895bed8797774f6))


### Features

* **script:** 将软件辅助警告修改成弹窗 ([6b88c29](https://github.com/ocsjs/ocsjs/commit/6b88c298befbee314e3bda309cdd426d04d2dc41))
* **script:** 添加超星强制答题提示 ([0067efc](https://github.com/ocsjs/ocsjs/commit/0067efc7e7dc7f09018709ad0b5f0ac636807eef))
* **script:** 添加对自动调整窗口开关的重启提示 ([46b957b](https://github.com/ocsjs/ocsjs/commit/46b957b6706bf501d8a22b3b0f336e5f83deb31f))
* **script:** 添加职教云【资源库】支持 ([da6f135](https://github.com/ocsjs/ocsjs/commit/da6f135276ace1394c4072f2a4cd02625753a689))



## [4.6.10](https://github.com/ocsjs/ocsjs/compare/4.6.9...4.6.10) (2023-10-02)



## [4.6.9](https://github.com/ocsjs/ocsjs/compare/4.6.7...4.6.9) (2023-10-02)


### Bug Fixes

* **script:** 修复智慧树考试脚本无法使用的BUG ([5f3f972](https://github.com/ocsjs/ocsjs/commit/5f3f9729687f93a5d2e36161883b822d14075518))


### Features

* **script:** 新增超星阅读任务无限阅读功能 ([137f739](https://github.com/ocsjs/ocsjs/commit/137f7397cef6554260db10f0d2a7535ca3db8073))



## [4.6.7](https://github.com/ocsjs/ocsjs/compare/4.6.5...4.6.7) (2023-09-26)


### Bug Fixes

* **script:** 微调智慧树窗口大小要求，宽2200，高1200 ([f438b79](https://github.com/ocsjs/ocsjs/commit/f438b79512463396cba1ca59aa93422b06ead276))


### Features

* **script:** 新增功能：超星强制答题功能，没有黄色任务点的章节测试也可以运行自动答题。 ([453d254](https://github.com/ocsjs/ocsjs/commit/453d254aa575b23ad7571b811dc618a467ae1826))



## [4.6.5](https://github.com/ocsjs/ocsjs/compare/4.6.4...4.6.5) (2023-09-25)


### Bug Fixes

* **script:** 修复智慧树调成窗口大于最小值后依然说不对的BUG ([be94200](https://github.com/ocsjs/ocsjs/commit/be9420097c81574b9b6b4a910808f27f19cbdf23))



## [4.6.4](https://github.com/ocsjs/ocsjs/compare/4.6.3...4.6.4) (2023-09-24)


### Features

* **script:** 添加智慧树窗口自动调节功能的选项按钮 ([0543ca1](https://github.com/ocsjs/ocsjs/commit/0543ca1e6a8acd92bdc2b1889beb7a4d8c0a2caf))



## [4.6.3](https://github.com/ocsjs/ocsjs/compare/4.6.2...4.6.3) (2023-09-24)


### Bug Fixes

* **script:** 添加智慧树窗口检测提示 ([849e28d](https://github.com/ocsjs/ocsjs/commit/849e28ddf7c57a5b7457d6f2b63a250a66f3792a))


### Features

* **script:** 添加自动设置窗口大小功能，避免元素无法点击 ([6aed250](https://github.com/ocsjs/ocsjs/commit/6aed250ea05a65c39ff5b5c36783510b2210781d))



## [4.6.2](https://github.com/ocsjs/ocsjs/compare/4.6.1...4.6.2) (2023-09-22)


### Bug Fixes

* **script:** 修复上个版本智慧树作业BUG ([e782403](https://github.com/ocsjs/ocsjs/commit/e7824039f22862ebbd412f43c37b248bea4b0232))



## [4.6.1](https://github.com/ocsjs/ocsjs/compare/4.6.0...4.6.1) (2023-09-22)


### Bug Fixes

* **script:** 优化智慧树刷课逻辑，增加流畅度 ([3a93157](https://github.com/ocsjs/ocsjs/commit/3a9315773fab3b7b8561ff57e189d58ff1a68150))



# [4.6.0](https://github.com/ocsjs/ocsjs/compare/4.5.8...4.6.0) (2023-09-22)


### Bug Fixes

* **script:** 新增软件辅助功能，全面优化智慧树，共享课学习作业考试以及学分课视频 ([18a2725](https://github.com/ocsjs/ocsjs/commit/18a2725328b7917b8417ff8111e8a09fb4e09052))
* **script:** 优化超星最新考试页面支持 ([9e71239](https://github.com/ocsjs/ocsjs/commit/9e712393e26b8faced900a4e56bc8c4f0dc00294))



## [4.5.8](https://github.com/ocsjs/ocsjs/compare/4.5.5...4.5.8) (2023-09-15)


### Bug Fixes

* **script:** 修复部分课程不显示超星阅读任务的提示页面 ([907bb63](https://github.com/ocsjs/ocsjs/commit/907bb634a82889aa933a6989ab9c3d46cbba01c3))
* **script:** 修复在中国大学MOOC中点击事件监听被修改的问题，将 addEventListener('click') 改成 onlick ([b1eba8f](https://github.com/ocsjs/ocsjs/commit/b1eba8ff742738ff412f94b2f0e6ba83819250a4))
* **script:** 修复智慧树最新版脚本被检测的问题 ([adfe7a0](https://github.com/ocsjs/ocsjs/commit/adfe7a0cee1994396714cd3e01868cad409476c5))



## [4.5.5](https://github.com/ocsjs/ocsjs/compare/4.5.4...4.5.5) (2023-09-12)


### Features

* **script:** 使更新模块可视化 ([0e27628](https://github.com/ocsjs/ocsjs/commit/0e27628d319db704f9849926a9602d1406f43e63))



## [4.5.4](https://github.com/ocsjs/ocsjs/compare/4.5.3...4.5.4) (2023-09-12)


### Bug Fixes

* **core and script:** 修复上个版本出现的弹窗底部消失的问题，优化超星自动答题后台日志 ([37e6749](https://github.com/ocsjs/ocsjs/commit/37e6749a5bbef7788b2bd3b6efd2aba98581ceba))



## [4.5.3](https://github.com/ocsjs/ocsjs/compare/4.5.0...4.5.3) (2023-09-12)


### Features

* **core:** 添加跳过版本的功能 ([63913b2](https://github.com/ocsjs/ocsjs/commit/63913b222e53b128a26d8aa3b4dc5dee654b67ae))
* **script:** 添加新版职教云音频的播放 ([b7b47b9](https://github.com/ocsjs/ocsjs/commit/b7b47b9c0cb884e00cc98a6473cbbcdbdc933138))
* **script:** 添加新版职教云DOC文档学习功能 ([9a5babd](https://github.com/ocsjs/ocsjs/commit/9a5babd3379bc15e6c9cc0fe8c5f91a7d10bd5cb))



# [4.5.0](https://github.com/ocsjs/ocsjs/compare/4.4.35...4.5.0) (2023-09-09)


### Features

* **script:** 重写职教云刷课逻辑 ([1b50d5b](https://github.com/ocsjs/ocsjs/commit/1b50d5b330db5676b94777245657793f5c55162d))



## [4.4.35](https://github.com/ocsjs/ocsjs/compare/4.4.34...4.4.35) (2023-09-04)


### Bug Fixes

* 优化自动发布的说明文档 ([cc84599](https://github.com/ocsjs/ocsjs/commit/cc84599a36f6afd8a10efd13d0b9decf6ca6608c))
* **script:** 修复超星选择题选中的答案被取消的BUG ([808709a](https://github.com/ocsjs/ocsjs/commit/808709a7503c3d34c2463d3156c1fde26deb8267))
* test ([c70ec9b](https://github.com/ocsjs/ocsjs/commit/c70ec9b94d166c5f6ab4a4aa649f7ca8f004199a))



## [4.4.34](https://github.com/ocsjs/ocsjs/compare/4.4.33...4.4.34) (2023-08-25)


### Bug Fixes

* 优化打包文件 ([3fd8657](https://github.com/ocsjs/ocsjs/commit/3fd86577271cd49746b64bae9a7131f7dc99c83f))



## [4.4.33](https://github.com/ocsjs/ocsjs/compare/4.4.32...4.4.33) (2023-08-25)


### Bug Fixes

* 优化github actions ([9f6608c](https://github.com/ocsjs/ocsjs/commit/9f6608cd775ac121ce5fcb070ba0b1b699a54cc6))



## [4.4.32](https://github.com/ocsjs/ocsjs/compare/4.4.31...4.4.32) (2023-08-25)


### Bug Fixes

* **script:** 优化智慧树最新异常检测 ([b634a46](https://github.com/ocsjs/ocsjs/commit/b634a4694a1fcf88956f6dcde9f8e7a8b891fccd))



## [4.4.31](https://github.com/ocsjs/ocsjs/compare/4.4.30...4.4.31) (2023-08-05)


### Bug Fixes

* **script:** 修复超星判断题更新后，文字优化不兼容的问题 ([f7beff9](https://github.com/ocsjs/ocsjs/commit/f7beff9e109c5c07a2f27df567c7cff319a4caff))



## [4.4.30](https://github.com/ocsjs/ocsjs/compare/4.4.29...4.4.30) (2023-06-22)


### Bug Fixes

* **script:** 新增超星分录题支持 ([68c007b](https://github.com/ocsjs/ocsjs/commit/68c007bb7ad890e57cec8cd5c39ff30b00ee599f))



## [4.4.29](https://github.com/ocsjs/ocsjs/compare/4.4.25...4.4.29) (2023-06-22)


### Bug Fixes

* **build:** 对脚本打包的 match 元数据进行去重 ([9de7d2c](https://github.com/ocsjs/ocsjs/commit/9de7d2c99a97c0786a3aa3dc9981643eedfe407d))
* **script:** 将题库配置为空提醒设置为一直显示 ([d07bdbf](https://github.com/ocsjs/ocsjs/commit/d07bdbfd0735b4ccd4bb9fabef6a6f5f15a73707))
* **script:** 新增超星题目类型支持：资料题 ([b6d3a00](https://github.com/ocsjs/ocsjs/commit/b6d3a006fb64b1f5aa58f806a68cfc56980ea340))
* **script:** 修复超星作业考试文本框无法自动保存BUG ([ec58efe](https://github.com/ocsjs/ocsjs/commit/ec58efedc5d047ddb1c66b32023df0e24709f315))



## [4.4.25](https://github.com/ocsjs/ocsjs/compare/4.4.24...4.4.25) (2023-05-25)


### Bug Fixes

* **core:** 修复上个版本题库连接超时问题 ([1c045ef](https://github.com/ocsjs/ocsjs/commit/1c045ef549a75717981bd99e97b4ecbee9d6f20d))



## [4.4.24](https://github.com/ocsjs/ocsjs/compare/4.4.23...4.4.24) (2023-05-25)


### Bug Fixes

* **script and core:** 修复题库状态检测无限执行的BUG，优化 onrender 中的监听器执行逻辑 ([cbe7f0b](https://github.com/ocsjs/ocsjs/commit/cbe7f0b9a1a2bdb47f0dff09739b41270b556c70))
* **script:** 优化智慧职教使用提示 ([ca5d4b3](https://github.com/ocsjs/ocsjs/commit/ca5d4b3ea4f29a265497ae0b401f3e28a575b081))



## [4.4.23](https://github.com/ocsjs/ocsjs/compare/4.4.22...4.4.23) (2023-05-20)



## [4.4.22](https://github.com/ocsjs/ocsjs/compare/4.4.21...4.4.22) (2023-05-20)


### Bug Fixes

* **build:** update build file ([c5d50b1](https://github.com/ocsjs/ocsjs/commit/c5d50b14bc4d834a3d5b8c82931abae8b15fca70))



## [4.4.21](https://github.com/ocsjs/ocsjs/compare/4.4.20...4.4.21) (2023-05-20)



## [4.4.20](https://github.com/ocsjs/ocsjs/compare/4.4.19...4.4.20) (2023-05-20)



## [4.4.19](https://github.com/ocsjs/ocsjs/compare/4.4.15...4.4.19) (2023-05-20)


### Bug Fixes

* **all:** 修复添加配置分隔线后，OCS配置同步锁的样式显示出错 ([a257084](https://github.com/ocsjs/ocsjs/commit/a25708419505672e40617ccc2a9088a6038ce971))
* **script:** 添加软件自动登录辅助页面 ([a2bfa20](https://github.com/ocsjs/ocsjs/commit/a2bfa20014c84d8ee7d59032eca01bac225d5d0e))


### Features

* **all:** 添加配置分割线，便于设置区域分组 ([980d591](https://github.com/ocsjs/ocsjs/commit/980d591c92466c79d2a35f40c8dacd6b633ed7a7))



## [4.4.15](https://github.com/ocsjs/ocsjs/compare/4.4.14...4.4.15) (2023-05-16)


### Bug Fixes

* **core:** 规范搜题请求处理，修复在url中存在变量时多加一个问号的BUG ([c0f561d](https://github.com/ocsjs/ocsjs/commit/c0f561d8c2ec6577f6594f0920bde9c686c23a22)), closes [#97](https://github.com/ocsjs/ocsjs/issues/97)



## [4.4.14](https://github.com/ocsjs/ocsjs/compare/4.4.13...4.4.14) (2023-05-16)


### Bug Fixes

* **script:** 修复智慧职教多层级任务检测 ([64aaf13](https://github.com/ocsjs/ocsjs/commit/64aaf138762d21c3916c7dc7003a4ae3040b3655))
* **script:** 优化题库状态停用显示 ([a012a56](https://github.com/ocsjs/ocsjs/commit/a012a569a5817f2af8ec655755d78b23447b48e8))



## [4.4.13](https://github.com/ocsjs/ocsjs/compare/4.4.12...4.4.13) (2023-05-12)


### Bug Fixes

* **script:** 修复题库缓存不是最新的BUG ([a7a89b9](https://github.com/ocsjs/ocsjs/commit/a7a89b98d7ee672b47dc63fb36ba6eaa9e37c87d))



## [4.4.12](https://github.com/ocsjs/ocsjs/compare/4.4.11...4.4.12) (2023-05-12)


### Bug Fixes

* **script:** 修复题库配置清空后会留下两个小括号的bug ([0993a52](https://github.com/ocsjs/ocsjs/commit/0993a52d52dca43951279076783ca047a10dc234))



## [4.4.11](https://github.com/ocsjs/ocsjs/compare/4.4.10...4.4.11) (2023-05-12)


### Bug Fixes

* **script:** 继续优化智慧树作业考试检测 ([2a337bb](https://github.com/ocsjs/ocsjs/commit/2a337bb56c3a5f5a157ff80c213c14521d8f0c4c))



## [4.4.10](https://github.com/ocsjs/ocsjs/compare/4.4.9...4.4.10) (2023-05-11)



## [4.4.9](https://github.com/ocsjs/ocsjs/compare/4.4.8...4.4.9) (2023-05-11)



## [4.4.8](https://github.com/ocsjs/ocsjs/compare/4.4.7...4.4.8) (2023-05-11)



## [4.4.7](https://github.com/ocsjs/ocsjs/compare/4.4.5...4.4.7) (2023-05-11)


### Bug Fixes

* **script:** 将更新通知的请求方法改成油猴跨域请求，防止有些页面的 safe 策略阻止请求。 ([6613973](https://github.com/ocsjs/ocsjs/commit/6613973f00fbbda9b5d5f3591475fecd7e6a47c4))
* **script:** 优化智慧树考试作业提示 ([3703e97](https://github.com/ocsjs/ocsjs/commit/3703e976a19ba835aa1d6f7d7c5f860134802950))


### Features

* **script:** 新增题库开关功能 ([07f3cfc](https://github.com/ocsjs/ocsjs/commit/07f3cfcba517edd86cd38f4c0fcabd99ef3ed4fa))



## [4.4.5](https://github.com/ocsjs/ocsjs/compare/4.4.4...4.4.5) (2023-05-10)



## [4.4.4](https://github.com/ocsjs/ocsjs/compare/4.4.3...4.4.4) (2023-05-10)


### Bug Fixes

* **script:** 修复智慧树考试作业进入后不自动开始，而是需要刷新才能开始的BUG ([8f197ec](https://github.com/ocsjs/ocsjs/commit/8f197ec3d3418663698e9495de4909c1b2123ee5))



## [4.4.3](https://github.com/ocsjs/ocsjs/compare/4.4.2...4.4.3) (2023-05-09)



## [4.4.2](https://github.com/ocsjs/ocsjs/compare/4.4.1...4.4.2) (2023-05-09)


### Bug Fixes

* **script:** 修复智慧树作业考试阅读理解小题读取失败的BUG ([37e42f1](https://github.com/ocsjs/ocsjs/commit/37e42f10adfb3198dbb4738dbfd232d0bd736421))



## [4.4.1](https://github.com/ocsjs/ocsjs/compare/4.4.0...4.4.1) (2023-05-09)


### Bug Fixes

* **script:** 优化没有题库配置的提示 ([dc55244](https://github.com/ocsjs/ocsjs/commit/dc552440b5a15a1ff2639b64af851da6582056a0))



# [4.4.0](https://github.com/ocsjs/ocsjs/compare/4.3.7...4.4.0) (2023-05-09)


### Bug Fixes

* **core:** 修复搜索结果图片显示问题 ([0ebc3f9](https://github.com/ocsjs/ocsjs/commit/0ebc3f9c057438611a4791818fd2f5030c16eb65))
* **core:** 优化单选题选项ABCD冗余并没有去掉的BUG ([f88fd86](https://github.com/ocsjs/ocsjs/commit/f88fd8698fc9a265df5ab3c9a3205fe9a81b4be4))
* **script:** 全面优化自动答题逻辑，并将搜索结果直接显示在各自的脚本面板下，无需反复跳转查看。 ([8712b24](https://github.com/ocsjs/ocsjs/commit/8712b24ee47bda38598e057e44188acd6f5a46fa))
* **script:** 修复智慧树图片题的BUG ([5adda0b](https://github.com/ocsjs/ocsjs/commit/5adda0be86a1530697539ac412a714d112d6962e))
* **script:** 优化日志显示 ([bc7521a](https://github.com/ocsjs/ocsjs/commit/bc7521a2313fc64d8be56be4b34956e06736dd4c))
* **script:** 优化智慧树视频加载缓慢时无法自动播放的BUG ([640bc72](https://github.com/ocsjs/ocsjs/commit/640bc72f70d9cebd9d9b2f110f11b99515a4fe33))
* **script:** 优化智慧树校内课作业 ([c877ed6](https://github.com/ocsjs/ocsjs/commit/c877ed6551569883afff330c37255982c3511424))
* **script:** 优化智慧职教MOOC的自动学习逻辑 ([9694773](https://github.com/ocsjs/ocsjs/commit/96947732d8da48018fb4ce9c8979941a859cb55b))
* **script:** 智慧树考试强制添加保存弹窗，并从头开始每题保存，防止用户切换题目导致保存失败 ([f6c0e22](https://github.com/ocsjs/ocsjs/commit/f6c0e22ebb610c6b59079e8cedd07ba8cd3e8438))
* **script:** update build script ([4aa68f1](https://github.com/ocsjs/ocsjs/commit/4aa68f16c4cf68487db298ca91e66d3b9ba90c51))


### Features

* **script:** 增加搜索结果与题目同步显示功能 ([f793d43](https://github.com/ocsjs/ocsjs/commit/f793d431cd51ca54dd984ff36d1ef1884833b8c2))
* **script:** 增加职教云考试功能 ([c9bc7ad](https://github.com/ocsjs/ocsjs/commit/c9bc7ad5cdf07c292b380cedc273fc407329e02e))



## [4.3.7](https://github.com/ocsjs/ocsjs/compare/4.3.5...4.3.7) (2023-04-24)


### Bug Fixes

* **script:** 修复智慧职教MOOC学院自动答题无法处理判断题的BUG ([b573684](https://github.com/ocsjs/ocsjs/commit/b5736845e38ec1e80281b66fc1f8bb152ec703dd))


### Features

* **script:** 添加职教云作业自动答题 ([4db11a4](https://github.com/ocsjs/ocsjs/commit/4db11a40b7cfbac1e7eda26e50e2bde88d4ee6a5))


### Performance Improvements

* **core:** add woker.onElementSearched args[1] : root ([c0244e9](https://github.com/ocsjs/ocsjs/commit/c0244e998f7893761557d7354d232de9438e00c2))



## [4.3.5](https://github.com/ocsjs/ocsjs/compare/4.3.3...4.3.5) (2023-04-24)


### Bug Fixes

* **script:** 修复题库缓存搜索时每题只出一个结果的BUG ([222735a](https://github.com/ocsjs/ocsjs/commit/222735a98cf94f09e6b69eb313c98283e42561a9))
* **script:** 修复智慧职教MOOC自动答题的填空题无法填空的BUG ([565f879](https://github.com/ocsjs/ocsjs/commit/565f8799518912a65c818baf55a8671576af659f))



## [4.3.3](https://github.com/ocsjs/ocsjs/compare/4.3.2...4.3.3) (2023-04-24)


### Bug Fixes

* **script:** 撤回智慧树图片识别，否则导致作业考试无法使用。 ([fe5b197](https://github.com/ocsjs/ocsjs/commit/fe5b197f1ab4a004d69c44c3460fc94ed7a4e1d6))



## [4.3.2](https://github.com/ocsjs/ocsjs/compare/4.3.1...4.3.2) (2023-04-24)


### Bug Fixes

* **script:** 修复一些显示BUG ([eb4cbc1](https://github.com/ocsjs/ocsjs/commit/eb4cbc1067a97afa4fb81424a9332d393e591982))



## [4.3.1](https://github.com/ocsjs/ocsjs/compare/4.3.0...4.3.1) (2023-04-24)


### Bug Fixes

* **script:** 帮助智慧树修复图片题无法显示的BUG ([bb4c5aa](https://github.com/ocsjs/ocsjs/commit/bb4c5aa49d46f5c077a3855b392ba036db6672e6))



# [4.3.0](https://github.com/ocsjs/ocsjs/compare/4.2.31...4.3.0) (2023-04-24)


### Bug Fixes

* **app:** 优化浏览器环境问题 ([090c7af](https://github.com/ocsjs/ocsjs/commit/090c7af154e34fa7aa0833a586cab7e709cc16c8))
* **core:** 修复题库搜题时出现 Cannot convert object to primitive value 问题 ([9af5f3f](https://github.com/ocsjs/ocsjs/commit/9af5f3ff5ab93fcd87deefbf7af9963636f342ea))
* **scirpt:** 优化搜索结果的显示，并且添加快捷百度一下按钮 ([e074a95](https://github.com/ocsjs/ocsjs/commit/e074a95c647e58281648a0ba83c17c069e4de015))
* **script:** 添加超星自动答题后暂停提示 ([0635db9](https://github.com/ocsjs/ocsjs/commit/0635db94916fcace2e44ef5f7d3fa74114021aa0))
* **script:** 新增超星匹配域名： hnsyu.net ([481445f](https://github.com/ocsjs/ocsjs/commit/481445f46903ef018f125cd17a33e431a979b267))
* **script:** 新增超星视频加载失败检测功能 ([1b1e9b8](https://github.com/ocsjs/ocsjs/commit/1b1e9b8b7697b89f0f5c2aef28aff064d42db606))
* **script:** 修复上个版本智慧职教MOOC学院中作业自动答题题目为空的BUG ([e095493](https://github.com/ocsjs/ocsjs/commit/e095493a3fbd767c2d0d0e90131d6ddc1ec0481f))
* **script:** 修复手贱导致的判断题乱选的BUG ([4cfa3c8](https://github.com/ocsjs/ocsjs/commit/4cfa3c86b948115819ec3e8e9c5a7ebed0b7ebd0))
* **script:** 优化 $modal API ，修复 onClose 执行逻辑 ([37cd819](https://github.com/ocsjs/ocsjs/commit/37cd819f27d7b750c76d0db652b35ad5d604a7aa))
* **script:** 优化超星编辑框复制粘贴问题 ([b263146](https://github.com/ocsjs/ocsjs/commit/b26314689183338e3b4ee3db73258e4e1d538df6))
* **script:** 优化脚本教程，优化搜索结果，删除独立的通知提示和版本日志，转移到脚本首页中。 ([12d9cef](https://github.com/ocsjs/ocsjs/commit/12d9cef9937fd11c73d2b0180f59d4f067777822))
* **script:** 优化屏蔽复制粘贴限制 ([3c124c3](https://github.com/ocsjs/ocsjs/commit/3c124c300233592224f127df8ddcf6cbe65363ce))
* **script:** 优化搜索结果空白的BUG ([5de62f5](https://github.com/ocsjs/ocsjs/commit/5de62f5f9f590c4afe4db2a9b91af8f125481847))
* **script:** 优化智慧树学习逻辑，用户手动切换视频时脚本可以重新生效。 ([ad5757c](https://github.com/ocsjs/ocsjs/commit/ad5757c81fa7e5139e4097c6326996172e0e12a3))


### Features

* **core:** 优化 el API 方便自定义样式 ([e3468f7](https://github.com/ocsjs/ocsjs/commit/e3468f7762b71976338b7a7e74eb920e797e069e))
* **script:** 将题库缓存储域切换成本地存储 ([6969b52](https://github.com/ocsjs/ocsjs/commit/6969b523cf8a6cc8436f101be7b44ae2ce2ca41d))
* **script:** 添加题库缓存功能 ([38bde15](https://github.com/ocsjs/ocsjs/commit/38bde1561acfc5e1cf2961846d55ae5705b46514))
* **script:** 添加智慧职教MOOC学院的作业自动答题功能，优化刷课逻辑。 ([e2954f4](https://github.com/ocsjs/ocsjs/commit/e2954f412e726af2b26f153d0cb980c2d8273608))



## [4.2.31](https://github.com/ocsjs/ocsjs/compare/4.2.29...4.2.31) (2023-04-20)


### Bug Fixes

* **script:** 修复超星图片题选择BUG ([93c520c](https://github.com/ocsjs/ocsjs/commit/93c520cfcea739cb12d3d0c11d05065e0f1e947a))
* **script:** 优化智慧树共享课和校内课的作业和考试 ([c80b08c](https://github.com/ocsjs/ocsjs/commit/c80b08cec8099c335b7a2c0a38cbacf1585f5610))



## [4.2.29](https://github.com/ocsjs/ocsjs/compare/4.2.26...4.2.29) (2023-04-20)


### Bug Fixes

* **script:** 优化超星繁体字识别，优化http网站下复制粘贴问题 ([f98f2c4](https://github.com/ocsjs/ocsjs/commit/f98f2c4f439f02b6a0ef045c8b9a5f61625d8c8e))
* **script:** 优化智慧树作业考试文字识别BUG ([317f136](https://github.com/ocsjs/ocsjs/commit/317f136611b4175955f0fe8c646100aac0d925cb))
* **scripts:** 修复超星倍速提示没有显示的BUG ([ec02677](https://github.com/ocsjs/ocsjs/commit/ec02677a56181b760015e79f9446cbdd2a58b485))



## [4.2.26](https://github.com/ocsjs/ocsjs/compare/4.2.15...4.2.26) (2023-04-19)


### Bug Fixes

* **app:** 修复软件批量创建中无法导出模板的BUG ([7ba565e](https://github.com/ocsjs/ocsjs/commit/7ba565e569d003ac91d124bc09c001816df97edc))
* **app:** 修复OCR初始化软件路径读取问题 ([2ef18e0](https://github.com/ocsjs/ocsjs/commit/2ef18e0e92dd65abda4516df9b9ee7a2f12f4d1c))
* **scirpt:** 在OCS软件中不显示软件配置同步的面板 ([baf3815](https://github.com/ocsjs/ocsjs/commit/baf3815ec8670fed7d27250c4deb9a4c0094676a))
* **script and app:** 修复脚本题库检测BUG，优化软件更新提示 ([7e217d1](https://github.com/ocsjs/ocsjs/commit/7e217d1a68ce840275bdf94ba3fa2265a73d3f13))
* **script:** - 优化超星章节测试题目解析 ([6b39e40](https://github.com/ocsjs/ocsjs/commit/6b39e401cf7c9ad1af58651b1067b722c55236c0))
* **script:** 对超星繁体字库加载进行异常处理 ([7a0c825](https://github.com/ocsjs/ocsjs/commit/7a0c825aec72d1af1cf7e9b33eb78660aea17713))
* **script:** 删除清空答案选项 ([06936a5](https://github.com/ocsjs/ocsjs/commit/06936a558f67f1e9e80d9369e52697ed0f557e2f))
* **script:** 修复超星输入框无法复制粘贴的BUG ([d8a3c30](https://github.com/ocsjs/ocsjs/commit/d8a3c300bcb7f25a186bb3e857f9d0e3c8aa5b9f))
* **script:** 修复超星章节测试出现年份丢失的BUG ([941c0e9](https://github.com/ocsjs/ocsjs/commit/941c0e9ceeefc7270b1f6740f1061e7aed952e39))
* **script:** 修复超星章节测试出现年份丢失的BUG ([2bc1ce1](https://github.com/ocsjs/ocsjs/commit/2bc1ce11bc6ecb0e34300611c3e0c2360624a2fc))
* **script:** 修复搜索结果答案是图片但没有显示的BUG ([860d1fe](https://github.com/ocsjs/ocsjs/commit/860d1feb2fd480a8ba8cc6fcdfe9eda9ca06004a))
* **script:** 修复智慧树考试无法识别题目的BUG ([5140d95](https://github.com/ocsjs/ocsjs/commit/5140d95aeb46ba13244eae73e3d3eb595c3cee1d))
* **script:** 优化软件同步设置，优化题库状态显示 ([4e3cc96](https://github.com/ocsjs/ocsjs/commit/4e3cc967fc653f333cbb897404ac1f8f8ae65ab8))
* **scripts:** 每次渲染强制更新通知和版本日志 ([7cc5347](https://github.com/ocsjs/ocsjs/commit/7cc53479e00205c1fae88c6ae3e353874bdff413))


### Features

* **script:** 添加题目冗余字段自定义删除功能 ([198e240](https://github.com/ocsjs/ocsjs/commit/198e2408fa90325731b8eae8e5b8e6e42609d102))



## [4.2.15](https://github.com/ocsjs/ocsjs/compare/4.2.11...4.2.15) (2023-04-04)


### Bug Fixes

* **all:** 修复软件配置同步导致的各种问题 ([6040d70](https://github.com/ocsjs/ocsjs/commit/6040d7098e5c0ca38b27064bd2fdbaf71ac83fbe))
* **script:** 修复搜索结果超时后全部题库都显示超时的BUG ([a11b2a5](https://github.com/ocsjs/ocsjs/commit/a11b2a5fa65bc52aca28dd731c954ee36ded2f6d))
* **script:** 修复通知和版本日志在有些页面访问不了的BUG ([7fa694a](https://github.com/ocsjs/ocsjs/commit/7fa694ad6cce5b3edc5cbf4c50bfada3b95aa7a7))
* **script:** 优化全局设置题库检测，增加防抖 ([a1de6ab](https://github.com/ocsjs/ocsjs/commit/a1de6ab38ab8e08313eba3f50572b7d9659e9e59))



## [4.2.11](https://github.com/ocsjs/ocsjs/compare/3.13.0...4.2.11) (2023-04-03)


### Bug Fixes

* **all:** 修改项目链接 enncy/online-course-script => ocsjs/ocsjs ([e7f0229](https://github.com/ocsjs/ocsjs/commit/e7f02292548e89517585e7a3a96e6063078eecd6))
* **app:** 使用JSON消除自定义脚本的响应式特性，修复每个浏览器自定义脚数据相同的问题。 ([af7b97e](https://github.com/ocsjs/ocsjs/commit/af7b97e2c5e0a426813a231e02b66072c57db8ee))
* **app:** 新增软件 zip 打包方式，修复工作区丢失的BUG ([8fe1357](https://github.com/ocsjs/ocsjs/commit/8fe13574285871f56234223264b1ae64a0c27a77))
* **app:** 修复部分用户加载不出导航页的BUG ([19f4d10](https://github.com/ocsjs/ocsjs/commit/19f4d102edbacaff21cd324189599941e7e78739))
* **app:** 修复软件标题栏重载时不自动切换的BUG ([25f45ce](https://github.com/ocsjs/ocsjs/commit/25f45ce643c3e30a32d2f9e89a425e7ec6e57d8b))
* **app:** 修复软件浏览器标签输入时不自动提示的BUG ([6aececb](https://github.com/ocsjs/ocsjs/commit/6aececb4511929732a5e03a4c41c2d8172bc633c))
* **app:** 修复软件运行途中删除文件会导致所有浏览器关闭的BUG ([45a2c22](https://github.com/ocsjs/ocsjs/commit/45a2c226ca1033f2ac9c95f3498772eb06856529))
* **app:** 修改app加载文件以及油猴插件路径问题 ([cbf6930](https://github.com/ocsjs/ocsjs/commit/cbf69306236d0b91d822ea27345cae3e4579a1ab))
* **app:** 优化 app remote 模块，修改成异步通信，修复同步通信导致的页面卡死问题。 ([9a81721](https://github.com/ocsjs/ocsjs/commit/9a817212ae1a57e88a8738425de8c51218bfeefa))
* **app:** 优化软件导航页，将ocs-app接口代理删除，全局使用15319端口进行访问，修改浏览器启动选项，使浏览器环境更接近真实浏览器 ([9c8d3fd](https://github.com/ocsjs/ocsjs/commit/9c8d3fd6f1986b5a1834696a9b8362109125132b))
* **app:** 优化软件更新程序，并修复更新通知抽搐问题 ([460e79a](https://github.com/ocsjs/ocsjs/commit/460e79a07f45e26f8d64136bf40f42ab2f3a83e7))
* **app:** 优化软件监控问题，以及启动脚本，和浏览器状态处理优化。 ([7b7475d](https://github.com/ocsjs/ocsjs/commit/7b7475df86b3c3e509dfb8e1e44d4770fff00dfd))
* **app:** 优化软件自动化脚本，添加类型声明 ([b3f1565](https://github.com/ocsjs/ocsjs/commit/b3f1565505a5331f2761e333c06dcd971c41f800))
* **app:** app version update ([5ddce81](https://github.com/ocsjs/ocsjs/commit/5ddce8114f8121d42a76917d0b34013d86eb68bc))
* **app:** remove public build ([d3e4340](https://github.com/ocsjs/ocsjs/commit/d3e4340b82381e78daf56d02f5ccb2ae8e8da7ee))
* **core:** 持续优化超星直播回放脚本 ([1d3b399](https://github.com/ocsjs/ocsjs/commit/1d3b399e790616cfade8aed6e3d81dcc2402da5d))
* **core:** 调整职教云任务读取速度 ([b2adafb](https://github.com/ocsjs/ocsjs/commit/b2adafbade5b894f7c723b3e197ea44a3919cdcd))
* **core:** 更改  $gm 和 $ 修改后的代码 ([941ea30](https://github.com/ocsjs/ocsjs/commit/941ea307206c2e197134b8499977e3568332b6bf))
* **core:** 更新超星未完成章节会出现提示框的问题 ([ebd75d1](https://github.com/ocsjs/ocsjs/commit/ebd75d17500effb477363a48db00e60b36825ed8))
* **core:** 更新教程链接 ([f07fe39](https://github.com/ocsjs/ocsjs/commit/f07fe3906a1bbfe360d5174cf2bfacbfe319bb88))
* **core:** 更新智慧树脚本 ([dc04328](https://github.com/ocsjs/ocsjs/commit/dc04328309092e4630d16d1b7111936354d85d6c))
* **core:** 继续修复上个版本问题 ([41ca48c](https://github.com/ocsjs/ocsjs/commit/41ca48c83966035f536de822f8d25a58a0f7ac68))
* **core:** 将 dropdown 的 opiton 元素改成 div 元素 ([5a8877e](https://github.com/ocsjs/ocsjs/commit/5a8877e531b19a344d58e11b1956c787186dc005))
* **core:** 将 unsafeWindow 全局变量封装成 useUnsafeWindow ([1c0f0bb](https://github.com/ocsjs/ocsjs/commit/1c0f0bbf71661249b81bfed12472fd7bc389ebf2))
* **core:** 将超星视频进度步数调整为0.25，倍速颗粒度控制更高。 ([1702aa9](https://github.com/ocsjs/ocsjs/commit/1702aa9484bc5007a8f04cb0f1600af72ab28477))
* **core:** 将整个项目修改成跨域响应式模式 ([10aaf0a](https://github.com/ocsjs/ocsjs/commit/10aaf0ae4d415d68e3a22bba303962c17f43355f))
* **core:** 脚本学习核心修改，适配 useSettings 和 useContext 两个 API ([b4e38b1](https://github.com/ocsjs/ocsjs/commit/b4e38b144cdd23504432a17950aafcbbcd6723c2))
* **core:** 解决cx任务点未完成出现弹窗的问题 ([d9a6738](https://github.com/ocsjs/ocsjs/commit/d9a67389dabee1dde144f96df4cf45909b290072))
* **core:** 删除超星在作业考试中题目多余内容导致的正确率下降 ([5ff27e5](https://github.com/ocsjs/ocsjs/commit/5ff27e5558500671d9cb30d96d1175be86e48dd1))
* **core:** 删除全局变量 OCS ([c74195d](https://github.com/ocsjs/ocsjs/commit/c74195d0d3192e6854c8da0d32262634f4470de2))
* **core:** 添加本地存储初始化时删除无用字段 ([dc57a4a](https://github.com/ocsjs/ocsjs/commit/dc57a4a33f20ccd11922d806425acdeb30a8a45a))
* **core:** 为所有参数提供默认值，防止页面空白或者头部空白。 ([baf6086](https://github.com/ocsjs/ocsjs/commit/baf6086567d1cc4b1681fcdf5d818260ccbe8dd6))
* **core:** 限制请求超时时间最小为10 ([f3fc59e](https://github.com/ocsjs/ocsjs/commit/f3fc59e211b6f86c70c4a9a80a6c0bb3b4b82a0d))
* **core:** 新增ICVE字段 ([abbcfec](https://github.com/ocsjs/ocsjs/commit/abbcfec64d25622415c863233029c68878d1d4a5))
* **core:** 修复 store 环境检测问题 ([cd14eb0](https://github.com/ocsjs/ocsjs/commit/cd14eb07e8b33746fc72b1d35e2aaba85a85b07f))
* **core:** 修复 StringUtils 导入问题 ([50b83dd](https://github.com/ocsjs/ocsjs/commit/50b83dd3942cf6801da203b168c55ae70d63c3be))
* **core:** 修复$message不能永久显示bug ([3eec4b8](https://github.com/ocsjs/ocsjs/commit/3eec4b8b386c241c40a4df2813e45f10c62f45d2))
* **core:** 修复不能关闭路线切换的BUG ([a5694f1](https://github.com/ocsjs/ocsjs/commit/a5694f1acecb7962c0e39d5b6890b5b86b365d03))
* **core:** 修复部分页面存在不执行 interactive 生命周期的问题 ([1f9a8cc](https://github.com/ocsjs/ocsjs/commit/1f9a8cc32b47c9a46a6c77089f5d1b1dd192f625))
* **core:** 修复超星复习模式自动切换的BUG ([64c63cc](https://github.com/ocsjs/ocsjs/commit/64c63cc19bf0f97de7409a1f3c87ab4321726365))
* **core:** 修复超星视频答题永远只选2个选项的BUG ([1209ee7](https://github.com/ocsjs/ocsjs/commit/1209ee7362a3bd10e7745393a944f686b0fca431))
* **core:** 修复超星音频任务不能播放的BUG ([2777c69](https://github.com/ocsjs/ocsjs/commit/2777c691322b8d511b56e44e08384ed15f29827e))
* **core:** 修复答题结果中存在答案但是不选的BUG ([8129842](https://github.com/ocsjs/ocsjs/commit/8129842fbdc6187ab93a07ba4e34a38f66fed998))
* **core:** 修复打包后文件中文变成Unicode编码的问题 ([ea6da2c](https://github.com/ocsjs/ocsjs/commit/ea6da2cea453efbf6cd7da3d15f30ff7f1aa7961))
* **core:** 修复代码中带有特殊字符时，unicode 转换失败 ([fb0cb21](https://github.com/ocsjs/ocsjs/commit/fb0cb211a6f87de37fe4f0ea9d2cb5956e9857b2))
* **core:** 修复跨域问题 ([8ad21bf](https://github.com/ocsjs/ocsjs/commit/8ad21bfcbd4130ab71a15813beabeec045223ef2))
* **core:** 修复每次页面加载都要删除core监听队列的bug ([230d43a](https://github.com/ocsjs/ocsjs/commit/230d43a0e9a3fe047c787c588a3e1285f46638e8))
* **core:** 修复日志面板不会实时滚动的BUG ([a0b9fff](https://github.com/ocsjs/ocsjs/commit/a0b9fffb6967a34397eef6597483ccdff8772319))
* **core:** 修复视频频繁停止导致的频繁验证码 ([62f708e](https://github.com/ocsjs/ocsjs/commit/62f708e9e1a3e15582efd0618ca085b9aa578535))
* **core:** 修复数字输入可以超过范围的BUG ([edbd3bc](https://github.com/ocsjs/ocsjs/commit/edbd3bce0385f404d9dcad58d5b831c61c7f9545))
* **core:** 修复题库配置报错异常未捕获的BUG ([4e04da0](https://github.com/ocsjs/ocsjs/commit/4e04da0ccfd938e58d4f0239be861a882fb01d56))
* **core:** 修复职教云进度不显示的BUG ([480cfa3](https://github.com/ocsjs/ocsjs/commit/480cfa3a71d91a2252e73f9ae09db6221a97c8a0))
* **core:** 修复职教云任务获取出现子节点BUG ([ba63921](https://github.com/ocsjs/ocsjs/commit/ba639211dedd4d50b56e7a8ea1e02d1c25c73346))
* **core:** 修复职教云子节点读取的问题，优化任务列表，优化学习脚本 ([5a11f13](https://github.com/ocsjs/ocsjs/commit/5a11f138151bc0a8b0297b1f09ed17e8c2589488))
* **core:** 修复智慧树倍速失效的BUG ([7943442](https://github.com/ocsjs/ocsjs/commit/79434421cc1b9c28c547b7c45b08ea762459dd26))
* **core:** 修复智慧树视脚本的频路径匹配 ([b03dd08](https://github.com/ocsjs/ocsjs/commit/b03dd08d178ac9e89fb042a5bf97520eda1de10e))
* **core:** 修复智慧树视频测验弹窗无法关闭的BUG ([fc0741f](https://github.com/ocsjs/ocsjs/commit/fc0741f7903992d877ee4b8b1b04e272f81b7a4d))
* **core:** 修复select,range等对value不显示的bug ([201b3ad](https://github.com/ocsjs/ocsjs/commit/201b3add0ffcbfbdb41157071e1b8d660cb38ac4))
* **core:** 修复zhs弹窗关闭的问题 ([a688768](https://github.com/ocsjs/ocsjs/commit/a688768c39984561cee8d2ecfee7f6ad07d2f78b))
* **core:** 修改 $creator.tooltip 的卡死BUG，很多元素时会导致卡顿，这里将 tooltip 变成单个全局元素。 ([da59c28](https://github.com/ocsjs/ocsjs/commit/da59c2899bb9ef37aca5aee2000e00311cad1d73))
* **core:** 修改 userjs.templete 模板文件，兼容跨域响应式，并修改 homepage 等字段 ([f945a80](https://github.com/ocsjs/ocsjs/commit/f945a8043e5e62f4b92f8650fc332278cdfb974b))
* **core:** 修改生命周期执行规则 ([99b66fb](https://github.com/ocsjs/ocsjs/commit/99b66fb884f2b88eef72fa402e932bfa40e71148))
* **core:** 修改搜索结果文案 ([00f185e](https://github.com/ocsjs/ocsjs/commit/00f185e2cba817cbe4d58e28c1d8248bdd656b9d))
* **core:** 修改元素是否存在的判断 ([345fbcc](https://github.com/ocsjs/ocsjs/commit/345fbccd675dee604e3b4fd21d6c787a38c6575d))
* **core:** 修改cdn地址 ([013e3ba](https://github.com/ocsjs/ocsjs/commit/013e3ba037b38b88a4728c4cbd478cd4e518953e))
* **core:** 移除页面反调试脚本至超星 ([77cb19c](https://github.com/ocsjs/ocsjs/commit/77cb19c73df4fdacaac7120bdd748a49a06c8091))
* **core:** 因全局变量删除，且需要封装 store 中多个变量的处理，以及防止变量污染，新增了 useContext 和 useSettings 的API，相应涉及代码同步更新。 ([6d9fa51](https://github.com/ocsjs/ocsjs/commit/6d9fa5112e81ce278f16a8248c3f9dfe3fed8e13))
* **core:** 优化 start 主函数，防止脚本重新执行 ([bef652d](https://github.com/ocsjs/ocsjs/commit/bef652d3407ebd07033c2eeb88b1cef9d3d14190))
* **core:** 优化超星直播回放 ([0727bea](https://github.com/ocsjs/ocsjs/commit/0727bea2c3d9c549770cfa9f5f305afdea91825f))
* **core:** 优化登录脚本，非空判断 ([684c441](https://github.com/ocsjs/ocsjs/commit/684c441401969c10172bf3c613058c750b5248d2))
* **core:** 优化获取远程本地软件题库配置功能 ([09986b5](https://github.com/ocsjs/ocsjs/commit/09986b5acaa066c2b259a0e1b69f38ece2898b0c))
* **core:** 优化题库解析器 ([67b50a4](https://github.com/ocsjs/ocsjs/commit/67b50a47fdc9fb5730e83d295249e93e046c12f7))
* **core:** 优化题库配置字段 ([d674f00](https://github.com/ocsjs/ocsjs/commit/d674f007c62c3882ad9426d8ee93c8360eef9347))
* **core:** 优化图片识别时图片链接显示的问题 ([d9778f6](https://github.com/ocsjs/ocsjs/commit/d9778f6268a4986a4ff3eed7542ee54f9e97242b))
* **core:** 优化响应式存储 ([b307f74](https://github.com/ocsjs/ocsjs/commit/b307f74140d382243c46dc80dafa372cf1b3ca47))
* **core:** 优化页面通讯以及构建 ([7a20041](https://github.com/ocsjs/ocsjs/commit/7a20041ce081f9675b447847ad8cf9324bf7305d))
* **core:** 优化智慧树脚本，适配 useContext 和 useSettings 两个 API ([a24d991](https://github.com/ocsjs/ocsjs/commit/a24d991e8a289dd524ae577036a4e165b92afbd1))
* **core:** 优化自动答题逻辑，修复有答案不选的BUG ([23df64d](https://github.com/ocsjs/ocsjs/commit/23df64d1d77a9556a1d105d72bc9810fb4c06c18))
* **core:** 优化OCS环境加载问题 ([2742ed4](https://github.com/ocsjs/ocsjs/commit/2742ed47892308879560742b1aa2bf2a08dbe6cf))
* **core:** 暂时删除视频答题功能 ([b8eeba5](https://github.com/ocsjs/ocsjs/commit/b8eeba52b2d8a8fdd16a90a9f7a3f73d9d8cc722))
* **core:** 增加答题器的 await 等待机制，多选题选择时需要 await 等待 ([853a30d](https://github.com/ocsjs/ocsjs/commit/853a30d0b9ebac9dca8721e0ce8ce838056e2e11))
* **root:** 修复 release.sh 打包文件错误时仍然执行的BUG ([6f14bd8](https://github.com/ocsjs/ocsjs/commit/6f14bd854954f1415705d4086d41eb852d1854d0))
* **root:** 优化构建发布release.sh文件 ([a855740](https://github.com/ocsjs/ocsjs/commit/a855740f0b8ffa107f5f580f2123c70baedb16f7))
* **scirpt:** 修复搜索结果显示与搜题不一致的BUG，优化各脚本，持续优化学习通任务检测算法。 ([f49737a](https://github.com/ocsjs/ocsjs/commit/f49737aa6227be382d608b08f079cf46ef3f8649))
* **script:** 持续修复超星问题 ([f2f08e2](https://github.com/ocsjs/ocsjs/commit/f2f08e20eb94466f5dd81dbb5a63ae7f33026911))
* **script:** 登录时将脚本至于左上方防止挡住软件操作 ([dc2bf1d](https://github.com/ocsjs/ocsjs/commit/dc2bf1d4added39f3967276dc6a05490115251e1))
* **script:** 删除超星的强制答题选项 ([60bf03c](https://github.com/ocsjs/ocsjs/commit/60bf03c6ecddb7a2faaee6667ac3033f4a6f4403))
* **script:** 删除脚本展开功能 ([ec1f527](https://github.com/ocsjs/ocsjs/commit/ec1f52798f4bf3b7fb1c4800445e3939a64b660b))
* **script:** 删除浏览器窗口检测，经过测试全屏游戏中也会进行误报。 ([bf30309](https://github.com/ocsjs/ocsjs/commit/bf30309f7cb331b239dc74d3733fa433c8dbcf2c))
* **script:** 使用固定端口与桌面软件通讯 ([7bc6de4](https://github.com/ocsjs/ocsjs/commit/7bc6de47bb0686f2353fbcbe56ed75bc93a5b95e))
* **script:** 添加环境检测，优化职教云逻辑 ([709e673](https://github.com/ocsjs/ocsjs/commit/709e673a4ed5efe755238b45645f4878d079117c))
* **script:** 修复超星多个视频同时播放的BUG ([51ea1b0](https://github.com/ocsjs/ocsjs/commit/51ea1b0a43c32d596450c39d3940e9f767287583))
* **script:** 修复超星频繁验证码的BUG ([8544e87](https://github.com/ocsjs/ocsjs/commit/8544e876d4ef63a7f6c3a918a9294f5feb8c5109))
* **script:** 修复超星章节测试填空题不填的问题 ([05a3cd1](https://github.com/ocsjs/ocsjs/commit/05a3cd11dadaa1700032b357727a4cf3ea807262))
* **script:** 修复超星BUG ([8fe0a40](https://github.com/ocsjs/ocsjs/commit/8fe0a4049d504d91e004c9a42ad3ac9ddea560b7))
* **script:** 修复窗口移除页面问题 ([bf2017a](https://github.com/ocsjs/ocsjs/commit/bf2017ae7d54c44cc8843ad5e361cd24751017b8))
* **script:** 修复答题器出现错误时会一直卡死 ([0f02745](https://github.com/ocsjs/ocsjs/commit/0f02745f020920b2f2fe7d8ab15f0e53509ae38c))
* **script:** 修复复制粘贴解除限制的BUG ([ebded93](https://github.com/ocsjs/ocsjs/commit/ebded937fa9a47926d7a977bcaae6f55597868b3))
* **script:** 修复通用-全局设置中题库状态检测BUG ([ebd6536](https://github.com/ocsjs/ocsjs/commit/ebd6536e26369eefc5d3ad8aa471e087f4f95b06))
* **script:** 修复学习通刷课逻辑 ([831f1d3](https://github.com/ocsjs/ocsjs/commit/831f1d33c7a9b350fe44c3121c6120f27720a2e4))
* **script:** 修复智慧树答题后不保存的BUG ([c56b54f](https://github.com/ocsjs/ocsjs/commit/c56b54f701d63feb3a47a2d53890348264e68be8))
* **script:** 修复智慧树作业答题完成后选择BUG ([8abf168](https://github.com/ocsjs/ocsjs/commit/8abf168d9efd5e8e170e8faa85b3285d7c847305))
* **script:** 优化播放函数 ([4204594](https://github.com/ocsjs/ocsjs/commit/4204594bc70fdd91d93f41bfd3975fba2a99e47a))
* **script:** 优化超星和智慧树脚本 ([cb5fe71](https://github.com/ocsjs/ocsjs/commit/cb5fe710be11d5652414b5470912a70a8bd2cc15))
* **script:** 优化窗口加载问题 ([e5cba2c](https://github.com/ocsjs/ocsjs/commit/e5cba2c809e6c385345e46121dc34afbacecc243))


### Features

* **all:** 脚本2.0与软件4.0更新完毕 ([6e04369](https://github.com/ocsjs/ocsjs/commit/6e043692f0fcfd4b5d56d785c2787c1bbdd22c9d))
* **all:** 脚本更新至 4.0 ， 软件更新至 2.0 ([7cb995f](https://github.com/ocsjs/ocsjs/commit/7cb995f6d062ba79e09852f42be3565b8f107cd0))
* **app and web:** 将 electron 升级到 23.0.0 ， 删除 electron 原生窗口样式 frame: false，自定义 titlebar ，并优化主题切换。 ([961235f](https://github.com/ocsjs/ocsjs/commit/961235fab116575b88aa5f71f0ca6aac87f71c0c))
* **app:** 将OCR识别模块整合打包，修复OCR路径存在空格执行失败的BUG ([9609af6](https://github.com/ocsjs/ocsjs/commit/9609af6d6f53b72b010de69e9df89294d0b27faa))
* **app:** 删除超星智慧树的其他登录，新增自定义链接进入。 ([5851511](https://github.com/ocsjs/ocsjs/commit/58515115728dfacfee83e1c67c3bb1efcb4ddb59))
* **app:** 文件中新增图片预览一栏，定时更新页面图像，无需在多个浏览器中切换查看。 ([526dbd6](https://github.com/ocsjs/ocsjs/commit/526dbd63e7bfa57828d1950517644801021db91b))
* **app:** 新增网页打开脚本，将ocr模块一同打包 ([7686cf1](https://github.com/ocsjs/ocsjs/commit/7686cf1a5a9d462e0ce0b8a3ff7c0e6235da562d))
* **app:** 新增仪表盘功能，新增浏览器拓展管理功能，新增新手教程功能，新增批量运行文件功能，并重写文件管理系统。 ([8adfede](https://github.com/ocsjs/ocsjs/commit/8adfede9f790cdeae588c95a3e5d7134802fffb1))
* **app:** 新增用户脚本，可自定义网络脚本添加到本地脚本，并自动载入本地脚本，极大拓展软件功能。 ([7926b35](https://github.com/ocsjs/ocsjs/commit/7926b354ffc9f14dc2404f45dd869da96495a7f2))
* **app:** 新增资源加载器，优化各种资源加载问题，移除原有的OCR模块打包方式。 ([1b83d8a](https://github.com/ocsjs/ocsjs/commit/1b83d8af6388fa568d83521c06e9322736c31b48))
* **app:** 修改app主进程从 commonjs 改成 ts ([3e29f82](https://github.com/ocsjs/ocsjs/commit/3e29f821cd1f5414c68ae0f944c512f8e94bdfb3))
* **app:** 优化 script 工作线程，规范代码，修复人工错误导致的无限递归。 ([156b2f7](https://github.com/ocsjs/ocsjs/commit/156b2f71ed4d42fae620b89c179f3b86ebaf2064))
* **core and app:** 新增软件服务端，使脚本可读取软件信息。 ([6f4ff54](https://github.com/ocsjs/ocsjs/commit/6f4ff54bb3a83fcb273a48ef41b5ba973d6d2f01))
* **core:** - 拆分 core ，- 添加多线程答题 - 添加超星作业考试功能 - 将 core/utils 全部进行 $ 前缀声明以便区分 - 优化搜题结果元素。 ([a252e85](https://github.com/ocsjs/ocsjs/commit/a252e855fb03d8335c28cb563c60b96a9317a0c1))
* **core:** 4.0 init ([4a43ee9](https://github.com/ocsjs/ocsjs/commit/4a43ee9bbb4af37ebf4317f87f5508067acd5139))
* **core:** 4.0 init ([7151eb3](https://github.com/ocsjs/ocsjs/commit/7151eb3643054021feadcdfb512871ba3916e4e1))
* **core:** 持续优化zhs答题功能 ([b120ce7](https://github.com/ocsjs/ocsjs/commit/b120ce718ea84db17a6d5fc3f43ad3214139b7de))
* **core:** 处理 onbeforeunload 执行结果 ([9e0fc87](https://github.com/ocsjs/ocsjs/commit/9e0fc87fad7652ab57bc3ce1080c3cf1ecb294e7))
* **core:** 给 script 的全部声明周期同样添加相同的事件触发 ([289c0d8](https://github.com/ocsjs/ocsjs/commit/289c0d8c746f60b9e69bc0dc22a1516505592db9))
* **core:** 将 OCSWoker 和 Script 都变成 EventEmitter 对象，实现内部的事件分发 ([2e0872c](https://github.com/ocsjs/ocsjs/commit/2e0872cf6cf2faa6088dbd1235aa32933b2b466f))
* **core:** 删除窗口关闭按钮，用户可以通过“窗口设置”进行隐藏窗口。 ([4a447e4](https://github.com/ocsjs/ocsjs/commit/4a447e4d5deb60dc2078862f4fb3dc36d92e9a67))
* **core:** 搜索结果页面新增复制题目按钮 ([4cbd032](https://github.com/ocsjs/ocsjs/commit/4cbd03217678a9426806f98828d76f2da664ba20))
* **core:** 添加 $creator 元素创建工具类变量，并且重写登录脚本，使用动态添加元素的方式重写。 ([ba94b16](https://github.com/ocsjs/ocsjs/commit/ba94b165eaefe2b95d5b349ce60fa88aec0d7f19))
* **core:** 添加 $modal.onClose 不管关闭还是确认和取消都会触发此函数 ([5cec198](https://github.com/ocsjs/ocsjs/commit/5cec1984bbf4da4e2bf8f518f9ba858a0c1bc340))
* **core:** 添加 onhistorychange 钩子 ([e8c1ecb](https://github.com/ocsjs/ocsjs/commit/e8c1ecb9ecbe7ec1a842952a0f7be58ac1d7964f))
* **core:** 添加 Script.configs 参数生产后 this.cfg 的代码提示 ([d31704e](https://github.com/ocsjs/ocsjs/commit/d31704e2716ca298e134a87cdc58189372e7b834))
* **core:** 添加 script.onrender 钩子 ([a81404b](https://github.com/ocsjs/ocsjs/commit/a81404b1071be98d486c8331dc066b99f17fa004))
* **core:** 添加 SearchResultsElement 元素 ([d66dffb](https://github.com/ocsjs/ocsjs/commit/d66dffb79ccab8726a4b6a8d90dc140f7637017e))
* **core:** 添加 StringUtils 工具类 ([4f1341a](https://github.com/ocsjs/ocsjs/commit/4f1341a7d57d4b667b0c07a71f7cd1a3a31b0fa8))
* **core:** 添加超星登录脚本 ([9b2e086](https://github.com/ocsjs/ocsjs/commit/9b2e086698cd2765d568538debcac75c6d701514))
* **core:** 添加面板选择器分组功能 ([226d1eb](https://github.com/ocsjs/ocsjs/commit/226d1eb8378d62bcb799e0c98b2a34e96fc9c446))
* **core:** 添加全局跨域通讯对象,并使用此技术重写模态框调出方法 ([81b1daf](https://github.com/ocsjs/ocsjs/commit/81b1daff19850cbb084a5eb6564e88ef2be4db7e))
* **core:** 添加使用教程, 重载 el 函数, 修改cors跨域模块使用 setTab, getTab 进行cors跨域标签分区. 优化页面选择逻辑 ([eaa6ae5](https://github.com/ocsjs/ocsjs/commit/eaa6ae5030fcfc31db905ed24969995d06014af3))
* **core:** 添加页面复制粘贴限制解除脚本 ([4acdfd0](https://github.com/ocsjs/ocsjs/commit/4acdfd018e8dd55360e78f66547d6a56541c4ffe))
* **core:** 添加在线搜题功能 ([dc26b2e](https://github.com/ocsjs/ocsjs/commit/dc26b2e0e52d59d015546b960e533c09f2d39e27))
* **core:** 添加智慧树自动答题功能 ([642901d](https://github.com/ocsjs/ocsjs/commit/642901d470a3b69f826dc8c9f331cbd306ebd713))
* **core:** 完成4.0基本架构 ([23129f4](https://github.com/ocsjs/ocsjs/commit/23129f43581acab6e367b6ff38f0fe4b66f04708))
* **core:** 完成脚本内容的元素和数值同步 ([4d1dc60](https://github.com/ocsjs/ocsjs/commit/4d1dc60985b5b9623dd61a351babd8640f5a4259))
* **core:** 完成智慧树登录脚本,学习脚本,修复BUG ([f07dd0f](https://github.com/ocsjs/ocsjs/commit/f07dd0fdaa468df626ba5fa03a503bfc8cb72bd5))
* **core:** 新增 $creator 多个API ([d245726](https://github.com/ocsjs/ocsjs/commit/d245726df9f4847b8a8df47375a13e03b35d7fb4))
* **core:** 新增 $message 和 $model 方法进行用户交互 ([c6d365c](https://github.com/ocsjs/ocsjs/commit/c6d365ce13f046ed93971d9991dfcfad3990b419))
* **core:** 新增 通用-搜索结果 显示 ([9d9ead8](https://github.com/ocsjs/ocsjs/commit/9d9ead85747ccd94f922d7f50573ff99d9b9761a))
* **core:** 新增 智慧职教mooc脚本 ， 优化职教云脚本 ([0e44978](https://github.com/ocsjs/ocsjs/commit/0e44978c57e81afcaf28b55c1adfdb4eac297db0))
* **core:** 新增 Script.methods 方法可自定义对外暴露函数，优化搜索结果的显示。 ([53043d1](https://github.com/ocsjs/ocsjs/commit/53043d1590f09c557ae0059233806dd43c06653e))
* **core:** 新增 SCript.pin 方法，置顶某个面板 ([766f87e](https://github.com/ocsjs/ocsjs/commit/766f87e3f03c6216706b67a1cd6801c55c08f78b))
* **core:** 新增 unsafeWindow 全局变量 ([9438a1e](https://github.com/ocsjs/ocsjs/commit/9438a1efc4451adf5160ca9067407deaa9707c5b))
* **core:** 新增超星直播回放视频脚本 ([3788a6f](https://github.com/ocsjs/ocsjs/commit/3788a6fc5bb852b4847025b4df88a5b9499ce4de))
* **core:** 新增跨域响应式特性 ([d7f967e](https://github.com/ocsjs/ocsjs/commit/d7f967ec27fd3d67de9d8132dd60100765727384))
* **core:** 新增智慧树：清晰度选择，定时停止，视频总时长计算，等功能 ([7204f26](https://github.com/ocsjs/ocsjs/commit/7204f26f7b2c3c6700df1f7d9d08a43371cd8c35))
* **core:** 新增智慧树的视频画质选择功能 ([290ce51](https://github.com/ocsjs/ocsjs/commit/290ce51032e2a8b773b61275ada58002ade0aa22))
* **core:** 新增智慧树视频反反混淆脚本 ([5de857f](https://github.com/ocsjs/ocsjs/commit/5de857fb12f229fbed1284d507bac87500e5b6ce))
* **core:** 新增智慧树验证码检测功能 ([dcf73b3](https://github.com/ocsjs/ocsjs/commit/dcf73b317cb7492a971a74c77af03e91a13eb1bb))
* **core:** 新增智慧职教（职教云）脚本 ([59c0cc2](https://github.com/ocsjs/ocsjs/commit/59c0cc2b66fa1af2418e682bec014342f3ed0e7f))
* **core:** 新增j脚本热更新功能，大大提升开发效率 ([42ba110](https://github.com/ocsjs/ocsjs/commit/42ba110b2cc8e54e043b73979216a8f22c9017fe))
* **core:** 修改脚本声明写法，修改 project.scripts 由数组变成对象声明，好处是可以由 project.scripts.[脚本名].cfg.xxx 进行类型推断实现类型提示。 ([b73fdb0](https://github.com/ocsjs/ocsjs/commit/b73fdb021f9b050278f321c7d353f81e8869d964))
* **core:** 优化 cx 的 Project 新写法 ([61f466a](https://github.com/ocsjs/ocsjs/commit/61f466a0e4e85a59985bb59c84ca7efc04975213))
* **core:** 优化使用$creator ([23efe42](https://github.com/ocsjs/ocsjs/commit/23efe4274f1b6604e85189a39bc47cdc7e5542b1))
* **core:** 优化渲染工程 ([31b5728](https://github.com/ocsjs/ocsjs/commit/31b5728843b44f244bb3abbf4f5f72f79259350e))
* **core:** 优化智慧树文字识别脚本 ([608e760](https://github.com/ocsjs/ocsjs/commit/608e76076d63d3b22c55c0baaf2df008e0b32313))
* **core:** 增加多线程查题功能 ([be3b85c](https://github.com/ocsjs/ocsjs/commit/be3b85cdf382c9add8e5b155c2b1a97dbbb46bd4))
* **core:** 增加智慧树习惯分检测，学习记录查询，答题手动控制 ([e753da9](https://github.com/ocsjs/ocsjs/commit/e753da9cee93b0873e5d2be7b09c7770451cef7a))
* **core:** 支持跨域调出模态框 ([f1f4271](https://github.com/ocsjs/ocsjs/commit/f1f427166d21622fed299399456e235386a69cb6))
* **core:** 智慧职教（职教云）发布 ([f0eb02f](https://github.com/ocsjs/ocsjs/commit/f0eb02f2ada42fb64a5f3767689ddf7af0c303e9))
* **script and core:** 添加全局错误捕获功能 ([476483d](https://github.com/ocsjs/ocsjs/commit/476483da346104b63766810953fa4a254ed0a72f))
* **script:** 超星刷课逻辑重写，兼容旧版浏览器CSS样式 ([184e0e9](https://github.com/ocsjs/ocsjs/commit/184e0e9910aa1eccf55b89d6a360e9a218d648d8))
* **script:** 添加浏览器版本检测 ([5c81815](https://github.com/ocsjs/ocsjs/commit/5c81815d81ad1dad5ed998a5dfe14a4db0935021))
* **script:** 添加页面关闭提示 ([477fb01](https://github.com/ocsjs/ocsjs/commit/477fb01e8e92e14c71382daa24ce9852d7bd9c4a))
* **script:** 添加智慧职教音频支持 ([0e6402c](https://github.com/ocsjs/ocsjs/commit/0e6402c019afbaeca24da2900c3a81771faa5249))
* **script:** 新增【职教云】和【智慧职教】脚本 ([0cf366a](https://github.com/ocsjs/ocsjs/commit/0cf366a5ef082496a0108902fd58dfa874e9eb98))
* **script:** 新增浏览器最小化检测脚本 ([4934f65](https://github.com/ocsjs/ocsjs/commit/4934f6535ed2a7c1d0f078ba136b5213f5d8ba12))
* **script:** 修改浏览器下载链接，新增脚本版本更新检测 ([9265c2b](https://github.com/ocsjs/ocsjs/commit/9265c2ba09639121c417e9042fcd0230ca3da00a))
* **script:** version release 4.0.5 ([d7c4574](https://github.com/ocsjs/ocsjs/commit/d7c4574faa2da036a5b04f4a48b6840dd74461b9))
* **script:** version update to 4.1.0 ([216596f](https://github.com/ocsjs/ocsjs/commit/216596fde62d1591696dde101a49eff27619085c))
* **utils:** 新增utils包，其内置各种实用工具。其中新增脚本打包器，可对打包流程进行优化。 ([01879dd](https://github.com/ocsjs/ocsjs/commit/01879dd251cdb299df799631262c268a3de827af))


### Performance Improvements

* **core:** 更新 MoelElement 参数以及实现 ([219ca6f](https://github.com/ocsjs/ocsjs/commit/219ca6faab611da9c9aa9c6afd68cdc5bcb3fa71))
* **core:** 添加 SearchResultsElement 元素映射 ([6f86f6f](https://github.com/ocsjs/ocsjs/commit/6f86f6f4dffc42d28983e902c677372703defa53))
* **core:** 添加defineScript中的domain和hide字段，实现动态修改脚本头部信息的功能。 ([a13ab50](https://github.com/ocsjs/ocsjs/commit/a13ab5008ff34f589d9ddd0184c5e320afc2180a))



# [3.13.0](https://github.com/ocsjs/ocsjs/compare/3.12.3...3.13.0) (2022-05-23)


### Features

* **core:** 添加页面反调试脚本 ([1174617](https://github.com/ocsjs/ocsjs/commit/1174617cee99dd4d2e546d79279160ba1afea40e))
* **core:** 新增超星视频中答题功能 ([3f925cb](https://github.com/ocsjs/ocsjs/commit/3f925cba72910fce0353df421dec75a137f24e4e))
* **core:** 新增网课视频选项：显示视频进度 ([b6086df](https://github.com/ocsjs/ocsjs/commit/b6086df349fa50434e199c88c8fff6414bed4c14))



## [3.12.3](https://github.com/ocsjs/ocsjs/compare/3.12.2...3.12.3) (2022-05-22)


### Bug Fixes

* **core:** 修复误删最大长宽导致的超出页面范围 ([9b0bcd4](https://github.com/ocsjs/ocsjs/commit/9b0bcd4d0f26fb8591950e73563be78a5c3d876d))



## [3.12.2](https://github.com/ocsjs/ocsjs/compare/3.12.0...3.12.2) (2022-05-21)


### Bug Fixes

* **core:** 修复某些填空题识别不出的BUG ([c2c1c3d](https://github.com/ocsjs/ocsjs/commit/c2c1c3d2a7fafbe569b25531070b1803e07ccfe6))


### Features

* **core:** 新增自动答题选项：强制提交 ([e0ff3a2](https://github.com/ocsjs/ocsjs/commit/e0ff3a2c64d9e9de061889d2ad145ed29a492cb1))



# [3.12.0](https://github.com/ocsjs/ocsjs/compare/3.11.0...3.12.0) (2022-05-21)


### Bug Fixes

* **core:** 删除多余输出 ([8cee017](https://github.com/ocsjs/ocsjs/commit/8cee0173c670633d665bddd24c4884fa3ad3f621))
* **core:** 修改userjs打包代码未加分号报错 BUG ([e0ec319](https://github.com/ocsjs/ocsjs/commit/e0ec319150ec2f42a4a1256ae9250a3bfd1ae779))
* **core:** 优化多选题答案分割判断 ([7da6f92](https://github.com/ocsjs/ocsjs/commit/7da6f92074a4a9ced316be312aa664ea3f75af52))


### Features

* **core:** 新增随机作答功能 ([ecc2a87](https://github.com/ocsjs/ocsjs/commit/ecc2a87c24e2e81e82a6f1d4fe737b3ccab69b8c))
* **core:** 新增图片题识别脚本，新增搜索结果显示题目图片和答案图片 ([fd483c3](https://github.com/ocsjs/ocsjs/commit/fd483c3bbbe9af689e3b006c21ae12cdeccdd73a))



# [3.11.0](https://github.com/ocsjs/ocsjs/compare/3.10.6...3.11.0) (2022-05-21)


### Bug Fixes

* **core:** 新增未经压缩代码的打包 ([4099fc4](https://github.com/ocsjs/ocsjs/commit/4099fc428d6cfa3b835bf7c89f29bb63b11ad090))


### Features

* **core:** 新增userjs未经压缩代码打包 ([42badc8](https://github.com/ocsjs/ocsjs/commit/42badc85967abb2486c3a6895b8ffd8f9155f05a))



## [3.10.6](https://github.com/ocsjs/ocsjs/compare/3.10.4...3.10.6) (2022-05-20)


### Bug Fixes

* **core:** 修复题库配置解析器BUG ([3986a49](https://github.com/ocsjs/ocsjs/commit/3986a49a1323bc17f8cca54763586c23f6e03907))



## [3.10.4](https://github.com/ocsjs/ocsjs/compare/3.10.2...3.10.4) (2022-05-20)


### Bug Fixes

* **app:** 修复浏览器报错BUG ([fd3780c](https://github.com/ocsjs/ocsjs/commit/fd3780c2d9fdb58016b06f090696056934888f89))
* **core:** 修复超星考试页面样式问题 ([03fa9be](https://github.com/ocsjs/ocsjs/commit/03fa9bed5e176377e921deffbacf0212ccd85e34))
* **core:** 修复题库配置BUG ([2b8c939](https://github.com/ocsjs/ocsjs/commit/2b8c9391cecb7aed7e55b47694772feaed2e45fc))



## [3.10.2](https://github.com/ocsjs/ocsjs/compare/3.10.1...3.10.2) (2022-05-19)


### Bug Fixes

* **core:** 还原文件，修改 release 执行错误但继续打包发布的BUG ([201ae0f](https://github.com/ocsjs/ocsjs/commit/201ae0f6face34db36c9edffe0e323e744ea0106))



## [3.10.1](https://github.com/ocsjs/ocsjs/compare/3.10.0...3.10.1) (2022-05-19)


### Bug Fixes

* **app:** 修复软件浏览器选择BUG，并停止火狐浏览器使用。 ([5e2559b](https://github.com/ocsjs/ocsjs/commit/5e2559bfdea087806246120da566410b54a39c0b))
* **core:** 修改 typr 库，减少部分打包体积。 ([51e26de](https://github.com/ocsjs/ocsjs/commit/51e26debe37c9ad45e181a9d67528244863e7b33))



# [3.10.0](https://github.com/ocsjs/ocsjs/compare/3.9.6...3.10.0) (2022-05-17)


### Features

* **core:** 新增超星繁体字识别选项 - 字典识别 ([2a241d6](https://github.com/ocsjs/ocsjs/commit/2a241d6fe987316b335e57dd9b8b19be188f1805))
* **core:** 新增超星强制答题功能 ([e7c4fc0](https://github.com/ocsjs/ocsjs/commit/e7c4fc060c30b341c17fefa0148fde5170069c87))



## [3.9.6](https://github.com/ocsjs/ocsjs/compare/3.9.5...3.9.6) (2022-05-16)


### Bug Fixes

* 修复日志记录问题 ([c9f2147](https://github.com/ocsjs/ocsjs/commit/c9f21473a755a9af6e7bbeed4095f2209d64cb6e))
* **app:** 修复软件文件重命名时，运行文件名不同步的BUG ([28a1af1](https://github.com/ocsjs/ocsjs/commit/28a1af141217c83cc891952731b585153d6d3d59))
* **app:** 修复智慧树登录后白屏错误的BUG ([9622f7e](https://github.com/ocsjs/ocsjs/commit/9622f7e4c809e64be76c2cd4309e01f1ba9a4e44))


### Features

* **app:** 新增软件自动选择浏览器路径功能 ([eb56f67](https://github.com/ocsjs/ocsjs/commit/eb56f67e6885badcfa252fc716ac6e203560fc2a))
* **app:** 新增自定义脚本载入路径功能, 路径将托管到官方服务器 ([289cefe](https://github.com/ocsjs/ocsjs/commit/289cefecae8b7c3ed900bba1cb99150438a0a842))



## [3.9.5](https://github.com/ocsjs/ocsjs/compare/3.8.0...3.9.5) (2022-05-16)


### Bug Fixes

* 修复新增 shadowroot 后，复制粘贴脚本失效的BUG ([081a99e](https://github.com/ocsjs/ocsjs/commit/081a99ee62a47f427e02b33e3497e5f95e6dedfa))
* 优化超星识别时可能遇到选项按钮被删除的BUG ([ef396b4](https://github.com/ocsjs/ocsjs/commit/ef396b4a3bc9f10284529c3cbb857edba9c927ca))


### Features

* 新增 AnswererWrapper 参数: headers 和 type ([8c970bb](https://github.com/ocsjs/ocsjs/commit/8c970bb52a9b6ef83618b7f1dc2d55fa26045024))
* 新增题库配置跨域模块，可对不同域名的服务器进行跨域访问，并且新增 root 环境变量，可访问元素题目的跟节点元素对象。 ([4e8ea1c](https://github.com/ocsjs/ocsjs/commit/4e8ea1c6bdc84a1b0ce84b24af48a91cff0830af))



# [3.8.0](https://github.com/ocsjs/ocsjs/compare/3.7.4...3.8.0) (2022-05-11)


### Bug Fixes

* 避免重复劫持函数导致页面内存移除 ([067ee58](https://github.com/ocsjs/ocsjs/commit/067ee58e6ffa74657a8adf213ad32fcda0799243))
* 修复智慧树倍速不能立刻改变的BUG ([39d7402](https://github.com/ocsjs/ocsjs/commit/39d7402d804ad5adb8556150d58ae9277f97229f))


### Features

* + 新增消息提示 + 修复火狐底部版本不显示的BUG  + 优化eslint代码 + 增加文字识别错误提示 + 将原有弹出框修改为消息提示 + 增加API:message ([534bee3](https://github.com/ocsjs/ocsjs/commit/534bee3b6e449b9c725cbdec9efa27979c6545ed))
* 使用ShadowRoot对脚本进行加固 ([346d9d1](https://github.com/ocsjs/ocsjs/commit/346d9d109499e303704f7a05414631d9c7e3b11c))



## [3.7.4](https://github.com/ocsjs/ocsjs/compare/3.7.3...3.7.4) (2022-05-09)



## [3.7.3](https://github.com/ocsjs/ocsjs/compare/3.7.2...3.7.3) (2022-05-08)



## [3.7.2](https://github.com/ocsjs/ocsjs/compare/3.7.0...3.7.2) (2022-05-07)


### Bug Fixes

* 修改 store 初始化位置 ([808eb08](https://github.com/ocsjs/ocsjs/commit/808eb080a50e75ecef151010b74891ce272938c9))


### Features

* 添加智慧树文本识别脚本和屏蔽视频检测脚本 ([85ddac1](https://github.com/ocsjs/ocsjs/commit/85ddac119874d5b6877dfc8fa29ecdff70fec4ed))



# [3.7.0](https://github.com/ocsjs/ocsjs/compare/3.6.4...3.7.0) (2022-05-04)


### Features

* 添加答题等待时间，方便检查或者使用其他答题工具。 ([12f2960](https://github.com/ocsjs/ocsjs/commit/12f2960a47f3eb22cc9bbf91bf49c2ace54ea89e))



## [3.6.4](https://github.com/ocsjs/ocsjs/compare/3.6.2...3.6.4) (2022-05-04)


### Bug Fixes

* 深度优化OCR ([a21a8ad](https://github.com/ocsjs/ocsjs/commit/a21a8adf3b209ae5e65aff26c134da2a7b1f0fd2))
* 修复填空题多个填空不填的BUG ([4a0f031](https://github.com/ocsjs/ocsjs/commit/4a0f031b244a800b1e6ff39d3b1b99160372e66d))



## [3.6.2](https://github.com/ocsjs/ocsjs/compare/3.6.1...3.6.2) (2022-04-30)


### Bug Fixes

* 修改 OCR 脚本加载路径, 确保能够访问 work 和 core 脚本 ([9b1544a](https://github.com/ocsjs/ocsjs/commit/9b1544a8e2b002d78471d387e507967e20281020))



## [3.6.1](https://github.com/ocsjs/ocsjs/compare/3.6.0...3.6.1) (2022-04-30)


### Bug Fixes

* 修改环境依赖 ([9c69d35](https://github.com/ocsjs/ocsjs/commit/9c69d3581a84a8e50d87dd7a5d7ed3f446e45295))



# [3.6.0](https://github.com/ocsjs/ocsjs/compare/3.5.5...3.6.0) (2022-04-29)


### Features

* 新增智慧树共享课考试脚本 ([5ba2022](https://github.com/ocsjs/ocsjs/commit/5ba2022e084f7af9ef01309e7d88f8d42436732a))



## [3.5.5](https://github.com/ocsjs/ocsjs/compare/3.5.4...3.5.5) (2022-04-28)


### Bug Fixes

* 适当增大了文本便于识别 ([483d68b](https://github.com/ocsjs/ocsjs/commit/483d68b44720babd1a2f8432661712d869433ad4))



## [3.5.4](https://github.com/ocsjs/ocsjs/compare/3.5.3...3.5.4) (2022-04-28)


### Bug Fixes

* 优化OCR空格问题，还有上个版本OCR锁初始化的问题 ([82a84d7](https://github.com/ocsjs/ocsjs/commit/82a84d778aa99849f26fdd87447f41c7bdda72e2))



## [3.5.3](https://github.com/ocsjs/ocsjs/compare/3.5.2...3.5.3) (2022-04-28)


### Bug Fixes

* 优化 OCR ， 解决题目选项没有识别的BUG ([e534658](https://github.com/ocsjs/ocsjs/commit/e534658665be9863d19fc52ee787f7cad696bdd8))



## [3.5.2](https://github.com/ocsjs/ocsjs/compare/3.5.1...3.5.2) (2022-04-27)


### Bug Fixes

* 优化 OCR 加载逻辑 ([9dd69dc](https://github.com/ocsjs/ocsjs/commit/9dd69dce3073b137999c753b50f7fec8ee03a8a2))



## [3.5.1](https://github.com/ocsjs/ocsjs/compare/3.5.0...3.5.1) (2022-04-27)


### Bug Fixes

* 优化 OCR 数据加载问题 ([ed958a9](https://github.com/ocsjs/ocsjs/commit/ed958a9a47de90763daf7b59c7c1fa3abd698b7f))



# [3.5.0](https://github.com/ocsjs/ocsjs/compare/3.4.5...3.5.0) (2022-04-27)


### Bug Fixes

* 修复超星有时不能自动下一章的BUG ([7c5516f](https://github.com/ocsjs/ocsjs/commit/7c5516f731295ccc2fd73129bf659dd8b339d2f1))


### Features

* 繁体字乱码识别功能 ([ec01cd1](https://github.com/ocsjs/ocsjs/commit/ec01cd168a4f0f4111e7cb6e3c1597b07d7dfd14))
* 开发智慧树倍速选项 ([83015b7](https://github.com/ocsjs/ocsjs/commit/83015b73bdb0bda4f23af04b3814b8cd7e21d721))



## [3.4.5](https://github.com/ocsjs/ocsjs/compare/3.4.4...3.4.5) (2022-04-23)


### Bug Fixes

* 修复软件重命名有时会无效的BUG ([48fb520](https://github.com/ocsjs/ocsjs/commit/48fb520263fabb4740138705bf55d5086e425907))
* 优化软件启动加载 ([be866d1](https://github.com/ocsjs/ocsjs/commit/be866d1eb966a64aefe5fd95ffaf2c1c53ae76d8))



## [3.4.4](https://github.com/ocsjs/ocsjs/compare/3.4.3...3.4.4) (2022-04-22)


### Bug Fixes

* 修复提交设置的BUG ([612dccc](https://github.com/ocsjs/ocsjs/commit/612dcccc40bec2871cccf92bb46c2210da76623e))



## [3.4.3](https://github.com/ocsjs/ocsjs/compare/3.4.2...3.4.3) (2022-04-21)


### Bug Fixes

* 删除无用的选项：搜题错误时暂停 ([e30446c](https://github.com/ocsjs/ocsjs/commit/e30446c2627e628a8aa1c4bb7843c32734131e80))



## [3.4.2](https://github.com/ocsjs/ocsjs/compare/3.4.1...3.4.2) (2022-04-19)


### Bug Fixes

* 修复软件设置空白的BUG ([f757a3b](https://github.com/ocsjs/ocsjs/commit/f757a3b8ae6233eee6fd187471d866b7ec25028a))
* 修复自动答题提交设置保存不了的BUG ([fb9bd39](https://github.com/ocsjs/ocsjs/commit/fb9bd394c246b7446173fba0d956431c300b6577))
* app version upate ([505ce22](https://github.com/ocsjs/ocsjs/commit/505ce22fc11c799da5c22b6f183182ea0b43eb6d))



## [3.4.1](https://github.com/ocsjs/ocsjs/compare/3.4.0...3.4.1) (2022-04-17)


### Bug Fixes

* 修复ABCD纯答案直接点击的BUG ([9df1222](https://github.com/ocsjs/ocsjs/commit/9df1222dfa7569ee0995284cbc988ddda7c292bc))



# [3.4.0](https://github.com/ocsjs/ocsjs/compare/3.3.14...3.4.0) (2022-04-17)


### Features

* 新增智慧树学分课作业脚本 ([978bf47](https://github.com/ocsjs/ocsjs/commit/978bf47feec507910ae62e0be60a79ffd8d46941))



## [3.3.14](https://github.com/ocsjs/ocsjs/compare/3.3.13...3.3.14) (2022-04-15)


### Bug Fixes

* 修复 release.sh 版本命令 ([652a022](https://github.com/ocsjs/ocsjs/commit/652a022b1f895e0ec848dc0b54f238d4f8192772))



## [3.3.13](https://github.com/ocsjs/ocsjs/compare/v3.3.12...3.3.13) (2022-04-15)



## [3.3.12](https://github.com/ocsjs/ocsjs/compare/v3.3.11...v3.3.12) (2022-04-13)



## [3.3.11](https://github.com/ocsjs/ocsjs/compare/v3.3.10...v3.3.11) (2022-04-13)


### Bug Fixes

* 修复 paste 和 input 共存导致的粘贴BUG ([370e46f](https://github.com/ocsjs/ocsjs/commit/370e46fe3eecffbb5b63c5576dfe6447e79860bd))



## [3.3.10](https://github.com/ocsjs/ocsjs/compare/v3.3.9...v3.3.10) (2022-04-13)


### Bug Fixes

* 修复不能右键复制粘贴的BUG ([9af5480](https://github.com/ocsjs/ocsjs/commit/9af5480038ba11bd47937bff889ee084c72fb04b))



## [3.3.9](https://github.com/ocsjs/ocsjs/compare/v3.3.8...v3.3.9) (2022-04-13)


### Bug Fixes

* 修复上个版本store加载问题 ([48fdc1a](https://github.com/ocsjs/ocsjs/commit/48fdc1a57fbcfa587f2dc42f338249a7b3222985))



## [3.3.8](https://github.com/ocsjs/ocsjs/compare/v3.3.7...v3.3.8) (2022-04-13)


### Bug Fixes

* app 兼容OCS助手最新版的响应式特性 ([eaa66dd](https://github.com/ocsjs/ocsjs/commit/eaa66dd9a1c647f12602363f08003c9254ba0f7d))


### Features

* 新增全局存储功能，使用油猴自带API实现。 ([be13a5b](https://github.com/ocsjs/ocsjs/commit/be13a5bd71884ef9f9913a8e2c391da9ecedef4b))



## [3.3.7](https://github.com/ocsjs/ocsjs/compare/v3.3.6...v3.3.7) (2022-04-13)


### Bug Fixes

* 支持纯浏览器端的加载，仅用于核心API的调用。 ([cf9dbe8](https://github.com/ocsjs/ocsjs/commit/cf9dbe8d779c05ba804aab43c242ddde1af8e7c6))


### Features

* 删除调试输出 ([a096447](https://github.com/ocsjs/ocsjs/commit/a096447a45573e6bfb05d249aad374e2e56530dd))



## [3.3.6](https://github.com/ocsjs/ocsjs/compare/v3.3.5...v3.3.6) (2022-04-13)


### Bug Fixes

* 修复打包压缩选项 ([9425289](https://github.com/ocsjs/ocsjs/commit/9425289ed6cc864f95f59414783f88db1968d140))


### Features

* 新增超星 : 屏蔽作业考试填空简答题粘贴限制 功能 ([591971e](https://github.com/ocsjs/ocsjs/commit/591971eea5065b4097e6b24516cb6d5a36497f76))



## [3.2.20](https://github.com/ocsjs/ocsjs/compare/v3.2.19...v3.2.20) (2022-04-09)


### Bug Fixes

* 延长一点视频暂停后启动的时间，防止超星鬼畜。 ([837d873](https://github.com/ocsjs/ocsjs/commit/837d873d29146de7741e9cfb4b4e988633767551))



## [3.3.5](https://github.com/ocsjs/ocsjs/compare/v3.3.4...v3.3.5) (2022-04-13)


### Bug Fixes

* 修复搜索结果 undefined 的 BUG, 修复超星章节测试填空题BUG ([97500c5](https://github.com/ocsjs/ocsjs/commit/97500c591315eb4fdc97b799e77e788ccdf32def))



## [3.3.4](https://github.com/ocsjs/ocsjs/compare/v3.3.3...v3.3.4) (2022-04-13)


### Bug Fixes

* 修复超星考试作业页面不能复制粘贴的BUG ([4c64c00](https://github.com/ocsjs/ocsjs/commit/4c64c009f6bf87ad63d5b7f717daef339782bdc4))
* 修复上个版本响应式导致的倍速，音量失效的BUG ([5182d02](https://github.com/ocsjs/ocsjs/commit/5182d02d0fc1a9e11f7b7b2bc5ee3e0387c2b74e))
* 修复智慧树复习模式的BUG，修复已经播放完的视频但没有完成却跳过的BUG ([3cd12a7](https://github.com/ocsjs/ocsjs/commit/3cd12a72312faec10200a1a4bb700fe17e3e3682))



## [3.3.3](https://github.com/ocsjs/ocsjs/compare/v3.3.2...v3.3.3) (2022-04-12)


### Bug Fixes

* 兼容库模式，并且优化自动答题答案显示 ([fcd2311](https://github.com/ocsjs/ocsjs/commit/fcd2311b3b2564a3a06b2da102cdf841fbd19fc1))


### Features

* 新增自动答题答案预览功能 ([29b17e8](https://github.com/ocsjs/ocsjs/commit/29b17e8d055272882aebf672dbf76006f5509fc1))



## [3.3.2](https://github.com/ocsjs/ocsjs/compare/v3.3.1...v3.3.2) (2022-04-12)


### Bug Fixes

* 修复闯关模式因为刷新太快任务点没有出现导致重复的BUG ([dad5eb3](https://github.com/ocsjs/ocsjs/commit/dad5eb3db14c112e7c8f65c6214402502f2a8764))
* 修复答题配置输入后会消失的BUG， 新增音量设置 ([34cd585](https://github.com/ocsjs/ocsjs/commit/34cd585203623e606e459fd7761f77001a0b6911))



## [3.3.1](https://github.com/ocsjs/ocsjs/compare/v3.3.0...v3.3.1) (2022-04-11)



# [3.3.0](https://github.com/ocsjs/ocsjs/compare/v3.2.20...v3.3.0) (2022-04-11)


### Bug Fixes

* 修复各种问题，并且兼容了响应式特性 ([0c42947](https://github.com/ocsjs/ocsjs/commit/0c42947afa70f75f57435d5bebdd1dd48141754a))
* 修改打包方式为压缩打包 ([333661f](https://github.com/ocsjs/ocsjs/commit/333661f4c3a5338721e56227ef0e6fcb53ea872f))


### Features

* 切换网络路线 ([0a0a5dd](https://github.com/ocsjs/ocsjs/commit/0a0a5dd20ce80cb503f3c57d8b6aa2c25e261b8d))
* 响应式特性 ([5e21f0a](https://github.com/ocsjs/ocsjs/commit/5e21f0a1c17b1aca8ba22692c6649c6bae397d51))
* vnode 重构成 tsx , 并且新增数据响应式特性 ([18c5a78](https://github.com/ocsjs/ocsjs/commit/18c5a7836cd11222f8301687fff930b5e93583c0))



## [3.2.20](https://github.com/ocsjs/ocsjs/compare/v3.2.19...v3.2.20) (2022-04-09)


### Bug Fixes

* 延长一点视频暂停后启动的时间，防止超星鬼畜。 ([837d873](https://github.com/ocsjs/ocsjs/commit/837d873d29146de7741e9cfb4b4e988633767551))



## [3.2.19](https://github.com/ocsjs/ocsjs/compare/v3.2.18...v3.2.19) (2022-04-08)


### Bug Fixes

* 修复切换路线后倍速无效的BUG ([4e3f78b](https://github.com/ocsjs/ocsjs/commit/4e3f78b78f5ae3467d4546fc23d4aba0aa8fda4e))



## [3.2.18](https://github.com/ocsjs/ocsjs/compare/v3.2.16...v3.2.18) (2022-04-08)


### Features

* 新增超星视频路线切换功能 ([8721e48](https://github.com/ocsjs/ocsjs/commit/8721e4895c46393b210a1f707b61f5b7a446ecee))



## [3.2.16](https://github.com/ocsjs/ocsjs/compare/v3.2.14...v3.2.16) (2022-04-08)


### Bug Fixes

* 修复快捷键有时候失效的问题 ([0d5df16](https://github.com/ocsjs/ocsjs/commit/0d5df16cbd18936180935d02642cf68faea8c22f))



## [3.2.14](https://github.com/ocsjs/ocsjs/compare/v3.2.13...v3.2.14) (2022-04-08)


### Features

* 新增隐藏按钮 ([dce116e](https://github.com/ocsjs/ocsjs/commit/dce116e6f268bffe5ef1e178980c4318b47ea755))
* 新增ocs快捷键，可重置位置，优化面板初始位置 ([af7d231](https://github.com/ocsjs/ocsjs/commit/af7d231d9af520ace066190981196975a4d08213))



## [3.2.13](https://github.com/ocsjs/ocsjs/compare/v3.2.12...v3.2.13) (2022-04-07)


### Features

* 彻底修复超星验证码问题 ([0cf69f2](https://github.com/ocsjs/ocsjs/commit/0cf69f22f070d47ed72cd4c1d5b898b6ad3e2e14))



## [3.2.12](https://github.com/ocsjs/ocsjs/compare/v3.2.11...v3.2.12) (2022-04-05)


### Features

* 新增超星支持域名 edu.cn ， 修复多个视频播放时，播放完成继续播放的BUG ([959cc9b](https://github.com/ocsjs/ocsjs/commit/959cc9b2b38e6b573823ee5c9976f92089bdc5bb))



## [3.2.11](https://github.com/ocsjs/ocsjs/compare/v3.2.10...v3.2.11) (2022-04-04)


### Bug Fixes

* 修改点击间隔 ([176d83e](https://github.com/ocsjs/ocsjs/commit/176d83eaaa210b562ab38458ee15a4969c6b080e))



## [3.2.10](https://github.com/ocsjs/ocsjs/compare/v3.2.9...v3.2.10) (2022-04-04)


### Bug Fixes

* 继续优化答题问题 ([2dfd14d](https://github.com/ocsjs/ocsjs/commit/2dfd14d57e195615a257ac21b0db6fa167714768))



## [3.2.9](https://github.com/ocsjs/ocsjs/compare/v3.2.8...v3.2.9) (2022-04-04)


### Bug Fixes

* 修复超星重复暂停的BUG ([c5c7681](https://github.com/ocsjs/ocsjs/commit/c5c768176e53c7266c9e90b97ec351943627143a))



## [3.2.8](https://github.com/ocsjs/ocsjs/compare/v3.2.7...v3.2.8) (2022-04-04)


### Features

* 新增解除右键，复制粘贴限制的功能， 修复超星播放视频重复卡死的BUG ([fe9b59a](https://github.com/ocsjs/ocsjs/commit/fe9b59ac28baded93f30539daf262a18870fedf0))



## [3.2.7](https://github.com/ocsjs/ocsjs/compare/v3.2.6...v3.2.7) (2022-04-04)


### Features

* 答案判断优化 ([801e4f3](https://github.com/ocsjs/ocsjs/commit/801e4f3a0ffe66c6979833bae113f868bbba3f38))



## [3.2.6](https://github.com/ocsjs/ocsjs/compare/v3.2.5...v3.2.6) (2022-04-03)


### Bug Fixes

* 修复软件1.2.0自动更新BUG ([512b61c](https://github.com/ocsjs/ocsjs/commit/512b61c26f8b72828cd875b9ecf867dcc879f3b7))
* 修复智慧树作业重复关闭的BUG ([2288d61](https://github.com/ocsjs/ocsjs/commit/2288d6119af7efa97761e2bc8cca3393b62e507f))


### Features

* 新增 common 包 ， 修复脚本执行BUG ， 修复通知 ， 新增打包脚本 scripts 文件夹 ([0831102](https://github.com/ocsjs/ocsjs/commit/083110233cc5462ed5d7d2c44bfc7141f9c8f9e8))
* aPP版本更新 1.2.0 ([4ebd3cb](https://github.com/ocsjs/ocsjs/commit/4ebd3cbdc5775c7c4f60fd6c00f621297fed7d00))



## [3.2.5](https://github.com/ocsjs/ocsjs/compare/v3.2.4...v3.2.5) (2022-04-01)


### Bug Fixes

* 修复答题时多选不全的BUG， 修复答题时答案为空报错的BUG ([75177b5](https://github.com/ocsjs/ocsjs/commit/75177b553b269282b16e812c6e65e1ffb8edad01))
* 修改远程信息获取路径 ([b80d091](https://github.com/ocsjs/ocsjs/commit/b80d0914bd91482d2e75978d3d6676a92717d91e))


### Features

* 自动更新功能， scripts 分包 ， 浏览器端修改为 core 文件夹 ([f536614](https://github.com/ocsjs/ocsjs/commit/f53661497d92911c4daea12ae2936471169b3e5a))



## [3.2.4](https://github.com/ocsjs/ocsjs/compare/v3.2.3...v3.2.4) (2022-03-31)


### Bug Fixes

* 修复上个版本视频跳过问题 ([1719bbd](https://github.com/ocsjs/ocsjs/commit/1719bbdfba8cc21bb10cad8c16ec7ae6127ae6af))
* 修复油猴脚本更新BUG ([fd043dd](https://github.com/ocsjs/ocsjs/commit/fd043ddc3a6d9d3a3863c158379d7e1afd37a1d6))



## [3.2.3](https://github.com/ocsjs/ocsjs/compare/v3.2.2...v3.2.3) (2022-03-30)


### Features

* 添加任务点是否完成检测，不重复执行已完成任务点， 修复判断题不选择的BUG ([dbc1a86](https://github.com/ocsjs/ocsjs/commit/dbc1a86c5793cecfbd5521ee24d4373da3b3ee5e))



## [3.2.2](https://github.com/ocsjs/ocsjs/compare/v3.2.1...v3.2.2) (2022-03-27)


### Features

* 添加智慧树学分课脚本 ([37b112a](https://github.com/ocsjs/ocsjs/commit/37b112ae8f1488b4b07ce4a986ac798df8d0bd9e))



## [3.2.1](https://github.com/ocsjs/ocsjs/compare/3.2.0...v3.2.1) (2022-03-27)


### Features

* 添加禁止弹窗脚本 ([2b6be41](https://github.com/ocsjs/ocsjs/commit/2b6be413847fa55367d72ee5b16570d8ef8a218b))



# [3.2.0](https://github.com/ocsjs/ocsjs/compare/v3.1.11...3.2.0) (2022-03-26)


### Features

* **app:** 软件更新，支持超星学习作业考试，支持脚本自动更新 ([f500119](https://github.com/ocsjs/ocsjs/commit/f500119bed4d05d775b635de672c3b3e16e5a363))



## [3.1.11](https://github.com/ocsjs/ocsjs/compare/v3.1.10...v3.1.11) (2022-03-26)


### Features

* 更新软件，加载时自动更新ocs脚本 ([e16d954](https://github.com/ocsjs/ocsjs/commit/e16d954ff5bb4a084fa4dd6ff4e6dc6b9643f483))



## [3.1.10](https://github.com/ocsjs/ocsjs/compare/v3.1.9...v3.1.10) (2022-03-26)


### Bug Fixes

* 修复脚本只能在油猴环境下执行的BUG ([4f081c9](https://github.com/ocsjs/ocsjs/commit/4f081c90ee20e67a7f4e2afb43098e0c4308201e))



## [3.1.9](https://github.com/ocsjs/ocsjs/compare/v3.1.8...v3.1.9) (2022-03-26)



## [3.1.8](https://github.com/ocsjs/ocsjs/compare/v3.1.7...v3.1.8) (2022-03-26)


### Bug Fixes

* 修改答案结果判断bug ([a2808d0](https://github.com/ocsjs/ocsjs/commit/a2808d09b6ffa37376b25682cc4c8cd1cf0be5d7))



## [3.1.7](https://github.com/ocsjs/ocsjs/compare/3.0.0-beta.9...v3.1.7) (2022-03-25)


### Bug Fixes

* 修改题库配置设置，取消必选，添加判断，如果没有题库设置，则不开始自动答题。 ([b25ef93](https://github.com/ocsjs/ocsjs/commit/b25ef9323d0fe5c9d8437e3f50551a5e47e20dfa))
* 修改油猴配置 ([db8a733](https://github.com/ocsjs/ocsjs/commit/db8a733adaadb263fa2ed05233bd0b03f93c2e68))
* **cx:** 兼容cx选项获取不到，以及设置保存bug ([5a2e672](https://github.com/ocsjs/ocsjs/commit/5a2e67214d45053475574f4e16d3023909f6b132))
* **script:** 修复答题解析器bug， 更新做题标题获取，修复学习时章节测验类型获取失败bug， 更新 app 的脚本 ([659955b](https://github.com/ocsjs/ocsjs/commit/659955b818b41b7f25506e93caa888392e37aba1))
* **script:** 修改答题配置解析器 ([6e4332f](https://github.com/ocsjs/ocsjs/commit/6e4332f3855319e59f0bf5981fb713b7463cb531))
* **style:** 修改样式引入 ([8a6ab90](https://github.com/ocsjs/ocsjs/commit/8a6ab903ef661b89bc81bdc2298cdb28c2f40f9e))
* **url:** 修改 url cdn 资源 ([5cad7c1](https://github.com/ocsjs/ocsjs/commit/5cad7c19b6976d5825c982ccbede011d157b94a8))



# [3.0.0-beta.9](https://github.com/ocsjs/ocsjs/compare/3.0.0-beta.6...3.0.0-beta.9) (2022-03-24)


### Bug Fixes

* **index:** 修改数据路径 ([c97bdaf](https://github.com/ocsjs/ocsjs/commit/c97bdaf00aef72ce9c71068573cd4d9933d15590))


### Features

* 版本更新至 beta.6 ([cc63a07](https://github.com/ocsjs/ocsjs/commit/cc63a076ddb79235f8ca12c0c30b500c5d8be43e))
* 新增答题器，新增题库配置选项，新增zhs作业功能 ([449c008](https://github.com/ocsjs/ocsjs/commit/449c008af2f961c6a6ca12788309fabcc8334cfc))
* 修改为单进程软件，支持.ocs文件的点击加载，新增软件标题栏，删除原生标题栏 ([8427936](https://github.com/ocsjs/ocsjs/commit/8427936e931ca8bfcc86240393d40c7583f95abc))
* **all:** 版本更新 ([3b17a92](https://github.com/ocsjs/ocsjs/commit/3b17a9242d6cc12330e8bbb5ff15c88957507ce2))
* **scripts:** 添加超星学习，考试，作业脚本。 添加日志，搜题结果面板。 ([94d99d4](https://github.com/ocsjs/ocsjs/commit/94d99d4fb32ce9b58e88e0fa8f0812adea7f89a6))



# [3.0.0-beta.6](https://github.com/ocsjs/ocsjs/compare/3.0.0-beta.5...3.0.0-beta.6) (2022-03-15)


### Features

* **app | script:** 新增 script/browser 端的面板显示，替换之前的油猴头部信息加载模式，添加app主进程端的脚本调用 ([f9cf10f](https://github.com/ocsjs/ocsjs/commit/f9cf10f6757a45d520c1c2ff5532bceaa9298f07))
* **web:** 添加文件关闭编辑功能，取消页面所有动画效果，删除'关于'页面，新增'帮助'一栏。 ([1f4d4ad](https://github.com/ocsjs/ocsjs/commit/1f4d4ad7da78d97282524dd9325fc9c4ac1468f5))



# [3.0.0-beta.5](https://github.com/ocsjs/ocsjs/compare/0675ac6a631e8946a52e7e4e655b28faee8248d4...3.0.0-beta.5) (2022-03-07)


### Bug Fixes

* **package.json:** fix dependency security ([948662a](https://github.com/ocsjs/ocsjs/commit/948662a580aab60a3ff70c64111aa36c40b5a4ce))
* **web:** 优化侧边栏： 优化文件列表头部，优化文件列表搜索 ([84acc62](https://github.com/ocsjs/ocsjs/commit/84acc62870db173211165408c8fe665df556ebf0))


### Features

* add glup ([15c0015](https://github.com/ocsjs/ocsjs/commit/15c0015141f4104888813dda905fc723843f66ca))
* **all:** 添加终端显示，添加脚本执行，添加文件属性 ([cf5dc9a](https://github.com/ocsjs/ocsjs/commit/cf5dc9a2d17057c5ac2db7df43e9e2a5b26e664f))
* **app and web:** 添加文件夹管理，添加右键菜单，初始化设置和关于页面 ([24930ad](https://github.com/ocsjs/ocsjs/commit/24930ad1e32508e227fb36b7008fb2981438cbb7))
* **app and web:** add elctron-builder in app , init  page view in web ([fe60df6](https://github.com/ocsjs/ocsjs/commit/fe60df65dfeed1607ab89a941fc6b6eb627132fc))
* **init:** init project ([0675ac6](https://github.com/ocsjs/ocsjs/commit/0675ac6a631e8946a52e7e4e655b28faee8248d4))
* **packages:** init packages : web app scripts ([24e5386](https://github.com/ocsjs/ocsjs/commit/24e5386ec86dec33cc696fda6b5956785e2c1359))
* **script|web|app:** add commander line support, and update web view ([35efb39](https://github.com/ocsjs/ocsjs/commit/35efb39f34e4dc0d4e4914516f95d0ff467f8f37))
* **script:** add cx and zhs login ([8d69e16](https://github.com/ocsjs/ocsjs/commit/8d69e166fd73cf2ae2d700aa772b78159efbdeaa))
* **script:** change folder name, and add browser script ([c540500](https://github.com/ocsjs/ocsjs/commit/c540500b0cef50e7c2944d3ea6331e93c3e00e52))
* **scripts-tempaermonkey:** add tempermonkey support, update browser export ([456af02](https://github.com/ocsjs/ocsjs/commit/456af0250ff33fada0930f01270d1e147f27e2f7))
* **scripts/cx:** add new login : phone-code login ([494e523](https://github.com/ocsjs/ocsjs/commit/494e523ffda8ddf5c9320be5861b42234fab4d91))
* **scripts:** 修改 package.json ， 调整登录api ([614c628](https://github.com/ocsjs/ocsjs/commit/614c628a749bc6dd4e1556fd9fbdb026c82d6937))
* **scripts:** add script package ([6f03fb4](https://github.com/ocsjs/ocsjs/commit/6f03fb4d3545f02f8ccfeb14fa7b5d8169c15348))
* **test and cx login:** update tests README.md and add new login way of cx : phone-code-login ([ab46a1d](https://github.com/ocsjs/ocsjs/commit/ab46a1df98c73351518847a629ddaeb7f51a2d4d))
* **web:** 添加文件解析，使用懒加载进行文件的显示 ([0da0f02](https://github.com/ocsjs/ocsjs/commit/0da0f024741191ce408354ffc148c83dc7bea4f3))
* **web:** 添加文件拖拽，文件搜索功能 ([fb1b7c9](https://github.com/ocsjs/ocsjs/commit/fb1b7c93c1679e484769362724c2818c68898145))
* **web:** 添加重命名功能，添加目录展开记录保存，添加帮助页面 ([0b90cc2](https://github.com/ocsjs/ocsjs/commit/0b90cc20d33c21b406b7d6426df812aed03eec1c))
* **web:** 文件编辑，文件拓展 ([9f2f4fb](https://github.com/ocsjs/ocsjs/commit/9f2f4fb6b4fd37b7526239bacf45135ff5874cbc))
* **web:** 支持文件（夹）拖拽放置，文件（夹）的创建，删除 ([705cc21](https://github.com/ocsjs/ocsjs/commit/705cc210bf382a3a92962f03526366edc0e18398))



