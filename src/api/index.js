import request from '../utils/request.js'

export default {

  runCourse(url,script) {
    return request({
      method: 'post',
      url: '/ocs/run/course',
      data:{
         url,
         script,
      }
    })
  },

  //获取课程
  getCourse() {
    return request({
      method: 'get',
      url: '/ocs/get/course'
    })
  },
  //新开浏览器
  openBrowser() {
    return request({
      method: 'get',
      url: '/open/browser'
    })
  },
  //获取配置
  getConfig(type) {
    return request({
      method: 'get',
      url: `/ocs/get/config/${type}`
    })
  },
  //获取配置
  setConfig(config) {
    return request({
      method: 'post',
      url: `/ocs/set/config`,
      data: config
    })
  },
  //设置超星配置
  setCxConfig(config) {
    let cx_config = Object.assign(config, {
      type: 'cx'
    })
    return this.setConfig(cx_config)
  },
  //获取超星配置
  getCxConfig() {
    return this.getConfig("cx")
  },
  //设置基础配置
  setBaseConfig(config) {
    let base_config = Object.assign(config, {
      type: 'base'
    })
    return this.setConfig(base_config)
  },
  //获取基础配置
  getBaseConfig() {
    return this.getConfig("base")
  }



}
