const moment = require("moment");
const { exec } = require('../db/mysql.js');
const { InternalErrorCode, ExternalErrorCode } = require('../consts/const.js');
const { InternalError, ExternalError } = require('../model/errorModel.js');

async function scoresForPlayers(ctx) {
    //首先判断参数
    let postData = ctx.request.body;
    if (!postData) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['match_id'] == null || postData['match_id'].length <= 0) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['scores'] == null) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (Object.prototype.toString.call(postData['scores']) !== "[object Array]") {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_InvalidParams);
    }

    if (postData['scores'].length <= 0) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
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
        let flag = false;

        let matchid = postData['match_id'];
        let scores = postData['scores'];
        let userid = ctx.userid;
        let scoreTime = moment().format('YYYY-MM-DD HH:mm:ss');

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
            throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
        }

        console.log(scoreArray);
        let sql = 'insert into scores(match_id, player_id, score, score_time, score_author_id, player_name) values ?';
        let result;
        try {
            //TODO
            result = await exec(sql, [scoreArray]);
        } catch (error) {
            throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
        }
        return result;
    } else {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_NotScoreTime);
    }
}

async function getOnCourtPlayers(ctx) {
    //判断参数
    let postData = ctx.request.body;
    if (!postData) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['match_id'] == null || postData['match_id'].length <= 0) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    let match_id = postData['match_id'];
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
    //判断参数
    let postData = ctx.request.body;
    if (!postData) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    if (postData['match_id'] == null || postData['match_id'].length <= 0) {
        throw ExternalError(null, ExternalErrorCode.ErrorCode_MissingParams);
    }

    let match_id = postData['match_id'];
    let sql = 'select s.match_id, s.player_id, avg(s.score) ,p.player_name from scores as s left join players as p on s.player_id = p.id where  s.match_id = ? group by s.player_id';
    let result;
    try {
        result = await exec(sql, match_id); 
    } catch (error) {
        throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
    }
    
    return Promise.resolve({ playersScores: result });
}

module.exports = {
    scoresForPlayers,
    getOnCourtPlayers,
    getPlayersScores
}