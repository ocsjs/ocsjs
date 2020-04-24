 /*
超星学习通刷课脚本
作者：LDS-Skeleton（github）
版本：1.0.1
功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题
*/

var jobCount = document.getElementsByClassName('jobCount');//未完成的课程数组，任务点

var cp = "";//这一章
var np = "";//下一章
var timeout = 0;//如果播放视频超时，或者没有视频，则跳过这一章节
var isplay = true;//是否播放
var play_type = 0;//用来识别是第一次点击播放，还是第n次点击播放，用来做适配

//设置变量的json，可以自己在控制台设置改变

var set = {
	rate: 1,//播放速度
	response_time: 3000,//事件之间的相应时间，三秒
	response_time_fast: 1000,//事件之间的相应时间，三秒
	//下面多视频播放值：
	video_length: 0,//视频数量
	now_page_video_index: 0,//当有多个视频的时候，当前视频的索引
	set_video_index: 0//自己可以设置的自定义视频索引
}

//各种url的json
var url = {
	//超星url
	chaoxing: 'chaoxing.com',
	studentcourse: 'https://mooc1-1.chaoxing.com/mycourse/studentcourse',
	studentstudy: 'https://mooc1-1.chaoxing.com/mycourse/studentstudy',
	index: 'http://i.mooc.chaoxing.com/space/index',
	login: 'https://passport2.chaoxing.com/login?loginType=3&newversion=true&fid=-1',
}



//============================================判断当前浏览器能否运行次脚本============================================
function main_tocheck_browser() { 
	
	var explorer =navigator.userAgent;

	if (explorer.indexOf("Firefox") == -1 && explorer.indexOf("chrome") == -1 && explorer.indexOf("Chrome") == -1) {
        setInterval(() => {
			mylog('\n超星脚本对当前浏览器不兼容！\n如果运行可能产生不可预知的后果！\n请更换浏览器，目前支持的浏览器:\n● 谷歌浏览器\n● QQ浏览器\n● 火狐浏览器\n或者浏览器内核是使用chrome，firefox的浏览器内核即可。','error');
		}, set.response_time);
    } 
}

//============================================主函数,判断页面是否正确，在文件最后执行============================================
function check_url_isright() {
	mylog('\n超星学习通刷课脚本\n作者：LDS-Skeleton（github）\n功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题');
	if(href_is_Has(url.studentstudy));
	else if (href_is_Has(url.studentcourse)) mylog("当前是学习进度界面！请点击任意的任务点，或者章节，进入学习界面！！！", 'error');
	else if (href_is_Has(url.index)) mylog("当前是学生主页！请点击任意的课程，进入学习界面！！！", 'error');
	else if (href_is_Has(url.chaoxing) && !href_is_Has(url.studentstudy)) mylog("这个是：超星学习通脚本，请您检查一下是否是在超星学习界面。超星登陆链接：" + url.login, 'error');
	else {
		mylog("当前不是超星学习通界面，超星登陆链接：" + url.login, 'error');
	};
}
//============================================初始化数据============================================
function init() {
	if (jobCount == undefined) mylog("章节信息加载失败,或者课程已完成！！！", 'error');
	else {
		//如果是第一次点击播放视频
		if (play_type == 0) {
			play_type = 1;
		} else {
			set.set_video_index++;
			mylog('正在强制跳转下一个视频');
		}
		rate = 1;
		mylog("正在加载...");
		$('#startplay').text("正在初始化信息中...");
		jump_to_select();//如果设置中，是从点击的章节开始，则跳转到点击的章节
		clickNext();//点击视频
		loadName();//加载章节名字
		playbackRate_event();//播放速率的一些事件
	}
}
//============================================播放速率的一些事件============================================
function playbackRate_event() {
	//删除点击事件
	$("#b1").unbind("click");
	$("#b2").unbind("click");
	//改变播放速度
	$("#b1").click(function () {
		if (set.rate < 10) set.rate += 0.25;
		$("#rate_txt").text('播放速度：' + set.rate + "X");
	});

	$("#b2").click(function () {
		if (set.rate > 1) set.rate -= 0.25;
		$("#rate_txt").text('播放速度：' + set.rate + "X");
	});
}


//============================================开始运行============================================
function play() {
	//视频数量
	set.video_length = $('#iframe').contents().find('iframe').contents().find('.vjs-play-control').length;
	//进入二级iframe
	var doc = $("#iframe").contents().find('iframe').contents();

	//判断现在视频的索引值，是多视频的，还是单视频的情况
	var now_video_index = set.video_length == 1 ? 0 : set.now_page_video_index;

	//检测课程是否完成
	if (jobCount[set.set_video_index] == undefined) {
		job_is_finish();
		isplay = false;
	} else {

		//如果加载视频超时，直接强制跳过这个视频。
		if (timeout > 100) {
			mylog("加载视频超时！！！", 'error');
			clickNext();
			timeout = 0;
		}

		//如果视频正在加载
		if (doc.find('#loading').css('visibility') != 'hidden') {
			mylog("正在加载查找视频，如果不存在，将在：" + ((10000 - timeout * 100) / 1000) + "  秒后跳过当前视频");
			timeout++;
			if (isplay == true) setTimeout("play()", 100);
		} else {
			timeout = 0;

			var noSound = doc.find('.vjs-vol-3').eq(now_video_index);//禁音按钮
			var playbutton = doc.find('.vjs-play-control').eq(now_video_index);//播放按钮
			var playRate = doc.find('.vjs-progress-holder').eq(now_video_index).attr('aria-valuenow');//播放完成百分比

			if (playbutton.text() == undefined || playRate == undefined) {
				//视频信息获取失败
			} else {

				//点击播放按钮
				doc.find('#video button.vjs-big-play-button').eq(now_video_index).click();

				//静音
				if (noSound != null) noSound.click();

				//如果暂停，点击播放
				if (playbutton.text() == "播放") {
					play_function.click_playBtn(now_video_index);
				}
				//如果没有播放完毕，继续运行
				play_function.check_is_done(playRate, now_video_index);

			}

			if (isplay == true) setTimeout("play()", 100);//继续运行progress
		}

	}
}

//============================================播放视频的一些函数============================================
var play_function = {

	check_is_done: function (playRate, now_video_index) {//检测视频进度。如果没有播放完毕，继续运行
		if (playRate != 100) {
			//实时改变播放速度
			var doc = $("#iframe").contents().find('iframe').contents();
			doc.find('video')[now_video_index].playbackRate = set.rate;
			$('#progress').text(playRate + "%");
			if ($('#no-auto-play').attr('checked') != undefined) {
				$('#startplay').text("开始播放手动选择的视频");
			} else {
				$('#startplay').text("播放中...\n点击将跳过当前视频");
			}
		} else {//如果播放结束
			//每次结束玩就点击下一个视频节点,或者下一个视频

			//如果手动播放模式开启，则不自动跳转
			if ($('#no-auto-play').attr('checked') != undefined) {
				mylog("当前全部视频已经播放完毕，请手动切换到要播放的视频", 'error');
			} else {
				mylog("当前章节已经播放完毕，正在切换下一章节");
				clickNext();
			}
		}
	},

	click_playBtn: function (now_video_index) {
		//当前页面的视频数量
		if (set.video_length == 1) {
			mylog("正在播放单视频");
			setTimeout("$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').eq(0).click();", 100);
		} else {
			setTimeout("$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').eq(" + now_video_index + ").click();", 100);
			mylog("正在播放第" + (now_video_index + 1) + "个多视频");
		}
	}

}


//============================================点击下一个视频节点============================================
function clickNext() {

	//初始化数据
	set.now_page_video_index = 0;
	jobCount = document.getElementsByClassName('jobCount');//未完成的课程数组	

	//检测课程是否完成
	if (jobCount[set.set_video_index] == undefined) {
		job_is_finish();
		isplay = false;
	} else {
		//点击视频连接,如果手动播放模式开启，则不自动点击链接
		var job_a_tag = jobCount[set.set_video_index].parentNode.getElementsByTagName('a')[0];
		if ($('#no-auto-play').attr('checked') == undefined) job_a_tag.click();//点击链接

		var doc = $("#iframe").contents().find('iframe').contents();
		$(doc).ready(function () {
			setTimeout(find_video,set.response_time);
		});

	}
}

//============================================查找视频，如果没有视频那么跳转============================================
function find_video() {
	mylog("页面加载成功，开始检测");
	var doc = $("#iframe").contents().find('iframe').contents();
	if($("#iframe").contents().find('iframe').contents().find('object').length!=0){
		mylog("此浏览器不能运行改脚本，请更换主流浏览器，目前经过测试可运行的浏览器：",'error');
	}
	else if (doc.find('video').length != 0) {
		mylog("页面查找到视频，进行视频模式检测");
		//点击视频按钮
		setTimeout("clickPlayButton();", set.response_time);
	} else {
		//如果手动播放模式开启，则不自动跳转
		if ($('#no-auto-play').attr('checked') == undefined) {
			mylog("页面未查找到视频，将跳转到下一节");
			setTimeout("clickNext();", set.response_time_fast);
		} else {
			mylog("页面未查找到视频，请重新选择你要播放的视频", 'error');
		}

		set.set_video_index++;
	}
}


//============================================点击视频按钮============================================
function clickPlayButton() {

	//点击章节中的视频按钮，就是视频顶部，上面那几个按钮，如果没有就不点
	for (var i = 0; i < $('.tabtags').find('span').length; i++) {
		if ($('.tabtags').find('span').eq(i).text().replace(/\s*/g, "") == "视频") {
			$('.tabtags').find('span').eq(i).click();
			break;
		}
	}

	//判断章节是多视频还是单视频模式
	set.video_length = $('#iframe').contents().find('iframe').contents().find('.vjs-play-control').length;
	if (set.video_length > 1) mylog("检测到多视频，多视频数量：" + set.video_length);
	//找出多视频中，播放完成的个数，并且直接将索引值定位到未播放的视频
	if (set.video_length >= 1) {

		var length = $("#iframe").contents().find('iframe').contents().find('video').length;
		var iframe = $("#iframe").contents().find('iframe');
		for (var i = 0; i < length; i++) {
			//直接查找是否完成，如果没有完成，则为0
			if (iframe.eq(i).parent('.ans-job-finished"').length == 0) {
				set.now_page_video_index = i;
				mylog("查询到第" + (i + 1) + "个视频未完成，正在跳转到该视频");
				break;
			}
		}
	}

	//如果视频已经播放完成
	setTimeout("check_finished()", set.response_time);
}


//============================================如果视频已经播放完成，就播放下一个视频============================================
function check_finished() {

	var finish_job_length = $('#iframe').eq(0).contents().find('.ans-job-finished').length;//完成视频数量
	var finish_job_video_length = 0;//现在章节中完成的任务点中存在视频的数量，因为有些任务点可能是题目之类的，所以这里要分辨
	for (var i = 0; i < finish_job_length; i++) {
		if ($('#iframe').eq(0).contents().find('.ans-job-finished').eq(i).find('iframe').contents().find('video').length == 1) finish_job_video_length++;
	}
	//如果当前视频中，只有一个视频，且完成的任务点也只有一个
	if (finish_job_video_length == 1 && set.video_length == 1) {
		if ($('#no-auto-play').attr('checked') == undefined) {
			setTimeout(" clickNext()", set.response_time);
			mylog("视频已经播放完毕，开始跳转下一节");
			set.set_video_index++;
		} else {
			mylog("视频已经播放完毕，请手动切换到要播放的视频", 'error');
		}


	}
	//如果当前模式是多视频模式
	else if (set.video_length > 1) {
		//如果当前视频中，视频完成数量，等于视频总数量
		if (finish_job_video_length == set.video_length) {
			//如果手动播放模式开启，则不自动跳转
			if ($('#no-auto-play').attr('checked') == undefined) {
				setTimeout(" clickNext()", set.response_time);
				mylog("多视频已经播放完毕，开始跳转下一节");
				set.set_video_index++;
			} else {
				mylog("多视频已经播放完毕，请手动切换到要播放的视频", 'error');
			}
		} else {
			loadName();
			setTimeout("play()", set.response_time);
		}
	}

	else {
		loadName();
		setTimeout("play()", set.response_time);
	}
}

//============================================加载章节名称============================================
function loadName() {

	cp = jobCount[set.set_video_index].parentNode.getElementsByTagName('span')[2].innerText;  //当前章节
	if (jobCount[set.set_video_index + 1] != undefined) np = jobCount[set.set_video_index + 1].parentNode.getElementsByTagName('span')[2].innerText;  //下一章节
	else np = "无";
	$("#cp").text("当前章节：" + cp);
	$("#np").text("下一章节：" + np);

}
//============================================播放设置，点击后淡出淡入============================================
function setting() {
	if ($("#div-setting").css('display') == 'none') {
		$("#div-setting").fadeIn();
	} else {
		$("#div-setting").css('display', 'none');
	}
}

//============================================跳转到选择的章节============================================
function jump_to_select() {

	jobCount = document.getElementsByClassName('jobCount');//未完成的课程数组	

	if ($("#select-job-play").attr("checked") != undefined || $("#no-auto-play").attr("checked") != undefined) {
		for (var i = 0; i < jobCount.length; i++) {
			if ($(jobCount).eq(i).parent('h5').hasClass('currents') || $(jobCount).eq(i).parent('h4').hasClass('currents')) {
				set.set_video_index = i;
				mylog('正在切换到选中的章节');
			}
		}
	}
}

//============================================下面都是没什么用的一些函数============================================
//============================================自定义输出============================================
function mylog(str, type) {
	var time = "[" + new Date().format("MM月dd日hh:mm:ss") + "]";
	var title = "[超星脚本]:";
	if (type == 'error') console.error(time + title + "%c" + str, 'color:red;');
	else console.log(time + title + "%c" + str, 'color:green;');
}
//============================================日期格式化，不用看，就是显示日期的工具函数============================================
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
//============================================播放完毕============================================
function job_is_finish() {
	setTimeout(() => {
		mylog('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
		alert('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
	}, 5000);
}
//============================================绘制窗口============================================
function drawWindow() {
	//加载css文件
	$('head').append('<link href="https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/main.css?t=' + new Date().getTime() + '" rel="stylesheet" type="text/css" />');
	//下面是标签拼接
	$("body").append("<div id='skdiv'></div>");
	$("#skdiv").html("\
			<p>\
				<span style='font-weight:bold;    font-size: large;'>超星刷课脚本</span>（可用鼠标拖动）\
			<p>\
			<p>最后更新时间：2020/4/46/16:42<br />更新内容:支持一个章节多个视频的观看</p>\
			\
			<div id='content' style='   border-top: 2px solid;'></div>");
	$('#content').html("\
			<div>\
				<p id='rate_txt'>播放速度：1X</p>\
				<div style='float:left'><button id='b1'>▲</button><button id='b2'>▼</button></div>\
			</div><button id='startplay' onclick='init()'>点击开始播放</button>\
			<p>\
				<hr />\
			</p>\
			<button id='settingbtn' onclick='setting()''>播放设置</button>\
			<div id='setting'></div>\
			<div style='margin-top:10px'>\
				<p style='font-weight:bold'>当前进度:&nbsp;&nbsp;<span id='progress'>0%</span></p>\
				<hr>\
				</hr>\
				<p id='cp'>当前章节：</p>\
				<p id='np'>下一章节：</p>\
			</div>"
	);
	//添加设置界面
	var settingDiv = $('<div id="settingDiv" ></div>');
	settingDiv.html('\
	<div id="div-setting" >\
	从第一个任务点开始播放（默认）<input type="radio" name="1" id="first-job-play" checked><br><hr>\
	从当前点击的任务点开始播放<input type="radio" name="1" id="select-job-play"><br><hr>\
	开启手动选择视频模式，手动切换到视频页，然后点击播放，播放完后不会自动跳转<input type="radio"  name="1" id="no-auto-play"><br>\
	</div>');
	$('#setting').append(settingDiv);
}
//============================================鼠标拖动刷课框============================================
function dragPanelMove(downDiv, moveDiv) {
	$(downDiv).mousedown(function (e) {
		var isMove = true;
		var div_x = e.pageX - $(moveDiv).offset().left;
		var div_y = e.pageY - $(moveDiv).offset().top;
		$(document).mousemove(function (e) {
			if (isMove) {
				var obj = $(moveDiv);
				obj.css({ "left": e.pageX - div_x, "top": e.pageY - div_y });
			}
		}).mouseup(
			function () {
				isMove = false;
			});
	});
}
//============================================判断href字符串包含============================================
function href_is_Has(str) { return window.location.href.indexOf(str) == -1 ? false : true; }


//绘制窗口
drawWindow();
//鼠标拖动刷课框
dragPanelMove("#skdiv", "#skdiv");
//============================================主函数============================================
check_url_isright();
//判断当前浏览器能否运行次脚本
main_tocheck_browser();
