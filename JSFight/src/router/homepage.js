const moment = require("moment");

//import outer controller
//这是ES6写法 也可以像以前一样 const model = require('../model/resModel.js'); model.SuccessModel
const {SuccessModel, ErrorModel} = require('../model/resModel.js');
const {getHomePageData} = require('../controller/homepage.js');
const ErrorCode = require('../consts/const.js');

//Defined const
const HOMEPAGE_INFO = '/api/homepage/homepage';

function handleHomePageRoute(req, res){
    const method = req.method;

    if (method === 'GET' && req.path === HOMEPAGE_INFO){
        //请求参数判断等等 TODO

        //获取当前时间
        // var currentDate = new Date();

        // console.log(currentDate);
        // console.log(moment());

        // console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        // console.log(moment().unix());

        let result = getHomePageData(moment());
        return result.then(value =>{
            return new SuccessModel(value, ErrorCode.ErrorCode_Success);
        }).catch(err =>{
            console.log('FUCKING ROUTER');
            return Promise.reject(err);
        });
    }
}

module.exports = handleHomePageRoute;