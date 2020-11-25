


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

            //开启监听
            this.lisenner(function (num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                hasChang(num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction)
            })

            //劫持函数，监听界面变化，并判断界面加载完成
            let change = this.top.changeDisplayContent
            this.top.changeDisplayContent = function (num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction) {
                change(num, totalnum, chapterId, courseId, clazzid, knowledgestr, direction)
            }
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
                    }, 3000)
                }
            }


        },
        //下一个界面
        next(pageInfo) {
            let cur = $('h4.currents,h3.currents,h5.currents')
            let all = $('.noJob,.jobCount,.blue,.lock').parent('h3,h4,h5')
            if (cur[0].isSameNode(all.eq(all.length - 1)[0])) {
                return false
            } else {
                this.top.PCount.next($('.tabtags span').length, pageInfo.chapterId, pageInfo.courseId, pageInfo.clazzid, '')
                return true
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
                            if (pageChange) pageChange(num, totalnum, chapterId, courseId, clazzid, knowledgestr, 'tabtags')
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
