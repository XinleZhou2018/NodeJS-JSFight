const { login, changeUserProfile } = require('../src/controller/user.js');
const { SuccessModel } = require('../src/model/resModel.js');
const {SuccessCode} = require('../src/consts/const.js');

const router = require('koa-router')()

//登录检查中间件
const LoginCheck = require('../src/middleware/loginCheck.js');

//用户登录
const USER_LOGIN = '/login';

//修改个人信息-昵称和头像，每次进入微信小程序后，获取用户信息，然后上传昵称和头像等
const USER_CHANGEPROFILE = '/changeprofile';

router.prefix('/api/user')

router.post(USER_LOGIN, async function (ctx, next) {
  let result = await login(ctx);
  ctx.body = new SuccessModel(result, SuccessCode);
});

router.post(USER_CHANGEPROFILE, LoginCheck, async function (ctx, next) {
  //TODO
  let result = await changeUserProfile(ctx);
  ctx.body = new SuccessModel(result, SuccessCode);
});

module.exports = router;
