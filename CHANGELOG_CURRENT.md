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



