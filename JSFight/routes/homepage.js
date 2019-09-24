const { getHomePageData } = require('../src/controller/homepage.js')
const { SuccessModel } = require('../src/model/resModel.js')
const {SuccessCode} = require('../src/consts/const.js');

//登录检查中间件
const LoginCheck = require('../src/middleware/loginCheck.js');

const router = require('koa-router')()

const HOMEPAGE_INFO = '/homepage';

router.prefix('/api/homepage')

router.get(HOMEPAGE_INFO, LoginCheck, async function (ctx, next) {
    let result = await getHomePageData();
    ctx.body = new SuccessModel(result, SuccessCode);
})


module.exports = router;