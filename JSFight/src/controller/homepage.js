const moment = require('moment');

//Controller层中调用数据库，构造返回数据
const { exec } = require('../db/mysql.js');
const {InternalErrorCode, ExternalErrorCode} = require('../consts/const.js');
const {InternalError, ExternalError} = require('../model/errorModel.js');

async function getHomePageData() {
    let moment_time = moment();

    //首先检查首页状态
    let sql = 'select hp_status from homepageStatus';

    //模拟一个错误
    // var test = undefined;
    // console.log(test.toString());

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

    switch (hpStatus) {
        case 'ON': {
            //比赛正在进行 - 查询正在进行的比赛
            let sql = 'select * from matches where is_on = 1';
            let result;
            try {
                result = await exec(sql);
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
            }

            let match;

            if (result && result.length > 0) {
                match = result[0];
            }

            let obj = { hp_status: hpStatus, match: match };
            return Promise.resolve(obj);
            break;
        }
        case 'AFTER_MATCH': {
            //比赛后，查询上一场比赛
            let timestampString = moment_time.unix();

            let sql = 'select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1';

            let result;
            try {
                result = await exec(sql, timestampString);
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
            }
             
            let match;

            if (result && result.length > 0) {
                match = result[0];
            }

            let obj = { hp_status: hpStatus, match: match };
            return Promise.resolve(obj);
            break;
        }
        case 'WARM': {
            //预热上一场比赛
            let timestampString = moment_time.unix();

            let sql = 'select* from ((select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1) union all (select * from matches where unix_timestamp(match_date) > ? limit 1)) as total order by match_date desc';

            let result
            try {
                result = await exec(sql, [timestampString, timestampString]);
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
            }
            
            let warm_match, before_match;

            if (result && result.length > 0) {
                warm_match = result[0];

                if (result.length > 1) {
                    before_match = result[1];
                }
            }

            return Promise.resolve({ hp_status: hpStatus, warm_match: warm_match, before_match: before_match });
            break;
        }
        case 'REVIEW': {
            //回顾上一场比赛
            let timestampString = moment_time.unix();

            let sql = 'select* from ((select * from matches where unix_timestamp(match_date) < ? order by match_date desc limit 1) union all (select * from matches where unix_timestamp(match_date) > ? limit 1)) as total order by match_date asc';
            let result;
            try {
                result = await exec(sql, [timestampString, timestampString]);
            } catch (error) {
                throw new InternalError(error.toString(), InternalErrorCode.ErrorCode_MysqlExecError);
            } 

            let review_match, after_match;

            if (result && result.length > 0) {
                review_match = result[0];

                if (result.length > 1) {
                    after_match = result[1];
                }
            }

            return Promise.resolve({ hp_status: hpStatus, review_match: review_match, after_match: after_match });
            break;
        }
        case 'REST':
            //TODO
            break;
        default:
            throw new ExternalError(null, ExternalErrorCode.ErrorCode_InvalidHomePageStatus);
            break;
    }
}

module.exports = {
    getHomePageData
};