const mysql = require('mysql');
const { MYSQL_CONF } = require("../conf/db.js");

//创建链接对象
const con = mysql.createConnection(MYSQL_CONF);

//开始连接
con.connect();

//统一执行sql的函数
//这里使用Promise异步操作数据库
function exec(sql, params) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });

    
  });
}

//输出统一执行sql的函数
module.exports = {
  exec
};