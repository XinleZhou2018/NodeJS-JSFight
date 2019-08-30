const { exec } = require('../db/mysql.js');
const ErrorCode = require('../consts/const.js');

function scoresForPlayers (postData, userid, scoreTime){
    //首先得判断现在的状态是不是AFTER_MATCH，才允许给球员打分
    let sql = 'select hp_status from homePageStatus';

    let promise = exec(sql);

    return promise.then(result =>{
        if (!result || result.length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        let hpStatus = result[0]['hp_status'];

        if (hpStatus === 'AFTER_MATCH'){
            let matchid = postData['match_id'];
        
            let flag = false;
            let scores = postData['scores'];
            let scoreArray = new Array();
            for (let i = 0; i < scores.length; i++){
                let scoreObj = scores[i];
        
                let score = scoreObj['score'];
                let playername = scoreObj['player_name'];
                let playerid = scoreObj['player_id'];
        
                if (score == null || playerid == null){
                    flag = true;
                    break;
                }
        
                scoreArray.push([matchid, playerid, score, scoreTime, userid, playername]);
            }
        
            if(flag){
                return Promise.reject(ErrorCode.ErrorCode_MissingParams);
            }
        
            console.log(scoreArray);
            let sql = 'insert into scores(match_id, player_id, score, score_time, score_author_id, player_name) values ?';
            return exec(sql, [scoreArray]);
        }else{
            return Promise.reject(ErrorCode.ErrorCode_NotScoreTime);
        }
    }).then(result =>{
        console.log('SUCCESS');
        console.log(result);
        return Promise.resolve(result);
    }).catch(err =>{
        return Promise.reject(err);
    });
}

function getOnCourtPlayers(match_id){
    let sql = 'select * from onCourt where match_id = ?';
    return exec(sql, match_id).then(result =>{
        return Promise.resolve({onCourtPlayers: result});
    }).catch(err =>{
        return Promise.reject(err);
    });
}

function getPlayersScores(match_id){
    // let sql = 'select s.match_id, s.player_id, avg(score) ,p.player_name from scores as s, players as p where s.player_id = p.id and s.match_id = ? group by s.player_id';
    let sql = 'select s.match_id, s.player_id, avg(s.score) ,p.player_name from scores as s left join players as p on s.player_id = p.id where  s.match_id = ? group by s.player_id';
    return exec(sql, match_id).then(result =>{
        return Promise.resolve({playersScores: result});
    }).catch(err =>{
        return Promise.reject(err);
    });
}

module.exports = {
    scoresForPlayers,
    getOnCourtPlayers,
    getPlayersScores
}