// const moment = require("moment");

// const queryString = require("querystring");

// const obj = {
//     a:'张三',
//     b:2
// }

// console.log(queryString.stringify(obj));

// console.log(process.env.NODE_ENV);

// const serverHandler = require('../app.js');
// const http = require('http');

// const PORT = 8000;

// const server = http.createServer(serverHandler);

// server.listen(PORT);


// //test
// let promise1 = new Promise((resolve, reject) => {
//     resolve("1");
// });

// promise1.then(value =>{
//     console.log(value);
//     return 2;
// }).then(value =>{
//     console.log(value);
// });




// let promise2 = promise1.then(value =>{
//     // console.log(value);
//     return value;
// });

// promise2.then(value => {
//     console.log(value);
// });

// DateFormat df= new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:ms");


// var currentDate = moment();
// console.log(currentDate);
// var formatCurrentDate = currentDate.format('YYYY-MM-DD HH:mm:ss');
// console.log(formatCurrentDate);


// var currentDate = new Date();
// console.log(currentDate);


// function test(){
//     let promise = new Promise((resolve, reject) =>{
//         // resolve(10);
//         reject(100);
//     });
    
//     return promise.then(value =>{
//         return 11;
//     }, err =>{
//         // console.log(err);
//         return Promise.reject(err);
//     }).then(value =>{
//         return 12;
//     }, err =>{
//         // console.log(err);
//         return Promise.reject(err);
//     });
// }

// let p = test();
// p.then(value =>{
//     console.log(value);
// },err =>{
//     console.log(err);
// })



// function test(){
//     let promise = new Promise((resolve, reject) =>{
//         //耗时操作
//         setTimeout(() => resolve(10), 1000);
//         // resolve(10);
//         // reject(100);
//     });
    
//     return promise.then(value =>{
//         console.log('第1个then');
//         return Promise.reject(999);
//     }).then(value =>{
//         console.log('第2个then');
//         return 12;
//     }).catch(err =>{
//         console.log('catch');
//         return Promise.reject(err);
//     });
// }

// let p = test();
// p.then(value =>{
//     console.log(value);
// },err =>{
//     console.log(err);
// })



// function test(){
//     return new Promise((resolve, reject) =>{
//         resolve(100);
//     });
// }

// let promise = test();


// let a;
// promise.then(value =>{
//     console.log('第1个then');
    
//     a = 1;
//     if (a === 0){
//         return Promise.resolve(100);
//     }else if(a === 1){
//         return Promise.resolve(101);
//     }
// }).then(value =>{
//     console.log('第2个then');
//     console.log(a);
//     console.log(value);
// });

    // let promise = new Promise((resolve, reject) =>{
    //     resolve(100);
    // });

    // promise.then(value =>{
    //     let test = undefined;
    //     test.hi();
    // }).catch(err =>{
    //     console.log('error');
    // })


//     function isObjArr(value){
//         if (Object.prototype.toString.call(value) === "[object Array]") {
//                console.log('value是数组');
//           }else if(Object.prototype.toString.call(value)==='[object Object]'){
//                console.log('value是对象');
//          }else if (Object.prototype.toString.call(value)==='[object String]'){
//              console.log('value是字符串')
//          }
//    }

//    isObjArr('nhao');

// let array = ['q',1,null];
// console.log(array.length);

// const {exec} = require('child_process');

// exec('head -n 80 /dev/urandom | tr -dc A-Za-z0-9 | head -c 168', function(err,stdout,stderr){
//     if(err){
//         console.log(err);
//         return;
//     }
//     console.log(stdout);
//     console.log('|');
//     console.log(stderr);

//     });

// const { generateUnixRandomNum } = require('../src/common/utils.js');

// generateUnixRandomNum().then(value =>{
//     console.log(value);
// })

// const { judgeUserIsLogin } = require('../src/common/common.js');

// let req = {};
// req.cookie = {session_id : '1wRZnNB5Z8vxw13r9BaajktgRzcCmo6wYEwf2iHA6imeZs7uydiIrOfFVhXr9GPwQ59Iv0QDzAhOxZcQHOxzBxzZl12fDcUudBfW0polQuZAWtII2qThikXcAQcz4gWu8qdk8lbCUFN0KP0qdXm2N4Q4KYzl5RVG02ml9mdV'};

// judgeUserIsLogin(req).then(value =>{
//     console.log('成功');
//     console.log(value);
// }).catch(err =>{
//     console.log('失败');
//     console.log(err);
// });


function takeLongTime() {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('long time');
            resolve(200)
        } , 500);
    });
}

async function test(){
    await takeLongTime();
    await test1();

    console.log('你好');
}

async function test1(){
    await takeLongTime();
}

test();



// function step1(n) {
//     console.log(`step1 with ${n}`);
//     return takeLongTime(n);
// }

// function step2(n) {
//     console.log(`step2 with ${n}`);
//     return takeLongTime(n);
// }

// function step3(n) {
//     console.log(`step3 with ${n}`);
//     return takeLongTime(n);
// }

// async function doIt() {
//     console.time("doIt");
//     const time1 = 300;
//     const time2 = await step1(time1);
//     console.log('time2' + time2);
//     const time3 = await step2(time2);
//     const result = await step3(time3);
//     console.log(`result is ${result}`);
//     console.timeEnd("doIt");
// }

// doIt();