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


function login(postData){
    const code = postData['code'];
    const nickName = postData['nickName'];
    const avatarUrl = postData['avatarUrl'];

    let userid;
    let openid;
    let session_key;

    //根据code 调用微信api 获取 openid（openid是微信用户在该小程序下的唯一标识）
    let promise = httpRequest('GET', WEIXIN_JSCODE2_API, {appid: APPID, secret: SECRET, js_code: code, grant_type: GRANT_TYPE});

    return promise.then(result =>{
        if (!result || result.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        let ret = JSON.parse(result);
        session_key = ret['session_key'];
        if (!session_key || session_key.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }
        openid = ret['openid'];
        if (!openid || openid.length <= 0){
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        //根据openid查询auth表，如果openid已经存在，说明该用户已经注册过，直接走登录流程，生成新的session,并返回给小程序cookie
        //如果openid不存在，则先注册该用户（在表中插入），然后在走登录流程，生成新的session,并返回给小程序cookie
        let sql = 'select * from user_auths where auth_id = ?';
        return exec(sql, openid);
    }).then(result =>{
        console.log('query openid');
        // console.log(result);

        if (result.length <= 0){
            //未注册 调用'regist'的存储过程
            userid = UUID.v1();
            userid = userid.replace(/\-/g,'');
            console.log('userid' + userid);
            
            const auth_type = 'wechat-mini';

            let createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            // let sql = "SET @retCode = 0; CALL regist('" + openid + "','" + userid + "','" + auth_type + "','" + nickName + "','" + avatarUrl + "','" + createTime + "', @retCode); SELECT @retCode;";
            // return exec(sql);
            //以上这种写法需要在mysql的配置中设置 multipleStatements:true
            let sql = 'call regist(?,?,?,?,?,?, @resultCode);';

            return exec(sql, [openid, userid, auth_type, nickName, avatarUrl, createTime]);
        }else{
            //已经存在
            //登录流程
            //获取userid
            userid = result[0]['user_id'];

            return Promise.resolve({operate: 'login'});
        }
    }).then(result =>{
        if (result['operate'] && result['operate'] === 'login'){
            //登录
            return generateUnixRandomNum();
        }else{
            console.log('注册成功');
            let retCode = result[0][0].resultCode;
            if (retCode === 0){
                //注册成功 登录成功
                //生成3rd_session为key openid+session_key为value存入redis
    
                return generateUnixRandomNum();
            }else{
                //注册失败 登录失败
                return Promise.reject(ErrorCode.ErrorCode_LoginFailed);
            }
        }
    }).then(result =>{
        let key = result;
        let value = {openid: openid, session_key: session_key, userid: userid};

        //save in Redis 
        setRedis(key, value, 30*24*60*60);

        return Promise.resolve(key);
    }).catch(error =>{
        console.log('失败');
        return Promise.reject(error);
    });
}

module.exports = {
    login
}