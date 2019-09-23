const { getHomePageData } = require('../src/controller/homepage.js')
const { SuccessModel } = require('../src/model/resModel.js')
const ErrorCode = require('../src/consts/const.js');
const {DefinedError} = require('../src/model/errorModel.js');

//登录检查中间件
const LoginCheck = require('../src/middleware/loginCheck.js');

const router = require('koa-router')()

const HOMEPAGE_INFO = '/homepage';

router.prefix('/api/homepage')

router.get(HOMEPAGE_INFO, LoginCheck, async function (ctx, next) {
    // throw Error('炸了');
    // throw new DefinedError(ErrorCode.ErrorCode_NotLogin);

    let result = await getHomePageData();
    ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);


    // try {
    //     let result = await getHomePageData();

    //     //还可以直接ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
    //     // ctx.body = JSON.stringify(new SuccessModel(result, ErrorCode.ErrorCode_Success));

    //     ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
    // } catch (error) {
    //     // try {
    //     //     //由于stringify也可能发生异常，这里catch中嵌套了一个try catch
    //     //     if (error && error.defined_code){
    //     //         ctx.body = JSON.stringify(new ErrorModel(null, error));
    //     //     }else{
    //     //         ctx.body = JSON.stringify(new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError))
    //     //     }
    //     // } catch (error) {
    //     //     ctx.body = ErrorCode.ErrorCode_DefaultError;
    //     // }

    //     if (error && error.defined_code){
    //         ctx.body = new ErrorModel(null, error);
    //     }else{
    //         ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
    //     }
    // }
})


module.exports = router;