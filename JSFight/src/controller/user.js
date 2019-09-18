const httpRequest = require('../common/httpRequest.js');
const { exec } = require('../db/mysql.js');
const ErrorCode = require('../consts/const.js');
const UUID = require('node-uuid');
const moment = require("moment");
const { generateUnixRandomNum } = require('../common/utils.js');
const { setRedis, getRedis } = require('../db/redis.js');

const WEIXIN_JSCODE2_API = 'https://api.weixin.qq.com/sns/jscode2session';
const APPID = 'wx522904dc52b9effe';
const SECRET = '053dada779147816de20b5614bd54c11';
const GRANT_TYPE = 'authorization_code';


async function login(ctx){
    try {
        //参数判断
        let postData = ctx.request.body;
        if (!postData) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if(postData['code'] == null || postData['nickName'] == null){
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        const code = postData['code'];
        const nickName = postData['nickName'];
        const avatarUrl = postData['avatarUrl'];

        let result = await httpRequest('GET', WEIXIN_JSCODE2_API, {appid: APPID, secret: SECRET, js_code: code, grant_type: GRANT_TYPE});
        if (!result || result.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        let ret = JSON.parse(result);

        
        let openid = ret['openid'];
        if (!openid || openid.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }
        
        let session_key = ret['session_key'];
        if (!session_key || session_key.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        let sql = 'select * from user_auths where auth_id = ?';
        let result_1 = await exec(sql, openid);

        if (!result_1 || result_1.length <= 0){
            //不存在，说明未注册，调用'regist'的存储过程
            let userid = UUID.v1();
            userid = userid.replace(/\-/g,'');
            console.log('userid' + userid);
            
            const auth_type = 'wechat-mini';

            let createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            // let sql = "SET @retCode = 0; CALL regist('" + openid + "','" + userid + "','" + auth_type + "','" + nickName + "','" + avatarUrl + "','" + createTime + "', @retCode); SELECT @retCode;";
            // return exec(sql);
            //以上这种写法需要在mysql的配置中设置 multipleStatements:true
            let sql = 'call regist(?,?,?,?,?,?, @resultCode);';

            //执行注册存储过程
            let result_2 = await exec(sql, [openid, userid, auth_type, nickName, avatarUrl, createTime]);
            let retCode = result_2[0][0].resultCode;
            if (retCode === 0){
                //注册成功 登录成功
                //生成3rd_session为key openid+session_key为value存入redis
    
                let key = await generateUnixRandomNum();
                let value = {openid: openid, session_key: session_key, userid: userid};
        
                //save in Redis 设置该key的过期时间
                setRedis(key, value, 30*24*60*60);
        
                return Promise.resolve(key);
            }else{
                //注册失败 登录失败
                return Promise.reject(ErrorCode.ErrorCode_LoginFailed);
            }
        }else{
            //已经存在，直接走登录流程
            let userid = result_1[0]['user_id'];

            let key = await generateUnixRandomNum();
            let value = {openid: openid, session_key: session_key, userid: userid};
    
            //save in Redis 
            setRedis(key, value, 30*24*60*60);
    
            return Promise.resolve(key);
        }

    } catch (error) {
        return Promise.reject(error);
    }
};

async function changeUserProfile(ctx){
  //TODO

};

module.exports = {
    login,
    changeUserProfile
}