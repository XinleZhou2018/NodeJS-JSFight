//读取环境变量参数，这个参数是在package.json中设置的
/*
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=development nodemon ./bin/www.js",
    "prd": "cross-env NODE_ENV=production nodemon ./bin/www.js"
  }
*/
const env = process.env.NODE_ENV;

//配置数据库基本参数
let MYSQL_CONF;
let REDIS_CONF;

//开发环境
if (env === "development") {
    // mysql
    MYSQL_CONF = {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "12345678",
      database: "jsFight",
      dateStrings: true,
      charset:'utf8mb4'
      // multipleStatements:true
    };

    REDIS_CONF = {
      host: '127.0.0.1',
      port: 6379
    };
  }
  
  //线上环境 这里暂时还没有上线，所以还是配置的本机环境
  if (env === "production") {
    MYSQL_CONF = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "12345678",
        database: "jsFight",
        dateStrings: true,
        charset:'utf8mb4'
        // multipleStatements:true
      };

      REDIS_CONF = {
        host: '127.0.0.1',
        port: 6379
      };
  }
  
  module.exports = {
    MYSQL_CONF,
    REDIS_CONF
  };