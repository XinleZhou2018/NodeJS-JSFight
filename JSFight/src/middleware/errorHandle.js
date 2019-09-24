const {InternalError, ExternalError} = require('../model/errorModel.js');
const {DefaultErrorCode} = require('../consts/const.js');
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

         if (err instanceof InternalError){
            //已知错误，内部错误（不需要告知前端的错误，但是需要存储错误日志）

            //记录存储日志 err.message err.errorObj TODO
            // if(err.message == null){
            //     err.errorObj.msg
            // }
    
            //返回给前端
            ctx.status = 500;
            ctx.body = new ErrorModel(null, DefaultErrorCode);
         }else if (err instanceof ExternalError){
             //已知错误，外部错误（需要告知前端的错误）
             ctx.status = 200;
             ctx.body = new ErrorModel(null, err.errorObj);
         }
         else{
            //未知错误 这里通过err.toString()把错误原因告诉了前端(方便debug)，其实也可以不告诉前端
            //记录错误日志 TODO err.toString()
            ctx.status = 500;
            // ctx.body = new ErrorModel(err.toString(), ErrorCode.ErrorCode_DefaultError);
            ctx.body = new ErrorModel(null, DefaultErrorCode);
         }
      }
}

module.exports =  errorHandler;