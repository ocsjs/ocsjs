// 下面部分代码借用 wyn665817 大佬的 “强制使用H5播放器” 的功能，在此感谢大佬的付出，前人栽树后人乘凉。

function useh5video(unsafeWindow) {

    // 下面部分代码借用 wyn665817 大佬的 “强制使用H5播放器” 的功能，在此感谢大佬的付出，前人栽树后人乘凉。

    // 下面这里22-34行的设置是没有用的，请不要乱更改！！！！！
    // 设置修改后，需要刷新或重新打开网课页面才会生效
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
        checkPlayer(_self.supportH5Video());
    }


}
   //以上都是 wyn大佬的——强制h5播放器代码，解决了flash视频的播放问题，在此致谢。