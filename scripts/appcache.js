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


let appcache = `CACHE MANIFEST
# ${Date.now()}

# Additional resources to cache
CACHE:

./`;

glob('./build/**/*', function(err, files) {
  for(const name of files){
    if(name.match(/\.(js|json|html|css|png|ico|jpg)$/)){
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
    if (err) {
      console.log(err)
      process.exit(1)
    }
    else {
      console.log('Write appcache...')
      process.exit(0)
    }
  });
});
