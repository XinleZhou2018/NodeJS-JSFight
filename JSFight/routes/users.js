const { login, changeUserProfile } = require('../src/controller/users.js');
const { SuccessModel, ErrorModel } = require('../src/model/resModel.js');
const ErrorCode = require('../src/consts/const.js');

const router = require('koa-router')()

//用户登录
const USER_LOGIN = '/login';

//修改个人信息-昵称和头像，每次进入微信小程序后，获取用户信息，然后上传昵称和头像等
const USER_CHANGEPROFILE = '/changeprofile';

router.prefix('/api/user')

router.post(USER_LOGIN, async function (ctx, next){
  try {
      let result = await login(ctx);

      ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
  } catch (error) {
      if (error && error.defined_code){
          ctx.body = new ErrorModel(null, error);
      }else{
          ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
      }
  }    
});

router.post(USER_CHANGEPROFILE, async function (ctx, next){
  //TODO
  try {
    let result = await changeUserProfile(ctx);
    ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
  } catch (error) {
    if (error && error.defined_code){
      ctx.body = new ErrorModel(null, error);
  }else{
      ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
  }
  }    
});

module.exports = router;
