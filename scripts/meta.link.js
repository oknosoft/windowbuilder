/**
 * Копирует dev-версию файлов в node_modules (для отладки библиотек)
 */

const path = require('path');
const fs = require('fs');
const md5File = require('md5-file');

const localWbModules = path.resolve(__dirname, '../node_modules/windowbuilder/dist');
const remoteWbModules = 'D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\windowbuilder-core\\dist';
const wbLibs = ['drawer.js', 'init.js'];

const localNodeModules = path.resolve(__dirname, '../node_modules');
const remoteNodeModules = 'D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\git-osde\\packages';
const {dependencies} = require(path.resolve(__dirname, '../package.json'));
const libs = Object.keys(dependencies).filter(v => /^metadata-/.test(v));

const localForms = path.resolve(__dirname, '../node_modules/windowbuilder-forms/dist');
const remoteForms  = 'D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\windowbuilder-forms\\dist';

function fromDir(startPath, filter, callback) {

  if(!fs.existsSync(startPath)) {
    console.log('no dir ', startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    if(/node_modules|\\src\\|\/src\//.test(filename)){
      continue;
    }
    const stat = fs.lstatSync(filename);
    if(stat.isDirectory()) {
      callback(filename, true);
      fromDir(filename, filter, callback); //recurse
    }
    else if(filter.test(filename)) {
      callback(filename);
    }
  };
};

let i = 0;
for (const lib of wbLibs) {
  const lname = path.resolve(localWbModules, lib);
  const rname = path.resolve(remoteWbModules, lib);

  if(!fs.existsSync(lname) || (md5File.sync(rname) != md5File.sync(lname))){
    i++;
    fs.createReadStream(rname).pipe(fs.createWriteStream(lname));
  }
}
i && console.log(`from ${remoteWbModules} written ${i} files`);

let j = 0;
fromDir(remoteForms, /\.(css|js|mjs|md|map|gif|png)$/, (rname, isDir) => {
  const name = rname.replace(remoteForms, '');
  const lame = path.join(localForms, name);
  if(isDir) {
    if(!fs.existsSync(lame)) {
      fs.mkdirSync(lame);
    }
  }
  else if(!fs.existsSync(lame) || (md5File.sync(rname) != md5File.sync(lame))){
    j++;
    fs.createReadStream(rname).pipe(fs.createWriteStream(lame));
  }
});
j && console.log(`from ${remoteForms} written ${j} files`);

let copied;
for (const lib of libs) {
  const lpath = path.resolve(localNodeModules, lib);
  const rpath = path.resolve(remoteNodeModules, lib);
  let i = 0;
  fromDir(rpath, /\.(css|js|mjs|md|map|gif|png)$/, (rname, isDir) => {
    const name = rname.replace(rpath, '');
    const lame = path.join(lpath, name);
    if(isDir) {
      if(!fs.existsSync(lame)) {
        fs.mkdirSync(lame);
      }
    }
    else if(!fs.existsSync(lame) || (md5File.sync(rname) != md5File.sync(lame))){
      i++;
      fs.createReadStream(rname).pipe(fs.createWriteStream(lame));
    }
  });
  if(i){
    copied = true;
    console.log(`from ${rpath} written ${i} files`);
  }
}
if(!copied && !i && !j){
  console.log(`all files match`);
}
