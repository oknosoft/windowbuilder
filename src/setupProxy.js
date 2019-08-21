const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/couchdb/common', { target: 'http://localhost:3026/' }));
  app.use(proxy('/couchdb', { target: 'http://localhost:3016/' }));
};
