var express = require('express');
var app = express();
const ocs = require('./ocs.js')
const db = require('./database/index.js')
var bodyParser = require('body-parser');
app.use(bodyParser.json());

const puppeteer = require('puppeteer-core');
(async () => {

  const browser = await puppeteer.connect({
    defaultViewport: null,
    browserWSEndpoint: "ws://localhost:9222/devtools/browser/dd832f3c-97be-42c2-8dfb-c95e844f0a67"
  })

  const page = await browser.newPage();
  await page.goto('http://baidu.com/');

})();


//设置跨域
//跨域设置(所有域名)
app.all('*', function(req, res, next) {
  //其中*表示允许所有域可跨
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

//多开浏览器
app.get('/open/browser', (req, res) => {
  console.log();
  let driver = ocs.newBrowser()
  driver.get('https://baidu.com')
  res.end()
})

app.get('/ocs/get/course', (req, res) => {
  console.log('开始登录');
  //开始登录
  ocs.startLogin().then(driver => {

    ocs.getCourse(driver).then(r => {
      res.send(formatData(r))
      driver.quit().then(r => {}).catch(e => {})
    }).catch(e => {
      console.error(e);
    })
  })
})

app.get('/ocs/get/config/:type', (req, res) => {
  db.getConfig(req.params.type).then(r => {
    res.send(formatData(r))
  }).catch(e => {
    console.error(e);
  })
})

app.post('/ocs/run/course', (req, res) => {

   ocs.startLogin().then(driver=>{
      ocs.intoCourse(driver,req.body.url).then(r=>{
        if(r){
   
          driver.executeScript(req.body.script)
          res.send(formatData(driver))
          res.end()
        }
      }).catch(e=>{
        console.error(e);
      })
   }).catch(e=>{
     console.error(e);
   })
})

app.post('/ocs/set/config', (req, res) => {
  console.log(req.body);
  db.setConfig(req.body).then(r => {
    res.send(formatData(r))
  }).catch(e => {
    console.error(e);
  })
})

function formatData(obj){
  return {
    code:obj?1:0,
    data:obj
  }
}

var server = app.listen(8088, () => {

  console.log("auto-script-template已经开启");

})
