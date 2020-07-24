/**
 * Копирует dev-версию файлов в node_modules (для отладки библиотек)
 */

const path = require('path');
const fs = require('fs');
const md5File = require('md5-file');

const localNodeModules = path.resolve(__dirname, '../node_modules');
const {dependencies} = require(path.resolve(__dirname, '../package.json'));

// накапливаем пути
const repos = [
  {
    local: 'wb-core',
    remote: 'D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\windowbuilder-core',
    dir: 'dist',
  },
  {
    local: 'wb-forms',
    remote: 'D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\windowbuilder-forms',
    dir: 'dist',
  },
];

for(const local of Object.keys(dependencies).filter(v => /^metadata-/.test(v))) {
  repos.push({
    local,
    remote: `D:\\WORK\\0KNOSOFT\\UniServer\\www\\builder2\\git-osde\\packages\\${local}`,
    dir: '',
  });
}

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

// исполняем
let copied;
for(const {local, remote, dir} of repos) {
  const lpath = path.resolve(localNodeModules, local, dir);
  const rpath = path.resolve(remote, dir);
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


if(!copied){
  console.log(`all files match`);
}
