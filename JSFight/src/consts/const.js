const ErrorCode = {
    ErrorCode_Success:{
        defined_code : 0,
        msg : '请求成功'
    },
    ErrorCode_DefaultError :{
        defined_code : 1000,
        msg : '通用错误'
    },
    ErrorCode_MissingParams : {
        defined_code : 1001,
        msg : '缺少参数'
    },
    ErrorCode_InvalidParams : {
        defined_code : 1002,
        msg : '无效参数'
    },
    ErrorCode_NotScoreTime : {
        defined_code : 1003,
        msg : '当前不能给球员打分'
    },
    ErrorCode_LoginFailed : {
        defined_code : 1004,
        msg : '登录失败'
    },
    ErrorCode_CookieNotContainsSessionID : {
        defined_code : 1005,
        msg : 'cookie中不存在sessionID'
    },
    ErrorCode_NotLogin : {
        defined_code : 1006,
        msg : '未登录'
    }
}


module.exports = ErrorCode;