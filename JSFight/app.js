//import outer
const handleHomePageRoute = require('./src/router/homepage.js');
const handleUserRoute = require('./src/router/user.js');
const handleMatchRoute = require('./src/router/match.js');
const ErrorCode = require('./src/consts/const.js');
const { SuccessModel, ErrorModel } = require('./src/model/resModel.js');

//import inner
const queryString = require("querystring");


//获取post请求中的请求参数
function getPostData(req) {
    let promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({});
            return;
        }

        if (req.headers['content-type'] !== 'application/json') {
            resolve({});
            return;
        }

        let postData = '';
        req.on('data', chunk => {
            postData += chunk.toString();
        });

        req.on('end', () => {
            if (!postData) {
                resolve({});
            } else {
                resolve(
                    // String to Object
                    JSON.parse(postData)
                );
            }
        });
    });

    return promise;
}


function serverHandler(req, res) {
    //设置返回格式 json
    //这里设置charset=UTF-8, safari中中文就不会乱码了
    res.setHeader('Content-type', 'application/json;charset=UTF-8');

    //获取path
    const url = req.url;
    req.path = url.split('?')[0];

    //解析请求参数
    req.query = queryString.parse(url.split('?')[1]);

    //解析cookie
    req.cookie = {};

    const cookieStr = req.headers.cookie || '';
    cookieStr.split(';').forEach(item => {
        if (!item){
            continue;
        }

        const arr = item.split('=');
        const key = arr[0].trim();
        const value = arr[1].trim();
        req.cookie[key] = val;
    });


    //获取post body内的请求参数
    getPostData(req).then(function (postData) {
        //获取postData
        req.body = postData;

        //处理路由
        const hpResult = handleHomePageRoute(req, res);
        if (hpResult) {
            hpResult.then(data => {
                res.end(JSON.stringify(data));
            }).catch(error => {
                //这里一定要注意，hpResult promise的错误只能在这里处理，不要return Promise.reject(error)，在getPostData.catch中是不会处理这个异常的
                //这里如果return hpResult这个promise，在getPostData的第二个then中处理，也许在getPostData.catch中可以捕获到异常，可以尝试一下。参照controller里面的return exec(sql)的写法
                /** 参照这个原始代码！
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
                 */
                console.log('FUCKING TOO');
                console.log(error);
                if (error && error.defined_code) {
                    res.end(JSON.stringify(new ErrorModel(null, error)));
                    return;
                }

                res.end(JSON.stringify(new ErrorModel(error, ErrorCode.ErrorCode_DefaultError)));
            });

            console.log("what");
            return;
        }

        // console.log('WHY');
        // const userResult = handleUserRoute(req, res);
        // if (userResult){

        //     return;
        // }

        const matchResult = handleMatchRoute(req, res);
        if (matchResult){
            matchResult.then(data =>{
                console.log(data);
                res.end(JSON.stringify(data));
            }).catch(error =>{
                console.log(error);
                if (error && error.defined_code) {
                    res.end(JSON.stringify(new ErrorModel(null, error)));
                    return;
                }
        
                res.end(JSON.stringify(new ErrorModel(error, ErrorCode.ErrorCode_DefaultError)));
            });

            return;
        }

        const userResult = handleUserRoute(req, res);
        if (userResult){
            userResult.then(data =>{
                console.log(data);
                res.end(JSON.stringify(data));
            }).catch(error =>{
                console.log(error);
                if (error && error.defined_code) {
                    res.end(JSON.stringify(new ErrorModel(null, error)));
                    return;
                }
        
                res.end(JSON.stringify(new ErrorModel(error, ErrorCode.ErrorCode_DefaultError)));
            });
            
            return;
        }

        //未命中路由 404的处理需要自己在这里写吗？例如iOS AFNetworking 会不会自动回到fail的方法？需要验证一下！
        console.log('WHY');
        res.writeHead(404, { "Content-type": "text/plain" });
        res.write("404 not found");
        res.end();
    }).catch(error => {
        console.log('FUCKING THERE');
        console.log(error);

        if (error && error.defined_code) {
            res.end(JSON.stringify(new ErrorModel(null, error)));
            return;
        }

        res.end(JSON.stringify(new ErrorModel(error, ErrorCode.ErrorCode_DefaultError)));
    });

    //ES6的写法，then函数中接收一个参数是函数，postData是这个函数的参数
    // getPostData(req).then(postData => {

    // });
}

//ES6函数的写法
// const serverHandler = (req, res) => {

// }

module.exports = serverHandler;