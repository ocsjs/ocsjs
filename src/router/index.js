import Vue from 'vue'
import Router from 'vue-router'


import index from '../views/index/index.vue'
import setting from '../views/setting/index.vue'

Vue.use(Router)



export default new Router({
  routes: [
    {
      path: '/',
      component: index
    },
    {
      path: '/setting',
      component: setting
    }
  ]
})
