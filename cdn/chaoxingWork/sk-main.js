function startChaoxingWorkSk(chatiId,unsafeWindow) {
    console.log("超星作业，考试脚本开启")
    
    var $ = unsafeWindow.jQuery;
    
    $.getScript("https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/chaoxing/AnswerUtil-1.0.0.js?_="+new Date().getTime(),function(r,s){
        console.log(s)

    });
 

    var version = '1.4.0';
    var last_set_time = '2020/11/25';

     

    //示例
    // var chatiId = '123456' //123456就是你的查题码

    var originUrl = 'https://wk.klweb.top';

    var exam_ready_time = 2;//考试的时候，会停止左边你设置的秒数（默认暂停2秒），然后再搜索题目，答题。
    var exam_response_time = 5;//考试的题目间隔时间5秒一题。
    var error_response_time = 30;//答题时出错了，20秒的自己答题时间。
    var auto_submit = 0; //如果为 0，则表示考试不提交，如果为 1，则表示考试全自动交卷，并提交试卷。



    (function () {
        var regexp = /===|---|#/;
        var special_characters = /[^\u4e00-\u9fa5a-zA-Z0-9]/g;
        var ABCD = /(A|B|C|D|E|F|G|H|I|J)/;
        var singal = /((A|B|C|D|E|F|G|H|I|J)|。$)/g;

        
        
        

        //所有的题目
        var questions = $('.Zy_TItle div');
        //所有的题目下面的选择题的ul元素
        var all_ul = $('.TiMu ul');
        //题目的索引
        var index = 0;
        //没有选择的数量
        var no_click = 0;

        $('input').css('width', '15px');

        //获取url参数
        function GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }

        //=================================================================作业界面的查找答案=================================================================
        function findAnswer() {

            let question = questions.eq(index).text().substring(questions.eq(index).text().indexOf('】') + 1).substring(0, questions.eq(index).text().length - 4).replace(/\s+/g, "");
            let courseId = GetQueryString('courseId') == null ? 0 : GetQueryString('courseId');
            let url = (originUrl + "/chati/" + chatiId + "/" + courseId + "/" + encodeURI(question));
            mylog(url);
            
           
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                success: function (r) {
                    try {
                        console.log(r)
                        var json = r;
                        var answer = json.answer.replace(/\s+/g, "");
                        var json_question = json.question.replace(/\s+/g, "");
                        var array = answer.split(regexp);
                        //==============================================初始化数据==============================================
                        var li = all_ul.eq(index).find('li');//选项
                        var test_textarea_p = all_ul.eq(index).find('iframe').contents().find('p');//填空题
                        var textarea = all_ul.eq(index).find("textarea");
                        let isclick = 0;

                        if (answer.indexOf('抱歉找不到结果') != -1) {
                            questions.eq(index).append('<p class="mysk"  style="background-color:rgb(255, 92, 92, 0.4)">【问题】：无<br>【回答】：抱歉找不到结果</p>');
                            if (index++ < questions.length - 1) setTimeout(findAnswer, 3000);
                            else $('#none').css('display', 'block');
                            return;
                        }
                        questions.eq(index).append('<p  class="mysk"  style="background-color:rgb(69, 204, 98,0.2)">【问题】：' + json_question.substring(json_question.indexOf('】') + 1) + '。</p>');
                        questions.eq(index).append('<p  class="mysk"  style="background-color:rgb(69, 204, 98, 0.2)">【回答】：' + answer + '。</p>');

                        //=====================================================================================================
                        if (li.length != 0) {

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
                            console.log(question);
                            console.log(array);
                            console.log(topics);
                            console.log(answers);
                            for (let i = 0; i < answers.length; i++) {
                                li.eq(answers[i]).find('input').click();
                                if (isclick != 1) isclick = 1;
                            }
                        }
                        //=============================================填空题==============================================
                        if (test_textarea_p.length != 0) {
                            if (array != null && array.length > 1) {
                                mylog("多个填空题填空完成");
                                isclick = find_Mfill_answer(array, textarea, test_textarea_p, isclick);
                            }
                            else {
                                mylog("单项填空题填空完成");
                                test_textarea_p.eq(0).text(array[0]);
                                textarea.eq(0).text(array[0]);
                                textarea.eq(0).val(array[0]);
                                isclick = 1;
                            }
                        }



                        if (isclick == 0) {
                            questions.eq(index).append('<p  class="mysk"  style="background-color:rgb(255, 92, 92, 0.4)">没有符合回答的答案，请自行选择</p>');
                            no_click++;
                        }
                        mylog(index + "|" + answer + "|是否作答:" + (isclick == 1));
                        drawDiv(questions.eq(index), index, isclick);
                        if (index++ < questions.length - 1) setTimeout(findAnswer, 3000);//下一个
                        else {
                            $('#none').css('display', 'block');
                            $('#myresult').text("共" + questions.length + "道题目，错" + no_click + "道题，正确率" + (100 - (no_click / questions.length) * 100).toFixed(2) + "%");
                        }
                    } catch (e) {
                        mylog(e);
                        var confirm1 = confirm("未知的错误，点击确定跳过次题，点击取消暂停");
                        if (confirm1 == true) {
                            if (index++ < questions.length - 1) setTimeout(findAnswer, 3000);//下一个
                            else {
                                $('#none').css('display', 'block');
                                $('#myresult').text("共" + questions.length + "道题目，错" + no_click + "道题，正确率" + (100 - (no_click / questions.length) * 100).toFixed(2) + "%");
                            }
                        }
                    }
                },
                error: function(err){
                    alert("服务器错误!!!，请耐心等待，可能是服务器正在维护，过一天再重新使用脚本即可，请不要加q问我什么的，这服务器不是问我就能好的QAQ");
                    mylog("服务器错误" + err);
                }
            });
 
        }

        //填充多项填空题的答案
        function find_Mfill_answer(array, textarea, test_textarea_p) {
            if (array.length == 0 || array.length > test_textarea_p.length) return;
            for (let i = 0; i < test_textarea_p.length; i++) {
                test_textarea_p.eq(i).text(array[i]);
                textarea.eq(i).text(array[i]);
                textarea.eq(i).val(array[i]);
            }
            return 1;

        }

        //绘制回答对错的框
        function drawDiv(questions, index, isclick) {
            questions.attr("id", "topic" + index);

            var topic_div = $("<a href='#topic" + index + "'>" + (index + 1) + ((index + 1) >= 10 ? "" : " ") + "." + ((index + 1) >= 10 ? "" : " ") + "<span style='font-weight:bold'>" + (isclick == 1 ? "√" : "×") + "</span></a>");
            var divcss = {
                float: "left",
                color: (isclick == 1 ? "green" : "red"),
                padding: "5px",
                border: "1px solid",
                margin: " 5px"
            };
            topic_div.css(divcss);
            $('#content').append(topic_div);

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
            $('head').append('<link href="https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/chaoxing/main.css?t=' + new Date().getTime() + '" rel="stylesheet" type="text/css" />');
            
            $.ajax({
                type: "get",
                url:'https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/chaoxing/main.css?t=' + new Date().getTime(),
                success: function (r) {
                    
                    console.log(r);
                    var style = $('<style></style>');
                    style.html(r);
                    $('head').append(style);
                }
            });
                        
 
            //下面是标签拼接
            $("body").append("<div id='skdiv' class='zydiv'></div>");
            var maindiv = $("<div id='skMainDiv'></div>");
            $('#skdiv').append(maindiv);
            $("#skMainDiv").html("\
<p>\
<span style='font-weight:bold;    font-size: large;'>超星作业，考试自动答题脚本 </span><span style='font-weight:bold;'> v"+ version + "</span><button id='skmaindiv-btn'>▲</button><br/>\
<p>\
<p>最后更新时间："+ last_set_time + "</p><br>\
有任何问题可以在群里艾特我进行反馈：<a style='color:blue;font-weight:blod;' href='https://shang.qq.com/wpa/qunwpa?idkey=2be1ed62e97e0d0ea236713d9fb82bfb493f6905156734c15e57d36699ccdf2e'>点击加入脚本交流群</a>\
\
<div id='content' style='   border-top: 2px solid;'></div>");
            $('#content').html("\
<b>点击下面任意框框，跳转到相应题目</b><br>\
<b id='none' style='display:none'>题目作答完毕！！！</b>\
<b id='myresult'></b>\
<div>\
</div>"
            );
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

        function mylog(str) {

            console.log(str);
        }

        //==================================================================考试界面的查找答案=================================================================
        function find_examAnswer() {



            let special_characters = /[^\u4e00-\u9fa5a-zA-Z0-9]/g;
            let ABCD = /(A|B|C|D|E|F|G|H|I|J|K)、/;
            let test_line_regexp = /(A|B|C|D|E|F|G|H|I|J|K)/g;
            let singal = /((A|B|C|D|E|F|G|H|I|J)|。$)/g; //如果答案直接给出ABCD...
            let M_topic_regexp = /\(\d+\)[\u4e00-\u9fa5]+/g;//多选题的正则表达式
            let imgurl = /[a-zA-Z0-9]*\.(png|jpg)/g;


            let title_regexp = /(（.*分）|\s|(\(|\)。))/g;
            let li_regexp = /(A|B|C|D|E|F|G|H|I|J|K)/;

            let topic_title = $('.Cy_TItle.clearfix .clearfix').text().replace(title_regexp, "");
            let all_topic = $('.leftCardChild a');

            let index = 0;

            let notfind_num = 0;
            var topic = $('.Cy_TItle.clearfix .clearfix');

            let courseId = GetQueryString('courseId') == null ? 0 : GetQueryString('courseId');
            
            let url = originUrl + "/chati/" + chatiId + "/" + courseId + "/" + encodeURI(topic_title)
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                success: function (r) {
                    //延时
                    setTimeout(function () {
                        try {
                            mylog("搜索成功");
                            console.log(r)
                            var json = r;
                            var answer = json.answer.replace(/\s+/g, "");
                            var json_question = json.question.replace(/\s+/g, "");
                            let isclick = 0;
                            var array = answer.split(regexp);
                            let li = $('#submitTest ul').eq(0).find("li");
                            var test_textarea_p = $('iframe').contents().find('p');//填空题，暂时不提供
                            var textarea = $('textarea');
                            //连线题
                            var test_line = $('');//$('ul').eq(0).siblings('ul.ulTop.thirdUlList').find('select'); //连线题，暂时不提供

                            console.log(li);
                            console.log(array);

                            if (answer.indexOf('抱歉找不到结果') != -1) {
                                notfind_num++;
                                topic.append('<p  class="mysk"  style="background-color:rgb(255, 92, 92, 0.4)">【问题】：无<br>【回答】：抱歉找不到结果,将在' + error_response_time + '秒后继续下一个答题</p>');
                                //填充答案
                                //fill_answer(li, test_textarea_p, test_line);
                                setTimeout(function () {
                                    if ($('.saveYl01').text() == "下一题") auto_submit == 1 ? $('.fr.saveYl').click() : alert("考试已经完成");
                                    else setTimeout(function () { index++; getTheNextQuestion(1) }, 1000 * exam_response_time);//下一个
                                }, error_response_time * 1000);
                                return;
                            }

                            topic.append('<p  class="mysk"  style="background-color:rgb(69, 204, 98,0.2)">【问题】：' + json_question.substring(json_question.indexOf('】') + 1).replace(/\s+/g, "") + '。</p>');

                            if (answer.match(/http.*(png|jpg)/g) != null) topic.append('<p  class="mysk"  style="background-color:rgb(69, 204, 98, 0.2)">【回答】：<img src=' + answer.match(/http.*(png|jpg)/g)[0] + '></p>');
                            else topic.append('<p  class="mysk"  style="background-color:rgb(69, 204, 98, 0.2)">【回答】：' + answer + '。</p>');

                            //==============================================如果是填空题============================================
                            if (test_textarea_p.length != 0) {
                                mylog("填空题");
                                if (array != null && array.length > 1) {
                                    mylog("多个填空题填空完成");
                                    find_Mfill_answer(array, textarea, test_textarea_p, isclick);
                                    isclick = 1;
                                }
                                else if (array != null && array.length == 1) {
                                    mylog("单项填空题填空完成");
                                    test_textarea_p.eq(0).text(array[0]);
                                    textarea.eq(0).text(array[0]);
                                    textarea.eq(0).val(array[0]);
                                    isclick = 1;
                                }
                                else {
                                    topic.append('<p style="background-color:rgb(255, 92, 92, 0.4)">发生了未知的错误,将在' + error_response_time + '秒后继续下一个答题</p>');
                                    mylog("发生了未知的错误,请耐心等待，可能是服务器正在维护，过一天再重新使用脚本即可，请不要加q问我什么的，这服务器不是问我就能好的QAQ", 'error');
                                }
                            }
                            //==============================================选择题==============================================
                            else if (li.length != 0) {

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
                                var a = new AnswerUtil(topic_title, array, topics);

                                //a.getAnswer()获得匹配的选项的下标索引。
                                var answers = a.getAnswer();
                                console.log(topic_title);
                                console.log(array);
                                console.log(topics);
                                console.log(answers);


                                for (let i = 0; i < answers.length; i++) {
                                    //如果存在选项，并且选项的input 未选中
                                    if (li.eq(answers[i]).find('input').length != 0 && li.eq(answers[i]).find('input').attr('checked') == undefined) {
                                        li.eq(answers[i]).find('input').click();
                                        if (isclick != 1) isclick = 1;
                                    }
                                    //如果存在选项，并且未选择
                                    else if (!li.eq(answers[i]).hasClass('Hover')) {
                                        li.eq(answers[i]).click();
                                        if (isclick != 1) isclick = 1;
                                    }
                                }
 
                            }
                            if (isclick == 0) {
                                topic.append('<p  class="mysk"  style="background-color:rgb(255, 92, 92, 0.4)">没有符合回答的答案，请自行选择,将在' + error_response_time + '秒后继续下一个答题</p>');
                                //填充答案
                                //fill_answer(li, test_textarea_p, test_line);
                                setTimeout(function () {
                                    if ($('.saveYl01').text() == "下一题") auto_submit == 1 ? $('.fr.saveYl').click() : console.log("考试已经完成");
                                    else setTimeout(function () { index++; getTheNextQuestion(1) }, 1000 * exam_response_time);//下一个
                                }, error_response_time * 1000);
                            } else {
                                
                                if ($('.saveYl01').text() == "下一题") auto_submit == 1 ? $('.fr.saveYl').click() : console.log("考试已经完成");
                                else setTimeout(function () { index++; getTheNextQuestion(1) }, 1000 * exam_response_time);//下一个
                            }
                        } catch (e) {
                            mylog("未知的错误");
                            console.log(e);
                        }
                    }, exam_ready_time * 1000);
                },
                error: function (err) {
                    topic.append('<p  class="mysk"  style="background-color:rgb(255, 92, 92, 0.4)">服务器错误!!!，请耐心等待，可能是服务器正在维护，过一会再重新使用脚本即可，请不要加q问我什么的，这服务器不是问我就能好的QAQ</p>');
                    //alert("服务器错误!!!，请耐心等待，可能是服务器正在维护，过一会再重新使用脚本即可，请不要加q问我什么的，这服务器不是问我就能好的QAQ");
                }
            });
            
            
 

            //点击左边栏的题目
            function draw_question(index, isclick) {
                if (isclick == 0) all_topic.eq(index).css("background", "red");
                else all_topic.eq(index).css("background", "#86b430");
            }


            //填充答案
            function fill_answer(li, test_textarea_p, test_line) {
                if (li.length != 0) {
                    if (!li.eq(0).hasClass("Hover")) li.eq(0).click();
                }
                if (test_textarea_p.length != 0) {
                    var random = String(new Date().getTime()).substr(-1);
                    //10个里面找一个随机填写，要改自己改吧
                    var random_array = ["不知道", "不清楚", "不懂", "不会啊", "不会写", "不懂怎么写啊", "太难了，不会", "不会", "我不懂", "不晓得"];
                    test_textarea_p.eq(0).text(random_array[random]);
                }
            }


        }

        if (self == top && window.location.href.indexOf("/work/doHomeWorkNew") != -1) {
            if (chatiId == '') {
                confirm("- 检测到你未设置查题码，请关注微信小程序：“网课答” 获取查题码 \n- 然后打开脚本管理页面，打开“超星作业，考试自动答题脚本” \n- 编辑里面的第20行代码，填写查题码上去 ，\n- 最后回到当前界面刷新即可");
            } else {
                findAnswer();
                drawWindow();
                console.log("开始答题");
            }


        }

        if (self == top && window.location.href.indexOf("/exam/test/reVersionPaperPreview") != -1) {

            if (auto_submit == 1) setTimeout(function () { confirmSubTest(); }, 3000);//直接提交
        }
        if (window.location.href.indexOf("/test/reVersionTestStartNew") != -1) {
            if (chatiId == '') {
                confirm("- 检测到你未设置查题码，请关注微信小程序：“网课答” 获取查题码 \n- 然后打开脚本管理页面，打开“超星作业，考试自动答题脚本” \n- 编辑里面的第20行代码，填写查题码上去 ，\n- 最后回到当前界面刷新即可");
            } else {
                find_examAnswer();
                console.log("开始答题");
            }

        }


    })();

}