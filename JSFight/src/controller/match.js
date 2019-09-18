const moment = require("moment");
const { exec } = require('../db/mysql.js');
const ErrorCode = require('../consts/const.js');

async function scoresForPlayers(ctx) {
    try {
        //首先判断参数
        let postData = ctx.request.body;
        if (!postData) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if (postData['match_id'] == null || postData['match_id'].length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if (postData['scores'] == null) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if (Object.prototype.toString.call(postData['scores']) !== "[object Array]") {
            return Promise.reject(ErrorCode.ErrorCode_InvalidParams);
        }

        if (postData['scores'].length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }



        //首先得判断现在的状态是不是AFTER_MATCH，才允许给球员打分
        let sql = 'select hp_status from homePageStatus';

        let result = await exec(sql);
        if (!result || result.length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_InvalidHomePageStatus);
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
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }

            console.log(scoreArray);
            let sql = 'insert into scores(match_id, player_id, score, score_time, score_author_id, player_name) values ?';
            return await exec(sql, [scoreArray]);
        } else {
            return Promise.reject(ErrorCode.ErrorCode_NotScoreTime);
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getOnCourtPlayers(ctx) {
    try {
        //判断参数
        let postData = ctx.request.body;
        if (!postData) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if (postData['match_id'] == null || postData['match_id'].length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        let match_id = postData['match_id'];
        let sql = 'select * from onCourt where match_id = ?';
        let result = await exec(sql, match_id);
        return Promise.resolve({onCourtPlayers: result});
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getPlayersScores(ctx) {
    try {
        //判断参数
        let postData = ctx.request.body;
        if (!postData) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if (postData['match_id'] == null || postData['match_id'].length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        let match_id = postData['match_id'];
        let sql = 'select s.match_id, s.player_id, avg(s.score) ,p.player_name from scores as s left join players as p on s.player_id = p.id where  s.match_id = ? group by s.player_id';
        let result = await exec(sql, match_id);
        return Promise.resolve({playersScores: result});
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = {
    scoresForPlayers,
    getOnCourtPlayers,
    getPlayersScores
}