<template>
  <div>
    <a-card size="small" style=" ;margin-bottom: 30px;">
      <!-- <a slot="extra" href="#">more</a> -->
      <a-button type="primary" icon="tag" @click="addJob()">添加课程任务</a-button>
      <!--      <a-button @click="openNewBrowser()">浏览器多开</a-button>
      <a-button @click="getCourse()">获取课程</a-button> -->
    </a-card>

    <as-tabel :list="list"></as-tabel>


  </div>
</template>


<script>
  import AsTabel from './components/AsTable.vue'
  import api from '../../api/index.js'
 
  export default {
    components: {
      AsTabel
    },
    data() {
      return {
        list: [],

      }
    },
    methods: {
      addJob() {



        // api.getCxConfig().then(cfg => {
        //   let config = cfg.data.data
        //   api.getCourse().then(r => {
        //     let course = r.data.data
        //     course.forEach((data, index) => {
        //       console.log(data);
        //       this.list.push(Object.assign(data,config))
        //     })

        //   }).catch(e => {
        //     console.error(e);
        //   })
        // }).catch(e => {
        //   console.error(e);
        // })
      },
      openNewBrowser() {
        api.openBrowser()
      },
      getCourse() {
        api.getCourse().then(r => {
          console.log(r.data);
          // this.list = r.data
        }).catch(e => {
          console.error(e);
        })


      }
    },
    mounted() {

    },
  }
</script>

<style scoped>

</style>
