/**
 * ### Модуль сборки *.js по описанию метаданных
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module  metadata-prebuild
 */

"use strict";

const fs = require('fs')
const path = require('path')

const settings = fs.readFileSync('./settings.js', 'utf8')

const config = require('./config.js')       // подключение к CouchDB
const MetaEngine = require('metadata-core/index.js')
  .default.plugin(require('metadata-pouchdb/index.js').default)


var jstext = "",            // в этой переменной будем накапливать текст модуля
  $p = new MetaEngine();    // подключим метадату

// инициализация и установка параметров
$p.wsql.init(function (prm) {

  // разделитель для localStorage
  prm.local_storage_prefix = config.prefix;

  // по умолчанию, обращаемся к зоне 0
  prm.zone = config.zone;

  // расположение 1C
  if(config.rest_1c)
    prm.rest_path = config.rest_1c;

  // расположение couchdb
  prm.couch_path = config.couchdb;

}, function ($p) {

  const db = new $p.classes.PouchDB(config.couchdb + "meta", {
    skip_setup: true,
    auth: {
      username: "Рабочий",
      password: "2"
    }
  });

  let _m;

  return db.info()
    .then(function () {
      return db.get('meta');

    })
    .then(function (doc) {
      _m = doc;
      doc = null;
      return db.get('meta_patch');

    }).then(function (doc) {
      $p.utils._patch(_m, doc);
      doc = null;
      delete _m._id;
      delete _m._rev;

      // фильтруем метаданные для облегчения рабочего места
      // let filter = {
      //   cat: ['users','users_acl','stores','divisions','individuals','planning_keys','work_shifts','work_center_kinds','work_centers','property_values'],
      //   doc: ['planning_event'],
      //   dp: [],
      //   areg: [],
      //   ireg: ['$log']
      // }, filtred_meta = {};
      // for(var cls in _m){
      //   if(!filter[cls]){
      //     filtred_meta[cls] = _m[cls]
      //   }else{
      //     filtred_meta[cls] = {};
      //     filter[cls].forEach(function (name) {
      //       filtred_meta[cls][name] = _m[cls][name]
      //     })
      //   }
      // }

      return $p.md.init(_m)
    })
    .then( (_m) => {

      // создаём текст модуля конструкторов данных
      var text = create_modules(_m);

      // выполняем текст модуля, чтобы появились менеджеры
      eval(text);

      // получаем скрипт таблиц
      $p.md.create_tables(function (sql) {

        text = "export default function meta($p) {\n\n"
          + "$p.wsql.alasql('" + sql + "', []);\n\n"
          + "$p.md.init(" + JSON.stringify(_m) + ");\n\n"
          + text + "\n}";


        // записываем результат
        fs.writeFile('./init.js', text, 'utf8', function (err) {
          if (err){
            console.log(err)
            process.exit(1)
          }else{
            console.log('metadata > init.js')
            process.exit(0)
          }
        });

        $p = null;

      })

    } )
    .catch(function (err) {
      console.log(err);
      process.exit(1)
    })
})


function create_modules(_m){

  var name,
    text = "(function(){\n" +
      "const {EnumManager,CatManager,DocManager,LogManager,DataProcessorsManager,ChartOfCharacteristicManager,ChartOfAccountManager,InfoRegManager,AccumRegManager,BusinessProcessManager,TaskManager,CatObj, DocObj, TabularSectionRow, DataProcessorObj, RegisterRow, BusinessProcessObj, TaskObj} = $p.classes\n" +
      "const _define = Object.defineProperties\n\n",
    categoties = {
      cch: {mgr: "ChartOfCharacteristicManager", obj: "CatObj"},
      cacc: {mgr: "ChartOfAccountManager", obj: "CatObj"},
      cat: {mgr: "CatManager", obj: "CatObj"},
      bp: {mgr: "BusinessProcessManager", obj: "BusinessProcessObj"},
      tsk: {mgr: "TaskManager", obj: "TaskObj"},
      doc: {mgr: "DocManager", obj: "DocObj"},
      ireg: {mgr: "InfoRegManager", obj: "RegisterRow"},
      areg: {mgr: "AccumRegManager", obj: "RegisterRow"},
      dp: {mgr: "DataProcessorsManager", obj: "DataProcessorObj"},
      rep: {mgr: "DataProcessorsManager", obj: "DataProcessorObj"}
    };


  // менеджеры перечислений
  for(name in _m.enm)
    text+= "$p.enm." + name + " = new EnumManager('enm." + name + "')\n";

  // менеджеры объектов данных, отчетов и обработок
  for(var category in categoties){
    for(name in _m[category]){
      text+= obj_constructor_text(_m, category, name, categoties[category].obj);
      if(name == "$log")
        text+= "$p." + category + "." + name + " = new LogManager('ireg.$log')\n";
      else
        text+= "$p." + category + "." + name + " = new " + categoties[category].mgr + "('" + category + "." + name + "')\n";
    }
  }

  return text + "})()\n";

}

function obj_constructor_text(_m, category, name, proto) {

  var meta = _m[category][name],
    fn_name = $p.classes.DataManager.prototype.obj_constructor.call({class_name: category + "." + name, constructor_names: {}}),
    text = "\n/**\n* ### " + $p.msg.meta[category] + " " + meta.name,
    f, props = "";

  text += "\n* " + (meta.illustration || meta.synonym);
  text += "\n* @class " + fn_name;
  text += "\n* @extends " + proto;
  text += "\n* @constructor \n*/\n";
  text += "$p." + fn_name +  " = class " + fn_name + " extends " + proto + "{}\n";

  // реквизиты по метаданным
  if(meta.fields){
    for(f in meta.fields){
      if(props)
        props += ",\n";
      props += f + ": {get: function(){return this._getter('"+f+"')}, " +
        "set: function(v){this._setter('"+f+"',v)}, enumerable: true, configurable: true}";
    }
  }else{
    for(f in meta.dimensions){
      if(props)
        props += ",\n";
      props += f + ": {get: function(){return this._getter('"+f+"')}, " +
        "set: function(v){this._setter('"+f+"',v)}, enumerable: true, configurable: true}";
    }
    for(f in meta.resources){
      if(props)
        props += ",\n";
      props += f + ": {get: function(){return this._getter('"+f+"')}, " +
        "set: function(v){this._setter('"+f+"',v)}, enumerable: true, configurable: true}";
    }
    for(f in meta.attributes){
      if(props)
        props += ",\n";
      props += f + ": {get: function(){return this._getter('"+f+"')}, " +
        "set: function(v){this._setter('"+f+"',v)}, enumerable: true, configurable: true}";
    }
  }

  if(props)
    text += "_define($p." + fn_name + ".prototype, {" + props + "});\n";


  // табличные части по метаданным
  props = "";
  for(var ts in meta.tabular_sections){

    // создаём конструктор строки табчасти
    var row_fn_name = $p.classes.DataManager.prototype.obj_constructor.call({class_name: category + "." + name, constructor_names: {}}, ts);

    text+= "$p." + row_fn_name + " = class " + row_fn_name + " extends TabularSectionRow{}\n";

    // в прототипе строки табчасти создаём свойства в соответствии с полями табчасти
    for(var rf in meta.tabular_sections[ts].fields){

      if(props)
        props += ",\n";

      props += rf + ": {get: function(){return this._getter('"+rf+"')}, " +
        "set: function(v){this._setter('"+rf+"',v)}, enumerable: true, configurable: true}";
    }

    if(props)
      text += "_define($p." + row_fn_name + ".prototype, {" + props + "});\n";

    // устанавливаем геттер и сеттер для табличной части
    text += "_define($p." + fn_name + ".prototype, { '"+ts+"': {get: function(){return this._getter_ts('"+ts+"')}, " +
      "set: function(v){this._setter_ts('"+ts+"',v)}, enumerable: true, configurable: true}})\n";

  }

  return text;

}

