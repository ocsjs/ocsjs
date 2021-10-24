//chatiId,unsafeWindow, $, Vue, originUrl,setting
function  startChaoxingSK(params) {
       // 破解倍速限制（自研）
       let videojs = window.videojs
       let Ext = window.Ext
       if(videojs && Ext){
           console.log("videojs.hook")
           videojs.hook('beforesetup', function(videoEl, options) {
              options.playbackRates=[1, 1.25, 1.5, 2,4,6,8,10,12,14,16]
           return options;
           });
           console.log("破解倍速限制")
           Ext.define("ans.VideoJs",{
               override:"ans.VideoJs",
               constructor: function (b) {
                   b = b || {};
                   var e = this;
                   e.addEvents(["seekstart"]);
                   e.mixins.observable.constructor.call(e, b);
                   var c = videojs(b.videojs, e.params2VideoOpt(b.params), function () {});
                   Ext.fly(b.videojs).on("contextmenu", function (f) {
                       f.preventDefault();
                   });
                   Ext.fly(b.videojs).on("keydown", function (f) {
                       if (f.keyCode == 32 || f.keyCode == 37 || f.keyCode == 39 || f.keyCode == 107) {
                           f.preventDefault();
                       }
                   });
                   if (c.videoJsResolutionSwitcher) {
                       c.on("resolutionchange", function () {
                           var g = c.currentResolution(),
                               f = g.sources ? g.sources[0].res : false;
                           Ext.setCookie("resolution", f);
                       });
                   }
                   // 注释掉这几句代码即可破解
                   //         var a = b.params && b.params.doublespeed ? 2 : 1;
                   //         c.on("ratechange", function () {
                   //             var f = c.playbackRate();
                   //             if (f > a) {
                   //                 c.pause();
                   //                 c.playbackRate(1);
                   //             }
                   //         });
               },
           })
    }
    
    let chatiId = params.chatiId
    let unsafeWindow = params.unsafeWindow
    let $ = params.$
    let Vue = params.Vue
    let originUrl =params.originUrl
    let setting = params.setting
    // 下面部分代码借用 wyn665817 大佬的 “强制使用H5播放器” 的功能，在此感谢大佬的付出，前人栽树后人乘凉。
    h5video()
    function h5video(){


        // 下面这里设置是没有用的，请不要乱更改！！！！！
        var setting = {
            // 5E3 == 5000，科学记数法，表示毫秒数
            time: 5E3 // 默认响应速度为5秒，不建议小于3秒
            ,token: '' // 捐助用户可以使用定制功能，更精准的匹配答案，此处填写捐助后获取的识别码
            ,review: 0 // 复习模式，完整挂机视频(音频)时长，支持挂机任务点已完成的视频和音频，默认关闭
            ,queue: 1 // 队列模式，开启后任务点逐一完成，关闭则单页面所有任务点同时进行，默认开启

            // 1代表开启，0代表关闭
            ,video: 0 // 视频支持后台、切换窗口不暂停，支持多视频，默认关闭
            ,work: 1 // 自动答题功能(章节测验)，作业需要手动开启查询，高准确率，默认开启
            ,audio: 0 // 音频自动播放，与视频功能共享vol和rate参数，默认关闭
            ,book: 0 // 图书阅读任务点，非课程阅读任务点，默认关闭
            ,docs: 0 // 文档阅读任务点，PPT类任务点自动完成阅读任务，默认关闭
            // 本区域参数，上方为任务点功能，下方为独立功能
            ,jump: 0 // 自动切换任务点、章节、课程(需要配置course参数)，默认关闭
            ,read: '0' // 挂机课程阅读时间，单位是分钟，'65'代表挂机65分钟，请手动打开阅读页面，默认'0'分钟
            ,face: 0 // 解除面部识别(不支持二维码类面部采集)，此功能仅为临时解除，默认关闭
            ,total: 0 // 显示课程进度的统计数据，在学习进度页面的上方展示，默认关闭

            // 仅开启video(audio)时，修改此处才会生效
            ,line: '公网1' // 视频播放的默认资源线路，此功能适用于系统默认线路无资源，默认'公网1'
            ,http: '标清' // 视频播放的默认清晰度，无效参数则使用系统默认清晰度，默认'标清'
            // 本区域参数，上方为video功能独享，下方为audio功能共享
            ,vol: '0' // 默认音量的百分数，设定范围：[0,100]，'0'为静音，默认'0'
            ,rate: '1' // 视频播放默认倍率，参数范围0∪[0.0625,16]，'0'为秒过，默认'1'倍

            // 仅开启work时，修改此处才会生效
            ,auto: 1 // 答题完成后自动提交，默认开启
            ,none: 1 // 无匹配答案时执行默认操作，关闭后若题目无匹配答案则会暂时保存已作答的题目，默认开启
            ,scale: 0 // 富文本编辑器高度自动拉伸，用于文本类题目，答题框根据内容自动调整大小，默认关闭

            // 仅开启jump时，修改此处才会生效
            ,course: 0 // 当前课程完成后自动切换课程，仅支持按照根目录课程顺序切换，默认关闭
            ,lock: 1 // 跳过未开放(图标是锁)的章节，即闯关模式或定时发放的任务点，默认开启

            // 自动登录功能配置区
            ,school: '账号为手机号可以不修改此参数' // 学校/单位/机构码，要求完整有效可查询，例如'清华大学'
            ,username: '' // 学号/工号/借书证号(邮箱/手机号/账号)，例如'2018010101'，默认''
            ,password: '' // 密码，例如'123456'，默认''
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

        String.prototype.toCDB = function() {
            return this.replace(/\s/g, '').replace(/[\uff01-\uff5e]/g, function(str) {
                return String.fromCharCode(str.charCodeAt(0) - 65248);
            }).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/。/g, '.');
        };

        setting.normal = ''; // ':visible'
        // setting.time += Math.ceil(setting.time * Math.random()) - setting.time / 2;
        setting.job = [':not(*)'];

        setting.video && setting.job.push('iframe[src*="/video/index.html"]');
        setting.work && setting.job.push('iframe[src*="/work/index.html"]');
        setting.audio && setting.job.push('iframe[src*="/audio/index.html"]');
        setting.book && setting.job.push('iframe[src*="/innerbook/index.html"]');
        setting.docs && setting.job.push('iframe[src*="/ppt/index.html"]', 'iframe[src*="/pdf/index.html"]');

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
            setInterval(function() {
                $(sel, fn[0].parent.document)[0] == fn[0].frameElement && fn[0].location.reload();
            }, setting.time);
        }

        function checkPlayer(tip) {
            console.log('正在切换h5播放器')
            _self.videojs = hookVideo;
            hookVideo.xhr = vjs.xhr;
            Ext.isSogou = Ext.isIos = Ext.isAndroid = false;
            var data = Ext.decode(_self.config('data')) || {};
            delete data.danmaku;
            data.doublespeed = 1;
            frameElement.setAttribute('data', Ext.encode(data));
            if (tip) return;
            _self.supportH5Video = function() {return true;};
            alert('此浏览器不支持html5播放器，请更换浏览器');
        }

        function hookVideo() {
            console.log(' 切换h5播放器中....')
            _self.alert = console.log;
            var config = arguments[1],
                line = Ext.Array.filter(Ext.Array.map(config.playlines, function(value, index) {
                    return value.label == setting.line && index;
                }), function(value) {
                    return Ext.isNumber(value);
                })[0] || 0,
                http = Ext.Array.filter(config.sources, function(value) {
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
            player.on('loadstart', function() {
                setting.tip && this.play().catch(Ext.emptyFn);
                this.playbackRate(setting.rate > 16 || setting.rate < 0.0625 ? 1 : setting.rate);
            });
            player.one(['loadedmetadata', 'firstplay'], function() {
                setting.two = setting.rate === '0' && setting.two < 1;
                setting.two && config.plugins.seekBarControl.sendLog(this.children_[0], 'ended', Math.floor(this.cache_.duration));
            });
            player.on('ended', function() {
                Ext.fly(frameElement).parent().addCls('ans-job-finished');
            });
            return player;
        }

        function hookAudio() {
            console.log('正在切换h5播放器')
            _self.alert = console.log;
            var config = arguments[1];
            config.plugins.studyControl.enableSwitchWindow = 1;
            config.plugins.seekBarControl.enableFastForward = 1;
            if (!setting.queue) delete config.plugins.studyControl;
            var player = vjs.apply(this, arguments),
                a = '<a href="https://d0.ananas.chaoxing.com/download/' + _self.config('objectid') + '" target="_blank">',
                img = '<img src="https://d0.ananas.chaoxing.com/download/e363b256c0e9bc5bd8266bf99dd6d6bb" style="margin: 6px 0 0 6px;">';
            player.volume(Math.round(setting.vol) / 100 || 0);
            player.playbackRate(setting.rate > 16 || setting.rate < 0.0625 ? 1 : setting.rate);
            Ext.get(player.controlBar.addChild('Button').el_).setHTML(a + img + '</a>').dom.title = '下载音频';
            player.on('loadeddata', function() {
                setting.tip && this.play().catch(Ext.emptyFn);
            });
            player.one('firstplay', function() {
                setting.rate === '0' && config.plugins.seekBarControl.sendLog(this.children_[0], 'ended', Math.floor(this.cache_.duration));
            });
            player.on('ended', function() {
                Ext.fly(frameElement).parent().addCls('ans-job-finished');
            });
            return player;
        }
        if (url == '/ananas/modules/video/index.html'  ) {

            console.log("强制html5播放器")
            if(_self.supportH5Video)checkPlayer(_self.supportH5Video());

        }




    }
    
    
    
    let dataVersion = '1.1.1'  //数据版本，为了方便设置setting字段的更新，如果需要添加或者删除字段，需要更改一下版本即可

    $('head').append('<style id="skPanelCss">' + localStorage.skPanelCss + '</style>')
    $('head').append('<script src="https://cdn.jsdelivr.net/gh/enncy/OnlineCourseScript/cdn/chaoxing/AnswerUtil-1.0.0.js"></script>')
    $('head').append('<script src="https://cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.min.js"></script>')

  

    //父界面
    let _top = unsafeWindow.top
    let _self = unsafeWindow
    let _url = _self.location.pathname

    function has(url, str) {
        return url.indexOf(str) != -1
    }
    if (_self == _top) {//在顶层布局
        _top.sk = {}
        _top.sk.allJob = [] //所有的任务点
        _top.sk.operationTime = 0 //任务操作的时间
        _top.sk.addJob = function (obj) { //添加任务
            _top.sk.allJob.push(obj)
        }
    }
    function getType(url) {
        let t = ''
        if (has(url, '/ananas/modules/video')) t = "视频"
        else if (has(url, '/ananas/modules/audio')) t = "音频"
        else if (has(url, '/ananas/modules/work')) t = "章节测验"
        else if (has(url, '/ananas/modules/ppt')) t = "ppt"
        else if (has(url, '/ananas/modules/pdf')) t = "文档"
        else if (has(url, '/ananas/modules/innerbook/')) t = "书本"
        return t;
    }
    if (_url == '/mycourse/studentstudy') {
        console.log('init')

    }
    if (location.pathname != '/mycourse/studentstudy') {
        return;
    }
    //=================================================正文开始=================================================
    //引入  elementui 框架
    $('head').append('<link href="https://unpkg.com/element-ui/lib/theme-chalk/index.css" rel="stylesheet" type="text/css" />')
    window.onload = function () {
        console.log("信息获取完毕")
        let s = setInterval(() => {
            if ($ != undefined) {
                start()
                clearInterval(s)
            }
        }, 1000);
    }
    function start() {
        $.ajax({
            type: "get",
            url:   "https://cdn.jsdelivr.net/gh/enncy/OnlineCourseScript/cdn/chaoxing/sk-panel.html?_=" + new Date().getTime(),
            timeout: 20000,
            dataType: "html",
            success: function (skpanel) {
                //初始化Vue
                vue(skpanel)
                localStorage.skPanel = skpanel
                _top.cpi = GetQueryString("cpi", $('iframe').eq(0).attr('src'))
            }
        });
    }
    function vue(skpanel) {
        //注册组件
        registerComponents();
        new Vue({
            el: '#app',
            beforeCreate() {
                $('body').append(skpanel)
            },
            mounted() {
                let _this = this
                //默认关闭日志
                this.setting.consoleShow = false

                 
                
                this.openFullScreen();
                this.dialogVisible = true;
                _this.info.passChapterId.add(_this.getChapterId())

                var ocs = Ocs(unsafeWindow)//Ocs(unsafeWindow)
                    ocs.CxPageLisenner(function (page) {
                	console.log("监听到页面改变信息")
                	console.log(page)     
                    //............进行任务点的代码
                    console.log(page)
                    _top.pageChange(page.pageInfo.direction, page.pageInfo.chapterId, page.pageJob)
                })

                if($('#skdiv').length!=0) _this.messageBox('警告',"检测到您安装了超星刷课的旧脚本，请删除旧版本，保证新脚本的运行！！！，如何删除请看教程：\n<a href='https://ocs.enncy.cn/script/tampermonkey/#油猴使用' target='_blank'>https://ocs.enncy.cn/script/tampermonkey/#油猴使用</a>","warning")

                _top.pageChange = function (direction, chapterId, pageJob, callback) {
                    _top.sk.operationTime = new Date().getTime()
                    _this.tabtags = _this.getTabtags()
                    _this.reSearchIframe(pageJob)
                    setTimeout(() => {
                        if (new Date().getTime() - _top.sk.operationTime >= 3000) {
    
                            //防止用户频繁操作，每次操作判断是否在3秒内，如果是，则为无效操作，
                            console.log(_this.info.passChapterId)
                            
                            
                            if (_this.setting.skType != "手动") {
                                //如果当前章节，没有做过，则代表章节变更
                                if (!_this.info.passChapterId.has(chapterId)) {
                                    _this.log("新章节")
                                    _this.info.passChapterId.add(chapterId)
                                    next(_this.allStart) 
                                } else {
                                    _this.log("此章节")
                                    next(_this.allStart) 
                                }
                            }
                        }
                    }, 3000)

                }
                if(chatiId==undefined || chatiId=='' ){
                    // this.messageBox("警告","检测到您未填写查题码，请在←左边，答题设置，填写查题码才能查题，关注微信小程序“网课答” 免费获取查题码",'warning')
                     _this.loading.obj.text = '检测到您未填写查题码，请在←左边，答题设置，填写查题码才能查题，关注微信小程序 “网课答” 免费获取查题码' //'题库异常！请在教程网站: https://ocs.enncy.cn 查找qq群，联系群主解决！！！'
                        _this.loading.obj.spinner = 'el-icon-error'
                        _this.loading.obj.customClass = 'load-error'
                        setTimeout(function () { _this.loading.obj.close() }, 10000)
                    
                }else{
                    $.ajax({
                        type: "get",
                        url: originUrl + "/chati/"+chatiId+"/0/计算机",
                        dataType: "json",
                        success: function (r) {
                            _this.loading.obj.text = '题库正常！稍后自动开始刷课'
                            _this.loading.obj.spinner = 'el-icon-success'
                            _this.loading.obj.customClass = 'load-success'
                            
                             _this.reSearchIframe(ocs.getIframeJob(_top.$('iframe')))
                            if (_this.setting.skType != "手动") {
                                next(() => {
                                    _this.tabtags = _this.getTabtags()
                                     _this.log("全自动模式开启!", 'success')
                                    next(_this.allStart)
                                })
                            }
                            setTimeout(function () { _this.loading.obj.close() }, 2000)
    
                        },
                        error: function (e) {
                            _this.loading.obj.text = '题库异常!!!，或者没有填写答题吗！！！' //'题库异常！请在教程网站: https://ocs.enncy.cn     查找qq群，联系群主解决！！！'
                            _this.loading.obj.spinner = 'el-icon-error'
                            _this.loading.obj.customClass = 'load-error'
                            setTimeout(function () { _this.loading.obj.close() }, 10000)
                        }
                     });
                }
                
            },
            data() {
                return {
                    searchText:'',//题目搜索
                    searchQuestion: '', //搜索到的题目
                    searchAnswer:'',//搜索到的答案
                    
                    chatiId: chatiId, //查题码
                    allJob: _top.sk.allJob, //总任务点
                    cpi: '',
                    tabtags: this.getTabtags(), //超星界面上的顶部标签栏，不是刷课框的任务列表，
                    appShow: true, //组件显示

                    consoleArray: [{ str: '超星脚本运行中...', type: 'info' }], //控制台信息
                    visible: false,
                    activeName: ["10"], // 显示的折叠面板
                    fullscreenLoading: true, //遮罩层

                    tabSpan: '',
                    loading: { //遮罩层obj
                        obj: '',
                    }
                    ,
                    skPanel: {
                        title: '超星刷课脚本(最新版)',

                    },
                    
                    //从浏览器本地储存中 查看是否有历史记录，如果没有则用默认记录
                    setting:  this.getSetting(),
                    info: {
                        url: location.pathname,
                        nowChapterId: '',
                        passChapterId: new Set(),//做过的任务章节id
                        errorTopic: [], //做错的题目
                        filedJob: [],// 失败的任务点
                    },
                }
            },
            methods: {
                queryTiMu(){
              
                    $.ajax({
                        type: "get",
                        url: originUrl + "/chati/"+chatiId+"/0/"+this.searchText,
                        dataType: "json",
                        success: r=> {
                            if(r.answer.indexOf("抱歉找不到结果")==-1){
                                this.searchQuestion = r.question
                                this.searchAnswer = r.answer
                            }else{
                                this.searchAnswer = "抱歉找不到结果"
                            }
                           
    
                        },
                        error: e=> {
                           this.searchAnswer = "服务器错误"
                     }});
                    
                },
                getSetting(){
                    
                    let skeletonSetting = JSON.parse(localStorage.getItem("skeletonSetting"))
                    
                    let originSetting = {
                            dataVersion: dataVersion,
                            
                            media: {
                                autoPlay: true,//强制自动播放，不能暂停
                                playbackRate: 2,//播放速度
                                muted: true,//是否静音
                                network1: true, //公网1 ,false 为公网2
                            },
                            jobEnable: ["音频", "ppt", "书本", "文档", "章节测验", "视频"], // 开启的任务点 video视频 radio音频 work章节测验 ppt doc文档
                            work: {
                                passRate: 60, //通过率，搜索成功的几率超过就提交
                                totallCorrectRate: 0, //总搜索成功几率
                                queryCode: '',
    
                            },
                            
                            skType: '全自动',
                            alertDIsable: true, //禁止弹窗
                            dialogVisible: true, //教程显示
                            consoleShow: true, //日志显示
                            allDisplay: false,//全部隐藏

                        }
                    
                    //如果存在本地设置，并且本地设置的版本不等于设定版本，则更新 
                    if( skeletonSetting  && skeletonSetting.dataVersion !=  dataVersion){
                        console.log("更新设置")
                        return originSetting
                    }else if(skeletonSetting){
                        console.log("读取旧设置")
                        return skeletonSetting
                    }else{
                        console.log("读取新设置")
                        return originSetting
                    }
 
                },
                getTabtags() {
                    return $('.tabtags span')
                },
                nextTabPanel() {
                    //超星的下一个函数
                    var cur = $('h4.currents,h3.currents,h5.currents')
                    var all = $('.noJob,.jobCount,.blue,.lock').parent('h3,h4,h5')
                    if (cur[0].isSameNode(all.eq(all.length - 1)[0])) {
                        this.topMessage("已经是最后一个章节了！", "error")
                        this.log("已经是最后一个章节了！", "error")
                    } else {
                        this.log("下一节")
                        _top.PCount.next($('.tabtags span').length, this.getChapterId(), GetQueryString('courseId'), GetQueryString('clazzid'), '')
                    }
                },

                getChapterId() {
                    return document.getElementById("chapterIdid").value
                },
                reSearchIframe(allJob) {
                    if(allJob)_top.sk.allJob = allJob
                    this.allJob = _top.sk.allJob
                    let job = []
                    for (let i = 0; i < this.allJob.length; i++) {
                        //如果为复习模式，才添加学习过的任务
                        if (!this.allJob[i].finish || (this.setting.skType != "全自动" && this.allJob[i].finish)) {
                           if(this.allJob[i].type=="章节测验"){
                              if(!this.allJob[i].finish)job.push(this.allJob[i])//章节测验如果做完了，就不会再做
                          }else{
                              job.push(this.allJob[i])
                            }
                           console.log(this.allJob[i])
                        }
                    }
                    this.allJob = job
                    console.log('任务点')
                    console.log(this.allJob)
                    this.topMessage('获取任务点成功！此界面一共' + this.allJob.length + "个任务点。", "success")
                },
                allStart(event) {
                    console.log($(event))

                    if (event != undefined) {
                        event.target.disabled = true
                        event.target.title = "请等待任务完成"
                    } else if (this.allJob.length == 0) {
                        this.allCompelet()
                    } else {
                        let _this = this


                        this.topMessage('全部任务开始！一共' + this.allJob.length + "个任务点。", "success")
                        let allpass = true
                        let index = 0;
                        for (let i = 0; i < this.allJob.length; i++) {
                            if (!this.allJob[i].finish || (this.setting.skType != "全自动" && this.allJob[i].finish)) {//如果为复习模式，才添加学习过的任务
                                this.play(this.allJob[i], completeCallBack(this.allJob[i]))
                            }

                        }
                        function completeCallBack(job) {
                            job.start = true
                            console.log("任务：" + job.desc + ",开始")
                            return function (pass) {
                                console.log("任务：" + job.desc + ",完成")
                                job.finish = pass
                                job.start = false
                                if (!pass) {
                                    job.error = true
                                    _this.info.filedJob.push(job)
                                }
                                index++
                                if (!pass) allpass = false
                                if (index == _this.allJob.length) {
                                    _this.allCompelet()
                                }
                            }
                        }
                    }


                },
                allCompelet() {
                    this.log("此页任务完成，跳转下一页。")

                    next(this.nextTabPanel)
                },
                //开始自动刷课
                play(job, callback) {


                    if ($(job.document).find("video,audio").length != 0) {
                        //设置定时器，如果视频有问题，那么到时间了，照样可以下一个
                        $(job.document).find("video,audio")[0].oncanplay = function () {
                            setTimeout(() => {
                                if (job.start == true) callback(false)
                            }, $(job.document).find("video,audio")[0].duration * 1000)
                        }
                    } else {
                        setTimeout(() => {
                            if (job.start == true) callback(false)
                        }, 5 * 60 * 1000)
                    }
                    //检测是否做此任务

                    let doc = job.document
                    let jobType = job.type
                    job.start = true
                    if (this.setting.jobEnable.indexOf(jobType) == -1) {
                        console.log(event)
                        console.log("任务点未选择，即将跳过")
                        return;
                    }

                    this.log(jobType + "任务开始！", 'success')
                    //分配
                    if (jobType == "视频") {
                        this.MediaUtils(doc, this.getMedia(doc), this.setting.media, callback)
                    } else if (jobType == "音频") {
                        this.MediaUtils(doc, this.getMedia(doc), this.setting.media, callback)
                    } else if (jobType == "章节测验") {
                        // //如果设置不做章节测试
                        // if(setting && setting.doWork ==false){
                        //     this.topMessage('章节测试设置不做', "success")
                        // }else{
                        //     this.doWork(doc, callback)
                        // }
                        this.doWork(doc, callback)
                        
                    } else if (jobType == "ppt") {
                        this.doPdf(this.getPdfBtn(doc), callback)
                    } else if (jobType == "文档") {
                        this.doPdf(this.getPdfBtn(doc), callback)
                    } else if (jobType == "书本") {
                        this.doBook(this.getBook(doc), callback)
                    } else {
                        this.log("未知的任务点！", "error")
                    }


                },
                getMedia(doc) {
                    //视频和音频
                    console.log($(doc).find('video,audio.vjs-tech'))
                    return $(doc).find('video,audio.vjs-tech');
                },
                getWork(doc) {
                    return $(doc).find('iframe').contents().find('.CeYan');
                },
                getPpt(doc) {
                    return $(doc).find('.imglook');
                },
                getPdfBtn(doc) {
                    console.log("获取pdf按钮：",$(doc).find('.nextBtn'))
                    return $(doc).find('.nextBtn');
                },
                getBook(doc) {
                    return $(doc).contents().find('iframe')
                },
                MediaUtils(doc, medias, setting, callback) {
                    $(medias).each(function (i, e) {
                        let media = e
                        try {
                            let sinter = setInterval(() => {
                                media.muted = setting.muted; //静音
                                media.playbackRate = setting.playbackRate; //静音
                            }, 1000);
                            media.play()
                            //强制播放
                            media.addEventListener('pause', function () {
                                if (!media.ended) media.play()
                            })
                            media.addEventListener('error', function () {
                                console.log('error')
                                if (callback != undefined) callback(false)//this.jobError(doc)

                            })
                            media.addEventListener('ended', function () {
                                clearInterval(sinter)
                                console.log('ended')
                                console.log(setting)
                                if (callback != undefined) callback(true)//this.jobFinish(doc)
                            })
                        } catch (e) {
                            console.log(e)
                        }
                    })

                },
                doPdf(pdfBtn, callback) {
                    this.log("检测到pdf，开始翻阅", "info");
 
                    if (pdfBtn.css('visibility') == "visible") {
                        var inter = setInterval(() => {
     
                            pdfBtn.click();
                            if (pdfBtn.css('visibility') != "visible") {
                                if (callback != undefined) callback(true)
                                clearInterval(inter);
                            }
                        }, 500);
                    } else {
                        if (callback != undefined) callback(true)
                    }
                },
                doBook(doc, callback) {
                    console.log("开始阅读");

                    console.log(doc);
                    //检测阅读文档任务点
                    if (doc.length == 0 || doc.find('.Jimg').length == 0) {
                        console.log("阅读错误");
                        console.log(doc);
                        console.log(doc.find('.Jimg'));
                        if (callback != undefined) callback(false)
                        return
                    }

                    doc.scrollTop(0);//阅读回到顶部
                    var jimg = doc.find('.Jimg');
                    console.log(doc)
                    console.log(jimg)
                    var top = jimg.eq(jimg.length - 1).offset().top;

                    doc.animate(
                        { scrollTop: top + 1000 },
                        30000,
                        function () {
                            if (callback != undefined) callback(true)
                        });


                },
                doWork(workDocument, callback) {
                    let regexp = /===|---|#/;
                    let workInfos = []
                    let _this = this
                    $(workDocument).find('.TiMu').each(function (i, e) {
                        let now_ul = $(e).find('ul').eq(0);//选择题
                        let li = now_ul.find('li');
                        let test_textarea_p = now_ul.find('iframe').contents().find('p');//填空题
                        let textarea = now_ul.find('textarea').eq(0);


                        let type = '';
                        if (now_ul.hasClass('Zy_ulTop')) type = '选择题'
                        else if (now_ul.hasClass('Zy_ulTk')) type = '填空题'
                        else if (now_ul.hasClass('Zy_ulBottom')) type = '判断题'
                        else type = '未知题型'
                        let topic = $(e).find('.Zy_TItle').eq(0).text().replace(/\s+/g, "")
                        topic = topic.substring(topic.indexOf("】") + 1, topic.length)
                        let info = {
                            topicDoc: $(e).find('.Zy_TItle').eq(0),
                            topic: topic,
                            type: type,
                            options: now_ul.find('li'),
                            textarea: now_ul.find('textarea')
                        }
                        workInfos.push(info)

                    })
                    console.log(workInfos)
                    let answerInfo = {
                        isPass: false,
                        wrong: 0,
                        correct: 0,
                        allCount: workInfos.length
                    }
                    find(workInfos, 0, function () {
                        _this.topMessage("答题完成！！！", 'success')
                        console.log(answerInfo)
                        if (callback != undefined) callback(true)
                    })

                    function find(workInfos, index, callback) {


                        _this.log("正在回答第" + index + "题")
                        let workInfo = workInfos[index]
                        getAnswerAndQuestion(workInfo.topic, function (answer, question) {
                            try {
                                _this.log("问题："+answer+",答案"+question)
                                if (answer != undefined && question != undefined) {
                                    let li = workInfo.options
                                    let array = answer.split(regexp);
                                    let finish = false
                                    console.log("======自动答题======")
                                    console.log(question)
                                    console.log(answer)
                                    if(answer.indexOf('抱歉找不到结果')!=-1){
                                            answerInfo.wrong++
                                            workInfo.topicDoc.append('<div class="my-alert error">匹配到的问题：' + question + '<br/>回答：' + answer + '</div>')   
                                    }
                                    else if (workInfo.type == "选择题" || workInfo.type == "判断题") {
                                        var topics = new Array();
                                        for (let i = 0; i < li.length; i++) {
                                            if (li.eq(i).find('b').hasClass('ri')) {
                                                topics.push("对");
                                            } else if (li.eq(i).find('b').hasClass('wr')) {
                                                topics.push("错");
                                            }
                                            else {
                                                topics.push(li.eq(i).text().replace(/\s+/g, ""));
                                            }
                                        }
                                        var a = new AnswerUtil(question, array, topics);

                                        //a.getAnswer()获得匹配的选项的下标索引。
                                        var answers = a.getAnswer();
                                        console.log(answers)

                                        for (let i = 0; i < answers.length; i++) {
                                            li.eq(answers[i]).find('input').click();
                                            finish = true
                                        }
                                        if (finish) {
                                            answerInfo.correct++
                                            workInfo.topicDoc.append('<div class="my-alert success">匹配到的问题：' + question + '<br/>回答：' + answer + '</div>')
                                        } else {
                                            answerInfo.wrong++
                                            workInfo.topicDoc.append('<div class="my-alert error">匹配到的问题：' + question + '<br/>回答：' + answer + '</div>')
                                        }
                                    }

                                } else {
                                    answerInfo.wrong++
                                    workInfo.topicDoc.append('<div class="my-alert error">服务器错误，脚本错误，或者连接超时!</div>')
                                }
                            } catch (e) {
                                _this.topMessage("答题：" + (workInfo.topic.length > 10 ? workInfo.topic.substring(0, 10) + "..." : workInfo.topic) + ",时发生错误！，将跳过此题", "error")
                            } finally {
                                if (index >= workInfos.length - 1) {
                                    let rate = ((answerInfo.correct / answerInfo.allCount) * 100)
                                    if(_this.setting.skType!="手动"){
                                        if (rate > _this.setting.work.passRate) {
                                            _this.log("答题完成，搜索成功率:" + rate + "%，正在自动提交")
                                            next(() => {
                                                console.log($(workDocument).find('div.ZY_sub.clearfix').find('a.Btn_blue_1.marleft10'))
                                                $(workDocument).find('div.ZY_sub.clearfix').find('a.Btn_blue_1.marleft10').click()
                                                next(() => {
                                                    $(workDocument).find(".AlertCon02").find('a.bluebtn').click();
                                                    if (callback != undefined) callback(true)
                                                },10000)
                                            })
                                        } else {
                                            _this.log("答题完成，搜索成功率:" + rate + "%，正在保存答案")
                                            next(() => {
                                                $(workDocument).find('div.ZY_sub.clearfix').find('a.btnGray_1').click()
                                                if (callback != undefined) callback(true)
                                            },10000)
                                        }
                                    }else{
                                        _this.topMessage("答题完成，请手动操作","success")
                                    }
                                    
                                } else {
                                    next(()=>{
                                        find(workInfos, ++index, callback)
                                    })
                                }
                            }
                        })
                    }
                    //获取搜索到的匹配题目，和匹配题目的回答，传入callback
                    function getAnswerAndQuestion(question, callback) {
                         
                        $.ajax({
                            type: "get",
                            url: originUrl + "/chati/"+chatiId+"/" + GetQueryString('courseId') + "/" + encodeURI(question),
                            timeout: 3 * 60 * 1000,
                            dataType: "json",
                            success: function (r) {
                                try{
                                    console.log(r)
                                   let json = r
                                   let answer = json.answer;
                                   let q = json.question;
                                   callback(answer, q)
                                }catch(e){
                                    _this.topMessage("脚本出错！！！", "error")
                                    callback()
                                }
                            },
                            complete: function (xhr, status) { //请求完成后最终执行参数
                                if (status == 'timeout') {//超时,status还有success,error等值的情况
                                    _this.topMessage("连接超时！！！", "error")
                                    callback()
                                } else if (status == 'error') {
                                    _this.topMessage("服务器错误！！！", "error")
                                    callback()
                                }
                            }
                        });
                    }
                } 
                ,
                jobError(doc) {
                    this.topMessage("脚本错误！！！", 'error')
                },
                handleChange(value) {
                    console.log(value);
                },
                openFullScreen() {
                    const load = this.$loading({
                        lock: true,
                        text: '正在检测题库服务器状态...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)',
                        customClass: '',
                    });
                    this.loading.obj = load

                },
                messageBox(title,content,type) {
                    this.$alert(content, title, {
                        confirmButtonText: '确定',
                        dangerouslyUseHTMLString: true,
                        type: type,
                    });
                },
                topMessage(message, type) {
                    this.$message({
                        message: message,
                        type: type
                    });
                },
                personSetting() {
                    console.log("保存数据：")
                    console.log(this.setting)
                    localStorage.setItem("skeletonSetting", JSON.stringify(this.setting))
                    this.topMessage("保存成功", "success")
                },
                enter(event) {
                    let card = $(event.target).find('.card-content').eq(0)
                    card.show()
                    card.animate({ opacity: 1 }, 100, function () {

                    })
                },
                leave(event) {
                    let card = $(event.target).find('.card-content').eq(0)

                    card.animate({ opacity: 0 }, 200, function () {
                        card.hide()
                    })
                },
                log(str, type) {

                    let msg = {
                        str: str,
                        type: type == undefined ? 'info' : type
                    }

                    if (this.consoleArray.length > 50) {
                        this.consoleArray.shift()
                    }
                    this.consoleArray.push(msg)
                },
            }
        });
    }
    function next(fn, time) {
        setTimeout(() => {
            fn()
        }, time == undefined ? 3000 : time);
    }

    function registerComponents() {
    }
    //获取url参数
    function GetQueryString(name, url) {

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = url != undefined ? (url.substring(url.indexOf("?") + 1, url.length)).match(reg) : window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    function Ocs(unsafeWindow) {
    return {
        //获取url参数
        top: unsafeWindow.top,
        GetQueryString(name, url) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = url != undefined ? (url.substring(url.indexOf("?") + 1, url.length)).match(reg) : window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        has(url, str) {
            return url.indexOf(str) != -1
        },
        getType(url) {
            let t = ''
            if (this.has(url, '/ananas/modules/video')) t = "视频"
            else if (this.has(url, '/ananas/modules/audio')) t = "音频"
            else if (this.has(url, '/ananas/modules/work')) t = "章节测验"
            else if (this.has(url, '/ananas/modules/ppt')) t = "ppt"
            else if (this.has(url, '/ananas/modules/pdf')) t = "文档"
            else if (this.has(url, '/ananas/modules/innerbook/')) t = "书本"
            return t;
        },
        //获取当前界面的所有任务点，包括已完成的
        getIframeJob(iframe) {
            let alljob = []
            let _this = this
            findJob(iframe)
            function findJob(iframe) {
                if (iframe != undefined) {
                    $(iframe).each(function (i, e) {
                        try {
                            //判断是否完成
                            let finish = $(e).parent('div').hasClass('ans-job-finished') != 0
                            //判断是否是任务点
                            if ($(e).parent('div').find('.ans-job-icon').length != 0) {
                                let type = _this.getType($(e).contents()[0].URL)
                                let job = {
                                    finish: finish,
                                    start: false,
                                    error: false,
                                    document: (type == '章节测验' || type == '书本') ? $(e).contents().find('iframe').contents()[0] : $(e).contents()[0],
                                    type: type,
                                    url: $(e).contents()[0].URL,
                                    desc: $(e).parent('div').text().replace(/\s+/g, ""),
                                    chapter: $('.currents a').not('span').text().replace(/\s+/g, "")
                                }
                                if (type != '') {
                                    alljob.push(job)
                                }
                            }
                            if ($(e).contents().find('iframe').length != 0) {
                                findJob($(e).contents().find('iframe'))
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    })
                }
            }
            return alljob
        },
        //界面变化监听函数
        CxPageLisenner(pageChange) {
            let _this = this

            //开启监听，重写超星的2个跳转函数，
            this.lisenner(function (num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                hasChang(num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction)
            })

            //劫持函数，监听界面变化，并判断界面加载完成
            let change = this.top.changeDisplayContent
            this.top.changeDisplayContent = function (num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                change(num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction)
            }
            //这个是右侧栏的点击监听事件的劫持
            let getTeacherAjax = this.top.getTeacherAjax
            this.top.getTeacherAjax = function (courseId, clazzid, chapterId, cpi, chapterVerCode) {
                hasChang('', '', chapterId, courseId, clazzid, '', 'sidebar')
                getTeacherAjax(courseId, clazzid, chapterId, cpi, chapterVerCode)
            }
            function hasChang(num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                let pageInfo = {
                    num: num,
                    totalnum: totalnum,
                    chapterId: chapterId,
                    courseId: courseId,
                    clazzid: clazzid,
                    knowledgestr: knowledgestr,
                    direction: direction,
                    cpi: _this.GetQueryString("cpi", $('iframe').eq(0).attr('src'))
                }
                let page = {
                    pageInfo: pageInfo,
                    pageName: $('h1').text(),
                    pageJob: [],
                }

                if (pageChange) {
                    console.log('change')
                    setTimeout(() => {
                        pageInfo.num = num
                        pageInfo.totalnum = totalnum
                        pageInfo.chapterId = chapterId
                        pageInfo.courseId = courseId
                        pageInfo.clazzid = clazzid
                        pageInfo.knowledgestr = knowledgestr
                        pageInfo.direction = direction
                        page.pageJob = _this.getIframeJob(_this.top.$('iframe'))
                        pageChange(page)
                    },10000)
                }
            }


        },
        lisenner(pageChange) {
            //重写超星函数
            let _this = this
            this.top.changeDisplayContent = function (num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                num = parseInt(num);
                totalnum = parseInt(totalnum);
                _this.top.PCount.setIndex(num);
                for (var i = 1; i <= totalnum; i++) {
                    var titledoc = document.getElementById("dct" + i);
                    var leftdoc = document.getElementById("left" + i);
                    var rightdoc = document.getElementById("right" + i);
                    if (i == num) {
                        titledoc.className = "c" + i + " currents";
                        leftdoc.style.display = "block";
                        rightdoc.style.display = "block";
                        num = num - 1;

                        console.log(_this.GetQueryString("cpi", $('iframe').eq(0).attr('src')))
                        document.getElementById("iframe").src = "/knowledge/cards?clazzid=" + clazzid + "&courseid=" + courseId + "&knowledgeid=" + chapterId + "&num=" + num + "&ut=s&cpi=" + _this.GetQueryString("cpi", $('iframe').eq(0).attr('src')) + "&v=20160407-1";
                        //监听界面加载完成
                        document.getElementById("iframe").onload = function () {
                            next(()=>{
                                if (pageChange) pageChange(num, totalnum, chapterId, courseId, clazzid, knowledgestr, 'tabtags')
                            })
                         
                        }
                        var el = $('#iframe');
                        unsafeWindow.ed_reinitIframe = function ed_reinitIframe() {
                            var iframe = el[0];

                            try {
                                var bHeight = iframe.contentWindow.document.body.scrollHeight;
                                var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                                var height = Math.max(bHeight, dHeight);
                                el.attr('height', height);
                            } catch (ex) { }
                        }
                        //var openlockdiv=document.getElementById("openlock");
                        if ($("#openlock").length > 0) {
                            if (num + 1 == totalnum) {
                                setTimeout('openlockshow();', 2000);
                            } else {
                                document.getElementById("openlock").style.display = "none";
                            }
                        }
                        unsafeWindow.setInterval("ed_reinitIframe()", 200);
                        //jobflagOperation();
                    } else {
                        titledoc.className = "c" + i;
                        leftdoc.style.display = "none";
                        rightdoc.style.display = "none";
                    }
                }
                if (typeof (MoocPlayers) != 'undefined') {
                    _this.top.MoocPlayers.clearMids();
                }
            }
            this.top.PCount = (function () {
                var cur = 1, inner = _this.top.changeDisplayContent;

                return {
                    setIndex: function (index) {
                        cur = index;
                    },
                    next: function (count, chapterId, courseId, clazzid, knowledgestr) {
                        cur = parseInt(cur);
                        count = parseInt(count);
                        if (cur >= count) {
                            document.getElementById("mainid").innerHTML = "<div style=\"width:32px;height:32px;margin:0 auto;padding:300px 0\"><img src=\"/images/courselist/loading.gif\" /></div>"
                            cur = 1;
                            $.post("/mycourse/changeCapter",
                                {
                                    courseId: courseId
                                    , clazzid: clazzid
                                    , chapterId: chapterId
                                    , knowledgestr: knowledgestr
                                    , type: 1
                                    , date: new Date()
                                },
                                function (data) {
                                    //alert(20160407);
                                    data = data.replace(/(^\s*)|(\s*$)/g, "");
                                    var doc = document.getElementById("mainid");
                                    $(doc).html(data);
                                    chapterId = document.getElementById("chapterIdid").value;
                                    $(".ncells h4").removeClass();
                                    $(".ncells h5").removeClass();
                                    $("#cur" + chapterId).addClass("currents");
                                    $(".ncells .flush").css('display', 'none');
                                    $("#cur" + chapterId).parent().parent().find(".flush").css('display', 'block');
                                    var el = $('#iframe');

                                    unsafeWindow.ed_reinitIframe = function ed_reinitIframe() {
                                        var iframe = el[0];

                                        try {
                                            var bHeight = iframe.contentWindow.document.body.scrollHeight;
                                            var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                                            var height = Math.max(bHeight, dHeight);
                                            el.attr('height', height);
                                        } catch (ex) {
                                        }
                                    }
                                    // var openlockdiv=document.getElementById("openlock");
                                    if ($("#openlock").length > 0) {
                                        var count = document.getElementById("cardcount").value;
                                        if (count == 1) {
                                            setTimeout('openlockshow();', 2000);
                                        }
                                    }

                                    if ($("#cur" + chapterId + " .orange01").length > 0) {

                                        $.ajax({
                                            type: "get",
                                            url: "/edit/validatejobcount",
                                            data: {
                                                courseId: courseId
                                                , clazzid: clazzid
                                                , nodeid: chapterId
                                            },
                                        });
                                    }

                                    unsafeWindow.setInterval("ed_reinitIframe()", 200);
                                    //jobflagOperation();
                                    _this.top.getClazzNote();
                                }
                            );
                            //监听回调，这里表示新的章节
                            if (pageChange) pageChange(cur, count, chapterId, courseId, clazzid, knowledgestr, "new")
                        } else {
                            cur++;
                            //监听回调，这里是下一个界面
                            inner(cur, count, chapterId, courseId, clazzid, knowledgestr, "next");

                        }
                        scroll(0, 0);
                    },
                    previous: function (count, chapterId, courseId, clazzid, knowledgestr) {
                        cur = parseInt(cur);
                        count = parseInt(count);
                        if (cur <= 1) {
                            document.getElementById("mainid").innerHTML = "<div style=\"width:32px;height:32px;margin:0 auto;padding:300px 0\"><img src=\"/images/courselist/loading.gif\" /></div>"
                            cur = 1;
                            $.post("/mycourse/changeCapter",
                                {
                                    courseId: courseId
                                    , clazzid: clazzid
                                    , chapterId: chapterId
                                    , knowledgestr: knowledgestr
                                    , type: 0
                                    , date: new Date()
                                },
                                function (data) {
                                    data = data.replace(/(^\s*)|(\s*$)/g, "");
                                    var doc = document.getElementById("mainid");
                                    $(doc).html(data);
                                    chapterId = document.getElementById("chapterIdid").value;
                                    $(".ncells h4").removeClass();
                                    $(".ncells h5").removeClass();
                                    $("#cur" + chapterId).addClass("currents");
                                    $(".ncells .flush").css('display', 'none');
                                    $("#cur" + chapterId).parent().parent().find(".flush").css('display', 'block')
                                    var el = $('#iframe');

                                    unsafeWindow.ed_reinitIframe = function ed_reinitIframe() {
                                        var iframe = el[0];

                                        try {
                                            var bHeight = iframe.contentWindow.document.body.scrollHeight;
                                            var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                                            var height = Math.max(bHeight, dHeight);
                                            el.attr('height', height);
                                        } catch (ex) {
                                        }
                                    }
                                    // var openlockdiv=document.getElementById("openlock");
                                    if ($("#openlock").length > 0) {
                                        var count = document.getElementById("cardcount").value;
                                        if (count == 1) {
                                            setTimeout('openlockshow();', 2000);
                                        }
                                    }

                                    if ($("#cur" + chapterId + " .orange01").length > 0) {

                                        $.ajax({
                                            type: "get",
                                            url: "/edit/validatejobcount",
                                            data: {
                                                courseId: courseId
                                                , clazzid: clazzid
                                                , nodeid: chapterId
                                            },
                                        });
                                    }

                                    unsafeWindow.setInterval("ed_reinitIframe()", 200);
                                    //jobflagOperation();
                                    _this.top.getClazzNote();
                                }
                            );
                            //监听回调，这里表示旧的章节
                            if (pageChange) pageChange(cur, count, chapterId, courseId, clazzid, knowledgestr, "old")
                        } else if (cur > 0) {
                            cur--;
                            //监听回调，这里是上一个界面
                            inner(cur, count, chapterId, courseId, clazzid, knowledgestr, "previous");
                        }
                        scroll(0, 0);
                    }
                }
            })();

        }

    }
}
}
 
