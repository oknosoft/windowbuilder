/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module materials_demand
 * Created 07.11.2016
 */

import React from 'react';

export default function ($p) {

  const {characteristics, nom, nom_kinds, clrs} = $p.cat

  // свойства объекта отчета _Потребность по материалам_
  Object.defineProperties($p.RepMaterials_demand.prototype, {

    formatters: {
      value: {
        characteristic: v => {
          v = characteristics.get(v.value)
          return (<div>{v instanceof Promise ? 'loading...' : v.presentation}</div>)
        }
      }
    },

    columns_avalable: {
      get: function () {

        if(!this._columns_avalable){

          this._columns_avalable = []

          let _meta = this._metadata('specification')
          for (let fld in _meta.fields) {
            let _fld = _meta.fields[fld],
              column = {
                key: fld,
                name: _fld.synonym,
                resizable: true,
                draggable: true
              }

            if (_fld.type.is_ref) {
              column.formatter = v => {
                return <div>{v.value.presentation}</div>
              }
            }

            this._columns_avalable.push(column)

          }

        }

        return this._columns_avalable;
      }
    },

    column_flds: {
      get: function () {

        if(!this._columns){
          this._columns = {
            name: 'specification',
            flds: []
          }
          $p.wsql.restore_options(this._manager.class_name, this._columns)
        }

        if(!this._columns.flds.length){
          this._columns.flds = this.columns_avalable.map(column => column.key)
          $p.wsql.save_options(this._manager.class_name, this._columns)
        }

        return this._columns.flds;
      }
    },

    columns: {
      get: function () {

        let columns = this.columns_avalable;

        return this.column_flds.map(fld => {
          let column;
          columns.some(function (clmn) {
            if(clmn.key == fld){
              column = clmn;
            }
          })
          return column;
        })
      }
    },

    calculate: {
      value: function () {

        const production = this.production,
          specification = this.specification,
          arefs = [], aobjs = [],
          spec_flds = Object.keys(characteristics.metadata('specification').fields),
          rspec_flds = Object.keys(this._metadata('specification').fields);

        function material(row) {

          let res = row.nom.presentation;

          if(!row.characteristic.empty()){
            res += ' ' + row.characteristic.presentation;
          }

          if(row.len && row.width)
            res += ' ' + 1000*row.len.toFixed(0) + "x" + 1000*row.width.toFixed(0);
          else if(row.len)
            res += ' ' + 1000*row.len.toFixed(0);
          else if(row.width)
            res += ' ' + 1000*row.width.toFixed(0);

          return res;
        }

        // получаем массив объектов продукций
        production.each(function (row) {
          if(!row.characteristic.empty() && row.characteristic.is_new() && arefs.indexOf(row.characteristic.ref) == -1){
            arefs.push(row.characteristic.ref)
            aobjs.push(row.characteristic.load())
          }
        })

        // чистим таблицу результата
        specification.clear();

        return Promise.all(aobjs)

        // получаем массив объектов заказов и вложенных характеристик
          .then(function (ares) {

            arefs.length = 0;
            aobjs.length = 0;

            production.each(function (row) {

              if (!row.characteristic.empty() && !row.characteristic.calc_order.empty()
                  && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
                arefs.push(row.characteristic.calc_order.ref)
                aobjs.push(row.characteristic.calc_order.load())
              }

              row.characteristic.specification.each(function (sprow) {
                if (!sprow.characteristic.empty() && sprow.characteristic.is_new() && arefs.indexOf(sprow.characteristic.ref) == -1) {
                  arefs.push(sprow.characteristic.ref)
                  aobjs.push(sprow.characteristic.load())
                }
              })

            });

            return Promise.all(aobjs)

          })

          .then(function () {

            const prows = {};

            // бежим по продукции и заполняем результат
            production.each(function (row) {
              if(!row.characteristic.empty()){
                row.characteristic.specification.each(function (sprow) {
                  let resrow = {};
                  spec_flds.forEach( fld => {
                    if(rspec_flds.indexOf(fld) != -1){
                      resrow[fld] = sprow[fld]
                    }
                  });
                  resrow = specification.add(resrow)

                  // учтём количество
                  resrow.qty = resrow.qty * row.qty;
                  resrow.totqty = resrow.totqty * row.qty;
                  resrow.totqty1 = resrow.totqty1 * row.qty;
                  resrow.amount = resrow.amount * row.qty;
                  resrow.amount_marged = resrow.amount_marged * row.qty;

                  // рассчитаем недостающие поля
                  if(resrow.elm > 0){
                    resrow.cnstr = row.characteristic.coordinates.find_rows({elm: resrow.elm})[0].cnstr;
                  }else if(resrow.elm < 0){
                    resrow.cnstr = -resrow.elm;
                  }

                  // ссылка на заказ
                  resrow.calc_order = row.characteristic;

                  // номер строки изделия в исходном заказе
                  if(!prows[row.characteristic.ref]){
                    prows[row.characteristic.ref] = row.characteristic.calc_order.production.find_rows({characteristic: row.characteristic});
                    if(prows[row.characteristic.ref].length){
                      prows[row.characteristic.ref] = prows[row.characteristic.ref][0].row
                    }else{
                      prows[row.characteristic.ref] = 1
                    }
                  }
                  resrow.product = prows[row.characteristic.ref];

                  // свойства номенклатуры и группировки
                  resrow.nom_kind = resrow.nom.nom_kind;
                  resrow.material = material(resrow);
                  //resrow.grouping = resrow.nom.grouping;

                })
              }
            })

            // сворачиваем результат и сохраняем его в specification._rows

          })
      }
    }
  })

}


