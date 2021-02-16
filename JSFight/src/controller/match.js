const moment = require("moment");
const { exec } = require('../db/mysql.js');
const { InternalErrorCode, ExternalErrorCode } = require('../consts/const.js');
const { InternalError, ExternalError } = require('../model/errorModel.js');

async function scoresForPlayers(ctx) {
    //首先判断参数
    let postData = ctx.request.body;
    if (!postData) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['match_id'] == null || postData['match_id'].length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['scores'] == null) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (Object.prototype.toString.call(postData['scores']) !== "[object Array]") {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_InvalidParams);
    }

    if (postData['scores'].length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }



    //首先得判断现在的状态是不是AFTER_MATCH，才允许给球员打分
    let sql = 'select hp_status from homePageStatus';

    let result;
    try {
        result = await exec(sql);
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }

    if (!result || result.length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_InvalidHomePageStatus);
    }

    let hpStatus = result[0]['hp_status'];

    if (hpStatus === 'AFTER_MATCH') {
        //TODO 还要判断该用户是否已经给该场比赛打分，不能重复打分
        let matchid = postData['match_id'];
        let userid = ctx.userid;

        //判断该用户是否已经给该场比赛打分，不能重复打分
        let sql ='select count(*) as count from scores where match_id =? and score_author_id = ?';
        let result;
        try {
            result = await exec(sql, [matchid, userid]);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        let count = result[0].count;
        if (count <= 0){
            //尚未打分
            let scores = postData['scores'];
            let scoreTime = moment().format('YYYY-MM-DD HH:mm:ss');
            let flag = false;
    
            let scoreArray = new Array();
    
            for (let i = 0; i < scores.length; i++) {
                let scoreObj = scores[i];
    
                let score = scoreObj['score'];
                let playername = scoreObj['player_name'];
                let playerid = scoreObj['player_id'];
    
                if (score == null || playerid == null) {
                    flag = true;
                    break;
                }
    
                scoreArray.push([matchid, playerid, score, scoreTime, userid, playername]);
            }
    
            if (flag) {
                throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
            }
    
            console.log(scoreArray);
            let sql = 'insert into scores(match_id, player_id, score, score_time, score_author_id, player_name) values ?';
            let result;
            try {
                result = await exec(sql, [scoreArray]);
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
            }
            let affrectedRows = result.affectedRows;
            if (affrectedRows <= 0){
                //打分失败
                throw new ExternalError(null, ExternalErrorCode.ErrorCode_ScoreFailed);
            }
            return Promise.resolve(null);
        }else{
            //已经打过分
            throw new ExternalError(null, ExternalErrorCode.ErrorCode_HaveScored);
        }
    } else {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_NotScoreTime);
    }
}

async function getOnCourtPlayers(ctx) {
    //判断参数
    let getData = ctx.request.query;
    if (!getData) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (getData['match_id'] == null || getData['match_id'].length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    let match_id = getData['match_id'];
    let sql = 'select * from onCourt where match_id = ?';
    let result;
    try {
        result = await exec(sql, match_id);
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }

    return Promise.resolve({ onCourtPlayers: result });
}

async function getPlayersScores(ctx) {
    // throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);

    //判断参数
    let getData = ctx.request.query;
    if (!getData) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (getData['match_id'] == null || getData['match_id'].length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    let match_id = getData['match_id'];
    // let sql = 'select s.match_id, s.player_id, avg(s.score) ,p.player_name from scores as s left join players as p on s.player_id = p.id where s.match_id = ? group by s.player_id';
    let sql = 'select s.match_id, s.player_id, avg(s.score) as avgscore, c.player_name, c.court_type from scores as s left join onCourt as c on s.player_id = c.player_id where s.match_id = ? group by s.player_id, c.player_name, c.court_type order by avgscore desc';
    let result;
    try {
        result = await exec(sql, match_id); 
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }
    
    return Promise.resolve({ playersScores: result });
}

async function getScorePageInfo(ctx){
    //参数判断
    let getData = ctx.request.query;
    if (!getData) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (getData['match_id'] == null || getData['match_id'].length <= 0) {
        throw new ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    let match_id = getData['match_id'];

    //给球员打分页面的接口，获取比赛信息，判断用户是否已经打分，获取出场球员名单，出场球员评分
    //match, score, onCourt 三张表
    //首先判断该用户是否已经打分
    let userid = ctx.userid;
    let sql = 'select count(*) as count from scores where match_id = ? and score_author_id = ?';
    let result;
    try {
        result = await exec(sql, [match_id, userid]); 
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }

    if (!result || result.length <= 0){
        throw new InternalError(null, InternalErrorCode.ErrorCode_MysqlQueryError_1);
    }

    let count = result[0].count;
    if (count <= 0){
        //还未打分，显示打分页面
        //查询这场比赛的出场名单 onCourt和这场比赛的信息
        let match_sql = 'select * from matches where id = ?';
        let matchResult;
        try {
            matchResult = await exec(match_sql, match_id);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        if (!matchResult || matchResult.length <= 0){
            throw new InternalError(null, InternalErrorCode.ErrorCode_MysqlQueryError_1);
        }

        //该场比赛的信息
        let currentMatch = matchResult[0];
        //该场比赛出场名单
        let onCourtSql = 'select * from onCourt where match_id = ?';
        let onCourtResult;
        try {
            onCourtResult = await exec(onCourtSql, match_id);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        if (!onCourtResult || onCourtResult.length <= 0){
            throw new InternalError(null, InternalErrorCode.ErrorCode_MysqlQueryError_1);
        }

        return Promise.resolve({hasScored:false, match: currentMatch, courtList: onCourtResult });
    }else{
        //已经打分，显示球员评分（平均分）页面和该场比赛的信息
        let match_sql = 'select * from matches where id = ?';
        let matchResult;
        try {
            matchResult = await exec(match_sql, match_id);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        if (!matchResult || matchResult.length <= 0){
            throw new InternalError(null, InternalErrorCode.ErrorCode_MysqlQueryError_1);
        }

        //该场比赛的信息
        let currentMatch = matchResult[0];

        //该场比赛各位球员出场的平均分
        //
        // select s.match_id, s.player_id, avg(s.score) as avgscore, c.player_name, c.court_type from scores as s left join onCourt as c on s.player_id = c.player_id where s.match_id = 1 group by s.player_id, c.player_name, c.court_type order by avgscore desc;
        let avgSql = 'select s.match_id, s.player_id, avg(s.score) as avgscore, c.player_name, c.court_type from scores as s left join onCourt as c on s.player_id = c.player_id where s.match_id = ? group by s.player_id, c.player_name, c.court_type order by avgscore desc';
        let avgResult;
        try {
            avgResult = await exec(avgSql, match_id);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }

        if (!avgResult || avgResult.length <= 0){
            throw new InternalError(null, InternalErrorCode.ErrorCode_MysqlQueryError_1);
        }

        return Promise.resolve({hasScored:true, match: currentMatch, avgList: avgResult });
    }
}

module.exports = {
    scoresForPlayers,
    getOnCourtPlayers,
    getPlayersScores,
    getScorePageInfo
}