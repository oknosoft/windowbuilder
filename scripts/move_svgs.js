/**
 * ### Модуль переноса svg из вложений в реквизит характеристики
 *
 * @module  move_svgs
 *
 * Created 24.02.2018
 */

/**
 * ### Переменные окружения
 * DEBUG "wb:*,-not_this"
 * ZONE 21
 * DBPWD admin
 * DBUSER admin
 * COUCHPATH http://cou221:5984/wb_
 */

'use strict';

const debug = require('debug')('wb:move-svgs');

// конструктор MetaEngine
const MetaEngine = require('metadata-core').plugin(require('metadata-pouchdb'));
debug('required');

// создаём контекст MetaEngine
const $p = new MetaEngine();
debug('created');

// инициализируем параметры сеанса и метаданные

// функция установки параметров сеанса
const user_node = {
  username: process.env.DBUSER || 'admin',
  password: process.env.DBPWD || 'admin',
};
function config_init(prm) {
  return Object.assign(require('../config/app.settings')(prm), {user_node});
};

// функция инициализации структуры метаданных
const meta_init = require('../src/metadata/init');

// инициализируем метаданные
$p.wsql.init(config_init, meta_init);

debug('inited');

// подключаемся к couchdb с реквизитами из окружения
const {pouch} = $p.adapters;
pouch.log_in(user_node.username, user_node.password)
  .then(() => move_svgs())
  .catch((err) => debug(err));


function move_svgs() {
  const db = pouch.remote.doc;
  const opt = {limit: 100};
  return db.query('svgs', opt)
    .then((res) => {
      // Для продукций заказа получаем вложения
      const aatt = [];
      debug(res.total_rows);
      for(const {id} of res.rows){
        aatt.push(db.getAttachment(id, 'svg')
          .then((att) => ({ref: id, att: att}))
          .catch((err) => {}));
      };
      return Promise.all(aatt);
    })
    .then((res) => {
      const aatt = [];
      for(const {ref, att} of res) {
        if(att instanceof Buffer && att.length /* att instanceof Blob && att.size */) {
          aatt.push(db.get(ref)
            .then((obj) => {
              /* $p.utils.blob_as_text(att) */
              obj.svg = att.toString();
              delete obj._attachments;
              return db.put(obj);
            })
            .catch((err) => {
              debug(err);
            })
          );
        }
      }
      return Promise.all(aatt)
        .then(() => {
          if(aatt.length === 100) {
            return new Promise((resolve, reject) => {
              setTimeout(() => resolve(move_svgs()), 5000);
            });
          }
        });
    })
    .catch(err => debug(err));
}
