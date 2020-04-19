/*
超星学习通刷课脚本
作者：LDS-Skeleton（github）
版本：1.0
功能：支持看完自动跳转下一节，暂停自动播放，倍速播放，不能自动答题

*/
var rate=1;//播放速度
var jobCount=document.getElementsByClassName('jobCount');//未完成的课程数组
var no_done_number=0;//未完成课的计数
var cp="";//这一章
var np="";//下一章
var timeout=0;//如果播放视频超时，或者没有视频，则跳过这一章节
var isplay=true;//是否播放


//多视频播放值：
var video_length=0;//视频数量
var now_page_video_index=0;//当有多个视频的时候， 当前视频的索引

var set_video_index=0;//自己可以设置的自定义视频索引

//绘制窗口
drawWindow();


function drawWindow(){//绘制窗口
//加载css文件
$('head').append('<link href="https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/main.css?t='+new Date().getTime()+'" rel="stylesheet" type="text/css" />');

//下面是标签拼接
$("body").append("<div id='skdiv'></div>");
$("#skdiv").html("<p ><span style='font-weight:bold;    font-size: large;'>超星刷课脚本</span>（可用鼠标拖动）<p><p>最后更新时间：2020/4/46/16:42<br/>更新内容:支持一个章节多个视频的观看</p><div id='content' style='   border-top: 2px solid;'></div>");
$('#content').html('<div ><p id="rate_txt" >播放速度：1X</p><div style="float:left"><button id="b1">▲</button><button id="b2">▼</button></div></div><button id="startplay" onclick="init()">点击开始播放</button>');
$('#content').html($('#content').html()+"<div style='margin-top:10px'><p style='font-weight:bold'>当前进度:&nbsp;&nbsp;<span id='progress'>0%</span></p><hr></hr><p  id='cp'>当前章节：</p><p id='np'>下一章节：</p></div>");

}

dragPanelMove("#skdiv","#skdiv");

//鼠标拖动刷课框
function dragPanelMove(downDiv,moveDiv){
	
            $(downDiv).mousedown(function (e) {
                    var isMove = true;
                    var div_x = e.pageX - $(moveDiv).offset().left;
                    var div_y = e.pageY - $(moveDiv).offset().top;
                    $(document).mousemove(function (e) {
                        if (isMove) {
                            var obj = $(moveDiv);
                            obj.css({"left":e.pageX - div_x, "top":e.pageY - div_y});
                        }
                    }).mouseup(
                        function () {
                        isMove = false;
                    });
            });
}


//跳转到代刷网
$('#klds').click(function(){
window.open('http://www.kulouds.top/?cid=78&tid=1195');
});

//初始化数据
function init(){
	
	mylog("超星学习通脚本1.2：最新更新：解决超星学习通，同章节下多个视频无法播放的问题");
	
	mylog("正在加载...");
	
		$('#startplay').text("正在播放中...");
		//获取刷课顺序
		
		clickNext();//点击视频
		loadName();//加载章节名字
		if(jobCount==undefined){
			mylog("章节信息加载失败,或者已经完成课程");
			isplay==false;
		}

		//改变播放速度
		$("#b1").click(function(){
			if(rate<10)rate+=0.25;
			$("#rate_txt").text('播放速度：'+rate+"X");
		});
	
		$("#b2").click(function(){
			if(rate>1)rate-=0.25;
			$("#rate_txt").text('播放速度：'+rate+"X");
		});

}



//开始运行
function play(){
	//视频数量
	video_length=$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').length;
	
	var doc=$("#iframe").contents().find('iframe').contents();
	
	//判断现在视频的索引值，是多视频的，还是单视频的情况
	var now_video_index= video_length==1? 0 : now_page_video_index ;
	
	//检测课程是否完成
	if(jobCount[set_video_index]==undefined){
		setTimeout("mylog('视频已经播放完毕，觉得赞的请给博主点个赞哦！')",5000);
		window.location.href='http://i.mooc.chaoxing.com/space/index.shtml';
		
		isplay=false;
	}else{
		
		//如果加载视频超时，直接强制跳过这个视频。
		if(timeout>100){
			mylog("加载视频超时！！！");
			clickNext();
			timeout=0;
		}
		
		//如果视频正在加载
		if(doc.find('#loading').css('visibility')!='hidden'){
			mylog("正在加载查找视频，如果不存在，将在："+((10000-timeout*100)/1000)+"  秒后跳过当前视频");
			timeout++;
			if(isplay==true)setTimeout("play()",100);
		}else{
				timeout=0;

		
				var noSound= doc.find('.vjs-vol-3').eq(now_video_index);//禁音按钮
				var playbutton= doc.find('.vjs-play-control').eq(now_video_index);//播放按钮
				var playRate=  doc.find('.vjs-progress-holder').eq(now_video_index).attr('aria-valuenow');//播放完成百分比
		
				if(playbutton.text()==undefined||playRate==undefined){
					//视频信息获取失败
				}else{
					
					//点击播放按钮
					doc.find('#video button.vjs-big-play-button').eq(now_video_index).click();
			
					//静音
					if(noSound!=null)noSound.click();
		
					//如果暂停，点击播放
					if(playbutton.text()=="播放"){
					//当前页面的视频数量
					
						if(video_length==1){
							mylog("正在播放单视频");
							setTimeout("$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').eq(0).click();",100);
						}else{
							setTimeout("$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').eq("+now_video_index+").click();",100);
							mylog("正在播放第"+(now_video_index+1)+"个多视频");
						}
					
		
					
					}
					//如果没有播放完毕，继续运行
					if(playRate!=100){
							//实时改变播放速度
							
							doc.find('video')[now_video_index].playbackRate=rate ;
							$('#progress').text(playRate+"%");
							$('#startplay').text("正在自动播放，请勿乱点，点击将跳过当前视频");
					}else {//如果播放结束
						//每次结束玩就点击下一个视频节点,或者下一个视频
						mylog("当前章节已经播放完毕，正在切换下一章节");
						clickNext();
						/*
						if(video_length==1 || $('#iframe').eq(0).contents().find('.ans-job-finished').length==video_length){
							
							
						}else{
							if($('#iframe').eq(0).contents().find('.ans-job-finished').length!=video_length){
								now_page_video_index++;
								mylog("多视频完成数量："+now_page_video_index+"，还剩下:"+(video_length-now_page_video_index)+"个视频");
							}
								
		
						}
							
						*/
					}
				
				}
	
				if(isplay==true)setTimeout("play()",100);//继续运行progress
		
		}

		
	}
		

}

//点击下一个视频节点
function clickNext(){
	
	//初始化数据
	now_page_video_index=0;
	

	jobCount=document.getElementsByClassName('jobCount');//未完成的课程数组
	
	//检测课程是否完成
	if(jobCount[set_video_index]==undefined){
		
		window.location.href='http://i.mooc.chaoxing.com/space/index.shtml';
		setTimeout("mylog('视频已经播放完毕，觉得赞的请给博主点个赞哦！')",5000);
		
		isplay=false;
	}else{
		
		//点击视频连接
		jobCount[set_video_index].parentNode.getElementsByTagName('a')[0].click();//点击链接
		mylog("正在等待页面加载");

		setTimeout("isfindvideo()",2000);
		
		

	}
	
	

	

	
}

function isfindvideo(){
	mylog("加载成功，开始播放");
		var doc=$("#iframe").contents().find('iframe').contents();
		mylog(doc.find('video').length);
		if(doc.find('video').length!=0){
			mylog("页面查找到视频，即将播放");
			//点击视频按钮
			setTimeout("clickPlayButton();",2000);
		}else{
			mylog("页面未查找到视频，将跳转到下一节");
			setTimeout("clickNext();",2000);
			set_video_index++;
		}
}


//如果视频已经播放完成，就播放下一个视频
function isfinished(){
	if($('#iframe').eq(0).contents().find('.ans-job-finished').length==1 && video_length==1){
		setTimeout(" clickNext()",2000);
		mylog("视频已经播放完毕，开始跳转下一节");
	
	}
	else if(video_length>1){
		
		if($('#iframe').eq(0).contents().find('.ans-job-finished').length==video_length){
		
		setTimeout(" clickNext()",2000);
		mylog("视频已经播放多视频完毕，开始跳转下一节");
		mylog($('#iframe').eq(0).contents().find('.ans-job-finished').length==video_length);
		}else{
		loadName();
		setTimeout("play()",2000); 
	}
		
	}

	else{
		loadName();
		setTimeout("play()",2000); 
	}
}

//加载章节名称
function loadName(){

	document.getElementsByClassName('jobCount')[0].parentNode.getElementsByTagName('span')[2].innerText
	cp=jobCount[set_video_index].parentNode.getElementsByTagName('span')[2].innerText;  //当前章节
	if(jobCount[set_video_index+1]!=undefined)np=jobCount[set_video_index+1].parentNode.getElementsByTagName('span')[2].innerText;  //下一章节
	else np="无";
	$("#cp").text("当前章节："+cp);
	$("#np").text("下一章节："+np);
		
	
}



//点击视频按钮
function clickPlayButton(){
	
	video_length=$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').length;
	if(video_length>1)mylog("检测到多视频，多视频数量："+video_length);
	
		//如果视频已经播放完成
	setTimeout("isfinished()",2000);

		

	
	//找出多视频中，播放完成的个数，并且直接将索引值定位到未播放的视频
	if(video_length>=1){
		
		var length=$("#iframe").contents().find('iframe').contents().find('video').length;
		var iframe=$("#iframe").contents().find('iframe');
		for(var i=0;i<length;i++){
			//直接查找是否完成，如果没有完成，则为0
			if(iframe.eq(i).parent('.ans-job-finished"').length==0){
				now_page_video_index=i;
				mylog("查询到第"+(i+1)+"个视频未完成，正在跳转到该视频");
				break;
			}
				
		}
		
		
		
	}

	
	for(var i=0;i<$('.tabtags').find('span').length;i++){
		if($('.tabtags').find('span').eq(i).text().replace(/\s*/g,"")=="视频"){
			$('.tabtags').find('span').eq(i).click();
			break;
		}
	}
	
}

function mylog(str){

	var time="["+new Date().format("MM月dd日hh:mm:ss")+"]";
	var title="[超星脚本]:";
	console.log(time+title+"%c"+str,'color:red;');
	
}

//日期格式化
Date.prototype.format = function(fmt){
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };

  if(/(y+)/.test(fmt)){
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
        
  for(var k in o){
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(
        RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
    }       
  }

  return fmt;
}







