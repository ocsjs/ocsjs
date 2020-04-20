# 大学生网课刷课脚本
(不是很会用github，markdown排版很差，谅解一下)
## 不定期更新！目前支持：超星学习通，智慧树

<div align='center'>
  <img src='http://9.pic.pc6.com/thumb/n331m3a312v813yab22/16f5e42922d0263c_82_82.png' width='100px' alt='超星logo'/>
  <img src='http://pic.5577.com/up/2017-11/201711231055414637.png' width='100px' alt='智慧树logo'/>
</div>

****

__版本：__ 1.0(正式版)    
__作者：__ 骷髅：LDS-Skeleton    

__脚本，技术交流群__：https://jq.qq.com/?_wv=1027&k=5hR45ae （点击添加，别进来问脚本怎么用，下面有教程），群号：532537990   

**所有脚本均由本人制作，转载请注明出处，禁止商业用途** 

****

## 功能
* 支持自动刷课，鼠标离开不会暂停。
* 播放完毕，自动跳转下一节。
* 自动答题功能暂未开放。
## 更新：
v1.1——2020/4/5: 更新可以查答案的脚本（还不能用，网站备案没下来）

****

## 使用教程：
## 1 ：进入csdn文章里：    
__CSDN主页__: https://blog.csdn.net/qq_31254489  (如果使用教程404了，那么就是我的文章正在审核)    
__文章直链__：https://blog.csdn.net/qq_31254489/article/details/104579438

## 2：文字教程：
### 按照步骤来：

### 1.打开超星学习通的学习界面！！！。
准备一个浏览器！，谷歌，火狐，qq浏览器都行！，我这个不是油猴，不要用油猴。
登录进你的超星账号然后：

![学习界面](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/stadypage.png)

### 2.按下键盘上的F12 ！！！
F12不懂是什么可以劝退了    
有些浏览器是不支持F12的！，如果没有反应请换一个浏览器    
你会看到浏览器右边弹出一个东西：（qq浏览器，和谷歌都是这个页面）    
![控制台console](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/console.png)    
如果是其他浏览器，可能会有中文，比如说火狐   

![控制台console](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/clickconsole.jpg)   
然后点击Console，中文的话，就点击”控制台“   
![控制台console](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/kzt,jpg)   

### 3.复制下面代码到console的空白区域中！！！

**你没看错！只需要——两行代码！**

目前更新：支持:**超星学习通**，**智慧树**！

1.超星↓↓↓    
 
```js
var uri="chaoxing";
$.getScript("https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/"+uri+".js?t="+new Date().getTime());
```
****
1.超星测试版：解决一个章节里面多个视频播放问题，但是播放完成后好像不能自动跳转下一个章节，大家可以试试这个，正在测试中，有bug可反馈，最近挺忙的，有空再来填坑。↓↓↓    
```js
var uri="chaoxingbeta";
$.getScript("https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/"+uri+".js?t="+new Date().getTime());
```
****
2.智慧树↓↓↓   
```js
var uri="zhihuishu";
$.getScript("https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/"+uri+".js?t="+new Date().getTime());
```

****
就像这样：吧代码输入进去就行了    
![代码](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/code.png)

### 4.然后回车，运行代码，屏幕中间出现刷课框：
![刷课框](https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/src/result.png)    
****
点击播放即可。视频会一直刷下去。可以实时改变播放速度，建议还是一倍速比较好。

制作不易，点个star再走？
