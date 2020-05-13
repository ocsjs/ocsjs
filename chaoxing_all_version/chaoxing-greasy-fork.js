// ==UserScript==
// @name         超星刷课脚本（作者：skeleton）
// @namespace    skeleton
// @version      1.4.4
// @description  超星视频自动播放，自动下一页，自动答题。
// @author       skeleton
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @connect      52dw.net
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @supportURL   https://greasyfork.org/zh-CN/scripts/369625/feedback
// @license      MIT
// ==/UserScript==

var version = '1.4.4';
var last_set_time = '2020/5/13';


// 下面部分代码借用 wyn665817 大佬的 “强制使用H5播放器” 的功能，在此感谢大佬的付出，前人栽树后人乘凉。

// 下面的设置没有用的，请不要乱更改！！！！！
var setting = {
    // 5E3 == 5000，科学记数法，表示毫秒数
    time: 5E3 // 默认响应速度为5秒，不建议小于3秒
    , token: '' // 捐助用户可以使用定制功能，更精准的匹配答案，此处填写捐助后获取的识别码
    , review: 0 // 复习模式，完整挂机视频(音频)时长，支持挂机任务点已完成的视频和音频，默认关闭
    , queue: 1 // 队列模式，开启后任务点逐一完成，关闭则单页面所有任务点同时进行，默认开启
    // 1代表开启，0代表关闭
    , video: 0 // 视频支持后台、切换窗口不暂停，支持多视频，默认关闭
    // 仅开启video(audio)时，修改此处才会生效
    , line: '公网1' // 视频播放的默认资源线路，此功能适用于系统默认线路无资源，默认'公网1'
    , http: '标清' // 视频播放的默认清晰度，无效参数则使用系统默认清晰度，默认'标清'
    // 本区域参数，上方为video功能独享，下方为audio功能共享
    , vol: '0' // 默认音量的百分数，设定范围：[0,100]，'0'为静音，默认'0'
},
    _self = unsafeWindow,
    url = location.pathname,
    top = _self;

if (url != '/studyApp/studying' && top != _self.top) document.domain = location.host.replace(/.+?\./, '');

try {
    while (top != _self.top) {
        top = top.parent.document ? top.parent : _self.top;
        if (top.location.pathname == '/mycourse/studentstudy') break;
    }
} catch (err) {
    // console.log(err);
    top = _self;
}

var $ = _self.jQuery || top.jQuery,
    parent = _self == top ? self : _self.parent,
    Ext = _self.Ext || parent.Ext || {},
    UE = _self.UE,
    vjs = _self.videojs;

setting.normal = ''; // ':visible'
// setting.time += Math.ceil(setting.time * Math.random()) - setting.time / 2;
setting.job = [':not(*)'];
setting.video && setting.job.push('iframe[src*="/video/index.html"]');

if (url == '/ananas/modules/video/index.html' && setting.video) {
    if (setting.review) _self.greenligth = Ext.emptyFn;
    checkPlayer(_self.supportH5Video());
}

function checkPlayer(tip) {
    _self.videojs = hookVideo;
    hookVideo.xhr = vjs.xhr;
    Ext.isSogou = Ext.isIos = Ext.isAndroid = false;
    var data = Ext.decode(_self.config('data')) || {};
    delete data.danmaku;
    data.doublespeed = 1;
    frameElement.setAttribute('data', Ext.encode(data));
    if (tip) return;
    _self.supportH5Video = function () { return true; };
    alert('此浏览器不支持html5播放器，请更换浏览器');
}

function hookVideo() {
    _self.alert = console.log;
    var config = arguments[1],
        line = Ext.Array.filter(Ext.Array.map(config.playlines, function (value, index) {
            return value.label == setting.line && index;
        }), function (value) {
            return Ext.isNumber(value);
        })[0] || 0,
        http = Ext.Array.filter(config.sources, function (value) {
            return value.label == setting.http;
        })[0];
    config.playlines.unshift(config.playlines[line]);
    config.playlines.splice(line + 1, 1);
    config.plugins.videoJsResolutionSwitcher.default = http ? http.res : 360;
    config.plugins.studyControl.enableSwitchWindow = 1;
    config.plugins.timelineObjects.url = '/richvideo/initdatawithviewer?';
    config.plugins.seekBarControl.enableFastForward = 1;
    if (!setting.queue) delete config.plugins.studyControl;
    // config.preload = setting.tip ? 'auto' : 'none';
    var player = vjs.apply(this, arguments),
        a = '<a href="https://d0.ananas.chaoxing.com/download/' + _self.config('objectid') + '" target="_blank">',
        img = '<img src="https://d0.ananas.chaoxing.com/download/e363b256c0e9bc5bd8266bf99dd6d6bb" style="margin: 6px 0 0 6px;">';
    player.volume(Math.round(setting.vol) / 100 || 0);
    Ext.get(player.controlBar.addChild('Button').el_).setHTML(a + img + '</a>').dom.title = '下载视频';
    player.on('loadstart', function () {
        setting.tip && this.play().catch(Ext.emptyFn);
        this.playbackRate(setting.rate > 16 || setting.rate < 0.0625 ? 1 : setting.rate);
    });
    player.one(['loadedmetadata', 'firstplay'], function () {
        setting.two = setting.rate === '0' && setting.two < 1;
        setting.two && config.plugins.seekBarControl.sendLog(this.children_[0], 'ended', Math.floor(this.cache_.duration));
    });
    player.on('ended', function () {
        Ext.fly(frameElement).parent().addCls('ans-job-finished');
    });
    return player;
}

if (window.location.href.indexOf("studentstudy") != -1) {
    chaoxing_script();
}

if(window.location.href.indexOf("http://i.mooc.chaoxing.com/space/index") != -1){
    alert("欢迎使用超星刷课脚本(skeleton)，请点击你想要刷的课程");
}

if(window.location.href.indexOf("https://mooc1-1.chaoxing.com/mycourse/studentcourse") != -1){
    alert("随便点击下面任意一个任务点，进入学习界面，即可开始刷课");
}

function chaoxing_script() {
    /*
    超星学习通刷课脚本
    作者：LDS-Skeleton（github）
    功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题
    ======================================================================================================
    */
    var version = '1.4.3';
    var last_set_time = '2020/5/13';
    var jobCounts = null;//未完成的课程数组，任务点
    var cp = "";//这一章
    var np = "";//下一章
    var play_type = 0;//用来识别是第一次点击播放，还是第n次点击播放，用来做适配
    //设置变量的json，可以自己在控制台设置改变
    var set = {
        rate: 1,//播放速度
        response_time: 3000,//事件之间的相应时间，三秒
        response_time_fast: 1000,//事件之间的相应时间，三秒
        network: 1,//默认选择公网一
        //控制台输出数量
        consolelength: 0,
        //控制台最大数量
        consoleMaxLength: 50,
        //下面多视频播放值：
        video_length: 0,//视频数量
        now_page_video_index: 0,//当有多个视频的时候，当前视频的索引
        set_video_index: 0,//自己可以设置的自定义视频索引
        set_span_index: 0,//每个章节视频顶部的标签，例如：课程，章节测验
        play_interval: null,//视频播放的定时器，定时执行
        _clearInterval() {
            if (this.play_interval != null) {
                clearInterval(this.play_interval);
                this.play_interval = null;
                GetInfo.page.getVideoDoc().find('.vjs-play-control').eq(0).click();//点击播放按钮暂停
            }
        }
    }


    //检测函数json
    var check = {
        timeout_has_video: 5,
        timeout_video_already: 5,
        init() {
            this.timeout_has_video = 5;
            this.timeout_video_already = 5;
        },
        //是否存在视频
        has_video_Topic_ppt() {
            if (GetInfo.page.getVideoDocs().length == 0 && GetInfo.page.getTopicDocs().length == 0 && GetInfo.page.getPptDocs().length == 0 && GetInfo.page.getAudioDocs().length == 0) {
                mylog("未查找到任务点，将在" + (this.timeout_has_video--) + "秒后跳过该界面", 'error');
                return false;
            }
            else return true;
        },
        //检测如果超时
        isTimeout(check_interval) {
            if (this.timeout_has_video < 0 || this.timeout_video_already < 0) {
                this.jump_next();
                clearInterval(check_interval);
                return true;
            }
            else return false;
        },
        //跳转
        jump_next() {
            //如果手动播放模式开启，则不自动跳转
            if (modeAttrChecked.noAuto() != undefined) {
                mylog("页面未查找到视频，请重新选择你要播放的视频", 'error');
            } else {
                if (spanTag_isfinish()) {
                    set.set_span_index = 0;//归零
                    click_ATage();
                    mylog("页面未查找到视频，将跳转到下一章节");
                }
                else {
                    set.set_span_index++;
                    mylog("页面未查找到视频，将跳转到下一任务点");
                }
                setTimeout(clickNext, set.response_time_fast);
                this.timeout_has_video = 5;
            }
        }
    }
    //获取播放模式选择的属性
    var modeAttrChecked = {
        //解锁模式
        unLocking() {
            return $('#unlocking-mode-play').attr('checked');
        },
        //手动模式
        noAuto() {
            return $('#no-auto-play').attr('checked');
        }
    }
    //获取播放页面的一些视频信息，可以当成api去用
    var GetInfo = {
        //主要是一些播放界面的信息
        page: {
            //获取2层下的doc
            getDoc() {
                return $('#iframe').contents().find('iframe').contents();
            },
            //获取2层iframe下面的document元素中的第一个任务点
            getJobDoc() {
                return $('#iframe').contents().find('.ans-job-icon').parent('div[class=ans-attach-ct]').eq(0).find('iframe').contents();
            },
            //获取2层iframe下面的document元素中的所有任务点
            getJobDocs() {
                return $('#iframe').contents().find('.ans-job-icon').parent('div[class=ans-attach-ct]').find('iframe').contents();
            },
            //播放页面顶部的第几个按钮，通常有视频，章节测验
            getTabTag(index) {
                return $('.tabtags').find('span').eq(index);
            },
            //播放页面顶部的所有按钮，通常有视频，章节测验
            getTabTags() {
                return $('.tabtags').find('span');
            },
            //未完成的课程数组
            getJobCounts() {
                return document.getElementsByClassName('jobCount');//必须用原生js，不然点击a链接，界面将不会跳转，超星这里很坑。
            },
            //页面中所有完成任务点数量
            getFinishJobLength() {
                return $('#iframe').contents().find('.ans-job-finished').length;
            },
            //获取完成的任务数量
            getFinishJob() {
                var finish_job_length = 0;
                for (var i = 0; i < this.getFinishJobLength(); i++) {
                    if ($('#iframe').eq(0).contents().find('.ans-job-finished').eq(i).find('iframe').length == 1) finish_job_length++;
                }
                return finish_job_length;
            },
            //获取题目
            getTopicTitles() {
                return this.getJobDocs().find('iframe').contents().find('i.fl').parent('div').find('div.clearfix');
            },
            //获取界面中的题目任务点
            getTopicDocs() {
                return this.getJobDocs().find('iframe').contents().find('.CeYan');
            },
            //获取ppt
            getPptDocs() {
                return this.getJobDocs().find('.imglook');
            },
            //获取视频
            getVideoDocs() {
                return this.getJobDocs().find('video');
            },
            //获取audio
            getAudioDocs() {
                return this.getJobDocs().find('audio#audio_html5_api.vjs-tech');
            },
            //下面是获取界面中第一个任务点，就是需要完成的任务点
            getTopicDoc() {
                return this.getJobDoc().eq(0).find('iframe').contents().find('.CeYan');
            },
            //获取ppt
            getPptDoc() {
                return this.getJobDoc().eq(0).find('.imglook');
            },
            //获取视频
            getVideoDoc() {
                return this.getJobDoc().eq(0).find('video');
            },
            //获取audio
            getAudioDoc() {
                return this.getJobDoc().eq(0).find('audio#audio_html5_api.vjs-tech');
            }
        },
        //主要是播放视频的信息
        video: {
            //获取视频数量
            getVideoLength() {
                return GetInfo.page.getJobDocs().find('video').length;
            },
            //获取禁音按钮
            getVoiceButton() {
                return GetInfo.page.getJobDoc().find('.vjs-vol-3').eq(0);
            },
            //获取播放按钮，只要视频暂停了，这个按钮就会出现
            getPlayButton() {
                return GetInfo.page.getJobDoc().find('#video button.vjs-big-play-button').eq(0);
            },
            //获取视频进度条值
            getProgressValue() {
                return GetInfo.page.getJobDoc().find('.vjs-progress-holder').eq(0).attr('aria-valuenow');
            },
            //获取视频进度条
            getProgresses() {
                return GetInfo.page.getJobDoc().find('.vjs-progress-holder');
            },
            //获取视频加载中的界面，如果没有则代表视频加载成功
            getVideoLoding_Visibility() {
                return GetInfo.page.getJobDoc().find('#loading').css('visibility');
            },
            //获取视频选择的公网
            getVideoSelectedNetWorks() {
                return GetInfo.page.getJobDoc().find('video').eq(0).parent('.video-js').find('.vjs-control-bar').find('.vjs-menu-button').find('.vjs-menu').eq(2).find('.vjs-menu-item');
            },
            //获取视频选择的公网类型，1就是公网1,2就是公网2
            getVideoSelectedNetWork(index) {
                return this.getVideoSelectedNetWorks().eq(index);
            },
            //获取视频选择的公网的数字，1就是公网1,2就是公网2
            getVideoSelectedNetWork_num() {
                var selected = GetInfo.page.getJobDoc().find('video').eq(0).parent('.video-js').find('.vjs-control-bar').find('.vjs-menu-button').find('.vjs-menu').eq(2).find('.vjs-selected');
                return selected.eq(0).text().substring(2);
            },
            //获取falsh播放器，如果获取到了，则不能使用脚本。
            getFlashVideo() {
                return GetInfo.page.getJobDoc().find('object').find('param[name="flashvars"]');
            },
            //获取目前播放视频的速度
            getVideoPlayRate() {
                var video = GetInfo.page.getJobDoc().find('video')[0];
                return video == undefined ? undefined : video.playbackRate;
            },
            //设置目前播放视频的速度
            setVideoPlayRate(rate) {
                var video = GetInfo.page.getJobDoc().find('video')[0];
                video == undefined ? undefined : video.playbackRate = rate;
            }
        }
    }
    //初始化数据
    function init() {
        set._clearInterval();
        jobCounts = GetInfo.page.getJobCounts()
        if (jobCounts == undefined) mylog("章节信息加载失败,或者课程已完成！！！", 'error');
        else {
            //如果是第一次点击播放视频
            if (play_type == 0) {
                play_type = 1;
                mylog("正在加载...");
                $('#startplay').text("正在初始化信息中...");
                clickNext();//点击下一个
                click_ATage();
                playbackRate_event();//播放速率的一些事件
            } else {
                $('#startplay').text("点击开始播放");
                play_type = 0
            }
        }
    }
    //播放速率的一些事件
    function playbackRate_event() {
        //删除点击事件
        $("#b1").unbind("click");
        $("#b2").unbind("click");
        //改变播放速度
        $("#b1").click(function () {
            if (set.rate < 15) set.rate += 1;
            $("#rate_txt").text('播放速度：' + set.rate + "X");
        });
        $("#b2").click(function () {
            if (set.rate > 1) set.rate -= 1;
            $("#rate_txt").text('播放速度：' + set.rate + "X");
        });
    }
    //开始运行
    function play() {
        //检测课程是否完成
        if (jobCounts.length == 0) {
            //job_is_finish();
        } else {
            var noSound = GetInfo.video.getVoiceButton();//禁音按钮
            var playRate = GetInfo.video.getProgressValue();//播放完成百分比
            //静音
            if (noSound != null) noSound.click();
            //如果暂停，点击播放
            GetInfo.video.getPlayButton().click();
            //实时改变播放速度
            GetInfo.video.setVideoPlayRate(set.rate);
            $('#progress').text(playRate + "%");
            //如果没有播放完毕，继续运行
            check_is_done();
        }
    }
    //检测视频是否完成
    function check_is_done() {
        var current_time = GetInfo.page.getJobDoc().find('.vjs-current-time-display').text();
        var during_time = GetInfo.page.getJobDoc().find('.vjs-duration-display').text();
        if ((current_time != during_time) || (current_time == "0:00" && during_time == "0:00")) {//如果没有播放完成
            $('#startplay').text("播放中...,点击暂停");
        } else {//如果播放结束
            set._clearInterval();
            mylog("当前视频播放完毕");
            setTimeout(clickNext, set.response_time);
        }
    }
    //点击下一个视频节点
    function clickNext() {
        //初始化数据
        set.now_page_video_index = 0;
        set.video_length = GetInfo.video.getVideoLength();
        jobCounts = GetInfo.page.getJobCounts();
        //检测课程是否完成
        if (jobCounts.length == 0 || jobCounts[0] == undefined) {
            //job_is_finish();
        } else {
            //检测视频
            setTimeout(clickNext_span, set.response_time);
        }
    }
    function click_ATage() {
        //如果是解锁模式，那么就一直播放最后一个章节
        if (modeAttrChecked.unLocking() != undefined) {
            jobCounts[jobCounts.length - 1].parentNode.getElementsByTagName('a')[0].click();
        }
        //如果不是手动播放，那么就点击顺序的链接
        else if (modeAttrChecked.noAuto() == undefined) {
            jobCounts[0].parentNode.getElementsByTagName('a')[0].click();//点击链接
        } else {
            jobCounts[0].parentNode.getElementsByTagName('a')[0].click();//点击链接
        }
    }
    //点击下一个tag点,tag点完成后才能继续下一个章节
    function clickNext_span() {
        mylog('跳转到了第' + (set.set_span_index + 1) + '个任务栏');
        GetInfo.page.getTabTag(set.set_span_index).click();
        setTimeout(find_Job, set.response_time);
    }
    function spanTag_isfinish() {
        return set.set_span_index >= GetInfo.page.getTabTags().length - 1;
    }
    //查找是否有任务点
    function find_Job() {
        var check_interval = setInterval(function () {
            if (check.isTimeout(check_interval)) return;//检测如果超时
            if (check.has_video_Topic_ppt()) {
                setTimeout(check_job_finish, set.response_time_fast);//初始化视频播放模式
                clearInterval(check_interval);
            }
        }, set.response_time_fast);
    }
    function check_job_finish() {
        if (GetInfo.page.getJobDocs().length == 0) {
            setTimeout(clickNext, set.response_time);
            //如果当前章节的全部任务点完成，才能跳转
            if (spanTag_isfinish()) {
                set.set_span_index = 0;//归零
                click_ATage();
                mylog("章节视频任务点全部完成，开始跳转下一章节");
            }
            else {
                set.set_span_index++;
                mylog("视频已经播放完毕，开始跳转下一任务点");
            }
        } else {
            //初始化开始模式
            setTimeout(initStartMode, set.response_time);
        }
    }
    //初始化视频播放模式
    function initStartMode() {
        mylog("正在判断任务点是什么类型");
        if (GetInfo.page.getTopicDoc().length) {
            mylog("自动答题开启");
            setTimeout(find, set.response_time_fast);
            return;
        } else if (GetInfo.page.getPptDoc().length) {
            setTimeout(playPPT, set.response_time_fast);
            return;
        } else if (GetInfo.page.getAudioDoc().length) {
            setTimeout(playAudio, set.response_time_fast);
        } else if (GetInfo.page.getVideoDoc().length) {
            //开启定时器
            mylog("自动播放视频开启");
            if (set.play_interval == null) {
                set.play_interval = setInterval(play, 100);
            }
            return;
        } else {
            setTimeout(clickNext, set.response_time);
            return;
        }
    }
    function playPPT() {
    }
    function playAudio() {
    }
    //下面都是没什么用的一些函数
    //自定义输出
    function mylog(str, type) {
        var time = "[" + new Date().format("MM月dd日hh:mm:ss") + "]";
        var title = "[超星脚本]:";
        var strp = $('<p></p>');
        strp.append("[" + new Date().format("hh:mm:ss") + "]:" + str);
        var nonestrp = $('<p></p>');
        nonestrp.append("[" + new Date().format("hh:mm:ss") + "]:" + str);
        if (type == 'error') {
            console.error(time + title + "%c" + str, 'color:red;');
            strp.css('color', 'red');
            nonestrp.css('color', 'red');
        }
        else {
            console.log(time + title + "%c" + str, 'color:green;');
            strp.css('color', 'green');
            nonestrp.css('color', 'green');
        }
        $('#myconsole').append(strp);
        $("#myconsole").append('<hr>');
        $('#disvisual-console').html(nonestrp);
        set.consolelength++;
        //如果超过最大值，则删除该输出
        if ($("#myconsole").children().length > set.consoleMaxLength) {
            $("#myconsole").children().eq(0).remove();
            $("#myconsole").children().eq(1).remove();
        }
        $("#consoleContent").scrollTop($("#myconsole").height());//滚动条
    }
    //日期格式化，不用看，就是显示日期的工具函数
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    //切换公网
    function setNetwork() {
        $('#gw1').click(function () {
            set.network = 1;
        });
        $('#gw2').click(function () {
            set.network = 2;
        });
    }
    //改变公网
    setInterval(() => {
        if (set.play_interval != null) changeNetwork();
    }, set.response_time_fast);
    //改变公网
    function changeNetwork() {
        var num = parseInt(GetInfo.video.getVideoSelectedNetWork_num());
        if (!isNaN(num)) {
            if (num != set.network) {
                if (num == 1) {
                    GetInfo.video.getVideoSelectedNetWorks().eq(1).click();
                    mylog("正在切换到公网2");
                } else {
                    GetInfo.video.getVideoSelectedNetWorks().eq(0).click();
                    mylog("正在切换到公网1");
                }
            }
        }
    }
    //播放设置，点击后淡出淡入
    function setting(downDiv) {
        if ($(downDiv).css('display') == 'none') {
            $(downDiv).fadeIn();
        } else {
            $(downDiv).css('display', 'none');
        }
    }
    //绘制窗口
    function drawWindow() {
        //加载css文件
        $('head').append('<link href="https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/main.css?t=' + new Date().getTime() + '" rel="stylesheet" type="text/css" />');
        //下面是标签拼接
        $("body").append("<div id='skdiv'></div>");
        var maindiv = $("<div id='skMainDiv'></div>");
        $('#skdiv').append(maindiv);
        $("#skMainDiv").html("\
           <p>\
               <span style='font-weight:bold;    font-size: large;'>超星刷课脚本 </span><span style='font-weight:bold;'> v"+ version + "</span><button id='skmaindiv-btn'>▲</button><br/>（可用鼠标拖动）\
           <p>\
           <p>最后更新时间："+ last_set_time + "</p>\
           \
           <div id='content' style='   border-top: 2px solid;'></div>");
        $('#content').html("\
           <div>\
               <p id='rate_txt'>播放速度：1X</p>\
               <div style='float:left'><button id='b1'>▲</button><button id='b2'>▼</button></div>\
           </div>\
           <hr style=' float: left;width: 100%;'>\
           <p style='text-align:center;'>- 自动播放中 -</p>\
           <div id='net-work' >\
           <p>\
           <ul >\
               <li style='margin-top: 20%;width:100%;'><span style='margin:4px;font-weight:bold'>公网1</span><input id='gw1' type='radio' name='netwwork'  checked></li>\
               <li style='width:100%;'><span  style='margin:4px;font-weight:bold'>公网2</span><input type='radio' id='gw2' name='netwwork'></li>\
           </ul>\
           </p>\
           </div>\
           <div style='margin-top:10px'>\
               <p style='font-weight:bold'>当前进度:&nbsp;&nbsp;<span id='progress'>0%</span></p>\
               <hr>\
               </hr>\
           </div>"
        );
        var myconsole = $("<b>控制台</b><button id='consoleBtn'>▲</button><div>\
   <div id='consoleContent' style='background-color:white;text-align:left; border: 1px solid;-webkit-line-clamp: 10;max-height:200px;overflow:auto'><div id='myconsole'></div></div>\
   </div><div id='disvisual-console' style='background-color:white;border: 1px solid;text-align:left;display:none'></div>");
        $(myconsole).insertAfter("#content");
        //控制台控制收缩
        $('#consoleBtn').click(function () {
            setting('#consoleContent');
            if ($('#consoleContent').css('display') == 'none') {
                $('#consoleBtn').text('▼');
                $('#disvisual-console').css('display', 'block');
            } else {
                $('#consoleBtn').text('▲');
                $('#disvisual-console').css('display', 'none');
            }
        });
        //刷课界面的收缩
        $('#skmaindiv-btn').click(function () {
            setting('#content');
            if ($('#content').css('display') == 'none') {
                $('#skmaindiv-btn').text('▼');
            } else {
                $('#skmaindiv-btn').text('▲');
            }
        });
    }
    //鼠标拖动刷课框
    function dragPanelMove(downDiv) {
        $(downDiv).mousedown(function (e) {
            var positionDiv = $(this).offset();
            var distenceX = e.pageX - positionDiv.left;
            var distenceY = e.pageY - positionDiv.top;
            $(document).mousemove(function (e) {
                var x = e.pageX - distenceX;
                var y = e.pageY - distenceY;
                if (x < 0) {
                    x = 0;
                } else if (x > $(document).width() - $(downDiv).outerWidth(true)) {
                    x = $(document).width() - $(downDiv).outerWidth(true);
                }
                if (y < 0) {
                    y = 0;
                } else if (y > $(document).height() - $(downDiv).outerHeight(true)) {
                    y = $(document).height() - $(downDiv).outerHeight(true);
                }
                $(downDiv).css({
                    'left': x + 'px',
                    'top': y + 'px'
                });
            });
            $(document).mouseup(function () {
                $(document).off('mousemove');
            });
        });
    }

    //=============下面是自动答题=============
    var regexp = /===|---/;
    var special_characters = /(,|，|、|\||。|—|\s|`|"|“|”)/g;
    var ABCD = /(A|B|C|D)/g;
    var test_line_regexp = /(A|B|C|D|E|F|G|H|I|J|K)/g;
    var index = 0;
    var test_line_index = 0;
    function find() {
        mylog("正在搜索答案");
        var len = GetInfo.page.getTopicTitles();
        if (len.length != 0) {
            var question = len.eq(index).text().replace(/\s+/g, "");//去掉空格
            if (question.match("[1-9]\d*、")) question = question.replace(/[1-9]\d*、/g, "");//消除题目数字
            GM_xmlhttpRequest({
                method: 'GET',
                url: "http://p.52dw.net/chati?q=" + question.substring(question.indexOf('】') + 1),
                onload: function (r) {
                    mylog("搜索成功");
                    //==============================================初始化数据==============================================
                    var json = JSON.parse(r.responseText);
                    var answer = json.data.answer.replace(/\s+/g, "");
                    let isclick = 0;
                    var array = answer.split(regexp);
                    var now_ul = GetInfo.page.getTopicDoc().find('i.fl').parent('div').parent('div').find('ul').eq(index);//选择题
                    var li = now_ul.find('li');//填空题
                    var test_textarea_p = now_ul.find('iframe').contents().find('p');//连线题
                    var test_line = GetInfo.page.getTopicDoc().find('i.fl').parent('div').parent('div').find('ul').eq((index + test_line_index)).siblings('ul.ulTop.thirdUlList').find('select');
                    //==============================================如果找不到答案==============================================
                    if (answer.indexOf('抱歉找不到结果') != -1) {
                        GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(255, 92, 92, 0.4)">【问题】：' + json.data.question.substring(json.data.question.indexOf('】') + 1).replace(/\s+/g, "") + '<br>【回答】：抱歉找不到结果</p>');
                        //填充答案
                        fill_answer(li, test_textarea_p, test_line);
                        if (index++ < len.length - 1) setTimeout(find, 3000);
                        else endFind();
                        return;
                    }
                    GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(69, 204, 98,0.2)">【问题】：' + json.data.question.substring(json.data.question.indexOf('】') + 1).replace(/\s+/g, "") + '。</p>');
                    GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(69, 204, 98, 0.2)">【回答】：' + answer + '。</p>');
                    //==============================================选择题==============================================
                    if (li.length != 0) {
                        //对错选择题
                        if (li.find('input').length == 2 && answer.match(/(^|,)(正确|是|对|√|T|ri)(,|$)/)) {
                            li.eq(0).find('input').click();
                            isclick = 1;
                        } else if (li.find('input').length == 2 && answer.match(/(^|,)(错误|否|错|×|F|wr)(,|$)/)) {
                            li.eq(1).find('input').click();
                            isclick = 1;
                        }
                        //多项选择题
                        else if (array != null && array.length > 1) {
                            if (array.length == 0 || array.length > 4) return;
                            var str = '';
                            for (let li_len = 0; li_len < 4; li_len++) {
                                let opt = li.eq(li_len).text().replace(/\s+/g, "");
                                opt = opt.replace(ABCD, "").replace(special_characters, "");
                                //先for循环查找全等的，如果没有再模糊查找
                                for (let i = 0; i < array.length; i++) {
                                    array[i] = array[i].replace(/\s+/g, "").replace(special_characters, "");
                                    if (array[i] == opt) {
                                        console.log("===========全等===========");
                                        li.eq(li_len).find('input').click();
                                        isclick = 1;
                                        break;
                                    }
                                    //模糊查找
                                    else if (opt.length > array[i].length ? opt.indexOf(array[i]) != -1 : array[i].indexOf(opt) != -1) {
                                        console.log("===========模糊匹配===========");
                                        li.eq(li_len).find('input').click();
                                        isclick = 1;
                                        break;
                                    }
                                }
                            }
                        }
                        //单项选择题
                        else if (array != null && array.length == 1) {
                            for (let i = 0; i < 4; i++) {
                                let opt = li.eq(i).text().replace(/\s+/g, "");
                                answer = answer.replace(special_characters, "");
                                opt = opt.replace(ABCD, "").replace(special_characters, "");
                                //先for循环查找全等的，如果没有再模糊查找
                                if (opt == answer) {
                                    li.eq(i).find('input').click();
                                    isclick = 1;
                                    break;
                                }
                                //模糊查找
                                else if (opt.length > answer.length ? opt.indexOf(answer) != -1 : answer.indexOf(opt) != -1) {
                                    li.eq(i).find('input').click();
                                    isclick = 1;
                                    break;
                                }
                            }
                        } else {
                            GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(255, 92, 92, 0.4)">发生了未知的错误</p>');
                            mylog("发生了未知的错误", 'error');
                        }
                    }
                    //==============================================如果是填空题============================================
                    if (test_textarea_p.length != 0) {
                        if (array != null && array.length > 1) {
                            mylog("多个填空题填空完成");
                            find_Mfill_answer(array, test_textarea_p, isclick);
                        }
                        else if (array != null && array.length == 1) {
                            mylog("单项填空题填空完成");
                            test_textarea_p.eq(0).text(array[0]);
                            isclick = 1;
                        }
                        else {
                            GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(255, 92, 92, 0.4)">发生了未知的错误</p>');
                            mylog("发生了未知的错误", 'error');
                        }
                    }
                    //==============================================如果是连线题==============================================
                    if (test_line.length != 0) {
                        mylog("连线题");
                        //如果找到答案就顺序填充
                        test_line_index += 3;//增加3，因为ul摆放很乱，后面是3个ul成对在一起，包含选择的只在最后一个，所以每次都要+3，定位到包含选项的那个。
                        var line_array = answer.match(test_line_regexp);
                        if (line_array.length != 0 && line_array.length <= test_line.length) {
                            for (let i = 0; i < test_line.length; i++) {
                                test_line.eq(i).val(line_array[i]);
                            }
                            isclick = 1;
                        } else {
                            mylog("找不到答案，将顺序填充答案");
                            test_line_index += 3;
                            //找不到答案只能瞎蒙了
                            line_array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
                            for (let i = 0; i < test_line.length; i++) {
                                test_line.eq(i).val(line_array[i]);
                            }
                        }
                    }
                    if (isclick == 0) {
                        GetInfo.page.getTopicTitles().eq(index).append('<p style="background-color:rgb(255, 92, 92, 0.4)">没有符合回答的答案，请自行选择</p>');
                        //填充答案
                        fill_answer(li, test_textarea_p, test_line);
                    }
                    if (index++ < len.length - 1) setTimeout(find, 3000);//下一个
                    else endFind();
                }
            });
        }
    }
    //填充多项填空题的答案
    function find_Mfill_answer(array, test_textarea_p, isclick) {
        if (array.length == 0 || array.length > test_textarea_p.length) return;
        for (let i = 0; i < test_textarea_p.length; i++) {
            test_textarea_p.eq(i).text(array[i]);
        }
        isclick = 1;
    }
    //结束查找
    function endFind() {
        setTimeout(() => {
            GetInfo.page.getTopicDoc().find('div.ZY_sub.clearfix').find('a.Btn_blue_1.marleft10').click()
            setTimeout(() => {
                GetInfo.page.getTopicDoc().parent('div').find(".AlertCon02").find('a.bluebtn.').click();
                setTimeout(() => {
                    clickNext();
                    index = 0;
                    test_line_index = 0;
                }, 3000);
            }, 3000);
        }, 3000);
    }
    //填充答案
    function fill_answer(li, test_textarea_p, test_line) {
        if (li.length != 0) {
            li.eq(0).find('input').click();
        }
        if (test_textarea_p.length != 0) {
            var random = String(new Date().getTime()).substr(-1);
            var random_array = ["不知道", "不清楚", "不懂", "不会啊", "不会写", "不懂怎么写啊", "太难了，不会", "不会", "我不懂", "不晓得"];
            test_textarea_p.eq(0).text(random_array[random]);
        }
        if (test_line.length != 0) {
            mylog("找不到答案，将顺序填充答案");
            //找不到答案只能瞎蒙了
            test_line_index += 3;
            var array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
            for (let i = 0; i < test_line.length; i++) {
                test_line.eq(i).val(array[i]);
            }
        }
    }

    //=============下面是主运行代码=============
    drawWindow();
    setNetwork();//设置公网切换
    //鼠标拖动刷课框
    dragPanelMove("#skdiv");
    setTimeout(() => {
        init();
        mylog("开始刷课");
    }, 2000);



}
