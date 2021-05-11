/**
 *
 *
 * @module doc_calc_order
 *
 * Created by Evgeniy Malyarov on 07.03.2019.
 */

import RepParams from 'wb-forms/dist/CalcOrder/FrmList/Params';

export default function ({doc, dp, utils, DocCalc_order}) {
  const {calc_order: _mgr} = doc;

  // если хотим по умолчанию читать из 'couchdb'...
  Object.defineProperties(_mgr, {

    source_mode: {
      get() {
        const {current_user} = $p;
        if(current_user && !current_user.branch.empty()) {
          return 'ram';
        }
        return 'pg';
      }
    },

    RepParams: {
      value: RepParams,
    },

    by_number_doc: {
      value(filter) {
        const date_till = new Date();
        const {doc} = _mgr.adapter.local;
        return doc.query('doc/number_doc', {
          include_docs: true,
          key: [_mgr.class_name, date_till.getFullYear(), filter]
        })
          .then(({rows}) => {
            return rows.length ? {rows} : doc.query('doc/number_doc', {
              include_docs: true,
              key: [_mgr.class_name, date_till.getFullYear() - 1, filter]
            });
          })
          .then(({rows}) => ({
            docs: rows.map(({doc}) => {
              doc.ref = doc._id.split('|')[1];
              delete doc._id;
              delete doc.class_name;
              return doc;
            }),
            count: rows.length,
            flag: false,
            scroll: 0
          }));
      }
    },

    find_rows_custom: {
      value(selector, scheme) {
        scheme.append_selection(selector);
        delete selector.ref;
        const $and = [];
        const fields = {};
        for(const elm of selector.selector.$and) {
          const fld = Object.keys(elm)[0];
          const cond = elm[fld];
          if(fld === 'class_name') {
            continue;
          }
          if(fld === 'department') {
            for(const ct in cond) {
              fields[fld] = {department: cond[ct].split(',')[0]};
              $and.push(fields[fld]);
            }
            continue;
          }
          if(fld === 'obj_delivery_state') {
            for(const ct in cond) {
              const cv = cond[ct];
              //draft,sent,confirmed,declined,service,complaints,template,zarchive
              //Черновик,Отозван,Отправлен,Подтвержден,Отклонен,Шаблон,Архив
              if(cv.includes('Черновик')) {
                fields.state = {state: 'draft'};
              }
              else if(cv.includes('Отправлен')) {
                fields.state = {state: 'sent'};
              }
              else if(cv.includes('Подтвержден')) {
                fields.state = {state: 'confirmed'};
              }
              else if(cv.includes('Отклонен')) {
                fields.state = {state: 'declined'};
              }
              else if(cv.includes('Шаблон')) {
                fields.state = {state: 'template'};
              }
              else if(cv.includes('Архив')) {
                fields.state = {state: 'zarchive'};
              }
            }
            $and.push(fields.state);
            continue;
          }
          $and.push(elm);
        }
        if(!fields.department) {
          const tmp = dp.builder_price.create();
          DocCalc_order.set_department.call(tmp);
          fields.department = {department: tmp.department.valueOf()};
          $and.push(fields.department);
        }
        if(!fields.state) {
          fields.state = {state: 'draft'};
          $and.push(fields.state);
        }
        if(fields.state.state === 'template') {
          fields.department.department = utils.blank.guid;
          $and.some((elm) => {
            if(elm.date && elm.date.$gte) {
              elm.date.$gte = "2017-01-01";
              return true;
            }
          });
        }
        if(selector.sort.length) {
          const dir = Object.values(selector.sort[0]).includes('desc') ? 'desc' : 'asc';
          selector.sort = ['department', 'state', 'date'].map((v) => ({[v]: dir}));
        }

        // если строка поиска похожа на номер документа, формируем ответ альтернативным способом
        const search = $and.find((v) => v.search);
        if(search) {
          const {$regex} = search.search;
          if($regex && $regex.length === 11 && $regex.replace(/\D/g, '').length > 5) {
            return _mgr.by_number_doc($regex);
          }
        }

        selector.selector.$and = $and;
        selector.use_index = ["mango_calc_order", "list"];
        return _mgr.find_rows_remote(selector);
      }
    }
  });

}
