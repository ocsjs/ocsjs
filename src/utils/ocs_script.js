$.getScript('https://unpkg.com/vue/dist/vue.min.js', (r, s) => {
  console.log(r, s)
  if (s === 'success') {
    startSK({
      chatiId: "asdsadasdsad",
      unsafeWindow:window,
      $,
      Vue,
      originUrl: 'https://wk.klweb.top',
    })
  }

})

function startSK(p) {

  console.log("OCS脚本启动", p)

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


    p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript@1.7.3/cdn/chaoxing/sk-main.js?_=' + new Date()
      .getTime(),
      function(r, s) {
        console.log(s)
        startChaoxingSK(p)
        // startChaoxingSK(p.chatiId,p.unsafeWindow,p.$,p.Vue,p.orginUrl,p.setting)
      });
  }
  if (urlMatch(window.location.href, chaoxingWorkUrls)) {

    p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript@1.7.3/cdn/chaoxingWork/sk-main.js?_=' +
      new Date().getTime(),
      function(r, s) {
        console.log(s)
        startChaoxingWorkSk(p.chatiId, p.unsafeWindow)
      });
  }
  if (urlMatch(window.location.href, zhsSkWorkUrls)) {

    p.$.getScript('https://cdn.jsdelivr.net/gh/KL-Skeleton/OnlineCourseScript@1.7.3/cdn/zhs/sk-main.js?_=' + new Date()
      .getTime(),
      function(r, s) {
        console.log(s)
        startZhsSK(p.chatiId, p.unsafeWindow)
      });
  }

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
