
//绘制界面
var maindiv=$("<div id='maindiv'  style='background: antiquewhite;  width:400px;height:auto;right: 10%; position: fixed;    top: 15%;border: 1px solid;'></div>");
var topdiv=$("<div id='topdiv' style='border-bottom: 1px solid; height:25px;background:white'><div id='mydiv' style=' font-size:10px;padding:4px;'>网课答案查询 v1.0<button style='float:right;' onclick='removediv()'>X</button></div></div>");
$('body').append(maindiv);
$('#maindiv').append(topdiv);
$('#maindiv').append("<p>输入问题:</p><textarea id='myquestion' style='height:100px;'></textarea><p><button style='width:100px' onclick='query()'>  查询  </button><span id='zzcx'></span></p>");
$('#maindiv').append("<p id='myquestion2'>题目：</p><hr/><p style='height:50px' id='myanswer'>答案：</p>");
$('textarea').css("width","98%");


//下面是查答案的请求
function query(question){
$("#zzcx").text("正在查询...");
$.ajax({
    //请不要自己乱发请求，如果服务器炸了到时候查不了答案我可不负责。
    type:"POST",
    url:"http://101.200.130.50/queryAnswer",
    data:{
        question:$('#myquestion').val().replace(/\s*/g,"");//题目
    },
    dataType:"json",
    success:function(data){
        console.log(data);
        $('#myanswer').text("答案："+data.answer);
        $('#myquestion2').text("题目："+data.realquestion);
        $("#zzcx").text("");
    },
});
}

function removediv(){
$('#maindiv').remove();
}

dragPanelMove("#topdiv","#maindiv");

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

//监听键盘
  document.onkeydown = function(event) {

          var e = event || window.event || arguments.callee.caller.arguments[0];


          if (e && e.keyCode == 13) { // enter 键
                query();
              //要做的事情

          }

      };
