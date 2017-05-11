#!/usr/bin/env node

'use strict';

const Koa = require('koa');
const app = new Koa();

// Register the router as Koa middleware
const rep = require('./router');
app.use(rep.middleware());

app.listen(process.env.PORT || 3000);

module.exports = app;
