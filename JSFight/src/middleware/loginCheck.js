const { getRedis } = require('../db/redis.js');
const { ExternalErrorCode, InternalErrorCode } = require('../consts/const.js');
const {InternalError, ExternalError} = require('../model/errorModel.js');

const queryString = require("querystring");


module.exports = async (ctx, next) =>{
    // console.log(ctx.headers);

    console.log(ctx.request.header);

    // await new Promise((resolve, reject)=> {
    //     reject('严重的错误');
    // });

        let cookieValue;
        try {
            cookieValue = queryString.parse(ctx.request.header.cookie);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_QueryStringParseError);
        }

        if (!cookieValue['session_id'] || cookieValue['session_id'].length <= 0){
            throw new ExternalError(null ,ExternalErrorCode.ErrorCode_NotLogin);
        }else{
            let session_id = cookieValue['session_id'];

            let value
            try {
                value = await getRedis(session_id);
            } catch (error) {
                throw InternalError(error.toString(), InternalErrorCode.ErrorCode_RedisReadError);
            }
             
            if (value == null || value['userid'] == null || value['userid'].length <= 0){
                throw new ExternalError(null ,ExternalErrorCode.ErrorCode_NotLogin);
            }else{
                ctx.userid = value['userid'];
                await next();
            }
        }
};
