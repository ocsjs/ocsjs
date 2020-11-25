
function startSK(p) {
    
    console.log("OCS网课脚本启动",p)
    
    var chaoxingUrls = [
        "/mycourse/studentstudy",
        '/ananas/modules/',
        '/work/doHomeWorkNew',
        'edu.cn/',

    ]

    var chaoxingWorkUrls = [
        "/work/doHomeWorkNew",
        "/exam/test/reVersionPaperPreview",
        "/exam/test/reVersionTestStartNew",
    ]

    var zhsSkWorkUrls = [
        "zhihuishu.com/stuExamWeb",
        "zhihuishu.com/portals_h5/",
        "studyh5.zhihuishu.com/portals_h5/2clearning.html",
        "studyh5.zhihuishu.com/videoStudy"
        
        ]
 
    if (urlMatch(window.location.href, chaoxingUrls)) {
        
        //引入超星刷课脚本
        p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/chaoxing/sk-main.js?_='+new Date().getTime(),function(r,s){
            console.log(s)
            startChaoxingSK(p)
            // startChaoxingSK(p.chatiId,p.unsafeWindow,p.$,p.Vue,p.orginUrl,p.setting)
        });
    }
    if (urlMatch(window.location.href, chaoxingWorkUrls)) {
        //引入超星作业考试主脚本
         p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/chaoxingWork/sk-main.js?_='+new Date().getTime(),function(r,s){
            console.log(s)
            startChaoxingWorkSk(p.chatiId,p.unsafeWindow)
        });
    }
    if (urlMatch(window.location.href, zhsSkWorkUrls)) {
        //引入智慧树刷课作业考试主脚本
         p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript/cdn/zhs/sk-main.js?_='+new Date().getTime(),function(r,s){
            console.log(s)
            startZhsSK(p.chatiId,p.unsafeWindow)
        });
    }



    //脚本匹配url执行规则
    function urlMatch(url, array) {
        let ismatch = false
        array.forEach(rule => {
            if (url.match(rule)) {
                ismatch = true
            }
        })
        return ismatch
    }
}
