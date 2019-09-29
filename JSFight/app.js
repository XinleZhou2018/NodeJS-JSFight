const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const errorHandler = require('./src/middleware/errorHandle.js');

//import router
const homepage = require('./routes/homepage')
const match = require('./routes/match')
const users = require('./routes/users')
const notTarget = require('./routes/notTarget')

// error handler
onerror(app)

/**
 * 注册错误处理的中间件
*/
app.use(errorHandler);

// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     //可以直接在这个
//     ctx.app.emit("error", err, ctx);
//   }
// });

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// regist routes
app.use(homepage.routes(), homepage.allowedMethods())
app.use(match.routes(), match.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(notTarget.routes(), notTarget.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)

  // 如果没有错误处理的中间件 ，在这个方法中只能返回格式是html的错误信息，不是json
  // if (err instanceof DefinedError){
  //   if (err.errorObj.type){
  //     //内部错误，需要记录日志等
  //     console.log('自定义错误 - 已知错误');
  //     ctx.response.status = 500;
  //     ctx.body = new ErrorModel(null, ErrorCode.ErrorCode_DefaultError);
  //   }else{
  //     console.log('自定义错误 - 已知错误');
  //     ctx.response.status = 200;
  //     ctx.body = new ErrorModel(null, err.errorObj);
  //   }

  // }else{
  //   console.log('未知错误');
  //   ctx.status = 500;
  //   ctx.body = new ErrorModel(err.toString(), ErrorCode.ErrorCode_DefaultError)
  // }
});

module.exports = app
