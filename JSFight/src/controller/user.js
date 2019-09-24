const httpRequest = require('../common/httpRequest.js');
const { exec } = require('../db/mysql.js');
const {InternalErrorCode, ExternalErrorCode} = require('../consts/const.js');
const {InternalError, ExternalError} = require('../model/errorModel.js');
const UUID = require('node-uuid');
const moment = require("moment");
const { generateUnixRandomNum } = require('../common/utils.js');
const { setRedis, getRedis } = require('../db/redis.js');

const WEIXIN_JSCODE2_API = 'https://api.weixin.qq.com/sns/jscode2session';
const APPID = 'wx522904dc52b9effe';
const SECRET = '053dada779147816de20b5614bd54c11';
const GRANT_TYPE = 'authorization_code';


async function login(ctx) {
    //参数判断
    let postData = ctx.request.body;
    if (!postData) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['code'] == null || postData['nickName'] == null) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    const code = postData['code'];
    const nickName = postData['nickName'];
    const avatarUrl = postData['avatarUrl'];

    let result = await httpRequest('GET', WEIXIN_JSCODE2_API, { appid: APPID, secret: SECRET, js_code: code, grant_type: GRANT_TYPE });
    if (!result || result.length <= 0) {
        throw InternalError(null, InternalErrorCode.ErrorCode_WechatJscode2sessionError);
    }

    let ret = JSON.parse(result);


    let openid = ret['openid'];
    if (!openid || openid.length <= 0) {
        throw InternalError(null, InternalErrorCode.ErrorCode_WechatJscode2sessionError);
    }

    let session_key = ret['session_key'];
    if (!session_key || session_key.length <= 0) {
        throw InternalError(null, InternalErrorCode.ErrorCode_WechatJscode2sessionError);
    }

    let sql = 'select * from user_auths where auth_id = ?';
    let result_1;
    try {
        result_1 = await exec(sql, openid);
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }

    if (!result_1 || result_1.length <= 0) {
        //不存在，说明未注册，调用'regist'的存储过程
        let userid = UUID.v1();
        userid = userid.replace(/\-/g, '');
        console.log('userid' + userid);

        const auth_type = 'wechat-mini';

        let createTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

        // let sql = "SET @retCode = 0; CALL regist('" + openid + "','" + userid + "','" + auth_type + "','" + nickName + "','" + avatarUrl + "','" + createTime + "', @retCode); SELECT @retCode;";
        // return exec(sql);
        //以上这种写法需要在mysql的配置中设置 multipleStatements:true
        let sql = 'call regist(?,?,?,?,?,?, @resultCode);';

        //执行注册存储过程
        let result_2;
        try {
            result_2 = await exec(sql, [openid, userid, auth_type, nickName, avatarUrl, createTime]);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        let retCode = result_2[0][0].resultCode;
        if (retCode === 0) {
            //注册成功 登录成功
            //生成3rd_session为key openid+session_key为value存入redis
            let key;
            try {
                key = await generateUnixRandomNum();
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_GenerateUnixRandomNumError);
            }

            let value = { openid: openid, session_key: session_key, userid: userid };

            //save in Redis 设置该key的过期时间
            setRedis(key, value, 30 * 24 * 60 * 60);

            return Promise.resolve(key);
        } else {
            //注册失败 登录失败
            throw ExternalError(null, ExternalErrorCode.ErrorCode_LoginFailed);
        }
    } else {
        //已经存在，直接走登录流程
        let userid = result_1[0]['user_id'];

        let key;
        try {
            key = await generateUnixRandomNum();
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_GenerateUnixRandomNumError);
        }

        let value = { openid: openid, session_key: session_key, userid: userid };

        //save in Redis 
        setRedis(key, value, 30 * 24 * 60 * 60);

        return Promise.resolve(key);
    }
};

async function changeUserProfile(ctx) {
    //TODO

};

module.exports = {
    login,
    changeUserProfile
}