const SuccessCode = {
    code : 0,
    msg : '请求成功'
}

const DefaultErrorCode = {
    code : 1000,
    msg : '通用错误'
}

const ExternalErrorCode = {
    ErrorCode_MissingParams : {
        code : 1001,
        msg : '缺少参数'
    },
    ErrorCode_InvalidParams : {
        code : 1002,
        msg : '无效参数，参数类型不正确'
    },
    ErrorCode_NotScoreTime : {
        code : 1003,
        msg : '当前不能给球员打分'
    },
    ErrorCode_LoginFailed : {
        code : 1004,
        msg : '登录失败'
    },
    ErrorCode_NotLogin : {
        code : 1005,
        msg : '未登录'
    },
    ErrorCode_InvalidHomePageStatus : {
        code : 1006,
        msg : '无效的首页状态值'
    }
}

const InternalErrorCode = {
    ErrorCode_QueryStringParseError : {
        code : 2001,
        msg : 'queryString转换字符串到对象错误',
    },
    ErrorCode_MysqlExecError : {
        code : 2002,
        msg : 'Mysql操作错误',
    },
    ErrorCode_RedisReadError : {
        code : 2003,
        msg : 'Redis读取错误',
    },
    ErrorCode_WechatJscode2sessionError : {
        code : 2004,
        msg : '微信jscode2session API请求错误',
    },
    ErrorCode_GenerateUnixRandomNumError : {
        code : 2005,
        msg : '生成UNIX随机字符串失败',
    },
}


module.exports = {
    SuccessCode,
    DefaultErrorCode,
    InternalErrorCode,
    ExternalErrorCode
};