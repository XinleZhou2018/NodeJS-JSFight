class DefinedError extends Error{
    /**
     * 目前还不支持多个构造函数
     */
    // constructor(message, httpCode, errorCode){
    //     super(message);
    //     this.httpCode = httpCode;
    //     this.errorCode = errorCode;
    // };

    constructor(errorObj){
        super(errorObj.msg);
        this.errorObj = errorObj;
    }
}

// let error = new DefinedError({message: '错误信息', code: 400});
// console.log(error.message, error.errorObj);

module.exports = {
    DefinedError
}