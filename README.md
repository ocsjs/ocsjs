# 大学生网课刷课脚本
## 现在https://greasyfork.org/ 里面好像出了几个新的脚本，自己找找吧，大家可以不用我的垃圾脚本了。
## 不定期更新！目前支持：超星学习通，智慧树

<div align='center'>
  <img src='http://9.pic.pc6.com/thumb/n331m3a312v813yab22/16f5e42922d0263c_82_82.png' width='100px' alt='超星logo'/>
  <img src='http://pic.5577.com/up/2017-11/201711231055414637.png' width='100px' alt='智慧树logo'/>
</div>

****

__版本：__ 1.0(正式版)    
__作者：__ 骷髅：LDS-Skeleton    

__脚本，技术交流群__：https://jq.qq.com/?_wv=1027&k=5hR45ae （点击添加，别进来问脚本怎么用，下面有教程），群号：532537990   

**所有脚本均由本人（LDS-Skeleton）制作，转载请注明出处，禁止商业用途** 

****

## 功能
* 支持自动刷课，鼠标离开不会暂停。
* 播放完毕，自动跳转下一节。
* 自动答题功能暂未开放。
## 更新：
更新时间     | 说明
-------- | -----
2020/4/21| 更新超星测试脚本，适配多视频的课程。解决了以前一个章节下多个视频无法播放的问题。
2020/3/9| 更新学习通代码，全自动播放，跳过已经完成的任务视频。
2020/3/6  |优化代码，代码支持:**超星学习通**，**智慧树**！，同时github仓库转移。
2020/3/5 |解决部分没有视频，只有文字，造成脚本卡顿。
2020/3/3  | 解决了严重的bug，并优化代码，只需一句话即可使用。

****

## 使用教程：
## 1 ：进入csdn文章里：    
__CSDN主页__: https://blog.csdn.net/qq_31254489  (如果使用教程404了，那么就是我的文章正在审核)    
__文章直链__：https://blog.csdn.net/qq_31254489/article/details/104579438

## 2：文字教程：
### 按照步骤来：

准备一个浏览器！，谷歌，火狐，qq浏览器都行！，我这个不是油猴，不要用油猴。
登录进你的超星账号然后：
### 1.打开超星学习通的学习界面！！！。


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

1.超星（标准版，一个章节播放一个视频）↓↓↓
 
```js
var uri="chaoxing";
$.getScript("https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/"+uri+".js?t="+new Date().getTime());
```
****
1.超星多视频（测试版）：如果你有的章节是里面 **有很多个视频**，那么你可以试试下面这个脚本
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
点击播放即可。视频会一直刷下去。可以实时改变播放速度，建议还是一倍速比较好，如果下面那个框框支持2倍速，你可以加到2倍，默认是一倍速的。

制作不易，点个star再走？
