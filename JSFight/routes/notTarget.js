const router = require('koa-router')()


router.get('*', async function (ctx, next) {
    ctx.status = 404;
    ctx.response.type = 'text/plain';
    ctx.response.body = '404 not found 404';
            // //判断 404 
            // if (parseInt(ctx.status) === 404){
            //     ctx.response.type = 'text/plain';
            //     ctx.response.body = '404 not found';
            //     return;
            // }
});

router.post('*', async function (ctx, next) {
    ctx.status = 404;
    ctx.response.type = 'text/plain';
    ctx.response.body = '404 not found 404';
});

module.exports = router;