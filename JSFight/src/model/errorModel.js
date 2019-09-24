class InternalError extends Error{
    /**
     * 目前还不支持多个构造函数
     */
    // constructor(message, httpCode, errorCode){
    //     super(message);
    //     this.httpCode = httpCode;
    //     this.errorCode = errorCode;
    // };

    constructor(errorReason, errorObj){
        super(errorReason);
        this.errorObj = errorObj;
    }
}

class ExternalError extends Error{
    constructor(errorReason, errorObj){
        super(errorReason);
        this.errorObj = errorObj;
    }
}


module.exports = {
    InternalError,
    ExternalError
}