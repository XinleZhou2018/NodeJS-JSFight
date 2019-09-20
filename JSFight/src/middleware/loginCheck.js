const { ErrorModel } = require('../model/resModel.js')
const { getRedis } = require('../db/redis.js');
const ErrorCode = require('../consts/const.js');

const queryString = require("querystring");


module.exports = async (ctx, next) =>{
    console.log(ctx.headers);

    console.log(ctx.headers.cookie);
    try {
        let cookieValue = queryString.parse(ctx.headers.cookie);
        if (!cookieValue['session_id'] || cookieValue['session_id'].length <= 0){
            ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_NotLogin);
        }else{
            let session_id = cookieValue['session_id'];

            let value = await getRedis(session_id);
    
            if (value == null || value['userid'] == null || value['userid'].length <= 0){
                ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_NotLogin);
            }else{
                ctx.userid = value['userid'];
                await next();
            }
        }
    } catch (error) {
        ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
    }

    // let cookieValue = queryString.parse(ctx.headers.cookie,';');

};
