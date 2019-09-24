const { scoresForPlayers, getOnCourtPlayers, getPlayersScores } = require('../src/controller/match.js');
const { SuccessModel } = require('../src/model/resModel.js');
const {SuccessCode} = require('../src/consts/const.js');

//登录检查中间件
const LoginCheck = require('../src/middleware/loginCheck.js');

const router = require('koa-router')()

//给球员打分接口
const MTACH_SCOREFORPLAYERS = '/scores';

//获取出场球员名单接口
const MATCH_GETONCOURTPLAYERS = '/onCourt';

//赛后AFTER_MATCH获取球员打分情况接口
const MATCH_GETPLAYERSSCORES = '/getScoresForPlayers'

router.prefix('/api/match')

router.post(MTACH_SCOREFORPLAYERS, LoginCheck, async function (ctx, next) {
    let result = await scoresForPlayers(ctx);
    ctx.body = new SuccessModel(result, SuccessCode);
});

router.get(MATCH_GETONCOURTPLAYERS, LoginCheck, async function (ctx, next) {
    let result = await getOnCourtPlayers(ctx);
    ctx.body = new SuccessModel(result, SuccessCode);
});

router.get(MATCH_GETPLAYERSSCORES, LoginCheck, async function (ctx, next) {
    let result = await getPlayersScores(ctx);
    ctx.body = new SuccessModel(result, SuccessCode);
});


module.exports = router;

