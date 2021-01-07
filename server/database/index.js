const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient
const db_name = 'ocs-helper'
const url = "mongodb://localhost:27017/" + db_name;

//创建数据库
MongoClient.connect(url, (err, db) => {
  if (err) throw err;
});


module.exports = {
  //获取指定集合
  openCollection(callback) {
    MongoClient.connect(url, (err, db) => {
      if (err) reject(err);
      var dbase = db.db(db_name);
      callback(dbase.collection("config"), db)
    })
  },

  //获取配置 , type 是配置类型
  getConfig(type) {
    return new Promise((resolve, reject) => {
      this.openCollection((col, db) => {
        col.find({
          "type": type
        }).toArray((err, result) => { // 返回集合中所有数据
          if (err) reject(err);
          console.log(type + ":result", result);
          //直返回一个数据
          resolve(result[0])
          db.close();
        });
      })

    })
  },
  setConfig(config) {
    return new Promise((resolve, reject) => {
      this.openCollection((col, db) => {
        //查询config
        this.getConfig(config.type).then(result => {
          //如果没有数据则插入，否则直接更新
          if (result) {
            var updateStr = {
              $set: config
            };
            col.updateOne({
              "type": config.type
            }, updateStr, (err, res) => {
              if (err) reject(err);
              console.log("更新配置成功");
              resolve(res.result.ok)
              db.close();
            });
          } else {
            console.log("插入配置");
            col.insertOne(config, (err, res) => {
              if (err) reject(err);
              console.log("插入配置成功");
              resolve(res.result.ok)
              db.close();
            });


          }
        }).catch(e => {
          console.error(e);
        })
      })
    })
  },
  //获取任务
  getJob() {

  },




}
