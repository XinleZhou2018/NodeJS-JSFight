//Controller层中调用数据库，构造返回数据
const { exec } = require('../db/mysql.js');
const ErrorCode = require('../consts/const.js');

function getHomePageData(moment) {
    //首先检查首页状态
    let sql = 'select hp_status from homepageStatus';

    // let promise = exec(sql);
    // return promise.then(result =>{

    //     let sql1 = '';
    //     return exec(sql1);
    // }, err =>{
    //     return Promise.reject(err);
    // }).then(result =>{
    //     return result;
    // }, err =>{
    //     return Promise.reject(err);
    // });

    // let promise = exec(sql);
    // return promise.then(result =>{
    //     console.log(result);
    //     // let sql1 = '';
    //     // return exec(sql1);
    // }).then(result =>{
    //     return result;
    // }).catch(err =>{
    //     return Promise.reject(err);
    // });

    console.log(sql);

    let hpStatus;
    let promise = exec(sql);
    return promise.then(result => {
        // var test = undefined;
        // console.log(test.toString());

        if (!result || result.length <= 0) {
            return Promise.reject(ErrorCode.ErrorCode_DefaultError);
        }

        hpStatus = result[0]['hp_status'];
        if (hpStatus === 'ON') {
            //比赛正在进行
            let sql = 'select * from matches where is_on = 1';
            return exec(sql);
        } else if (hpStatus === 'AFTER_MATCH') {
            //比赛后，查询上一场比赛
            let timestampString = moment.unix();

            let sql = 'select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1';
            return exec(sql, timestampString);
        } else if (hpStatus === 'WARM') {
            let timestampString = moment.unix();

            let sql = 'select* from ((select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1) union all (select * from matches where unix_timestamp(match_date) > ? limit 1)) as total order by match_date desc';
            return exec(sql, [timestampString, timestampString]);
        } else if (hpStatus === 'REVIEW') {
            let timestampString = moment.unix();

            let sql = 'select* from ((select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1) union all (select * from matches where unix_timestamp(match_date) > ? limit 1)) as total order by match_date asc';
            return exec(sql, [timestampString, timestampString]);
        } else if (hpStatus === 'REST') {
            //TODO
        }
    }).then(
        result => {
            switch (hpStatus) {
                case 'ON': {
                    console.log(result);
                    if (!result || result.length <= 0) { // result == null
                        return Promise.reject(ErrorCode.ErrorCode_DefaultError);
                    }

                    let match = result[0];
                    let obj = { hp_status: hpStatus, match: match };
                    return Promise.resolve(obj);
                    break;
                }
                case 'AFTER_MATCH': {
                    // console.log(result);
                    if (!result || result.length <= 0) { // result == null
                        return Promise.reject(ErrorCode.ErrorCode_DefaultError);
                    }


                    let match = result[0];
                    let obj = { hp_status: hpStatus, match: match };
                    return Promise.resolve(obj);
                    break;
                }
                case 'WARM': {
                    if (!result || result.length <= 0) { // result == null
                        return Promise.reject(ErrorCode.ErrorCode_DefaultError);
                    }

                    let warm_match = result[0];
                    let before_match;
                    if (result.length === 2) {
                        before_match = result[1];
                    }

                    if (before_match) {
                        return Promise.resolve({ hp_status: hpStatus, warm_match: warm_match, before_match: before_match });
                    } else {
                        return Promise.resolve({ hp_status: hpStatus, warm_match: warm_match });
                    }

                    break;
                }
                case 'REVIEW': {
                    if (!result || result.length <= 0) { // result == null
                        return Promise.reject(ErrorCode.ErrorCode_DefaultError);
                    }

                    let review_match = result[0];
                    let after_match;
                    if (result.length === 2) {
                        after_match = result[1];
                    }

                    if (after_match) {
                        return Promise.resolve({ hp_status: hpStatus, review_match: review_match, after_match: after_match });
                    } else {
                        return Promise.resolve({ hp_status: hpStatus, review_match: review_match });
                    }
                    break;
                }
                case 'REST':
                    //TODO
                    break;
            }
        }
    ).catch(err => {
        console.log('FUCKING');
        return Promise.reject(err);
    });
}

module.exports = {
    getHomePageData
};