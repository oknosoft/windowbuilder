'use strict';

const debug = require('debug')('wb:router');
debug('start');

const builder = require('./builder');

const Router = require('koa-better-router');
const rep = Router({ prefix: '/r' });

rep.loadMethods()
  .get('/', async (ctx, next) => {
    await next();
    ctx.body = `Reports: try out <a href="/r/img">/r/img</a> too`
  })
  .get('/img/:class/:ref', async (ctx, next) => {
    await next();
    //ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
    ctx.type = 'image/png';
    ctx.body = await builder(ctx.params);
  });

module.exports = rep;
