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
  .get('/img/:class/:ref', builder);

module.exports = rep;
