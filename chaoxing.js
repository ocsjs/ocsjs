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

drawWindow();


function drawWindow(){//绘制窗口
//加载css文件
$('head').append('<link href="https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/main.css?t='+new Date().getTime()+'" rel="stylesheet" type="text/css" />');

//下面是标签拼接
$("body").append("<div id='skdiv'></div>");
$("#skdiv").html("<p ><span style='font-weight:bold;    font-size: large;'>智慧树刷课脚本</span>（可用鼠标拖动）<p><p>最后更新时间：2020/3/9/16:42</p><div id='content' style='   border-top: 2px solid;'></div>");
$('#content').html('<div ><p id="rate_txt" >播放速度：1X</p><div style="float:left"><button id="b1">▲</button><button id="b2">▼</button></div></div><button id="startplay" onclick="init()">点击开始播放</button>');
$('#content').html($('#content').html()+"<div style='margin-top:10px'><p style='font-weight:bold'>当前进度:&nbsp;&nbsp;<span id='progress'>0%</span></p><hr></hr><p  id='cp'>当前章节：</p><p id='np'>下一章节：</p></div>");
$('#content').html('<hr></hr><div><p style="color:red;">3块钱一门课！全网最低！</p><p>稳定代看，包答题，包考试，95分以上</p><p id="klds"  style="color:#00BFFF;font-weight:bold;    cursor: pointer;">→ KL代刷网 ←</p></div><hr></hr>'+$('#content').html());
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
	console.log("正在加载...");
	
		$('#startplay').text("正在播放中...");
		//获取刷课顺序
		loadName();//加载章节名字
		clickNext();//点击视频
		if(jobCount==undefined){
			console.log("章节信息加载失败,或者已经完成课程");
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
		console.log("加载成功，开始播放");
}



//开始运行
function play(){

	var doc=$("#iframe").contents().find('iframe').contents();
	
	//检测课程是否完成
	if(no_done_number>jobCount.length){
		setTimeout("'视频已经播放完毕，觉得赞的请给博主点个赞哦！'",5000);
		window.location.href='http://i.mooc.chaoxing.com/space/index.shtml';
		
		isplay=false;
	}else{
		
		//如果加载视频超时，直接强制跳过这个视频。
		if(timeout>100){
			clickNext();
			timeout=0;
		}
		
		//如果视频正在加载
		if(doc.find('#loading').css('visibility')!='hidden'){
			console.log("%c%s","color: red; font-size: 10px;","正在查找视频，如果不存在，将在："+((10000-timeout*100)/1000)+"  秒后跳过当前视频");
			timeout++;
			if(isplay==true)setTimeout("play()",100);
		}else{
				timeout=0;

		
				var noSound=doc.find('.vjs-vol-3').eq(0);//禁音按钮
				var playbutton=doc.find('.vjs-play-control').eq(0);//播放按钮
				var playRate=doc.find('.vjs-progress-holder').eq(0).attr('aria-valuenow');//播放完成百分比
		
				if(playbutton.text()==undefined||playRate==undefined){
					//视频信息获取失败
				}else{
					
					//点击播放按钮
					doc.find('#video button').eq(0).click();
			
					//静音
					if(noSound!=null)noSound.click();
		
					//如果暂停，点击播放
					if(playbutton.text()=="播放")setTimeout("$('#iframe').contents().find('iframe').contents().find('.vjs-play-control').eq(0).click();",100);
		
					//如果没有播放完毕，继续运行
					if(playRate!=100){
							//实时改变播放速度
							document.querySelector('iframe').contentDocument.querySelector('iframe').contentDocument.querySelector('video').playbackRate=rate;
							$('#progress').text(playRate+"%");
							$('#startplay').text("正在自动播放，请勿乱点，点击将跳过当前视频");
					}else if(playRate==100){//如果播放结束
						//每次结束玩就点击下一个视频节点
						clickNext();
					}
				
				}
	
				if(isplay==true)setTimeout("play()",100);//继续运行progress
		
		}

		
	}
		

}

//点击下一个视频节点
function clickNext(){
	
	clickPlayButton();
	//点击视频连接
	jobCount[no_done_number].parentNode.getElementsByTagName('a')[0].click();//点击链接
	//如果视频已经播放完成
	setTimeout("isfinished()",2000);
	
}


//如果视频已经播放完成，就播放下一个视频
function isfinished(){
	if($('#iframe').eq(0).contents().find('.ans-job-finished').length==1){
		setTimeout(" clickNext()",2000);
		console.log("视频已经播放完毕，开始跳转下一节");
	}else{
		loadName();
		setTimeout("play()",2000); 
	}
	no_done_number++;
}

//加载章节名称
function loadName(){

	document.getElementsByClassName('jobCount')[0].parentNode.getElementsByTagName('span')[2].innerText
	cp=jobCount[no_done_number].parentNode.getElementsByTagName('span')[2].innerText;  //当前章节
	if(jobCount[no_done_number+1]!=undefined)np=jobCount[no_done_number+1].parentNode.getElementsByTagName('span')[2].innerText;  //下一章节
	else np="无";
	$("#cp").text("当前章节："+cp);
	$("#np").text("下一章节："+np);
		
	
}



//点击视频按钮
function clickPlayButton(){
	for(var i=0;i<$('.tabtags').find('span').length;i++){
		if($('.tabtags').find('span').eq(i).text().replace(/\s*/g,"")=="视频"){
			$('.tabtags').find('span').eq(i).click();
			break;
		}
	}
}








