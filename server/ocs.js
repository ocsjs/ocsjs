const ocs = require('auto-script-ocs')
const db = require('./database/index.js')
let config
db.getConfig('base').then(base_cfg => {
  db.getConfig('cx').then(cx_cfg => {
    config = Object.assign(base_cfg, cx_cfg)
    //初始化 service
    ocs.initService(config.chrome_version)
  })
})

module.exports = {

  intoCourse(driver, url) {
     return ocs.intoCourse(driver, url)
  },
  getCourse(driver) {
    return ocs.getCourse(driver)
  },
  startLogin() {
    return ocs.startLogin(config)
  },


  newBrowser() {
    return ocs.newBrowser(config.chrome_version)
  }
}
