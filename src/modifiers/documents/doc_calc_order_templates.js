/**
 * ### Модуль менеджера документа Расчет-заказ
 * Методы работы с шаблонами из отдельной базы
 *
 *
 * @module doc_calc_order
 */

(({adapters: {pouch}, classes, cat, doc, job_prm, md, pricing, utils}) => {

  const _mgr = doc.calc_order;
  const proto_get = _mgr.constructor.prototype.get;

  // геттер для поиска в двух базах
  function template_get(ref, do_not_create){
    return proto_get.apply(this, arguments)
  }

  // начальная загрузка локальной базы templates из файлов
  function from_files(start) {
    if(!start) {
      return Promise.resolve()
    }
    const db = pouch.local.templates;
    return fetch('/templates/00000.json')
      .then((res) => res.json())
      .then((info) => {
        return db.get('stamp')
          .then((doc) => {
            if(doc.stamp === info.stamp) {
              return false;
            }
            info._rev = doc._rev;
            return info;
          })
          .catch(() => info);
      })
      .then((info) => {
        if(info) {
          return (db.load ? Promise.resolve() : utils.load_script('/dist/pouchdb.load.js', 'script'))
            .then(() => info);
        }
      })
      .then((info) => {
        if(info) {
          const {origin} = location;
          let series = Promise.resolve();

          const msg = {db: 'templates', ok: true, docs_read: 0, pending: info.doc_count, start_time: new Date().toISOString()}
          pouch.emit_async('repl_state', msg);

          const opt = {
            proxy: pouch.remote.templates.name,
            checkpoints: 'target',
            auth: pouch.remote.templates.__opts.auth
          };

          for(let i = 1; i <= info.files; i++) {
            series = series.then(() => {
              return db.load(`${origin}/templates/${i.pad(5)}.json`, opt);
            })
              .then((step) => {
                if(i % 2) {
                  msg.docs_read = (info.doc_count * i / info.files).round();
                  msg.pending = info.doc_count - msg.docs_read;
                  pouch.emit_async('repl_state', msg);
                }
              });
          }
          return series
            .then(() => {
              info._id = 'stamp';
              return db.put(info);
            })
            .then(() => info);
        }
      })
      .catch(() => null);
  }

  // освежает содержимое локальной базы templates
  function refresh_doc(start) {
    if(pouch.local.templates && pouch.remote.templates) {
      return from_files(start)
        .then((top) => {
          return pouch.local.templates.replicate.from(pouch.remote.templates,
            {
              batch_size: 300,
              batches_limit: 3,
            })
            .on('change', (info) => {
              info.db = 'templates';
              if(top) {
                info.docs_read = top.doc_count - info.pending;
              }
              pouch.emit_async('repl_state', info);
              if(!start && info.ok) {
                for(const {doc} of info.docs) {
                  if(doc.class_name === 'doc.nom_prices_setup') {
                    setTimeout(pricing.by_doc.bind(pricing, doc), 1000);
                  }
                }
              }
            })
            .then((info) => {
              // doc_write_failures: 0
              // docs_read: 8573
              // docs_written: 8573
              // end_time: '2018-06-28T20:15:25'
              // errors: []
              // last_seq: '8573'
              // ok: true
              // start_time: '2018-06-28T20:13:55'
              // status: 'complete'
              info.db = 'templates';
              pouch.emit_async('repl_state', info);
            })
            .catch((err) => {
              err.result.db = 'templates';
              pouch.emit_async('repl_state', err.result);
              $p.record_log(err);
            });
        });
    }
    else {
      return Promise.resolve();
    }
  }

  function patch_cachable() {
    const names = [
      "cat.parameters_keys",
      "cat.stores",
      "cat.delivery_directions",
      "cat.cash_flow_articles",
      "cat.nonstandard_attributes",
      "cat.projects",
      "cat.nom_prices_types",
      "doc.nom_prices_setup"
    ];
    for(const name of names) {
      const meta = md.get(name);
      if(meta.cachable.match(/_ram$/)) {
        meta.cachable = 'templates_ram';
      }
      else {
        meta.cachable = 'templates';
      }
    }
  }

  // обработчик события
  function on_log_in() {

    // для корневой базы ничего делать не надо
    if(!pouch.props._suffix || !job_prm.templates) {
      !pouch.local.templates && pouch.local.__define('templates', {
        get() {
          return pouch.remote.doc;
        },
        configurable: true,
        enumerable: false
      });
      return Promise.resolve();
    }
    else {
      patch_cachable();
    }

    const {__opts} = pouch.remote.ram;
    pouch.remote.templates = new classes.PouchDB(__opts.name.replace(/ram$/, 'templates'),
      {skip_setup: true, adapter: 'http', auth: __opts.auth});


    // переопределяем геттеры
    _mgr.get = template_get;

    // если автономный режим - подключаем refresher
    if(pouch.props.direct) {
      !pouch.local.templates && pouch.local.__define('templates', {
        get() {
          return pouch.remote.templates;
        },
        configurable: true,
        enumerable: false
      });
    }
    else {
      pouch.local.templates = new classes.PouchDB('templates', {adapter: 'idb', auto_compaction: true, revs_limit: 3});
      setInterval(refresh_doc, 600000);
      return refresh_doc(true)
        .then(() => {
          return pouch.rebuild_indexes('templates');
        });
    }

  }

  // обработчик события
  function user_log_out() {
    _mgr.get = proto_get;
    if(pouch.local.templates && !pouch.local.hasOwnProperty('templates')) {
      delete pouch.local.templates;
    }
  }

  pouch.on({on_log_in, user_log_out});

})($p);
