const { SuccessModel, ErrorModel } = require('../model/resModel.js');

const successModel = new SuccessModel({data:123}, '成功');

function test(){
    console.log('result =' + successModel);
}

module.exports = test;