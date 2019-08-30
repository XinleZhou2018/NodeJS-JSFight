const { login } = require('../controller/user.js');
const {SuccessModel, ErrorModel} = require('../model/resModel.js');
const ErrorCode = require('../consts/const.js');

//用户登录
const USER_LOGIN = '/api/user/login';

//修改个人信息-昵称和头像，每次进入微信小程序后，获取用户信息，然后上传昵称和头像等
const USER_CHANGEPROFILE = '/api/user/changeprofile';

function handleUserRoute(req, res){
    const method = req.method;

    if (method === 'POST' && req.path === USER_LOGIN){
        //登录接口
        let postData = req.body;
        if (!postData){
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        if(postData['code'] == null || postData['nickName'] == null){
            return Promise.reject(ErrorCode.ErrorCode_MissingParams);
        }

        let result = login(postData);

        return result.then(value =>{
            return new SuccessModel(value, ErrorCode.ErrorCode_Success); 
        }).catch(err =>{
            return Promise.reject(err);
        });
    }

    if (method === 'POST' && req.path === USER_CHANGEPROFILE){
        //TODO
    }
}

module.exports = handleUserRoute;