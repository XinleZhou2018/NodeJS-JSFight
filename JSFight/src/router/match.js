/*
    有关Match的路由类
 */

const moment = require("moment");

const { scoresForPlayers, getOnCourtPlayers, getPlayersScores } = require('../controller/match.js');
const { SuccessModel, ErrorModel } = require('../model/resModel.js');
const ErrorCode = require('../consts/const.js');
const { judgeUserIsLogin } = require('../common/common.js');

//给球员打分接口
const MTACH_SCOREFORPLAYERS = '/api/match/scores';

//获取出场球员名单接口
const MATCH_GETONCOURTPLAYERS ='/api/match/onCourt';

//赛后AFTER_MATCH获取球员打分情况接口
const MATCH_GETPLAYERSSCORES = '/api/match/getScoresForPlayers'



function handleMatchRoute(req, res){
    const method = req.method;

    if (method === 'POST' && req.path === MTACH_SCOREFORPLAYERS){
        //首先判断用户是否登录
        return judgeUserIsLogin(req).then(value =>{
            let postData = req.body;
            if (!postData){
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }
    
            if(postData['match_id'] == null || value == null){
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }

            if (postData['scores'] && Object.prototype.toString.call(postData['scores']) === "[object Array]" && postData['scores'].length > 1){
                return scoresForPlayers(postData, value, moment().format('YYYY-MM-DD HH:mm:ss'));
            }else{
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }
        }).then(value =>{
            return new SuccessModel(value, ErrorCode.ErrorCode_Success); 
        }).catch(err =>{
            return Promise.reject(err);
        });
    }

    if (method === 'GET' && req.path === MATCH_GETONCOURTPLAYERS){
        //首先判读用户是否登录
        return judgeUserIsLogin(req).then(value =>{
            let queryParams = req.query;

            if (!queryParams || !queryParams['match_id']){
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }
    
            return getOnCourtPlayers(queryParams['match_id']);
        }).then(value =>{
            return new SuccessModel(value, ErrorCode.ErrorCode_Success); 
        }).catch(err =>{
            return Promise.reject(err);
        });
    }

    if (method === 'GET' && req.path === MATCH_GETPLAYERSSCORES){
        //首先判读用户是否登录
        return judgeUserIsLogin(req).then(value =>{
            let queryParams = req.query;

            if (!queryParams || !queryParams['match_id']){
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }
    
            return getPlayersScores(queryParams['match_id']);
        }).then(value =>{
            return new SuccessModel(value, ErrorCode.ErrorCode_Success); 
        }).catch(err =>{
            return Promise.reject(err);
        });
    }
}

module.exports = handleMatchRoute;