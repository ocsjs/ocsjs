var playrate=1.5//默认速度
var cp="";//当前章节
var np="";//下一章节
var number=0;//章节计数
var video=document.getElementsByTagName('video')[0];//视频对象
$('.pauseButton').eq(0).click();//暂停视频
if($('.topic-item').length!=0){
	
		$('.topic-item').eq(0).click();//选择A
		$('div.btn').eq(0).click();//关闭
		setTimeout('drawWindow();',1000);
}else{
	setTimeout('drawWindow();',1000);
}



function drawWindow(){//绘制窗口
//加载css文件
$('head').append('<link href="https://ghcdn.rawgit.org/LDS-Skeleton/OnlineCourseScript/master/main.css?t='+new Date().getTime()+'" rel="stylesheet" type="text/css" />');

//下面是标签拼接
$("body").append("<div id='skdiv'></div>");
$("#skdiv").html("<p ><span style='font-weight:bold;    font-size: large;'>智慧树刷课脚本</span>（可用鼠标拖动）<p><p>最后更新时间：2020/3/6/16:50</p><div id='content' style='   border-top: 2px solid;'></div>");
$('#content').html('<div ><p  id="rate_txt" >播放速度：默认1.5倍速</p><button id="startplay" onclick="start()">点击开始播放</button>');
$('#content').html($('#content').html()+"<div style='margin-top:10px'><p style='font-weight:bold'>当前进度:&nbsp;&nbsp;<span id='progress'>0%</span></p><hr></hr><p  id='cp'>当前章节：</p><p id='np'>下一章节：</p></div>");
$('#content').html('<hr></hr><div><p  class="skp" style="color:red;">3块钱一门课！全网最低！</p><p  class="skp">稳定代看，包答题，包考试，95分以上</p><p id="klds"  class="skp"  style="color:#00BFFF;font-weight:bold;    cursor: pointer;">→ KL代刷网 ←</p></div><hr></hr>'+$('#content').html());

dragPanelMove("#skdiv","#skdiv");
//跳转到代刷网
$('#klds').click(function(){
window.open('http://www.kulouds.top/?cid=78&tid=1195');
});
}




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

//开始按钮
function start(){
	
	for(var i=0;i<$('.video').length;i++){
		if($('.video').eq(i).find('b').length<3||$('.video').eq(i).find('svg').length!=0){
			number=i;
			break;
		}

	}
	
	playNext();
}

var svgIsFade=false;

function play(){
	//如果检测到弹窗
	if($('.topic-item').length!=0){
		setTimeout("$('.topic-item').eq(0).click();",500)//选择A
		setTimeout("$('div.btn').eq(0).click();",1000)//关闭
		setTimeout("play()",1200);
	}else{
		//静音
		if($('.volumeNone').length==0)$('.volumeIcon').click();
		//1.5倍速播放
		if($('.speedBox').find('span').text()=="X 1.0")$('.speedTab15').click();
		//实时改变播放进程
		$('#progress').text($('.passTime').css('width'));
		//如果视频暂停，点击播放
		if($('.playButton').length!=0)setTimeout("$('.playButton').eq(0).click();",100);
		//如果播放完毕，播放下一节
		if(parseInt($('.passTime').css('width'))==100)setTimeout("playNext();",100);
		//否则继续播放
		else setTimeout("play()",100);
	}

}

//播放下一个视频
function playNext(){
	
	cp=$('.video').eq(number).find('.catalogue_title').text();//当前章节
	np=$('.video').eq(number+1).find('.catalogue_title').text();//下一章节
	$('#cp').text("当前章节："+cp);
	$('#np').text("下一章节："+np);
	if($('.video').eq(number).find('b').length==2){
		$('.video').eq(number++).click();
		setTimeout("play()",1000);
	}else{
		number++;
		setTimeout("playNext()",1000);

	}
	

	
}
