const { exec } = require('child_process');

function isObjArr(value) {
    if (Object.prototype.toString.call(value) === "[object Array]") {
        console.log('value是数组');
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
        console.log('value是对象');
    } else {
        console.log('value不是数组也不是对象')
    }
}

function generateUnixRandomNum(){
    return new Promise((resolve, reject) =>{
        exec('head -n 80 /dev/urandom | tr -dc A-Za-z0-9 | head -c 168', function(err,stdout,stderr){
            if(err){
                reject(err);
                return;
            }
            // console.log(stdout);
            // let key = stdout;
            // let value = {openid: openid, session_key: session_key};
            // return stdout;
            resolve(stdout);
            });
    });
}

module.exports = {
    isObjArr,
    generateUnixRandomNum
};