'use strict';


// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

const paths = require('../config/paths');
const packageData = require('../package.json');
const moment = require('moment');
const build = `{"build": "v${packageData.version} (${packageData.dependencies['metadata-core']}), ${moment().format()}"}`;
fs.writeFile(path.resolve(paths.appBuild + '/build.json').replace(/\\/g, '/'), build, 'utf8', function (err) {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  else {
    console.log('Write build.json...');
  }
});


let appcache = `CACHE MANIFEST
# ${Date.now()}

# Additional resources to cache
CACHE:

./
https://cdn.jsdelivr.net/jszip/2/jszip.min.js
https://cdn.jsdelivr.net/combine/gh/open-xml-templating/docxtemplater-build@3.1.5/build/docxtemplater-latest.min.js,gh/open-xml-templating/docxtemplater-image-module-build@3.0.2/build/docxtemplater-image-module-latest.min.js`;

glob('./build/**/*', function(err, files) {
  for(const name of files){
    if(name.match(/\.(js|json|html|css|scss|png|ico|jpg|gif|woff|woff2|ttf)$/) && !name.match(/\/(ram|templates)\//)){
      appcache += `\n${name.replace('./build', '')}`;
    }
  };

  appcache += `

# All other resources (e.g. sites) require the user to be online.
NETWORK:
*
http://*
https://*
`;
  // записываем результат
  fs.writeFile(path.resolve(paths.appBuild + '/cache.appcache').replace(/\\/g, '/'), appcache, 'utf8', function (err) {
    if(err) {
      console.log(err);
      process.exit(1);
    }
    else {
      console.log('Write appcache...');
      process.exit(0);
    }
  });
});
