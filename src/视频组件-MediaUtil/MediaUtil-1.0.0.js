/**
 * @author KL-Skeleton
 * @description MediaUtil——媒体工具类封装
 * @param {*} media_obj   jq对象
 * @param {*}  parameter  播放参数
 * @example 

//参数实例：
var vusetting = {
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
//启动实例：
vu = new MediaUtil($('video'), vusetting);
vu.start();

 * =====================================================================
 * 参数:
 * auto:boolean             ——自动播放，一旦媒体暂停，立刻点击开始
 * muted :boolean           ——静音
 * playbackRate: value      ——播放速度
 * debug:boolean            ——调试模式，会打印调试信息
 * reload_times:value       ——媒体异常重新加载次数，默认5秒
 * readyTimeout: value      ——加载超时时长，默认10秒
 * timeout_reload:boolean   ——加载异常是否重新加载媒体
 * MediaEndEvent: callback  ——媒体播放完毕的回调函数
 * timeOut: callback       ——媒体加载异常，超时回调函数
 * 
 *  html5媒体属性大全 : 
 *  @see  https://www.cnblogs.com/boonya/p/10983066.html
 */
function MediaUtil(media_obj, parameter) {

    var obj = new Object();

    //调试函数
    obj.log = (x, type) => {
        if (parameter.debug) {
            if (type != undefined && type == 'error') console.error('[MediaUtil]:' + (x));
            else console.log('[MediaUtil]:' + (x));
        }
    }

    obj.log('init...');
    obj.auto = parameter.auto != undefined ? parameter.auto : false;//自动播放
    obj.muted = parameter.muted != undefined ? parameter.muted : false;//静音
    obj.playbackRate = parameter.playbackRate != undefined ? parameter.playbackRate : 1;//媒体速度
    obj.debug = parameter.debug != undefined ? parameter.debug : false;//调试
    obj.timeout_reload = parameter.timeout_reload != undefined ? parameter.timeout_reload : false;//超时重启
    obj.reload_times = parameter.reload_times != undefined ? parameter.reload_times : 5;//默认重启5次
    obj.readyTimeout = parameter.readyTimeout != undefined ? parameter.readyTimeout : 10;//默认超时时间10秒
    obj.MediaEndEvent = parameter.MediaEndEvent != undefined ? parameter.MediaEndEvent : function () { obj.log('MediaEndEvent:' + (parameter.MediaEndEvent)); };//播放完毕执行的回调函数
    obj.timeOut = parameter.timeOut != undefined ? parameter.timeOut : function () { obj.log('timeOut:' + (parameter.timeOut)); };//超时的回调函数

    
    obj.log('auto:' + (obj.auto));
    obj.log('muted:' + (obj.muted));
    obj.log('playbackRate:' + (obj.playbackRate));
    obj.log('debug:' + (obj.debug));
    obj.log('reload_times:' + (obj.reload_times));
    obj.log('readyTimeout:' + (obj.readyTimeout));
    obj.log('timeout_reload:' + (obj.timeout_reload));
    obj.log('MediaEndEvent:' + (obj.MediaEndEvent));
    obj.log('timeOut:' + (obj.timeOut));

setInterval(() => {
    
}, interval);

    var media = media_obj[0];
    obj.interval = null;//定时器

    //开始播放
    obj.start = function () {

        try {

            obj.interval = setInterval(() => {
                //媒体异常回调（加载超时，媒体严重卡顿，资源丢失）
                if (obj.readyTimeout < 0) {
                    //重启模式，重启媒体指定次数，如果还不能加载成功，则执行timeout
                    if (obj.timeout_reload != undefined && obj.timeout_reload && obj.reload_times >= 0) {
                        obj.log('reloading...');
                        obj.reload_times--;
                        media.load();
                        obj.stop();
                        obj.start();
                    } else {
                        if (obj.timeOut != undefined) obj.timeOut();
                        obj.stop();
                        obj.log('timeout...', 'error');
                    }

                } else {

                    //媒体结束，回调
                    if (obj.MediaEndEvent != undefined && media.ended) {
                        obj.log('finished');
                        obj.stop();
                        obj.MediaEndEvent();
                        
                    } else {

                        media.play();
                        //如果自动播放开启：一暂停，就继续播放
                        if (obj.auto != undefined && obj.auto) {
                            if (media.paused) media.play();
                        }
                        //设置播放速度
                        if (obj.playbackRate != undefined && media.playbackRate != obj.playbackRate) {
                            media.playbackRate = obj.playbackRate;
                        }

                        //静音
                        if (obj.muted != undefined && obj.muted) {
                            media.muted = true;
                        }

                    }



                }
            }, 100);
        } catch (e) {
            obj.log(e, 'error');
        }


        //检测媒体是否异常
        obj.checkInterval = setInterval(() => {
            try {
                /**
                 * 
                 * readyState           ——准备状态  有4个值，小于2都是加载有问题
                 *media.error          ——错误代码      为null，则表示媒体正常
                 *media.networkState   ——网络状态  不为1，2都是加载有问题
                 */
                if (media.readyState <= 2 || media.error != null || media.networkState == 0 || media.networkState == 3) {
                    obj.readyTimeout--;
                    obj.log('checking...', 'error');
                    obj.log('media.readyState：' + media.readyState, 'error');
                    obj.log('media.error：' + media.error, 'error');
                    obj.log('media.networkState：' + media.networkState, 'error');
                } else {
                    obj.readyTimeout = 10;//如果状态良好，则重置
                    obj.reload_times = parameter.reload_times != undefined ? obj.reload_times : 5;//如果状态良好，则重置
                }
            } catch (e) {
                obj.log(e, 'error');
            }
        }, 1000);


    }


    //结束播放
    obj.stop = function () {
        try {
            media.pause();
            clearInterval(obj.interval);
            clearInterval(obj.checkInterval);
        } catch (e) {
            obj.log(e, 'error');
        }
    }

    obj.log('ready!');
    return obj;

}


var MediaUtils = new Array();

//参数实例：
var vusetting = {
    auto: true,
    muted: true,
    playbackRate: 2,
    timeout_reload: true,
    debug: true,
    MediaEndEvent() {
        console.log("媒体播放完毕");
        MediaUtils.shift().start();
        
    },
    timeOut() {
        console.log("媒体加载超时");
    }
}
//启动实例：

function queueMedia(medias) {

    for(let i =0;i<medias.length;i++){
        var vu = new MediaUtil(medias.eq(i), vusetting);
        MediaUtils.push(vu);
    }
    MediaUtils.shift().start();
}
queueMedia($('#iframe').contents().find('iframe').contents().find('video'));
// vu = new MediaUtil($('video'), vusetting);
// vu.start();
