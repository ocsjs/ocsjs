<template>
  <div>
    <div class="list-item" v-for="(item,index) in list " :key="index">
      <a-row style="display: flex;justify-content: start;flex-wrap: nowrap;">
        <a-col :span="4">
          <img :src="item.img" style="width: 100%;" />
        </a-col>
        <a-col :span="10" style="margin-left: 10px;">
          <div><span style="font-weight: bold;font-size:16px;">{{item.title}}</span></div>
          <div>学校：<span >{{item.school}}</span></div>
          <div>账号：<span >{{item.account}}</span></div>

        </a-col >
        <a-col :span="10" style="margin-top: 10px;">
            <a-button type="link">
              <a-icon type="info-circle" />详情
            </a-button>
            <a-button type="link" @click="run(item)">
              <a-icon type="play-circle" />启动
            </a-button>
            <a-button type="link">
              <a-icon type="delete" />删除
            </a-button>
        </a-col>
      </a-row>


    </div>
  </div>
</template>

<script>
  import api from '../../../api/index.js'

  const script =  `$.getScript('https://unpkg.com/vue/dist/vue.min.js', (r, s) => {
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
`

  export default {
    props: {
      list: Array
    },

    data() {
      return {
        // list:data,

      };
    },

    methods: {
      //启动课程
      run(item){
        api.runCourse(item.url,script).then(r=>{
          r.data.data.quit()
          console.log(r);
        }).catch(e=>{
          console.error(e);
        })
      },
      showDetail(detail) {
        console.log(detail);
      }
    }
  };
</script>

<style scoped>
  .list-item {
    padding: 5px;
    margin-bottom: 10px;
    border-bottom: 1px solid ghostwhite;
  }
</style>
