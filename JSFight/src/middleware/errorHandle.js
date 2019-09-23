const {DefinedError} = require('../model/errorModel.js');
const ErrorCode = require('../consts/const.js');
const { ErrorModel } = require('../model/resModel.js');

async function errorHandler(ctx, next){
    try {
        await next();
      } catch (err) {
        //可以直接在这里进行处理，也可以使用ctx.app.emit手动释放错误，在app.on('error', function(err) 监听函数中监听到错误
        // ctx.app.emit("error", err, ctx);

        /**
         * 错误分为已知错误和未知错误
         * 1, 已知错误可以在代码中直接throw,例如 throw new DefinedError(ErrorCode.ErrorCode_NotLogin)
         * 又比如   try {
             cookieValue = queryString.parse(ctx.request.header.cookie);
        } catch (error) {
            throw new DefinedError(ErrorCode.ErrorCode_QueryStringParseError);
        }
        利用try catch捕捉可能存在的错误。
            2，未知错误，代码错误
            var test = undefined;
            console.log(test.toString());
            或者连接数据库的用户名和密码错误等
         */

         //已知错误都可以throw出自己包装的DefinedError对象
         //未知错误直接由系统捕捉到Error对象

         if (err instanceof DefinedError){
            //已知错误
            //已知错误中，有些错误原因也是不可以直接告知前端，直接返回一个通用错误即可。这里区分是为了存储错误日志
            if (err.errorObj.type && err.errorObj.type === 'Internal'){
                //Internal是一个内部错误(例如解析json错误等)，原因不需要告诉前端
                ctx.status = err.errorObj.status == null ? 200 : err.errorObj.status;
                ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_DefaultError);
            }else{
                //可以告知前端真实原因的错误
                ctx.status = err.errorObj.status == null ? 200 : err.errorObj.status;
                ctx.body = new ErrorModel(null, err.errorObj);
            }
         }else{
            //未知错误 这里通过err.toString()把错误原因告诉了前端(方便debug)，其实也可以不告诉前端
            ctx.status = 500;
            ctx.body = new ErrorModel(err.toString(), ErrorCode.ErrorCode_DefaultError);
            // ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_DefaultError);
         }
      }
}

module.exports =  errorHandler;