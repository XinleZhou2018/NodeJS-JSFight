const redis = require("redis");
const { REDIS_CONF } = require("../conf/db.js");

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

//记录redis的错误
redisClient.on("error", err => {
    //TODO 可能需要存到日志中
    console.log(err);
});

function setRedis(key, val, expire) {
  //如果val是object，转成json数据保存
  if (typeof val === "object") val = JSON.stringify(val);
  redisClient.set(key, val);
  //设置该key的过期时间
  if(expire){
    redisClient.expire(key, expire);
  }
}

function getRedis(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) return reject(err);

      if (val == null) return resolve(null);

      try {
        resolve(JSON.parse(val));
      } catch (error) {
        resolve(val);
      }
    });
  });
}

module.exports = {
  setRedis,
  getRedis
};
