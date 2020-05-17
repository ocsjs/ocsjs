 // ==UserScript==
// @name         超星刷课脚本（作者：skeleton）
// @namespace    skeleton
// @version      1.6.12
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
(function () {
    var version = '1.6.12';
    var last_set_time = '2020/5/14';
    // 下面部分代码借用 wyn665817 大佬的 “强制使用H5播放器” 的功能，在此感谢大佬的付出，前人栽树后人乘凉。

    // 下面这里22-34行的设置是没有用的，请不要乱更改！！！！！
    var setting = {
        time: 5E3 
        , review: 0 
        , queue: 1 
        , video: 0 
        , line: '公网1'
        , http: '标清'
        , vol: '0' 
        , rate: '1' 
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
    String.prototype.toCDB = function () {
        return this.replace(/\s/g, '').replace(/[\uff01-\uff5e]/g, function (str) {
            return String.fromCharCode(str.charCodeAt(0) - 65248);
        }).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/。/g, '.');
    };
    setting.normal = ''; // ':visible'
    // setting.time += Math.ceil(setting.time * Math.random()) - setting.time / 2;
    setting.job = [':not(*)'];
    setting.video && setting.job.push('iframe[src*="/video/index.html"]');
    setting.tip = !setting.queue || top != _self && jobSort($ || Ext.query);
    function getIframe(tip, win, job) {
        if (!$) return Ext.get(frameElement || []).parent().child('.ans-job-icon') || Ext.get([]);
        do {
            win = win ? win.parent : _self;
            job = $(win.frameElement).prevAll('.ans-job-icon');
        } while (!job.length && win.parent.frameElement);
        return tip ? win : job;
    }
    function jobSort($) {
        var fn = $.fn ? [getIframe(1), 'length'] : [self, 'dom'],
            sel = setting.job.join(', :not(.ans-job-finished) > .ans-job-icon' + setting.normal + ' ~ ');
        if ($(sel, fn[0].parent.document)[0] == fn[0].frameElement) return true;
        if (!getIframe()[fn[1]] || getIframe().parent().is('.ans-job-finished')) return null;
        setInterval(function () {
            $(sel, fn[0].parent.document)[0] == fn[0].frameElement && fn[0].location.reload();
        }, setting.time);
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
    if (url == '/mycourse/studentstudy') {
        chaoxing_js();
    }
    if (setting.review) _self.greenligth = Ext.emptyFn;
    checkPlayer(_self.supportH5Video());
    //以上都是 wyn大佬的——强制h5播放器代码，解决了flash视频的播放问题，在此致谢。
    function chaoxing_js() {
        if (window.location.href.indexOf("http://i.mooc.chaoxing.com/space/index") != -1) {
            alert("欢迎使用超星刷课脚本(skeleton)，请点击你想要刷的课程");
        }
        if (window.location.href.indexOf("https://mooc1-1.chaoxing.com/mycourse/studentcourse") != -1) {
            alert("随便点击下面任意一个任务点，进入学习界面，即可开始刷课");
        }
        /*
        超星学习通刷课脚本
        作者：LDS-Skeleton（github）
        功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题
        ======================================================================================================
        */
        var jobCounts = null;//未完成的课程数组，任务点
        //设置变量的json，可以自己修改下面的设置
        var set = {
            rate: 1,//默认播放速度
            response_time: 3*1000,//事件之间的相应时间，三秒
            response_time_fast: 1*1000,//事件之间的相应时间，三秒
            network: 1,//默认选择公网一，1就是公网1,2就是公网2
            
            //下面多视频播放值：下面的不要乱改，只能改上面的
            video_length: 0,//视频数量
            auto_submit: true,//自动提交答案，默认开启，这里改了没用的，点了刷课界面的那个才有用。
            now_page_video_index: 0,//当有多个视频的时候，当前视频的索引
            set_video_index: 0,//自己可以设置的自定义视频索引
            set_span_index: 0,//每个章节视频顶部的标签，例如：课程，章节测验
            play_interval: null,//视频播放的定时器，定时执行
            _clearInterval() {//清除视频播放定时器
                if (this.play_interval != null) {
                    clearInterval(this.play_interval);
                    this.play_interval = null;
                    GetInfo.page.getVideoDoc().find('.vjs-play-control').eq(0).click();//点击播放按钮暂停
                }
            }
        }
        //检测函数json
        var check = {
            //初始化倒计时
            timeout_has_video: set.response_time/1000,
            timeout_video_already:  set.response_time/1000,
            init() {
                this.timeout_has_video = set.response_time/1000;
                this.timeout_video_already =  set.response_time/1000;
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
                if (spanTag_isfinish()) {
                    set.set_span_index = 0;//归零
                    click_ATage();
                    mylog("页面未查找到视任务点，将跳转到下一章节");
                }
                else {
                    mylog("任务栏索引："+set.set_span_index);
                    set.set_span_index++;
                    mylog("页面未查找到任务点，将跳转到下一任务点");
                }
                setTimeout(clickNext, set.response_time_fast);
                this.timeout_has_video = 5;
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
                getJobCounts() {//这里必须要用jq获取，用document会报错
                    var jobcount=$(".jobCount");//获取任务点
                    var nojob=$('.noJob');//获取空任务点
                    jobcount.push(nojob);
                    console.log(jobcount);
                    return jobcount;
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
                //获取视频选择的公网的数字，1就是公网1,2就是公网2
                getVideoSelectedNetWork_num() {
                    var selected = GetInfo.page.getJobDoc().find('video').eq(0).parent('.video-js').find('.vjs-control-bar').find('.vjs-menu-button').find('.vjs-menu').eq(2).find('.vjs-selected');
                    return selected.eq(0).text().substring(2);
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
            set._clearInterval();//清除定时器
            jobCounts = GetInfo.page.getJobCounts();//初始化任务点
            if (jobCounts == undefined) mylog("章节信息加载失败,或者课程已完成！！！", 'error');
            else {
                mylog("正在加载...");
                $('#startplay').text("正在初始化信息中...");
                playbackRate_event();//播放速率的一些事件
                click_ATage();//点击右边任务栏
                clickNext();//点击下一个
                
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
            mylog("倍速播放初始化");
        }
        //开始运行
        function play() {
            //检测课程是否完成
            if (jobCounts.length == 0) {
                job_is_finish();
            } else {
                var noSound = GetInfo.video.getVoiceButton();//禁音按钮
                var playRate = GetInfo.video.getProgressValue();//播放完成百分比
                playRate = playRate == undefined ? 0 : playRate;
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
            var current_time = GetInfo.page.getJobDoc().find('.vjs-current-time-display').text();//现在课程的时间
            var during_time = GetInfo.page.getJobDoc().find('.vjs-duration-display').text();//总时间
            //这里为什么不用进度条来判断是否播放完毕呢？因为如果有人开了3,4倍速，但是一个视频只有10几秒的情况下，进度条有时候会卡在98,99，就不动了。所以在这里用时间判断是否播放完毕
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
                job_is_finish();
            } else {
                //检测视频
                setTimeout(clickNext_span, set.response_time);
            }
        }
        function click_ATage() {
            //如果是解锁模式，那么就一直播放最后一个章节
            jobCounts = GetInfo.page.getJobCounts();
            mylog("set.set_video_index：" + set.set_video_index);
            var count = 0 + set.set_video_index;
            if(jobCounts[count] == undefined)  job_is_finish() ;
            else {
                if($('.noJob')[0]!=undefined){
                    mylog("检测到空任务点！，正在清除，请耐心等待！",'error');
                     $('.noJob')[0].parentNode.getElementsByTagName('a')[0].click();
                }else{
                    jobCounts[count].parentNode.getElementsByTagName('a')[0].click();//点击链接
                }
                
            }
        }
        //点击下一个tag点,tag点完成后才能继续下一个章节
        function clickNext_span() {
            mylog('跳转到了第' + (set.set_span_index + 1) + '个任务栏');
            GetInfo.page.getTabTag(set.set_span_index).click();
            setTimeout(find_Job, set.response_time);
        }
        //任务栏是否点击完毕
        function spanTag_isfinish() {
            return set.set_span_index >= GetInfo.page.getTabTags().length - 1;
        }
        //查找是否有任务点
        function find_Job() {
            var check_interval = setInterval(function () {
                if (check.isTimeout(check_interval)) return;//检测如果超时
                if (check.has_video_Topic_ppt()) {
                    setTimeout(check_job_finish, set.response_time_fast);//初始化播放模式
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
                    mylog("任务点完成，开始跳转下一任务点");
                }
            } else {
                //初始化开始模式
                setTimeout(initStartMode, set.response_time);
            }
        }
        //初始化视频播放模式
        function initStartMode() {
            mylog("正在判断任务点是什么类型");
            if (GetInfo.page.getTopicDoc().length) {//答题任务点
                //如果有待批阅的任务，为了不卡死脚本，直接跳过
                if (GetInfo.page.getTopicDoc().find('.ZyTop h3').text().indexOf("待批阅") != -1) {
                    mylog(GetInfo.page.getTopicDoc().find('.ZyTop h3').text());
                    mylog("任务点待批阅，转到下一个任务点");
                    set.set_span_index++;
                    set.set_video_index++;
                    if (spanTag_isfinish()) {
                        set.set_span_index = 0;//归零
                        click_ATage();
                    }
                    setTimeout(clickNext, set.response_time);
                }
                else {
                    mylog("自动答题开启");
                    setTimeout(find, set.response_time_fast);
                }
                return;
            } else if (GetInfo.page.getPptDoc().length) {//ppt任务点
                setTimeout(playPPT, set.response_time_fast);
                return;
            } else if (GetInfo.page.getAudioDoc().length) {//音频任务点
                setTimeout(playAudio, set.response_time_fast);
            } else if (GetInfo.page.getVideoDoc().length) {//视频任务点
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
            moveTo_job();
        }
        function playPPT() {
            mylog("检测到ppt，开始翻阅");
            if (GetInfo.page.getJobDoc().find('.mkeRbtn').css('visibility') == "visible") {
                var inter = setInterval(() => {
                    GetInfo.page.getJobDoc().find('.mkeRbtn').click();
                    if (GetInfo.page.getJobDoc().find('.mkeRbtn').css('visibility') != "visible") {
                        setTimeout(clickNext, set.response_time);
                        clearInterval(inter);
                    }
                }, 1000);
            } else {
                setTimeout(clickNext, set.response_time);
            }
        }
        function playAudio() {
        }
        //下面都是没什么用的一些函数
        //自定义输出
        function mylog(str, type) {
            console.log(str)
            var title = "[超星脚本]:";
            var strp = $('<p></p>');
            strp.append(str);
            var nonestrp = $('<p></p>');
            nonestrp.append(str);
            if (type == 'error') {
                console.error(title + "%c" + str, 'color:red;');
                strp.css('color', 'red');
                nonestrp.css('color', 'red');
            }
            else {
                console.log(title + "%c" + str, 'color:green;');
                strp.css('color', 'green');
                nonestrp.css('color', 'green');
            }
            $('#myconsole').append(strp);
            $("#myconsole").append('<hr>');
            $('#disvisual-console').html(nonestrp);
            //如果超过最大值，则删除该输出
            if ($("#myconsole").children().length > 50) {
                $("#myconsole").children().eq(0).remove();
                $("#myconsole").children().eq(1).remove();
            }
            $("#consoleContent").scrollTop($("#myconsole").height());//滚动条
        }
        //页面跳转到指定任务点
        function moveTo_job() {
            $("html").scrollTop(GetInfo.page.getJobDoc().height());
        }
        //刷课完成
        function job_is_finish() {
            setTimeout(() => {
                mylog('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
                alert('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
            }, 5000);
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
               <div id='net-work' >\
               <p>\
               <ul >\
                   <li style='margin-top: 20%;width:100%;'><span style='margin:4px;font-weight:bold'>开启自动提交答案</span><input id='auto_submit' type='radio' name='auto_submit' checked></li>\
                   <li style='width:100%;'><span style='margin:4px;font-weight:bold'>如果40%的题查不到则不自动提交</span><input id='auto_submit_limit' type='radio' name='auto_submit'></li>\
                   <hr>\
                   <li style='width:100%;'><span style='margin:4px;font-weight:bold'>公网1</span><input id='gw1' type='radio' name='netwwork'  checked></li>\
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
        //检测是否开启自动提交答案。
        setInterval(() => {
            if ($("#auto_submit").get(0).checked) {
                set.auto_submit = true;
            } else {
                set.auto_submit = false;
            }
        }, 1000);
        //=============下面是自动答题，别看了，我自己都看不懂，写的跟个什么一样=============
        var regexp = /===|---/;
        var special_characters = /(,|，|、|\||。|—|\s|`|"|“|”)/g;
        var ABCD = /(A|B|C|D)/g;
        var test_line_regexp = /(A|B|C|D|E|F|G|H|I|J|K)/g;
        var index = 0;
        var test_line_index = 0;
        var notfind_num = 0;
        function find() {
            mylog("正在搜索答案");
            var len = GetInfo.page.getTopicTitles();
            if (len.length != 0) {
                var question = len.eq(index).text().replace(/\s+/g, "");//去掉空格
                question = question.length > 200 ? question.substring(0, 200) : question;
                question = question.replace(/(%|\^)/g, "");//消除特殊字符，不然服务器会报错
                if (question.match("[1-9]\d*、")) question = question.replace(/[1-9]\d*、/g, "");//消除题目数字
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: "http://p.52dw.net:81/chati?q=" + question.substring(question.indexOf('】') + 1),
                    onload: function (r) {
                        mylog("搜索成功");
                        try {
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
                                notfind_num++;
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
                        } catch (e) {
                            alert("未知的错误");
                            mylog("未知的错误");
                        }
                    },
                    onerror: function (err) {
                        alert("服务器错误!!!，请耐心等待，可能是服务器正在维护，过一会再重新使用脚本即可");
                        mylog("服务器错误");
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
        function endFind(len) {
            //如果自动提交开启，则直接提交
            var rate_mark = (notfind_num / GetInfo.page.getTopicTitles().length) * 100;
            mylog("错误率：" + rate_mark + "%");
            if (set.auto_submit == true || ($("#auto_submit_limit").get(0).checked && rate_mark < 40)) {
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
            } else {
                setTimeout(() => {
                    GetInfo.page.getTopicDoc().find('div.ZY_sub.clearfix').find('a.btnGray_1').click()
                    setTimeout(() => {
                        clickNext();
                        index = 0;
                        test_line_index = 0;
                    }, 3000);
                }, 3000);
            }
        }
        //填充答案
        function fill_answer(li, test_textarea_p, test_line) {
            if (li.length != 0) {
                li.eq(0).find('input').click();
            }
            if (test_textarea_p.length != 0) {
                var random = String(new Date().getTime()).substr(-1);
                //10个里面找一个随机填写，要改自己改吧
                var random_array = ["不知道", "不清楚", "不懂", "不会啊", "不会写", "不懂怎么写啊", "太难了，不会", "不会", "我不懂", "不晓得"];
                test_textarea_p.eq(0).text(random_array[random]);
            }
            if (test_line.length != 0) {
                mylog("找不到答案，将顺序填充答案");
                //连线题找不到答案只能瞎蒙了
                test_line_index += 3;
                var array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
                for (let i = 0; i < test_line.length; i++) {
                    test_line.eq(i).val(array[i]);
                }
            }
        }
        if (window.location.href.indexOf("studentstudy")) {
            //=============下面是主运行代码=============
            drawWindow();
            setNetwork();//设置公网切换
            setTimeout(() => {
                init();
                mylog("开始刷课");
                // alert('● 倍速播放很可能会导致挂科！，或者不良记录\n●公网和播放速度，可任意切换\n● 最后！！！请吧当前窗口独立出来，可以覆盖当前窗口，但是不能最小化窗口！，不然视频过一段时间会自动暂停');
                // alert("注意！目前脚本不能搜索到图片和语音，如果题目有大量图片慎用次脚本！");
            }, 3000);
        }
    };
})();
