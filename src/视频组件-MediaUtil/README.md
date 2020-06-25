# 视频组件-MediaUtil

## 说明：
视频封装函数，封装了：
- 视频暂停后自动播放
- 视频加载异常回调
- 视频播放完毕回调
- 可设置，静音，播放速度。
减少了dom操作。

## 配置参数实例：
```javascript
var vuSetting = {
    auto: true,
    muted: true,
    playbackRate: 2,
    timeout_reload: true,
    debug: true,
    MediaEndEvent() {
        console.log("媒体播放完毕");
    },
    timeOut() {
        console.log("媒体加载超时");
    }
}
```
## 启动实例：
```javascript
vu = new MediaUtil($('video'), vuSetting);
vu.start();
```

## 配置参数大全：
|  参数字段   | 数据类型  |参数说明|
|  ----  | ----  |---|
| auto  | boolean |自动播放，一旦媒体暂停，立刻点击开始|
| muted  | boolean |视频静音|
| debug  | boolean |调试模式，会打印调试信息|
| timeout_reload  | boolean |如果媒体加载异常，是否重新加载媒体|
| playbackRate  | value |播放速度|
| reload_times  | value |媒体异常重新加载次数，默认5秒|
| readyTimeout  | value |加载超时时长，默认10秒|
| MediaEndEvent  | callback |媒体播放完毕的回调函数|
| timeOut  | callback |媒体加载异常，超时回调函数|

## html5媒体属性大全 : 
 https://www.cnblogs.com/boonya/p/10983066.html


