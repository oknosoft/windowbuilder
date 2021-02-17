'use strict';


// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const path = require('path');
const fs = require('fs-extra');
//const glob = require('glob');

const paths = require('../config/paths');
const packageData = require('../package.json');
const moment = require('moment');
const build = `{"build": "v${packageData.version} (${packageData.dependencies['metadata-core']}), ${moment().format()}"}`;
fs.writeFile(path.resolve(paths.appBuild + '/build.json'), build, 'utf8', function (err) {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  else {
    console.log('Write build.json...');
  }
});

const fname = path.resolve(paths.appBuild + '/sw-ext.js');
fs.readFile(fname, 'utf8', function (error, data) {
  fs.writeFile(fname, data.replace('%revision%', moment().format('YYYYMMDDHHmm')), 'utf8', function (err) {
    if(err) {
      console.log(err);
      process.exit(1);
    }
    else {
      console.log('Write sw-ext.js...');
    }
  });
});
