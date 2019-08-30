const { getRedis } = require('../db/redis.js');
const ErrorCode = require('../consts/const.js');

function judgeUserIsLogin(req){
    return new Promise((resolve, reject) =>{
        if (!req.cookie['session_id'] || req.cookie['session_id'].length <= 0){
            reject(ErrorCode.ErrorCode_CookieNotContainsSessionID);
            return;
        }

        let session_id = req.cookie['session_id'];

        getRedis(session_id).then(value =>{
            if (value == null || value['userid'] == null || value['userid'].length <= 0){
                reject(ErrorCode.ErrorCode_NotLogin);
                return;
            }

            resolve(value['userid']);
        }).catch(err =>{
            reject(err);
        });
    });
}

module.exports = {
    judgeUserIsLogin
}