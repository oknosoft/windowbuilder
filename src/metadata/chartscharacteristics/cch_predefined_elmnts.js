/**
 * ### Дополнительные методы ПВХ Предопределенные элементы
 * Предопределенные элементы - аналог констант для хранения ссылочных и списочных настроек приложения
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cch_predefined_elmnts
 */

export default function ($p) {

  const {job_prm, adapters, cch, doc} = $p;
  const _mgr = cch.predefined_elmnts;

  // Подписываемся на событие окончания загрузки локальных данных
  adapters.pouch.once('pouch_doc_ram_loaded', () => {

    // читаем элементы из pouchdb и создаём свойства
    _mgr.adapter.find_rows(_mgr, {_raw: true, _top: 500, _skip: 0})
      .then((rows) => {

        const parents = {};

        rows.forEach((row) => {
          if(row.is_folder && row.synonym) {
            const ref = row._id.split('|')[1];
            parents[ref] = row.synonym;
            !job_prm[row.synonym] && job_prm.__define(row.synonym, {value: {}});
          }

        });

        rows.forEach((row) => {

          if(!row.is_folder && row.synonym && parents[row.parent] && !job_prm[parents[row.parent]][row.synonym]) {

            let _mgr;

            if(row.type.is_ref) {
              const tnames = row.type.types[0].split('.');
              _mgr = $p[tnames[0]][tnames[1]];
            }

            if(row.list == -1) {

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: (() => {
                  const res = {};
                  row.elmnts.forEach((row) => {
                    res[row.elm] = _mgr ? _mgr.get(row.value, false, false) : row.value;
                  });
                  return res;
                })()
              });

            }
            else if(row.list) {

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: row.elmnts.map((row) => {
                  if(_mgr) {
                    const value = _mgr.get(row.value, false, false);
                    if(!$p.utils.is_empty_guid(row.elm)) {
                      value._formula = row.elm;
                    }
                    return value;
                  }
                  else {
                    return row.value;
                  }
                })
              });
            }
            else {

              if(job_prm[parents[row.parent]].hasOwnProperty(row.synonym)) {
                delete job_prm[parents[row.parent]][row.synonym];
              }

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: _mgr ? _mgr.get(row.value, false, false) : row.value,
                configurable: true
              });
            }

          }
        });
      })
      .then(() => {

        // дополним автовычисляемыми свойствами
        let prm = job_prm.properties.width;
        const {calculated} = job_prm.properties;
        if(prm && calculated.indexOf(prm) == -1) {
          calculated.push(prm);
          prm._calculated_value = {execute: (obj) => obj && obj.calc_order_row && obj.calc_order_row.width || 0};
        }
        prm = job_prm.properties.length;
        if(prm && calculated.indexOf(prm) == -1) {
          calculated.push(prm);
          prm._calculated_value = {execute: (obj) => obj && obj.calc_order_row && obj.calc_order_row.len || 0};
        }

        // рассчеты, помеченные, как шаблоны, загрузим в память заранее
        doc.calc_order.load_templates && setTimeout(doc.calc_order.load_templates.bind(doc.calc_order), 1000);

        // даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
        setTimeout(() => $p.md.emit('predefined_elmnts_inited'), 100);

      });

  });


  /**
   * Переопределяем геттер значения
   *
   * @property value
   * @override
   * @type {*}
   */
  delete $p.CchPredefined_elmnts.prototype.value;
  $p.CchPredefined_elmnts.prototype.__define({

    value: {
      get: function () {

        const mf = this.type;
        const res = this._obj ? this._obj.value : '';

        if(this._obj.is_folder) {
          return '';
        }
        if(typeof res == 'object') {
          return res;
        }
        else if(mf.is_ref) {
          if(mf.digits && typeof res === 'number') {
            return res;
          }
          if(mf.hasOwnProperty('str_len') && !$p.utils.is_guid(res)) {
            return res;
          }
          const mgr = $p.md.value_mgr(this._obj, 'value', mf);
          if(mgr) {
            if($p.utils.is_data_mgr(mgr)) {
              return mgr.get(res, false);
            }
            else {
              return $p.utils.fetch_type(res, mgr);
            }
          }
          if(res) {
            $p.record_log(['value', mf, this._obj]);
            return null;
          }
        }
        else if(mf.date_part) {
          return $p.utils.fix_date(this._obj.value, true);
        }
        else if(mf.digits) {
          return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty('str_len'));
        }
        else if(mf.types[0] == 'boolean') {
          return $p.utils.fix_boolean(this._obj.value);
        }
        else {
          return this._obj.value || '';
        }

        return this.characteristic.clr;
      },

      set: function (v) {

        if(this._obj.value === v) {
          return;
        }

        _mgr.emit_async('update', this, {value: this._obj.value});
        this._obj.value = v.valueOf();
        this._data._modified = true;
      }
    }
  });

}
