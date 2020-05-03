 /*
超星学习通刷课脚本
作者：LDS-Skeleton（github）
功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题
*/
var version = '1.3.1';
var last_set_time = '2020/5/3';
var jobCounts = null;//未完成的课程数组，任务点
var now_video_index = 0;//当前界面播放视频的索引值

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
			GetInfo.video.getVideoDoc().find('.vjs-play-control').eq(now_video_index).click();//点击播放按钮暂停
		}
	}
}
//各种url的json
var url = {
	//超星url
	chaoxing: 'chaoxing.com',
	//课程页面
	studentcourse: 'https://mooc1-1.chaoxing.com/mycourse/studentcourse',
	//学习界面
	studentstudy: 'https://mooc1-1.chaoxing.com/mycourse/studentstudy',
	//主页
	index: 'http://i.mooc.chaoxing.com/space/index',
	//登录页
	login: 'https://passport2.chaoxing.com/login?loginType=3&newversion=true&fid=-1',
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
	has_video() {

		if (GetInfo.video.getVideoLength() == 0) {
			mylog("未查找到视频，将在" + (this.timeout_has_video--) + "秒后跳过该章节", 'error');
			return false;
		}
		else return true;
	},
	//视频是否加载完成
	video_already() {
		if (GetInfo.video.getVideoLoding_Visibility() != 'hidden') {
			mylog("正在加载视频," + (this.timeout_video_already--) + "秒内未加载成功，将自动跳转下一个章节", 'error');
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
				set.set_video_index++;
				set.set_span_index = 0;//归零
				click_ATage();
				mylog("页面未查找到视频，将跳转到下一章节");
			}
			else {
				set.set_span_index++;
				mylog("页面未查找到视频，将跳转到下一任务点");
			}
			setTimeout(clickNext, set.response_time_fast);
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
//获取播放页面的一些视频信息
var GetInfo = {
	//主要是一些播放界面的信息
	page: {
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
		//现在章节中完成的任务点中存在视频的数量，因为有些任务点可能是题目之类的，所以这里要分辨清楚
		getFinishVideoLength() {
			var finish_job_video_length = 0;
			for (var i = 0; i < this.getFinishJobLength(); i++) {
				if ($('#iframe').eq(0).contents().find('.ans-job-finished').eq(i).find('iframe').contents().find('video').length == 1) finish_job_video_length++;
			}
			return finish_job_video_length;
		},
	},
	//主要是播放视频的信息
	video: {
		//获取2层iframe下面的document元素
		getVideoDoc() {
			return $('#iframe').contents().find('.ans-job-icon').parent('.ans-attach-ct').find('iframe').contents();
		},
		//获取视频数量
		getVideoLength() {
			return this.getVideoDoc().find('video').length;
		},
		//获取禁音按钮
		getVoiceButton(index) {
			return this.getVideoDoc().find('.vjs-vol-3').eq(index);
		},
		//获取禁音按钮数组
		getVoiceButtons() {
			return this.getVideoDoc().find('.vjs-vol-3');
		},
		//获取播放按钮，只要视频暂停了，这个按钮就会出现
		getPlayButton(index) {
			return this.getVideoDoc().find('#video button.vjs-big-play-button').eq(index);
		},
		//获取播放按钮数组，只要视频暂停了，这个按钮就会出现
		getPlayButtons() {
			return this.getVideoDoc().find('#video button.vjs-big-play-button');
		},
		//获取视频进度条值
		getProgressValue(index) {
			return this.getVideoDoc().find('.vjs-progress-holder').eq(index).attr('aria-valuenow');
		},
		//获取视频进度条数组
		getProgresses() {
			return this.getVideoDoc().find('.vjs-progress-holder');
		},
		//获取视频加载中的界面，如果没有则代表视频加载成功
		getVideoLoding_Visibility() {
			return this.getVideoDoc().find('#loading').css('visibility');
		},
		//获取视频选择的公网
		getVideoSelectedNetWorks() {
			return this.getVideoDoc().find('video').eq(now_video_index).parent('.video-js').find('.vjs-control-bar').find('.vjs-menu-button').find('.vjs-menu').eq(2).find('.vjs-menu-item');
		},
		//获取视频选择的公网类型，1就是公网1,2就是公网2
		getVideoSelectedNetWork(index) {
			return this.getVideoSelectedNetWorks().eq(index);
		},
		//获取视频选择的公网的数字，1就是公网1,2就是公网2
		getVideoSelectedNetWork_num(now_video_index) {
			var selected = this.getVideoDoc().find('video').eq(now_video_index).parent('.video-js').find('.vjs-control-bar').find('.vjs-menu-button').find('.vjs-menu').eq(2).find('.vjs-selected');
			return selected.eq(0).text().substring(2);//播放速度大于2的时候，css选择到的不一样，很奇怪，如果不加判断将会卡bug
		},
		//获取falsh播放器，如果获取到了，则不能使用脚本。
		getFlashVideo() {
			return this.getVideoDoc().find('object').find('param[name="flashvars"]');
		},
		//获取目前第video_index个播放视频的速度
		getVideoPlayRate(video_index) {
			var video = this.getVideoDoc().find('video')[video_index];
			return video == undefined ? undefined : video.playbackRate;
		},
		//设置目前第video_index个播放视频的速度
		setVideoPlayRate(video_index, rate) {
			var video = this.getVideoDoc().find('video')[video_index];
			video == undefined ? undefined : video.playbackRate = rate;
		}
	}
}
//判断当前浏览器能否运行次脚本
function main_tocheck_browser() {

	var explorer = navigator.userAgent;

	if (explorer.indexOf("Firefox") == -1 && explorer.indexOf("chrome") == -1 && explorer.indexOf("Chrome") == -1) {
		mylog('\n超星脚本对当前浏览器不兼容！\n如果运行可能产生不可预知的后果！\n请更换浏览器，目前支持的浏览器:\n● 谷歌浏览器\n● QQ浏览器\n● 火狐浏览器\n或者浏览器内核是使用chrome，firefox的浏览器内核即可。', 'error');
		setInterval(() => {
			mylog('\n超星脚本对当前浏览器不兼容！\n如果运行可能产生不可预知的后果！\n请更换浏览器，目前支持的浏览器:\n● 谷歌浏览器\n● QQ浏览器\n● 火狐浏览器\n或者浏览器内核是使用chrome，firefox的浏览器内核即可。', 'error');
		}, set.response_time);
	}
}
//主函数,判断页面是否正确，在文件最后执行
function check_url_isright() {
	mylog('\n超星学习通刷课脚本\n作者：LDS-Skeleton（github）\n版本：' + version + '\n功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，支持修改播放模式，不能自动答题');
	if (href_is_Has(url.studentstudy));//页面正确
	else if (href_is_Has(url.studentcourse)) mylog("当前是学习进度界面！请点击任意的任务点，或者章节，进入学习界面！！！", 'error');
	else if (href_is_Has(url.index)) mylog("当前是学生主页！请点击任意的课程，进入学习界面！！！", 'error');
	else if (href_is_Has(url.chaoxing) && !href_is_Has(url.studentstudy)) mylog("这个是：超星学习通脚本，请您检查一下是否是在超星学习界面。超星登陆链接：" + url.login, 'error');
	else {
		mylog("当前不是超星学习通界面，超星登陆链接：" + url.login, 'error');
	};
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
			jump_to_select();//如果设置中，是从点击的章节开始，则跳转到点击的章节
			click_ATage();
			clickNext();//点击视频
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
	//视频数量
	set.video_length = GetInfo.video.getVideoLength();
	//判断现在视频的索引值，是多视频的，还是单视频的情况
	now_video_index = set.video_length == 1 ? 0 : set.now_page_video_index;
	//检测课程是否完成
	if (jobCounts.length == 0) {
		job_is_finish();
	} else {

		var noSound = GetInfo.video.getVoiceButton(now_video_index);//禁音按钮
		var playRate = GetInfo.video.getProgressValue(now_video_index);//播放完成百分比


		//静音
		if (noSound != null) noSound.click();
		//如果暂停，点击播放
		GetInfo.video.getPlayButton(now_video_index).click();
		//实时改变播放速度
		GetInfo.video.setVideoPlayRate(now_video_index, set.rate);

		//开启定时器
		if (set.play_interval == null) {
			set.play_interval = setInterval(play, 100);
		}
		//如果没有播放完毕，继续运行
		check_is_done(playRate, now_video_index);
	}
}
//检测视频是否完成
function check_is_done(playRate, now_video_index) {
	if (playRate != 100) {//如果没有播放完成
		$('#progress').text(playRate + "%");
		$('#startplay').text("播放中...,点击暂停");
	} else {//如果播放结束
		//每次结束玩就点击下一个视频节点,或者下一个视频
		set._clearInterval();
		//如果手动播放模式开启，则不自动跳转
		if (modeAttrChecked.noAuto() != undefined) {
			mylog("当前全部视频已经播放完毕，请手动切换到要播放的视频", 'error');
			$('#startplay').text("手动播放选择的视频");
		} else {
			mylog("当前章节已经播放完毕，正在切换下一章节");
			$('#startplay').text("播放完毕，正在切换下一章节");
			setTimeout(clickNext, set.response_time);
		}
	}
}

//点击下一个视频节点
function clickNext() {
	//初始化数据
	set.now_page_video_index = 0;
	set.video_length = GetInfo.video.getVideoLength();
	jobCounts = GetInfo.page.getJobCounts();
	//检测课程是否完成
	if (jobCounts.length == 0 || jobCounts[set.set_video_index] == undefined) {
		job_is_finish();
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
		jobCounts[set.set_video_index].parentNode.getElementsByTagName('a')[0].click();//点击链接
	}
}
//点击下一个tag点,tag点完成后才能继续下一个章节
function clickNext_span() {
	mylog('跳转到了第' + (set.set_span_index + 1) + '个任务栏');
	GetInfo.page.getTabTag(set.set_span_index).click();
	setTimeout(find_video, set.response_time);
}
function spanTag_isfinish() {
	return set.set_span_index >= GetInfo.page.getTabTags().length - 1;
}

//查找视频，如果没有视频，视频播放完那么跳转
function find_video() {
	mylog("页面加载成功，开始检测");
	if (GetInfo.video.getFlashVideo().length != 0) mylog("检测到当前有flash视频，脚本暂不支持播放flash视频，将自动跳过flash视频！！！", 'error');
	//开始检测是否存在视频,或者视频是否加载成功
	check.init();
	set.video_length = GetInfo.video.getVideoLength();
	var check_interval = setInterval(function () {
		if (check.isTimeout(check_interval)) return;//检测如果超时
		//检测是否存在视频，视频是否加载完成，视频是否支持h5视频插件播放
		if (check.has_video() && check.video_already()) {//是否存在视频
			setTimeout(check_finished, set.response_time_fast);//初始化视频播放模式
			clearInterval(check_interval);
		}
	}, set.response_time_fast);
}

//如果视频已经播放完成，就播放下一个视频
function check_finished() {
	//现在章节中完成的任务点中存在视频的数量，因为有些任务点可能是题目之类的，所以这里要分辨
	var finish_job_video_length = GetInfo.page.getFinishVideoLength();
	set.video_length = GetInfo.video.getVideoLength();
	//如果当前视频中，只有一个视频，且完成的任务点也只有一个
	if (finish_job_video_length == 1 && set.video_length == 1) {
		if (modeAttrChecked.noAuto() == undefined) {
			setTimeout(clickNext, set.response_time);
			//如果当前章节的全部任务点完成，才能跳转
			if (spanTag_isfinish()) {
				set.set_video_index++;
				set.set_span_index = 0;//归零
				click_ATage();
				mylog("章节视频任务点全部完成，开始跳转下一章节");
			}
			else {
				set.set_span_index++;
				mylog("视频已经播放完毕，开始跳转下一任务点");
			}
		} else {
			mylog("视频已经播放完毕，请手动切换到要播放的视频", 'error');
		}
	}
	//如果当前模式是多视频模式
	else if (set.video_length > 1) {
		//如果当前视频中，视频完成数量，等于视频总数量
		if (finish_job_video_length == set.video_length) {
			//如果手动播放模式开启，则不自动跳转
			if (modeAttrChecked.noAuto() == undefined) {
				setTimeout(clickNext, set.response_time);
				//如果当前章节的全部任务点完成，才能跳转
				if (spanTag_isfinish()) {
					set.set_video_index++;
					set.set_span_index = 0;//归零
					click_ATage();
					mylog("章节视频任务点全部完成，开始跳转下一章节");
				}
				else {
					set.set_span_index++;
					mylog("视频已经播放完毕，开始跳转下一任务点");
				}
			} else {
				mylog("多视频已经播放完毕，请手动切换到要播放的视频", 'error');
			}
		} else {
			setTimeout(initPlayMmode, set.response_time);
		}
	} else {
		setTimeout(initPlayMmode, set.response_time);
	}
}

//初始化视频播放模式
function initPlayMmode() {
	//判断章节是多视频还是单视频模式
	set.video_length = GetInfo.video.getVideoLength();
	if (set.video_length > 1) mylog("检测到多视频，多视频数量：" + set.video_length);
	//找出多视频中，播放完成的个数，并且直接将索引值定位到未播放的视频
	if (set.video_length >= 1) {
		var iframe_length = $("#iframe").contents().find('iframe').length;//iframe数量
		var iframe = $("#iframe").contents().find('iframe');
		var not_video_length = 0;//不是视频的数量
		for (var i = 0; i < iframe_length; i++) {
			//直接查找视频是否存在（iframe中有可能会有ppt，题目等情况），并且是否完成，如果没有完成，则为0
			var video = $("#iframe").contents().find('iframe').eq(i).contents().find('video');
			if (iframe.eq(i).parent('.ans-job-finished"').length == 0) {
				if (video.length == 1) {
					set.now_page_video_index = i - not_video_length;
					mylog("查询到第" + (set.now_page_video_index + 1) + "个视频未完成，正在跳转到该视频");
					break;
				} else {
					not_video_length++;
				}
			}
		}
	}
	//如果视频已经播放完成
	setTimeout(play, set.response_time_fast);
}
//播放设置，点击后淡出淡入
function setting(downDiv) {
	if ($(downDiv).css('display') == 'none') {
		$(downDiv).fadeIn();
	} else {
		$(downDiv).css('display', 'none');
	}
}
//跳转到选择的章节
function jump_to_select() {

	jobCounts = GetInfo.page.getJobCounts();//未完成的课程数组	

	if ($("#select-job-play").attr("checked") != undefined || $("#no-auto-play").attr("checked") != undefined) {
		for (var i = 0; i < jobCounts.length; i++) {
			if ($(jobCounts).eq(i).parent('h5').hasClass('currents') || $(jobCounts).eq(i).parent('h4').hasClass('currents')) {
				set.set_video_index = i;
				mylog('正在切换到选中的章节');
			}
		}
	}
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
//播放完毕
function job_is_finish() {
	setTimeout(() => {
		mylog('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
		alert('视频已经播放完毕，觉得赞的请给博主点个赞哦！博客链接：https://blog.csdn.net/qq_31254489/article/details/104579438');
	}, 5000);
}
//强制跳过当前视频
function forcejump() {
	set._clearInterval();
	mylog("正在强制跳转...");
	setTimeout(() => {
		$('#startplay').text("正在初始化信息中...");
		set.set_video_index++;
		set.set_span_index = 0;
		click_ATage();
		clickNext();//点击视频
	}, set.response_time);
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
			<button id='startplay' onclick='init()'>点击开始播放</button><br>\
			<button  onclick='forcejump()' style='margin:4px;'>强制跳过当前章节</button>\
			<p>\
				<hr />\
			</p>\
			<button id='settingbtn' style='margin-top:4px'>播放模式</button>\
			<div id='setting'></div>\
			<div id='net-work'>\
			<ul>\
				<li><span style='margin:4px;font-weight:bold'>公网1</span><input type='radio' name='netwwork'   onclick='setNetwork(1)' checked></li>\
				<li><span  style='margin:4px;font-weight:bold'>公网2</span><input type='radio' name='netwwork' onclick='setNetwork(2)'></li>\
			</ul>\
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
	//添加设置界面
	var settingDiv = $('<div id="settingDiv" ></div>');
	settingDiv.html('\
	<div id="div-setting" >\
	1.【顺序播放】从第一个任务点开始播放，之后顺序播放（默认）<input type="radio" value="1.【顺序播放】" name="sk" id="first-job-play" checked><br><hr>\
	2.【从当前顺序播放】从当前点击的任务点开始播放，之后顺序播放<input type="radio" value="2.【从当前顺序播放】" name="sk" id="select-job-play"><br><hr>\
	3.【解锁播放】(适用于没有选择填空题，可以一直往下播放的课程)一直从倒数第一个任务点播放,看完一章才能看下一章，不会暂停（测试中，请多多观察是否卡bug）<input type="radio" value="3.【解锁播放】"  name="sk" id="unlocking-mode-play"><br><hr>\
	4.【手动播放】开启手动选择视频模式，手动切换到视频页，然后点击播放，播放完后不会自动跳转<input type="radio" value="4.【手动播放】" name="sk" id="no-auto-play"><br>\
	</div>');
	$('#setting').append(settingDiv);
	$('#settingbtn').click(function () {
		setting('#div-setting');
	});
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
//切换公网
function setNetwork(param) {
	set.network = param;
}
//改变公网
setInterval(() => {
	if (set.play_interval != null) changeNetwork();
}, set.response_time_fast);
//改变公网
function changeNetwork() {
	var num = parseInt(GetInfo.video.getVideoSelectedNetWork_num(now_video_index));
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
//判断href字符串包含
function href_is_Has(str) { return window.location.href.indexOf(str) == -1 ? false : true; }
//显示播放模式
function show_play_mode() {
	var length = $('input[name=sk]').length;
	for (var i = 0; i < length; i++) {
		if ($('input[name=sk]').eq(i).attr('checked') == 'checked') {
			$('#settingbtn').text("播放模式： " + $('input[name=sk]').eq(i).val());
		}
	}

}
//提示
alert('● 倍速播放很可能会导致挂科！，或者不良记录\n● 播放前请先设置好播放模式\n● 再次点击播放按钮即可暂停，公网可任意切换\n● 最后！！！请吧当前窗口独立出来，可以覆盖当前窗口，但是不能最小化窗口！，不然视频过一段时间会自动暂停');

//=============下面是主运行代码=============
setInterval(show_play_mode, 1000);
//绘制窗口
drawWindow();
//鼠标拖动刷课框
dragPanelMove("#skdiv");
//主函数
check_url_isright();
//判断当前浏览器能否运行次脚本
main_tocheck_browser();
