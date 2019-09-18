const { scoresForPlayers, getOnCourtPlayers, getPlayersScores } = require('../src/controller/match.js');
const { SuccessModel, ErrorModel } = require('../src/model/resModel.js');
const ErrorCode = require('../src/consts/const.js');

//登录检查中间件
const LoginCheck = require('../src/middleware/loginCheck.js');

const router = require('koa-router')()

//给球员打分接口
const MTACH_SCOREFORPLAYERS = '/scores';

//获取出场球员名单接口
const MATCH_GETONCOURTPLAYERS ='/onCourt';

//赛后AFTER_MATCH获取球员打分情况接口
const MATCH_GETPLAYERSSCORES = '/getScoresForPlayers'

router.prefix('/api/match')

router.post(MTACH_SCOREFORPLAYERS, LoginCheck, async function (ctx, next) {
    try {
        let result = await scoresForPlayers(ctx);

        ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
    } catch (error) {
        if (error && error.defined_code){
            ctx.body = new ErrorModel(null, error);
        }else{
            ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
        }
    }    
});

router.get(MATCH_GETONCOURTPLAYERS, LoginCheck, async function (ctx, next) {
    try {
        let result = await getOnCourtPlayers(ctx);

        ctx.body = new SuccessModel(result, ErrorCode.ErrorCode_Success);
    } catch (error) {
        if (error && error.defined_code){
            ctx.body = new ErrorModel(null, error);
        }else{
            ctx.body = new ErrorModel(error.toString(), ErrorCode.ErrorCode_DefaultError);
        }
    }    
});

router.get(MATCH_GETPLAYERSSCORES, LoginCheck, async function (ctx, next) {
    try {
        let result = await getPlayersScores(ctx);

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

