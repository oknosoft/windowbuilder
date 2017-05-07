'use strict';

//const metadata = require('./metadata');

const builder = require('./builder');

const Router = require('koa-better-router');
const rep = Router({ prefix: '/r' });

rep.loadMethods()
  .get('/', (ctx, next) => {
    ctx.body = 'reports';
    return next()
  }, (ctx, next) => {
    ctx.body = `${ctx.body} Try out <a href="/r/img">/r/img</a> too`
    return next()
  })

rep.get('/img', async (ctx, next) => {
  await next();
  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  console.log(metadata[0]);
})

module.exports = rep;
