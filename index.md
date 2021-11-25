 
## online-course-script

> ocs online-course-script  在线网络课程辅助脚本工具
> 简称网课脚本，帮助大学生解决网课难题，目前支持的平台：超星，智慧树
 
## 简介

- 使用 `electron ` + `vue3` + `typescript` 的方式搭建的跨平台网课脚本软件，核心使用 `pupeteer` + 自研的 `pioneerjs` 脚本库来进行浏览器以及 js 脚本的驱动。
- 一键式运行刷课脚本，只需要添加账号和一些基本参数，则可一键刷课，全程躺平，支持自动答题模块
- 软件采用增量更新，自动更新，快捷迭代
 
## 软件教程

1.  进入`发行版`页面，也就是 `release` 页面
- 码云发行版页面 : [https://gitee.com/enncy/online-course-script/releases](https://gitee.com/enncy/online-course-script/releases)
- github release : [https://github.com/enncy/online-course-script/releases](https://github.com/enncy/online-course-script/releases)
2. 找到最新版本的 release , 例如 1.2.6 或者 1.2.10 版本， 而 `1.2.10` 版本则是最新版本。
3. 找到 `ocs-x.x.x-setup-win-xx.exe` 软件链接点击下载
4. 下载后点击安装
5. 进入软件后初始化`浏览器路径`和`查题码`配置
6. 添加账号
7. 点击账号下方的运行按钮运行

## 项目运行
- 不是开发人员无需阅读
- 本项目使用的是 nodejs 环境，如果未安装，请先自行安装！

```sh
# 克隆项目到本地
git clone git@github.com:enncy/online-course-script.git
# 进入目录
cd online-course-script
# 安装依赖
npm install
# 为防止 electron 安装失败，手动执行安装
node node_modules/electron/install.js
# 进入 electron app 文件夹
cd app
# 安装 electron 依赖 （本项目使用双依赖结构，具体参考 https://www.electron.build/tutorials/two-package-structure）
npm install
# 回到根目录
cd ..
# 运行项目
npm run dev
# ... 其他命令请参考 package.json
```
## 旧版详情
- 旧版采用浏览器 + 油猴脚本方式运行，未来可能会废弃，具体教程前往 `master` 分支 或者 [ocs.enncy.cn](https://ocs.enncy.cn) 查看教程

## 交流群
1. 976662217 已满
2. 940881245
3. 688788798 


## 问答
问：如何更换浏览器路径        
答：      
> 此软件会使用浏览器控制脚本进行刷课操作     
> 火狐浏览器运行存在问题，我们不建议使用火狐浏览器     
> 支持`谷歌`,`Microsoft Edge`,等带有`chrome`内核的主流浏览器     
> 如果您不知道浏览器的路径在哪，请按照如下操作查看:      

`谷歌`: 打开谷歌浏览器,输入链接 `chrome://version` , 找到 `可执行文件路径` 这一栏复制粘贴即可        
    
`Microsoft Edge`: 打开Edge浏览器，输入链接 `edge://version/` , 找到 `可执行文件路径` 这一栏复制粘贴即可       

- 刚开始时软件会弹出设置框，如果您想重新设置 ： 设置 -> 启动设置 -> 浏览器路径 -> 点击设置即可
****
问：如何运行          
答：添加账号 -> 选择平台 -> 选择登录类型 -> 输入信息 -> 然后点击获取课程 -> 等待获取完成后 -> 点击添加        
****
问：报错怎么办，暂停了怎么办？           
答：             
超星：可以刷新页面，或者手动切换任务，任务会重新分配。          
智慧树：关闭浏览器，重新启动解决90%的问题          
 


