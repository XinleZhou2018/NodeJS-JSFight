const { ErrorModel } = require('../model/resModel.js')
const { getRedis } = require('../db/redis.js');


module.exports = async (ctx, next) =>{
    if (!ctx.cookies.get('session_id') || ctx.cookies.get('session_id').length <= 0){
        ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_NotLogin);
    }else{
        let session_id = ctx.cookies.get('session_id');

        try {
            let value = await getRedis(session_id);

            if (value == null || value['userid'] == null || value['userid'].length <= 0){
                ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_NotLogin);
            }else{
                ctx.userid = value['userid'];
                await next();
            }
        } catch (error) {
            ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_RedisReadError);
        }
    }
};
